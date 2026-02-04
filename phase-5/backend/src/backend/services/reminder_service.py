"""
Reminder Service for background task scheduling.
Processes due reminders using asyncio background task.
"""
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Optional, Callable

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from backend.models.task import Task
from backend.services.notification_service import NotificationService


class ReminderService:
    """Service for scheduling and processing task reminders."""

    def __init__(
        self,
        session_factory: Callable[[], AsyncSession],
        notification_service: NotificationService
    ):
        self.session_factory = session_factory
        self.notification_service = notification_service
        self._task: Optional[asyncio.Task] = None
        self._stop_event = asyncio.Event()
        self._running = False

    async def process_due_reminders(self) -> int:
        """
        Process all reminders that are due but not yet sent.

        Returns:
            Number of reminders processed

        This method queries for tasks where:
        - reminder_at <= NOW() (reminder time has passed)
        - reminder_sent = False (not yet sent)
        """
        async with self.session_factory() as session:
            # Find tasks with due reminders that haven't been sent
            # DB stores TIMESTAMP WITHOUT TIME ZONE but asyncpg returns with timezone
            # Use naive UTC for the query parameter to match DB column type
            now = datetime.utcnow()  # Naive UTC
            cutoff = now - timedelta(minutes=1)  # Look back 1 minute to catch missed reminders
            print(f"🔔 [DEBUG] Checking reminders at: {now}, cutoff: {cutoff}")

            # Debug: Show all tasks with reminders to understand what's stored
            debug_query = select(Task).where(
                and_(
                    Task.reminder_at != None,
                    Task.reminder_sent == False
                )
            ).order_by(Task.reminder_at).limit(5)
            debug_result = await session.execute(debug_query)
            debug_tasks = debug_result.scalars().all()
            for t in debug_tasks:
                # Compare as naive - strip timezone if present for comparison
                task_reminder = t.reminder_at.replace(tzinfo=None) if t.reminder_at and t.reminder_at.tzinfo else t.reminder_at
                should_trigger = task_reminder <= cutoff if task_reminder else False
                print(f"🔔 [DEBUG] Task '{t.title[:20]}' reminder_at={t.reminder_at} should_trigger={should_trigger}")

            query = select(Task).where(
                and_(
                    Task.reminder_at <= cutoff,
                    Task.reminder_sent == False
                )
            )
            result = await session.execute(query)
            tasks = result.scalars().all()
            print(f"🔔 [DEBUG] Found {len(tasks)} tasks with due reminders (cutoff={cutoff})")

            processed_count = 0

            for task in tasks:
                try:
                    # Create notification
                    await self.notification_service.create(
                        user_id=task.user_id,
                        message=f"Reminder: {task.title} is due!",
                        task_id=task.id
                    )
                    # Mark as sent
                    task.reminder_sent = True
                    await session.commit()
                    processed_count += 1
                    print(f"🔔 Reminder sent for task: {task.title}")
                except Exception as e:
                    print(f"Failed to process reminder for task {task.id}: {e}")
                    await session.rollback()

            # Debug logging
            if processed_count == 0:
                # Log that we checked but found none
                async with self.session_factory() as debug_session:
                    from sqlalchemy import func, cast, Date
                    # Count tasks with reminders
                    reminder_query = select(func.count()).select_from(Task).where(
                        Task.reminder_at != None
                    )
                    count_result = await debug_session.execute(reminder_query)
                    total_with_reminders = count_result.scalar()
                    print(f"🔔 Checked for reminders - found {total_with_reminders} tasks with reminders set")

            return processed_count

    async def _scheduler_loop(self):
        """Background task that runs every 60 seconds."""
        print("🔔 Reminder scheduler loop started")
        # First run: process any missed reminders immediately
        try:
            await self.process_due_reminders()
        except Exception as e:
            print(f"⚠️ Reminder scheduler initial run error: {e}")
            import traceback
            traceback.print_exc()

        while not self._stop_event.is_set():
            try:
                print("🔔 [DEBUG] Scheduler loop waiting 60 seconds...")
                await asyncio.sleep(60)
                if not self._stop_event.is_set():
                    print("🔔 [DEBUG] Scheduler loop woke up, processing reminders...")
                    count = await self.process_due_reminders()
                    if count > 0:
                        print(f"🔔 Processed {count} due reminder(s)")
            except Exception as e:
                print(f"⚠️ Reminder scheduler error: {e}")
                import traceback
                traceback.print_exc()
                await asyncio.sleep(60)

        print("🔔 Reminder scheduler loop stopped")

    async def start(self):
        """Start the reminder scheduler."""
        if self._task is None or self._task.done():
            self._stop_event.clear()
            self._running = True
            self._task = asyncio.create_task(self._scheduler_loop())
            print("✅ Reminder scheduler started")

    async def stop(self):
        """Stop the reminder scheduler."""
        if self._running:
            self._stop_event.set()
            if self._task:
                try:
                    await asyncio.wait_for(self._task, timeout=5.0)
                except asyncio.TimeoutError:
                    print("⚠️ Reminder scheduler did not stop gracefully")
                except Exception as e:
                    print(f"⚠️ Error stopping reminder scheduler: {e}")
            self._running = False
            print("✅ Reminder scheduler stopped")

    @property
    def is_running(self) -> bool:
        """Check if the scheduler is running."""
        return self._running and self._task is not None and not self._task.done()

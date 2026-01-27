"""
Profile routes for user information and task statistics.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from backend.database import get_session
from backend.middleware.auth import get_current_user, verify_user_ownership
from backend.models.task import Task
from backend.models.task import UserProfileResponse

router = APIRouter()


@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(
    user_id: str,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Get user profile information and task statistics.

    Requires authentication and verifies user ownership.
    """
    # Verify user ownership
    await verify_user_ownership(user_id, current_user)

    # Get user info (simplified - in production, query Better Auth user table)
    user_info = {
        "id": user_id,
        "email": "user@example.com",  # Would come from Better Auth
        "name": "User Name"           # Would come from Better Auth
    }

    # Get task statistics
    count_query = select(
        func.count(),
        func.count(Task.id).filter(Task.completed == True),
        func.count(Task.id).filter(Task.completed == False)
    ).where(Task.user_id == user_id)

    result = await session.execute(count_query)
    total, completed, pending = result.first()

    return UserProfileResponse(
        user=user_info,
        stats={
            "total_tasks": total or 0,
            "completed_tasks": completed or 0,
            "pending_tasks": pending or 0
        }
    )
"""
ChatKit Server implementation that wraps existing OpenAI Agents SDK.

This integrates the existing dual-agent system (Orchestrator + UrduSpecialist)
with MCP tools into the ChatKit interface.
"""
import os
import uuid
from datetime import datetime, timezone
from typing import Optional, AsyncGenerator, List

from chatkit.server import ChatKitServer
from chatkit.types import ThreadMetadata, ThreadItem, AssistantMessageItem, ThreadItemAddedEvent, ThreadItemDoneEvent
from chatkit.agents import ThreadItemConverter
from agents import Agent, Runner, RunConfig
from agents.mcp import MCPServerStdio

from backend.chatkit_store import PostgresChatKitStore
from backend.agents import orchestrator as base_orchestrator, urdu_agent as base_urdu_agent, model, client


class TodoChatKitServer(ChatKitServer):
    """ChatKit Server implementation for task management application."""

    def __init__(self, store: PostgresChatKitStore):
        """Initialize ChatKit server with store and Xiaomi mimo-v2-flash client."""
        super().__init__(store)
        self.store = store
        self.model = model  # mimo-v2-flash model from agents.py
        self.client = client  # Xiaomi API client from agents.py
        self.converter = ThreadItemConverter()

    async def respond(
        self, thread: dict, input: Optional[ThreadItem], context: Optional[dict] = None
    ) -> AsyncGenerator[ThreadItem, None]:
        """
        Generate response for user input using existing OpenAI Agents SDK.

        This method integrates the existing dual-agent system with MCP tools
        into the ChatKit interface.
        """
        if context is None:
            raise ValueError("Context required for user isolation and metadata")

        # Extract user context for data isolation and personalization
        metadata = context.get('metadata', {})
        user_info = metadata.get('userInfo', {})
        user_id = user_info.get('id')

        if not user_id:
            raise ValueError("User ID required for data isolation")

        # Load conversation history for context
        page = await self.store.load_thread_items(
            thread_id=thread.id,
            after=None,
            limit=100,
            order="asc",
            context=context
        )
        all_items = list(page.data)

        # Add current input to history for context
        if input:
            all_items.append(input)

        # Convert to agent input format
        try:
            agent_input = await self.converter.to_agent_input(all_items) if all_items else []
        except Exception as e:
            # Fallback to simple string conversion
            agent_input = []
            if input and hasattr(input, 'content'):
                agent_input = [{"type": "text", "text": input.content[0].get('text', '')}]

        # Enhance input with user context for personalization
        enhanced_input = self._enhance_input_with_context(agent_input, user_info, metadata)

        # Create agent instances (same as existing main.py)
        urdu_agent = Agent(
            name=base_urdu_agent.name,
            instructions=base_urdu_agent.instructions,
            model=self.model  # Using mimo-v2-flash
        )

        orchestrator = Agent(
            name=base_orchestrator.name,
            instructions=base_orchestrator.instructions,
            handoffs=[urdu_agent],
            model=self.model  # Using mimo-v2-flash
        )

        # Configure MCP server (same as existing implementation)
        config = RunConfig(
            model=self.model,
            model_provider=self.client,
        )

        server = MCPServerStdio(
            params={
                "command": "uv",
                "args": ["run", "task_serves_mcp_tools.py"],
                "env": os.environ.copy()  # Pass environment variables to subprocess
            },
            client_session_timeout_seconds=60
        )

        orchestrator.mcp_servers = [server]
        urdu_agent.mcp_servers = [server]

        try:
            print("ChatKit DEBUG: Connecting to MCP server...")
            await server.connect()
            print("ChatKit DEBUG: Connected. Running agent...")

            try:
                # Run the agent
                result = await Runner.run(
                    orchestrator,
                    enhanced_input,
                    run_config=config
                )
                print(f"ChatKit DEBUG: Agent run complete. Result type: {type(result)}")
            except Exception as e:
                print(f"ChatKit ERROR: Agent run failed: {e}")
                import traceback
                traceback.print_exc()
                raise e

            # Extract response and tool calls
            print("ChatKit DEBUG: Extracting response...")
            response_text = result.final_output
            print(f"ChatKit DEBUG: response_text: {str(response_text)[:100]}")
            agent_name = result.last_agent.name if result.last_agent else "Unknown"

            # Extract tool calls for visualization
            tool_calls = []
            for call in getattr(result, 'used_tools', []):
                tool_calls.append({
                    "tool_name": call.name,
                    "arguments": getattr(call, 'arguments', {}),
                    "result": getattr(call, 'result', {}),
                })

            # Create assistant message item
            assistant_item = AssistantMessageItem(
                id=f"item_assistant_message_{uuid.uuid4()}",
                thread_id=thread.id,
                created_at=datetime.now(timezone.utc).replace(tzinfo=None),
                content=[{"type": "output_text", "text": response_text}],
                metadata={
                    "agent_name": agent_name,
                    "response_time_ms": getattr(result, 'duration_ms', 0),
                    "model": "mimo-v2-flash",
                    "tool_calls": tool_calls if tool_calls else None,
                }
            )

            # Yield the assistant message
            yield ThreadItemAddedEvent(
                type="thread.item.added",
                item=assistant_item
            )

            # Yield completion event
            yield ThreadItemDoneEvent(
                type="thread.item.done",
                item=assistant_item
            )

        finally:
            await server.cleanup()
            orchestrator.mcp_servers = []
            urdu_agent.mcp_servers = []

    def _enhance_input_with_context(self, agent_input: list, user_info: dict, metadata: dict) -> str:
        """Enhance input with user context for personalization."""
        if not agent_input:
            return ""

        # Extract text content from agent input
        text_content = ""
        print(f"ChatKit DEBUG: agent_input = {agent_input}")  # Debug
        
        for item in agent_input:
            # Handle different input formats
            if isinstance(item, dict):
                # Try different possible text fields
                if 'text' in item:
                    text_content += item.get('text', '') + " "
                elif 'content' in item:
                    # Handle nested content
                    content = item.get('content')
                    if isinstance(content, str):
                        text_content += content + " "
                    elif isinstance(content, list):
                        for c in content:
                            if isinstance(c, dict) and 'text' in c:
                                text_content += c.get('text', '') + " "
            elif isinstance(item, str):
                text_content += item + " "

        print(f"ChatKit DEBUG: Extracted text_content = '{text_content}'")  # Debug
        
        # Add user context prefix
        user_context = f"[User: {user_info.get('id', 'unknown')}"
        if user_info.get('name'):
            user_context += f" ({user_info.get('name')})"
        user_context += "]"

        # Add page context if available
        page_context = metadata.get('pageContext', {})
        if page_context:
            page_info = f"[Page: {page_context.get('url', 'unknown')}]"
            enhanced_input = f"{user_context} {page_info} {text_content}"
        else:
            enhanced_input = f"{user_context} {text_content}"

        result = enhanced_input.strip()
        print(f"ChatKit DEBUG: Final enhanced_input = '{result}'")  # Debug
        return result

    async def create_thread(self, metadata: Optional[ThreadMetadata] = None, context: Optional[dict] = None) -> dict:
        """Create a new thread with metadata."""
        if context is None:
            raise ValueError("Context required for user isolation")

        # Generate a new thread ID
        thread_id = self.store.generate_thread_id(context)

        # Create thread metadata - convert to timezone-naive for PostgreSQL
        created_at = datetime.now(timezone.utc).replace(tzinfo=None)
        thread_metadata = ThreadMetadata(
            id=thread_id,
            metadata=metadata or {},
            created_at=created_at
        )

        # Save the thread
        await self.store.save_thread(thread_metadata, context)

        return {
            "id": thread_metadata.id,
            "created_at": thread_metadata.created_at.isoformat(),
            "metadata": thread_metadata.metadata
        }

    async def get_thread(self, thread_id: str, context: Optional[dict] = None) -> Optional[dict]:
        """Get thread by ID."""
        if context is None:
            raise ValueError("Context required for user isolation")

        # Load thread from store
        thread_metadata = await self.store.load_thread(thread_id, context)

        if thread_metadata:
            return {
                "id": thread_metadata.id,
                "created_at": thread_metadata.created_at.isoformat(),
                "metadata": thread_metadata.metadata
            }

        return None

    async def list_threads(
        self,
        limit: int = 50,
        cursor: Optional[str] = None,
        context: Optional[dict] = None,
    ):
        """List threads for user."""
        if context is None:
            raise ValueError("Context required for user isolation")

        return await self.store.load_threads(limit, cursor, "desc", context)

    async def add_message(
        self, thread_id: str, message: ThreadItem, context: Optional[dict] = None
    ) -> dict:
        """Add a message to a thread."""
        if context is None:
            raise ValueError("Context required for user isolation")

        # Add the thread item to the store
        await self.store.add_thread_item(thread_id, message, context)

        # Return the message in the expected format
        return {
            "id": message.id,
            "thread_id": message.thread_id,
            "created_at": message.created_at.isoformat() if hasattr(message.created_at, 'isoformat') else str(message.created_at),
            "content": message.content,
            "metadata": getattr(message, 'metadata', {})
        }

    async def get_messages(
        self,
        thread_id: str,
        limit: int = 50,
        before_item_id: Optional[str] = None,
        context: Optional[dict] = None,
    ):
        """Get messages from a thread."""
        if context is None:
            raise ValueError("Context required for user isolation")

        return await self.store.load_thread_items(
            thread_id, before_item_id, limit, "asc", context
        )
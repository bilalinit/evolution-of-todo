"""
ChatKit models and schemas for thread persistence.
Defines SQLModel entities for ChatKit threads and thread items.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Field, SQLModel, JSON
from pydantic import BaseModel
from sqlalchemy import Column, Text, TypeDecorator
from sqlalchemy.dialects.postgresql import JSONB


class ThreadItemType(str, Enum):
    """Types of items that can be stored in a ChatKit thread."""
    USER_MESSAGE = "user_message"
    ASSISTANT_MESSAGE = "assistant_message"
    TOOL_CALL = "tool_call"
    TOOL_RESULT = "tool_result"
    SYSTEM_MESSAGE = "system_message"
    ERROR = "error"


# ==================== Database Models ====================

class ChatKitThread(SQLModel, table=True):
    """ChatKit thread entity - represents a conversation thread owned by a user."""

    id: str = Field(primary_key=True)  # ChatKit format: thread_<uuid>
    user_id: str = Field(index=True)  # User isolation - references Better Auth user.id
    thread_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSONB))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            UUID: lambda v: str(v),
        }

    def to_dict(self) -> dict:
        """Convert ChatKitThread model to dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "metadata": self.thread_metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ChatKitThreadItem(SQLModel, table=True):
    """ChatKit thread item entity - represents a single message, tool call, or event in a thread."""

    id: str = Field(primary_key=True)  # ChatKit format: item_<uuid>
    thread_id: str = Field(index=True)  # Foreign key to ChatKitThread
    type: ThreadItemType = Field(sa_column_kwargs={"nullable": False})
    content: Dict[str, Any] = Field(sa_column=Column(JSONB))  # Flexible content based on type
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
        }

    def to_dict(self) -> dict:
        """Convert ChatKitThreadItem model to dictionary."""
        return {
            "id": self.id,
            "thread_id": self.thread_id,
            "type": self.type.value,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ==================== Request Models ====================

class ChatKitThreadCreate(BaseModel):
    """Request model for creating a new ChatKit thread."""
    metadata: Optional[Dict[str, Any]] = None


class ChatKitThreadItemCreate(BaseModel):
    """Request model for creating a new ChatKit thread item."""
    thread_id: str
    type: ThreadItemType
    content: Dict[str, Any]


# ==================== Response Models ====================

class ChatKitThreadResponse(BaseModel):
    """Response model for ChatKit thread."""
    id: str
    user_id: str
    metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_thread(cls, thread: ChatKitThread) -> "ChatKitThreadResponse":
        """Convert ChatKitThread model to ChatKitThreadResponse."""
        return cls(
            id=thread.id,
            user_id=thread.user_id,
            metadata=thread.metadata,
            created_at=thread.created_at,
            updated_at=thread.updated_at,
        )


class ChatKitThreadItemResponse(BaseModel):
    """Response model for ChatKit thread item."""
    id: str
    thread_id: str
    type: ThreadItemType
    content: Dict[str, Any]
    created_at: datetime

    @classmethod
    def from_item(cls, item: ChatKitThreadItem) -> "ChatKitThreadItemResponse":
        """Convert ChatKitThreadItem model to ChatKitThreadItemResponse."""
        return cls(
            id=item.id,
            thread_id=item.thread_id,
            type=item.type,
            content=item.content,
            created_at=item.created_at,
        )


class ChatKitThreadDetailResponse(BaseModel):
    """Response model for thread with all items."""
    thread: ChatKitThreadResponse
    items: List[ChatKitThreadItemResponse]

    @classmethod
    def from_thread_and_items(cls, thread: ChatKitThread, items: List[ChatKitThreadItem]) -> "ChatKitThreadDetailResponse":
        """Convert thread and items to detail response."""
        return cls(
            thread=ChatKitThreadResponse.from_thread(thread),
            items=[ChatKitThreadItemResponse.from_item(item) for item in items],
        )


class ChatKitThreadListResponse(BaseModel):
    """Response model for thread list."""
    threads: List[ChatKitThreadResponse]
    total: int

    @classmethod
    def from_threads(cls, threads: List[ChatKitThread]) -> "ChatKitThreadListResponse":
        """Convert list of ChatKitThread models to ChatKitThreadListResponse."""
        return cls(
            threads=[ChatKitThreadResponse.from_thread(thread) for thread in threads],
            total=len(threads),
        )


# ==================== Session Models ====================

class SessionMetadata(BaseModel):
    """Metadata for ChatKit session."""
    user_id: str
    created_at: str
    refreshed: Optional[bool] = False
    refreshed_from: Optional[str] = None


class SessionCreateResponse(BaseModel):
    """Response model for session creation."""
    client_secret: str
    session_id: str
    user_id: str
    expires_at: Optional[str] = None
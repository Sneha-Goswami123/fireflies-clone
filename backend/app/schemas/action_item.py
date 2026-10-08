from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ActionItemCreate(BaseModel):
    title: str
    assignee: str | None = None


class ActionItemUpdate(BaseModel):
    title: str | None = None
    assignee: str | None = None
    completed: bool | None = None


class ActionItemResponse(BaseModel):
    id: int
    meeting_id: int
    title: str
    assignee: str | None
    completed: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
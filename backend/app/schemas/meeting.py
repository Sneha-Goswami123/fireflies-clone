from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ParticipantCreate(BaseModel):
    name: str
    email: str | None = None


class ParticipantResponse(ParticipantCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class MeetingCreate(BaseModel):
    title: str
    date: datetime
    duration: int = 0
    participants: list[ParticipantCreate] = []


class MeetingUpdate(BaseModel):
    title: str | None = None
    date: datetime | None = None
    duration: int | None = None


class MeetingResponse(BaseModel):
    id: int
    title: str
    date: datetime
    duration: int
    participants: list[ParticipantResponse] = []

    model_config = ConfigDict(from_attributes=True)
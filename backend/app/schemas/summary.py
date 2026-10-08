from pydantic import BaseModel, ConfigDict


class SummaryCreate(BaseModel):
    overview: str
    key_topics: str | None = None


class SummaryResponse(SummaryCreate):
    id: int
    meeting_id: int

    model_config = ConfigDict(from_attributes=True)
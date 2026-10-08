from pydantic import BaseModel, ConfigDict


class TranscriptSegmentCreate(BaseModel):
    speaker: str
    start_time: int
    end_time: int
    text: str


class TranscriptSegmentResponse(TranscriptSegmentCreate):
    id: int
    meeting_id: int

    model_config = ConfigDict(from_attributes=True)
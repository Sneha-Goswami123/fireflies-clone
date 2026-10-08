from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meeting import Meeting
from app.models.transcript import TranscriptSegment
from app.schemas.transcript import (
    TranscriptSegmentCreate,
    TranscriptSegmentResponse,
)


router = APIRouter(
    prefix="/api/meetings",
    tags=["Transcript"],
)


@router.get(
    "/{meeting_id}/transcript",
    response_model=list[TranscriptSegmentResponse],
)
def get_transcript(
    meeting_id: int,
    db: Session = Depends(get_db),
):
    meeting = (
        db.query(Meeting)
        .filter(Meeting.id == meeting_id)
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    return (
        db.query(TranscriptSegment)
        .filter(
            TranscriptSegment.meeting_id == meeting_id
        )
        .order_by(TranscriptSegment.start_time)
        .all()
    )


@router.post(
    "/{meeting_id}/transcript",
    response_model=TranscriptSegmentResponse,
    status_code=201,
)
def add_transcript_segment(
    meeting_id: int,
    segment_data: TranscriptSegmentCreate,
    db: Session = Depends(get_db),
):
    meeting = (
        db.query(Meeting)
        .filter(Meeting.id == meeting_id)
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    segment = TranscriptSegment(
        meeting_id=meeting_id,
        speaker=segment_data.speaker,
        start_time=segment_data.start_time,
        end_time=segment_data.end_time,
        text=segment_data.text,
    )

    db.add(segment)
    db.commit()
    db.refresh(segment)

    return segment


@router.put(
    "/transcript/{segment_id}",
    response_model=TranscriptSegmentResponse,
)
def update_transcript_segment(
    segment_id: int,
    segment_data: TranscriptSegmentCreate,
    db: Session = Depends(get_db),
):
    segment = (
        db.query(TranscriptSegment)
        .filter(TranscriptSegment.id == segment_id)
        .first()
    )

    if not segment:
        raise HTTPException(
            status_code=404,
            detail="Transcript segment not found",
        )

    segment.speaker = segment_data.speaker
    segment.start_time = segment_data.start_time
    segment.end_time = segment_data.end_time
    segment.text = segment_data.text

    db.commit()
    db.refresh(segment)

    return segment


@router.delete("/transcript/{segment_id}")
def delete_transcript_segment(
    segment_id: int,
    db: Session = Depends(get_db),
):
    segment = (
        db.query(TranscriptSegment)
        .filter(TranscriptSegment.id == segment_id)
        .first()
    )

    if not segment:
        raise HTTPException(
            status_code=404,
            detail="Transcript segment not found",
        )

    db.delete(segment)
    db.commit()

    return {
        "message": "Transcript segment deleted successfully"
    }
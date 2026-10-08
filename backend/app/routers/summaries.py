from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meeting import Meeting
from app.models.summary import MeetingSummary
from app.schemas.summary import SummaryCreate, SummaryResponse


router = APIRouter(
    prefix="/api/meetings",
    tags=["Summary"],
)


@router.get(
    "/{meeting_id}/summary",
    response_model=SummaryResponse,
)
def get_summary(
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

    summary = (
        db.query(MeetingSummary)
        .filter(MeetingSummary.meeting_id == meeting_id)
        .first()
    )

    if not summary:
        raise HTTPException(
            status_code=404,
            detail="Summary not found",
        )

    return summary


@router.post(
    "/{meeting_id}/summary",
    response_model=SummaryResponse,
    status_code=201,
)
def create_summary(
    meeting_id: int,
    summary_data: SummaryCreate,
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

    existing_summary = (
        db.query(MeetingSummary)
        .filter(MeetingSummary.meeting_id == meeting_id)
        .first()
    )

    if existing_summary:
        raise HTTPException(
            status_code=400,
            detail="Summary already exists for this meeting",
        )

    summary = MeetingSummary(
        meeting_id=meeting_id,
        overview=summary_data.overview,
        key_topics=summary_data.key_topics,
    )

    db.add(summary)
    db.commit()
    db.refresh(summary)

    return summary


@router.put(
    "/{meeting_id}/summary",
    response_model=SummaryResponse,
)
def update_summary(
    meeting_id: int,
    summary_data: SummaryCreate,
    db: Session = Depends(get_db),
):
    summary = (
        db.query(MeetingSummary)
        .filter(MeetingSummary.meeting_id == meeting_id)
        .first()
    )

    if not summary:
        raise HTTPException(
            status_code=404,
            detail="Summary not found",
        )

    summary.overview = summary_data.overview
    summary.key_topics = summary_data.key_topics

    db.commit()
    db.refresh(summary)

    return summary
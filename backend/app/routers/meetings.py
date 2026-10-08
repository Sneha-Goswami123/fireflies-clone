from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.schemas.meeting import (
    MeetingCreate,
    MeetingResponse,
    MeetingUpdate,
)


router = APIRouter(
    prefix="/api/meetings",
    tags=["Meetings"],
)


@router.get("", response_model=list[MeetingResponse])
def get_meetings(
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Meeting)
        .options(selectinload(Meeting.participants))
    )

    if search:
        search_pattern = f"%{search}%"

        query = query.filter(
            (Meeting.title.ilike(search_pattern))
            | (
                Meeting.participants.any(
                    Participant.name.ilike(search_pattern)
                )
            )
        )

    return query.order_by(Meeting.date.desc()).all()


@router.get(
    "/{meeting_id}",
    response_model=MeetingResponse,
)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
):
    meeting = (
        db.query(Meeting)
        .options(selectinload(Meeting.participants))
        .filter(Meeting.id == meeting_id)
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    return meeting


@router.post(
    "",
    response_model=MeetingResponse,
    status_code=201,
)
def create_meeting(
    meeting_data: MeetingCreate,
    db: Session = Depends(get_db),
):
    meeting = Meeting(
        title=meeting_data.title,
        date=meeting_data.date,
        duration=meeting_data.duration,
    )

    db.add(meeting)
    db.flush()

    for participant_data in meeting_data.participants:
        participant = Participant(
            meeting_id=meeting.id,
            name=participant_data.name,
            email=participant_data.email,
        )

        db.add(participant)

    db.commit()
    db.refresh(meeting)

    return meeting


@router.put(
    "/{meeting_id}",
    response_model=MeetingResponse,
)
def update_meeting(
    meeting_id: int,
    meeting_data: MeetingUpdate,
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

    update_data = meeting_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(meeting, key, value)

    db.commit()
    db.refresh(meeting)

    return meeting


@router.delete("/{meeting_id}")
def delete_meeting(
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

    db.delete(meeting)
    db.commit()

    return {
        "message": "Meeting deleted successfully"
    }
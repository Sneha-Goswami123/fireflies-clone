from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.action_item import ActionItem
from app.models.meeting import Meeting
from app.schemas.action_item import (
    ActionItemCreate,
    ActionItemResponse,
    ActionItemUpdate,
)


router = APIRouter(
    prefix="/api/meetings",
    tags=["Action Items"],
)


@router.get(
    "/{meeting_id}/actions",
    response_model=list[ActionItemResponse],
)
def get_action_items(
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
        db.query(ActionItem)
        .filter(ActionItem.meeting_id == meeting_id)
        .order_by(ActionItem.created_at)
        .all()
    )


@router.post(
    "/{meeting_id}/actions",
    response_model=ActionItemResponse,
    status_code=201,
)
def create_action_item(
    meeting_id: int,
    action_data: ActionItemCreate,
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

    action_item = ActionItem(
        meeting_id=meeting_id,
        title=action_data.title,
        assignee=action_data.assignee,
        completed=False,
    )

    db.add(action_item)
    db.commit()
    db.refresh(action_item)

    return action_item


@router.put(
    "/actions/{action_id}",
    response_model=ActionItemResponse,
)
def update_action_item(
    action_id: int,
    action_data: ActionItemUpdate,
    db: Session = Depends(get_db),
):
    action_item = (
        db.query(ActionItem)
        .filter(ActionItem.id == action_id)
        .first()
    )

    if not action_item:
        raise HTTPException(
            status_code=404,
            detail="Action item not found",
        )

    update_data = action_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(action_item, key, value)

    db.commit()
    db.refresh(action_item)

    return action_item


@router.delete("/actions/{action_id}")
def delete_action_item(
    action_id: int,
    db: Session = Depends(get_db),
):
    action_item = (
        db.query(ActionItem)
        .filter(ActionItem.id == action_id)
        .first()
    )

    if not action_item:
        raise HTTPException(
            status_code=404,
            detail="Action item not found",
        )

    db.delete(action_item)
    db.commit()

    return {
        "message": "Action item deleted successfully"
    }
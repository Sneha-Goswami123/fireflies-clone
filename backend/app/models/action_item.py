from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False
    )

    title = Column(String(300), nullable=False)
    assignee = Column(String(100), nullable=True)

    completed = Column(Boolean, default=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    meeting = relationship(
        "Meeting",
        back_populates="action_items"
    )
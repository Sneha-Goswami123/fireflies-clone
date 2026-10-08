from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    date = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    participants = relationship(
        "Participant",
        back_populates="meeting",
        cascade="all, delete-orphan"
    )

    transcript_segments = relationship(
        "TranscriptSegment",
        back_populates="meeting",
        cascade="all, delete-orphan"
    )

    summary = relationship(
        "MeetingSummary",
        back_populates="meeting",
        uselist=False,
        cascade="all, delete-orphan"
    )

    action_items = relationship(
        "ActionItem",
        back_populates="meeting",
        cascade="all, delete-orphan"
    )
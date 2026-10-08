from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.database import Base


class MeetingSummary(Base):
    __tablename__ = "meeting_summaries"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    overview = Column(Text, nullable=False)
    key_topics = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    meeting = relationship(
        "Meeting",
        back_populates="summary"
    )
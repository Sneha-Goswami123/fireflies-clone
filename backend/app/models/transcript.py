from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False
    )

    speaker = Column(String(100), nullable=False)

    start_time = Column(Integer, nullable=False)
    end_time = Column(Integer, nullable=False)

    text = Column(Text, nullable=False)

    meeting = relationship(
        "Meeting",
        back_populates="transcript_segments"
    )
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False
    )
    name = Column(String(100), nullable=False)
    email = Column(String(200), nullable=True)

    meeting = relationship(
        "Meeting",
        back_populates="participants"
    )
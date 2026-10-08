from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import (
    Meeting,
    Participant,
    TranscriptSegment,
    ActionItem,
    MeetingSummary,
)
from app.routers import meetings, transcripts, summaries, action_items


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Fireflies Clone API",
    description="Backend API for the Fireflies meeting platform",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(meetings.router)
app.include_router(transcripts.router)
app.include_router(summaries.router)
app.include_router(action_items.router)

@app.get("/")
def root():
    return {
        "message": "Fireflies Clone API is running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok"
    }
# Meeting Notes & Transcription Platform

A full-stack meeting notes and transcription platform inspired by tools like Fireflies.ai.

The application allows users to manage meetings, view synchronized transcripts, search transcript content, listen to meeting recordings, manage action items, and view AI-generated meeting summaries.

---

## 🚀 Live Demo

> Add your deployed application URL here after deployment.

**Frontend:** `Coming soon`

**Backend API:** `Coming soon`

**API Documentation:** `Coming soon`

---

## 📌 Overview

The Meeting Notes & Transcription Platform is a full-stack web application designed to centralize meeting recordings, transcripts, summaries, and action items in one place.

The application provides:

- Meeting dashboard
- Meeting search, filtering, and sorting
- Meeting creation, editing, and deletion
- Meeting detail pages
- Audio playback with seek controls
- Transcript display with timestamps
- Transcript search and highlighting
- Transcript/audio synchronization
- Transcript CRUD operations
- AI-generated meeting summaries
- Key topic extraction/display
- Action item management
- Action item assignment and completion tracking
- Responsive Fireflies-inspired interface
- REST API backend
- SQLite persistence

Real-time speech-to-text transcription is outside the scope of this project. The application uses seeded/mock transcript data and uploaded meeting audio.

---

# ✨ Features

## 1. Meeting Dashboard

The dashboard provides an overview of all available meetings.

### Supported functionality

- View all meetings
- Search meetings
- Filter meetings
- Sort meetings
- Create meetings
- Edit meetings
- Delete meetings
- Loading states
- Error states
- Empty states

### Filters

Meetings can be filtered by:

- All meetings
- Recent meetings
- Long meetings
- Short meetings

### Sorting

Meetings can be sorted by:

- Newest
- Oldest
- Longest
- Shortest

---

## 2. Meeting Management

Users can create and manage meetings directly from the dashboard.

Each meeting contains:

- Title
- Date
- Duration
- Participants
- Participant email addresses

Meeting operations are persisted through the FastAPI backend and SQLite database.

---

## 3. Meeting Details

Each meeting has a dedicated detail page.

The detail page contains:

- Meeting metadata
- Audio player
- Transcript
- Transcript search
- AI summary
- Key topics
- Action items

---

## 4. Audio Player

The meeting detail page includes an audio player.

Supported functionality:

- Play
- Pause
- Seek
- Current playback time
- Total duration
- Click transcript segment to seek audio

Meeting audio is currently served from the frontend's public assets.

---

## 5. Transcript

The platform displays timestamped transcript segments.

Each transcript segment contains:

- Speaker
- Start time
- End time
- Transcript text

Example:

```text
00:13  John

Today I'd like to discuss the product roadmap
and our Q4 priorities.
```

---

## 6. Transcript Search

Users can search through the transcript.

Search supports:

- Transcript text
- Speaker names
- Search result count
- Matching text highlighting

For example, searching for:

```text
API
```

will highlight matching occurrences in the transcript.

---

## 7. Transcript & Audio Synchronization

Transcript segments are connected to their timestamps.

When the audio reaches a transcript segment:

- The corresponding transcript segment becomes highlighted.

When a user clicks a transcript segment:

- The audio player seeks to that segment's start time.
- Audio playback begins.

This creates a meeting-review experience similar to modern transcription platforms.

---

## 8. Transcript CRUD

Transcript segments can be managed directly from the meeting page.

### Create

Add a new transcript segment with:

- Speaker
- Start time
- End time
- Text

### Update

Existing transcript segments can be edited.

### Delete

Transcript segments can be permanently removed after confirmation.

### Validation

The application validates:

- Speaker is required
- Transcript text is required
- Start time must be valid
- End time must be valid
- End time must be greater than start time

---

## 9. AI Meeting Summary

Each meeting can display an AI-generated meeting summary.

The summary contains:

- Meeting overview
- Key topics

Example:

```text
The team discussed the Q4 product roadmap,
onboarding improvements, engineering progress,
and preparation for the upcoming customer demo.
```

Key topics are displayed as individual tags.

> The current implementation uses seeded summary data. A production version can connect this functionality to an LLM provider.

---

## 10. Action Items

Action items extracted from a meeting can be managed from the meeting detail page.

Each action item supports:

- Title
- Assignee
- Completion status

Users can:

- Add action items
- Edit action items
- Delete action items
- Mark items as completed
- Mark items as incomplete

Completed items are visually shown with a checkbox and strikethrough styling.

---

# 🛠️ Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React

## Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic

## Database

- SQLite

## Audio

- HTML5 Audio API

## Development

- REST APIs
- Swagger / OpenAPI
- Git / GitHub

---

# 🏗️ Architecture

The application follows a client-server architecture.

```text
                    ┌─────────────────────┐
                    │      Browser        │
                    │                     │
                    │   Next.js Frontend  │
                    │   React + TypeScript│
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │      Backend        │
                    │                     │
                    │    API Routers      │
                    │    Business Logic   │
                    │    SQLAlchemy ORM   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       SQLite        │
                    │                     │
                    │ Meetings            │
                    │ Participants        │
                    │ Transcripts         │
                    │ Summaries           │
                    │ Action Items        │
                    └─────────────────────┘
```

---

# 📂 Project Structure

```text
meeting-notes-platform/
│
├── backend/
│   │
│   ├── app/
│   │   ├── models/
│   │   │   ├── meeting.py
│   │   │   ├── participant.py
│   │   │   ├── transcript.py
│   │   │   ├── summary.py
│   │   │   └── action_item.py
│   │   │
│   │   ├── routers/
│   │   │   ├── meetings.py
│   │   │   ├── transcript.py
│   │   │   ├── summary.py
│   │   │   └── action_items.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── meeting.py
│   │   │   ├── transcript.py
│   │   │   ├── summary.py
│   │   │   └── action_item.py
│   │   │
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── meetings.db
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   │
│   ├── app/
│   │   ├── meetings/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── lib/
│   │   └── api.ts
│   │
│   ├── public/
│   │   └── meeting.m4a
│   │
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

# 🗄️ Database Schema

The backend uses SQLite with SQLAlchemy.

## Meeting

```text
Meeting
--------
id
title
date
duration
created_at
updated_at
```

## Participant

```text
Participant
-----------
id
meeting_id
name
email
```

## Transcript Segment

```text
TranscriptSegment
-----------------
id
meeting_id
speaker
start_time
end_time
text
```

## Meeting Summary

```text
MeetingSummary
--------------
id
meeting_id
overview
key_topics
created_at
```

## Action Item

```text
ActionItem
----------
id
meeting_id
title
assignee
completed
created_at
```

### Relationships

```text
Meeting
  │
  ├── Participants
  │
  ├── Transcript Segments
  │
  ├── Meeting Summary
  │
  └── Action Items
```

---

# 🔌 API Endpoints

The backend exposes REST APIs through FastAPI.

## Health

```http
GET /
GET /api/health
```

---

## Meetings

### Get Meetings

```http
GET /api/meetings
```

Optional search:

```http
GET /api/meetings?search=product
```

### Get Meeting

```http
GET /api/meetings/{meeting_id}
```

### Create Meeting

```http
POST /api/meetings
```

### Update Meeting

```http
PUT /api/meetings/{meeting_id}
```

### Delete Meeting

```http
DELETE /api/meetings/{meeting_id}
```

---

## Transcript

### Get Transcript

```http
GET /api/meetings/{meeting_id}/transcript
```

### Add Transcript Segment

```http
POST /api/meetings/{meeting_id}/transcript
```

### Update Transcript Segment

```http
PUT /api/meetings/transcript/{segment_id}
```

### Delete Transcript Segment

```http
DELETE /api/meetings/transcript/{segment_id}
```

---

## Summary

### Get Summary

```http
GET /api/meetings/{meeting_id}/summary
```

### Create Summary

```http
POST /api/meetings/{meeting_id}/summary
```

### Update Summary

```http
PUT /api/meetings/{meeting_id}/summary
```

---

## Action Items

### Get Action Items

```http
GET /api/meetings/{meeting_id}/actions
```

### Create Action Item

```http
POST /api/meetings/{meeting_id}/actions
```

### Update Action Item

```http
PUT /api/meetings/actions/{action_id}
```

### Delete Action Item

```http
DELETE /api/meetings/actions/{action_id}
```

---

# 📖 API Documentation

FastAPI automatically provides interactive API documentation.

After starting the backend, open:

```text
http://127.0.0.1:8000/docs
```

The Swagger interface can be used to:

- View available endpoints
- Inspect request schemas
- Send API requests
- Test responses

---

# ⚙️ Local Setup

## Prerequisites

Make sure the following are installed:

- Python 3.10+
- Node.js 18+
- npm
- Git

---

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>

cd <PROJECT_FOLDER>
```

---

## 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend will be available at:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 3. Frontend Setup

Open another terminal.

Navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend will be available at:

```text
http://localhost:3000
```

---

# 🔄 Running the Full Application

You need two development servers running.

### Terminal 1 — Backend

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# 🎧 Meeting Audio

The current application uses a sample meeting recording located at:

```text
frontend/public/meeting.m4a
```

The frontend loads this file using:

```text
/meeting.m4a
```

The transcript timestamps are aligned with the sample recording to demonstrate transcript/audio synchronization.

---

# 🧪 Testing Checklist

Before deployment, verify the following.

## Dashboard

- [ ] Meetings load correctly
- [ ] Search works
- [ ] Filters work
- [ ] Sorting works
- [ ] Create meeting works
- [ ] Edit meeting works
- [ ] Delete meeting works

## Meeting Detail

- [ ] Meeting details load
- [ ] Audio plays
- [ ] Audio can be seeked
- [ ] Transcript loads
- [ ] Transcript search works
- [ ] Transcript highlighting works
- [ ] Clicking transcript seeks audio
- [ ] Active transcript segment updates during playback

## Transcript CRUD

- [ ] Add transcript
- [ ] Edit transcript
- [ ] Delete transcript
- [ ] Validation works

## Action Items

- [ ] Add action item
- [ ] Edit action item
- [ ] Delete action item
- [ ] Mark complete
- [ ] Mark incomplete
- [ ] Changes persist after refresh

## Summary

- [ ] Summary displays
- [ ] Key topics display correctly

---

# 🔐 Authentication

Authentication is currently outside the core implementation scope.

The application is structured so authentication can be added later using:

- JWT
- OAuth
- Auth.js
- Clerk
- Another identity provider

---

# 🔮 Future Improvements

Potential improvements for a production version include:

- Real-time speech-to-text transcription
- User authentication
- Multi-user workspaces
- Meeting integrations
- Google Calendar integration
- Zoom integration
- Google Meet integration
- Microsoft Teams integration
- Live meeting bot
- Real-time transcript generation
- LLM-powered summaries
- Automatic action-item extraction
- Speaker identification
- Meeting analytics
- Pagination
- Advanced transcript filtering
- Role-based access control
- Cloud database
- Cloud object storage for recordings
- Background processing for transcription
- Production monitoring and logging

---

# 🎯 Design Goals

The UI is designed to provide a clean meeting-review workflow inspired by modern meeting intelligence platforms.

The main goals were:

- Simple navigation
- Clear information hierarchy
- Fast meeting search
- Easy transcript navigation
- Direct transcript/audio interaction
- Simple action-item management
- Minimal and professional visual design

---

# 📜 Scope

This project was developed as a full-stack SDE assignment.

The focus was on demonstrating:

- Frontend development
- Backend API development
- Database modeling
- CRUD operations
- REST API integration
- Audio/transcript synchronization
- Search functionality
- State management
- Responsive UI design
- Error and loading states

Real-time transcription and production authentication are intentionally outside the current scope.

---

# 👩‍💻 Author

**Sneha Goswami**

BE Computer Engineering

---

# ⭐ Project Highlights

```text
Next.js + TypeScript
        │
        ▼
Meeting Dashboard
        │
        ├── Search / Filter / Sort
        │
        ├── Meeting CRUD
        │
        ▼
Meeting Details
        │
        ├── Audio Player
        ├── Transcript
        ├── Transcript Search
        ├── Audio Synchronization
        ├── AI Summary
        └── Action Items
                    │
                    ▼
              FastAPI Backend
                    │
                    ▼
                 SQLite
```

---

## License

This project is developed for educational and assignment purposes.
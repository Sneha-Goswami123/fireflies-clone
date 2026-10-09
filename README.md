# Fireflies Clone — Meeting Notes & Transcription Platform

A full-stack meeting management platform inspired by Fireflies.ai. It provides a dashboard for managing meetings, viewing timestamped transcripts, reviewing meeting summaries, searching transcript content, and tracking action items.

## Live Deployment

- **Frontend:** https://fireflies-clone-roan.vercel.app/
- **Backend API:** https://fireflies-clone-backend-aaxc.onrender.com
- **Interactive API Documentation:** https://fireflies-clone-backend-aaxc.onrender.com/docs
- **GitHub Repository:** https://github.com/Sneha-Goswami123/fireflies-clone

The backend is hosted on Render's free tier. It may take some time to respond after a period of inactivity.

## Features

- Meeting dashboard with search, sorting, and filtering.
- Create, view, update, and delete meetings.
- View participants associated with each meeting.
- Browse timestamped transcript segments organized by speaker.
- Search and highlight transcript text.
- Play sample audio and navigate using transcript timestamps.
- Store and display meeting summaries and key topics.
- Create, assign, edit, delete, and complete action items.
- Handle meetings without available summaries or transcripts.
- Responsive user interface with loading, error, and empty states.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | CSS / Tailwind CSS |
| Icons | Lucide React |
| Backend | Python, FastAPI |
| Data validation | Pydantic |
| ORM | SQLAlchemy |
| Database | SQLite |
| Hosting | Vercel and Render |

## Architecture

```text
                  User
                   |
                   v
          Next.js Frontend
              (Vercel)
                   |
             HTTP / JSON
                   |
                   v
             FastAPI API
              (Render)
                   |
                SQLAlchemy
                   |
                   v
             SQLite Database
                   |
       +-----------+-----------+
       |           |           |
    Meetings   Participants  Transcript
       |                       Segments
       |
   +---+-------------------+
   |                       |
Summaries              Action Items
```

The frontend communicates with FastAPI through `frontend/lib/api.ts`. The backend uses SQLAlchemy models to represent meeting records and their associated data.

## Getting Started

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- Git

### Backend setup

```bash
git clone https://github.com/Sneha-Goswami123/fireflies-clone.git
cd fireflies-clone/backend

python -m venv venv
```

Activate the environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies and start the API:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend URLs:

- API root: http://127.0.0.1:8000/
- Health check: http://127.0.0.1:8000/api/health
- API documentation: http://127.0.0.1:8000/docs

### Frontend setup

Open a second terminal:

```bash
cd fireflies-clone/frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Environment Variables

| Variable | Location | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Frontend | Base URL used for backend requests |
| `PORT` | Render | Port provided to the backend process |

For production, `NEXT_PUBLIC_API_URL` should point to the deployed Render API. Because Next.js exposes `NEXT_PUBLIC_*` variables in the browser bundle at build time, redeploy the frontend after changing this value.

## API Reference

All application routes are prefixed with `/api` except the root and health-check endpoints.

### General

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check that the backend is running |
| GET | `/api/health` | Health check |

### Meetings

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/meetings` | Retrieve meetings, with optional search |
| GET | `/api/meetings/{meeting_id}` | Retrieve a meeting |
| POST | `/api/meetings` | Create a meeting |
| PUT | `/api/meetings/{meeting_id}` | Update a meeting |
| DELETE | `/api/meetings/{meeting_id}` | Delete a meeting |

### Transcript Segments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/meetings/{meeting_id}/transcript` | Retrieve a meeting transcript |
| POST | `/api/meetings/{meeting_id}/transcript` | Add a transcript segment |
| PUT | `/api/meetings/transcript/{segment_id}` | Update a transcript segment |
| DELETE | `/api/meetings/transcript/{segment_id}` | Delete a transcript segment |

### Meeting Summaries

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/meetings/{meeting_id}/summary` | Retrieve a meeting summary |
| POST | `/api/meetings/{meeting_id}/summary` | Create a summary |
| PUT | `/api/meetings/{meeting_id}/summary` | Update a summary |

### Action Items

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/meetings/{meeting_id}/actions` | Retrieve action items |
| POST | `/api/meetings/{meeting_id}/actions` | Create an action item |
| PUT | `/api/meetings/actions/{action_id}` | Update an action item |
| DELETE | `/api/meetings/actions/{action_id}` | Delete an action item |

For exact request and response schemas, use the interactive Swagger UI at `/docs`.

## Database Design

The application uses SQLite and SQLAlchemy. The database is organized into five logical entities:

1. `meetings`
2. `participants`
3. `transcript_segments`
4. `meeting_summaries`
5. `action_items`

The meeting record is the central entity. The other records are associated with a meeting through `meeting_id`.

## Table Schemas

### 1. Meetings

The `meetings` table stores the core details of each meeting.

| Column | Logical type | Description |
|---|---|---|
| `id` | Integer | Primary key and meeting identifier |
| `title` | String | Meeting title |
| `date` | DateTime / String | Meeting date and time |
| `duration` | Integer | Duration in seconds |
| `created_at` | DateTime | Creation timestamp, if configured in the model |
| `updated_at` | DateTime | Last update timestamp, if configured in the model |

**Purpose:** Stores the main meeting record that the dashboard and meeting detail page use.

### 2. Participants

The `participants` table stores the people associated with meetings.

| Column | Logical type | Description |
|---|---|---|
| `id` | Integer | Primary key |
| `meeting_id` | Integer | Foreign key referencing a meeting |
| `name` | String | Participant's display name |
| `email` | String | Participant's email address |

**Relationship:** One meeting can have multiple participants. A participant record belongs to a meeting through `meeting_id`.

### 3. Transcript Segments

The `transcript_segments` table stores timestamped portions of a meeting transcript.

| Column | Logical type | Description |
|---|---|---|
| `id` | Integer | Primary key |
| `meeting_id` | Integer | Foreign key referencing a meeting |
| `speaker` | String | Name of the speaker |
| `start_time` | Numeric | Segment start time in seconds |
| `end_time` | Numeric | Segment end time in seconds |
| `text` | Text / String | Transcript content |

**Purpose:** Enables speaker-based transcript display, text search, highlighting, and timestamp-based navigation.

### 4. Meeting Summaries

The `meeting_summaries` table stores the summary associated with a meeting.

| Column | Logical type | Description |
|---|---|---|
| `id` | Integer | Primary key |
| `meeting_id` | Integer | Foreign key referencing a meeting |
| `overview` | Text / String | Summary of the meeting |
| `key_topics` | Text / String | Key topics discussed |
| `created_at` | DateTime | Summary creation timestamp, if configured |

**Relationship:** A meeting has at most one summary when the `meeting_id` column is configured as unique. A meeting can exist without a summary.

### 5. Action Items

The `action_items` table stores tasks associated with a meeting.

| Column | Logical type | Description |
|---|---|---|
| `id` | Integer | Primary key |
| `meeting_id` | Integer | Foreign key referencing a meeting |
| `title` | String | Task description |
| `assignee` | String | Person responsible for the task |
| `completed` | Boolean | Whether the task is complete |
| `created_at` | DateTime | Creation timestamp |

**Purpose:** Supports task creation, assignment, completion tracking, editing, and deletion.

## Relationships and Design Decisions

| Relationship | Cardinality | Meaning |
|---|---|---|
| Meetings → Participants | One-to-many | A meeting can have multiple participants |
| Meetings → Transcript Segments | One-to-many | A meeting transcript consists of multiple segments |
| Meetings → Meeting Summaries | One-to-zero-or-one | A meeting may have one summary or no summary |
| Meetings → Action Items | One-to-many | A meeting can have multiple action items |

### Why separate tables?

**Transcript segments:** Storing each segment separately makes it easier to search, edit, and display content by speaker and timestamp without storing the whole transcript in a single field.

**Participants:** Separating participants avoids repeating participant information in the main meeting record and makes it possible to associate multiple people with one meeting.

**Meeting summaries:** Separating summaries from meetings allows summaries to be created or updated independently. It also supports meetings that do not yet have a summary.

**Action items:** Keeping tasks in their own table supports independent updates to task descriptions, assignees, and completion status.

**Meeting ID:** The meeting's primary key provides the common reference used by related records.

## Example SQL Queries

The following queries illustrate how the database can be inspected. Table and column names should be adjusted if the actual SQLAlchemy naming differs.

### Retrieve meetings

```sql
SELECT id, title, date, duration
FROM meetings
ORDER BY date DESC;
```

### Retrieve participants for a meeting

```sql
SELECT name, email
FROM participants
WHERE meeting_id = 1;
```

### Retrieve transcript in chronological order

```sql
SELECT speaker, start_time, end_time, text
FROM transcript_segments
WHERE meeting_id = 1
ORDER BY start_time;
```

### Retrieve the summary for a meeting

```sql
SELECT overview, key_topics
FROM meeting_summaries
WHERE meeting_id = 1;
```

### Retrieve incomplete action items

```sql
SELECT title, assignee, completed
FROM action_items
WHERE meeting_id = 1
  AND completed = FALSE;
```

### Retrieve meetings with their summaries

```sql
SELECT
    m.id,
    m.title,
    s.overview,
    s.key_topics
FROM meetings AS m
LEFT JOIN meeting_summaries AS s
    ON s.meeting_id = m.id;
```

The `LEFT JOIN` allows meetings without a summary to appear in the results.

## Assumptions, Mocked Data & Notes

- **No live transcription:** The application uses pre-existing or manually supplied transcript segments rather than a live speech-to-text service.
- **Sample meeting:** The Product Team Weekly Meeting provides demonstration data for the dashboard and meeting detail page.
- **Summary content:** Summary and key-topic data are stored and retrieved through the backend. They are not necessarily generated by a live AI model.
- **Sample audio:** The included audio file demonstrates media playback. It is not guaranteed to correspond exactly to the sample transcript.
- **Missing summary:** A meeting can exist without a summary. The frontend handles this case without blocking the meeting detail page.
- **Missing transcript or actions:** The interface should display an appropriate empty state when these resources are unavailable.
- **No authentication:** The current application does not implement a complete authentication system or user-specific access control.
- **Database:** SQLite is used to simplify local development and setup.
- **Hosting persistence:** Without persistent storage, SQLite data on the Render free service may be lost when the instance restarts or is redeployed.
- **Cold starts:** The backend may take time to respond after inactivity.
- **Environment configuration:** The deployed frontend must use the correct Render API URL through `NEXT_PUBLIC_API_URL`.

## Known Limitations

- No real-time transcription.
- No live AI summarization or automatic action-item extraction.
- No complete authentication or authorization system.
- SQLite persistence is not guaranteed across hosting restarts without persistent storage.
- The sample audio may not match the sample transcript.
- The project is intended as an assignment/demo application rather than a production-ready meeting platform.

## Future Improvements

- Integrate a speech-to-text service for automatic transcription.
- Add an LLM-based meeting summary and action-item extraction pipeline.
- Introduce authentication and role-based access control.
- Migrate to persistent PostgreSQL storage.
- Add audio upload and storage support.
- Add automated backend and frontend tests.
- Integrate calendar services and meeting platforms.

## Project Structure

```text
fireflies-clone/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/
│   │   └── routers/
│   ├── requirements.txt
│   └── meetings.db
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── meetings/
│   │       └── [id]/
│   │           └── page.tsx
│   ├── lib/
│   │   └── api.ts
│   ├── public/
│   │   └── meeting.m4a
│   └── package.json
├── .gitignore
└── README.md
```

## Deployment Links

- [Live Frontend](https://fireflies-clone-roan.vercel.app/)
- [Backend API](https://fireflies-clone-backend-aaxc.onrender.com)
- [Interactive API Docs](https://fireflies-clone-backend-aaxc.onrender.com/docs)
- [GitHub Repository](https://github.com/Sneha-Goswami123/fireflies-clone)

## License

Developed as a full-stack software engineering assignment for educational and demonstration purposes.

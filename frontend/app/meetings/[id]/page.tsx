"use client";

import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Play,
  Search,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import {
  createActionItem,
  createTranscriptSegment,
  deleteActionItem,
  deleteTranscriptSegment,
  getActionItems,
  getMeeting,
  getSummary,
  getTranscript,
  updateActionItem,
  updateTranscriptSegment,
} from "@/lib/api";

type Participant = {
  id: number;
  name: string;
  email?: string;
};

type Meeting = {
  id: number;
  title: string;
  date: string;
  duration: number;
  participants: Participant[];
};

type TranscriptSegment = {
  id: number;
  meeting_id: number;
  speaker: string;
  start_time: number;
  end_time: number;
  text: string;
};

type Summary = {
  id: number;
  meeting_id: number;
  overview: string;
  key_topics: string;
};

type ActionItem = {
  id: number;
  meeting_id: number;
  title: string;
  assignee: string | null;
  completed: boolean;
};

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function highlightText(text: string, search: string) {
  if (!search.trim()) {
    return text;
  }

  const parts = text.split(
    new RegExp(`(${escapeRegExp(search)})`, "gi")
  );

  return parts.map((part, index) => {
    const isMatch =
      part.toLowerCase() === search.toLowerCase();

    if (isMatch) {
      return (
        <mark
          key={index}
          className="rounded bg-yellow-200 px-0.5 text-slate-900"
        >
          {part}
        </mark>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type MeetingPageProps = PageProps<"/meetings/[id]">;

export default function MeetingPage({
  params,
}: MeetingPageProps) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  const [transcript, setTranscript] = useState<
    TranscriptSegment[]
  >([]);

  const [summary, setSummary] = useState<Summary | null>(
    null
  );

  const [actions, setActions] = useState<ActionItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [activeSegment, setActiveSegment] = useState<
    number | null
  >(null);

  const [search, setSearch] = useState("");

  /*
   * ==========================================================
   * ACTION ITEM STATE
   * ==========================================================
   */

  const [updatingAction, setUpdatingAction] = useState<
    number | null
  >(null);

  const [showActionModal, setShowActionModal] =
    useState(false);

  const [editingActionId, setEditingActionId] =
    useState<number | null>(null);

  const [actionTitle, setActionTitle] = useState("");

  const [actionAssignee, setActionAssignee] =
    useState("");

  const [actionCompleted, setActionCompleted] =
    useState(false);

  const [actionError, setActionError] = useState("");

  const [savingAction, setSavingAction] = useState(false);

  const [deleteActionTarget, setDeleteActionTarget] =
    useState<ActionItem | null>(null);

  const [deletingAction, setDeletingAction] =
    useState(false);

  /*
   * ==========================================================
   * TRANSCRIPT CRUD STATE
   * ==========================================================
   */

  const [showTranscriptModal, setShowTranscriptModal] =
    useState(false);

  const [editingTranscriptId, setEditingTranscriptId] =
    useState<number | null>(null);

  const [transcriptSpeaker, setTranscriptSpeaker] =
    useState("");

  const [transcriptStartTime, setTranscriptStartTime] =
    useState("");

  const [transcriptEndTime, setTranscriptEndTime] =
    useState("");

  const [transcriptText, setTranscriptText] =
    useState("");

  const [transcriptError, setTranscriptError] =
    useState("");

  const [savingTranscript, setSavingTranscript] =
    useState(false);

  const [deleteTranscriptTarget, setDeleteTranscriptTarget] =
    useState<TranscriptSegment | null>(null);

  const [deletingTranscript, setDeletingTranscript] =
    useState(false);

  /*
   * ==========================================================
   * AUDIO PLAYER
   * ==========================================================
   */

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);

  const [audioDuration, setAudioDuration] = useState(0);

  /*
   * ==========================================================
   * LOAD MEETING
   * ==========================================================
   */

  useEffect(() => {
  let cancelled = false;

  async function loadMeeting() {
    try {
      setLoading(true);
      setLoadError("");

      const { id } = await params;
      const meetingId = Number(id);

      if (!Number.isInteger(meetingId) || meetingId <= 0) {
        throw new Error("Invalid meeting ID");
      }

      // These are required for the meeting page.
      const [meetingData, transcriptData, actionData] =
        await Promise.all([
          getMeeting(meetingId),
          getTranscript(meetingId),
          getActionItems(meetingId),
        ]);

      // A missing summary must not prevent the page from loading.
      let summaryData = null;

      try {
        summaryData = await getSummary(meetingId);
      } catch (error) {
        console.warn(
          "No summary available for this meeting:",
          error
        );
      }

      if (cancelled) return;

      setMeeting(meetingData);
      setTranscript(transcriptData);
      setActions(actionData);
      setSummary(summaryData);
    } catch (error) {
      console.error("Failed to load meeting:", error);

      if (!cancelled) {
        setLoadError(
          "We couldn't load this meeting. Please try again."
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  loadMeeting();

  return () => {
    cancelled = true;
  };
}, [params]);

  /*
   * ==========================================================
   * ACTION ITEM CRUD
   * ==========================================================
   */

  async function handleToggleAction(
    actionId: number,
    completed: boolean
  ) {
    try {
      setUpdatingAction(actionId);

      const updatedAction = await updateActionItem(
        actionId,
        {
          completed: !completed,
        }
      );

      setActions((currentActions) =>
        currentActions.map((action) =>
          action.id === actionId
            ? updatedAction
            : action
        )
      );
    } catch (error) {
      console.error(
        "Failed to update action item:",
        error
      );
    } finally {
      setUpdatingAction(null);
    }
  }

  function openAddActionModal() {
    setEditingActionId(null);
    setActionTitle("");
    setActionAssignee("");
    setActionCompleted(false);
    setActionError("");
    setShowActionModal(true);
  }

  function openEditActionModal(action: ActionItem) {
    setEditingActionId(action.id);
    setActionTitle(action.title);
    setActionAssignee(action.assignee || "");
    setActionCompleted(action.completed);
    setActionError("");
    setShowActionModal(true);
  }

  function closeActionModal() {
    if (savingAction) return;

    setShowActionModal(false);
    setEditingActionId(null);
    setActionTitle("");
    setActionAssignee("");
    setActionCompleted(false);
    setActionError("");
  }

  async function handleSaveAction() {
    if (!meeting) return;

    const trimmedTitle = actionTitle.trim();

    if (!trimmedTitle) {
      setActionError("Action item title is required.");
      return;
    }

    try {
      setSavingAction(true);
      setActionError("");

      if (editingActionId !== null) {
        const updatedAction = await updateActionItem(
          editingActionId,
          {
            title: trimmedTitle,
            assignee:
              actionAssignee.trim() || undefined,
            completed: actionCompleted,
          }
        );

        setActions((currentActions) =>
          currentActions.map((action) =>
            action.id === editingActionId
              ? updatedAction
              : action
          )
        );
      } else {
        const newAction = await createActionItem(
          meeting.id,
          {
            title: trimmedTitle,
            assignee:
              actionAssignee.trim() || undefined,
            completed: actionCompleted,
          }
        );

        setActions((currentActions) => [
          ...currentActions,
          newAction,
        ]);
      }

      closeActionModal();
    } catch (error) {
      console.error(
        "Failed to save action item:",
        error
      );

      setActionError(
        "Failed to save action item. Please try again."
      );
    } finally {
      setSavingAction(false);
    }
  }

  async function handleDeleteAction() {
    if (!deleteActionTarget) return;

    try {
      setDeletingAction(true);

      await deleteActionItem(deleteActionTarget.id);

      setActions((currentActions) =>
        currentActions.filter(
          (action) =>
            action.id !== deleteActionTarget.id
        )
      );

      setDeleteActionTarget(null);
    } catch (error) {
      console.error(
        "Failed to delete action item:",
        error
      );
    } finally {
      setDeletingAction(false);
    }
  }

  /*
   * ==========================================================
   * TRANSCRIPT CRUD
   * ==========================================================
   */

  function openAddTranscriptModal() {
    setEditingTranscriptId(null);
    setTranscriptSpeaker("");
    setTranscriptStartTime("");
    setTranscriptEndTime("");
    setTranscriptText("");
    setTranscriptError("");
    setShowTranscriptModal(true);
  }

  function openEditTranscriptModal(
    segment: TranscriptSegment
  ) {
    setEditingTranscriptId(segment.id);
    setTranscriptSpeaker(segment.speaker);
    setTranscriptStartTime(
      String(segment.start_time)
    );
    setTranscriptEndTime(
      String(segment.end_time)
    );
    setTranscriptText(segment.text);
    setTranscriptError("");
    setShowTranscriptModal(true);
  }

  function closeTranscriptModal() {
    if (savingTranscript) return;

    setShowTranscriptModal(false);
    setEditingTranscriptId(null);
    setTranscriptSpeaker("");
    setTranscriptStartTime("");
    setTranscriptEndTime("");
    setTranscriptText("");
    setTranscriptError("");
  }

  async function handleSaveTranscript() {
    if (!meeting) return;

    const speaker = transcriptSpeaker.trim();
    const text = transcriptText.trim();

    const startTime = Number(transcriptStartTime);
    const endTime = Number(transcriptEndTime);

    if (!speaker) {
      setTranscriptError("Speaker is required.");
      return;
    }

    if (!text) {
      setTranscriptError(
        "Transcript text is required."
      );
      return;
    }

    if (
      transcriptStartTime.trim() === "" ||
      Number.isNaN(startTime) ||
      startTime < 0
    ) {
      setTranscriptError(
        "Start time must be a valid number."
      );
      return;
    }

    if (
      transcriptEndTime.trim() === "" ||
      Number.isNaN(endTime) ||
      endTime < 0
    ) {
      setTranscriptError(
        "End time must be a valid number."
      );
      return;
    }

    if (endTime <= startTime) {
      setTranscriptError(
        "End time must be greater than start time."
      );
      return;
    }

    try {
      setSavingTranscript(true);
      setTranscriptError("");

      if (editingTranscriptId !== null) {
        const updatedSegment =
          await updateTranscriptSegment(
            editingTranscriptId,
            {
              speaker,
              start_time: startTime,
              end_time: endTime,
              text,
            }
          );

        setTranscript((currentTranscript) =>
          currentTranscript
            .map((segment) =>
              segment.id === editingTranscriptId
                ? updatedSegment
                : segment
            )
            .sort(
              (a, b) =>
                a.start_time - b.start_time
            )
        );
      } else {
        const newSegment =
          await createTranscriptSegment(
            meeting.id,
            {
              speaker,
              start_time: startTime,
              end_time: endTime,
              text,
            }
          );

        setTranscript((currentTranscript) =>
          [
            ...currentTranscript,
            newSegment,
          ].sort(
            (a, b) =>
              a.start_time - b.start_time
          )
        );
      }

      closeTranscriptModal();
    } catch (error) {
      console.error(
        "Failed to save transcript segment:",
        error
      );

      setTranscriptError(
        "Failed to save transcript segment. Please try again."
      );
    } finally {
      setSavingTranscript(false);
    }
  }

  async function handleDeleteTranscript() {
    if (!deleteTranscriptTarget) return;

    try {
      setDeletingTranscript(true);

      await deleteTranscriptSegment(
        deleteTranscriptTarget.id
      );

      setTranscript((currentTranscript) =>
        currentTranscript.filter(
          (segment) =>
            segment.id !==
            deleteTranscriptTarget.id
        )
      );

      if (
        activeSegment ===
        deleteTranscriptTarget.id
      ) {
        setActiveSegment(null);
      }

      setDeleteTranscriptTarget(null);
    } catch (error) {
      console.error(
        "Failed to delete transcript segment:",
        error
      );
    } finally {
      setDeletingTranscript(false);
    }
  }

  /*
   * ==========================================================
   * AUDIO PLAYER
   * ==========================================================
   */

  function togglePlay() {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play().catch((error) => {
        console.error(
          "Failed to play audio:",
          error
        );
      });
    } else {
      audioRef.current.pause();
    }
  }

  function handleTimeUpdate() {
    if (!audioRef.current) return;

    setCurrentTime(audioRef.current.currentTime);
  }

  function handleLoadedMetadata() {
    if (!audioRef.current) return;

    setAudioDuration(audioRef.current.duration);
  }

  function handleAudioEnded() {
    setIsPlaying(false);
    setCurrentTime(0);
  }

  function handleSeek(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const time = Number(event.target.value);

    if (!audioRef.current) return;

    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }

  function seekToTranscript(
    startTime: number,
    segmentId: number
  ) {
    if (!audioRef.current) return;

    audioRef.current.currentTime = startTime;

    setCurrentTime(startTime);

    setActiveSegment(segmentId);

    audioRef.current.play().catch((error) => {
      console.error(
        "Failed to play audio:",
        error
      );
    });
  }

  /*
   * Automatically highlight the transcript segment
   * corresponding to the current audio position.
   */

  useEffect(() => {
    if (transcript.length === 0) return;

    const currentSegment = transcript.find(
      (segment) =>
        currentTime >= segment.start_time &&
        currentTime < segment.end_time
    );

    if (currentSegment) {
      setActiveSegment(currentSegment.id);
    }
  }, [currentTime, transcript]);

  /*
   * ==========================================================
   * LOADING / ERROR / NOT FOUND
   * ==========================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <header className="border-b border-slate-200 bg-white">
          <div className="px-6 py-4">
            <div className="h-5 w-5 animate-pulse rounded bg-slate-200" />

            <div className="mt-4 h-6 w-72 animate-pulse rounded bg-slate-200" />

            <div className="mt-3 flex gap-4">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </header>

        <section className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="mx-auto max-w-7xl">
            <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
            </div>

            <div className="space-y-6 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse"
                >
                  <div className="mb-3 h-3 w-20 rounded bg-slate-100" />

                  <div className="h-4 w-32 rounded bg-slate-200" />

                  <div className="mt-2 h-4 w-full rounded bg-slate-100" />

                  <div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="h-56 animate-pulse rounded-xl border border-slate-200 bg-white" />

            <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
          </aside>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            !
          </div>

          <h1 className="mt-4 text-xl font-semibold text-slate-900">
            Unable to load meeting
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {loadError}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Try Again
            </button>

            <a
              href="/"
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Back to Meetings
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (!meeting) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Meeting not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This meeting may have been deleted or the
            link may be invalid.
          </p>

          <a
            href="/"
            className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Back to Meetings
          </a>
        </div>
      </main>
    );
  }

  /*
   * ==========================================================
   * TRANSCRIPT SEARCH
   * ==========================================================
   */

  const filteredTranscript = transcript.filter(
    (segment) => {
      const query = search.toLowerCase().trim();

      if (!query) {
        return true;
      }

      return (
        segment.text
          .toLowerCase()
          .includes(query) ||
        segment.speaker
          .toLowerCase()
          .includes(query)
      );
    }
  );

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      {/* =====================================================
          TOP HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="rounded-lg p-2 transition hover:bg-slate-100"
              title="Back to meetings"
            >
              <ArrowLeft size={20} />
            </a>

            <div>
              <h1 className="text-xl font-semibold">
                {meeting.title}
              </h1>

              <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  {formatDate(meeting.date)}
                </span>

                <span className="flex items-center gap-1.5">
                  <Clock size={14} />

                  {Math.floor(
                    meeting.duration / 60
                  )}{" "}
                  min
                </span>

                <span className="flex items-center gap-1.5">
                  <Users size={14} />

                  {meeting.participants.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MEDIA PLAYER
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto max-w-7xl">
          <audio
            ref={audioRef}
            src="/meeting.m4a"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleAudioEnded}
          />

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800"
              title={
                isPlaying
                  ? "Pause meeting"
                  : "Play meeting"
              }
            >
              {isPlaying ? (
                <span className="text-sm font-bold">
                  Ⅱ
                </span>
              ) : (
                <Play
                  size={17}
                  fill="white"
                />
              )}
            </button>

            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={audioDuration || 0}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full cursor-pointer accent-slate-900"
              />

              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>
                  {formatTime(
                    Math.floor(currentTime)
                  )}
                </span>

                <span>
                  {formatTime(
                    Math.floor(
                      audioDuration ||
                        meeting.duration
                    )
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[1.4fr_1fr]">
        {/* ===================================================
            TRANSCRIPT
        ==================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white">
          {/* Transcript Header */}

          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">
                Transcript
              </h2>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search transcript"
                    className="w-56 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={openAddTranscriptModal}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>

            {search.trim() && (
              <p className="mt-3 text-xs text-slate-400">
                {filteredTranscript.length}{" "}
                {filteredTranscript.length === 1
                  ? "result"
                  : "results"}{" "}
                found
              </p>
            )}
          </div>

          {/* Transcript Lines */}

          <div className="divide-y divide-slate-100">
            {filteredTranscript.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-medium text-slate-700">
                  {search.trim()
                    ? "No transcript matches found"
                    : "No transcript yet"}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {search.trim()
                    ? "Try a different search term."
                    : "Add your first transcript segment to get started."}
                </p>

                {!search.trim() && (
                  <button
                    type="button"
                    onClick={
                      openAddTranscriptModal
                    }
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    <Plus size={16} />
                    Add Transcript
                  </button>
                )}
              </div>
            ) : (
              filteredTranscript.map(
                (segment) => (
                  <div
                    key={segment.id}
                    className={`group relative px-5 py-5 transition ${
                      activeSegment ===
                      segment.id
                        ? "bg-slate-100"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Edit / Delete buttons */}

                    <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() =>
                          openEditTranscriptModal(
                            segment
                          )
                        }
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700"
                        title="Edit transcript"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTranscriptTarget(
                            segment
                          )
                        }
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete transcript"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Clickable transcript content */}

                    <button
                      type="button"
                      onClick={() =>
                        seekToTranscript(
                          segment.start_time,
                          segment.id
                        )
                      }
                      className="w-full text-left"
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-400">
                          {formatTime(
                            segment.start_time
                          )}
                        </span>

                        <span className="font-semibold text-slate-900">
                          {search &&
                          segment.speaker
                            .toLowerCase()
                            .includes(
                              search.toLowerCase()
                            )
                            ? highlightText(
                                segment.speaker,
                                search
                              )
                            : segment.speaker}
                        </span>
                      </div>

                      <p className="text-sm leading-6 text-slate-600">
                        {highlightText(
                          segment.text,
                          search
                        )}
                      </p>
                    </button>
                  </div>
                )
              )
            )}
          </div>
        </section>

        {/* ===================================================
            RIGHT PANEL
        ==================================================== */}

        <aside className="space-y-6">
          {/* =================================================
              AI SUMMARY
          ================================================== */}

          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-semibold">
                AI Summary
              </h2>
            </div>

            <div className="p-5">
              {summary ? (
                <>
                  <p className="text-sm leading-6 text-slate-600">
                    {summary.overview}
                  </p>

                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold">
                      Key Topics
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {summary.key_topics
                        .split(",")
                        .map((topic) => (
                          <span
                            key={topic}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                          >
                            {topic.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">
                    No summary available
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    An AI-generated summary will
                    appear here when one is
                    available.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              ACTION ITEMS
          ================================================== */}

          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">
                  Action Items
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openAddActionModal}
                    className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
                  >
                    <Plus size={14} />
                    Add
                  </button>

                  <ChevronDown
                    size={18}
                    className="text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {actions.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No action items yet
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Add tasks and assign them to
                    meeting participants.
                  </p>

                  <button
                    type="button"
                    onClick={openAddActionModal}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                  >
                    <Plus size={14} />
                    Add Action
                  </button>
                </div>
              ) : (
                actions.map((action) => (
                  <div
                    key={action.id}
                    className="group flex items-start gap-3 p-5"
                  >
                    <button
                      type="button"
                      disabled={
                        updatingAction ===
                        action.id
                      }
                      onClick={() =>
                        handleToggleAction(
                          action.id,
                          action.completed
                        )
                      }
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                        action.completed
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 bg-white hover:border-slate-500"
                      } ${
                        updatingAction ===
                        action.id
                          ? "cursor-wait opacity-50"
                          : ""
                      }`}
                      title={
                        action.completed
                          ? "Mark incomplete"
                          : "Mark complete"
                      }
                    >
                      {action.completed && (
                        <Check size={13} />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm ${
                          action.completed
                            ? "text-slate-400 line-through"
                            : "text-slate-700"
                        }`}
                      >
                        {action.title}
                      </p>

                      {action.assignee && (
                        <p className="mt-1 text-xs text-slate-400">
                          Assigned to{" "}
                          {action.assignee}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() =>
                          openEditActionModal(
                            action
                          )
                        }
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        title="Edit action item"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteActionTarget(
                            action
                          )
                        }
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete action item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>

      {/* =====================================================
          TRANSCRIPT ADD / EDIT MODAL
      ====================================================== */}

      {showTranscriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingTranscriptId !== null
                    ? "Edit Transcript"
                    : "Add Transcript"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add or edit a transcript segment.
                </p>
              </div>

              <button
                type="button"
                onClick={closeTranscriptModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {transcriptError && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {transcriptError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Speaker
                </label>

                <input
                  value={transcriptSpeaker}
                  onChange={(e) =>
                    setTranscriptSpeaker(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Sarah"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Start time (seconds)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={transcriptStartTime}
                    onChange={(e) =>
                      setTranscriptStartTime(
                        e.target.value
                      )
                    }
                    placeholder="0"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    End time (seconds)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={transcriptEndTime}
                    onChange={(e) =>
                      setTranscriptEndTime(
                        e.target.value
                      )
                    }
                    placeholder="10"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Transcript text
                </label>

                <textarea
                  value={transcriptText}
                  onChange={(e) =>
                    setTranscriptText(
                      e.target.value
                    )
                  }
                  placeholder="Enter what was said..."
                  rows={5}
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={closeTranscriptModal}
                disabled={savingTranscript}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveTranscript}
                disabled={savingTranscript}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-50"
              >
                {savingTranscript
                  ? "Saving..."
                  : editingTranscriptId !== null
                    ? "Save Changes"
                    : "Add Transcript"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          TRANSCRIPT DELETE CONFIRMATION
      ====================================================== */}

      {deleteTranscriptTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Delete transcript segment?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                This transcript segment will be
                permanently removed.
              </p>

              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-400">
                  {deleteTranscriptTarget.speaker}{" "}
                  ·{" "}
                  {formatTime(
                    deleteTranscriptTarget.start_time
                  )}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {deleteTranscriptTarget.text}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() =>
                  setDeleteTranscriptTarget(null)
                }
                disabled={deletingTranscript}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteTranscript}
                disabled={deletingTranscript}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-50"
              >
                {deletingTranscript
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ACTION ADD / EDIT MODAL
      ====================================================== */}

      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingActionId !== null
                    ? "Edit Action Item"
                    : "Add Action Item"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a task from this meeting.
                </p>
              </div>

              <button
                type="button"
                onClick={closeActionModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {actionError && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {actionError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Action item
                </label>

                <input
                  value={actionTitle}
                  onChange={(e) =>
                    setActionTitle(e.target.value)
                  }
                  placeholder="e.g. Prepare API documentation"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Assignee
                </label>

                <input
                  value={actionAssignee}
                  onChange={(e) =>
                    setActionAssignee(
                      e.target.value
                    )
                  }
                  placeholder="e.g. John"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={actionCompleted}
                  onChange={(e) =>
                    setActionCompleted(
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />

                Mark as completed
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={closeActionModal}
                disabled={savingAction}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveAction}
                disabled={savingAction}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-50"
              >
                {savingAction
                  ? "Saving..."
                  : editingActionId !== null
                    ? "Save Changes"
                    : "Add Action"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ACTION DELETE CONFIRMATION
      ====================================================== */}

      {deleteActionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Delete action item?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                This action item will be permanently
                removed.
              </p>

              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <p className="text-sm text-slate-600">
                  {deleteActionTarget.title}
                </p>

                {deleteActionTarget.assignee && (
                  <p className="mt-1 text-xs text-slate-400">
                    Assigned to{" "}
                    {deleteActionTarget.assignee}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() =>
                  setDeleteActionTarget(null)
                }
                disabled={deletingAction}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAction}
                disabled={deletingAction}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-50"
              >
                {deletingAction
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
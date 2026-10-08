"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Clock,
  Search,
  Users,
  X,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";

import {
  createMeeting,
  deleteMeeting,
  getMeetings,
  updateMeeting,
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

type ParticipantInput = {
  name: string;
  email: string;
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTimeLocal(date: string) {
  const value = new Date(date);

  const year = value.getFullYear();

  const month = String(
    value.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    value.getDate()
  ).padStart(2, "0");

  const hours = String(
    value.getHours()
  ).padStart(2, "0");

  const minutes = String(
    value.getMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  // ==========================================================
  // FILTER / SORT
  // ==========================================================

  const [sortBy, setSortBy] = useState("newest");

  const [filterBy, setFilterBy] = useState("all");

  // ==========================================================
  // NEW / EDIT MEETING MODAL
  // ==========================================================

  const [showModal, setShowModal] = useState(false);

  const [editingMeetingId, setEditingMeetingId] =
    useState<number | null>(null);

  const [saving, setSaving] = useState(false);

  const [formError, setFormError] = useState("");

  // ==========================================================
  // MEETING FORM
  // ==========================================================

  const [title, setTitle] = useState("");

  const [date, setDate] = useState("");

  const [duration, setDuration] = useState("");

  const [participants, setParticipants] =
    useState<ParticipantInput[]>([
      {
        name: "",
        email: "",
      },
    ]);

  // ==========================================================
  // DELETE STATE
  // ==========================================================

  const [deleteTarget, setDeleteTarget] =
    useState<Meeting | null>(null);

  const [deleting, setDeleting] = useState(false);

  // ==========================================================
  // LOAD MEETINGS
  // ==========================================================

  useEffect(() => {
    async function loadMeetings() {
      try {
        setLoadError("");

        const data = await getMeetings();

        setMeetings(data);
      } catch (error) {
        setLoadError(
          "Unable to load meetings. Please check that the backend is running."
        );

        console.error(
          "Failed to load meetings:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadMeetings();
  }, []);

  // ==========================================================
  // SEARCH
  // ==========================================================

  async function handleSearch(value: string) {
    setSearch(value);

    try {
      setLoadError("");

      const data = await getMeetings(value);

      setMeetings(data);
    } catch (error) {
      setLoadError(
        "Unable to search meetings. Please check that the backend is running."
      );

      console.error(
        "Search failed:",
        error
      );
    }
  }

  // ==========================================================
  // FILTER + SORT
  // ==========================================================

  function getDisplayedMeetings() {
    let result = [...meetings];

    // --------------------------------------------------------
    // FILTER
    // --------------------------------------------------------

    if (filterBy === "recent") {
      const sevenDaysAgo = new Date();

      sevenDaysAgo.setDate(
        sevenDaysAgo.getDate() - 7
      );

      result = result.filter(
        (meeting) =>
          new Date(meeting.date) >=
          sevenDaysAgo
      );
    }

    if (filterBy === "long") {
      result = result.filter(
        (meeting) =>
          meeting.duration >= 30 * 60
      );
    }

    if (filterBy === "short") {
      result = result.filter(
        (meeting) =>
          meeting.duration < 30 * 60
      );
    }

    // --------------------------------------------------------
    // SORT
    // --------------------------------------------------------

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
        );
      }

      if (sortBy === "longest") {
        return b.duration - a.duration;
      }

      if (sortBy === "shortest") {
        return a.duration - b.duration;
      }

      return 0;
    });

    return result;
  }

  const displayedMeetings =
    getDisplayedMeetings();

  // ==========================================================
  // OPEN NEW MEETING
  // ==========================================================

  function openNewMeetingModal() {
    setEditingMeetingId(null);

    setTitle("");

    setDate("");

    setDuration("");

    setParticipants([
      {
        name: "",
        email: "",
      },
    ]);

    setFormError("");

    setShowModal(true);
  }

  // ==========================================================
  // OPEN EDIT MEETING
  // ==========================================================

  function openEditMeetingModal(
    meeting: Meeting
  ) {
    setEditingMeetingId(meeting.id);

    setTitle(meeting.title);

    setDate(
      formatDateTimeLocal(meeting.date)
    );

    setDuration(
      String(
        Math.floor(
          meeting.duration / 60
        )
      )
    );

    setParticipants(
      meeting.participants.length > 0
        ? meeting.participants.map(
            (participant) => ({
              name: participant.name,
              email:
                participant.email || "",
            })
          )
        : [
            {
              name: "",
              email: "",
            },
          ]
    );

    setFormError("");

    setShowModal(true);
  }

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  function closeModal() {
    if (saving) return;

    setShowModal(false);

    setEditingMeetingId(null);

    setFormError("");
  }

  // ==========================================================
  // PARTICIPANT FUNCTIONS
  // ==========================================================

  function updateParticipant(
    index: number,
    field: "name" | "email",
    value: string
  ) {
    setParticipants((current) =>
      current.map(
        (participant, i) =>
          i === index
            ? {
                ...participant,
                [field]: value,
              }
            : participant
      )
    );
  }

  function addParticipant() {
    setParticipants((current) => [
      ...current,
      {
        name: "",
        email: "",
      },
    ]);
  }

  function removeParticipant(
    index: number
  ) {
    setParticipants((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  }

  // ==========================================================
  // CREATE / UPDATE MEETING
  // ==========================================================

  async function handleSaveMeeting(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setFormError("");

    // --------------------------------------------------------
    // Validate title
    // --------------------------------------------------------

    if (!title.trim()) {
      setFormError(
        "Please enter a meeting title."
      );

      return;
    }

    // --------------------------------------------------------
    // Validate date
    // --------------------------------------------------------

    if (!date) {
      setFormError(
        "Please select a meeting date."
      );

      return;
    }

    // --------------------------------------------------------
    // Validate duration
    // --------------------------------------------------------

    const durationMinutes =
      Number(duration);

    if (
      !duration ||
      Number.isNaN(durationMinutes) ||
      durationMinutes <= 0
    ) {
      setFormError(
        "Please enter a valid duration."
      );

      return;
    }

    // --------------------------------------------------------
    // Validate participants
    // --------------------------------------------------------

    const validParticipants =
      participants
        .filter(
          (participant) =>
            participant.name.trim()
        )
        .map((participant) => ({
          name: participant.name.trim(),
          email:
            participant.email.trim() ||
            undefined,
        }));

    if (
      validParticipants.length === 0
    ) {
      setFormError(
        "Please add at least one participant."
      );

      return;
    }

    try {
      setSaving(true);

      // ======================================================
      // EDIT EXISTING MEETING
      // ======================================================

      if (editingMeetingId !== null) {
        const updatedMeeting =
          await updateMeeting(
            editingMeetingId,
            {
              title: title.trim(),
              date: new Date(
                date
              ).toISOString(),
              duration:
                durationMinutes * 60,
            }
          );

        setMeetings(
          (currentMeetings) =>
            currentMeetings.map(
              (meeting) =>
                meeting.id ===
                editingMeetingId
                  ? {
                      ...meeting,
                      ...updatedMeeting,

                      /*
                       * Keep the existing participants
                       * because the current backend
                       * update endpoint updates meeting
                       * fields only.
                       */
                      participants:
                        meeting.participants,
                    }
                  : meeting
            )
        );
      }

      // ======================================================
      // CREATE NEW MEETING
      // ======================================================

      else {
        const newMeeting =
          await createMeeting({
            title: title.trim(),
            date: new Date(
              date
            ).toISOString(),
            duration:
              durationMinutes * 60,
            participants:
              validParticipants,
          });

        setMeetings(
          (currentMeetings) => [
            newMeeting,
            ...currentMeetings,
          ]
        );
      }

      // ======================================================
      // CLOSE MODAL
      // ======================================================

      setShowModal(false);

      setEditingMeetingId(null);

      setTitle("");

      setDate("");

      setDuration("");

      setParticipants([
        {
          name: "",
          email: "",
        },
      ]);
    } catch (error) {
      console.error(
        "Failed to save meeting:",
        error
      );

      setFormError(
        editingMeetingId !== null
          ? "Failed to update meeting. Please try again."
          : "Failed to create meeting. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // OPEN DELETE CONFIRMATION
  // ==========================================================

  function openDeleteConfirmation(
    meeting: Meeting
  ) {
    setDeleteTarget(meeting);
  }

  // ==========================================================
  // DELETE MEETING
  // ==========================================================

  async function handleDeleteMeeting() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await deleteMeeting(
        deleteTarget.id
      );

      setMeetings(
        (currentMeetings) =>
          currentMeetings.filter(
            (meeting) =>
              meeting.id !==
              deleteTarget.id
          )
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error(
        "Failed to delete meeting:",
        error
      );

      alert(
        "Failed to delete meeting. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">

      <div className="flex min-h-screen">

        {/* =====================================================
            SIDEBAR
        ====================================================== */}

        <aside className="hidden w-64 border-r border-slate-200 bg-white px-5 py-6 md:block">

          <div className="mb-10 flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              F
            </div>

            <span className="text-xl font-semibold">
              Fireflies
            </span>

          </div>

          <nav className="space-y-2">

            <div className="rounded-lg bg-slate-100 px-3 py-2.5 font-medium">
              Meetings
            </div>

            <div className="cursor-pointer rounded-lg px-3 py-2.5 text-slate-500 hover:bg-slate-50">
              Favorites
            </div>

            <div className="cursor-pointer rounded-lg px-3 py-2.5 text-slate-500 hover:bg-slate-50">
              Settings
            </div>

          </nav>

        </aside>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <section className="flex-1">

          {/* Header */}

          <header className="border-b border-slate-200 bg-white">

            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

              <div>

                <h1 className="text-2xl font-semibold">
                  Meetings
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Browse and manage your meetings
                </p>

              </div>

              <button
                type="button"
                onClick={
                  openNewMeetingModal
                }
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Plus size={16} />
                New Meeting
              </button>

            </div>

          </header>

          {/* Content */}

          <div className="mx-auto max-w-6xl px-6 py-8">

            {/* =================================================
                SEARCH / FILTER / SORT
            ================================================== */}

            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">

              {/* Search */}

              <div className="relative max-w-md flex-1">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    handleSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search meetings or participants..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />

              </div>

              {/* Filter */}

              <select
                value={filterBy}
                onChange={(e) =>
                  setFilterBy(
                    e.target.value
                  )
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="all">
                  All meetings
                </option>

                <option value="recent">
                  Recent (7 days)
                </option>

                <option value="long">
                  Long meetings (30+ min)
                </option>

                <option value="short">
                  Short meetings (&lt;30 min)
                </option>
              </select>

              {/* Sort */}

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="newest">
                  Newest first
                </option>

                <option value="oldest">
                  Oldest first
                </option>

                <option value="longest">
                  Longest first
                </option>

                <option value="shortest">
                  Shortest first
                </option>
              </select>

            </div>

            {/* =================================================
                LOADING
            ================================================== */}

            {loading && (
              <div className="space-y-3">

                {[1, 2, 3].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-slate-200 bg-white p-5"
                    >
                      <div className="animate-pulse space-y-4">

                        <div className="h-5 w-2/5 rounded bg-slate-200" />

                        <div className="flex gap-4">

                          <div className="h-4 w-24 rounded bg-slate-100" />

                          <div className="h-4 w-20 rounded bg-slate-100" />

                          <div className="h-4 w-28 rounded bg-slate-100" />

                        </div>

                      </div>
                    </div>
                  )
                )}

              </div>
            )}

            {/* =================================================
                ERROR
            ================================================== */}

            {!loading && loadError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">

                <h2 className="font-medium text-red-800">
                  Something went wrong
                </h2>

                <p className="mt-2 text-sm text-red-600">
                  {loadError}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Retry
                </button>

              </div>
            )}

            {/* =================================================
                EMPTY
            ================================================== */}

            {!loading &&
              !loadError &&
              displayedMeetings.length === 0 && (

                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">

                  <h2 className="font-medium">

                    {search ||
                    filterBy !== "all"
                      ? "No matching meetings"
                      : "No meetings yet"}

                  </h2>

                  <p className="mt-2 text-sm text-slate-500">

                    {search ||
                    filterBy !== "all"
                      ? "Try a different search or change your filters."
                      : "Create your first meeting to get started."}

                  </p>

                  {!search &&
                    filterBy ===
                      "all" && (
                      <button
                        type="button"
                        onClick={
                          openNewMeetingModal
                        }
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        <Plus size={16} />
                        Create Meeting
                      </button>
                    )}

                </div>
              )}

            {/* =================================================
                MEETING COUNT
            ================================================== */}

            {!loading &&
              !loadError &&
              displayedMeetings.length > 0 && (

                <div className="mb-3 text-sm text-slate-500">

                  Showing{" "}

                  <span className="font-medium text-slate-700">
                    {displayedMeetings.length}
                  </span>{" "}

                  {displayedMeetings.length === 1
                    ? "meeting"
                    : "meetings"}

                </div>
              )}

            {/* =================================================
                MEETINGS
            ================================================== */}

            {!loading &&
              !loadError &&
              displayedMeetings.length > 0 && (

                <div className="space-y-3">

                  {displayedMeetings.map(
                    (meeting) => (

                      <div
                        key={meeting.id}
                        className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
                      >

                        <div className="flex items-center justify-between gap-4">

                          {/* Meeting info */}

                          <a
                            href={`/meetings/${meeting.id}`}
                            className="group min-w-0 flex-1"
                          >

                            <h2 className="font-semibold text-slate-900">
                              {meeting.title}
                            </h2>

                            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">

                              <span className="flex items-center gap-1.5">

                                <CalendarDays
                                  size={15}
                                />

                                {formatDate(
                                  meeting.date
                                )}

                              </span>

                              <span className="flex items-center gap-1.5">

                                <Clock
                                  size={15}
                                />

                                {formatDuration(
                                  meeting.duration
                                )}

                              </span>

                              <span className="flex items-center gap-1.5">

                                <Users
                                  size={15}
                                />

                                {
                                  meeting
                                    .participants
                                    .length
                                }{" "}
                                participants

                              </span>

                            </div>

                          </a>

                          {/* Actions */}

                          <div className="flex shrink-0 items-center gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEditMeetingModal(
                                  meeting
                                )
                              }
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              title="Edit meeting"
                            >
                              <Pencil
                                size={17}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openDeleteConfirmation(
                                  meeting
                                )
                              }
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              title="Delete meeting"
                            >
                              <Trash2
                                size={17}
                              />
                            </button>

                            <a
                              href={`/meetings/${meeting.id}`}
                              className="rounded-lg p-2 text-slate-300 transition hover:text-slate-600"
                              title="Open meeting"
                            >
                              <ChevronRight
                                size={20}
                              />
                            </a>

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>
              )}

          </div>

        </section>

      </div>

      {/* =====================================================
          NEW / EDIT MEETING MODAL
      ====================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

              <div>

                <h2 className="text-lg font-semibold">

                  {editingMeetingId !== null
                    ? "Edit Meeting"
                    : "New Meeting"}

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {editingMeetingId !== null
                    ? "Update meeting details"
                    : "Add a meeting to your workspace"}

                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={
                handleSaveMeeting
              }
              className="space-y-5 p-6"
            >

              {/* Error */}

              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {formError}
                </div>
              )}

              {/* Title */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Meeting title
                </label>

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Product Team Weekly Meeting"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />

              </div>

              {/* Date */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Date
                </label>

                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) =>
                    setDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />

              </div>

              {/* Duration */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Duration (minutes)
                </label>

                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) =>
                    setDuration(
                      e.target.value
                    )
                  }
                  placeholder="45"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />

              </div>

              {/* Participants */}

              <div>

                <div className="mb-3 flex items-center justify-between">

                  <label className="text-sm font-medium text-slate-700">
                    Participants
                  </label>

                  <button
                    type="button"
                    onClick={
                      addParticipant
                    }
                    className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900"
                  >
                    <Plus size={15} />
                    Add participant
                  </button>

                </div>

                <div className="space-y-3">

                  {participants.map(
                    (
                      participant,
                      index
                    ) => (

                      <div
                        key={index}
                        className="rounded-lg border border-slate-200 p-3"
                      >

                        <div className="flex gap-2">

                          <input
                            value={
                              participant.name
                            }
                            onChange={(e) =>
                              updateParticipant(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Name"
                            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                          />

                          {participants.length >
                            1 && (

                            <button
                              type="button"
                              onClick={() =>
                                removeParticipant(
                                  index
                                )
                              }
                              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                              title="Remove participant"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          )}

                        </div>

                        <input
                          value={
                            participant.email
                          }
                          onChange={(e) =>
                            updateParticipant(
                              index,
                              "email",
                              e.target.value
                            )
                          }
                          placeholder="Email (optional)"
                          type="email"
                          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                        />

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingMeetingId !==
                      null
                    ? "Save Changes"
                    : "Create Meeting"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {deleteTarget && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

            <div className="p-6">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Trash2 size={19} />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                Delete meeting?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">

                Are you sure you want to delete{" "}

                <span className="font-medium text-slate-700">
                  {deleteTarget.title}
                </span>

                ? This action cannot be undone.

              </p>

            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">

              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={deleting}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteMeeting
                }
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Meeting"}
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}
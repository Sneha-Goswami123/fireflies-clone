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

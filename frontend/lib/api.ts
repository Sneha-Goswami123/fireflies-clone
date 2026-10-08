const API_URL = "http://127.0.0.1:8000";

export async function getMeetings(search = "") {
  const url = new URL(`${API_URL}/api/meetings`);

  if (search) {
    url.searchParams.set("search", search);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Failed to fetch meetings");
  }

  return response.json();
}

export async function getMeeting(id: number) {
  const response = await fetch(
    `${API_URL}/api/meetings/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch meeting");
  }

  return response.json();
}

export async function getTranscript(id: number) {
  const response = await fetch(
    `${API_URL}/api/meetings/${id}/transcript`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch transcript");
  }

  return response.json();
}

export async function getSummary(id: number) {
  const response = await fetch(
    `${API_URL}/api/meetings/${id}/summary`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch summary");
  }

  return response.json();
}

export async function getActionItems(id: number) {
  const response = await fetch(
    `${API_URL}/api/meetings/${id}/actions`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch action items");
  }

  return response.json();
}

export async function updateActionItem(
  actionId: number,
  data: {
    title?: string;
    assignee?: string;
    completed?: boolean;
  }
) {
  const response = await fetch(
    `${API_URL}/api/meetings/actions/${actionId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update action item");
  }

  return response.json();
}

export async function createMeeting(data: {
  title: string;
  date: string;
  duration: number;
  participants: {
    name: string;
    email?: string;
  }[];
}) {
  const response = await fetch(
    `${API_URL}/api/meetings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create meeting");
  }

  return response.json();
}

export async function updateMeeting(
  id: number,
  data: {
    title?: string;
    date?: string;
    duration?: number;
  }
) {
  const response = await fetch(
    `${API_URL}/api/meetings/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update meeting");
  }

  return response.json();
}

export async function deleteMeeting(id: number) {
  const response = await fetch(
    `${API_URL}/api/meetings/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete meeting");
  }

  return response.json();
}

export async function createActionItem(
  meetingId: number,
  data: {
    title: string;
    assignee?: string;
    completed?: boolean;
  }
) {
  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}/actions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create action item");
  }

  return response.json();
}

export async function deleteActionItem(
  actionId: number
) {
  const response = await fetch(
    `${API_URL}/api/meetings/actions/${actionId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete action item");
  }

  return response.json();
}

export async function createTranscriptSegment(
  meetingId: number,
  data: {
    speaker: string;
    start_time: number;
    end_time: number;
    text: string;
  }
) {
  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}/transcript`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create transcript segment");
  }

  return response.json();
}

export async function updateTranscriptSegment(
  segmentId: number,
  data: {
    speaker?: string;
    start_time?: number;
    end_time?: number;
    text?: string;
  }
) {
  const response = await fetch(
    `${API_URL}/api/meetings/transcript/${segmentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update transcript segment");
  }

  return response.json();
}

export async function deleteTranscriptSegment(
  segmentId: number
) {
  const response = await fetch(
    `${API_URL}/api/meetings/transcript/${segmentId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete transcript segment");
  }

  return response.json();
}
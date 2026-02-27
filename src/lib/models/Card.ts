export interface Card {
  id: string;
  title: string;
  type: "email" | "note" | "task" | "campaign" | "capture" | "other";
  summary: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  status: "open" | "in_progress" | "done" | "archived";
  tags: string[];
  source: "workspace" | "communication" | "capture" | "system";
}

export const mockCardList: Card[] = [
  {
    id: "1",
    title: "Project kickoff meeting notes",
    type: "note",
    summary: "Discussed project scope, timeline, and deliverables with the team.",
    createdAt: "2026-02-20T10:00:00Z",
    updatedAt: "2026-02-20T10:00:00Z",
    status: "open",
    tags: ["meeting", "project", "planning"],
    source: "workspace"
  },
  {
    id: "2",
    title: "Complete user authentication flow",
    type: "task",
    summary: "Implement OAuth2 integration and session management.",
    createdAt: "2026-02-21T14:30:00Z",
    updatedAt: "2026-02-22T09:15:00Z",
    status: "in_progress",
    tags: ["development", "auth", "backend"],
    source: "workspace"
  },
  {
    id: "3",
    title: "Q2 marketing campaign",
    type: "campaign",
    summary: "Plan and execute Q2 product launch marketing activities.",
    createdAt: "2026-02-15T09:00:00Z",
    updatedAt: "2026-02-25T16:45:00Z",
    status: "open",
    tags: ["marketing", "launch", "q2"],
    source: "communication"
  },
  {
    id: "4",
    title: "Client feedback session",
    type: "email",
    summary: "Summary of client feedback from yesterday's review meeting.",
    createdAt: "2026-02-24T11:20:00Z",
    updatedAt: "2026-02-24T11:20:00Z",
    status: "done",
    tags: ["client", "feedback", "review"],
    source: "communication"
  },
  {
    id: "5",
    title: "Quick idea: mobile dark mode",
    type: "capture",
    summary: "Users have requested dark mode for mobile app to reduce eye strain.",
    createdAt: "2026-02-26T08:45:00Z",
    updatedAt: "2026-02-26T08:45:00Z",
    status: "open",
    tags: ["mobile", "ui", "feature-request"],
    source: "capture"
  },
  {
    id: "6",
    title: "System maintenance scheduled",
    type: "other",
    summary: "Monthly system maintenance scheduled for next weekend.",
    createdAt: "2026-02-18T13:00:00Z",
    updatedAt: "2026-02-18T13:00:00Z",
    status: "open",
    tags: ["system", "maintenance", "scheduled"],
    source: "system"
  }
];
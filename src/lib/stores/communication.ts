import { writable, type Writable } from 'svelte/store';
import type { Card } from '$lib/models/Card';

// Communication-specific cards (subset of main cards with type = "email" or "campaign")
export const communicationCards: Writable<Card[]> = writable([
  {
    id: "comm-1",
    title: "Welcome sequence for new subscribers",
    type: "campaign",
    summary: "Automated email sequence for new newsletter subscribers with onboarding content.",
    createdAt: "2026-02-10T09:00:00Z",
    updatedAt: "2026-02-25T14:30:00Z",
    status: "in_progress",
    tags: ["marketing", "onboarding", "automation"],
    source: "communication"
  },
  {
    id: "comm-2",
    title: "Client: Project update request",
    type: "email",
    summary: "Email thread with client requesting updates on current project milestones.",
    createdAt: "2026-02-22T11:15:00Z",
    updatedAt: "2026-02-24T16:45:00Z",
    status: "open",
    tags: ["client", "update", "urgent"],
    source: "communication"
  },
  {
    id: "comm-3",
    title: "Team weekly sync agenda",
    type: "email",
    summary: "Weekly team sync agenda and action items from last meeting.",
    createdAt: "2026-02-23T10:00:00Z",
    updatedAt: "2026-02-23T10:00:00Z",
    status: "done",
    tags: ["team", "meeting", "agenda"],
    source: "communication"
  },
  {
    id: "comm-4",
    title: "Q2 product launch announcement",
    type: "campaign",
    summary: "Email campaign announcing new product features launching in Q2.",
    createdAt: "2026-02-15T14:00:00Z",
    updatedAt: "2026-02-20T11:20:00Z",
    status: "open",
    tags: ["product", "launch", "announcement"],
    source: "communication"
  },
  {
    id: "comm-5",
    title: "Vendor partnership inquiry",
    type: "email",
    summary: "Initial inquiry from potential vendor about partnership opportunities.",
    createdAt: "2026-02-26T09:30:00Z",
    updatedAt: "2026-02-26T09:30:00Z",
    status: "open",
    tags: ["vendor", "partnership", "inquiry"],
    source: "communication"
  }
]);

// Selected thread ID
export const selectedThreadId: Writable<string | null> = writable(null);

// Helper functions
export function selectThread(id: string): void {
  selectedThreadId.set(id);
}

export function clearSelectedThread(): void {
  selectedThreadId.set(null);
}

// Derived store for selected thread
import { derived } from 'svelte/store';
export const selectedThread = derived(
  [communicationCards, selectedThreadId],
  ([$communicationCards, $selectedThreadId]) => {
    if (!$selectedThreadId) return null;
    return $communicationCards.find(card => card.id === $selectedThreadId) || null;
  }
);
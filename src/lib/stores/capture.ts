import { writable, type Writable } from 'svelte/store';
import type { Card } from '$lib/models/Card';
import { cards, updateCard } from './cards';

// Capture-specific cards (type = "capture")
export const captureCards: Writable<Card[]> = writable([
  {
    id: "capture-1",
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
    id: "capture-2",
    title: "Meeting note: team brainstorming",
    type: "capture",
    summary: "Brainstorming session notes about improving user onboarding flow.",
    createdAt: "2026-02-25T15:30:00Z",
    updatedAt: "2026-02-25T15:30:00Z",
    status: "open",
    tags: ["meeting", "onboarding", "ideas"],
    source: "capture"
  },
  {
    id: "capture-3",
    title: "Reference: API rate limits",
    type: "capture",
    summary: "Notes on API rate limits for third-party integrations we're considering.",
    createdAt: "2026-02-24T11:20:00Z",
    updatedAt: "2026-02-24T11:20:00Z",
    status: "done",
    tags: ["api", "reference", "integration"],
    source: "capture"
  }
]);

// Helper function to add a new capture card
export function addCaptureCard(input: { title: string; summary: string; tags?: string[] }): void {
  const newCard: Card = {
    id: `capture-${Date.now()}`,
    title: input.title,
    type: "capture" as const,
    summary: input.summary,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "open",
    tags: input.tags || [],
    source: "capture"
  };
  
  // Add to capture cards store
  captureCards.update(cards => [newCard, ...cards]);
  
  // Also add to main cards store for Workspace visibility
  cards.update(mainCards => [newCard, ...mainCards]);
}

// Helper function to remove a capture card
export function removeCaptureCard(id: string): void {
  captureCards.update(cards => cards.filter(card => card.id !== id));
  
  // Also remove from main cards store
  cards.update(mainCards => mainCards.filter(card => card.id !== id));
}
import { writable, derived, type Writable } from 'svelte/store';
import type { Card } from '$lib/models/Card';
import { mockCardList } from '$lib/models/Card';

// Main cards store
export const cards: Writable<Card[]> = writable([...mockCardList]);

// Selected card ID store
const selectedCardId: Writable<string | null> = writable(null);

// Helper functions
export function setCards(newCards: Card[]): void {
  cards.set(newCards);
}

export function updateCard(updatedCard: Card): void {
  cards.update(currentCards => 
    currentCards.map(card => 
      card.id === updatedCard.id ? updatedCard : card
    )
  );
}

export function selectCard(id: string): void {
  selectedCardId.set(id);
}

export function clearSelectedCard(): void {
  selectedCardId.set(null);
}

// Derived store for selected card
export const selectedCard = derived(
  [cards, selectedCardId],
  ([$cards, $selectedCardId]) => {
    if (!$selectedCardId) return null;
    return $cards.find(card => card.id === $selectedCardId) || null;
  }
);
import { writable, derived, type Writable, type Readable } from 'svelte/store';
import type { Card } from '$lib/models/Card';
import { cards } from './cards';
import { captureCards } from './capture';
import { communicationCards } from './communication';

// Unified content store that aggregates all cards from all subsystems
export const unifiedCards: Readable<Card[]> = derived(
  [cards, captureCards, communicationCards],
  ([$cards, $captureCards, $communicationCards]) => {
    // Combine all cards, removing duplicates by ID
    const allCards = [...$cards, ...$captureCards, ...$communicationCards];
    const uniqueIds = new Set();
    return allCards.filter(card => {
      if (uniqueIds.has(card.id)) return false;
      uniqueIds.add(card.id);
      return true;
    });
  }
);

// Unified search across all cards
export function searchCards(query: string): Card[] {
  // This would be implemented with proper search logic
  // For now, return empty array - implementation would use the derived store
  return [];
}

// Unified filter by type
export const cardsByType = derived(unifiedCards, $cards => {
  const byType: Record<string, Card[]> = {};
  $cards.forEach(card => {
    if (!byType[card.type]) {
      byType[card.type] = [];
    }
    byType[card.type].push(card);
  });
  return byType;
});

// Unified statistics
export const contentStats = derived(unifiedCards, $cards => {
  const total = $cards.length;
  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  
  $cards.forEach(card => {
    // Count by type
    byType[card.type] = (byType[card.type] || 0) + 1;
    
    // Count by status
    byStatus[card.status] = (byStatus[card.status] || 0) + 1;
  });
  
  return {
    total,
    byType,
    byStatus,
    lastUpdated: new Date().toISOString()
  };
});

// Unified card operations
export function getCardById(id: string): Card | undefined {
  // This would search across all stores
  // For now, return undefined - implementation would use the derived store
  return undefined;
}

export function updateCardAcrossStores(updatedCard: Card): void {
  // This would update the card in all relevant stores
  // For now, just log - implementation would dispatch to appropriate stores
  console.log('Updating card across stores:', updatedCard);
}
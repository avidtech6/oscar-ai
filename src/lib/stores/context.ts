import { writable, derived, type Writable } from 'svelte/store';
import type { ContextFilter } from '$lib/models/Context';
import { defaultContextFilters } from '$lib/models/Context';
import type { Card } from '$lib/models/Card';

// Active context filters store
export const activeFilters: Writable<ContextFilter[]> = writable([...defaultContextFilters]);

// Helper functions
export function addFilter(filter: ContextFilter): void {
  activeFilters.update(filters => {
    // Avoid duplicates
    if (!filters.some(f => f.id === filter.id)) {
      return [...filters, filter];
    }
    return filters;
  });
}

export function removeFilter(id: string): void {
  activeFilters.update(filters => filters.filter(f => f.id !== id));
}

export function clearFilters(): void {
  activeFilters.set([]);
}

// Derived store for filtered cards
export const filteredCards = derived(
  [activeFilters],
  ([$activeFilters]) => {
    // This would filter cards based on active filters
    // For now, return a simple filtered list
    // In a real implementation, this would filter from the cards store
    return [];
  }
);

// Helper to add a dummy filter (for demonstration)
export function addDummyFilter(): void {
  const dummyFilter: ContextFilter = {
    id: `dummy-${Date.now()}`,
    label: "Tag: priority",
    type: "tag",
    value: "priority"
  };
  addFilter(dummyFilter);
}
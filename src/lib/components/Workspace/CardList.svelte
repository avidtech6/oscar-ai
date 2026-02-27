<script lang="ts">
  import { cards, selectedCard, selectCard } from '$lib/stores/cards';
  import { activeFilters } from '$lib/stores/context';
  import CardListItem from './CardListItem.svelte';
  import type { Card } from '$lib/models/Card';
  
  // Simple filtering logic
  $: filteredCards = filterCards($cards, $activeFilters);
  
  function filterCards(cards: Card[], filters: any[]): Card[] {
    if (filters.length === 0) return cards;
    
    // Simple implementation: filter by status if status filters exist
    const statusFilters = filters.filter(f => f.type === 'status');
    const tagFilters = filters.filter(f => f.type === 'tag');
    const sourceFilters = filters.filter(f => f.type === 'source');
    
    return cards.filter(card => {
      // Status filter
      if (statusFilters.length > 0) {
        const matchesStatus = statusFilters.some(filter => card.status === filter.value);
        if (!matchesStatus) return false;
      }
      
      // Tag filter
      if (tagFilters.length > 0) {
        const matchesTag = tagFilters.some(filter => card.tags.includes(filter.value));
        if (!matchesTag) return false;
      }
      
      // Source filter
      if (sourceFilters.length > 0) {
        const matchesSource = sourceFilters.some(filter => card.source === filter.value);
        if (!matchesSource) return false;
      }
      
      return true;
    });
  }
  
  function handleCardClick(cardId: string) {
    selectCard(cardId);
  }
</script>

<div class="card-list">
  <div class="card-list-header">
    <h3 class="text-lg font-semibold">Cards ({filteredCards.length})</h3>
    <div class="filter-info">
      {#if $activeFilters.length > 0}
        <span class="text-sm text-gray-600">
          Filtered by {$activeFilters.length} filter{$activeFilters.length === 1 ? '' : 's'}
        </span>
      {/if}
    </div>
  </div>
  
  <div class="cards-container">
    {#each filteredCards as card (card.id)}
      <CardListItem 
        {card} 
        selected={$selectedCard?.id === card.id}
        on:click={() => handleCardClick(card.id)}
      />
    {/each}
    
    {#if filteredCards.length === 0}
      <div class="empty-state">
        <p class="text-gray-500">No cards match the current filters</p>
        <p class="text-gray-400 text-sm">Try adjusting your filters or create a new card</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .card-list {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .card-list-header {
    padding: 0.5rem 0 1rem 0;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 1rem;
  }
  
  .filter-info {
    margin-top: 0.25rem;
  }
  
  .cards-container {
    flex: 1;
    overflow-y: auto;
  }
  
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    border: 1px dashed #d1d5db;
    border-radius: 0.5rem;
    margin-top: 1rem;
  }
</style>
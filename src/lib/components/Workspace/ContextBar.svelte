<script lang="ts">
  import { activeFilters, removeFilter, addDummyFilter } from '$lib/stores/context';
  import type { ContextFilter } from '$lib/models/Context';
</script>

<div class="context-bar">
  <div class="context-header">
    <h3 class="text-lg font-semibold mb-2">Context Filters</h3>
    <button 
      on:click={addDummyFilter}
      class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition"
    >
      + Add filter
    </button>
  </div>
  
  <div class="filters-list">
    {#each $activeFilters as filter (filter.id)}
      <div class="filter-chip">
        <span class="filter-label">{filter.label}</span>
        <button 
          on:click={() => removeFilter(filter.id)}
          class="filter-remove"
          aria-label={`Remove ${filter.label} filter`}
        >
          ×
        </button>
      </div>
    {/each}
    
    {#if $activeFilters.length === 0}
      <div class="empty-filters">
        <p class="text-gray-500 text-sm">No active filters</p>
        <p class="text-gray-400 text-xs">Add filters to narrow down cards</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .context-bar {
    padding: 0.5rem;
  }
  
  .context-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .filters-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-chip {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .filter-label {
    color: #374151;
  }
  
  .filter-remove {
    color: #9ca3af;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    line-height: 1;
    padding: 0 0.25rem;
  }
  
  .filter-remove:hover {
    color: #6b7280;
  }
  
  .empty-filters {
    text-align: center;
    padding: 1rem;
    border: 1px dashed #d1d5db;
    border-radius: 0.375rem;
  }
</style>
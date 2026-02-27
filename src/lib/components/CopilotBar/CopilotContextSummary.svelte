<script lang="ts">
  import { selectedCard } from '$lib/stores/cards';
  import { activeFilters } from '$lib/stores/context';
</script>

<div class="context-summary">
  <div class="summary-item">
    <span class="summary-label">Selected:</span>
    <span class="summary-value">
      {#if $selectedCard}
        {$selectedCard.title}
      {:else}
        None
      {/if}
    </span>
  </div>
  
  <div class="summary-item">
    <span class="summary-label">Filters:</span>
    <span class="summary-value">
      {$activeFilters.length} active
    </span>
  </div>
</div>

<style>
  .context-summary {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
  }
  
  .summary-item {
    display: flex;
    gap: 0.5rem;
  }
  
  .summary-label {
    color: #6b7280;
    font-weight: 500;
    min-width: 60px;
  }
  
  .summary-value {
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
  }
</style>
<script lang="ts">
  import type { Card } from '$lib/models/Card';
  
  export let card: Card;
  export let selected: boolean = false;
</script>

<div class="card-list-item {selected ? 'selected' : ''}" on:click>
  <div class="card-header">
    <div class="card-title-row">
      <h4 class="card-title">{card.title}</h4>
      <span class="card-type">{card.type}</span>
    </div>
    <div class="card-status {card.status}">
      {card.status.replace('_', ' ')}
    </div>
  </div>
  
  <p class="card-summary">{card.summary}</p>
  
  <div class="card-footer">
    <div class="card-tags">
      {#each card.tags as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
    <div class="card-date">
      {new Date(card.updatedAt).toLocaleDateString()}
    </div>
  </div>
</div>

<style>
  .card-list-item {
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    margin-bottom: 0.75rem;
    cursor: pointer;
    background-color: white;
    transition: all 0.2s ease;
  }
  
  .card-list-item:hover {
    border-color: #3b82f6;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .card-list-item.selected {
    border-color: #3b82f6;
    background-color: #eff6ff;
    border-width: 2px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }
  
  .card-title-row {
    flex: 1;
  }
  
  .card-title {
    font-weight: 600;
    font-size: 1rem;
    margin: 0 0 0.25rem 0;
    color: #111827;
  }
  
  .card-type {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .card-status {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    font-weight: 500;
    white-space: nowrap;
  }
  
  .card-status.open {
    background-color: #dbeafe;
    color: #1e40af;
  }
  
  .card-status.in_progress {
    background-color: #fef3c7;
    color: #92400e;
  }
  
  .card-status.done {
    background-color: #d1fae5;
    color: #065f46;
  }
  
  .card-status.archived {
    background-color: #f3f4f6;
    color: #374151;
  }
  
  .card-summary {
    font-size: 0.875rem;
    color: #4b5563;
    margin: 0.5rem 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
  }
  
  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .tag {
    font-size: 0.75rem;
    background-color: #f3f4f6;
    color: #4b5563;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
  }
  
  .card-date {
    font-size: 0.75rem;
    color: #9ca3af;
  }
</style>
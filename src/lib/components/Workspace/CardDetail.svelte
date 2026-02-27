<script lang="ts">
  import { selectedCard, updateCard } from '$lib/stores/cards';
  import EmptyState from './EmptyState.svelte';
  import type { Card } from '$lib/models/Card';
  import { summariseCard } from '$lib/services/aiActions';
  
  let newTag = '';
  let isSummarising = false;
  
  async function handleSummarise() {
    if (!$selectedCard) return;
    
    isSummarising = true;
    try {
      const summary = await summariseCard($selectedCard);
      const updatedCard = {
        ...$selectedCard,
        summary,
        updatedAt: new Date().toISOString()
      };
      updateCard(updatedCard);
    } catch (error) {
      console.error('Failed to summarise card:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      isSummarising = false;
    }
  }
  
  function handleStatusChange(status: Card['status']) {
    if ($selectedCard) {
      const updatedCard = {
        ...$selectedCard,
        status,
        updatedAt: new Date().toISOString()
      };
      updateCard(updatedCard);
    }
  }
  
  function handleAddTag() {
    if (!newTag.trim() || !$selectedCard) return;
    
    const updatedCard = {
      ...$selectedCard,
      tags: [...$selectedCard.tags, newTag.trim()],
      updatedAt: new Date().toISOString()
    };
    updateCard(updatedCard);
    newTag = '';
  }
  
  function handleRemoveTag(tagToRemove: string) {
    if (!$selectedCard) return;
    
    const updatedCard = {
      ...$selectedCard,
      tags: $selectedCard.tags.filter(tag => tag !== tagToRemove),
      updatedAt: new Date().toISOString()
    };
    updateCard(updatedCard);
  }
</script>

{#if !$selectedCard}
  <EmptyState />
{:else}
  <div class="card-detail">
    <div class="card-detail-header">
      <h2 class="card-detail-title">{$selectedCard.title}</h2>
      <div class="card-type-badge">{$selectedCard.type}</div>
    </div>
    
    <div class="card-meta">
      <div class="meta-item">
        <span class="meta-label">Status:</span>
        <div class="status-controls">
          {#each ['open', 'in_progress', 'done', 'archived'] as status}
            <button
              class="status-button {status} {status === $selectedCard.status ? 'active' : ''}"
              on:click={() => handleStatusChange(status as Card['status'])}
            >
              {status.replace('_', ' ')}
            </button>
          {/each}
        </div>
      </div>
      
      <div class="meta-item">
        <span class="meta-label">Source:</span>
        <span class="meta-value">{$selectedCard.source}</span>
      </div>
      
      <div class="meta-item">
        <span class="meta-label">Created:</span>
        <span class="meta-value">{new Date($selectedCard.createdAt).toLocaleString()}</span>
      </div>
      
      <div class="meta-item">
        <span class="meta-label">Updated:</span>
        <span class="meta-value">{new Date($selectedCard.updatedAt).toLocaleString()}</span>
      </div>
    </div>
    
    <div class="card-summary-section">
      <div class="flex items-center justify-between mb-2">
        <h3 class="section-title">Summary</h3>
        <button
          on:click={handleSummarise}
          disabled={isSummarising}
          class="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSummarising ? 'Summarising...' : 'AI Summarise'}
        </button>
      </div>
      <p class="card-summary-text">{$selectedCard.summary}</p>
    </div>
    
    <div class="card-tags-section">
      <h3 class="section-title">Tags</h3>
      <div class="tags-container">
        {#each $selectedCard.tags as tag}
          <div class="tag-item">
            <span class="tag-text">{tag}</span>
            <button 
              on:click={() => handleRemoveTag(tag)}
              class="tag-remove"
              aria-label={`Remove ${tag} tag`}
            >
              ×
            </button>
          </div>
        {/each}
      </div>
      
      <div class="add-tag-form">
        <input
          type="text"
          bind:value={newTag}
          placeholder="Add a tag..."
          class="tag-input"
          on:keydown={(e) => e.key === 'Enter' && handleAddTag()}
        />
        <button 
          on:click={handleAddTag}
          class="add-tag-button"
          disabled={!newTag.trim()}
        >
          Add
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .card-detail {
    padding: 1rem;
  }
  
  .card-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .card-detail-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
    flex: 1;
  }
  
  .card-type-badge {
    font-size: 0.75rem;
    background-color: #f3f4f6;
    color: #6b7280;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .card-meta {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .meta-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
  }
  
  .meta-value {
    font-size: 0.875rem;
    color: #111827;
  }
  
  .status-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }
  
  .status-button {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    border: 1px solid #e5e7eb;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .status-button:hover {
    border-color: #9ca3af;
  }
  
  .status-button.active {
    font-weight: 600;
  }
  
  .status-button.open.active {
    background-color: #dbeafe;
    border-color: #3b82f6;
    color: #1e40af;
  }
  
  .status-button.in_progress.active {
    background-color: #fef3c7;
    border-color: #f59e0b;
    color: #92400e;
  }
  
  .status-button.done.active {
    background-color: #d1fae5;
    border-color: #10b981;
    color: #065f46;
  }
  
  .status-button.archived.active {
    background-color: #f3f4f6;
    border-color: #9ca3af;
    color: #374151;
  }
  
  .card-summary-section {
    margin-bottom: 1.5rem;
  }
  
  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.75rem 0;
  }
  
  .card-summary-text {
    font-size: 0.875rem;
    line-height: 1.5;
    color: #4b5563;
    margin: 0;
  }
  
  .card-tags-section {
    margin-bottom: 1.5rem;
  }
  
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .tag-item {
    display: flex;
    align-items: center;
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .tag-text {
    color: #374151;
    margin-right: 0.25rem;
  }
  
  .tag-remove {
    color: #9ca3af;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0 0.125rem;
  }
  
  .tag-remove:hover {
    color: #6b7280;
  }
  
  .add-tag-form {
    display: flex;
    gap: 0.5rem;
  }
  
  .tag-input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  
  .tag-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .add-tag-button {
    padding: 0.5rem 1rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .add-tag-button:hover:not(:disabled) {
    background-color: #2563eb;
  }
  
  .add-tag-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
</style>
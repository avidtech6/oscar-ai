<script lang="ts">
  import type { MediaItem } from './MediaTypes';

  export let item: MediaItem;
  export let insertMedia: (item: MediaItem) => void;
  export let deleteMedia: (id: string) => void;

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString();
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
</script>

<div class="gallery-item {item.type}">
  <div class="item-preview">
    {#if item.type === 'photo' || item.type === 'diagram' || item.type === 'screenshot'}
      {#if item.thumbnail}
        <img src={item.thumbnail} alt="Preview" class="thumbnail" />
      {:else}
        <div class="thumbnail-placeholder">🖼️</div>
      {/if}
    {:else if item.type === 'audio'}
      <div class="audio-preview">🎵</div>
    {:else}
      <div class="generic-preview">📄</div>
    {/if}
  </div>

  <div class="item-info">
    <div class="item-type">{item.type}</div>
    <div class="item-tags">
      {#each item.context.tags.slice(0, 3) as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
    <div class="item-meta">
      <span class="meta-date">{formatDate(item.createdAt)}</span>
      <span class="meta-size">{formatSize(item.metadata.size)}</span>
    </div>
  </div>

  <div class="item-actions">
    <button
      class="action-button insert"
      on:click={() => insertMedia(item)}
      title="Insert into document"
    >
      Insert
    </button>
    <button
      class="action-button delete"
      on:click={() => deleteMedia(item.id)}
      title="Delete"
    >
      Delete
    </button>
  </div>
</div>

<style>
  .gallery-item {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .gallery-item:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .item-preview {
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-bottom: 1px solid #e5e7eb;
  }

  .thumbnail {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .thumbnail-placeholder,
  .audio-preview,
  .generic-preview {
    font-size: 2rem;
    opacity: 0.7;
  }

  .item-info {
    padding: 0.5rem;
  }

  .item-type {
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }

  .item-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.125rem;
    margin-bottom: 0.5rem;
  }

  .tag {
    background: #e5e7eb;
    color: #374151;
    font-size: 0.625rem;
    padding: 0.125rem 0.25rem;
    border-radius: 2px;
  }

  .item-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.625rem;
    color: #9ca3af;
  }

  .item-actions {
    display: flex;
    border-top: 1px solid #e5e7eb;
  }

  .action-button {
    flex: 1;
    background: white;
    border: none;
    padding: 0.375rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-button.insert {
    color: #3b82f6;
    border-right: 1px solid #e5e7eb;
  }

  .action-button.insert:hover {
    background: #eff6ff;
  }

  .action-button.delete {
    color: #ef4444;
  }

  .action-button.delete:hover {
    background: #fef2f2;
  }
</style>
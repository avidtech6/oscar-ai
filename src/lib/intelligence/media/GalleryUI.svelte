<script lang="ts">
  import { galleryDB } from './GalleryDB';
  import { mediaEventBus } from './MediaEventBus';
  import type { MediaItem, MediaType } from './MediaTypes';
  import { onMount } from 'svelte';

  let mediaItems = $state<MediaItem[]>([]);
  let loading = $state(false);
  let filterType = $state<MediaType | 'all'>('all');
  let searchQuery = $state('');

  onMount(() => {
    refreshGallery();
    mediaEventBus.on('galleryUpdated', refreshGallery);
    return () => {
      mediaEventBus.off('galleryUpdated', refreshGallery);
    };
  });

  async function refreshGallery() {
    loading = true;
    try {
      const query = filterType === 'all' ? {} : { type: filterType };
      mediaItems = await galleryDB.queryMedia(query);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      loading = false;
    }
  }

  function filteredItems() {
    let items = mediaItems;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.context.tags.some(tag => tag.toLowerCase().includes(q)) ||
        item.context.page.toLowerCase().includes(q)
      );
    }
    return items;
  }

  async function deleteMedia(id: string) {
    if (!confirm('Delete this media item?')) return;
    try {
      await galleryDB.deleteMedia(id);
      mediaItems = mediaItems.filter(item => item.id !== id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  function insertMedia(item: MediaItem) {
    mediaEventBus.emit('mediaInserted', {
      placement: {
        itemId: 'current',
        mediaId: item.id,
        position: 'after',
      },
    });
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString();
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
</script>

<div class="gallery-ui">
  <div class="gallery-header">
    <h3 class="gallery-title">Media Gallery</h3>
    <div class="gallery-stats">
      {mediaItems.length} item{mediaItems.length === 1 ? '' : 's'}
    </div>
  </div>

  <div class="gallery-controls">
    <div class="filter-row">
      <div class="filter-buttons">
        <button
          class="filter-button {filterType === 'all' ? 'active' : ''}"
          on:click={() => {
            filterType = 'all';
            refreshGallery();
          }}
        >
          All
        </button>
        <button
          class="filter-button {filterType === 'photo' ? 'active' : ''}"
          on:click={() => {
            filterType = 'photo';
            refreshGallery();
          }}
        >
          Photos
        </button>
        <button
          class="filter-button {filterType === 'diagram' ? 'active' : ''}"
          on:click={() => {
            filterType = 'diagram';
            refreshGallery();
          }}
        >
          Diagrams
        </button>
        <button
          class="filter-button {filterType === 'audio' ? 'active' : ''}"
          on:click={() => {
            filterType = 'audio';
            refreshGallery();
          }}
        >
          Voice Notes
        </button>
      </div>

      <div class="search-box">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search tags or page..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>
    </div>
  </div>

  {#if loading}
    <div class="loading">Loading gallery...</div>
  {:else if filteredItems().length === 0}
    <div class="empty-gallery">
      <div class="empty-icon">🖼️</div>
      <p>No media items found.</p>
      <p class="empty-hint">Add images, voice notes, or screenshots via the prompt box.</p>
    </div>
  {:else}
    <div class="gallery-grid">
      {#each filteredItems() as item}
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
      {/each}
    </div>
  {/if}
</div>

<style>
  .gallery-ui {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    max-height: 500px;
    overflow-y: auto;
  }

  .gallery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .gallery-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }

  .gallery-stats {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .gallery-controls {
    margin-bottom: 1rem;
  }

  .filter-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .filter-buttons {
    display: flex;
    gap: 0.25rem;
  }

  .filter-button {
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-button:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  .filter-button.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .search-box {
    position: relative;
    flex: 1;
    max-width: 300px;
  }

  .search-input {
    width: 100%;
    padding: 0.375rem 2rem 0.375rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.75rem;
    color: #374151;
  }

  .search-icon {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    font-size: 0.75rem;
  }

  .loading,
  .empty-gallery {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .empty-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .empty-hint {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 0.25rem;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }

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
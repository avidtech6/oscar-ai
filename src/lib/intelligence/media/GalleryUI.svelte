<script lang="ts">
  import { galleryDB } from './GalleryDB';
  import { mediaEventBus } from './MediaEventBus';
  import type { MediaItem, MediaType } from './MediaTypes';
  import { onMount } from 'svelte';
  import GalleryHeader from './GalleryHeader.svelte';
  import GalleryControls from './GalleryControls.svelte';
  import GalleryGrid from './GalleryGrid.svelte';

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
</script>

<div class="gallery-ui">
  <GalleryHeader mediaItemsCount={mediaItems.length} />

  <GalleryControls
    bind:filterType
    bind:searchQuery
    {refreshGallery}
  />

  {#if loading}
    <div class="loading">Loading gallery...</div>
  {:else if filteredItems().length === 0}
    <div class="empty-gallery">
      <div class="empty-icon">🖼️</div>
      <p>No media items found.</p>
      <p class="empty-hint">Add images, voice notes, or screenshots via the prompt box.</p>
    </div>
  {:else}
    <GalleryGrid
      items={filteredItems()}
      {insertMedia}
      {deleteMedia}
    />
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
</style>
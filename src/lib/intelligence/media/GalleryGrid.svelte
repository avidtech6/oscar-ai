<script lang="ts">
  import type { MediaItem } from './MediaTypes';
  import GalleryItem from './GalleryItem.svelte';

  export let items: MediaItem[];
  export let insertMedia: (item: MediaItem) => void;
  export let deleteMedia: (id: string) => void;
</script>

<div class="gallery-grid">
  {#each items as item}
    <GalleryItem {item} {insertMedia} {deleteMedia} />
  {/each}
</div>

<style>
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }
</style>
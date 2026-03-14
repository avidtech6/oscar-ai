<script lang="ts">
  export let mediaItemsCount: number;
</script>

<div class="gallery-header">
  <h3 class="gallery-title">Media Gallery</h3>
  <div class="gallery-stats">
    {mediaItemsCount} item{mediaItemsCount === 1 ? '' : 's'}
  </div>
</div>

<style>
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
</style>
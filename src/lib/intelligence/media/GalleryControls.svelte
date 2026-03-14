<script lang="ts">
  import type { MediaType } from './MediaTypes';

  export let filterType: MediaType | 'all';
  export let searchQuery: string;
  export let refreshGallery: () => void;

  function setFilter(type: MediaType | 'all') {
    filterType = type;
    refreshGallery();
  }
</script>

<div class="gallery-controls">
  <div class="filter-row">
    <div class="filter-buttons">
      <button
        class="filter-button {filterType === 'all' ? 'active' : ''}"
        on:click={() => setFilter('all')}
      >
        All
      </button>
      <button
        class="filter-button {filterType === 'photo' ? 'active' : ''}"
        on:click={() => setFilter('photo')}
      >
        Photos
      </button>
      <button
        class="filter-button {filterType === 'diagram' ? 'active' : ''}"
        on:click={() => setFilter('diagram')}
      >
        Diagrams
      </button>
      <button
        class="filter-button {filterType === 'audio' ? 'active' : ''}"
        on:click={() => setFilter('audio')}
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

<style>
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
</style>
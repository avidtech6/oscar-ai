<script lang="ts">
  import { rightPanelStore } from '$lib/stores/rightPanelStore';
  
  // Default content when no specific panel is open
  const defaultContent = {
    title: 'Details',
    content: 'Select an item to view details here.'
  };
</script>

<div class="right-panel" class:open={$rightPanelStore.isOpen}>
  <div class="right-panel-header">
    <div class="right-panel-title">
      {$rightPanelStore.title || defaultContent.title}
    </div>
    <button
      class="right-panel-close"
      on:click={() => rightPanelStore.close()}
      aria-label="Close panel"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
  
  <div class="right-panel-content">
    {#if $rightPanelStore.content}
      <div class="right-panel-custom-content">
        {@html $rightPanelStore.content}
      </div>
    {:else if $rightPanelStore.component}
      <svelte:component this={$rightPanelStore.component} {...$rightPanelStore.props} />
    {:else}
      <div class="right-panel-default">
        <div class="text-gray-500 text-sm">
          {defaultContent.content}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .right-panel {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100vh;
    background: white;
    border-left: 1px solid #e5e7eb;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 2; /* According to Module 1: content=1, right panel=2, Ask Oscar bar=3 */
    transition: right 0.3s ease;
    display: flex;
    flex-direction: column;
  }
  
  .right-panel.open {
    right: 0;
  }
  
  .right-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
    flex-shrink: 0;
  }
  
  .right-panel-title {
    font-weight: 600;
    color: #111827;
    font-size: 1rem;
  }
  
  .right-panel-close {
    padding: 0.5rem;
    color: #6b7280;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
  }
  
  .right-panel-close:hover {
    background-color: #f3f4f6;
    color: #374151;
  }
  
  .right-panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }
  
  .right-panel-default {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  
  .right-panel-custom-content {
    height: 100%;
  }
  
  /* Ensure right panel doesn't overlap Ask Oscar bar */
  @media (min-width: 1024px) {
    .right-panel {
      bottom: 64px; /* Height of Ask Oscar bar */
    }
  }
  
  /* Mobile/tablet portrait: hide right panel */
  @media (max-width: 1023px) {
    .right-panel {
      display: none;
    }
  }
</style>
<script lang="ts">
  import ContextBar from './ContextBar.svelte';
  import CardList from './CardList.svelte';
  import ContextPills from '$lib/components/layout/ContextPills.svelte';
  import { rightPanelStore } from '$lib/stores/rightPanelStore';
  import { selectedCard } from '$lib/stores/cards';
  
  // When a card is selected, open it in the right panel
  $: if ($selectedCard) {
    rightPanelStore.open({
      title: $selectedCard.title,
      content: `Selected: ${$selectedCard.title}`
    });
  } else {
    // If no card selected, ensure right panel is closed or shows default
    rightPanelStore.close();
  }
  
  // Navigation rail state
  let isNavigationRail = $selectedCard !== null;
</script>

<div class="workspace-shell">
  <div class="workspace-layout">
    <!-- Left: ContextBar -->
    <div class="workspace-left">
      <ContextBar />
    </div>
    
    <!-- Middle: CardList becomes navigation rail when item is selected -->
    <div class="workspace-middle" class:navigation-rail={isNavigationRail}>
      {#if isNavigationRail}
        <div class="navigation-rail-header">
          <h3 class="text-lg font-semibold">Navigation Rail</h3>
          <div class="text-sm text-gray-500">
            Showing siblings in current context
          </div>
        </div>
        <!-- In a real implementation, this would show sibling cards -->
        <div class="navigation-rail-content">
          <CardList />
        </div>
      {:else}
        <!-- Normal CardList view -->
        <CardList />
      {/if}
    </div>
    
    <!-- Right: Context Pills for domain switching -->
    <div class="workspace-right-pills">
      <ContextPills />
    </div>
  </div>
</div>

<style>
  .workspace-shell {
    height: 100%;
    width: 100%;
  }
  
  .workspace-layout {
    display: flex;
    height: 100%;
    gap: 1rem;
    padding: 1rem;
  }
  
  .workspace-left {
    flex: 0 0 250px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
  }
  
  .workspace-middle {
    flex: 1;
    min-width: 300px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
    overflow-y: auto;
    transition: all 0.3s ease;
  }
  
  .workspace-middle.navigation-rail {
    flex: 0 0 350px;
    min-width: 350px;
    background-color: #f9fafb;
    border-radius: 0.5rem;
    padding: 1rem;
  }
  
  .navigation-rail-header {
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .navigation-rail-content {
    height: calc(100% - 4rem);
    overflow-y: auto;
  }
  
  .workspace-right-pills {
    flex: 0 0 300px;
    min-width: 300px;
    overflow-y: auto;
  }
  
  /* Responsive: stack on smaller screens */
  @media (max-width: 1024px) {
    .workspace-layout {
      flex-direction: column;
    }
    
    .workspace-left,
    .workspace-middle,
    .workspace-right-pills {
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
      padding-right: 0;
      padding-bottom: 1rem;
      flex: none;
      width: 100%;
    }
    
    .workspace-left {
      order: 1;
    }
    
    .workspace-middle {
      order: 2;
    }
    
    .workspace-right-pills {
      order: 3;
    }
    
    .workspace-middle.navigation-rail {
      flex: none;
      width: 100%;
    }
  }
</style>
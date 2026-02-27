<script lang="ts">
  import ContextBar from './ContextBar.svelte';
  import CardList from './CardList.svelte';
  import CardDetail from './CardDetail.svelte';
</script>

<div class="workspace-shell">
  <div class="workspace-layout">
    <!-- Left: ContextBar -->
    <div class="workspace-left">
      <ContextBar />
    </div>
    
    <!-- Middle: CardList -->
    <div class="workspace-middle">
      <CardList />
    </div>
    
    <!-- Right: CardDetail -->
    <div class="workspace-right">
      <CardDetail />
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
  }
  
  .workspace-right {
    flex: 1;
    min-width: 350px;
    overflow-y: auto;
  }
  
  /* Responsive: stack on smaller screens */
  @media (max-width: 1024px) {
    .workspace-layout {
      flex-direction: column;
    }
    
    .workspace-left,
    .workspace-middle,
    .workspace-right {
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
    
    .workspace-right {
      order: 3;
    }
  }
</style>
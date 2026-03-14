<script lang="ts">
  export let title: string = 'Intelligence Introspection'
  export let expanded: boolean = false
  export let toggleExpanded: () => void = () => {}
</script>

<div class="panel-header">
  <div class="header-left">
    <div class="panel-icon">🔍</div>
    <h3 class="panel-title">{title}</h3>
  </div>
  <div class="header-right">
    <button class="expand-button" on:click={toggleExpanded} title={expanded ? 'Collapse' : 'Expand'}>
      {expanded ? '−' : '+'}
    </button>
  </div>
</div>

<style>
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    cursor: pointer;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .panel-icon {
    font-size: 1.25rem;
  }
  
  .panel-title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
  }
  
  .expand-button {
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: #374151;
    cursor: pointer;
  }
</style>
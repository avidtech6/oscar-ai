<script lang="ts">
  export let activeTab: 'overview' | 'query' | 'stats' | 'debug' = 'overview'
  export let setActiveTab: (tab: 'overview' | 'query' | 'stats' | 'debug') => void = () => {}
</script>

<div class="tabs">
  <button 
    class="tab-button {activeTab === 'overview' ? 'active' : ''}"
    on:click={() => setActiveTab('overview')}
  >
    <span class="tab-icon">📊</span>
    <span class="tab-label">Overview</span>
  </button>
  <button 
    class="tab-button {activeTab === 'query' ? 'active' : ''}"
    on:click={() => setActiveTab('query')}
  >
    <span class="tab-icon">🔍</span>
    <span class="tab-label">Query</span>
  </button>
  <button 
    class="tab-button {activeTab === 'stats' ? 'active' : ''}"
    on:click={() => setActiveTab('stats')}
  >
    <span class="tab-icon">📈</span>
    <span class="tab-label">Stats</span>
  </button>
  <button 
    class="tab-button {activeTab === 'debug' ? 'active' : ''}"
    on:click={() => setActiveTab('debug')}
  >
    <span class="tab-icon">🐛</span>
    <span class="tab-label">Debug</span>
  </button>
</div>

<style>
  .tabs {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;
  }
  
  .tab-button {
    background: transparent;
    border: none;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    border-radius: 4px;
  }
  
  .tab-button:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  .tab-button.active {
    background: #3b82f6;
    color: white;
  }
</style>
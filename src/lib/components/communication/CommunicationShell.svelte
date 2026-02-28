<script lang="ts">
  import ContextPills from '$lib/components/layout/ContextPills.svelte';
  import { rightPanelStore } from '$lib/stores/rightPanelStore';
  
  // Sample Connect items data
  const connectItems = [
    { id: '1', name: 'Marketing Campaign Q1', type: 'campaign', status: 'active', date: '2024-03-15', tags: ['marketing', 'email', 'social'] },
    { id: '2', name: 'Customer Support Thread', type: 'conversation', status: 'unread', date: '2024-03-14', tags: ['support', 'customer'] },
    { id: '3', name: 'Newsletter March', type: 'email', status: 'scheduled', date: '2024-03-13', tags: ['newsletter', 'email'] },
    { id: '4', name: 'Social Media Posts', type: 'social', status: 'published', date: '2024-03-12', tags: ['social', 'facebook', 'instagram'] },
    { id: '5', name: 'Blog Post: AI Trends', type: 'blog', status: 'draft', date: '2024-03-11', tags: ['blog', 'seo', 'content'] },
    { id: '6', name: 'Landing Page: Product Launch', type: 'landing-page', status: 'active', date: '2024-03-10', tags: ['landing-page', 'conversion'] },
    { id: '7', name: 'Automation: Welcome Series', type: 'automation', status: 'active', date: '2024-03-09', tags: ['automation', 'email'] },
    { id: '8', name: 'Audience Segment: Premium', type: 'segment', status: 'active', date: '2024-03-08', tags: ['audience', 'segment'] }
  ];
  
  let selectedItem = $state<typeof connectItems[0] | null>(null);
  let viewMode = $state<'grid' | 'list' | 'timeline'>('grid');
  let filterType = $state<string | null>(null);
  
  // Filter items based on selected type
  const filteredItems = $derived(() => {
    if (!filterType) return connectItems;
    return connectItems.filter(item => item.type === filterType);
  });
  
  function handleItemClick(item: typeof connectItems[0]) {
    selectedItem = item;
    rightPanelStore.open({
      title: item.name,
      content: `Connect item: ${item.name} (${item.type}, ${item.status})`
    });
  }
  
  function handleTypeFilter(type: string | null) {
    filterType = type;
  }
  
  function clearSelection() {
    selectedItem = null;
    rightPanelStore.close();
  }
  
  function getTypeColor(type: string) {
    switch (type) {
      case 'campaign': return 'bg-purple-100 text-purple-800';
      case 'conversation': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      case 'blog': return 'bg-amber-100 text-amber-800';
      case 'landing-page': return 'bg-indigo-100 text-indigo-800';
      case 'automation': return 'bg-cyan-100 text-cyan-800';
      case 'segment': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'published': return 'bg-purple-100 text-purple-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<div class="connect-shell">
  <div class="connect-layout">
    <!-- Left: Connect filters and controls -->
    <div class="connect-left">
      <div class="connect-controls">
        <h3 class="text-lg font-semibold mb-4">Connect</h3>
        
        <div class="view-mode-selector mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">View Mode</div>
          <div class="flex gap-2">
            <button
              class:active={viewMode === 'grid'}
              on:click={() => viewMode = 'grid'}
              class="px-3 py-2 rounded-lg text-sm transition-colors"
            >
              Grid
            </button>
            <button
              class:active={viewMode === 'list'}
              on:click={() => viewMode = 'list'}
              class="px-3 py-2 rounded-lg text-sm transition-colors"
            >
              List
            </button>
            <button
              class:active={viewMode === 'timeline'}
              on:click={() => viewMode = 'timeline'}
              class="px-3 py-2 rounded-lg text-sm transition-colors"
            >
              Timeline
            </button>
          </div>
        </div>
        
        <div class="type-filter mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Filter by Type</div>
          <div class="flex flex-col gap-2">
            <button
              class:active={filterType === null}
              on:click={() => handleTypeFilter(null)}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              All Types
            </button>
            {#each ['campaign', 'conversation', 'email', 'social', 'blog', 'landing-page', 'automation', 'segment'] as type}
              <button
                class:active={filterType === type}
                on:click={() => handleTypeFilter(type)}
                class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
              >
                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
              </button>
            {/each}
          </div>
        </div>
        
        <div class="stats">
          <div class="text-sm text-gray-600">
            {connectItems.length} items total
            {#if filterType}
              <span class="ml-2">({filteredItems().length} filtered)</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Middle: Connect content (becomes navigation rail when item is selected) -->
    <div class="connect-middle" class:navigation-rail={selectedItem !== null}>
      {#if selectedItem}
        <div class="navigation-rail-header">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Navigation Rail</h3>
            <button
              on:click={clearSelection}
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <div class="text-sm text-gray-500 mt-1">
            Showing items in same context
          </div>
        </div>
        <div class="navigation-rail-content">
          <!-- Show sibling items -->
          {#each filteredItems().filter((f: any) => f.id !== selectedItem?.id).slice(0, 5) as item}
            <div
              class="rail-item p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
              on:click={() => handleItemClick(item)}
            >
              <div class="font-medium text-gray-900">{item.name}</div>
              <div class="flex items-center gap-2 mt-1">
                <span class={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(item.type)}`}>
                  {item.type}
                </span>
                <span class={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- Normal connect view -->
        <div class="connect-content">
          <div class="connect-header mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Connect</h2>
            <p class="text-gray-600 mt-2">Communications + publishing layer for campaigns, emails, social posts, and more</p>
          </div>
          
          {#if viewMode === 'grid'}
            <div class="connect-grid">
              {#each filteredItems() as item}
                <div
                  class="connect-card p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
                  on:click={() => handleItemClick(item)}
                >
                  <div class="flex items-center justify-between mb-3">
                    <span class={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                      {item.type.replace('-', ' ')}
                    </span>
                    <span class={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div class="connect-card-title font-medium text-gray-900 mb-2">{item.name}</div>
                  <div class="connect-card-meta text-sm text-gray-500">{item.date}</div>
                  <div class="connect-card-tags flex flex-wrap gap-1 mt-3">
                    {#each item.tags.slice(0, 3) as tag}
                      <span class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {tag}
                      </span>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          {:else if viewMode === 'list'}
            <div class="connect-list">
              {#each filteredItems() as item}
                <div
                  class="connect-list-item p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                  on:click={() => handleItemClick(item)}
                >
                  <div class="flex items-center gap-4">
                    <div class="connect-list-icon">
                      <div class={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(item.type)}`}>
                        <span class="font-bold text-sm">
                          {item.type.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="font-medium text-gray-900">{item.name}</div>
                      <div class="text-sm text-gray-500 flex items-center gap-3 mt-1">
                        <span>{item.type}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                        <span>•</span>
                        <span class={getStatusColor(item.status)}>{item.status}</span>
                      </div>
                    </div>
                    <div class="connect-list-tags">
                      {#each item.tags.slice(0, 2) as tag}
                        <span class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full mr-1">
                          {tag}
                        </span>
                      {/each}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <!-- Timeline view -->
            <div class="connect-timeline">
              {#each filteredItems() as item}
                <div
                  class="timeline-item p-4 border-l-4 border-gray-300 ml-4 mb-4 cursor-pointer hover:bg-gray-50"
                  on:click={() => handleItemClick(item)}
                >
                  <div class="flex items-center justify-between">
                    <div class="font-medium text-gray-900">{item.name}</div>
                    <span class="text-sm text-gray-500">{item.date}</span>
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    <span class={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                    <span class={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div class="text-sm text-gray-600 mt-2">
                    {#if item.type === 'campaign'}
                      Multi-step marketing campaign
                    {:else if item.type === 'email'}
                      Email newsletter or broadcast
                    {:else if item.type === 'social'}
                      Social media posts across platforms
                    {:else if item.type === 'conversation'}
                      Customer support or team discussion
                    {:else}
                      Connect item
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
    
    <!-- Right: Context Pills for domain switching -->
    <div class="connect-right-pills">
      <ContextPills />
    </div>
  </div>
</div>

<style>
  .connect-shell {
    height: 100%;
    width: 100%;
  }
  
  .connect-layout {
    display: flex;
    height: 100%;
    gap: 1rem;
    padding: 1rem;
  }
  
  .connect-left {
    flex: 0 0 250px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
  }
  
  .connect-middle {
    flex: 1;
    min-width: 300px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
    overflow-y: auto;
    transition: all 0.3s ease;
  }
  
  .connect-middle.navigation-rail {
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
  
  .rail-item {
    transition: all 0.2s ease;
  }
  
  .rail-item:hover {
    transform: translateX(2px);
  }
  
  .connect-right-pills {
    flex: 0 0 300px;
    min-width: 300px;
    overflow-y: auto;
  }
  
  .connect-content {
    height: 100%;
  }
  
  .connect-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .connect-card {
    transition: all 0.2s ease;
  }
  
  .connect-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .connect-card-title {
    font-size: 1rem;
    line-height: 1.4;
  }
  
  .connect-list {
    display: flex;
    flex-direction: column;
  }
  
  .connect-timeline {
    position: relative;
  }
  
  .timeline-item {
    position: relative;
    transition: all 0.2s ease;
  }
  
  .timeline-item:hover {
    border-left-color: #3b82f6;
    background-color: #f8fafc;
  }
  
  .timeline-item::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #e5e7eb;
  }
  
  button.active {
    background-color: #3b82f6;
    color: white;
  }
  
  button:not(.active) {
    background-color: #f3f4f6;
    color: #374151;
  }
  
  /* Responsive: stack on smaller screens */
  @media (max-width: 1024px) {
    .connect-layout {
      flex-direction: column;
    }
    
    .connect-left,
    .connect-middle,
    .connect-right-pills {
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
      padding-right: 0;
      padding-bottom: 1rem;
      flex: none;
      width: 100%;
    }
    
    .connect-left {
      order: 1;
    }
    
    .connect-middle {
      order: 2;
    }
    
    .connect-right-pills {
      order: 3;
    }
    
    .connect-middle.navigation-rail {
      flex: none;
      width: 100%;
    }
  }
</style>
<script lang="ts">
  import ContextPills from '$lib/components/layout/ContextPills.svelte';
  import { rightPanelStore } from '$lib/stores/rightPanelStore';
  
  // Sample Projects items data
  const projectsItems = [
    { id: '1', name: 'Website Redesign', type: 'project', status: 'active', progress: 65, date: '2024-03-15', tags: ['design', 'development', 'marketing'] },
    { id: '2', name: 'Q1 Marketing Campaign', type: 'campaign', status: 'active', progress: 80, date: '2024-03-14', tags: ['marketing', 'campaign', 'q1'] },
    { id: '3', name: 'Product Launch', type: 'milestone', status: 'upcoming', progress: 30, date: '2024-03-13', tags: ['product', 'launch', 'milestone'] },
    { id: '4', name: 'Client Onboarding', type: 'deliverable', status: 'completed', progress: 100, date: '2024-03-12', tags: ['client', 'onboarding', 'deliverable'] },
    { id: '5', name: 'Team Offsite Planning', type: 'task', status: 'in-progress', progress: 45, date: '2024-03-11', tags: ['team', 'planning', 'event'] },
    { id: '6', name: 'Annual Report', type: 'document', status: 'draft', progress: 20, date: '2024-03-10', tags: ['report', 'annual', 'document'] },
    { id: '7', name: 'System Migration', type: 'project', status: 'planning', progress: 10, date: '2024-03-09', tags: ['system', 'migration', 'tech'] },
    { id: '8', name: 'Budget Planning', type: 'task', status: 'active', progress: 75, date: '2024-03-08', tags: ['budget', 'finance', 'planning'] }
  ];
  
  let selectedItem = $state<typeof projectsItems[0] | null>(null);
  let viewMode = $state<'grid' | 'list' | 'timeline'>('grid');
  let filterType = $state<string | null>(null);
  
  // Filter items based on selected type
  const filteredItems = $derived(() => {
    if (!filterType) return projectsItems;
    return projectsItems.filter(item => item.type === filterType);
  });
  
  function handleItemClick(item: typeof projectsItems[0]) {
    selectedItem = item;
    rightPanelStore.open({
      title: item.name,
      content: `Project item: ${item.name} (${item.type}, ${item.status}, ${item.progress}% complete)`
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
      case 'project': return 'bg-indigo-100 text-indigo-800';
      case 'campaign': return 'bg-purple-100 text-purple-800';
      case 'milestone': return 'bg-blue-100 text-blue-800';
      case 'deliverable': return 'bg-green-100 text-green-800';
      case 'task': return 'bg-amber-100 text-amber-800';
      case 'document': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'upcoming': return 'bg-purple-100 text-purple-800';
      case 'planning': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function getProgressColor(progress: number) {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }
</script>

<div class="projects-shell">
  <div class="projects-layout">
    <!-- Left: Projects filters and controls -->
    <div class="projects-left">
      <div class="projects-controls">
        <h3 class="text-lg font-semibold mb-4">Projects</h3>
        
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
            {#each ['project', 'campaign', 'milestone', 'deliverable', 'task', 'document'] as type}
              <button
                class:active={filterType === type}
                on:click={() => handleTypeFilter(type)}
                class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            {/each}
          </div>
        </div>
        
        <div class="stats">
          <div class="text-sm text-gray-600">
            {projectsItems.length} items total
            {#if filterType}
              <span class="ml-2">({filteredItems().length} filtered)</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Middle: Projects content (becomes navigation rail when item is selected) -->
    <div class="projects-middle" class:navigation-rail={selectedItem !== null}>
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
              <div class="mt-2">
                <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{item.progress}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div class={`h-1.5 rounded-full ${getProgressColor(item.progress)}`} style={`width: ${item.progress}%`}></div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- Normal projects view -->
        <div class="projects-content">
          <div class="projects-header mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Projects</h2>
            <p class="text-gray-600 mt-2">Coordination and orchestration layer bringing together tasks, notes, files, maps, and conversations</p>
          </div>
          
          {#if viewMode === 'grid'}
            <div class="projects-grid">
              {#each filteredItems() as item}
                <div
                  class="project-card p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
                  on:click={() => handleItemClick(item)}
                >
                  <div class="flex items-center justify-between mb-3">
                    <span class={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                    <span class={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div class="project-card-title font-medium text-gray-900 mb-2">{item.name}</div>
                  
                  <!-- Progress bar -->
                  <div class="mb-3">
                    <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class={`h-2 rounded-full ${getProgressColor(item.progress)}`} style={`width: ${item.progress}%`}></div>
                    </div>
                  </div>
                  
                  <div class="project-card-meta text-sm text-gray-500">{item.date}</div>
                  <div class="project-card-tags flex flex-wrap gap-1 mt-3">
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
            <div class="projects-list">
              {#each filteredItems() as item}
                <div
                  class="project-list-item p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                  on:click={() => handleItemClick(item)}
                >
                  <div class="flex items-center gap-4">
                    <div class="project-list-icon">
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
                      <!-- Progress bar -->
                      <div class="mt-2 max-w-xs">
                        <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5">
                          <div class={`h-1.5 rounded-full ${getProgressColor(item.progress)}`} style={`width: ${item.progress}%`}></div>
                        </div>
                      </div>
                    </div>
                    <div class="project-list-tags">
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
            <div class="projects-timeline">
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
                  <!-- Progress bar -->
                  <div class="mt-3">
                    <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-1.5">
                      <div class={`h-1.5 rounded-full ${getProgressColor(item.progress)}`} style={`width: ${item.progress}%`}></div>
                    </div>
                  </div>
                  <div class="text-sm text-gray-600 mt-2">
                    {#if item.type === 'project'}
                      Main project with multiple deliverables
                    {:else if item.type === 'milestone'}
                      Key milestone in project timeline
                    {:else if item.type === 'deliverable'}
                      Specific deliverable or output
                    {:else if item.type === 'task'}
                      Actionable task with progress tracking
                    {:else}
                      Project coordination item
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
    <div class="projects-right-pills">
      <ContextPills />
    </div>
  </div>
</div>

<style>
  .projects-shell {
    height: 100%;
    width: 100%;
  }
  
  .projects-layout {
    display: flex;
    height: 100%;
    gap: 1rem;
    padding: 1rem;
  }
  
  .projects-left {
    flex: 0 0 250px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
  }
  
  .projects-middle {
    flex: 1;
    min-width: 300px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
    overflow-y: auto;
    transition: all 0.3s ease;
  }
  
  .projects-middle.navigation-rail {
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
  
  .projects-right-pills {
    flex: 0 0 300px;
    min-width: 300px;
    overflow-y: auto;
  }
  
  .projects-content {
    height: 100%;
  }
  
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }
  
  .project-card {
    transition: all 0.2s ease;
  }
  
  .project-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .projects-list {
    display: flex;
    flex-direction: column;
  }
  
  .projects-timeline {
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
    .projects-layout {
      flex-direction: column;
    }
    
    .projects-left,
    .projects-middle,
    .projects-right-pills {
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
      padding-right: 0;
      padding-bottom: 1rem;
      flex: none;
      width: 100%;
    }
    
    .projects-left {
      order: 1;
    }
    
    .projects-middle {
      order: 2;
    }
    
    .projects-right-pills {
      order: 3;
    }
    
    .projects-middle.navigation-rail {
      flex: none;
      width: 100%;
    }
  }
</style>
<script lang="ts">
  import ContextPills from '$lib/components/layout/ContextPills.svelte';
  import { rightPanelStore } from '$lib/stores/rightPanelStore';
  
  // Sample timeline items data
  const timelineItems = [
    { id: '1', type: 'task', title: 'Design Review', status: 'completed', startDate: '2024-03-10', endDate: '2024-03-12', project: 'Website Redesign', priority: 'high', assignee: 'Alex' },
    { id: '2', type: 'milestone', title: 'Project Kickoff', status: 'completed', startDate: '2024-03-05', endDate: '2024-03-05', project: 'Website Redesign', priority: 'medium', assignee: 'Team' },
    { id: '3', type: 'campaign', title: 'Q1 Email Campaign', status: 'active', startDate: '2024-03-15', endDate: '2024-03-22', project: 'Marketing', priority: 'high', assignee: 'Marketing' },
    { id: '4', type: 'deliverable', title: 'Final Report', status: 'upcoming', startDate: '2024-03-25', endDate: '2024-03-28', project: 'Client Project', priority: 'medium', assignee: 'Sarah' },
    { id: '5', type: 'event', title: 'Team Meeting', status: 'scheduled', startDate: '2024-03-18', endDate: '2024-03-18', project: 'Internal', priority: 'low', assignee: 'All' },
    { id: '6', type: 'task', title: 'Code Review', status: 'in-progress', startDate: '2024-03-14', endDate: '2024-03-16', project: 'Website Redesign', priority: 'high', assignee: 'Dev Team' },
    { id: '7', type: 'social', title: 'Social Media Launch', status: 'planned', startDate: '2024-03-20', endDate: '2024-03-20', project: 'Marketing', priority: 'medium', assignee: 'Social Team' },
    { id: '8', type: 'automation', title: 'Weekly Report', status: 'active', startDate: '2024-03-01', endDate: '2024-03-31', project: 'Operations', priority: 'low', assignee: 'System' }
  ];
  
  let selectedItem = $state<typeof timelineItems[0] | null>(null);
  let viewMode = $state<'horizontal' | 'vertical' | 'gantt' | 'calendar'>('horizontal');
  let filterProject = $state<string | null>(null);
  let filterType = $state<string | null>(null);
  let dateRange = $state<{start: string, end: string}>({ start: '2024-03-01', end: '2024-03-31' });
  
  // Filter items based on selected filters
  const filteredItems = $derived(() => {
    let items = timelineItems;
    
    // Filter by project
    if (filterProject) {
      items = items.filter(item => item.project === filterProject);
    }
    
    // Filter by type
    if (filterType) {
      items = items.filter(item => item.type === filterType);
    }
    
    // Filter by date range
    items = items.filter(item => {
      const itemStart = new Date(item.startDate);
      const rangeStart = new Date(dateRange.start);
      const rangeEnd = new Date(dateRange.end);
      return itemStart >= rangeStart && itemStart <= rangeEnd;
    });
    
    return items;
  });
  
  // Get unique projects and types for filters
  const uniqueProjects = $derived(() => [...new Set(timelineItems.map(item => item.project))]);
  const uniqueTypes = $derived(() => [...new Set(timelineItems.map(item => item.type))]);
  
  function handleItemClick(item: typeof timelineItems[0]) {
    selectedItem = item;
    rightPanelStore.open({
      title: item.title,
      content: `Timeline item: ${item.title} (${item.type}, ${item.status}, ${item.project})`
    });
  }
  
  function clearSelection() {
    selectedItem = null;
    rightPanelStore.close();
  }
  
  function getTypeColor(type: string) {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-800';
      case 'milestone': return 'bg-purple-100 text-purple-800';
      case 'campaign': return 'bg-green-100 text-green-800';
      case 'deliverable': return 'bg-amber-100 text-amber-800';
      case 'event': return 'bg-red-100 text-red-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      case 'automation': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function getStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'upcoming': return 'bg-purple-100 text-purple-800';
      case 'scheduled': return 'bg-indigo-100 text-indigo-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  function getDurationDays(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
</script>

<div class="timeline-shell">
  <div class="timeline-layout">
    <!-- Left: Timeline filters and controls -->
    <div class="timeline-left">
      <div class="timeline-controls">
        <h3 class="text-lg font-semibold mb-4">Timeline</h3>
        
        <div class="view-mode-selector mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">View Mode</div>
          <div class="flex flex-col gap-2">
            <button
              class:active={viewMode === 'horizontal'}
              on:click={() => viewMode = 'horizontal'}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              Horizontal Timeline
            </button>
            <button
              class:active={viewMode === 'vertical'}
              on:click={() => viewMode = 'vertical'}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              Vertical Timeline
            </button>
            <button
              class:active={viewMode === 'gantt'}
              on:click={() => viewMode = 'gantt'}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              Gantt Chart
            </button>
            <button
              class:active={viewMode === 'calendar'}
              on:click={() => viewMode = 'calendar'}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              Calendar Grid
            </button>
          </div>
        </div>
        
        <div class="project-filter mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Filter by Project</div>
          <div class="flex flex-col gap-2">
            <button
              class:active={filterProject === null}
              on:click={() => filterProject = null}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              All Projects
            </button>
            {#each uniqueProjects() as project}
              <button
                class:active={filterProject === project}
                on:click={() => filterProject = project}
                class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
              >
                {project}
              </button>
            {/each}
          </div>
        </div>
        
        <div class="type-filter mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Filter by Type</div>
          <div class="flex flex-col gap-2">
            <button
              class:active={filterType === null}
              on:click={() => filterType = null}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              All Types
            </button>
            {#each uniqueTypes() as type}
              <button
                class:active={filterType === type}
                on:click={() => filterType = type}
                class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            {/each}
          </div>
        </div>
        
        <div class="date-range mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Date Range</div>
          <div class="space-y-2">
            <div>
              <label class="text-xs text-gray-600 block mb-1">Start Date</label>
              <input
                type="date"
                bind:value={dateRange.start}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label class="text-xs text-gray-600 block mb-1">End Date</label>
              <input
                type="date"
                bind:value={dateRange.end}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
        
        <div class="stats">
          <div class="text-sm text-gray-600">
            {filteredItems().length} items
            {#if filterProject || filterType}
              <span class="ml-2">(filtered)</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Middle: Timeline content (becomes navigation rail when item is selected) -->
    <div class="timeline-middle" class:navigation-rail={selectedItem !== null}>
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
            Showing related timeline items
          </div>
        </div>
        <div class="navigation-rail-content">
          <!-- Show related items -->
          {#each filteredItems().filter((f: any) => f.id !== selectedItem?.id && f.project === selectedItem?.project).slice(0, 5) as item}
            <div
              class="rail-item p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
              on:click={() => handleItemClick(item)}
            >
              <div class="font-medium text-gray-900">{item.title}</div>
              <div class="flex items-center gap-2 mt-1">
                <span class={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(item.type)}`}>
                  {item.type}
                </span>
                <span class={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <div class="text-xs text-gray-500 mt-2">
                {formatDate(item.startDate)} - {formatDate(item.endDate)} • {item.project}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- Normal timeline view -->
        <div class="timeline-content">
          <div class="timeline-header mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Timeline</h2>
            <p class="text-gray-600 mt-2">Contextual timeline for tasks, milestones, campaigns, and events across projects</p>
          </div>
          
          {#if viewMode === 'horizontal'}
            <!-- Horizontal Timeline View -->
            <div class="horizontal-timeline">
              <div class="timeline-axis">
                <div class="axis-labels flex justify-between text-xs text-gray-500 mb-2">
                  {#each [1, 5, 10, 15, 20, 25, 30] as day}
                    <span>Mar {day}</span>
                  {/each}
                </div>
                <div class="axis-line bg-gray-200 h-1 rounded-full"></div>
              </div>
              
              <div class="timeline-items mt-8">
                {#each filteredItems() as item}
                  <div
                    class="timeline-item absolute cursor-pointer"
                    style={`left: ${(new Date(item.startDate).getDate() / 31) * 100}%`}
                    on:click={() => handleItemClick(item)}
                  >
                    <div class="timeline-marker w-3 h-3 rounded-full bg-white border-2 border-gray-400 mx-auto mb-1"></div>
                    <div class="timeline-card p-3 bg-white border border-gray-200 rounded-lg shadow-sm min-w-48 max-w-64">
                      <div class="flex items-center justify-between mb-2">
                        <span class={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                        <span class={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                      <div class="font-medium text-gray-900 text-sm mb-1">{item.title}</div>
                      <div class="text-xs text-gray-500">
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                      </div>
                      <div class="text-xs text-gray-400 mt-1">{item.project}</div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {:else if viewMode === 'vertical'}
            <!-- Vertical Timeline View -->
            <div class="vertical-timeline">
              <div class="timeline-line absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              {#each filteredItems() as item, i}
                <div
                  class="vertical-item flex items-start mb-8 cursor-pointer"
                  on:click={() => handleItemClick(item)}
                >
                  <div class="timeline-marker w-4 h-4 rounded-full bg-white border-2 border-gray-400 mr-4 mt-1 flex-shrink-0"></div>
                  <div class="timeline-content bg-white border border-gray-200 rounded-lg p-4 flex-1 hover:shadow-sm transition-shadow">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <span class={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                        <span class={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <span class="text-sm text-gray-500">{formatDate(item.startDate)}</span>
                    </div>
                    <div class="font-medium text-gray-900 mb-1">{item.title}</div>
                    <div class="text-sm text-gray-600">{item.project} • {item.assignee}</div>
                    <div class="flex items-center gap-2 mt-3">
                      <span class={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                        {item.priority} priority
                      </span>
                      <span class="text-xs text-gray-500">
                        {getDurationDays(item.startDate, item.endDate)} days
                      </span>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else if viewMode === 'gantt'}
            <!-- Gantt Chart View -->
            <div class="gantt-chart">
              <div class="gantt-header mb-4">
                <div class="flex justify-between text-sm text-gray-600">
                  <span>Task</span>
                  <span>Timeline</span>
                </div>
              </div>
              <div class="gantt-items">
                {#each filteredItems() as item}
                  <div class="gantt-item mb-3 cursor-pointer" on:click={() => handleItemClick(item)}>
                    <div class="flex items-center mb-1">
                      <div class="w-48 text-sm font-medium text-gray-900 truncate">{item.title}</div>
                      <div class="flex-1 ml-4">
                        <div class="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            class={`absolute h-full rounded-full ${getTypeColor(item.type)}`}
                            style={`left: ${(new Date(item.startDate).getDate() / 31) * 100}%; width: ${(getDurationDays(item.startDate, item.endDate) / 31) * 100}%`}
                          ></div>
                        </div>
                      </div>
                      <div class="w-24 text-right text-xs text-gray-500">
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                      </div>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-gray-500">
                      <span class={`px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <span>{item.project}</span>
                      <span>•</span>
                      <span>{item.assignee}</span>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {:else}
            <!-- Calendar Grid View -->
            <div class="calendar-grid">
              <div class="calendar-header mb-4">
                <div class="flex justify-between items-center">
                  <h3 class="text-lg font-semibold">March 2024</h3>
                  <div class="flex gap-2">
                    <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg">Prev</button>
                    <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg">Today</button>
                    <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg">Next</button>
                  </div>
                </div>
                <div class="grid grid-cols-7 gap-1 mt-4">
                  {#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
                    <div class="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
                  {/each}
                </div>
              </div>
              <div class="calendar-grid-body">
                <div class="grid grid-cols-7 gap-1">
                  {#each Array(31).fill(0).map((_, i) => i + 1) as day}
                    <div class="min-h-24 border border-gray-200 rounded-lg p-2">
                      <div class="text-sm font-medium text-gray-700 mb-1">{day}</div>
                      <div class="space-y-1">
                        {#each filteredItems().filter(item => new Date(item.startDate).getDate() === day) as item}
                          <div
                            class="text-xs p-1 rounded cursor-pointer truncate ${getTypeColor(item.type)}"
                            on:click={() => handleItemClick(item)}
                          >
                            {item.title}
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
    
    <!-- Right: Context Pills for domain switching -->
    <div class="timeline-right-pills">
      <ContextPills />
    </div>
  </div>
</div>

<style>
  .timeline-shell {
    height: 100%;
    width: 100%;
  }
  
  .timeline-layout {
    display: flex;
    height: 100%;
    gap: 1rem;
    padding: 1rem;
  }
  
  .timeline-left {
    flex: 0 0 250px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
  }
  
  .timeline-middle {
    flex: 1;
    min-width: 300px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
    overflow-y: auto;
    transition: all 0.3s ease;
  }
  
  .timeline-middle.navigation-rail {
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
  
  .timeline-right-pills {
    flex: 0 0 300px;
    min-width: 300px;
    overflow-y: auto;
  }
  
  .timeline-content {
    height: 100%;
  }
  
  .horizontal-timeline {
    position: relative;
    height: 300px;
  }
  
  .timeline-axis {
    position: relative;
    margin-top: 2rem;
  }
  
  .axis-line {
    position: relative;
  }
  
  .timeline-items {
    position: relative;
    height: 200px;
  }
  
  .timeline-item {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
  }
  
  .timeline-card {
    transition: all 0.2s ease;
  }
  
  .timeline-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .vertical-timeline {
    position: relative;
  }
  
  .vertical-item {
    position: relative;
  }
  
  .gantt-item:hover {
    background-color: #f9fafb;
  }
  
  .calendar-grid-body {
    max-height: 500px;
    overflow-y: auto;
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
    .timeline-layout {
      flex-direction: column;
    }
    
    .timeline-left,
    .timeline-middle,
    .timeline-right-pills {
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
      padding-right: 0;
      padding-bottom: 1rem;
      flex: none;
      width: 100%;
    }
    
    .timeline-left {
      order: 1;
    }
    
    .timeline-middle {
      order: 2;
    }
    
    .timeline-right-pills {
      order: 3;
    }
    
    .timeline-middle.navigation-rail {
      flex: none;
      width: 100%;
    }
  }
</style>
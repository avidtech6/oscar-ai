<script lang="ts">
  import ContextPills from '$lib/components/layout/ContextPills.svelte';
  import { rightPanelStore } from '$lib/stores/rightPanelStore';
  
  // Panel types based on specification
  type PanelType = 'my-day' | 'projects-overview' | 'campaign-overview' | 'content-calendar' | 'timeline-snapshot' | 'automations' | 'analytics' | 'files-workspace' | 'map-activity' | 'notifications';
  
  type PanelSize = 'small' | 'medium' | 'large' | 'xlarge';
  
  interface DashboardPanel {
    id: string;
    type: PanelType;
    title: string;
    size: PanelSize;
    pinned: boolean;
    data: any;
    metrics: {
      label: string;
      value: string | number;
      change?: string;
      helpText?: string;
    }[];
  }
  
  // Sample dashboard panels data
  const dashboardPanels: DashboardPanel[] = [
    {
      id: '1',
      type: 'my-day',
      title: 'My Day',
      size: 'medium',
      pinned: true,
      data: { tasks: 5, completed: 2, deadlines: 1, reminders: 3 },
      metrics: [
        { label: 'Tasks', value: 5, change: '+2', helpText: 'Active tasks for today' },
        { label: 'Completed', value: 2, change: '+1', helpText: 'Tasks completed today' },
        { label: 'Deadlines', value: 1, helpText: 'Upcoming deadlines' },
        { label: 'Reminders', value: 3, helpText: 'Active reminders' }
      ]
    },
    {
      id: '2',
      type: 'projects-overview',
      title: 'Projects Overview',
      size: 'large',
      pinned: true,
      data: { active: 3, completed: 2, atRisk: 1, milestones: 5 },
      metrics: [
        { label: 'Active', value: 3, helpText: 'Projects currently in progress' },
        { label: 'Completed', value: 2, change: '+1', helpText: 'Projects completed this month' },
        { label: 'At Risk', value: 1, helpText: 'Projects needing attention' },
        { label: 'Milestones', value: 5, helpText: 'Upcoming milestones' }
      ]
    },
    {
      id: '3',
      type: 'campaign-overview',
      title: 'Campaign Overview',
      size: 'medium',
      pinned: false,
      data: { active: 2, steps: 8, performance: 'Good' },
      metrics: [
        { label: 'Active Campaigns', value: 2, helpText: 'Marketing campaigns running' },
        { label: 'Total Steps', value: 8, helpText: 'Steps across all campaigns' },
        { label: 'Performance', value: 'Good', helpText: 'Overall campaign performance' }
      ]
    },
    {
      id: '4',
      type: 'content-calendar',
      title: 'Content Calendar',
      size: 'large',
      pinned: true,
      data: { emails: 3, social: 5, blog: 2, upcoming: 10 },
      metrics: [
        { label: 'Emails', value: 3, helpText: 'Scheduled emails' },
        { label: 'Social Posts', value: 5, change: '+2', helpText: 'Social media posts scheduled' },
        { label: 'Blog Posts', value: 2, helpText: 'Blog posts in draft' },
        { label: 'Upcoming', value: 10, helpText: 'Total content items scheduled' }
      ]
    },
    {
      id: '5',
      type: 'timeline-snapshot',
      title: 'Timeline Snapshot',
      size: 'medium',
      pinned: false,
      data: { today: 4, next7Days: 12, overdue: 1 },
      metrics: [
        { label: 'Today', value: 4, helpText: 'Items due today' },
        { label: 'Next 7 Days', value: 12, helpText: 'Items in the coming week' },
        { label: 'Overdue', value: 1, helpText: 'Items past due date' }
      ]
    },
    {
      id: '6',
      type: 'automations',
      title: 'Automations',
      size: 'small',
      pinned: false,
      data: { running: 5, paused: 1, errors: 0 },
      metrics: [
        { label: 'Running', value: 5, helpText: 'Active automations' },
        { label: 'Paused', value: 1, helpText: 'Paused automations' },
        { label: 'Errors', value: 0, helpText: 'Automations with errors' }
      ]
    },
    {
      id: '7',
      type: 'analytics',
      title: 'Analytics',
      size: 'xlarge',
      pinned: true,
      data: { opens: 2450, clicks: 320, engagement: '4.2%', conversions: 42 },
      metrics: [
        { label: 'Opens', value: '2,450', change: '+12%', helpText: 'Email opens this month' },
        { label: 'Clicks', value: 320, change: '+8%', helpText: 'Total link clicks' },
        { label: 'Engagement', value: '4.2%', helpText: 'Overall engagement rate' },
        { label: 'Conversions', value: 42, change: '+5%', helpText: 'Conversions from campaigns' }
      ]
    },
    {
      id: '8',
      type: 'files-workspace',
      title: 'Files & Workspace',
      size: 'medium',
      pinned: false,
      data: { recent: 8, drafts: 3, shared: 5 },
      metrics: [
        { label: 'Recent Items', value: 8, helpText: 'Recently accessed files' },
        { label: 'Drafts', value: 3, helpText: 'Documents in draft state' },
        { label: 'Shared', value: 5, helpText: 'Shared with team members' }
      ]
    },
    {
      id: '9',
      type: 'map-activity',
      title: 'Map Activity',
      size: 'small',
      pinned: false,
      data: { locations: 3, tagged: 7 },
      metrics: [
        { label: 'Locations', value: 3, helpText: 'Recent locations visited' },
        { label: 'Tagged Items', value: 7, helpText: 'Items tagged with locations' }
      ]
    },
    {
      id: '10',
      type: 'notifications',
      title: 'Notifications',
      size: 'medium',
      pinned: true,
      data: { mentions: 2, approvals: 1, comments: 5 },
      metrics: [
        { label: 'Mentions', value: 2, helpText: 'Times you were mentioned' },
        { label: 'Approvals', value: 1, helpText: 'Items awaiting your approval' },
        { label: 'Comments', value: 5, helpText: 'Recent comments on your items' }
      ]
    }
  ];
  
  let selectedPanel = $state<DashboardPanel | null>(null);
  let filterProject = $state<string | null>(null);
  let filterCampaign = $state<string | null>(null);
  let filterDateRange = $state<{start: string, end: string}>({ start: '2024-03-01', end: '2024-03-31' });
  let filterChannel = $state<string | null>(null);
  let filterStatus = $state<string | null>(null);
  let filterPriority = $state<string | null>(null);
  let filterAssignee = $state<string | null>(null);
  
  // Filter panels based on selected filters
  const filteredPanels = $derived(() => {
    // In a real implementation, panels would be filtered based on their content
    // For now, we'll just return all panels
    return dashboardPanels;
  });
  
  // Get pinned panels
  const pinnedPanels = $derived(() => filteredPanels().filter(panel => panel.pinned));
  
  // Get unpinned panels
  const unpinnedPanels = $derived(() => filteredPanels().filter(panel => !panel.pinned));
  
  function handlePanelClick(panel: DashboardPanel) {
    selectedPanel = panel;
    rightPanelStore.open({
      title: panel.title,
      content: `Dashboard panel: ${panel.title} (${panel.type})`
    });
  }
  
  function clearSelection() {
    selectedPanel = null;
    rightPanelStore.close();
  }
  
  function getPanelColor(type: PanelType) {
    switch (type) {
      case 'my-day': return 'bg-blue-50 border-blue-200';
      case 'projects-overview': return 'bg-purple-50 border-purple-200';
      case 'campaign-overview': return 'bg-green-50 border-green-200';
      case 'content-calendar': return 'bg-amber-50 border-amber-200';
      case 'timeline-snapshot': return 'bg-indigo-50 border-indigo-200';
      case 'automations': return 'bg-gray-50 border-gray-200';
      case 'analytics': return 'bg-red-50 border-red-200';
      case 'files-workspace': return 'bg-cyan-50 border-cyan-200';
      case 'map-activity': return 'bg-emerald-50 border-emerald-200';
      case 'notifications': return 'bg-pink-50 border-pink-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  }
  
  function getPanelIcon(type: PanelType) {
    switch (type) {
      case 'my-day': return '📅';
      case 'projects-overview': return '📊';
      case 'campaign-overview': return '🎯';
      case 'content-calendar': return '📝';
      case 'timeline-snapshot': return '⏰';
      case 'automations': return '⚙️';
      case 'analytics': return '📈';
      case 'files-workspace': return '📁';
      case 'map-activity': return '🗺️';
      case 'notifications': return '🔔';
      default: return '📋';
    }
  }
  
  function getSizeClasses(size: PanelSize) {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-2';
      case 'large': return 'col-span-3';
      case 'xlarge': return 'col-span-4';
      default: return 'col-span-2';
    }
  }
  
  function togglePin(panel: DashboardPanel, event: Event) {
    event.stopPropagation();
    panel.pinned = !panel.pinned;
  }
</script>

<div class="dashboard-shell">
  <div class="dashboard-layout">
    <!-- Left: Dashboard filters and controls -->
    <div class="dashboard-left">
      <div class="dashboard-controls">
        <h3 class="text-lg font-semibold mb-4">Dashboard</h3>
        
        <div class="filters-section mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Filters</div>
          <div class="space-y-4">
            <div>
              <label class="text-xs text-gray-600 block mb-1">Project</label>
              <select 
                bind:value={filterProject}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={null}>All Projects</option>
                <option value="website-redesign">Website Redesign</option>
                <option value="marketing">Marketing</option>
                <option value="client-project">Client Project</option>
              </select>
            </div>
            
            <div>
              <label class="text-xs text-gray-600 block mb-1">Campaign</label>
              <select 
                bind:value={filterCampaign}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={null}>All Campaigns</option>
                <option value="q1-email">Q1 Email Campaign</option>
                <option value="social-launch">Social Media Launch</option>
              </select>
            </div>
            
            <div>
              <label class="text-xs text-gray-600 block mb-1">Channel</label>
              <select 
                bind:value={filterChannel}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={null}>All Channels</option>
                <option value="email">Email</option>
                <option value="social">Social</option>
                <option value="blog">Blog</option>
              </select>
            </div>
            
            <div class="date-range">
              <div class="text-xs text-gray-600 mb-1">Date Range</div>
              <div class="space-y-2">
                <input
                  type="date"
                  bind:value={filterDateRange.start}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="date"
                  bind:value={filterDateRange.end}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            
            <div>
              <label class="text-xs text-gray-600 block mb-1">Status</label>
              <select 
                bind:value={filterStatus}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={null}>All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div>
              <label class="text-xs text-gray-600 block mb-1">Priority</label>
              <select 
                bind:value={filterPriority}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={null}>All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <label class="text-xs text-gray-600 block mb-1">Assignee</label>
              <select 
                bind:value={filterAssignee}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={null}>All Assignees</option>
                <option value="alex">Alex</option>
                <option value="sarah">Sarah</option>
                <option value="team">Team</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="stats">
          <div class="text-sm text-gray-600">
            {filteredPanels().length} panels
            {#if filterProject || filterCampaign || filterChannel}
              <span class="ml-2">(filtered)</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Middle: Dashboard content (becomes navigation rail when panel is selected) -->
    <div class="dashboard-middle" class:navigation-rail={selectedPanel !== null}>
      {#if selectedPanel}
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
            Showing related dashboard panels
          </div>
        </div>
        <div class="navigation-rail-content">
          <!-- Show related panels -->
          {#each filteredPanels().filter((p: any) => p.id !== selectedPanel?.id && p.type === selectedPanel?.type).slice(0, 5) as panel}
            <div
              class="rail-item p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
              on:click={() => handlePanelClick(panel)}
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">{getPanelIcon(panel.type)}</span>
                <div class="font-medium text-gray-900">{panel.title}</div>
              </div>
              <div class="text-sm text-gray-600">
                {panel.metrics.length} metrics • {panel.size} size
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- Normal dashboard view -->
        <div class="dashboard-content">
          <div class="dashboard-header mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p class="text-gray-600 mt-2">High-level command surface with live panels across projects, campaigns, timeline, and analytics</p>
          </div>
          
          <!-- Pinned panels section -->
          {#if pinnedPanels().length > 0}
            <div class="pinned-section mb-8">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Pinned Panels</h3>
                <span class="text-sm text-gray-500">{pinnedPanels().length} pinned</span>
              </div>
              <div class="grid grid-cols-4 gap-4">
                {#each pinnedPanels() as panel}
                  <div
                    class={`panel-card ${getPanelColor(panel.type)} border rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow ${getSizeClasses(panel.size)}`}
                    on:click={() => handlePanelClick(panel)}
                  >
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <span class="text-xl">{getPanelIcon(panel.type)}</span>
                        <h4 class="font-semibold text-gray-900">{panel.title}</h4>
                      </div>
                      <button
                        on:click={(e) => togglePin(panel, e)}
                        class="text-gray-400 hover:text-gray-600"
                        title="Unpin"
                      >
                        📌
                      </button>
                    </div>
                    
                    <div class="panel-metrics">
                      <div class="grid grid-cols-2 gap-2">
                        {#each panel.metrics.slice(0, 4) as metric}
                          <div class="metric-item">
                            <div class="flex items-center justify-between">
                              <div class="text-xs text-gray-600">{metric.label}</div>
                              {#if metric.helpText}
                                <button class="text-xs text-gray-400 hover:text-gray-600" title={metric.helpText}>
                                  ?
                                </button>
                              {/if}
                            </div>
                            <div class="flex items-baseline gap-1 mt-1">
                              <div class="text-lg font-semibold text-gray-900">{metric.value}</div>
                              {#if metric.change}
                                <div class="text-xs text-green-600">{metric.change}</div>
                              {/if}
                            </div>
                          </div>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="mt-4 pt-3 border-t border-gray-200">
                      <div class="text-xs text-gray-500">
                        {panel.size} • {panel.metrics.length} metrics
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Unpinned panels section -->
          {#if unpinnedPanels().length > 0}
            <div class="unpinned-section">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">All Panels</h3>
                <span class="text-sm text-gray-500">{unpinnedPanels().length} available</span>
              </div>
              <div class="grid grid-cols-4 gap-4">
                {#each unpinnedPanels() as panel}
                  <div
                    class={`panel-card ${getPanelColor(panel.type)} border rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow ${getSizeClasses(panel.size)}`}
                    on:click={() => handlePanelClick(panel)}
                  >
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <span class="text-xl">{getPanelIcon(panel.type)}</span>
                        <h4 class="font-semibold text-gray-900">{panel.title}</h4>
                      </div>
                      <button
                        on:click={(e) => togglePin(panel, e)}
                        class="text-gray-400 hover:text-gray-600"
                        title="Pin"
                      >
                        📍
                      </button>
                    </div>
                    
                    <div class="panel-metrics">
                      <div class="grid grid-cols-2 gap-2">
                        {#each panel.metrics.slice(0, 2) as metric}
                          <div class="metric-item">
                            <div class="flex items-center justify-between">
                              <div class="text-xs text-gray-600">{metric.label}</div>
                              {#if metric.helpText}
                                <button class="text-xs text-gray-400 hover:text-gray-600" title={metric.helpText}>
                                  ?
                                </button>
                              {/if}
                            </div>
                            <div class="flex items-baseline gap-1 mt-1">
                              <div class="text-lg font-semibold text-gray-900">{metric.value}</div>
                              {#if metric.change}
                                <div class="text-xs text-green-600">{metric.change}</div>
                              {/if}
                            </div>
                          </div>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="mt-4 pt-3 border-t border-gray-200">
                      <div class="text-xs text-gray-500">
                        Click to expand • {panel.size}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
    
    <!-- Right: Context Pills for domain switching -->
    <div class="dashboard-right-pills">
      <ContextPills />
    </div>
  </div>
</div>

<style>
  .dashboard-shell {
    height: 100%;
    width: 100%;
  }
  
  .dashboard-layout {
    display: flex;
    height: 100%;
    gap: 1rem;
    padding: 1rem;
  }
  
  .dashboard-left {
    flex: 0 0 250px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
  }
  
  .dashboard-middle {
    flex: 1;
    min-width: 300px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
    overflow-y: auto;
    transition: all 0.3s ease;
  }
  
  .dashboard-middle.navigation-rail {
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
  
  .dashboard-right-pills {
    flex: 0 0 300px;
    min-width: 300px;
    overflow-y: auto;
  }
  
  .dashboard-content {
    height: 100%;
  }
  
  .panel-card {
    transition: all 0.2s ease;
  }
  
  .panel-card:hover {
    transform: translateY(-2px);
  }
  
  .metric-item {
    padding: 0.5rem;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 0.375rem;
  }
  
  /* Responsive: stack on smaller screens */
  @media (max-width: 1024px) {
    .dashboard-layout {
      flex-direction: column;
    }
    
    .dashboard-left,
    .dashboard-middle,
    .dashboard-right-pills {
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
      padding-right: 0;
      padding-bottom: 1rem;
      flex: none;
      width: 100%;
    }
    
    .dashboard-left {
      order: 1;
    }
    
    .dashboard-middle {
      order: 2;
    }
    
    .dashboard-right-pills {
      order: 3;
    }
    
    .dashboard-middle.navigation-rail {
      flex: none;
      width: 100%;
    }
    
    .grid-cols-4 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  
  @media (max-width: 640px) {
    .grid-cols-4 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }
</style>
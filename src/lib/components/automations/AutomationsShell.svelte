<script lang="ts">
  import ContextPills from '$lib/components/layout/ContextPills.svelte';
  import { rightPanelStore } from '$lib/stores/rightPanelStore';
  
  type AutomationTab = 'all' | 'active' | 'drafts' | 'templates' | 'logs' | 'builder';
  
  // Automation types
  const automationTypes = [
    { id: 'event', name: 'Event-based', description: 'Triggered by something happening', icon: '⚡', color: 'bg-blue-100 text-blue-800' },
    { id: 'schedule', name: 'Schedule-based', description: 'Runs on a timer or schedule', icon: '⏰', color: 'bg-green-100 text-green-800' },
    { id: 'condition', name: 'Condition-based', description: 'Runs when conditions become true', icon: '🔍', color: 'bg-purple-100 text-purple-800' },
    { id: 'manual', name: 'Manual', description: 'Triggered by user action', icon: '👆', color: 'bg-amber-100 text-amber-800' }
  ];
  
  // Sample automations
  const automations = [
    {
      id: '1',
      name: 'Invoice Processing',
      description: 'When a file with "invoice" in name is uploaded, extract amount and create task',
      type: 'event',
      status: 'active',
      trigger: 'File uploaded',
      conditions: ['File name contains "invoice"', 'File type is PDF'],
      actions: ['Extract amount from PDF', 'Create task in Projects', 'Notify finance team'],
      lastRun: '2 hours ago',
      nextRun: 'On next invoice upload',
      runs: 24,
      successRate: '95%'
    },
    {
      id: '2',
      name: 'Daily Report Generator',
      description: 'Generate daily summary report at 9 AM every weekday',
      type: 'schedule',
      status: 'active',
      trigger: 'Schedule: Weekdays at 9 AM',
      conditions: ['Workspace has new content', 'Projects have updates'],
      actions: ['Generate summary report', 'Send to team via email', 'Update dashboard'],
      lastRun: 'Today at 9:00 AM',
      nextRun: 'Tomorrow at 9:00 AM',
      runs: 45,
      successRate: '100%'
    },
    {
      id: '3',
      name: 'Overdue Task Notifier',
      description: 'Notify when tasks are overdue by more than 2 days',
      type: 'condition',
      status: 'active',
      trigger: 'Task status changes',
      conditions: ['Task is overdue', 'Overdue > 2 days', 'Priority is high'],
      actions: ['Send notification to assignee', 'Create follow-up task', 'Update project status'],
      lastRun: '1 hour ago',
      nextRun: 'When next task is overdue',
      runs: 12,
      successRate: '88%'
    },
    {
      id: '4',
      name: 'Campaign Launch Assistant',
      description: 'Manual automation to prepare campaign launch checklist',
      type: 'manual',
      status: 'draft',
      trigger: 'User clicks "Prepare Campaign"',
      conditions: ['Campaign is scheduled', 'All assets are ready'],
      actions: ['Create launch checklist', 'Notify marketing team', 'Schedule social posts'],
      lastRun: 'Never',
      nextRun: 'Manual trigger',
      runs: 0,
      successRate: 'N/A'
    },
    {
      id: '5',
      name: 'File Organizer',
      description: 'Automatically tag and organize uploaded files by type',
      type: 'event',
      status: 'active',
      trigger: 'File uploaded',
      conditions: ['File size < 50MB', 'File type is document or image'],
      actions: ['Detect file type', 'Apply appropriate tags', 'Move to correct folder'],
      lastRun: '30 minutes ago',
      nextRun: 'On next file upload',
      runs: 156,
      successRate: '98%'
    },
    {
      id: '6',
      name: 'Weekly Cleanup',
      description: 'Archive old files and clean up temporary data every Sunday',
      type: 'schedule',
      status: 'paused',
      trigger: 'Schedule: Sundays at 2 AM',
      conditions: ['Files older than 30 days', 'Not tagged as "keep"'],
      actions: ['Move to archive folder', 'Update file index', 'Send cleanup report'],
      lastRun: 'Last Sunday at 2:00 AM',
      nextRun: 'Next Sunday at 2:00 AM',
      runs: 8,
      successRate: '100%'
    }
  ];
  
  // Automation logs
  const logs = [
    { id: '1', automation: 'Invoice Processing', status: 'success', timestamp: '2 hours ago', details: 'Processed invoice_2024_03.pdf, extracted $1,250.00' },
    { id: '2', automation: 'Daily Report Generator', status: 'success', timestamp: 'Today at 9:00 AM', details: 'Generated report for 15 projects, sent to 3 team members' },
    { id: '3', automation: 'Overdue Task Notifier', status: 'warning', timestamp: '1 hour ago', details: 'Task "Q4 Review" overdue by 3 days, notified Alex Johnson' },
    { id: '4', automation: 'File Organizer', status: 'success', timestamp: '30 minutes ago', details: 'Organized presentation.pdf, tagged as "document"' },
    { id: '5', automation: 'Invoice Processing', status: 'error', timestamp: 'Yesterday', details: 'Failed to extract amount from corrupted PDF file' }
  ];
  
  const tabs = [
    { id: 'all', title: 'All Automations', description: 'View all automations', icon: '📋' },
    { id: 'active', title: 'Active', description: 'Currently running automations', icon: '▶️' },
    { id: 'drafts', title: 'Drafts', description: 'Automations in development', icon: '📝' },
    { id: 'templates', title: 'Templates', description: 'Pre-built automation templates', icon: '🏗️' },
    { id: 'logs', title: 'Logs', description: 'Automation execution history', icon: '📊' },
    { id: 'builder', title: 'Builder', description: 'Create new automations', icon: '⚙️' }
  ];
  
  let selectedAutomation = $state<typeof automations[0] | null>(null);
  let activeTabId = $state<AutomationTab>('all');
  let searchQuery = $state<string>('');
  
  const currentTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  
  const filteredAutomations = (() => {
    let filtered = automations;
    
    // Filter by tab
    if (activeTabId === 'active') {
      filtered = filtered.filter(a => a.status === 'active');
    } else if (activeTabId === 'drafts') {
      filtered = filtered.filter(a => a.status === 'draft');
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.trigger.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  })();
  
  function handleAutomationClick(automation: typeof automations[0]) {
    selectedAutomation = automation;
    rightPanelStore.open({
      title: automation.name,
      content: `Automation: ${automation.name}`
    });
  }
  
  function clearSelection() {
    selectedAutomation = null;
    rightPanelStore.close();
  }
  
  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function getLogStatusColor(status: string) {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function getTypeColor(typeId: string) {
    const type = automationTypes.find(t => t.id === typeId);
    return type?.color || 'bg-gray-100 text-gray-800';
  }
</script>

<div class="automations-shell">
  <div class="automations-layout">
    <!-- Left: Automation types and controls -->
    <div class="automations-left">
      <div class="automations-controls">
        <div class="header mb-6">
          <h3 class="font-semibold text-gray-900 mb-2">Automations</h3>
          <p class="text-sm text-gray-600">Proactive system that observes, reacts, and acts across domains</p>
        </div>
        
        <div class="stats mb-6 p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500">Active</div>
              <div class="text-2xl font-bold text-gray-900">{automations.filter(a => a.status === 'active').length}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Total Runs</div>
              <div class="text-2xl font-bold text-gray-900">{automations.reduce((sum, a) => sum + a.runs, 0)}</div>
            </div>
          </div>
        </div>
        
        <div class="types-navigation mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Automation Types</div>
          <div class="flex flex-col gap-2">
            {#each automationTypes as type}
              <div class="type-item p-3 border border-gray-200 rounded-lg">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-lg">{type.icon}</span>
                  <div class="font-medium text-gray-900">{type.name}</div>
                </div>
                <div class="text-sm text-gray-600">
                  {type.description}
                </div>
              </div>
            {/each}
          </div>
        </div>
        
        <div class="tabs-navigation mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Views</div>
          <div class="flex flex-col gap-2">
            {#each tabs as tab}
              <button
                class:active={activeTabId === tab.id}
                on:click={() => { activeTabId = tab.id as AutomationTab; clearSelection(); }}
                class="px-3 py-2 rounded-lg text-sm transition-colors text-left flex items-center gap-2"
              >
                <span class="text-lg">{tab.icon}</span>
                <span>{tab.title}</span>
              </button>
            {/each}
          </div>
        </div>
        
        <div class="search mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Search Automations</div>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search by name, trigger, or description..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        
        <div class="quick-actions mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Quick Actions</div>
          <div class="space-y-2">
            <button class="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 text-left">
              + New Automation
            </button>
            <button class="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 text-left">
              Import Template
            </button>
            <button class="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 text-left">
              View All Logs
            </button>
          </div>
        </div>
        
        <div class="info">
          <div class="text-xs text-gray-500">
            {filteredAutomations.length} automations
            {#if searchQuery}
              <span class="ml-2">(filtered)</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Middle: Automations content -->
    <div class="automations-middle" class:navigation-rail={selectedAutomation !== null}>
      {#if selectedAutomation}
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
            Showing related automations
          </div>
        </div>
        <div class="navigation-rail-content">
          {#each filteredAutomations.filter((a: any) => a.id !== selectedAutomation?.id).slice(0, 5) as automation}
            <div
              class="rail-item p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
              on:click={() => handleAutomationClick(automation)}
            >
              <div class="flex items-center justify-between mb-2">
                <div class="font-medium text-gray-900">{automation.name}</div>
                <div class={`text-xs px-2 py-1 rounded-full ${getStatusColor(automation.status)}`}>
                  {automation.status}
                </div>
              </div>
              <div class="text-sm text-gray-600">
                {automation.description}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="automations-content">
          <div class="automations-header mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Automations</h2>
            <p class="text-gray-600 mt-2">Proactive system that observes, reacts, and acts across all domains</p>
          </div>
          
          <!-- Current tab view -->
          <div class="current-tab">
            <div class="tab-header mb-6">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl">{currentTab.icon}</span>
                <h3 class="text-xl font-bold text-gray-900">{currentTab.title}</h3>
              </div>
              <p class="text-gray-700">{currentTab.description}</p>
            </div>
            
            <div class="tab-content">
              {#if activeTabId === 'logs'}
                <!-- Logs view -->
                <div class="space-y-3">
                  {#each logs as log}
                    <div class="log-item p-4 border border-gray-200 rounded-lg">
                      <div class="flex items-center justify-between mb-2">
                        <div class="font-medium text-gray-900">{log.automation}</div>
                        <div class="flex items-center gap-3">
                          <div class={`text-xs px-2 py-1 rounded-full ${getLogStatusColor(log.status)}`}>
                            {log.status}
                          </div>
                          <div class="text-sm text-gray-500">{log.timestamp}</div>
                        </div>
                      </div>
                      <div class="text-gray-700">
                        {log.details}
                      </div>
                    </div>
                  {/each}
                </div>
              {:else if activeTabId === 'builder'}
                <!-- Builder view -->
                <div class="builder p-8 text-center border-2 border-dashed border-gray-300 rounded-xl">
                  <div class="text-4xl mb-4">⚙️</div>
                  <h4 class="text-lg font-medium text-gray-900 mb-2">Automation Builder</h4>
                  <p class="text-gray-600 mb-6">Create new automations with visual builder or natural language</p>
                  <div class="flex gap-4 justify-center">
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Visual Builder
                    </button>
                    <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      Natural Language
                    </button>
                  </div>
                </div>
              {:else}
                <!-- Automations list view -->
                <div class="space-y-4">
                  {#each filteredAutomations as automation}
                    <div
                      class="automation-card p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/30"
                      on:click={() => handleAutomationClick(automation)}
                    >
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3">
                          <div class={`w-10 h-10 rounded-lg ${getTypeColor(automation.type)} flex items-center justify-center text-lg`}>
                            {automationTypes.find(t => t.id === automation.type)?.icon || '⚙️'}
                          </div>
                          <div>
                            <h4 class="font-bold text-gray-900">{automation.name}</h4>
                            <p class="text-sm text-gray-600">{automation.description}</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-3">
                          <div class={`text-xs px-2 py-1 rounded-full ${getStatusColor(automation.status)}`}>
                            {automation.status}
                          </div>
                          <div class="text-sm text-gray-500">
                            {automation.runs} runs
                          </div>
                        </div>
                      </div>
                      
                      <div class="automation-details grid grid-cols-3 gap-4 mt-4">
                        <div class="detail-item">
                          <div class="text-xs text-gray-500 mb-1">Trigger</div>
                          <div class="text-sm font-medium text-gray-900">{automation.trigger}</div>
                        </div>
                        <div class="detail-item">
                          <div class="text-xs text-gray-500 mb-1">Last Run</div>
                          <div class="text-sm font-medium text-gray-900">{automation.lastRun}</div>
                        </div>
                        <div class="detail-item">
                          <div class="text-xs text-gray-500 mb-1">Success Rate</div>
                          <div class="text-sm font-medium text-gray-900">{automation.successRate}</div>
                        </div>
                      </div>
                      
                      <div class="automation-actions mt-4 flex gap-2">
                        <button class="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                          Run Now
                        </button>
                        <button class="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                          Edit
                        </button>
                        <button class="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                          Duplicate
                        </button>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Right: Context pills -->
    <div class="automations-right">
      <ContextPills />
    </div>
  </div>
</div>

<style>
  .automations-shell {
    @apply h-full;
  }
  
  .automations-layout {
    @apply grid grid-cols-12 gap-4 h-full;
  }
  
  .automations-left {
    @apply col-span-3 border-r border-gray-200 p-4;
  }
  
  .automations-middle {
    @apply col-span-6 p-4 overflow-y-auto;
  }
  
  .automations-right {
    @apply col-span-3 border-l border-gray-200 p-4;
  }
  
  .automations-controls {
    @apply h-full;
  }
  
  button.active {
    @apply bg-blue-100 text-blue-700;
  }
  
  .navigation-rail {
    @apply bg-gray-50;
  }
  
  .navigation-rail-header {
    @apply mb-4 pb-4 border-b border-gray-200;
  }
  
  .navigation-rail-content {
    @apply space-y-2;
  }
  
  .rail-item {
    @apply transition-colors;
  }
  
  .rail-item:hover {
    @apply bg-gray-100;
  }
  
  .type-item {
    @apply transition-colors hover:bg-gray-50;
  }
  
  .automation-card {
    @apply transition-all duration-200;
  }
  
  .automation-card:hover {
    @apply shadow-sm;
  }
  
  .log-item {
    @apply transition-colors hover:bg-gray-50;
  }
  
  .builder {
    @apply transition-colors hover:border-blue-400;
  }
</style>
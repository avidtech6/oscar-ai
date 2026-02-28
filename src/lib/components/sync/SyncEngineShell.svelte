<script lang="ts">
  import ContextPills from '$lib/components/layout/ContextPills.svelte';
  import { rightPanelStore } from '$lib/stores/rightPanelStore';
  
  type SyncTab = 'overview' | 'queue' | 'conflicts' | 'logs' | 'settings' | 'domains';
  type SyncStatus = 'syncing' | 'offline' | 'conflict' | 'error' | 'up-to-date';
  type SyncDomain = 'workspace' | 'files' | 'projects' | 'connect' | 'map' | 'identity' | 'automations' | 'events' | 'search';
  
  // Sync domains
  const syncDomains = [
    { id: 'workspace', name: 'Workspace', description: 'Pages, blocks, notes, and documents', icon: '📄', color: 'bg-blue-100 text-blue-800', lastSync: '2 minutes ago', status: 'up-to-date', queued: 0 },
    { id: 'files', name: 'Files', description: 'Documents, images, PDFs, and media', icon: '📁', color: 'bg-green-100 text-green-800', lastSync: '5 minutes ago', status: 'up-to-date', queued: 0 },
    { id: 'projects', name: 'Projects', description: 'Tasks, milestones, and project content', icon: '📋', color: 'bg-purple-100 text-purple-800', lastSync: '1 minute ago', status: 'syncing', queued: 3 },
    { id: 'connect', name: 'Connect', description: 'Emails, contacts, and campaigns', icon: '📧', color: 'bg-amber-100 text-amber-800', lastSync: '10 minutes ago', status: 'offline', queued: 12 },
    { id: 'map', name: 'Map', description: 'Map pins, locations, and coordinates', icon: '🗺️', color: 'bg-red-100 text-red-800', lastSync: 'Just now', status: 'up-to-date', queued: 0 },
    { id: 'identity', name: 'Identity', description: 'User profile and preferences', icon: '👤', color: 'bg-indigo-100 text-indigo-800', lastSync: '30 minutes ago', status: 'up-to-date', queued: 0 },
    { id: 'automations', name: 'Automations', description: 'Automation rules and triggers', icon: '⚙️', color: 'bg-pink-100 text-pink-800', lastSync: '15 minutes ago', status: 'error', queued: 5 },
    { id: 'events', name: 'Events', description: 'Event stream and activity logs', icon: '📊', color: 'bg-cyan-100 text-cyan-800', lastSync: 'Just now', status: 'syncing', queued: 8 },
    { id: 'search', name: 'Search', description: 'Search index and embeddings', icon: '🔍', color: 'bg-lime-100 text-lime-800', lastSync: '2 minutes ago', status: 'up-to-date', queued: 0 }
  ];
  
  // Sync queue items
  const queueItems = [
    { id: '1', domain: 'projects', action: 'Task update', item: 'Website Redesign - Task #15', timestamp: '2 minutes ago', status: 'pending' },
    { id: '2', domain: 'connect', action: 'Email draft', item: 'Pricing inquiry reply', timestamp: '5 minutes ago', status: 'pending' },
    { id: '3', domain: 'projects', action: 'Comment added', item: 'Q4 Planning - Comment by Alex', timestamp: '7 minutes ago', status: 'pending' },
    { id: '4', domain: 'automations', action: 'Automation run', item: 'Invoice Processing - Run #24', timestamp: '10 minutes ago', status: 'failed', error: 'Network timeout' },
    { id: '5', domain: 'events', action: 'Event logged', item: 'File uploaded: presentation.pdf', timestamp: '12 minutes ago', status: 'pending' },
    { id: '6', domain: 'connect', action: 'Campaign update', item: 'Q4 Marketing Campaign', timestamp: '15 minutes ago', status: 'pending' },
    { id: '7', domain: 'projects', action: 'Status change', item: 'Client Meeting - Completed', timestamp: '18 minutes ago', status: 'pending' },
    { id: '8', domain: 'files', action: 'Tag update', item: 'invoice_2024_03.pdf', timestamp: '20 minutes ago', status: 'pending' }
  ];
  
  // Conflict items
  const conflictItems = [
    { id: '1', domain: 'workspace', item: 'Q4 Marketing Strategy', conflictType: 'content-merge', timestamp: '1 hour ago', resolution: 'pending', details: 'Both you and Alex edited the same section' },
    { id: '2', domain: 'projects', item: 'Website Redesign Timeline', conflictType: 'date-conflict', timestamp: '2 hours ago', resolution: 'resolved', details: 'Timeline dates conflicted - used your version' },
    { id: '3', domain: 'map', item: 'Client Meeting Location', conflictType: 'coordinate-conflict', timestamp: '3 hours ago', resolution: 'pending', details: 'Location coordinates differ by 50 meters' }
  ];
  
  // Sync logs
  const syncLogs = [
    { id: '1', timestamp: 'Just now', domain: 'events', action: 'Sync completed', status: 'success', details: '8 events synced' },
    { id: '2', timestamp: '2 minutes ago', domain: 'search', action: 'Index updated', status: 'success', details: 'Search index refreshed' },
    { id: '3', timestamp: '5 minutes ago', domain: 'projects', action: 'Sync started', status: 'info', details: 'Syncing 3 queued items' },
    { id: '4', timestamp: '10 minutes ago', domain: 'automations', action: 'Sync failed', status: 'error', details: 'Network timeout - 5 items queued' },
    { id: '5', timestamp: '15 minutes ago', domain: 'connect', action: 'Offline mode', status: 'warning', details: 'Network disconnected - 12 items queued' },
    { id: '6', timestamp: '30 minutes ago', domain: 'identity', action: 'Sync completed', status: 'success', details: 'Profile preferences updated' },
    { id: '7', timestamp: '1 hour ago', domain: 'workspace', action: 'Conflict detected', status: 'warning', details: 'Content merge required' },
    { id: '8', timestamp: '2 hours ago', domain: 'files', action: 'Sync completed', status: 'success', details: '15 files metadata synced' }
  ];
  
  const tabs = [
    { id: 'overview', title: 'Overview', description: 'Sync status across all domains', icon: '📊' },
    { id: 'queue', title: 'Queue', description: 'Pending sync operations', icon: '⏳' },
    { id: 'conflicts', title: 'Conflicts', description: 'Merge conflicts requiring resolution', icon: '⚡' },
    { id: 'logs', title: 'Logs', description: 'Sync activity history', icon: '📝' },
    { id: 'settings', title: 'Settings', description: 'Sync configuration and rules', icon: '⚙️' },
    { id: 'domains', title: 'Domains', description: 'Domain-specific sync settings', icon: '🌐' }
  ];
  
  let selectedItem = $state<any>(null);
  let activeTabId = $state<SyncTab>('overview');
  let syncStatus = $state<SyncStatus>('syncing');
  let networkStatus = $state<'online' | 'offline'>('online');
  let autoSync = $state<boolean>(true);
  let conflictResolution = $state<string>('smart-merge');
  
  const currentTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  
  // Overall sync stats
  const syncStats = {
    totalDomains: syncDomains.length,
    upToDate: syncDomains.filter(d => d.status === 'up-to-date').length,
    syncing: syncDomains.filter(d => d.status === 'syncing').length,
    offline: syncDomains.filter(d => d.status === 'offline').length,
    errors: syncDomains.filter(d => d.status === 'error').length,
    totalQueued: queueItems.filter(i => i.status === 'pending').length,
    totalConflicts: conflictItems.filter(i => i.resolution === 'pending').length
  };
  
  function handleItemClick(item: any) {
    selectedItem = item;
    rightPanelStore.open({
      title: `Sync Item: ${item.item || item.action}`,
      content: `Sync details for ${item.item || item.action}`
    });
  }
  
  function clearSelection() {
    selectedItem = null;
    rightPanelStore.close();
  }
  
  function getStatusColor(status: string) {
    switch (status) {
      case 'up-to-date': return 'bg-green-100 text-green-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      case 'offline': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'conflict': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function getStatusIcon(status: string) {
    switch (status) {
      case 'up-to-date': return '✅';
      case 'syncing': return '🔄';
      case 'offline': return '📴';
      case 'error': return '❌';
      case 'conflict': return '⚡';
      default: return '❓';
    }
  }
  
  function getLogStatusColor(status: string) {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function forceSync() {
    console.log('Forcing sync across all domains');
    syncStatus = 'syncing';
    setTimeout(() => {
      syncStatus = 'up-to-date';
    }, 2000);
  }
  
  function resolveConflict(conflictId: string, resolution: 'mine' | 'theirs' | 'merge') {
    console.log(`Resolving conflict ${conflictId} with ${resolution}`);
    const conflict = conflictItems.find(c => c.id === conflictId);
    if (conflict) {
      conflict.resolution = 'resolved';
    }
  }
  
  function retryFailed() {
    console.log('Retrying failed sync items');
  }
  
  function toggleNetwork() {
    networkStatus = networkStatus === 'online' ? 'offline' : 'online';
  }
  
  $effect(() => {
    // Update overall sync status based on domains
    if (syncDomains.some(d => d.status === 'error')) {
      syncStatus = 'error';
    } else if (syncDomains.some(d => d.status === 'syncing')) {
      syncStatus = 'syncing';
    } else if (syncDomains.some(d => d.status === 'offline')) {
      syncStatus = 'offline';
    } else if (syncDomains.every(d => d.status === 'up-to-date')) {
      syncStatus = 'up-to-date';
    }
  });
</script>

<div class="sync-shell">
  <div class="sync-layout">
    <!-- Left: Sync controls and status -->
    <div class="sync-left">
      <div class="sync-controls">
        <div class="header mb-6">
          <h3 class="font-semibold text-gray-900 mb-2">Sync Engine</h3>
          <p class="text-sm text-gray-600">Local‑first consistency layer for all domains</p>
        </div>
        
        <div class="status-indicator mb-6 p-4 rounded-lg" class:bg-green-50={syncStatus === 'up-to-date'} class:bg-blue-50={syncStatus === 'syncing'} class:bg-yellow-50={syncStatus === 'offline'} class:bg-red-50={syncStatus === 'error'}>
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="text-2xl">{getStatusIcon(syncStatus)}</span>
              <div>
                <div class="font-bold text-gray-900 capitalize">{syncStatus.replace('-', ' ')}</div>
                <div class="text-sm text-gray-600">
                  {networkStatus === 'online' ? 'Online' : 'Offline'} • {syncStats.totalQueued} queued
                </div>
              </div>
            </div>
            <div class={`text-xs px-2 py-1 rounded-full ${getStatusColor(syncStatus)}`}>
              {syncStatus}
            </div>
          </div>
          <div class="mt-3">
            <button
              on:click={forceSync}
              class="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              🔄 Force Sync Now
            </button>
          </div>
        </div>
        
        <div class="stats mb-6 p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500">Up to Date</div>
              <div class="text-2xl font-bold text-gray-900">{syncStats.upToDate}/{syncStats.totalDomains}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Queued</div>
              <div class="text-2xl font-bold text-gray-900">{syncStats.totalQueued}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Conflicts</div>
              <div class="text-2xl font-bold text-gray-900">{syncStats.totalConflicts}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Errors</div>
              <div class="text-2xl font-bold text-gray-900">{syncStats.errors}</div>
            </div>
          </div>
        </div>
        
        <div class="tabs-navigation mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Views</div>
          <div class="flex flex-col gap-2">
            {#each tabs as tab}
              <button
                class:active={activeTabId === tab.id}
                on:click={() => { activeTabId = tab.id as SyncTab; clearSelection(); }}
                class="px-3 py-2 rounded-lg text-sm transition-colors text-left flex items-center gap-2"
              >
                <span class="text-lg">{tab.icon}</span>
                <span>{tab.title}</span>
              </button>
            {/each}
          </div>
        </div>
        
        <div class="quick-actions mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Quick Actions</div>
          <div class="space-y-2">
            <button 
              on:click={forceSync}
              class="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 text-left"
            >
              🔄 Sync All Domains
            </button>
            <button 
              on:click={retryFailed}
              class="w-full px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 text-left"
            >
              🔄 Retry Failed
            </button>
            <button 
              on:click={toggleNetwork}
              class="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 text-left"
            >
              {networkStatus === 'online' ? '📴 Simulate Offline' : '📶 Go Online'}
            </button>
            <button class="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 text-left">
              📊 View Sync Analytics
            </button>
          </div>
        </div>
        
        <div class="settings-preview mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Sync Settings</div>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Auto Sync</span>
              <div class="relative">
                <input
                  type="checkbox"
                  bind:checked={autoSync}
                  class="sr-only"
                  id="auto-sync-toggle"
                />
                <label
                  for="auto-sync-toggle"
                  class="block w-10 h-6 rounded-full cursor-pointer {autoSync ? 'bg-blue-600' : 'bg-gray-300'}"
                >
                  <span class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform {autoSync ? 'transform translate-x-4' : ''}"></span>
                </label>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Conflict Resolution</span>
              <select
                bind:value={conflictResolution}
                class="text-sm border border-gray-300 rounded-lg px-2 py-1"
              >
                <option value="smart-merge">Smart Merge</option>
                <option value="mine">Use My Version</option>
                <option value="theirs">Use Their Version</option>
                <option value="manual">Manual Resolution</option>
              </select>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Sync Frequency</span>
              <span class="text-sm font-medium text-gray-900">Every 5 minutes</span>
            </div>
          </div>
        </div>
        
        <div class="info">
          <div class="text-xs text-gray-500">
            {syncStats.totalQueued} items queued • {syncStats.totalConflicts} conflicts
          </div>
        </div>
      </div>
    </div>
    
    <!-- Middle: Sync content -->
    <div class="sync-middle" class:navigation-rail={selectedItem !== null}>
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
            Showing related sync items
          </div>
        </div>
        <div class="navigation-rail-content">
          {#each queueItems.filter((i: any) => i.id !== selectedItem?.id).slice(0, 3) as item}
            <div
              class="rail-item p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
              on:click={() => handleItemClick(item)}
            >
              <div class="flex items-center justify-between mb-2">
                <div class="font-medium text-gray-900">{item.item}</div>
                <div class="text-xs text-gray-500">{item.timestamp}</div>
              </div>
              <div class="text-sm text-gray-600">
                {item.action} • {item.domain}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="sync-content">
          <div class="sync-header mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Sync Engine</h2>
            <p class="text-gray-600 mt-2">Local‑first consistency layer that ensures all domains stay synchronized</p>
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
              {#if activeTabId === 'overview'}
                <!-- Overview: Domain status -->
                <div class="space-y-4">
                  {#each syncDomains as domain}
                    <div class="domain-status p-4 border border-gray-200 rounded-lg">
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3">
                          <div class={`w-10 h-10 rounded-lg ${domain.color} flex items-center justify-center text-lg`}>
                            {domain.icon}
                          </div>
                          <div>
                            <h4 class="font-bold text-gray-900">{domain.name}</h4>
                            <p class="text-sm text-gray-600">{domain.description}</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-3">
                          <div class={`text-xs px-2 py-1 rounded-full ${getStatusColor(domain.status)}`}>
                            {domain.status}
                          </div>
                          {#if domain.queued > 0}
                            <div class="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                              {domain.queued} queued
                            </div>
                          {/if}
                        </div>
                      </div>
                      <div class="flex items-center justify-between text-sm text-gray-500">
                        <span>Last sync: {domain.lastSync}</span>
                        <button
                          on:click={() => handleItemClick(domain)}
                          class="text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else if activeTabId === 'queue'}
                <!-- Queue view -->
                <div class="space-y-3">
                  {#each queueItems as item}
                    <div
                      class="queue-item p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/30"
                      on:click={() => handleItemClick(item)}
                    >
                      <div class="flex items-center justify-between mb-2">
                        <div class="font-medium text-gray-900">{item.item}</div>
                        <div class={`text-xs px-2 py-1 rounded-full ${item.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {item.status}
                        </div>
                      </div>
                      <div class="text-sm text-gray-600">
                        {item.action} • {item.domain} • {item.timestamp}
                      </div>
                      {#if item.error}
                        <div class="mt-2 text-xs text-red-600">
                          Error: {item.error}
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              {:else if activeTabId === 'conflicts'}
                <!-- Conflicts view -->
                <div class="space-y-4">
                  {#each conflictItems as conflict}
                    <div class="conflict-item p-4 border border-gray-200 rounded-lg">
                      <div class="flex items-center justify-between mb-3">
                        <div class="font-medium text-gray-900">{conflict.item}</div>
                        <div class={`text-xs px-2 py-1 rounded-full ${conflict.resolution === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                          {conflict.resolution}
                        </div>
                      </div>
                      <div class="text-sm text-gray-600 mb-3">
                        {conflict.details}
                      </div>
                      <div class="flex items-center justify-between text-sm text-gray-500">
                        <span>{conflict.domain} • {conflict.timestamp}</span>
                        {#if conflict.resolution === 'pending'}
                          <div class="flex gap-2">
                            <button
                              on:click={() => resolveConflict(conflict.id, 'mine')}
                              class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200"
                            >
                              Use My Version
                            </button>
                            <button
                              on:click={() => resolveConflict(conflict.id, 'theirs')}
                              class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200"
                            >
                              Use Their Version
                            </button>
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/each}
                </div>
              {:else if activeTabId === 'logs'}
                <!-- Logs view -->
                <div class="space-y-3">
                  {#each syncLogs as log}
                    <div class="log-item p-4 border border-gray-200 rounded-lg">
                      <div class="flex items-center justify-between mb-2">
                        <div class="font-medium text-gray-900">{log.action}</div>
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
                      <div class="mt-2 text-xs text-gray-500">
                        Domain: {log.domain}
                      </div>
                    </div>
                  {/each}
                </div>
              {:else if activeTabId === 'settings'}
                <!-- Settings view -->
                <div class="settings-content p-8 text-center border-2 border-dashed border-gray-300 rounded-xl">
                  <div class="text-4xl mb-4">⚙️</div>
                  <h4 class="text-lg font-medium text-gray-900 mb-2">Sync Settings</h4>
                  <p class="text-gray-600 mb-6">Configure sync behavior, conflict resolution, and retention rules</p>
                  <div class="flex gap-4 justify-center">
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Save Settings
                    </button>
                    <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      Reset to Defaults
                    </button>
                  </div>
                </div>
              {:else if activeTabId === 'domains'}
                <!-- Domains view -->
                <div class="domains-content p-8 text-center border-2 border-dashed border-gray-300 rounded-xl">
                  <div class="text-4xl mb-4">🌐</div>
                  <h4 class="text-lg font-medium text-gray-900 mb-2">Domain Sync Settings</h4>
                  <p class="text-gray-600 mb-6">Configure sync rules for each domain individually</p>
                  <div class="flex gap-4 justify-center">
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Configure All Domains
                    </button>
                    <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      View Domain Rules
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Right: Context pills -->
    <div class="sync-right">
      <ContextPills />
    </div>
  </div>
</div>

<style>
  .sync-shell {
    @apply h-full;
  }
  
  .sync-layout {
    @apply grid grid-cols-12 gap-4 h-full;
  }
  
  .sync-left {
    @apply col-span-3 border-r border-gray-200 p-4;
  }
  
  .sync-middle {
    @apply col-span-6 p-4 overflow-y-auto;
  }
  
  .sync-right {
    @apply col-span-3 border-l border-gray-200 p-4;
  }
  
  .sync-controls {
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
  
  .domain-status {
    @apply transition-colors hover:bg-gray-50;
  }
  
  .queue-item {
    @apply transition-all duration-200;
  }
  
  .queue-item:hover {
    @apply shadow-sm;
  }
  
  .conflict-item {
    @apply transition-colors hover:bg-gray-50;
  }
  
  .log-item {
    @apply transition-colors hover:bg-gray-50;
  }
</style>
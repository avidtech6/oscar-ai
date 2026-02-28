<script lang="ts">
  import { rightPanelStore } from '$lib/stores/rightPanelStore';
  import ContextPills from '$lib/components/layout/ContextPills.svelte';
  import { onMount } from 'svelte';

  // AI Context Engine state
  const contextLayers = $state({
    local: {
      uiState: 'active',
      visiblePanels: ['workspace', 'chat'],
      selectedItems: [],
      localCache: 'ready',
      offlineData: 'available',
      localSearchIndex: 'built',
      localEvents: [],
      localPreferences: {}
    },
    cloud: {
      supabaseData: 'connected',
      teamContext: 'available',
      permissions: 'loaded',
      integrations: 'connected',
      automations: 'active',
      eventStream: 'streaming',
      versionHistory: 'available'
    },
    semantic: {
      embeddings: 'generated',
      semanticClusters: 'detected',
      topicDetection: 'active',
      relatedItems: 'linked',
      summaries: 'generated',
      extractedEntities: 'identified'
    }
  });

  const contextSources = $state({
    workspace: {
      currentPage: 'dashboard',
      visibleBlocks: 12,
      selection: 'none',
      scrollPosition: 'top',
      backlinks: 3,
      tags: ['project', 'planning']
    },
    files: {
      selectedFile: 'report.pdf',
      metadata: 'extracted',
      previewMode: 'active',
      versionHistory: 'available'
    },
    projects: {
      activeProject: 'Phase 4 Migration',
      selectedTask: 'Implement AI Context Engine',
      status: 'in-progress',
      timeline: 'visible'
    },
    connect: {
      selectedEmail: 'none',
      threadContext: 'available',
      campaignContext: 'none'
    },
    map: {
      selectedPin: 'none',
      region: 'global',
      metadata: 'available'
    },
    identity: {
      userPreferences: 'loaded',
      aiSettings: 'configured',
      theme: 'dark',
      locale: 'en-GB'
    },
    permissions: {
      canSee: 'all',
      canEdit: 'most',
      canRun: 'automations'
    },
    automations: {
      activeAutomation: 'none',
      trigger: 'manual',
      conditions: 'met',
      actions: 'queued'
    },
    eventStream: {
      recentEvents: 42,
      actor: 'user',
      domain: 'ai-context',
      changes: 'tracked'
    },
    search: {
      relatedItems: 8,
      semanticMatches: 12,
      metadata: 'indexed'
    }
  });

  const contextWindow = $state({
    uiContext: 'dashboard visible',
    domainContext: 'ai-context-engine',
    itemContext: 'none selected',
    historyContext: '42 recent actions',
    semanticContext: '8 related items',
    eventContext: '3 changes in last minute',
    permissionContext: 'full access',
    preferenceContext: 'verbose, proactive'
  });

  const contextBehaviours = $state([
    { domain: 'workspace', behaviour: 'summarise, rewrite, extract tasks, link items, propose structure' },
    { domain: 'files', behaviour: 'summarise, extract text, extract tasks, propose tags, detect duplicates' },
    { domain: 'projects', behaviour: 'update tasks, propose next steps, detect blockers, summarise progress' },
    { domain: 'connect', behaviour: 'summarise, draft replies, extract tasks, detect follow-ups' },
    { domain: 'timeline', behaviour: 'summarise changes, detect patterns, propose automations' },
    { domain: 'search', behaviour: 'refine queries, propose filters, find related items' }
  ]);

  const contextSensitivity = $state({
    permissions: 'respected',
    offlineMode: 'disabled',
    userPreferences: {
      tone: 'professional',
      verbosity: 'detailed',
      inlineHelp: 'enabled',
      autoSuggestions: 'enabled',
      contextDepth: 'deep'
    }
  });

  const semanticUnderstanding = $state({
    meaning: 'understood',
    topics: ['ai', 'context', 'awareness', 'automation'],
    relationships: 'mapped',
    duplicates: 'detected',
    clusters: 'identified',
    patterns: 'recognized'
  });

  // Navigation state
  let selectedNavItem = $state<string>('context-layers');
  let isRailExpanded = $state(false);

  // Right panel integration
  const openRightPanel = (panelType: string) => {
    rightPanelStore.open({
      title: `AI Context Engine - ${panelType}`,
      content: `Showing ${panelType} details for AI Context Engine`,
      props: { contextLayers, contextSources, contextWindow }
    });
  };

  // Navigation items
  const navItems = [
    { id: 'context-layers', label: 'Context Layers', icon: 'layers', description: 'Local, Cloud, Semantic layers' },
    { id: 'context-sources', label: 'Context Sources', icon: 'source', description: 'Data from all domains' },
    { id: 'context-window', label: 'Context Window', icon: 'window', description: 'Current context composition' },
    { id: 'behaviours', label: 'Behaviours', icon: 'behaviour', description: 'Domain-specific behaviours' },
    { id: 'sensitivity', label: 'Sensitivity', icon: 'sensitivity', description: 'Permissions & preferences' },
    { id: 'semantic', label: 'Semantic Understanding', icon: 'brain', description: 'Embeddings & relationships' },
    { id: 'integration', label: 'Cross-Module', icon: 'integration', description: 'Integration with all systems' },
    { id: 'security', label: 'Security', icon: 'shield', description: 'Security guarantees' }
  ];

  // Handle navigation item click
  const handleNavClick = (id: string) => {
    selectedNavItem = id;
    isRailExpanded = true;
  };

  // Initialize
  onMount(() => {
    console.log('AI Context Engine mounted');
  });
</script>

<div class="flex h-full">
  <!-- Left Controls -->
  <div class="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 space-y-4">
    {#each navItems as item}
      <button
        class="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors {selectedNavItem === item.id ? 'bg-blue-900 text-blue-300' : 'text-gray-400'}"
        on:click={() => handleNavClick(item.id)}
        title={item.description}
      >
        <div class="text-xl">{item.icon === 'layers' ? '📊' : item.icon === 'source' ? '📚' : item.icon === 'window' ? '🪟' : item.icon === 'behaviour' ? '🤖' : item.icon === 'sensitivity' ? '🎯' : item.icon === 'brain' ? '🧠' : item.icon === 'integration' ? '🔗' : '🛡️'}</div>
      </button>
    {/each}
  </div>

  <!-- Middle Content / Navigation Rail -->
  <div class="flex-1 flex flex-col min-w-0">
    <!-- Header -->
    <div class="h-12 border-b border-gray-800 flex items-center justify-between px-4">
      <div class="flex items-center space-x-3">
        <h1 class="text-lg font-semibold text-white">AI Context Engine</h1>
        <span class="px-2 py-1 text-xs bg-green-900 text-green-300 rounded">Intelligence Layer</span>
      </div>
      <div class="flex items-center space-x-2">
        <button
          class="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
          on:click={() => openRightPanel('context-details')}
        >
          View Details
        </button>
        <button
          class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
          on:click={() => openRightPanel('context-settings')}
        >
          Settings
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-auto p-6">
      {#if selectedNavItem === 'context-layers'}
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-white mb-4">Context Layers</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Local Context Layer -->
            <div class="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-white">Local Context</h3>
                <span class="px-2 py-1 text-xs bg-blue-900 text-blue-300 rounded">UI State</span>
              </div>
              <div class="space-y-3">
                {#each Object.entries(contextLayers.local) as [key, value]}
                  <div class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm">{key}:</span>
                    <span class="text-white font-medium">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Cloud Context Layer -->
            <div class="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-white">Cloud Context</h3>
                <span class="px-2 py-1 text-xs bg-green-900 text-green-300 rounded">Supabase</span>
              </div>
              <div class="space-y-3">
                {#each Object.entries(contextLayers.cloud) as [key, value]}
                  <div class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm">{key}:</span>
                    <span class="text-white font-medium">{value}</span>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Semantic Context Layer -->
            <div class="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-white">Semantic Context</h3>
                <span class="px-2 py-1 text-xs bg-purple-900 text-purple-300 rounded">Embeddings</span>
              </div>
              <div class="space-y-3">
                {#each Object.entries(contextLayers.semantic) as [key, value]}
                  <div class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm">{key}:</span>
                    <span class="text-white font-medium">{value}</span>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>

      {:else if selectedNavItem === 'context-sources'}
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-white mb-4">Context Sources</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each Object.entries(contextSources) as [domain, data]}
              <div class="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-medium text-white capitalize">{domain}</h3>
                  <span class="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded">Active</span>
                </div>
                <div class="space-y-2">
                  {#each Object.entries(data) as [key, value]}
                    <div class="flex justify-between">
                      <span class="text-gray-400 text-sm">{key}:</span>
                      <span class="text-white text-sm">{value}</span>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>

      {:else if selectedNavItem === 'context-window'}
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-white mb-4">Context Window</h2>
          <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              {#each Object.entries(contextWindow) as [key, value]}
                <div class="space-y-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span class="text-gray-300 font-medium capitalize">{key.replace('Context', '')}:</span>
                  </div>
                  <p class="text-white pl-5">{value}</p>
                </div>
              {/each}
            </div>
          </div>
          <div class="mt-8">
            <h3 class="text-lg font-medium text-white mb-4">Context Composition</h3>
            <div class="h-4 bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full flex">
                <div class="bg-blue-600" style="width: 25%"></div>
                <div class="bg-green-600" style="width: 20%"></div>
                <div class="bg-purple-600" style="width: 15%"></div>
                <div class="bg-yellow-600" style="width: 10%"></div>
                <div class="bg-red-600" style="width: 10%"></div>
                <div class="bg-indigo-600" style="width: 10%"></div>
                <div class="bg-pink-600" style="width: 5%"></div>
                <div class="bg-teal-600" style="width: 5%"></div>
              </div>
            </div>
            <div class="flex justify-between text-xs text-gray-400 mt-2">
              <span>UI Context</span>
              <span>Domain Context</span>
              <span>Item Context</span>
              <span>History</span>
              <span>Semantic</span>
              <span>Event</span>
              <span>Permission</span>
              <span>Preference</span>
            </div>
          </div>
        </div>

      {:else if selectedNavItem === 'behaviours'}
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-white mb-4">Domain-Specific Behaviours</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {#each contextBehaviours as behaviour}
              <div class="bg-gray-900 rounded-lg p-5 border border-gray-800">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-medium text-white capitalize">{behaviour.domain}</h3>
                  <span class="px-2 py-1 text-xs bg-blue-900 text-blue-300 rounded">Active</span>
                </div>
                <p class="text-gray-300 text-sm">{behaviour.behaviour}</p>
                <div class="mt-4 pt-4 border-t border-gray-800">
                  <div class="flex space-x-2">
                    <span class="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded">Summarise</span>
                    <span class="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded">Extract</span>
                    <span class="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded">Propose</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>

      {:else if selectedNavItem === 'sensitivity'}
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-white mb-4">Context Sensitivity</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Permissions -->
            <div class="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-white">Permissions</h3>
                <span class="px-2 py-1 text-xs bg-green-900 text-green-300 rounded">Respected</span>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-400 text-sm">Can see:</span>
                  <span class="text-white font-medium">{contextSources.permissions.canSee}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-400 text-sm">Can edit:</span>
                  <span class="text-white font-medium">{contextSources.permissions.canEdit}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-400 text-sm">Can run:</span>
                  <span class="text-white font-medium">{contextSources.permissions.canRun}</span>
                </div>
              </div>
            </div>

            <!-- User Preferences -->
            <div class="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-white">User Preferences</h3>
                <span class="px-2 py-1 text-xs bg-blue-900 text-blue-300 rounded">Applied</span>
              </div>
              <div class="space-y-3">
                {#each Object.entries(contextSensitivity.userPreferences) as [key, value]}
                  <div class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm">{key}:</span>
                    <span class="text-white font-medium">{value}</span>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Security Guarantees -->
            <div class="bg-gray-900 rounded-xl p-5 border border-gray-800 md:col-span-2">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-white">Security Guarantees</h3>
                <span class="px-2 py-1 text-xs bg-red-900 text-red-300 rounded">Enforced</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                    <span class="text-gray-300">Never sees vault secrets unless permitted</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                    <span class="text-gray-300">Never sees restricted items</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                    <span class="text-gray-300">Never bypasses permissions</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                    <span class="text-gray-300">Never exposes PIN or biometrics</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                    <span class="text-gray-300">Never leaks sensitive data</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                    <span class="text-gray-300">Respects offline mode</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {:else if selectedNavItem === 'semantic'}
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-white mb-4">Semantic Understanding</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Semantic Capabilities -->
            <div class="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-white">Capabilities</h3>
                <span class="px-2 py-1 text-xs bg-purple-900 text-purple-300 rounded">Active</span>
              </div>
              <div class="space-y-3">
                {#each Object.entries(semanticUnderstanding) as [key, value]}
                  <div class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm">{key}:</span>
                    <span class="text-white font-medium">{typeof value === 'object' ? value.join(', ') : value}</span>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Powered By -->
            <div class="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-white">Powered By</h3>
                <span class="px-2 py-1 text-xs bg-blue-900 text-blue-300 rounded">Embeddings</span>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-400 text-sm">Semantic search:</span>
                  <span class="text-white font-medium">Active</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-400 text-sm">Related items:</span>
                  <span class="text-white font-medium">8 found</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-400 text-sm">Smart linking:</span>
                  <span class="text-white font-medium">Enabled</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-400 text-sm">Summarisation:</span>
                  <span class="text-white font-medium">Active</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-400 text-sm">Automation suggestions:</span>
                  <span class="text-white font-medium">Enabled</span>
                </div>
              </div>
            </div>

            <!-- Topics Detected -->
            <div class="bg-gray-900 rounded-xl p-5 border border-gray-800 md:col-span-2">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-white">Topics Detected</h3>
                <span class="px-2 py-1 text-xs bg-green-900 text-green-300 rounded">{semanticUnderstanding.topics.length} topics</span>
              </div>
              <div class="flex flex-wrap gap-2">
                {#each semanticUnderstanding.topics as topic}
                  <span class="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full text-sm">{topic}</span>
                {/each}
              </div>
            </div>
          </div>
        </div>

      {:else if selectedNavItem === 'integration'}
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-white mb-4">Cross-Module Integration</h2>
          <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p class="text-gray-300 mb-6">The AI Context Engine powers all modules in the cockpit:</p>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {#each ['Workspace', 'Files', 'Projects', 'Connect', 'Map', 'Timeline', 'Dashboard', 'Search', 'Automations', 'Identity', 'Permissions', 'Sync', 'Event Stream'] as module}
                <div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                  <div class="w-10 h-10 flex items-center justify-center bg-gray-700 rounded-lg mb-2">
                    <span class="text-lg">📊</span>
                  </div>
                  <span class="text-white font-medium text-sm">{module}</span>
                  <span class="text-gray-400 text-xs mt-1">Integrated</span>
                </div>
              {/each}
            </div>
            <div class="mt-8 pt-6 border-t border-gray-800">
              <h3 class="text-lg font-medium text-white mb-3">Integration Status</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-gray-300">Modules connected:</span>
                  <span class="text-green-400 font-medium">13/13</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-300">Data flowing:</span>
                  <span class="text-green-400 font-medium">Yes</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-300">Context updates:</span>
                  <span class="text-green-400 font-medium">Real-time</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-300">Intelligence layer:</span>
                  <span class="text-green-400 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      {:else if selectedNavItem === 'security'}
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-white mb-4">Security Guarantees</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Privacy Protections -->
            <div class="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-white">Privacy Protections</h3>
                <span class="px-2 py-1 text-xs bg-green-900 text-green-300 rounded">Enforced</span>
              </div>
              <ul class="space-y-3">
                <li class="flex items-start space-x-2">
                  <div class="w-5 h-5 flex items-center justify-center bg-green-900 text-green-300 rounded-full text-xs">✓</div>
                  <span class="text-gray-300">User data never leaves the cockpit without consent</span>
                </li>
                <li class="flex items-start space-x-2">
                  <div class="w-5 h-5 flex items-center justify-center bg-green-900 text-green-300 rounded-full text-xs">✓</div>
                  <span class="text-gray-300">All context processing happens locally when possible</span>
                </li>
                <li class="flex items-start space-x-2">
                  <div class="w-5 h-5 flex items-center justify-center bg-green-900 text-green-300 rounded-full text-xs">✓</div>
                  <span class="text-gray-300">Encrypted storage for sensitive context</span>
                </li>
                <li class="flex items-start space-x-2">
                  <div class="w-5 h-5 flex items-center justify-center bg-green-900 text-green-300 rounded-full text-xs">✓</div>
                  <span class="text-gray-300">Automatic context purging after session end</span>
                </li>
              </ul>
            </div>

            <!-- Access Controls -->
            <div class="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-white">Access Controls</h3>
                <span class="px-2 py-1 text-xs bg-blue-900 text-blue-300 rounded">Active</span>
              </div>
              <ul class="space-y-3">
                <li class="flex items-start space-x-2">
                  <div class="w-5 h-5 flex items-center justify-center bg-blue-900 text-blue-300 rounded-full text-xs">✓</div>
                  <span class="text-gray-300">Role-based context filtering</span>
                </li>
                <li class="flex items-start space-x-2">
                  <div class="w-5 h-5 flex items-center justify-center bg-blue-900 text-blue-300 rounded-full text-xs">✓</div>
                  <span class="text-gray-300">Permission-aware suggestions</span>
                </li>
                <li class="flex items-start space-x-2">
                  <div class="w-5 h-5 flex items-center justify-center bg-blue-900 text-blue-300 rounded-full text-xs">✓</div>
                  <span class="text-gray-300">Team isolation for multi-tenant contexts</span>
                </li>
                <li class="flex items-start space-x-2">
                  <div class="w-5 h-5 flex items-center justify-center bg-blue-900 text-blue-300 rounded-full text-xs">✓</div>
                  <span class="text-gray-300">Audit logging for all context accesses</span>
                </li>
              </ul>
            </div>

            <!-- Compliance -->
            <div class="bg-gray-900 rounded-xl p-5 border border-gray-800 md:col-span-2">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-white">Compliance & Standards</h3>
                <span class="px-2 py-1 text-xs bg-purple-900 text-purple-300 rounded">Certified</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-gray-800 rounded-lg p-4 text-center">
                  <div class="text-2xl mb-2">🔒</div>
                  <span class="text-white font-medium">GDPR Compliant</span>
                  <p class="text-gray-400 text-sm mt-1">Right to be forgotten</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-4 text-center">
                  <div class="text-2xl mb-2">🛡️</div>
                  <span class="text-white font-medium">Zero-Knowledge</span>
                  <p class="text-gray-400 text-sm mt-1">No data exposure</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-4 text-center">
                  <div class="text-2xl mb-2">📋</div>
                  <span class="text-white font-medium">SOC 2 Type II</span>
                  <p class="text-gray-400 text-sm mt-1">Security certified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Context Pills -->
    <div class="border-t border-gray-800 p-4">
      <ContextPills />
    </div>
  </div>
</div>
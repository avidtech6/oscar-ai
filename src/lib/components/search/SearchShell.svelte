<script lang="ts">
  import ContextPills from '$lib/components/layout/ContextPills.svelte';
  import { rightPanelStore } from '$lib/stores/rightPanelStore';
  
  type SearchTab = 'all' | 'workspace' | 'files' | 'projects' | 'connect' | 'map' | 'automations' | 'events' | 'people';
  type SearchType = 'keyword' | 'semantic' | 'filtered' | 'relational';
  
  // Search domains
  const searchDomains = [
    { id: 'workspace', name: 'Workspace', description: 'Pages, blocks, notes, and documents', icon: '📄', color: 'bg-blue-100 text-blue-800' },
    { id: 'files', name: 'Files', description: 'Documents, images, PDFs, and media', icon: '📁', color: 'bg-green-100 text-green-800' },
    { id: 'projects', name: 'Projects', description: 'Tasks, milestones, and project content', icon: '📋', color: 'bg-purple-100 text-purple-800' },
    { id: 'connect', name: 'Connect', description: 'Emails, contacts, and campaigns', icon: '📧', color: 'bg-amber-100 text-amber-800' },
    { id: 'map', name: 'Map', description: 'Map pins, locations, and coordinates', icon: '🗺️', color: 'bg-red-100 text-red-800' },
    { id: 'automations', name: 'Automations', description: 'Automation rules and triggers', icon: '⚙️', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'events', name: 'Events', description: 'Event stream and activity logs', icon: '📊', color: 'bg-pink-100 text-pink-800' },
    { id: 'people', name: 'People', description: 'Team members and contacts', icon: '👥', color: 'bg-cyan-100 text-cyan-800' }
  ];
  
  // Search types
  const searchTypes = [
    { id: 'keyword', name: 'Keyword Search', description: 'Fast full-text search across all content', icon: '🔍', color: 'bg-blue-100 text-blue-800' },
    { id: 'semantic', name: 'Semantic Search', description: 'Meaning-based search using embeddings', icon: '🧠', color: 'bg-purple-100 text-purple-800' },
    { id: 'filtered', name: 'Filtered Search', description: 'Search with domain, date, and tag filters', icon: '🎯', color: 'bg-green-100 text-green-800' },
    { id: 'relational', name: 'Relational Search', description: 'Find related items across domains', icon: '🔗', color: 'bg-amber-100 text-amber-800' }
  ];
  
  // Sample search results
  const searchResults = [
    {
      id: '1',
      title: 'Q4 Marketing Strategy',
      snippet: 'Complete marketing strategy document for Q4 2024 including campaign timelines and budget allocations.',
      domain: 'workspace',
      type: 'document',
      lastModified: '2024-03-15T10:30:00Z',
      tags: ['marketing', 'strategy', 'q4'],
      relevance: 0.95,
      quickActions: ['Open', 'Share', 'Copy Link']
    },
    {
      id: '2',
      title: 'Invoice_2024_03.pdf',
      snippet: 'Invoice for March 2024 services totaling $1,250.00 from Acme Corp.',
      domain: 'files',
      type: 'pdf',
      lastModified: '2024-03-20T14:45:00Z',
      tags: ['invoice', 'finance', 'acme'],
      relevance: 0.88,
      quickActions: ['Open', 'Download', 'Archive']
    }
  ];
  
  const tabs = [
    { id: 'all', title: 'All Results', description: 'Search results from all domains', icon: '🌐' },
    { id: 'workspace', title: 'Workspace', description: 'Pages, blocks, and documents', icon: '📄' },
    { id: 'files', title: 'Files', description: 'Documents and media files', icon: '📁' },
    { id: 'projects', title: 'Projects', description: 'Tasks and project content', icon: '📋' },
    { id: 'connect', title: 'Connect', description: 'Emails and communications', icon: '📧' },
    { id: 'map', title: 'Map', description: 'Locations and map pins', icon: '🗺️' },
    { id: 'automations', title: 'Automations', description: 'Automation rules', icon: '⚙️' },
    { id: 'events', title: 'Events', description: 'Activity and event logs', icon: '📊' },
    { id: 'people', title: 'People', description: 'Team members and contacts', icon: '👥' }
  ];
  
  let selectedResult = $state<typeof searchResults[0] | null>(null);
  let activeTabId = $state<SearchTab>('all');
  let searchQuery = $state<string>('marketing strategy');
  let searchTypeId = $state<SearchType>('keyword');
  let selectedDomains = $state<string[]>(['workspace', 'files', 'projects']);
  let dateFilter = $state<string>('last-week');
  let tagFilter = $state<string>('');
  
  const currentTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const currentSearchType = searchTypes.find(t => t.id === searchTypeId) || searchTypes[0];
  
  const filteredResults = (() => {
    let filtered = searchResults;
    
    // Filter by tab
    if (activeTabId !== 'all') {
      filtered = filtered.filter(r => r.domain === activeTabId);
    }
    
    // Filter by selected domains
    if (selectedDomains.length > 0 && activeTabId === 'all') {
      filtered = filtered.filter(r => selectedDomains.includes(r.domain));
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.snippet.toLowerCase().includes(query) ||
        r.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort by relevance
    filtered.sort((a, b) => b.relevance - a.relevance);
    
    return filtered;
  })();
  
  function handleResultClick(result: typeof searchResults[0]) {
    selectedResult = result;
    rightPanelStore.open({
      title: result.title,
      content: `Search Result: ${result.title}`
    });
  }
  
  function clearSelection() {
    selectedResult = null;
    rightPanelStore.close();
  }
  
  function performSearch() {
    console.log('Performing search:', {
      query: searchQuery,
      type: searchTypeId,
      domains: selectedDomains,
      dateFilter,
      tagFilter
    });
  }
  
  function toggleDomain(domainId: string) {
    if (selectedDomains.includes(domainId)) {
      selectedDomains = selectedDomains.filter(id => id !== domainId);
    } else {
      selectedDomains = [...selectedDomains, domainId];
    }
  }
  
  function getDomainInfo(domainId: string) {
    return searchDomains.find(d => d.id === domainId) || searchDomains[0];
  }
  
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  
  function getRelevanceColor(relevance: number) {
    if (relevance >= 0.9) return 'bg-green-100 text-green-800';
    if (relevance >= 0.7) return 'bg-blue-100 text-blue-800';
    if (relevance >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  }
  
  function getDomainColor(domainId: string) {
    const domain = getDomainInfo(domainId);
    return domain.color;
  }
  
  $effect(() => {
    if (searchQuery) {
      performSearch();
    }
  });
</script>

<div class="search-shell">
  <div class="search-layout">
    <!-- Left: Search controls and filters -->
    <div class="search-left">
      <div class="search-controls">
        <div class="header mb-6">
          <h3 class="font-semibold text-gray-900 mb-2">Search & Indexing</h3>
          <p class="text-sm text-gray-600">Unified, local‑first, cross‑domain search engine</p>
        </div>
        
        <div class="stats mb-6 p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500">Indexed Items</div>
              <div class="text-2xl font-bold text-gray-900">1,247</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Search Speed</div>
              <div class="text-2xl font-bold text-gray-900">42ms</div>
            </div>
          </div>
        </div>
        
        <div class="search-input mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Search Query</div>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search across all domains..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
              on:keydown={(e) => e.key === 'Enter' && performSearch()}
            />
          </div>
        </div>
        
        <div class="search-types mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Search Type</div>
          <div class="flex flex-col gap-2">
            {#each searchTypes as type}
              <button
                class:active={searchTypeId === type.id}
                on:click={() => { searchTypeId = type.id as SearchType; performSearch(); }}
                class="px-3 py-2 rounded-lg text-sm transition-colors text-left flex items-center gap-2"
              >
                <span class="text-lg">{type.icon}</span>
                <span>{type.name}</span>
              </button>
            {/each}
          </div>
        </div>
        
        <div class="domain-filters mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Search Domains</div>
          <div class="flex flex-col gap-2">
            {#each searchDomains as domain}
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`domain-${domain.id}`}
                  checked={selectedDomains.includes(domain.id)}
                  on:change={() => toggleDomain(domain.id)}
                  class="rounded border-gray-300"
                />
                <label for={`domain-${domain.id}`} class="flex items-center gap-2 text-sm cursor-pointer">
                  <span class="text-lg">{domain.icon}</span>
                  <span>{domain.name}</span>
                </label>
              </div>
            {/each}
          </div>
        </div>
        
        <div class="date-filter mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Date Range</div>
          <select
            bind:value={dateFilter}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all-time">All Time</option>
            <option value="today">Today</option>
            <option value="last-week">Last Week</option>
            <option value="last-month">Last Month</option>
            <option value="last-year">Last Year</option>
          </select>
        </div>
        
        <div class="tag-filter mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Tag Filter</div>
          <input
            type="text"
            bind:value={tagFilter}
            placeholder="Enter tags separated by commas..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        
        <div class="quick-actions mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Quick Actions</div>
          <div class="space-y-2">
            <button 
              on:click={performSearch}
              class="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 text-left"
            >
              🔍 Search Now
            </button>
            <button class="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 text-left">
              ⚙️ Indexing Settings
            </button>
            <button class="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 text-left">
              📊 View Search Analytics
            </button>
          </div>
        </div>
        
        <div class="info">
          <div class="text-xs text-gray-500">
            {filteredResults.length} results
            {#if searchQuery}
              <span class="ml-2">for "{searchQuery}"</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Middle: Search results -->
    <div class="search-middle" class:navigation-rail={selectedResult !== null}>
      {#if selectedResult}
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
            Showing related search results
          </div>
        </div>
        <div class="navigation-rail-content">
          {#each filteredResults.filter((r: any) => r.id !== selectedResult?.id).slice(0, 3) as result}
            <div
              class="rail-item p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
              on:click={() => handleResultClick(result)}
            >
              <div class="flex items-center justify-between mb-2">
                <div class="font-medium text-gray-900">{result.title}</div>
                <div class={`text-xs px-2 py-1 rounded-full ${getRelevanceColor(result.relevance)}`}>
                  {Math.round(result.relevance * 100)}%
                </div>
              </div>
              <div class="text-sm text-gray-600">
                {result.snippet.substring(0, 80)}...
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="search-content">
          <div class="search-header mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Search & Indexing</h2>
            <p class="text-gray-600 mt-2">Unified, local‑first, cross‑domain search engine that indexes all content across all modules</p>
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
              <!-- Search results -->
              <div class="space-y-4">
                {#if filteredResults.length > 0}
                  {#each filteredResults as result}
                    <div
                      class="result-card p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/30"
                      on:click={() => handleResultClick(result)}
                    >
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3">
                          <div class={`w-10 h-10 rounded-lg ${getDomainColor(result.domain)} flex items-center justify-center text-lg`}>
                            {getDomainInfo(result.domain).icon}
                          </div>
                          <div>
                            <h4 class="font-bold text-gray-900">{result.title}</h4>
                            <p class="text-sm text-gray-600">{result.snippet}</p>
                          </div>
                        </div>
                        <div class={`text-xs px-2 py-1 rounded-full ${getRelevanceColor(result.relevance)}`}>
                          {Math.round(result.relevance * 100)}% relevant
                        </div>
                      </div>
                      
                      <div class="result-details mt-3">
                        <div class="flex items-center gap-4 text-sm text-gray-500">
                          <div class="flex items-center gap-1">
                            <span>Domain:</span>
                            <span class="font-medium">{getDomainInfo(result.domain).name}</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <span>Modified:</span>
                            <span class="font-medium">{formatDate(result.lastModified)}</span>
                          </div>
                        </div>
                        <div class="mt-2 flex flex-wrap gap-1">
                          {#each result.tags as tag}
                            <span class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                              {tag}
                            </span>
                          {/each}
                        </div>
                        <div class="mt-3 flex gap-2">
                          {#each result.quickActions.slice(0, 2) as action}
                            <button class="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                              {action}
                            </button>
                          {/each}
                        </div>
                      </div>
                    </div>
                  {/each}
                {:else}
                  <div class="p-8 text-center border-2 border-dashed border-gray-300 rounded-xl">
                    <div class="text-4xl mb-4">🔍</div>
                    <h4 class="text-lg font-medium text-gray-900 mb-2">No results found</h4>
                    <p class="text-gray-600 mb-6">Try adjusting your search query or filters</p>
                    <button
                      on:click={() => { searchQuery = ''; selectedDomains = searchDomains.map(d => d.id); }}
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Clear Filters
                    </button>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Right: Context pills -->
    <div class="search-right">
      <ContextPills />
    </div>
  </div>
</div>

<style>
  .search-shell {
    @apply h-full;
  }
  
  .search-layout {
    @apply grid grid-cols-12 gap-4 h-full;
  }
  
  .search-left {
    @apply col-span-3 border-r border-gray-200 p-4;
  }
  
  .search-middle {
    @apply col-span-6 p-4 overflow-y-auto;
  }
  
  .search-right {
    @apply col-span-3 border-l border-gray-200 p-4;
  }
  
  .search-controls {
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
  
  .result-card {
    @apply transition-all duration-200;
  }
  
  .result-card:hover {
    @apply shadow-sm;
  }
</style>
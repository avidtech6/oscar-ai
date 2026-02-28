<script lang="ts">
  import { page } from '$app/stores';
  
  // Domain definitions with icons and colors
  const domains = [
    { id: 'home', label: 'Home', icon: '🏠', color: 'bg-blue-100 text-blue-800', href: '/' },
    { id: 'workspace', label: 'Workspace', icon: '📁', color: 'bg-green-100 text-green-800', href: '/workspace' },
    { id: 'files', label: 'Files', icon: '📄', color: 'bg-purple-100 text-purple-800', href: '/files' },
    { id: 'connect', label: 'Connect', icon: '📧', color: 'bg-amber-100 text-amber-800', href: '/connect' },
    { id: 'map', label: 'Map', icon: '🗺️', color: 'bg-red-100 text-red-800', href: '/map' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', color: 'bg-indigo-100 text-indigo-800', href: '/dashboard' },
    { id: 'recent', label: 'Recent', icon: '🕒', color: 'bg-gray-100 text-gray-800', href: '/recent' }
  ];
  
  // Current domain based on route
  $: currentDomain = domains.find(d => $page.url.pathname.startsWith(d.href)) || domains[0];
  
  // Filter out current domain for pills
  $: availableDomains = domains.filter(d => d.id !== currentDomain.id);
  
  // Sample current item context (in a real app, this would come from a store)
  let currentItem = {
    title: 'Oak Tree Health Report',
    type: 'report',
    domain: 'workspace'
  };
</script>

<div class="context-pills-container">
  <!-- Current context indicator -->
  <div class="current-context mb-4 p-4 bg-white border border-gray-200 rounded-lg">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg {currentDomain.color} flex items-center justify-center text-lg">
          {currentDomain.icon}
        </div>
        <div>
          <div class="text-sm text-gray-500">Currently in</div>
          <div class="font-medium text-gray-900">{currentDomain.label}</div>
          {#if currentItem.title}
            <div class="text-sm text-gray-600 mt-1">
              Viewing: <span class="font-medium">{currentItem.title}</span> ({currentItem.type})
            </div>
          {/if}
        </div>
      </div>
      <div class="text-sm text-gray-500">
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  </div>
  
  <!-- Context pills for quick domain switching -->
  <div class="context-pills-section">
    <div class="flex items-center justify-between mb-3">
      <div class="text-sm font-medium text-gray-700">Switch to another domain</div>
      <div class="text-xs text-gray-500">{availableDomains.length} available</div>
    </div>
    
    <div class="flex flex-wrap gap-2">
      {#each availableDomains as domain}
        <a
          href={domain.href}
          class="context-pill {domain.color} border border-transparent hover:border-gray-300 transition-all duration-200"
          title={`Switch to ${domain.label}`}
        >
          <span class="context-pill-icon">{domain.icon}</span>
          <span class="context-pill-label">{domain.label}</span>
          <span class="context-pill-arrow">→</span>
        </a>
      {/each}
    </div>
    
    <!-- Quick actions -->
    <div class="mt-6 pt-4 border-t border-gray-100">
      <div class="text-sm font-medium text-gray-700 mb-3">Quick actions</div>
      <div class="flex flex-wrap gap-2">
        <button
          class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
          on:click={() => console.log('Create new item')}
        >
          + New item
        </button>
        <button
          class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
          on:click={() => console.log('Search')}
        >
          🔍 Search
        </button>
        <button
          class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
          on:click={() => console.log('Recent items')}
        >
          📋 Recent
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .context-pills-container {
    padding: 1rem;
  }
  
  .context-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
  }
  
  .context-pill:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .context-pill-icon {
    font-size: 1rem;
  }
  
  .context-pill-label {
    white-space: nowrap;
  }
  
  .context-pill-arrow {
    opacity: 0;
    transform: translateX(-4px);
    transition: all 0.2s ease;
  }
  
  .context-pill:hover .context-pill-arrow {
    opacity: 1;
    transform: translateX(0);
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .context-pills-container {
      padding: 0.75rem;
    }
    
    .context-pill {
      padding: 0.5rem 0.75rem;
      font-size: 0.8125rem;
    }
    
    .current-context {
      padding: 0.75rem;
    }
  }
</style>
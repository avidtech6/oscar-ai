<script lang="ts">
  import ContextPills from '$lib/components/layout/ContextPills.svelte';
  import { rightPanelStore } from '$lib/stores/rightPanelStore';
  
  type ProfilePanel = 'personal-info' | 'preferences' | 'ai-preferences' | 'connected-accounts' | 'security' | 'organisation' | 'billing' | 'storage' | 'integrations';
  
  const userProfile = {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: 'AJ',
    organisation: 'Digital Solutions Inc.'
  };
  
  const profilePanels = [
    { id: 'personal-info', title: 'Personal Info', description: 'Your name, email, timezone, and signature', icon: '👤' },
    { id: 'preferences', title: 'Preferences', description: 'UI appearance and behavior settings', icon: '⚙️' },
    { id: 'ai-preferences', title: 'AI Preferences', description: 'Control how Oscar interacts with you', icon: '🤖' },
    { id: 'connected-accounts', title: 'Connected Accounts', description: 'External services linked to your account', icon: '🔗' },
    { id: 'security', title: 'Security', description: 'PIN, biometrics, and session management', icon: '🔒' },
    { id: 'organisation', title: 'Organisation', description: 'Team settings and member management', icon: '👥' },
    { id: 'billing', title: 'Billing', description: 'Subscription plan and payment details', icon: '💰' },
    { id: 'storage', title: 'Storage', description: 'Storage usage across domains', icon: '📊' },
    { id: 'integrations', title: 'Integrations', description: 'Global view of all provider connections', icon: '🔌' }
  ];
  
  let selectedPanel = $state<typeof profilePanels[0] | null>(null);
  let activePanelId = $state<ProfilePanel>('personal-info');
  let searchQuery = $state<string>('');
  
  const currentPanel = profilePanels.find(p => p.id === activePanelId) || profilePanels[0];
  
  const filteredPanels = (() => {
    if (!searchQuery) return profilePanels;
    const query = searchQuery.toLowerCase();
    return profilePanels.filter(panel =>
      panel.title.toLowerCase().includes(query) ||
      panel.description.toLowerCase().includes(query)
    );
  })();
  
  function handlePanelClick(panel: typeof profilePanels[0]) {
    selectedPanel = panel;
    activePanelId = panel.id as ProfilePanel;
    rightPanelStore.open({
      title: panel.title,
      content: `Profile panel: ${panel.title}`
    });
  }
  
  function clearSelection() {
    selectedPanel = null;
    rightPanelStore.close();
  }
</script>

<div class="identity-shell">
  <div class="identity-layout">
    <!-- Left: Profile panels navigation -->
    <div class="identity-left">
      <div class="identity-controls">
        <div class="user-header mb-6">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-lg">
              {userProfile.avatar || userProfile.name.charAt(0)}
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{userProfile.name}</h3>
              <div class="text-sm text-gray-600">{userProfile.email}</div>
            </div>
          </div>
          <div class="text-xs text-gray-500">
            {userProfile.organisation || 'Personal Account'}
          </div>
        </div>
        
        <div class="panels-navigation mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Profile Panels</div>
          <div class="flex flex-col gap-2">
            {#each filteredPanels as panel}
              <button
                class:active={activePanelId === panel.id}
                on:click={() => { activePanelId = panel.id as ProfilePanel; clearSelection(); }}
                class="px-3 py-2 rounded-lg text-sm transition-colors text-left flex items-center gap-2"
              >
                <span class="text-lg">{panel.icon}</span>
                <span>{panel.title}</span>
              </button>
            {/each}
          </div>
        </div>
        
        <div class="search mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Search Settings</div>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search profile settings..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        
        <div class="quick-actions mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Quick Actions</div>
          <div class="space-y-2">
            <button class="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 text-left">
              Edit Profile
            </button>
            <button class="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 text-left">
              Security Settings
            </button>
            <button class="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 text-left">
              Manage Devices
            </button>
          </div>
        </div>
        
        <div class="stats">
          <div class="text-sm text-gray-600">
            {filteredPanels.length} panels
            {#if searchQuery}
              <span class="ml-2">(filtered)</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Middle: Profile content (becomes navigation rail when panel is selected) -->
    <div class="identity-middle" class:navigation-rail={selectedPanel !== null}>
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
            Showing related profile panels
          </div>
        </div>
        <div class="navigation-rail-content">
          {#each filteredPanels.filter((p: any) => p.id !== selectedPanel?.id).slice(0, 5) as panel}
            <div
              class="rail-item p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
              on:click={() => handlePanelClick(panel)}
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">{panel.icon}</span>
                <div class="font-medium text-gray-900">{panel.title}</div>
              </div>
              <div class="text-sm text-gray-600">
                {panel.description}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="identity-content">
          <div class="identity-header mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Identity & User Profile</h2>
            <p class="text-gray-600 mt-2">Authentication, personalisation, and security layer for your account</p>
          </div>
          
          <div class="current-panel bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div class="panel-header mb-6">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl">{currentPanel.icon}</span>
                <h3 class="text-xl font-bold text-gray-900">{currentPanel.title}</h3>
              </div>
              <p class="text-gray-700">{currentPanel.description}</p>
            </div>
            
            <div class="panel-content">
              <div class="space-y-4">
                <div class="field-row p-4 bg-white/70 border border-gray-200 rounded-lg">
                  <div class="flex items-center justify-between mb-2">
                    <label class="text-sm font-medium text-gray-900">Name</label>
                    <button class="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                  </div>
                  <div class="text-gray-700">{userProfile.name}</div>
                </div>
                
                <div class="field-row p-4 bg-white/70 border border-gray-200 rounded-lg">
                  <div class="flex items-center justify-between mb-2">
                    <label class="text-sm font-medium text-gray-900">Email</label>
                    <button class="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                  </div>
                  <div class="text-gray-700">{userProfile.email}</div>
                </div>
                
                <div class="field-row p-4 bg-white/70 border border-gray-200 rounded-lg">
                  <div class="flex items-center justify-between mb-2">
                    <label class="text-sm font-medium text-gray-900">Timezone</label>
                    <button class="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                  </div>
                  <div class="text-gray-700">Europe/London</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Right: Context pills -->
    <div class="identity-right">
      <ContextPills />
    </div>
  </div>
</div>

<style>
  .identity-shell {
    @apply h-full;
  }
  
  .identity-layout {
    @apply grid grid-cols-12 gap-4 h-full;
  }
  
  .identity-left {
    @apply col-span-3 border-r border-gray-200 p-4;
  }
  
  .identity-middle {
    @apply col-span-6 p-4 overflow-y-auto;
  }
  
  .identity-right {
    @apply col-span-3 border-l border-gray-200 p-4;
  }
  
  .identity-controls {
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
</style>
<script lang="ts">
  import ContextPills from '$lib/components/layout/ContextPills.svelte';
  import { rightPanelStore } from '$lib/stores/rightPanelStore';
  
  // Integration types based on specification
  type IntegrationType = 'email' | 'social' | 'cms' | 'analytics' | 'crm' | 'automation' | 'webhook' | 'storage' | 'calendar' | 'other';
  
  type IntegrationStatus = 'connected' | 'disconnected' | 'pending' | 'error';
  
  interface Integration {
    id: string;
    type: IntegrationType;
    name: string;
    provider: string;
    status: IntegrationStatus;
    description: string;
    settings: {
      label: string;
      value: string;
      helpText?: string;
      secure?: boolean;
    }[];
    helpTopics: string[];
  }
  
  // Sample integrations data
  const integrations: Integration[] = [
    {
      id: '1',
      type: 'email',
      name: 'Gmail / Google Workspace',
      provider: 'Google',
      status: 'connected',
      description: 'Send and receive emails, manage contacts and calendar',
      settings: [
        { label: 'API Key', value: '••••••••', secure: true, helpText: 'OAuth 2.0 API key for Gmail API' },
        { label: 'SMTP Server', value: 'smtp.gmail.com', helpText: 'SMTP server for sending emails' },
        { label: 'Port', value: '587', helpText: 'Port for SMTP connection' },
        { label: 'DKIM Verified', value: 'Yes', helpText: 'DomainKeys Identified Mail verification status' }
      ],
      helpTopics: ['How to connect Gmail', 'Setting up DKIM/SPF', 'Troubleshooting SMTP']
    },
    {
      id: '2',
      type: 'social',
      name: 'Meta / Instagram',
      provider: 'Meta',
      status: 'connected',
      description: 'Post to Instagram, Facebook, and manage social campaigns',
      settings: [
        { label: 'App ID', value: '••••••••', secure: true, helpText: 'Facebook App ID for API access' },
        { label: 'Access Token', value: '••••••••', secure: true, helpText: 'OAuth access token' },
        { label: 'Page ID', value: '123456789', helpText: 'Facebook Page ID for posting' }
      ],
      helpTopics: ['Connecting Instagram', 'Post scheduling', 'Analytics integration']
    },
    {
      id: '3',
      type: 'cms',
      name: 'WordPress',
      provider: 'WordPress',
      status: 'pending',
      description: 'Publish blog posts and manage WordPress content',
      settings: [
        { label: 'Site URL', value: 'https://example.com', helpText: 'Your WordPress site URL' },
        { label: 'Username', value: 'admin', helpText: 'WordPress admin username' },
        { label: 'Application Password', value: '', helpText: 'WordPress application password' }
      ],
      helpTopics: ['WordPress REST API setup', 'Creating application passwords', 'Troubleshooting']
    },
    {
      id: '4',
      type: 'analytics',
      name: 'Google Analytics',
      provider: 'Google',
      status: 'disconnected',
      description: 'Track website traffic and user behavior',
      settings: [
        { label: 'Property ID', value: '', helpText: 'Google Analytics property ID (e.g., UA-XXXXX-Y)' },
        { label: 'Measurement ID', value: '', helpText: 'GA4 measurement ID' }
      ],
      helpTopics: ['Setting up GA4', 'Finding property ID', 'Data retention settings']
    },
    {
      id: '5',
      type: 'crm',
      name: 'Brevo / Sendinblue',
      provider: 'Brevo',
      status: 'connected',
      description: 'Email marketing automation and CRM',
      settings: [
        { label: 'API Key', value: '••••••••', secure: true, helpText: 'Brevo API key for automation' },
        { label: 'SMTP Key', value: '••••••••', secure: true, helpText: 'SMTP key for transactional emails' },
        { label: 'Default List', value: 'Newsletter', helpText: 'Default contact list for campaigns' }
      ],
      helpTopics: ['Creating email campaigns', 'Automation workflows', 'Contact segmentation']
    },
    {
      id: '6',
      type: 'automation',
      name: 'Zapier / Make',
      provider: 'Zapier',
      status: 'connected',
      description: 'Connect apps and automate workflows',
      settings: [
        { label: 'API Key', value: '••••••••', secure: true, helpText: 'Zapier API key' },
        { label: 'Webhook URL', value: 'https://hooks.zapier.com/...', helpText: 'Incoming webhook URL' }
      ],
      helpTopics: ['Creating Zaps', 'Webhook configuration', 'Error handling']
    },
    {
      id: '7',
      type: 'webhook',
      name: 'Custom Webhooks',
      provider: 'Custom',
      status: 'connected',
      description: 'Send data to external services via webhooks',
      settings: [
        { label: 'Webhook URL', value: 'https://api.example.com/webhook', helpText: 'Endpoint to send data to' },
        { label: 'Secret Key', value: '••••••••', secure: true, helpText: 'HMAC secret for verification' },
        { label: 'Events', value: 'email.sent, campaign.created', helpText: 'Events to trigger webhook' }
      ],
      helpTopics: ['Webhook security', 'Event payload format', 'Testing webhooks']
    },
    {
      id: '8',
      type: 'storage',
      name: 'Google Drive',
      provider: 'Google',
      status: 'connected',
      description: 'Store and sync files with Google Drive',
      settings: [
        { label: 'Folder ID', value: '1AbCdEfGhIjKlMnOpQrStUvWxYz', helpText: 'Google Drive folder ID for storage' },
        { label: 'Access Scope', value: 'drive.file', helpText: 'OAuth scope for file access' }
      ],
      helpTopics: ['Folder organization', 'File permissions', 'Sync settings']
    }
  ];
  
  // Help topics data
  const helpTopics = [
    { id: 'h1', title: 'Getting Started', category: 'general', questions: ['How do I connect my email?', 'What is the dashboard for?', 'How to create my first project?'] },
    { id: 'h2', title: 'Email Campaigns', category: 'connect', questions: ['How to create an email campaign?', 'What are email templates?', 'How to schedule emails?'] },
    { id: 'h3', title: 'Social Media', category: 'connect', questions: ['How to connect Instagram?', 'How to schedule social posts?', 'What analytics are available?'] },
    { id: 'h4', title: 'Projects & Tasks', category: 'projects', questions: ['How to create a project?', 'How to assign tasks?', 'What are milestones?'] },
    { id: 'h5', title: 'Timeline View', category: 'timeline', questions: ['How to use the timeline?', 'What are the different view modes?', 'How to filter timeline items?'] },
    { id: 'h6', title: 'Dashboard', category: 'dashboard', questions: ['How to customize dashboard?', 'What are pinned panels?', 'How to filter dashboard data?'] },
    { id: 'h7', title: 'Files & Storage', category: 'files', questions: ['How to upload files?', 'How to organize files?', 'What storage providers are supported?'] },
    { id: 'h8', title: 'Automations', category: 'automations', questions: ['How to create automations?', 'What triggers are available?', 'How to debug automations?'] }
  ];
  
  let selectedIntegration = $state<Integration | null>(null);
  let selectedHelpTopic = $state<typeof helpTopics[0] | null>(null);
  let activeView = $state<'integrations' | 'help' | 'settings'>('integrations');
  let filterType = $state<IntegrationType | null>(null);
  let filterStatus = $state<IntegrationStatus | null>(null);
  let searchQuery = $state<string>('');
  
  // Filter integrations based on selected filters
  const filteredIntegrations = $derived(() => {
    let items = integrations;
    
    // Filter by type
    if (filterType) {
      items = items.filter(item => item.type === filterType);
    }
    
    // Filter by status
    if (filterStatus) {
      items = items.filter(item => item.status === filterStatus);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.provider.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    
    return items;
  });
  
  // Filter help topics based on search
  const filteredHelpTopics = $derived(() => {
    if (!searchQuery) return helpTopics;
    
    const query = searchQuery.toLowerCase();
    return helpTopics.filter(topic =>
      topic.title.toLowerCase().includes(query) ||
      topic.category.toLowerCase().includes(query) ||
      topic.questions.some(q => q.toLowerCase().includes(query))
    );
  });
  
  function handleIntegrationClick(integration: Integration) {
    selectedIntegration = integration;
    activeView = 'settings';
    rightPanelStore.open({
      title: `${integration.name} Settings`,
      content: `Integration settings for ${integration.name}`
    });
  }
  
  function handleHelpTopicClick(topic: typeof helpTopics[0]) {
    selectedHelpTopic = topic;
    activeView = 'help';
    rightPanelStore.open({
      title: `Help: ${topic.title}`,
      content: `Help topic: ${topic.title}`
    });
  }
  
  function clearSelection() {
    selectedIntegration = null;
    selectedHelpTopic = null;
    activeView = 'integrations';
    rightPanelStore.close();
  }
  
  function getStatusColor(status: IntegrationStatus) {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function getTypeIcon(type: IntegrationType) {
    switch (type) {
      case 'email': return '📧';
      case 'social': return '📱';
      case 'cms': return '📝';
      case 'analytics': return '📊';
      case 'crm': return '👥';
      case 'automation': return '⚙️';
      case 'webhook': return '🔗';
      case 'storage': return '📁';
      case 'calendar': return '📅';
      default: return '🔌';
    }
  }
  
  function getTypeColor(type: IntegrationType) {
    switch (type) {
      case 'email': return 'bg-blue-50 border-blue-200';
      case 'social': return 'bg-purple-50 border-purple-200';
      case 'cms': return 'bg-green-50 border-green-200';
      case 'analytics': return 'bg-amber-50 border-amber-200';
      case 'crm': return 'bg-indigo-50 border-indigo-200';
      case 'automation': return 'bg-gray-50 border-gray-200';
      case 'webhook': return 'bg-cyan-50 border-cyan-200';
      case 'storage': return 'bg-emerald-50 border-emerald-200';
      case 'calendar': return 'bg-pink-50 border-pink-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  }
</script>

<div class="integrations-shell">
  <div class="integrations-layout">
    <!-- Left: Integrations filters and controls -->
    <div class="integrations-left">
      <div class="integrations-controls">
        <h3 class="text-lg font-semibold mb-4">Integrations & Help</h3>
        
        <div class="view-selector mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">View</div>
          <div class="flex flex-col gap-2">
            <button
              class:active={activeView === 'integrations'}
              on:click={() => { activeView = 'integrations'; clearSelection(); }}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              Integrations
            </button>
            <button
              class:active={activeView === 'help'}
              on:click={() => { activeView = 'help'; clearSelection(); }}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              Help System
            </button>
            <button
              class:active={activeView === 'settings'}
              on:click={() => { activeView = 'settings'; }}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
              disabled={!selectedIntegration}
            >
              Settings Peek
            </button>
          </div>
        </div>
        
        {#if activeView === 'integrations'}
          <div class="filters-section mb-6">
            <div class="text-sm font-medium text-gray-700 mb-2">Filter Integrations</div>
            <div class="space-y-4">
              <div>
                <label class="text-xs text-gray-600 block mb-1">Type</label>
                <select 
                  bind:value={filterType}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={null}>All Types</option>
                  <option value="email">Email</option>
                  <option value="social">Social</option>
                  <option value="cms">CMS</option>
                  <option value="analytics">Analytics</option>
                  <option value="crm">CRM</option>
                  <option value="automation">Automation</option>
                  <option value="webhook">Webhook</option>
                  <option value="storage">Storage</option>
                </select>
              </div>
              
              <div>
                <label class="text-xs text-gray-600 block mb-1">Status</label>
                <select 
                  bind:value={filterStatus}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={null}>All Status</option>
                  <option value="connected">Connected</option>
                  <option value="disconnected">Disconnected</option>
                  <option value="pending">Pending</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
          </div>
        {:else if activeView === 'help'}
          <div class="help-filters mb-6">
            <div class="text-sm font-medium text-gray-700 mb-2">Help Categories</div>
            <div class="flex flex-col gap-2">
              <button
                on:click={() => {}}
                class="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-800 text-left"
              >
                All Categories
              </button>
              <button
                on:click={() => {}}
                class="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-800 text-left"
              >
                General
              </button>
              <button
                on:click={() => {}}
                class="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-800 text-left"
              >
                Connect
              </button>
              <button
                on:click={() => {}}
                class="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-800 text-left"
              >
                Projects
              </button>
              <button
                on:click={() => {}}
                class="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-800 text-left"
              >
                Timeline
              </button>
            </div>
          </div>
        {/if}
        
        <div class="search mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Search</div>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search integrations or help..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        
        <div class="stats">
          <div class="text-sm text-gray-600">
            {#if activeView === 'integrations'}
              {filteredIntegrations().length} integrations
            {:else if activeView === 'help'}
              {filteredHelpTopics().length} help topics
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Middle: Integrations/Help content (becomes navigation rail when item is selected) -->
    <div class="integrations-middle" class:navigation-rail={selectedIntegration !== null || selectedHelpTopic !== null}>
      {#if selectedIntegration || selectedHelpTopic}
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
            {#if selectedIntegration}
              Showing related integrations
            {:else if selectedHelpTopic}
              Showing related help topics
            {/if}
          </div>
        </div>
        <div class="navigation-rail-content">
          <!-- Show related items -->
          {#if selectedIntegration}
            {#each filteredIntegrations().filter((i: any) => i.id !== selectedIntegration?.id && i.type === selectedIntegration?.type).slice(0, 5) as integration}
              <div
                class="rail-item p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
                on:click={() => handleIntegrationClick(integration)}
              >
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-lg">{getTypeIcon(integration.type)}</span>
                  <div class="font-medium text-gray-900">{integration.name}</div>
                </div>
                <div class="flex items-center gap-2">
                  <span class={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(integration.status)}`}>
                    {integration.status}
                  </span>
                  <span class="text-xs text-gray-500">{integration.provider}</span>
                </div>
              </div>
            {/each}
          {:else if selectedHelpTopic}
            {#each filteredHelpTopics().filter((t: any) => t.id !== selectedHelpTopic?.id && t.category === selectedHelpTopic?.category).slice(0, 5) as topic}
              <div
                class="rail-item p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
                on:click={() => handleHelpTopicClick(topic)}
              >
                <div class="font-medium text-gray-900">{topic.title}</div>
                <div class="text-sm text-gray-600 mt-1">
                  {topic.questions.length} questions • {topic.category}
                </div>
              </div>
            {/each}
          {/if}
        </div>
      {:else}
        <!-- Normal integrations/help view -->
        <div class="integrations-content">
          <div class="integrations-header mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Integrations & Help</h2>
            <p class="text-gray-600 mt-2">Intelligent configuration layer for provider connections, system settings, and contextual help</p>
          </div>
          
          {#if activeView === 'integrations'}
            <!-- Integrations view -->
            <div class="integrations-grid">
              {#each filteredIntegrations() as integration}
                <div
                  class={`integration-card ${getTypeColor(integration.type)} border rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow`}
                  on:click={() => handleIntegrationClick(integration)}
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">{getTypeIcon(integration.type)}</span>
                      <div>
                        <h4 class="font-semibold text-gray-900">{integration.name}</h4>
                        <div class="text-sm text-gray-600">{integration.provider}</div>
                      </div>
                    </div>
                    <span class={`px-2 py-1 text-xs rounded-full ${getStatusColor(integration.status)}`}>
                      {integration.status}
                    </span>
                  </div>
                  
                  <p class="text-sm text-gray-700 mb-4">{integration.description}</p>
                  
                  <div class="integration-settings-preview">
                    <div class="text-xs text-gray-500 mb-2">Settings configured:</div>
                    <div class="flex flex-wrap gap-2">
                      {#each integration.settings.slice(0, 3) as setting}
                        <div class="text-xs px-2 py-1 bg-white/70 rounded border">
                          {setting.label}
                        </div>
                      {/each}
                      {#if integration.settings.length > 3}
                        <div class="text-xs px-2 py-1 bg-white/70 rounded border">
                          +{integration.settings.length - 3} more
                        </div>
                      {/if}
                    </div>
                  </div>
                  
                  <div class="mt-4 pt-3 border-t border-gray-200">
                    <div class="flex items-center justify-between">
                      <div class="text-xs text-gray-500">
                        {integration.helpTopics.length} help topics
                      </div>
                      <button class="text-xs text-blue-600 hover:text-blue-800">
                        Configure →
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else if activeView === 'help'}
            <!-- Help system view -->
            <div class="help-grid">
              {#each filteredHelpTopics() as topic}
                <div
                  class="help-topic-card bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                  on:click={() => handleHelpTopicClick(topic)}
                >
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-gray-900">{topic.title}</h4>
                    <span class="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                      {topic.category}
                    </span>
                  </div>
                  
                  <div class="help-questions mb-4">
                    <div class="text-sm text-gray-600 mb-2">Common questions:</div>
                    <ul class="space-y-1">
                      {#each topic.questions.slice(0, 3) as question}
                        <li class="text-sm text-gray-700 flex items-start">
                          <span class="text-gray-400 mr-2">•</span>
                          <span>{question}</span>
                        </li>
                      {/each}
                      {#if topic.questions.length > 3}
                        <li class="text-sm text-gray-500">
                          +{topic.questions.length - 3} more questions
                        </li>
                      {/if}
                    </ul>
                  </div>
                  
                  <div class="mt-4 pt-3 border-t border-gray-200">
                    <div class="flex items-center justify-between">
                      <div class="text-xs text-gray-500">
                        Click for detailed help
                      </div>
                      <button class="text-xs text-blue-600 hover:text-blue-800">
                        View help →
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else if activeView === 'settings'}
            {#if selectedIntegration}
              <!-- Settings Peek view -->
              <div class="settings-peek-view">
                <div class="settings-header mb-6">
                  <h3 class="text-xl font-bold text-gray-900">{selectedIntegration.name} Settings</h3>
                  <p class="text-gray-600 mt-2">Configure your {selectedIntegration.provider} integration</p>
                </div>
                
                <div class="settings-form">
                  {#each selectedIntegration.settings as setting}
                    <div class="setting-row mb-4 p-4 border border-gray-200 rounded-lg">
                      <div class="flex items-center justify-between mb-2">
                        <label class="text-sm font-medium text-gray-900">{setting.label}</label>
                        {#if setting.helpText}
                          <button class="text-xs text-gray-400 hover:text-gray-600" title={setting.helpText}>
                            ?
                          </button>
                        {/if}
                      </div>
                      <div class="flex items-center gap-2">
                        <input
                          type={setting.secure ? 'password' : 'text'}
                          value={setting.value}
                          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder={`Enter ${setting.label.toLowerCase()}`}
                        />
                        {#if setting.secure}
                          <button class="text-xs text-gray-600 hover:text-gray-800">
                            Show
                          </button>
                        {/if}
                      </div>
                      {#if setting.helpText}
                        <div class="text-xs text-gray-500 mt-2">{setting.helpText}</div>
                      {/if}
                    </div>
                  {/each}
                  
                  <div class="settings-actions mt-6">
                    <button class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                      Save Settings
                    </button>
                    <button class="w-full mt-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                      Test Connection
                    </button>
                  </div>
                </div>
              </div>
            {:else}
              <div class="text-center py-12">
                <div class="text-gray-400 text-lg mb-2">No integration selected</div>
                <p class="text-gray-500">Select an integration from the list to configure its settings.</p>
              </div>
            {/if}
          {/if}
        </div>
      {/if}
    </div>
    
    <!-- Right: Context Pills for domain switching -->
    <div class="integrations-right-pills">
      <ContextPills />
    </div>
  </div>
</div>

<style>
  .integrations-shell {
    height: 100%;
    width: 100%;
  }
  
  .integrations-layout {
    display: flex;
    height: 100%;
    gap: 1rem;
    padding: 1rem;
  }
  
  .integrations-left {
    flex: 0 0 250px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
  }
  
  .integrations-middle {
    flex: 1;
    min-width: 300px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
    overflow-y: auto;
    transition: all 0.3s ease;
  }
  
  .integrations-middle.navigation-rail {
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
  
  .integrations-right-pills {
    flex: 0 0 300px;
    min-width: 300px;
    overflow-y: auto;
  }
  
  .integrations-content {
    height: 100%;
  }
  
  .integrations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  .integration-card {
    transition: all 0.2s ease;
  }
  
  .integration-card:hover {
    transform: translateY(-2px);
  }
  
  .help-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  .help-topic-card {
    transition: all 0.2s ease;
  }
  
  .help-topic-card:hover {
    transform: translateY(-2px);
  }
  
  .settings-peek-view {
    max-width: 600px;
    margin: 0 auto;
  }
  
  button.active {
    background-color: #3b82f6;
    color: white;
  }
  
  button:not(.active) {
    background-color: #f3f4f6;
    color: #374151;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Responsive: stack on smaller screens */
  @media (max-width: 1024px) {
    .integrations-layout {
      flex-direction: column;
    }
    
    .integrations-left,
    .integrations-middle,
    .integrations-right-pills {
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
      padding-right: 0;
      padding-bottom: 1rem;
      flex: none;
      width: 100%;
    }
    
    .integrations-left {
      order: 1;
    }
    
    .integrations-middle {
      order: 2;
    }
    
    .integrations-right-pills {
      order: 3;
    }
    
    .integrations-middle.navigation-rail {
      flex: none;
      width: 100%;
    }
    
    .integrations-grid,
    .help-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }
  
  @media (max-width: 640px) {
    .integrations-grid,
    .help-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
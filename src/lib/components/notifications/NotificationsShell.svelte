<script lang="ts">
  import ContextPills from '$lib/components/layout/ContextPills.svelte';
  import { rightPanelStore } from '$lib/stores/rightPanelStore';
  
  // Activity types based on specification
  type ActivityType = 'mention' | 'comment' | 'reply' | 'task-assignment' | 'status-change' | 'due-date-change' | 'milestone' | 'campaign-step' | 'email-sent' | 'social-post' | 'automation' | 'file-update' | 'document-edit' | 'integration' | 'system-alert';
  
  type ActivityStatus = 'unread' | 'read' | 'resolved' | 'pinned';
  
  interface ActivityItem {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    status: ActivityStatus;
    timestamp: string;
    actor: string;
    actorAvatar?: string;
    domain: 'projects' | 'connect' | 'timeline' | 'files' | 'workspace' | 'dashboard' | 'automations' | 'integrations';
    linkedItem?: {
      id: string;
      title: string;
      type: string;
    };
    preview?: string;
    actions: string[];
    metadata: {
      label: string;
      value: string;
    }[];
  }
  
  // Sample activity data
  const activityItems: ActivityItem[] = [
    {
      id: '1',
      type: 'mention',
      title: 'You were mentioned in a comment',
      description: 'Alex mentioned you in a comment on "Website Redesign Project"',
      status: 'unread',
      timestamp: '10 minutes ago',
      actor: 'Alex Johnson',
      actorAvatar: 'AJ',
      domain: 'projects',
      linkedItem: { id: 'p1', title: 'Website Redesign Project', type: 'project' },
      preview: 'Can you review the latest design mockups?',
      actions: ['Reply', 'Mark as read', 'View project'],
      metadata: [
        { label: 'Project', value: 'Website Redesign' },
        { label: 'Section', value: 'Design Review' }
      ]
    },
    {
      id: '2',
      type: 'task-assignment',
      title: 'New task assigned to you',
      description: 'Sarah assigned you a task: "Finalize Q1 Report"',
      status: 'unread',
      timestamp: '1 hour ago',
      actor: 'Sarah Miller',
      actorAvatar: 'SM',
      domain: 'projects',
      linkedItem: { id: 't1', title: 'Finalize Q1 Report', type: 'task' },
      preview: 'Due by Friday EOD',
      actions: ['Accept', 'Delegate', 'Set reminder'],
      metadata: [
        { label: 'Due Date', value: 'Mar 15, 2024' },
        { label: 'Priority', value: 'High' }
      ]
    },
    {
      id: '3',
      type: 'campaign-step',
      title: 'Campaign step completed',
      description: 'Q1 Email Campaign: "Welcome Sequence" sent successfully',
      status: 'read',
      timestamp: '2 hours ago',
      actor: 'System',
      actorAvatar: '⚙️',
      domain: 'connect',
      linkedItem: { id: 'c1', title: 'Q1 Email Campaign', type: 'campaign' },
      preview: 'Sent to 1,250 subscribers',
      actions: ['View analytics', 'Create follow-up', 'Export list'],
      metadata: [
        { label: 'Recipients', value: '1,250' },
        { label: 'Open Rate', value: '42%' }
      ]
    },
    {
      id: '4',
      type: 'file-update',
      title: 'File updated',
      description: 'Project_Brief.pdf was updated by the team',
      status: 'read',
      timestamp: '5 hours ago',
      actor: 'Team',
      actorAvatar: '👥',
      domain: 'files',
      linkedItem: { id: 'f1', title: 'Project_Brief.pdf', type: 'file' },
      preview: 'Added new client feedback section',
      actions: ['View changes', 'Download', 'Share'],
      metadata: [
        { label: 'File Size', value: '2.4 MB' },
        { label: 'Version', value: 'v3' }
      ]
    },
    {
      id: '5',
      type: 'automation',
      title: 'Automation triggered',
      description: 'Weekly Report automation ran successfully',
      status: 'read',
      timestamp: '1 day ago',
      actor: 'System',
      actorAvatar: '🤖',
      domain: 'automations',
      linkedItem: { id: 'a1', title: 'Weekly Report Generator', type: 'automation' },
      preview: 'Generated report for week 11',
      actions: ['View report', 'Edit automation', 'Schedule'],
      metadata: [
        { label: 'Trigger', value: 'Weekly' },
        { label: 'Output', value: 'PDF Report' }
      ]
    },
    {
      id: '6',
      type: 'integration',
      title: 'Integration alert',
      description: 'Google Drive connection needs reauthorization',
      status: 'unread',
      timestamp: '2 days ago',
      actor: 'System',
      actorAvatar: '⚠️',
      domain: 'integrations',
      linkedItem: { id: 'i1', title: 'Google Drive', type: 'integration' },
      preview: 'OAuth token expired, please reauthorize',
      actions: ['Reauthorize', 'View details', 'Disable'],
      metadata: [
        { label: 'Provider', value: 'Google' },
        { label: 'Status', value: 'Error' }
      ]
    },
    {
      id: '7',
      type: 'milestone',
      title: 'Milestone reached',
      description: 'Project "Client Portal" reached 75% completion',
      status: 'read',
      timestamp: '3 days ago',
      actor: 'System',
      actorAvatar: '🎯',
      domain: 'projects',
      linkedItem: { id: 'p2', title: 'Client Portal Project', type: 'project' },
      preview: 'Major features implemented, testing phase begins',
      actions: ['View progress', 'Celebrate', 'Plan next phase'],
      metadata: [
        { label: 'Progress', value: '75%' },
        { label: 'Timeline', value: 'On track' }
      ]
    },
    {
      id: '8',
      type: 'social-post',
      title: 'Social post published',
      description: 'Instagram post scheduled for today was published',
      status: 'read',
      timestamp: '4 days ago',
      actor: 'System',
      actorAvatar: '📱',
      domain: 'connect',
      linkedItem: { id: 's1', title: 'Product Launch Post', type: 'social-post' },
      preview: 'Check engagement analytics',
      actions: ['View analytics', 'Respond to comments', 'Boost'],
      metadata: [
        { label: 'Platform', value: 'Instagram' },
        { label: 'Engagement', value: '245 likes' }
      ]
    }
  ];
  
  let selectedActivity = $state<ActivityItem | null>(null);
  let filterType = $state<ActivityType | null>(null);
  let filterStatus = $state<ActivityStatus | null>(null);
  let filterDomain = $state<string | null>(null);
  let viewMode = $state<'all' | 'unread' | 'mentions' | 'assigned' | 'projects' | 'connect' | 'timeline' | 'files' | 'automations' | 'errors'>('all');
  let searchQuery = $state<string>('');
  
  // Filter activity items based on selected filters
  const filteredActivity = $derived(() => {
    let items = activityItems;
    
    // Filter by view mode
    if (viewMode === 'unread') {
      items = items.filter(item => item.status === 'unread');
    } else if (viewMode === 'mentions') {
      items = items.filter(item => item.type === 'mention');
    } else if (viewMode === 'assigned') {
      items = items.filter(item => item.type === 'task-assignment');
    } else if (viewMode === 'projects') {
      items = items.filter(item => item.domain === 'projects');
    } else if (viewMode === 'connect') {
      items = items.filter(item => item.domain === 'connect');
    } else if (viewMode === 'timeline') {
      items = items.filter(item => item.domain === 'timeline');
    } else if (viewMode === 'files') {
      items = items.filter(item => item.domain === 'files');
    } else if (viewMode === 'automations') {
      items = items.filter(item => item.domain === 'automations');
    } else if (viewMode === 'errors') {
      items = items.filter(item => item.type === 'integration' || item.type === 'system-alert');
    }
    
    // Filter by type
    if (filterType) {
      items = items.filter(item => item.type === filterType);
    }
    
    // Filter by status
    if (filterStatus) {
      items = items.filter(item => item.status === filterStatus);
    }
    
    // Filter by domain
    if (filterDomain) {
      items = items.filter(item => item.domain === filterDomain);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.actor.toLowerCase().includes(query) ||
        (item.linkedItem?.title.toLowerCase().includes(query) || false)
      );
    }
    
    return items;
  });
  
  // Get unread count
  const unreadCount = $derived(() => activityItems.filter(item => item.status === 'unread').length);
  
  function handleActivityClick(activity: ActivityItem) {
    selectedActivity = activity;
    rightPanelStore.open({
      title: activity.title,
      content: `Activity: ${activity.title}`
    });
  }
  
  function clearSelection() {
    selectedActivity = null;
    rightPanelStore.close();
  }
  
  function markAsRead(activity: ActivityItem) {
    activity.status = 'read';
  }
  
  function markAllAsRead() {
    activityItems.forEach(item => {
      if (item.status === 'unread') {
        item.status = 'read';
      }
    });
  }
  
  function getTypeColor(type: ActivityType) {
    switch (type) {
      case 'mention': return 'bg-blue-100 text-blue-800';
      case 'comment': return 'bg-purple-100 text-purple-800';
      case 'reply': return 'bg-indigo-100 text-indigo-800';
      case 'task-assignment': return 'bg-green-100 text-green-800';
      case 'status-change': return 'bg-amber-100 text-amber-800';
      case 'due-date-change': return 'bg-yellow-100 text-yellow-800';
      case 'milestone': return 'bg-emerald-100 text-emerald-800';
      case 'campaign-step': return 'bg-cyan-100 text-cyan-800';
      case 'email-sent': return 'bg-sky-100 text-sky-800';
      case 'social-post': return 'bg-pink-100 text-pink-800';
      case 'automation': return 'bg-gray-100 text-gray-800';
      case 'file-update': return 'bg-orange-100 text-orange-800';
      case 'document-edit': return 'bg-teal-100 text-teal-800';
      case 'integration': return 'bg-red-100 text-red-800';
      case 'system-alert': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function getTypeIcon(type: ActivityType) {
    switch (type) {
      case 'mention': return '@';
      case 'comment': return '💬';
      case 'reply': return '↩️';
      case 'task-assignment': return '📋';
      case 'status-change': return '🔄';
      case 'due-date-change': return '📅';
      case 'milestone': return '🎯';
      case 'campaign-step': return '📈';
      case 'email-sent': return '📧';
      case 'social-post': return '📱';
      case 'automation': return '⚙️';
      case 'file-update': return '📁';
      case 'document-edit': return '📝';
      case 'integration': return '🔌';
      case 'system-alert': return '⚠️';
      default: return '🔔';
    }
  }
  
  function getDomainColor(domain: string) {
    switch (domain) {
      case 'projects': return 'bg-purple-50 border-purple-200';
      case 'connect': return 'bg-green-50 border-green-200';
      case 'timeline': return 'bg-indigo-50 border-indigo-200';
      case 'files': return 'bg-amber-50 border-amber-200';
      case 'workspace': return 'bg-cyan-50 border-cyan-200';
      case 'dashboard': return 'bg-blue-50 border-blue-200';
      case 'automations': return 'bg-gray-50 border-gray-200';
      case 'integrations': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  }
  
  function getStatusIcon(status: ActivityStatus) {
    switch (status) {
      case 'unread': return '🔴';
      case 'read': return '⚪';
      case 'resolved': return '✅';
      case 'pinned': return '📌';
      default: return '⚪';
    }
  }
</script>

<div class="notifications-shell">
  <div class="notifications-layout">
    <!-- Left: Notifications filters and controls -->
    <div class="notifications-left">
      <div class="notifications-controls">
        <h3 class="text-lg font-semibold mb-4">Notifications & Activity</h3>
        
        <div class="view-selector mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">View</div>
          <div class="flex flex-col gap-2">
            <button
              class:active={viewMode === 'all'}
              on:click={() => { viewMode = 'all'; clearSelection(); }}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left flex items-center justify-between"
            >
              <span>All Activity</span>
              <span class="text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full">{activityItems.length}</span>
            </button>
            <button
              class:active={viewMode === 'unread'}
              on:click={() => { viewMode = 'unread'; clearSelection(); }}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left flex items-center justify-between"
            >
              <span>Unread</span>
              <span class="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">{unreadCount()}</span>
            </button>
            <button
              class:active={viewMode === 'mentions'}
              on:click={() => { viewMode = 'mentions'; clearSelection(); }}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              Mentions
            </button>
            <button
              class:active={viewMode === 'assigned'}
              on:click={() => { viewMode = 'assigned'; clearSelection(); }}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              Assigned to Me
            </button>
            <button
              class:active={viewMode === 'projects'}
              on:click={() => { viewMode = 'projects'; clearSelection(); }}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              Projects
            </button>
            <button
              class:active={viewMode === 'connect'}
              on:click={() => { viewMode = 'connect'; clearSelection(); }}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              Connect
            </button>
            <button
              class:active={viewMode === 'files'}
              on:click={() => { viewMode = 'files'; clearSelection(); }}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              Files
            </button>
            <button
              class:active={viewMode === 'automations'}
              on:click={() => { viewMode = 'automations'; clearSelection(); }}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              Automations
            </button>
            <button
              class:active={viewMode === 'errors'}
              on:click={() => { viewMode = 'errors'; clearSelection(); }}
              class="px-3 py-2 rounded-lg text-sm transition-colors text-left"
            >
              Errors & Warnings
            </button>
          </div>
        </div>
        
        <div class="filters-section mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Filters</div>
          <div class="space-y-4">
            <div>
              <label class="text-xs text-gray-600 block mb-1">Type</label>
              <select
                bind:value={filterType}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={null}>All Types</option>
                <option value="mention">Mention</option>
                <option value="comment">Comment</option>
                <option value="task-assignment">Task Assignment</option>
                <option value="status-change">Status Change</option>
                <option value="campaign-step">Campaign Step</option>
                <option value="file-update">File Update</option>
                <option value="automation">Automation</option>
                <option value="integration">Integration Alert</option>
              </select>
            </div>
            
            <div>
              <label class="text-xs text-gray-600 block mb-1">Status</label>
              <select
                bind:value={filterStatus}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={null}>All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="resolved">Resolved</option>
                <option value="pinned">Pinned</option>
              </select>
            </div>
            
            <div>
              <label class="text-xs text-gray-600 block mb-1">Domain</label>
              <select
                bind:value={filterDomain}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={null}>All Domains</option>
                <option value="projects">Projects</option>
                <option value="connect">Connect</option>
                <option value="timeline">Timeline</option>
                <option value="files">Files</option>
                <option value="workspace">Workspace</option>
                <option value="automations">Automations</option>
                <option value="integrations">Integrations</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="search mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Search</div>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search notifications..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        
        <div class="actions mb-6">
          <button
            on:click={markAllAsRead}
            class="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 mb-2"
            disabled={unreadCount() === 0}
          >
            Mark All as Read
          </button>
          <button
            on:click={() => {}}
            class="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            Notification Settings
          </button>
        </div>
        
        <div class="stats">
          <div class="text-sm text-gray-600">
            {filteredActivity().length} items
            {#if viewMode !== 'all' || filterType || filterStatus || filterDomain}
              <span class="ml-2">(filtered)</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Middle: Notifications content (becomes navigation rail when item is selected) -->
    <div class="notifications-middle" class:navigation-rail={selectedActivity !== null}>
      {#if selectedActivity}
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
            Showing related activity items
          </div>
        </div>
        <div class="navigation-rail-content">
          <!-- Show related items -->
          {#each filteredActivity().filter((a: any) => a.id !== selectedActivity?.id && a.domain === selectedActivity?.domain).slice(0, 5) as activity}
            <div
              class="rail-item p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
              on:click={() => handleActivityClick(activity)}
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">{getTypeIcon(activity.type)}</span>
                <div class="font-medium text-gray-900 text-sm">{activity.title}</div>
              </div>
              <div class="flex items-center gap-2">
                <span class={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(activity.type)}`}>
                  {activity.type}
                </span>
                <span class="text-xs text-gray-500">{activity.timestamp}</span>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- Normal notifications view -->
        <div class="notifications-content">
          <div class="notifications-header mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Notifications & Activity</h2>
            <p class="text-gray-600 mt-2">Unified, intelligent feed of mentions, comments, assignments, and system events</p>
          </div>
          
          <!-- Activity feed -->
          <div class="activity-feed">
            {#each filteredActivity() as activity}
              <div
                class={`activity-item ${getDomainColor(activity.domain)} border rounded-xl p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow`}
                on:click={() => handleActivityClick(activity)}
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                        {activity.actorAvatar || activity.actor.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-semibold text-gray-900">{activity.title}</h4>
                        {#if activity.status === 'unread'}
                          <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                        {/if}
                      </div>
                      <p class="text-sm text-gray-700">{activity.description}</p>
                      <div class="flex items-center gap-2 mt-2">
                        <span class="text-xs text-gray-500">{activity.timestamp}</span>
                        <span class="text-xs text-gray-500">•</span>
                        <span class="text-xs text-gray-500">{activity.actor}</span>
                        <span class="text-xs text-gray-500">•</span>
                        <span class={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(activity.type)}`}>
                          {activity.type.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-lg">{getTypeIcon(activity.type)}</span>
                    <button
                      on:click={(e) => { e.stopPropagation(); markAsRead(activity); }}
                      class="text-gray-400 hover:text-gray-600 p-1"
                      title="Mark as read"
                    >
                      {getStatusIcon(activity.status)}
                    </button>
                  </div>
                </div>
                
                {#if activity.preview}
                  <div class="mt-3 p-3 bg-white/70 border border-gray-200 rounded-lg">
                    <div class="text-xs text-gray-500 mb-1">Preview:</div>
                    <div class="text-sm text-gray-700">{activity.preview}</div>
                  </div>
                {/if}
                
                {#if activity.linkedItem}
                  <div class="mt-3 flex items-center justify-between">
                    <div class="text-xs text-gray-500">
                      Linked to: <span class="font-medium text-gray-700">{activity.linkedItem.title}</span>
                    </div>
                    <button class="text-xs text-blue-600 hover:text-blue-800">
                      View →
                    </button>
                  </div>
                {/if}
                
                <div class="mt-4 pt-3 border-t border-gray-200">
                  <div class="flex items-center justify-between">
                    <div class="flex gap-2">
                      {#each activity.actions.slice(0, 3) as action}
                        <button
                          on:click={(e) => { e.stopPropagation(); }}
                          class="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          {action}
                        </button>
                      {/each}
                    </div>
                    <div class="text-xs text-gray-500">
                      {activity.domain}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Right: Context Pills for domain switching -->
    <div class="notifications-right-pills">
      <ContextPills />
    </div>
  </div>
</div>

<style>
  .notifications-shell {
    height: 100%;
    width: 100%;
  }
  
  .notifications-layout {
    display: flex;
    height: 100%;
    gap: 1rem;
    padding: 1rem;
  }
  
  .notifications-left {
    flex: 0 0 250px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
  }
  
  .notifications-middle {
    flex: 1;
    min-width: 300px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
    overflow-y: auto;
    transition: all 0.3s ease;
  }
  
  .notifications-middle.navigation-rail {
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
  
  .notifications-right-pills {
    flex: 0 0 300px;
    min-width: 300px;
    overflow-y: auto;
  }
  
  .notifications-content {
    height: 100%;
  }
  
  .activity-item {
    transition: all 0.2s ease;
  }
  
  .activity-item:hover {
    transform: translateY(-2px);
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
    .notifications-layout {
      flex-direction: column;
    }
    
    .notifications-left,
    .notifications-middle,
    .notifications-right-pills {
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
      padding-right: 0;
      padding-bottom: 1rem;
      flex: none;
      width: 100%;
    }
    
    .notifications-left {
      order: 1;
    }
    
    .notifications-middle {
      order: 2;
    }
    
    .notifications-right-pills {
      order: 3;
    }
    
    .notifications-middle.navigation-rail {
      flex: none;
      width: 100%;
    }
  }
</style>
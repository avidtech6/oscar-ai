<script lang="ts">
  import ContextPills from '$lib/components/layout/ContextPills.svelte';
  import { rightPanelStore } from '$lib/stores/rightPanelStore';
  
  type PermissionSection = 'roles' | 'team' | 'domains' | 'integrations' | 'vault' | 'audit' | 'sharing' | 'custom-roles';
  
  // Role definitions
  const roles = [
    {
      id: 'owner',
      name: 'Owner',
      description: 'Full access to everything, can manage billing, vault, integrations, team, and delete workspace',
      icon: '👑',
      color: 'bg-yellow-100 text-yellow-800',
      permissions: {
        workspace: 'full',
        billing: 'manage',
        vault: 'full',
        integrations: 'manage',
        team: 'manage',
        deleteWorkspace: true
      }
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Full access to all content, can manage team (except owner), integrations, and automations',
      icon: '🛡️',
      color: 'bg-blue-100 text-blue-800',
      permissions: {
        workspace: 'full',
        billing: 'view',
        vault: 'read',
        integrations: 'manage',
        team: 'manage',
        deleteWorkspace: false
      }
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Can create/edit/delete content, manage projects, upload files, use integrations',
      icon: '✏️',
      color: 'bg-green-100 text-green-800',
      permissions: {
        workspace: 'edit',
        billing: 'none',
        vault: 'none',
        integrations: 'use',
        team: 'none',
        deleteWorkspace: false
      }
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access, can comment, view dashboards and files, cannot edit anything',
      icon: '👁️',
      color: 'bg-gray-100 text-gray-800',
      permissions: {
        workspace: 'view',
        billing: 'none',
        vault: 'none',
        integrations: 'none',
        team: 'none',
        deleteWorkspace: false
      }
    }
  ];
  
  // Team members
  const teamMembers = [
    { id: '1', name: 'Alex Johnson', email: 'alex@example.com', role: 'owner', avatar: 'AJ', lastActive: '2 minutes ago' },
    { id: '2', name: 'Sam Wilson', email: 'sam@example.com', role: 'admin', avatar: 'SW', lastActive: '1 hour ago' },
    { id: '3', name: 'Taylor Reed', email: 'taylor@example.com', role: 'editor', avatar: 'TR', lastActive: '30 minutes ago' },
    { id: '4', name: 'Jordan Lee', email: 'jordan@example.com', role: 'editor', avatar: 'JL', lastActive: '2 hours ago' },
    { id: '5', name: 'Casey Smith', email: 'casey@example.com', role: 'viewer', avatar: 'CS', lastActive: '1 day ago' },
    { id: '6', name: 'Morgan Brown', email: 'morgan@example.com', role: 'viewer', avatar: 'MB', lastActive: '3 days ago' }
  ];
  
  // Domain permissions
  const domains = [
    { id: 'workspace', name: 'Workspace', icon: '📁', access: { owner: 'full', admin: 'full', editor: 'edit', viewer: 'view' } },
    { id: 'files', name: 'Files', icon: '📄', access: { owner: 'full', admin: 'full', editor: 'edit', viewer: 'view' } },
    { id: 'projects', name: 'Projects', icon: '📋', access: { owner: 'full', admin: 'full', editor: 'edit', viewer: 'view' } },
    { id: 'connect', name: 'Connect', icon: '📧', access: { owner: 'full', admin: 'full', editor: 'edit', viewer: 'view' } },
    { id: 'timeline', name: 'Timeline', icon: '📅', access: { owner: 'full', admin: 'full', editor: 'edit', viewer: 'view' } },
    { id: 'dashboard', name: 'Dashboard', icon: '📊', access: { owner: 'full', admin: 'full', editor: 'edit', viewer: 'view' } },
    { id: 'integrations', name: 'Integrations', icon: '🔌', access: { owner: 'full', admin: 'full', editor: 'use', viewer: 'none' } },
    { id: 'vault', name: 'Vault', icon: '🔒', access: { owner: 'full', admin: 'read', editor: 'none', viewer: 'none' } }
  ];
  
  // Audit logs
  const auditLogs = [
    { id: '1', user: 'Alex Johnson', action: 'Shared project', target: 'Oak Tree Health Report', timestamp: '10 minutes ago', domain: 'projects' },
    { id: '2', user: 'Sam Wilson', action: 'Updated permissions', target: 'Team settings', timestamp: '1 hour ago', domain: 'permissions' },
    { id: '3', user: 'Taylor Reed', action: 'Uploaded file', target: 'Q4_report.pdf', timestamp: '2 hours ago', domain: 'files' },
    { id: '4', user: 'Alex Johnson', action: 'Connected integration', target: 'Google Drive', timestamp: '3 hours ago', domain: 'integrations' },
    { id: '5', user: 'Jordan Lee', action: 'Commented on', target: 'Marketing Campaign', timestamp: '5 hours ago', domain: 'connect' }
  ];
  
  const sections = [
    { id: 'roles', title: 'Roles', description: 'Define and manage user roles and permissions', icon: '👥' },
    { id: 'team', title: 'Team', description: 'Manage team members and their roles', icon: '👤' },
    { id: 'domains', title: 'Domains', description: 'Control access to different domains', icon: '🌐' },
    { id: 'integrations', title: 'Integrations', description: 'Manage integration permissions', icon: '🔌' },
    { id: 'vault', title: 'Vault', description: 'Control access to sensitive secrets', icon: '🔒' },
    { id: 'audit', title: 'Audit Logs', description: 'View security and access logs', icon: '📋' },
    { id: 'sharing', title: 'Sharing', description: 'Manage item sharing and permissions', icon: '🤝' },
    { id: 'custom-roles', title: 'Custom Roles', description: 'Create and manage custom roles', icon: '⚙️' }
  ];
  
  let selectedSection = $state<typeof sections[0] | null>(null);
  let activeSectionId = $state<PermissionSection>('roles');
  let searchQuery = $state<string>('');
  
  const currentSection = sections.find(s => s.id === activeSectionId) || sections[0];
  
  const filteredSections = (() => {
    if (!searchQuery) return sections;
    const query = searchQuery.toLowerCase();
    return sections.filter(section =>
      section.title.toLowerCase().includes(query) ||
      section.description.toLowerCase().includes(query)
    );
  })();
  
  function handleSectionClick(section: typeof sections[0]) {
    selectedSection = section;
    activeSectionId = section.id as PermissionSection;
    rightPanelStore.open({
      title: section.title,
      content: `Permissions section: ${section.title}`
    });
  }
  
  function clearSelection() {
    selectedSection = null;
    rightPanelStore.close();
  }
  
  function getRoleColor(roleId: string) {
    const role = roles.find(r => r.id === roleId);
    return role?.color || 'bg-gray-100 text-gray-800';
  }
  
  function getAccessLevel(domainId: string, roleId: string) {
    const domain = domains.find(d => d.id === domainId);
    if (!domain) return 'none';
    return domain.access[roleId as keyof typeof domain.access] || 'none';
  }
  
  function getAccessColor(access: string) {
    switch (access) {
      case 'full': return 'bg-green-100 text-green-800';
      case 'edit': return 'bg-blue-100 text-blue-800';
      case 'view': return 'bg-gray-100 text-gray-800';
      case 'use': return 'bg-purple-100 text-purple-800';
      case 'read': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<div class="permissions-shell">
  <div class="permissions-layout">
    <!-- Left: Sections navigation -->
    <div class="permissions-left">
      <div class="permissions-controls">
        <div class="header mb-6">
          <h3 class="font-semibold text-gray-900 mb-2">Permissions & Roles</h3>
          <p class="text-sm text-gray-600">Access control layer for your workspace</p>
        </div>
        
        <div class="stats mb-6 p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500">Team Members</div>
              <div class="text-2xl font-bold text-gray-900">{teamMembers.length}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Active Roles</div>
              <div class="text-2xl font-bold text-gray-900">{roles.length}</div>
            </div>
          </div>
        </div>
        
        <div class="sections-navigation mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Permission Sections</div>
          <div class="flex flex-col gap-2">
            {#each filteredSections as section}
              <button
                class:active={activeSectionId === section.id}
                on:click={() => { activeSectionId = section.id as PermissionSection; clearSelection(); }}
                class="px-3 py-2 rounded-lg text-sm transition-colors text-left flex items-center gap-2"
              >
                <span class="text-lg">{section.icon}</span>
                <span>{section.title}</span>
              </button>
            {/each}
          </div>
        </div>
        
        <div class="search mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Search Permissions</div>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search roles, team members, domains..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        
        <div class="quick-actions mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Quick Actions</div>
          <div class="space-y-2">
            <button class="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 text-left">
              Invite Team Member
            </button>
            <button class="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 text-left">
              Create Custom Role
            </button>
            <button class="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 text-left">
              View Audit Logs
            </button>
          </div>
        </div>
        
        <div class="info">
          <div class="text-xs text-gray-500">
            {filteredSections.length} sections
            {#if searchQuery}
              <span class="ml-2">(filtered)</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Middle: Permissions content -->
    <div class="permissions-middle" class:navigation-rail={selectedSection !== null}>
      {#if selectedSection}
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
            Showing related permission sections
          </div>
        </div>
        <div class="navigation-rail-content">
          {#each filteredSections.filter((s: any) => s.id !== selectedSection?.id).slice(0, 5) as section}
            <div
              class="rail-item p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
              on:click={() => handleSectionClick(section)}
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">{section.icon}</span>
                <div class="font-medium text-gray-900">{section.title}</div>
              </div>
              <div class="text-sm text-gray-600">
                {section.description}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="permissions-content">
          <div class="permissions-header mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Permissions & Roles</h2>
            <p class="text-gray-600 mt-2">Access control layer defining who can access which domains and items</p>
          </div>
          
          <!-- Current section view -->
          <div class="current-section bg-white border border-gray-200 rounded-xl p-6">
            <div class="section-header mb-6">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl">{currentSection.icon}</span>
                <h3 class="text-xl font-bold text-gray-900">{currentSection.title}</h3>
              </div>
              <p class="text-gray-700">{currentSection.description}</p>
            </div>
            
            <div class="section-content">
              {#if currentSection.id === 'roles'}
                <!-- Roles view -->
                <div class="space-y-4">
                  {#each roles as role}
                    <div class="role-card p-4 border border-gray-200 rounded-lg">
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3">
                          <div class={`w-10 h-10 rounded-lg ${role.color} flex items-center justify-center text-lg`}>
                            {role.icon}
                          </div>
                          <div>
                            <h4 class="font-bold text-gray-900">{role.name}</h4>
                            <p class="text-sm text-gray-600">{role.description}</p>
                          </div>
                        </div>
                        <div class="text-sm text-gray-500">
                          {teamMembers.filter(m => m.role === role.id).length} members
                        </div>
                      </div>
                      
                      <div class="permissions-grid grid grid-cols-2 gap-3 mt-4">
                        <div class="permission-item p-3 bg-gray-50 rounded-lg">
                          <div class="text-sm font-medium text-gray-900">Workspace</div>
                          <div class={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getAccessColor(role.permissions.workspace)}`}>
                            {role.permissions.workspace}
                          </div>
                        </div>
                        <div class="permission-item p-3 bg-gray-50 rounded-lg">
                          <div class="text-sm font-medium text-gray-900">Billing</div>
                          <div class={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getAccessColor(role.permissions.billing)}`}>
                            {role.permissions.billing}
                          </div>
                        </div>
                        <div class="permission-item p-3 bg-gray-50 rounded-lg">
                          <div class="text-sm font-medium text-gray-900">Vault</div>
                          <div class={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getAccessColor(role.permissions.vault)}`}>
                            {role.permissions.vault}
                          </div>
                        </div>
                        <div class="permission-item p-3 bg-gray-50 rounded-lg">
                          <div class="text-sm font-medium text-gray-900">Integrations</div>
                          <div class={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getAccessColor(role.permissions.integrations)}`}>
                            {role.permissions.integrations}
                          </div>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else if currentSection.id === 'team'}
                <!-- Team view -->
                <div class="space-y-3">
                  {#each teamMembers as member}
                    <div class="team-member p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                          {member.avatar}
                        </div>
                        <div>
                          <div class="font-medium text-gray-900">{member.name}</div>
                          <div class="text-sm text-gray-600">{member.email}</div>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <div class={`px-3 py-1 rounded-full text-sm ${getRoleColor(member.role)}`}>
                          {member.role}
                        </div>
                        <div class="text-sm text-gray-500">
                          {member.lastActive}
                        </div>
                        <button class="text-sm text-blue-600 hover:text-blue-800">
                          Edit
                        </button>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else if currentSection.id === 'domains'}
                  <!-- Domains view -->
                  <div class="overflow-x-auto">
                    <table class="w-full">
                      <thead>
                        <tr class="border-b border-gray-200">
                          <th class="text-left py-3 px-4 text-sm font-medium text-gray-900">Domain</th>
                          {#each roles as role}
                            <th class="text-left py-3 px-4 text-sm font-medium text-gray-900">{role.name}</th>
                          {/each}
                        </tr>
                      </thead>
                      <tbody>
                        {#each domains as domain}
                          <tr class="border-b border-gray-100">
                            <td class="py-3 px-4">
                              <div class="flex items-center gap-2">
                                <span class="text-lg">{domain.icon}</span>
                                <span class="font-medium text-gray-900">{domain.name}</span>
                              </div>
                            </td>
                            {#each roles as role}
                              <td class="py-3 px-4">
                                <div class={`text-xs px-2 py-1 rounded-full inline-block ${getAccessColor(getAccessLevel(domain.id, role.id))}`}>
                                  {getAccessLevel(domain.id, role.id)}
                                </div>
                              </td>
                            {/each}
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  </div>
                {:else if currentSection.id === 'audit'}
                  <!-- Audit logs view -->
                  <div class="space-y-3">
                    {#each auditLogs as log}
                      <div class="audit-log p-4 border border-gray-200 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                          <div class="font-medium text-gray-900">{log.user}</div>
                          <div class="text-sm text-gray-500">{log.timestamp}</div>
                        </div>
                        <div class="text-gray-700">
                          {log.action} <span class="font-medium">{log.target}</span>
                        </div>
                        <div class="text-xs text-gray-500 mt-2">
                          Domain: {log.domain}
                        </div>
                      </div>
                    {/each}
                  </div>
                {:else}
                  <!-- Default view for other sections -->
                  <div class="p-8 text-center">
                    <div class="text-4xl mb-4">{currentSection.icon}</div>
                    <h4 class="text-lg font-medium text-gray-900 mb-2">{currentSection.title}</h4>
                    <p class="text-gray-600 mb-6">{currentSection.description}</p>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Configure {currentSection.title}
                    </button>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Right: Context pills -->
      <div class="permissions-right">
        <ContextPills />
      </div>
    </div>
  </div>
  
  <style>
    .permissions-shell {
      @apply h-full;
    }
    
    .permissions-layout {
      @apply grid grid-cols-12 gap-4 h-full;
    }
    
    .permissions-left {
      @apply col-span-3 border-r border-gray-200 p-4;
    }
    
    .permissions-middle {
      @apply col-span-6 p-4 overflow-y-auto;
    }
    
    .permissions-right {
      @apply col-span-3 border-l border-gray-200 p-4;
    }
    
    .permissions-controls {
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
    
    .permission-item {
      @apply transition-colors hover:bg-gray-100;
    }
    
    .role-card {
      @apply transition-colors hover:border-blue-300;
    }
    
    .team-member {
      @apply transition-colors hover:bg-gray-50;
    }
    
    .audit-log {
      @apply transition-colors hover:bg-gray-50;
    }
  </style>
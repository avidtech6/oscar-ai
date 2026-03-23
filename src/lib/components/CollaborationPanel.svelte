<script lang="ts">
	import { onMount } from 'svelte';
	import type { User, Document, Project } from '$lib/types';

	let collaborationEnabled = $state(false);
	let activeUsers = $state<User[]>([]);
	let sharedDocuments = $state<Document[]>([]);
	let sharedProjects = $state<Project[]>([]);
	let showInviteDialog = $state(false);
	let inviteEmail = $state('');
	let inviteMessage = $state('');
	let isSharing = $state(false);

	// Mock user data
	let currentUser: User = {
		id: 'current-user',
		name: 'You',
		email: 'you@example.com',
		avatar: '👤',
		status: 'online',
		lastSeen: new Date(),
		isActive: true
	};

	let mockUsers: User[] = [
		{
			id: 'user-1',
			name: 'Sarah Johnson',
			email: 'sarah.j@arborist.com',
			avatar: '👩',
			status: 'online',
			lastSeen: new Date(),
			isActive: true
		},
		{
			id: 'user-2',
			name: 'Mike Chen',
			email: 'm.chen@tree-solutions.co.uk',
			avatar: '👨',
			status: 'away',
			lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
			isActive: false
		},
		{
			id: 'user-3',
			name: 'Emma Wilson',
			email: 'emma.w@urban-forestry.org',
			avatar: '👩‍💼',
			status: 'offline',
			lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
			isActive: false
		}
	];

	let mockSharedDocs: Document[] = [
		{
			id: 'doc-1',
			name: 'Oak Park Risk Assessment.pdf',
			type: 'pdf',
			size: 2456789,
			modified: '2024-03-15T10:30:00Z',
			path: '/reports/oak-park-risk-assessment.pdf',
			project: 'Oak Park Development',
			tags: ['risk', 'oak', 'assessment'],
			sharedWith: ['user-1', 'user-2'],
			permissions: {
				read: true,
				write: true,
				delete: false
			}
		},
		{
			id: 'doc-2',
			name: 'Method Statement Template.docx',
			type: 'docx',
			size: 1234567,
			modified: '2024-03-14T15:45:00Z',
			path: '/templates/method-statement-template.docx',
			project: null,
			tags: ['template', 'method', 'construction'],
			sharedWith: ['user-1', 'user-3'],
			permissions: {
				read: true,
				write: false,
				delete: false
			}
		}
	];

	let mockSharedProjects: Project[] = [
		{
			id: 'project-1',
			name: 'Oak Park Development',
			description: 'Comprehensive tree risk assessment and management plan',
			status: 'active',
			client: 'City Council',
			startDate: '2024-01-15',
			endDate: '2024-06-30',
			budget: 50000,
			progress: 65,
			tags: ['risk-assessment', 'urban', 'conservation'],
			documents: [],
			team: ['user-1', 'user-2', 'current-user'],
			sharedWith: ['user-1', 'user-2']
		}
	];

	$effect(() => {
		if (collaborationEnabled) {
			// Simulate loading collaborative data
			activeUsers = [currentUser, ...mockUsers.filter(u => u.status === 'online')];
			sharedDocuments = mockSharedDocs;
			sharedProjects = mockSharedProjects;
		} else {
			activeUsers = [];
			sharedDocuments = [];
			sharedProjects = [];
		}
	});

	function getStatusColor(status: string): string {
		switch (status) {
			case 'online': return 'bg-green-500';
			case 'away': return 'bg-yellow-500';
			case 'offline': return 'bg-gray-400';
			default: return 'bg-gray-400';
		}
	}

	function getStatusText(status: string): string {
		switch (status) {
			case 'online': return 'Online';
			case 'away': return 'Away';
			case 'offline': return 'Offline';
			default: return 'Unknown';
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function toggleCollaboration() {
		collaborationEnabled = !collaborationEnabled;
	}

	function showInviteModal() {
		showInviteDialog = true;
		inviteEmail = '';
		inviteMessage = '';
	}

	function hideInviteModal() {
		showInviteDialog = false;
	}

	async function sendInvitation() {
		if (!inviteEmail.trim()) return;

		isSharing = true;
		
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		console.log('Sending invitation to:', inviteEmail, 'with message:', inviteMessage);
		
		isSharing = false;
		showInviteDialog = false;
		
		// Show success feedback
		alert(`Invitation sent to ${inviteEmail}`);
	}

	function shareDocument(docId: string) {
		console.log('Sharing document:', docId);
	}

	function shareProject(projectId: string) {
		console.log('Sharing project:', projectId);
	}

	function startCollaboration() {
		console.log('Starting collaboration session');
	}
</script>

<div class="collaboration-panel">
	<div class="panel-header">
		<h3>🤝 Collaboration</h3>
		<div class="header-controls">
			<button 
				class={`collab-toggle ${collaborationEnabled ? 'active' : ''}`}
				onclick={toggleCollaboration}
				title={collaborationEnabled ? 'Disable Collaboration' : 'Enable Collaboration'}
			>
				{collaborationEnabled ? '🟢 Active' : '⚪ Disabled'}
			</button>
			<button class="action-btn" onclick={showInviteModal} disabled={!collaborationEnabled}>
				📤 Invite
			</button>
		</div>
	</div>

	{#if collaborationEnabled}
		<div class="collaboration-content">
			<!-- Active Users Section -->
			<div class="section">
				<h4>👥 Active Users ({activeUsers.length})</h4>
				<div class="users-grid">
					{#each activeUsers as user}
						<div class="user-card">
							<div class="user-avatar">
								{user.avatar}
								<span class={`status-indicator ${getStatusColor(user.status)}`}></span>
							</div>
							<div class="user-info">
								<div class="user-name">{user.name}</div>
								<div class="user-status">{getStatusText(user.status)}</div>
								{#if user.status === 'offline'}
									<div class="user-last-seen">Last seen: {formatDate(user.lastSeen)}</div>
								{/if}
							</div>
							{#if user.id !== currentUser.id}
								<button class="action-btn-small">💬 Chat</button>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Shared Documents Section -->
			<div class="section">
				<div class="section-header">
					<h4>📄 Shared Documents ({sharedDocuments.length})</h4>
					<button class="action-btn-small">🔄 Refresh</button>
				</div>
				<div class="documents-list">
					{#each sharedDocuments as doc}
						<div class="document-item">
							<div class="document-info">
								<div class="document-name">{doc.name}</div>
								<div class="document-meta">
									<span class="meta-item">{doc.type.toUpperCase()}</span>
									<span class="meta-item">{(doc.size / 1024 / 1024).toFixed(1)} MB</span>
									<span class="meta-item">Modified: {formatDate(doc.modified)}</span>
								</div>
								{#if doc.sharedWith.length > 0}
									<div class="shared-with">
										Shared with {doc.sharedWith.length} user{doc.sharedWith.length !== 1 ? 's' : ''}
									</div>
								{/if}
							</div>
							<div class="document-actions">
								<button class="action-btn-small" onclick={() => shareDocument(doc.id)}>
									🔗 Share
								</button>
								<button class="action-btn-small">👁️ Preview</button>
								<button class="action-btn-small">⬇️ Download</button>
							</div>
						</div>
					{/each}
					
					{#if sharedDocuments.length === 0}
						<div class="empty-state">
							<div class="empty-icon">📄</div>
							<p>No shared documents yet</p>
							<button class="action-btn" onclick={startCollaboration}>
								Start Sharing
							</button>
						</div>
					{/if}
				</div>
			</div>

			<!-- Shared Projects Section -->
			<div class="section">
				<div class="section-header">
					<h4>📋 Shared Projects ({sharedProjects.length})</h4>
					<button class="action-btn-small">🔄 Refresh</button>
				</div>
				<div class="projects-list">
					{#each sharedProjects as project}
						<div class="project-item">
							<div class="project-info">
								<div class="project-name">{project.name}</div>
								<div class="project-meta">
									<span class="meta-item">Status: {project.status}</span>
									<span class="meta-item">Progress: {project.progress}%</span>
									<span class="meta-item">{project.team.length} team members</span>
								</div>
								<div class="project-description">
									{project.description}
								</div>
							</div>
							<div class="project-actions">
								<button class="action-btn-small" onclick={() => shareProject(project.id)}>
									🔗 Share
								</button>
								<button class="action-btn-small">👁️ View</button>
								<button class="action-btn-small">📊 Stats</button>
							</div>
						</div>
					{/each}
					
					{#if sharedProjects.length === 0}
						<div class="empty-state">
							<div class="empty-icon">📋</div>
							<p>No shared projects yet</p>
							<button class="action-btn" onclick={startCollaboration}>
							 Start Collaboration
							</button>
						</div>
					{/if}
				</div>
			</div>

			<!-- Real-time Activity -->
			<div class="section">
				<h4>📈 Recent Activity</h4>
				<div class="activity-feed">
					<div class="activity-item">
						<span class="activity-time">2 min ago</span>
						<span class="activity-user">Sarah Johnson</span>
						<span class="activity-action">edited</span>
						<span class="activity-document">Oak Park Risk Assessment.pdf</span>
					</div>
					<div class="activity-item">
						<span class="activity-time">5 min ago</span>
						<span class="activity-user">Mike Chen</span>
						<span class="activity-action">commented on</span>
						<span class="activity-document">Method Statement Template.docx</span>
					</div>
					<div class="activity-item">
						<span class="activity-time">15 min ago</span>
						<span class="activity-user">Emma Wilson</span>
						<span class="activity-action">joined</span>
						<span class="activity-project">Oak Park Development</span>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="collab-disabled">
			<div class="disabled-icon">🔒</div>
			<h4>Collaboration Disabled</h4>
			<p>Enable collaboration to start sharing documents and projects with your team.</p>
			<button class="action-btn" onclick={toggleCollaboration}>
				Enable Collaboration
			</button>
		</div>
	{/if}

	<!-- Invite Dialog -->
	{#if showInviteDialog}
		<div class="invite-dialog-overlay" onclick={hideInviteModal}>
			<div class="invite-dialog" onclick={(e) => e.stopPropagation()}>
				<div class="dialog-header">
					<h3>📤 Invite to Collaborate</h3>
					<button class="close-btn" onclick={hideInviteModal}>✕</button>
				</div>
				
				<div class="dialog-content">
					<div class="form-group">
						<label for="invite-email">Email Address</label>
						<input 
							type="email" 
							id="invite-email"
							bind:value={inviteEmail}
							placeholder="colleague@example.com"
							required
						/>
					</div>
					
					<div class="form-group">
						<label for="invite-message">Message (Optional)</label>
						<textarea 
							id="invite-message"
							bind:value={inviteMessage}
							placeholder="Add a personal message..."
							rows="3"
						></textarea>
					</div>
					
					<div class="share-options">
						<h4>Share With</h4>
						<div class="share-checkboxes">
							<label>
								<input type="checkbox" checked disabled />
								<span>📄 Shared Documents</span>
							</label>
							<label>
								<input type="checkbox" checked disabled />
								<span>📋 Shared Projects</span>
							</label>
							<label>
								<input type="checkbox" />
								<span>📧 Real-time Notifications</span>
							</label>
						</div>
					</div>
				</div>
				
				<div class="dialog-actions">
					<button class="btn-secondary" onclick={hideInviteModal}>
						Cancel
					</button>
					<button class="btn-primary" onclick={sendInvitation} disabled={isSharing}>
						{isSharing ? 'Sending...' : 'Send Invitation'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
.collaboration-panel {
	background: white;
	border-radius: 0.75rem;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	border: 1px solid #e5e7eb;
	overflow: hidden;
}

.panel-header {
	padding: 1rem;
	border-bottom: 1px solid #e5e7eb;
	background: #f9fafb;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.panel-header h3 {
	margin: 0;
	font-size: 1rem;
	font-weight: 600;
	color: #111827;
}

.header-controls {
	display: flex;
	gap: 0.5rem;
}

.collab-toggle {
	background: #f3f4f6;
	color: #374151;
	border: 1px solid #d1d5db;
	padding: 0.375rem 0.75rem;
	border-radius: 0.375rem;
	font-size: 0.75rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.collab-toggle.active {
	background: #10b981;
	color: white;
	border-color: #059669;
}

.collab-toggle:hover:not(:disabled) {
	background: #e5e7eb;
}

.collab-toggle.active:hover {
	background: #059669;
}

.collab-toggle:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.collaboration-content {
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.section h4 {
	margin: 0 0 0.75rem 0;
	font-size: 0.875rem;
	font-weight: 600;
	color: #374151;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 0.75rem;
}

.users-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 0.75rem;
}

.user-card {
	background: #f9fafb;
	border: 1px solid #e5e7eb;
	border-radius: 0.5rem;
	padding: 0.75rem;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	transition: all 0.2s ease;
}

.user-card:hover {
	border-color: #3b82f6;
	background: #f8fafc;
}

.user-avatar {
	position: relative;
	font-size: 1.5rem;
}

.status-indicator {
	position: absolute;
	bottom: -2px;
	right: -2px;
	width: 8px;
	height: 8px;
	border-radius: 50%;
	border: 2px solid white;
}

.user-info {
	flex: 1;
	min-width: 0;
}

.user-name {
	font-weight: 500;
	color: #111827;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.user-status {
	font-size: 0.75rem;
	color: #6b7280;
}

.user-last-seen {
	font-size: 0.625rem;
	color: #9ca3af;
}

.action-btn-small {
	background: #f3f4f6;
	color: #374151;
	border: 1px solid #d1d5db;
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.625rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.action-btn-small:hover {
	background: #e5e7eb;
}

.document-item, .project-item {
	background: #f9fafb;
	border: 1px solid #e5e7eb;
	border-radius: 0.5rem;
	padding: 0.75rem;
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 0.75rem;
	transition: all 0.2s ease;
}

.document-item:hover, .project-item:hover {
	border-color: #3b82f6;
	background: #f8fafc;
}

.document-info, .project-info {
	flex: 1;
	min-width: 0;
}

.document-name, .project-name {
	font-weight: 500;
	color: #111827;
	margin-bottom: 0.25rem;
}

.document-meta, .project-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin-bottom: 0.25rem;
	font-size: 0.625rem;
	color: #9ca3af;
}

.meta-item {
	background: #f3f4f6;
	color: #6b7280;
	padding: 0.125rem 0.25rem;
	border-radius: 0.125rem;
}

.shared-with {
	font-size: 0.625rem;
	color: #6b7280;
}

.document-actions, .project-actions {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	align-items: flex-end;
}

.empty-state {
	text-align: center;
	padding: 2rem 1rem;
}

.empty-icon {
	font-size: 3rem;
	margin-bottom: 1rem;
	opacity: 0.5;
}

.empty-state p {
	margin: 0 0 1rem 0;
	font-size: 0.875rem;
	color: #6b7280;
}

.activity-feed {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.activity-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.75rem;
	color: #6b7280;
	padding: 0.25rem 0;
	border-bottom: 1px solid #f3f4f6;
}

.activity-time {
	color: #9ca3af;
}

.activity-user {
	font-weight: 500;
	color: #374151;
}

.activity-action {
	color: #6b7280;
}

.activity-document, .activity-project {
	color: #3b82f6;
}

.collab-disabled {
	text-align: center;
	padding: 2rem 1rem;
}

.disabled-icon {
	font-size: 3rem;
	margin-bottom: 1rem;
	opacity: 0.5;
}

.collab-disabled h4 {
	margin: 0 0 0.5rem 0;
	font-size: 1rem;
	font-weight: 600;
	color: #374151;
}

.collab-disabled p {
	margin: 0 0 1rem 0;
	font-size: 0.875rem;
	color: #6b7280;
}

.invite-dialog-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1rem;
}

.invite-dialog {
	background: white;
	border-radius: 0.75rem;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
	width: 100%;
	max-width: 500px;
	max-height: 90vh;
	overflow-y: auto;
}

.dialog-header {
	padding: 1.5rem;
	border-bottom: 1px solid #e5e7eb;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.dialog-header h3 {
	margin: 0;
	font-size: 1rem;
	font-weight: 600;
	color: #111827;
}

.close-btn {
	background: none;
	border: none;
	font-size: 1.5rem;
	cursor: pointer;
	color: #6b7280;
	padding: 0.25rem;
	border-radius: 0.25rem;
	transition: background-color 0.2s ease;
}

.close-btn:hover {
	background: #f3f4f6;
}

.dialog-content {
	padding: 1.5rem;
}

.form-group {
	margin-bottom: 1rem;
}

.form-group label {
	display: block;
	margin-bottom: 0.5rem;
	font-size: 0.875rem;
	font-weight: 500;
	color: #374151;
}

.form-group input,
.form-group textarea {
	width: 100%;
	padding: 0.75rem;
	border: 1px solid #d1d5db;
	border-radius: 0.375rem;
	font-size: 0.875rem;
	background: white;
}

.form-group input:focus,
.form-group textarea:focus {
	outline: none;
	border-color: #3b82f6;
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.share-options h4 {
	margin: 1rem 0 0.5rem 0;
	font-size: 0.875rem;
	font-weight: 600;
	color: #374151;
}

.share-checkboxes {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.share-checkboxes label {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.875rem;
	color: #374151;
	cursor: pointer;
}

.share-checkboxes input[type="checkbox"] {
	width: 1rem;
	height: 1rem;
	cursor: pointer;
}

.dialog-actions {
	display: flex;
	justify-content: flex-end;
	gap: 0.5rem;
	padding: 1.5rem;
	border-top: 1px solid #e5e7eb;
}

.btn-primary, .btn-secondary {
	padding: 0.5rem 1rem;
	border-radius: 0.375rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	border: none;
	font-size: 0.875rem;
}

.btn-primary {
	background: #3b82f6;
	color: white;
}

.btn-primary:hover:not(:disabled) {
	background: #2563eb;
}

.btn-primary:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.btn-secondary {
	background: #f3f4f6;
	color: #374151;
	border: 1px solid #d1d5db;
}

.btn-secondary:hover {
	background: #e5e7eb;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
	.users-grid {
		grid-template-columns: 1fr;
	}
	
	.document-item, .project-item {
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.document-actions, .project-actions {
		flex-direction: row;
		justify-content: flex-start;
	}
	
	.activity-item {
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
	}
	
	.invite-dialog {
		margin: 1rem;
	}
}
</style>
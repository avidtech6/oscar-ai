<script lang="ts">
	import { page } from '$app/stores';

	let emails = [
		{ id: 1, sender: 'City Council', subject: 'Tree Survey Report Approval', date: 'Mar 3, 2026', read: false, tags: ['report', 'client'] },
		{ id: 2, sender: 'National Trust', subject: 'Woodland Management Plan Feedback', date: 'Mar 2, 2026', read: true, tags: ['feedback', 'project'] },
		{ id: 3, sender: 'EcoBuild Inc', subject: 'Urgent: Arboricultural Impact Assessment', date: 'Mar 1, 2026', read: false, tags: ['urgent', 'client'] },
		{ id: 4, sender: 'Team Arborist', subject: 'Weekly Sync Agenda', date: 'Feb 28, 2026', read: true, tags: ['internal'] },
		{ id: 5, sender: 'University of Arboristics', subject: 'Research Collaboration Opportunity', date: 'Feb 27, 2026', read: true, tags: ['opportunity'] }
	];

	let newEmailSubject = '';
	let newEmailRecipient = '';

	function addEmail() {
		if (!newEmailSubject.trim() || !newEmailRecipient.trim()) return;
		emails = [
			{
				id: emails.length + 1,
				sender: 'You',
				subject: newEmailSubject,
				date: 'Just now',
				read: true,
				tags: ['draft']
			},
			...emails
		];
		newEmailSubject = '';
		newEmailRecipient = '';
	}

	function toggleRead(emailId: number) {
		emails = emails.map(e =>
			e.id === emailId ? { ...e, read: !e.read } : e
		);
	}

	function deleteEmail(emailId: number) {
		emails = emails.filter(e => e.id !== emailId);
	}
</script>

<div class="page">
	<h1>Email</h1>
	<p class="subtitle">Manage client communications and email integrations.</p>

	<div class="stats-row">
		<div class="stat-card">
			<div class="stat-icon">📧</div>
			<div class="stat-content">
				<div class="stat-value">{emails.length}</div>
				<div class="stat-label">Total Emails</div>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon">📨</div>
			<div class="stat-content">
				<div class="stat-value">{emails.filter(e => !e.read).length}</div>
				<div class="stat-label">Unread</div>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon">🏷️</div>
			<div class="stat-content">
				<div class="stat-value">{new Set(emails.flatMap(e => e.tags)).size}</div>
				<div class="stat-label">Tags</div>
			</div>
		</div>
	</div>

	<div class="content-grid">
		<div class="card">
			<h2>📧 Inbox</h2>
			<div class="email-list">
				{#each emails as email (email.id)}
					<div class="email-item {email.read ? 'read' : 'unread'}">
						<div class="email-checkbox" onclick={() => toggleRead(email.id)}>
							{#if email.read}✅{:else}⬜{/if}
						</div>
						<div class="email-icon">📧</div>
						<div class="email-details">
							<div class="email-sender">{email.sender}</div>
							<div class="email-subject">{email.subject}</div>
							<div class="email-meta">
								<span class="email-date">{email.date}</span>
								<span class="email-tags">
									{#each email.tags as tag}
										<span class="tag">{tag}</span>
									{/each}
								</span>
							</div>
						</div>
						<div class="email-actions">
							<button class="btn-small" onclick={() => console.log('Reply', email.id)}>Reply</button>
							<button class="btn-small btn-danger" onclick={() => deleteEmail(email.id)}>Delete</button>
						</div>
					</div>
				{/each}
			</div>
			<div class="compose">
				<h3>✏️ Compose New Email</h3>
				<div class="compose-form">
					<input
						type="text"
						bind:value={newEmailRecipient}
						placeholder="To"
					/>
					<input
						type="text"
						bind:value={newEmailSubject}
						placeholder="Subject"
					/>
					<textarea placeholder="Message body..."></textarea>
					<button class="btn" onclick={addEmail}>Send</button>
				</div>
			</div>
		</div>

		<div class="card">
			<h2>📨 Folders & Tags</h2>
			<div class="folders">
				<div class="folder">
					<div class="folder-icon">📥</div>
					<div class="folder-name">Inbox</div>
					<div class="folder-count">{emails.length}</div>
				</div>
				<div class="folder">
					<div class="folder-icon">📤</div>
					<div class="folder-name">Sent</div>
					<div class="folder-count">0</div>
				</div>
				<div class="folder">
					<div class="folder-icon">📁</div>
					<div class="folder-name">Drafts</div>
					<div class="folder-count">{emails.filter(e => e.tags.includes('draft')).length}</div>
				</div>
				<div class="folder">
					<div class="folder-icon">🗑️</div>
					<div class="folder-name">Trash</div>
					<div class="folder-count">0</div>
				</div>
			</div>

			<h3>📋 Quick Actions</h3>
			<div class="quick-actions">
				<button class="action-btn" onclick={() => console.log('Mark all as read')}>Mark all as read</button>
				<button class="action-btn" onclick={() => console.log('Archive selected')}>Archive selected</button>
				<button class="action-btn" onclick={() => console.log('Refresh inbox')}>Refresh inbox</button>
			</div>

			<h3>📊 Email Stats</h3>
			<div class="email-stats">
				<div class="stat-item">
					<div class="stat-label">Client emails</div>
					<div class="stat-bar">
						<div class="stat-fill" style="width: 60%"></div>
					</div>
					<div class="stat-value">60%</div>
				</div>
				<div class="stat-item">
					<div class="stat-label">Internal emails</div>
					<div class="stat-bar">
						<div class="stat-fill" style="width: 25%"></div>
					</div>
					<div class="stat-value">25%</div>
				</div>
				<div class="stat-item">
					<div class="stat-label">Other</div>
					<div class="stat-bar">
						<div class="stat-fill" style="width: 15%"></div>
					</div>
					<div class="stat-value">15%</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.page {
		padding: 2rem;
	}
	h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 0.5rem;
	}
	.subtitle {
		color: #6b7280;
		font-size: 1.125rem;
		margin-bottom: 2rem;
	}
	.stats-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}
	.stat-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border-left: 4px solid #3b82f6;
	}
	.stat-icon {
		font-size: 2rem;
	}
	.stat-content {
		flex: 1;
	}
	.stat-value {
		font-size: 1.75rem;
		font-weight: 700;
		color: #111827;
		line-height: 1;
	}
	.stat-label {
		font-size: 0.875rem;
		color: #6b7280;
		margin-top: 0.25rem;
	}
	.content-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 2rem;
	}
	.card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		border: 1px solid #e5e7eb;
	}
	.card h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin-bottom: 1.5rem;
	}
	.email-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}
	.email-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		transition: background 0.2s;
	}
	.email-item.unread {
		background: #f0f9ff;
		border-left: 4px solid #3b82f6;
	}
	.email-item.read {
		opacity: 0.8;
	}
	.email-checkbox {
		cursor: pointer;
		font-size: 1.25rem;
		user-select: none;
	}
	.email-icon {
		font-size: 1.5rem;
	}
	.email-details {
		flex: 1;
	}
	.email-sender {
		font-weight: 600;
		color: #111827;
		margin-bottom: 0.25rem;
	}
	.email-subject {
		color: #4b5563;
		margin-bottom: 0.25rem;
	}
	.email-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.75rem;
		color: #6b7280;
	}
	.tag {
		background: #e5e7eb;
		color: #374151;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		font-size: 0.625rem;
	}
	.email-actions {
		display: flex;
		gap: 0.5rem;
	}
	.btn-small {
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		cursor: pointer;
	}
	.btn-small.btn-danger {
		background: #ef4444;
	}
	.compose {
		margin-top: 2rem;
	}
	.compose h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
		margin-bottom: 1rem;
	}
	.compose-form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.compose-form input,
	.compose-form textarea {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.875rem;
	}
	.compose-form textarea {
		min-height: 120px;
		resize: vertical;
	}
	.btn {
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}
	.btn:hover {
		background: #2563eb;
	}
	.folders {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}
	.folder {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem;
		border-radius: 8px;
		background: #f9fafb;
	}
	.folder-icon {
		font-size: 1.25rem;
	}
	.folder-name {
		flex: 1;
		font-weight: 500;
		color: #111827;
	}
	.folder-count {
		background: #3b82f6;
		color: white;
		border-radius: 9999px;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
	}
	.quick-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}
	.action-btn {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 0.5rem;
		font-size: 0.875rem;
		cursor: pointer;
		text-align: left;
	}
	.action-btn:hover {
		background: #e5e7eb;
	}
	.email-stats {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.stat-item {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.stat-bar {
		flex: 1;
		height: 8px;
		background: #e5e7eb;
		border-radius: 4px;
		overflow: hidden;
	}
	.stat-fill {
		height: 100%;
		background: #3b82f6;
		border-radius: 4px;
	}
	.stat-value {
		font-weight: 600;
		color: #111827;
		min-width: 40px;
	}
</style>
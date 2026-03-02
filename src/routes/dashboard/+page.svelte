<script lang="ts">
	import { getIntelligenceLayer } from '$lib/intelligence';
	
	const intelligence = getIntelligenceLayer();
	
	let stats = [
		{ label: 'Active Reports', value: '12', change: '+2', icon: '📊', color: 'blue' },
		{ label: 'Notes Created', value: '47', change: '+8', icon: '📝', color: 'green' },
		{ label: 'Tasks Pending', value: '5', change: '-1', icon: '✅', color: 'yellow' },
		{ label: 'Intelligence Layers', value: '26', change: '+26', icon: '🧠', color: 'purple' }
	];
	
	let recentReports = [
		{ id: 1, title: 'Tree Risk Assessment - Oak Park', type: 'Risk Assessment', date: 'Today', status: 'draft' },
		{ id: 2, title: 'Arboricultural Method Statement', type: 'Method Statement', date: 'Yesterday', status: 'published' },
		{ id: 3, title: 'Tree Preservation Order Survey', type: 'Survey Report', date: '2 days ago', status: 'review' },
		{ id: 4, title: 'Woodland Management Plan', type: 'Management Plan', date: '1 week ago', status: 'published' }
	];
	
	let quickActions = [
		{ label: 'New Report', icon: '➕', description: 'Create a new arboricultural report', action: () => console.log('New report') },
		{ label: 'Add Note', icon: '📝', description: 'Add a quick note or observation', action: () => console.log('Add note') },
		{ label: 'Upload Document', icon: '📄', description: 'Upload PDF or image for analysis', action: () => console.log('Upload document') },
		{ label: 'Run Intelligence', icon: '🧠', description: 'Run AI analysis on existing data', action: () => console.log('Run intelligence') }
	];
</script>

<main class="dashboard">
	<div class="dashboard-header">
		<h1>Dashboard</h1>
		<p class="subtitle">Welcome back, Arborist. Here's what's happening with your reports and intelligence.</p>
	</div>
	
	<div class="stats-grid">
		{#each stats as stat}
			<div class="stat-card color-{stat.color}">
				<div class="stat-icon">{stat.icon}</div>
				<div class="stat-content">
					<div class="stat-value">{stat.value}</div>
					<div class="stat-label">{stat.label}</div>
					<div class="stat-change">{stat.change} from last week</div>
				</div>
			</div>
		{/each}
	</div>
	
	<div class="dashboard-grid">
		<div class="dashboard-section">
			<div class="section-header">
				<h2>Recent Reports</h2>
				<a href="/reports" class="view-all">View all →</a>
			</div>
			<div class="reports-list">
				{#each recentReports as report}
					<div class="report-item">
						<div class="report-icon">📄</div>
						<div class="report-details">
							<div class="report-title">{report.title}</div>
							<div class="report-meta">
								<span class="report-type">{report.type}</span>
								<span class="report-date">{report.date}</span>
								<span class="report-status status-{report.status}">{report.status}</span>
							</div>
						</div>
						<button class="report-action" onclick={() => console.log('Open report', report.id)}>Open</button>
					</div>
				{/each}
			</div>
		</div>
		
		<div class="dashboard-section">
			<div class="section-header">
				<h2>Quick Actions</h2>
				<p class="section-subtitle">Get started quickly</p>
			</div>
			<div class="actions-grid">
				{#each quickActions as action}
					<button class="action-card" onclick={action.action}>
						<div class="action-icon">{action.icon}</div>
						<div class="action-label">{action.label}</div>
						<div class="action-description">{action.description}</div>
					</button>
				{/each}
			</div>
		</div>
	</div>
	
	<div class="dashboard-section">
		<div class="section-header">
			<h2>Intelligence Layer Status</h2>
			<p class="section-subtitle">Phase Files integrated from {intelligence.phaseCount} architectural documents</p>
		</div>
		<div class="intelligence-status">
			<div class="phase-summary">
				<div class="phase-count">{intelligence.phaseCount} Phase Files</div>
				<div class="phase-description">Architectural blueprint for Oscar AI V2</div>
			</div>
			<div class="phase-list">
				{#each intelligence.phases.slice(0, 5) as phase}
					<div class="phase-item">
						<div class="phase-icon">📋</div>
						<div class="phase-info">
							<div class="phase-name">{phase.name}</div>
							<div class="phase-description">{phase.description}</div>
						</div>
					</div>
				{/each}
			</div>
			<a href="/intelligence" class="view-intelligence">Explore Intelligence Layer →</a>
		</div>
	</div>
</main>

<style>
	.dashboard {
		max-width: 100%;
	}
	
	.dashboard-header {
		margin-bottom: 2rem;
	}
	
	.dashboard-header h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: #111827;
	}
	
	.subtitle {
		color: #6b7280;
		font-size: 1rem;
		margin: 0;
	}
	
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
	
	.stat-card.color-blue {
		border-left-color: #3b82f6;
	}
	
	.stat-card.color-green {
		border-left-color: #10b981;
	}
	
	.stat-card.color-yellow {
		border-left-color: #f59e0b;
	}
	
	.stat-card.color-purple {
		border-left-color: #8b5cf6;
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
	
	.stat-change {
		font-size: 0.75rem;
		color: #10b981;
		margin-top: 0.25rem;
	}
	
	.dashboard-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}
	
	.dashboard-section {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}
	
	.section-header h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		color: #111827;
	}
	
	.view-all {
		font-size: 0.875rem;
		color: #3b82f6;
		text-decoration: none;
		font-weight: 500;
	}
	
	.view-all:hover {
		text-decoration: underline;
	}
	
	.section-subtitle {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0.25rem 0 0 0;
	}
	
	.reports-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.report-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		transition: background 0.2s ease;
	}
	
	.report-item:hover {
		background: #f9fafb;
	}
	
	.report-icon {
		font-size: 1.5rem;
	}
	
	.report-details {
		flex: 1;
	}
	
	.report-title {
		font-weight: 500;
		color: #111827;
		margin-bottom: 0.25rem;
	}
	
	.report-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.75rem;
		color: #6b7280;
	}
	
	.report-status {
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
	}
	
	.report-status.status-draft {
		background: #fef3c7;
		color: #92400e;
	}
	
	.report-status.status-published {
		background: #d1fae5;
		color: #065f46;
	}
	
	.report-status.status-review {
		background: #dbeafe;
		color: #1e40af;
	}
	
	.report-action {
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s ease;
	}
	
	.report-action:hover {
		background: #2563eb;
	}
	
	.actions-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}
	
	.action-card {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.action-card:hover {
		background: white;
		border-color: #3b82f6;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
	}
	
	.action-icon {
		font-size: 2rem;
		margin-bottom: 0.75rem;
	}
	
	.action-label {
		font-weight: 600;
		color: #111827;
		margin-bottom: 0.25rem;
	}
	
	.action-description {
		font-size: 0.75rem;
		color: #6b7280;
	}
	
	.intelligence-status {
		background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
		border-radius: 12px;
		padding: 2rem;
	}
	
	.phase-summary {
		margin-bottom: 1.5rem;
	}
	
	.phase-count {
		font-size: 1.5rem;
		font-weight: 700;
		color: #0369a1;
		margin-bottom: 0.25rem;
	}
	
	.phase-description {
		color: #0c4a6e;
		font-size: 0.875rem;
	}
	
	.phase-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	
	.phase-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.7);
		border-radius: 8px;
	}
	
	.phase-icon {
		font-size: 1.25rem;
	}
	
	.phase-info {
		flex: 1;
	}
	
	.phase-name {
		font-weight: 500;
		color: #111827;
	}
	
	.view-intelligence {
		display: inline-block;
		background: #0369a1;
		color: white;
		text-decoration: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		font-size: 0.875rem;
		transition: background 0.2s ease;
	}
	
	.view-intelligence:hover {
		background: #075985;
	}
</style>
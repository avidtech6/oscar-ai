<script lang="ts">
	import { getIntelligenceLayer } from '$lib/intelligence';
	import './dashboard.css';
	
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
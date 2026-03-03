<script lang="ts">
	import { page } from '$app/stores';

	let projects = [
		{ id: 1, name: 'Oak Park Tree Survey', client: 'City Council', status: 'active', progress: 75, due: 'Mar 20', budget: '$12,500' },
		{ id: 2, name: 'Woodland Management Plan', client: 'National Trust', status: 'planning', progress: 30, due: 'Apr 15', budget: '$28,000' },
		{ id: 3, name: 'Tree Risk Assessment - High Street', client: 'Property Developers Ltd', status: 'active', progress: 90, due: 'Mar 10', budget: '$8,200' },
		{ id: 4, name: 'Arboricultural Impact Assessment', client: 'EcoBuild Inc', status: 'completed', progress: 100, due: 'Feb 28', budget: '$15,000' },
		{ id: 5, name: 'Urban Canopy Study', client: 'University of Arboristics', status: 'pending', progress: 10, due: 'May 30', budget: '$42,000' }
	];

	let newProjectName = '';
	let newProjectClient = '';

	function addProject() {
		if (!newProjectName.trim() || !newProjectClient.trim()) return;
		projects = [
			...projects,
			{
				id: projects.length + 1,
				name: newProjectName,
				client: newProjectClient,
				status: 'pending',
				progress: 0,
				due: 'TBD',
				budget: '$0'
			}
		];
		newProjectName = '';
		newProjectClient = '';
	}

	function updateProgress(projectId: number, delta: number) {
		projects = projects.map(p =>
			p.id === projectId
				? { ...p, progress: Math.max(0, Math.min(100, p.progress + delta)) }
				: p
		);
	}
</script>

<div class="page">
	<h1>Projects</h1>
	<p class="subtitle">Manage arboricultural projects and client engagements.</p>

	<div class="stats-row">
		<div class="stat-card">
			<div class="stat-icon">📁</div>
			<div class="stat-content">
				<div class="stat-value">{projects.length}</div>
				<div class="stat-label">Total Projects</div>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon">📈</div>
			<div class="stat-content">
				<div class="stat-value">{projects.filter(p => p.status === 'active').length}</div>
				<div class="stat-label">Active</div>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon">💰</div>
			<div class="stat-content">
				<div class="stat-value">${projects.reduce((sum, p) => sum + parseInt(p.budget.replace(/[$,]/g, '')) || 0, 0).toLocaleString()}</div>
				<div class="stat-label">Total Budget</div>
			</div>
		</div>
	</div>

	<div class="content-grid">
		<div class="card">
			<h2>📋 Project List</h2>
			<div class="project-list">
				{#each projects as project (project.id)}
					<div class="project-item status-{project.status}">
						<div class="project-icon">📁</div>
						<div class="project-details">
							<div class="project-name">{project.name}</div>
							<div class="project-client">Client: {project.client}</div>
							<div class="project-meta">
								<span class="budget">{project.budget}</span>
								<span class="due">Due: {project.due}</span>
								<span class="status">{project.status}</span>
							</div>
							<div class="progress-bar">
								<div class="progress-fill" style="width: {project.progress}%"></div>
								<span class="progress-text">{project.progress}%</span>
							</div>
						</div>
						<div class="project-actions">
							<button class="btn-small" onclick={() => updateProgress(project.id, 10)}>+10%</button>
							<button class="btn-small" onclick={() => console.log('Edit', project.id)}>Edit</button>
						</div>
					</div>
				{/each}
			</div>
			<div class="add-project">
				<input
					type="text"
					bind:value={newProjectName}
					placeholder="Project name"
				/>
				<input
					type="text"
					bind:value={newProjectClient}
					placeholder="Client"
				/>
				<button class="btn" onclick={addProject}>Add Project</button>
			</div>
		</div>

		<div class="card">
			<h2>📊 Project Status Overview</h2>
			<div class="status-overview">
				{#each ['active', 'planning', 'pending', 'completed'] as status}
					<div class="status-item">
						<div class="status-label">{status}</div>
						<div class="status-count">{projects.filter(p => p.status === status).length}</div>
					</div>
				{/each}
			</div>
			<div class="upcoming">
				<h3>Upcoming Deadlines</h3>
				{#each projects.filter(p => p.status !== 'completed') as project}
					<div class="deadline">
						<div class="deadline-name">{project.name}</div>
						<div class="deadline-date">{project.due}</div>
					</div>
				{/each}
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
	.project-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	.project-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		transition: background 0.2s;
	}
	.project-item.status-active {
		border-left: 4px solid #10b981;
	}
	.project-item.status-planning {
		border-left: 4px solid #f59e0b;
	}
	.project-item.status-pending {
		border-left: 4px solid #6b7280;
	}
	.project-item.status-completed {
		border-left: 4px solid #8b5cf6;
	}
	.project-icon {
		font-size: 1.5rem;
	}
	.project-details {
		flex: 1;
	}
	.project-name {
		font-weight: 600;
		color: #111827;
		margin-bottom: 0.25rem;
	}
	.project-client {
		font-size: 0.875rem;
		color: #6b7280;
		margin-bottom: 0.5rem;
	}
	.project-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.75rem;
		color: #4b5563;
		margin-bottom: 0.75rem;
	}
	.budget {
		font-weight: 600;
		color: #065f46;
	}
	.due {
		color: #92400e;
	}
	.status {
		text-transform: uppercase;
		font-weight: 600;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		background: #e5e7eb;
		color: #374151;
	}
	.progress-bar {
		height: 8px;
		background: #e5e7eb;
		border-radius: 4px;
		position: relative;
		overflow: hidden;
	}
	.progress-fill {
		height: 100%;
		background: #3b82f6;
		border-radius: 4px;
		transition: width 0.3s;
	}
	.progress-text {
		position: absolute;
		top: -1.5rem;
		right: 0;
		font-size: 0.75rem;
		color: #6b7280;
	}
	.project-actions {
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
	.add-project {
		display: flex;
		gap: 0.5rem;
		margin-top: 1.5rem;
	}
	.add-project input {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.875rem;
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
	.status-overview {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin-bottom: 2rem;
	}
	.status-item {
		background: #f9fafb;
		border-radius: 8px;
		padding: 1rem;
		text-align: center;
	}
	.status-label {
		font-size: 0.875rem;
		color: #6b7280;
		text-transform: capitalize;
	}
	.status-count {
		font-size: 1.5rem;
		font-weight: 700;
		color: #111827;
	}
	.upcoming h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
		margin-bottom: 1rem;
	}
	.deadline {
		display: flex;
		justify-content: space-between;
		padding: 0.75rem 0;
		border-bottom: 1px solid #f3f4f6;
	}
	.deadline-name {
		color: #4b5563;
	}
	.deadline-date {
		font-weight: 600;
		color: #111827;
	}
</style>
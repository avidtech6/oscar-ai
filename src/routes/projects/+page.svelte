<script lang="ts">
	import { onMount } from 'svelte';
	import ProjectNavigator from '$lib/components/ProjectNavigator.svelte';
	import { exportManager } from '$lib/export/exportManager';

	let searchTerm = $state('');
	let selectedType = $state('all');
	let selectedStatus = $state('all');
	let showProjectNavigator = $state(true);

	let projects = [
		{
			id: '1',
			name: 'Oak Park Development',
			description: 'Comprehensive tree risk assessment and management plan for urban park redevelopment',
			status: 'active',
			client: 'City Council',
			startDate: '2024-01-15',
			endDate: '2024-06-30',
			budget: 50000,
			progress: 65,
			tags: ['risk-assessment', 'urban', 'conservation'],
			documents: [],
			team: []
		},
		{
			id: '2',
			name: 'Highway Tree Safety',
			description: 'Safety inspection and maintenance program for trees along highway network',
			status: 'active',
			client: 'Highways Agency',
			startDate: '2024-02-01',
			endDate: '2024-12-31',
			budget: 120000,
			progress: 30,
			tags: ['highway', 'safety', 'maintenance'],
			documents: [],
			team: []
		},
		{
			id: '3',
			name: 'Historic Estate Conservation',
			description: 'Conservation and preservation of trees in historic estate landscape',
			status: 'completed',
			client: 'National Trust',
			startDate: '2023-09-01',
			endDate: '2024-02-28',
			budget: 80000,
			progress: 100,
			tags: ['historic', 'conservation', 'tpo'],
			documents: [],
			team: []
		},
		{
			id: '4',
			name: 'Construction Site Protection',
			description: 'Tree protection and mitigation plan for residential construction project',
			status: 'active',
			client: 'BuildRight Ltd',
			startDate: '2024-03-01',
			endDate: '2024-08-31',
			budget: 35000,
			progress: 20,
			tags: ['construction', 'protection', 'bs5837'],
			documents: [],
			team: []
		}
	];

	let filteredProjects = $derived(() => {
		let filtered = projects;

		if (searchTerm) {
			filtered = filtered.filter(project =>
				project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
			);
		}

		return filtered;
	});

	function createNewProject() {
		console.log('Create new project');
	}

	function exportProjects() {
		console.log('Export projects');
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'active': return 'bg-green-100 text-green-800';
			case 'completed': return 'bg-blue-100 text-blue-800';
			case 'archived': return 'bg-gray-100 text-gray-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function getProgressColor(progress: number) {
		if (progress >= 75) return 'bg-green-500';
		if (progress >= 50) return 'bg-yellow-500';
		if (progress >= 25) return 'bg-orange-500';
		return 'bg-red-500';
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<main class="projects-page">
	<div class="page-header">
		<div>
			<h1>Projects</h1>
			<p class="subtitle">Manage your arboricultural projects and client work</p>
		</div>
		<div class="header-actions">
			<button class="btn-secondary" onclick={exportProjects}>
				📤 Export
			</button>
			<button class="btn-primary" onclick={createNewProject}>
				➕ New Project
			</button>
		</div>
	</div>

	<div class="projects-content">
		{#if showProjectNavigator}
			<ProjectNavigator />
		{:else}
			<div class="projects-grid">
				{#each filteredProjects as project}
					<div class="project-card">
						<div class="project-header">
							<div class="project-title">{project.name}</div>
							<span class={`status-badge ${getStatusColor(project.status)}`}>
								{project.status}
							</span>
						</div>
						
						<div class="project-client">
							👤 {project.client}
						</div>
						
						<div class="project-description">
							{project.description}
						</div>
						
						<div class="project-meta">
							<div class="project-date">
								📅 {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Ongoing'}
							</div>
							<div class="project-budget">
								💰 £{project.budget?.toLocaleString()}
							</div>
						</div>
						
						<div class="project-tags">
							{#each project.tags as tag}
								<span class="tag">{tag}</span>
							{/each}
						</div>
						
						<div class="progress-bar">
							<div class="progress-fill" style="width: {project.progress}%">
								<span class="progress-text">{project.progress}%</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>

<style>
.projects-page {
	background: white;
	min-height: 100vh;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 2rem;
	padding: 0 1rem;
}

.page-header h1 {
	margin: 0;
	font-size: 2rem;
	font-weight: 700;
	color: #111827;
}

.page-header .subtitle {
	margin: 0.5rem 0 0 0;
	font-size: 1rem;
	color: #6b7280;
}

.header-actions {
	display: flex;
	gap: 1rem;
}

.projects-content {
	padding: 0 1rem 2rem 1rem;
}

.projects-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 1rem;
}

.project-card {
	background: white;
	border: 1px solid #e5e7eb;
	border-radius: 0.5rem;
	padding: 1rem;
	transition: all 0.2s ease;
}

.project-card:hover {
	border-color: #3b82f6;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.project-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 0.75rem;
}

.project-title {
	font-size: 1rem;
	font-weight: 600;
	color: #111827;
	flex: 1;
	margin-right: 0.5rem;
}

.status-badge {
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.625rem;
	font-weight: 500;
}

.project-client {
	font-size: 0.875rem;
	color: #6b7280;
	margin-bottom: 0.5rem;
}

.project-description {
	font-size: 0.875rem;
	color: #374151;
	line-height: 1.4;
	margin-bottom: 0.75rem;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.project-meta {
	display: flex;
	gap: 1rem;
	margin-bottom: 0.75rem;
	font-size: 0.75rem;
	color: #6b7280;
}

.project-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.25rem;
	margin-bottom: 0.75rem;
}

.tag {
	background: #f3f4f6;
	color: #374151;
	padding: 0.125rem 0.375rem;
	border-radius: 0.125rem;
	font-size: 0.625rem;
}

.progress-bar {
	background: #f3f4f6;
	border-radius: 0.25rem;
	height: 0.5rem;
	overflow: hidden;
	position: relative;
}

.progress-fill {
	background: #3b82f6;
	height: 100%;
	transition: width 0.3s ease;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding-right: 0.25rem;
}

.progress-text {
	color: white;
	font-size: 0.5rem;
	font-weight: 500;
}

.btn-primary, .btn-secondary {
	padding: 0.75rem 1.5rem;
	border-radius: 0.375rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	border: none;
}

.btn-primary {
	background: #3b82f6;
	color: white;
}

.btn-primary:hover {
	background: #2563eb;
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
	.page-header {
		flex-direction: column;
		gap: 1rem;
	}

	.header-actions {
		width: 100%;
		justify-content: stretch;
	}

	.btn-primary, .btn-secondary {
		flex: 1;
	}

	.projects-grid {
		grid-template-columns: 1fr;
		gap: 0.75rem;
	}

	.project-card {
		padding: 0.75rem;
	}

	.project-meta {
		flex-direction: column;
		gap: 0.25rem;
	}
}
</style>
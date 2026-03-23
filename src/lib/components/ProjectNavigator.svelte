<script lang="ts">
	import { onMount } from 'svelte';
	import type { Project } from '$lib/types';

	let searchTerm = $state('');
	let selectedProject = $state<Project | null>(null);
	let sortBy = $state<'name' | 'date' | 'status' | 'progress'>('name');
	let sortOrder = $state<'asc' | 'desc'>('asc');

	let projects: Project[] = [
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

		return filtered.sort((a, b) => {
			let compareValue = 0;
			switch (sortBy) {
				case 'name':
					compareValue = a.name.localeCompare(b.name);
					break;
				case 'date':
					compareValue = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
					break;
				case 'status':
					compareValue = a.status.localeCompare(b.status);
					break;
				case 'progress':
					compareValue = a.progress - b.progress;
					break;
			}
			return sortOrder === 'asc' ? compareValue : -compareValue;
		});
	});

	function openProject(project: Project) {
		selectedProject = project;
		console.log('Opening project:', project.name);
	}

	function closeProject() {
		selectedProject = null;
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

<div class="project-navigator">
	<div class="navigator-header">
		<h3>📋 Project Navigator</h3>
		<div class="navigator-controls">
			<input 
				type="text" 
				bind:value={searchTerm}
				placeholder="Search projects..."
				class="search-input"
			/>
			<select bind:value={sortBy} class="sort-select">
				<option value="name">Name</option>
				<option value="date">Date</option>
				<option value="status">Status</option>
				<option value="progress">Progress</option>
			</select>
			<select bind:value={sortOrder} class="sort-select">
				<option value="asc">Ascending</option>
				<option value="desc">Descending</option>
			</select>
		</div>
	</div>

	<div class="projects-grid">
		{#each filteredProjects as project}
			<div class="project-card" onclick={() => openProject(project)}>
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

	{#if selectedProject}
		<div class="project-details-modal" onclick={closeProject}>
		  <div class="project-details-content" onclick={(e) => e.stopPropagation()}>
				<div class="details-header">
					<h3>{selectedProject.name}</h3>
					<button class="close-btn" onclick={closeProject}>✕</button>
				</div>
				
				<div class="details-section">
					<h4>Project Overview</h4>
					<p>{selectedProject.description}</p>
				</div>
				
				<div class="details-grid">
					<div class="detail-item">
						<label>Status:</label>
						<span class={`status-badge ${getStatusColor(selectedProject.status)}`}>
							{selectedProject.status}
						</span>
					</div>
					
					<div class="detail-item">
						<label>Client:</label>
						<span>{selectedProject.client}</span>
					</div>
					
					<div class="detail-item">
						<label>Duration:</label>
						<span>{formatDate(selectedProject.startDate)} - {selectedProject.endDate ? formatDate(selectedProject.endDate) : 'Ongoing'}</span>
					</div>
					
					<div class="detail-item">
						<label>Budget:</label>
						<span>£{selectedProject.budget?.toLocaleString()}</span>
					</div>
					
					<div class="detail-item">
						<label>Progress:</label>
						<span>{selectedProject.progress}%</span>
					</div>
					
					<div class="detail-item">
						<label>Documents:</label>
						<span>{selectedProject.documents.length}</span>
					</div>
				</div>
				
				<div class="details-section">
					<h4>Tags</h4>
					<div class="tags-list">
						{#each selectedProject.tags as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				</div>
				
				<div class="details-actions">
					<button class="btn-primary">View Project</button>
					<button class="btn-secondary">Edit Project</button>
					<button class="btn-secondary">Export Reports</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
.project-navigator {
	background: white;
	border-radius: 0.75rem;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	border: 1px solid #e5e7eb;
	overflow: hidden;
}

.navigator-header {
	padding: 1rem;
	border-bottom: 1px solid #e5e7eb;
	background: #f9fafb;
}

.navigator-header h3 {
	margin: 0;
	font-size: 1rem;
	font-weight: 600;
	color: #111827;
}

.navigator-controls {
	display: flex;
	gap: 0.5rem;
	margin-top: 0.75rem;
	flex-wrap: wrap;
}

.search-input {
	flex: 1;
	min-width: 150px;
	padding: 0.5rem;
	border: 1px solid #d1d5db;
	border-radius: 0.375rem;
	font-size: 0.875rem;
	background: white;
}

.sort-select {
	padding: 0.5rem;
	border: 1px solid #d1d5db;
	border-radius: 0.375rem;
	font-size: 0.875rem;
	background: white;
}

.projects-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 1rem;
	padding: 1rem;
}

.project-card {
	background: white;
	border: 1px solid #e5e7eb;
	border-radius: 0.5rem;
	padding: 1rem;
	cursor: pointer;
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

.project-details-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.project-details-content {
	background: white;
	border-radius: 0.75rem;
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
	max-width: 600px;
	width: 90%;
	max-height: 80vh;
	overflow-y: auto;
}

.details-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1.5rem;
	border-bottom: 1px solid #e5e7eb;
}

.details-header h3 {
	margin: 0;
	font-size: 1.25rem;
	font-weight: 600;
	color: #111827;
}

.close-btn {
	background: none;
	border: none;
	font-size: 1.25rem;
	cursor: pointer;
	color: #6b7280;
	padding: 0.25rem;
	border-radius: 0.25rem;
	transition: background-color 0.2s ease;
}

.close-btn:hover {
	background: #f3f4f6;
}

.details-section {
	padding: 1.5rem;
	border-bottom: 1px solid #e5e7eb;
}

.details-section h4 {
	margin: 0 0 0.75rem 0;
	font-size: 0.875rem;
	font-weight: 600;
	color: #374151;
}

.details-section p {
	margin: 0;
	font-size: 0.875rem;
	color: #374151;
	line-height: 1.5;
}

.details-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 1rem;
	padding: 1.5rem;
	border-bottom: 1px solid #e5e7eb;
}

.detail-item {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.detail-item label {
	font-size: 0.625rem;
	font-weight: 500;
	color: #6b7280;
	text-transform: uppercase;
}

.detail-item span {
	font-size: 0.875rem;
	color: #111827;
}

.tags-list {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.details-actions {
	padding: 1.5rem;
	display: flex;
	gap: 0.75rem;
	justify-content: flex-end;
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
	.navigator-controls {
		flex-direction: column;
		gap: 0.5rem;
	}

	.search-input {
		min-width: unset;
	}

	.projects-grid {
		grid-template-columns: 1fr;
		gap: 0.75rem;
		padding: 0.75rem;
	}

	.project-card {
		padding: 0.75rem;
	}

	.details-grid {
		grid-template-columns: 1fr;
	}

	.details-actions {
		flex-direction: column;
	}

	.btn-primary, .btn-secondary {
		width: 100%;
	}
}
</style>
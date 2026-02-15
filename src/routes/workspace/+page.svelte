<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { db } from '$lib/db';
	import type { Project } from '$lib/db';

	let projects: Project[] = [];
	let loading = true;
	let error = '';
	let newProjectName = '';
	let creating = false;

	onMount(async () => {
		// Load projects from IndexedDB
		try {
			projects = await db.projects.toArray();
		} catch (e) {
			error = 'Failed to load projects';
			console.error(e);
		} finally {
			loading = false;
		}
	});

	async function createProject() {
		if (!newProjectName.trim()) return;
		
		creating = true;
		error = '';
		try {
			const projectId = await db.projects.add({
				name: newProjectName.trim(),
				clientName: '',
				siteAddress: '',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				rootFolderId: '',
				driveFolderId: ''
			});
			
			// Refresh projects list
			projects = await db.projects.toArray();
			newProjectName = '';
			
			// Navigate to the new project
			goto(`/project/${projectId}`);
		} catch (e) {
			error = 'Failed to create project';
			console.error(e);
		} finally {
			creating = false;
		}
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		createProject();
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	async function deleteProject(project: Project) {
		if (!confirm(`Are you sure you want to delete "${project.name}"? This cannot be undone.`)) {
			return;
		}
		
		try {
			// Delete project and all related data
			await db.transaction('rw', [db.projects, db.trees, db.notes, db.photos, db.reports], async () => {
				// Delete related trees
				const projectTrees = await db.trees.where('projectId').equals(project.id!).toArray();
				for (const tree of projectTrees) {
					await db.trees.delete(tree.id!);
				}
				
				// Delete related notes
				const projectNotes = await db.notes.where('projectId').equals(project.id!).toArray();
				for (const note of projectNotes) {
					await db.notes.delete(note.id!);
				}
				
				// Delete related photos
				const projectPhotos = await db.photos.where('projectId').equals(project.id!).toArray();
				for (const photo of projectPhotos) {
					await db.photos.delete(photo.id!);
				}
				
				// Delete related reports
				const projectReports = await db.reports.where('projectId').equals(project.id!).toArray();
				for (const report of projectReports) {
					await db.reports.delete(report.id!);
				}
				
				// Delete the project
				await db.projects.delete(project.id!);
			});
			
			// Refresh list
			projects = await db.projects.toArray();
		} catch (e) {
			error = 'Failed to delete project';
			console.error(e);
		}
	}
</script>

<svelte:head>
	<title>Workspace - Oscar AI</title>
</svelte:head>

<div class="max-w-6xl mx-auto">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900 mb-2">Workspace</h1>
		<p class="text-gray-600">Manage your arboricultural projects</p>
	</div>

	<!-- Create new project -->
	<div class="card p-6 mb-8">
		<h2 class="text-lg font-semibold mb-4">Create New Project</h2>
		<form on:submit={handleSubmit} class="flex gap-3">
			<input
				type="text"
				bind:value={newProjectName}
				placeholder="Project name (e.g., Oakwood Development)"
				class="input flex-1"
			/>
			<button
				type="submit"
				disabled={creating || !newProjectName.trim()}
				class="btn btn-primary"
			>
				{creating ? 'Creating...' : 'Create Project'}
			</button>
		</form>
		{#if error}
			<p class="text-red-600 text-sm mt-2">{error}</p>
		{/if}
	</div>

	<!-- Projects list -->
	<div class="card">
		<div class="p-4 border-b border-gray-200">
			<h2 class="text-lg font-semibold">Your Projects</h2>
		</div>
		
		{#if loading}
			<div class="p-8 text-center text-gray-500">
				<p>Loading projects...</p>
			</div>
		{:else if projects.length === 0}
			<div class="p-8 text-center text-gray-500">
				<p class="mb-4">No projects yet. Create your first project above!</p>
			</div>
		{:else}
			<div class="divide-y divide-gray-200">
				{#each projects as project}
					<div class="p-4 hover:bg-gray-50 transition-colors">
						<div class="flex items-center justify-between">
							<a
								href="/project/{project.id}"
								class="flex-1 min-w-0"
							>
								<h3 class="text-lg font-medium text-gray-900 truncate">
									{project.name}
								</h3>
								{#if project.clientName}
									<p class="text-sm text-gray-500 truncate">Client: {project.clientName}</p>
								{/if}
								{#if project.siteAddress}
									<p class="text-sm text-gray-500 truncate">Site: {project.siteAddress}</p>
								{/if}
								<p class="text-xs text-gray-400 mt-1">
									Created: {formatDate(project.createdAt)}
								</p>
							</a>
							<div class="ml-4 flex items-center gap-2">
								<a
									href="/project/{project.id}"
									class="btn btn-secondary text-sm"
								>
									Open
								</a>
								<button
									on:click={() => deleteProject(project)}
									class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
									title="Delete project"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
									</svg>
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

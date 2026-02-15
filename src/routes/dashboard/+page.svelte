<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { db } from '$lib/db';
	import type { Project } from '$lib/db';

	let projects: Project[] = [];
	let newProjectName = '';
	let creating = false;
	let loading = true;
	let error = '';

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
</script>

<svelte:head>
	<title>Dashboard - Oscar AI</title>
</svelte:head>

<div class="max-w-6xl mx-auto">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900 mb-2">Your Projects</h1>
		<p class="text-gray-600">Manage your arboricultural surveys and reports</p>
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
			<h2 class="text-lg font-semibold">Existing Projects</h2>
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
					<a
						href="/workspace/{project.id}"
						class="block p-4 hover:bg-gray-50 transition-colors"
					>
						<div class="flex items-center justify-between">
							<div class="flex-1 min-w-0">
								<h3 class="text-lg font-medium text-gray-900 truncate">
									{project.name}
								</h3>
								{#if project.clientName}
									<p class="text-sm text-gray-500 truncate">Client: {project.clientName}</p>
								{/if}
								{#if project.siteAddress}
									<p class="text-sm text-gray-500 truncate">Site: {project.siteAddress}</p>
								{/if}
							</div>
							<div class="ml-4 flex items-center gap-4">
								<p class="text-sm text-gray-500">
									{formatDate(project.updatedAt)}
								</p>
								<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
								</svg>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>

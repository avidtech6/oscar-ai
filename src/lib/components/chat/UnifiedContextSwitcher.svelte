<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { projectContextStore, currentProjectId, currentProject, projectHistory } from '$lib/services/unified/ProjectContextStore';
	import { db } from '$lib/db';

	let isOpen = false;
	let recentProjects: any[] = [];
	let isLoading = false;

	onMount(async () => {
		await loadRecentProjects();
	});

	async function loadRecentProjects() {
		isLoading = true;
		try {
			// Get projects from history
			const historyIds = $projectHistory;
			if (historyIds.length > 0) {
				// Fetch project details for each ID in history
				const projects = [];
				for (const id of historyIds.slice(0, 5)) { // Limit to 5 most recent
					try {
						const project = await db.projects.get(id);
						if (project) {
							projects.push(project);
						}
					} catch (error) {
						console.error(`Error loading project ${id}:`, error);
					}
				}
				recentProjects = projects;
			} else {
				// Fallback: get all projects ordered by update time
				recentProjects = await db.projects.orderBy('updatedAt').reverse().limit(5).toArray();
			}
		} catch (error) {
			console.error('Error loading recent projects:', error);
		} finally {
			isLoading = false;
		}
	}

	function handleProjectSelect(projectId: string | null) {
		if (projectId) {
			projectContextStore.setCurrentProject(projectId);
		} else {
			projectContextStore.clearCurrentProject();
		}
		isOpen = false;
	}

	function toggleDropdown() {
		isOpen = !isOpen;
		if (isOpen) {
			loadRecentProjects();
		}
	}

	function closeDropdown() {
		isOpen = false;
	}

	// Handle click outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.unified-context-switcher')) {
			isOpen = false;
		}
	}

	$: currentProjectIdValue = $currentProjectId;
	$: currentProjectValue = $currentProject;
	$: currentProjectName = currentProjectValue?.name || 'Select Project';
</script>

<div class="unified-context-switcher relative inline-block">
	<button
		on:click={toggleDropdown}
		on:keydown={(e) => e.key === 'Escape' && closeDropdown()}
		class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
		aria-haspopup="true"
		aria-expanded={isOpen}
	>
		{#if currentProjectIdValue}
			<span class="w-2 h-2 bg-green-500 rounded-full"></span>
			<span>Project: {currentProjectName}</span>
		{:else}
			<span class="w-2 h-2 bg-blue-500 rounded-full"></span>
			<span>General Mode</span>
		{/if}
		<svg
			class={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isOpen}
		<div
			class="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2"
		>
			<!-- Mode Selection -->
			<div class="px-3 py-2 border-b border-gray-100">
				<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Context Mode</h3>
				<div class="space-y-1">
					<button
						on:click={() => handleProjectSelect(null)}
						class="w-full text-left px-3 py-2 rounded hover:bg-blue-50 flex items-center gap-2"
						class:bg-blue-50={!currentProjectIdValue}
						class:text-blue-700={!currentProjectIdValue}
					>
						<span class="w-2 h-2 bg-blue-500 rounded-full"></span>
						<span class="flex-1">General Mode</span>
						{#if !currentProjectIdValue}
							<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
						{/if}
					</button>
				</div>
			</div>

			<!-- Recent Projects -->
			<div class="px-3 py-2 border-b border-gray-100">
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Projects</h3>
					{#if isLoading}
						<svg class="w-3 h-3 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					{/if}
				</div>
				{#if recentProjects.length > 0}
					<div class="space-y-1">
						{#each recentProjects as project}
							<button
								on:click={() => handleProjectSelect(project.id)}
								class="w-full text-left px-3 py-2 rounded hover:bg-green-50 flex items-center gap-2"
								class:bg-green-50={currentProjectIdValue === project.id}
								class:text-green-700={currentProjectIdValue === project.id}
							>
								<span class="w-2 h-2 bg-green-500 rounded-full"></span>
								<span class="flex-1 truncate">{project.name}</span>
								{#if currentProjectIdValue === project.id}
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				{:else if !isLoading}
					<p class="text-xs text-gray-500 px-3 py-2">No projects yet</p>
				{/if}
			</div>

			<!-- Quick Actions -->
			<div class="px-3 py-2">
				<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Access</h3>
				<div class="grid grid-cols-2 gap-1">
					<a
						href="/notes"
						class="px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2 text-sm"
						on:click|preventDefault={() => {
							closeDropdown();
							goto('/notes');
						}}
					>
						<span class="text-gray-500">📝</span>
						<span>Notes</span>
					</a>
					<a
						href="/tasks"
						class="px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2 text-sm"
						on:click|preventDefault={() => {
							closeDropdown();
							goto('/tasks');
						}}
					>
						<span class="text-gray-500">📋</span>
						<span>Tasks</span>
					</a>
					<a
						href="/reports"
						class="px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2 text-sm"
						on:click|preventDefault={() => {
							closeDropdown();
							goto('/reports');
						}}
					>
						<span class="text-gray-500">📄</span>
						<span>Reports</span>
					</a>
					<a
						href="/workspace"
						class="px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2 text-sm"
						on:click|preventDefault={() => {
							closeDropdown();
							goto('/workspace');
						}}
					>
						<span class="text-gray-500">📁</span>
						<span>Projects</span>
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	
	:global(.unified-context-switcher-dropdown) {
		animation: fadeIn 0.15s ease-out;
	}
</style>

<svelte:window on:click={handleClickOutside} />
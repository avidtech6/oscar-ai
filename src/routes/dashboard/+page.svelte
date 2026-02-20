<script lang="ts">
	import { onMount } from 'svelte';
	import { db } from '$lib/db';
	import type { Project, Note, Report } from '$lib/db';

	let projects: Project[] = [];
	let recentNotes: Note[] = [];
	let recentReports: Report[] = [];
	let loading = true;
	let stats = {
		totalProjects: 0,
		totalReports: 0,
		totalNotes: 0,
		activeProjects: 0
	};

	onMount(async () => {
		try {
			projects = await db.projects.toArray();
			const allNotes = await db.notes.toArray();
			const allReports = await db.reports.toArray();

			stats.totalProjects = projects.length;
			stats.totalReports = allReports.length;
			stats.totalNotes = allNotes.length;
			stats.activeProjects = projects.filter(p => {
				const twoWeeksAgo = new Date();
				twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
				return new Date(p.updatedAt) > twoWeeksAgo;
			}).length;

			recentNotes = allNotes
				.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
				.slice(0, 5);

			recentReports = allReports
				.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
				.slice(0, 5);

		} catch (e) {
			console.error('Failed to load dashboard data:', e);
		} finally {
			loading = false;
		}
	});

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays} days ago`;
		
		return date.toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short'
		});
	}

	function truncateText(text: string, maxLength: number = 60) {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	}
</script>

<svelte:head>
	<title>Dashboard - Oscar AI</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
		<p class="text-gray-600">Overview of your arboricultural work and quick access to tools</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-500">Total Projects</p>
					<p class="text-3xl font-bold text-gray-900 mt-2">{stats.totalProjects}</p>
				</div>
				<div class="p-3 bg-blue-50 rounded-lg">
					<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
					</svg>
				</div>
			</div>
			<div class="mt-4">
				<a href="/workspace" class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
					View all projects
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
					</svg>
				</a>
			</div>
		</div>

		<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-500">Active Projects</p>
					<p class="text-3xl font-bold text-gray-900 mt-2">{stats.activeProjects}</p>
				</div>
				<div class="p-3 bg-green-50 rounded-lg">
					<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
				</div>
			</div>
			<div class="mt-4">
				<p class="text-xs text-gray-500">Updated in last 14 days</p>
			</div>
		</div>

		<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-500">Total Reports</p>
					<p class="text-3xl font-bold text-gray-900 mt-2">{stats.totalReports}</p>
				</div>
				<div class="p-3 bg-purple-50 rounded-lg">
					<svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
					</svg>
				</div>
			</div>
			<div class="mt-4">
				<a href="/reports" class="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1">
					View all reports
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
					</svg>
				</a>
			</div>
		</div>

		<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-500">Total Notes</p>
					<p class="text-3xl font-bold text-gray-900 mt-2">{stats.totalNotes}</p>
				</div>
				<div class="p-3 bg-yellow-50 rounded-lg">
					<svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
					</svg>
				</div>
			</div>
			<div class="mt-4">
				<a href="/notes" class="text-yellow-600 hover:text-yellow-800 text-sm font-medium flex items-center gap-1">
					View all notes
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
					</svg>
				</a>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
		<h2 class="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<a href="/workspace" class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
				<div class="p-3 bg-blue-50 rounded-lg mb-3">
					<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
					</svg>
				</div>
				<p class="font-medium text-gray-800">New Project</p>
				<p class="text-sm text-gray-500 text-center mt-1">Start a new project</p>
			</a>
			<a href="/reports" class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
				<div class="p-3 bg-purple-50 rounded-lg mb-3">
					<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
					</svg>
				</div>
				<p class="font-medium text-gray-800">New Report</p>
				<p class="text-sm text-gray-500 text-center mt-1">Create a report</p>
			</a>
			<a href="/notes" class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
				<div class="p-3 bg-yellow-50 rounded-lg mb-3">
					<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
					</svg>
				</div>
				<p class="font-medium text-gray-800">New Note</p>
				<p class="text-sm text-gray-500 text-center mt-1">Jot down notes</p>
			</a>
			<a href="/oscar" class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
				<div class="p-3 bg-green-50 rounded-lg mb-3">
					<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
					</svg>
				</div>
				<p class="font-medium text-gray-800">Ask Oscar AI</p>
				<p class="text-sm text-gray-500 text-center mt-1">Get AI assistance</p>
			</a>
		</div>
	</div>

	<!-- Recent Projects -->
	<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
		<div class="flex items-center justify-between mb-6">
			<h2 class="text-lg font-semibold text-gray-800">Recent Projects</h2>
			<a href="/workspace" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
				View all projects
			</a>
		</div>
		
		{#if loading}
			<div class="text-center py-8 text-gray-500">
				<p>Loading projects...</p>
			</div>
		{:else if projects.length === 0}
			<div class="text-center py-8 text-gray-500">
				<p>No projects yet. Create your first project!</p>
				<a href="/workspace" class="text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block">
					Create a project
				</a>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each projects.slice(0, 3) as project}
					<a href="/project/{project.id}" class="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
						<div class="flex items-center gap-3 mb-2">
							<div class="p-2 bg-blue-50 rounded-lg">
								<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
								</svg>
							</div>
							<h3 class="font-medium text-gray-800 truncate">{project.name}</h3>
						</div>
						<p class="text-xs text-gray-400 mt-2">
							Updated: {formatDate(project.updatedAt)}
						</p>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>

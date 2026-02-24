<script lang="ts">
	import { onMount } from 'svelte';
	import { db } from '$lib/db';
	import type { Project, Note, Report, Tree, VoiceNote, Photo } from '$lib/db';

	let projects: Project[] = [];
	let recentNotes: Note[] = [];
	let recentReports: Report[] = [];
	let recentTrees: Tree[] = [];
	let recentVoiceNotes: VoiceNote[] = [];
	let loading = true;
	let stats = {
		totalProjects: 0,
		totalReports: 0,
		totalNotes: 0,
		totalTrees: 0,
		totalPhotos: 0,
		totalVoiceNotes: 0,
		activeProjects: 0,
		completionRate: 0
	};

	onMount(async () => {
		try {
			projects = await db.projects.toArray();
			const allNotes = await db.notes.toArray();
			const allReports = await db.reports.toArray();
			const allTrees = await db.trees.toArray();
			const allPhotos = await db.photos.toArray();
			const allVoiceNotes = await db.voiceNotes.toArray();

			stats.totalProjects = projects.length;
			stats.totalReports = allReports.length;
			stats.totalNotes = allNotes.length;
			stats.totalTrees = allTrees.length;
			stats.totalPhotos = allPhotos.length;
			stats.totalVoiceNotes = allVoiceNotes.length;
			
			// Active projects: updated in last 14 days
			stats.activeProjects = projects.filter(p => {
				const twoWeeksAgo = new Date();
				twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
				return new Date(p.updatedAt) > twoWeeksAgo;
			}).length;
			
			// Completion rate: projects with at least one report
			const projectsWithReports = new Set(allReports.map(r => r.projectId));
			stats.completionRate = projects.length > 0
				? Math.round((projectsWithReports.size / projects.length) * 100)
				: 0;

			// Get recent items
			recentNotes = allNotes
				.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
				.slice(0, 5);

			recentReports = allReports
				.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
				.slice(0, 5);

			recentTrees = allTrees
				.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
				.slice(0, 5);

			recentVoiceNotes = allVoiceNotes
				.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
				.slice(0, 5);

		} catch (e) {
			console.error('Failed to load dashboard data:', e);
		} finally {
			loading = false;
		}
	});

	function formatDate(dateString: string | Date) {
		const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
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
		if (!text) return '';
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	}
</script>

<svelte:head>
	<title>Dashboard - Oscar AI</title>
</svelte:head>

<div class="max-w-7xl mx-auto pb-16">
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
					<p class="text-xs text-gray-500 mt-1">Updated in last 14 days</p>
				</div>
				<div class="p-3 bg-green-50 rounded-lg">
					<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-600">Completion Rate</span>
					<span class="text-sm font-semibold text-green-600">{stats.completionRate}%</span>
				</div>
				<div class="w-full bg-gray-200 rounded-full h-2 mt-1">
					<div class="bg-green-600 h-2 rounded-full" style={`width: ${stats.completionRate}%`}></div>
				</div>
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

	<!-- Secondary Stats -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
		<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-500">Trees Surveyed</p>
					<p class="text-2xl font-bold text-gray-900 mt-2">{stats.totalTrees}</p>
				</div>
				<div class="p-3 bg-emerald-50 rounded-lg">
					<svg class="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
					</svg>
				</div>
			</div>
			<div class="mt-4">
				<p class="text-xs text-gray-500">Across all projects</p>
			</div>
		</div>

		<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-500">Photos Captured</p>
					<p class="text-2xl font-bold text-gray-900 mt-2">{stats.totalPhotos}</p>
				</div>
				<div class="p-3 bg-pink-50 rounded-lg">
					<svg class="w-7 h-7 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
					</svg>
				</div>
			</div>
			<div class="mt-4">
				<p class="text-xs text-gray-500">Field documentation</p>
			</div>
		</div>

		<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-500">Voice Notes</p>
					<p class="text-2xl font-bold text-gray-900 mt-2">{stats.totalVoiceNotes}</p>
				</div>
				<div class="p-3 bg-indigo-50 rounded-lg">
					<svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
					</svg>
				</div>
			</div>
			<div class="mt-4">
				<p class="text-xs text-gray-500">Dictated recordings</p>
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

	<!-- Recent Activity -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Recent Projects -->
		<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-lg font-semibold text-gray-800">Recent Projects</h2>
				<a href="/workspace" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
					View all
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
				<div class="space-y-4">
					{#each projects.slice(0, 5) as project}
						<a href="/project/{project.id}" class="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
							<div class="flex items-center gap-3 mb-2">
								<div class="p-2 bg-blue-50 rounded-lg">
									<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
									</svg>
								</div>
								<div class="flex-1 min-w-0">
									<h3 class="font-medium text-gray-800 truncate">{project.name}</h3>
									<p class="text-xs text-gray-500 truncate">{project.client} • {project.location}</p>
								</div>
							</div>
							<p class="text-xs text-gray-400 mt-2">
								Updated: {formatDate(project.updatedAt)}
							</p>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Recent Activity Feed -->
		<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-lg font-semibold text-gray-800">Recent Activity</h2>
				<span class="text-sm text-gray-500">Across all projects</span>
			</div>
			
			{#if loading}
				<div class="text-center py-8 text-gray-500">
					<p>Loading activity...</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#if recentNotes.length > 0}
						{#each recentNotes as note}
							<div class="p-4 border border-gray-200 rounded-lg">
								<div class="flex items-center gap-3 mb-2">
									<div class="p-2 bg-yellow-50 rounded-lg">
										<svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
										</svg>
									</div>
									<div class="flex-1 min-w-0">
										<h3 class="font-medium text-gray-800 truncate">{note.title}</h3>
										<p class="text-xs text-gray-500">Note • {formatDate(note.updatedAt)}</p>
									</div>
								</div>
								<p class="text-sm text-gray-600 mt-2">{truncateText(note.content, 80)}</p>
							</div>
						{/each}
					{/if}

					{#if recentTrees.length > 0}
						{#each recentTrees as tree}
							<div class="p-4 border border-gray-200 rounded-lg">
								<div class="flex items-center gap-3 mb-2">
									<div class="p-2 bg-emerald-50 rounded-lg">
										<svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
										</svg>
									</div>
									<div class="flex-1 min-w-0">
										<h3 class="font-medium text-gray-800 truncate">{tree.species} ({tree.number})</h3>
										<p class="text-xs text-gray-500">Tree • {formatDate(tree.updatedAt)}</p>
									</div>
								</div>
								<p class="text-sm text-gray-600 mt-2">Condition: {tree.condition} • DBH: {tree.DBH}cm</p>
							</div>
						{/each}
					{/if}

					{#if recentVoiceNotes.length > 0}
						{#each recentVoiceNotes as voiceNote}
							<div class="p-4 border border-gray-200 rounded-lg">
								<div class="flex items-center gap-3 mb-2">
									<div class="p-2 bg-indigo-50 rounded-lg">
										<svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
										</svg>
									</div>
									<div class="flex-1 min-w-0">
										<h3 class="font-medium text-gray-800 truncate">Voice Note</h3>
										<p class="text-xs text-gray-500">Dictation • {formatDate(voiceNote.timestamp)}</p>
									</div>
								</div>
								<p class="text-sm text-gray-600 mt-2">{truncateText(voiceNote.transcript, 80)}</p>
							</div>
						{/each}
					{/if}

					{#if recentNotes.length === 0 && recentTrees.length === 0 && recentVoiceNotes.length === 0}
						<div class="text-center py-8 text-gray-500">
							<p>No recent activity yet.</p>
							<p class="text-sm mt-2">Create notes, add trees, or use voice dictation to see activity here.</p>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

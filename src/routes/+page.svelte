<script lang="ts">
	import { onMount } from 'svelte';
	
	// Home domain - overview, capture entry, recents (Module 1.2)
	const recentItems = [
		{ id: 1, title: 'Project Planning Session', type: 'note', time: '2 hours ago' },
		{ id: 2, title: 'Quarterly Report Draft', type: 'document', time: '1 day ago' },
		{ id: 3, title: 'Team Meeting Notes', type: 'meeting', time: '3 days ago' },
		{ id: 4, title: 'Client Feedback', type: 'feedback', time: '1 week ago' }
	];
	
	const quickActions = [
		{ label: 'Capture Note', icon: 'i-mdi-note-plus', route: '/workspace?action=capture' },
		{ label: 'Start Project', icon: 'i-mdi-folder-plus', route: '/workspace?action=new-project' },
		{ label: 'Upload File', icon: 'i-mdi-file-upload', route: '/files?action=upload' },
		{ label: 'Send Message', icon: 'i-mdi-send', route: '/connect?action=message' }
	];
</script>

<svelte:head>
	<title>Oscar AI - Home</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-forest-50 to-gray-50 p-6">
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome to Oscar AI</h1>
			<p class="text-gray-600">Your intelligent workspace for projects, files, and communication</p>
		</div>
		
		<!-- Quick Actions (Capture entry) -->
		<div class="mb-10">
			<h2 class="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				{#each quickActions as action}
					<a
						href={action.route}
						class="bg-white rounded-xl p-5 border border-gray-200 hover:border-forest-300 hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
					>
						<span class={`text-2xl text-forest-600 mb-3 ${action.icon}`}></span>
						<span class="font-medium text-gray-800">{action.label}</span>
					</a>
				{/each}
			</div>
		</div>
		
		<!-- Recent Items -->
		<div class="mb-10">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-semibold text-gray-800">Recent Items</h2>
				<a href="/recent" class="text-sm text-forest-600 hover:text-forest-800 font-medium">View all</a>
			</div>
			<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
				{#each recentItems as item}
					<div class="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center">
									<span class="text-forest-600">
										{#if item.type === 'note'}
											<span class="i-mdi-note-text w-5 h-5"></span>
										{:else if item.type === 'document'}
											<span class="i-mdi-file-document w-5 h-5"></span>
										{:else if item.type === 'meeting'}
											<span class="i-mdi-calendar-clock w-5 h-5"></span>
										{:else}
											<span class="i-mdi-message-text w-5 h-5"></span>
										{/if}
									</span>
								</div>
								<div>
									<h3 class="font-medium text-gray-900">{item.title}</h3>
									<p class="text-sm text-gray-500">{item.type} • {item.time}</p>
								</div>
							</div>
							<button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
								<span class="i-mdi-open-in-new w-5 h-5"></span>
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Domain Overview -->
		<div>
			<h2 class="text-xl font-semibold text-gray-800 mb-4">Domains</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<a href="/workspace" class="bg-white rounded-xl p-5 border border-gray-200 hover:border-forest-300 hover:shadow-md transition-all">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-12 h-12 rounded-lg bg-forest-100 flex items-center justify-center">
							<span class="i-mdi-briefcase text-forest-600 w-6 h-6"></span>
						</div>
						<h3 class="text-lg font-semibold text-gray-900">Workspace</h3>
					</div>
					<p class="text-gray-600 text-sm">Projects, tasks, notes, reports, and calendar</p>
				</a>
				
				<a href="/files" class="bg-white rounded-xl p-5 border border-gray-200 hover:border-forest-300 hover:shadow-md transition-all">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
							<span class="i-mdi-folder text-blue-600 w-6 h-6"></span>
						</div>
						<h3 class="text-lg font-semibold text-gray-900">Files</h3>
					</div>
					<p class="text-gray-600 text-sm">Universal explorer with metadata and organization</p>
				</a>
				
				<a href="/connect" class="bg-white rounded-xl p-5 border border-gray-200 hover:border-forest-300 hover:shadow-md transition-all">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
							<span class="i-mdi-message-text text-purple-600 w-6 h-6"></span>
						</div>
						<h3 class="text-lg font-semibold text-gray-900">Connect</h3>
					</div>
					<p class="text-gray-600 text-sm">Inbox, campaigns, and communication intelligence</p>
				</a>
				
				<a href="/map" class="bg-white rounded-xl p-5 border border-gray-200 hover:border-forest-300 hover:shadow-md transition-all">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
							<span class="i-mdi-map-marker text-green-600 w-6 h-6"></span>
						</div>
						<h3 class="text-lg font-semibold text-gray-900">Map</h3>
					</div>
					<p class="text-gray-600 text-sm">Boundaries, markers, and spatial linking</p>
				</a>
				
				<a href="/dashboard" class="bg-white rounded-xl p-5 border border-gray-200 hover:border-forest-300 hover:shadow-md transition-all">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
							<span class="i-mdi-view-dashboard text-amber-600 w-6 h-6"></span>
						</div>
						<h3 class="text-lg font-semibold text-gray-900">Dashboard</h3>
					</div>
					<p class="text-gray-600 text-sm">Settings, support, and system documents</p>
				</a>
				
				<a href="/recent" class="bg-white rounded-xl p-5 border border-gray-200 hover:border-forest-300 hover:shadow-md transition-all">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
							<span class="i-mdi-history text-gray-600 w-6 h-6"></span>
						</div>
						<h3 class="text-lg font-semibold text-gray-900">Recent</h3>
					</div>
					<p class="text-gray-600 text-sm">Dynamic 3–4 most recent items across domains</p>
				</a>
			</div>
		</div>
	</div>
</div>

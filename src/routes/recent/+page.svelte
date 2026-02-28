<script lang="ts">
	import { onMount } from 'svelte';
	
	let isLoading = true;
	let recentItems: Array<{
		id: number;
		type: 'file' | 'project' | 'note' | 'report' | 'task';
		title: string;
		description: string;
		timestamp: string;
		user: string;
		action: string;
	}> = [];
	
	onMount(async () => {
		// Simulate loading recent items
		setTimeout(() => {
			recentItems = [
				{ id: 1, type: 'project', title: 'Oak Tree Preservation', description: 'Updated project timeline and budget', timestamp: '5 minutes ago', user: 'John Arborist', action: 'updated' },
				{ id: 2, type: 'file', title: 'Site Survey Report.pdf', description: 'Added new survey data and photos', timestamp: '15 minutes ago', user: 'Sarah Forester', action: 'uploaded' },
				{ id: 3, type: 'note', title: 'Meeting Notes - Feb 26', description: 'Discussed tree health assessment results', timestamp: '1 hour ago', user: 'Mike Botanist', action: 'created' },
				{ id: 4, type: 'report', title: 'Monthly Progress Report', description: 'Completed February progress analysis', timestamp: '2 hours ago', user: 'Lisa Ecologist', action: 'generated' },
				{ id: 5, type: 'task', title: 'Soil Testing', description: 'Assigned to field team for completion', timestamp: '3 hours ago', user: 'David Surveyor', action: 'assigned' },
				{ id: 6, type: 'project', title: 'Urban Forest Plan', description: 'Added new tree inventory data', timestamp: '5 hours ago', user: 'John Arborist', action: 'updated' },
				{ id: 7, type: 'file', title: 'Tree Health Assessment.xlsx', description: 'Updated spreadsheet with new metrics', timestamp: '1 day ago', user: 'Sarah Forester', action: 'modified' },
				{ id: 8, type: 'note', title: 'Client Feedback', description: 'Recorded client comments on proposal', timestamp: '1 day ago', user: 'Mike Botanist', action: 'added' }
			];
			isLoading = false;
		}, 1000);
	});
	
	function getTypeIcon(type: string) {
		switch(type) {
			case 'file': return '📄';
			case 'project': return '📁';
			case 'note': return '📝';
			case 'report': return '📊';
			case 'task': return '✅';
			default: return '📌';
		}
	}
	
	function getTypeColor(type: string) {
		switch(type) {
			case 'file': return 'bg-blue-100 text-blue-800';
			case 'project': return 'bg-green-100 text-green-800';
			case 'note': return 'bg-yellow-100 text-yellow-800';
			case 'report': return 'bg-purple-100 text-purple-800';
			case 'task': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Recent Activity</h1>
		<p class="mt-2 text-gray-600">Track recent updates, changes, and activities across the platform</p>
	</div>
	
	<!-- Filters -->
	<div class="mb-8 bg-white rounded-lg shadow p-4">
		<div class="flex flex-wrap items-center gap-4">
			<div class="flex-1">
				<label for="search" class="sr-only">Search recent activity</label>
				<div class="relative">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<input
						id="search"
						type="search"
						placeholder="Search recent activity..."
						class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					/>
				</div>
			</div>
			
			<div class="flex items-center space-x-4">
				<select class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
					<option value="all">All Types</option>
					<option value="project">Projects</option>
					<option value="file">Files</option>
					<option value="note">Notes</option>
					<option value="report">Reports</option>
					<option value="task">Tasks</option>
				</select>
				
				<select class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
					<option value="today">Today</option>
					<option value="week">This Week</option>
					<option value="month">This Month</option>
					<option value="all">All Time</option>
				</select>
				
				<button class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
					Apply Filters
				</button>
			</div>
		</div>
	</div>
	
	<!-- Activity Timeline -->
	<div class="bg-white rounded-lg shadow overflow-hidden">
		<div class="px-6 py-4 border-b border-gray-200">
			<h2 class="text-lg font-medium text-gray-900">Recent Timeline</h2>
			<p class="mt-1 text-sm text-gray-600">Chronological view of all recent activities</p>
		</div>
		
		{#if isLoading}
			<div class="p-8 text-center">
				<svg class="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
				<p class="mt-4 text-gray-500">Loading recent activity...</p>
			</div>
		{:else}
			<div class="divide-y divide-gray-200">
				{#each recentItems as item}
					<div class="px-6 py-4 hover:bg-gray-50">
						<div class="flex items-start">
							<div class="flex-shrink-0">
								<div class="w-10 h-10 rounded-full flex items-center justify-center text-xl">
									{getTypeIcon(item.type)}
								</div>
							</div>
							
							<div class="ml-4 flex-1">
								<div class="flex items-center justify-between">
									<div>
										<h3 class="text-sm font-medium text-gray-900">{item.title}</h3>
										<p class="text-sm text-gray-600 mt-1">{item.description}</p>
									</div>
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getTypeColor(item.type)}">
										{item.type.charAt(0).toUpperCase() + item.type.slice(1)}
									</span>
								</div>
								
								<div class="mt-2 flex items-center text-sm text-gray-500">
									<svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
									<span>{item.user}</span>
									<span class="mx-2">•</span>
									<svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span>{item.timestamp}</span>
									<span class="mx-2">•</span>
									<span class="text-blue-600 font-medium">{item.action}</span>
								</div>
								
								<div class="mt-3 flex space-x-3">
									<button class="text-sm text-blue-600 hover:text-blue-800 font-medium">
										View Details
									</button>
									<button class="text-sm text-gray-600 hover:text-gray-800 font-medium">
										Open
									</button>
									<button class="text-sm text-gray-600 hover:text-gray-800 font-medium">
										Share
									</button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
		
		<div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
			<div class="flex items-center justify-between">
				<button class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">
					Load More
				</button>
				<div class="text-sm text-gray-500">
					Showing {recentItems.length} of 50+ recent activities
				</div>
			</div>
		</div>
	</div>
	
	<!-- Activity Stats -->
	<div class="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
					<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Files Updated</p>
					<p class="text-2xl font-semibold text-gray-900">24</p>
				</div>
			</div>
		</div>
		
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="flex-shrink-0 bg-green-100 rounded-md p-3">
					<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
					</svg>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Projects Modified</p>
					<p class="text-2xl font-semibold text-gray-900">8</p>
				</div>
			</div>
		</div>
		
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
					<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
					</svg>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Notes Created</p>
					<p class="text-2xl font-semibold text-gray-900">15</p>
				</div>
			</div>
		</div>
		
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="flex-shrink-0 bg-purple-100 rounded-md p-3">
					<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
					</svg>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Tasks Completed</p>
					<p class="text-2xl font-semibold text-gray-900">32</p>
				</div>
			</div>
		</div>
	</div>
</div>
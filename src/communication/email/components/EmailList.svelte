<script lang="ts">
	// Empty UI shell - no logic
</script>

<div class="email-list flex-1 border-r border-gray-200 p-4">
	<!-- List Header -->
	<div class="flex items-center justify-between mb-4">
		<h2 class="text-lg font-semibold text-gray-800">Inbox</h2>
		<div class="flex items-center gap-2">
			<button class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded">
				Filter
			</button>
			<button class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded">
				Sort
			</button>
		</div>
	</div>
	
	<!-- Email Items -->
	<div class="space-y-2">
		<!-- Email Item 1 -->
		<div class="email-item p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
			<div class="flex items-start gap-3">
				<div class="flex-shrink-0">
					<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
						<span class="text-sm font-medium text-blue-600">J</span>
					</div>
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center justify-between">
						<h4 class="text-sm font-medium text-gray-800 truncate">John Smith</h4>
						<span class="text-xs text-gray-500">10:30 AM</span>
					</div>
					<p class="text-sm text-gray-700 font-medium truncate">Project Proposal Review</p>
					<p class="text-sm text-gray-500 truncate">Hi, I've reviewed the proposal and have some feedback...</p>
				</div>
			</div>
		</div>
		
		<!-- Email Item 2 -->
		<div class="email-item p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
			<div class="flex items-start gap-3">
				<div class="flex-shrink-0">
					<div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
						<span class="text-sm font-medium text-green-600">S</span>
					</div>
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center justify-between">
						<h4 class="text-sm font-medium text-gray-800 truncate">Sarah Johnson</h4>
						<span class="text-xs text-gray-500">Yesterday</span>
					</div>
					<p class="text-sm text-gray-700 font-medium truncate">Meeting Notes</p>
					<p class="text-sm text-gray-500 truncate">Here are the notes from our meeting yesterday...</p>
				</div>
			</div>
		</div>
		
		<!-- Email Item 3 -->
		<div class="email-item p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
			<div class="flex items-start gap-3">
				<div class="flex-shrink-0">
					<div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
						<span class="text-sm font-medium text-purple-600">T</span>
					</div>
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center justify-between">
						<h4 class="text-sm font-medium text-gray-800 truncate">Team Updates</h4>
						<span class="text-xs text-gray-500">2 days ago</span>
					</div>
					<p class="text-sm text-gray-700 font-medium truncate">Weekly Team Sync</p>
					<p class="text-sm text-gray-500 truncate">Reminder about our weekly team sync meeting...</p>
				</div>
			</div>
		</div>
		
		<!-- Email Item 4 -->
		<div class="email-item p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
			<div class="flex items-start gap-3">
				<div class="flex-shrink-0">
					<div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
						<span class="text-sm font-medium text-yellow-600">N</span>
					</div>
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center justify-between">
						<h4 class="text-sm font-medium text-gray-800 truncate">Newsletter</h4>
						<span class="text-xs text-gray-500">3 days ago</span>
					</div>
					<p class="text-sm text-gray-700 font-medium truncate">Monthly Industry Updates</p>
					<p class="text-sm text-gray-500 truncate">Check out the latest industry news and updates...</p>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Empty State (hidden when items exist) -->
	<div class="hidden mt-8 text-center">
		<div class="text-gray-400 mb-2">
			<svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
			</svg>
		</div>
		<p class="text-gray-500">No emails in this folder</p>
	</div>
</div>

<style>
	.email-list {
		/* Component styles */
	}
	
	.email-item {
		transition: background-color 0.2s;
	}
</style>
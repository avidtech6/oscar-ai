<script lang="ts">
	// Empty UI shell - no logic
</script>

<div class="email-sidebar w-64 border-r border-gray-200 bg-gray-50 p-4">
	<!-- Folder Navigation -->
	<div class="mb-6">
		<h3 class="text-sm font-semibold text-gray-700 mb-2">Folders</h3>
		<ul class="space-y-1">
			<li class="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
				Inbox
			</li>
			<li class="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
				Sent
			</li>
			<li class="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
				Drafts
			</li>
			<li class="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
				Archive
			</li>
			<li class="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
				Spam
			</li>
		</ul>
	</div>
	
	<!-- Labels/Tags -->
	<div class="mb-6">
		<h3 class="text-sm font-semibold text-gray-700 mb-2">Labels</h3>
		<ul class="space-y-1">
			<li class="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2">
				<div class="w-3 h-3 rounded-full bg-blue-500"></div>
				<span>Work</span>
			</li>
			<li class="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2">
				<div class="w-3 h-3 rounded-full bg-green-500"></div>
				<span>Personal</span>
			</li>
			<li class="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2">
				<div class="w-3 h-3 rounded-full bg-purple-500"></div>
				<span>Important</span>
			</li>
		</ul>
	</div>
	
	<!-- Account Info -->
	<div class="mt-auto pt-4 border-t border-gray-200">
		<div class="flex items-center gap-2">
			<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
				<span class="text-sm font-medium text-blue-600">U</span>
			</div>
			<div>
				<p class="text-sm font-medium text-gray-800">User Account</p>
				<p class="text-xs text-gray-500">Connected</p>
			</div>
		</div>
	</div>
</div>

<style>
	.email-sidebar {
		/* Component styles */
	}
</style>
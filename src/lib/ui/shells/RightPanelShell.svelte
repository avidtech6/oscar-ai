<script lang="ts">
	import { page } from '$app/stores';
	import { sidebarOpen } from '$lib/stores/appStore';
	
	const icons: Record<string, string> = {
		info: "i-mdi-information-outline",
		settings: "i-mdi-cog-outline",
		close: "i-mdi-close",
		chevron: "i-mdi-chevron-right"
	};
	
	function getCurrentContext() {
		const path = $page.url.pathname;
		if (path.startsWith('/workspace')) return 'Workspace';
		if (path.startsWith('/projects')) return 'Projects';
		if (path.startsWith('/files')) return 'Files';
		if (path.startsWith('/connect')) return 'Connect';
		if (path.startsWith('/dashboard')) return 'Dashboard';
		if (path.startsWith('/search')) return 'Search';
		return 'General';
	}
</script>

<div class="hidden lg:flex w-80 border-l border-gray-200 bg-white flex-col h-full">
	<!-- Panel header -->
	<div class="p-4 border-b border-gray-200 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<span class="text-forest-600">{@html icons.info}</span>
			<h3 class="font-semibold text-gray-800">Context</h3>
		</div>
		<button
			class="p-1 text-gray-400 hover:text-gray-600 rounded"
			aria-label="Close panel"
		>
			{@html icons.close}
		</button>
	</div>
	
	<!-- Current domain -->
	<div class="p-4 border-b border-gray-100">
		<div class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Current Domain</div>
		<div class="flex items-center gap-2">
			<div class="w-2 h-2 rounded-full bg-forest-500"></div>
			<span class="font-medium text-gray-800">{getCurrentContext()}</span>
		</div>
	</div>
	
	<!-- Domain switcher -->
	<div class="p-4 border-b border-gray-100">
		<div class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Switch Domain</div>
		<div class="space-y-1">
			{#each ['Workspace', 'Projects', 'Files', 'Connect', 'Dashboard', 'Search'] as domain}
				<button
					class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors {domain === getCurrentContext() ? 'bg-forest-50 text-forest-700' : 'text-gray-600 hover:bg-gray-50'}"
				>
					<div class="flex items-center justify-between">
						<span>{domain}</span>
						{#if domain === getCurrentContext()}
							<span class="text-forest-500">{@html icons.chevron}</span>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</div>
	
	<!-- Quick actions -->
	<div class="p-4 border-b border-gray-100">
		<div class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Quick Actions</div>
		<div class="space-y-2">
			<button class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-forest-50 text-forest-700 hover:bg-forest-100 transition-colors">
				<span class="text-forest-600">{@html icons.settings}</span>
				<span>Domain Settings</span>
			</button>
			<button class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
				<span>Export Context</span>
			</button>
			<button class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
				<span>Share View</span>
			</button>
		</div>
	</div>
	
	<!-- Contextual content based on current domain -->
	<div class="p-4 flex-1">
		<div class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Domain Details</div>
		<div class="text-sm text-gray-600 space-y-3">
			{#if getCurrentContext() === 'Workspace'}
				<p class="font-medium">Workspace Management</p>
				<ul class="list-disc pl-4 space-y-1">
					<li>Manage tasks, notes, and reports</li>
					<li>Track project progress</li>
					<li>Calendar integration</li>
				</ul>
			{:else if getCurrentContext() === 'Projects'}
				<p class="font-medium">Project Tracking</p>
				<ul class="list-disc pl-4 space-y-1">
					<li>Monitor project timelines</li>
					<li>Resource allocation</li>
					<li>Budget tracking</li>
				</ul>
			{:else if getCurrentContext() === 'Files'}
				<p class="font-medium">File Management</p>
				<ul class="list-disc pl-4 space-y-1">
					<li>Organize documents</li>
					<li>Version control</li>
					<li>Collaborative editing</li>
				</ul>
			{:else if getCurrentContext() === 'Connect'}
				<p class="font-medium">Communication Hub</p>
				<ul class="list-disc pl-4 space-y-1">
					<li>Team messaging</li>
					<li>Email integration</li>
					<li>Meeting scheduling</li>
				</ul>
			{:else if getCurrentContext() === 'Dashboard'}
				<p class="font-medium">Analytics Dashboard</p>
				<ul class="list-disc pl-4 space-y-1">
					<li>Performance metrics</li>
					<li>Activity trends</li>
					<li>System health</li>
				</ul>
			{:else if getCurrentContext() === 'Search'}
				<p class="font-medium">Search & Discovery</p>
				<ul class="list-disc pl-4 space-y-1">
					<li>Cross-domain search</li>
					<li>AI-powered suggestions</li>
					<li>Recent activity</li>
				</ul>
			{:else}
				<p class="font-medium">General Context</p>
				<p>Navigate to a specific domain to see contextual information and actions.</p>
			{/if}
		</div>
	</div>
	
	<!-- Panel footer -->
	<div class="p-4 border-t border-gray-200 text-xs text-gray-500">
		<div class="flex items-center justify-between">
			<span>Oscar AI v2.1</span>
			<span>Context Panel</span>
		</div>
	</div>
</div>
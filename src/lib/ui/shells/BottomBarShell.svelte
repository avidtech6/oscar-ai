<script lang="ts">
	import { page } from '$app/stores';
	
	const icons: Record<string, string> = {
		home: "i-mdi-home-outline",
		workspace: "i-mdi-view-dashboard-outline",
		search: "i-mdi-magnify",
		notifications: "i-mdi-bell-outline",
		user: "i-mdi-account-outline"
	};
	
	const navItems = [
		{ id: 'home', label: 'Home', icon: 'home', href: '/' },
		{ id: 'workspace', label: 'Workspace', icon: 'workspace', href: '/workspace' },
		{ id: 'search', label: 'Search', icon: 'search', href: '/search' },
		{ id: 'notifications', label: 'Notifications', icon: 'notifications', href: '/notifications' },
		{ id: 'profile', label: 'Profile', icon: 'user', href: '/identity' }
	];
	
	function isActive(href: string) {
		return $page.url.pathname === href || ($page.url.pathname.startsWith(href) && href !== '/');
	}
</script>

<div class="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 lg:hidden z-40">
	<div class="flex h-full items-center justify-around px-2">
		{#each navItems as item}
			<a
				href={item.href}
				class="flex flex-col items-center justify-center p-2 rounded-lg transition-colors {isActive(item.href) ? 'text-forest-600' : 'text-gray-500 hover:text-gray-700'}"
				title={item.label}
			>
				<div class="w-6 h-6 mb-1">
					{@html icons[item.icon]}
				</div>
				<span class="text-xs font-medium">{item.label}</span>
			</a>
		{/each}
	</div>
</div>

<!-- Desktop bottom bar -->
<div class="hidden lg:flex w-full h-12 bg-white border-t border-gray-200 items-center justify-between px-6">
	<div class="flex items-center gap-4 text-sm text-gray-600">
		<span class="font-medium">Oscar AI</span>
		<span class="text-gray-400">•</span>
		<span>Arboricultural Intelligence Platform</span>
	</div>
	
	<div class="flex items-center gap-4">
		<button class="text-sm text-gray-600 hover:text-gray-800 transition-colors">
			Status: <span class="font-medium text-forest-600">Online</span>
		</button>
		<span class="text-gray-300">|</span>
		<button class="text-sm text-gray-600 hover:text-gray-800 transition-colors">
			Help
		</button>
		<button class="text-sm text-gray-600 hover:text-gray-800 transition-colors">
			Feedback
		</button>
	</div>
</div>
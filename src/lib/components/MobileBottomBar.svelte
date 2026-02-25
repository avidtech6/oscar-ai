<script lang="ts">
	import { page } from '$app/stores';
	
	// Bottom bar navigation items
	const navItems = [
		{ id: 'home', label: 'Home', icon: 'home', href: '/' },
		{ id: 'camera', label: 'Camera', icon: 'camera', href: '/camera' },
		{ id: 'voice', label: 'Voice Note', icon: 'mic', href: '/voice' },
		{ id: 'communication', label: 'Communication Hub', icon: 'message', href: '/communication' },
		{ id: 'copilot', label: 'Copilot', icon: 'chat', href: '/oscar' }
	];
	
	// Icon definitions
	const icons: Record<string, string> = {
		home: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>`,
		camera: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`,
		mic: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>`,
		message: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>`,
		chat: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>`
	};
	
	function isActive(href: string) {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href);
	}
</script>

<!-- Mobile Bottom Bar - Only visible on mobile -->
<div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
	<div class="flex items-center justify-around h-16">
		{#each navItems as item}
			<a
				href={item.href}
				class="flex flex-col items-center justify-center flex-1 h-full px-2 py-1 transition-colors
					   {isActive(item.href) ? 'text-forest-600' : 'text-gray-500 hover:text-gray-700'}"
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

<style>
	/* Add safe area padding for iOS devices */
	@media (max-width: 1024px) {
		:global(body) {
			padding-bottom: 4rem !important;
		}
	}
</style>
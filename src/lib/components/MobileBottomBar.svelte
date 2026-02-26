<script lang="ts">
	import { page } from '$app/stores';
	import { toggleExpanded } from '$lib/copilot/copilotStore';
	import { unreadCount } from '$lib/stores/notifications';
	
	// Bottom bar navigation items
	const navItems = [
		{ id: 'home', label: 'Home', icon: 'home', href: '/' },
		{ id: 'camera', label: 'Camera', icon: 'camera', href: '/camera' },
		{ id: 'files', label: 'Files', icon: 'files', href: '/files' },
		{ id: 'voice', label: 'Voice Note', icon: 'mic', href: '/voice' },
		{ id: 'notifications', label: 'Notifications', icon: 'bell', href: '/notifications' },
		{ id: 'copilot', label: 'Copilot', icon: 'chat', action: 'toggleCopilot' }
	];
	
	// Icon definitions
	const icons: Record<string, string> = {
		home: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>`,
		camera: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`,
		files: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
		mic: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>`,
		bell: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>`,
		chat: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>`
	};
	
	function isActive(href: string) {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href);
	}

	function handleCopilotClick(event: Event) {
		event.preventDefault();
		toggleExpanded();
	}
</script>

<!-- Mobile Bottom Bar - Only visible on mobile -->
<div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
	<div class="flex items-center justify-around h-16 px-1">
		{#each navItems as item}
			{#if item.action === 'toggleCopilot'}
				<button
					on:click={handleCopilotClick}
					class="flex flex-col items-center justify-center flex-1 h-full px-1 py-1 transition-colors text-gray-500 hover:text-gray-700"
					title={item.label}
				>
					<div class="w-5 h-5 mb-0.5">
						{@html icons[item.icon]}
					</div>
					<span class="text-[10px] font-medium truncate max-w-[60px]">{item.label}</span>
				</button>
			{:else}
				<a
					href={item.href}
					class="flex flex-col items-center justify-center flex-1 h-full px-1 py-1 transition-colors relative
						   {isActive(item.href) ? 'text-forest-600' : 'text-gray-500 hover:text-gray-700'}"
					title={item.label}
				>
					<div class="w-5 h-5 mb-0.5 relative">
						{@html icons[item.icon]}
						{#if item.id === 'notifications' && $unreadCount > 0}
							<span class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
								{$unreadCount > 9 ? '9+' : $unreadCount}
							</span>
						{/if}
					</div>
					<span class="text-[10px] font-medium truncate max-w-[60px]">{item.label}</span>
				</a>
			{/if}
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
<script lang="ts">
	import { mobileBarStore, activeItem, totalBadgeCount } from '../stores/mobileBarStore';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	// Track current page for active state
	$: currentPath = $page.url.pathname;
	
	// Update active item based on current path
	$: {
		const items = $mobileBarStore.items;
		const matchingItem = items.find(item => currentPath.startsWith(item.href));
		if (matchingItem && matchingItem.id !== $mobileBarStore.activeItemId) {
			mobileBarStore.setActiveItem(matchingItem.id);
		}
	}

	// Handle item click
	function handleItemClick(itemId: string, href: string) {
		mobileBarStore.setActiveItem(itemId);
		
		// Clear badge for notifications when clicked
		if (itemId === 'notifications') {
			mobileBarStore.clearBadgeCount('notifications');
		}
		
		// Navigate to the href
		window.location.href = href;
	}

	// Handle back button (optional)
	function handleBack() {
		window.history.back();
	}

	// Handle home button
	function handleHome() {
		mobileBarStore.setActiveItem('dashboard');
		window.location.href = '/communication';
	}

	// Check if mobile device
	function isMobileDevice(): boolean {
		return typeof window !== 'undefined' && window.innerWidth < 768;
	}

	// Initialize
	onMount(() => {
		mobileBarStore.updateVisibilityBasedOnDevice();
	});
</script>

{#if $mobileBarStore.visible && isMobileDevice()}
	<!-- Mobile Bottom Bar -->
	<div class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
		<div class="flex items-center justify-around px-2 py-3">
			{#each $mobileBarStore.items as item (item.id)}
				<button
					on:click={() => handleItemClick(item.id, item.href)}
					class="flex flex-col items-center justify-center relative p-2 rounded-lg transition-colors {item.isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
					title={item.label}
				>
					<!-- Icon -->
					<div class="relative">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
						</svg>
						
						<!-- Badge -->
						{#if item.badge && item.badge > 0}
							<div class="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full">
								{item.badge > 99 ? '99+' : item.badge}
							</div>
						{/if}
					</div>
					
					<!-- Label -->
					<span class="text-xs mt-1 font-medium {item.isActive ? 'text-blue-600' : 'text-gray-600'}">
						{item.label}
					</span>
					
					<!-- Active indicator -->
					{#if item.isActive}
						<div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"></div>
					{/if}
				</button>
			{/each}
		</div>
		
		<!-- Optional: Add a floating action button in the middle -->
		<!--
		<div class="absolute left-1/2 transform -translate-x-1/2 -top-6">
			<button
				class="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
				on:click={() => console.log('FAB clicked')}
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
			</button>
		</div>
		-->
	</div>
	
	<!-- Spacer to prevent content from being hidden behind the bar -->
	<div class="h-20"></div>
{/if}

<style>
	/* Hide on desktop */
	@media (min-width: 768px) {
		div {
			display: none;
		}
	}
	
	/* Smooth transitions */
	button {
		transition: all 0.2s ease;
	}
	
	/* Prevent text selection */
	button {
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}
</style>
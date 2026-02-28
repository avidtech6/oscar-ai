<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// Define tabs
	const tabs = [
		{ id: 'dashboard', label: 'Dashboard', path: '/communication' },
		{ id: 'email', label: 'Email', path: '/communication/email' },
		{ id: 'campaigns', label: 'Campaigns', path: '/communication/campaigns' },
		{ id: 'calendar', label: 'Calendar', path: '/communication/calendar' },
		{ id: 'notifications', label: 'Notifications', path: '/communication/notifications' }
	];

	// Get current active tab based on URL
	function getActiveTab() {
		const path = $page.url.pathname;
		for (const tab of tabs) {
			if (path === tab.path || path.startsWith(tab.path + '/')) {
				return tab.id;
			}
		}
		return 'dashboard';
	}

	// Navigate to tab
	function navigateToTab(tabPath: string) {
		goto(tabPath);
	}
</script>

<div class="communication-hub-layout">
	<!-- Top Tab Navigation -->
	<div class="bg-white border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<nav class="-mb-px flex space-x-8" aria-label="Communication Hub Tabs">
				{#each tabs as tab (tab.id)}
					<button
						on:click={() => navigateToTab(tab.path)}
						class={`
							py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
							${getActiveTab() === tab.id
								? 'border-forest-600 text-forest-700'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
							}
						`}
					>
						{tab.label}
					</button>
				{/each}
			</nav>
		</div>
	</div>

	<!-- Main Content -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
		<slot />
	</div>
</div>

<style>
	.communication-hub-layout {
		min-height: calc(100vh - 64px);
		background-color: #f9fafb;
	}
</style>
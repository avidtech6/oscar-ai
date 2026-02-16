<script lang="ts">
	export let activeTab: string = 'trees';
	export let tabs: Array<{
		id: string;
		label: string;
		count: number;
		icon?: string;
	}> = [];

	// Events
	export let onTabChange: (tabId: string) => void = () => {};

	function handleTabClick(tabId: string) {
		activeTab = tabId;
		onTabChange(tabId);
	}
</script>

<div class="border-b border-gray-200 mb-6">
	<nav class="-mb-px flex space-x-8 overflow-x-auto">
		{#each tabs as tab}
			<button
				on:click={() => handleTabClick(tab.id)}
				class="py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
					   {activeTab === tab.id
						   ? 'border-forest-500 text-forest-600'
						   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
			>
				{#if tab.icon}
					<svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={tab.icon} />
					</svg>
				{/if}
				{tab.label} ({tab.count})
			</button>
		{/each}
	</nav>
</div>
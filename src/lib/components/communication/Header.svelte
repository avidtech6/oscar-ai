<script lang="ts">
	export let title: string = 'Communication Hub';
	export let subtitle: string = 'Manage emails, campaigns, notifications, and more in one place';
	export let showNewCampaignButton: boolean = true;
	export let showSettingsButton: boolean = true;
	
	// Event dispatchers
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	
	function handleNewCampaign() {
		dispatch('newCampaign');
	}
	
	function handleSettings() {
		dispatch('settings');
	}
</script>

<header class="bg-white border-b border-gray-200 px-6 py-4">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">{title}</h1>
			<p class="text-gray-600 mt-1">{subtitle}</p>
		</div>
		<div class="flex items-center gap-3">
			{#if showNewCampaignButton}
				<button 
					on:click={handleNewCampaign}
					class="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
				>
					New Campaign
				</button>
			{/if}
			{#if showSettingsButton}
				<button 
					on:click={handleSettings}
					class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
				>
					Settings
				</button>
			{/if}
		</div>
	</div>
</header>
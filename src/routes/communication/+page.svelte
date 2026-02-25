<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Header from '$lib/components/communication/Header.svelte';
	import StatsOverview from '$lib/components/communication/StatsOverview.svelte';
	import QuickActions from '$lib/components/communication/QuickActions.svelte';
	import RecentActivity from '$lib/components/communication/RecentActivity.svelte';
	import AppFlowyDocuments from '../../communication/components/AppFlowyDocuments.svelte';

	// Tab management
	let activeTab: 'overview' | 'documents' = 'overview';

	// Initialize communication data
	onMount(async () => {
		// Load communication stats
		console.log('Loading communication stats...');
	});

	function handleNewCampaign() {
		console.log('New campaign clicked');
		// Navigate to campaign creation
		window.location.href = '/communication/campaigns/new';
	}

	function handleSettings() {
		console.log('Settings clicked');
		// Navigate to settings
		window.location.href = '/communication/settings';
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<Header
		on:newCampaign={handleNewCampaign}
		on:settings={handleSettings}
	/>

	<!-- Main Content -->
	<main class="p-6">
		<!-- Tab Navigation -->
		<div class="mb-6 border-b border-gray-200">
			<nav class="-mb-px flex space-x-8">
				<button
					on:click={() => activeTab = 'overview'}
					class={`py-2 px-1 border-b-2 font-medium text-sm ${
						activeTab === 'overview'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
					}`}
				>
					Overview
				</button>
				<button
					on:click={() => activeTab = 'documents'}
					class={`py-2 px-1 border-b-2 font-medium text-sm ${
						activeTab === 'documents'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
					}`}
				>
					Documents
				</button>
			</nav>
		</div>

		<!-- Tab Content -->
		{#if activeTab === 'overview'}
			<!-- Stats Overview -->
			<StatsOverview />

			<!-- Quick Actions -->
			<QuickActions />
			
			<!-- Recent Activity -->
			<RecentActivity />
		{:else if activeTab === 'documents'}
			<!-- AppFlowy Documents -->
			<AppFlowyDocuments />
		{/if}
	</main>
</div>

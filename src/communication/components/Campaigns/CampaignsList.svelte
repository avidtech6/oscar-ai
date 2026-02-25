<script lang="ts">
	import { onMount } from 'svelte';
	import { campaignStore, draftCampaigns, scheduledCampaigns, activeCampaigns, completedCampaigns } from '../../stores/campaignStore';
	import type { Campaign } from '../../types';

	// Tab state
	let activeTab: 'all' | 'draft' | 'scheduled' | 'active' | 'completed' = 'all';
	let searchQuery = '';
	let isLoading = false;

	// Load campaigns on mount
	onMount(async () => {
		isLoading = true;
		await campaignStore.loadCampaigns();
		isLoading = false;
	});

	// Filter campaigns based on active tab and search
	$: filteredCampaigns = getFilteredCampaigns();

	function getFilteredCampaigns(): Campaign[] {
		let campaigns: Campaign[] = [];
		
		switch (activeTab) {
			case 'draft':
				campaigns = $draftCampaigns;
				break;
			case 'scheduled':
				campaigns = $scheduledCampaigns;
				break;
			case 'active':
				campaigns = $activeCampaigns;
				break;
			case 'completed':
				campaigns = $completedCampaigns;
				break;
			default:
				campaigns = $campaignStore.campaigns;
		}

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			return campaigns.filter(campaign =>
				campaign.name.toLowerCase().includes(query) ||
				campaign.description?.toLowerCase().includes(query) ||
				campaign.type.toLowerCase().includes(query)
			);
		}

		return campaigns;
	}

	function formatDate(date: Date | string | undefined): string {
		if (!date) return 'Not set';
		const d = new Date(date);
		return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function getStatusColor(status: Campaign['status']): string {
		switch (status) {
			case 'draft': return 'bg-gray-100 text-gray-800';
			case 'scheduled': return 'bg-blue-100 text-blue-800';
			case 'sending': return 'bg-yellow-100 text-yellow-800';
			case 'sent': return 'bg-green-100 text-green-800';
			case 'completed': return 'bg-green-100 text-green-800';
			case 'cancelled': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function getTypeIcon(type: Campaign['type']): string {
		switch (type) {
			case 'email': return '📧';
			case 'sms': return '📱';
			case 'push': return '🔔';
			case 'newsletter': return '📰';
			default: return '📧';
		}
	}

	// Event dispatchers
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function handleViewCampaign(campaign: Campaign) {
		dispatch('viewCampaign', campaign);
	}

	function handleEditCampaign(campaign: Campaign) {
		dispatch('editCampaign', campaign);
	}

	function handleDeleteCampaign(campaign: Campaign) {
		if (confirm(`Are you sure you want to delete campaign "${campaign.name}"?`)) {
			dispatch('deleteCampaign', campaign);
		}
	}

	function handleScheduleCampaign(campaign: Campaign) {
		dispatch('scheduleCampaign', campaign);
	}

	function handleStartCampaign(campaign: Campaign) {
		dispatch('startCampaign', campaign);
	}
</script>

<div class="campaigns-list">
	<!-- Header -->
	<div class="mb-6">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xl font-semibold text-gray-900">Campaigns</h2>
			<button
				on:click={() => dispatch('createCampaign')}
				class="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors flex items-center gap-2"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
				</svg>
				New Campaign
			</button>
		</div>

		<!-- Search -->
		<div class="mb-4">
			<div class="relative">
				<svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
				</svg>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search campaigns..."
					class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
				/>
			</div>
		</div>

		<!-- Tabs -->
		<div class="flex space-x-1 border-b border-gray-200">
			<button
				class={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'all' ? 'bg-white border border-gray-200 border-b-0 text-forest-700' : 'text-gray-500 hover:text-gray-700'}`}
				on:click={() => activeTab = 'all'}
			>
				All ({$campaignStore.campaigns.length})
			</button>
			<button
				class={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'draft' ? 'bg-white border border-gray-200 border-b-0 text-forest-700' : 'text-gray-500 hover:text-gray-700'}`}
				on:click={() => activeTab = 'draft'}
			>
				Draft ({$draftCampaigns.length})
			</button>
			<button
				class={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'scheduled' ? 'bg-white border border-gray-200 border-b-0 text-forest-700' : 'text-gray-500 hover:text-gray-700'}`}
				on:click={() => activeTab = 'scheduled'}
			>
				Scheduled ({$scheduledCampaigns.length})
			</button>
			<button
				class={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'active' ? 'bg-white border border-gray-200 border-b-0 text-forest-700' : 'text-gray-500 hover:text-gray-700'}`}
				on:click={() => activeTab = 'active'}
			>
				Active ({$activeCampaigns.length})
			</button>
			<button
				class={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'completed' ? 'bg-white border border-gray-200 border-b-0 text-forest-700' : 'text-gray-500 hover:text-gray-700'}`}
				on:click={() => activeTab = 'completed'}
			>
				Completed ({$completedCampaigns.length})
			</button>
		</div>
	</div>

	<!-- Loading State -->
	{#if isLoading || $campaignStore.isLoading}
		<div class="flex items-center justify-center p-8">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600"></div>
		</div>

	<!-- Empty State -->
	{:else if filteredCampaigns.length === 0}
		<div class="text-center py-12">
			<div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
				<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
				</svg>
			</div>
			<h3 class="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
			<p class="text-gray-500 mb-6">
				{#if searchQuery}
					No campaigns match your search. Try a different search term.
				{:else if activeTab !== 'all'}
					No {activeTab} campaigns yet.
				{:else}
					Get started by creating your first campaign.
				{/if}
			</p>
			<button
				on:click={() => dispatch('createCampaign')}
				class="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
			>
				Create Campaign
			</button>
		</div>

	<!-- Campaigns List -->
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filteredCampaigns as campaign}
				<div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
					<div class="flex items-start justify-between mb-3">
						<div class="flex items-center gap-3">
							<span class="text-2xl">{getTypeIcon(campaign.type)}</span>
							<div>
								<h3 class="font-semibold text-gray-900">{campaign.name}</h3>
								<p class="text-sm text-gray-500">{campaign.type.toUpperCase()} Campaign</p>
							</div>
						</div>
						<span class={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
							{campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
						</span>
					</div>

					{#if campaign.description}
						<p class="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>
					{/if}

					<div class="grid grid-cols-2 gap-3 mb-4">
						<div>
							<p class="text-xs text-gray-500">Recipients</p>
							<p class="font-medium text-gray-900">{campaign.recipientCount.toLocaleString()}</p>
						</div>
						<div>
							<p class="text-xs text-gray-500">Sent</p>
							<p class="font-medium text-gray-900">{campaign.sentCount.toLocaleString()}</p>
						</div>
						<div>
							<p class="text-xs text-gray-500">Opened</p>
							<p class="font-medium text-gray-900">{campaign.openedCount.toLocaleString()}</p>
						</div>
						<div>
							<p class="text-xs text-gray-500">Clicked</p>
							<p class="font-medium text-gray-900">{campaign.clickedCount.toLocaleString()}</p>
						</div>
					</div>

					<div class="flex items-center justify-between text-sm text-gray-500 mb-4">
						<div>
							{#if campaign.scheduledFor}
								<p>Scheduled: {formatDate(campaign.scheduledFor)}</p>
							{:else if campaign.sentAt}
								<p>Sent: {formatDate(campaign.sentAt)}</p>
							{:else}
								<p>Created: {formatDate(campaign.createdAt)}</p>
							{/if}
						</div>
					</div>

					<div class="flex items-center gap-2 pt-4 border-t border-gray-100">
						<button
							on:click={() => handleViewCampaign(campaign)}
							class="flex-1 px-3 py-1.5 text-sm text-gray-700 hover:text-forest-700 hover:bg-gray-50 rounded-lg transition-colors"
						>
							View
						</button>
						<button
							on:click={() => handleEditCampaign(campaign)}
							class="flex-1 px-3 py-1.5 text-sm text-gray-700 hover:text-forest-700 hover:bg-gray-50 rounded-lg transition-colors"
						>
							Edit
						</button>
						{#if campaign.status === 'draft'}
							<button
								on:click={() => handleScheduleCampaign(campaign)}
								class="flex-1 px-3 py-1.5 text-sm text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
							>
								Schedule
							</button>
						{:else if campaign.status === 'scheduled'}
							<button
								on:click={() => handleStartCampaign(campaign)}
								class="flex-1 px-3 py-1.5 text-sm text-green-700 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
							>
								Start
							</button>
						{/if}
						<button
							on:click={() => handleDeleteCampaign(campaign)}
							class="px-3 py-1.5 text-sm text-red-700 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
							</svg>
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Error State -->
	{#if $campaignStore.error}
		<div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
			<div class="flex items-center gap-2 text-red-800">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				<span class="font-medium">Error loading campaigns</span>
			</div>
			<p class="text-red-700 text-sm mt-1">{$campaignStore.error}</p>
			<button
				on:click={() => campaignStore.loadCampaigns()}
				class="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
			>
				Try Again
			</button>
		</div>
	{/if}
</div>
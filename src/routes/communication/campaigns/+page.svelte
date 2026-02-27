<script lang="ts">
	import { onMount } from 'svelte';
	import CampaignsList from '../../../communication/components/Campaigns/CampaignsList.svelte';
	import CampaignForm from '../../../communication/components/Campaigns/CampaignForm.svelte';
	import { campaignStore } from '../../../communication/stores/campaignStore';
	import type { Campaign } from '../../../communication/types';

	// Page state
	let showCreateForm = false;
	let editingCampaign: Campaign | null = null;
	let notification: { type: 'success' | 'error' | 'info'; message: string } | null = null;

	// Computed stats
	$: totalCampaigns = $campaignStore.campaigns.length;
	$: activeCampaigns = $campaignStore.campaigns.filter(c => c.status === 'sending').length;
	$: scheduledCampaigns = $campaignStore.campaigns.filter(c => c.status === 'scheduled').length;
	$: completedCampaigns = $campaignStore.campaigns.filter(c => c.status === 'completed').length;

	// Load campaigns on mount
	onMount(async () => {
		await campaignStore.loadCampaigns();
	});

	// Handle campaign list events
	function handleCreateCampaign() {
		editingCampaign = null;
		showCreateForm = true;
	}

	function handleViewCampaign(event: CustomEvent<Campaign>) {
		// Navigate to campaign details (to be implemented)
		console.log('View campaign:', event.detail);
		showNotification('info', `Viewing campaign: ${event.detail.name}`);
	}

	function handleEditCampaign(event: CustomEvent<Campaign>) {
		editingCampaign = event.detail;
		showCreateForm = true;
	}

	async function handleDeleteCampaign(event: CustomEvent<Campaign>) {
		try {
			await campaignStore.deleteCampaign(event.detail.id);
			showNotification('success', `Campaign "${event.detail.name}" deleted successfully`);
		} catch (error) {
			showNotification('error', error instanceof Error ? error.message : 'Failed to delete campaign');
		}
	}

	async function handleScheduleCampaign(event: CustomEvent<Campaign>) {
		try {
			// For demo purposes, schedule for tomorrow
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			
			await campaignStore.scheduleCampaign(event.detail.id, tomorrow);
			showNotification('success', `Campaign "${event.detail.name}" scheduled for ${tomorrow.toLocaleDateString()}`);
		} catch (error) {
			showNotification('error', error instanceof Error ? error.message : 'Failed to schedule campaign');
		}
	}

	async function handleStartCampaign(event: CustomEvent<Campaign>) {
		try {
			await campaignStore.startCampaign(event.detail.id);
			showNotification('success', `Campaign "${event.detail.name}" started`);
		} catch (error) {
			showNotification('error', error instanceof Error ? error.message : 'Failed to start campaign');
		}
	}

	// Handle form events
	function handleFormSuccess(event: CustomEvent<{ message: string; campaign?: Campaign }>) {
		showCreateForm = false;
		editingCampaign = null;
		showNotification('success', event.detail.message);
	}

	function handleFormError(event: CustomEvent<{ message: string }>) {
		showNotification('error', event.detail.message);
	}

	function handleFormCancel() {
		showCreateForm = false;
		editingCampaign = null;
	}

	function handleCreateRecipientList() {
		showNotification('info', 'Recipient list creation would open here');
		// In a real implementation, this would open a recipient list creation modal
	}

	// Notification helper
	function showNotification(type: 'success' | 'error' | 'info', message: string) {
		notification = { type, message };
		setTimeout(() => {
			notification = null;
		}, 5000);
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white border-b border-gray-200 px-6 py-4">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Campaigns</h1>
				<p class="text-gray-600 mt-1">Create and manage email, SMS, and newsletter campaigns</p>
			</div>
			<div class="flex items-center gap-3">
				<button
					on:click={() => campaignStore.loadCampaigns()}
					class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
					</svg>
					Refresh
				</button>
				<button
					on:click={handleCreateCampaign}
					class="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors flex items-center gap-2"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
					</svg>
					New Campaign
				</button>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="p-6">
		<!-- Stats Overview -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-500">Total Campaigns</p>
						<p class="text-3xl font-bold text-gray-900 mt-2">{totalCampaigns}</p>
					</div>
					<div class="p-3 bg-blue-50 rounded-lg">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
						</svg>
					</div>
				</div>
				<p class="text-sm text-gray-500 mt-4">Across all statuses</p>
			</div>

			<div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-500">Active Campaigns</p>
						<p class="text-3xl font-bold text-gray-900 mt-2">
							{activeCampaigns}
						</p>
					</div>
					<div class="p-3 bg-green-50 rounded-lg">
						<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
						</svg>
					</div>
				</div>
				<p class="text-sm text-gray-500 mt-4">Currently sending</p>
			</div>

			<div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-500">Scheduled</p>
						<p class="text-3xl font-bold text-gray-900 mt-2">
							{scheduledCampaigns}
						</p>
					</div>
					<div class="p-3 bg-yellow-50 rounded-lg">
						<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
				</div>
				<p class="text-sm text-gray-500 mt-4">Waiting to send</p>
			</div>

			<div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-500">Completed</p>
						<p class="text-3xl font-bold text-gray-900 mt-2">
							{completedCampaigns}
						</p>
					</div>
					<div class="p-3 bg-purple-50 rounded-lg">
						<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
				</div>
				<p class="text-sm text-gray-500 mt-4">Successfully sent</p>
			</div>
		</div>

		<!-- Campaigns List or Form -->
		{#if showCreateForm}
			<div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
				<CampaignForm
					campaign={editingCampaign}
					isEditing={!!editingCampaign}
					on:success={handleFormSuccess}
					on:error={handleFormError}
					on:cancel={handleFormCancel}
					on:createRecipientList={handleCreateRecipientList}
				/>
			</div>
		{/if}

		<!-- Campaigns List -->
		<div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
			<CampaignsList
				on:createCampaign={handleCreateCampaign}
				on:viewCampaign={handleViewCampaign}
				on:editCampaign={handleEditCampaign}
				on:deleteCampaign={handleDeleteCampaign}
				on:scheduleCampaign={handleScheduleCampaign}
				on:startCampaign={handleStartCampaign}
			/>
		</div>
	</main>

	<!-- Notification Toast -->
	{#if notification}
		<div class="fixed bottom-4 right-4 z-50">
			<div class="animate-in slide-in-from-bottom-2 duration-300">
				<div class={`rounded-lg shadow-lg p-4 ${notification.type === 'success' ? 'bg-green-50 border border-green-200' : notification.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
					<div class="flex items-center gap-3">
						{#if notification.type === 'success'}
							<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						{:else if notification.type === 'error'}
							<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						{:else}
							<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						{/if}
						<div>
							<p class={`font-medium ${notification.type === 'success' ? 'text-green-800' : notification.type === 'error' ? 'text-red-800' : 'text-blue-800'}`}>
								{notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Error' : 'Info'}
							</p>
							<p class={`text-sm ${notification.type === 'success' ? 'text-green-700' : notification.type === 'error' ? 'text-red-700' : 'text-blue-700'}`}>
								{notification.message}
							</p>
						</div>
						<button
							on:click={() => notification = null}
							class="ml-4 text-gray-400 hover:text-gray-600"
							aria-label="Close notification"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
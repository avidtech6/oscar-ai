<script lang="ts">
	import { goto } from '$app/navigation';
	
	// Static placeholder data
	const campaignStats = {
		active: 2,
		scheduled: 1,
		completed: 5,
		totalRecipients: 1245
	};
	
	function navigateToCampaigns() {
		goto('/communication/campaigns');
	}
</script>

<div 
	class="card p-4 hover:shadow-md transition-shadow cursor-pointer"
	on:click={navigateToCampaigns}
	role="button"
	tabindex="0"
	on:keydown={(e) => e.key === 'Enter' && navigateToCampaigns()}
>
	<div class="flex items-start justify-between mb-3">
		<div>
			<h3 class="font-semibold text-gray-800">Campaigns</h3>
			<p class="text-sm text-gray-500">Manage marketing campaigns</p>
		</div>
		<div class="text-purple-600">
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
			</svg>
		</div>
	</div>
	
	<div class="space-y-3 mt-4">
		<div class="flex justify-between items-center">
			<span class="text-sm text-gray-600">Active Campaigns</span>
			<span class="font-semibold text-green-700">{campaignStats.active}</span>
		</div>
		<div class="flex justify-between items-center">
			<span class="text-sm text-gray-600">Scheduled</span>
			<span class="font-semibold text-blue-700">{campaignStats.scheduled}</span>
		</div>
		<div class="flex justify-between items-center">
			<span class="text-sm text-gray-600">Completed</span>
			<span class="font-semibold text-gray-700">{campaignStats.completed}</span>
		</div>
		<div class="flex justify-between items-center pt-2 border-t border-gray-100">
			<span class="text-sm text-gray-600">Total Recipients</span>
			<span class="font-semibold text-purple-700">{campaignStats.totalRecipients.toLocaleString()}</span>
		</div>
	</div>
	
	<div class="mt-4 pt-3 border-t border-gray-100">
		<p class="text-sm text-gray-600">Click to manage campaigns</p>
	</div>
</div>

<style>
	.card {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		background-color: white;
	}
</style>
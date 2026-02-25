<script lang="ts">
	import { goto } from '$app/navigation';
	
	// Static placeholder data
	const emailStats = {
		unread: 12,
		total: 42,
		drafts: 3
	};
	
	function navigateToEmail() {
		goto('/communication/email');
	}
</script>

<div 
	class="card p-4 hover:shadow-md transition-shadow cursor-pointer"
	on:click={navigateToEmail}
	role="button"
	tabindex="0"
	on:keydown={(e) => e.key === 'Enter' && navigateToEmail()}
>
	<div class="flex items-start justify-between mb-3">
		<div>
			<h3 class="font-semibold text-gray-800">Email</h3>
			<p class="text-sm text-gray-500">Manage your emails</p>
		</div>
		<div class="text-forest-600">
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
			</svg>
		</div>
	</div>
	
	<div class="grid grid-cols-3 gap-2 mt-4">
		<div class="text-center p-2 bg-blue-50 rounded">
			<div class="text-lg font-bold text-blue-700">{emailStats.unread}</div>
			<div class="text-xs text-blue-600">Unread</div>
		</div>
		<div class="text-center p-2 bg-green-50 rounded">
			<div class="text-lg font-bold text-green-700">{emailStats.total}</div>
			<div class="text-xs text-green-600">Total</div>
		</div>
		<div class="text-center p-2 bg-yellow-50 rounded">
			<div class="text-lg font-bold text-yellow-700">{emailStats.drafts}</div>
			<div class="text-xs text-yellow-600">Drafts</div>
		</div>
	</div>
	
	<div class="mt-4 pt-3 border-t border-gray-100">
		<p class="text-sm text-gray-600">Click to view all emails</p>
	</div>
</div>

<style>
	.card {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		background-color: white;
	}
</style>
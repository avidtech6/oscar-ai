<script lang="ts">
	export let showAddKeyForm = false;
	export let isLoading = false;
	export let toggleAddKeyForm: () => void = () => {};
	export let manualSync: () => void = () => {};
	export let exportVault: () => void = () => {};
</script>

<!-- Action Bar -->
<div class="flex flex-wrap gap-3 mb-8">
	<button
		on:click={toggleAddKeyForm}
		class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
	>
		{showAddKeyForm ? 'Cancel' : 'Add API Key'}
	</button>
	
	<button
		on:click={manualSync}
		disabled={isLoading}
		class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
	>
		{isLoading ? 'Syncing...' : 'Sync Now'}
	</button>
	
	<button
		on:click={exportVault}
		class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
	>
		Export Backup
	</button>
</div>
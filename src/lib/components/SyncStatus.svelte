<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type { SyncStatus } from '$lib/storage/syncEngineTypes';
	import { formatTime } from './sync/SyncStatusUtils';
	import SyncStatusButton from './sync/SyncStatusButton.svelte';
	import SyncStatusDetails from './sync/SyncStatusDetails.svelte';

	let syncStatus: SyncStatus | null = null;
	let isSyncing = false;
	let lastSyncTime: string | null = null;
	let showDetails = false;

	// Manual sync
	async function handleSync() {
		if (!browser || isSyncing) return;
		
		isSyncing = true;
		try {
			// Dynamically import sync functions only in browser
			const { triggerSync } = await import('$lib/storage/syncEngine');
			await triggerSync();
		} catch (error) {
			console.error('Sync failed:', error);
		} finally {
			isSyncing = false;
		}
	}

	// Update status
	function updateStatus(status: SyncStatus) {
		syncStatus = status;
		isSyncing = status.isSyncing;
		lastSyncTime = formatTime(status.lastSyncTime);
	}

	// Initialize
	onMount(async () => {
		if (!browser) return;
		
		// Dynamically import sync functions only in browser
		const { getSyncEngine } = await import('$lib/storage/syncEngine');
		const engine = getSyncEngine();
		
		// Get initial status
		const status = await engine.getStatus();
		updateStatus(status);
		
		// Subscribe to status updates
		engine.addListener(updateStatus);
	});

	// Cleanup
	onDestroy(() => {
		if (!browser) return;
		
		// Dynamically import sync functions only in browser
		import('$lib/storage/syncEngine').then(({ getSyncEngine }) => {
			const engine = getSyncEngine();
			engine.removeListener(updateStatus);
		}).catch(console.error);
	});

	function toggleDetails() {
		showDetails = !showDetails;
	}

	function closeDetails() {
		showDetails = false;
	}
</script>

<div class="sync-status-container">
	<SyncStatusButton
		{syncStatus}
		{isSyncing}
		onSync={handleSync}
	/>
	
	{#if showDetails && syncStatus}
		<SyncStatusDetails
			{syncStatus}
			{isSyncing}
			{lastSyncTime}
			onSync={handleSync}
			onClose={closeDetails}
		/>
	{:else if syncStatus}
		<button
			class="sync-details-button"
			on:click={toggleDetails}
			title="Show sync details"
			aria-label="Show sync details"
		>
			ⓘ
		</button>
	{/if}
</div>

<style>
	.sync-status-container {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--background);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.25rem 0.5rem;
		transition: all 0.2s ease;
	}

	.sync-status-container:hover {
		border-color: var(--primary);
		box-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);
	}

	.sync-details-button {
		background: none;
		border: none;
		font-size: 0.875rem;
		color: var(--text-secondary);
		cursor: pointer;
		padding: 0.375rem;
		border-radius: 6px;
		transition: all 0.2s ease;
	}

	.sync-details-button:hover {
		color: var(--primary);
		background: rgba(79, 70, 229, 0.1);
		transform: translateY(-1px);
	}

	@media (max-width: 768px) {
		.sync-status-container {
			gap: 0.25rem;
		}
		
		.sync-details-button {
			font-size: 0.75rem;
			padding: 0.25rem;
		}
	}
</style>
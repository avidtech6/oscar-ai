<script lang="ts">
	import { getStatusIcon, getStatusText } from './SyncStatusUtils';
	import type { SyncStatus } from '$lib/storage/syncEngineTypes';

	export let syncStatus: SyncStatus | null = null;
	export let isSyncing = false;
	export let onSync: () => void = () => {};
</script>

<button
	class="sync-button"
	class:syncing={isSyncing}
	on:click={onSync}
	title={isSyncing ? 'Syncing...' : 'Sync now'}
	aria-label={isSyncing ? 'Syncing...' : 'Sync now'}
	disabled={isSyncing}
>
	<span class="sync-icon">{syncStatus ? getStatusIcon(syncStatus) : '🌐'}</span>
	{#if syncStatus}
		<span class="sync-text">{getStatusText(syncStatus)}</span>
	{/if}
	{#if isSyncing}
		<span class="sync-spinner">↻</span>
	{/if}
</button>

<style>
	.sync-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.75rem;
		background: #f3f4f6;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		color: #374151;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.sync-button:hover:not(:disabled) {
		background: #e5e7eb;
		border-color: #9ca3af;
	}

	.sync-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.sync-button.syncing {
		background: #dbeafe;
		border-color: #93c5fd;
		color: #1e40af;
	}

	.sync-icon {
		font-size: 1rem;
	}

	.sync-text {
		font-weight: 500;
	}

	.sync-spinner {
		animation: spin 1s linear infinite;
		font-size: 0.875rem;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
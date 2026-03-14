<script lang="ts">
	import { formatTime, formatLatency } from './SyncStatusUtils';
	import type { SyncStatus } from '$lib/storage/syncEngineTypes';

	export let syncStatus: SyncStatus;
	export let isSyncing = false;
	export let lastSyncTime: string | null = null;
	export let onSync: () => void = () => {};
	export let onClose: () => void = () => {};
</script>

<div class="sync-details">
	<div class="sync-details-header">
		<h3>Sync Status</h3>
		<button on:click={onClose} class="close-button" aria-label="Close">×</button>
	</div>
	
	<div class="sync-details-content">
		<div class="sync-section">
			<h4>Connectivity</h4>
			<div class="sync-info">
				<span class="label">Status:</span>
				<span class:connected={syncStatus.connectivity.connected} class:authenticated={syncStatus.connectivity.authenticated}>
					{syncStatus.connectivity.connected ? 'Connected' : 'Disconnected'}
					{syncStatus.connectivity.authenticated ? ' (Authenticated)' : ' (Not authenticated)'}
				</span>
			</div>
			<div class="sync-info">
				<span class="label">Latency:</span>
				<span>{formatLatency(syncStatus.connectivity.latency)}</span>
			</div>
		</div>

		<div class="sync-section">
			<h4>Queue</h4>
			<div class="sync-info">
				<span class="label">Pending:</span>
				<span>{syncStatus.queueStats.pending}</span>
			</div>
			<div class="sync-info">
				<span class="label">Failed:</span>
				<span>{syncStatus.queueStats.failed}</span>
			</div>
			<div class="sync-info">
				<span class="label">Completed:</span>
				<span>{syncStatus.queueStats.completed}</span>
			</div>
		</div>

		<div class="sync-section">
			<h4>Storage</h4>
			<div class="sync-info">
				<span class="label">Local Records:</span>
				<span>{syncStatus.localStats.totalRecords}</span>
			</div>
			<div class="sync-info">
				<span class="label">Cloud Records:</span>
				<span>{syncStatus.cloudStats.totalRecords}</span>
			</div>
			<div class="sync-info">
				<span class="label">Last Sync:</span>
				<span>{lastSyncTime}</span>
			</div>
		</div>

		<div class="sync-actions">
			<button on:click={onSync} disabled={isSyncing} class="sync-action-button">
				{isSyncing ? 'Syncing...' : 'Sync Now'}
			</button>
			<button on:click={onClose} class="sync-action-button secondary">
				Close
			</button>
		</div>
	</div>
</div>

<style>
	.sync-details {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		width: 320px;
		z-index: 100;
		overflow: hidden;
	}

	.sync-details-header {
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.sync-details-header h3 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
		color: #111827;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #6b7280;
		cursor: pointer;
		padding: 0;
		line-height: 1;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: background 0.2s ease;
	}

	.close-button:hover {
		background: #f3f4f6;
	}

	.sync-details-content {
		padding: 1rem;
		max-height: 400px;
		overflow-y: auto;
	}

	.sync-section {
		margin-bottom: 1.5rem;
	}

	.sync-section:last-child {
		margin-bottom: 0;
	}

	.sync-section h4 {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 0.75rem 0;
	}

	.sync-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.sync-info:last-child {
		margin-bottom: 0;
	}

	.sync-info .label {
		color: #6b7280;
	}

	.sync-info .connected {
		color: #059669;
		font-weight: 500;
	}

	.sync-info .authenticated {
		color: #d97706;
	}

	.sync-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.sync-action-button {
		flex: 1;
		padding: 0.5rem 1rem;
		border: 1px solid #3b82f6;
		border-radius: 6px;
		background: #3b82f6;
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.sync-action-button:hover:not(:disabled) {
		background: #2563eb;
		border-color: #2563eb;
	}

	.sync-action-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.sync-action-button.secondary {
		background: white;
		color: #374151;
		border-color: #d1d5db;
	}

	.sync-action-button.secondary:hover {
		background: #f9fafb;
		border-color: #9ca3af;
	}
</style>
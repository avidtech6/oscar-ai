<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { vaultManager } from '$lib/vault/vaultManager';
	import type { APIKey, SyncStatus, VaultStats } from '$lib/vault/types';
	import { createSyncStatusHandler } from './vault/VaultManagerHelpers';
	import VaultManagerHeader from './vault/VaultManagerHeader.svelte';
	import VaultManagerStats from './vault/VaultManagerStats.svelte';
	import VaultManagerSyncStatus from './vault/VaultManagerSyncStatus.svelte';
	import VaultManagerActionBar from './vault/VaultManagerActionBar.svelte';
	import VaultManagerAddKeyForm from './vault/VaultManagerAddKeyForm.svelte';
	import VaultManagerKeysList from './vault/VaultManagerKeysList.svelte';
	import VaultManagerSecurityNotice from './vault/VaultManagerSecurityNotice.svelte';

	// State
	let keys: APIKey[] = [];
	let stats: VaultStats | null = null;
	let syncStatus: SyncStatus | null = null;
	let isLoading = false;
	let error: string | null = null;
	let showAddKeyForm = false;
	let newKey = {
		keyName: '',
		plaintextKey: '',
		provider: 'openai' as const,
		modelFamily: ''
	};

	// Sync listeners
	const handleSyncStatus = createSyncStatusHandler(
		(status: SyncStatus) => { syncStatus = status; },
		loadKeys,
		loadStats
	);

	// Initialize
	onMount(async () => {
		try {
			await vaultManager.initialize();
			vaultManager.addSyncListener(handleSyncStatus);
			await loadKeys();
			await loadStats();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to initialize vault';
		}
	});

	// Cleanup
	onDestroy(() => {
		vaultManager.removeSyncListener(handleSyncStatus);
		vaultManager.cleanup();
	});

	// Load keys
	async function loadKeys() {
		isLoading = true;
		try {
			keys = await vaultManager.getAllKeys();
			error = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load keys';
		} finally {
			isLoading = false;
		}
	}

	// Load stats
	async function loadStats() {
		try {
			stats = await vaultManager.getStats();
		} catch (err) {
			console.error('Failed to load stats:', err);
		}
	}

	// Add new key
	async function addKey() {
		if (!newKey.keyName || !newKey.plaintextKey) {
			error = 'Key name and API key are required';
			return;
		}

		isLoading = true;
		try {
			await vaultManager.addKey(newKey);
			newKey = { keyName: '', plaintextKey: '', provider: 'openai', modelFamily: '' };
			showAddKeyForm = false;
			error = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to add key';
		} finally {
			isLoading = false;
		}
	}

	// Delete key
	async function deleteKey(id: string) {
		if (!confirm('Are you sure you want to delete this API key?')) {
			return;
		}

		isLoading = true;
		try {
			await vaultManager.deleteKey(id);
			error = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete key';
		} finally {
			isLoading = false;
		}
	}

	// Toggle key active state
	async function toggleKeyActive(key: APIKey) {
		isLoading = true;
		try {
			await vaultManager.updateKey(key.id, { isActive: !key.isActive });
			error = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update key';
		} finally {
			isLoading = false;
		}
	}

	// Manual sync
	async function manualSync() {
		isLoading = true;
		try {
			syncStatus = await vaultManager.sync();
			error = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to sync';
		} finally {
			isLoading = false;
		}
	}

	// Export vault
	async function exportVault() {
		try {
			const data = await vaultManager.exportVault();
			const blob = new Blob([data], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `vault-backup-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to export vault';
		}
	}

	// Toggle add key form
	function toggleAddKeyForm() {
		showAddKeyForm = !showAddKeyForm;
	}

	// Open add key form
	function openAddKeyForm() {
		showAddKeyForm = true;
	}
</script>

<div class="vault-manager p-6 max-w-6xl mx-auto">
	<VaultManagerHeader {error} />

	<VaultManagerStats {stats} />

	<VaultManagerSyncStatus {syncStatus} />

	<VaultManagerActionBar
		{showAddKeyForm}
		{isLoading}
		toggleAddKeyForm={toggleAddKeyForm}
		manualSync={manualSync}
		exportVault={exportVault}
	/>

	{#if showAddKeyForm}
		<VaultManagerAddKeyForm
			bind:newKey
			{isLoading}
			addKey={addKey}
			cancel={toggleAddKeyForm}
		/>
	{/if}

	<VaultManagerKeysList
		{keys}
		{isLoading}
		{showAddKeyForm}
		toggleKeyActive={toggleKeyActive}
		deleteKey={deleteKey}
		openAddKeyForm={openAddKeyForm}
	/>

	<VaultManagerSecurityNotice />
</div>

<style>
	.vault-manager {
		font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}
</style>

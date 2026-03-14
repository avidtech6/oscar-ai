<script lang="ts">
	import type { SyncStatus } from '$lib/vault/types';
	import { getSyncStatusColor } from './VaultManagerHelpers';

	export let syncStatus: SyncStatus | null = null;
</script>

<!-- Sync Status -->
{#if syncStatus}
	<div class="mb-6 p-4 rounded-lg border {getSyncStatusColor(syncStatus.status)}">
		<div class="flex items-center justify-between">
			<div>
				<span class="font-medium">Sync Status:</span> {syncStatus.message}
			</div>
			<div class="text-sm opacity-75">
				{syncStatus.timestamp.toLocaleTimeString()}
			</div>
		</div>
	</div>
{/if}
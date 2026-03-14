<script lang="ts">
	import type { VaultStats } from '$lib/vault/types';
	import { formatDate } from './VaultManagerHelpers';

	export let stats: VaultStats | null = null;
</script>

<!-- Stats Cards -->
{#if stats}
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
		<div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
			<div class="text-sm font-medium text-gray-500">Total Keys</div>
			<div class="text-2xl font-bold text-gray-900">{stats.totalKeys}</div>
		</div>
		<div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
			<div class="text-sm font-medium text-gray-500">Synced</div>
			<div class="text-2xl font-bold text-gray-900">{stats.syncedKeys}</div>
		</div>
		<div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
			<div class="text-sm font-medium text-gray-500">Cloud Status</div>
			<div class="text-2xl font-bold {stats.cloudAvailable ? 'text-green-600' : 'text-yellow-600'}">
				{stats.cloudAvailable ? 'Online' : 'Offline'}
			</div>
		</div>
		<div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
			<div class="text-sm font-medium text-gray-500">Last Sync</div>
			<div class="text-2xl font-bold text-gray-900">
				{stats.lastSync ? formatDate(stats.lastSync.getTime()) : 'Never'}
			</div>
		</div>
	</div>
{/if}
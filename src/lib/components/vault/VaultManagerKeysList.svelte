<script lang="ts">
	import type { APIKey } from '$lib/vault/types';
	import { getProviderIcon, formatDate } from './VaultManagerHelpers';

	export let keys: APIKey[] = [];
	export let isLoading = false;
	export let showAddKeyForm = false;
	export let toggleKeyActive: (key: APIKey) => void = () => {};
	export let deleteKey: (id: string) => void = () => {};
	export let openAddKeyForm: () => void = () => {};
</script>

<!-- Keys List -->
<div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-200">
		<h2 class="text-xl font-semibold text-gray-900">API Keys ({keys.length})</h2>
	</div>
	
	{#if isLoading && keys.length === 0}
		<div class="p-8 text-center">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<p class="mt-2 text-gray-500">Loading keys...</p>
		</div>
	{:else if keys.length === 0}
		<div class="p-8 text-center">
			<div class="text-gray-400 mb-4">
				<svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
				</svg>
			</div>
			<h3 class="text-lg font-medium text-gray-900 mb-2">No API Keys Yet</h3>
			<p class="text-gray-500 mb-4">Add your first API key to get started with secure key management.</p>
			<button
				on:click={openAddKeyForm}
				class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			>
				Add Your First Key
			</button>
		</div>
	{:else}
		<div class="divide-y divide-gray-200">
			{#each keys as key (key.id)}
				<div class="px-6 py-4 hover:bg-gray-50">
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-4">
							<div class="text-2xl">
								{getProviderIcon(key.provider)}
							</div>
							<div>
								<div class="flex items-center space-x-2">
									<h3 class="text-lg font-medium text-gray-900">{key.keyName}</h3>
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {key.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
										{key.isActive ? 'Active' : 'Inactive'}
									</span>
								</div>
								<div class="flex items-center space-x-4 mt-1 text-sm text-gray-500">
									<span class="capitalize">{key.provider}</span>
									{#if key.modelFamily}
										<span>• {key.modelFamily}</span>
									{/if}
									<span>• Version {key.keyVersion}</span>
									<span>• Used {key.usageCount} times</span>
								</div>
								<div class="text-xs text-gray-400 mt-1">
									Last used: {formatDate(key.lastUsedAt)} • Created: {formatDate(key.createdAt)}
									{#if key.lastSyncedAt}
										<span> • Synced: {formatDate(key.lastSyncedAt)}</span>
									{/if}
								</div>
							</div>
						</div>
						
						<div class="flex items-center space-x-2">
							<button
								on:click={() => toggleKeyActive(key)}
								disabled={isLoading}
								class="px-3 py-1 text-sm {key.isActive ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
							>
								{key.isActive ? 'Deactivate' : 'Activate'}
							</button>
							
							<button
								on:click={() => deleteKey(key.id)}
								disabled={isLoading}
								class="px-3 py-1 text-sm bg-red-100 text-red-800 hover:bg-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
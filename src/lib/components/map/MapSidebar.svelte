<script lang="ts">
	import { mapStore, selectedFeature, featuresByType } from '$lib/stores/mapStore';
	
	let searchQuery = '';
	
	function deleteSelected() {
		if ($mapStore.selectedFeatureId) {
			mapStore.deleteFeature($mapStore.selectedFeatureId);
		}
	}
	
	function clearAll() {
		if (confirm('Delete all features? This cannot be undone.')) {
			mapStore.clearAll();
		}
	}
</script>

<div class="h-full flex flex-col">
	<!-- Search Bar -->
	<div class="p-4 border-b border-gray-200">
		<div class="relative">
			<input
				type="text"
				class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
				placeholder="Search features..."
				bind:value={searchQuery}
			/>
			<svg class="absolute right-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</div>
	</div>

	<!-- Stats -->
	<div class="p-4 border-b border-gray-200">
		<h3 class="text-sm font-semibold text-gray-700 mb-2">Overview</h3>
		<div class="grid grid-cols-2 gap-2">
			<div class="bg-gray-50 rounded p-2">
				<div class="text-xs text-gray-500">Total Features</div>
				<div class="text-lg font-semibold">{$mapStore.features.length}</div>
			</div>
			<div class="bg-gray-50 rounded p-2">
				<div class="text-xs text-gray-500">Geofences</div>
				<div class="text-lg font-semibold">{$mapStore.geofences.length}</div>
			</div>
		</div>
		<div class="mt-3 text-xs text-gray-600">
			<div class="flex justify-between">
				<span>Pins: {$featuresByType.point}</span>
				<span>Lines: {$featuresByType.line}</span>
			</div>
			<div class="flex justify-between mt-1">
				<span>Polygons: {$featuresByType.polygon}</span>
				<span>Circles: {$featuresByType.circle}</span>
			</div>
		</div>
	</div>

	<!-- Feature List -->
	<div class="flex-1 overflow-y-auto p-4">
		<h3 class="text-sm font-semibold text-gray-700 mb-3">Features</h3>
		
		{#if $mapStore.features.length === 0}
			<div class="text-center py-8 text-gray-500">
				<svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
				</svg>
				<p class="mt-2 text-sm">No features yet</p>
				<p class="text-xs mt-1">Click "Add Pin" or use drawing tools</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each $mapStore.features as feature (feature.id)}
					<div
						class="p-3 rounded-lg border cursor-pointer transition-colors { $mapStore.selectedFeatureId === feature.id ? 'bg-forest-50 border-forest-200' : 'bg-white border-gray-200 hover:bg-gray-50' }"
						on:click={() => mapStore.selectFeature(feature.id)}
					>
						<div class="flex items-start justify-between">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1">
									<span class="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded capitalize">
										{feature.type}
									</span>
									{#if $mapStore.geofences.some(g => g.id === feature.id)}
										<span class="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
											Geofence
										</span>
									{/if}
									<span class="text-xs text-gray-500">
										{new Date(feature.properties.createdAt).toLocaleDateString()}
									</span>
								</div>
								<h4 class="font-medium text-gray-800 truncate">
									{feature.properties.title || 'Untitled'}
								</h4>
								{#if feature.properties.description}
									<p class="text-sm text-gray-600 truncate mt-1">
										{feature.properties.description}
									</p>
								{/if}
							</div>
							<div class="flex flex-col gap-1">
								<button
									class="text-gray-400 hover:text-blue-500"
									on:click|stopPropagation={() => {
										if ($mapStore.geofences.some(g => g.id === feature.id)) {
											mapStore.removeGeofence(feature.id);
										} else {
											mapStore.addGeofence(feature);
										}
									}}
									title="Toggle Geofence"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
									</svg>
								</button>
								<button
									class="text-gray-400 hover:text-red-500"
									on:click|stopPropagation={() => mapStore.deleteFeature(feature.id)}
									title="Delete"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Actions -->
	<div class="p-4 border-t border-gray-200 space-y-2">
		<button
			class="w-full px-3 py-2 bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium rounded-lg transition-colors"
			on:click={() => mapStore.addPin()}
		>
			Add Pin
		</button>
		<div class="flex gap-2">
			<button
				class="flex-1 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded-lg transition-colors"
				on:click={clearAll}
				disabled={$mapStore.features.length === 0}
			>
				Clear All
			</button>
			<button
				class="flex-1 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded-lg transition-colors"
				on:click={deleteSelected}
				disabled={!$mapStore.selectedFeatureId}
			>
				Delete Selected
			</button>
		</div>
	</div>
</div>
<script lang="ts">
	import { mapStore } from '$lib/stores/mapStore';
	
	const layers = [
		{ id: 'streets', label: 'Streets', icon: 'map' },
		{ id: 'satellite', label: 'Satellite', icon: 'satellite' },
		{ id: 'hybrid', label: 'Hybrid', icon: 'layers' },
		{ id: 'dark', label: 'Dark', icon: 'moon' }
	] as const;

	const drawingModes = [
		{ id: 'point', label: 'Pin', icon: 'pin' },
		{ id: 'line', label: 'Line', icon: 'line' },
		{ id: 'polygon', label: 'Polygon', icon: 'polygon' },
		{ id: 'circle', label: 'Circle', icon: 'circle' }
	] as const;
</script>

<div class="flex flex-col gap-4">
	<!-- Layer Selection -->
	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<h4 class="text-xs font-semibold text-gray-700 mb-2">Layers</h4>
		<div class="space-y-1">
			{#each layers as layer}
				<button
					class="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-50 { $mapStore.activeLayer === layer.id ? 'bg-forest-50 text-forest-700' : 'text-gray-600' }"
					on:click={() => mapStore.toggleLayer(layer.id)}
				>
					<span class="w-4 h-4 flex items-center justify-center">
						{#if layer.icon === 'map'}
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
							</svg>
						{:else if layer.icon === 'satellite'}
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						{:else if layer.icon === 'layers'}
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
						{:else if layer.icon === 'moon'}
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
							</svg>
						{/if}
					</span>
					<span class="truncate">{layer.label}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Drawing Tools -->
	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<h4 class="text-xs font-semibold text-gray-700 mb-2">Drawing</h4>
		<div class="space-y-1">
			{#each drawingModes as mode}
				<button
					class="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-50 { $mapStore.drawingMode === mode.id ? 'bg-forest-50 text-forest-700' : 'text-gray-600' }"
					on:click={() => mapStore.startDrawing(mode.id)}
				>
					<span class="w-4 h-4 flex items-center justify-center">
						{#if mode.icon === 'pin'}
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						{:else if mode.icon === 'line'}
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
							</svg>
						{:else if mode.icon === 'polygon'}
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
							</svg>
						{:else if mode.icon === 'circle'}
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						{/if}
					</span>
					<span class="truncate">{mode.label}</span>
				</button>
			{/each}
			{#if $mapStore.drawingMode !== 'none'}
				<button
					class="w-full mt-2 px-2 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200"
					on:click={() => mapStore.stopDrawing()}
				>
					Cancel Drawing
				</button>
			{/if}
		</div>
	</div>

	<!-- GPS Control -->
	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<h4 class="text-xs font-semibold text-gray-700 mb-2">Location</h4>
		<button
			class="w-full flex items-center justify-center gap-2 px-2 py-1.5 text-sm rounded { $mapStore.gpsActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100' }"
			on:click={() => mapStore.requestGPS()}
			disabled={$mapStore.gpsLoading}
		>
			{#if $mapStore.gpsLoading}
				<span class="animate-spin">⟳</span>
				<span>Requesting...</span>
			{:else}
				<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
				</svg>
				<span>{$mapStore.gpsActive ? 'GPS Active' : 'Enable GPS'}</span>
			{/if}
		</button>
	</div>
</div>
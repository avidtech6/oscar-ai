<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { mapStore, selectedFeature } from '$lib/stores/mapStore';

	let mapContainer: HTMLDivElement;
	let map: any = null;

	function getStyleUrl(layer: string, key: string): string {
		if (!key) {
			// Fallback to OpenStreetMap based styles
			switch (layer) {
				case 'satellite':
					return 'https://demotiles.maplibre.org/style.json'; // Not actually satellite, but demo
				case 'dark':
					return 'https://demotiles.maplibre.org/style.json';
				default:
					return 'https://demotiles.maplibre.org/style.json';
			}
		}
		
		const base = 'https://api.maptiler.com/maps/';
		switch (layer) {
			case 'satellite':
				return `${base}satellite/style.json?key=${key}`;
			case 'hybrid':
				return `${base}hybrid/style.json?key=${key}`;
			case 'dark':
				return `${base}dark/style.json?key=${key}`;
			case 'streets':
			default:
				return `${base}streets/style.json?key=${key}`;
		}
	}

	onMount(async () => {
		if (!browser || !mapContainer) return;

		try {
			// Dynamically import maplibre to avoid SSR issues
			const maplibregl = await import('maplibre-gl');
			await import('maplibre-gl/dist/maplibre-gl.css');

			// Get MapTiler key from environment or use demo
			const maptilerKey = import.meta.env.VITE_MAPTILER_KEY || '';
			const styleUrl = getStyleUrl($mapStore.activeLayer, maptilerKey);

			map = new maplibregl.Map({
				container: mapContainer,
				style: styleUrl,
				center: $mapStore.center,
				zoom: $mapStore.zoom
			});

			// Add navigation controls
			map.addControl(new maplibregl.NavigationControl());

			// Handle map movements
			map.on('moveend', () => {
				if (!map) return;
				const center = map.getCenter();
				const zoom = map.getZoom();
				mapStore.setView([ center.lng, center.lat ], zoom);
			});

			// Handle clicks
			map.on('click', (e: any) => {
				if ($mapStore.drawingMode === 'point') {
					mapStore.addPin([ e.lngLat.lng, e.lngLat.lat ]);
				}
			});

			// Subscribe to layer changes
			const unsubscribe = mapStore.subscribe(state => {
				if (!map) return;
				const maptilerKey = import.meta.env.VITE_MAPTILER_KEY || '';
				const newStyleUrl = getStyleUrl(state.activeLayer, maptilerKey);
				const currentStyle = map.getStyle();
				if (currentStyle.sprite !== newStyleUrl) {
					map.setStyle(newStyleUrl);
				}
			});

			// Cleanup
			onDestroy(() => {
				unsubscribe();
				if (map) {
					map.remove();
					map = null;
				}
			});

		} catch (error) {
			console.error('Failed to initialize map:', error);
		}
	});

	// Fly to GPS position
	function flyToGPS() {
		if (!map || !$mapStore.gpsPosition) return;
		map.flyTo({
			center: [ $mapStore.gpsPosition.lng, $mapStore.gpsPosition.lat ],
			zoom: 16
		});
	}

	// Fit bounds to all features
	function fitBounds() {
		if (!map || $mapStore.features.length === 0) return;
		
		// Simple implementation: just zoom to first feature
		const firstFeature = $mapStore.features[0];
		if (firstFeature.geometry.type === 'Point') {
			const coords = firstFeature.geometry.coordinates as [number, number];
			map.flyTo({
				center: coords,
				zoom: 14
			});
		}
	}
</script>

<div class="relative w-full h-full">
	<div
		bind:this={mapContainer}
		class="absolute inset-0"
	></div>
	
	<!-- Map Controls Overlay -->
	<div class="absolute top-4 right-4 flex flex-col gap-2">
		<button
			class="bg-white p-2 rounded-lg shadow border border-gray-300 hover:bg-gray-50"
			on:click={fitBounds}
			title="Fit to features"
			aria-label="Fit map to all features"
		>
			<svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
			</svg>
		</button>
		{#if $mapStore.gpsPosition}
			<button
				class="bg-white p-2 rounded-lg shadow border border-gray-300 hover:bg-gray-50"
				on:click={flyToGPS}
				title="Fly to GPS"
				aria-label="Fly to current GPS location"
			>
				<svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
				</svg>
			</button>
		{/if}
	</div>

	<!-- Drawing Mode Indicator -->
	{#if $mapStore.drawingMode !== 'none'}
		<div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow border border-gray-300 flex items-center gap-3">
			<div class="text-sm font-medium text-gray-700">
				Drawing: <span class="capitalize">{$mapStore.drawingMode}</span>
			</div>
			<button
				class="text-xs px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded"
				on:click={() => mapStore.stopDrawing()}
			>
				Cancel
			</button>
		</div>
	{/if}

	<!-- Selected Feature Info -->
	{#if $selectedFeature}
		<div class="absolute bottom-4 left-4 max-w-md bg-white rounded-lg shadow border border-gray-300 p-4">
			<div class="flex items-start justify-between mb-2">
				<h3 class="font-semibold text-gray-800">{$selectedFeature.properties.title || 'Untitled'}</h3>
				<button
					class="text-gray-400 hover:text-gray-600"
					on:click={() => mapStore.selectFeature(null)}
					title="Close"
					aria-label="Close feature details"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<p class="text-sm text-gray-600 mb-3">{$selectedFeature.properties.description || 'No description'}</p>
			<div class="flex items-center gap-2">
				<span class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">{$selectedFeature.type}</span>
				<span class="text-xs text-gray-500">
					Created {$selectedFeature.properties.createdAt.toLocaleDateString()}
				</span>
			</div>
		</div>
	{/if}
</div>
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let isOpen: boolean = false;
	export let mapsFolderId: string = '';
	export let googleMapsApiKey: string = '';
	
	const dispatch = createEventDispatcher();
	
	let location: string = '';
	let zoom: number = 16;
	let mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain' = 'satellite';
	let width: number = 600;
	let height: number = 400;
	let isGenerating: boolean = false;
	let error: string | null = null;
	let previewUrl: string | null = null;
	let markers: Array<{ lat: number; lng: number; label?: string }> = [];
	
	async function generatePreview() {
		if (!location || !googleMapsApiKey) return;
		
		isGenerating = true;
		error = null;
		
		try {
			// First geocode the address
			const encodedAddress = encodeURIComponent(location);
			const geocodeResponse = await fetch(
				`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${googleMapsApiKey}`
			);
			
			const geocodeData = await geocodeResponse.json();
			
			if (geocodeData.status !== 'OK' || !geocodeData.results[0]) {
				throw new Error('Address not found');
			}
			
			const coords = geocodeData.results[0].geometry.location;
			const center = { lat: coords.lat, lng: coords.lng };
			
			// Generate static map URL
			const params = new URLSearchParams({
				key: googleMapsApiKey,
				center: `${center.lat},${center.lng}`,
				zoom: zoom.toString(),
				maptype: mapType,
				size: `${width}x${height}`,
				scale: '2'
			});
			
			if (markers.length > 0) {
				markers.forEach(marker => {
					params.append('markers', `${marker.lat},${marker.lng}${marker.label ? `|${marker.label}` : ''}`);
				});
			}
			
			previewUrl = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
		} catch (e: any) {
			error = e.message || 'Failed to generate map';
			previewUrl = null;
		} finally {
			isGenerating = false;
		}
	}
	
	async function addMarker() {
		// If we have a location, geocode it first
		if (location) {
			try {
				const encodedAddress = encodeURIComponent(location);
				const geocodeResponse = await fetch(
					`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${googleMapsApiKey}`
				);
				
				const geocodeData = await geocodeResponse.json();
				
				if (geocodeData.status === 'OK' && geocodeData.results[0]) {
					const coords = geocodeData.results[0].geometry.location;
					markers = [...markers, { 
						lat: coords.lat, 
						lng: coords.lng,
						label: `T${markers.length + 1}`
					}];
				}
			} catch (e) {
				console.error('Failed to geocode marker:', e);
			}
		}
	}
	
	function removeMarker(index: number) {
		markers = markers.filter((_, i) => i !== index);
		// Regenerate preview
		if (location && googleMapsApiKey) {
			generatePreview();
		}
	}
	
	async function saveMap() {
		if (!previewUrl || !mapsFolderId) return;
		
		isGenerating = true;
		
		try {
			// Fetch the image
			const response = await fetch(previewUrl);
			const blob = await response.blob();
			
			// Convert to base64
			const reader = new FileReader();
			const imageData = await new Promise<string>((resolve, reject) => {
				reader.onload = () => resolve(reader.result as string);
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			});
			
			const filename = `map_${Date.now()}.png`;
			const base64Data = imageData.split(',')[1];
			
			// Get center coordinates
			let centerLat = 0, centerLng = 0;
			if (markers.length > 0) {
				centerLat = markers[0].lat;
				centerLng = markers[0].lng;
			}
			
			dispatch('save', {
				filename,
				imageData: base64Data,
				metadata: {
					lat: centerLat,
					lng: centerLng,
					zoom,
					mapType,
					location
				},
				folderId: mapsFolderId
			});
			
			close();
		} catch (e: any) {
			error = e.message || 'Failed to save map';
		} finally {
			isGenerating = false;
		}
	}
	
	function close() {
		location = '';
		zoom = 16;
		mapType = 'satellite';
		width = 600;
		height = 400;
		previewUrl = null;
		error = null;
		markers = [];
		dispatch('close');
	}
</script>

{#if isOpen}
	<div class="map-generator fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
		<div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
			<!-- Header -->
			<div class="p-4 border-b border-gray-200 flex items-center justify-between">
				<h3 class="font-semibold text-gray-800">Generate Map</h3>
				<button 
					class="p-1 hover:bg-gray-100 rounded"
					on:click={close}
				>
					<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
					</svg>
				</button>
			</div>
			
			<!-- Content -->
			<div class="flex-1 overflow-y-auto p-4 space-y-4">
				<!-- Location Input -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
					<input
						type="text"
						bind:value={location}
						placeholder="Enter address or location"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				
				<!-- Map Options -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Zoom Level</label>
						<select
							bind:value={zoom}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value={14}>City (14)</option>
							<option value={15}>Neighborhood (15)</option>
							<option value={16}>Street (16)</option>
							<option value={17}>Building (17)</option>
							<option value={18}>Detailed (18)</option>
						</select>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Map Type</label>
						<select
							bind:value={mapType}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="satellite">Satellite</option>
							<option value="roadmap">Roadmap</option>
							<option value="hybrid">Hybrid</option>
							<option value="terrain">Terrain</option>
						</select>
					</div>
				</div>
				
				<!-- Size Options -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
						<input
							type="number"
							bind:value={width}
							min="200"
							max="1200"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
						<input
							type="number"
							bind:value={height}
							min="200"
							max="1200"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>
				
				<!-- Markers -->
				<div>
					<div class="flex items-center justify-between mb-2">
						<label class="block text-sm font-medium text-gray-700">Tree Markers</label>
						<button 
							class="text-sm text-blue-600 hover:underline"
							on:click={addMarker}
						>
							Add Current Location as Marker
						</button>
					</div>
					
					{#if markers.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each markers as marker, i}
								<span class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
									{marker.label || `Marker ${i + 1}`}
									<button 
										class="ml-1 hover:text-green-900"
										on:click={() => removeMarker(i)}
									>
										<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
										</svg>
									</button>
								</span>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-gray-500">No markers added</p>
					{/if}
				</div>
				
				<!-- Generate Button -->
				<button
					class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
					on:click={generatePreview}
					disabled={!location || !googleMapsApiKey || isGenerating}
				>
					{isGenerating ? 'Generating...' : 'Generate Preview'}
				</button>
				
				{#if error}
					<p class="text-red-600 text-sm">{error}</p>
				{/if}
				
				<!-- Preview -->
				{#if previewUrl}
					<div class="border border-gray-200 rounded-lg overflow-hidden">
						<img src={previewUrl} alt="Map Preview" class="w-full" />
					</div>
				{/if}
			</div>
			
			<!-- Footer -->
			{#if previewUrl}
				<div class="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
					<button 
						class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
						on:click={generatePreview}
					>
						Update
					</button>
					<button 
						class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
						on:click={saveMap}
						disabled={isGenerating}
					>
						{isGenerating ? 'Saving...' : 'Save Map'}
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

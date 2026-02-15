/**
 * MobileMapCapture.svelte
 * 
 * Mobile-optimized map capture component that:
 * - Gets user's GPS location
 * - Generates a static map using Google Maps Static API
 * - Saves to project /maps folder
 * - Adds entry to components.json
 */

<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	
	export let projectId: string = '';
	export let projectName: string = '';
	
	const dispatch = createEventDispatcher();
	
	let isLoading = false;
	let error: string = '';
	let currentLocation: { lat: number; lng: number } | null = null;
	let locationName: string = 'Current Location';
	let mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain' = 'satellite';
	let zoom: number = 17;
	let mapGenerated = false;
	let mapImageUrl: string = '';
	let isSaving = false;
	
	// Google Maps API key - would come from environment in production
	const GOOGLE_MAPS_API_KEY = ''; // Will be passed or fetched
	
	onMount(() => {
		getCurrentLocation();
	});
	
	/**
	 * Get current GPS location
	 */
	async function getCurrentLocation() {
		isLoading = true;
		error = '';
		
		if (!navigator.geolocation) {
			error = 'Geolocation is not supported by your browser';
			isLoading = false;
			return;
		}
		
		try {
			const position = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0
				});
			});
			
			currentLocation = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			
			// Try to get a readable location name
			await reverseGeocode(currentLocation);
			
			// Generate the map
			generateMap();
		} catch (err: any) {
			console.error('Geolocation error:', err);
			if (err.code === err.PERMISSION_DENIED) {
				error = 'Location access denied. Please enable location services.';
			} else if (err.code === err.POSITION_UNAVAILABLE) {
				error = 'Location information unavailable';
			} else if (err.code === err.TIMEOUT) {
				error = 'Location request timed out';
			} else {
				error = 'Failed to get your location';
			}
		} finally {
			isLoading = false;
		}
	}
	
	/**
	 * Reverse geocode to get a readable location name
	 */
	async function reverseGeocode(coords: { lat: number; lng: number }) {
		try {
			// Use a simple approach - in production you'd call Google Geocoding API
			locationName = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
		} catch (err) {
			console.error('Reverse geocode error:', err);
		}
	}
	
	/**
	 * Generate static map URL
	 */
	function generateMap() {
		if (!currentLocation) return;
		
		mapGenerated = true;
		mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${currentLocation.lat},${currentLocation.lng}&zoom=${zoom}&maptype=${mapType}&size=600x400&scale=2&markers=color:red%7C${currentLocation.lat},${currentLocation.lng}&key=${GOOGLE_MAPS_API_KEY}`;
	}
	
	/**
	 * Save the map to the project
	 */
	async function saveMap() {
		if (!currentLocation || !projectId || !projectName) {
			error = 'Missing project information';
			return;
		}
		
		isSaving = true;
		error = '';
		
		try {
			// Call the API to save the map
			const response = await fetch('/api/project/components', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					action: 'uploadMap',
					projectId,
					projectName,
					metadata: {
						type: 'map',
						title: locationName,
						lat: currentLocation.lat,
						lng: currentLocation.lng,
						zoom,
						mapType,
						capturedAt: new Date().toISOString()
					}
				})
			});
			
			const data = await response.json();
			
			if (data.success) {
				dispatch('map-captured', {
					id: data.componentId,
					type: 'map',
					title: locationName,
					path: data.webViewLink,
					lat: currentLocation.lat,
					lng: currentLocation.lng,
					zoom,
					mapType
				});
				
				dispatch('close');
			} else {
				throw new Error(data.error || 'Failed to save map');
			}
		} catch (err: any) {
			console.error('Error saving map:', err);
			error = err.message || 'Failed to save map';
		} finally {
			isSaving = false;
		}
	}
	
	/**
	 * Retry getting location
	 */
	function retry() {
		getCurrentLocation();
	}
	
	/**
	 * Close the modal
	 */
	function close() {
		dispatch('close');
	}
	
	/**
	 * Update map settings and regenerate
	 */
	function updateMapSettings() {
		generateMap();
	}
</script>

<div class="mobile-map-capture">
	<div class="header">
		<h3>
			<span class="icon">🗺️</span>
			Capture Location
		</h3>
		<button class="close-btn" on:click={close}>
			✕
		</button>
	</div>
	
	<div class="content">
		{#if isLoading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Getting your location...</p>
			</div>
		{:else if error}
			<div class="error-state">
				<span class="error-icon">⚠️</span>
				<p>{error}</p>
				<button class="retry-btn" on:click={retry}>
					Try Again
				</button>
			</div>
		{:else if currentLocation}
			<div class="map-preview">
				{#if mapGenerated && mapImageUrl}
					<img src={mapImageUrl} alt="Location map" />
				{:else}
					<div class="map-placeholder">
						<span>📍</span>
						<p>Map preview will appear here</p>
					</div>
				{/if}
			</div>
			
			<div class="location-info">
				<div class="info-row">
					<span class="label">📍 Location:</span>
					<span class="value">{locationName}</span>
				</div>
				<div class="info-row">
					<span class="label">🧭 Coordinates:</span>
					<span class="value">{currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</span>
				</div>
			</div>
			
			<div class="map-options">
				<div class="option-group">
					<label>Map Type</label>
					<div class="button-group">
						<button 
							class:active={mapType === 'roadmap'}
							on:click={() => { mapType = 'roadmap'; updateMapSettings(); }}
						>
							Road
						</button>
						<button 
							class:active={mapType === 'satellite'}
							on:click={() => { mapType = 'satellite'; updateMapSettings(); }}
						>
							Satellite
						</button>
						<button 
							class:active={mapType === 'hybrid'}
							on:click={() => { mapType = 'hybrid'; updateMapSettings(); }}
						>
							Hybrid
						</button>
					</div>
				</div>
				
				<div class="option-group">
					<label>Zoom Level: {zoom}</label>
					<input 
						type="range" 
						min="10" 
						max="20" 
						bind:value={zoom}
						on:change={updateMapSettings}
					/>
				</div>
			</div>
			
			{#if error}
				<div class="error-message">
					{error}
				</div>
			{/if}
			
			<div class="actions">
				<button class="secondary-btn" on:click={close}>
					Cancel
				</button>
				<button 
					class="primary-btn" 
					on:click={saveMap}
					disabled={isSaving}
				>
					{#if isSaving}
						<span class="spinner"></span>
						Saving...
					{:else}
						Save Map
					{/if}
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.mobile-map-capture {
		position: fixed;
		inset: 0;
		background: white;
		z-index: 100;
		display: flex;
		flex-direction: column;
	}
	
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}
	
	.header h3 {
		margin: 0;
		font-size: 18px;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	
	.close-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		color: white;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 16px;
	}
	
	.content {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	
	.loading-state,
	.error-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		text-align: center;
	}
	
	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #e5e7eb;
		border-top-color: #667eea;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.error-icon {
		font-size: 48px;
	}
	
	.error-state p {
		color: #6b7280;
		margin: 0;
	}
	
	.retry-btn {
		padding: 10px 20px;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
	}
	
	.map-preview {
		border-radius: 12px;
		overflow: hidden;
		background: #f3f4f6;
	}
	
	.map-preview img {
		width: 100%;
		height: 250px;
		object-fit: cover;
	}
	
	.map-placeholder {
		height: 250px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		color: #9ca3af;
	}
	
	.map-placeholder span {
		font-size: 48px;
	}
	
	.location-info {
		background: #f9fafb;
		border-radius: 8px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	
	.info-row {
		display: flex;
		justify-content: space-between;
		font-size: 14px;
	}
	
	.info-row .label {
		color: #6b7280;
	}
	
	.info-row .value {
		font-weight: 500;
		color: #111827;
	}
	
	.map-options {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	
	.option-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	
	.option-group label {
		font-size: 14px;
		font-weight: 600;
		color: #374151;
	}
	
	.button-group {
		display: flex;
		gap: 8px;
	}
	
	.button-group button {
		flex: 1;
		padding: 8px;
		border: 2px solid #e5e7eb;
		background: white;
		border-radius: 6px;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.button-group button.active {
		border-color: #667eea;
		background: #ede9fe;
		color: #5b21b6;
	}
	
	.option-group input[type="range"] {
		width: 100%;
	}
	
	.error-message {
		padding: 12px;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 8px;
		color: #dc2626;
		font-size: 14px;
	}
	
	.actions {
		display: flex;
		gap: 12px;
		padding-top: 16px;
		border-top: 1px solid #e5e7eb;
	}
	
	.secondary-btn,
	.primary-btn {
		flex: 1;
		padding: 12px;
		border-radius: 8px;
		font-weight: 600;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}
	
	.secondary-btn {
		background: white;
		border: 2px solid #e5e7eb;
		color: #374151;
	}
	
	.primary-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		color: white;
	}
	
	.primary-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>

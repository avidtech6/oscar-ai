<script lang="ts">
  import { onMount } from 'svelte';
  import MapComponent from '$lib/components/map/MapComponent.svelte';
  import MapControls from '$lib/components/map/MapControls.svelte';
  import MapSidebar from '$lib/components/map/MapSidebar.svelte';
  import { mapStore } from '$lib/stores/mapStore';
  import ContextPills from '$lib/components/layout/ContextPills.svelte';

  let mapLoaded = false;
  let error: string | null = null;

  onMount(async () => {
    try {
      // Initialize map store
      await mapStore.initialize();
      mapLoaded = true;
    } catch (err) {
      console.error('Failed to initialize map:', err);
      error = 'Failed to load map. Please check your internet connection and try again.';
    }
  });
</script>

<div class="map-shell">
  <div class="map-layout">
    <!-- Left: Map controls and sidebar -->
    <div class="map-left">
      <div class="map-controls-section">
        <h3 class="text-lg font-semibold mb-4">Map</h3>
        
        <div class="controls-section mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Controls</div>
          <div class="space-y-3">
            <button
              class="w-full px-3 py-2 bg-forest-600 hover:bg-forest-700 text-white text-sm rounded-lg transition-colors"
              onclick={() => mapStore.addPin()}
            >
              Add Pin
            </button>
            <button
              class="w-full px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded-lg transition-colors"
              onclick={() => mapStore.toggleLayer('satellite')}
            >
              Toggle Satellite
            </button>
            <button
              class="w-full px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded-lg transition-colors"
              onclick={() => mapStore.requestGPS()}
            >
              {$mapStore.gpsLoading ? 'Requesting GPS...' : 'Enable GPS'}
            </button>
          </div>
        </div>
        
        <div class="stats-section">
          <div class="text-sm text-gray-600">
            {#if $mapStore.features}
              {$mapStore.features.length} features
            {:else}
              0 features
            {/if}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            Zoom: {$mapStore.zoom?.toFixed(2) || '—'}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Middle: Map canvas -->
    <div class="map-middle">
      <div class="map-header mb-4">
        <h2 class="text-2xl font-bold text-gray-900">Interactive Map</h2>
        <p class="text-gray-600 mt-1">Geospatial workspace with pins, layers, and GPS integration</p>
      </div>
      
      <div class="map-canvas-container">
        {#if error}
          <div class="map-error">
            <div class="text-red-500 text-lg font-semibold mb-2">Map Error</div>
            <p class="text-gray-700 mb-4">{error}</p>
            <button
              class="px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-lg"
              onclick={() => location.reload()}
            >
              Reload
            </button>
          </div>
        {:else if !mapLoaded}
          <div class="map-loading">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600"></div>
            <p class="mt-3 text-gray-600">Loading map...</p>
          </div>
        {:else}
          <div class="map-component-wrapper">
            <MapComponent />
          </div>
        {/if}
      </div>
      
      <!-- Bottom status bar -->
      <div class="map-status-bar">
        <div class="status-items">
          <div class="status-item">
            <span class="status-label">Center:</span>
            <span class="status-value">
              {$mapStore.center?.[0]?.toFixed(4) || '—'}, {$mapStore.center?.[1]?.toFixed(4) || '—'}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">GPS:</span>
            <span class:gps-active={$mapStore.gpsActive} class:gps-inactive={!$mapStore.gpsActive}>
              {$mapStore.gpsActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Layer:</span>
            <span class="status-value">{$mapStore.activeLayer || 'Default'}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Right: Context Pills and Map Sidebar -->
    <div class="map-right">
      <div class="context-pills-section mb-6">
        <ContextPills />
      </div>
      
      <div class="map-sidebar-section">
        <MapSidebar />
      </div>
      
      <div class="map-controls-section mt-6">
        <MapControls />
      </div>
    </div>
  </div>
</div>

<style>
  .map-shell {
    height: 100%;
    width: 100%;
  }
  
  .map-layout {
    display: flex;
    height: 100%;
    gap: 1rem;
    padding: 1rem;
  }
  
  .map-left {
    flex: 0 0 200px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
  }
  
  .map-middle {
    flex: 1;
    min-width: 300px;
    display: flex;
    flex-direction: column;
  }
  
  .map-right {
    flex: 0 0 300px;
    min-width: 300px;
    border-left: 1px solid #e5e7eb;
    padding-left: 1rem;
    overflow-y: auto;
  }
  
  .map-canvas-container {
    flex: 1;
    position: relative;
    background-color: #f9fafb;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid #e5e7eb;
  }
  
  .map-error,
  .map-loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.9);
  }
  
  .map-component-wrapper {
    height: 100%;
    width: 100%;
  }
  
  .map-status-bar {
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }
  
  .status-items {
    display: flex;
    gap: 2rem;
  }
  
  .status-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .status-label {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .status-value {
    font-family: ui-monospace, monospace;
    font-size: 0.875rem;
    color: #111827;
  }
  
  .gps-active {
    color: #059669;
    font-weight: 500;
  }
  
  .gps-inactive {
    color: #6b7280;
  }
  
  .controls-section button {
    transition: all 0.2s ease;
  }
  
  .controls-section button:hover {
    transform: translateY(-1px);
  }
  
  /* Responsive */
  @media (max-width: 1024px) {
    .map-layout {
      flex-direction: column;
    }
    
    .map-left,
    .map-middle,
    .map-right {
      border-right: none;
      border-left: none;
      border-bottom: 1px solid #e5e7eb;
      padding-right: 0;
      padding-left: 0;
      padding-bottom: 1rem;
      flex: none;
      width: 100%;
    }
    
    .map-left {
      order: 1;
    }
    
    .map-middle {
      order: 2;
    }
    
    .map-right {
      order: 3;
    }
    
    .status-items {
      flex-wrap: wrap;
      gap: 1rem;
    }
  }
</style>
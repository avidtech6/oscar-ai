import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { Feature, FeatureCollection, Point, LineString, Polygon } from 'geojson';

export interface MapFeature {
	id: string;
	type: 'point' | 'line' | 'polygon' | 'circle';
	geometry: Feature['geometry'];
	properties: {
		title?: string;
		description?: string;
		tags?: string[];
		linkedItems?: string[]; // IDs of linked items (projects, files, etc.)
		createdAt: Date;
		updatedAt: Date;
		createdBy?: string;
		permissions?: string[];
		[ key: string ]: any;
	};
}

export interface MapState {
	center: [ number, number ]; // [lng, lat]
	zoom: number;
	features: MapFeature[];
	selectedFeatureId: string | null;
	activeLayer: 'streets' | 'satellite' | 'hybrid' | 'dark';
	gpsActive: boolean;
	gpsLoading: boolean;
	gpsPosition: { lat: number; lng: number; accuracy: number } | null;
	drawingMode: 'none' | 'point' | 'line' | 'polygon' | 'circle';
	geofences: MapFeature[];
}

const initialState: MapState = {
	center: [ -0.1276, 51.5072 ], // London
	zoom: 12,
	features: [],
	selectedFeatureId: null,
	activeLayer: 'streets',
	gpsActive: false,
	gpsLoading: false,
	gpsPosition: null,
	drawingMode: 'none',
	geofences: []
};

function createMapStore() {
	const { subscribe, set, update } = writable<MapState>(initialState);

	// Load features from localStorage on browser
	async function initialize() {
		if (!browser) return;
		
		try {
			const saved = localStorage.getItem('oscar-map-features');
			if (saved) {
				const parsed = JSON.parse(saved);
				update(state => ({
					...state,
					features: parsed.features || [],
					geofences: parsed.geofences || []
				}));
			}
		} catch (err) {
			console.warn('Failed to load map features from localStorage:', err);
		}
	}

	// Save features to localStorage
	function persist() {
		if (!browser) return;
		const state = get({ subscribe });
		localStorage.setItem('oscar-map-features', JSON.stringify({
			features: state.features,
			geofences: state.geofences
		}));
	}

	return {
		subscribe,
		set,
		update,
		initialize,
		
		// Actions
		addPin(lngLat?: [ number, number ]) {
			update(state => {
				const center = lngLat || state.center;
				const newFeature: MapFeature = {
					id: `pin-${Date.now()}`,
					type: 'point',
					geometry: {
						type: 'Point',
						coordinates: center
					},
					properties: {
						title: 'New Pin',
						description: '',
						tags: [],
						linkedItems: [],
						createdAt: new Date(),
						updatedAt: new Date(),
						createdBy: 'user'
					}
				};
				const features = [ ...state.features, newFeature ];
				persist();
				return { ...state, features, selectedFeatureId: newFeature.id };
			});
		},

		addLine(coordinates: [ number, number ][]) {
			update(state => {
				const newFeature: MapFeature = {
					id: `line-${Date.now()}`,
					type: 'line',
					geometry: {
						type: 'LineString',
						coordinates
					},
					properties: {
						title: 'New Line',
						description: '',
						tags: [],
						linkedItems: [],
						createdAt: new Date(),
						updatedAt: new Date(),
						createdBy: 'user'
					}
				};
				const features = [ ...state.features, newFeature ];
				persist();
				return { ...state, features, selectedFeatureId: newFeature.id };
			});
		},

		addPolygon(coordinates: [ number, number ][][]) {
			update(state => {
				const newFeature: MapFeature = {
					id: `polygon-${Date.now()}`,
					type: 'polygon',
					geometry: {
						type: 'Polygon',
						coordinates
					},
					properties: {
						title: 'New Polygon',
						description: '',
						tags: [],
						linkedItems: [],
						createdAt: new Date(),
						updatedAt: new Date(),
						createdBy: 'user'
					}
				};
				const features = [ ...state.features, newFeature ];
				persist();
				return { ...state, features, selectedFeatureId: newFeature.id };
			});
		},

		addCircle(center: [ number, number ], radius: number) {
			update(state => {
				// Approximate circle with polygon (32 sides)
				const coordinates: [ number, number ][] = [];
				const steps = 32;
				for (let i = 0; i < steps; i++) {
					const angle = (i / steps) * 2 * Math.PI;
					const lat = center[1] + (radius / 111320) * Math.cos(angle); // approx meters to degrees
					const lng = center[0] + (radius / (111320 * Math.cos(center[1] * Math.PI / 180))) * Math.sin(angle);
					coordinates.push([ lng, lat ]);
				}
				coordinates.push(coordinates[0]); // close polygon
				
				const newFeature: MapFeature = {
					id: `circle-${Date.now()}`,
					type: 'circle',
					geometry: {
						type: 'Polygon',
						coordinates: [ coordinates ]
					},
					properties: {
						title: 'New Circle',
						description: '',
						tags: [],
						linkedItems: [],
						createdAt: new Date(),
						updatedAt: new Date(),
						createdBy: 'user',
						radius,
						center
					}
				};
				const features = [ ...state.features, newFeature ];
				persist();
				return { ...state, features, selectedFeatureId: newFeature.id };
			});
		},

		updateFeature(id: string, updates: Partial<MapFeature>) {
			update(state => {
				const features = state.features.map(f => 
					f.id === id 
						? { 
							...f, 
							...updates,
							properties: {
								...f.properties,
								...updates.properties,
								updatedAt: new Date()
							}
						}
						: f
				);
				persist();
				return { ...state, features };
			});
		},

		deleteFeature(id: string) {
			update(state => {
				const features = state.features.filter(f => f.id !== id);
				const geofences = state.geofences.filter(f => f.id !== id);
				persist();
				return { 
					...state, 
					features, 
					geofences,
					selectedFeatureId: state.selectedFeatureId === id ? null : state.selectedFeatureId
				};
			});
		},

		selectFeature(id: string | null) {
			update(state => ({ ...state, selectedFeatureId: id }));
		},

		toggleLayer(layer: MapState['activeLayer']) {
			update(state => ({ ...state, activeLayer: layer }));
		},

		setView(center: [ number, number ], zoom: number) {
			update(state => ({ ...state, center, zoom }));
		},

		async requestGPS() {
			if (!browser || !navigator.geolocation) return;
			
			update(state => ({ ...state, gpsLoading: true }));
			
			return new Promise<void>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						const { latitude, longitude, accuracy } = position.coords;
						update(state => ({
							...state,
							gpsActive: true,
							gpsLoading: false,
							gpsPosition: { lat: latitude, lng: longitude, accuracy },
							center: [ longitude, latitude ]
						}));
						resolve();
					},
					(error) => {
						console.error('GPS error:', error);
						update(state => ({ ...state, gpsLoading: false }));
						reject(error);
					},
					{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
				);
			});
		},

		startDrawing(mode: MapState['drawingMode']) {
			update(state => ({ ...state, drawingMode: mode }));
		},

		stopDrawing() {
			update(state => ({ ...state, drawingMode: 'none' }));
		},

		addGeofence(feature: MapFeature) {
			update(state => {
				const geofences = [ ...state.geofences, feature ];
				persist();
				return { ...state, geofences };
			});
		},

		removeGeofence(id: string) {
			update(state => {
				const geofences = state.geofences.filter(f => f.id !== id);
				persist();
				return { ...state, geofences };
			});
		},

		clearAll() {
			update(state => ({ ...initialState, center: state.center, zoom: state.zoom }));
			if (browser) {
				localStorage.removeItem('oscar-map-features');
			}
		}
	};
}

export const mapStore = createMapStore();

// Derived stores
export const selectedFeature = derived(mapStore, $mapStore => 
	$mapStore.features.find(f => f.id === $mapStore.selectedFeatureId) || null
);

export const featureCount = derived(mapStore, $mapStore => $mapStore.features.length);

export const geofenceCount = derived(mapStore, $mapStore => $mapStore.geofences.length);

export const featuresByType = derived(mapStore, $mapStore => {
	const counts = { point: 0, line: 0, polygon: 0, circle: 0 };
	$mapStore.features.forEach(f => counts[f.type]++);
	return counts;
});
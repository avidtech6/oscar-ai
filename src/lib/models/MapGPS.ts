/**
 * Module 6: Map & GPS Data Models
 * 
 * This module handles device location, geospatial rendering, satellite imagery, 
 * geofencing, and spatial context. Built on MapLibre GL JS with GeoJSON as the
 * canonical format for all geometry.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// 6.1 Core Principles & Geometry Types
// ============================================================================

/**
 * GeoJSON Geometry Types
 */
export type GeoJSONGeometryType = 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon' | 'GeometryCollection';

/**
 * GeoJSON Geometry - Core geometry representation
 */
export interface GeoJSONGeometry {
  type: GeoJSONGeometryType;
  coordinates: any; // GeoJSON coordinates array
  bbox?: [number, number, number, number]; // [west, south, east, north]
}

/**
 * GeoJSON Feature - A spatial feature with properties
 */
export interface GeoJSONFeature {
  type: 'Feature';
  id?: string;
  geometry: GeoJSONGeometry;
  properties: Record<string, any>;
  bbox?: [number, number, number, number];
}

/**
 * GeoJSON FeatureCollection - Collection of features
 */
export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
  bbox?: [number, number, number, number];
}

// ============================================================================
// 6.2 GPS & Location Tracking
// ============================================================================

/**
 * GPS Location - Device location data
 */
export interface GPSLocation {
  id: string;
  userId: string;
  
  // Coordinates
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number; // in meters
  altitudeAccuracy?: number; // in meters
  
  // Movement
  heading?: number; // degrees from true north
  speed?: number; // meters per second
  
  // Timestamps
  timestamp: Date;
  receivedAt: Date;
  
  // Source
  source: 'gps' | 'wifi' | 'cell' | 'ip' | 'manual';
  isBackground: boolean;
  
  // Metadata
  batteryLevel?: number; // 0-100
  deviceId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GPS Tracking Configuration - Settings for location tracking
 */
export interface GPSTrackingConfiguration {
  id: string;
  userId: string;
  
  // Tracking Modes
  accuracyMode: 'high' | 'balanced' | 'low-power' | 'manual';
  trackingEnabled: boolean;
  backgroundTracking: boolean;
  
  // Update Intervals
  updateInterval: number; // milliseconds
  minimumUpdateInterval: number; // milliseconds
  maximumAge: number; // milliseconds
  
  // Geofencing
  geofencingEnabled: boolean;
  significantLocationChange: boolean;
  
  // Privacy
  shareLocation: boolean;
  anonymizeLocation: boolean;
  retentionDays: number;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Location History - Historical location data
 */
export interface LocationHistory {
  id: string;
  userId: string;
  locationId: string;
  
  // Location data (denormalized for performance)
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
  
  // Context
  activity?: 'stationary' | 'walking' | 'running' | 'driving' | 'cycling';
  regionId?: string;
  geofenceIds: string[];
  
  createdAt: Date;
}

// ============================================================================
// 6.3 Map Configuration & Base Layers
// ============================================================================

/**
 * Map Configuration - Map rendering settings
 */
export interface MapConfiguration {
  id: string;
  userId: string;
  
  // Base Layer
  baseLayer: 'vector-streets' | 'satellite' | 'hybrid' | 'dark' | 'custom';
  customLayerUrl?: string;
  
  // Display Settings
  showLabels: boolean;
  showBuildings: boolean;
  showTerrain: boolean;
  showTraffic: boolean;
  showTransit: boolean;
  
  // Interaction Settings
  zoomLevel: number;
  minZoom: number;
  maxZoom: number;
  pitch: number; // degrees
  bearing: number; // degrees
  
  // Center Position
  centerLatitude: number;
  centerLongitude: number;
  
  // Satellite Provider
  satelliteProvider: 'maptiler' | 'mapbox' | 'custom';
  satelliteApiKey?: string;
  
  // Performance
  cacheTiles: boolean;
  maxCacheSize: number; // in MB
  preferVectorTiles: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Map Layer - Custom map layer configuration
 */
export interface MapLayer {
  id: string;
  name: string;
  description?: string;
  
  // Layer Configuration
  layerType: 'vector' | 'raster' | 'geojson' | 'heatmap' | 'cluster';
  sourceUrl?: string;
  sourceType: 'tile' | 'geojson' | 'vector' | 'image';
  
  // Styling
  style: Record<string, any>; // MapLibre style specification
  opacity: number; // 0-1
  visible: boolean;
  zIndex: number;
  
  // Filtering
  filter?: any;
  minZoom?: number;
  maxZoom?: number;
  
  // Metadata
  isDefault: boolean;
  isSystem: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 6.4 Spatial Features (Pins, Shapes, etc.)
// ============================================================================

/**
 * Map Pin - A point feature on the map
 */
export interface MapPin {
  id: string;
  userId: string;
  
  // Geometry
  latitude: number;
  longitude: number;
  geometry: GeoJSONGeometry; // Point geometry
  
  // Properties
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  
  // Categorization
  category: string;
  tags: string[];
  
  // Cross-domain links
  linkedProjects: string[];
  linkedTasks: string[];
  linkedNotes: string[];
  linkedFiles: string[];
  linkedContacts: string[];
  linkedCompanies: string[];
  
  // Status
  isPinned: boolean;
  isHidden: boolean;
  isShared: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastViewed: Date;
  viewCount: number;
}

/**
 * Map Shape - Line or polygon feature
 */
export interface MapShape {
  id: string;
  userId: string;
  
  // Geometry
  geometry: GeoJSONGeometry; // LineString or Polygon
  geometryType: 'LineString' | 'Polygon' | 'Circle';
  
  // Properties
  name: string;
  description?: string;
  strokeColor: string;
  fillColor?: string;
  strokeWidth: number;
  opacity: number;
  
  // Measurements
  length?: number; // in meters for lines
  area?: number; // in square meters for polygons
  radius?: number; // in meters for circles
  
  // Categorization
  category: string;
  tags: string[];
  
  // Cross-domain links
  linkedProjects: string[];
  linkedRoutes: string[];
  linkedAreas: string[];
  
  // Status
  isVisible: boolean;
  isLocked: boolean;
  isShared: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastEdited: Date;
  editCount: number;
}

/**
 * Map Cluster - Cluster of nearby features
 */
export interface MapCluster {
  id: string;
  
  // Cluster Properties
  clusterId: number;
  pointCount: number;
  pointCountAbbreviated: string;
  
  // Geometry
  latitude: number;
  longitude: number;
  geometry: GeoJSONGeometry; // Point geometry
  
  // Child Features
  featureIds: string[];
  featureTypes: string[]; // 'pin', 'shape', etc.
  
  // Aggregated Properties
  categories: string[];
  tags: string[];
  
  // Bounding Box
  bbox: [number, number, number, number];
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 6.5 Geofencing
// ============================================================================

/**
 * Geofence - A geographic boundary for triggering events
 */
export interface Geofence {
  id: string;
  userId: string;
  name: string;
  description?: string;
  
  // Geometry
  geometry: GeoJSONGeometry; // Polygon or Point with radius
  geometryType: 'circle' | 'polygon';
  
  // Circle-specific properties
  centerLatitude?: number;
  centerLongitude?: number;
  radius?: number; // in meters
  
  // Triggers
  triggers: GeofenceTrigger[];
  isActive: boolean;
  
  // Notifications
  notifyOnEnter: boolean;
  notifyOnExit: boolean;
  notifyOnDwell: boolean;
  dwellTime?: number; // in seconds
  
  // Automation
  automationId?: string;
  automationActions: string[];
  
  // Statistics
  enterCount: number;
  exitCount: number;
  dwellCount: number;
  lastTriggered?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * Geofence Trigger - A specific trigger event
 */
export interface GeofenceTrigger {
  id: string;
  geofenceId: string;
  userId: string;
  
  // Trigger Details
  triggerType: 'enter' | 'exit' | 'dwell';
  triggerTime: Date;
  
  // Location at trigger
  latitude: number;
  longitude: number;
  accuracy?: number;
  
  // Context
  deviceId?: string;
  batteryLevel?: number;
  activity?: string;
  
  // Processing
  isProcessed: boolean;
  processedAt?: Date;
  actionTaken?: string;
  
  createdAt: Date;
}

// ============================================================================
// 6.6 Routes & Navigation
// ============================================================================

/**
 * Map Route - A navigation route between points
 */
export interface MapRoute {
  id: string;
  userId: string;
  name: string;
  description?: string;
  
  // Geometry
  geometry: GeoJSONGeometry; // LineString geometry
  waypoints: Array<{
    latitude: number;
    longitude: number;
    order: number;
    name?: string;
  }>;
  
  // Route Properties
  distance: number; // in meters
  duration: number; // in seconds
  travelMode: 'driving' | 'walking' | 'cycling' | 'transit';
  
  // Instructions
  instructions: Array<{
    text: string;
    distance: number;
    duration: number;
    maneuver?: string;
  }>;
  
  // Status
  isFavorite: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  
  // Statistics
  travelCount: number;
  averageDuration: number;
  bestDuration?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * Navigation Session - Active navigation session
 */
export interface NavigationSession {
  id: string;
  userId: string;
  routeId?: string;
  
  // Start/End
  startLatitude: number;
  startLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  startedAt: Date;
  endedAt?: Date;
  
  // Progress
  currentLatitude?: number;
  currentLongitude?: number;
  progress: number; // 0-100
  remainingDistance?: number;
  remainingDuration?: number;
  
  // Status
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'off-route';
  currentInstruction?: string;
  nextInstruction?: string;
  
  // Statistics
  totalDistance: number;
  totalDuration: number;
  averageSpeed?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 6.7 Spatial Search & Indexing
// ============================================================================

/**
 * Spatial Index - Index for spatial search
 */
export interface SpatialIndex {
  id: string;
  featureId: string;
  featureType: 'pin' | 'shape' | 'geofence' | 'route';
  
  // Spatial Indexing
  latitude: number;
  longitude: number;
  bbox: [number, number, number, number]; // [west, south, east, north]
  
  // Text Search
  searchText: string;
  tags: string[];
  categories: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Spatial Search Query - Search query for spatial features
 */
export interface SpatialSearchQuery {
  id: string;
  userId: string;
  
  // Spatial Filter
  bbox?: [number, number, number, number];
  centerLatitude?: number;
  centerLongitude?: number;
  radius?: number; // in meters
  
  // Text Filter
  queryText?: string;
  tags?: string[];
  categories?: string[];
  featureTypes?: string[];
  
  // Date Filter
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
  
  // Pagination
  limit: number;
  offset: number;
  
  // Results
  resultCount?: number;
  executionTime?: number;
  
  createdAt: Date;
}

// ============================================================================
// 6.8 Map Events & Activity
// ============================================================================

/**
 * Map Event - Spatial action event
 */
export interface MapEvent {
  id: string;
  userId: string;
  
  // Event Details
  eventType: 'location_updated' | 'pin_created' | 'pin_updated' | 'pin_deleted' | 
             'shape_created' | 'shape_updated' | 'shape_deleted' | 'geofence_triggered' |
             'route_created' | 'route_completed' | 'navigation_started' | 'navigation_ended';
  
  // Target Entity
  entityType: 'pin' | 'shape' | 'geofence' | 'route' | 'location' | 'navigation';
  entityId?: string;
  
  // Location Context
  latitude?: number;
  longitude?: number;
  
  // Event Data
  data: Record<string, any>;
  
  // Timestamps
  eventTime: Date;
  receivedAt: Date;
  
  // Processing
  isProcessed: boolean;
  processedAt?: Date;
  
  createdAt: Date;
}

// ============================================================================
// 6.9 Default Configurations
// ============================================================================

/**
 * Default GPS tracking configurations
 */
export const DEFAULT_GPS_TRACKING_CONFIGURATIONS: GPSTrackingConfiguration[] = [
  {
    id: uuidv4(),
    userId: 'system',
    accuracyMode: 'balanced',
    trackingEnabled: true,
    backgroundTracking: false,
    updateInterval: 30000, // 30 seconds
    minimumUpdateInterval: 10000, // 10 seconds
    maximumAge: 60000, // 1 minute
    geofencingEnabled: true,
    significantLocationChange: true,
    shareLocation: false,
    anonymizeLocation: true,
    retentionDays: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Default map configurations
 */
export const DEFAULT_MAP_CONFIGURATIONS: MapConfiguration[] = [
  {
    id: uuidv4(),
    userId: 'system',
    baseLayer: 'vector-streets',
    showLabels: true,
    showBuildings: true,
    showTerrain: false,
    showTraffic: false,
    showTransit: false,
    zoomLevel: 12,
    minZoom: 0,
    maxZoom: 22,
    pitch: 0,
    bearing: 0,
    centerLatitude: 51.5074, // London
    centerLongitude: -0.1278,
    satelliteProvider: 'maptiler',
    cacheTiles: true,
    maxCacheSize: 500, // 500MB
    preferVectorTiles: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Default map layers
 */
export const DEFAULT_MAP_LAYERS: MapLayer[] = [
  {
    id: uuidv4(),
    name: 'Vector Streets',
    description: 'Default vector street map',
    layerType: 'vector',
    sourceType: 'vector',
    style: {},
    opacity: 1,
    visible: true,
    zIndex: 0,
    isDefault: true,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Satellite',
    description: 'Satellite imagery',
    layerType: 'raster',
    sourceType: 'tile',
    style: {},
    opacity: 1,
    visible: false,
    zIndex: 1,
    isDefault: false,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Labels',
    description: 'Map labels and annotations',
    layerType: 'vector',
    sourceType: 'vector',
    style: {},
    opacity: 1,
    visible: true,
    zIndex: 2,
    isDefault: true,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================================================
// 6.10 Helper Functions
// ============================================================================

/**
 * Create a GeoJSON Point geometry
 */
export function createPointGeometry(latitude: number, longitude: number): GeoJSONGeometry {
  return {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
}

/**
 * Create a GeoJSON LineString geometry
 */
export function createLineStringGeometry(coordinates: Array<[number, number]>): GeoJSONGeometry {
  return {
    type: 'LineString',
    coordinates: coordinates.map(([lat, lng]) => [lng, lat]),
  };
}

/**
 * Create a GeoJSON Polygon geometry
 */
export function createPolygonGeometry(rings: Array<Array<[number, number]>>): GeoJSONGeometry {
  return {
    type: 'Polygon',
    coordinates: rings.map(ring => ring.map(([lat, lng]) => [lng, lat])),
  };
}

/**
 * Create a GeoJSON Circle geometry (approximated as a polygon)
 */
export function createCircleGeometry(
  centerLatitude: number,
  centerLongitude: number,
  radius: number, // in meters
  segments: number = 32
): GeoJSONGeometry {
  const coordinates: Array<[number, number]> = [];
  const earthRadius = 6378137; // Earth's radius in meters
  const lat = (centerLatitude * Math.PI) / 180;
  const lng = (centerLongitude * Math.PI) / 180;
  const angularDistance = radius / earthRadius;

  for (let i = 0; i < segments; i++) {
    const angle = (i * 2 * Math.PI) / segments;
    const lat2 = Math.asin(
      Math.sin(lat) * Math.cos(angularDistance) +
      Math.cos(lat) * Math.sin(angularDistance) * Math.cos(angle)
    );
    const lng2 = lng + Math.atan2(
      Math.sin(angle) * Math.sin(angularDistance) * Math.cos(lat),
      Math.cos(angularDistance) - Math.sin(lat) * Math.sin(lat2)
    );
    
    coordinates.push([
      (lat2 * 180) / Math.PI,
      (lng2 * 180) / Math.PI,
    ]);
  }

  // Close the polygon
  coordinates.push(coordinates[0]);

  return createPolygonGeometry([coordinates]);
}

/**
 * Create a new map pin
 */
export function createMapPin(
  userId: string,
  title: string,
  latitude: number,
  longitude: number,
  createdBy: string
): MapPin {
  return {
    id: uuidv4(),
    userId,
    title,
    latitude,
    longitude,
    geometry: createPointGeometry(latitude, longitude),
    category: 'general',
    tags: [],
    linkedProjects: [],
    linkedTasks: [],
    linkedNotes: [],
    linkedFiles: [],
    linkedContacts: [],
    linkedCompanies: [],
    isPinned: false,
    isHidden: false,
    isShared: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy,
    lastViewed: new Date(),
    viewCount: 0,
  };
}

/**
 * Create a new map shape
 */
export function createMapShape(
  userId: string,
  name: string,
  geometryType: 'LineString' | 'Polygon' | 'Circle',
  coordinates: Array<[number, number]> | Array<Array<[number, number]>> | [number, number, number],
  createdBy: string
): MapShape {
  let geometry: GeoJSONGeometry;
  
  if (geometryType === 'LineString') {
    geometry = createLineStringGeometry(coordinates as Array<[number, number]>);
  } else if (geometryType === 'Polygon') {
    geometry = createPolygonGeometry(coordinates as Array<Array<[number, number]>>);
  } else {
    // Circle - coordinates should be [centerLat, centerLng, radius]
    const circleParams = coordinates as [number, number, number];
    geometry = createCircleGeometry(circleParams[0], circleParams[1], circleParams[2]);
  }

  return {
    id: uuidv4(),
    userId,
    name,
    geometry,
    geometryType,
    strokeColor: '#3b82f6',
    strokeWidth: 2,
    opacity: 0.7,
    category: 'general',
    tags: [],
    linkedProjects: [],
    linkedRoutes: [],
    linkedAreas: [],
    isVisible: true,
    isLocked: false,
    isShared: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy,
    lastEdited: new Date(),
    editCount: 0,
  };
}

/**
 * Create a new geofence
 */
export function createGeofence(
  userId: string,
  name: string,
  geometryType: 'circle' | 'polygon',
  geometry: GeoJSONGeometry,
  createdBy: string
): Geofence {
  let centerLatitude: number | undefined;
  let centerLongitude: number | undefined;
  let radius: number | undefined;

  if (geometryType === 'circle' && geometry.type === 'Polygon') {
    // Extract center from first coordinate of first ring
    const firstCoord = geometry.coordinates[0][0];
    centerLongitude = firstCoord[0];
    centerLatitude = firstCoord[1];
    // Calculate radius from geometry (simplified)
    radius = 100; // Default radius
  }

  return {
    id: uuidv4(),
    userId,
    name,
    geometry,
    geometryType,
    centerLatitude,
    centerLongitude,
    radius,
    triggers: [],
    isActive: true,
    notifyOnEnter: true,
    notifyOnExit: true,
    notifyOnDwell: false,
    automationActions: [],
    enterCount: 0,
    exitCount: 0,
    dwellCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy,
  };
}

/**
 * Create a new map route
 */
export function createMapRoute(
  userId: string,
  name: string,
  waypoints: Array<{latitude: number; longitude: number; order: number; name?: string}>,
  travelMode: 'driving' | 'walking' | 'cycling' | 'transit',
  createdBy: string
): MapRoute {
  const coordinates = waypoints
    .sort((a, b) => a.order - b.order)
    .map(wp => [wp.latitude, wp.longitude] as [number, number]);

  return {
    id: uuidv4(),
    userId,
    name,
    geometry: createLineStringGeometry(coordinates),
    waypoints,
    distance: 0,
    duration: 0,
    travelMode,
    instructions: [],
    isFavorite: false,
    isCompleted: false,
    travelCount: 0,
    averageDuration: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy,
  };
}

/**
 * Create a new GPS location
 */
export function createGPSLocation(
  userId: string,
  latitude: number,
  longitude: number,
  source: 'gps' | 'wifi' | 'cell' | 'ip' | 'manual'
): GPSLocation {
  return {
    id: uuidv4(),
    userId,
    latitude,
    longitude,
    timestamp: new Date(),
    receivedAt: new Date(),
    source,
    isBackground: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new map event
 */
export function createMapEvent(
  userId: string,
  eventType: MapEvent['eventType'],
  entityType: MapEvent['entityType'],
  entityId?: string,
  latitude?: number,
  longitude?: number,
  data: Record<string, any> = {}
): MapEvent {
  return {
    id: uuidv4(),
    userId,
    eventType,
    entityType,
    entityId,
    latitude,
    longitude,
    data,
    eventTime: new Date(),
    receivedAt: new Date(),
    isProcessed: false,
    createdAt: new Date(),
  };
}

/**
 * Calculate distance between two points in meters (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Check if a point is inside a polygon
 */
export function isPointInPolygon(
  point: [number, number], // [latitude, longitude]
  polygon: Array<[number, number]> // Array of [latitude, longitude]
): boolean {
  const [lat, lng] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];
    
    const intersect = ((lngI > lng) !== (lngJ > lng)) &&
      (lat < (latJ - latI) * (lng - lngI) / (lngJ - lngI) + latI);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Check if a point is inside a circle
 */
export function isPointInCircle(
  point: [number, number], // [latitude, longitude]
  center: [number, number], // [latitude, longitude]
  radius: number // in meters
): boolean {
  const distance = calculateDistance(point[0], point[1], center[0], center[1]);
  return distance <= radius;
}

/**
 * Get bounding box from a set of coordinates
 */
export function getBoundingBox(coordinates: Array<[number, number]>): [number, number, number, number] {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lat, lng] of coordinates) {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  }

  return [minLng, minLat, maxLng, maxLat];
}
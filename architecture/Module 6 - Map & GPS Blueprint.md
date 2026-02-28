---

# **MODULE 6 — MAP & GPS BLUEPRINT (UPDATED)**

## **6.1 Purpose**

The Map & GPS Blueprint defines how the system handles device location, geospatial rendering, satellite imagery, geofencing, and spatial context. It provides the foundation for the Map domain (Module 16) and ensures consistent behaviour across offline, sync, permissions, and AI context systems.

---

## **6.2 Core Principles**

- MapLibre GL JS is the map renderer.
- GeoJSON is the canonical format for all geometry.
- GPS data is optional but enhances context.
- Satellite imagery is provided by MapTiler Satellite.
- All geometry is editable and local‑first.
- All spatial actions emit events.
- All spatial data participates in search and AI context.

---

## **6.3 Rendering Engine**

The system uses **MapLibre GL JS** for all map rendering.

Key capabilities:

- vector tile rendering
- raster tile rendering
- satellite imagery
- custom layers
- clustering
- high‑performance WebGL rendering
- offline tile caching (optional)

The renderer is independent of any vendor lock‑in.

---

## **6.4 Base Layers**

The map supports multiple base layers:

- **Vector Streets** (default)
- **Satellite** (MapTiler Satellite)
- **Hybrid** (satellite + labels)
- **Dark Mode**
- **Custom Layers** (optional)

### **Satellite Provider**

The default satellite provider is **MapTiler Satellite**.

Raster tile configuration:

```json
{
  "type": "raster",
  "tiles": [
    "https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=YOUR_KEY"
  ],
  "tileSize": 256
}
```

Providers can be swapped by updating the tile source configuration.

---

## **6.5 GPS Integration**

The system supports device location through the browser or native APIs.

Capabilities:

- current location
- continuous tracking
- heading
- speed (if available)
- accuracy radius
- background location (optional)

GPS data is treated as **context**, not a requirement.

### **Accuracy Modes**

- High accuracy (GPS + WiFi + cell)
- Balanced (WiFi + cell)
- Low power (cell only)
- Manual (no tracking)

---

## **6.6 Geofencing**

Geofences are defined as **circles or polygons**.

Capabilities:

- enter
- exit
- dwell
- region updates
- automation triggers

Geofences are stored as GeoJSON and behave like any other geometry.

---

## **6.7 Editable Geometry**

The Map system supports full editing of spatial features.

Supported types:

- Point
- LineString
- Polygon
- Circle (polygon approximation)

Editing tools:

- Add Pin
- Draw Line
- Draw Polygon
- Draw Circle
- Edit Vertices
- Move Feature
- Delete Feature

All editing is local‑first and syncs automatically.

---

## **6.8 Local‑First Behaviour**

Spatial data is stored locally and syncs via the Sync Engine (Module 23).

Local‑first guarantees:

- offline editing
- queued sync
- conflict resolution
- field‑level merges
- version history

Satellite tiles may be cached for offline use.

---

## **6.9 Event Stream Integration**

All spatial actions emit events into the Event Stream (Module 21):

- location_updated
- pin_created
- pin_updated
- pin_deleted
- shape_created
- shape_updated
- shape_deleted
- geofence_triggered

Events appear in Timeline and Activity.

---

## **6.10 Search & Indexing Integration**

Search indexes:

- geometry metadata
- coordinates
- tags
- linked items
- region names
- descriptions

Semantic search supports:

- “locations near X”
- “areas related to onboarding”
- “routes with photos”

---

## **6.11 AI Context Integration**

Oscar receives:

- current device location
- visible region
- selected geometry
- visible features
- geofence states
- recent edits

Oscar can:

- summarise regions
- propose tags
- detect clusters
- link geometry to projects
- extract tasks from descriptions
- propose automations

---

## **6.12 Permissions**

Permissions follow Module 19.

GPS permissions:

- request location
- track location
- use background location

Map permissions:

- view map
- create geometry
- edit geometry
- delete geometry
- manage geofences

---

## **6.13 Security**

- GPS data is never shared without explicit permission.
- Geometry inherits domain permissions.
- Sensitive metadata is hidden for restricted users.
- Satellite tiles contain no user data.

---

## **6.14 Interactions with Other Domains**

- Files: attach files to pins or shapes
- Projects: link geometry to tasks or milestones
- Connect: show contacts or companies on the map
- Timeline: show spatial events
- Automations: trigger based on geofences or geometry edits

---

## **6.15 Summary**

The Map & GPS Blueprint defines a complete, editable, local‑first geospatial system built on MapLibre GL JS, MapTiler Satellite, GeoJSON, and the Sync/Event/AI Context engines. It ensures consistent behaviour across all domains and supports advanced features like drawing tools, geofencing, offline editing, and spatial automations.

---
---

# **MODULE 16 — MAP (UPDATED)**

## **16.1 Purpose**

The Map domain provides a fully interactive, local‑first geospatial workspace for pins, shapes, routes, regions, and geofences. It integrates with all other domains, supports offline editing, and feeds the AI Context Engine with spatial awareness.

---

## **16.2 Core Principles**

- MapLibre GL JS is the renderer.
- GeoJSON is the canonical data format.
- All geometry is editable.
- All geometry syncs via the Sync Engine.
- All geometry emits events into the Event Stream.
- All geometry is indexed for search.
- All geometry respects permissions.
- All geometry is visible to Oscar for context.

---

## **16.3 Map Layers**

The map supports multiple base layers:

- **Vector Streets Layer** (default)
- **Satellite Layer** (MapTiler Satellite)
- **Hybrid Layer** (satellite + labels)
- **Dark Mode Layer**
- **Custom Layers** (optional)

### **Satellite Layer Provider**

The system uses **MapTiler Satellite** as the default raster tile provider for satellite and hybrid layers. Tiles are loaded via MapLibre GL JS using the standard raster tile configuration:

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

## **16.4 Geometry Types**

The Map domain supports the following GeoJSON feature types:

- **Point** — pins, markers, locations.
- **LineString** — routes, paths, boundaries.
- **Polygon** — areas, regions, zones.
- **Circle** — geofences (stored as polygon approximations).

Each feature includes:

- id
- type
- geometry
- properties (title, description, tags, linked items, timestamps, permissions)

---

## **16.5 Editable Geometry & Drawing Tools**

Users can create, modify, and delete geometry directly on the map. All editing is local‑first and syncs automatically.

### **Drawing Tools**

- Add Pin
- Draw Line
- Draw Polygon
- Draw Circle
- Edit Vertices (drag to adjust shape)
- Move Feature
- Delete Feature

### **Editing Behaviour**

- Edits occur locally first.
- Sync Engine merges changes (Module 23).
- Event Stream logs all edits (Module 21).
- Search indexes metadata + geometry (Module 22).
- Oscar receives context for selected geometry, visible geometry, and region summaries (Module 24).

### **Geofencing**

- Polygons and circles can act as geofences.
- Automations can trigger on:
    - enter
    - exit
    - dwell
    - update

(Defined in Module 20.)

---

## **16.6 Linking Geometry to Other Domains**

Any map feature can link to:

- Files
- Projects
- Tasks
- Pages
- Contacts
- Campaigns

Links appear in both directions (Map → Domain, Domain → Map).

---

## **16.7 Metadata Panel**

Selecting a feature opens a detail panel with:

- title
- description
- tags
- linked items
- created/updated timestamps
- edit history
- permissions
- AI actions

Oscar can summarise, rewrite, extract tasks, or propose tags.

---

## **16.8 Filters & Layers**

Users can filter by:

- tags
- type (pin, line, polygon, circle)
- linked items
- date
- creator
- permissions

Layers can be toggled on/off.

---

## **16.9 Offline Behaviour**

- Geometry is stored locally.
- Editing works offline.
- Sync Engine queues updates.
- Satellite tiles may be cached (optional).
- Permissions are enforced locally.

---

## **16.10 Permissions**

Map domain permissions follow Module 19:

- View Map
- Create Geometry
- Edit Geometry
- Delete Geometry
- Manage Layers
- Manage Geofences

Permissions apply per‑feature when needed.

---

## **16.11 Event Stream Integration**

Every geometry action emits events:

- pin_created
- pin_updated
- pin_deleted
- shape_created
- shape_updated
- shape_deleted
- geofence_triggered

Events appear in Timeline and Activity.

---

## **16.12 Search & Indexing Integration**

Search indexes:

- titles
- descriptions
- tags
- coordinates
- geometry type
- linked items

Semantic search supports:

- “areas near the office”
- “routes related to onboarding”
- “pins with photos”

---

## **16.13 AI Context Integration**

Oscar receives:

- selected feature
- visible region
- visible features
- geometry type
- metadata
- linked items
- recent edits

Oscar can:

- summarise regions
- propose tags
- detect clusters
- link features to projects
- extract tasks from descriptions
- propose automations

---

## **16.14 Sync Engine Integration**

Sync Engine (Module 23) handles:

- local‑first edits
- queued updates
- conflict resolution
- field‑level merges
- version history

Geometry is lightweight and syncs efficiently.

---

## **16.15 Automations Integration**

Automations (Module 20) can trigger on:

- geometry created
- geometry updated
- geometry deleted
- geofence enter/exit
- region changes

Actions include:

- create tasks
- send notifications
- tag items
- update metadata
- call webhooks

---

## **16.16 Security**

- Geometry inherits domain permissions.
- Sensitive metadata is hidden for restricted users.
- Geofences cannot expose private locations without permission.
- Satellite tiles are external but do not contain user data.

---
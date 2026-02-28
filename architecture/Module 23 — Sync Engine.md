---

# **MODULE 23 — SYNC ENGINE**

## **23.1 Purpose**

The Sync Engine ensures that:

- local‑first data stays consistent with Supabase
- offline edits sync cleanly when online
- conflicts resolve predictably
- events propagate across modules
- automations run at the right time
- search indexes stay fresh
- permissions stay enforced
- the UI never blocks on network latency

It is the system’s **consistency layer**.

---

## **23.2 Architecture**

Three coordinated layers:

### **Local Sync Layer (Primary)**

- local write‑ahead log
- local change journal
- local conflict detector
- offline queue
- local event bus
- local index updater

### **Cloud Sync Layer (Supabase)**

- canonical database
- RLS enforcement
- storage sync
- event stream
- automation triggers
- integration sync
- version history

### **Merge Layer**

- conflict resolution
- CRDT‑style merging for text
- last‑writer‑wins for metadata
- domain‑specific merge rules
- audit logging

This ensures correctness without blocking the UI.

---

## **23.3 What Syncs**

Everything that can change:

### **Workspace**

- pages
- blocks
- markdown
- backlinks
- tags

### **Files**

- metadata
- tags
- versions
- extracted text
- thumbnails (metadata only)

### **Projects**

- tasks
- statuses
- comments
- timelines

### **Connect**

- emails (metadata + cached bodies)
- drafts
- campaigns
- contacts

### **Map**

- pins
- coordinates
- metadata

### **Identity**

- profile
- preferences
- AI settings
- PIN hash (server copy only)

### **Automations**

- definitions
- logs
- schedules

### **Event Stream**

- events
- logs
- notifications

### **Search**

- index deltas
- metadata
- embeddings (optional)

---

## **23.4 Local‑First Write Model**

All writes go to the **local database first**, then sync to Supabase.

This gives:

- instant UI
- offline editing
- no spinner delays
- no blocking
- no “saving…” indicators

The local write‑ahead log ensures durability.

---

## **23.5 Offline Queue**

When offline:

- writes go to the queue
- events fire locally
- automations run locally
- search index updates locally
- UI stays fully functional

When online:

- queue flushes
- Supabase updates
- conflicts resolved
- event stream updates
- automations catch up

---

## **23.6 Conflict Resolution**

Different domains use different merge strategies:

### **Workspace (pages/blocks)**

- CRDT‑style merging
- block‑level diff
- no overwrites
- conflict markers only when necessary

### **Files**

- metadata: last‑writer‑wins
- versions: append only
- tags: merged sets

### **Projects**

- tasks: field‑level merge
- comments: append only
- statuses: last‑writer‑wins

### **Connect**

- drafts: last‑writer‑wins
- emails: immutable
- campaigns: field‑level merge

### **Map**

- pins: field‑level merge
- coordinates: last‑writer‑wins

### **Identity**

- preferences: last‑writer‑wins
- PIN hash: server‑authoritative

### **Automations**

- definitions: last‑writer‑wins
- logs: append only

### **Event Stream**

- append only

Conflicts are rare and handled gracefully.

---

## **23.7 Sync Triggers**

Sync runs when:

- local write occurs
- network reconnects
- tab regains focus
- user switches domains
- automation runs
- event stream updates
- integration fires webhook
- scheduled sync interval hits

Sync is incremental and efficient.

---

## **23.8 Permissions Enforcement**

Permissions from Module 19 apply at all layers:

### **Local**

- cached permissions determine UI visibility
- local writes allowed only if cached permissions allow

### **Cloud**

- Supabase RLS enforces true permissions
- invalid writes rejected
- local cache corrected

This prevents privilege escalation.

---

## **23.9 Event Stream Integration**

Sync emits events into Module 21:

- local writes → local events
- cloud writes → cloud events
- merges → merge events
- conflicts → conflict events
- automation runs → automation events

Timeline and Activity update instantly.

---

## **23.10 Search Integration**

Sync updates the search index:

- new items indexed
- updated items reindexed
- deleted items removed
- metadata updated
- embeddings refreshed (local or cloud)

Search stays instant and accurate.

---

## **23.11 Automations Integration**

Sync triggers automations:

- local events → local automations
- cloud events → cloud automations
- schedule events → cloud automations
- integration events → cloud automations

Automations never double‑fire.

---

## **23.12 Smart Eviction**

Sync cooperates with Module 17’s eviction rules:

- evicted items marked “stale”
- rehydrated on demand
- search index pruned
- old events pruned
- old logs pruned

Local storage stays lean.

---

## **23.13 Sync Status UI**

A small indicator shows:

- syncing
- offline
- conflict
- error
- up to date

Clicking opens a panel with:

- recent syncs
- queued items
- conflicts
- errors
- logs

---

## **23.14 ?‑Markers**

Sync UI includes ?‑markers for:

- conflict resolution
- offline mode
- queue
- errors
- permissions
- event propagation

Help Peek explains:

- what happened
- why
- how to fix it

Oscar receives full context.

---

## **23.15 Settings Peek (Sync Settings)**

Includes:

- sync frequency
- offline mode rules
- conflict rules
- retention rules
- eviction rules
- integration sync rules
- automation sync rules

Each row includes label, input, ?‑marker, status.

---

## **23.16 AI Context Model**

Oscar uses sync data to:

- detect stale items
- detect conflicts
- summarise sync issues
- propose fixes
- explain merges
- detect patterns
- propose automations

Oscar becomes the “sync assistant.”

---

## **23.17 Cross‑Module Integration**

Sync powers:

- Filesystem
- Workspace
- Projects
- Connect
- Map
- Identity
- Automations
- Event Stream
- Search
- Dashboard

It is the system’s **consistency engine**.

---

## **23.18 Security Guarantees**

- local writes sandboxed
- Supabase RLS enforced
- vault secrets never synced locally
- PIN hash never synced locally (only cached)
- biometric flags local only
- offline writes validated on reconnect

The system stays secure even offline.

---
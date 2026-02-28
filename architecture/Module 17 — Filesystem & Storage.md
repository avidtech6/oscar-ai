---

# **MODULE 17 — FILESYSTEM & STORAGE (FULLY REWRITTEN)**

## **17.1 Purpose**

Filesystem & Storage is the system’s **local‑first content backbone**, responsible for:

- storing files
- caching metadata and previews
- syncing with Supabase Storage
- managing versions
- handling uploads and imports
- providing vault storage for secrets
- supporting offline access
- intelligently evicting stale data to save space

The browser/device holds a **working copy**, while Supabase is the **sync partner**.

---

## **17.2 Architecture**

The Filesystem uses a **dual‑layer model**:

### **Local Layer (Primary)**

- IndexedDB / SQLite (via WASM)
- full metadata cache
- thumbnails
- small previews
- recent file contents
- local edits
- unsynced changes
- local search index

### **Cloud Layer (Supabase)**

- canonical file storage
- large files
- version history
- vault secrets
- permissions
- team access

The UI always reads from the **local layer first**, then syncs in the background.

---

## **17.3 Smart Eviction**

To prevent the browser from filling up:

### **Eviction triggers**

- cache exceeds size threshold
- device is low on storage
- file hasn’t been opened in X days
- domain‑specific rules

### **Eviction targets**

- old thumbnails
- old previews
- old file metadata
- old project attachments
- old Connect attachments
- old map previews
- old AI summaries

### **Never evicted**

- session token
- PIN hash
- biometric flag
- user profile
- preferences
- AI settings
- unsynced edits
- active workspace pages

Evicted items are rehydrated from Supabase when needed.

---

## **17.4 Views**

- Grid
- List
- Gallery
- Timeline
- Map (for geo‑tagged files)
- Project view
- Connect view

All views operate on the local cache.

---

## **17.5 File Types**

- documents
- images
- videos
- audio
- spreadsheets
- presentations
- archives
- code files
- design files
- geo‑tagged files
- system assets

Each file is a card with identity + metadata.

---

## **17.6 Metadata**

Stored locally and synced:

- file type
- size
- created/modified
- tags
- linked items
- associated project
- associated campaign
- location
- version history
- permissions

---

## **17.7 Actions**

- rename
- move
- duplicate
- download
- share
- link to project
- link to Connect
- link to Workspace
- view on map
- summarise
- extract text
- extract tasks
- delete

Actions operate on the local cache and sync later.

---

## **17.8 Preview/Editor**

Supports:

- inline text preview
- image viewer
- video player
- audio player
- PDF viewer
- code viewer
- markdown preview
- gallery mode

Modes: collapsed, normal, full‑page, full‑screen.

---

## **17.9 Versioning**

- automatic versions
- manual snapshots
- diff view for text
- restore previous version
- version metadata

Version history is stored in Supabase; recent versions cached locally.

---

## **17.10 Storage Management**

- total usage
- per‑domain usage
- large file detection
- duplicate detection
- archive mode
- vault for secrets

Vault secrets are encrypted and stored in Supabase.

---

## **17.11 Upload & Import**

Supports:

- drag‑and‑drop
- multi‑file upload
- folder upload
- imports from integrations
- imports from Inbox Peek

Uploads sync immediately; metadata cached locally.

---

## **17.12 ?‑Markers**

Every preview supports ?‑markers for:

- metadata
- version history
- linked items
- file actions
- preview controls

Opens Help Peek with context‑aware guidance.

---

## **17.13 Settings Peek (Filesystem Settings)**

Includes:

- default view
- sorting rules
- versioning rules
- duplicate detection
- storage alerts
- vault settings
- integration settings

---

## **17.14 Inbox Peek + Share‑to‑Oscar**

If a file relates to an integration:

- Inbox Peek filters emails
- “Share to Oscar” extracts keys, tokens, DNS records
- Settings auto‑fill

---

## **17.15 AI Context Model**

Oscar always knows:

- which file
- which preview mode
- which metadata is visible
- which version is active
- which Peek is open

Oscar can:

- summarise
- extract text
- extract tasks
- detect duplicates
- propose tags
- link files
- rewrite filenames

---
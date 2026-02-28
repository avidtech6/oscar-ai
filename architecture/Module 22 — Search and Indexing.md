---

# **MODULE 22 — SEARCH & INDEXING**

## **22.1 Purpose**

Search & Indexing provides a **unified, local‑first, cross‑domain search engine** that:

- indexes all content across all modules
- works offline
- syncs with Supabase
- respects permissions
- powers semantic + keyword search
- feeds Oscar with structured context
- supports automations and event streams
- enables instant navigation

It is the system’s **knowledge graph + search engine + semantic layer**.

---

## **22.2 Architecture**

Three coordinated layers:

### **Local Index (Primary)**

- full‑text index
- semantic embeddings
- metadata index
- cross‑domain link graph
- offline‑capable
- instant search

Stored in IndexedDB/SQLite.

### **Cloud Index (Supabase)**

- canonical index
- team‑wide search
- cross‑device sync
- heavy semantic processing
- long‑term retention

### **AI Index Layer**

- embeddings
- semantic clusters
- topic detection
- summarisation
- context extraction

Oscar uses this layer to understand the workspace.

---

## **22.3 What Gets Indexed**

Everything the user can see:

### **Workspace**

- page titles
- block text
- markdown
- headings
- tags
- backlinks

### **Files**

- filenames
- metadata
- extracted text
- OCR (if enabled)
- tags
- linked items

### **Projects**

- project names
- task titles
- task descriptions
- comments
- statuses
- tags

### **Connect**

- email subjects
- email bodies
- contacts
- campaign names
- campaign metadata

### **Map**

- pin titles
- pin descriptions
- coordinates
- tags

### **Identity**

- team members
- roles
- integration names

### **Automations**

- automation names
- triggers
- actions

### **Event Stream**

- event summaries
- actor names
- item names

Everything is searchable.

---

## **22.4 Index Structure**

The index is composed of:

- **full‑text index** (fast keyword search)
- **semantic index** (embeddings for meaning‑based search)
- **metadata index** (tags, dates, types)
- **graph index** (links between items)
- **permissions index** (visibility rules)

This allows hybrid search:

- keyword
- semantic
- filtered
- relational
- cross‑domain

---

## **22.5 Search UI**

A single search bar with:

- instant results
- domain filters
- type filters
- date filters
- tag filters
- people filters
- integration filters

Results grouped by:

- Workspace
- Files
- Projects
- Connect
- Map
- Automations
- Events
- People

Each result is a card with:

- title
- snippet
- domain icon
- last modified
- quick actions

---

## **22.6 Semantic Search**

Powered by embeddings:

- “invoice from last month”
- “tasks I forgot about”
- “emails about pricing”
- “pages related to onboarding”
- “files with diagrams”
- “campaigns that underperformed”

Oscar uses semantic search internally to answer questions.

---

## **22.7 Offline Behaviour**

### **When offline**

- full‑text search works
- semantic search works (local embeddings)
- metadata search works
- graph search works
- permissions enforced locally

### **When online**

- cloud index syncs
- team‑wide search expands
- semantic clusters update
- embeddings refresh

---

## **22.8 Smart Eviction**

To avoid storage bloat:

- old embeddings evicted
- old extracted text evicted
- old metadata evicted
- old semantic clusters evicted

Never evicted:

- index for recent items
- index for pinned items
- index for active projects
- index for workspace pages in use

Evicted items rehydrate from Supabase.

---

## **22.9 Permissions**

Search respects Module 19:

- only returns items the user can access
- filters out restricted domains
- hides sensitive metadata
- vault items never indexed
- integration keys never indexed

Supabase RLS enforces cloud search; local index enforces cached permissions.

---

## **22.10 Automations Integration**

Automations use search to:

- find items
- classify items
- detect patterns
- match triggers
- filter conditions

Examples:

- “Find all files tagged ‘invoice’ uploaded this week.”
- “Find tasks due in the next 3 days.”
- “Find emails from this domain.”

Search is the automation engine’s “query language.”

---

## **22.11 Event Stream Integration**

Events update the index:

- file uploaded → index text + metadata
- page updated → reindex blocks
- task completed → update metadata
- email received → index subject + body
- automation run → index logs

Timeline filters use the same index.

---

## **22.12 AI Context Model**

Oscar uses the index to:

- answer questions
- summarise domains
- find related items
- detect duplicates
- propose automations
- generate insights
- cluster topics
- build context windows

The index is Oscar’s “memory substrate.”

---

## **22.13 Settings Peek (Search Settings)**

Includes:

- indexing rules
- semantic search toggle
- OCR toggle
- extraction toggle
- retention rules
- eviction rules
- domain visibility
- integration indexing

Each row includes label, input, ?‑marker, status.

---

## **22.14 ?‑Markers**

Search UI includes ?‑markers for:

- filters
- semantic search
- indexing rules
- permissions
- relevance

Help Peek explains:

- how search works
- why results appear
- how to refine queries
- how permissions affect visibility

---

## **22.15 Cross‑Module Integration**

Search powers:

- Workspace navigation
- File discovery
- Project lookup
- Connect filtering
- Map pin lookup
- Automation builder
- Timeline filtering
- Dashboard insights
- Identity lookup
- Permissions lookup

It is the shared discovery engine for the entire cockpit.

---

## **22.16 Security Guarantees**

- vault secrets never indexed
- PIN never indexed
- biometric flags never indexed
- session tokens never indexed
- RLS enforced in cloud
- local permissions enforced offline

---
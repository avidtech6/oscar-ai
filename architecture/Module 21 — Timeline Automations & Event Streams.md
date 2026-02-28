---

# **MODULE 21 — TIMELINE AUTOMATIONS & EVENT STREAMS**

## **21.1 Purpose**

Timeline & Event Streams is the **real‑time backbone** of the system. It:

- captures events from all modules
- normalises them into a unified event stream
- powers the Timeline UI, Activity, Notifications, and Automations
- feeds the AI Context Engine with “what just happened”
- works with local‑first storage and Supabase sync

It’s how the cockpit *feels alive*.

---

## **21.2 Architecture**

Three layers:

### **Local Event Bus**

- receives events from UI + local DB
- stores recent events locally
- powers Timeline, Activity, and notifications offline
- feeds Automations (Module 20) locally

### **Cloud Event Stream (Supabase)**

- canonical event log
- cross‑device sync
- team‑wide events
- integration events
- automation events
- audit trail

### **AI Event Layer**

- summarises events
- clusters events
- detects patterns
- powers “What changed?” and “Catch me up”

---

## **21.3 Event Model**

Each event has:

- id
- type (created, updated, deleted, moved, shared, etc.)
- domain (Files, Projects, Connect, Map, Identity, Automations, etc.)
- actor (user, automation, integration)
- target (item, project, file, campaign, pin, etc.)
- timestamp
- metadata (diff, status, tags, etc.)
- permissions context

Events are small, structured, and consistent.

---

## **21.4 Event Sources**

Events come from:

- **Workspace:** page/block create/update/delete
- **Files:** upload, move, tag, version, delete
- **Projects:** task create/update/complete/overdue
- **Connect:** email received/sent, campaign launched/finished
- **Map:** pin added/updated
- **Identity:** user joined, role changed, integration connected
- **Automations:** automation run/succeeded/failed
- **Integrations:** webhooks, external events
- **Permissions:** share, revoke, role change

Each module emits events into the local bus, then syncs to Supabase.

---

## **21.5 Timeline UI**

The Timeline is a **time‑ordered view** of events:

- grouped by day
- grouped by domain
- grouped by project
- grouped by person

Each event is a card with:

- actor
- action
- target
- time
- domain icon
- quick actions (open, jump to, undo if possible)
- ?‑marker

Filters:

- by domain
- by project
- by person
- by type
- by integration

---

## **21.6 Activity & Notifications**

Built on top of the same event stream:

### **Activity Feed**

- personalised subset of events
- mentions
- assignments
- comments
- shares
- automation results

### **Notifications**

- in‑app notifications
- optional email notifications
- optional push (later)

Both use permissions from Module 19.

---

## **21.7 Automations Integration (with Module 20)**

Automations subscribe to the event stream:

- triggers fire on events
- conditions inspect event metadata
- actions run in response

Examples:

- “When a task becomes overdue, create a summary and notify me.”
- “When a file is uploaded with ‘invoice’ in the name, extract amount and create a task.”
- “When a campaign finishes, generate a performance summary.”

Local events can trigger local automations offline; cloud events trigger cloud automations.

---

## **21.8 Offline Behaviour**

### **When offline**

- local events still fire
- Timeline shows local events
- Activity updates locally
- local automations run
- notifications still appear

### **When back online**

- local events sync to Supabase
- remote events sync down
- Timeline merges both
- automations catch up if needed

---

## **21.9 Smart Eviction**

To avoid unbounded growth:

- keep recent events locally (e.g., last 30–90 days)
- evict older events from local cache
- keep full history in Supabase
- re‑fetch older ranges on demand when user scrolls back

Pinned/important events can be kept longer.

---

## **21.10 Permissions**

Events respect Module 19:

- you only see events for items you can access
- team events filtered by role
- sensitive events (vault, billing, security) restricted to owner/admin
- automation logs filtered by permissions

Supabase RLS enforces access on the event stream.

---

## **21.11 ?‑Markers**

Timeline and Activity include ?‑markers for:

- event types
- filters
- automation‑related events
- integration events

Help Peek explains:

- what the event means
- what caused it
- how to change or stop it (e.g., edit automation)

---

## **21.12 Settings Peek (Timeline & Events)**

Includes:

- which domains appear in Timeline
- which events generate notifications
- which events are muted
- retention rules (local vs cloud)
- automation visibility in Timeline
- integration event visibility

---

## **21.13 AI Context Model**

Oscar uses the event stream to answer:

- “What changed since I was last here?”
- “What did X do today?”
- “What changed in Project Y this week?”
- “Why did this automation run?”
- “What’s noisy vs important?”

Oscar can:

- summarise events
- cluster related events
- highlight anomalies
- propose new automations based on patterns

---

## **21.14 Cross‑Module Integration**

The event stream powers:

- Timeline
- Activity
- Notifications
- Automations
- Dashboard “recent activity” panels
- Project “activity” tabs
- File “history” views
- Map “recent pins”
- Identity “security events”

It’s the shared backbone for “what’s happening” across the entire system.

---
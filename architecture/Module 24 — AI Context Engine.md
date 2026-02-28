---

# **MODULE 24 — AI CONTEXT ENGINE**

## **24.1 Purpose**

The AI Context Engine gives Oscar a unified, real‑time understanding of:

- what the user is doing
- what is visible on screen
- what domain is active
- what item is selected
- what the user has done recently
- what changed in the workspace
- what the user prefers
- what permissions apply
- what automations exist
- what integrations are connected
- what data is available offline

It is the system’s **awareness layer**, enabling Oscar to act as a true cockpit co‑pilot.

---

## **24.2 Architecture**

Three coordinated layers:

### **Local Context Layer**

- UI state
- visible panels
- selected items
- local cache
- offline data
- local search index
- local events
- local preferences

### **Cloud Context Layer**

- Supabase data
- team context
- permissions
- integrations
- automations
- event stream
- version history

### **Semantic Context Layer**

- embeddings
- semantic clusters
- topic detection
- related items
- summaries
- extracted entities

Oscar blends all three layers into a single context window.

---

## **24.3 Context Sources**

Oscar receives structured context from every module:

### **Workspace**

- current page
- visible blocks
- selection
- scroll position
- backlinks
- tags

### **Files**

- selected file
- metadata
- preview mode
- version history

### **Projects**

- active project
- selected task
- status
- timeline

### **Connect**

- selected email
- thread context
- campaign context

### **Map**

- selected pin
- region
- metadata

### **Identity**

- user preferences
- AI settings
- theme
- locale

### **Permissions**

- what the user can see
- what the user can edit
- what the user can run

### **Automations**

- active automation
- trigger
- conditions
- actions

### **Event Stream**

- recent events
- actor
- domain
- changes

### **Search**

- related items
- semantic matches
- metadata

Oscar always knows “where the user is” and “what they’re doing.”

---

## **24.4 Context Window Model**

Oscar’s context window is composed of:

- **UI context** (what’s visible)
- **domain context** (what module is active)
- **item context** (what’s selected)
- **history context** (recent actions)
- **semantic context** (related items)
- **event context** (what just changed)
- **permission context** (what’s allowed)
- **preference context** (tone, verbosity, behaviour)

This allows Oscar to respond with precision.

---

## **24.5 Context Behaviours**

Oscar adapts based on context:

### **When editing a page**

- summarise
- rewrite
- extract tasks
- link related items
- propose structure

### **When viewing a file**

- summarise
- extract text
- extract tasks
- propose tags
- detect duplicates

### **When working in Projects**

- update tasks
- propose next steps
- detect blockers
- summarise progress

### **When reading email**

- summarise
- draft replies
- extract tasks
- detect follow‑ups

### **When viewing the Timeline**

- summarise changes
- detect patterns
- propose automations

### **When searching**

- refine queries
- propose filters
- find related items

Oscar behaves differently depending on where the user is.

---

## **24.6 Context Sensitivity**

Oscar respects:

### **Permissions**

- only sees what the user can see
- only edits what the user can edit
- only runs allowed automations
- never accesses vault secrets unless permitted

### **Offline Mode**

- uses local cache
- avoids cloud‑dependent actions
- queues cloud actions

### **User Preferences**

- tone
- verbosity
- inline help
- auto‑suggestions
- context depth

Oscar adapts to the user’s style.

---

## **24.7 Context Lifecycles**

Context updates when:

- user switches domains
- user selects an item
- user scrolls
- user edits
- event stream updates
- sync completes
- automations run
- search results update

Oscar always has the freshest context.

---

## **24.8 Semantic Understanding**

Oscar uses embeddings to understand:

- meaning
- topics
- relationships
- duplicates
- clusters
- patterns

This powers:

- semantic search
- related items
- smart linking
- summarisation
- automation suggestions

---

## **24.9 Context for Automations**

Oscar helps build automations by:

- reading triggers
- reading conditions
- reading actions
- reading logs
- reading event stream
- reading related items

Oscar can:

- propose automations
- detect loops
- detect conflicts
- optimise rules

---

## **24.10 Context for Event Stream**

Oscar uses events to:

- summarise changes
- detect anomalies
- detect trends
- propose insights
- propose automations

Examples:

- “You’ve had 12 overdue tasks this week.”
- “This campaign underperformed compared to last month.”
- “This file has been updated 6 times today.”

---

## **24.11 Context for Search**

Oscar uses search to:

- find related items
- refine queries
- propose filters
- cluster results
- detect duplicates

Search is Oscar’s “memory substrate.”

---

## **24.12 Context for Identity**

Oscar respects:

- PIN unlock
- biometrics
- preferences
- roles
- permissions
- team structure

Oscar never exceeds the user’s access.

---

## **24.13 Context for Filesystem**

Oscar uses file metadata to:

- propose tags
- detect duplicates
- extract text
- summarise content
- link files to projects

---

## **24.14 Context for Projects**

Oscar uses project data to:

- detect blockers
- propose next steps
- summarise progress
- extract tasks from content

---

## **24.15 Context for Connect**

Oscar uses email/campaign data to:

- summarise threads
- draft replies
- extract tasks
- detect follow‑ups

---

## **24.16 Context for Map**

Oscar uses map data to:

- summarise regions
- detect clusters
- propose tags
- link pins to projects

---

## **24.17 Context for Dashboard**

Oscar uses dashboard data to:

- generate insights
- detect anomalies
- propose improvements

---

## **24.18 Context for Timeline**

Oscar uses timeline data to:

- summarise activity
- detect patterns
- propose automations

---

## **24.19 Context for Permissions**

Oscar uses permissions to:

- filter suggestions
- avoid restricted items
- avoid restricted actions

---

## **24.20 Context for Sync**

Oscar uses sync data to:

- detect conflicts
- summarise issues
- propose fixes

---

## **24.21 Context for User Intent**

Oscar infers intent from:

- recent actions
- current domain
- selected items
- search queries
- event patterns
- project activity

This enables proactive assistance.

---

## **24.22 Context for Help Peek**

Oscar provides:

- explanations
- examples
- suggestions
- troubleshooting

Based on the active panel.

---

## **24.23 Context for Settings Peek**

Oscar explains:

- settings
- implications
- defaults
- recommended values

Based on the active setting.

---

## **24.24 Context for ?‑Markers**

Oscar provides:

- definitions
- examples
- best practices
- warnings

Based on the specific ?‑marker.

---

## **24.25 Context for Inbox Peek**

Oscar extracts:

- keys
- tokens
- DNS records
- instructions

And auto‑fills settings.

---

## **24.26 Security Guarantees**

- Oscar never sees vault secrets unless permitted
- Oscar never sees restricted items
- Oscar never bypasses permissions
- Oscar never exposes PIN or biometrics
- Oscar never leaks sensitive data

---

## **24.27 Cross‑Module Integration**

The AI Context Engine powers:

- Workspace
- Files
- Projects
- Connect
- Map
- Timeline
- Dashboard
- Search
- Automations
- Identity
- Permissions
- Sync
- Event Stream

It is the **intelligence layer** of the entire cockpit.

---
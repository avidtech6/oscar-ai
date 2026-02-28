---

# **MODULE 10 — PROJECTS (FULLY REGENERATED)**

## **10.1 Purpose of Projects**

Projects is the system’s **coordination and orchestration layer**, bringing together:

- tasks
- notes
- documents
- files
- map locations
- conversations
- timelines
- milestones
- deliverables
- campaigns (via Connect)
- automations (via Connect)

A project is not a folder. It is a **context** that binds items across all domains into a single, navigable cockpit.

---

# **10.2 Layout (Desktop + Tablet Landscape)**

```
[Sidebar] [Header] [Project Content] [Right Panel]
---------------------------------------------------
[Persistent Ask Oscar Bar]
```

### Behaviour

- Selecting a project item opens it in the **right panel** (back of card).
- The project content area becomes a **navigation rail** showing siblings.
- Pills determine the left‑rail context.
- Sidebar updates to reflect the active pill.
- Ask Oscar remains visible and context‑aware.

---

# **10.3 Layout (Mobile + Tablet Portrait)**

```
[Header]
[Project Content]
[Bottom Bar]
```

Opening a project item:

- Opens a **full‑height sheet**.
- Ask Oscar replaces the bottom bar when active.
- Full‑page and full‑screen modes apply inside the sheet.

---

# **10.4 Project Item Types**

All project items share the same card architecture:

- project
- section
- milestone
- deliverable
- task
- note
- document
- file
- map location
- thread
- campaign (from Connect)
- automation (from Connect)

Each type can define its own **default card‑front template**.

---

# **10.5 Card Identity System (Front + Back)**

Projects use the unified identity system shared across all domains.

## **10.5.1 Card Image / Photostrip**

Each project item can have:

- a single image
- a multi‑image photostrip
- a 2×2 grid
- a collage
- a map snapshot
- a file preview
- a generated cover

### Geometry:

- rounded top corners
- flat bottom edge
- clipped mask
- fit modes apply inside the mask

---

## **10.5.2 Fit Modes**

Each image tile supports:

- Fill
- Contain
- Cover
- Fit‑width
- Fit‑height
- Smart‑crop
- Center

---

## **10.5.3 Independent Visibility Toggles**

Two toggles:

- **Show on card front**
- **Show on card back**

Allows:

- front‑only identity
- back‑only identity
- both
- neither

---

## **10.5.4 Identity Controls (Back of Card)**

Under the pills, users can configure:

- show/hide card image (front/back)
- photostrip layout
- fit modes
- corner radius
- card height/density
- which metadata fields appear on card front
- ordering of fields
- card‑front template

These are **identity settings**, not navigation settings.

---

# **10.6 Gallery View Modes (Left Rail Controls)**

Projects support:

- Full Card View
- Minimal Card View
- Image‑Only Gallery View
- Compact List View
- Data‑First List View

Plus project‑specific grouping:

- by section
- by milestone
- by status
- by due date
- by priority
- by type (task, note, file, etc.)

These are **collection‑level** settings.

---

# **10.7 Context Pills**

Project items can appear in multiple contexts:

```
[ Project ]  [ Workspace ]  [ Files ]  [ Map ]  [ Connect ]
```

### Behaviour:

- Active pill determines the left rail.
- Sidebar updates to match the pill.
- Right panel stays focused on the item.
- Oscar reads the active context.

---

# **10.8 Navigation Rail**

When a project item is opened:

- the project content becomes a **navigation rail**
- the rail shows siblings in the active pill context
- switching pills updates the rail instantly
- rail remains visible in full‑page mode

---

# **10.9 Project Structure**

Projects support:

- sections
- milestones
- timelines
- deliverables
- linked tasks
- linked notes
- linked files
- linked map locations
- linked threads
- linked campaigns
- linked automations

These appear as modules on the back of the card.

---

# **10.10 Preview/Editor Module**

Supports:

- markdown
- rich text
- embedded media
- embedded files
- embedded maps
- outlines
- checklists
- tables
- timelines

### States:

- collapsed
- normal
- full‑page
- full‑screen

### Editing UI:

- appears only when editing
- collapses into a floating bubble
- never pushes metadata down

---

# **10.11 Full‑Page Mode**

Expands the editor to fill the right panel.

- metadata collapses
- tags collapse
- pills collapse
- linked items collapse
- actions collapse
- left rail remains visible
- sidebar remains visible
- Ask Oscar remains visible

---

# **10.12 Full‑Screen Mode**

A true immersive mode.

Everything hides except the editor and a floating Ask Oscar button.

---

# **10.13 Interactive Media Inside Project Items**

Supports:

- Open in Peek
- Open Gallery Context
- Select for Gallery
- Add to Card Photostrip
- Replace Card Image
- Set Fit Mode
- View on Map
- Return to Project

---

# **10.14 Peek‑Open Behaviour**

When opening embedded media in peek:

- right panel shows the media
- project remains visible in left rail
- sidebar updates to correct domain
- “Return to Project” button appears

---

# **10.15 Gallery Context Switching**

Choosing **Open Gallery Context**:

- keeps right panel on the media
- switches left rail to gallery
- highlights current image
- allows instant browsing

---

# **10.16 Multi‑Select + Auto‑Gallery Generation**

Selecting **Select for Gallery**:

- left rail enters multi‑select mode
- user selects multiple images
- project item auto‑inserts a **gallery block**
- gallery arranges itself cleanly
- user can rearrange via drag‑and‑drop

---

# **10.17 Manual Gallery Editing**

Gallery blocks support:

- drag‑to‑reorder
- resizing
- grid/masonry/carousel layouts
- captions
- replace/remove images

---

# **10.18 Project Metadata**

Project items support:

- title
- type (project, section, milestone, task, etc.)
- status
- due date
- priority
- tags
- linked items
- created/modified dates
- owner
- contributors
- associated files
- associated map locations
- associated threads
- associated campaigns
- associated automations

Metadata is modular and collapsible.

---

# **10.19 Project Actions**

- rename
- change type
- change status
- change priority
- add due date
- add milestone
- add section
- link to Files
- link to Workspace
- link to Map
- link to Connect
- summarise project
- extract tasks
- generate timeline
- delete

Actions collapse in full‑page/full‑screen modes.

---

# **10.20 Ask Oscar Integration**

Oscar reads:

- project content
- metadata
- preview/editor
- tags
- linked items
- GPS
- active pill context
- milestones
- sections
- timelines
- campaigns
- automations

Oscar can:

- summarise projects
- generate tasks
- extract tasks from text
- generate timelines
- rewrite descriptions
- generate tags
- link items
- convert formats
- reorganise modules

Oscar remains available except in full‑screen (floating button).

---

# **10.21 Editor / Document Behaviour (NEW ?‑MARKER SYSTEM)**

- **? markers per section/block**
    
    Each heading, paragraph, list, table, gallery, code block, or embedded media item can display a small **? icon** on hover or focus. This gives the user a direct entry point for contextual help without leaving the document.
    
- **Contextual Help Peek**
    
    Clicking the ? icon opens a **Help Peek** anchored to that specific block. Oscar receives the exact block context, including its type, position, and surrounding content, allowing responses that are precise rather than document‑wide.
    
- **Pre‑made questions**
    
    The Help Peek shows tappable, context‑aware questions relevant to the selected block. Examples include:
    
    “Expand this section”, “Simplify this explanation”, “Give examples”, “Check consistency with earlier sections”, “Suggest alternatives”, or “What should normally go here?”.
    
- **Documentation link**
    
    The Help Peek always includes a “View related documentation/templates” link when available. This may open internal templates, external references, or best‑practice guides depending on the block type.
    

---

# **10.22 Settings Peek (System‑Level Integrations)**

Projects can surface system‑level settings when relevant (e.g., campaign integrations, automation triggers).

- Opens from the right over the right panel.
- Shows only settings relevant to the current context.
- Each setting row includes:
    - label
    - input
    - **? icon** (opens Help Peek)
    - connection status

---

# **10.23 Inbox Peek + “Share to Oscar”**

When configuring integrations:

- Oscar can ask:
    
    “Do you have a setup/welcome email for this provider? Would you like to share it so I can fill these settings?”
    
- Inbox Peek opens:
    - filtered to likely setup emails
    - each email shows a **Share to Oscar** button
- Opening an email switches Peek to **Email View Mode**.
- Sharing returns the user to the Settings Peek with fields auto‑filled.

---

# **10.24 AI Context Model**

Oscar always knows:

- which domain
- which project item
- which module (editor, metadata, settings)
- which Peek (Settings, Help, Inbox)
- which field or document block

This enables precise, contextual assistance.

---
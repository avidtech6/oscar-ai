---

# **MODULE 7 — WORKSPACE (REGENERATED, COMPLETE)**

Workspace is the system’s **thinking layer**: tasks, notes, reports, plans, outlines, documents, and mixed‑media content. It uses the same card architecture as Files, but with Workspace‑specific behaviours like task states, due dates, progress, and structured writing.

---

## **7.1 Purpose of Workspace**

Workspace is where users create, organise, and evolve structured and unstructured content. It supports:

- tasks
- notes
- documents
- reports
- outlines
- mixed‑media pages
- embedded galleries
- embedded maps
- embedded files

Workspace items behave like cards with a **front** (identity) and a **back** (content + metadata).

---

# **7.2 Layout (Desktop + Tablet Landscape)**

```
[Sidebar] [Header] [Workspace Content] [Right Panel]
----------------------------------------------------
[Persistent Ask Oscar Bar]
```

### Behaviour

- Clicking a Workspace item opens it in the **right panel** (back of card).
- The Workspace content area becomes a **navigation rail** showing siblings.
- Pills determine the context of the left rail.
- Sidebar updates to reflect the active pill.
- Ask Oscar remains visible.

---

# **7.3 Layout (Mobile + Tablet Portrait)**

```
[Header]
[Workspace Content]
[Bottom Bar]
```

Opening an item:

- Opens a **full‑height sheet**.
- Ask Oscar replaces the bottom bar when active.
- Full‑page and full‑screen modes apply inside the sheet.

---

# **7.4 Workspace Item Types**

All Workspace items share the same card architecture:

- Task
- Note
- Document
- Report
- Outline
- Mixed‑media page
- Meeting notes
- Research notes

Each type can define its own **default card‑front template**.

---

# **7.5 Card Identity System (Front + Back)**

Workspace items use the same identity system as Files.

## **7.5.1 Card Image / Photostrip**

Each Workspace item can have:

- a single image
- a multi‑image photostrip
- a 2×2 grid
- a collage
- a map snapshot
- a file preview
- a generated cover (future AI option)

### Geometry:

- rounded top corners
- flat bottom edge
- clipped mask
- fit modes apply inside the mask

---

## **7.5.2 Fit Modes**

Each image tile supports:

- Fill
- Contain
- Cover
- Fit‑width
- Fit‑height
- Smart‑crop
- Center

Users can set modes per image or globally.

---

## **7.5.3 Independent Visibility Toggles**

Two toggles:

- **Show on card front**
- **Show on card back**

This allows:

- front‑only identity
- back‑only identity
- both
- neither

---

## **7.5.4 Identity Controls (Back of Card)**

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

# **7.6 Gallery View Modes (Left Rail Controls)**

Workspace supports the same gallery modes as Files:

- **Full Card View**
- **Minimal Card View**
- **Image‑Only Gallery View**
- **Compact List View**
- **Data‑First List View**

Plus Workspace‑specific grouping:

- by status
- by due date
- by priority
- by tag
- by project
- by type (task, note, doc)

These are **collection‑level** settings.

---

# **7.7 Context Pills**

Workspace items can appear in multiple contexts:

```
[ Workspace ]  [ Files ]  [ Map ]  [ Connect ]  [ Project ]
```

### Behaviour:

- Active pill determines the left rail.
- Sidebar updates to match the pill.
- Right panel stays focused on the item.
- Ask Oscar reads the active context.

---

# **7.8 Navigation Rail**

When a Workspace item is opened:

- the content area becomes a **navigation rail**
- the rail shows siblings in the active pill context
- switching pills updates the rail instantly
- rail remains visible in full‑page mode

---

# **7.9 Preview/Editor Module**

Workspace uses the same preview/editor architecture as Files:

Supports:

- markdown
- rich text
- outlines
- embedded media
- embedded maps
- embedded files
- code blocks
- tables
- checklists

### States:

1. Collapsed
2. Normal
3. Full‑page
4. Full‑screen

### Editing UI:

- appears only when editing
- collapses into a floating bubble
- never pushes metadata down

---

# **7.10 Full‑Page Mode**

Expands the editor to fill the right panel.

### Behaviour:

- metadata collapses
- tags collapse
- pills collapse into a thin bar
- linked items collapse
- actions collapse
- left rail remains visible
- sidebar remains visible
- Ask Oscar remains visible

---

# **7.11 Full‑Screen Mode**

A true immersive mode.

Everything hides:

- sidebar
- left rail
- metadata
- tags
- pills
- linked items
- actions
- Ask Oscar bar
- header

A floating Ask Oscar button remains available.

---

# **7.12 Interactive Media Inside Workspace Items**

Workspace supports the same interactive media behaviour as Files.

### Hover/tap actions:

- **Open in Peek**
- **Open Gallery Context**
- **Select for Gallery**
- **Add to Card Photostrip**
- **Replace Card Image**
- **Set Fit Mode**
- **View on Map**
- **Return to Document**

---

# **7.13 Peek‑Open Behaviour**

When opening embedded media in peek:

- right panel shows the media
- Workspace item remains visible in left rail
- sidebar updates to correct domain
- “Return to Document” button appears

---

# **7.14 Gallery Context Switching**

Choosing **Open Gallery Context**:

- keeps right panel on the media
- switches left rail to gallery
- highlights current image
- allows instant browsing

---

# **7.15 Multi‑Select + Auto‑Gallery Generation**

Selecting **Select for Gallery**:

- left rail enters multi‑select mode
- user selects multiple images
- Workspace item auto‑inserts a **gallery block**
- gallery arranges itself cleanly
- user can rearrange via drag‑and‑drop

---

# **7.16 Manual Gallery Editing**

Gallery blocks support:

- drag‑to‑reorder
- resizing
- grid/masonry/carousel layouts
- captions
- replace/remove images

---

# **7.17 Workspace Metadata**

Workspace items support:

- title
- type (task, note, doc, etc.)
- status
- due date
- priority
- tags
- linked items
- created/modified dates
- author
- project
- location (if GPS)

Metadata is modular and collapsible.

---

# **7.18 Workspace Actions**

- rename
- change type
- change status
- change priority
- add due date
- link to Files
- link to Map
- link to Connect
- summarise
- rewrite
- extract tasks
- convert to another type
- delete

Actions collapse in full‑page/full‑screen modes.

---

# **7.19 GPS Integration**

Workspace items with GPS metadata appear in Map.

Ask Oscar can:

- group items by location
- summarise items in a region
- create boundaries
- link items to markers

---

# **7.20 Ask Oscar Integration**

Ask Oscar reads:

- Workspace content
- metadata
- preview/editor
- tags
- linked items
- GPS
- active pill context

Ask Oscar can:

- summarise
- rewrite
- generate tasks
- extract tasks from text
- generate tags
- link items
- convert formats
- reorganise modules

Ask Oscar remains available except in full‑screen (floating button).

---

# **7.21 Device‑Specific Behaviour**

### Desktop

- persistent Ask Oscar bar
- navigation rail + right panel
- full‑page + full‑screen
- modular metadata

### Tablet Landscape

- same as desktop
- camera icon in Ask Oscar bar

### Tablet Portrait

- mobile layout
- full‑height sheets
- full‑page + full‑screen inside sheets

### Mobile

- full‑height sheets
- full‑page + full‑screen
- Ask Oscar replaces bottom bar

# **7.21 Editor / Document behaviour:**

- **? markers per section/block:**
Each heading, paragraph, table, gallery, code block, or embedded media can show a small **? icon** on hover/focus.
- **Contextual Help Peek:**
Clicking ? opens a **Help Peek** anchored to that block. Oscar receives the exact block + section context.
- **Pre‑made questions:**
Help Peek shows tappable questions relevant to that block (e.g., “Expand this section”, “Simplify this explanation”, “Give examples”, “Check consistency with earlier sections”).
- **Docs link:**
Help Peek always includes a “View related documentation/templates” link when available.

---
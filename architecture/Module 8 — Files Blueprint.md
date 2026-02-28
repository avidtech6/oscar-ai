---

# **MODULE 8 — FILES BLUEPRINT (REGENERATED, COMPLETE)**

## **8.1 Purpose of the Files Domain**

Files is the system’s universal content explorer. It replaces folder trees with a **context‑aware, metadata‑rich, AI‑integrated knowledge layer**. Files is not storage; it is a dynamic surface that connects documents, media, maps, Workspace items, and Connect threads.

---

## **8.2 Layout on Desktop + Tablet Landscape**

```
[Sidebar] [Header] [Files Content] [Right Panel]
------------------------------------------------
[Persistent Ask Oscar Bar]
```

### Behaviour

- Clicking a file opens it in the **right panel** (“back of the card”).
- The **content area shrinks** into a **navigation rail** showing siblings.
- The **sidebar updates** to reflect the active pill context.
- The Ask Oscar bar remains visible and anchored.

---

## **8.3 Layout on Mobile + Tablet Portrait**

```
[Header]
[Files Content]
[Bottom Bar]
```

Opening a file:

- Opens a **full‑height sheet**.
- Ask Oscar replaces the bottom bar when active.
- Full‑page and full‑screen modes apply inside the sheet.

---

## **8.4 Supported File Types**

- Images
- Audio
- Video
- PDFs
- Markdown
- Text
- Scans
- GPS‑tagged media
- Workspace attachments

All share the same metadata and context system.

---

# **8.5 Card Identity System (Front + Back)**

## **8.5.1 Card Image / Photostrip Identity Block**

Each card can have a **visual identity block** that appears on the front and optionally on the back.

### Features:

- single image
- multi‑image photostrip
- 2×2 grid
- collage
- map snapshot
- PDF cover
- mixed‑media combinations

### Geometry:

- **rounded top corners** to match the card
- **flat bottom edge** unless the card itself is rounded
- all images clipped inside this mask
- fit modes apply *inside* the mask

---

## **8.5.2 Fit Modes (CSS‑style)**

Each image tile supports:

- Fill
- Contain
- Cover
- Fit‑width
- Fit‑height
- Smart‑crop
- Center
- Tile (optional)

Users can set modes per image or apply globally.

---

## **8.5.3 Independent Visibility Toggles**

Two separate toggles:

- **Show on card front**
- **Show on card back**

This allows:

- front‑only identity
- back‑only identity
- both
- neither (but remembered)

---

## **8.5.4 Identity Controls (Back of Card)**

Under the pills, the user can configure:

- show/hide card image (front)
- show/hide card image (back)
- choose photostrip layout
- choose fit modes
- choose corner radius
- choose card height/density
- choose which metadata fields appear on card front
- choose ordering of fields
- choose card‑front template

These are **identity settings**, not navigation settings.

---

# **8.6 Gallery View Modes (Left Rail Controls)**

The left rail controls **how the entire collection is displayed**, not how individual cards look.

### Modes:

- **Full Card View** — identity + metadata + tags
- **Minimal Card View** — identity + title
- **Image‑Only Gallery View** — identity only
- **Compact List View** — small thumbnail + title + minimal metadata
- **Data‑First List View** — title + metadata, no images

### Additional controls:

- sort
- group
- filter
- density

These are **collection‑level** settings.

---

# **8.7 Context Pills**

Pills represent **where the file is used**, not where it lives.

Examples:

```
[ Files ]  [ Project ]  [ Note ]  [ Map ]  [ Connect ]
```

### Visual system:

- **Active pill**: solid background, high contrast
- **Inactive pills**: soft neutral background
- **Hover/tap**: subtle brightening

### Behaviour:

- Tapping a pill switches the **left rail** to siblings in that context.
- The **sidebar updates** to highlight the active domain.
- The right panel remains focused on the file.
- Ask Oscar reads the new context automatically.

---

# **8.8 Navigation Rail**

When a file is opened:

- The content area shrinks into a **compact navigation rail**.
- The rail shows siblings in the **active pill context**.
- Switching pills updates the rail instantly.
- The rail remains visible in full‑page mode.

---

# **8.9 Preview/Editor Module**

Supports:

- HTML preview
- PDF preview
- Image viewer
- Audio/video player
- Markdown editor
- Rich text editor

### States:

1. **Collapsed**
2. **Normal**
3. **Full‑page** (fills right panel; left rail visible)
4. **Full‑screen** (fills entire app; everything else hides)

### Editing UI:

- appears only when editing
- collapses into a floating bubble
- never pushes metadata down

---

# **8.10 Full‑Page Mode**

Expands the preview/editor to fill the right panel.

### Behaviour:

- metadata collapses
- tags collapse
- pills collapse into a thin bar
- linked items collapse
- actions collapse
- left rail remains visible
- sidebar remains visible
- Ask Oscar bar remains visible

---

# **8.11 Full‑Screen Mode**

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

# **8.12 Interactive Media Inside Documents**

### Hover/tap actions on embedded media:

- **Open in Peek**
- **Open Gallery Context**
- **Select for Gallery**
- **Add to Card Photostrip**
- **Replace Card Image**
- **Set Fit Mode**
- **View on Map** (if GPS exists)
- **Return to Document**

This turns documents into living surfaces.

---

# **8.13 Peek‑Open Behaviour**

When opening embedded media in peek:

- right panel shows the media
- document remains visible in left rail
- sidebar updates to correct domain
- “Return to Document” button appears

---

# **8.14 Gallery Context Switching**

Choosing **Open Gallery Context**:

- keeps right panel on the media
- switches left rail to gallery
- highlights current image
- allows instant browsing

---

# **8.15 Multi‑Select + Auto‑Gallery Generation**

Selecting **Select for Gallery**:

- left rail enters multi‑select mode
- user selects multiple images
- document auto‑inserts a **gallery block**
- gallery arranges itself cleanly
- user can rearrange via drag‑and‑drop

---

# **8.16 Manual Gallery Editing**

Gallery blocks support:

- drag‑to‑reorder
- resizing
- grid/masonry/carousel layouts
- captions
- replace/remove images

---

# **8.17 File Actions**

- rename
- edit metadata
- add tags
- link to Workspace items
- link to Map markers
- summarise
- extract text
- transcribe audio/video
- convert to note
- delete

Actions collapse in full‑page/full‑screen modes.

---

# **8.18 GPS Integration**

Files with GPS metadata automatically appear in Map.

Ask Oscar can:

- group files by location
- summarise files in a region
- create boundaries
- link files to markers

---

# **8.19 Ask Oscar Integration**

Ask Oscar reads:

- file content
- metadata
- preview/editor
- tags
- linked items
- GPS
- active pill context

Ask Oscar can:

- summarise
- rewrite
- generate tags
- link items
- convert formats
- extract text
- reorganise modules

Ask Oscar remains available except in full‑screen (floating button).

---

# **8.20 Device‑Specific Behaviour**

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

# **8.21 Preview/Editor / Embedded docs:**

- **? markers in previews:**
When viewing editable documents inside Files, the same **per‑section ? markers** and **Help Peek** behaviour applies.
- **Context‑aware Oscar:**
Oscar answers based on the specific section the ? belongs to, not just the whole file.

Changes to Module 9 — Connect

**Add under 9.x Settings / Campaigns / Email / Social / Blog / SEO / Automations:**

- **? icon per setting row:**
Every setting (API key, SMTP host, sender profile, platform connection, SEO field, etc.) has a **? icon**.
- **Settings Help Peek:**
Clicking ? opens a **Help Peek** with:
    - short explanation of the field
    - pre‑made questions (e.g., “Where do I find this in Brevo?”, “What does this permission do?”, “How do I verify my domain?”)
    - “Open provider documentation” link
- **“Do you have a settings email?” prompt:**
For provider‑related settings, Oscar can ask if the user has a welcome/setup email and offer to ingest it.

Changes to Module 10 — Projects

**Add under 10.x Project content / docs:**

- **? markers in project docs:**
Same per‑section ? markers and Help Peek as Workspace.
- **Context‑aware suggestions:**
Oscar can suggest milestones, tasks, risks, budget lines, etc., based on the section where ? was clicked.

MODULE 13 — INTEGRATIONS & HELP SYSTEM

13.1 Purpose

Module 13 defines the **system‑level integrations and contextual help architecture**:

- provider connections (Gmail, Brevo, Meta, WordPress, etc.)
- system‑level settings in **Peek**
- **Help Peek** for any setting or document section
- **Inbox Peek** + “Share to Oscar” email ingestion
- AI‑aware context across all of the above

13.2 Layers

1. **Settings Peek:** contextual system + item settings.
2. **Help Peek:** contextual help + pre‑made Oscar questions.
3. **Inbox Peek:** filtered emails + “Share to Oscar”.
4. **Oscar:** aware of which Peek and which field/section is active.

13.3 Settings Peek (system + item level)

**Where it appears:**

- Connect (email, campaigns, social, blog, SEO, automations)
- System‑level integrations (providers)
- Potentially other domains when they need external connections

**Behaviour:**

- Opens from the right over the right panel.
- Shows **only settings relevant to the current context** (e.g., email → email providers; social → social providers).
- Each setting row has:
- label
- input
- **? icon** (opens Help Peek)
- status (connected / not connected / error)

13.4 Help Peek

**Entry points:**

- **? next to a setting** (in Settings Peek).
- **? next to a document section/block** (Workspace, Files, Projects).

**Contents:**

- **Contextual pre‑made questions** (tappable).
- Short explanation of the field/section.
- “Open provider documentation” or “View templates/examples” link.
- Oscar’s responses inline.

**Examples:**

- For SMTP password:
    - “Where do I find this in Brevo?”
    - “What’s the difference between SMTP password and API key?”
    - “Can you check if my SMTP settings look correct?”
- For a “Methodology” section:
- “Expand this methodology with more detail.”
- “Simplify this explanation.”
- “What pitfalls should I mention here?”

13.5 Inbox Peek + “Share to Oscar”

**Trigger:**

- From Help Peek or Settings Peek, Oscar asks:
- “Do you have a setup/welcome email for this provider? Would you like to share it so I can fill these settings?”

**Behaviour:**

1. User agrees.
2. **Inbox Peek** opens:
    - filtered to likely setup emails (by subject, sender, content patterns).
    - each email shows a **“Share to Oscar”** button.
3. If user opens an email:
    - Inbox Peek shows the email content.
    - “Share to Oscar” button appears at the top.
4. When user taps “Share to Oscar”:
- Oscar extracts credentials / IDs / instructions.
- Oscar fills the relevant fields in the Settings Peek.
- User is returned to the Settings Peek + Help Peek context.
- Oscar shows a short confirmation summary.

13.6 AI context model

Oscar always knows:

- which **domain** (Files, Workspace, Map, Connect, Projects)
- which **item** (card)
- which **module** (editor, settings, metadata)
- which **Peek** (Settings, Help, Inbox)
- which **field or section** (specific setting or document block)

This allows Oscar to:

- answer with precise context
- generate relevant pre‑made questions
- suggest next steps
- auto‑fill settings when possible
- guide sign‑up and configuration flows

13.7 Security & confirmation

- Sensitive values (API keys, passwords) are stored only in the secure vault.
- Oscar can **fill** but not freely display full secrets (masked where appropriate).
- User must confirm before saving auto‑filled settings.
- Oscar can test connections and report success/failure.

13.8 Device behaviour

- **Desktop / tablet landscape:**
Settings Peek, Help Peek, and Inbox Peek all slide over the right panel.
- **Mobile / tablet portrait:**
Each Peek becomes a full‑height sheet; back navigation returns to previous context (Settings → Help → Inbox → back).

If you’d like, next step could be a **single consolidated “AI Surfaces” spec** that lists every place Oscar can appear (Ask bar, Peek, Help, Inbox, ? markers, card back) and what kind of actions are allowed in each.

---
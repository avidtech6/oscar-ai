**MODULE 2 — NAVIGATION BLUEPRINT (UPDATED)**

**2.1 Desktop Navigation Structure**

Desktop uses the full cockpit layout with a persistent Ask Oscar bar anchored at the bottom. The bar resizes with the content area when the sidebar collapses and is never covered by the right panel.

[Sidebar or Mini-sidebar] [Header] [Content] [Right Panel]
----------------------------------------------------------
[Persistent Ask Oscar Bar]

- Sidebar contains only navigation domains.
- Ask Oscar icon is removed from the sidebar.
- Right panel floats above content and never overlaps the bar.
- Tooltip appears above the bar.
- Sheets slide up above the tooltip, not over the bar.

**2.2 Sidebar (Desktop + Tablet Landscape)**

Home
Workspace
  - Projects
  - Tasks
  - Notes
  - Reports
  - Calendar
Files
Connect
Map
Dashboard
  - Settings
  - Support
  - Documents
Recent (3–4 dynamic)

- Collapses to mini-sidebar (icons only).
- Content area expands when collapsed.
- Ask Oscar bar expands horizontally to match content width.
- No Ask Oscar icon here.

**2.3 Bottom Bar (Mobile + Tablet Portrait)**

Home | Camera | Voice | Notifications | Ask Oscar

- Ask Oscar replaces the bottom bar when active.
- Sheets open full-height.
- Chevron closes sheets.
- Tooltip appears above the Ask Oscar bar only when Ask Oscar is active.

**2.4 Tablet Landscape Rules**

Tablet landscape uses the **desktop layout**, including:

- Sidebar
- Header
- Content
- Right panel
- Persistent Ask Oscar bar

Ask Oscar bar includes:

- Mic
- Voice Record
- Camera

This mirrors mobile’s capture shortcuts without adding a bottom bar.

**2.5 Tablet Portrait Rules**

Tablet portrait uses the **mobile layout**:

- Bottom bar
- Ask Oscar replaces bottom bar when active
- Sheets full-height
- Swipe-down closes sheets

This ensures consistency with mobile ergonomics.

**2.6 Domain Switching**

- Instant switch; no animation lag.
- Content scroll position preserved per domain.
- Right panel resets on domain change.
- Ask Oscar bar remains visible (desktop/tablet landscape).
- Ask Oscar bar replaced by bottom bar (mobile/tablet portrait) when not active.

**2.7 Recent (Dynamic 3–4 Items)**

- Appears at bottom of sidebar (desktop/tablet landscape).
- Appears in Home screen (mobile/tablet portrait).
- Shows last interacted items:
    - projects
    - notes
    - reports
    - files
    - threads
    - documents
- Tap = jump to item.
- No expansion or nested behaviour.

**2.8 Navigation Consistency Across Devices**

- Desktop + tablet landscape:
    - Sidebar navigation
    - Persistent Ask Oscar bar
    - Right panel
- Mobile + tablet portrait:
- Bottom bar navigation
- Ask Oscar replaces bottom bar
- Sheets full-height

**2.9 Ask Oscar Entry Points**

- Desktop/tablet landscape:
    - Persistent Ask Oscar bar (always visible).
- Mobile/tablet portrait:
- Ask Oscar icon in bottom bar.

No other entry points exist to avoid duplication.
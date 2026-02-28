---

# **MODULE 1 — GLOBAL SYSTEM RULES (FINAL)**

## **1.1 Core Principles**

- Cockpit layout: sidebar, header, content, right panel, persistent bottom bar.
- Ask Oscar is a **persistent system element**, not a mode.
- Sheets slide **above** the Ask Oscar bar, never covering it.
- Tooltip sits **above** the bar and hides when sheets open.
- Desktop + tablet landscape use the cockpit layout.
- Mobile + tablet portrait use bottom-bar navigation.
- Markdown-native content everywhere.
- ADHD-friendly: predictable, low-friction, minimal clutter.
- Spatial intelligence: map context, boundaries, markers.
- No folder trees; everything is cards + metadata.

## **1.2 Domain Definitions**

- **Home**: overview, capture entry, recents.
- **Workspace**: projects, tasks, notes, reports, calendar.
- **Files**: universal explorer with metadata.
- **Connect**: inbox, campaigns, comms intelligence.
- **Map**: boundaries, markers, spatial linking.
- **Dashboard**: settings, support, documents.
- **Documents**: markdown help system.
- **Recent**: dynamic 3–4 items.

## **1.3 Layout Structure**

```
[Sidebar or Mini-sidebar] [Header] [Content] [Right Panel]
----------------------------------------------------------
[Persistent Ask Oscar Bar]
```

- Sidebar collapses to mini-sidebar; content expands.
- Ask Oscar bar resizes horizontally with content width.
- Right panel never overlaps or pushes the bar.
- Tooltip appears above the bar.
- Sheets appear above tooltip, not covering the bar.

## **1.4 Component Primitives**

- **Card**: title, metadata, preview.
- **List row**: compact card.
- **Grid tile**: visual card.
- **Metadata block**: key–value pairs.
- **Action menu**: compact, 6–12 actions.
- **Search bar**: text + filters.
- **Buttons**: primary, secondary, icon.

## **1.5 Interaction Primitives**

- Tap = open.
- Long‑press = actions.
- Swipe‑down = close sheet (mobile + tablet portrait).
- Chevron = close sheet (desktop + tablet landscape).
- Drag = reorder (where supported).
- Map gestures = pinch, rotate, drag.

## **1.6 Cross‑Device Rules**

- **Desktop**:
    - Persistent Ask Oscar bar.
    - Sidebar + right panel visible.
    - Sheets appear above bar.
    - Tooltip above bar.
- **Tablet landscape**:
    - Same as desktop.
    - Ask Oscar bar includes mic + voice record + camera.
- **Tablet portrait**:
    - Mobile layout.
    - Bottom bar navigation.
    - Ask Oscar replaces bottom bar when active.
- **Mobile**:
    - Bottom bar navigation.
    - Ask Oscar replaces bottom bar when active.

## **1.7 Ask Oscar Bar (Persistent)**

```
[Tree Icon]  Ask Oscar  |  [Input]  [?]  [Mic]  [Voice Record]  [Camera*]  [Send]
```

- *Camera appears on tablet landscape only.*
- Always visible on desktop + tablet landscape.
- Never hidden, never covered, never resized vertically.
- Anchors tooltip and sheets.
- Highest z‑index except tooltip + sheets.

## **1.8 Sheet & Tooltip Layering**

**Z‑index order (bottom → top):**

1. Content
2. Right panel
3. Ask Oscar bar
4. Tooltip
5. Sheet

**Visual order (bottom → top):**

```
[Sheet]
[Tooltip]
[Ask Oscar Bar]
-----------------------------------------
[Content + Right Panel]
```

## **1.9 Cross‑Domain Consistency**

- Same card structure across Workspace, Files, Connect.
- Same sheet behaviour across all domains.
- Same chevron behaviour across desktop/tablet.
- Same swipe behaviour across mobile/tablet portrait.
- Same metadata layout.
- Same action menu structure.

---
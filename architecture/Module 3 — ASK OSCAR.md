---

# **MODULE 3 — ASK OSCAR BLUEPRINT (UPDATED)**

## **3.1 Ask Oscar Bar (Persistent on Desktop + Tablet Landscape)**

```
[Tree Icon]  Ask Oscar  |  [Input Field]  [?]  [Mic]  [Voice Record]  [Camera*]  [Send]
```

- Always visible on desktop + tablet landscape.
- Camera appears only on tablet landscape.
- Resizes horizontally with content when sidebar collapses.
- Never covered by right panel.
- Never hidden, never pushed, never resized vertically.
- Anchors tooltip and sheet positions.
- Highest z‑index except tooltip + sheets.

## **3.2 Ask Oscar Bar (Mobile + Tablet Portrait)**

```
[Ask Oscar Bar replaces bottom bar when active]
[Input Field]  [?]  [Mic]  [Voice Record]
```

- Appears only when Ask Oscar is active.
- Replaces bottom bar.
- Full-width.
- Chevron appears in sheet header.
- Swipe-down closes sheets.

## **3.3 Tooltip Behaviour**

```
[Tooltip]
   (contextual preview)
------------------------
[Ask Oscar Bar]
```

- Appears directly above the bar.
- Shows preview of AI response or suggested action.
- Hides automatically when a sheet opens.
- Reappears when sheet closes.
- Never overlaps the bar.
- Never appears on top of sheets.

## **3.4 Sheet Behaviour (Critical Layering Model)**

**Z‑index order (bottom → top):**

1. Content
2. Right panel
3. Ask Oscar bar
4. Tooltip
5. Sheet

**Visual behaviour:**

```
[Sheet]
[Tooltip]
[Ask Oscar Bar]
-----------------------------------------
[Content + Right Panel]
```

### Sheet rules:

- Slides up **above** the tooltip, not over the bar.
- Bar remains fully visible and interactive.
- Chevron in sheet header closes the sheet.
- Tooltip hides when sheet opens.
- Sheet height adjusts to device (partial on desktop, full on mobile).

## **3.5 Input Model**

- Text input (primary).
- Voice-to-text (Mic).
- Voice recording (Voice Record).
- Camera (tablet landscape only).
- “?” opens suggestions sheet.
- Send submits the query.

## **3.6 Conversation Model**

- Conversation history appears in the **Conversation Sheet**.
- Bubbles: compact, minimal padding.
- Types of bubbles:
    - AI answer
    - System suggestion
    - Action bubble (attach, add, link, create)
    - User message
- Conversation sheet scrolls independently of the bar.

## **3.7 Context Model**

Ask Oscar reads the following automatically:

- Current domain (Workspace, Files, Connect, Map, etc.)
- Selected item (project, note, file, thread, marker)
- Visible content (scroll position, open panel)
- Metadata (tags, dates, fields)
- Map context (location, boundaries, markers)
- Recent items

### Context rules:

- Context never modifies Recents.
- Context is read-only unless user confirms an action.
- Context is preserved when switching sheets.

## **3.8 Action Model**

Ask Oscar can trigger:

- Create (project, task, note, report, file)
- Summarise
- Extract tasks
- Rewrite
- Attach to project
- Add to report
- Generate content
- Navigate to item
- Open map location

Actions appear in:

- Tooltip
- Action bubbles
- Context Action Sheet

## **3.9 Device-Specific Ask Oscar Behaviour**

### Desktop

- Persistent bar.
- Tooltip above bar.
- Sheets above tooltip.
- No chevron in bar.
- Chevron only in sheet header.

### Tablet Landscape

- Same as desktop.
- Camera icon included in bar.

### Tablet Portrait

- Mobile layout.
- Ask Oscar replaces bottom bar.
- Sheets full-height.
- Swipe-down closes sheets.

### Mobile

- Bottom bar navigation.
- Ask Oscar replaces bottom bar when active.
- Sheets full-height.
- Swipe-down closes sheets.

## **3.10 Cross-Domain Consistency**

- Ask Oscar bar is always available (desktop/tablet landscape).
- Ask Oscar entry is always bottom bar (mobile/tablet portrait).
- Tooltip and sheets behave identically across domains.
- Context rules apply everywhere.
- No domain-specific Ask Oscar UI variations.

---
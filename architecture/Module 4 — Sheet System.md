---

# **MODULE 4 — SHEET SYSTEM BLUEPRINT (UPDATED)**

## **4.1 Sheet Types**

- **Conversation Sheet** — full chat history, scrollable.
- **Prompt Suggestions Sheet** — triggered by “?”, context-aware suggestions.
- **Context Action Sheet** — attach, add, summarise, extract tasks, etc.

These three sheet types share a unified behaviour model across all domains.

---

## **4.2 Sheet Positioning and Layering**

Sheets never cover the persistent Ask Oscar bar on desktop/tablet landscape. They appear visually above the bar, anchored to the bottom of the content area.

### **Z‑index order (bottom → top):**

1. Content
2. Right panel
3. Ask Oscar bar
4. Tooltip
5. Sheet

### **Visual stacking:**

```
[Sheet]
[Tooltip]
[Ask Oscar Bar]
-----------------------------------------
[Content + Right Panel]
```

- Tooltip hides when sheet opens.
- Tooltip reappears when sheet closes.
- Bar remains visible and interactive at all times.

---

## **4.3 Desktop + Tablet Landscape Sheet Behaviour**

- Sheets slide up from the bottom of the **content area**, not from the bar.
- Sheets stop **above** the Ask Oscar bar, leaving the bar fully visible.
- Chevron appears in the sheet header (not in the bar).
- Sheet height is partial (approx 60–70% of viewport).
- Right panel remains visible unless sheet overlaps its area.
- Tooltip hides when sheet opens.

### Behaviour summary:

```
[Sheet (partial height)]
[Tooltip (hidden)]
[Ask Oscar Bar (persistent)]
```

---

## **4.4 Mobile + Tablet Portrait Sheet Behaviour**

- Ask Oscar replaces the bottom bar when active.
- Sheets open **full-height** from the bottom of the screen.
- Chevron in sheet header closes the sheet.
- Swipe-down gesture closes the sheet.
- Tooltip appears only when Ask Oscar bar is visible (not during sheets).

### Behaviour summary:

```
[Sheet (full height)]
[Ask Oscar Bar (hidden)]
```

---

## **4.5 Shared Sheet Structure**

```
[Sheet Header]
  [Chevron]  [Title]
[Sheet Content]
```

- Chevron always closes the sheet.
- Title reflects context (e.g., “Suggestions”, “Actions”, “Conversation”).
- Content scrolls independently of the bar and the page.

---

## **4.6 Conversation Sheet**

- Displays full chat history.
- Bubbles: user, AI, system suggestions, action bubbles.
- Scrollable.
- Input remains in the persistent bar (desktop/tablet landscape) or Ask Oscar bar (mobile/tablet portrait).
- Sheet height:
    - Partial on desktop/tablet landscape
    - Full-height on mobile/tablet portrait

---

## **4.7 Prompt Suggestions Sheet**

- Triggered by “?” in the Ask Oscar bar.
- Shows context-aware suggestions based on:
    - domain
    - selected item
    - visible content
    - metadata
    - map context
- Tapping a suggestion inserts text into the Ask Oscar input field (does not auto-send).
- Layout: compact grid or list depending on device width.

---

## **4.8 Context Action Sheet**

- Triggered by action bubbles or system suggestions.
- Contains actions such as:
    - attach to project
    - add to report
    - summarise
    - extract tasks
    - rewrite
- Buttons are compact, 1–3 per row.
- Sheet height is small (approx 30–40% of viewport).

---

## **4.9 Sheet Transitions**

- Tooltip → Sheet: tooltip hides, sheet slides up.
- Sheet → Tooltip: sheet closes, tooltip reappears.
- Sheet → Sheet: direct transition without showing tooltip.
- Chevron always closes the current sheet.
- Swipe-down closes sheets on mobile/tablet portrait.

---

## **4.10 Cross-Domain Sheet Consistency**

- Sheets behave identically across Workspace, Files, Connect, Map, Home.
- Sheet height adapts to device class (partial vs full).
- Tooltip behaviour is consistent across all domains.
- Ask Oscar bar remains the anchor for all sheet interactions.

---
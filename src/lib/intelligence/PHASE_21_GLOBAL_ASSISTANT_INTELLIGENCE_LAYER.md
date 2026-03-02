📘 PHASE 21 — GLOBAL ASSISTANT INTELLIGENCE LAYER
The Copilot OS: Context Awareness, Chat Mode, Media Intelligence, and Unified Assistant Behaviour
⭐ OVERVIEW
Phase 21 introduces the Global Assistant Intelligence Layer, the system that transforms Oscar AI from a collection of AI‑enhanced pages into a unified Copilot that lives across the entire workspace.

This phase builds:

The global assistant bar (desktop + mobile)

Context‑aware behaviour

Chat Mode vs Context Mode

Context chips

Smart hints

Micro‑cues

Modal‑attached assistant

Contextual chat history

Maximise → filtered chat window

One‑bubble confirmation system

Multi‑select AI actions

Event model for context switching

This is the “brain” of Oscar AI.

⭐ 1. GLOBAL ASSISTANT BAR (DESKTOP + MOBILE)
Desktop:
Always visible bottom bar

Collapsible

Expands into assistant panel

Contains:

Oscar AI icon

“Ask Oscar AI” label

Up arrow

Micro‑cue indicator (! or ?)

Mobile:
Thin bottom bar with up arrow

Expands into full‑screen assistant panel

Same behaviour as desktop, optimised for touch

⭐ 2. ASSISTANT PANEL (EXPANDED STATE)
Contains:

Context chips

Conversation area

Prompt box

Smart hint line

Quick actions

Maximise button

Panel is sticky and overlays the page.

⭐ 3. CONTEXT CHIPS
Displayed above the prompt box.

Examples:

[Notes] [3 selected]

[Report: Oakwood Development] [Section 4]

[Blog Writer] [No project selected]

[Tasks] [5 selected]

Chips update automatically when:

Page changes

Item opens

Modal opens

Selection changes

⭐ 4. SMART HINTS
A single rotating line under the prompt box.

Examples:

“Rewrite selected section”

“Insert image from Gallery”

“Summarise selected notes”

“Draft a blog post from your latest survey”

Hints are page‑specific and context‑aware.

⭐ 5. MICRO‑CUES
Subtle indicators that the assistant has ideas:

! when a nudge is available

? when clarification is needed

Glow when context changes

Pulse when assistant has a strong suggestion

Micro‑cues appear in:

Bottom bar

Prompt box

Modal‑attached assistant

⭐ 6. CHAT MODE vs CONTEXT MODE
Context Mode
Editing a note/report/blog/task

AI actions apply directly

Context chips visible

Smart hints relevant to the item

Chat Mode
Triggered when user asks a general question.

Behaviour:

Page slides into background

Chat window becomes primary

Assistant answers normally

After conversation:

“Apply this to the note/report/blog we were working on?”

If yes → content inserted

If no → stays in chat only

⭐ 7. CONTEXTUAL CHAT HISTORY
Rules:
Contextual chats do not appear in main chat

Stored per item

User can request:

“Show me chat history for Note A”

Or click Maximise

Chat window opens filtered to that context

Clearly labelled with context chips

Colour‑coded

In the item:
Only one AI bubble appears:
“Content added.”

⭐ 8. MODAL‑ATTACHED ASSISTANT
When editing a note/report/blog in a modal:

Assistant attaches inside the modal

Sticks to bottom

Context chips show item

Smart hints adapt

AI actions apply only to that item

⭐ 9. MULTI‑SELECT AI ACTIONS
Supported on all card‑based lists:

Tasks

Notes

Projects

Reports

Blog posts

Examples:

“Mark all selected tasks as done”

“Tag all selected notes as BS5837”

“Generate a combined report from selected projects”

Assistant reads:

selectedIds

pageContext

action

⭐ 10. ONE‑BUBBLE CONFIRMATION RULE
When AI applies content:

Only one bubble appears

No chat history

No clutter

Examples:

“Content added.”

“Section rewritten.”

“Image inserted.”

⭐ 11. EVENT MODEL
Assistant listens for:
onPageChange(pageContext)

onItemOpen(itemContext)

onItemClose()

onSelectionChange(selectedIds)

onModalOpen(itemContext)

onModalClose()

Assistant emits:
applyContentToItem(itemId, content)

rewriteSection(itemId, sectionId, content)

insertImage(itemId, imageId, position)

createNoteFromAI(content)

createTaskFromAI(content)

nudge(type, message)

⭐ 12. COMPLETION CRITERIA
Phase 21 is complete when:

Global assistant bar works on desktop + mobile

Context chips update correctly

Smart hints appear

Micro‑cues appear

Chat Mode vs Context Mode works

Modal‑attached assistant works

Contextual chat history works

Maximise → filtered chat works

One‑bubble confirmations work

Multi‑select AI actions work

Event model implemented
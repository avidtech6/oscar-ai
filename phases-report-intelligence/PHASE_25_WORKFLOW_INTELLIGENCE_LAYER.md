📘 PHASE 25 — WORKFLOW INTELLIGENCE LAYER
Cross‑Document Reasoning, Project‑Level Intelligence, Task Generation, and Predictive Workflow Assistance
⭐ OVERVIEW
Phase 25 introduces the Workflow Intelligence Layer, the subsystem that enables Oscar AI to understand how users work across the entire workspace — not just within a single document.

This is the phase where the assistant becomes capable of:

Understanding multi‑document workflows

Linking notes → tasks → reports → blog posts

Predicting next steps

Generating tasks automatically

Suggesting workflows

Detecting missing work

Understanding project context

Providing cross‑page intelligence

Acting as a true project Copilot

This is the “executive function” of the Copilot — the part that guides the user.

⭐ 1. WORKFLOW GRAPH ENGINE
Oscar AI must maintain a graph of relationships between:

Notes

Tasks

Reports

Blog posts

Projects

Media (images, diagrams, voice notes)

User actions

AI actions

Example graph edges:
Note → Report (used as source material)

Report → Project (belongs to project)

Voice note → Note (transcribed into)

Image → Report section

Task → Project

Blog post → Project

Graph stored in IndexedDB + Supabase.
⭐ 2. PROJECT‑LEVEL REASONING ENGINE
AI must understand:

What a project is about

What documents belong to it

What tasks are pending

What reports are incomplete

What notes are relevant

What media belongs to the project

Example:
“What should I work on next for the Oakwood project?”

AI analyses:

Tasks

Reports

Notes

Deadlines

Missing sections

Incomplete workflows

And produces a prioritised answer.

⭐ 3. CROSS‑DOCUMENT INTELLIGENCE ENGINE
AI must be able to:

Link notes to reports

Link reports to blog posts

Link tasks to documents

Detect when a note should become a task

Detect when a task should become a report section

Detect when a report should become a blog post

Example:
“Turn these three notes into tasks.”

Or:

“Use these notes to generate Section 2 of the report.”

⭐ 4. WORKFLOW PREDICTION ENGINE
AI must predict:

What the user is likely to do next

What tasks should be created

What documents need updating

What workflows are incomplete

Example predictions:
“You added a diagram — want to update the report section?”

“You created a note about a hazard — should I create a task?”

“You finished Section 3 — want to generate Section 4?”

⭐ 5. AUTOMATIC TASK GENERATION ENGINE
AI must be able to:

Generate tasks from notes

Generate tasks from reports

Generate tasks from voice notes

Generate tasks from user behaviour

Example:
User writes a note:

“Need to revisit the site to measure crown spread.”

AI suggests:

“Create a task for this?”

⭐ 6. MULTI‑DOCUMENT WORKFLOW ENGINE
AI must support workflows like:

Notes → Report

Report → Blog post

Notes → Tasks

Tasks → Project plan

Media → Report section

Voice note → Note → Task

Example:
“Turn these notes into a blog post.”

AI pulls from:

Notes

Images

Report sections

Project context

And generates a structured blog post.

⭐ 7. WORKFLOW‑AWARE CONTEXT MODE
When user is inside a project:

AI must:

Understand project context

Suggest next steps

Surface relevant notes

Surface relevant tasks

Surface relevant media

Surface relevant reports

Example:
“What’s left to do for this project?”

AI analyses the workflow graph and responds.

⭐ 8. WORKFLOW‑AWARE CHAT MODE
If user asks a general question:

Assistant switches to Chat Mode

After answering:

“Should I apply this to your project workflow?”

If yes → update tasks, notes, or documents
If no → keep in chat

⭐ 9. EVENT MODEL (WORKFLOW‑FOCUSED)
Assistant listens for:
onProjectOpen(project)

onDocumentCreated(document)

onTaskCreated(task)

onNoteCreated(note)

onMediaAdded(media)

onUserAction(action)

onWorkflowBreak(detected)

Assistant emits:
createTaskFromNote

createReportSectionFromNotes

suggestNextSteps

updateWorkflowGraph

predictWorkflowActions

⭐ 10. COMPLETION CRITERIA
Phase 25 is complete when:

Workflow graph exists

AI understands project context

AI can link notes → tasks → reports

AI can predict next steps

AI can generate tasks automatically

AI can detect workflow gaps

AI can suggest workflows

AI can perform cross‑document reasoning

Workflow‑aware context mode works

Workflow‑aware chat mode works

Event model implemented
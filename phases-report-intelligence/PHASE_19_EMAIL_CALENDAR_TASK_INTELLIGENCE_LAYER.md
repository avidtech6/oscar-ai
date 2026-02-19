Phase 19 — Unified Email, Calendar & Task Intelligence Layer
Status
🔵 Not Started
(Phase definition approved; awaiting kickoff)

Phase Summary
Phase 19 introduces the Unified Productivity Layer for Oscar AI, combining:

Email integration

Calendar integration

Task & To‑Do system

Meeting scheduling

Cross‑system intelligence

Attachment reference system

AI‑powered productivity workflows

This phase transforms Oscar AI into a central hub for communication, scheduling, and task management — all powered by the unified editor, unified Copilot, and Supabase cloud layer introduced in Phase 18.

This is a major subsystem, but it is cleanly isolated and fully compatible with the existing architecture.

Objectives
1. Email Integration (Unified Inbox)
Support for multiple email accounts:

cPanel IMAP

Gmail (IMAP, not OAuth)

Outlook IMAP

Custom IMAP accounts

Features:

Unified inbox

Unified sent folder

Unified drafts

Email threading

Email search

Email filters

Email categories/tags

Email → task extraction

Email → calendar extraction

Email → project linking

Email → blog post conversion

Email → report conversion

Attachment Handling
Reference‑only model (no full downloads unless needed)

Attachment metadata stored in Supabase

Thumbnails stored in Supabase

Full files fetched on demand

Attachments can be:

added to gallery

added to reports

added to blog posts

added to tasks

added to calendar events

This keeps storage tiny and avoids Supabase limits.

2. Calendar Integration
A unified calendar system for:

Events

Meetings

Deadlines

Scheduled blog posts

Scheduled social posts

Scheduled reports

Reminders

Recurring events

Features:

Month view

Week view

Day view

Agenda view

Drag‑and‑drop rescheduling

AI “find a time”

AI “summarise my week”

AI “plan my day”

Email → event extraction

Task → event conversion

Blog post → scheduled event

3. Task & To‑Do System
A unified task system for:

Personal tasks

Work tasks

Project tasks

Email‑derived tasks

Calendar‑derived tasks

Blog‑derived tasks

Report‑derived tasks

Features:

Task lists

Subtasks

Due dates

Reminders

Priorities

Tags

Project linking

AI task extraction

AI task prioritisation

AI task rewriting

AI “plan my tasks for today”

4. Meetings & Scheduling
AI‑powered meeting system:

Create meetings

Extract meetings from emails

Suggest meeting times

Add attachments to meetings

Add notes to meetings

Link meetings to projects

Link meetings to tasks

Link meetings to reports

Link meetings to blog posts

5. Cross‑System Intelligence
This is where Oscar AI becomes powerful.

Examples:

“Turn this email into a task.”

“Turn this task into a blog post.”

“Schedule this blog post for next week.”

“Add this attachment to the project.”

“Create a meeting with this client.”

“Summarise all emails from today.”

“Extract tasks from this email thread.”

“Plan my week based on my tasks.”

“Show me everything due tomorrow.”

This uses the unified editor + unified Copilot from Phase 18.

6. Supabase Integration (Productivity Layer)
A. Email Metadata
Email headers

Email bodies

Attachment references

Thread IDs

Flags (read/unread/starred)

Folder mapping

B. Calendar Data
Events

Recurrence rules

Reminders

Attendees

Linked content

C. Task Data
Tasks

Subtasks

Priorities

Due dates

Reminders

Linked content

D. Real‑Time Sync
Email sync

Task sync

Calendar sync

Multi‑device updates

Multi‑user updates

E. Storage
Thumbnails

Attachment metadata

Optional full attachments

Auto‑archive system

Storage quota warnings

7. Local‑First Architecture (Offline Productivity)
Offline Email
Cached inbox

Cached threads

Drafts stored locally

Send queue for when online

Offline Calendar
Cached events

Offline edits

Sync when online

Offline Tasks
Full offline support

Sync queue

This ensures Oscar AI works anywhere — even in the field.

Required Files & Structure
Code
productivity/
  email/
    EmailClient.ts
    IMAPConnector.ts
    EmailParser.ts
    AttachmentReference.ts
    EmailCopilot.ts

  calendar/
    CalendarEngine.ts
    EventModel.ts
    RecurrenceEngine.ts
    CalendarCopilot.ts

  tasks/
    TaskEngine.ts
    TaskModel.ts
    TaskCopilot.ts
    TaskPrioritiser.ts

  meetings/
    MeetingEngine.ts
    MeetingModel.ts
    MeetingCopilot.ts

  cross-intelligence/
    CrossSystemEngine.ts
    EmailToTask.ts
    EmailToEvent.ts
    TaskToEvent.ts
    ContentLinker.ts

supabase/
  EmailSync.ts
  CalendarSync.ts
  TaskSync.ts
  AttachmentStorage.ts

local-first/
  LocalEmailCache.ts
  LocalCalendarCache.ts
  LocalTaskCache.ts
  SyncQueue.ts

types/
  Email.ts
  Event.ts
  Task.ts
  Meeting.ts
  Attachment.ts
  ProductivityState.ts

tests/
  email-tests.ts
  calendar-tests.ts
  task-tests.ts
  meeting-tests.ts
  sync-tests.ts
Architecture Overview
Code
Productivity Layer
├── Email System
│   ├── IMAP connector
│   ├── Unified inbox
│   ├── Attachment references
│   └── Email Copilot
├── Calendar System
│   ├── Events
│   ├── Recurrence
│   └── Calendar Copilot
├── Task System
│   ├── Tasks
│   ├── Subtasks
│   └── Task Copilot
├── Meetings
│   ├── Scheduling
│   ├── Notes
│   └── Attachments
├── Cross-System Intelligence
│   ├── Email → Task
│   ├── Email → Event
│   ├── Task → Event
│   └── Content linking
├── Local-First Layer
│   ├── Email cache
│   ├── Calendar cache
│   └── Task cache
└── Supabase Cloud Layer
    ├── Sync
    ├── Storage
    └── Realtime
Completion Criteria
Phase 19 is complete when:

✔ Email integration functional

✔ Attachment reference system implemented

✔ Calendar system functional

✔ Task system functional

✔ Meeting scheduling functional

✔ Cross‑system intelligence implemented

✔ Supabase sync implemented

✔ Local‑first offline mode implemented

✔ Real‑time updates implemented

✔ Unified editor integrated

✔ Unified Copilot integrated

✔ Documentation updated

✔ CHANGELOG updated

✔ Phase 19 completion report generated

Notes
Phase 19 builds directly on Phase 18.
It completes the “productivity brain” of Oscar AI and prepares the platform for future expansions.
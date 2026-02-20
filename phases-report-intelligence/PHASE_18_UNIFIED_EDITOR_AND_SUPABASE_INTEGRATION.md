Phase 18 — Unified Multi‑Device Editor & Supabase Integration
Status
🔵 Not Started
(Phase definition approved; awaiting kickoff)

Phase Summary
Phase 18 introduces the Unified Multi‑Device Editor and the Supabase Cloud Integration Layer, transforming Oscar AI from a local‑only prototype into a local‑first, cloud‑connected platform.

This phase replaces all remaining placeholders (including the outdated PocketBase references) and establishes the real platform architecture:

Local‑first storage (IndexedDB)

Supabase cloud sync

Unified editor

Unified Copilot

Unified metadata

Unified gallery

Multi‑device layouts

Real‑time updates

Admin‑controlled backend keys

This is the architectural “spine” of Oscar AI.

Objectives
1. Unified Multi‑Device Editor
A single editor used across all subsystems:

Reports

Blog posts

Social posts

Tasks

Calendar notes

Email drafts

Templates

Academy content

Features:

Bold, italic, underline

Headings

Lists

Quotes

Links

Inline images

Drag‑and‑drop (tablet/desktop)

Undo/redo

Clean HTML output

WordPress‑compatible formatting

Structured block model (TipTap/ProseMirror)

Mobile/tablet/desktop responsive UI

2. Unified Copilot Interaction Layer
A single Copilot interface that works across all content types:

Rewrite

Insert

Improve

Summarise

Generate

Optimise

Schedule

Publish

Convert

Extract tasks

Extract events

Extract attachments

The Copilot must understand the structured block model and update content safely.

3. Unified Preview Engine
A single preview system for:

Reports

Blog posts

Social posts

Emails

Tasks

Calendar events

Supports:

Mobile preview

Tablet preview

Desktop preview

Print preview

PDF/Word export (via Phase 15)

4. Unified Metadata Panel
A single metadata panel system for:

SEO

Scheduling

Categories

Tags

Project links

Brand selection

WordPress settings

Social settings

Email metadata

Task metadata

Calendar metadata

Panels slide up on mobile and appear as sidebars on desktop.

5. Unified Gallery Panel
A single gallery system used across:

Reports

Blog posts

Social posts

Emails

Tasks

Calendar events

Features:

Thumbnails

Tags

Project links

Brand links

EXIF extraction

AI alt‑text

AI captions

Multi‑select

Delete

Download

Archive

Storage usage warnings

6. Supabase Integration (Cloud Layer)
A. User Accounts
Email + password

Magic link login

Multiple users (client + wife)

Admin login (you)

Secure sessions

Logout

Password reset

B. Cloud Sync
Sync the following between devices:

Reports

Blog posts

Templates

Tasks

Calendar events

Email references

Gallery metadata

Settings

AI preferences

C. Storage
Supabase storage for:

Thumbnails

PDFs

Word docs

Images (optional)

Attachments (optional)

Auto‑archive system

Storage quota warnings

D. Real‑Time Updates
Multi‑device sync

Multi‑user sync

Live updates in editor

Live updates in gallery

Live updates in tasks/calendar

E. Admin Control
You control:

All backend keys

Storage rules

Sync logic

Quotas

Backend updates

7. Local‑First Architecture (Offline Mode)
Local Storage (Primary)
Instant load

Offline editing

Offline gallery

Offline tasks

Offline calendar

Offline drafts

Cloud Sync (Secondary)
Syncs when online

Conflict resolution

Background updates

Safe merges

Backup Layer
Export/import

Auto‑archive

Local snapshots

This ensures Oscar AI is fast, safe, and resilient.

Required Files & Structure
Code
unified-editor/
  Editor.ts
  BlockModel.ts
  FormattingToolbar.ts
  MobileToolbar.ts
  DesktopToolbar.ts
  HTMLSanitiser.ts
  PreviewEngine.ts
  MetadataPanel.ts
  GalleryPanel.ts
  CopilotPanel.ts

supabase/
  SupabaseClient.ts
  AuthManager.ts
  SyncEngine.ts
  StorageManager.ts
  RealtimeManager.ts
  ConflictResolver.ts
  AdminControls.ts

local-first/
  LocalDB.ts
  LocalBackup.ts
  LocalSyncQueue.ts
  OfflineMode.ts

types/
  EditorContent.ts
  Metadata.ts
  GalleryItem.ts
  UserAccount.ts
  SyncState.ts

integration/
  Phase15Integration.ts
  Phase17Integration.ts
  Phase19Preparation.ts

tests/
  editor-tests.ts
  sync-tests.ts
  storage-tests.ts
  auth-tests.ts
  offline-tests.ts
Architecture Overview
Code
Unified Editor System
├── Editor Core
│   ├── Block model
│   ├── Formatting
│   └── Clean HTML output
├── Copilot Layer
│   ├── Rewrite
│   ├── Insert
│   ├── Optimise
│   └── Schedule
├── Preview Engine
│   ├── Mobile
│   ├── Tablet
│   └── Desktop
├── Metadata Panels
│   ├── SEO
│   ├── Scheduling
│   └── Categories/Tags
├── Gallery Panel
│   ├── Thumbnails
│   ├── Metadata
│   └── Storage management
├── Local-First Layer
│   ├── Local DB
│   ├── Offline mode
│   └── Sync queue
└── Supabase Cloud Layer
    ├── Auth
    ├── Sync
    ├── Storage
    └── Realtime
Completion Criteria
Phase 18 is complete when:

✔ Unified editor implemented

✔ Unified Copilot layer implemented

✔ Unified preview engine implemented

✔ Unified metadata panel implemented

✔ Unified gallery panel implemented

✔ Supabase auth implemented

✔ Supabase sync implemented

✔ Supabase storage implemented

✔ Real‑time updates implemented

✔ Local‑first architecture implemented

✔ Offline mode implemented

✔ Conflict resolution implemented

✔ Admin controls implemented

✔ Documentation updated

✔ CHANGELOG updated

✔ Phase 18 completion report generated

Notes
Phase 18 is the foundation for Phase 19 (Email + Calendar + Tasks).
It transforms Oscar AI into a true cloud‑connected platform while preserving offline capability and local‑first performance.
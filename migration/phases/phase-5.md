Phase 5: Storage Migration Completion (Corrected & Drift‑Proof)
Execution Rules (Mandatory)
Use ONLY marker-based edits.

Use file_structure/index.json to locate markers.

Do NOT scan directories.

Do NOT read large files (preload.ts, DEV_NOTES.md, CHANGELOG.md).

Do NOT inspect code to “verify” anything.

Trust the Master Index, phase notes, and completion reports.

If a file does not contain the expected markers, STOP and report.

Purpose
Complete the migration from localStorage to IndexedDB and ensure all application data is persisted through the unified storage layer.
This phase ensures the entire app uses IndexedDB as the single source of truth for persistent data.

This phase must not break existing functionality.

Files Involved
Files to Modify
src/lib/services/unified/StorageMigrationService.ts

Finalize migration logic

Add missing migration steps

src/lib/db/index.ts

Verify schema and migrations

src/lib/stores/settings.ts

Replace localStorage usage with IndexedDB

src/lib/services/aiActions.ts or reportAIActions.ts

Update any remaining data access to use IndexedDB

src/routes/oscar/+page.svelte

Ensure chat history uses IndexedDB

src/routes/notes/+page.svelte

Ensure notes use IndexedDB

src/routes/reports/+page.svelte

Ensure reports use IndexedDB

Files to Verify (Read‑Only)
src/lib/services/pocketbase.ts

src/lib/services/pocketbase-schema.ts

src/lib/services/dummyData.ts

High‑Level Changes
Step 1 — Analyze Current Storage Usage
Document all localStorage and sessionStorage usage (no scanning; rely on index.json and markers):

Project IDs

User settings

Chat history

Notes, reports, trees

UI state (collapsed panels, etc.)

Step 2 — Complete StorageMigrationService
Update StorageMigrationService to:

Migrate all remaining localStorage keys

Handle schema version upgrades

Provide migration progress feedback

Handle migration errors gracefully

Add migration steps for keys such as:

oscar_current_project_id → ProjectContextStore

groq_api_key → IndexedDB settings table

oscar_settings → IndexedDB settings table

Any other keys listed in index.json

Step 3 — Update Settings Store
Update settings.ts to:

Use IndexedDB as primary storage

Use localStorage only during migration

Remove localStorage dependency after migration

Provide real-time updates across tabs (if needed)

Settings must include:

API keys

UI preferences

Default project

Feature flags

Step 4 — Verify Data Access Patterns
Ensure all CRUD operations use IndexedDB:

oscar/+page.svelte → chat history

notes/+page.svelte → notes

reports/+page.svelte → reports

aiActions.ts → any data access

Remove any localStorage fallbacks.

Step 5 — Add Data Validation
Add:

Schema validation

Cleanup for corrupted entries

Backup/restore functionality

Data export/import for user portability

Step 6 — Test Migration Scenarios
Test:

Fresh install (no localStorage)

Migration from existing localStorage

Schema version upgrades

Data persistence across reloads

Error scenarios (quota exceeded, etc.)

Validation Criteria
Must Pass
All data persists in IndexedDB (not localStorage).

Migration from localStorage works for existing users.

Fresh install works without migration errors.

All CRUD operations work correctly.

Data persists across reloads and browser restarts.

TypeScript compiles with zero errors.

No storage-related runtime errors.

Must NOT Do
Do NOT lose user data.

Do NOT break existing functionality.

Do NOT introduce performance issues.

Do NOT remove fallback mechanisms prematurely.

Dependencies
Pre‑requisite: Phase 4 (Voice System Integration)

Blocks: Phase 6 (Final Validation & Cleanup)

Rollback Strategy
If validation fails:

Re-enable localStorage fallbacks in settings.ts.

Keep IndexedDB schema but mark as experimental.

Revert UI components to localStorage where needed.

Document what failed.

Rollback is safe because:

localStorage fallbacks can be restored

IndexedDB can coexist with localStorage

Migration can be incremental

Success Metrics
Complete migration: No localStorage usage for app data.

Data integrity: All user data preserved.

Performance: IndexedDB operations are fast.

Error handling: Graceful handling of storage errors.

Cross-tab sync: Settings sync across tabs (if needed).

Notes
IndexedDB is asynchronous — UI must handle async loading.

Consider connection pooling or reuse.

Test with empty, small, and large datasets.

Consider compression for large text fields.
Phase 3: Migrate AI Actions (Corrected & Drift‑Proof)
Execution Rules (Mandatory)
Use ONLY marker-based edits.

Use file_structure/index.json to locate markers.

Do NOT scan directories.

Do NOT read large files (preload.ts, DEV_NOTES.md, CHANGELOG.md).

Do NOT inspect code to “verify” anything.

Trust the Master Index, phase notes, and completion reports.

If a file does not contain the expected markers, STOP and report.

Purpose
Fully migrate all remaining legacy logic in aiActions.ts into the unified architecture.
This phase ensures all AI-triggered actions use:

UnifiedIntentEngine

ActionExecutorService

IntentFeedbackService

ProjectContextStore

After this phase, aiActions.ts will contain only report-specific helper functions, and all action execution will be unified.

Files Involved
Files to Modify
src/lib/services/aiActions.ts

Remove legacy action execution logic

Move report-specific functions into a renamed file (reportAIActions.ts)

src/routes/oscar/+page.svelte

Update to use unified action execution directly

src/routes/notes/+page.svelte

src/routes/reports/+page.svelte

src/lib/components/reports/ReportWizard.svelte

src/lib/components/ai/AIReviewChat.svelte

Files to Verify (Read‑Only)
src/lib/services/unified/ActionExecutorService.ts

src/lib/services/unified/UnifiedIntentEngine.ts

src/lib/services/unified/IntentFeedbackService.ts

High‑Level Changes
Step 1 — Categorize aiActions.ts Functions
Identify functions in aiActions.ts and classify them:

A. Action Execution (must migrate)

executeAction

confirmPendingAction

detectActionRequest

Any legacy “create X” functions

B. Context Functions (must migrate)

getAIContext

formatContextForAI

C. Report-Specific Utilities (must remain)

suggestClientName

suggestSiteAddress

parseUserAnswer

Any other report-only helpers

D. Misc Utilities

getConversionOptions (may integrate with unified conversion logic)

Step 2 — Migrate Action Execution to Unified Services
Replace all legacy logic with unified equivalents:

Replace:

executeAction() → actionExecutorService.execute()

confirmPendingAction() → intentFeedbackService.confirmAction()

Legacy branching logic → unified pipeline

Remove:

Any duplicated action execution logic

Any fallback paths

Any direct DB writes from components

All actions must flow through:

UnifiedIntentEngine → ActionExecutorService → IntentFeedbackService

Step 3 — Migrate Context Functions
Update:

getAIContext()

Use ProjectContextStore directly

Remove compatibility logic

Remove references to chatContext

formatContextForAI()

Use unified context formatting

Remove legacy formatting branches

Step 4 — Separate Report-Specific Functions
Create a new file:

src/lib/services/reportAIActions.ts

Move ONLY report-specific helpers:

suggestClientName

suggestSiteAddress

parseUserAnswer

Any similar functions

Update all report-related components to import from the new file.

aiActions.ts should then contain ONLY:

Re-exports (temporary), or

Nothing (if fully migrated)

Step 5 — Update UI Components
For each component importing from aiActions.ts:

Replace:

executeAction → actionExecutorService.execute

confirmPendingAction → intentFeedbackService.confirmAction

getAIContext → use ProjectContextStore directly

Keep:

Report-specific imports (but update path to reportAIActions.ts)

Remove:

Any references to legacy action logic

Any references to chatContext

Step 6 — Verify “Don’t Be Dumb” Rules
Ensure ActionExecutorService enforces:

No hallucinated task creation

No direct DB writes from UI

Confirmation required for destructive actions

Correct behavior in General vs Project modes

Proper context inference before execution

If any rule is missing, add it.

Validation Criteria
Must Pass
All AI-triggered actions use unified execution pipeline.

No legacy action logic remains in aiActions.ts.

Report-specific functions moved to reportAIActions.ts.

All UI components compile and run without errors.

TypeScript passes with zero errors.

Browser console shows no action-related runtime errors.

Confirmation dialogs work correctly in General Chat.

Must NOT Do
Do not break report generation.

Do not remove report-specific helpers.

Do not change business logic.

Do not introduce new action types.

Do not modify unrelated files.

Rollback Strategy
If validation fails:

Restore original aiActions.ts.

Restore UI component imports.

Keep unified service improvements but disable usage.

Document what failed in the completion report.

Rollback is safe because:

aiActions.ts can remain as a compatibility layer.

Unified services are additive, not destructive.

Success Metrics
Unified execution: All actions go through ActionExecutorService.

Safety: “Don’t be dumb” rules enforced globally.

Clean separation: Report helpers isolated.

No duplication: No legacy logic remains.

Functionality preserved: All actions behave exactly as before.

Notes
aiActions.ts is already partially migrated — this phase completes it.

Report helpers stay separate because they are not part of the intent system.

Conversion logic may be unified later if needed.
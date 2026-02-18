# Phase 1: Fix Broken Imports
## Execution Rules (Mandatory)
- Use ONLY marker-based edits.
- Use file_structure/index.json to locate markers.
- Do NOT scan directories.
- Do NOT read large files (preload.ts, DEV_NOTES.md, CHANGELOG.md).
- Do NOT inspect code to “verify” anything.
- Trust the Master Index, phase notes, and completion reports.
- If a file does not contain the expected markers, STOP and report.

## Purpose
Ensure all imports reference real unified services.  
This phase is intentionally minimal because the real repo already uses unified imports in most places.

## Files Involved

### Files to Modify
1. `src/routes/notes/+page.svelte`  
   - Ensure imports use unified services.

### Files to Verify (Read-Only)
1. `src/lib/services/unified/ContextInferenceService.ts` — confirm file exists.
2. `src/lib/services/unified/UnifiedIntentEngine.ts` — confirm file exists.
3. `src/routes/oscar/+page.svelte` — verify unified imports already used.
4. `src/routes/reports/+page.svelte` — verify unified imports already used.
5. `src/lib/components/reports/ReportWizard.svelte` — verify unified imports already used.
6. `src/lib/components/ai/AIReviewChat.svelte` — verify unified imports already used.

## High-Level Changes

### Step 1 — Confirm Unified Services Exist
- Confirm the existence of:
  - `ContextInferenceService.ts`
  - `UnifiedIntentEngine.ts`
- If missing, create minimal stubs using markers.

### Step 2 — Update Notes Page Imports
- Ensure `notes/+page.svelte` imports:
  - `ContextInferenceService` from `'$lib/services/unified/ContextInferenceService'`
  - `UnifiedIntentEngine` from `'$lib/services/unified/UnifiedIntentEngine'`
- Remove any imports from missing legacy modules.

### Step 3 — Verify Other UI Components
- Confirm the following files do NOT import from missing legacy modules:
  - `oscar/+page.svelte`
  - `reports/+page.svelte`
  - `ReportWizard.svelte`
  - `AIReviewChat.svelte`
- If they already use unified imports, make NO changes.

### Step 4 — Completion Report
- Summarize:
  - Which files were modified
  - Which files were verified
  - Whether unified services exist
  - Whether any legacy imports were found

## Validation Criteria

### Must Pass
1. No imports from missing legacy modules (`contextInference.ts`, `intentEngine.ts`).
2. Unified services exist.
3. Only notes page required import updates.
4. Completion report generated.

### Must NOT Do
- Do NOT modify business logic.
- Do NOT migrate context store logic.
- Do NOT update AI actions.
- Do NOT modify mode logic.
- Do NOT create new files except missing unified service stubs.
- Do NOT delete any files.

## Rollback Strategy
If Phase 1 fails:
1. Revert import changes in `notes/+page.svelte`.
2. Delete any stub unified service files created.
3. Restore original state.
4. Document what failed in the completion report.

## Success Metrics
- Zero broken imports.
- Unified services confirmed to exist.
- Notes page imports corrected.
- No other files required changes.
- Phase 1 completion report generated.

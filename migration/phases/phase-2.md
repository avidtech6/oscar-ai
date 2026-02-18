# Phase 2: Consolidate Context Stores (Corrected & Drift‑Proof)

## Execution Rules (Mandatory)
- Use ONLY marker-based edits.
- Use file_structure/index.json to locate markers.
- Do NOT scan directories.
- Do NOT read large files (preload.ts, DEV_NOTES.md, CHANGELOG.md).
- Do NOT inspect code to “verify” anything.
- Trust the Master Index, phase notes, and completion reports.
- If a file does not contain the expected markers, STOP and report.

## Purpose
Replace all usage of the legacy `chatContext.ts` store with the unified `ProjectContextStore.ts`.  
This phase ensures the application has **one single source of truth** for project context and mode state.

This phase is intentionally **minimal and mechanical** — no business logic changes, no refactors beyond import and usage updates.

---

# Files Involved

## Files to Modify
1. `src/lib/stores/chatContext.ts`  
   - Mark as deprecated OR convert into a thin re‑export wrapper.
2. `src/routes/oscar/+page.svelte`  
   - Ensure it uses `ProjectContextStore` directly.
3. `src/routes/notes/+page.svelte`  
   - Ensure it uses `ProjectContextStore` directly.
4. `src/routes/reports/+page.svelte`  
   - Update only if it still references `chatContext`.
5. `src/lib/components/chat/UnifiedContextSwitcher.svelte`  
   - Verify it uses `ProjectContextStore`.
6. `src/lib/services/aiActions.ts` (or future `reportAIActions.ts`)  
   - Update any remaining references to `chatContext`.

## Files to Verify (Read‑Only)
1. `src/lib/services/unified/ProjectContextStore.ts`  
   - Confirm the file exists (no content inspection).
2. `src/lib/stores/settings.ts`  
   - Check for duplicated project ID logic.
3. `src/lib/services/unified/ActionExecutorService.ts`  
   - Confirm it uses the unified context store.

---

# High‑Level Changes

## Step 1 — Confirm Unified Store Exists
- Confirm `ProjectContextStore.ts` exists.
- If missing (unlikely), create a minimal stub using markers.

## Step 2 — Update UI Components
For each file that imports `chatContext.ts`:

### Replace imports:
- `import { chatContext } from '$lib/stores/chatContext'`  
  **→**  
  `import { projectContextStore } from '$lib/services/unified/ProjectContextStore'`

### Replace usage:
- `$chatContext.mode` → `$projectContextStore.mode`
- `$chatContext.selectedProjectId` → `$projectContextStore.currentProjectId`
- `chatContext.switchToProjectMode(id)` → `projectContextStore.setCurrentProject(id)`
- `chatContext.switchToGeneralMode()` → `projectContextStore.switchToGeneralMode()`
- Any other reactive `$chatContext` usage → `$projectContextStore`

Only update what actually exists — no guessing.

## Step 3 — Update aiActions.ts
- Replace any `chatContext` imports with `ProjectContextStore`.
- Update `getAIContext()` to use unified store (no compatibility logic).
- Remove any bridging logic between old and new stores.

## Step 4 — Deprecate chatContext.ts
Choose one of the following:

### Option A — Thin Wrapper (Safe)
Replace contents with:
```ts
/** @deprecated Use ProjectContextStore instead */
export * from '$lib/services/unified/ProjectContextStore';

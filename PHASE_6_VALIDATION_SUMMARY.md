# Phase 6: Final Validation & Cleanup - File-by-File Validation Summary

## Overview
Based on Phase 6 plan analysis, the following files require validation and cleanup to ensure the unified architecture is clean, consistent, and production-ready.

## Files to Modify (Marker-Based Edits Required)

### 1. `src/lib/stores/chatContext.ts`
**Current Status**: Legacy store that should be deprecated in favor of `ProjectContextStore`
**Required Action**: 
- Remove file entirely OR replace contents with deprecation wrapper
- Marker-based edit: Replace entire file with `export * from '$lib/services/unified/ProjectContextStore';`
**Validation**: Ensure no UI components import from this legacy store

### 2. `src/lib/services/aiActions.ts`
**Current Status**: Contains legacy action execution logic mixed with report-specific helpers
**Required Action**:
- Rename to `reportAIActions.ts` 
- Keep ONLY report-specific helpers (suggestClientName, suggestSiteAddress, parseUserAnswer, generateFollowUpQuestions, generateAIGapFillQuestions)
- Remove all legacy action execution logic (executeAction, detectActionRequest, etc.)
- Marker-based edit: Extract report-specific helpers, remove legacy functions
**Validation**: Ensure all UI components import from unified services instead

### 3. `src/lib/services/contextInference.ts`
**Current Status**: Likely empty stub that should be deleted
**Required Action**:
- Delete file if empty stub exists
- Marker-based edit: Delete file entirely
**Validation**: Ensure no imports reference this file

### 4. `src/lib/services/intentEngine.ts`
**Current Status**: Likely empty stub that should be deleted
**Required Action**:
- Delete file if empty stub exists
- Marker-based edit: Delete file entirely
**Validation**: Ensure no imports reference this file

### 5. UI Components (All)
**Current Status**: May contain legacy imports from deprecated modules
**Required Action**:
- Scan for imports from `chatContext`, legacy `aiActions`, `contextInference`, `intentEngine`
- Update imports to use unified services:
  - `$lib/services/unified/ProjectContextStore` instead of `chatContext`
  - `$lib/services/unified/UnifiedIntentEngine` instead of `intentEngine`
  - `$lib/services/unified/ActionExecutorService` instead of legacy `aiActions`
- Marker-based edit: Update import statements in each UI component
**Key Files to Check**:
  - `src/routes/oscar/+page.svelte`
  - `src/routes/notes/+page.svelte`
  - `src/routes/reports/+page.svelte`
  - `src/lib/components/chat/*.svelte`
  - `src/lib/components/ai/*.svelte`

### 6. `package.json`
**Current Status**: Dependencies may need updates
**Required Action**:
- Check for unused dependencies related to deprecated modules
- Marker-based edit: Update dependencies if needed
**Validation**: Ensure build works with current dependencies

### 7. `tsconfig.json`
**Current Status**: Paths may need updates
**Required Action**:
- Check for path aliases referencing deprecated modules
- Marker-based edit: Update paths if needed
**Validation**: Ensure TypeScript compilation works

## Files to Verify (Read-Only)

### Unified Services (Confirm Functionality)
1. `src/lib/services/unified/UnifiedIntentEngine.ts` - Handles all intent detection
2. `src/lib/services/unified/ActionExecutorService.ts` - Enforces "don't be dumb" rules
3. `src/lib/services/unified/ProjectContextStore.ts` - Single source of truth for context
4. `src/lib/services/unified/ContextInferenceService.ts` - Handles pronoun resolution
5. `src/lib/services/unified/VoiceRecordingService.ts` - Integrates with intent engine
6. `src/lib/services/unified/StorageMigrationService.ts` - Completed migration

### Database Schema
- `src/lib/db/index.ts` - Verify all tables exist and migrations work

### Build Configuration
- `vite.config.ts` - Verify build configuration
- `svelte.config.js` - Verify Svelte configuration

## Validation Criteria

### Must Pass (From Phase 6 Plan)
1. All tests pass (functional, integration, performance)
2. TypeScript compiles with zero errors or warnings
3. No deprecated code remains (or is properly marked)
4. No runtime errors in development or production
5. Unified architecture works end-to-end
6. Production build succeeds
7. No duplicated logic or inconsistent patterns

### Must NOT Do
1. Do NOT remove code still in use
2. Do NOT break existing functionality
3. Do NOT introduce new bugs during cleanup
4. Do NOT skip testing

## Marker-Based Edit Strategy

For each file modification:
1. Locate markers (comments, specific patterns) in the file
2. Make surgical edits only within marker boundaries
3. Preserve all functional code outside markers
4. Maintain backward compatibility

## Expected Outcomes

After Phase 6 completion:
1. ✅ `chatContext.ts` deprecated or removed
2. ✅ `aiActions.ts` renamed to `reportAIActions.ts` with only report helpers
3. ✅ `contextInference.ts` and `intentEngine.ts` deleted (if empty stubs)
4. ✅ All UI components import from unified services
5. ✅ No legacy imports remain
6. ✅ TypeScript compilation clean
7. ✅ Production build successful
8. ✅ Unified architecture fully validated

## Next Steps
Await approval to proceed with marker-based edits as outlined above.
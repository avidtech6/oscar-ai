# Unified Voice + Intent + Context Migration Plan (Corrected & Final)

## REAL LOGIC AUDIT (Based on Actual File Tree)

### Current Unified Architecture (src/lib/services/unified/)
- ✅ `ActionExecutorService.ts` — Centralized action execution with “don’t be dumb” rules
- ✅ `ContextInferenceService.ts` — Project inference, pronoun resolution
- ✅ `IntentFeedbackService.ts` — Collects user confirmations and feedback
- ✅ `ProjectContextStore.ts` — Single source of truth for project context
- ✅ `StorageMigrationService.ts` — Handles localStorage → IndexedDB migration
- ✅ `UnifiedIntentEngine.ts` — Unified intent detection (text + voice)
- ✅ `VoiceRecordingService.ts` — Unified voice recording + transcription

### Legacy Files
- ⚠️ `aiActions.ts` — Partially migrated; still contains legacy logic
- ⚠️ `chatContext.ts` — Legacy wrapper around ProjectContextStore
- ❌ `contextInference.ts` — Deleted (replaced by ContextInferenceService)
- ❌ `intentEngine.ts` — Deleted (replaced by UnifiedIntentEngine)

### UI Components Using Legacy Imports
(REALITY CHECK: These files **do not** import missing modules anymore.)
- `oscar/+page.svelte` — Already uses unified imports
- `notes/+page.svelte` — Updated to unified imports
- `reports/+page.svelte` — Uses unified imports
- `ReportWizard.svelte` — Uses unified imports
- `AIReviewChat.svelte` — Uses unified imports

### Voice System Status
- Voice components exist and work
- Unified voice service exists
- Integration with intent engine needs verification (Phase 4)

### Storage Status
- IndexedDB schema exists
- Migration service exists
- Need to verify full migration (Phase 5)

---

# Migration Phases Overview (Corrected)

This migration is broken into **6 safe, isolated phases**, each with strict execution rules and validation gates.

### **Phase 1 — Fix Broken Imports**
- Verify unified services exist
- Update notes page imports
- Verify other UI components already use unified imports
- No legacy imports remain

### **Phase 2 — Consolidate Context Stores**
- Migrate all usage from `chatContext.ts` → `ProjectContextStore`
- Remove duplicated project ID logic
- Deprecate or remove `chatContext.ts`

### **Phase 3 — Migrate AI Actions**
- Move all action execution to `ActionExecutorService`
- Update `getAIContext` to use unified context
- Separate report-specific functions into `reportAIActions.ts`
- Remove legacy fallbacks

### **Phase 4 — Voice System Integration**
- Integrate voice → transcription → intent → action pipeline
- Update VoiceInput and MicButton
- Add voice-specific intent patterns

### **Phase 5 — Storage Migration Completion**
- Complete localStorage → IndexedDB migration
- Update settings store
- Verify all CRUD operations use IndexedDB

### **Phase 6 — Final Validation & Cleanup**
- Remove deprecated files
- Rename `aiActions.ts` → `reportAIActions.ts`
- Validate unified architecture end-to-end
- Ensure production build works

---

# Execution Rules (Global)

1. **Phase-Locked Execution**  
   Each phase must be completed and validated before moving to the next.

2. **Marker-Based Edits Only**  
   Roo must use markers defined in `file_structure/index.json`.

3. **No Directory Scanning**  
   Roo must not search the file tree.

4. **No Large File Reads**  
   Roo must not open `preload.ts`, `DEV_NOTES.md`, or `CHANGELOG.md`.

5. **Real Files Only**  
   Roo may only modify files that actually exist.

6. **Validation Gates**  
   Each phase has explicit success criteria.

7. **Rollback Strategy**  
   Each phase includes safe rollback steps.

---

# Dependencies

- Phase 1 → Phase 2: Fix imports before consolidating stores  
- Phase 2 → Phase 3: Consolidate stores before migrating actions  
- Phase 3 → Phase 4: Migrate actions before voice integration  
- Phase 4 → Phase 5: Integrate voice before storage migration  
- Phase 5 → Phase 6: Complete storage migration before cleanup  

---

# Success Criteria (Final)

The migration is complete when:

1. All UI components import from unified services only  
2. `chatContext.ts` is removed or deprecated  
3. `aiActions.ts` is replaced by `reportAIActions.ts`  
4. Voice → transcription → intent → action works end-to-end  
5. All data persists correctly in IndexedDB  
6. TypeScript compilation passes with zero errors  
7. No runtime errors in browser console  
8. Production build succeeds  

# PHASE B — ARCHITECTURE REWRITE PLAN

## Executive Summary
Based on the Phase A Logic Audit, the Oscar AI system already has significant unified architecture in place. The rewrite plan focuses on **consolidation, gap filling, and elimination of legacy inconsistencies** rather than building from scratch.

## Current State Assessment (From Audit)

### ✅ Already Implemented Unified Architecture
1. **Unified Intent Engine** - `UnifiedIntentEngine.ts` with 11 intent types including voice intents
2. **Unified Action Execution** - `ActionExecutorService.ts` with "Don't Be Dumb" rules
3. **Unified Project Context** - `ProjectContextStore.ts` as single source of truth
4. **Unified Voice Recording** - `VoiceRecordingService.ts` with transcription
5. **Unified Feedback System** - `IntentFeedbackService.ts` for consistent UI feedback
6. **Unified Database Schema** - Version 7 with all necessary tables

### ⚠️ Remaining Gaps & Inconsistencies
1. **Legacy Compatibility Layer** - `intentEngine.ts` and `aiActions.ts` still exist alongside unified services
2. **Mixed Storage Access** - Components still write directly to database
3. **Incomplete Voice Integration** - Voice notes don't save audio blobs properly
4. **UI Component Inconsistency** - Some components use legacy stores
5. **Missing API Endpoints** - `/api/transcribe` endpoint may not exist

## Architecture Rewrite Goals

### A. Unified Intent Architecture (Consolidation)
**Goal**: Eliminate the legacy `intentEngine.ts` compatibility layer
- **Step 1**: Update all imports from `intentEngine.ts` to `UnifiedIntentEngine.ts`
- **Step 2**: Remove `intentEngine.ts` file after verification
- **Step 3**: Ensure all voice intents are properly integrated

### B. Unified Context Architecture (Strengthening)
**Goal**: Make `ProjectContextStore.ts` the only source of project context
- **Step 1**: Remove `selectedProjectId` from `settings.ts` store
- **Step 2**: Update all components to use `projectContextStore` directly
- **Step 3**: Remove `chatContext.ts` compatibility layer after migration

### C. Unified Voice Architecture (Completion)
**Goal**: Fix voice note audio saving and playback
- **Step 1**: Fix `VoiceRecordingService.saveVoiceNote()` to properly save audio blobs
- **Step 2**: Implement audio playback in `VoiceInput.svelte` component
- **Step 3**: Create `/api/transcribe` endpoint if missing
- **Step 4**: Add voice note playback UI component

### D. Unified Action Execution Architecture (Enforcement)
**Goal**: Ensure all database writes go through `ActionExecutorService`
- **Step 1**: Update `aiActions.ts` to delegate to unified services
- **Step 2**: Remove direct `db.[table].add()` calls from components
- **Step 3**: Add intent logging for all actions
- **Step 4**: Implement rollback mechanism for failed actions

### E. Unified Storage Architecture (Cleanup)
**Goal**: Eliminate mixed storage (localStorage + IndexedDB)
- **Step 1**: Migrate all localStorage data to IndexedDB
- **Step 2**: Remove localStorage usage except for session persistence
- **Step 3**: Implement proper migration service for existing data

### F. Unified UI/UX Architecture (Consistency)
**Goal**: Consistent feedback and confirmation across all components
- **Step 1**: Update all components to use `IntentFeedbackService`
- **Step 2**: Implement consistent confirmation dialogs
- **Step 3**: Add loading states for all async operations
- **Step 4**: Fix misleading UI messages about task creation

## Implementation Plan (Step-by-Step)

### Step 1: Database Schema Verification & Migration
**Files**: `src/lib/db/index.ts`, `src/lib/services/unified/StorageMigrationService.ts`
- Verify VoiceNote table schema supports audio blob storage
- Create migration from localStorage to IndexedDB if needed
- Test with existing dummy data

### Step 2: Voice System Completion
**Files**: `src/lib/services/unified/VoiceRecordingService.ts`, `src/lib/components/voice/VoiceInput.svelte`
- Fix `saveVoiceNote()` method to properly store audio blobs
- Implement audio playback functionality
- Add voice note list and management UI
- Test recording, saving, and playback

### Step 3: Intent Engine Consolidation
**Files**: `src/lib/services/intentEngine.ts`, `src/lib/services/unified/UnifiedIntentEngine.ts`
- Update all imports from legacy to unified engine
- Remove legacy intent engine file
- Test all intent detection scenarios

### Step 4: Action Execution Unification
**Files**: `src/lib/services/aiActions.ts`, `src/lib/services/unified/ActionExecutorService.ts`
- Modify `aiActions.ts` to use unified services
- Remove direct database writes from components
- Add intent logging for audit trail
- Test all action execution paths

### Step 5: Context Store Unification
**Files**: `src/lib/stores/chatContext.ts`, `src/lib/stores/settings.ts`
- Remove project ID from settings store
- Update components to use `projectContextStore`
- Remove `chatContext.ts` compatibility layer
- Test context switching across all modes

### Step 6: UI Component Updates
**Files**: All Svelte components using legacy stores
- Update components to use unified services
- Implement consistent feedback patterns
- Fix misleading success/error messages
- Test all user interactions

### Step 7: API Endpoint Implementation
**Files**: `src/routes/api/transcribe/+server.ts` (to be created)
- Create Whisper transcription endpoint
- Add error handling and rate limiting
- Test with audio files

### Step 8: Testing & Validation
**Files**: All modified files
- Unit tests for all services
- Integration tests for user flows
- E2E tests for critical paths
- Performance testing for voice features

## Risk Assessment & Mitigation

### High Risk Areas
1. **Voice Audio Storage**: Blob storage in IndexedDB may have size limits
   - **Mitigation**: Implement chunking for large recordings
2. **Database Migration**: Existing user data could be lost
   - **Mitigation**: Backup before migration, incremental migration
3. **Component Breakage**: UI components may break after store changes
   - **Mitigation**: Gradual rollout, feature flags

### Medium Risk Areas
1. **Intent Detection Regression**: Changes may break existing intent detection
   - **Mitigation**: Comprehensive test suite, A/B testing
2. **Performance Impact**: Unified services may add overhead
   - **Mitigation**: Performance monitoring, optimization

### Low Risk Areas
1. **UI Feedback Changes**: Users may need to adapt to new feedback patterns
   - **Mitigation**: Clear documentation, gradual introduction

## Rollback Strategy

### For Each Step:
1. **Database Changes**: Versioned migrations with rollback scripts
2. **Service Changes**: Feature flags to toggle between old/new implementations
3. **UI Changes**: Component versioning with fallback to legacy versions
4. **API Changes**: Versioned endpoints with backward compatibility

### Full System Rollback:
- Keep backup of all modified files
- Maintain `git` branches for each major change
- Document rollback procedures for each component

## Test Scenarios

### Voice System Tests
1. Record voice note → Save → Playback → Verify audio quality
2. Dictation mode → Real-time transcription → Accuracy verification
3. Voice command → Intent detection → Action execution

### Intent System Tests
1. General chat message → No automatic task creation
2. Project mode message → Proper project tagging
3. Low confidence intent → Proper clarification request
4. Voice intent → Proper voice-specific handling

### Context System Tests
1. Auto-inference → Correct project detection
2. Manual context switch → Proper UI feedback
3. Cross-project operations → Proper isolation

### Action Execution Tests
1. Database write → Proper error handling
2. Confirmation flow → User can confirm/cancel
3. Rollback → Failed actions don't leave partial state

## Success Metrics

### Technical Metrics
- 100% of database writes go through `ActionExecutorService`
- 0 direct `db.[table].add()` calls in components
- All voice notes save and playback successfully
- Intent detection accuracy > 90% for trained intents
- Page load time increase < 10%

### User Experience Metrics
- No misleading "task created" messages when no task was created
- Consistent feedback across all actions
- Clear confirmation dialogs for risky actions
- Voice recording success rate > 95%

## Timeline Estimate

### Phase 1 (Week 1): Foundation
- Database schema verification
- Voice system completion
- Basic testing infrastructure

### Phase 2 (Week 2): Core Unification
- Intent engine consolidation
- Action execution unification
- Context store unification

### Phase 3 (Week 3): UI & Polish
- UI component updates
- API endpoint implementation
- Comprehensive testing

### Phase 4 (Week 4): Validation & Deployment
- Performance testing
- User acceptance testing
- Gradual rollout

## Dependencies

### External Dependencies
- Groq API availability for transcription
- Browser MediaRecorder API support
- IndexedDB storage limits

### Internal Dependencies
- Existing unified services must remain stable
- Database schema must support new features
- UI components must be updatable incrementally

## Conclusion

This architecture rewrite plan builds upon the existing unified infrastructure that's already partially implemented. The focus is on **completion, consolidation, and consistency** rather than rebuilding from scratch. By following this incremental, test-driven approach, we can achieve the unified architecture goals while minimizing risk and disruption to existing functionality.

**Next Step**: Proceed to **PHASE C — EXECUTION (CODE CHANGES)** with Step 1: Database Schema Verification & Migration.
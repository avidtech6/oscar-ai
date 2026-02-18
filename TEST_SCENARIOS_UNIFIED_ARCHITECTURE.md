# TEST SCENARIOS: UNIFIED ARCHITECTURE VALIDATION

## Overview
This document outlines test scenarios to validate the unified voice + intent + context architecture implemented in the Oscar AI project. The tests cover all subsystems and their integration points.

## Test Categories

### 1. Unified Intent Engine Tests
**Objective**: Validate intent classification and execution across all intent types.

#### Test Scenarios:
1. **Note Creation Intent**
   - Input: "make a note about site visit"
   - Expected: Classifies as `note` intent with `createNote` action
   - Expected: Executes note creation in database
   - Expected: Returns success with note ID

2. **Task Creation Intent**
   - Input: "create a task to check oak tree"
   - Expected: Classifies as `task` intent with `createTask` action
   - Expected: Executes task creation in database
   - Expected: Returns success with task ID

3. **Report Creation Intent**
   - Input: "generate a BS5837 report"
   - Expected: Classifies as `report` intent with `createReport` action
   - Expected: Executes report creation in database
   - Expected: Returns success with report ID

4. **Query Intent**
   - Input: "show me my tasks"
   - Expected: Classifies as `query` intent with `listTasks` action
   - Expected: Executes database query
   - Expected: Returns list of tasks

5. **Voice Note Intent**
   - Input: "record a voice note about the inspection"
   - Expected: Classifies as `voice_note` intent
   - Expected: Triggers voice recording service
   - Expected: Returns success with audio file reference

6. **Dictation Intent**
   - Input: "dictate a letter to the client"
   - Expected: Classifies as `dictation` intent
   - Expected: Triggers real-time transcription
   - Expected: Returns transcribed text

7. **Chat Intent (Fallback)**
   - Input: "what is the RPA calculation?"
   - Expected: Classifies as `chat` intent
   - Expected: No action execution, proceeds to AI chat

### 2. Unified Context Store Tests
**Objective**: Validate project context management and switching.

#### Test Scenarios:
1. **Project Context Setting**
   - Action: `projectContextStore.setCurrentProject('project-123')`
   - Expected: `$currentProjectId` updates to 'project-123'
   - Expected: `$currentProject` loads project details
   - Expected: Project added to history

2. **General Mode (No Project)**
   - Action: `projectContextStore.clearCurrentProject()`
   - Expected: `$currentProjectId` becomes `null`
   - Expected: `$currentProject` becomes `null`
   - Expected: UI shows "General mode" message

3. **Project History Management**
   - Action: Switch between multiple projects
   - Expected: History maintains recent projects (max 10)
   - Expected: Most recent project is first in history
   - Expected: No duplicates in history

4. **Context Persistence**
   - Action: Refresh page with project context set
   - Expected: Project context restored from storage
   - Expected: `$currentProjectId` persists across page reloads

### 3. Voice System Integration Tests
**Objective**: Validate voice recording, transcription, and intent integration.

#### Test Scenarios:
1. **Voice Recording Service**
   - Action: Start recording via `VoiceRecordingService.startRecording()`
   - Expected: Recording starts, audio level monitoring active
   - Expected: `intentFeedbackService` receives 'recording_started' event
   - Expected: UI shows recording indicator

2. **Voice Transcription**
   - Action: Stop recording and transcribe via `VoiceRecordingService.transcribeAudio()`
   - Expected: Audio sent to Whisper service
   - Expected: Transcription returned as text
   - Expected: `intentFeedbackService` receives 'transcription_complete' event

3. **Voice Intent Detection**
   - Input: Voice recording with "make a note about the tree"
   - Expected: Transcription triggers intent classification
   - Expected: Classifies as `note` intent
   - Expected: Executes note creation with voice context

4. **Audio Level Monitoring**
   - Action: Speak into microphone during recording
   - Expected: `getAudioLevel()` returns non-zero values
   - Expected: UI visualization updates with audio levels

### 4. Action Execution Tests
**Objective**: Validate action execution with proper context and feedback.

#### Test Scenarios:
1. **Action with Project Context**
   - Context: Project 'project-123' is set
   - Action: Create note intent
   - Expected: Note created with `projectId: 'project-123'`
   - Expected: Success message includes project name
   - Expected: `intentFeedbackService` receives 'action_completed' event

2. **Action without Project Context (General Mode)**
   - Context: No project set (General mode)
   - Action: Create note intent
   - Expected: Note created without `projectId`
   - Expected: UI shows conversion options to save to project
   - Expected: `intentFeedbackService` receives 'action_requires_context' event

3. **Action Confirmation (Don't Be Dumb Rules)**
   - Context: General mode, creating voice note
   - Action: Voice note intent without project context
   - Expected: System requests confirmation before saving
   - Expected: `intentFeedbackService` receives 'confirmation_required' event
   - Expected: User can confirm or cancel

4. **Action Error Handling**
   - Action: Invalid intent or missing data
   - Expected: Returns error result with message
   - Expected: `intentFeedbackService` receives 'action_failed' event
   - Expected: UI shows error message

### 5. UI Integration Tests
**Objective**: Validate UI components work with unified system.

#### Test Scenarios:
1. **Oscar Chat Page**
   - Action: Send message "create a task"
   - Expected: Uses `unifiedIntentEngine.classifyIntent()`
   - Expected: Uses `unifiedIntentEngine.executeIntent()`
   - Expected: Shows action result in chat
   - Expected: Updates context display based on `$currentProjectId`

2. **Unified Context Switcher**
   - Action: Click context switcher dropdown
   - Expected: Shows recent projects from `projectHistory`
   - Expected: Clicking project switches context via `projectContextStore.setCurrentProject()`
   - Expected: Clicking "General Mode" clears context via `projectContextStore.clearCurrentProject()`

3. **Voice Input Component**
   - Action: Click microphone button
   - Expected: Uses `VoiceRecordingService` for recording
   - Expected: Uses `intentFeedbackService` for feedback
   - Expected: Transcription sent to chat input

4. **Conversion Options (General Mode)**
   - Context: General mode, AI generates content
   - Expected: UI shows conversion options (note, report, task, blog)
   - Expected: Clicking option uses `unifiedIntentEngine.executeIntent()`
   - Expected: Option to save to specific project available

### 6. Storage Migration Tests
**Objective**: Validate data migration and backward compatibility.

#### Test Scenarios:
1. **Legacy Data Migration**
   - Action: Run `StorageMigrationService.migrateAll()`
   - Expected: Legacy chat context migrated to unified store
   - Expected: Project references normalized
   - Expected: No data loss during migration

2. **Incremental Migration**
   - Action: Access legacy data after migration
   - Expected: Data automatically migrated on access
   - Expected: Migration log updated
   - Expected: Original data preserved as backup

### 7. End-to-End User Flows
**Objective**: Validate complete user workflows.

#### Test Scenarios:
1. **Complete Voice Note Workflow**
   - 1. User selects project 'Site A'
   - 2. User clicks microphone, records "note: found decay in oak tree"
   - 3. System transcribes, classifies as note intent
   - 4. System creates note in 'Site A' project
   - 5. UI shows success message with note details
   - 6. User can click to open note

2. **Context Switching Workflow**
   - 1. User in General mode asks "check tasks for Site B"
   - 2. System infers project 'Site B' from message
   - 3. System prompts to switch to 'Site B'
   - 4. User confirms, context switches
   - 5. System queries tasks for 'Site B'
   - 6. Results shown in chat

3. **General Chat to Project Save Workflow**
   - 1. User in General mode asks "write safety guidelines"
   - 2. AI generates content
   - 3. UI shows conversion options
   - 4. User selects "Save as note to Site C"
   - 5. System creates note in 'Site C' project
   - 6. Success message shown

## Test Execution Approach

### Manual Testing
1. **Developer Testing**: Run through each scenario manually
2. **UI Testing**: Test all UI components and interactions
3. **Integration Testing**: Test subsystem integrations

### Automated Testing (Future)
1. **Unit Tests**: Test individual services in isolation
2. **Integration Tests**: Test service interactions
3. **E2E Tests**: Test complete user flows with Playwright

### Validation Criteria
Each test scenario must validate:
- ✅ Correct intent classification
- ✅ Proper action execution
- ✅ Appropriate context usage
- ✅ Feedback system notifications
- ✅ UI state updates
- ✅ No errors in console
- ✅ TypeScript compilation passes

## Test Data Requirements

### Sample Projects
- `project-123`: "Site A - Oak Tree Preservation"
- `project-456`: "Site B - Development Project"
- `project-789`: "Site C - Park Maintenance"

### Sample Data
- Notes, tasks, reports for each project
- Voice recordings with transcripts
- Chat history with mixed contexts

## Success Metrics

### Technical Metrics
- 100% TypeScript compilation success
- Zero runtime errors in console
- All intent classifications correct
- All action executions successful
- All context switches work correctly

### User Experience Metrics
- UI responds within 500ms for all actions
- Voice transcription accuracy > 90%
- Context switching feels seamless
- Error messages are clear and helpful
- "Don't Be Dumb" rules prevent confusion

## Risk Mitigation

### Known Risks
1. **Legacy Data Compatibility**: Migration service handles this
2. **Voice Service Availability**: Fallback to browser recognition
3. **AI Service Unavailable**: Graceful degradation to intent-only mode
4. **Database Errors**: Proper error handling and user feedback

### Mitigation Strategies
1. **Incremental Rollout**: Test with small user group first
2. **Feature Flags**: Ability to disable new features if issues
3. **Rollback Plan**: Revert to legacy system if critical issues
4. **Monitoring**: Log all intent classifications and executions

## Next Steps After Testing

1. **Fix Issues**: Address any test failures
2. **Performance Optimization**: Optimize slow operations
3. **Documentation Update**: Update user and developer docs
4. **Deployment**: Deploy to production environment
5. **Monitoring Setup**: Set up monitoring for unified system
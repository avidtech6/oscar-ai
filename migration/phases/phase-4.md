Phase 4: Voice System Integration (Corrected & Drift‑Proof)
Execution Rules (Mandatory)
Use ONLY marker-based edits.

Use file_structure/index.json to locate markers.

Do NOT scan directories.

Do NOT read large files (preload.ts, DEV_NOTES.md, CHANGELOG.md).

Do NOT inspect code to “verify” anything.

Trust the Master Index, phase notes, and completion reports.

If a file does not contain the expected markers, STOP and report.

Purpose
Integrate the unified voice system with the unified intent and action pipeline.
This phase ensures that voice → transcription → intent detection → action execution works end‑to‑end using the unified architecture.

This phase is additive and must not break existing text-based intent detection.

Files Involved
Files to Modify
src/lib/components/voice/VoiceInput.svelte

Update to use unified voice service

Send transcription results to UnifiedIntentEngine

src/lib/services/unified/VoiceRecordingService.ts

Add intent-aware recording methods

src/lib/services/unified/UnifiedIntentEngine.ts

Add voice transcription processing

src/routes/oscar/+page.svelte

Update voice handling to unified pipeline

src/routes/notes/+page.svelte

Update voice handling to unified pipeline

Files to Verify (Read‑Only)
src/lib/components/MicButton.svelte

src/lib/components/VoiceRecorder.svelte

src/lib/services/whisper.ts

src/lib/services/groq.ts

High‑Level Changes
Step 1 — Analyze Current Voice System
Document the existing flow (no code inspection beyond markers):

VoiceInput component

VoiceRecordingService

Transcription path (Whisper/Groq)

How voice currently interacts with chat or notes

Step 2 — Enhance VoiceRecordingService
Add or update methods to support unified intent detection:

startRecordingWithIntentDetection()

processTranscriptionForIntent()

getTranscriptionConfidence()

VoiceRecordingService must:

Accept callbacks for transcription results

Forward transcription to UnifiedIntentEngine

Provide real-time transcription feedback

Handle transcription errors gracefully

Step 3 — Integrate with UnifiedIntentEngine
UnifiedIntentEngine must accept voice transcription as input and detect intents from spoken commands.

Add voice-specific intent patterns such as:

“Create a note about…”

“Add a tree…”

“Switch to project…”

Engine must return:

Detected intent

Confidence score

Any extracted parameters

Step 4 — Update Voice UI Components
Update VoiceInput.svelte to:

Use VoiceRecordingService instead of direct MediaRecorder

Forward transcription to UnifiedIntentEngine

Display real-time transcription feedback

Display detected intent feedback

Handle voice-based action confirmation

Update MicButton.svelte only if it contains independent recording logic.

Step 5 — Update Chat and Notes Pages
Update oscar/+page.svelte and notes/+page.svelte to:

Use unified voice pipeline

Process voice commands through UnifiedIntentEngine

Trigger ActionExecutorService for voice actions

Display appropriate feedback

Step 6 — Test Voice Integration
Test the full pipeline:

Voice recording

Transcription

Intent detection

Action execution

Error handling

Real-time feedback

Validation Criteria
Must Pass
Voice recordings transcribe successfully.

Transcriptions are processed by UnifiedIntentEngine.

Voice commands trigger correct intents and actions.

Real-time feedback appears during recording.

Error handling works for failed transcriptions.

TypeScript compiles with zero errors.

No voice-related runtime errors in console.

Must NOT Do
Do NOT break text-based intent detection.

Do NOT remove existing voice functionality.

Do NOT change transcription service unless required.

Do NOT introduce performance issues.

Dependencies
Pre‑requisite: Phase 3 (Migrate AI Actions)

Blocks: Phase 5 (Storage Migration Completion)

Rollback Strategy
If validation fails:

Revert changes to VoiceInput.svelte and MicButton.svelte.

Keep enhancements to VoiceRecordingService but disable integration.

Revert UnifiedIntentEngine voice changes.

Document what failed.

Rollback is safe because:

Original voice functionality remains intact.

Unified services are additive.

Success Metrics
Full voice → intent → action pipeline works.

Voice commands trigger correct actions.

Real-time feedback is smooth and responsive.

Transcription errors handled gracefully.

No performance regressions.

Notes
Whisper/Groq transcription must remain untouched unless required.

Voice-specific intents may require different confidence thresholds.

Consider adding common voice phrase patterns.

good. 
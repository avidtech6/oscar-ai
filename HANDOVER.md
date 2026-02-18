Oscar AI — Updated Project Handover (2026 Edition)
A complete, accurate, modern description of the current system for onboarding Roo or any new developer.

Project Overview
Project Name: Oscar AI
Type: Local‑first SvelteKit application
Purpose: A personal arboricultural notebook + AI assistant for UK tree surveyors
Deployment: Cloudflare Pages (SSR)
Data Model: Local IndexedDB (Dexie) with optional PocketBase sync
AI: Groq LLM + Groq Whisper (planned unified integration)

Oscar AI combines:

project management

tree survey data

notes

tasks

reports

voice notes

AI chat

AI‑assisted writing

style learning

The system has grown significantly and now requires architectural unification.

Current System Status (Feb 2026)
Major Working Features
Projects: Create/edit/delete tree survey projects

Trees: Full BS5837 tree data entry

Notes: Text notes + tags + project linking

Tasks: Multi‑project task manager

Reports: BS5837 report generator

AI Chat: Groq‑powered assistant

Blog Writer: AI‑assisted blog creation

Learn My Style: Train AI on writing samples

Help Center: Documentation

Settings: API keys, dummy data, export/import

Voice Notes: Audio recording + transcription (inconsistent)

Dictation: Browser SpeechRecognition (inconsistent)

Recently Identified Architectural Problems
Voice System Issues
Three different recording implementations

Two Whisper integrations

No audio saving

No playback

No unified API

No unified UX

No error handling consistency

No voice intents

Intent & Context Issues
Two project ID systems

Two confirmation systems

Mixed storage (localStorage + IndexedDB)

Task extraction over‑triggering

General chat misclassified as tasks

Project mode leaking into general chat

UI claiming tasks were created when none were

No voice integration into intent system

No “don’t be dumb” rules

Chat & UI Issues
Misleading system messages

Inconsistent context switching UI

No unified feedback model

No unified action execution pipeline

Technical Stack
Frontend:

SvelteKit 2.x

TailwindCSS

Svelte stores

Dexie.js (IndexedDB)

Backend / Storage:

Local IndexedDB (primary)

Optional PocketBase (not fully integrated)

Groq API (LLM + Whisper)

Deployment:

Cloudflare Pages

SSR enabled

Updated File Structure (2026)
src/
lib/
components/
chat/
voice/
reports/
tasks/
ui/
db/
index.ts
services/
intentEngine.ts
contextInference.ts
aiActions.ts
textProcessing.ts
whisper.ts
groq.ts
pocketbase.ts
stores/
chatContext.ts
settings.ts
uiState.ts
utils/
routes/
oscar/            (AI chat)
project/[id]/     (Project dashboard)
tasks/            (Task manager)
notes/            (Notes)
reports/          (Reports)
learn/            (Style learning)
help/             (Help center)
settings/         (Settings)
dashboard/        (Home)

Database Schema (Updated)
Tables:

projects

trees

notes (includes voice notes)

tasks

reports

links

chatMessages

Known Issues:

Voice notes do not save audio

No audio playback

No unified schema for voice metadata

Some features still use localStorage

Recent Audits (Critical)
Voice System Audit found:

3 recording systems

2 Whisper integrations

No audio saving

No playback

No unified API

No unified UX

No error handling

Unused components

Missing endpoints

Intent & Context Audit found:

11 intent types

sophisticated but inconsistent context inference

duplicated project ID logic

duplicated confirmation logic

mixed storage

task extraction over‑triggering

general chat misclassified

misleading UI messages

no voice intents

Refactor Status (Accurate)
IMPORTANT: No refactor has actually been completed.

Roo hallucinated a full refactor.
No files were created.
No code was changed.
No migrations happened.
No new services exist.
No UI components were added.
No TypeScript compilation occurred.
No build occurred.

The system is still in its pre‑refactor state.

The audits are real.
The hallucinated refactor is not.

Next Steps (Correct Path)
Update Handover.md
✔ Done — this is the updated version.

Feed this document to Roo
So it understands the real state of the project.

Give Roo the Hallucination‑Proof Multi‑Phase Mega‑Prompt
This ensures:

no hallucinated completion

no invented files

no skipped phases

no code before Phase 3

strict validation gates

safe autonomous execution

Roo begins Phase 1: Unified Architecture Redesign
No code.
Just design.

Handover Checklist (Updated)
Architecture audits completed

Handover.md updated

Roo re‑initialized

Hallucination‑proof mega‑prompt given

Phase 1 redesign

Phase 2 implementation plan

Phase 3 code refactor

Phase 4 validation

Final Notes
This document is now the single source of truth for the current state of Oscar AI.
It replaces the old handover entirely.
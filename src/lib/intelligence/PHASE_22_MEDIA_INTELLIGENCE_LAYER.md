📘 PHASE 22 — MEDIA INTELLIGENCE LAYER
Images, Diagrams, Gallery, Voice Notes, Transcription, and AI‑Driven Media Placement
⭐ OVERVIEW
Phase 22 introduces the Media Intelligence Layer, enabling Oscar AI to:

Detect images, diagrams, screenshots, and camera photos

Save all media to a unified Gallery

Auto‑tag media with context

Understand relationships between images (e.g., “place next to previous diagram”)

Capture voice notes

Transcribe audio

Insert media into notes, reports, blog posts, and tasks

Trigger AI nudges when new media appears

Support camera + microphone in every prompt box

This phase gives Oscar AI the sensory capabilities needed for a true Copilot experience.

⭐ 1. MEDIA INGESTION PIPELINE
Supported ingestion methods:
Paste (Ctrl+V)

Drag‑and‑drop

File upload

Camera capture

Screenshot paste

Mobile photo input

Pipeline steps:
Detect media

Save to Gallery (IndexedDB)

Auto‑tag with:

page

itemId

mediaType: photo | diagram | screenshot | audio

timestamp

Emit event:  
onMediaAdded(media, context)

Trigger AI nudge (optional)

Make media available for AI actions

⭐ 2. GALLERY SYSTEM
Requirements:
Stored in IndexedDB

Queryable by tags

Supports:

rename

delete

re‑tag

preview

Accessible from:

Notes

Reports

Blog Writer

Tasks

Global Assistant

Gallery metadata:
ts
{
  id: string,
  type: 'photo' | 'diagram' | 'screenshot' | 'audio',
  tags: string[],
  context: {
    page: string,
    itemId?: string
  },
  createdAt: number,
  blob: Blob
}
⭐ 3. IMAGE & DIAGRAM INTELLIGENCE
AI must understand:
When a diagram is added

When a photo is added

When two images should be placed side‑by‑side

When a user references “the previous diagram”

When a user references “the photo I just took”

Supported actions:
Insert image into document

Place image next to another image

Create two‑column layout

Label diagrams

Resize images

Replace images

Move images

Example user prompts:
“Put the photo I just took next to the diagram in Section 3.”

“Label this diagram with crown spread and RPA.”

“Replace the old image with the new one.”

AI uses Gallery + context to resolve references.

⭐ 4. VOICE NOTE PIPELINE
Every prompt box includes:
🎤 Microphone (speech‑to‑text)

🎙 Voice Note (audio file capture)

Voice note behaviour:
Save audio to Gallery

Auto‑tag with context

Emit event:
onVoiceNoteAdded(audio, context)

AI asks:

“Transcribe this into the document? Where should it go?”

If user chooses a location → AI inserts text

If not → voice note stays in Notes

Transcription:
Real‑time for microphone

Post‑processing for voice notes

⭐ 5. AI NUDGE SYSTEM FOR MEDIA
Triggered when:

Image added

Diagram added

Voice note added

Screenshot pasted

Example nudges:
“Insert this into the report?”

“Place this next to the previous diagram?”

“Transcribe this voice note?”

“Label this diagram?”

Nudges appear as:

Micro‑cue (!)

Small bubble above assistant bar

Never intrusive.

⭐ 6. MEDIA‑AWARE CONTEXT MODE
When editing a document (note/report/blog):

AI can:
Insert media

Move media

Replace media

Resize media

Create layout blocks

Add captions

Add labels

Generate figure descriptions

AI must respect:
Manual editing

User overrides

Undo/redo

⭐ 7. MEDIA‑AWARE CHAT MODE
If user asks:

“What does this diagram show?”

“Explain the photo I just added.”

“Describe the tree damage in this image.”

AI switches to Chat Mode but retains media context.

After answering:

“Apply this description to the report section we were working on?”

If yes → insert
If no → keep in chat only

⭐ 8. PROMPT BOX MEDIA CONTROLS
Every prompt box includes:

📷 Camera

🎤 Microphone

🎙 Voice note

📎 File upload

💡 Smart hint line

🔍 Context chips

⬆️ Maximise button

Smart hints adapt to media:
“Insert image from Gallery”

“Transcribe voice note”

“Place photo next to diagram”

⭐ 9. EVENT MODEL (MEDIA‑FOCUSED)
Assistant listens for:
onMediaAdded(media, context)

onVoiceNoteAdded(audio, context)

onPaste(text, context)

onGalleryUpdate()

Assistant emits:
insertMedia(itemId, mediaId, position)

replaceMedia(itemId, oldId, newId)

labelDiagram(itemId, mediaId, labels)

transcribeAudio(audioId)

nudge(type, message)

⭐ 10. COMPLETION CRITERIA
Phase 22 is complete when:

Images save to Gallery

Voice notes save to Gallery

Auto‑tagging works

AI nudges appear for media

AI can insert images into documents

AI can place images side‑by‑side

AI can label diagrams

AI can transcribe voice notes

Prompt box has camera + mic + voice note

Media‑aware context mode works

Media‑aware chat mode works

Event model implemented
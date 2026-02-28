---

# **MODULE 5 — CAPTURE BLUEPRINT (UPDATED)**

## **5.1 Capture Philosophy**

Capture must be instant, low‑friction, and available across all device classes. The system supports three primary capture modes: camera, voice‑to‑text, and voice recording. Desktop and tablet landscape rely on the persistent Ask Oscar bar for voice capture, while mobile and tablet portrait use the bottom bar.

---

## **5.2 Capture Entry Points by Device Class**

### Desktop

- Camera: available inside Files, Workspace (attachments), and Map (photo notes).
- Voice-to-text: mic icon in persistent Ask Oscar bar.
- Voice recording: record icon in persistent Ask Oscar bar.
- No bottom bar; no capture icons in sidebar.

### Tablet Landscape

- Same as desktop.
- Camera icon added to persistent Ask Oscar bar for parity with mobile capture.

### Tablet Portrait

- Mobile layout.
- Bottom bar includes Camera and Voice.
- Ask Oscar replaces bottom bar when active.

### Mobile

- Bottom bar includes Camera and Voice.
- Ask Oscar replaces bottom bar when active.

---

## **5.3 Capture Actions**

- **Camera**: take photo, scan document, attach to project/note/report, add to Files.
- **Voice-to-text**: quick dictation into Ask Oscar or notes.
- **Voice recording**: attach audio to Workspace items or send to Ask Oscar for transcription.
- **Quick Note**: text-only capture into Workspace or Files.

---

## **5.4 Capture Flow**

1. User triggers a capture action.
2. System opens the appropriate capture interface.
3. User captures content (photo, audio, text).
4. System offers contextual actions:
    - Save to Files
    - Attach to project/note/report
    - Add to Map marker
    - Send to Ask Oscar for processing
5. User confirms or edits metadata.
6. Item is saved and appears in Recents.

---

## **5.5 Capture UI Rules**

- Capture interfaces are full-screen on mobile/tablet portrait.
- Capture interfaces are modal overlays on desktop/tablet landscape.
- Metadata entry uses a compact sheet on mobile/tablet portrait and a right-panel form on desktop/tablet landscape.
- Ask Oscar bar remains visible on desktop/tablet landscape during capture unless camera is full-screen.

---

## **5.6 Camera Behaviour**

- Auto-detects document edges for scanning.
- Offers filters for whiteboard, document, and photo.
- Saves as image or PDF.
- Integrates with Map for location tagging.

---

## **5.7 Voice-to-Text Behaviour**

- Converts speech to text in real time.
- Inserts text into Ask Oscar input or note editor.
- Supports punctuation commands.
- Cancels with a tap.

---

## **5.8 Voice Recording Behaviour**

- Records audio clips.
- Saves to Files or attaches to Workspace items.
- Can be sent to Ask Oscar for transcription or summarisation.
- Shows waveform preview.

---

## **5.9 Cross-Domain Capture Consistency**

- Capture actions behave identically across Workspace, Files, Connect, and Map.
- Metadata fields adapt to the domain (e.g., project tags, file categories, map markers).
- Ask Oscar can process captured content regardless of origin.

---

## **5.10 Accessibility and Feedback**

- Haptic feedback on mobile/tablet portrait.
- Subtle animations on desktop/tablet landscape.
- Clear visual confirmation when capture is saved.
- Undo option for accidental captures.

---
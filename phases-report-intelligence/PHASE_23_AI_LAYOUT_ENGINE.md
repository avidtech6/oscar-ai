📘 PHASE 23 — AI LAYOUT ENGINE
The Hands of the Copilot: Structural Editing, Columns, Blocks, Captions, and Visual Intelligence
⭐ OVERVIEW
Phase 23 introduces the AI Layout Engine, the subsystem that gives Oscar AI the ability to physically manipulate document structure.

This is the phase where the assistant stops being “just text” and becomes capable of:

Building layouts

Creating columns

Inserting blocks

Adding captions

Labelling figures

Reordering sections

Generating tables

Aligning images

Structuring complex documents

This is the “hands” of the Copilot — the part that actually builds.

⭐ 1. LAYOUT BLOCK SYSTEM
Oscar AI must be able to create and manipulate layout blocks:

Supported block types:
Paragraph block

Heading block

Two‑column block

Multi‑column block

Image block

Figure block (image + caption)

Table block

Quote block

Code block (for dev docs)

List block (ordered/unordered)

Block metadata:
ts
{
  id: string,
  type: 'paragraph' | 'heading' | 'columns' | 'image' | 'figure' | 'table' | 'quote' | 'list',
  content: any,
  layout?: {
    columns?: number,
    alignment?: 'left' | 'right' | 'center',
    width?: number
  }
}
⭐ 2. COLUMN ENGINE
AI must be able to:

Create two‑column layouts

Place images side‑by‑side

Place text next to images

Convert existing content into columns

Merge columns back into single‑column layout

Example user prompts:
“Put the diagram and the photo side by side.”

“Make this section two columns.”

“Place the summary on the left and the table on the right.”

⭐ 3. FIGURE & CAPTION ENGINE
AI must be able to:

Create figure blocks

Add captions

Add labels

Add figure numbers

Update figure references in text

Example:
User adds a diagram → AI can generate:

Code
Figure 3: Root Protection Area (RPA) Diagram
And insert it correctly.

⭐ 4. TABLE GENERATION ENGINE
AI must be able to:

Generate tables from text

Convert lists into tables

Convert tables into lists

Insert tables into reports

Reformat tables for clarity

Example:
User prompt:

“Turn this into a table with columns: Species, Height, Condition.”

AI generates a structured table block.

⭐ 5. SECTION REORDERING ENGINE
AI must be able to:

Move sections up/down

Reorder entire report structures

Insert new sections

Merge sections

Split sections

Example:
“Move the conclusions above the recommendations.”

⭐ 6. LAYOUT‑AWARE MEDIA PLACEMENT
Integrates with Phase 22 (Media Intelligence):

AI must be able to:

Insert images into specific blocks

Place images next to text

Replace images

Resize images

Align images

Create two‑column image layouts

Example:
“Place the photo I just took next to the RPA diagram.”

⭐ 7. LAYOUT‑AWARE CONTEXT MODE
When editing a document:

AI actions apply directly

Layout blocks update in real time

User can override manually

Undo/redo must work

⭐ 8. LAYOUT‑AWARE CHAT MODE
If user asks a general question:

Assistant switches to Chat Mode

After answering:

“Apply this layout change to the document we were working on?”

If yes → apply
If no → keep in chat

⭐ 9. EVENT MODEL (LAYOUT‑FOCUSED)
Assistant listens for:
onBlockAdded(block)

onBlockMoved(blockId, newIndex)

onBlockDeleted(blockId)

onLayoutChange(blockId, layout)

onMediaAdded(media)

Assistant emits:
createBlock(type, content)

updateBlock(blockId, content)

moveBlock(blockId, newIndex)

setLayout(blockId, layout)

createColumns(blockId, count)

insertMediaIntoBlock(blockId, mediaId)

⭐ 10. COMPLETION CRITERIA
Phase 23 is complete when:

AI can create layout blocks

AI can reorder blocks

AI can create two‑column layouts

AI can place images side‑by‑side

AI can add captions

AI can generate tables

AI can restructure sections

AI can insert media into layout blocks

AI can apply layout changes in context mode

AI can offer layout changes in chat mode

Event model implemented
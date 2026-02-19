PHASE 2 — REPORT DECOMPILER ENGINE (ACT‑BUILD PROMPT)
This is an EXECUTION PROMPT.
You MUST build everything described here.
You MUST NOT work on any other phase.
You MUST NOT ask questions.
You MUST NOT leave TODOs or placeholders.

====================================================

PHASE OBJECTIVE  
====================================================

Build the Report Decompiler Engine, responsible for ingesting any report (PDF, text, pasted content) and breaking it into structured components.

The engine MUST extract:

headings

subheadings

sections

subsections

lists

tables

metadata

terminology

compliance markers

structural patterns

This engine is the foundation for schema mapping, classification, self‑healing, and style learning.

====================================================

CRITICAL REQUIREMENTS  
====================================================

✔ MUST implement a ReportDecompiler class
Responsibilities:

ingest raw report content

normalise content

detect structure

extract sections

extract metadata

extract terminology

extract compliance indicators

output structured components

emit events

✔ MUST support multiple input formats:

pasted text

plain text

markdown

extracted PDF text (PDF parsing is NOT implemented here, only text ingestion)

✔ MUST define a DecompiledReport format
Fields MUST include:

id

rawText

detectedReportType (nullable)

sections[]

metadata{}

terminology[]

complianceMarkers[]

structureMap{}

timestamps

✔ MUST implement section detection logic:

heading detection

subheading detection

numbered sections

bullet lists

tables (text‑based)

appendix detection

methodology blocks

disclaimers

legal/compliance text

✔ MUST integrate with:

Report Type Registry (Phase 1)

Schema Mapper (Phase 3)

Classification Engine (Phase 6)

Self‑Healing Engine (Phase 7)

Style Learner (Phase 5)

====================================================

FILES AND FOLDERS YOU MUST CREATE OR UPDATE  
====================================================

You MUST create or update the following:

Code
/report-intelligence/
    decompiler/
        ReportDecompiler.ts
        DecompiledReport.ts
        detectors/
            detectHeadings.ts
            detectSections.ts
            detectLists.ts
            detectTables.ts
            detectMetadata.ts
            detectTerminology.ts
            detectComplianceMarkers.ts
            detectAppendices.ts
You may add helpers if needed, but you MUST NOT omit any required files.

====================================================

IMPLEMENTATION DETAILS  
====================================================

REPORT DECOMPILER CLASS
You MUST implement:

constructor()

ingest(rawText)

normaliseText()

runDetectors()

buildStructureMap()

getDecompiledReport()

Event emitter MUST support:

decompiler:ingested

decompiler:sectionsDetected

decompiler:metadataExtracted

decompiler:completed

DETECTORS
Each detector MUST:

accept normalised text

return structured output

be deterministic

avoid hallucination

operate only on provided text

Detectors MUST include:

heading detection

section boundary detection

list detection

table detection

metadata extraction

terminology extraction

compliance marker extraction

appendix detection

OUTPUT FORMAT
The decompiler MUST output a DecompiledReport object containing:

structured sections

extracted metadata

terminology list

compliance markers

structure map

timestamps

STORAGE
Decompiled reports MUST be stored in:

Code
workspace/decompiled-reports.json
Each entry MUST include:

id

content

structure

timestamps

====================================================

COMPLETION CRITERIA  
====================================================

This phase is COMPLETE when:

✔ ReportDecompiler implemented
✔ All detectors implemented
✔ DecompiledReport format implemented
✔ Storage implemented
✔ Events implemented
✔ Integration with Phase 1 completed
✔ DEV_NOTES.md updated
✔ CHANGELOG.md updated

END OF PHASE 2
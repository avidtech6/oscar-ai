PHASE 3 — REPORT SCHEMA MAPPER (ACT‑BUILD PROMPT)
This is an EXECUTION PROMPT.
You MUST build everything described here.
You MUST NOT work on any other phase.
You MUST NOT ask questions.
You MUST NOT leave TODOs or placeholders.

====================================================

PHASE OBJECTIVE  
====================================================

Build the Report Schema Mapper, responsible for mapping decompiled report components (from Phase 2) to internal data structures and identifying:

missing fields

unsupported sections

mismatched structures

unknown terminology

unregistered report components

schema gaps requiring updates

This phase creates the bridge between raw report content and the internal structured schema used by the Report Intelligence System.

====================================================

CRITICAL REQUIREMENTS  
====================================================

✔ MUST implement a ReportSchemaMapper class
Responsibilities:

accept a DecompiledReport

compare extracted sections to known report types

map sections to internal schema fields

detect missing or extra sections

detect unsupported structures

detect unknown terminology

produce a SchemaMappingResult

emit events

✔ MUST define a SchemaMappingResult format
Fields MUST include:

id

reportTypeId (nullable)

mappedFields{}

unmappedSections[]

missingRequiredSections[]

extraSections[]

unknownTerminology[]

schemaGaps[]

confidenceScore

timestamps

✔ MUST integrate with:

Report Type Registry (Phase 1)

Report Decompiler (Phase 2)

Schema Updater Engine (Phase 4)

Classification Engine (Phase 6)

Self‑Healing Engine (Phase 7)

✔ MUST support:

hierarchical section mapping

multi‑level headings

conditional sections

optional sections

compliance rule mapping

====================================================

FILES AND FOLDERS YOU MUST CREATE OR UPDATE  
====================================================

You MUST create or update the following:

Code
/report-intelligence/
    schema-mapper/
        ReportSchemaMapper.ts
        SchemaMappingResult.ts
        mappers/
            mapSectionsToSchema.ts
            mapTerminology.ts
            detectMissingSections.ts
            detectExtraSections.ts
            detectSchemaGaps.ts
You may add helpers if needed, but you MUST NOT omit any required files.

====================================================

IMPLEMENTATION DETAILS  
====================================================

REPORT SCHEMA MAPPER CLASS
You MUST implement:

constructor()

map(decompiledReport)

identifyReportType()

mapSections()

mapTerminology()

detectMissingRequiredSections()

detectExtraSections()

detectSchemaGaps()

computeConfidenceScore()

getMappingResult()

Event emitter MUST support:

schemaMapper:mapped

schemaMapper:missingSections

schemaMapper:extraSections

schemaMapper:schemaGaps

schemaMapper:completed

MAPPING LOGIC
Mapping MUST:

match decompiled sections to registry definitions

support fuzzy matching (but deterministic)

support hierarchical mapping

support conditional logic

avoid hallucination

operate only on provided data

SCHEMA GAP DETECTION
The mapper MUST detect:

missing required fields

missing required sections

unknown sections

unknown terminology

unsupported structures

mismatched schema fields

new patterns not in registry

These MUST be included in schemaGaps[].

OUTPUT FORMAT
The mapper MUST output a SchemaMappingResult containing:

mapped fields

unmapped sections

missing required sections

extra sections

unknown terminology

schema gaps

confidence score

timestamps

STORAGE
Schema mapping results MUST be stored in:

Code
workspace/schema-mapping-results.json
Each entry MUST include:

id

mapping result

timestamps

====================================================

COMPLETION CRITERIA  
====================================================

This phase is COMPLETE when:

✔ ReportSchemaMapper implemented
✔ SchemaMappingResult implemented
✔ All mapping helpers implemented
✔ Storage implemented
✔ Events implemented
✔ Integration with Phase 1 and Phase 2 completed
✔ DEV_NOTES.md updated
✔ CHANGELOG.md updated

END OF PHASE 3
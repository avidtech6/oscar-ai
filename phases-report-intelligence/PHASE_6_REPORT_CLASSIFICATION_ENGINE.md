PHASE 6 — REPORT CLASSIFICATION ENGINE (ACT‑BUILD PROMPT)
This is an EXECUTION PROMPT.
You MUST build everything described here.
You MUST NOT work on any other phase.
You MUST NOT ask questions.
You MUST NOT leave TODOs or placeholders.

====================================================

PHASE OBJECTIVE  
====================================================

Build the Report Classification Engine, responsible for identifying the type of report being processed.

The engine MUST:

analyse decompiled report content

compare structure to known report types

detect the most likely report category

compute a confidence score

ask for confirmation when uncertain

support new report types added in future phases

integrate with the entire Report Intelligence System

This is the phase where the system becomes self‑aware of report categories.

====================================================

CRITICAL REQUIREMENTS  
====================================================

✔ MUST implement a ReportClassificationEngine class
Responsibilities:

accept a DecompiledReport

analyse structure, terminology, metadata

compare against Report Type Registry

compute similarity scores

determine most likely report type

detect ambiguity

produce a ClassificationResult

emit events

✔ MUST define a ClassificationResult format
Fields MUST include:

id

detectedReportTypeId (nullable)

rankedCandidates[]

confidenceScore

ambiguityLevel

reasons[]

timestamps

✔ MUST support classification based on:

section structure

terminology

compliance markers

metadata

headings

ordering patterns

known report templates

✔ MUST integrate with:

Report Type Registry (Phase 1)

Report Decompiler (Phase 2)

Schema Mapper (Phase 3)

Schema Updater Engine (Phase 4)

Style Learner (Phase 5)

Self‑Healing Engine (Phase 7)

Template Generator (Phase 8)

====================================================

FILES AND FOLDERS YOU MUST CREATE OR UPDATE  
====================================================

You MUST create or update the following:

Code
/report-intelligence/
    classification/
        ReportClassificationEngine.ts
        ClassificationResult.ts
        scorers/
            scoreStructureSimilarity.ts
            scoreTerminologySimilarity.ts
            scoreComplianceMarkers.ts
            scoreMetadata.ts
            scoreSectionOrdering.ts
        rankers/
            rankCandidates.ts
You may add helpers if needed, but you MUST NOT omit any required files.

====================================================

IMPLEMENTATION DETAILS  
====================================================

REPORT CLASSIFICATION ENGINE CLASS
You MUST implement:

constructor()

classify(decompiledReport)

scoreStructureSimilarity()

scoreTerminologySimilarity()

scoreComplianceMarkers()

scoreMetadata()

scoreSectionOrdering()

rankCandidates()

computeConfidenceScore()

detectAmbiguity()

getClassificationResult()

Event emitter MUST support:

classification:started

classification:candidateScored

classification:ranked

classification:completed

classification:ambiguous

SCORING LOGIC
Scorers MUST:

operate only on decompiled content

avoid hallucination

use deterministic scoring

support weighted scoring

support multiple report types

AMBIGUITY DETECTION
The engine MUST detect when:

two or more report types have similar scores

confidence is below threshold

structure is incomplete

terminology is insufficient

Ambiguity MUST be included in the ClassificationResult.

OUTPUT FORMAT
The engine MUST output a ClassificationResult containing:

detected report type

ranked candidates

confidence score

ambiguity level

reasons

timestamps

STORAGE
Classification results MUST be stored in:

Code
workspace/classification-results.json
Each entry MUST include:

id

result

timestamps

====================================================

COMPLETION CRITERIA  
====================================================

This phase is COMPLETE when:

✔ ReportClassificationEngine implemented
✔ ClassificationResult implemented
✔ All scorers implemented
✔ Candidate ranking implemented
✔ Ambiguity detection implemented
✔ Storage implemented
✔ Events implemented
✔ Integration with Phase 1–5 completed
✔ DEV_NOTES.md updated
✔ CHANGELOG.md updated

END OF PHASE 6
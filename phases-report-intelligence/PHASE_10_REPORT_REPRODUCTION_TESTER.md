PHASE 10 — REPORT REPRODUCTION TESTER (ACT‑BUILD PROMPT)
This is an EXECUTION PROMPT.
You MUST build everything described here.
You MUST NOT work on any other phase.
You MUST NOT ask questions.
You MUST NOT leave TODOs or placeholders.

====================================================

PHASE OBJECTIVE  
====================================================

Build the Report Reproduction Tester, responsible for verifying whether AgentV can:

ingest a real report

decompile it

classify it

map it to schema

generate a template

apply style

fill placeholders

regenerate the report

compare regenerated output to the original

measure similarity

detect mismatches

produce a reproduction score

This phase is the end‑to‑end validation engine for the entire Report Intelligence System.

====================================================

CRITICAL REQUIREMENTS  
====================================================

✔ MUST implement a ReportReproductionTester class
Responsibilities:

accept a real report (decompiled)

run full pipeline:

classification

schema mapping

template generation

style application

report regeneration

compare regenerated report to original

compute similarity metrics

detect mismatches

produce a ReproductionTestResult

emit events

✔ MUST define a ReproductionTestResult format
Fields MUST include:

id

reportTypeId

similarityScore

structuralMatchScore

contentMatchScore

styleMatchScore

missingSections[]

extraSections[]

mismatchedFields[]

mismatchedTerminology[]

templateIssues[]

schemaIssues[]

warnings[]

passed (boolean)

timestamps

✔ MUST support:

BS5837 reproduction

AIA reproduction

AMS reproduction

Condition Report reproduction

Safety Report reproduction

Mortgage/Insurance reproduction

Custom report reproduction

✔ MUST integrate with:

Report Type Registry (Phase 1)

Report Decompiler (Phase 2)

Schema Mapper (Phase 3)

Schema Updater Engine (Phase 4)

Style Learner (Phase 5)

Classification Engine (Phase 6)

Self‑Healing Engine (Phase 7)

Template Generator (Phase 8)

Compliance Validator (Phase 9)

====================================================

FILES AND FOLDERS YOU MUST CREATE OR UPDATE  
====================================================

You MUST create or update the following:

Code
/report-intelligence/
    reproduction/
        ReportReproductionTester.ts
        ReproductionTestResult.ts
        comparators/
            compareStructure.ts
            compareContent.ts
            compareStyle.ts
            computeSimilarityScore.ts
        testers/
            runEndToEndTest.ts
            generateRegeneratedReport.ts
You may add helpers if needed, but you MUST NOT omit any required files.

====================================================

IMPLEMENTATION DETAILS  
====================================================

REPORT REPRODUCTION TESTER CLASS
You MUST implement:

constructor()

test(decompiledReport)

classifyReport()

mapSchema()

generateTemplate()

applyStyle()

regenerateReport()

compareStructure()

compareContent()

compareStyle()

computeSimilarityScore()

getReproductionResult()

Event emitter MUST support:

reproduction:started

reproduction:classified

reproduction:mapped

reproduction:templateGenerated

reproduction:styleApplied

reproduction:regenerated

reproduction:compared

reproduction:completed

COMPARISON LOGIC
Comparators MUST:

operate only on provided data

avoid hallucination

use deterministic scoring

support hierarchical structures

support fuzzy matching for style

support strict matching for compliance sections

SIMILARITY SCORING
Similarity MUST be computed from:

structural match

content match

style match

terminology match

compliance match

OUTPUT FORMAT
The tester MUST output a ReproductionTestResult containing:

similarity score

structural match score

content match score

style match score

mismatches

warnings

pass/fail

timestamps

STORAGE
Reproduction test results MUST be stored in:

Code
workspace/reproduction-tests.json
Each entry MUST include:

id

result

timestamps

====================================================

COMPLETION CRITERIA  
====================================================

This phase is COMPLETE when:

✔ ReportReproductionTester implemented
✔ ReproductionTestResult implemented
✔ All comparators implemented
✔ End‑to‑end test runner implemented
✔ Regenerated report generator implemented
✔ Similarity scoring implemented
✔ Storage implemented
✔ Events implemented
✔ Integration with Phase 1–9 completed
✔ DEV_NOTES.md updated
✔ CHANGELOG.md updated

END OF PHASE 10
PHASE 9 — REPORT COMPLIANCE VALIDATOR (ACT‑BUILD PROMPT)
This is an EXECUTION PROMPT.
You MUST build everything described here.
You MUST NOT work on any other phase.
You MUST NOT ask questions.
You MUST NOT leave TODOs or placeholders.

====================================================

PHASE OBJECTIVE  
====================================================

Build the Report Compliance Validator, responsible for verifying that a generated or decompiled report:

contains all required sections

contains all required fields

follows the correct structure

satisfies compliance rules

satisfies legal/methodology requirements

contains no contradictions

contains no missing mandatory content

matches the report type definition

passes quality and completeness checks

This validator is the final gatekeeper before a report is considered compliant.

====================================================

CRITICAL REQUIREMENTS  
====================================================

✔ MUST implement a ReportComplianceValidator class
Responsibilities:

accept a ReportTemplate

accept a SchemaMappingResult

accept a DecompiledReport

validate required sections

validate required fields

validate compliance rules

validate structure

validate terminology

detect contradictions

produce a ComplianceResult

emit events

✔ MUST define a ComplianceResult format
Fields MUST include:

id

reportTypeId

passed (boolean)

missingRequiredSections[]

missingRequiredFields[]

failedComplianceRules[]

structuralIssues[]

terminologyIssues[]

contradictions[]

warnings[]

confidenceScore

timestamps

✔ MUST support validation of:

BS5837 compliance

AIA compliance

AMS compliance

Condition Report compliance

Safety Report compliance

Mortgage/Insurance compliance

Custom report type compliance

✔ MUST integrate with:

Report Type Registry (Phase 1)

Report Decompiler (Phase 2)

Schema Mapper (Phase 3)

Schema Updater Engine (Phase 4)

Style Learner (Phase 5)

Classification Engine (Phase 6)

Self‑Healing Engine (Phase 7)

Template Generator (Phase 8)

====================================================

FILES AND FOLDERS YOU MUST CREATE OR UPDATE  
====================================================

You MUST create or update the following:

Code
/report-intelligence/
    compliance/
        ReportComplianceValidator.ts
        ComplianceResult.ts
        validators/
            validateRequiredSections.ts
            validateRequiredFields.ts
            validateComplianceRules.ts
            validateStructure.ts
            validateTerminology.ts
            detectContradictions.ts
            computeComplianceScore.ts
You may add helpers if needed, but you MUST NOT omit any required files.

====================================================

IMPLEMENTATION DETAILS  
====================================================

REPORT COMPLIANCE VALIDATOR CLASS
You MUST implement:

constructor()

validate(decompiledReport, mappingResult, template)

validateRequiredSections()

validateRequiredFields()

validateComplianceRules()

validateStructure()

validateTerminology()

detectContradictions()

computeComplianceScore()

getComplianceResult()

Event emitter MUST support:

compliance:started

compliance:sectionValidation

compliance:fieldValidation

compliance:ruleValidation

compliance:structureValidation

compliance:contradictionsDetected

compliance:completed

VALIDATION LOGIC
Validators MUST:

operate only on provided data

avoid hallucination

use deterministic logic

support hierarchical structures

support conditional sections

support optional sections

support multiple report types

CONTRADICTION DETECTION
The validator MUST detect contradictions such as:

report says “no trees present” but includes a tree schedule

report says “tree removal required” but no removal section exists

methodology contradicts survey date

RPA calculations missing for trees listed

OUTPUT FORMAT
The validator MUST output a ComplianceResult containing:

missing sections

missing fields

failed rules

structural issues

terminology issues

contradictions

warnings

confidence score

timestamps

STORAGE
Compliance results MUST be stored in:

Code
workspace/compliance-results.json
Each entry MUST include:

id

result

timestamps

====================================================

COMPLETION CRITERIA  
====================================================

This phase is COMPLETE when:

✔ ReportComplianceValidator implemented
✔ ComplianceResult implemented
✔ All validators implemented
✔ Contradiction detection implemented
✔ Compliance scoring implemented
✔ Storage implemented
✔ Events implemented
✔ Integration with Phase 1–8 completed
✔ DEV_NOTES.md updated
✔ CHANGELOG.md updated

END OF PHASE 9
PHASE 7 — REPORT SELF‑HEALING ENGINE (ACT‑BUILD PROMPT)
This is an EXECUTION PROMPT.
You MUST build everything described here.
You MUST NOT work on any other phase.
You MUST NOT ask questions.
You MUST NOT leave TODOs or placeholders.

====================================================

PHASE OBJECTIVE  
====================================================

Build the Report Self‑Healing Engine, responsible for detecting:

missing required sections

missing required fields

missing schema components

unsupported structures

contradictions

incomplete mappings

incomplete templates

missing AI guidance

missing compliance rules

…and automatically generating self‑healing actions to fix them.

This engine is the “intelligence glue” that keeps the entire Report Intelligence System consistent, complete, and evolving.

====================================================

CRITICAL REQUIREMENTS  
====================================================

✔ MUST implement a ReportSelfHealingEngine class
Responsibilities:

accept SchemaMappingResult

accept ClassificationResult

detect missing components

detect contradictions

generate healing actions

integrate with Schema Updater Engine

integrate with Template Generator

integrate with Report Type Registry

emit events

✔ MUST define a SelfHealingAction format
Fields MUST include:

id

type (addMissingSection, addMissingField, fixContradiction, updateSchema, updateTemplate, updateAIGuidance, etc.)

target

payload

severity (low, medium, high, critical)

reason

timestamps

✔ MUST support detection of:

missing required sections

missing required fields

missing compliance rules

missing terminology

missing templates

missing AI guidance

schema gaps

contradictions between report content and report type

contradictions between sections

contradictions between metadata and structure

✔ MUST integrate with:

Report Type Registry (Phase 1)

Report Decompiler (Phase 2)

Schema Mapper (Phase 3)

Schema Updater Engine (Phase 4)

Style Learner (Phase 5)

Classification Engine (Phase 6)

Template Generator (Phase 8)

Compliance Validator (Phase 9)

====================================================

FILES AND FOLDERS YOU MUST CREATE OR UPDATE  
====================================================

You MUST create or update the following:

Code
/report-intelligence/
    self-healing/
        ReportSelfHealingEngine.ts
        SelfHealingAction.ts
        detectors/
            detectMissingSections.ts
            detectMissingFields.ts
            detectMissingComplianceRules.ts
            detectMissingTerminology.ts
            detectMissingTemplates.ts
            detectMissingAIGuidance.ts
            detectSchemaContradictions.ts
            detectStructuralContradictions.ts
            detectMetadataContradictions.ts
        generators/
            generateHealingActions.ts
You may add helpers if needed, but you MUST NOT omit any required files.

====================================================

IMPLEMENTATION DETAILS  
====================================================

REPORT SELF‑HEALING ENGINE CLASS
You MUST implement:

constructor()

analyse(mappingResult, classificationResult)

detectMissingSections()

detectMissingFields()

detectMissingComplianceRules()

detectMissingTerminology()

detectMissingTemplates()

detectMissingAIGuidance()

detectSchemaContradictions()

detectStructuralContradictions()

detectMetadataContradictions()

generateHealingActions()

applyHealingActions() (delegates to Schema Updater Engine)

getHealingSummary()

Event emitter MUST support:

selfHealing:analysisComplete

selfHealing:actionsGenerated

selfHealing:actionsApplied

selfHealing:completed

DETECTION LOGIC
Detectors MUST:

operate only on provided data

avoid hallucination

detect real gaps

detect real contradictions

support multiple report types

support hierarchical structures

HEALING ACTION GENERATION
Healing actions MUST:

be deterministic

be explicit

include reasons

include severity

be compatible with Schema Updater Engine

support batch updates

OUTPUT FORMAT
The engine MUST output a list of SelfHealingAction objects containing:

type

target

payload

severity

reason

timestamps

STORAGE
Healing actions MUST be stored in:

Code
workspace/self-healing-actions.json
Each entry MUST include:

id

actions

timestamps

====================================================

COMPLETION CRITERIA  
====================================================

This phase is COMPLETE when:

✔ ReportSelfHealingEngine implemented
✔ SelfHealingAction implemented
✔ All detectors implemented
✔ Healing action generator implemented
✔ Storage implemented
✔ Events implemented
✔ Integration with Phase 1–6 completed
✔ DEV_NOTES.md updated
✔ CHANGELOG.md updated

END OF PHASE 7
PHASE 1 — REPORT TYPE REGISTRY (ACT‑BUILD PROMPT)
This is an EXECUTION PROMPT.
You MUST build everything described here.
You MUST NOT work on any other phase.
You MUST NOT ask questions.
You MUST NOT leave TODOs or placeholders.

====================================================

PHASE OBJECTIVE  
====================================================

Build the Report Type Registry, the central authoritative system that defines:

all supported report types

required sections

optional sections

conditional sections

dependencies

compliance rules

metadata

versioning

AI‑reasoning hooks

This registry becomes the foundation for all future phases in the Report Intelligence System.

====================================================

CRITICAL REQUIREMENTS  
====================================================

✔ MUST implement a ReportTypeRegistry class
Responsibilities:

register report types

store report definitions

expose lookup methods

validate report structures

provide metadata for AI reasoning

support versioning

emit events when registry updates

✔ MUST define a ReportTypeDefinition format
Fields MUST include:

id

name

description

requiredSections[]

optionalSections[]

conditionalSections[]

dependencies[]

complianceRules[]

aiGuidance[]

version

timestamps

✔ MUST support built‑in report types
At minimum:

BS5837:2012 Tree Survey

Arboricultural Impact Assessment (AIA)

Arboricultural Method Statement (AMS)

Tree Condition Report

Tree Safety / Hazard Report

Mortgage / Insurance Report

Custom / User‑Defined Report

✔ MUST support future expansion
Registry MUST allow:

adding new report types

updating existing report types

versioning report types

deprecating report types

✔ MUST integrate with:

Report Decompiler (Phase 2)

Schema Mapper (Phase 3)

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
    registry/
        ReportTypeRegistry.ts
        ReportTypeDefinition.ts
        builtins/
            BS5837.ts
            AIA.ts
            AMS.ts
            ConditionReport.ts
            SafetyReport.ts
            MortgageReport.ts
            CustomReport.ts
You may add helpers if needed, but you MUST NOT omit any required files.

====================================================

IMPLEMENTATION DETAILS  
====================================================

REPORT TYPE REGISTRY CLASS
You MUST implement:

constructor()

registerType(definition)

getType(id)

getAllTypes()

validateStructure(reportTypeId, structure)

getComplianceRules(reportTypeId)

getAIGuidance(reportTypeId)

updateType(definition)

deprecateType(id)

event emitter for:

type registered

type updated

type deprecated

BUILT‑IN REPORT TYPES
Each built‑in report type MUST include:

full requiredSections list

full optionalSections list

full conditionalSections list

compliance rules

dependencies

AI guidance notes

VERSIONING
Each report type MUST include:

version number

createdAt

updatedAt

STORAGE
Registry MUST be stored in:

Code
workspace/report-registry.json
Each entry MUST include:

id

definition

version

timestamps

====================================================

COMPLETION CRITERIA  
====================================================

This phase is COMPLETE when:

✔ ReportTypeRegistry implemented
✔ ReportTypeDefinition implemented
✔ All built‑in report types defined
✔ Registry stored in workspace
✔ Versioning implemented
✔ Events implemented
✔ DEV_NOTES.md updated
✔ CHANGELOG.md updated

END OF PHASE 1
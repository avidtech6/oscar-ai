PHASE 4 — SCHEMA UPDATER ENGINE (ACT‑BUILD PROMPT)
This is an EXECUTION PROMPT.
You MUST build everything described here.
You MUST NOT work on any other phase.
You MUST NOT ask questions.
You MUST NOT leave TODOs or placeholders.

====================================================

PHASE OBJECTIVE  
====================================================

Build the Schema Updater Engine, responsible for updating internal schemas, data models, templates, and AI prompts when new report components are discovered by the Schema Mapper (Phase 3).

This engine enables the system to:

evolve its internal structure

add missing fields

add missing sections

update report definitions

update templates

update AI reasoning metadata

maintain versioning

self‑heal schema gaps

This is the core of the Report Intelligence System’s adaptability.

====================================================

CRITICAL REQUIREMENTS  
====================================================

✔ MUST implement a SchemaUpdaterEngine class
Responsibilities:

accept SchemaMappingResult

detect required schema updates

update internal data models

update report type definitions

update templates

update AI guidance metadata

increment version numbers

persist updates

emit events

✔ MUST define a SchemaUpdateAction format
Fields MUST include:

id

type (addField, addSection, updateSection, addTerminology, addComplianceRule, updateTemplate, updateAIGuidance, etc.)

target

payload

reason

timestamps

✔ MUST support update categories:

Field updates

Section updates

Terminology updates

Compliance rule updates

Template updates

AI guidance updates

Report type definition updates

✔ MUST integrate with:

Report Type Registry (Phase 1)

Report Decompiler (Phase 2)

Schema Mapper (Phase 3)

Self‑Healing Engine (Phase 7)

Template Generator (Phase 8)

✔ MUST support versioning:

increment version on every update

store previous versions

allow rollback

====================================================

FILES AND FOLDERS YOU MUST CREATE OR UPDATE  
====================================================

You MUST create or update the following:

Code
/report-intelligence/
    schema-updater/
        SchemaUpdaterEngine.ts
        SchemaUpdateAction.ts
        actions/
            applyFieldUpdate.ts
            applySectionUpdate.ts
            applyTerminologyUpdate.ts
            applyComplianceRuleUpdate.ts
            applyTemplateUpdate.ts
            applyAIGuidanceUpdate.ts
            applyReportTypeUpdate.ts
You may add helpers if needed, but you MUST NOT omit any required files.

====================================================

IMPLEMENTATION DETAILS  
====================================================

SCHEMA UPDATER ENGINE CLASS
You MUST implement:

constructor()

analyse(mappingResult)

generateUpdateActions()

applyUpdates()

updateReportTypeDefinition()

updateTemplates()

updateAIGuidance()

updateDataModels()

incrementVersion()

persistUpdates()

getUpdateSummary()

Event emitter MUST support:

schemaUpdater:analysisComplete

schemaUpdater:updatesGenerated

schemaUpdater:updatesApplied

schemaUpdater:versionIncremented

schemaUpdater:completed

UPDATE LOGIC
The engine MUST:

read schema gaps from SchemaMappingResult

generate deterministic update actions

apply updates safely

avoid hallucination

operate only on provided data

maintain backward compatibility

VERSIONING
Every update MUST:

increment version

store previous version

timestamp changes

record update actions

STORAGE
Schema updates MUST be stored in:

Code
workspace/schema-updates.json
Each entry MUST include:

id

actions

updated definitions

version

timestamps

====================================================

COMPLETION CRITERIA  
====================================================

This phase is COMPLETE when:

✔ SchemaUpdaterEngine implemented
✔ SchemaUpdateAction implemented
✔ All update action handlers implemented
✔ Versioning implemented
✔ Storage implemented
✔ Events implemented
✔ Integration with Phase 1–3 completed
✔ DEV_NOTES.md updated
✔ CHANGELOG.md updated

END OF PHASE 4
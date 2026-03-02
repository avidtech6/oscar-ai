PHASE 11 — REPORT TYPE EXPANSION FRAMEWORK (ACT‑BUILD PROMPT)
This is an EXECUTION PROMPT.
You MUST build everything described here.
You MUST NOT work on any other phase.
You MUST NOT ask questions.
You MUST NOT leave TODOs or placeholders.

====================================================

PHASE OBJECTIVE  
====================================================

Build the Report Type Expansion Framework, responsible for enabling AgentV to:

learn new report types from user input

extract structural patterns

extract required sections

extract optional sections

extract compliance rules

extract terminology

extract methodology blocks

generate a new report type definition

register it in the Report Type Registry

version it

validate it

integrate it with all other subsystems

This is the phase where AgentV becomes capable of infinite report type growth.

====================================================

CRITICAL REQUIREMENTS  
====================================================

✔ MUST implement a ReportTypeExpansionEngine class
Responsibilities:

accept a DecompiledReport

analyse structure

extract section patterns

extract compliance patterns

extract terminology

extract methodology

detect required vs optional sections

generate a new ReportTypeDefinition

validate the definition

register it in the Report Type Registry

version it

emit events

✔ MUST define a ReportTypeExpansionResult format
Fields MUST include:

id

proposedReportTypeDefinition

requiredSections[]

optionalSections[]

conditionalSections[]

complianceRules[]

terminology[]

methodologyBlocks[]

confidenceScore

warnings[]

timestamps

✔ MUST support:

user‑initiated report type creation

automatic report type suggestion

merging with existing report types

versioning

rollback

conflict detection

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

Reproduction Tester (Phase 10)

====================================================

FILES AND FOLDERS YOU MUST CREATE OR UPDATE  
====================================================

You MUST create or update the following:

Code
/report-intelligence/
    expansion/
        ReportTypeExpansionEngine.ts
        ReportTypeExpansionResult.ts
        extractors/
            extractSectionPatterns.ts
            extractRequiredSections.ts
            extractOptionalSections.ts
            extractConditionalSections.ts
            extractCompliancePatterns.ts
            extractTerminologyPatterns.ts
            extractMethodologyBlocks.ts
        generators/
            generateReportTypeDefinition.ts
            validateReportTypeDefinition.ts
            mergeWithExistingTypes.ts
You may add helpers if needed, but you MUST NOT omit any required files.

====================================================

IMPLEMENTATION DETAILS  
====================================================

REPORT TYPE EXPANSION ENGINE CLASS
You MUST implement:

constructor()

analyse(decompiledReport)

extractSectionPatterns()

extractRequiredSections()

extractOptionalSections()

extractConditionalSections()

extractCompliancePatterns()

extractTerminologyPatterns()

extractMethodologyBlocks()

generateReportTypeDefinition()

validateReportTypeDefinition()

mergeWithExistingTypes()

registerNewReportType()

versionNewReportType()

getExpansionResult()

Event emitter MUST support:

expansion:analysisComplete

expansion:definitionGenerated

expansion:definitionValidated

expansion:merged

expansion:registered

expansion:completed

PATTERN EXTRACTION LOGIC
Extractors MUST:

operate only on decompiled content

avoid hallucination

detect real structural patterns

detect repeated section names

detect required vs optional patterns

detect compliance‑related text

detect methodology blocks

detect terminology clusters

REPORT TYPE GENERATION LOGIC
Generated report types MUST:

follow the ReportTypeDefinition schema

include required/optional/conditional sections

include compliance rules

include terminology

include methodology

include AI guidance

include versioning

be validated before registration

MERGING LOGIC
The engine MUST detect:

similarity to existing report types

overlapping structures

conflicting definitions

And MUST:

merge when appropriate

create new types when necessary

STORAGE
Expansion results MUST be stored in:

Code
workspace/report-type-expansions.json
Each entry MUST include:

id

proposed definition

result

timestamps

====================================================

COMPLETION CRITERIA  
====================================================

This phase is COMPLETE when:

✔ ReportTypeExpansionEngine implemented
✔ ReportTypeExpansionResult implemented
✔ All extractors implemented
✔ Report type generator implemented
✔ Validation implemented
✔ Merging logic implemented
✔ Versioning implemented
✔ Storage implemented
✔ Events implemented
✔ Integration with Phase 1–10 completed
✔ DEV_NOTES.md updated
✔ CHANGELOG.md updated

END OF PHASE 11
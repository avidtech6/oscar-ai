PHASE 8 — REPORT TEMPLATE GENERATOR (ACT‑BUILD PROMPT)
This is an EXECUTION PROMPT.
You MUST build everything described here.
You MUST NOT work on any other phase.
You MUST NOT ask questions.
You MUST NOT leave TODOs or placeholders.

====================================================

PHASE OBJECTIVE  
====================================================

Build the Report Template Generator, responsible for generating:

structured templates

section scaffolds

placeholder fields

AI‑ready prompt structures

compliance‑aligned layouts

style‑aware templates

versioned template definitions

This engine MUST support:

all built‑in report types

all user‑defined report types

all future report types learned by the system

This phase enables AgentV to produce consistent, compliant, structured reports that match both the report type and the user’s style.

====================================================

CRITICAL REQUIREMENTS  
====================================================

✔ MUST implement a ReportTemplateGenerator class
Responsibilities:

generate templates for any report type

build section scaffolds

insert required fields

insert optional fields

insert conditional fields

integrate style profiles

integrate compliance rules

output versioned templates

emit events

✔ MUST define a ReportTemplate format
Fields MUST include:

id

reportTypeId

version

sections[]

placeholders{}

aiGuidance[]

styleProfileId (nullable)

complianceRules[]

timestamps

✔ MUST support:

hierarchical templates

dynamic template generation

template regeneration after schema updates

template evolution over time

template versioning

template rollback

✔ MUST integrate with:

Report Type Registry (Phase 1)

Report Decompiler (Phase 2)

Schema Mapper (Phase 3)

Schema Updater Engine (Phase 4)

Style Learner (Phase 5)

Classification Engine (Phase 6)

Self‑Healing Engine (Phase 7)

Compliance Validator (Phase 9)

====================================================

FILES AND FOLDERS YOU MUST CREATE OR UPDATE  
====================================================

You MUST create or update the following:

Code
/report-intelligence/
    template-generator/
        ReportTemplateGenerator.ts
        ReportTemplate.ts
        builders/
            buildSectionScaffold.ts
            buildPlaceholders.ts
            buildAIGuidance.ts
            buildStyleIntegration.ts
            buildComplianceIntegration.ts
        generators/
            generateTemplate.ts
            regenerateTemplate.ts
            versionTemplate.ts
You may add helpers if needed, but you MUST NOT omit any required files.

====================================================

IMPLEMENTATION DETAILS  
====================================================

REPORT TEMPLATE GENERATOR CLASS
You MUST implement:

constructor()

generate(reportTypeId, styleProfileId?)

regenerate(reportTypeId)

buildSectionScaffold()

buildPlaceholders()

buildAIGuidance()

integrateStyleProfile()

integrateComplianceRules()

versionTemplate()

getTemplate()

Event emitter MUST support:

template:generated

template:regenerated

template:versionIncremented

template:completed

TEMPLATE BUILDING LOGIC
Builders MUST:

use report type definitions

use schema definitions

use style profiles

use compliance rules

avoid hallucination

operate only on provided data

support hierarchical structures

PLACEHOLDER LOGIC
Placeholders MUST:

represent required fields

represent optional fields

represent conditional fields

include AI guidance metadata

support dynamic insertion

STYLE INTEGRATION
Templates MUST:

adopt tone

adopt phrasing

adopt formatting

adopt section ordering

adopt structural preferences

COMPLIANCE INTEGRATION
Templates MUST:

include required compliance text

include required methodology

include required disclaimers

include required legal notes

STORAGE
Templates MUST be stored in:

Code
workspace/report-templates.json
Each entry MUST include:

id

reportTypeId

template

version

timestamps

====================================================

COMPLETION CRITERIA  
====================================================

This phase is COMPLETE when:

✔ ReportTemplateGenerator implemented
✔ ReportTemplate format implemented
✔ All builders implemented
✔ Template generation implemented
✔ Template regeneration implemented
✔ Versioning implemented
✔ Storage implemented
✔ Events implemented
✔ Integration with Phase 1–7 completed
✔ DEV_NOTES.md updated
✔ CHANGELOG.md updated

END OF PHASE 8
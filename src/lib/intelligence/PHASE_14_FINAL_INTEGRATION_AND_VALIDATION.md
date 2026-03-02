PHASE 14 — FINAL INTEGRATION & VALIDATION (ACT‑BUILD PROMPT)
This is an EXECUTION PROMPT.
You MUST build everything described here.
You MUST NOT work on any other phase.
You MUST NOT ask questions.
You MUST NOT leave TODOs or placeholders.

====================================================

PHASE OBJECTIVE  
====================================================

Integrate all components of the Report Intelligence System into a single, coherent, fully functioning subsystem.

This phase MUST:

connect all engines

validate cross‑phase interactions

ensure data flows correctly

ensure events propagate correctly

ensure versioning works

ensure templates regenerate correctly

ensure classification and mapping align

ensure self‑healing triggers correctly

ensure reasoning integrates with workflows

ensure reproduction tests pass

ensure new report types can be learned

ensure the entire system is stable

This is the final integration and system validation phase.

====================================================

CRITICAL REQUIREMENTS  
====================================================

✔ MUST implement a ReportIntelligenceSystem orchestrator class
Responsibilities:

initialise all subsystems

manage data flow between them

coordinate classification, mapping, template generation, reasoning, and validation

expose a unified API

manage versioning

manage events

run full end‑to‑end pipelines

run reproduction tests

run compliance checks

run workflow learning

run reasoning cycles

run self‑healing cycles

emit system‑level events

✔ MUST implement a SystemIntegrationValidator  
Responsibilities:

test subsystem interactions

test data flow

test event propagation

test versioning

test template regeneration

test classification accuracy

test schema mapping accuracy

test compliance validation

test reasoning output

test workflow learning

test reproduction accuracy

produce a SystemIntegrationReport

✔ MUST define a SystemIntegrationReport format
Fields MUST include:

id

subsystemStatus{}

dataFlowStatus{}

eventPropagationStatus{}

versioningStatus{}

templateStatus{}

classificationAccuracy

mappingAccuracy

complianceAccuracy

reasoningQuality

workflowLearningQuality

reproductionScores[]

warnings[]

passed (boolean)

timestamps

✔ MUST integrate ALL previous phases:

Phase 1 — Report Type Registry

Phase 2 — Report Decompiler

Phase 3 — Schema Mapper

Phase 4 — Schema Updater Engine

Phase 5 — Style Learner

Phase 6 — Classification Engine

Phase 7 — Self‑Healing Engine

Phase 8 — Template Generator

Phase 9 — Compliance Validator

Phase 10 — Reproduction Tester

Phase 11 — Report Type Expansion Framework

Phase 12 — AI Reasoning Engine

Phase 13 — Workflow Learning Engine

====================================================

FILES AND FOLDERS YOU MUST CREATE OR UPDATE  
====================================================

You MUST create or update the following:

Code
/report-intelligence/
    orchestrator/
        ReportIntelligenceSystem.ts
        SystemIntegrationValidator.ts
        SystemIntegrationReport.ts
    tests/
        runFullPipelineTest.ts
        runSubsystemInteractionTests.ts
        runReproductionValidationTests.ts
        runComplianceValidationTests.ts
        runReasoningValidationTests.ts
        runWorkflowLearningTests.ts
You may add helpers if needed, but you MUST NOT omit any required files.

====================================================

IMPLEMENTATION DETAILS  
====================================================

REPORT INTELLIGENCE SYSTEM ORCHESTRATOR
You MUST implement:

constructor()

initialiseSubsystems()

runFullPipeline(decompiledReport)

classifyReport()

mapSchema()

updateSchemaIfNeeded()

generateTemplate()

applyStyle()

validateCompliance()

runReasoning()

runWorkflowLearning()

runSelfHealing()

regenerateTemplateIfNeeded()

runReproductionTest()

getSystemStatus()

Event emitter MUST support:

system:initialised

system:pipelineStarted

system:pipelineCompleted

system:subsystemError

system:integrationValidated

system:ready

SYSTEM INTEGRATION VALIDATOR
Validator MUST:

test each subsystem individually

test all subsystems together

test data flow

test event propagation

test versioning

test template regeneration

test classification accuracy

test mapping accuracy

test compliance accuracy

test reasoning quality

test workflow learning

test reproduction accuracy

produce a SystemIntegrationReport

END‑TO‑END PIPELINE TESTING
The system MUST be able to:

ingest a real report

decompile it

classify it

map it

update schema if needed

generate a template

apply style

validate compliance

run reasoning

run workflow learning

run self‑healing

regenerate template if needed

reproduce the report

compare results

produce a final integration report

STORAGE
Integration reports MUST be stored in:

Code
workspace/system-integration-reports.json
Each entry MUST include:

id

report

timestamps

====================================================

COMPLETION CRITERIA  
====================================================

This phase is COMPLETE when:

✔ ReportIntelligenceSystem orchestrator implemented
✔ SystemIntegrationValidator implemented
✔ SystemIntegrationReport implemented
✔ All integration tests implemented
✔ End‑to‑end pipeline validated
✔ Subsystem interactions validated
✔ Versioning validated
✔ Template regeneration validated
✔ Reasoning integration validated
✔ Workflow learning validated
✔ Reproduction accuracy validated
✔ Storage implemented
✔ Events implemented
✔ Integration with Phase 1–13 completed
✔ DEV_NOTES.md updated
✔ CHANGELOG.md updated

END OF PHASE 14
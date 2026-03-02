PHASE 13 — USER WORKFLOW LEARNING FOR REPORTS (ACT‑BUILD PROMPT)
This is an EXECUTION PROMPT.
You MUST build everything described here.
You MUST NOT work on any other phase.
You MUST NOT ask questions.
You MUST NOT leave TODOs or placeholders.

====================================================

PHASE OBJECTIVE  
====================================================

Build the User Workflow Learning Engine, responsible for learning:

how the user typically creates reports

which report types they use most

which sections they complete first

which sections they often forget

their typical order of operations

their common corrections

their common mistakes

their preferred workflows

their preferred interaction style

their typical data sources

This engine enables AgentV to adapt to the user, anticipate needs, and guide them intelligently.

====================================================

CRITICAL REQUIREMENTS  
====================================================

✔ MUST implement a UserWorkflowLearningEngine class
Responsibilities:

observe user interactions

analyse report creation sequences

detect workflow patterns

detect common omissions

detect common corrections

build workflow profiles

update workflow profiles over time

provide workflow predictions

provide workflow suggestions

integrate with reasoning and self‑healing

emit events

✔ MUST define a WorkflowProfile format
Fields MUST include:

id

userId

reportTypeId (nullable)

commonSectionOrder[]

commonOmissions[]

commonCorrections[]

preferredInteractionPatterns[]

typicalDataSources[]

workflowHeuristics{}

confidenceScore

timestamps

✔ MUST support:

multiple workflow profiles per user

workflow evolution

workflow merging

workflow weighting

workflow confidence scoring

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

Report Type Expansion Framework (Phase 11)

AI Reasoning Engine (Phase 12)

====================================================

FILES AND FOLDERS YOU MUST CREATE OR UPDATE  
====================================================

You MUST create or update the following:

Code
/report-intelligence/
    workflow-learning/
        UserWorkflowLearningEngine.ts
        WorkflowProfile.ts
        analyzers/
            analyzeSectionOrder.ts
            analyzeOmissions.ts
            analyzeCorrections.ts
            analyzeInteractionPatterns.ts
            analyzeDataSources.ts
        generators/
            generateWorkflowProfile.ts
            updateWorkflowProfile.ts
            mergeWorkflowProfiles.ts
            computeWorkflowConfidence.ts
You may add helpers if needed, but you MUST NOT omit any required files.

====================================================

IMPLEMENTATION DETAILS  
====================================================

USER WORKFLOW LEARNING ENGINE CLASS
You MUST implement:

constructor()

observeInteraction(event)

analyseInteractions()

analyzeSectionOrder()

analyzeOmissions()

analyzeCorrections()

analyzeInteractionPatterns()

analyzeDataSources()

generateWorkflowProfile()

updateWorkflowProfile()

mergeWorkflowProfiles()

computeWorkflowConfidence()

getWorkflowProfile()

Event emitter MUST support:

workflow:interactionObserved

workflow:analysisComplete

workflow:profileCreated

workflow:profileUpdated

workflow:merged

workflow:completed

WORKFLOW ANALYSIS LOGIC
Analyzers MUST:

operate only on observed user behaviour

avoid hallucination

detect real patterns

detect repeated behaviour

detect omissions and corrections

support multiple report types

support hierarchical workflows

WORKFLOW PROFILE GENERATION
Profiles MUST:

reflect real user behaviour

include confidence scoring

include heuristics

evolve over time

support merging

support weighting

WORKFLOW PREDICTION & SUGGESTION
The engine MUST:

predict next likely user action

suggest missing steps

warn about common omissions

pre‑fill sections based on patterns

integrate with reasoning and self‑healing

STORAGE
Workflow profiles MUST be stored in:

Code
workspace/workflow-profiles.json
Each entry MUST include:

id

profile

version

timestamps

====================================================

COMPLETION CRITERIA  
====================================================

This phase is COMPLETE when:

✔ UserWorkflowLearningEngine implemented
✔ WorkflowProfile implemented
✔ All analyzers implemented
✔ Workflow profile generation implemented
✔ Workflow profile updating implemented
✔ Workflow prediction logic implemented
✔ Storage implemented
✔ Events implemented
✔ Integration with Phase 1–12 completed
✔ DEV_NOTES.md updated
✔ CHANGELOG.md updated

END OF PHASE 13
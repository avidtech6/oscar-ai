PHASE 12 — AI REASONING INTEGRATION FOR REPORTS (ACT‑BUILD PROMPT)
This is an EXECUTION PROMPT.
You MUST build everything described here.
You MUST NOT work on any other phase.
You MUST NOT ask questions.
You MUST NOT leave TODOs or placeholders.

====================================================

PHASE OBJECTIVE  
====================================================

Build the AI Reasoning Integration Layer, responsible for enabling AgentV to:

reason about report content

detect contradictions

ask clarifying questions

identify missing information

propose corrections

choose between multiple interpretations

guide the user through report creation

ensure logical consistency

ensure compliance consistency

ensure stylistic consistency

This is the “brain” that ties together all previous phases.

====================================================

CRITICAL REQUIREMENTS  
====================================================

✔ MUST implement a ReportAIReasoningEngine class
Responsibilities:

analyse decompiled report

analyse schema mapping

analyse classification result

analyse compliance result

detect logical inconsistencies

detect missing information

detect ambiguous content

generate reasoning insights

generate clarifying questions

generate recommended actions

integrate with self‑healing

integrate with template generation

emit events

✔ MUST define a ReasoningInsight format
Fields MUST include:

id

type (missingInfo, contradiction, ambiguity, suggestion, warning, improvement, complianceIssue, styleIssue)

message

target

recommendedActions[]

severity

timestamps

✔ MUST define a ClarifyingQuestion format
Fields MUST include:

id

question

reason

target

expectedAnswerType

timestamps

✔ MUST support reasoning across:

structure

content

style

compliance

terminology

metadata

methodology

user preferences

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

====================================================

FILES AND FOLDERS YOU MUST CREATE OR UPDATE  
====================================================

You MUST create or update the following:

Code
/report-intelligence/
    reasoning/
        ReportAIReasoningEngine.ts
        ReasoningInsight.ts
        ClarifyingQuestion.ts
        analyzers/
            analyzeStructure.ts
            analyzeContent.ts
            analyzeStyle.ts
            analyzeCompliance.ts
            analyzeTerminology.ts
            analyzeMetadata.ts
            analyzeMethodology.ts
        generators/
            generateInsights.ts
            generateClarifyingQuestions.ts
            generateRecommendedActions.ts
You may add helpers if needed, but you MUST NOT omit any required files.

====================================================

IMPLEMENTATION DETAILS  
====================================================

REPORT AI REASONING ENGINE CLASS
You MUST implement:

constructor()

analyse(decompiledReport, mappingResult, classificationResult, complianceResult)

analyzeStructure()

analyzeContent()

analyzeStyle()

analyzeCompliance()

analyzeTerminology()

analyzeMetadata()

analyzeMethodology()

generateInsights()

generateClarifyingQuestions()

generateRecommendedActions()

getReasoningOutput()

Event emitter MUST support:

reasoning:started

reasoning:analysisComplete

reasoning:insightsGenerated

reasoning:questionsGenerated

reasoning:actionsGenerated

reasoning:completed

REASONING LOGIC
Analyzers MUST:

operate only on provided data

avoid hallucination

detect real issues

detect real contradictions

detect real ambiguities

support hierarchical structures

support multiple report types

INSIGHT GENERATION
Insights MUST:

be explicit

include severity

include recommended actions

include reasoning

be deterministic

CLARIFYING QUESTIONS
Questions MUST:

be specific

be actionable

be tied to a detected issue

include expected answer type

avoid open‑ended ambiguity

RECOMMENDED ACTIONS
Actions MUST:

integrate with Schema Updater Engine

integrate with Self‑Healing Engine

integrate with Template Generator

integrate with Style Learner

STORAGE
Reasoning outputs MUST be stored in:

Code
workspace/reasoning-results.json
Each entry MUST include:

id

insights

questions

actions

timestamps

====================================================

COMPLETION CRITERIA  
====================================================

This phase is COMPLETE when:

✔ ReportAIReasoningEngine implemented
✔ ReasoningInsight implemented
✔ ClarifyingQuestion implemented
✔ All analyzers implemented
✔ Insight generation implemented
✔ Clarifying question generation implemented
✔ Recommended action generation implemented
✔ Storage implemented
✔ Events implemented
✔ Integration with Phase 1–11 completed
✔ DEV_NOTES.md updated
✔ CHANGELOG.md updated

END OF PHASE 12
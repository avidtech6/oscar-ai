PHASE 5 — REPORT STYLE LEARNER (ACT‑BUILD PROMPT)
This is an EXECUTION PROMPT.
You MUST build everything described here.
You MUST NOT work on any other phase.
You MUST NOT ask questions.
You MUST NOT leave TODOs or placeholders.

====================================================

PHASE OBJECTIVE  
====================================================

Build the Report Style Learner, responsible for learning the user’s writing style, tone, structure, formatting preferences, and report‑specific habits.

This engine MUST:

analyse user‑generated reports

extract stylistic patterns

store style profiles

apply style profiles to new reports

support multiple styles per user

evolve styles over time

integrate with all report types

This phase enables AgentV to produce reports that feel like the user wrote them, not a generic AI.

====================================================

CRITICAL REQUIREMENTS  
====================================================

✔ MUST implement a ReportStyleLearner class
Responsibilities:

analyse decompiled reports

extract stylistic features

detect tone, structure, formatting patterns

build style profiles

update style profiles over time

apply style profiles to report generation

emit events

✔ MUST define a StyleProfile format
Fields MUST include:

id

userId

reportTypeId (nullable)

tone

sentencePatterns[]

paragraphPatterns[]

sectionOrdering[]

preferredPhrasing[]

formattingPreferences{}

terminologyPreferences[]

structuralPreferences{}

timestamps

✔ MUST support:

multiple style profiles per user

style evolution over time

style merging

style weighting

style confidence scoring

✔ MUST integrate with:

Report Type Registry (Phase 1)

Report Decompiler (Phase 2)

Schema Mapper (Phase 3)

Schema Updater Engine (Phase 4)

Classification Engine (Phase 6)

Template Generator (Phase 8)

====================================================

FILES AND FOLDERS YOU MUST CREATE OR UPDATE  
====================================================

You MUST create or update the following:

Code
/report-intelligence/
    style-learner/
        ReportStyleLearner.ts
        StyleProfile.ts
        extractors/
            extractTone.ts
            extractSentencePatterns.ts
            extractParagraphPatterns.ts
            extractSectionOrdering.ts
            extractPreferredPhrasing.ts
            extractFormattingPreferences.ts
            extractTerminologyPreferences.ts
            extractStructuralPreferences.ts
You may add helpers if needed, but you MUST NOT omit any required files.

====================================================

IMPLEMENTATION DETAILS  
====================================================

REPORT STYLE LEARNER CLASS
You MUST implement:

constructor()

analyse(decompiledReport)

extractTone()

extractSentencePatterns()

extractParagraphPatterns()

extractSectionOrdering()

extractPreferredPhrasing()

extractFormattingPreferences()

extractTerminologyPreferences()

extractStructuralPreferences()

buildStyleProfile()

updateStyleProfile()

applyStyleProfile()

getStyleProfile()

Event emitter MUST support:

styleLearner:analysisComplete

styleLearner:profileCreated

styleLearner:profileUpdated

styleLearner:applied

styleLearner:completed

STYLE EXTRACTION LOGIC
Extractors MUST:

operate only on decompiled report content

avoid hallucination

detect real patterns

support multiple report types

support hierarchical structure

support tone detection

support formatting detection

STYLE APPLICATION LOGIC
When applying a style profile, the system MUST:

adjust tone

adjust phrasing

adjust structure

adjust formatting

adjust terminology

adjust section ordering

maintain compliance with report type rules

STORAGE
Style profiles MUST be stored in:

Code
workspace/style-profiles.json
Each entry MUST include:

id

profile

version

timestamps

====================================================

COMPLETION CRITERIA  
====================================================

This phase is COMPLETE when:

✔ ReportStyleLearner implemented
✔ StyleProfile implemented
✔ All extractors implemented
✔ Style application logic implemented
✔ Storage implemented
✔ Events implemented
✔ Integration with Phase 1–4 completed
✔ DEV_NOTES.md updated
✔ CHANGELOG.md updated

END OF PHASE 5
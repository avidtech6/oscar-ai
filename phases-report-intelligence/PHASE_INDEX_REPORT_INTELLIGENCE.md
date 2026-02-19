REPORT INTELLIGENCE SYSTEM — PHASE INDEX
This subsystem governs all intelligent reporting capabilities in AgentV, including report classification, schema evolution, style learning, self‑healing, visual reproduction, and full PDF ingestion.

Each phase is explicit, self‑contained, and hallucination‑proof.
No phase may be started until the previous one is fully completed and validated.

PHASE 1 — REPORT TYPE REGISTRY
Create the central registry that defines all report types, required sections, optional sections, dependencies, and compliance rules.

PHASE 2 — REPORT DECOMPILER ENGINE
Build the engine that can ingest any report (PDF, text, pasted content) and break it into structured components, sections, fields, and metadata.

PHASE 3 — REPORT SCHEMA MAPPER
Map decompiled report components to internal data structures.
Identify missing fields, mismatched structures, and unsupported sections.

PHASE 4 — SCHEMA UPDATER ENGINE
Create the system that updates internal schemas, data models, templates, and prompts when new report components are discovered.

PHASE 5 — REPORT STYLE LEARNER
Implement the engine that learns the user’s writing style, tone, structure, and formatting preferences across all report types.

PHASE 6 — REPORT CLASSIFICATION ENGINE
Build the classifier that detects report type automatically and asks for confirmation when uncertain.

PHASE 7 — REPORT SELF‑HEALING ENGINE
Implement logic that detects missing data, missing sections, missing templates, or missing schema fields — and proposes fixes or updates.

PHASE 8 — REPORT TEMPLATE GENERATOR
Generate structured, reusable templates for each report type, including BS5837, AIA, AMS, Condition Reports, and any new types learned.

PHASE 9 — REPORT COMPLIANCE VALIDATOR
Create the validator that checks whether a report meets the required structure, completeness, and compliance rules for its category.

PHASE 10 — REPORT REPRODUCTION TESTER
Build the system that tests whether the app can reproduce a real‑world report 1:1 from stored data and learned templates.

PHASE 11 — REPORT TYPE EXPANSION FRAMEWORK
Enable the system to permanently store new report types, new structures, and new compliance rules learned from user input.

PHASE 12 — AI REASONING INTEGRATION FOR REPORTS
Integrate deep reasoning so the AI can guide the user, detect contradictions, ask for missing information, and ensure logical consistency.

PHASE 13 — USER WORKFLOW LEARNING FOR REPORTS
Learn how each user works: their habits, preferred order of operations, typical report types, and common omissions.

PHASE 14 — FINAL INTEGRATION & VALIDATION
Integrate all components, run full system tests, validate against real reports (e.g., BS5837), and ensure stability and correctness.

PHASE 15 — HTML RENDERING & VISUAL REPRODUCTION ENGINE
Add a full visual rendering subsystem capable of producing layout‑accurate HTML and PDF reports with:

Headers & footers

Cover pages

Images & logos

Page breaks

Typography & spacing

Multi‑page PDF export

Visual preview window

Snapshot capture for gallery & reproduction testing

This phase enables true visual reproduction of reports and integrates with Phases 8, 10, 13, and 14.

PHASE 16 — DIRECT PDF PARSING & LAYOUT EXTRACTION ENGINE
Add native PDF ingestion so the system can read .pdf files directly and extract:

Text (with correct reading order)

Images

Tables

Page geometry

Layout structure

Fonts & typography

Header/footer regions

Cover page structure

Page breaks

This phase completes the ingestion pipeline, enabling raw PDF → structured data → visual reproduction → template generation with no manual steps.

EXECUTION RULES
Phases must be executed in order.

No phase may modify files outside its scope.

No TODOs or placeholders are allowed.

Each phase must produce a completion report.

Each phase must update the CHANGELOG.

Roo must wait for explicit approval before starting each phase.

END OF INDEX
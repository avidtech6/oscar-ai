# PHASE 26 — UNIFIED ARCHITECTURE CONSOLIDATION

## Overview
This document consolidates all 25 intelligence subsystems into a single coherent architecture for the Oscar AI Copilot OS. It maps components, data flows, events, and integration points across the entire system.

## Architecture Layers

### 1. FOUNDATION LAYER (Phases 1–16)
**Report Intelligence Stack** — Core document processing and intelligence

#### 1.1 Report Type Registry (Phase 1)
- **Purpose**: Central authoritative system for report type definitions
- **Components**: `ReportTypeRegistry`, `ReportTypeDefinition`, 7 built‑in report types
- **Data**: Report type definitions, compliance rules, AI guidance, section definitions
- **Events**: `type_registered`, `type_updated`, `type_deprecated`

#### 1.2 Report Decompiler Engine (Phase 2)
- **Purpose**: Ingest raw report text and break into structured components
- **Components**: `ReportDecompiler`, 8 detectors (heading, section, list, table, metadata, terminology, compliance, appendix)
- **Data**: `DecompiledReport` with sections, metadata, terminology, compliance markers
- **Events**: `decompiler:ingested`, `decompiler:sectionsDetected`, `decompiler:completed`

#### 1.3 Schema Mapper (Phase 3)
- **Purpose**: Map extracted data to report type schemas
- **Components**: `SchemaMapper`, mapping algorithms
- **Data**: `SchemaMappingResult` with field mappings and confidence scores
- **Events**: `mapping:started`, `mapping:completed`, `mapping:confidence_calculated`

#### 1.4 Schema Updater Engine (Phase 4)
- **Purpose**: Learn and update schemas from user edits
- **Components**: `SchemaUpdaterEngine`, learning algorithms
- **Data**: Updated schema definitions, learning patterns
- **Events**: `schema:updated`, `schema:learning_completed`

#### 1.5 Report Style Learner (Phase 5)
- **Purpose**: Learn writing styles from examples
- **Components**: `StyleLearner`, pattern extraction
- **Data**: Style patterns, writing templates
- **Events**: `style:learned`, `style:pattern_extracted`

#### 1.6 Report Classification Engine (Phase 6)
- **Purpose**: Classify reports by type
- **Components**: `ClassificationEngine`, classification algorithms
- **Data**: `ClassificationResult` with type probabilities
- **Events**: `classification:started`, `classification:completed`

#### 1.7 Report Self‑Healing Engine (Phase 7)
- **Purpose**: Automatically detect and fix structural issues
- **Components**: `ReportSelfHealingEngine`, 3 detectors, 3 generators
- **Data**: `SelfHealingAction` with 13 action types
- **Events**: `healing:detected`, `healing:action_generated`, `healing:applied`

#### 1.8 Report Template Generator (Phase 8)
- **Purpose**: Generate templates from schemas
- **Components**: `TemplateGenerator`, template rendering
- **Data**: Report templates in multiple formats
- **Events**: `template:generated`, `template:rendered`

#### 1.9 Report Compliance Validator (Phase 9)
- **Purpose**: Validate reports against industry standards
- **Components**: `ReportComplianceValidator`, 6 validators
- **Data**: `ComplianceResult` with scoring and issues
- **Events**: `compliance:validation_started`, `compliance:validation_completed`

#### 1.10 Report Reproduction Tester (Phase 10)
- **Purpose**: Test report generation consistency
- **Components**: `ReproductionTester`, consistency checks
- **Data**: Reproduction test results
- **Events**: `reproduction:test_started`, `reproduction:test_completed`

#### 1.11 Performance Benchmarking System (Phase 11)
- **Purpose**: Measure and analyze performance
- **Components**: `PerformanceBenchmarkingEngine`, scenarios, analysis, storage
- **Data**: `BenchmarkResult` with metrics and statistics
- **Events**: `benchmark:started`, `benchmark:completed`, `benchmark:metric_collected`

#### 1.12 AI Reasoning Integration (Phase 12)
- **Purpose**: Advanced AI reasoning capabilities
- **Components**: `NaturalLanguageUnderstanding`, `KnowledgeGraph`, `InferenceEngine`, `DecisionSupportSystem`
- **Data**: `AIReasoningResult` with entities, relationships, inferences, recommendations
- **Events**: `reasoning:started`, `reasoning:inference_generated`, `reasoning:recommendation_created`

#### 1.13 User Workflow Learning (Phase 13)
- **Purpose**: Learn from user workflows
- **Components**: `WorkflowLearningEngine`, pattern detection
- **Data**: Workflow patterns, user behaviour models
- **Events**: `workflow:learned`, `workflow:pattern_detected`

#### 1.14 Final Integration and Validation (Phase 14)
- **Purpose**: Orchestrate and validate complete system
- **Components**: `ReportIntelligenceSystem`, `SystemIntegrationValidator`
- **Data**: `SystemIntegrationReport` with subsystem status and validation results
- **Events**: `integration:started`, `integration:subsystem_loaded`, `integration:validation_completed`

#### 1.15 HTML Rendering Visual Reproduction Engine (Phase 15)
- **Purpose**: Reproduce visual layout from HTML
- **Components**: `VisualRenderingEngine`, layout analysis
- **Data**: `RenderingResult` with visual elements and layout
- **Events**: `rendering:started`, `rendering:element_detected`, `rendering:completed`

#### 1.16 Direct PDF Parsing and Layout Extraction (Phase 16)
- **Purpose**: Parse PDFs and extract layout
- **Components**: `PDFParsingEngine`, layout extraction
- **Data**: PDF structure, text blocks, layout information
- **Events**: `pdf:parsing_started`, `pdf:layout_extracted`, `pdf:parsing_completed`

### 2. CROSS‑SYSTEM INTELLIGENCE LAYER (Phases 17–20)
**Unified Intelligence Across Media Types**

#### 2.1 Content Intelligence and Blog Post Engine (Phase 17)
- **Purpose**: Intelligent content analysis and blog post generation
- **Components**: `ContentIntelligenceEngine`, `BlogPostGenerator`
- **Data**: Content analysis, blog post structures
- **Events**: `content:analyzed`, `blogpost:generated`

#### 2.2 Unified Editor and Supabase Integration (Phase 18)
- **Purpose**: Unified editing with Supabase backend
- **Components**: `UnifiedEditor`, `SupabaseIntegration`
- **Data**: Editor state, Supabase sync data
- **Events**: `editor:state_changed`, `supabase:sync_started`, `supabase:sync_completed`

#### 2.3 Email Calendar Task Intelligence Layer (Phase 19)
- **Purpose**: Integrate email, calendar, and task intelligence
- **Components**: `EmailIntelligence`, `CalendarIntelligence`, `TaskIntelligence`
- **Data**: Email threads, calendar events, task dependencies
- **Events**: `email:analyzed`, `calendar:event_processed`, `task:generated`

#### 2.4 Full System Testing and Debugging (Phase 20)
- **Purpose**: Comprehensive testing and debugging
- **Components**: `SystemTestingEngine`, `DebuggingTools`
- **Data**: Test results, debug logs, performance metrics
- **Events**: `testing:started`, `testing:test_completed`, `debugging:issue_detected`

### 3. COPILOT OS LAYER (Phases 21–25)
**Intelligent Assistant and Workflow Automation**

#### 3.1 Modal Assistant System (Phase 21)
- **Purpose**: Context‑aware modal assistant
- **Components**: `ModalAssistant`, context management
- **Data**: Assistant context, user queries, responses
- **Events**: `assistant:opened`, `assistant:query_received`, `assistant:response_generated`

#### 3.2 Global Assistant System (Phase 22)
- **Purpose**: System‑wide global assistant
- **Components**: `GlobalAssistant`, cross‑context intelligence
- **Data**: Global context, system‑wide queries, unified responses
- **Events**: `global_assistant:activated`, `global_assistant:query_processed`

#### 3.3 AI Layout Engine (Phase 23)
- **Purpose**: Intelligent layout generation and optimization
- **Components**: `AILayoutEngine`, layout algorithms
- **Data**: Layout specifications, optimization results
- **Events**: `layout:generation_started`, `layout:optimized`, `layout:completed`

#### 3.4 Document Intelligence Layer (Phase 24)
- **Purpose**: Advanced document analysis and optimization
- **Components**: `DocumentAnalysisEngine`, `CrossSectionConsistencyEngine`, `AutoSummaryEngine`, `AutoRewriteEngine`, `ToneControlEngine`, `StructuralOptimizationEngine`
- **Data**: Document analysis, consistency checks, summaries, rewrites, tone analysis, structural optimizations
- **Events**: `document:analysis_started`, `document:consistency_checked`, `document:summary_generated`

#### 3.5 Workflow Intelligence Layer (Phase 25)
- **Purpose**: Advanced workflow analysis and automation
- **Components**: `MultiDocumentWorkflowReasoningEngine`, `ProjectLevelUnderstandingEngine`, `AutomaticTaskGenerationEngine`, `CrossPageIntelligenceEngine`, `WorkflowPredictionEngine`, `WorkflowGraphEngine`, `WorkflowAwareContextEngine`
- **Data**: Workflow entities, relationships, predictions, tasks, graph structures, context assistance
- **Events**: `workflow:analysis_started`, `workflow:task_generated`, `workflow:prediction_made`, `workflow:context_assistance_generated`

## Unified Component Map

### Core Components by Category

#### DATA INGESTION & PROCESSING
1. `ReportDecompiler` (Phase 2)
2. `PDFParsingEngine` (Phase 16)
3. `EmailIntelligence` (Phase 19)
4. `CalendarIntelligence` (Phase 19)

#### DOCUMENT INTELLIGENCE
1. `DocumentAnalysisEngine` (Phase 24)
2. `CrossSectionConsistencyEngine` (Phase 24)
3. `AutoSummaryEngine` (Phase 24)
4. `AutoRewriteEngine` (Phase 24)
5. `ToneControlEngine` (Phase 24)
6. `StructuralOptimizationEngine` (Phase 24)

#### WORKFLOW INTELLIGENCE
1. `MultiDocumentWorkflowReasoningEngine` (Phase 25)
2. `ProjectLevelUnderstandingEngine` (Phase 25)
3. `AutomaticTaskGenerationEngine` (Phase 25)
4. `CrossPageIntelligenceEngine` (Phase 25)
5. `WorkflowPredictionEngine` (Phase 25)
6. `WorkflowGraphEngine` (Phase 25)
7. `WorkflowAwareContextEngine` (Phase 25)

#### AI REASONING & ASSISTANCE
1. `NaturalLanguageUnderstanding` (Phase 12)
2. `InferenceEngine` (Phase 12)
3. `DecisionSupportSystem` (Phase 12)
4. `ModalAssistant` (Phase 21)
5. `GlobalAssistant` (Phase 22)

#### LAYOUT & VISUAL
1. `VisualRenderingEngine` (Phase 15)
2. `AILayoutEngine` (Phase 23)

#### SYSTEM INTEGRATION
1. `ReportIntelligenceSystem` (Phase 14)
2. `SystemIntegrationValidator` (Phase 14)
3. `UnifiedEditor` (Phase 18)
4. `SupabaseIntegration` (Phase 18)

#### TESTING & VALIDATION
1. `PerformanceBenchmarkingEngine` (Phase 11)
2. `ReportComplianceValidator` (Phase 9)
3. `SystemTestingEngine` (Phase 20)

## Unified Data Flow Map

### Primary Data Flows

1. **Document Processing Flow**
   ```
   Raw Input (text/PDF/email) → Decompiler/PDF Parser → Document Analysis → 
   Schema Mapping → Classification → Compliance Validation → Template Generation → Output
   ```

2. **Workflow Intelligence Flow**
   ```
   Multiple Documents → Workflow Reasoning → Project Understanding → 
   Task Generation → Cross‑Page Intelligence → Workflow Prediction → Context Assistance
   ```

3. **Assistant Interaction Flow**
   ```
   User Query → Context Analysis → NLU → Inference Engine → 
   Decision Support → Assistant Response → User Feedback
   ```

4. **Sync & Collaboration Flow**
   ```
   Local Edits → CRDT Engine → Supabase Sync → Conflict Resolution → 
   Other Clients → Real‑time Updates
   ```

5. **Performance Monitoring Flow**
   ```
   System Activity → Event Emission → Metric Collection → 
   Benchmark Analysis → Performance Reports → Optimization Suggestions
   ```

## Unified Event Model

### Event Categories

#### SYSTEM EVENTS
- `system:initialized`, `system:shutdown`, `system:error`

#### DOCUMENT EVENTS
- `document:ingested`, `document:analyzed`, `document:validated`, `document:generated`

#### WORKFLOW EVENTS
- `workflow:analyzed`, `workflow:task_generated`, `workflow:prediction_made`

#### ASSISTANT EVENTS
- `assistant:activated`, `assistant:query_received`, `assistant:response_generated`

#### SYNC EVENTS
- `sync:started`, `sync:completed`, `sync:conflict_detected`, `sync:resolved`

#### PERFORMANCE EVENTS
- `performance:metric_collected`, `performance:benchmark_started`, `performance:benchmark_completed`

### Event Propagation
Events propagate through a unified event bus with:
- **Topic‑based routing**: Events routed to interested components
- **Filtering**: Components can filter events by type, source, or content
- **Persistence**: Critical events logged for debugging and analytics
- **Cross‑component triggering**: Events can trigger actions in other components

## Context Engine Architecture

### Unified Context Model
```
User Context {
  current_page: string
  current_project: string | null
  current_document: string | null
  current_task: string | null
  assistant_mode: 'modal' | 'global' | 'workflow'
  recent_actions: ActionHistory[]
  preferences: UserPreferences
}

Workflow Context {
  entities: WorkflowEntity[]
  relationships: WorkflowRelationship[]
  current_analysis_scope: 'single_entity' | 'entity_group' | 'project_level' | 'cross_project'
  predictions: WorkflowPrediction[]
  suggestions: ContextSuggestion[]
}

Document Context {
  current_document: DocumentAnalysis | null
  related_documents: DocumentAnalysis[]
  compliance_status: ComplianceResult | null
  optimization_suggestions: Suggestion[]
}
```

### Context Propagation
- **Page‑level context**: Automatically captured from current UI state
- **Workflow context**: Derived from workflow analysis engines
- **Document context**: Extracted from current document analysis
- **Cross‑context integration**: All contexts merged for assistant queries

## Media Pipeline Architecture

### Unified Media Processing
```
Media Input (image/audio/video) → Media Processor → 
Feature Extraction → Content Analysis → 
Context Association → Storage → Availability for workflows
```

### Media Types Supported
1. **Images**: OCR, object detection, layout analysis
2. **Audio**: Speech‑to‑text, speaker identification, sentiment analysis
3. **Video**: Frame extraction, motion analysis, scene detection
4. **Documents**: PDF, DOCX, HTML parsing and analysis

## Layout Engine Architecture

### Unified Layout System
```
Content + Constraints → Layout Engine → 
Layout Generation → Optimization → 
Visual Representation → Interactive Editing
```

### Layout Components
1. **Constraint Solver**: CSS‑like constraints for flexible layouts
2. **Visual Renderer**: Pixel‑perfect rendering across devices
3. **Interactive Editor**: Real‑time layout editing
4. **AI Optimizer**: Intelligent layout suggestions and optimizations

## Error Handling Architecture

### Unified Error Model
```
Error {
  id: string
  type: 'system' | 'user' | 'validation' | 'sync' | 'performance'
  severity: 'info' | 'warning' | 'error' | 'critical'
  source: string
  message: string
  stack_trace: string | null
  context: Record<string, any>
  timestamp: Date
  resolved: boolean
}
```

### Error Handling Flow
1. **Detection**: Errors detected at component boundaries
2. **Classification**: Categorized by type and severity
3. **Context Enrichment**: Additional context added
4. **Routing**: Sent to appropriate handlers (user notification, logging, auto‑recovery)
5. **Resolution**: Manual or automatic resolution
6. **Learning**: Patterns used to prevent future errors

## Integration Points

### Critical Integration Points
1. **Media → Layout**: Media content informs layout decisions
2. **Layout → Document Intelligence**: Layout affects document analysis
3. **Document Intelligence → Workflow Intelligence**: Document analysis feeds workflow reasoning
4. **Workflow Intelligence → Tasks/Projects**: Workflow analysis generates tasks and project insights
5. **Chat Mode ↔ Context Mode**: Seamless switching between chat and context‑aware assistance
6. **Modal Assistant ↔ Global Assistant**: Consistent behaviour across assistant types
7. **CRDT Sync ↔ AI Edits**: Conflict‑free merging of AI‑generated edits
8. **Supabase ↔ Local State**: Real‑time sync between cloud and local state

## Next Steps
This architecture document provides the foundation for:
1. **Cross‑System Integration Testing** (Objective 2)
2. **UX Consistency Rules** (Objective 3)
3. **Performance Test Scenarios** (Objective 4)
4. **Final Build Specification** (Objective 5)
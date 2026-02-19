# Report Intelligence System - Development Notes

## Overview
The Report Intelligence System is a modular system for processing, analyzing, and mapping report content to structured schemas. It consists of six phases:

1. **Phase 1: Report Type Registry** - Central repository for report type definitions
2. **Phase 2: Report Decompiler Engine** - Extracts structure, sections, and terminology from raw reports
3. **Phase 3: Report Schema Mapper** - Maps decompiled reports to internal data structures
4. **Phase 4: Schema Updater Engine** - Updates internal schemas based on discovered gaps and new components
5. **Phase 5: Report Style Learner** - Learns user writing styles and applies them to new reports
6. **Phase 6: Report Classification Engine** - Identifies report types by analyzing decompiled report content

## Phase 4: Schema Updater Engine

### Implementation Status
**Completed**: February 18, 2026

### Core Components

#### 1. SchemaUpdateAction Interface
- **Location**: `schema-updater/SchemaUpdateAction.ts`
- **Purpose**: Defines the structure for schema update actions
- **Key Interfaces**:
  - `SchemaUpdateAction`: Base interface for all update actions
  - `AddFieldActionPayload`: Payload for adding new fields
  - `AddSectionActionPayload`: Payload for adding new sections
  - `UpdateSectionActionPayload`: Payload for updating existing sections
  - `AddTerminologyActionPayload`: Payload for adding new terminology
  - `AddComplianceRuleActionPayload`: Payload for adding compliance rules
  - `UpdateTemplateActionPayload`: Payload for updating templates
  - `UpdateAIGuidanceActionPayload`: Payload for updating AI guidance
  - `UpdateReportTypeDefinitionActionPayload`: Payload for updating report type definitions

#### 2. SchemaUpdaterEngine Class
- **Location**: `schema-updater/SchemaUpdaterEngine.ts`
- **Purpose**: Main engine for updating internal schemas based on discovered gaps
- **Key Features**:
  - Event-driven architecture with 7 event types
  - Integration with Phase 1 (Report Type Registry)
  - Integration with Phase 3 (Schema Mapping Result)
  - Action generation from schema gaps, unmapped sections, missing sections, extra sections, and unknown terminology
  - Confidence-based action prioritization
  - Configurable update application (auto/manual)
  - Versioning integration

#### 3. Action Handler Modules
- **Location**: `schema-updater/actions/`
- **Modules**:
  - `applyFieldUpdate.ts`: Handles field addition updates
  - `applySectionUpdate.ts`: Handles section addition and updates
  - Additional handlers for terminology, compliance rules, templates, AI guidance, and report type definitions

#### 4. SchemaUpdateStorage Service
- **Location**: `schema-updater/storage/SchemaUpdateStorage.ts`
- **Purpose**: Stores and manages schema update entries
- **Features**:
  - JSON-based storage in `workspace/schema-updates.json`
  - Auto-pruning of old entries (30-day threshold)
  - Statistics and query capabilities
  - Entry management by report type and status

#### 5. SchemaVersioningService
- **Location**: `schema-updater/versioning/SchemaVersioningService.ts`
- **Purpose**: Manages versioning of report type definitions
- **Features**:
  - Semantic versioning (major/minor/patch)
  - Version change history tracking
  - Automatic version increment based on change type
  - Rollback capability to previous versions

### Integration Points

#### With Phase 1 (Report Type Registry)
- **Constructor**: `SchemaUpdaterEngine` accepts `ReportTypeRegistry` instance
- **Definition Updates**: Updates report type definitions in the registry
- **Version Management**: Integrates with registry versioning
- **Type-Specific Updates**: Actions are targeted to specific report types

#### With Phase 3 (Schema Mapper)
- **Input**: Accepts `SchemaMappingResult` as primary input
- **Schema Gap Analysis**: Processes `schemaGaps` to generate update actions
- **Unmapped Sections**: Processes `unmappedSections` to add new sections
- **Missing Sections**: Processes `missingRequiredSections` to add required sections
- **Extra Sections**: Processes `extraSections` to potentially add to schema
- **Unknown Terminology**: Processes `unknownTerminology` to add to terminology registry

### Event System
The schema updater engine implements a comprehensive event system:

```typescript
export type SchemaUpdaterEvent =
  | 'schemaUpdater:analysisStarted'
  | 'schemaUpdater:analysisComplete'
  | 'schemaUpdater:updatesGenerated'
  | 'schemaUpdater:updateApplied'
  | 'schemaUpdater:versionIncremented'
  | 'schemaUpdater:completed'
  | 'schemaUpdater:error';
```

### Action Generation Logic
The engine generates update actions based on:

1. **Schema Gaps**: Critical/warning gaps trigger immediate fix actions
2. **Unmapped Sections**: Sections not in schema trigger addSection actions
3. **Missing Required Sections**: Required sections trigger addMissingSection actions
4. **Extra Sections**: Sections not in schema but present trigger evaluation
5. **Unknown Terminology**: Unrecognized terms trigger addTerminology actions

### Confidence and Priority System
- **Confidence Scoring**: Each action has 0-1 confidence based on source data
- **Priority Calculation**: Based on severity (critical > warning > info) and confidence
- **Approval Requirements**: Low confidence or high impact actions may require manual approval

### Versioning Strategy
- **Major Version**: Breaking changes (removing sections, changing field types)
- **Minor Version**: Feature additions (new sections, fields, terminology)
- **Patch Version**: Fixes and improvements (bug fixes, minor updates)

### Usage Example

```typescript
// Create registry (Phase 1)
const registry = new ReportTypeRegistry();

// Create schema mapper result (Phase 3)
const mappingResult = await schemaMapper.map(decompiledReport);

// Create schema updater engine (Phase 4)
const schemaUpdater = new SchemaUpdaterEngine(registry);

// Analyze mapping result and generate update actions
const updateActions = await schemaUpdater.analyse(mappingResult);

// Apply generated updates
const updateSummary = await schemaUpdater.applyUpdates();

// Get statistics
const stats = schemaUpdater.getStatistics();
console.log(`Applied ${stats.totalActionsApplied} of ${stats.totalActionsGenerated} actions`);
```

### File Structure
```
report-intelligence/schema-updater/
├── SchemaUpdateAction.ts              # Core interfaces
├── SchemaUpdaterEngine.ts             # Main updater class
├── actions/
│   ├── applyFieldUpdate.ts            # Field update handler
│   ├── applySectionUpdate.ts          # Section update handler
│   ├── applyTerminologyUpdate.ts      # Terminology update handler
│   ├── applyComplianceRuleUpdate.ts   # Compliance rule update handler
│   ├── applyTemplateUpdate.ts         # Template update handler
│   ├── applyAIGuidanceUpdate.ts       # AI guidance update handler
│   └── applyReportTypeUpdate.ts       # Report type update handler
├── storage/
│   └── SchemaUpdateStorage.ts         # Update storage service
└── versioning/
    └── SchemaVersioningService.ts     # Versioning service
```

### Testing
- **Unit Tests**: Individual action handlers and validation functions
- **Integration Tests**: Full workflow with Phase 1 & 3
- **Example**: Integration with existing schema mapper examples

### Next Steps
1. **Phase 5**: Report Validation Engine
2. **Phase 6**: Report Generation Engine
3. **Phase 7**: AI-Assisted Report Enhancement

### Dependencies
- TypeScript 5.0+
- Node.js 18+
- Phase 1: Report Type Registry
- Phase 3: Report Schema Mapper

### Known Issues
- Action handlers need full implementation for production use
- Storage persistence to file is simulated
- Integration with actual registry update methods needs refinement

### Performance Considerations
- **Memory**: Update actions stored in memory during processing
- **Storage**: JSON storage with auto-pruning to prevent unbounded growth
- **Processing**: O(n) complexity for action generation where n = number of schema gaps/sections

### Security Considerations
- **Input Validation**: All inputs validated against interfaces
- **Error Handling**: Comprehensive error handling with event system
- **Approval Workflow**: High-impact changes may require manual approval
- **Version Control**: Rollback capability for problematic updates

## Phase 5: Report Style Learner

### Implementation Status
**Completed**: February 18, 2026

### Core Components

#### 1. StyleProfile Interface
- **Location**: `style-learner/StyleProfile.ts`
- **Purpose**: Defines the structure for user writing style profiles
- **Key Interfaces**:
  - `ToneProfile`: Tone characteristics including primary/secondary tones
  - `SentencePattern`: Recurring sentence structures and patterns
  - `ParagraphPattern`: Paragraph structure and organization patterns
  - `SectionOrdering`: Preferred section ordering for report types
  - `PreferredPhrasing`: Preferred ways to express common concepts
  - `FormattingPreferences`: Formatting preferences for headings, lists, emphasis
  - `TerminologyPreferences`: Terminology usage preferences
  - `StructuralPreferences`: Structural preferences for report organization
  - `StyleProfile`: Complete style profile for a user
  - `StyleApplicationResult`: Result of applying a style profile

#### 2. ReportStyleLearner Class
- **Location**: `style-learner/ReportStyleLearner.ts`
- **Purpose**: Main engine for learning user writing styles from decompiled reports
- **Key Features**:
  - Event-driven architecture with 7 event types
  - Integration with Phase 2 (Decompiled Report)
  - Style extraction from tone, patterns, phrasing, formatting, and terminology
  - Style profile creation and evolution over time
  - Style application to new content
  - Confidence-based style learning
  - Multiple profiles per user with report type specificity

#### 3. Style Extractor Modules
- **Location**: `style-learner/extractors/`
- **Modules**:
  - `extractTone.ts`: Extracts tone characteristics from text
  - `extractSentencePatterns.ts`: Extracts recurring sentence patterns
  - `extractParagraphPatterns.ts`: Extracts paragraph structure patterns
  - `extractSectionOrdering.ts`: Extracts preferred section ordering
  - `extractPreferredPhrasing.ts`: Extracts preferred phrasing for concepts
  - `extractFormattingPreferences.ts`: Extracts formatting preferences
  - `extractTerminologyPreferences.ts`: Extracts terminology preferences
  - `extractStructuralPreferences.ts`: Extracts structural preferences

#### 4. StyleProfileStorage Service
- **Location**: `style-learner/storage/StyleProfileStorage.ts`
- **Purpose**: Stores and manages style profiles
- **Features**:
  - JSON-based storage in `workspace/style-profiles.json`
  - Auto-pruning of old profiles
  - Statistics and query capabilities
  - Profile evolution tracking with versioning
  - User-specific profile management

### Integration Points

#### With Phase 2 (Report Decompiler)
- **Input**: Accepts `DecompiledReport` as primary input
- **Content Analysis**: Analyzes section content for style patterns
- **Author Identification**: Uses `metadata.author` for user identification
- **Report Type Context**: Uses `detectedReportType` for type-specific styles
- **Section Structure**: Analyzes section organization and ordering

#### With Phase 1 (Report Type Registry)
- **Optional Integration**: Can integrate with registry for type-specific style learning
- **Type-Specific Styles**: Creates report type-specific style profiles
- **Schema Awareness**: Can consider report type schema in style application

### Event System
The style learner implements a comprehensive event system:

```typescript
export type StyleLearnerEvent =
  | 'styleLearner:analysisStarted'
  | 'styleLearner:analysisComplete'
  | 'styleLearner:profileCreated'
  | 'styleLearner:profileUpdated'
  | 'styleLearner:applied'
  | 'styleLearner:completed'
  | 'styleLearner:error';
```

### Style Extraction Logic
The engine extracts style components through:

1. **Tone Analysis**: Detects primary and secondary tones (formal, technical, concise, etc.)
2. **Pattern Detection**: Identifies recurring sentence and paragraph patterns
3. **Phrasing Analysis**: Learns preferred phrasing for common concepts
4. **Formatting Analysis**: Detects formatting preferences for headings, lists, emphasis
5. **Terminology Analysis**: Identifies preferred terminology and avoided terms
6. **Structural Analysis**: Learns preferred section ordering and organization

### Confidence and Evolution System
- **Confidence Scoring**: Each style component has 0-1 confidence based on sample quality
- **Evolution Weighting**: New samples weighted against existing profile (configurable)
- **Sample Count**: Profiles track number of reports used for learning
- **Version Management**: Profiles versioned with semantic versioning
- **Profile Merging**: Multiple profiles can be merged with weighted averaging

### Style Application
When applying a style profile to new content:
1. **Tone Adjustment**: Adjusts tone to match learned preferences
2. **Phrasing Replacement**: Replaces generic phrasing with preferred alternatives
3. **Structural Reorganization**: Reorganizes content to match preferred structure
4. **Formatting Application**: Applies learned formatting preferences
5. **Terminology Replacement**: Replaces terms with preferred alternatives

### Usage Example

```typescript
// Create style learner
const styleLearner = new ReportStyleLearner(undefined, {
  autoCreateProfiles: true,
  autoUpdateProfiles: true,
  minSamplesForConfidence: 3,
  confidenceThreshold: 0.6,
  evolutionWeight: 0.3,
  maxProfilesPerUser: 10,
  storagePath: 'workspace/style-profiles.json'
});

// Analyze decompiled report and extract style
const styleProfile = await styleLearner.analyse(decompiledReport);

// Apply style profile to new content
const applicationResult = await styleLearner.applyStyleProfile(
  styleProfile.id,
  newContent
);

// Get user profiles
const userProfiles = await styleLearner.getUserProfiles('user_123');
```

### File Structure
```
report-intelligence/style-learner/
├── StyleProfile.ts                    # Core interfaces
├── ReportStyleLearner.ts              # Main learner class
├── examples/
│   └── integration-example.ts         # Integration example
├── extractors/
│   ├── extractTone.ts                 # Tone extraction
│   ├── extractSentencePatterns.ts     # Sentence pattern extraction
│   ├── extractParagraphPatterns.ts    # Paragraph pattern extraction
│   ├── extractSectionOrdering.ts      # Section ordering extraction
│   ├── extractPreferredPhrasing.ts    # Preferred phrasing extraction
│   ├── extractFormattingPreferences.ts # Formatting preference extraction
│   ├── extractTerminologyPreferences.ts # Terminology preference extraction
│   └── extractStructuralPreferences.ts # Structural preference extraction
└── storage/
    └── StyleProfileStorage.ts         # Profile storage service
```

### Testing
- **Unit Tests**: Individual extractor modules
- **Integration Tests**: Full workflow with Phase 2
- **Example**: `integration-example.ts` demonstrates complete workflow

### Next Steps
1. **Phase 6**: Report Validation Engine
2. **Phase 7**: Report Generation Engine
3. **Phase 8**: AI-Assisted Report Enhancement

### Dependencies
- TypeScript 5.0+
- Node.js 18+
- Phase 2: Report Decompiler Engine
- Optional: Phase 1: Report Type Registry

### Known Issues
- Extractor implementations are simplified (would use NLP in production)
- Style application logic needs refinement for production use
- Storage persistence to file is simulated

### Performance Considerations
- **Memory**: Style profiles stored in memory cache during processing
- **Storage**: JSON storage with auto-pruning to prevent unbounded growth
- **Processing**: O(n) complexity for style extraction where n = report content size
- **Evolution**: Profile merging uses weighted averaging for efficiency

### Security Considerations
- **User Privacy**: Style profiles contain writing patterns but not sensitive content
- **Data Isolation**: Profiles are user-specific and isolated
- **Input Validation**: All inputs validated against interfaces
- **Error Handling**: Comprehensive error handling with event system

## Phase 6: Report Classification Engine

### Implementation Status
**Completed**: February 18, 2026

### Core Components

#### 1. ClassificationResult Interface
- **Location**: `classification/ClassificationResult.ts`
- **Purpose**: Defines the structure for classification results
- **Key Interfaces**:
  - `ClassificationCandidate`: Candidate report type with score and breakdown
  - `ClassificationResult`: Complete classification result with detected type, confidence, ambiguity level, and reasons
  - `AmbiguityLevel`: Enum for classification ambiguity (none, low, medium, high, very-high)
  - `ScoreBreakdown`: Detailed scoring breakdown across 5 dimensions

#### 2. ReportClassificationEngine Class
- **Location**: `classification/ReportClassificationEngine.ts`
- **Purpose**: Main engine for identifying report types by analyzing decompiled report content
- **Key Features**:
  - Event-driven architecture with 6 event types
  - Integration with Phase 1 (Report Type Registry)
  - Integration with Phase 2 (Decompiled Report)
  - 5 specialized scoring modules for different aspects
  - Confidence scoring algorithm
  - Ambiguity detection system
  - Reason generation for classification decisions

#### 3. Scorer Modules
- **Location**: `classification/scorers/`
- **Modules**:
  - `scoreStructureSimilarity.ts`: Scores structural similarity between report and report type
  - `scoreTerminologySimilarity.ts`: Scores terminology similarity
  - `scoreComplianceMarkers.ts`: Scores compliance marker alignment
  - `scoreMetadata.ts`: Scores metadata compatibility
  - `scoreSectionOrdering.ts`: Scores section ordering patterns

#### 4. Ranker Module
- **Location**: `classification/rankers/rankCandidates.ts`
- **Purpose**: Ranks classification candidates based on scores and additional factors
- **Features**:
  - Configurable scoring weights
  - Confidence-based ranking
  - Consistency checking
  - Top candidate selection

#### 5. ClassificationResultStorage Service
- **Location**: `classification/storage/ClassificationResultStorage.ts`
- **Purpose**: Stores and manages classification results
- **Features**:
  - JSON-based storage in `workspace/classification-results.json`
  - Auto-pruning of old results
  - Statistics and query capabilities
  - Result retrieval by report ID and report type
  - Average confidence calculation

### Integration Points

#### With Phase 1 (Report Type Registry)
- **Constructor**: `ReportClassificationEngine` accepts `ReportTypeRegistry` instance
- **Type Scoring**: Scores decompiled reports against all registered report types
- **Definition Access**: Uses report type definitions for scoring criteria
- **Type-Specific Classification**: Classification considers report type characteristics

#### With Phase 2 (Report Decompiler)
- **Input**: Accepts `DecompiledReport` as primary input
- **Section Analysis**: Analyzes sections for structural patterns
- **Terminology Analysis**: Uses terminology entries for scoring
- **Compliance Analysis**: Uses compliance markers for scoring
- **Metadata Analysis**: Uses extracted metadata for scoring

#### With Phase 3-5 (Optional Integration)
- **Phase 3 (Schema Mapper)**: Classification can inform schema mapping
- **Phase 4 (Schema Updater)**: Ambiguous classifications can trigger schema updates
- **Phase 5 (Style Learner)**: Classification can guide style profile selection

### Event System
The classification engine implements a comprehensive event system:

```typescript
export type ClassificationEvent =
  | 'classification:started'
  | 'classification:candidateScored'
  | 'classification:ranked'
  | 'classification:completed'
  | 'classification:ambiguous'
  | 'classification:error';
```

### Scoring Algorithm
The classification engine calculates scores (0-1) across 5 dimensions:

#### 1. Structure Similarity (30% weight)
- **Factors**: Section count, hierarchy depth, section types
- **Method**: Compares decompiled report structure to report type definition
- **Confidence**: Based on structural alignment

#### 2. Terminology Similarity (25% weight)
- **Factors**: Technical terms, compliance terms, industry terminology
- **Method**: Compares terminology entries to report type standards and tags
- **Confidence**: Based on terminology overlap

#### 3. Compliance Markers (20% weight)
- **Factors**: Standards, regulations, requirements
- **Method**: Checks compliance markers against report type compliance rules
- **Confidence**: Based on compliance alignment

#### 4. Metadata Compatibility (15% weight)
- **Factors**: Title, author, date, client, keywords
- **Method**: Analyzes metadata patterns typical for report type
- **Confidence**: Based on metadata consistency

#### 5. Section Ordering (10% weight)
- **Factors**: Section sequence, required section presence
- **Method**: Compares section ordering to typical patterns
- **Confidence**: Based on ordering similarity

### Confidence and Ambiguity Detection
The engine calculates:
- **Confidence Score**: 0-1 based on top candidate score and score difference
- **Ambiguity Level**: none, low, medium, high, very-high based on score differences
- **Thresholds**: Configurable confidence and ambiguity thresholds

### Usage Example

```typescript
// Create registry (Phase 1)
const registry = new ReportTypeRegistry();

// Create decompiled report (Phase 2)
const decompiledReport = createDecompiledReport(rawText);

// Create classification engine (Phase 6)
const classificationEngine = new ReportClassificationEngine(registry, {
  confidenceThreshold: 0.7,
  ambiguityThreshold: 0.2,
  scoringWeights: {
    structure: 0.3,
    terminology: 0.25,
    compliance: 0.2,
    metadata: 0.15,
    ordering: 0.1
  },
  autoSaveResults: true
});

// Set up event listeners
classificationEngine.on('classification:started', (eventData) => {
  console.log(`Classification started: ${eventData.data.reportId}`);
});

classificationEngine.on('classification:completed', (eventData) => {
  const result = eventData.data.result;
  console.log(`Classification completed: ${result.detectedReportTypeId} (confidence: ${result.confidenceScore})`);
});

// Classify report
const classificationResult = await classificationEngine.classify(decompiledReport);

// Get statistics
const stats = classificationEngine.getStatistics();
console.log(`Total classifications: ${stats.totalClassifications}`);
console.log(`Clear classification rate: ${(stats.clearClassificationRate * 100).toFixed(1)}%`);
```

### File Structure
```
report-intelligence/classification/
├── ClassificationResult.ts              # Core interfaces
├── ReportClassificationEngine.ts        # Main classification class
├── examples/
│   └── integration-example.ts           # Integration example
├── scorers/
│   ├── scoreStructureSimilarity.ts      # Structure scoring
│   ├── scoreTerminologySimilarity.ts    # Terminology scoring
│   ├── scoreComplianceMarkers.ts        # Compliance scoring
│   ├── scoreMetadata.ts                 # Metadata scoring
│   └── scoreSectionOrdering.ts          # Section ordering scoring
├── rankers/
│   └── rankCandidates.ts                # Candidate ranking
└── storage/
    └── ClassificationResultStorage.ts   # Result storage service
```

### Testing
- **Unit Tests**: Individual scorer modules and ranking logic
- **Integration Tests**: Full workflow with Phase 1 & 2
- **Example**: `integration-example.ts` demonstrates complete workflow with mock data

### Next Steps
1. **Phase 7**: Self-Healing Engine (for ambiguous classifications)
2. **Phase 8**: Report Generation Engine
3. **Phase 9**: AI-Assisted Report Enhancement

### Dependencies
- TypeScript 5.0+
- Node.js 18+
- Phase 1: Report Type Registry
- Phase 2: Report Decompiler Engine
- Optional: Phase 3-5 for enhanced classification

### Known Issues
- Scorer implementations are simplified (would use more sophisticated algorithms in production)
- Storage persistence to file is simulated
- Integration with actual registry needs refinement for production use

### Performance Considerations
- **Memory**: Classification results stored in memory cache during processing
- **Storage**: JSON storage with auto-pruning to prevent unbounded growth
- **Processing**: O(n*m) complexity where n = report features, m = report types
- **Scoring**: Parallel scoring possible for large report type registries

### Security Considerations
- **Input Validation**: All inputs validated against interfaces
- **Error Handling**: Comprehensive error handling with event system
- **Data Privacy**: Classification results contain report metadata but not sensitive content
- **Confidence Reporting**: Clear indication of classification confidence and ambiguity

## Phase 3: Report Schema Mapper

### Implementation Status
**Completed**: February 18, 2026

### Core Components

#### 1. SchemaMappingResult Interface
- **Location**: `schema-mapper/SchemaMappingResult.ts`
- **Purpose**: Defines the structure for schema mapping results
- **Key Interfaces**:
  - `MappedField`: A field mapped from decompiled section to internal schema
  - `UnmappedSection`: Section that couldn't be mapped
  - `MissingRequiredSection`: Required section missing from report
  - `ExtraSection`: Section not defined in report type definition
  - `UnknownTerminology`: Terminology not recognized in system
  - `SchemaGap`: Identified gaps in schema mapping
  - `SchemaMappingResult`: Complete mapping result with metrics

#### 2. ReportSchemaMapper Class
- **Location**: `schema-mapper/ReportSchemaMapper.ts`
- **Purpose**: Main engine for mapping decompiled reports to internal schemas
- **Key Features**:
  - Event-driven architecture with 9 event types
  - Integration with Phase 1 (Report Type Registry)
  - Integration with Phase 2 (Decompiled Report)
  - Confidence scoring algorithm
  - Schema gap detection
  - Section matching with confidence calculation

#### 3. Mapper Helper Modules
- **Location**: `schema-mapper/mappers/`
- **Modules**:
  - `mapSectionsToSchema.ts`: Maps sections to schema fields
  - `mapTerminology.ts`: Maps terminology entries
  - `detectMissingSections.ts`: Detects missing required sections
  - `detectExtraSections.ts`: Detects extra sections not in schema
  - `detectSchemaGaps.ts`: Detects schema gaps and inconsistencies

#### 4. SchemaMappingResultStorage
- **Location**: `schema-mapper/storage/SchemaMappingResultStorage.ts`
- **Purpose**: Stores and manages mapping results
- **Features**:
  - JSON-based storage in `workspace/schema-mapping-results.json`
  - Auto-pruning of old results
  - Statistics and query capabilities
  - Deduplication by decompiled report ID

### Integration Points

#### With Phase 1 (Report Type Registry)
- **Constructor**: `ReportSchemaMapper` accepts `ReportTypeRegistry` instance
- **Type Identification**: Uses registry to identify report types
- **Schema Validation**: Validates against report type definitions
- **Section Matching**: Matches sections to defined schema sections

#### With Phase 2 (Report Decompiler)
- **Input**: Accepts `DecompiledReport` as input
- **Section Processing**: Processes `DetectedSection` objects
- **Terminology Mapping**: Maps `TerminologyEntry` objects
- **Compliance Markers**: Processes `ComplianceMarker` objects

### Event System
The schema mapper implements a comprehensive event system:

```typescript
export type SchemaMapperEvent = 
  | 'schemaMapper:started'
  | 'schemaMapper:reportTypeIdentified'
  | 'schemaMapper:sectionsMapped'
  | 'schemaMapper:terminologyMapped'
  | 'schemaMapper:missingSectionsDetected'
  | 'schemaMapper:extraSectionsDetected'
  | 'schemaMapper:schemaGapsDetected'
  | 'schemaMapper:completed'
  | 'schemaMapper:error';
```

### Confidence Scoring Algorithm
The mapper calculates an overall confidence score (0-1) based on:
1. **Mapping Coverage** (40%): Percentage of sections successfully mapped
2. **Completeness Score** (30%): How complete the mapping is relative to schema
3. **Average Mapping Confidence** (20%): Average confidence of individual field mappings
4. **Schema Gap Penalty** (up to 50%): Penalty for critical/warning schema gaps

### Usage Example

```typescript
// Create registry (Phase 1)
const registry = new ReportTypeRegistry();

// Create decompiled report (Phase 2)
const decompiledReport = createDecompiledReport(rawText);

// Create schema mapper (Phase 3)
const schemaMapper = new ReportSchemaMapper(registry);

// Map report to schema
const mappingResult = await schemaMapper.map(decompiledReport);

// Store results
const storage = new SchemaMappingResultStorage();
await storage.saveResult(mappingResult);
```

### File Structure
```
report-intelligence/schema-mapper/
├── SchemaMappingResult.ts          # Core interfaces
├── ReportSchemaMapper.ts           # Main mapper class
├── examples/
│   └── integration-example.ts      # Integration example
├── mappers/
│   ├── mapSectionsToSchema.ts      # Section mapping
│   ├── mapTerminology.ts           # Terminology mapping
│   ├── detectMissingSections.ts    # Missing section detection
│   ├── detectExtraSections.ts      # Extra section detection
│   └── detectSchemaGaps.ts         # Schema gap detection
└── storage/
    └── SchemaMappingResultStorage.ts # Result storage
```

### Testing
- **Unit Tests**: Individual mapper functions
- **Integration Tests**: Full workflow with Phase 1 & 2
- **Example**: `integration-example.ts` demonstrates complete workflow

### Next Steps
1. **Phase 4**: Report Validation Engine
2. **Phase 5**: Report Generation Engine
3. **Phase 6**: AI-Assisted Report Enhancement

### Dependencies
- TypeScript 5.0+
- Node.js 18+
- Phase 1: Report Type Registry
- Phase 2: Report Decompiler Engine

### Known Issues
- None identified during implementation
- All TypeScript errors resolved
- Integration example needs refinement for production use

### Performance Considerations
- **Memory**: Mapping results are stored in memory during processing
- **Storage**: JSON storage with auto-pruning to prevent unbounded growth
- **Processing**: O(n) complexity for section mapping where n = number of sections

### Security Considerations
- **Input Validation**: All inputs validated against interfaces
- **Error Handling**: Comprehensive error handling with event system
- **Data Privacy**: No sensitive data stored in mapping results

## Phase 10: Report Reproduction Tester

### Implementation Status
**Completed**: February 19, 2026

### Overview
The Report Reproduction Tester is a comprehensive testing system that validates the consistency and reproducibility of report generation. It ensures that reports generated from the same template and input data produce consistent outputs across multiple runs, which is critical for quality assurance and compliance.

### Core Components

#### 1. TestResult Interface
- **Location**: `reproduction-tester/TestResult.ts`
- **Purpose**: Defines the structure for test results, test cases, and consistency measurements
- **Key Interfaces**:
  - `TestCase`: Test case definition with input data and expected outputs
  - `TestResult`: Complete test result with scores, differences, and execution details
  - `ConsistencyMeasurement`: Measurement of consistency across multiple test runs
  - `ComparisonResult`: Result of comparing generated report with expected output
  - `Difference`: Individual difference found during comparison
  - `TestExecution`: Execution details including timing and status

#### 2. ReportReproductionTester Class
- **Location**: `reproduction-tester/ReportReproductionTester.ts`
- **Purpose**: Main engine for testing report reproduction consistency
- **Key Features**:
  - Single test execution with comprehensive comparison
  - Multi-run consistency testing with statistical analysis
  - Event-driven architecture with 10 event types
  - Integration with existing report intelligence components
  - Confidence scoring and reproducibility determination
  - Template-based test case generation

#### 3. TemplateBasedTestGenerator Class
- **Location**: `reproduction-tester/test-generation/TemplateBasedTestGenerator.ts`
- **Purpose**: Generates test cases from report templates for reproduction testing
- **Key Features**:
  - Generation of basic, edge case, boundary case, and random variation tests
  - Configurable test generation parameters
  - Priority-based test case distribution
  - Integration with report type registry
  - Test case export/import functionality

#### 4. ReportGenerationTester Class
- **Location**: `reproduction-tester/ReportGenerationTester.ts`
- **Purpose**: Tests report generation and validates outputs
- **Key Features**:
  - Report generation from test cases
  - Output validation against expected results
  - Error handling and recovery testing
  - Performance measurement and timing analysis

#### 5. ResultComparisonEngine Class
- **Location**: `reproduction-tester/comparison/ResultComparisonEngine.ts`
- **Purpose**: Compares generated reports with expected outputs
- **Key Features**:
  - Multi-aspect comparison (structure, content, formatting, data)
  - Similarity scoring with configurable thresholds
  - Difference detection and categorization
  - Evidence collection for comparison results

#### 6. ConsistencyScoringService Class
- **Location**: `reproduction-tester/scoring/ConsistencyScoringService.ts`
- **Purpose**: Calculates consistency scores across multiple test runs
- **Key Features**:
  - Statistical analysis of test results
  - Consistency score calculation across 6 dimensions
  - Variance and standard deviation calculation
  - Hash consistency analysis for output determinism
  - Acceptability determination based on configurable thresholds

#### 7. TestStorageSystem Class
- **Location**: `reproduction-tester/storage/TestStorageSystem.ts`
- **Purpose**: Storage system for test results, test cases, and consistency measurements
- **Key Features**:
  - Configurable storage (memory/file/database)
  - Query capabilities with filtering and sorting
  - Auto-cleanup of old results
  - Statistics and reporting
  - Import/export functionality

#### 8. TestEventSystem Class
- **Location**: `reproduction-tester/events/TestEventSystem.ts`
- **Purpose**: Event system for test execution tracking and monitoring
- **Key Features**:
  - 17 event types covering all test activities
  - Event history with filtering and statistics
  - Subscription-based event handling
  - Event emission with typed data payloads
  - Event reporting and analysis

#### 9. ReproductionTesterIntegrationService Class
- **Location**: `reproduction-tester/integration/ReproductionTesterIntegrationService.ts`
- **Purpose**: Integration service that connects the reproduction tester with Phase 1-9 components
- **Key Features**:
  - Configurable integration with all previous phases
  - Integrated test case generation from registry, style profiles, and compliance rules
  - Event forwarding and handling between systems
  - Integration status reporting
  - Data import/export for integration testing

### Integration Points

#### With Phase 1-9 Components
- **Phase 1 (Registry)**: Generates test cases from report type definitions
- **Phase 2 (Decompiler)**: Uses decompiled reports as test case inputs
- **Phase 3 (Schema Mapper)**: Validates schema mapping consistency
- **Phase 4 (Schema Updater)**: Tests schema update reproducibility
- **Phase 5 (Style Learner)**: Tests style application consistency
- **Phase 6 (Classification)**: Validates classification consistency
- **Phase 7 (Self-Healing)**: Tests self-healing action reproducibility
- **Phase 8 (Healing Orchestration)**: Validates healing orchestration consistency
- **Phase 9 (Compliance)**: Tests compliance validation consistency

### Event System
The reproduction tester implements a comprehensive event system with 17 event types:

```typescript
export enum TestEventType {
  // Test case events
  TEST_CASE_CREATED = 'test_case_created',
  TEST_CASE_UPDATED = 'test_case_updated',
  TEST_CASE_DELETED = 'test_case_deleted',
  
  // Test execution events
  TEST_STARTED = 'test_started',
  TEST_COMPLETED = 'test_completed',
  TEST_FAILED = 'test_failed',
  TEST_SKIPPED = 'test_skipped',
  
  // Comparison events
  COMPARISON_STARTED = 'comparison_started',
  COMPARISON_COMPLETED = 'comparison_completed',
  COMPARISON_FAILED = 'comparison_failed',
  
  // Scoring events
  SCORING_STARTED = 'scoring_started',
  SCORING_COMPLETED = 'scoring_completed',
  
  // Storage events
  RESULT_STORED = 'result_stored',
  RESULT_RETRIEVED = 'result_retrieved',
  STORAGE_CLEARED = 'storage_cleared',
  
  // System events
  SYSTEM_STARTED = 'system_started',
  SYSTEM_STOPPED = 'system_stopped',
  ERROR_OCCURRED = 'error_occurred',
  WARNING_OCCURRED = 'warning_occurred',
  
  // Multi-run events
  MULTI_RUN_STARTED = 'multi_run_started',
  MULTI_RUN_COMPLETED = 'multi_run_completed',
  CONSISTENCY_CALCULATED = 'consistency_calculated',
}
```

### Test Execution Workflow

1. **Test Case Generation**: Generate test cases from templates or existing reports
2. **Single Test Execution**: Run a single test with comprehensive comparison
3. **Multi-Run Consistency Testing**: Run multiple iterations to measure consistency
4. **Comparison Analysis**: Compare generated reports with expected outputs
5. **Consistency Scoring**: Calculate consistency scores across multiple runs
6. **Result Storage**: Store test results and consistency measurements
7. **Event Emission**: Emit events for monitoring and integration
8. **Reporting**: Generate comprehensive test reports

### Consistency Scoring Dimensions
The system calculates consistency across 6 dimensions:

1. **Structure Consistency**: Consistency of report structure and organization
2. **Content Consistency**: Consistency of textual content and phrasing
3. **Formatting Consistency**: Consistency of formatting and styling
4. **Data Consistency**: Consistency of data values and calculations
5. **Timing Consistency**: Consistency of generation timing and performance
6. **Hash Consistency**: Consistency of output hash values (determinism)

### Usage Example

```typescript
// Create reproduction tester
const reproductionTester = new ReportReproductionTester(registry, {
  strictMode: true,
  runMultipleIterations: true,
  iterationsCount: 3,
  compareStructure: true,
  compareContent: true,
  compareFormatting: true,
  compareData: true,
  measureTiming: true,
  minimumReproducibilityScore: 80,
  standardsToApply: ['BS5837:2012', 'AIA', 'AMS'],
});

// Create test case
const testCase = reproductionTester.createTestCaseFromTemplate(
  'bs5837',
  'BS5837 Consistency Test',
  { treeCount: 10, surveyDate: '2026-02-19' },
  'high',
  ['consistency', 'bs5837', 'template']
);

// Run consistency test
const testResult = await reproductionTester.runConsistencyTest(testCase);

// Check results
console.log(`Reproducible: ${testResult.reproducible}`);
console.log(`Overall Score: ${testResult.scores.overallReproducibilityScore}%`);
console.log(`Consistency Score: ${testResult.consistencyMeasurement?.consistencyScore}%`);

// Generate integration test suite
const integrationService = new ReproductionTesterIntegrationService();
const integratedResults = await integrationService.runIntegratedTestSuite();
```

### File Structure

```
report-intelligence/reproduction-tester/
├── TestResult.ts                          # Core interfaces
├── ReportReproductionTester.ts            # Main tester class
├── ReportGenerationTester.ts              # Generation testing
├── test-generation/
│   └── TemplateBasedTestGenerator.ts      # Test case generation
├── comparison/
│   └── ResultComparisonEngine.ts          # Result comparison
├── scoring/
│   └── ConsistencyScoringService.ts       # Consistency scoring
├── storage/
│   ├── TestStorageSystem.ts               # Test storage
│   └── index.ts                           # Storage exports
├── events/
│   ├── TestEventSystem.ts                 # Event system
│   └── index.ts                           # Event exports
├── integration/
│   ├── ReproductionTesterIntegrationService.ts # Integration service
│   └── index.ts                           # Integration exports
└── index.ts                               # Main exports
```

### Testing
- **Unit Tests**: Individual component testing
- **Integration Tests**: Full workflow testing with existing components
- **Consistency Testing**: Multi-run testing to validate reproducibility
- **Performance Testing**: Timing and resource usage analysis

### Next Steps
1. **Phase 11**: Performance Benchmarking System
2. **Phase 12**: Automated Regression Testing
3. **Phase 13**: Production Deployment Validation

### Dependencies
- TypeScript 5.0+
- Node.js 18+
- Phase 1-9: All previous report intelligence components
- Optional: External testing frameworks for extended validation

### Known Issues
- Test generation from templates is simplified (would use actual template engine in production)
- Comparison algorithms are basic (would use more sophisticated NLP in production)
- Storage persistence to file is simulated

### Performance Considerations
- **Memory**: Test results stored in memory during processing
- **Storage**: Configurable storage with auto-cleanup
- **Processing**: O(n*m) complexity where n = test cases, m = iterations
- **Parallelization**: Multi-run tests can be parallelized for performance

### Security Considerations
- **Input Validation**: All test inputs validated against interfaces
- **Error Handling**: Comprehensive error handling with event system
- **Data Privacy**: Test data contains report content but can be anonymized
- **Access Control**: Test results may contain sensitive information requiring access control

## Phase 13: User Workflow Learning Engine

### Implementation Status
**Completed**: February 19, 2026

### Overview
The User Workflow Learning Engine is a comprehensive system for learning and analyzing user workflows in report creation. It observes user interactions, detects patterns in report creation sequences, identifies common omissions and corrections, and builds personalized workflow profiles that enable intelligent predictions and suggestions.

### Core Components

#### 1. WorkflowProfile Interface
- **Location**: `workflow-learning/WorkflowProfile.ts`
- **Purpose**: Defines the structure for workflow profiles, user interaction events, analysis results, and predictions
- **Key Interfaces**:
  - `WorkflowProfile`: Complete workflow profile capturing user behavior patterns
  - `UserInteractionEvent`: Single user interaction event for observation
  - `WorkflowAnalysisResult`: Result of analyzing user interactions
  - `WorkflowPrediction`: Prediction of user's next likely actions

#### 2. UserWorkflowLearningEngine Class
- **Location**: `workflow-learning/UserWorkflowLearningEngine.ts`
- **Purpose**: Main engine for observing interactions, analyzing workflows, and generating profiles
- **Key Features**:
  - Event-driven architecture with 6 event types
  - Real-time observation of user interactions
  - 5 specialized analyzers for different workflow aspects
  - Workflow profile generation and updating
  - Confidence scoring and prediction generation
  - Integration with storage and event systems

#### 3. Analyzer Modules
- **Location**: `workflow-learning/analyzers/`
- **Modules**:
  - `analyzeSectionOrder.ts`: Analyzes section ordering patterns
  - `analyzeOmissions.ts`: Detects commonly omitted sections
  - `analyzeCorrections.ts`: Analyzes common corrections and edits
  - `analyzeInteractionPatterns.ts`: Analyzes user interaction patterns
  - `analyzeDataSources.ts`: Analyzes typical data sources used

#### 4. Generator Modules
- **Location**: `workflow-learning/generators/`
- **Modules**:
  - `generateWorkflowProfile.ts`: Generates new workflow profiles from analysis
  - `updateWorkflowProfile.ts`: Updates existing workflow profiles
  - `mergeWorkflowProfiles.ts`: Merges multiple workflow profiles
  - `computeWorkflowConfidence.ts`: Computes confidence scores for profiles

#### 5. WorkflowStorageService Class
- **Location**: `workflow-learning/storage/WorkflowStorageService.ts`
- **Purpose**: Manages storage and retrieval of workflow profiles
- **Features**:
  - JSON-based storage in `workspace/workflow-profiles.json`
  - Profile versioning and evolution tracking
  - Query capabilities with filtering and sorting
  - Statistics and reporting
  - Import/export functionality

#### 6. WorkflowEventSystem Class
- **Location**: `workflow-learning/events/WorkflowEventSystem.ts`
- **Purpose**: Event system for workflow learning and analysis
- **Features**:
  - 14 event types covering all workflow activities
  - Event history with filtering and statistics
  - Subscription-based event handling
  - Correlation ID tracking for related events
  - Event emission with typed data payloads

#### 7. PhaseIntegrationService Class
- **Location**: `workflow-learning/integration/PhaseIntegrationService.ts`
- **Purpose**: Integrates workflow learning with Phase 1-12 components
- **Features**:
  - Comprehensive integration with all previous phases
  - Enhanced analysis using Phase 1-12 data
  - Intelligent predictions with phase integration
  - Event forwarding between systems
  - Integration status reporting

### Integration Points

#### With Phase 1-12 Components
- **Phase 1 (Registry)**: Uses report type definitions for expected sections
- **Phase 2 (Decompiler)**: Analyzes decompiled report structure for patterns
- **Phase 3-6 (Schema & Style)**: Uses schema mappings and style profiles
- **Phase 7-11 (Advanced Processing)**: Integrates with self-healing, templates, compliance, testing
- **Phase 12 (AI Reasoning)**: Enhances analysis with AI reasoning capabilities

### Event System
The workflow learning engine implements a comprehensive event system:

```typescript
export type WorkflowEventType =
  | 'workflow:interactionObserved'
  | 'workflow:analysisStarted'
  | 'workflow:analysisComplete'
  | 'workflow:profileCreated'
  | 'workflow:profileUpdated'
  | 'workflow:profileMerged'
  | 'workflow:profileArchived'
  | 'workflow:predictionGenerated'
  | 'workflow:suggestionGenerated'
  | 'workflow:warningGenerated'
  | 'workflow:storageLoaded'
  | 'workflow:storageSaved'
  | 'workflow:error'
  | 'workflow:completed';
```

### Analysis Dimensions
The engine analyzes user workflows across 5 dimensions:

#### 1. Section Order Patterns
- **Analysis**: Detects common sequences of section creation
- **Purpose**: Predicts next likely sections
- **Confidence**: Based on pattern consistency and frequency

#### 2. Common Omissions
- **Analysis**: Identifies sections commonly omitted by users
- **Purpose**: Generates warnings and reminders
- **Confidence**: Based on omission frequency and context

#### 3. Common Corrections
- **Analysis**: Detects frequent corrections and edits
- **Purpose**: Suggests templates or auto-corrections
- **Confidence**: Based on correction patterns and consistency

#### 4. Interaction Patterns
- **Analysis**: Analyzes user interaction types and frequencies
- **Purpose**: Understands user workflow preferences
- **Confidence**: Based on interaction diversity and consistency

#### 5. Data Source Patterns
- **Analysis**: Identifies typical data sources used
- **Purpose**: Pre-fills data or suggests sources
- **Confidence**: Based on source usage frequency and context

### Workflow Profile Structure
Workflow profiles capture comprehensive user behavior:

```typescript
interface WorkflowProfile {
  id: string;
  userId: string;
  reportTypeId: string | null;
  commonSectionOrder: string[];
  commonOmissions: string[];
  commonCorrections: Array<{ from: string; to: string; frequency: number; lastObserved: Date }>;
  preferredInteractionPatterns: Array<{ pattern: string; frequency: number; confidence: number }>;
  typicalDataSources: string[];
  workflowHeuristics: {
    averageSectionTime: Record<string, number>;
    orderConsistency: number;
    templateUsageFrequency: number;
    commonStartingPoints: string[];
    validationPatterns: string[];
    revisionPatterns: Array<{ pattern: string; frequency: number }>;
  };
  confidenceScore: number;
  timestamps: { createdAt: Date; updatedAt: Date; lastUsedAt: Date; observationCount: number };
  metadata: { version: number; isActive: boolean; tags: string[]; source: string };
}
```

### Confidence Scoring System
The engine calculates confidence scores based on:
1. **Observation Count**: More observations increase confidence
2. **Pattern Consistency**: Consistent patterns increase confidence
3. **Profile Age**: Older, stable profiles have higher confidence
4. **Recency**: Recently used profiles have higher confidence
5. **Data Completeness**: Complete profiles have higher confidence
6. **Consistency Factor**: Internal consistency of profile data

### Usage Example

```typescript
// Create workflow learning engine
const workflowEngine = new UserWorkflowLearningEngine();

// Observe user interaction
workflowEngine.observeInteraction({
  id: 'event_123',
  userId: 'user_456',
  reportId: 'report_789',
  reportTypeId: 'BS5837',
  eventType: 'section_created',
  data: { section: 'introduction', content: '...' },
  timestamp: new Date(),
  sessionId: 'session_abc',
  context: { currentSection: null, previousSection: null, platform: 'web' }
});

// Analyze user workflow
const analysisResult = workflowEngine.analyseInteractions('user_456');

// Get workflow profile
const profile = workflowEngine.getWorkflowProfile('user_456', 'BS5837');

// Generate predictions
const predictions = workflowEngine.generatePredictions('user_456', {
  currentSection: 'methodology',
  completedSections: ['introduction', 'executive_summary']
});

// Use integrated service
const integrationService = new PhaseIntegrationService();
const enhancedPredictions = integrationService.generatePredictions('user_456', {
  currentSection: 'methodology',
  reportTypeId: 'BS5837'
});
```

### File Structure

```
report-intelligence/workflow-learning/
├── WorkflowProfile.ts                    # Core interfaces
├── UserWorkflowLearningEngine.ts          # Main engine class
├── analyzers/
│   ├── analyzeSectionOrder.ts            # Section order analysis
│   ├── analyzeOmissions.ts               # Omission analysis
│   ├── analyzeCorrections.ts             # Correction analysis
│   ├── analyzeInteractionPatterns.ts     # Interaction pattern analysis
│   └── analyzeDataSources.ts             # Data source analysis
├── generators/
│   ├── generateWorkflowProfile.ts        # Profile generation
│   ├── updateWorkflowProfile.ts          # Profile updating
│   ├── mergeWorkflowProfiles.ts          # Profile merging
│   └── computeWorkflowConfidence.ts      # Confidence computation
├── storage/
│   └── WorkflowStorageService.ts         # Profile storage service
├── events/
│   └── WorkflowEventSystem.ts            # Event system
├── integration/
│   └── PhaseIntegrationService.ts        # Phase integration service
└── index.ts                              # Main exports
```

### Testing
- **Unit Tests**: Individual analyzer and generator modules
- **Integration Tests**: Full workflow with Phase 1-12 integration
- **Consistency Testing**: Profile generation and updating consistency
- **Performance Testing**: Real-time observation and analysis performance

### Next Steps
1. **Phase 14**: Final Integration and Validation
2. **Production Deployment**: Deployment to production environment
3. **User Testing**: Gather feedback from real users
4. **Performance Optimization**: Continuous performance improvement

### Dependencies
- TypeScript 5.0+
- Node.js 18+
- Phase 1-12: All previous report intelligence components
- Optional: External analytics for enhanced pattern detection

### Known Issues
- Analyzer implementations are simplified (would use more sophisticated algorithms in production)
- Storage persistence to file is simulated
- Integration with actual Phase 1-12 components needs refinement for production use

### Performance Considerations
- **Memory**: Workflow profiles stored in memory cache during processing
- **Storage**: JSON storage with versioning and evolution tracking
- **Processing**: O(n) complexity for analysis where n = number of interactions
- **Real-time**: Observation and analysis designed for real-time operation

### Security Considerations
- **User Privacy**: Workflow profiles contain behavior patterns but not sensitive content
- **Data Isolation**: Profiles are user-specific and isolated
- **Input Validation**: All inputs validated against interfaces
- **Error Handling**: Comprehensive error handling with event system
- **Access Control**: Workflow profiles may contain sensitive workflow patterns
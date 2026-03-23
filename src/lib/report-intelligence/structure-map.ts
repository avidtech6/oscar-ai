/**
 * Structure Map Interface for Oscar AI Phase Compliance Package
 * 
 * This file defines the StructureMap interface and related types for the Report Decompiler Engine.
 * It implements Phase 2: Report Decompiler Engine from the Report Intelligence System.
 * 
 * File: src/lib/report-intelligence/structure-map.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

import type { ReportSection, ReportTable, ReportFigure, ReportReference, SectionHierarchy } from './decompiled-report.js';


/**
 * Represents a structure map for document analysis
 */
export interface StructureMap {
  /**
   * Unique identifier for the structure map
   */
  id: string;

  /**
   * Name of the structure map
   */
  name: string;

  /**
   * Version of the structure map
   */
  version: string;

  /**
   * Document sections
   */
  sections: ReportSection[];

  /**
   * Section hierarchy
   */
  hierarchy: SectionHierarchy[];

  /**
   * Tables found in document
   */
  tables: ReportTable[];

  /**
   * Figures found in document
   */
  figures: ReportFigure[];

  /**
   * References found in document
   */
  references: ReportReference[];
}

/**
 * Represents a structure rule
 */
export interface StructureRule {
  /**
   * Rule identifier
   */
  id: string;

  /**
   * Rule name
   */
  name: string;

  /**
   * Rule type
   */
  type: 'pattern' | 'regex' | 'xpath' | 'css' | 'custom';

  /**
   * Rule pattern/selector
   */
  pattern: string;

  /**
   * Rule conditions
   */
  conditions: RuleCondition[];

  /**
   * Rule actions
   */
  actions: RuleAction[];

  /**
   * Rule metadata
   */
  metadata: {
    priority: number;
    enabled: boolean;
    confidence: number;
  };
}

/**
 * Represents a rule condition
 */
export interface RuleCondition {
  /**
   * Condition field
   */
  field: string;

  /**
   * Condition operator
   */
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'matches' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';

  /**
   * Condition value
   */
  value: any;

  /**
   * Condition logic
   */
  logic: 'and' | 'or' | 'not';

  /**
   * Condition confidence
   */
  confidence: number;
}

/**
 * Represents a rule action
 */
export interface RuleAction {
  /**
   * Action type
   */
  type: 'extract' | 'transform' | 'validate' | 'classify' | 'tag' | 'custom';

  /**
   * Action parameters
   */
  parameters: Record<string, any>;

  /**
   * Action confidence
   */
  confidence: number;
}

/**
 * Represents a structure mapping result
 */
export interface StructureMappingResult {
  /**
   * Mapping identifier
   */
  id: string;

  /**
   * Mapping type
   */
  type: 'section' | 'table' | 'figure' | 'reference' | 'custom';

  /**
   * Mapped elements
   */
  elements: MappedElement[];

  /**
   * Mapping confidence
   */
  confidence: number;

  /**
   * Mapping accuracy
   */
  accuracy: number;

  /**
   * Mapping processing time
   */
  processingTime: number;

  /**
   * Mapping metadata
   */
  metadata: {
    rulesApplied: string[];
    elementsProcessed: number;
    errors: string[];
    warnings: string[];
  };
}

/**
 * Represents a mapped element
 */
export interface MappedElement {
  /**
   * Element identifier
   */
  id: string;

  /**
   * Element type
   */
  type: 'section' | 'table' | 'figure' | 'reference' | 'custom';

  /**
   * Element original data
   */
  original: ReportSection | ReportTable | ReportFigure | ReportReference | any;

  /**
   * Element mapped data
   */
  mapped: any;

  /**
   * Element confidence
   */
  confidence: number;

  /**
   * Element position
   */
  position: {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };

  /**
   * Element metadata
   */
  metadata: {
    rulesApplied: string[];
    transformations: string[];
    validations: string[];
  };
}

/**
 * Represents a structure analyzer
 */
export interface StructureAnalyzer {
  /**
   * Analyzer identifier
   */
  id: string;

  /**
   * Analyzer name
   */
  name: string;

  /**
   * Analyzer type
   */
  type: 'document' | 'section' | 'table' | 'figure' | 'reference' | 'custom';

  /**
   * Analyzer configuration
   */
  configuration: AnalyzerConfiguration;

  /**
   * Analyzer rules
   */
  rules: StructureRule[];

  /**
   * Analyzer metadata
   */
  metadata: {
    version: string;
    author: string;
    created: Date;
    modified: Date;
  };
}

/**
 * Represents analyzer configuration
 */
export interface AnalyzerConfiguration {
  /**
   * Enabled flag
   */
  enabled: boolean;

  /**
   * Confidence threshold
   */
  confidenceThreshold: number;

  /**
   * Processing options
   */
  options: {
    strictMode: boolean;
    debugMode: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    maxProcessingTime: number;
  };

  /**
   * Output options
   */
  output: {
    format: 'json' | 'xml' | 'csv' | 'custom';
    includeMetadata: boolean;
    includeConfidence: boolean;
    includePosition: boolean;
  };
}

/**
 * Represents a structure transformer
 */
export interface StructureTransformer {
  /**
   * Transformer identifier
   */
  id: string;

  /**
   * Transformer name
   */
  name: string;

  /**
   * Transformer type
   */
  type: 'document' | 'section' | 'table' | 'figure' | 'reference' | 'custom';

  /**
   * Transformer rules
   */
  rules: StructureRule[];

  /**
   * Transformer metadata
   */
  metadata: {
    version: string;
    author: string;
    created: Date;
    modified: Date;
  };
}

/**
 * Represents a structure validator
 */
export interface StructureValidator {
  /**
   * Validator identifier
   */
  id: string;

  /**
   * Validator name
   */
  name: string;

  /**
   * Validator type
   */
  type: 'document' | 'section' | 'table' | 'figure' | 'reference' | 'custom';

  /**
   * Validator rules
   */
  rules: StructureRule[];

  /**
   * Validator metadata
   */
  metadata: {
    version: string;
    author: string;
    created: Date;
    modified: Date;
  };
}

/**
 * Represents a structure classifier
 */
export interface StructureClassifier {
  /**
   * Classifier identifier
   */
  id: string;

  /**
   * Classifier name
   */
  name: string;

  /**
   * Classifier type
   */
  type: 'document' | 'section' | 'table' | 'figure' | 'reference' | 'custom';

  /**
   * Classifier rules
   */
  rules: StructureRule[];

  /**
   * Classifier metadata
   */
  metadata: {
    version: string;
    author: string;
    created: Date;
    modified: Date;
  };
}

/**
 * Represents a structure tagger
 */
export interface StructureTagger {
  /**
   * Tagger identifier
   */
  id: string;

  /**
   * Tagger name
   */
  name: string;

  /**
   * Tagger type
   */
  type: 'document' | 'section' | 'table' | 'figure' | 'reference' | 'custom';

  /**
   * Tagger rules
   */
  rules: StructureRule[];

  /**
   * Tagger metadata
   */
  metadata: {
    version: string;
    author: string;
    created: Date;
    modified: Date;
  };
}

/**
 * Represents a structure mapping engine
 */
export interface StructureMappingEngine {
  /**
   * Engine identifier
   */
  id: string;

  /**
   * Engine name
   */
  name: string;

  /**
   * Engine version
   */
  version: string;

  /**
   * Engine analyzers
   */
  analyzers: StructureAnalyzer[];

  /**
   * Engine transformers
   */
  transformers: StructureTransformer[];

  /**
   * Engine validators
   */
  validators: StructureValidator[];

  /**
   * Engine classifiers
   */
  classifiers: StructureClassifier[];

  /**
   * Engine taggers
   */
  taggers: StructureTagger[];

  /**
   * Engine metadata
   */
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    description: string;
  };

  /**
   * Engine configuration
   */
  configuration: {
    enabled: boolean;
    debugMode: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    maxProcessingTime: number;
    confidenceThreshold: number;
  };
}

/**
 * Represents a structure mapping result set
 */
export interface StructureMappingResultSet {
  /**
   * Result set identifier
   */
  id: string;

  /**
   * Result set name
   */
  name: string;

  /**
   * Result set timestamp
   */
  timestamp: Date;

  /**
   * Result set results
   */
  results: StructureMappingResult[];

  /**
   * Result set summary
   */
  summary: {
    totalElements: number;
    successfulMappings: number;
    failedMappings: number;
    averageConfidence: number;
    averageAccuracy: number;
    totalProcessingTime: number;
  };

  /**
   * Result set metadata
   */
  metadata: {
    engine: StructureMappingEngine;
    documentId: string;
    documentType: string;
    processingMode: 'batch' | 'stream';
  };
}

/**
 * Represents a structure mapping history
 */
export interface StructureMappingHistory {
  /**
   * History identifier
   */
  id: string;

  /**
   * History timestamp
   */
  timestamp: Date;

  /**
   * History action
   */
  action: 'create' | 'update' | 'delete' | 'execute';

  /**
   * History details
   */
  details: {
    userId: string;
    documentId: string;
    mappingId: string;
    changes: string[];
  };

  /**
   * History result
   */
  result: {
    success: boolean;
    message: string;
    data?: any;
  };
}

/**
 * Represents a structure mapping template
 */
export interface StructureMappingTemplate {
  /**
   * Template identifier
   */
  id: string;

  /**
   * Template name
   */
  name: string;

  /**
   * Template description
   */
  description: string;

  /**
   * Template type
   */
  type: 'document' | 'section' | 'table' | 'figure' | 'reference' | 'custom';

  /**
   * Template structure map
   */
  structureMap: StructureMap;

  /**
   * Template metadata
   */
  metadata: {
    version: string;
    author: string;
    created: Date;
    modified: Date;
    tags: string[];
    category: string;
  };
}

/**
 * Represents a structure mapping library
 */
export interface StructureMappingLibrary {
  /**
   * Library identifier
   */
  id: string;

  /**
   * Library name
   */
  name: string;

  /**
   * Library description
   */
  description: string;

  /**
   * Library templates
   */
  templates: StructureMappingTemplate[];

  /**
   * Library metadata
   */
  metadata: {
    version: string;
    author: string;
    created: Date;
    modified: Date;
    tags: string[];
    category: string;
  };
}

/**
 * Represents a structure mapping export
 */
export interface StructureMappingExport {
  /**
   * Export identifier
   */
  id: string;

  /**
   * Export name
   */
  name: string;

  /**
   * Export format
   */
  format: 'json' | 'xml' | 'csv' | 'custom';

  /**
   * Export data
   */
  data: any;

  /**
   * Export metadata
   */
  metadata: {
    exported: Date;
    exportedBy: string;
    version: string;
    format: string;
    size: number;
  };
}

/**
 * Represents a structure mapping import
 */
export interface StructureMappingImport {
  /**
   * Import identifier
   */
  id: string;

  /**
   * Import name
   */
  name: string;

  /**
   * Import format
   */
  format: 'json' | 'xml' | 'csv' | 'custom';

  /**
   * Import data
   */
  data: any;

  /**
   * Import metadata
   */
  metadata: {
    imported: Date;
    importedBy: string;
    version: string;
    format: string;
    size: number;
  };
}

/**
 * Represents a structure mapping statistics
 */
export interface StructureMappingStatistics {
  /**
   * Total mappings
   */
  totalMappings: number;

  /**
   * Successful mappings
   */
  successfulMappings: number;

  /**
   * Failed mappings
   */
  failedMappings: number;

  /**
   * Average confidence
   */
  averageConfidence: number;

  /**
   * Average accuracy
   */
  averageAccuracy: number;

  /**
   * Total processing time
   */
  totalProcessingTime: number;

  /**
   * Processing time by type
   */
  processingTimeByType: Record<string, number>;

  /**
   * Mappings by type
   */
  mappingsByType: Record<string, number>;

  /**
   * Mappings by confidence
   */
  mappingsByConfidence: Record<string, number>;

  /**
   * Mappings by accuracy
   */
  mappingsByAccuracy: Record<string, number>;
}
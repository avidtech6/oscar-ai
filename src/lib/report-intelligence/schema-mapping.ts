/**
 * Schema Mapping Interfaces for Oscar AI Phase Compliance Package
 * 
 * This file defines the SchemaMapping interface and related types for the Report Schema Mapper.
 * It implements Phase 3: Report Schema Mapper from the Report Intelligence System.
 * 
 * File: src/lib/report-intelligence/schema-mapping.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

/**
 * Represents a schema mapping configuration
 */
export interface SchemaMapping {
  /**
   * Unique identifier for the schema mapping
   */
  id: string;

  /**
   * Schema mapping name
   */
  name: string;

  /**
   * Schema mapping description
   */
  description: string;

  /**
   * Schema mapping version
   */
  version: string;

  /**
   * Schema mapping rules
   */
  rules: SchemaMappingRule[];

  /**
   * Schema mapping conditions
   */
  conditions: SchemaMappingCondition[];

  /**
   * Schema mapping actions
   */
  actions: SchemaMappingAction[];

  /**
   * Schema mapping metadata
   */
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    tags: string[];
    confidence: number;
    accuracy: number;
  };

  /**
   * Schema mapping configuration
   */
  configuration: {
    enabled: boolean;
    preserveOriginal: boolean;
    validateOutput: boolean;
    applyTransformations: boolean;
  };
}

/**
 * Represents a schema mapping rule
 */
export interface SchemaMappingRule {
  /**
   * Rule identifier
   */
  id: string;

  /**
   * Rule name
   */
  name: string;

  /**
   * Rule description
   */
  description: string;

  /**
   * Rule conditions
   */
  conditions: RuleCondition[];

  /**
   * Rule actions
   */
  actions: RuleAction[];

  /**
   * Rule priority
   */
  priority: number;

  /**
   * Rule enabled flag
   */
  enabled: boolean;

  /**
   * Rule metadata
   */
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    tags: string[];
    confidence: number;
    accuracy: number;
  };
}

/**
 * Represents a schema mapping condition
 */
export interface SchemaMappingCondition {
  /**
   * Condition identifier
   */
  id: string;

  /**
   * Field path to check
   */
  fieldPath: string;

  /**
   * Condition operator
   */
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'regex' | 'exists' | 'notExists' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual';

  /**
   * Condition value
   */
  value: any;

  /**
   * Condition logic (AND/OR)
   */
  logic: 'AND' | 'OR';

  /**
   * Condition enabled flag
   */
  enabled: boolean;

  /**
   * Condition metadata
   */
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    tags: string[];
    confidence: number;
    accuracy: number;
  };
}

/**
 * Represents a schema mapping action
 */
export interface SchemaMappingAction {
  /**
   * Action identifier
   */
  id: string;

  /**
   * Action type
   */
  type: 'transform' | 'validate' | 'classify' | 'tag' | 'extract' | 'map' | 'ignore' | 'error';

  /**
   * Target field path
   */
  targetFieldPath: string;

  /**
   * Action parameters
   */
  parameters: Record<string, any>;

  /**
   * Action enabled flag
   */
  enabled: boolean;

  /**
   * Action metadata
   */
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    tags: string[];
    confidence: number;
    accuracy: number;
  };
}

/**
 * Represents a rule condition
 */
export interface RuleCondition {
  /**
   * Condition identifier
   */
  id: string;

  /**
   * Field path to check
   */
  fieldPath: string;

  /**
   * Condition operator
   */
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'regex' | 'exists' | 'notExists' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual';

  /**
   * Condition value
   */
  value: any;

  /**
   * Condition logic (AND/OR)
   */
  logic: 'AND' | 'OR';

  /**
   * Condition enabled flag
   */
  enabled: boolean;

  /**
   * Condition metadata
   */
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    tags: string[];
    confidence: number;
    accuracy: number;
  };
}

/**
 * Represents a rule action
 */
export interface RuleAction {
  /**
   * Action identifier
   */
  id: string;

  /**
   * Action type
   */
  type: 'transform' | 'validate' | 'classify' | 'tag' | 'extract' | 'map' | 'ignore' | 'error';

  /**
   * Target field path
   */
  targetFieldPath: string;

  /**
   * Action parameters
   */
  parameters: Record<string, any>;

  /**
   * Action enabled flag
   */
  enabled: boolean;

  /**
   * Action metadata
   */
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    tags: string[];
    confidence: number;
    accuracy: number;
  };
}

/**
 * Represents a section mapping
 */
export interface SectionMapping {
  /**
   * Section mapping identifier
   */
  id: string;

  /**
   * Section identifier
   */
  sectionId: string;

  /**
   * Section name
   */
  sectionName: string;

  /**
   * Section type
   */
  sectionType: string;

  /**
   * Section order
   */
  sectionOrder: number;

  /**
   * Field mappings
   */
  fieldMappings: FieldMapping[];

  /**
   * Conditions
   */
  conditions: SchemaMappingCondition[];

  /**
   * Actions
   */
  actions: SchemaMappingAction[];

  /**
   * Section mapping metadata
   */
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    tags: string[];
    confidence: number;
    accuracy: number;
  };

  /**
   * Section mapping configuration
   */
  configuration: {
    enabled: boolean;
    preserveOriginal: boolean;
    validateOutput: boolean;
    applyTransformations: boolean;
  };
}

/**
 * Represents a field mapping
 */
export interface FieldMapping {
  /**
   * Field mapping identifier
   */
  id: string;

  /**
   * Source field path
   */
  sourceFieldPath: string;

  /**
   * Target field path
   */
  targetFieldPath: string;

  /**
   * Field mapping type
   */
  type: 'direct' | 'transform' | 'validate' | 'classify' | 'tag' | 'extract' | 'map' | 'ignore' | 'error';

  /**
   * Field mapping parameters
   */
  parameters: Record<string, any>;

  /**
   * Field mapping enabled flag
   */
  enabled: boolean;

  /**
   * Field mapping metadata
   */
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    tags: string[];
    confidence: number;
    accuracy: number;
  };
}

/**
 * Represents a schema mapping result
 */
export interface SchemaMappingResult {
  /**
   * Result identifier
   */
  id: string;

  /**
   * Result type
   */
  type: 'success' | 'error' | 'warning';

  /**
   * Result data
   */
  data: any;

  /**
   * Result metadata
   */
  metadata: {
    processingTime: number;
    confidence: number;
    accuracy: number;
    elementsProcessed: number;
    errors: string[];
    warnings: string[];
  };

  /**
   * Mapping results
   */
  mappingResults: SectionMapping[];

  /**
   * Processing logs
   */
  logs: ProcessingLog[];
}

/**
 * Represents a schema mapping engine
 */
export interface SchemaMappingEngine {
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
   * Analyzers
   */
  analyzers: any[];

  /**
   * Transformers
   */
  transformers: any[];

  /**
   * Validators
   */
  validators: any[];

  /**
   * Classifiers
   */
  classifiers: any[];

  /**
   * Taggers
   */
  taggers: any[];

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
 * Represents a schema mapping progress
 */
export interface SchemaMappingProgress {
  /**
   * Progress identifier
   */
  id: string;

  /**
   * Progress percentage
   */
  percentage: number;

  /**
   * Progress message
   */
  message: string;

  /**
   * Progress stage
   */
  stage: 'initializing' | 'loading' | 'mapping' | 'validating' | 'transforming' | 'finalizing' | 'completed' | 'error';

  /**
   * Progress details
   */
  details: {
    currentStep: string;
    totalSteps: number;
    currentElement: string;
    totalElements: number;
  };

  /**
   * Progress metadata
   */
  metadata: {
    processingTime: number;
    estimatedTime: number;
    confidence: number;
    accuracy: number;
  };
}

/**
 * Represents a processing log
 */
export interface ProcessingLog {
  /**
   * Log timestamp
   */
  timestamp: Date;

  /**
   * Log level
   */
  level: 'error' | 'warn' | 'info' | 'debug';

  /**
   * Log message
   */
  message: string;

  /**
   * Log details
   */
  details: any;

  /**
   * Log source
   */
  source: string;
}

/**
 * Represents a schema mapping analyzer
 */
export interface SchemaMappingAnalyzer {
  /**
   * Analyzer identifier
   */
  id: string;

  /**
   * Analyzer name
   */
  name: string;

  /**
   * Analyzer version
   */
  version: string;

  /**
   * Analyzer type
   */
  type: 'structure' | 'content' | 'semantic' | 'syntactic' | 'contextual';

  /**
   * Analyzer enabled flag
   */
  enabled: boolean;

  /**
   * Analyzer metadata
   */
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    description: string;
    tags: string[];
    confidence: number;
    accuracy: number;
  };

  /**
   * Analyzer configuration
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
 * Represents a schema mapping transformer
 */
export interface SchemaMappingTransformer {
  /**
   * Transformer identifier
   */
  id: string;

  /**
   * Transformer name
   */
  name: string;

  /**
   * Transformer version
   */
  version: string;

  /**
   * Transformer type
   */
  type: 'structure' | 'content' | 'semantic' | 'syntactic' | 'contextual';

  /**
   * Transformer enabled flag
   */
  enabled: boolean;

  /**
   * Transformer metadata
   */
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    description: string;
    tags: string[];
    confidence: number;
    accuracy: number;
  };

  /**
   * Transformer configuration
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
 * Represents a schema mapping validator
 */
export interface SchemaMappingValidator {
  /**
   * Validator identifier
   */
  id: string;

  /**
   * Validator name
   */
  name: string;

  /**
   * Validator version
   */
  version: string;

  /**
   * Validator type
   */
  type: 'structure' | 'content' | 'semantic' | 'syntactic' | 'contextual';

  /**
   * Validator enabled flag
   */
  enabled: boolean;

  /**
   * Validator metadata
   */
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    description: string;
    tags: string[];
    confidence: number;
    accuracy: number;
  };

  /**
   * Validator configuration
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
 * Represents a schema mapping classifier
 */
export interface SchemaMappingClassifier {
  /**
   * Classifier identifier
   */
  id: string;

  /**
   * Classifier name
   */
  name: string;

  /**
   * Classifier version
   */
  version: string;

  /**
   * Classifier type
   */
  type: 'structure' | 'content' | 'semantic' | 'syntactic' | 'contextual';

  /**
   * Classifier enabled flag
   */
  enabled: boolean;

  /**
   * Classifier metadata
   */
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    description: string;
    tags: string[];
    confidence: number;
    accuracy: number;
  };

  /**
   * Classifier configuration
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
 * Represents a schema mapping tagger
 */
export interface SchemaMappingTagger {
  /**
   * Tagger identifier
   */
  id: string;

  /**
   * Tagger name
   */
  name: string;

  /**
   * Tagger version
   */
  version: string;

  /**
   * Tagger type
   */
  type: 'structure' | 'content' | 'semantic' | 'syntactic' | 'contextual';

  /**
   * Tagger enabled flag
   */
  enabled: boolean;

  /**
   * Tagger metadata
   */
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    description: string;
    tags: string[];
    confidence: number;
    accuracy: number;
  };

  /**
   * Tagger configuration
   */
  configuration: {
    enabled: boolean;
    debugMode: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    maxProcessingTime: number;
    confidenceThreshold: number;
  };
}
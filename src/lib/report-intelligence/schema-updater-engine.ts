/**
 * Schema Updater Engine for Oscar AI Phase Compliance Package
 * 
 * This file implements the SchemaUpdaterEngine class for the Schema Updater Engine.
 * It implements Phase 4: Schema Updater Engine from the Report Intelligence System.
 * 
 * File: src/lib/report-intelligence/schema-updater-engine.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

import { ReportDecompiler } from './report-decompiler.js';
import type { DecompiledReport } from './decompiled-report.js';
import type { StructureMap, StructureMappingResult } from './structure-map.js';
import { ReportSchemaMapper } from './report-schema-mapper.js';
import type { SchemaMapping, SchemaMappingResult } from './schema-mapping.js';
import type { UpdateOperation, UpdateCondition, UpdateAction, ValidationResult, SchemaUpdateResult, SchemaUpdateProgress, SchemaUpdateConfiguration, SchemaUpdateStatistics, SchemaUpdateHistory, SchemaUpdateTemplate } from './update-operation.js';

/**
 * Schema Updater Engine Configuration
 */
export interface SchemaUpdaterEngineConfiguration {
  /**
   * Engine enabled flag
   */
  enabled: boolean;

  /**
   * Debug mode flag
   */
  debugMode: boolean;

  /**
   * Log level
   */
  logLevel: 'error' | 'warn' | 'info' | 'debug';

  /**
   * Maximum processing time
   */
  maxProcessingTime: number;

  /**
   * Confidence threshold
   */
  confidenceThreshold: number;

  /**
   * Accuracy threshold
   */
  accuracyThreshold: number;

  /**
   * Maximum retries
   */
  maxRetries: number;

  /**
   * Timeout
   */
  timeout: number;

  /**
   * Preserve original flag
   */
  preserveOriginal: boolean;

  /**
   * Validate output flag
   */
  validateOutput: boolean;

  /**
   * Apply transformations flag
   */
  applyTransformations: boolean;

  /**
   * Rollback on error flag
   */
  rollbackOnError: boolean;

  /**
   * Dry run flag
   */
  dryRun: boolean;

  /**
   * Strict mode flag
   */
  strictMode: boolean;

  /**
   * Maximum errors
   */
  maxErrors: number;

  /**
   * Maximum warnings
   */
  maxWarnings: number;

  /**
   * Maximum log size
   */
  maxLogSize: number;

  /**
   * Log format
   */
  logFormat: 'json' | 'text';
}

/**
 * Schema Updater Engine Class
 */
export class SchemaUpdaterEngine {
  /**
   * Singleton instance
   */
  private static instance: SchemaUpdaterEngine | null = null;

  /**
   * Engine configuration
   */
  private configuration: SchemaUpdaterEngineConfiguration;

  /**
   * Schema mapper instance
   */
  private schemaMapper: ReportSchemaMapper;

  /**
   * Update operations queue
   */
  private operationsQueue: UpdateOperation[] = [];

  /**
   * Processing history
   */
  private processingHistory: SchemaUpdateHistory[] = [];

  /**
   * Statistics
   */
  private statistics: SchemaUpdateStatistics;

  /**
   * Progress listeners
   */
  private progressListeners: ((progress: SchemaUpdateProgress) => void)[] = [];

  /**
   * Result listeners
   */
  private resultListeners: ((result: SchemaUpdateResult) => void)[] = [];

  /**
   * Error listeners
   */
  private errorListeners: ((error: Error) => void)[] = [];

  /**
   * Constructor
   */
  private constructor() {
    this.configuration = this.getDefaultConfiguration();
    this.schemaMapper = ReportSchemaMapper.getInstance();
    this.statistics = this.getInitialStatistics();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SchemaUpdaterEngine {
    if (!SchemaUpdaterEngine.instance) {
      SchemaUpdaterEngine.instance = new SchemaUpdaterEngine();
    }
    return SchemaUpdaterEngine.instance;
  }

  /**
   * Get default configuration
   */
  private getDefaultConfiguration(): SchemaUpdaterEngineConfiguration {
    return {
      enabled: true,
      debugMode: false,
      logLevel: 'info',
      maxProcessingTime: 300000, // 5 minutes
      confidenceThreshold: 0.8,
      accuracyThreshold: 0.9,
      maxRetries: 3,
      timeout: 30000, // 30 seconds
      preserveOriginal: true,
      validateOutput: true,
      applyTransformations: true,
      rollbackOnError: true,
      dryRun: false,
      strictMode: false,
      maxErrors: 10,
      maxWarnings: 50,
      maxLogSize: 1000,
      logFormat: 'json'
    };
  }

  /**
   * Get initial statistics
   */
  private getInitialStatistics(): SchemaUpdateStatistics {
    return {
      skippedOperations: 0,
      validationErrors: 0,
      warnings: 0,
      processingTime: 0,
      averageOperationTime: 0,
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      totalValidationResults: 0,
      errorValidationResults: 0,
      warningValidationResults: 0,
      totalProcessingTime: 0,
      totalConfidence: 0,
      totalAccuracy: 0,
    };
  }

  /**
   * Initialize the engine
   */
  public async initialize(): Promise<void> {
    try {
      this.log('info', 'Initializing Schema Updater Engine');
      
      // Initialize schema mapper
      this.schemaMapper.initialize();
      
      // Initialize statistics
      this.statistics = this.getInitialStatistics();
      
      this.log('info', 'Schema Updater Engine initialized successfully');
    } catch (error) {
      this.log('error', 'Failed to initialize Schema Updater Engine', error);
      throw error;
    }
  }

  /**
   * Update schema with operations
   */
  public async updateSchema(
    operations: UpdateOperation[],
    configuration?: Partial<SchemaUpdaterEngineConfiguration>
  ): Promise<SchemaUpdateResult> {
    const startTime = Date.now();
    
    try {
      this.log('info', 'Starting schema update', { operationsCount: operations.length });
      
      // Update configuration
      if (configuration) {
        this.configuration = { ...this.configuration, ...configuration };
      }
      
      // Validate operations
      const validationResult = await this.validateOperations(operations);
      if (validationResult.type === 'error' && this.configuration.strictMode) {
        throw new Error(`Validation failed: ${validationResult.message}`);
      }
      
      // Create progress tracker
      const progressTracker = this.createProgressTracker();
      
      // Execute operations
      const result = await this.executeOperations(operations, progressTracker);
      
      // Update statistics
      this.updateStatistics(result, Date.now() - startTime);
      
      // Add to history
      this.addToHistory(operations, result);
      
      this.log('info', 'Schema update completed', { 
        processingTime: Date.now() - startTime,
        operationsCount: operations.length,
        resultType: result.type
      });
      
      return result;
    } catch (error) {
      this.log('error', 'Schema update failed', error);
      throw error;
    }
  }

  /**
   * Validate operations
   */
  private async validateOperations(operations: UpdateOperation[]): Promise<ValidationResult> {
    const startTime = Date.now();
    const validationResults: ValidationResult[] = [];
    
    try {
      this.log('info', 'Validating operations', { operationsCount: operations.length });
      
      for (const operation of operations) {
        // Check if operation is enabled
        if (!operation.enabled) {
          validationResults.push({
            id: `validation-${Date.now()}-${operation.id}`,
            type: 'warning',
            data: operation,
            message: `Operation ${operation.name} is disabled`,
            metadata: {
              processingTime: Date.now() - startTime,
              confidence: 1.0,
              accuracy: 1.0,
              elementsProcessed: 1,
              errors: [],
              warnings: ['Operation is disabled']
            },
            details: {
              fieldPath: operation.targetFieldPath,
              expected: true,
              actual: false,
              severity: 'warning',
              suggestions: ['Enable the operation or remove it from the list']
            },
            valid: true,
            errors: [],
            warnings: ['Operation is disabled'],
            timestamp: Date.now(),
            source: 'schema-updater'
          });
          continue;
        }
        
        // Validate operation parameters
        const paramValidation = this.validateOperationParameters(operation);
        validationResults.push(paramValidation);
        
        // Validate operation dependencies
        const dependencyValidation = await this.validateOperationDependencies(operation);
        validationResults.push(dependencyValidation);
      }
      
      // Calculate overall validation result
      const errorCount = validationResults.filter(r => r.type === 'error').length;
      const warningCount = validationResults.filter(r => r.type === 'warning').length;
      
      const overallType = errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'success';
      
      return {
        id: `validation-${Date.now()}`,
        type: overallType,
        data: { validationResults },
        message: overallType === 'error'
          ? `${errorCount} validation errors found`
          : overallType === 'warning'
          ? `${warningCount} validation warnings found`
          : 'All validations passed',
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: 1.0,
          accuracy: 1.0,
          elementsProcessed: operations.length,
          errors: validationResults.filter(r => r.type === 'error').map(r => r.message).filter(msg => msg !== undefined) as string[],
          warnings: validationResults.filter(r => r.type === 'warning').map(r => r.message).filter(msg => msg !== undefined) as string[],
          logs: []
        },
        details: {
          fieldPath: 'operations',
          expected: 'no errors',
          actual: `${errorCount} errors, ${warningCount} warnings`,
          severity: overallType === 'error' ? 'error' : 'info',
          suggestions: errorCount > 0
            ? ['Fix validation errors before proceeding']
            : warningCount > 0
            ? ['Review warnings before proceeding']
            : ['Ready to proceed']
        },
        valid: overallType !== 'error',
        errors: validationResults.filter(r => r.type === 'error').map(r => r.message).filter(msg => msg !== undefined) as string[],
        warnings: validationResults.filter(r => r.type === 'warning').map(r => r.message).filter(msg => msg !== undefined) as string[],
        timestamp: Date.now(),
        source: 'schema-updater'
      };
    } catch (error) {
      this.log('error', 'Validation failed', error);
      return {
        id: `validation-${Date.now()}`,
        type: 'error',
        data: error,
        message: 'Validation failed with an error',
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: 0.0,
          accuracy: 0.0,
          elementsProcessed: 0,
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: [],
          logs: []
        },
        details: {
          fieldPath: 'operations',
          expected: 'successful validation',
          actual: 'validation error',
          severity: 'error',
          suggestions: ['Check the operation configuration and try again']
        },
        valid: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
        timestamp: Date.now(),
        source: 'schema-updater'
      };
    }
  }

  /**
   * Validate operation parameters
   */
  private validateOperationParameters(operation: UpdateOperation): ValidationResult {
    const startTime = Date.now();
    
    try {
      // Check required parameters
      const requiredParams = ['type', 'name', 'targetSchemaId', 'targetFieldPath'];
      const missingParams = requiredParams.filter(param => !operation.parameters?.[param]);
      
      if (missingParams.length > 0) {
        return {
          id: `validation-${Date.now()}-${operation.id}`,
          type: 'error',
          data: operation,
          message: `Missing required parameters: ${missingParams.join(', ')}`,
          metadata: {
            processingTime: Date.now() - startTime,
            confidence: 1.0,
            accuracy: 1.0,
            elementsProcessed: 1,
            errors: [`Missing parameters: ${missingParams.join(', ')}`],
            warnings: [],
            logs: []
          },
          details: {
            fieldPath: operation.targetFieldPath,
            expected: 'all required parameters',
            actual: `missing: ${missingParams.join(', ')}`,
            severity: 'error',
            suggestions: ['Add missing parameters to the operation']
          },
          valid: false,
          errors: [`Missing parameters: ${missingParams.join(', ')}`],
          warnings: [],
          timestamp: Date.now(),
          source: 'schema-updater'
        };
      }
      
      // Validate operation type
      const validTypes = ['create', 'update', 'delete', 'validate', 'transform', 'migrate', 'rollback'];
      if (!validTypes.includes(operation.type!)) {
        return {
          id: `validation-${Date.now()}-${operation.id}`,
          type: 'error',
          data: operation,
          message: `Invalid operation type: ${operation.type}`,
          metadata: {
            processingTime: Date.now() - startTime,
            confidence: 1.0,
            accuracy: 1.0,
            elementsProcessed: 1,
            errors: [`Invalid operation type: ${operation.type}`],
            warnings: [],
            logs: []
          },
          details: {
            fieldPath: operation.targetFieldPath,
            expected: 'valid operation type',
            actual: operation.type,
            severity: 'error',
            suggestions: ['Use one of the valid operation types']
          },
          valid: false,
          errors: [`Invalid operation type: ${operation.type}`],
          warnings: [],
          timestamp: Date.now(),
          source: 'schema-updater'
        };
      }
      
      return {
        id: `validation-${Date.now()}-${operation.id}`,
        type: 'success',
        data: operation,
        message: 'Operation parameters are valid',
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: 1.0,
          accuracy: 1.0,
          elementsProcessed: 1,
          errors: [],
          warnings: [],
          logs: []
        },
        details: {
          fieldPath: operation.targetFieldPath,
          expected: 'valid parameters',
          actual: 'valid parameters',
          severity: 'info',
          suggestions: ['Ready to proceed']
        },
        valid: true,
        errors: [],
        warnings: [],
        timestamp: Date.now(),
        source: 'schema-updater'
      };
    } catch (error) {
      return {
        id: `validation-${Date.now()}-${operation.id}`,
        type: 'error',
        data: operation,
        message: 'Parameter validation failed',
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: 0.0,
          accuracy: 0.0,
          elementsProcessed: 1,
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: [],
          logs: []
        },
        details: {
          fieldPath: operation.targetFieldPath,
          expected: 'successful validation',
          actual: 'validation error',
          severity: 'error',
          suggestions: ['Check the operation parameters and try again']
        },
        valid: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
        timestamp: Date.now(),
        source: 'schema-updater'
      };
    }
  }

  /**
   * Validate operation dependencies
   */
  private async validateOperationDependencies(operation: UpdateOperation): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      // Check if dependencies exist in history
      for (const dependencyId of operation.dependencies || []) {
        const dependencyExists = this.processingHistory.some(
          history => history.operations.some(op => op.id === dependencyId)
        );
        
        if (!dependencyExists) {
          return {
            id: `validation-${Date.now()}-${operation.id}`,
            type: 'error',
            data: operation,
            message: `Dependency not found: ${dependencyId}`,
            metadata: {
              processingTime: Date.now() - startTime,
              confidence: 1.0,
              accuracy: 1.0,
              elementsProcessed: 1,
              errors: [`Dependency not found: ${dependencyId}`],
              warnings: [],
              logs: []
            },
            details: {
              fieldPath: operation.targetFieldPath,
              expected: 'dependency exists',
              actual: `dependency not found: ${dependencyId}`,
              severity: 'error',
              suggestions: ['Add the dependency operation first or remove the dependency']
            },
            valid: false,
            errors: [`Dependency not found: ${dependencyId}`],
            warnings: [],
            timestamp: Date.now(),
            source: 'schema-updater'
          };
        }
      }
      
      return {
        id: `validation-${Date.now()}-${operation.id}`,
        type: 'success',
        data: operation,
        message: 'Operation dependencies are valid',
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: 1.0,
          accuracy: 1.0,
          elementsProcessed: 1,
          errors: [],
          warnings: [],
          logs: []
        },
        details: {
          fieldPath: operation.targetFieldPath,
          expected: 'valid dependencies',
          actual: 'valid dependencies',
          severity: 'info',
          suggestions: ['Ready to proceed']
        },
        valid: true,
        errors: [],
        warnings: [],
        timestamp: Date.now(),
        source: 'schema-updater'
      };
    } catch (error) {
      return {
        valid: false,
        id: `validation-${Date.now()}-${operation.id}`,
        type: 'error',
        message: 'Dependency validation failed',
        errors: [`Dependency validation failed: ${error instanceof Error ? error.message : String(error)}`],
        warnings: [],
        timestamp: Date.now(),
        source: 'SchemaUpdaterEngine'
      };
    }
  }

  /**
   * Execute operations
   */
  private async executeOperations(
    operations: UpdateOperation[],
    progressTracker: SchemaUpdateProgress
  ): Promise<SchemaUpdateResult> {
    const startTime = Date.now();
    const results: SchemaUpdateResult[] = [];
    const validationResults: ValidationResult[] = [];
    
    try {
      this.log('info', 'Executing operations', { operationsCount: operations.length });
      
      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        
        // Update progress
        progressTracker.percentage = Math.round((i / operations.length) * 100);
        progressTracker.details = {
          action: 'processing',
          target: operation.name,
          status: 'processing'
        };
        
        this.notifyProgressListeners(progressTracker);
        
        // Execute operation
        const result = await this.executeOperation(operation);
        results.push(result);
        
        // Collect validation results
        validationResults.push(...result.validationResults);
        
        // Check if operation failed
        if (result.type === 'error' && this.configuration.rollbackOnError) {
          await this.rollbackOperations(operations.slice(0, i));
          throw new Error(`Operation failed: ${operation.name}. Rolling back...`);
        }
      }
      
      // Calculate overall result
      const errorCount = results.filter(r => r.type === 'error').length;
      const warningCount = results.filter(r => r.type === 'warning').length;
      
      const overallType = errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'success';
      
      return {
        id: `result-${Date.now()}`,
        type: overallType,
        operations: operations,
        data: { results, validationResults },
        message: overallType === 'error'
          ? `${errorCount} operations failed`
          : overallType === 'warning'
          ? `${warningCount} operations had warnings`
          : 'All operations completed successfully',
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: this.calculateConfidence(results),
          accuracy: this.calculateAccuracy(results),
          elementsProcessed: operations.length,
          errors: results.filter(r => r.type === 'error').map(r => r.message || '').filter(Boolean),
          warnings: results.filter(r => r.type === 'warning').map(r => r.message || '').filter(Boolean),
          logs: []
        },
        validationResults: validationResults,
        logs: this.collectLogs(results)
      };
    } catch (error) {
      this.log('error', 'Operation execution failed', error);
      return {
        id: `result-${Date.now()}`,
        type: 'error',
        operations: [],
        data: error,
        message: 'Operation execution failed',
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: 0.0,
          accuracy: 0.0,
          elementsProcessed: 0,
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: [],
          logs: []
        },
        validationResults: [],
        logs: this.collectLogs(results)
      };
    }
  }

  /**
   * Execute a single operation
   */
  private async executeOperation(operation: UpdateOperation): Promise<SchemaUpdateResult> {
    const startTime = Date.now();
    
    try {
      this.log('info', `Executing operation: ${operation.name}`, { operationId: operation.id });
      
      // Create schema mapping
      const schemaMapping: SchemaMapping = {
        id: `mapping-${Date.now()}-${operation.id}`,
        name: operation.name,
        description: operation.description,
        version: '1.0.0',
        rules: [],
        conditions: operation.conditions as any[],
        actions: operation.actions.map(action => ({
          id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          targetFieldPath: action.target || '',
          type: 'transform' as const,
          parameters: action.value ? { value: action.value } : {},
          enabled: true,
          metadata: {
            created: new Date(),
            modified: new Date(),
            author: 'system',
            tags: ['schema-updater'],
            confidence: 1.0,
            accuracy: 1.0
          }
        })),
        metadata: {
          created: new Date(),
          modified: new Date(),
          author: operation.metadata?.author || 'system',
          tags: operation.metadata?.tags || [],
          confidence: operation.metadata?.confidence || 1.0,
          accuracy: operation.metadata?.accuracy || 1.0
        },
        configuration: {
          enabled: operation.enabled,
          preserveOriginal: this.configuration.preserveOriginal,
          validateOutput: this.configuration.validateOutput,
          applyTransformations: this.configuration.applyTransformations
        }
      };
      
      // Map schema
      const mappingResult = await this.schemaMapper.mapSchema(
        {} as any,
        schemaMapping
      );
      
      return {
        id: `result-${Date.now()}-${operation.id}`,
        type: mappingResult.type,
        operations: [],
        data: mappingResult.data,
        message: 'Schema mapping completed successfully',
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: mappingResult.metadata.confidence,
          accuracy: mappingResult.metadata.accuracy,
          elementsProcessed: mappingResult.metadata.elementsProcessed,
          errors: mappingResult.metadata.errors,
          warnings: mappingResult.metadata.warnings,
          logs: [`Schema update completed in ${Date.now() - startTime}ms`]
        },
        validationResults: [],
        logs: mappingResult.logs
      };
    } catch (error) {
      this.log('error', `Operation execution failed: ${operation.name}`, error);
      return {
        id: `result-${Date.now()}-${operation.id}`,
        type: 'error',
        operations: [],
        data: error,
        message: `Operation execution failed: ${operation.name}`,
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: 0.0,
          accuracy: 0.0,
          elementsProcessed: 0,
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: [],
          logs: []
        },
        validationResults: [],
        logs: []
      };
    }
  }

  /**
   * Rollback operations
   */
  private async rollbackOperations(operations: UpdateOperation[]): Promise<void> {
    this.log('info', 'Rolling back operations', { operationsCount: operations.length });
    
    for (const operation of operations.reverse()) {
      try {
        const rollbackOperation: UpdateOperation = {
          ...operation,
          type: 'rollback',
          name: `Rollback: ${operation.name}`,
          description: `Rollback operation for: ${operation.description}`
        };
        
        await this.executeOperation(rollbackOperation);
      } catch (error) {
        this.log('error', `Rollback failed for operation: ${operation.name}`, error);
      }
    }
  }

  /**
   * Create progress tracker
   */
  private createProgressTracker(): SchemaUpdateProgress {
    return {
      id: `progress-${Date.now()}`,
      percentage: 0,
      message: 'Initializing...',
      stage: 'initializing',
      currentElement: '',
      details: {
        action: 'Initializing',
        target: 'system',
        status: 'processing'
      },
      metadata: {
        processingTime: 0,
        estimatedTime: this.configuration.maxProcessingTime,
        confidence: 1.0,
        accuracy: 1.0
      }
    };
  }

  /**
   * Update statistics
   */
  private updateStatistics(result: SchemaUpdateResult, processingTime: number): void {
    this.statistics.totalOperations++;
    this.statistics.totalProcessingTime += processingTime;
    this.statistics.averageProcessingTime = this.statistics.totalProcessingTime / this.statistics.totalOperations;
    
    if (result.type === 'success') {
      this.statistics.successfulOperations++;
    } else {
      this.statistics.failedOperations++;
    }
    
    this.statistics.totalValidationResults += result.metadata.elementsProcessed;
    this.statistics.errorValidationResults += result.metadata.errors.length;
    this.statistics.warningValidationResults += result.metadata.warnings.length;
    
    this.statistics.totalConfidence += result.metadata.confidence;
    this.statistics.totalAccuracy += result.metadata.accuracy;
  }

  /**
   * Add to history
   */
  private addToHistory(operations: UpdateOperation[], result: SchemaUpdateResult): void {
    const history: SchemaUpdateHistory = {
      id: `history-${Date.now()}`,
      timestamp: new Date(),
      type: (operations[0]?.type || 'update') as 'update' | 'validation' | 'rollback',
      description: operations.map(op => op.name).join(', '),
      operations,
      results: [result],
      statistics: this.statistics,
      metadata: {
        created: new Date(),
        modified: new Date(),
        author: 'SchemaUpdaterEngine',
        tags: ['schema-update', 'history'],
        confidence: result.metadata.confidence,
        accuracy: result.metadata.accuracy
      }
    };
    
    this.processingHistory.push(history);
    
    // Keep only last 100 history entries
    if (this.processingHistory.length > 100) {
      this.processingHistory = this.processingHistory.slice(-100);
    }
  }

  /**
   * Calculate confidence
   */
  private calculateConfidence(results: SchemaUpdateResult[]): number {
    if (results.length === 0) return 0.0;
    
    const totalConfidence = results.reduce((sum, result) => sum + result.metadata.confidence, 0);
    return totalConfidence / results.length;
  }

  /**
   * Calculate accuracy
   */
  private calculateAccuracy(results: SchemaUpdateResult[]): number {
    if (results.length === 0) return 0.0;
    
    const totalAccuracy = results.reduce((sum, result) => sum + result.metadata.accuracy, 0);
    return totalAccuracy / results.length;
  }

  /**
   * Collect logs
   */
  private collectLogs(results: SchemaUpdateResult[]): any[] {
    const logs: any[] = [];
    
    for (const result of results) {
      logs.push(...result.logs);
    }
    
    return logs;
  }

  /**
   * Log message
   */
  private log(level: 'error' | 'warn' | 'info' | 'debug', message: string, data?: any): void {
    if (this.configuration.debugMode || level === 'error' || level === 'warn') {
      console[level](`[SchemaUpdaterEngine] ${message}`, data || '');
    }
  }

  /**
   * Notify progress listeners
   */
  private notifyProgressListeners(progress: SchemaUpdateProgress): void {
    for (const listener of this.progressListeners) {
      try {
        listener(progress);
      } catch (error) {
        this.log('error', 'Progress listener error', error);
      }
    }
  }

  /**
   * Notify result listeners
   */
  private notifyResultListeners(result: SchemaUpdateResult): void {
    for (const listener of this.resultListeners) {
      try {
        listener(result);
      } catch (error) {
        this.log('error', 'Result listener error', error);
      }
    }
  }

  /**
   * Notify error listeners
   */
  private notifyErrorListeners(error: Error): void {
    for (const listener of this.errorListeners) {
      try {
        listener(error);
      } catch (listenerError) {
        this.log('error', 'Error listener error', listenerError);
      }
    }
  }

  /**
   * Add progress listener
   */
  public addProgressListener(listener: (progress: SchemaUpdateProgress) => void): void {
    this.progressListeners.push(listener);
  }

  /**
   * Add result listener
   */
  public addResultListener(listener: (result: SchemaUpdateResult) => void): void {
    this.resultListeners.push(listener);
  }

  /**
   * Add error listener
   */
  public addErrorListener(listener: (error: Error) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * Remove progress listener
   */
  public removeProgressListener(listener: (progress: SchemaUpdateProgress) => void): void {
    const index = this.progressListeners.indexOf(listener);
    if (index > -1) {
      this.progressListeners.splice(index, 1);
    }
  }

  /**
   * Remove result listener
   */
  public removeResultListener(listener: (result: SchemaUpdateResult) => void): void {
    const index = this.resultListeners.indexOf(listener);
    if (index > -1) {
      this.resultListeners.splice(index, 1);
    }
  }

  /**
   * Remove error listener
   */
  public removeErrorListener(listener: (error: Error) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * Get configuration
   */
  public getConfiguration(): SchemaUpdaterEngineConfiguration {
    return { ...this.configuration };
  }

  /**
   * Set configuration
   */
  public setConfiguration(configuration: Partial<SchemaUpdaterEngineConfiguration>): void {
    this.configuration = { ...this.configuration, ...configuration };
  }

  /**
   * Get statistics
   */
  public getStatistics(): SchemaUpdateStatistics {
    return { ...this.statistics };
  }

  /**
   * Get history
   */
  public getHistory(): SchemaUpdateHistory[] {
    return [...this.processingHistory];
  }

  /**
   * Clear history
   */
  public clearHistory(): void {
    this.processingHistory = [];
  }

  /**
   * Get processing queue
   */
  public getProcessingQueue(): UpdateOperation[] {
    return [...this.operationsQueue];
  }

  /**
   * Add to processing queue
   */
  public addToQueue(operation: UpdateOperation): void {
    this.operationsQueue.push(operation);
  }

  /**
   * Remove from processing queue
   */
  public removeFromQueue(operationId: string): void {
    const index = this.operationsQueue.findIndex(op => op.id === operationId);
    if (index > -1) {
      this.operationsQueue.splice(index, 1);
    }
  }

  /**
   * Clear processing queue
   */
  public clearQueue(): void {
    this.operationsQueue = [];
  }

  /**
   * Shutdown the engine
   */
  public async shutdown(): Promise<void> {
    try {
      this.log('info', 'Shutting down Schema Updater Engine');
      
      // Clear listeners
      this.progressListeners = [];
      this.resultListeners = [];
      this.errorListeners = [];
      
      // Clear queue
      this.clearQueue();
      
      // Clear history
      this.clearHistory();
      
      // Reset statistics
      this.statistics = this.getInitialStatistics();
      
      this.log('info', 'Schema Updater Engine shutdown completed');
    } catch (error) {
      this.log('error', 'Shutdown failed', error);
      throw error;
    }
  }
}
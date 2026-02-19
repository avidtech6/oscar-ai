/**
 * Phase 8: Healing Orchestrator
 * 
 * Central coordinator for integrating the Phase 7 Report Self-Healing Engine
 * into the full Report Intelligence pipeline.
 * 
 * Responsibilities:
 * 1. Decide when and how healing runs in the pipeline
 * 2. Coordinate between pipeline stages
 * 3. Manage batch and streaming modes
 * 4. Ensure safe parallel execution
 * 5. Integrate with global event system
 */

import type { ReportSelfHealingEngine } from '../self-healing/ReportSelfHealingEngine';
import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { ClassificationResult } from '../classification/ClassificationResult';
import type { ReportTypeRegistry } from '../registry/ReportTypeRegistry';
import type { SchemaUpdaterEngine } from '../schema-updater/SchemaUpdaterEngine';
import type { SelfHealingActionBatch } from '../self-healing/SelfHealingAction';

export interface HealingOrchestrationConfig {
  // Pipeline integration
  enableIngestionHealing: boolean;
  enableClassificationHealing: boolean;
  enableMappingHealing: boolean;
  enableValidationHealing: boolean;
  
  // Execution modes
  executionMode: 'batch' | 'streaming' | 'hybrid';
  maxParallelHealing: number;
  healingTimeoutMs: number;
  
  // Pass management
  maxHealingPasses: number;
  minImprovementThreshold: number; // 0-1
  
  // Result integration
  autoApplyHealingResults: boolean;
  requireManualApproval: boolean;
  
  // Event integration
  emitDetailedEvents: boolean;
  eventCorrelationPrefix: string;
}

export interface HealingPipelineContext {
  pipelineStage: 'ingestion' | 'classification' | 'mapping' | 'validation' | 'output';
  reportId: string;
  mappingResultId?: string;
  classificationResultId?: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface HealingOrchestrationResult {
  success: boolean;
  healingBatchId?: string;
  appliedActions: number;
  failedActions: number;
  totalPasses: number;
  processingTimeMs: number;
  improvements: {
    schemaCompleteness: number; // 0-1
    classificationConfidence: number; // 0-1
    mappingConfidence: number; // 0-1
  };
  context: HealingPipelineContext;
}

export interface HealingTrigger {
  type: 'ingestion_complete' | 'classification_complete' | 'mapping_complete' | 'validation_failed' | 'manual';
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: HealingPipelineContext;
}

export class HealingOrchestrator {
  private healingEngine: ReportSelfHealingEngine;
  private registry?: ReportTypeRegistry;
  private schemaUpdater?: SchemaUpdaterEngine;
  private config: HealingOrchestrationConfig;
  
  private activeHealings: Map<string, HealingOrchestrationResult> = new Map();
  private healingQueue: HealingTrigger[] = [];
  private isProcessing: boolean = false;
  private totalHealings: number = 0;
  private successfulHealings: number = 0;
  
  // Event listeners
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(
    healingEngine: ReportSelfHealingEngine,
    config: Partial<HealingOrchestrationConfig> = {},
    registry?: ReportTypeRegistry,
    schemaUpdater?: SchemaUpdaterEngine
  ) {
    this.healingEngine = healingEngine;
    this.registry = registry;
    this.schemaUpdater = schemaUpdater;
    
    this.config = {
      // Pipeline integration defaults
      enableIngestionHealing: true,
      enableClassificationHealing: true,
      enableMappingHealing: true,
      enableValidationHealing: true,
      
      // Execution modes
      executionMode: 'hybrid',
      maxParallelHealing: 3,
      healingTimeoutMs: 30000,
      
      // Pass management
      maxHealingPasses: 3,
      minImprovementThreshold: 0.1,
      
      // Result integration
      autoApplyHealingResults: false,
      requireManualApproval: false,
      
      // Event integration
      emitDetailedEvents: true,
      eventCorrelationPrefix: 'healing_orchestration',
      ...config
    };
  }

  /**
   * Main orchestration method - decides when and how healing runs
   */
  public async orchestrateHealing(
    trigger: HealingTrigger
  ): Promise<HealingOrchestrationResult> {
    const startTime = Date.now();
    const correlationId = this.generateCorrelationId(trigger.context);
    
    this.emitEvent('healing:orchestration:started', {
      correlationId,
      trigger,
      timestamp: new Date()
    });
    
    try {
      // Check if healing should run for this trigger
      if (!this.shouldRunHealing(trigger)) {
        this.emitEvent('healing:orchestration:skipped', {
          correlationId,
          trigger,
          reason: 'Healing not enabled for this trigger type',
          timestamp: new Date()
        });
        
        return {
          success: false,
          appliedActions: 0,
          failedActions: 0,
          totalPasses: 0,
          processingTimeMs: Date.now() - startTime,
          improvements: {
            schemaCompleteness: 0,
            classificationConfidence: 0,
            mappingConfidence: 0
          },
          context: trigger.context
        };
      }
      
      // Get data for healing
      const healingData = await this.prepareHealingData(trigger);
      if (!healingData) {
        throw new Error('Failed to prepare healing data');
      }
      
      // Run healing passes
      const passResults = await this.runHealingPasses(
        healingData.mappingResult,
        healingData.classificationResult,
        correlationId,
        trigger.context
      );
      
      // Integrate healing results
      const integrationResult = await this.integrateHealingResults(
        passResults,
        correlationId,
        trigger.context
      );
      
      // Calculate improvements
      const improvements = this.calculateImprovements(
        healingData.mappingResult,
        passResults
      );
      
      const result: HealingOrchestrationResult = {
        success: integrationResult.success,
        healingBatchId: passResults.batchId,
        appliedActions: integrationResult.appliedActions,
        failedActions: integrationResult.failedActions,
        totalPasses: passResults.totalPasses,
        processingTimeMs: Date.now() - startTime,
        improvements,
        context: trigger.context
      };
      
      // Store result
      this.activeHealings.set(correlationId, result);
      this.totalHealings++;
      if (result.success) this.successfulHealings++;
      
      this.emitEvent('healing:orchestration:completed', {
        correlationId,
        result,
        timestamp: new Date()
      });
      
      return result;
      
    } catch (error) {
      this.emitEvent('healing:orchestration:failed', {
        correlationId,
        trigger,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      });
      
      return {
        success: false,
        appliedActions: 0,
        failedActions: 0,
        totalPasses: 0,
        processingTimeMs: Date.now() - startTime,
        improvements: {
          schemaCompleteness: 0,
          classificationConfidence: 0,
          mappingConfidence: 0
        },
        context: trigger.context
      };
    }
  }

  /**
   * Queue a healing trigger for later processing
   */
  public queueHealing(trigger: HealingTrigger): string {
    const queueId = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.healingQueue.push(trigger);
    this.emitEvent('healing:orchestration:queued', {
      queueId,
      trigger,
      queueSize: this.healingQueue.length,
      timestamp: new Date()
    });
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return queueId;
  }

  /**
   * Process the healing queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.healingQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      // Sort queue by priority
      this.healingQueue.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      
      // Process items based on parallel limit
      const batchSize = Math.min(this.config.maxParallelHealing, this.healingQueue.length);
      const batch = this.healingQueue.splice(0, batchSize);
      
      this.emitEvent('healing:orchestration:queue_processing', {
        batchSize,
        totalQueueSize: this.healingQueue.length,
        timestamp: new Date()
      });
      
      // Process batch in parallel
      const promises = batch.map(trigger => 
        this.orchestrateHealing(trigger)
      );
      
      await Promise.all(promises);
      
    } finally {
      this.isProcessing = false;
      
      // Process next batch if queue not empty
      if (this.healingQueue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }

  /**
   * Determine if healing should run for a given trigger
   */
  private shouldRunHealing(trigger: HealingTrigger): boolean {
    switch (trigger.type) {
      case 'ingestion_complete':
        return this.config.enableIngestionHealing;
      case 'classification_complete':
        return this.config.enableClassificationHealing;
      case 'mapping_complete':
        return this.config.enableMappingHealing;
      case 'validation_failed':
        return this.config.enableValidationHealing;
      case 'manual':
        return true;
      default:
        return false;
    }
  }

  /**
   * Prepare data for healing based on trigger type
   */
  private async prepareHealingData(
    trigger: HealingTrigger
  ): Promise<{ mappingResult: SchemaMappingResult; classificationResult?: ClassificationResult } | null> {
    // In a real implementation, this would fetch data from storage or pipeline
    // For now, we'll return mock data structure
    
    switch (trigger.type) {
      case 'ingestion_complete':
        // Would fetch decompiled report and create initial mapping
        return null;
      case 'classification_complete':
        // Would fetch classification result and associated mapping
        return null;
      case 'mapping_complete':
        // Use the mapping result from the trigger
        return {
          mappingResult: trigger.data.mappingResult,
          classificationResult: trigger.data.classificationResult
        };
      case 'validation_failed':
        // Would fetch failed validation and associated data
        return null;
      case 'manual':
        // Use provided data
        return {
          mappingResult: trigger.data.mappingResult,
          classificationResult: trigger.data.classificationResult
        };
      default:
        return null;
    }
  }

  /**
   * Run multiple healing passes
   */
  private async runHealingPasses(
    mappingResult: SchemaMappingResult,
    classificationResult: ClassificationResult | undefined,
    correlationId: string,
    context: HealingPipelineContext
  ): Promise<{
    batchId: string;
    totalPasses: number;
    actionsByPass: SelfHealingActionBatch[];
    improvements: number[];
  }> {
    const actionsByPass: SelfHealingActionBatch[] = [];
    const improvements: number[] = [];
    
    let currentMappingResult = mappingResult;
    let currentClassificationResult = classificationResult;
    let totalPasses = 0;
    
    for (let pass = 1; pass <= this.config.maxHealingPasses; pass++) {
      this.emitEvent('healing:orchestration:pass_started', {
        correlationId,
        pass,
        totalPasses: this.config.maxHealingPasses,
        timestamp: new Date()
      });
      
      // Run healing analysis
      const actionBatch = await this.healingEngine.analyse(
        currentMappingResult,
        currentClassificationResult
      );
      
      actionsByPass.push(actionBatch);
      totalPasses++;
      
      // Calculate improvement for this pass
      const improvement = this.calculatePassImprovement(
        mappingResult,
        currentMappingResult,
        actionBatch
      );
      improvements.push(improvement);
      
      this.emitEvent('healing:orchestration:pass_completed', {
        correlationId,
        pass,
        actionsGenerated: actionBatch.actions.length,
        improvement,
        timestamp: new Date()
      });
      
      // Check if we should continue
      if (improvement < this.config.minImprovementThreshold) {
        this.emitEvent('healing:orchestration:pass_threshold_reached', {
          correlationId,
          pass,
          improvement,
          threshold: this.config.minImprovementThreshold,
          timestamp: new Date()
        });
        break;
      }
      
      // Apply healing actions to get updated mapping result
      if (this.config.autoApplyHealingResults && this.schemaUpdater) {
        // In a real implementation, we would apply actions and get updated mapping
        // For now, we'll simulate improvement by creating a new mapping result
        currentMappingResult = {
          ...currentMappingResult,
          // Add a confidence property if it doesn't exist
          ...(currentMappingResult as any).confidence ? {} : { confidence: 0.5 }
        } as SchemaMappingResult;
        
        // Simulate confidence improvement
        const currentConfidence = (currentMappingResult as any).confidence || 0.5;
        (currentMappingResult as any).confidence = Math.min(1, currentConfidence + improvement * 0.1);
      }
    }
    
    return {
      batchId: actionsByPass.length > 0 ? actionsByPass[0].id : 'no_batch',
      totalPasses,
      actionsByPass,
      improvements
    };
  }

  /**
   * Integrate healing results back into the pipeline
   */
  private async integrateHealingResults(
    passResults: {
      batchId: string;
      totalPasses: number;
      actionsByPass: SelfHealingActionBatch[];
      improvements: number[];
    },
    correlationId: string,
    context: HealingPipelineContext
  ): Promise<{ success: boolean; appliedActions: number; failedActions: number }> {
    if (passResults.actionsByPass.length === 0) {
      return { success: true, appliedActions: 0, failedActions: 0 };
    }
    
    // Apply healing actions if auto-apply is enabled
    if (this.config.autoApplyHealingResults && !this.config.requireManualApproval) {
      let totalApplied = 0;
      let totalFailed = 0;
      
      for (const batch of passResults.actionsByPass) {
        const applyResult = await this.healingEngine.applyHealingActions(batch.id);
        totalApplied += applyResult.applied;
        totalFailed += applyResult.failed;
      }
      
      this.emitEvent('healing:orchestration:results_integrated', {
        correlationId,
        appliedActions: totalApplied,
        failedActions: totalFailed,
        timestamp: new Date()
      });
      
      return {
        success: totalFailed === 0,
        appliedActions: totalApplied,
        failedActions: totalFailed
      };
    } else {
      // Store for manual approval
      this.emitEvent('healing:orchestration:results_pending_approval', {
        correlationId,
        totalActions: passResults.actionsByPass.reduce((sum, batch) => sum + batch.actions.length, 0),
        timestamp: new Date()
      });
      
      return {
        success: true,
        appliedActions: 0,
        failedActions: 0
      };
    }
  }

  /**
   * Calculate improvement for a healing pass
   */
  private calculatePassImprovement(
    originalMapping: SchemaMappingResult,
    currentMapping: SchemaMappingResult,
    actionBatch: SelfHealingActionBatch
  ): number {
    // Simple improvement calculation based on action severity
    const severityWeights = { critical: 1.0, high: 0.7, medium: 0.4, low: 0.1 };
    
    const totalWeight = actionBatch.actions.reduce((sum, action) => {
      return sum + (severityWeights[action.severity] || 0);
    }, 0);
    
    const maxPossibleWeight = actionBatch.actions.length;
    
    return maxPossibleWeight > 0 ? totalWeight / maxPossibleWeight : 0;
  }

  /**
   * Calculate overall improvements from healing
   */
  private calculateImprovements(
    originalMapping: SchemaMappingResult,
    passResults: {
      batchId: string;
      totalPasses: number;
      actionsByPass: SelfHealingActionBatch[];
      improvements: number[];
    }
  ): HealingOrchestrationResult['improvements'] {
    if (passResults.improvements.length === 0) {
      return {
        schemaCompleteness: 0,
        classificationConfidence: 0,
        mappingConfidence: 0
      };
    }
    
    const avgImprovement = passResults.improvements.reduce((a, b) => a + b, 0) / passResults.improvements.length;
    
    // Use mapping confidence if available, otherwise use default
    const mappingConfidence = (originalMapping as any).confidence || 0.5;
    
    return {
      schemaCompleteness: Math.min(1, mappingConfidence + avgImprovement * 0.3),
      classificationConfidence: Math.min(1, mappingConfidence + avgImprovement * 0.2),
      mappingConfidence: Math.min(1, mappingConfidence + avgImprovement * 0.4)
    };
  }

  /**
   * Generate a correlation ID for tracking
   */
  private generateCorrelationId(context: HealingPipelineContext): string {
    return `${this.config.eventCorrelationPrefix}_${context.reportId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Event system
   */
  private emitEvent(event: string, data: any): void {
    if (!this.config.emitDetailedEvents && !event.includes('error') && !event.includes('failed')) {
      return;
    }
    
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener({ event, data, timestamp: new Date() });
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
    
    // Also emit to global event system if available
    if ((globalThis as any).eventBus) {
      (globalThis as any).eventBus.emit(event, data);
    }
  }

  /**
   * Add event listener
   */
  public on(event: string, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);
  }

  /**
   * Remove event listener
   */
  public off(event: string, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(event, listeners);
    }
  }

  /**
   * Get statistics about healing orchestration
   */
  public getStatistics(): {
    totalHealings: number;
    successfulHealings: number;
    successRate: number;
    averageProcessingTimeMs: number;
    queueSize: number;
    activeHealings: number;
  } {
    const activeHealings = Array.from(this.activeHealings.values());
    const totalProcessingTime = activeHealings.reduce((sum, result) => sum + result.processingTimeMs, 0);
    const avgProcessingTime = activeHealings.length > 0 ? totalProcessingTime / activeHealings.length : 0;
    
    return {
      totalHealings: this.totalHealings,
      successfulHealings: this.successfulHealings,
      successRate: this.totalHealings > 0 ? this.successfulHealings / this.totalHealings : 0,
      averageProcessingTimeMs: avgProcessingTime,
      queueSize: this.healingQueue.length,
      activeHealings: this.activeHealings.size
    };
  }

  /**
   * Clear completed healings from memory
   */
  public clearCompletedHealings(olderThanMs: number = 3600000): number {
    const cutoff = Date.now() - olderThanMs;
    const keysToDelete: string[] = [];
    
    for (const [key, result] of this.activeHealings.entries()) {
      if (result.processingTimeMs < cutoff) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.activeHealings.delete(key));
    return keysToDelete.length;
  }

  /**
   * Get healing queue status
   */
  public getQueueStatus(): Array<{
    priority: string;
    type: string;
    timestamp: Date;
  }> {
    return this.healingQueue.map(trigger => ({
      priority: trigger.priority,
      type: trigger.type,
      timestamp: trigger.context.timestamp
    }));
  }
}
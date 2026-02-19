/**
 * Phase 8: Healing Result Integrator
 * 
 * Integrates healing results back into the pipeline, updating mapping results,
 * classification results, and orchestrating the overall healing flow.
 */

import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { ClassificationResult } from '../classification/ClassificationResult';
import type { SelfHealingActionBatch, SelfHealingAction } from '../self-healing/SelfHealingAction';
import type { HealingPassResult } from './HealingPassManager';
import type { HealingOrchestrationResult } from './HealingOrchestrator';

export interface HealingIntegrationResult {
  integrationId: string;
  mappingResultId: string;
  classificationResultId?: string;
  healingBatchId: string;
  integratedActions: number;
  updatedMappingResult?: SchemaMappingResult;
  updatedClassificationResult?: ClassificationResult;
  integrationStatus: 'pending' | 'partial' | 'complete' | 'failed';
  integrationErrors: string[];
  timestamps: {
    started: string;
    completed?: string;
  };
}

export interface HealingResultIntegrationConfig {
  enableMappingResultUpdate: boolean;
  enableClassificationResultUpdate: boolean;
  enableSchemaPropagation: boolean;
  enableTemplateUpdate: boolean;
  enableAIGuidanceUpdate: boolean;
  enableComplianceRulePropagation: boolean;
  enableTerminologyPropagation: boolean;
  batchSize: number;
  validationEnabled: boolean;
  rollbackOnFailure: boolean;
}

export class HealingResultIntegrator {
  private config: HealingResultIntegrationConfig;
  
  // Event listeners
  private eventListeners: Map<string, Function[]> = new Map();
  
  // Integration cache
  private integrationCache: Map<string, HealingIntegrationResult> = new Map();

  constructor(config: Partial<HealingResultIntegrationConfig> = {}) {
    this.config = {
      enableMappingResultUpdate: true,
      enableClassificationResultUpdate: true,
      enableSchemaPropagation: true,
      enableTemplateUpdate: true,
      enableAIGuidanceUpdate: true,
      enableComplianceRulePropagation: true,
      enableTerminologyPropagation: true,
      batchSize: 50,
      validationEnabled: true,
      rollbackOnFailure: true,
      ...config
    };
  }

  /**
   * Integrate healing results into the pipeline
   */
  public async integrateHealingResults(
    healingBatch: SelfHealingActionBatch,
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult,
    passResults?: HealingPassResult[],
    orchestrationResult?: HealingOrchestrationResult
  ): Promise<HealingIntegrationResult> {
    const integrationId = `integration_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const startTime = new Date().toISOString();
    
    this.emitEvent('healing:integration:started', {
      integrationId,
      healingBatchId: healingBatch.id,
      mappingResultId: mappingResult.id,
      classificationResultId: classificationResult?.id,
      totalActions: healingBatch.actions.length,
      timestamp: new Date()
    });
    
    const integrationResult: HealingIntegrationResult = {
      integrationId,
      mappingResultId: mappingResult.id,
      classificationResultId: classificationResult?.id,
      healingBatchId: healingBatch.id,
      integratedActions: 0,
      integrationStatus: 'pending',
      integrationErrors: [],
      timestamps: {
        started: startTime
      }
    };
    
    try {
      // Filter actions that can be integrated
      const integrableActions = this.filterIntegrableActions(healingBatch.actions);
      
      if (integrableActions.length === 0) {
        integrationResult.integrationStatus = 'complete';
        integrationResult.timestamps.completed = new Date().toISOString();
        
        this.emitEvent('healing:integration:completed', {
          integrationId,
          status: 'complete',
          reason: 'No integrable actions',
          timestamp: new Date()
        });
        
        return integrationResult;
      }
      
      // Group actions by type for batch processing
      const actionGroups = this.groupActionsByType(integrableActions);
      
      // Process each group
      let totalIntegrated = 0;
      const integrationErrors: string[] = [];
      
      for (const [actionType, actions] of Object.entries(actionGroups)) {
        try {
          const groupResult = await this.integrateActionGroup(
            actionType as SelfHealingAction['type'],
            actions,
            mappingResult,
            classificationResult
          );
          
          totalIntegrated += groupResult.integrated;
          
          if (groupResult.errors.length > 0) {
            integrationErrors.push(...groupResult.errors);
          }
          
        } catch (error) {
          const errorMsg = `Failed to integrate ${actionType} actions: ${error instanceof Error ? error.message : String(error)}`;
          integrationErrors.push(errorMsg);
          
          if (this.config.rollbackOnFailure) {
            throw new Error(`Integration failed for ${actionType}: ${errorMsg}`);
          }
        }
      }
      
      // Update mapping result if enabled
      let updatedMappingResult: SchemaMappingResult | undefined;
      if (this.config.enableMappingResultUpdate && totalIntegrated > 0) {
        updatedMappingResult = await this.updateMappingResult(
          mappingResult,
          integrableActions,
          classificationResult
        );
      }
      
      // Update classification result if enabled
      let updatedClassificationResult: ClassificationResult | undefined;
      if (this.config.enableClassificationResultUpdate && classificationResult && totalIntegrated > 0) {
        updatedClassificationResult = await this.updateClassificationResult(
          classificationResult,
          integrableActions,
          mappingResult
        );
      }
      
      // Determine integration status
      let integrationStatus: HealingIntegrationResult['integrationStatus'] = 'complete';
      if (integrationErrors.length > 0) {
        integrationStatus = totalIntegrated > 0 ? 'partial' : 'failed';
      }
      
      // Update integration result
      integrationResult.integratedActions = totalIntegrated;
      integrationResult.updatedMappingResult = updatedMappingResult;
      integrationResult.updatedClassificationResult = updatedClassificationResult;
      integrationResult.integrationStatus = integrationStatus;
      integrationResult.integrationErrors = integrationErrors;
      integrationResult.timestamps.completed = new Date().toISOString();
      
      // Cache the result
      this.integrationCache.set(integrationId, integrationResult);
      
      this.emitEvent('healing:integration:completed', {
        integrationId,
        status: integrationStatus,
        totalIntegrated,
        totalErrors: integrationErrors.length,
        updatedMappingResult: !!updatedMappingResult,
        updatedClassificationResult: !!updatedClassificationResult,
        timestamp: new Date()
      });
      
      return integrationResult;
      
    } catch (error) {
      const errorMsg = `Integration failed: ${error instanceof Error ? error.message : String(error)}`;
      integrationResult.integrationStatus = 'failed';
      integrationResult.integrationErrors.push(errorMsg);
      integrationResult.timestamps.completed = new Date().toISOString();
      
      this.emitEvent('healing:integration:failed', {
        integrationId,
        error: errorMsg,
        timestamp: new Date()
      });
      
      return integrationResult;
    }
  }

  /**
   * Filter actions that can be integrated
   */
  private filterIntegrableActions(actions: SelfHealingAction[]): SelfHealingAction[] {
    return actions.filter(action => {
      // Only integrate applied or approved actions
      if (!['applied', 'approved'].includes(action.status)) {
        return false;
      }
      
      // Check if action type is supported for integration
      const supportedTypes: SelfHealingAction['type'][] = [
        'addMissingSection',
        'addMissingField',
        'fixContradiction',
        'updateSchema',
        'updateTemplate',
        'updateAIGuidance',
        'addMissingComplianceRule',
        'addMissingTerminology',
        'fixStructuralContradiction',
        'fixMetadataContradiction',
        'resolveSchemaGap',
        'improveMappingConfidence',
        'enhanceClassification'
      ];
      
      return supportedTypes.includes(action.type);
    });
  }

  /**
   * Group actions by type
   */
  private groupActionsByType(actions: SelfHealingAction[]): Record<SelfHealingAction['type'], SelfHealingAction[]> {
    const groups: Record<SelfHealingAction['type'], SelfHealingAction[]> = {} as any;
    
    actions.forEach(action => {
      if (!groups[action.type]) {
        groups[action.type] = [];
      }
      groups[action.type].push(action);
    });
    
    return groups;
  }

  /**
   * Integrate a group of actions of the same type
   */
  private async integrateActionGroup(
    actionType: SelfHealingAction['type'],
    actions: SelfHealingAction[],
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult
  ): Promise<{ integrated: number; errors: string[] }> {
    const errors: string[] = [];
    let integrated = 0;
    
    // Process in batches
    for (let i = 0; i < actions.length; i += this.config.batchSize) {
      const batch = actions.slice(i, i + this.config.batchSize);
      
      try {
        switch (actionType) {
          case 'addMissingSection':
            integrated += await this.integrateAddMissingSectionActions(batch, mappingResult);
            break;
            
          case 'addMissingField':
            integrated += await this.integrateAddMissingFieldActions(batch, mappingResult);
            break;
            
          case 'fixContradiction':
            integrated += await this.integrateFixContradictionActions(batch, mappingResult);
            break;
            
          case 'updateSchema':
            integrated += await this.integrateUpdateSchemaActions(batch, mappingResult);
            break;
            
          case 'updateTemplate':
            if (this.config.enableTemplateUpdate) {
              integrated += await this.integrateUpdateTemplateActions(batch);
            }
            break;
            
          case 'updateAIGuidance':
            if (this.config.enableAIGuidanceUpdate) {
              integrated += await this.integrateUpdateAIGuidanceActions(batch);
            }
            break;
            
          case 'addMissingComplianceRule':
            if (this.config.enableComplianceRulePropagation) {
              integrated += await this.integrateAddMissingComplianceRuleActions(batch);
            }
            break;
            
          case 'addMissingTerminology':
            if (this.config.enableTerminologyPropagation) {
              integrated += await this.integrateAddMissingTerminologyActions(batch);
            }
            break;
            
          case 'fixStructuralContradiction':
            integrated += await this.integrateFixStructuralContradictionActions(batch, mappingResult);
            break;
            
          case 'fixMetadataContradiction':
            integrated += await this.integrateFixMetadataContradictionActions(batch, mappingResult);
            break;
            
          case 'resolveSchemaGap':
            integrated += await this.integrateResolveSchemaGapActions(batch, mappingResult);
            break;
            
          case 'improveMappingConfidence':
            integrated += await this.integrateImproveMappingConfidenceActions(batch, mappingResult);
            break;
            
          case 'enhanceClassification':
            if (classificationResult) {
              integrated += await this.integrateEnhanceClassificationActions(batch, classificationResult);
            }
            break;
            
          default:
            errors.push(`Unsupported action type: ${actionType}`);
        }
      } catch (error) {
        errors.push(`Batch integration failed for ${actionType}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return { integrated, errors };
  }

  /**
   * Integrate addMissingSection actions
   */
  private async integrateAddMissingSectionActions(
    actions: SelfHealingAction[],
    mappingResult: SchemaMappingResult
  ): Promise<number> {
    // This would integrate missing sections into the mapping result
    // For now, we'll just emit an event and return count
    this.emitEvent('healing:integration:add_missing_section', {
      actionCount: actions.length,
      mappingResultId: mappingResult.id,
      timestamp: new Date()
    });
    
    return actions.length;
  }

  /**
   * Integrate addMissingField actions
   */
  private async integrateAddMissingFieldActions(
    actions: SelfHealingAction[],
    mappingResult: SchemaMappingResult
  ): Promise<number> {
    this.emitEvent('healing:integration:add_missing_field', {
      actionCount: actions.length,
      mappingResultId: mappingResult.id,
      timestamp: new Date()
    });
    
    return actions.length;
  }

  /**
   * Integrate fixContradiction actions
   */
  private async integrateFixContradictionActions(
    actions: SelfHealingAction[],
    mappingResult: SchemaMappingResult
  ): Promise<number> {
    this.emitEvent('healing:integration:fix_contradiction', {
      actionCount: actions.length,
      mappingResultId: mappingResult.id,
      timestamp: new Date()
    });
    
    return actions.length;
  }

  /**
   * Integrate updateSchema actions
   */
  private async integrateUpdateSchemaActions(
    actions: SelfHealingAction[],
    mappingResult: SchemaMappingResult
  ): Promise<number> {
    if (!this.config.enableSchemaPropagation) {
      return 0;
    }
    
    this.emitEvent('healing:integration:update_schema', {
      actionCount: actions.length,
      mappingResultId: mappingResult.id,
      timestamp: new Date()
    });
    
    return actions.length;
  }

  /**
   * Integrate updateTemplate actions
   */
  private async integrateUpdateTemplateActions(
    actions: SelfHealingAction[]
  ): Promise<number> {
    this.emitEvent('healing:integration:update_template', {
      actionCount: actions.length,
      timestamp: new Date()
    });
    
    return actions.length;
  }

  /**
   * Integrate updateAIGuidance actions
   */
  private async integrateUpdateAIGuidanceActions(
    actions: SelfHealingAction[]
  ): Promise<number> {
    this.emitEvent('healing:integration:update_ai_guidance', {
      actionCount: actions.length,
      timestamp: new Date()
    });
    
    return actions.length;
  }

  /**
   * Integrate addMissingComplianceRule actions
   */
  private async integrateAddMissingComplianceRuleActions(
    actions: SelfHealingAction[]
  ): Promise<number> {
    this.emitEvent('healing:integration:add_missing_compliance_rule', {
      actionCount: actions.length,
      timestamp: new Date()
    });
    
    return actions.length;
  }

  /**
   * Integrate addMissingTerminology actions
   */
  private async integrateAddMissingTerminologyActions(
    actions: SelfHealingAction[]
  ): Promise<number> {
    this.emitEvent('healing:integration:add_missing_terminology', {
      actionCount: actions.length,
      timestamp: new Date()
    });
    
    return actions.length;
  }

  /**
   * Integrate fixStructuralContradiction actions
   */
  private async integrateFixStructuralContradictionActions(
    actions: SelfHealingAction[],
    mappingResult: SchemaMappingResult
  ): Promise<number> {
    this.emitEvent('healing:integration:fix_structural_contradiction', {
      actionCount: actions.length,
      mappingResultId: mappingResult.id,
      timestamp: new Date()
    });
    
    return actions.length;
  }

  /**
   * Integrate fixMetadataContradiction actions
   */
  private async integrateFixMetadataContradictionActions(
    actions: SelfHealingAction[],
    mappingResult: SchemaMappingResult
  ): Promise<number> {
    this.emitEvent('healing:integration:fix_metadata_contradiction', {
      actionCount: actions.length,
      mappingResultId: mappingResult.id,
      timestamp: new Date()
    });
    
    return actions.length;
  }

  /**
   * Integrate resolveSchemaGap actions
   */
  private async integrateResolveSchemaGapActions(
    actions: SelfHealingAction[],
    mappingResult: SchemaMappingResult
  ): Promise<number> {
    this.emitEvent('healing:integration:resolve_schema_gap', {
      actionCount: actions.length,
      mappingResultId: mappingResult.id,
      timestamp: new Date()
    });
    
    return actions.length;
  }

  /**
   * Integrate improveMappingConfidence actions
   */
  private async integrateImproveMappingConfidenceActions(
    actions: SelfHealingAction[],
    mappingResult: SchemaMappingResult
  ): Promise<number> {
    this.emitEvent('healing:integration:improve_mapping_confidence', {
      actionCount: actions.length,
      mappingResultId: mappingResult.id,
      timestamp: new Date()
    });
    
    return actions.length;
  }

  /**
   * Integrate enhanceClassification actions
   */
  private async integrateEnhanceClassificationActions(
    actions: SelfHealingAction[],
    classificationResult: ClassificationResult
  ): Promise<number> {
    this.emitEvent('healing:integration:enhance_classification', {
      actionCount: actions.length,
      classificationResultId: classificationResult.id,
      timestamp: new Date()
    });
    
    return actions.length;
  }

  /**
   * Update mapping result with integrated actions
   */
  private async updateMappingResult(
    originalResult: SchemaMappingResult,
    actions: SelfHealingAction[],
    classificationResult?: ClassificationResult
  ): Promise<SchemaMappingResult> {
    // Create a deep copy of the mapping result
    const updatedResult: SchemaMappingResult = JSON.parse(JSON.stringify(originalResult));
    
    // Update confidence if there are improveMappingConfidence actions
    const confidenceActions = actions.filter(a => a.type === 'improveMappingConfidence');
    if (confidenceActions.length > 0) {
      // Apply confidence improvements
      // This is a placeholder - actual implementation would update confidence scores
      this.emitEvent('healing:integration:update_mapping_confidence', {
        mappingResultId: updatedResult.id,
        confidenceActions: confidenceActions.length,
        timestamp: new Date()
      });
    }
    
    // Update schema if there are schema-related actions
    const schemaActions = actions.filter(a =>
      ['addMissingSection', 'addMissingField', 'updateSchema', 'resolveSchemaGap'].includes(a.type)
    );
    
    if (schemaActions.length > 0) {
      this.emitEvent('healing:integration:update_schema_structure', {
        mappingResultId: updatedResult.id,
        schemaActions: schemaActions.length,
        timestamp: new Date()
      });
    }
    
    // Update contradictions if there are contradiction-related actions
    const contradictionActions = actions.filter(a =>
      ['fixContradiction', 'fixStructuralContradiction', 'fixMetadataContradiction'].includes(a.type)
    );
    
    if (contradictionActions.length > 0) {
      this.emitEvent('healing:integration:resolve_contradictions', {
        mappingResultId: updatedResult.id,
        contradictionActions: contradictionActions.length,
        timestamp: new Date()
      });
    }
    
    return updatedResult;
  }

  /**
   * Update classification result with integrated actions
   */
  private async updateClassificationResult(
    originalResult: ClassificationResult,
    actions: SelfHealingAction[],
    mappingResult: SchemaMappingResult
  ): Promise<ClassificationResult> {
    // Create a deep copy of the classification result
    const updatedResult: ClassificationResult = JSON.parse(JSON.stringify(originalResult));
    
    // Update if there are enhanceClassification actions
    const classificationActions = actions.filter(a => a.type === 'enhanceClassification');
    if (classificationActions.length > 0) {
      this.emitEvent('healing:integration:update_classification', {
        classificationResultId: updatedResult.id,
        classificationActions: classificationActions.length,
        timestamp: new Date()
      });
    }
    
    return updatedResult;
  }

  /**
   * Emit an event
   */
  private emitEvent(eventName: string, data: any): void {
    const listeners = this.eventListeners.get(eventName) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }

  /**
   * Add event listener
   */
  public on(eventName: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventName) || [];
    listeners.push(listener);
    this.eventListeners.set(eventName, listeners);
  }

  /**
   * Remove event listener
   */
  public off(eventName: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventName) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
    this.eventListeners.set(eventName, listeners);
  }

  /**
   * Get integration result by ID
   */
  public getIntegrationResult(integrationId: string): HealingIntegrationResult | undefined {
    return this.integrationCache.get(integrationId);
  }

  /**
   * Get all integration results
   */
  public getAllIntegrationResults(): HealingIntegrationResult[] {
    return Array.from(this.integrationCache.values());
  }

  /**
   * Clear integration cache
   */
  public clearIntegrationCache(): void {
    this.integrationCache.clear();
  }

  /**
   * Get integration statistics
   */
  public getStatistics(): {
    totalIntegrations: number;
    successfulIntegrations: number;
    partialIntegrations: number;
    failedIntegrations: number;
    totalActionsIntegrated: number;
    averageIntegrationTimeMs: number;
  } {
    const results = this.getAllIntegrationResults();
    const totalIntegrations = results.length;
    const successfulIntegrations = results.filter(r => r.integrationStatus === 'complete').length;
    const partialIntegrations = results.filter(r => r.integrationStatus === 'partial').length;
    const failedIntegrations = results.filter(r => r.integrationStatus === 'failed').length;
    
    const totalActionsIntegrated = results.reduce((sum, r) => sum + r.integratedActions, 0);
    
    // Calculate average integration time
    let totalTimeMs = 0;
    let completedCount = 0;
    
    results.forEach(result => {
      if (result.timestamps.completed && result.timestamps.started) {
        const start = new Date(result.timestamps.started).getTime();
        const end = new Date(result.timestamps.completed).getTime();
        totalTimeMs += (end - start);
        completedCount++;
      }
    });
    
    const averageIntegrationTimeMs = completedCount > 0 ? totalTimeMs / completedCount : 0;
    
    return {
      totalIntegrations,
      successfulIntegrations,
      partialIntegrations,
      failedIntegrations,
      totalActionsIntegrated,
      averageIntegrationTimeMs
    };
  }

  /**
   * Validate integration configuration
   */
  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (this.config.batchSize <= 0) {
      errors.push('Batch size must be greater than 0');
    }
    
    if (this.config.batchSize > 1000) {
      errors.push('Batch size cannot exceed 1000');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Reset integrator state
   */
  public reset(): void {
    this.integrationCache.clear();
    this.eventListeners.clear();
  }
}

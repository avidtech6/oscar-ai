/**
 * Report Self-Healing Engine - Phase 7
 * ReportSelfHealingEngine Class
 */

import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { ClassificationResult } from '../classification/ClassificationResult';
import type { ReportTypeRegistry } from '../registry/ReportTypeRegistry';
import type { SchemaUpdaterEngine } from '../schema-updater/SchemaUpdaterEngine';

import {
  SelfHealingAction,
  SelfHealingActionBatch,
  SelfHealingActionType,
  SelfHealingSeverity,
  createSelfHealingAction,
  createSelfHealingActionBatch,
  sortActionsByPriority,
  type SelfHealingTarget
} from './SelfHealingAction';

export type SelfHealingEvent =
  | 'selfHealing:analysisStarted'
  | 'selfHealing:detectionComplete'
  | 'selfHealing:actionsGenerated'
  | 'selfHealing:actionsApplied'
  | 'selfHealing:completed'
  | 'selfHealing:error';

export interface SelfHealingEventData {
  event: SelfHealingEvent;
  data: any;
  timestamp: Date;
}

export interface SelfHealingConfig {
  autoApplyActions: boolean;
  severityThreshold: SelfHealingSeverity;
  confidenceThreshold: number;
  storagePath: string;
  enableDetectors: {
    missingSections: boolean;
    missingFields: boolean;
    missingComplianceRules: boolean;
    missingTerminology: boolean;
    missingTemplates: boolean;
    missingAIGuidance: boolean;
    schemaContradictions: boolean;
    structuralContradictions: boolean;
    metadataContradictions: boolean;
  };
}

export interface DetectionResult {
  detector: string;
  findings: any[];
  confidence: number;
  actions: SelfHealingAction[];
}

export class ReportSelfHealingEngine {
  private registry?: ReportTypeRegistry;
  private schemaUpdater?: SchemaUpdaterEngine;
  private config: SelfHealingConfig;
  private eventListeners: Map<SelfHealingEvent, Function[]> = new Map();
  private isProcessing: boolean = false;
  private detectionResults: Map<string, DetectionResult> = new Map();
  private healingActions: Map<string, SelfHealingAction> = new Map();
  private actionBatches: Map<string, SelfHealingActionBatch> = new Map();
  private totalAnalyses: number = 0;
  private totalActionsGenerated: number = 0;
  private totalActionsApplied: number = 0;
  private totalContradictionsDetected: number = 0;

  constructor(
    registry?: ReportTypeRegistry,
    schemaUpdater?: SchemaUpdaterEngine,
    config: Partial<SelfHealingConfig> = {}
  ) {
    this.registry = registry;
    this.schemaUpdater = schemaUpdater;
    
    this.config = {
      autoApplyActions: false,
      severityThreshold: 'medium',
      confidenceThreshold: 0.7,
      storagePath: 'workspace/self-healing-actions.json',
      enableDetectors: {
        missingSections: true,
        missingFields: true,
        missingComplianceRules: true,
        missingTerminology: true,
        missingTemplates: true,
        missingAIGuidance: true,
        schemaContradictions: true,
        structuralContradictions: true,
        metadataContradictions: true
      },
      ...config
    };
  }

  // Event system methods
  private emit(event: SelfHealingEvent, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener({ event, data, timestamp: new Date() });
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  public on(event: SelfHealingEvent, listener: (data: SelfHealingEventData) => void): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);
  }

  public off(event: SelfHealingEvent, listener: (data: SelfHealingEventData) => void): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(event, listeners);
    }
  }

  // Helper methods
  private clearResultsForMapping(mappingResultId: string): void {
    // Clear detection results for this mapping
    const keysToDelete: string[] = [];
    for (const key of this.detectionResults.keys()) {
      if (key.startsWith(`${mappingResultId}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.detectionResults.delete(key));
    
    // Clear action batches for this mapping
    for (const [batchId, batch] of this.actionBatches.entries()) {
      if (batch.source.mappingResultId === mappingResultId) {
        this.actionBatches.delete(batchId);
      }
    }
  }

  private shouldAutoApplyAction(action: SelfHealingAction): boolean {
    if (!this.config.autoApplyActions) return false;
    
    // Check severity threshold
    const severityOrder: Record<SelfHealingSeverity, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };
    
    const actionSeverity = severityOrder[action.severity];
    const thresholdSeverity = severityOrder[this.config.severityThreshold];
    
    if (actionSeverity < thresholdSeverity) return false;
    
    // Check confidence threshold
    if (action.source.confidence < this.config.confidenceThreshold) return false;
    
    // Check action type - some actions should not be auto-applied
    const noAutoApplyTypes: SelfHealingActionType[] = [
      'fixContradiction',
      'updateSchema',
      'fixStructuralContradiction',
      'fixMetadataContradiction'
    ];
    
    if (noAutoApplyTypes.includes(action.type)) return false;
    
    return true;
  }

  private async applyHealingAction(action: SelfHealingAction): Promise<boolean> {
    try {
      // In a real implementation, this would apply the action to the schema
      // For now, we'll simulate success for most actions
      
      if (this.schemaUpdater) {
        // Use schema updater if available
        // return await this.schemaUpdater.applyHealingAction(action);
      }
      
      // Simulate successful application
      await new Promise(resolve => setTimeout(resolve, 50));
      return true;
    } catch (error) {
      console.error(`Failed to apply healing action ${action.id}:`, error);
      return false;
    }
  }

  // Main analysis method
  public async analyse(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult
  ): Promise<SelfHealingActionBatch> {
    this.emit('selfHealing:analysisStarted', {
      mappingResultId: mappingResult.id,
      classificationResultId: classificationResult?.id
    });
    
    try {
      this.isProcessing = true;
      const startTime = Date.now();
      
      this.clearResultsForMapping(mappingResult.id);
      
      const detectionResults: DetectionResult[] = [];
      const allActions: SelfHealingAction[] = [];
      
      // Run detectors
      if (this.config.enableDetectors.missingSections) {
        const result = await this.detectMissingSections(mappingResult, classificationResult);
        detectionResults.push(result);
        allActions.push(...result.actions);
      }
      
      if (this.config.enableDetectors.missingFields) {
        const result = await this.detectMissingFields(mappingResult, classificationResult);
        detectionResults.push(result);
        allActions.push(...result.actions);
      }
      
      if (this.config.enableDetectors.missingComplianceRules) {
        const result = await this.detectMissingComplianceRules(mappingResult, classificationResult);
        detectionResults.push(result);
        allActions.push(...result.actions);
      }
      
      if (this.config.enableDetectors.missingTerminology) {
        const result = await this.detectMissingTerminology(mappingResult, classificationResult);
        detectionResults.push(result);
        allActions.push(...result.actions);
      }
      
      if (this.config.enableDetectors.missingTemplates) {
        const result = await this.detectMissingTemplates(mappingResult, classificationResult);
        detectionResults.push(result);
        allActions.push(...result.actions);
      }
      
      if (this.config.enableDetectors.missingAIGuidance) {
        const result = await this.detectMissingAIGuidance(mappingResult, classificationResult);
        detectionResults.push(result);
        allActions.push(...result.actions);
      }
      
      if (this.config.enableDetectors.schemaContradictions) {
        const result = await this.detectSchemaContradictions(mappingResult, classificationResult);
        detectionResults.push(result);
        allActions.push(...result.actions);
      }
      
      if (this.config.enableDetectors.structuralContradictions) {
        const result = await this.detectStructuralContradictions(mappingResult, classificationResult);
        detectionResults.push(result);
        allActions.push(...result.actions);
      }
      
      if (this.config.enableDetectors.metadataContradictions) {
        const result = await this.detectMetadataContradictions(mappingResult, classificationResult);
        detectionResults.push(result);
        allActions.push(...result.actions);
      }
      
      detectionResults.forEach(result => {
        this.detectionResults.set(`${mappingResult.id}_${result.detector}`, result);
      });
      
      const sortedActions = sortActionsByPriority(allActions);
      sortedActions.forEach(action => {
        this.healingActions.set(action.id, action);
      });
      
      const actionBatch = createSelfHealingActionBatch(
        mappingResult.id,
        sortedActions,
        classificationResult?.id
      );
      
      actionBatch.timestamps.completed = new Date().toISOString();
      this.actionBatches.set(actionBatch.id, actionBatch);
      
      this.totalAnalyses++;
      this.totalActionsGenerated += sortedActions.length;
      
      const contradictionCount = detectionResults.reduce((count, result) => {
        return count + (result.detector.includes('contradiction') ? result.findings.length : 0);
      }, 0);
      this.totalContradictionsDetected += contradictionCount;
      
      this.emit('selfHealing:detectionComplete', {
        mappingResultId: mappingResult.id,
        detectionResults: detectionResults.length,
        actionsGenerated: sortedActions.length,
        contradictionsDetected: contradictionCount,
        processingTimeMs: Date.now() - startTime
      });
      
      this.emit('selfHealing:actionsGenerated', {
        batchId: actionBatch.id,
        actions: sortedActions.length,
        bySeverity: actionBatch.summary.bySeverity,
        byType: actionBatch.summary.byType
      });
      
      if (this.config.autoApplyActions && sortedActions.length > 0) {
        await this.applyHealingActions(actionBatch.id);
      }
      
      this.emit('selfHealing:completed', {
        batchId: actionBatch.id,
        totalActions: sortedActions.length,
        appliedActions: this.totalActionsApplied
      });
      
      return actionBatch;
      
    } catch (error) {
      this.emit('selfHealing:error', {
        error: error instanceof Error ? error.message : String(error),
        mappingResultId: mappingResult.id
      });
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  public async applyHealingActions(batchId: string): Promise<{
    applied: number;
    failed: number;
    skipped: number;
    details: Array<{ actionId: string; status: string; error?: string }>;
  }> {
    const batch = this.actionBatches.get(batchId);
    if (!batch) throw new Error(`Action batch ${batchId} not found`);
    
    const results: Array<{ actionId: string; status: string; error?: string }> = [];
    let applied = 0, failed = 0, skipped = 0;
    
    const sortedActions = sortActionsByPriority(batch.actions);
    
    for (const action of sortedActions) {
      try {
        if (!this.shouldAutoApplyAction(action)) {
          results.push({ actionId: action.id, status: 'skipped' });
          skipped++;
          continue;
        }
        
        const success = await this.applyHealingAction(action);
        
        if (success) {
          action.status = 'applied';
          action.timestamps.applied = new Date().toISOString();
          this.healingActions.set(action.id, action);
          results.push({ actionId: action.id, status: 'applied' });
          applied++;
          this.totalActionsApplied++;
        } else {
          action.status = 'failed';
          results.push({ actionId: action.id, status: 'failed', error: 'Action application failed' });
          failed++;
        }
      } catch (error) {
        action.status = 'failed';
        results.push({
          actionId: action.id,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error)
        });
        failed++;
      }
    }
    
    batch.timestamps.completed = new Date().toISOString();
    this.actionBatches.set(batchId, batch);
    
    this.emit('selfHealing:actionsApplied', {
      batchId,
      applied,
      failed,
      skipped,
      results
    });
    
    return { applied, failed, skipped, details: results };
  }

  // Detector methods
  private async detectMissingSections(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult
  ): Promise<DetectionResult> {
    const findings: any[] = [];
    const actions: SelfHealingAction[] = [];
    
    if (mappingResult.missingRequiredSections?.length > 0) {
      mappingResult.missingRequiredSections.forEach(section => {
        findings.push({ type: 'missing_required_section', sectionId: section.sectionId });
        
        const target: SelfHealingTarget = { reportTypeId: mappingResult.reportTypeId, sectionId: section.sectionId };
        const payload = { 
          sectionId: section.sectionId, 
          sectionName: section.sectionName, 
          description: section.description || '',
          required: section.required,
          suggestedContent: section.suggestedContent,
          aiGuidance: section.aiGuidance
        };
        
        const action = createSelfHealingAction(
          'addMissingSection',
          target,
          payload,
          section.required ? 'high' : 'medium',
          `Missing required section: ${section.sectionName}`,
          { mappingResultId: mappingResult.id, classificationResultId: classificationResult?.id, detector: 'detectMissingSections', confidence: 0.9 }
        );
        
        actions.push(action);
      });
    }
    
    return { detector: 'detectMissingSections', findings, confidence: findings.length > 0 ? 0.9 : 0.1, actions };
  }

  private async detectMissingFields(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult
  ): Promise<DetectionResult> {
    const findings: any[] = [];
    const actions: SelfHealingAction[] = [];
    
    if (mappingResult.schemaGaps?.length > 0) {
      mappingResult.schemaGaps.forEach(gap => {
        if (gap.type === 'missing_field') {
          findings.push({ type: 'missing_field', gapId: gap.gapId });
          
          const target: SelfHealingTarget = { reportTypeId: mappingResult.reportTypeId, fieldId: gap.affectedFieldId };
          const payload = { 
            fieldId: gap.affectedFieldId || 'unknown', 
            fieldName: 'Unknown field', 
            fieldType: 'text' as const, 
            sectionId: gap.affectedSectionId || 'unknown',
            description: gap.suggestedFix || ''
          };
          
          const action = createSelfHealingAction(
            'addMissingField',
            target,
            payload,
            gap.severity === 'critical' ? 'high' : 'medium',
            `Missing field: ${gap.description}`,
            { mappingResultId: mappingResult.id, classificationResultId: classificationResult?.id, detector: 'detectMissingFields', confidence: gap.confidence }
          );
          
          actions.push(action);
        }
      });
    }
    
    return { detector: 'detectMissingFields', findings, confidence: findings.length > 0 ? 0.8 : 0.1, actions };
  }

  private async detectMissingComplianceRules(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult
  ): Promise<DetectionResult> {
    const findings: any[] = [];
    const actions: SelfHealingAction[] = [];
    
    if (mappingResult.decompiledReportSnapshot?.complianceMarkers) {
      const markers = mappingResult.decompiledReportSnapshot.complianceMarkers;
      if (markers.length > 0) {
        findings.push({ type: 'potential_missing_compliance_rules', markerCount: markers.length });
        
        const target: SelfHealingTarget = { reportTypeId: mappingResult.reportTypeId, complianceRuleId: 'new_rule' };
        const payload = { 
          ruleId: 'new_rule', 
          ruleName: 'Compliance Rule', 
          description: 'Missing compliance rule', 
          standard: 'Unknown', 
          requirement: 'Comply',
          severity: 'critical' as const,
          applicableSections: ['all']
        };
        
        const action = createSelfHealingAction(
          'addMissingComplianceRule',
          target,
          payload,
          'high',
          'Missing compliance rules',
          { mappingResultId: mappingResult.id, classificationResultId: classificationResult?.id, detector: 'detectMissingComplianceRules', confidence: 0.7 }
        );
        
        actions.push(action);
      }
    }
    
    return { detector: 'detectMissingComplianceRules', findings, confidence: findings.length > 0 ? 0.7 : 0.1, actions };
  }

  private async detectMissingTerminology(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult
  ): Promise<DetectionResult> {
    const findings: any[] = [];
    const actions: SelfHealingAction[] = [];
    
    if (mappingResult.unknownTerminology?.length > 0) {
      mappingResult.unknownTerminology.forEach(term => {
        findings.push({ type: 'unknown_terminology', term: term.term });
        
        const target: SelfHealingTarget = { reportTypeId: mappingResult.reportTypeId, terminologyId: `term_${term.term}` };
        const payload = {
          term: term.term,
          definition: term.suggestedDefinition || 'Unknown term',
          category: 'general' as const,
          context: term.context,
          synonyms: [],
          relatedTerms: []
        };
        
        const action = createSelfHealingAction(
          'addMissingTerminology',
          target,
          payload,
          'medium',
          `Unknown terminology: ${term.term}`,
          { mappingResultId: mappingResult.id, classificationResultId: classificationResult?.id, detector: 'detectMissingTerminology', confidence: term.confidence }
        );
        
        actions.push(action);
      });
    }
    
    return { detector: 'detectMissingTerminology', findings, confidence: findings.length > 0 ? 0.8 : 0.1, actions };
  }

  private async detectMissingTemplates(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult
  ): Promise<DetectionResult> {
    const findings: any[] = [];
    const actions: SelfHealingAction[] = [];
    
    if (mappingResult.reportTypeId) {
      findings.push({ type: 'missing_template', reportTypeId: mappingResult.reportTypeId });
      
      const target: SelfHealingTarget = { reportTypeId: mappingResult.reportTypeId, templateId: `template_${mappingResult.reportTypeId}` };
      const payload = {
        templateId: `template_${mappingResult.reportTypeId}`,
        templateChanges: { sections: [], formatting: {}, placeholders: [] },
        reason: 'Create default template'
      };
      
      const action = createSelfHealingAction(
        'updateTemplate',
        target,
        payload,
        'medium',
        `Missing template for report type: ${mappingResult.reportTypeId}`,
        { mappingResultId: mappingResult.id, classificationResultId: classificationResult?.id, detector: 'detectMissingTemplates', confidence: 0.6 }
      );
      
      actions.push(action);
    }
    
    return { detector: 'detectMissingTemplates', findings, confidence: findings.length > 0 ? 0.6 : 0.1, actions };
  }

  private async detectMissingAIGuidance(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult
  ): Promise<DetectionResult> {
    const findings: any[] = [];
    const actions: SelfHealingAction[] = [];
    
    if (mappingResult.reportTypeId) {
      findings.push({ type: 'missing_ai_guidance', reportTypeId: mappingResult.reportTypeId });
      
      const target: SelfHealingTarget = { reportTypeId: mappingResult.reportTypeId, aiGuidanceId: `guidance_${mappingResult.reportTypeId}` };
      const payload = {
        guidanceId: `guidance_${mappingResult.reportTypeId}`,
        guidanceType: 'generation' as const,
        newGuidance: 'Default guidance for report generation',
        examples: [],
        reason: 'Create AI guidance'
      };
      
      const action = createSelfHealingAction(
        'updateAIGuidance',
        target,
        payload,
        'low',
        `Missing AI guidance for report type: ${mappingResult.reportTypeId}`,
        { mappingResultId: mappingResult.id, classificationResultId: classificationResult?.id, detector: 'detectMissingAIGuidance', confidence: 0.5 }
      );
      
      actions.push(action);
    }
    
    return { detector: 'detectMissingAIGuidance', findings, confidence: findings.length > 0 ? 0.5 : 0.1, actions };
  }

  private async detectSchemaContradictions(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult
  ): Promise<DetectionResult> {
    const findings: any[] = [];
    const actions: SelfHealingAction[] = [];
    
    // Check for schema contradictions in mapped fields
    if (mappingResult.mappedFields?.length > 0) {
      // Simple contradiction detection: check for duplicate field mappings
      const fieldMap = new Map<string, any[]>();
      mappingResult.mappedFields.forEach(field => {
        // Use fieldId or id property
        const fieldId = (field as any).fieldId || (field as any).id || 'unknown';
        if (!fieldMap.has(fieldId)) {
          fieldMap.set(fieldId, []);
        }
        fieldMap.get(fieldId)!.push(field);
      });
      
      for (const [fieldId, fields] of fieldMap.entries()) {
        if (fields.length > 1) {
          findings.push({ type: 'schema_contradiction', fieldId, conflictingMappings: fields.length });
          
          const target: SelfHealingTarget = { reportTypeId: mappingResult.reportTypeId, fieldId };
          const payload = {
            contradictionType: 'section_content' as const,
            description: `Multiple mappings for field ${fieldId}`,
            sourceA: fields[0],
            sourceB: fields[1],
            resolution: 'merge' as const,
            mergedValue: { ...fields[0], ...fields[1] }
          };
          
          const action = createSelfHealingAction(
            'fixContradiction',
            target,
            payload,
            'high',
            `Schema contradiction: multiple mappings for field ${fieldId}`,
            { mappingResultId: mappingResult.id, classificationResultId: classificationResult?.id, detector: 'detectSchemaContradictions', confidence: 0.8 }
          );
          
          actions.push(action);
        }
      }
    }
    
    return { detector: 'detectSchemaContradictions', findings, confidence: findings.length > 0 ? 0.8 : 0.1, actions };
  }

  private async detectStructuralContradictions(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult
  ): Promise<DetectionResult> {
    const findings: any[] = [];
    const actions: SelfHealingAction[] = [];
    
    // Check for structural contradictions (e.g., conflicting section hierarchies)
    if (mappingResult.decompiledReportSnapshot?.sections) {
      const sections = mappingResult.decompiledReportSnapshot.sections;
      const sectionLevels = new Map<string, number>();
      
      // Simple detection: check for inconsistent nesting
      for (const section of sections) {
        // Use any type to avoid TypeScript errors
        const sectionAny = section as any;
        if (sectionAny.parentId && sectionLevels.has(sectionAny.parentId)) {
          const parentLevel = sectionLevels.get(sectionAny.parentId)!;
          const expectedLevel = parentLevel + 1;
          const sectionId = sectionAny.id || sectionAny.sectionId;
          
          if (sectionLevels.has(sectionId) && sectionLevels.get(sectionId)! !== expectedLevel) {
            findings.push({ type: 'structural_contradiction', sectionId, expectedLevel, actualLevel: sectionLevels.get(sectionId) });
            
            const target: SelfHealingTarget = { reportTypeId: mappingResult.reportTypeId, sectionId };
            const payload = {
              contradictionDescription: `Inconsistent nesting level for section ${sectionId}`,
              structureA: { level: expectedLevel },
              structureB: { level: sectionLevels.get(sectionId) },
              resolution: 'use_structure_a' as const,
              mergedStructure: { level: expectedLevel }
            };
            
            const action = createSelfHealingAction(
              'fixStructuralContradiction',
              target,
              payload,
              'medium',
              `Structural contradiction in section nesting: ${sectionId}`,
              { mappingResultId: mappingResult.id, classificationResultId: classificationResult?.id, detector: 'detectStructuralContradictions', confidence: 0.7 }
            );
            
            actions.push(action);
          }
        }
        const sectionId = (section as any).id || (section as any).sectionId;
        sectionLevels.set(sectionId, (section as any).level || 0);
      }
    }
    
    return { detector: 'detectStructuralContradictions', findings, confidence: findings.length > 0 ? 0.7 : 0.1, actions };
  }

  private async detectMetadataContradictions(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult
  ): Promise<DetectionResult> {
    const findings: any[] = [];
    const actions: SelfHealingAction[] = [];
    
    // Check for metadata contradictions (e.g., conflicting dates, authors, versions)
    if (mappingResult.decompiledReportSnapshot?.metadata) {
      const metadata = mappingResult.decompiledReportSnapshot.metadata as any;
      
      // Simple detection: check for conflicting dates
      const createdDate = metadata.createdDate || metadata.creationDate || metadata.dateCreated;
      const modifiedDate = metadata.modifiedDate || metadata.lastModified || metadata.dateModified;
      
      if (createdDate && modifiedDate) {
        const created = new Date(createdDate);
        const modified = new Date(modifiedDate);
        
        if (modified < created) {
          findings.push({ type: 'metadata_contradiction', issue: 'modified_date_before_created_date' });
          
          const target: SelfHealingTarget = { reportTypeId: mappingResult.reportTypeId };
          const payload = {
            contradictionDescription: 'Modified date is before created date',
            metadataA: { createdDate },
            metadataB: { modifiedDate },
            resolution: 'use_metadata_a' as const,
            mergedMetadata: { createdDate, modifiedDate: createdDate }
          };
          
          const action = createSelfHealingAction(
            'fixMetadataContradiction',
            target,
            payload,
            'medium',
            'Metadata contradiction: modified date before created date',
            { mappingResultId: mappingResult.id, classificationResultId: classificationResult?.id, detector: 'detectMetadataContradictions', confidence: 0.9 }
          );
          
          actions.push(action);
        }
      }
    }
    
    return { detector: 'detectMetadataContradictions', findings, confidence: findings.length > 0 ? 0.9 : 0.1, actions };
  }
}

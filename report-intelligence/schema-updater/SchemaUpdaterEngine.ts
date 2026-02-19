/**
 * Schema Updater Engine - Phase 4
 * SchemaUpdaterEngine Class
 * 
 * Main engine responsible for updating internal schemas, data models, templates, and AI prompts
 * when new report components are discovered by the Schema Mapper (Phase 3).
 */

import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { ReportTypeDefinition } from '../registry/ReportTypeDefinition';
import type { ReportTypeRegistry } from '../registry/ReportTypeRegistry';
import {
  SchemaUpdateAction,
  SchemaUpdateActionType,
  createSchemaUpdateAction,
  generateSchemaUpdateActionId,
  calculateActionPriority,
  validateSchemaUpdateAction
} from './SchemaUpdateAction';

/**
 * Event types emitted by the SchemaUpdaterEngine
 */
export type SchemaUpdaterEvent = 
  | 'schemaUpdater:analysisStarted'
  | 'schemaUpdater:analysisComplete'
  | 'schemaUpdater:updatesGenerated'
  | 'schemaUpdater:updateApplied'
  | 'schemaUpdater:versionIncremented'
  | 'schemaUpdater:completed'
  | 'schemaUpdater:error';

/**
 * Event data structure
 */
export interface SchemaUpdaterEventData {
  event: SchemaUpdaterEvent;
  data: any;
  timestamp: Date;
}

/**
 * Schema update summary
 */
export interface SchemaUpdateSummary {
  totalActions: number;
  appliedActions: number;
  pendingActions: number;
  rejectedActions: number;
  updatedReportTypes: string[];
  updatedSections: string[];
  updatedTemplates: string[];
  updatedAIGuidance: string[];
  versionChanges: Array<{
    reportTypeId: string;
    oldVersion: string;
    newVersion: string;
  }>;
  processingTimeMs: number;
}

/**
 * Schema Updater Engine Configuration
 */
export interface SchemaUpdaterConfig {
  autoApplyUpdates: boolean;
  requireApprovalFor: Array<'major' | 'moderate' | 'minor'>;
  maxActionsPerUpdate: number;
  versionIncrementStrategy: 'auto' | 'manual' | 'hybrid';
  backupBeforeUpdate: boolean;
  validationThreshold: number; // Minimum confidence threshold (0-1)
}

/**
 * Schema Updater Engine Class
 */
export class SchemaUpdaterEngine {
  // Dependencies
  private registry?: ReportTypeRegistry;
  
  // Configuration
  private config: SchemaUpdaterConfig;
  
  // State
  private actions: SchemaUpdateAction[] = [];
  private appliedActions: SchemaUpdateAction[] = [];
  private eventListeners: Map<SchemaUpdaterEvent, Function[]> = new Map();
  private isProcessing: boolean = false;
  
  // Statistics
  private totalUpdatesProcessed: number = 0;
  private totalActionsGenerated: number = 0;
  private totalActionsApplied: number = 0;
  
  /**
   * Constructor
   */
  constructor(
    registry?: ReportTypeRegistry,
    config: Partial<SchemaUpdaterConfig> = {}
  ) {
    this.registry = registry;
    
    // Default configuration
    this.config = {
      autoApplyUpdates: false,
      requireApprovalFor: ['major'],
      maxActionsPerUpdate: 50,
      versionIncrementStrategy: 'auto',
      backupBeforeUpdate: true,
      validationThreshold: 0.6,
      ...config
    };
  }
  
  /**
   * Analyze a SchemaMappingResult and generate update actions
   */
  public async analyse(mappingResult: SchemaMappingResult): Promise<SchemaUpdateAction[]> {
    this.emit('schemaUpdater:analysisStarted', { mappingResultId: mappingResult.id });
    
    try {
      this.isProcessing = true;
      const startTime = Date.now();
      
      // Clear previous actions
      this.actions = [];
      
      // Generate actions based on schema gaps
      await this.generateActionsFromSchemaGaps(mappingResult);
      
      // Generate actions from unmapped sections
      await this.generateActionsFromUnmappedSections(mappingResult);
      
      // Generate actions from missing required sections
      await this.generateActionsFromMissingSections(mappingResult);
      
      // Generate actions from extra sections
      await this.generateActionsFromExtraSections(mappingResult);
      
      // Generate actions from unknown terminology
      await this.generateActionsFromUnknownTerminology(mappingResult);
      
      // Validate all generated actions
      await this.validateGeneratedActions();
      
      // Sort actions by priority and confidence
      this.sortActionsByPriority();
      
      // Limit actions based on configuration
      if (this.actions.length > this.config.maxActionsPerUpdate) {
        this.actions = this.actions.slice(0, this.config.maxActionsPerUpdate);
      }
      
      const processingTime = Date.now() - startTime;
      
      this.emit('schemaUpdater:analysisComplete', {
        mappingResultId: mappingResult.id,
        totalActions: this.actions.length,
        processingTimeMs: processingTime,
        actions: this.actions
      });
      
      this.totalActionsGenerated += this.actions.length;
      
      return this.actions;
      
    } catch (error) {
      this.emit('schemaUpdater:error', {
        error: error instanceof Error ? error.message : String(error),
        mappingResultId: mappingResult.id
      });
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Apply generated updates
   */
  public async applyUpdates(): Promise<SchemaUpdateSummary> {
    if (this.actions.length === 0) {
      throw new Error('No actions to apply. Run analyse() first.');
    }
    
    this.emit('schemaUpdater:updatesGenerated', { totalActions: this.actions.length });
    
    const startTime = Date.now();
    const summary: SchemaUpdateSummary = {
      totalActions: this.actions.length,
      appliedActions: 0,
      pendingActions: 0,
      rejectedActions: 0,
      updatedReportTypes: [],
      updatedSections: [],
      updatedTemplates: [],
      updatedAIGuidance: [],
      versionChanges: [],
      processingTimeMs: 0
    };
    
    try {
      this.isProcessing = true;
      
      // Backup if configured
      if (this.config.backupBeforeUpdate && this.registry) {
        await this.backupCurrentState();
      }
      
      // Apply each action
      for (const action of this.actions) {
        try {
          // Check if action requires approval
          if (action.requiresApproval && !this.config.autoApplyUpdates) {
            summary.pendingActions++;
            continue;
          }
          
          // Validate action
          const validation = validateSchemaUpdateAction(action);
          if (!validation.isValid) {
            action.validationStatus = 'rejected';
            action.validationNotes = validation.errors.join(', ');
            summary.rejectedActions++;
            continue;
          }
          
          // Apply the action
          await this.applyAction(action);
          
          // Update action status
          action.validationStatus = 'applied';
          action.appliedAt = new Date();
          this.appliedActions.push(action);
          summary.appliedActions++;
          
          // Track what was updated
          this.trackUpdatesInSummary(action, summary);
          
          this.emit('schemaUpdater:updateApplied', { action });
          
        } catch (error) {
          action.validationStatus = 'rejected';
          action.validationNotes = error instanceof Error ? error.message : String(error);
          summary.rejectedActions++;
          this.emit('schemaUpdater:error', { error: `Failed to apply action ${action.id}: ${error}` });
        }
      }
      
      // Increment versions if configured
      if (this.config.versionIncrementStrategy !== 'manual') {
        await this.incrementVersions(summary);
      }
      
      const processingTime = Date.now() - startTime;
      summary.processingTimeMs = processingTime;
      
      this.emit('schemaUpdater:completed', { summary });
      
      this.totalUpdatesProcessed++;
      this.totalActionsApplied += summary.appliedActions;
      
      return summary;
      
    } catch (error) {
      this.emit('schemaUpdater:error', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Get update summary
   */
  public getUpdateSummary(): SchemaUpdateSummary {
    const applied = this.appliedActions.filter(a => a.validationStatus === 'applied');
    const pending = this.actions.filter(a => a.validationStatus === 'pending');
    const rejected = this.actions.filter(a => a.validationStatus === 'rejected');
    
    const updatedReportTypes = new Set<string>();
    const updatedSections = new Set<string>();
    const updatedTemplates = new Set<string>();
    const updatedAIGuidance = new Set<string>();
    
    for (const action of applied) {
      if (action.type === 'updateReportTypeDefinition') {
        updatedReportTypes.add(action.target);
      } else if (action.type === 'addSection' || action.type === 'updateSection') {
        updatedSections.add(action.target);
      } else if (action.type === 'updateTemplate') {
        updatedTemplates.add(action.target);
      } else if (action.type === 'updateAIGuidance') {
        updatedAIGuidance.add(action.target);
      }
    }
    
    return {
      totalActions: this.actions.length,
      appliedActions: applied.length,
      pendingActions: pending.length,
      rejectedActions: rejected.length,
      updatedReportTypes: Array.from(updatedReportTypes),
      updatedSections: Array.from(updatedSections),
      updatedTemplates: Array.from(updatedTemplates),
      updatedAIGuidance: Array.from(updatedAIGuidance),
      versionChanges: [], // Would need to track version changes
      processingTimeMs: 0 // Would need to track processing time
    };
  }
  
  /**
   * Event emitter methods
   */
  public on(event: SchemaUpdaterEvent, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
  
  public off(event: SchemaUpdaterEvent, listener: Function): void {
    if (!this.eventListeners.has(event)) return;
    const listeners = this.eventListeners.get(event)!;
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
  
  private emit(event: SchemaUpdaterEvent, data: any): void {
    if (!this.eventListeners.has(event)) return;
    const eventData: SchemaUpdaterEventData = {
      event,
      data,
      timestamp: new Date()
    };
    this.eventListeners.get(event)!.forEach(listener => {
      try {
        listener(eventData);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
  
  /**
   * Private helper methods
   */
  private async generateActionsFromSchemaGaps(mappingResult: SchemaMappingResult): Promise<void> {
    for (const gap of mappingResult.schemaGaps) {
      const action = this.createActionFromSchemaGap(gap, mappingResult);
      if (action) {
        this.actions.push(action);
      }
    }
  }
  
  private async generateActionsFromUnmappedSections(mappingResult: SchemaMappingResult): Promise<void> {
    for (const section of mappingResult.unmappedSections) {
      const action = this.createActionFromUnmappedSection(section, mappingResult);
      if (action) {
        this.actions.push(action);
      }
    }
  }
  
  private async generateActionsFromMissingSections(mappingResult: SchemaMappingResult): Promise<void> {
    for (const section of mappingResult.missingRequiredSections) {
      const action = this.createActionFromMissingSection(section, mappingResult);
      if (action) {
        this.actions.push(action);
      }
    }
  }
  
  private async generateActionsFromExtraSections(mappingResult: SchemaMappingResult): Promise<void> {
    for (const section of mappingResult.extraSections) {
      const action = this.createActionFromExtraSection(section, mappingResult);
      if (action) {
        this.actions.push(action);
      }
    }
  }
  
  private async generateActionsFromUnknownTerminology(mappingResult: SchemaMappingResult): Promise<void> {
    for (const terminology of mappingResult.unknownTerminology) {
      const action = this.createActionFromUnknownTerminology(terminology, mappingResult);
      if (action) {
        this.actions.push(action);
      }
    }
  }
  
  private createActionFromSchemaGap(gap: any, mappingResult: SchemaMappingResult): SchemaUpdateAction | null {
    // Implementation would create appropriate action based on gap type
    // This is a simplified version
    const now = new Date();
    
    return {
      id: generateSchemaUpdateActionId(),
      type: 'fixSchemaGap' as SchemaUpdateActionType,
      target: gap.affectedSectionId || gap.affectedFieldId || 'unknown',
      payload: {
        gapId: gap.gapId,
        type: gap.type,
        description: gap.description,
        severity: gap.severity,
        fix: gap.suggestedFix,
        affectedSectionId: gap.affectedSectionId,
        affectedFieldId: gap.affectedFieldId,
        data: gap.data
      },
      reason: `Fix schema gap: ${gap.description}`,
      source: 'schema_gap',
      sourceData: gap,
      confidence: gap.confidence,
      validationStatus: 'pending',
      validationNotes: undefined,
      createdAt: now,
      updatedAt: now,
      priority: calculateActionPriority(gap.severity, gap.confidence),
      estimatedImpact: gap.severity === 'critical' ? 'major' : gap.severity === 'warning' ? 'moderate' : 'minor',
      requiresApproval: gap.severity === 'critical' || gap.confidence < this.config.validationThreshold
    };
  }
  
  private createActionFromUnmappedSection(section: any, mappingResult: SchemaMappingResult): SchemaUpdateAction | null {
    const now = new Date();
    
    return {
      id: generateSchemaUpdateActionId(),
      type: 'addSection' as SchemaUpdateActionType,
      target: mappingResult.reportTypeId || 'unknown',
      payload: {
        sectionId: section.sectionId,
        sectionName: section.sectionTitle,
        description: `Auto-generated section from unmapped content: ${section.contentPreview.substring(0, 100)}...`,
        required: false,
        template: undefined,
        aiGuidance: undefined
      },
      reason: `Add unmapped section: ${section.sectionTitle}`,
      source: 'unmapped_section',
      sourceData: section,
      confidence: section.confidence,
      validationStatus: 'pending',
      validationNotes: undefined,
      createdAt: now,
      updatedAt: now,
      priority: calculateActionPriority('warning', section.confidence),
      estimatedImpact: 'moderate',
      requiresApproval: section.confidence < this.config.validationThreshold
    };
  }
  
  private createActionFromMissingSection(section: any, mappingResult: SchemaMappingResult): SchemaUpdateAction | null {
    const now = new Date();
    
    return {
      id: generateSchemaUpdateActionId(),
      type: 'addMissingSection' as SchemaUpdateActionType,
      target: mappingResult.reportTypeId || 'unknown',
      payload: {
        sectionId: section.sectionId,
        sectionName: section.sectionName,
        description: section.description,
        required: section.required,
        reason: section.reason,
        suggestedContent: section.suggestedContent,
        aiGuidance: section.aiGuidance
      },
      reason: `Add missing required section: ${section.sectionName}`,
      source: 'missing_section',
      sourceData: section,
      confidence: 0.9, // High confidence for missing required sections
      validationStatus: 'pending',
      validationNotes: undefined,
      createdAt: now,
      updatedAt: now,
      priority: 'high',
      estimatedImpact: 'major',
      requiresApproval: false
    };
  }
  
  private createActionFromExtraSection(section: any, mappingResult: SchemaMappingResult): SchemaUpdateAction | null {
    const now = new Date();
    
    return {
      id: generateSchemaUpdateActionId(),
      type: 'addSection' as SchemaUpdateActionType,
      target: mappingResult.reportTypeId || 'unknown',
      payload: {
        sectionId: section.sectionId,
        sectionName: section.sectionTitle,
        description: `Extra section not in schema: ${section.potentialPurpose}`,
        required: false,
        template: undefined,
        aiGuidance: undefined
      },
      reason: `Add extra section: ${section.sectionTitle}`,
      source: 'extra_section',
      sourceData: section,
      confidence: section.confidence,
      validationStatus: 'pending',
      validationNotes: undefined,
      createdAt: now,
      updatedAt: now,
      priority: calculateActionPriority('info', section.confidence),
      estimatedImpact: 'minor',
      requiresApproval: section.confidence < this.config.validationThreshold
    };
  }
  
  private createActionFromUnknownTerminology(terminology: any, mappingResult: SchemaMappingResult): SchemaUpdateAction | null {
    const now = new Date();
    
    return {
      id: generateSchemaUpdateActionId(),
      type: 'addTerminology' as SchemaUpdateActionType,
      target: 'terminology_registry',
      payload: {
        term: terminology.term,
        definition: terminology.suggestedDefinition || `Term encountered in report: ${terminology.context.substring(0, 100)}...`,
        category: terminology.category,
        synonyms: [],
        examples: [terminology.context],
        relatedTerms: [],
        source: `Report: ${mappingResult.id}`
      },
      reason: `Add unknown terminology: ${terminology.term}`,
      source: 'unknown_terminology',
      sourceData: terminology,
      confidence: terminology.confidence,
      validationStatus: 'pending',
      validationNotes: undefined,
      createdAt: now,
      updatedAt: now,
      priority: calculateActionPriority('info', terminology.confidence),
      estimatedImpact: 'minor',
      requiresApproval: terminology.confidence < this.config.validationThreshold
    };
  }
  
  private async validateGeneratedActions(): Promise<void> {
    for (const action of this.actions) {
      const validation = validateSchemaUpdateAction(action);
      if (!validation.isValid) {
        action.validationStatus = 'rejected';
        action.validationNotes = validation.errors.join(', ');
      }
    }
  }
  
  private sortActionsByPriority(): void {
    this.actions.sort((a, b) => {
      // Priority order: critical > high > medium > low
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityA = priorityOrder[a.priority];
      const priorityB = priorityOrder[b.priority];
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same priority, sort by confidence (higher first)
      return b.confidence - a.confidence;
    });
  }
  
  private async backupCurrentState(): Promise<void> {
    // Implementation would backup current registry state
    // This is a placeholder for actual backup logic
    console.log('Backing up current schema state...');
  }
  
  private async applyAction(action: SchemaUpdateAction): Promise<void> {
    // Implementation would apply the action to the registry
    // This is a placeholder for actual application logic
    console.log(`Applying action ${action.id} of type ${action.type} to target ${action.target}`);
    
    // In a real implementation, this would:
    // 1. Load the target entity (report type, section, etc.)
    // 2. Apply the update based on action type
    // 3. Save the updated entity
    // 4. Emit appropriate events
  }
  
  private trackUpdatesInSummary(action: SchemaUpdateAction, summary: SchemaUpdateSummary): void {
    switch (action.type) {
      case 'updateReportTypeDefinition':
        if (!summary.updatedReportTypes.includes(action.target)) {
          summary.updatedReportTypes.push(action.target);
        }
        break;
      case 'addSection':
      case 'updateSection':
      case 'addMissingSection':
        if (!summary.updatedSections.includes(action.target)) {
          summary.updatedSections.push(action.target);
        }
        break;
      case 'updateTemplate':
        if (!summary.updatedTemplates.includes(action.target)) {
          summary.updatedTemplates.push(action.target);
        }
        break;
      case 'updateAIGuidance':
        if (!summary.updatedAIGuidance.includes(action.target)) {
          summary.updatedAIGuidance.push(action.target);
        }
        break;
    }
  }
  
  private async incrementVersions(summary: SchemaUpdateSummary): Promise<void> {
    // Implementation would increment versions of updated report types
    // This is a placeholder for actual version increment logic
    if (summary.updatedReportTypes.length > 0) {
      console.log(`Incrementing versions for: ${summary.updatedReportTypes.join(', ')}`);
      
      // In a real implementation, this would:
      // 1. Load each report type definition
      // 2. Parse current version (e.g., "1.2.3")
      // 3. Increment based on strategy (major/minor/patch)
      // 4. Update version and save
      // 5. Track version changes in summary
    }
  }
  
  /**
   * Get engine statistics
   */
  public getStatistics(): {
    totalUpdatesProcessed: number;
    totalActionsGenerated: number;
    totalActionsApplied: number;
    successRate: number;
  } {
    const successRate = this.totalActionsGenerated > 0
      ? (this.totalActionsApplied / this.totalActionsGenerated) * 100
      : 0;
    
    return {
      totalUpdatesProcessed: this.totalUpdatesProcessed,
      totalActionsGenerated: this.totalActionsGenerated,
      totalActionsApplied: this.totalActionsApplied,
      successRate
    };
  }
  
  /**
   * Reset engine state
   */
  public reset(): void {
    this.actions = [];
    this.appliedActions = [];
    this.isProcessing = false;
  }
  
  /**
   * Get current configuration
   */
  public getConfig(): SchemaUpdaterConfig {
    return { ...this.config };
  }
  
  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<SchemaUpdaterConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
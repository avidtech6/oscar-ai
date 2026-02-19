/**
 * Self Healing Storage Service
 * Manages storage of self-healing actions in workspace/self-healing-actions.json
 */

import type { SelfHealingAction, SelfHealingActionBatch } from '../SelfHealingAction';
import { validateSelfHealingAction, updateActionStatus } from '../SelfHealingAction';
import fs from 'fs';
import path from 'path';

export interface SelfHealingStorageOptions {
  storagePath?: string;
  autoSave?: boolean;
  maxActions?: number;
  backupEnabled?: boolean;
}

export interface SelfHealingStorageData {
  version: string;
  lastUpdated: string;
  actions: SelfHealingAction[];
  batches: SelfHealingActionBatch[];
  statistics: {
    totalActions: number;
    totalBatches: number;
    byStatus: Record<SelfHealingAction['status'], number>;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
  };
}

export class SelfHealingStorageService {
  private storagePath: string;
  private autoSave: boolean;
  private maxActions: number;
  private backupEnabled: boolean;
  private data: SelfHealingStorageData;
  private isInitialized: boolean = false;

  constructor(options: SelfHealingStorageOptions = {}) {
    this.storagePath = options.storagePath || path.join('workspace', 'self-healing-actions.json');
    this.autoSave = options.autoSave !== false;
    this.maxActions = options.maxActions || 1000;
    this.backupEnabled = options.backupEnabled !== false;
    
    // Initialize with empty data
    this.data = this.createEmptyData();
  }

  /**
   * Initialize the storage service
   */
  public async initialize(): Promise<void> {
    try {
      await this.loadFromDisk();
      this.isInitialized = true;
    } catch (error) {
      // File doesn't exist or is invalid, create new
      this.data = this.createEmptyData();
      await this.saveToDisk();
      this.isInitialized = true;
    }
  }

  /**
   * Check if service is initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Save an action to storage
   */
  public async saveAction(action: SelfHealingAction): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Validate the action
    const validation = validateSelfHealingAction(action);
    if (!validation.isValid) {
      throw new Error(`Invalid action: ${validation.errors.join(', ')}`);
    }

    // Check if action already exists
    const existingIndex = this.data.actions.findIndex(a => a.id === action.id);
    
    if (existingIndex >= 0) {
      // Update existing action
      this.data.actions[existingIndex] = action;
    } else {
      // Add new action
      this.data.actions.push(action);
      
      // Enforce max actions limit
      if (this.data.actions.length > this.maxActions) {
        // Remove oldest actions (by created timestamp)
        this.data.actions.sort((a, b) => 
          new Date(a.timestamps.created).getTime() - new Date(b.timestamps.created).getTime()
        );
        this.data.actions = this.data.actions.slice(-this.maxActions);
      }
    }

    // Update statistics
    this.updateStatistics();

    // Update timestamp
    this.data.lastUpdated = new Date().toISOString();

    // Auto-save if enabled
    if (this.autoSave) {
      await this.saveToDisk();
    }

    return action.id;
  }

  /**
   * Save a batch of actions
   */
  public async saveBatch(batch: SelfHealingActionBatch): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Save all actions in the batch
    for (const action of batch.actions) {
      await this.saveAction(action);
    }

    // Add batch to batches list
    this.data.batches.push(batch);
    
    // Update statistics
    this.updateStatistics();

    // Update timestamp
    this.data.lastUpdated = new Date().toISOString();

    // Auto-save if enabled
    if (this.autoSave) {
      await this.saveToDisk();
    }

    return batch.id;
  }

  /**
   * Get an action by ID
   */
  public getAction(id: string): SelfHealingAction | undefined {
    if (!this.isInitialized) {
      throw new Error('Storage service not initialized');
    }
    
    return this.data.actions.find(action => action.id === id);
  }

  /**
   * Get a batch by ID
   */
  public getBatch(id: string): SelfHealingActionBatch | undefined {
    if (!this.isInitialized) {
      throw new Error('Storage service not initialized');
    }
    
    return this.data.batches.find(batch => batch.id === id);
  }

  /**
   * Get all actions with optional filtering
   */
  public getActions(filter?: {
    status?: SelfHealingAction['status'] | SelfHealingAction['status'][];
    severity?: string | string[];
    type?: string | string[];
    limit?: number;
    offset?: number;
  }): SelfHealingAction[] {
    if (!this.isInitialized) {
      throw new Error('Storage service not initialized');
    }

    let actions = [...this.data.actions];

    // Apply filters
    if (filter?.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      actions = actions.filter(action => statuses.includes(action.status));
    }

    if (filter?.severity) {
      const severities = Array.isArray(filter.severity) ? filter.severity : [filter.severity];
      actions = actions.filter(action => severities.includes(action.severity));
    }

    if (filter?.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      actions = actions.filter(action => types.includes(action.type));
    }

    // Apply pagination
    const offset = filter?.offset || 0;
    const limit = filter?.limit || actions.length;
    
    return actions.slice(offset, offset + limit);
  }

  /**
   * Update action status
   */
  public async updateActionStatus(
    actionId: string,
    status: SelfHealingAction['status'],
    notes?: string
  ): Promise<SelfHealingAction | undefined> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const action = this.getAction(actionId);
    if (!action) {
      return undefined;
    }

    const updatedAction = updateActionStatus(action, status, notes);
    await this.saveAction(updatedAction);

    return updatedAction;
  }

  /**
   * Delete an action
   */
  public async deleteAction(id: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const initialLength = this.data.actions.length;
    this.data.actions = this.data.actions.filter(action => action.id !== id);
    
    if (this.data.actions.length < initialLength) {
      // Update statistics
      this.updateStatistics();
      this.data.lastUpdated = new Date().toISOString();

      // Auto-save if enabled
      if (this.autoSave) {
        await this.saveToDisk();
      }

      return true;
    }

    return false;
  }

  /**
   * Clear all actions (with optional filter)
   */
  public async clearActions(filter?: {
    status?: SelfHealingAction['status'] | SelfHealingAction['status'][];
    olderThan?: Date;
  }): Promise<number> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const initialCount = this.data.actions.length;
    
    if (!filter) {
      // Clear all actions
      this.data.actions = [];
    } else {
      // Apply filters
      let actionsToKeep = [...this.data.actions];

      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        actionsToKeep = actionsToKeep.filter(action => !statuses.includes(action.status));
      }

      if (filter.olderThan) {
        const cutoff = filter.olderThan.getTime();
        actionsToKeep = actionsToKeep.filter(action => 
          new Date(action.timestamps.created).getTime() > cutoff
        );
      }

      this.data.actions = actionsToKeep;
    }

    const removedCount = initialCount - this.data.actions.length;
    
    if (removedCount > 0) {
      // Update statistics
      this.updateStatistics();
      this.data.lastUpdated = new Date().toISOString();

      // Auto-save if enabled
      if (this.autoSave) {
        await this.saveToDisk();
      }
    }

    return removedCount;
  }

  /**
   * Get storage statistics
   */
  public getStatistics(): SelfHealingStorageData['statistics'] {
    if (!this.isInitialized) {
      throw new Error('Storage service not initialized');
    }
    
    return { ...this.data.statistics };
  }

  /**
   * Export data to JSON
   */
  public exportData(): SelfHealingStorageData {
    if (!this.isInitialized) {
      throw new Error('Storage service not initialized');
    }
    
    return JSON.parse(JSON.stringify(this.data));
  }

  /**
   * Import data from JSON
   */
  public async importData(data: SelfHealingStorageData): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Validate data structure
    if (!data.version || !data.actions || !Array.isArray(data.actions)) {
      throw new Error('Invalid data format');
    }

    // Validate each action
    for (const action of data.actions) {
      const validation = validateSelfHealingAction(action);
      if (!validation.isValid) {
        throw new Error(`Invalid action in import: ${validation.errors.join(', ')}`);
      }
    }

    this.data = data;
    this.updateStatistics();
    this.data.lastUpdated = new Date().toISOString();

    // Auto-save if enabled
    if (this.autoSave) {
      await this.saveToDisk();
    }
  }

  /**
   * Force save to disk
   */
  public async saveToDisk(): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create backup if enabled
      if (this.backupEnabled && fs.existsSync(this.storagePath)) {
        const backupPath = `${this.storagePath}.backup.${Date.now()}`;
        fs.copyFileSync(this.storagePath, backupPath);
      }

      // Write to file
      fs.writeFileSync(
        this.storagePath,
        JSON.stringify(this.data, null, 2),
        'utf8'
      );
    } catch (error) {
      throw new Error(`Failed to save to disk: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load data from disk
   */
  private async loadFromDisk(): Promise<void> {
    try {
      if (!fs.existsSync(this.storagePath)) {
        throw new Error('File does not exist');
      }

      const content = fs.readFileSync(this.storagePath, 'utf8');
      const data = JSON.parse(content) as SelfHealingStorageData;

      // Validate data structure
      if (!data.version || !data.actions || !Array.isArray(data.actions)) {
        throw new Error('Invalid data format');
      }

      this.data = data;
      
      // Ensure statistics are up to date
      this.updateStatistics();
    } catch (error) {
      throw new Error(`Failed to load from disk: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create empty data structure
   */
  private createEmptyData(): SelfHealingStorageData {
    const now = new Date().toISOString();
    
    return {
      version: '1.0.0',
      lastUpdated: now,
      actions: [],
      batches: [],
      statistics: {
        totalActions: 0,
        totalBatches: 0,
        byStatus: {
          pending: 0,
          approved: 0,
          applied: 0,
          rejected: 0,
          failed: 0
        },
        bySeverity: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0
        },
        byType: {
          addMissingSection: 0,
          addMissingField: 0,
          fixContradiction: 0,
          updateSchema: 0,
          updateTemplate: 0,
          updateAIGuidance: 0,
          addMissingComplianceRule: 0,
          addMissingTerminology: 0,
          fixStructuralContradiction: 0,
          fixMetadataContradiction: 0,
          resolveSchemaGap: 0,
          improveMappingConfidence: 0,
          enhanceClassification: 0
        }
      }
    };
  }

  /**
   * Update statistics based on current data
   */
  private updateStatistics(): void {
    const stats = this.createEmptyData().statistics;
    
    // Count actions
    stats.totalActions = this.data.actions.length;
    stats.totalBatches = this.data.batches.length;
    
    // Reset counters
    Object.keys(stats.byStatus).forEach(key => {
      stats.byStatus[key as SelfHealingAction['status']] = 0;
    });
    
    Object.keys(stats.bySeverity).forEach(key => {
      stats.bySeverity[key] = 0;
    });
    
    Object.keys(stats.byType).forEach(key => {
      stats.byType[key] = 0;
    });
    
    // Count actual values
    this.data.actions.forEach(action => {
      stats.byStatus[action.status] = (stats.byStatus[action.status] || 0) + 1;
      stats.bySeverity[action.severity] = (stats.bySeverity[action.severity] || 0) + 1;
      stats.byType[action.type] = (stats.byType[action.type] || 0) + 1;
    });
    
    this.data.statistics = stats;
  }
}
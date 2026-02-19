/**
 * Schema Updater Engine - Phase 4
 * Schema Update Storage Service
 * 
 * Manages storage of schema update actions and results.
 */

import type { SchemaUpdateAction } from '../SchemaUpdateAction';
import type { SchemaUpdateSummary } from '../SchemaUpdaterEngine';

/**
 * Schema update storage entry
 */
export interface SchemaUpdateStorageEntry {
  // Core identification
  id: string;
  mappingResultId: string;
  reportTypeId?: string;
  
  // Update actions
  actions: SchemaUpdateAction[];
  appliedActions: SchemaUpdateAction[];
  rejectedActions: SchemaUpdateAction[];
  
  // Summary
  summary: SchemaUpdateSummary;
  
  // Metadata
  createdAt: Date;
  completedAt?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
  
  // Version information
  previousVersion?: string;
  newVersion?: string;
  versionChangeType?: 'major' | 'minor' | 'patch';
}

/**
 * Schema update storage configuration
 */
export interface SchemaUpdateStorageConfig {
  storagePath: string;
  maxEntries: number;
  autoPrune: boolean;
  pruneThresholdDays: number;
}

/**
 * Schema Update Storage Service
 */
export class SchemaUpdateStorage {
  private storagePath: string;
  private maxEntries: number;
  private autoPrune: boolean;
  private pruneThresholdDays: number;
  private entries: SchemaUpdateStorageEntry[] = [];
  
  constructor(config: Partial<SchemaUpdateStorageConfig> = {}) {
    this.storagePath = config.storagePath || 'workspace/schema-updates.json';
    this.maxEntries = config.maxEntries || 1000;
    this.autoPrune = config.autoPrune !== false;
    this.pruneThresholdDays = config.pruneThresholdDays || 30;
  }
  
  /**
   * Initialize storage
   */
  async initialize(): Promise<void> {
    try {
      await this.loadFromStorage();
      console.log(`Schema update storage initialized with ${this.entries.length} entries`);
    } catch (error) {
      console.warn('Could not load schema update storage, starting fresh:', error);
      this.entries = [];
    }
  }
  
  /**
   * Save a schema update entry
   */
  async saveUpdateEntry(entry: Omit<SchemaUpdateStorageEntry, 'id' | 'createdAt'>): Promise<SchemaUpdateStorageEntry> {
    const fullEntry: SchemaUpdateStorageEntry = {
      ...entry,
      id: this.generateEntryId(),
      createdAt: new Date()
    };
    
    this.entries.unshift(fullEntry); // Add to beginning (most recent first)
    
    // Auto-prune if configured
    if (this.autoPrune) {
      await this.autoPruneEntries();
    }
    
    // Limit entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }
    
    await this.saveToStorage();
    
    return fullEntry;
  }
  
  /**
   * Get an update entry by ID
   */
  getEntry(id: string): SchemaUpdateStorageEntry | undefined {
    return this.entries.find(entry => entry.id === id);
  }
  
  /**
   * Get all update entries
   */
  getAllEntries(): SchemaUpdateStorageEntry[] {
    return [...this.entries];
  }
  
  /**
   * Get update entries by report type
   */
  getEntriesByReportType(reportTypeId: string): SchemaUpdateStorageEntry[] {
    return this.entries.filter(entry => entry.reportTypeId === reportTypeId);
  }
  
  /**
   * Get update entries by status
   */
  getEntriesByStatus(status: SchemaUpdateStorageEntry['status']): SchemaUpdateStorageEntry[] {
    return this.entries.filter(entry => entry.status === status);
  }
  
  /**
   * Get recent update entries
   */
  getRecentEntries(limit: number = 10): SchemaUpdateStorageEntry[] {
    return this.entries.slice(0, limit);
  }
  
  /**
   * Update an entry
   */
  async updateEntry(id: string, updates: Partial<SchemaUpdateStorageEntry>): Promise<SchemaUpdateStorageEntry | undefined> {
    const index = this.entries.findIndex(entry => entry.id === id);
    if (index === -1) return undefined;
    
    const updatedEntry = {
      ...this.entries[index],
      ...updates,
      id: this.entries[index].id, // Preserve original ID
      createdAt: this.entries[index].createdAt // Preserve creation date
    };
    
    this.entries[index] = updatedEntry;
    await this.saveToStorage();
    
    return updatedEntry;
  }
  
  /**
   * Delete an entry
   */
  async deleteEntry(id: string): Promise<boolean> {
    const initialLength = this.entries.length;
    this.entries = this.entries.filter(entry => entry.id !== id);
    
    if (this.entries.length < initialLength) {
      await this.saveToStorage();
      return true;
    }
    
    return false;
  }
  
  /**
   * Get statistics
   */
  getStatistics(): {
    totalEntries: number;
    byStatus: Record<SchemaUpdateStorageEntry['status'], number>;
    byReportType: Record<string, number>;
    successRate: number;
  } {
    const byStatus: Record<string, number> = {};
    const byReportType: Record<string, number> = {};
    
    let completedCount = 0;
    let totalWithStatus = 0;
    
    for (const entry of this.entries) {
      // Count by status
      byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
      
      // Count by report type
      if (entry.reportTypeId) {
        byReportType[entry.reportTypeId] = (byReportType[entry.reportTypeId] || 0) + 1;
      }
      
      // Calculate success rate
      if (entry.status === 'completed' || entry.status === 'failed') {
        totalWithStatus++;
        if (entry.status === 'completed') {
          completedCount++;
        }
      }
    }
    
    const successRate = totalWithStatus > 0 ? (completedCount / totalWithStatus) * 100 : 0;
    
    return {
      totalEntries: this.entries.length,
      byStatus,
      byReportType,
      successRate
    };
  }
  
  /**
   * Clear all entries
   */
  async clearAll(): Promise<void> {
    this.entries = [];
    await this.saveToStorage();
  }
  
  /**
   * Auto-prune old entries
   */
  private async autoPruneEntries(): Promise<void> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - this.pruneThresholdDays);
    
    const initialCount = this.entries.length;
    this.entries = this.entries.filter(entry => {
      // Keep entries that are not completed or failed
      if (entry.status !== 'completed' && entry.status !== 'failed') {
        return true;
      }
      
      // Keep entries newer than threshold
      if (entry.completedAt && entry.completedAt > thresholdDate) {
        return true;
      }
      
      // Keep entries without completion date that are newer than threshold
      if (!entry.completedAt && entry.createdAt > thresholdDate) {
        return true;
      }
      
      return false;
    });
    
    if (this.entries.length < initialCount) {
      console.log(`Auto-pruned ${initialCount - this.entries.length} old schema update entries`);
      await this.saveToStorage();
    }
  }
  
  /**
   * Generate a unique entry ID
   */
  private generateEntryId(): string {
    return `schema_update_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * Load entries from storage
   */
  private async loadFromStorage(): Promise<void> {
    // In a real implementation, this would read from the filesystem
    // For now, we'll simulate loading with an empty array
    console.log(`Loading schema update storage from ${this.storagePath}`);
    this.entries = [];
  }
  
  /**
   * Save entries to storage
   */
  private async saveToStorage(): Promise<void> {
    // In a real implementation, this would write to the filesystem
    // For now, we'll simulate saving
    const data = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      entryCount: this.entries.length,
      entries: this.entries
    };
    
    console.log(`Saving schema update storage to ${this.storagePath} with ${this.entries.length} entries`);
    
    // In a real implementation:
    // await fs.writeFile(this.storagePath, JSON.stringify(data, null, 2), 'utf-8');
  }
  
  /**
   * Export storage to JSON
   */
  exportToJSON(): string {
    const data = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      entryCount: this.entries.length,
      entries: this.entries
    };
    
    return JSON.stringify(data, null, 2);
  }
  
  /**
   * Import storage from JSON
   */
  importFromJSON(json: string): void {
    try {
      const data = JSON.parse(json);
      
      if (!data.entries || !Array.isArray(data.entries)) {
        throw new Error('Invalid storage JSON: missing entries array');
      }
      
      // Convert string dates back to Date objects
      const entries = data.entries.map((entry: any) => ({
        ...entry,
        createdAt: new Date(entry.createdAt),
        completedAt: entry.completedAt ? new Date(entry.completedAt) : undefined,
        actions: entry.actions.map((action: any) => ({
          ...action,
          createdAt: new Date(action.createdAt),
          updatedAt: new Date(action.updatedAt),
          appliedAt: action.appliedAt ? new Date(action.appliedAt) : undefined
        })),
        appliedActions: entry.appliedActions?.map((action: any) => ({
          ...action,
          createdAt: new Date(action.createdAt),
          updatedAt: new Date(action.updatedAt),
          appliedAt: action.appliedAt ? new Date(action.appliedAt) : undefined
        })) || [],
        rejectedActions: entry.rejectedActions?.map((action: any) => ({
          ...action,
          createdAt: new Date(action.createdAt),
          updatedAt: new Date(action.updatedAt),
          appliedAt: action.appliedAt ? new Date(action.appliedAt) : undefined
        })) || []
      }));
      
      this.entries = entries;
      console.log(`Imported ${entries.length} schema update entries from JSON`);
      
    } catch (error) {
      throw new Error(`Failed to import schema update storage from JSON: ${error}`);
    }
  }
}
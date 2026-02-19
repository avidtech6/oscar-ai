/**
 * Schema Updater Engine - Phase 4
 * Schema Versioning Service
 * 
 * Manages versioning of report type definitions when schema updates are applied.
 */

import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import type { SchemaUpdateAction } from '../SchemaUpdateAction';

/**
 * Version change type
 */
export type VersionChangeType = 'major' | 'minor' | 'patch';

/**
 * Version change record
 */
export interface VersionChangeRecord {
  reportTypeId: string;
  oldVersion: string;
  newVersion: string;
  changeType: VersionChangeType;
  changeReason: string;
  timestamp: Date;
  updateActionIds: string[];
}

/**
 * Versioning configuration
 */
export interface VersioningConfig {
  autoIncrement: boolean;
  defaultChangeType: VersionChangeType;
  requireVersionBumpFor: Array<'breaking' | 'feature' | 'fix'>;
  versionFormat: 'semver' | 'date' | 'custom';
}

/**
 * Schema Versioning Service
 */
export class SchemaVersioningService {
  private config: VersioningConfig;
  private versionHistory: Map<string, VersionChangeRecord[]> = new Map();
  
  constructor(config: Partial<VersioningConfig> = {}) {
    this.config = {
      autoIncrement: true,
      defaultChangeType: 'patch',
      requireVersionBumpFor: ['breaking'],
      versionFormat: 'semver',
      ...config
    };
  }
  
  /**
   * Calculate new version based on update actions
   */
  calculateNewVersion(
    currentVersion: string,
    updateActions: SchemaUpdateAction[],
    changeReason?: string
  ): {
    newVersion: string;
    changeType: VersionChangeType;
    shouldIncrement: boolean;
  } {
    if (!this.config.autoIncrement) {
      return {
        newVersion: currentVersion,
        changeType: 'patch',
        shouldIncrement: false
      };
    }
    
    // Analyze update actions to determine change type
    const changeType = this.determineChangeType(updateActions);
    
    // Check if version bump is required
    const shouldIncrement = this.shouldIncrementVersion(changeType);
    
    if (!shouldIncrement) {
      return {
        newVersion: currentVersion,
        changeType,
        shouldIncrement: false
      };
    }
    
    // Calculate new version
    const newVersion = this.incrementVersion(currentVersion, changeType);
    
    return {
      newVersion,
      changeType,
      shouldIncrement: true
    };
  }
  
  /**
   * Apply version update to a report type definition
   */
  applyVersionUpdate(
    definition: ReportTypeDefinition,
    newVersion: string,
    changeType: VersionChangeType,
    changeReason: string,
    updateActionIds: string[]
  ): ReportTypeDefinition {
    // Create version change record
    const versionChange: VersionChangeRecord = {
      reportTypeId: definition.id,
      oldVersion: definition.version,
      newVersion,
      changeType,
      changeReason,
      timestamp: new Date(),
      updateActionIds
    };
    
    // Add to history
    this.addToHistory(versionChange);
    
    // Update definition
    const updatedDefinition: ReportTypeDefinition = {
      ...definition,
      version: newVersion,
      updatedAt: new Date()
    };
    
    return updatedDefinition;
  }
  
  /**
   * Get version history for a report type
   */
  getVersionHistory(reportTypeId: string): VersionChangeRecord[] {
    return this.versionHistory.get(reportTypeId) || [];
  }
  
  /**
   * Get latest version for a report type
   */
  getLatestVersion(reportTypeId: string): string | undefined {
    const history = this.getVersionHistory(reportTypeId);
    if (history.length === 0) return undefined;
    
    return history[history.length - 1].newVersion;
  }
  
  /**
   * Compare two versions
   */
  compareVersions(version1: string, version2: string): -1 | 0 | 1 {
    if (this.config.versionFormat === 'semver') {
      return this.compareSemver(version1, version2);
    } else if (this.config.versionFormat === 'date') {
      return this.compareDateVersions(version1, version2);
    } else {
      // For custom format, just do string comparison
      return version1 < version2 ? -1 : version1 > version2 ? 1 : 0;
    }
  }
  
  /**
   * Rollback to a previous version
   */
  rollbackToVersion(reportTypeId: string, targetVersion: string): VersionChangeRecord | undefined {
    const history = this.getVersionHistory(reportTypeId);
    const targetIndex = history.findIndex(record => record.newVersion === targetVersion);
    
    if (targetIndex === -1) return undefined;
    
    // Get all changes after the target version
    const changesToRevert = history.slice(targetIndex + 1);
    
    // Create rollback record
    const currentVersion = history[history.length - 1]?.newVersion || targetVersion;
    const rollbackRecord: VersionChangeRecord = {
      reportTypeId,
      oldVersion: currentVersion,
      newVersion: targetVersion,
      changeType: 'major', // Rollback is always a major change
      changeReason: `Rollback to version ${targetVersion}`,
      timestamp: new Date(),
      updateActionIds: []
    };
    
    // Add rollback to history
    this.addToHistory(rollbackRecord);
    
    return rollbackRecord;
  }
  
  /**
   * Get version statistics
   */
  getStatistics(): {
    totalVersionChanges: number;
    byReportType: Record<string, number>;
    byChangeType: Record<VersionChangeType, number>;
    averageChangesPerType: number;
  } {
    const byReportType: Record<string, number> = {};
    const byChangeType: Record<VersionChangeType, number> = {
      major: 0,
      minor: 0,
      patch: 0
    };
    
    let totalChanges = 0;
    
    for (const [reportTypeId, history] of this.versionHistory) {
      byReportType[reportTypeId] = history.length;
      totalChanges += history.length;
      
      for (const record of history) {
        byChangeType[record.changeType] = (byChangeType[record.changeType] || 0) + 1;
      }
    }
    
    const reportTypeCount = this.versionHistory.size;
    const averageChangesPerType = reportTypeCount > 0 ? totalChanges / reportTypeCount : 0;
    
    return {
      totalVersionChanges: totalChanges,
      byReportType,
      byChangeType,
      averageChangesPerType
    };
  }
  
  /**
   * Export version history to JSON
   */
  exportToJSON(): string {
    const data = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      config: this.config,
      history: Object.fromEntries(this.versionHistory)
    };
    
    return JSON.stringify(data, null, 2);
  }
  
  /**
   * Import version history from JSON
   */
  importFromJSON(json: string): void {
    try {
      const data = JSON.parse(json);
      
      if (data.config) {
        this.config = { ...this.config, ...data.config };
      }
      
      if (data.history && typeof data.history === 'object') {
        this.versionHistory = new Map(Object.entries(data.history));
        
        // Convert string dates back to Date objects
        for (const [reportTypeId, history] of this.versionHistory.entries()) {
          if (Array.isArray(history)) {
            this.versionHistory.set(reportTypeId, history.map(record => ({
              ...record,
              timestamp: new Date(record.timestamp)
            })));
          }
        }
      }
      
      console.log(`Imported version history for ${this.versionHistory.size} report types`);
      
    } catch (error) {
      throw new Error(`Failed to import version history from JSON: ${error}`);
    }
  }
  
  /**
   * Private helper methods
   */
  private determineChangeType(updateActions: SchemaUpdateAction[]): VersionChangeType {
    // Analyze actions to determine change severity
    let hasBreakingChange = false;
    let hasFeatureAddition = false;
    let hasFixOnly = true;
    
    for (const action of updateActions) {
      // Check for breaking changes
      if (this.isBreakingChange(action)) {
        hasBreakingChange = true;
        hasFixOnly = false;
      }
      
      // Check for feature additions
      if (this.isFeatureAddition(action)) {
        hasFeatureAddition = true;
        hasFixOnly = false;
      }
    }
    
    if (hasBreakingChange) return 'major';
    if (hasFeatureAddition) return 'minor';
    return 'patch';
  }
  
  private isBreakingChange(action: SchemaUpdateAction): boolean {
    // Breaking changes include:
    // - Removing required sections
    // - Changing field types in incompatible ways
    // - Changing validation rules in breaking ways
    // - Changing compliance rules
    
    const breakingActionTypes: SchemaUpdateAction['type'][] = [
      'updateReportTypeDefinition' // If it includes breaking changes
    ];
    
    return breakingActionTypes.includes(action.type) || 
           action.estimatedImpact === 'major';
  }
  
  private isFeatureAddition(action: SchemaUpdateAction): boolean {
    // Feature additions include:
    // - Adding new sections
    // - Adding new fields
    // - Adding new terminology
    // - Adding new compliance rules
    
    const featureActionTypes: SchemaUpdateAction['type'][] = [
      'addSection',
      'addField',
      'addTerminology',
      'addComplianceRule',
      'addMissingSection'
    ];
    
    return featureActionTypes.includes(action.type) ||
           action.estimatedImpact === 'moderate';
  }
  
  private shouldIncrementVersion(changeType: VersionChangeType): boolean {
    return this.config.requireVersionBumpFor.some(required => {
      if (required === 'breaking' && changeType === 'major') return true;
      if (required === 'feature' && (changeType === 'minor' || changeType === 'major')) return true;
      if (required === 'fix' && (changeType === 'patch' || changeType === 'minor' || changeType === 'major')) return true;
      return false;
    });
  }
  
  private incrementVersion(currentVersion: string, changeType: VersionChangeType): string {
    if (this.config.versionFormat === 'semver') {
      return this.incrementSemver(currentVersion, changeType);
    } else if (this.config.versionFormat === 'date') {
      return this.generateDateVersion();
    } else {
      // Custom format - just append change type and timestamp
      return `${currentVersion}.${changeType}.${Date.now()}`;
    }
  }
  
  private incrementSemver(version: string, changeType: VersionChangeType): string {
    // Parse semver
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([\w.-]+))?(?:\+([\w.-]+))?$/);
    
    if (!match) {
      // If not valid semver, start at 1.0.0
      return changeType === 'major' ? '1.0.0' : 
             changeType === 'minor' ? '0.1.0' : '0.0.1';
    }
    
    let major = parseInt(match[1], 10);
    let minor = parseInt(match[2], 10);
    let patch = parseInt(match[3], 10);
    
    switch (changeType) {
      case 'major':
        major++;
        minor = 0;
        patch = 0;
        break;
      case 'minor':
        minor++;
        patch = 0;
        break;
      case 'patch':
        patch++;
        break;
    }
    
    return `${major}.${minor}.${patch}`;
  }
  
  private compareSemver(version1: string, version2: string): -1 | 0 | 1 {
    const v1 = this.parseSemver(version1);
    const v2 = this.parseSemver(version2);
    
    if (v1.major !== v2.major) return v1.major < v2.major ? -1 : 1;
    if (v1.minor !== v2.minor) return v1.minor < v2.minor ? -1 : 1;
    if (v1.patch !== v2.patch) return v1.patch < v2.patch ? -1 : 1;
    return 0;
  }
  
  private parseSemver(version: string): { major: number; minor: number; patch: number } {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
    if (!match) return { major: 0, minor: 0, patch: 0 };
    
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10)
    };
  }
  
  private compareDateVersions(version1: string, version2: string): -1 | 0 | 1 {
    // Date versions are in format YYYY.MM.DD.HHMM or similar
    // Simple string comparison works for chronological order
    return version1 < version2 ? -1 : version1 > version2 ? 1 : 0;
  }
  
  private generateDateVersion(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}.${month}.${day}.${hour}${minute}`;
  }
  
  private addToHistory(record: VersionChangeRecord): void {
    const history = this.versionHistory.get(record.reportTypeId) || [];
    history.push(record);
    this.versionHistory.set(record.reportTypeId, history);
  }
}
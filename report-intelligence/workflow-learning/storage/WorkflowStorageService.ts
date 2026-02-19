/**
 * Workflow Storage Service
 * 
 * Manages storage and retrieval of workflow profiles from persistent storage.
 */

import { WorkflowProfile } from '../WorkflowProfile';
import * as fs from 'fs';
import * as path from 'path';

export interface WorkflowStorageEntry {
  id: string;
  profile: WorkflowProfile;
  version: number;
  timestamps: {
    storedAt: Date;
    lastAccessed: Date;
  };
}

export class WorkflowStorageService {
  private storagePath: string;
  private profiles: Map<string, WorkflowStorageEntry> = new Map();
  
  /**
   * Constructor
   * @param storagePath Optional custom storage path
   */
  constructor(storagePath?: string) {
    this.storagePath = storagePath || path.join('workspace', 'workflow-profiles.json');
    this.ensureStorageDirectory();
    this.loadProfiles();
  }
  
  /**
   * Ensure the storage directory exists
   */
  private ensureStorageDirectory(): void {
    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  /**
   * Load profiles from storage
   */
  private loadProfiles(): void {
    try {
      if (fs.existsSync(this.storagePath)) {
        const data = fs.readFileSync(this.storagePath, 'utf-8');
        const entries: WorkflowStorageEntry[] = JSON.parse(data, (key, value) => {
          // Revive Date objects
          if (key === 'storedAt' || key === 'lastAccessed' || 
              key === 'createdAt' || key === 'updatedAt' || key === 'lastUsedAt' ||
              key === 'lastObserved' || key === 'timestamp') {
            return new Date(value);
          }
          return value;
        });
        
        entries.forEach(entry => {
          this.profiles.set(entry.id, entry);
        });
        
        console.log(`Loaded ${entries.length} workflow profiles from ${this.storagePath}`);
      }
    } catch (error) {
      console.error(`Error loading workflow profiles from ${this.storagePath}:`, error);
      // Initialize with empty storage
      this.saveProfiles();
    }
  }
  
  /**
   * Save profiles to storage
   */
  private saveProfiles(): void {
    try {
      const entries = Array.from(this.profiles.values());
      const data = JSON.stringify(entries, null, 2);
      fs.writeFileSync(this.storagePath, data, 'utf-8');
    } catch (error) {
      console.error(`Error saving workflow profiles to ${this.storagePath}:`, error);
    }
  }
  
  /**
   * Store a workflow profile
   */
  storeProfile(profile: WorkflowProfile): WorkflowStorageEntry {
    const existingEntry = this.profiles.get(profile.id);
    
    const entry: WorkflowStorageEntry = {
      id: profile.id,
      profile,
      version: existingEntry ? existingEntry.version + 1 : 1,
      timestamps: {
        storedAt: new Date(),
        lastAccessed: new Date()
      }
    };
    
    this.profiles.set(profile.id, entry);
    this.saveProfiles();
    
    return entry;
  }
  
  /**
   * Retrieve a workflow profile by ID
   */
  getProfile(profileId: string): WorkflowProfile | null {
    const entry = this.profiles.get(profileId);
    if (entry) {
      // Update last accessed timestamp
      entry.timestamps.lastAccessed = new Date();
      this.saveProfiles();
      return entry.profile;
    }
    return null;
  }
  
  /**
   * Retrieve all workflow profiles for a user
   */
  getProfilesForUser(userId: string): WorkflowProfile[] {
    const profiles: WorkflowProfile[] = [];
    
    this.profiles.forEach(entry => {
      if (entry.profile.userId === userId && entry.profile.metadata.isActive) {
        profiles.push(entry.profile);
      }
    });
    
    return profiles;
  }
  
  /**
   * Retrieve workflow profiles by report type
   */
  getProfilesByReportType(reportTypeId: string): WorkflowProfile[] {
    const profiles: WorkflowProfile[] = [];
    
    this.profiles.forEach(entry => {
      if (entry.profile.reportTypeId === reportTypeId && entry.profile.metadata.isActive) {
        profiles.push(entry.profile);
      }
    });
    
    return profiles;
  }
  
  /**
   * Update an existing workflow profile
   */
  updateProfile(profile: WorkflowProfile): WorkflowStorageEntry {
    const existingEntry = this.profiles.get(profile.id);
    
    if (!existingEntry) {
      throw new Error(`Profile ${profile.id} not found in storage`);
    }
    
    const entry: WorkflowStorageEntry = {
      ...existingEntry,
      profile,
      version: existingEntry.version + 1,
      timestamps: {
        ...existingEntry.timestamps,
        storedAt: new Date()
      }
    };
    
    this.profiles.set(profile.id, entry);
    this.saveProfiles();
    
    return entry;
  }
  
  /**
   * Delete a workflow profile
   */
  deleteProfile(profileId: string): boolean {
    const existed = this.profiles.delete(profileId);
    if (existed) {
      this.saveProfiles();
    }
    return existed;
  }
  
  /**
   * Archive a workflow profile (mark as inactive)
   */
  archiveProfile(profileId: string): WorkflowProfile | null {
    const entry = this.profiles.get(profileId);
    if (!entry) {
      return null;
    }
    
    const updatedProfile: WorkflowProfile = {
      ...entry.profile,
      metadata: {
        ...entry.profile.metadata,
        isActive: false,
        tags: [...entry.profile.metadata.tags, 'archived']
      }
    };
    
    this.updateProfile(updatedProfile);
    return updatedProfile;
  }
  
  /**
   * Search workflow profiles by tags
   */
  searchProfilesByTags(tags: string[]): WorkflowProfile[] {
    const profiles: WorkflowProfile[] = [];
    
    this.profiles.forEach(entry => {
      if (entry.profile.metadata.isActive) {
        const hasAllTags = tags.every(tag => entry.profile.metadata.tags.includes(tag));
        if (hasAllTags) {
          profiles.push(entry.profile);
        }
      }
    });
    
    return profiles;
  }
  
  /**
   * Get statistics about stored profiles
   */
  getStatistics(): {
    totalProfiles: number;
    activeProfiles: number;
    archivedProfiles: number;
    users: string[];
    reportTypes: string[];
    storageSize: number;
  } {
    const users = new Set<string>();
    const reportTypes = new Set<string>();
    let activeProfiles = 0;
    let archivedProfiles = 0;
    
    this.profiles.forEach(entry => {
      users.add(entry.profile.userId);
      if (entry.profile.reportTypeId) {
        reportTypes.add(entry.profile.reportTypeId);
      }
      
      if (entry.profile.metadata.isActive) {
        activeProfiles++;
      } else {
        archivedProfiles++;
      }
    });
    
    let storageSize = 0;
    try {
      if (fs.existsSync(this.storagePath)) {
        const stats = fs.statSync(this.storagePath);
        storageSize = stats.size;
      }
    } catch (error) {
      // Ignore size calculation errors
    }
    
    return {
      totalProfiles: this.profiles.size,
      activeProfiles,
      archivedProfiles,
      users: Array.from(users),
      reportTypes: Array.from(reportTypes),
      storageSize
    };
  }
  
  /**
   * Export profiles to a file
   */
  exportProfiles(exportPath: string): void {
    const entries = Array.from(this.profiles.values());
    const data = JSON.stringify(entries, null, 2);
    fs.writeFileSync(exportPath, data, 'utf-8');
  }
  
  /**
   * Import profiles from a file
   */
  importProfiles(importPath: string, merge: boolean = true): number {
    try {
      if (!fs.existsSync(importPath)) {
        throw new Error(`Import file ${importPath} not found`);
      }
      
      const data = fs.readFileSync(importPath, 'utf-8');
      const entries: WorkflowStorageEntry[] = JSON.parse(data, (key, value) => {
        // Revive Date objects
        if (key === 'storedAt' || key === 'lastAccessed' || 
            key === 'createdAt' || key === 'updatedAt' || key === 'lastUsedAt' ||
            key === 'lastObserved' || key === 'timestamp') {
          return new Date(value);
        }
        return value;
      });
      
      let importedCount = 0;
      
      entries.forEach(entry => {
        if (merge) {
          // Merge with existing profiles
          this.profiles.set(entry.id, entry);
        } else {
          // Only add if not already present
          if (!this.profiles.has(entry.id)) {
            this.profiles.set(entry.id, entry);
          }
        }
        importedCount++;
      });
      
      this.saveProfiles();
      return importedCount;
    } catch (error) {
      console.error(`Error importing workflow profiles from ${importPath}:`, error);
      throw error;
    }
  }
  
  /**
   * Clear all profiles (for testing/reset)
   */
  clearProfiles(): void {
    this.profiles.clear();
    this.saveProfiles();
  }
}
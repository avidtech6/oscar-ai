/**
 * Report Style Learner - Phase 5
 * Style Profile Storage
 * 
 * Storage service for style profiles using JSON file storage.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { StyleProfile } from '../StyleProfile';

/**
 * Storage configuration
 */
export interface StyleProfileStorageConfig {
  storagePath: string;
  maxProfiles: number;
  autoPrune: boolean;
  backupInterval: number; // hours
}

/**
 * Storage entry format
 */
export interface StyleProfileStorageEntry {
  id: string;
  profile: StyleProfile;
  version: string;
  createdAt: string;
  updatedAt: string;
  accessCount: number;
  lastAccessed: string;
}

/**
 * Style Profile Storage Service
 */
export class StyleProfileStorage {
  private config: StyleProfileStorageConfig;
  private storagePath: string;
  private isInitialized: boolean = false;
  
  /**
   * Constructor
   */
  constructor(config: Partial<StyleProfileStorageConfig> = {}) {
    this.config = {
      storagePath: 'workspace/style-profiles.json',
      maxProfiles: 1000,
      autoPrune: true,
      backupInterval: 24,
      ...config
    };
    
    this.storagePath = this.config.storagePath;
  }
  
  /**
   * Initialize storage
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Ensure directory exists
      const dir = path.dirname(this.storagePath);
      await fs.mkdir(dir, { recursive: true });
      
      // Create storage file if it doesn't exist
      try {
        await fs.access(this.storagePath);
      } catch {
        await this.saveStorage({ profiles: [], metadata: this.createMetadata() });
      }
      
      this.isInitialized = true;
      console.log(`Style profile storage initialized at ${this.storagePath}`);
      
    } catch (error) {
      console.error('Failed to initialize style profile storage:', error);
      throw error;
    }
  }
  
  /**
   * Save a style profile
   */
  public async saveProfile(profile: StyleProfile): Promise<void> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      const now = new Date().toISOString();
      
      // Check if profile already exists
      const existingIndex = storage.profiles.findIndex(p => p.id === profile.id);
      
      const entry: StyleProfileStorageEntry = {
        id: profile.id,
        profile,
        version: profile.version,
        createdAt: existingIndex >= 0 ? storage.profiles[existingIndex].createdAt : now,
        updatedAt: now,
        accessCount: existingIndex >= 0 ? storage.profiles[existingIndex].accessCount : 0,
        lastAccessed: now
      };
      
      if (existingIndex >= 0) {
        // Update existing profile
        storage.profiles[existingIndex] = entry;
      } else {
        // Add new profile
        storage.profiles.push(entry);
      }
      
      // Auto-prune if configured
      if (this.config.autoPrune && storage.profiles.length > this.config.maxProfiles) {
        await this.pruneProfiles();
      }
      
      // Update metadata
      storage.metadata = this.updateMetadata(storage.metadata, existingIndex >= 0 ? 'updated' : 'created');
      
      await this.saveStorage(storage);
      
      console.log(`Profile ${profile.id} saved to storage`);
      
    } catch (error) {
      console.error('Failed to save style profile:', error);
      throw error;
    }
  }
  
  /**
   * Load a style profile by ID
   */
  public async loadProfile(profileId: string): Promise<StyleProfile | null> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      const entry = storage.profiles.find(p => p.id === profileId);
      
      if (!entry) {
        return null;
      }
      
      // Update access statistics
      entry.accessCount++;
      entry.lastAccessed = new Date().toISOString();
      storage.metadata = this.updateMetadata(storage.metadata, 'accessed');
      
      await this.saveStorage(storage);
      
      return entry.profile;
      
    } catch (error) {
      console.error('Failed to load style profile:', error);
      return null;
    }
  }
  
  /**
   * Find profiles by user ID
   */
  public async findProfilesByUser(userId: string): Promise<StyleProfile[]> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      const entries = storage.profiles.filter(p => p.profile.userId === userId);
      
      // Sort by confidence (highest first)
      entries.sort((a, b) => b.profile.confidence - a.profile.confidence);
      
      return entries.map(entry => entry.profile);
      
    } catch (error) {
      console.error('Failed to find profiles by user:', error);
      return [];
    }
  }
  
  /**
   * Find profile by user and report type
   */
  public async findProfileByUserAndType(
    userId: string,
    reportTypeId?: string
  ): Promise<StyleProfile | null> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      
      // First try exact match (user + report type)
      if (reportTypeId) {
        const exactMatch = storage.profiles.find(p => 
          p.profile.userId === userId && p.profile.reportTypeId === reportTypeId
        );
        
        if (exactMatch) {
          return exactMatch.profile;
        }
      }
      
      // Then try general profile (user only, no report type)
      const generalProfile = storage.profiles.find(p => 
        p.profile.userId === userId && !p.profile.reportTypeId
      );
      
      return generalProfile?.profile || null;
      
    } catch (error) {
      console.error('Failed to find profile by user and type:', error);
      return null;
    }
  }
  
  /**
   * Get all profiles
   */
  public async getAllProfiles(): Promise<StyleProfile[]> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      return storage.profiles.map(entry => entry.profile);
      
    } catch (error) {
      console.error('Failed to get all profiles:', error);
      return [];
    }
  }
  
  /**
   * Delete a profile
   */
  public async deleteProfile(profileId: string): Promise<boolean> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      const initialLength = storage.profiles.length;
      
      storage.profiles = storage.profiles.filter(p => p.id !== profileId);
      
      if (storage.profiles.length < initialLength) {
        storage.metadata = this.updateMetadata(storage.metadata, 'deleted');
        await this.saveStorage(storage);
        console.log(`Profile ${profileId} deleted from storage`);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Failed to delete style profile:', error);
      return false;
    }
  }
  
  /**
   * Get storage statistics
   */
  public async getStatistics(): Promise<{
    totalProfiles: number;
    totalUsers: number;
    storageSize: number;
    mostRecentUpdate: string;
    mostAccessedProfile: string | null;
  }> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      
      // Count unique users
      const uniqueUsers = new Set(storage.profiles.map(p => p.profile.userId));
      
      // Find most accessed profile
      let mostAccessedProfile: string | null = null;
      let maxAccessCount = 0;
      
      for (const entry of storage.profiles) {
        if (entry.accessCount > maxAccessCount) {
          maxAccessCount = entry.accessCount;
          mostAccessedProfile = entry.id;
        }
      }
      
      // Get storage file size
      let storageSize = 0;
      try {
        const stats = await fs.stat(this.storagePath);
        storageSize = stats.size;
      } catch {
        // File doesn't exist or can't be accessed
      }
      
      return {
        totalProfiles: storage.profiles.length,
        totalUsers: uniqueUsers.size,
        storageSize,
        mostRecentUpdate: storage.metadata.lastUpdated,
        mostAccessedProfile
      };
      
    } catch (error) {
      console.error('Failed to get storage statistics:', error);
      return {
        totalProfiles: 0,
        totalUsers: 0,
        storageSize: 0,
        mostRecentUpdate: new Date().toISOString(),
        mostAccessedProfile: null
      };
    }
  }
  
  /**
   * Prune old profiles
   */
  public async pruneProfiles(
    maxProfiles?: number
  ): Promise<number> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      const limit = maxProfiles || this.config.maxProfiles;
      
      if (storage.profiles.length <= limit) {
        return 0;
      }
      
      // Sort by last accessed (oldest first)
      storage.profiles.sort((a, b) => 
        new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime()
      );
      
      const profilesToRemove = storage.profiles.length - limit;
      storage.profiles = storage.profiles.slice(profilesToRemove);
      
      storage.metadata = this.updateMetadata(storage.metadata, 'pruned');
      await this.saveStorage(storage);
      
      console.log(`Pruned ${profilesToRemove} old style profiles`);
      return profilesToRemove;
      
    } catch (error) {
      console.error('Failed to prune profiles:', error);
      return 0;
    }
  }
  
  /**
   * Backup storage
   */
  public async backup(): Promise<string> {
    await this.initialize();
    
    try {
      const backupPath = `${this.storagePath}.backup.${Date.now()}`;
      const storage = await this.loadStorage();
      
      await fs.writeFile(backupPath, JSON.stringify(storage, null, 2));
      
      console.log(`Storage backed up to ${backupPath}`);
      return backupPath;
      
    } catch (error) {
      console.error('Failed to backup storage:', error);
      throw error;
    }
  }
  
  /**
   * Clear all profiles
   */
  public async clear(): Promise<void> {
    await this.initialize();
    
    try {
      await this.saveStorage({ profiles: [], metadata: this.createMetadata() });
      console.log('Style profile storage cleared');
      
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }
  
  /**
   * Private helper methods
   */
  private async loadStorage(): Promise<{
    profiles: StyleProfileStorageEntry[];
    metadata: any;
  }> {
    try {
      const data = await fs.readFile(this.storagePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Return empty storage if file doesn't exist or is corrupted
      return { profiles: [], metadata: this.createMetadata() };
    }
  }
  
  private async saveStorage(storage: {
    profiles: StyleProfileStorageEntry[];
    metadata: any;
  }): Promise<void> {
    await fs.writeFile(this.storagePath, JSON.stringify(storage, null, 2));
  }
  
  private createMetadata(): any {
    const now = new Date().toISOString();
    
    return {
      version: '1.0.0',
      created: now,
      lastUpdated: now,
      totalOperations: 0,
      operationCounts: {
        created: 0,
        updated: 0,
        accessed: 0,
        deleted: 0,
        pruned: 0
      }
    };
  }
  
  private updateMetadata(metadata: any, operation: 'created' | 'updated' | 'accessed' | 'deleted' | 'pruned'): any {
    const updated = { ...metadata };
    updated.lastUpdated = new Date().toISOString();
    updated.totalOperations = (updated.totalOperations || 0) + 1;
    updated.operationCounts = updated.operationCounts || {};
    updated.operationCounts[operation] = (updated.operationCounts[operation] || 0) + 1;
    
    return updated;
  }
}
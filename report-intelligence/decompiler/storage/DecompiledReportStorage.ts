/**
 * Decompiled Report Storage Service
 * 
 * Manages storage and retrieval of decompiled reports.
 */

import type { DecompiledReport } from '../DecompiledReport';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface StorageOptions {
  storagePath: string;
  maxReports: number;
  autoPrune: boolean;
}

export class DecompiledReportStorage {
  private options: StorageOptions;
  
  constructor(options?: Partial<StorageOptions>) {
    this.options = {
      storagePath: 'workspace/decompiled-reports.json',
      maxReports: 100,
      autoPrune: true,
      ...options,
    };
  }
  
  /**
   * Store a decompiled report
   */
  async storeReport(report: DecompiledReport): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.options.storagePath);
      await fs.mkdir(dir, { recursive: true });
      
      // Load existing reports
      const existingReports = await this.loadAllReports();
      
      // Add new report
      existingReports.push(report);
      
      // Auto-prune if enabled
      let reportsToSave = existingReports;
      if (this.options.autoPrune && existingReports.length > this.options.maxReports) {
        reportsToSave = this.pruneReports(existingReports);
      }
      
      // Save to file
      await fs.writeFile(
        this.options.storagePath,
        JSON.stringify(reportsToSave, null, 2),
        'utf-8'
      );
      
      console.log(`[DecompiledReportStorage] Stored report: ${report.id}`);
    } catch (error) {
      console.error('[DecompiledReportStorage] Error storing report:', error);
      throw error;
    }
  }
  
  /**
   * Load all decompiled reports
   */
  async loadAllReports(): Promise<DecompiledReport[]> {
    try {
      const data = await fs.readFile(this.options.storagePath, 'utf-8');
      const reports = JSON.parse(data);
      
      // Convert date strings back to Date objects
      return reports.map((report: any) => ({
        ...report,
        createdAt: new Date(report.createdAt),
        processedAt: new Date(report.processedAt),
      }));
    } catch (error) {
      // File doesn't exist or is empty
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      console.error('[DecompiledReportStorage] Error loading reports:', error);
      return [];
    }
  }
  
  /**
   * Find report by ID
   */
  async findReportById(id: string): Promise<DecompiledReport | null> {
    const reports = await this.loadAllReports();
    return reports.find(report => report.id === id) || null;
  }
  
  /**
   * Find reports by source hash (for deduplication)
   */
  async findReportsByHash(sourceHash: string): Promise<DecompiledReport[]> {
    const reports = await this.loadAllReports();
    return reports.filter(report => report.sourceHash === sourceHash);
  }
  
  /**
   * Delete report by ID
   */
  async deleteReport(id: string): Promise<boolean> {
    try {
      const reports = await this.loadAllReports();
      const filteredReports = reports.filter(report => report.id !== id);
      
      if (filteredReports.length === reports.length) {
        return false; // Report not found
      }
      
      await fs.writeFile(
        this.options.storagePath,
        JSON.stringify(filteredReports, null, 2),
        'utf-8'
      );
      
      console.log(`[DecompiledReportStorage] Deleted report: ${id}`);
      return true;
    } catch (error) {
      console.error('[DecompiledReportStorage] Error deleting report:', error);
      throw error;
    }
  }
  
  /**
   * Clear all reports
   */
  async clearAllReports(): Promise<void> {
    try {
      await fs.writeFile(this.options.storagePath, '[]', 'utf-8');
      console.log('[DecompiledReportStorage] Cleared all reports');
    } catch (error) {
      console.error('[DecompiledReportStorage] Error clearing reports:', error);
      throw error;
    }
  }
  
  /**
   * Get storage statistics
   */
  async getStatistics(): Promise<{
    totalReports: number;
    storageSize: number;
    oldestReport: Date | null;
    newestReport: Date | null;
  }> {
    const reports = await this.loadAllReports();
    
    if (reports.length === 0) {
      return {
        totalReports: 0,
        storageSize: 0,
        oldestReport: null,
        newestReport: null,
      };
    }
    
    const dates = reports.map(r => r.createdAt.getTime());
    const oldestDate = new Date(Math.min(...dates));
    const newestDate = new Date(Math.max(...dates));
    
    // Get file size
    let storageSize = 0;
    try {
      const stats = await fs.stat(this.options.storagePath);
      storageSize = stats.size;
    } catch (error) {
      // File doesn't exist
    }
    
    return {
      totalReports: reports.length,
      storageSize,
      oldestReport: oldestDate,
      newestReport: newestDate,
    };
  }
  
  /**
   * Prune old reports to stay within maxReports limit
   */
  private pruneReports(reports: DecompiledReport[]): DecompiledReport[] {
    if (reports.length <= this.options.maxReports) {
      return reports;
    }
    
    // Sort by creation date (oldest first)
    const sorted = [...reports].sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );
    
    // Keep only the newest reports
    return sorted.slice(-this.options.maxReports);
  }
}
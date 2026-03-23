// Supabase Cloud Storage Manager - Layer 2 Presentation
import { browser } from '$app/environment'
import { getSupabaseClient, CLOUD_TABLES, type CloudRecord } from './supabaseCloudClient'
import { uploadToCloud, downloadFromCloud, deleteFromCloud, listCloudRecords } from './supabaseCloudCrud'
import { syncToCloud, syncFromCloud } from './supabaseCloudSync'
import { bulkUploadToCloud, bulkDownloadFromCloud } from './supabaseCloudBulk'
import { checkCloudConnectivity, getCloudStorageStats } from './supabaseCloudConnectivity'
import type { SyncMetadata } from './syncMetadata'
import { CloudStorageManagerCore } from './layer1/syncCloudManagerCore'
import type {
  CloudStorageStats,
  CloudConnectivityResult,
  BulkOperationResult
} from './layer1/syncCloudManagerTypes'

export class CloudStorageManager {
  private core: CloudStorageManagerCore
  
  constructor() {
    this.core = new CloudStorageManagerCore()
  }
  
  // Upload a record to cloud
  async upload(table: string, recordId: string, data: any, metadata: SyncMetadata): Promise<CloudRecord> {
    return uploadToCloud(table, recordId, data, metadata)
  }
  
  // Download a record from cloud
  async download(table: string, recordId: string): Promise<CloudRecord | null> {
    return downloadFromCloud(table, recordId)
  }
  
  // Delete a record from cloud
  async delete(table: string, recordId: string): Promise<void> {
    return deleteFromCloud(table, recordId)
  }
  
  // List records from cloud
  async list(table: string, options?: {
    limit?: number
    offset?: number
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
  }): Promise<CloudRecord[]> {
    return listCloudRecords(table, options)
  }
  
  // Sync local record to cloud
  async syncLocalToCloud(
    table: string,
    recordId: string,
    localData: any,
    localMetadata: SyncMetadata
  ): Promise<{
    success: boolean
    cloudRecord?: CloudRecord
    conflict?: boolean
    resolvedData?: any
  }> {
    return syncToCloud(table, recordId, localData, localMetadata)
  }
  
  // Sync cloud record to local
  async syncCloudToLocal(
    table: string,
    recordId: string,
    localData: any,
    localMetadata: SyncMetadata
  ): Promise<{
    success: boolean
    data?: any
    metadata?: SyncMetadata
    conflict?: boolean
    source: 'cloud' | 'local' | 'merged'
  }> {
    return syncFromCloud(table, recordId, localData, localMetadata)
  }
  
  // Bulk operations
  async bulkUpload(): Promise<{
    total: number
    uploaded: number
    failed: number
    conflicts: number
  }> {
    return bulkUploadToCloud()
  }
  
  async bulkDownload(): Promise<{
    total: number
    downloaded: number
    failed: number
    conflicts: number
  }> {
    return bulkDownloadFromCloud()
  }
  
  // Connectivity
  async checkConnectivity(): Promise<{
    connected: boolean
    authenticated: boolean
    latency: number | null
    error?: string
  }> {
    return checkCloudConnectivity()
  }
  
  async getStats(): Promise<{
    totalRecords: number
    totalSize: number
    byTable: Record<string, { count: number; size: number }>
    lastSync: string | null
  }> {
    return getCloudStorageStats()
  }
  
  // Get all tables - delegates to Layer 1
  getTables(): string[] {
    return this.core.getTables()
  }
  
  // Check if a table is valid - delegates to Layer 1
  isValidTable(table: string): boolean {
    return this.core.isValidTable(table)
  }
}

// Singleton instance
export const cloudStorageManager = new CloudStorageManager()
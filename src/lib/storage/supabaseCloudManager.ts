// Supabase Cloud Storage Manager
import { browser } from '$app/environment'
import { getSupabaseClient, CLOUD_TABLES, type CloudRecord } from './supabaseCloudClient'
import { uploadToCloud, downloadFromCloud, deleteFromCloud, listCloudRecords } from './supabaseCloudCrud'
import { syncToCloud, syncFromCloud } from './supabaseCloudSync'
import { bulkUploadToCloud, bulkDownloadFromCloud } from './supabaseCloudBulk'
import { checkCloudConnectivity, getCloudStorageStats } from './supabaseCloudConnectivity'
import type { SyncMetadata } from './syncMetadata'

export class CloudStorageManager {
  private supabase: any = null
  
  private getSupabase() {
    if (!this.supabase) {
      this.supabase = getSupabaseClient()
    }
    return this.supabase
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
  
  // Get all tables
  getTables(): string[] {
    return Object.values(CLOUD_TABLES)
  }
  
  // Check if a table is valid
  isValidTable(table: string): boolean {
    const validTables = Object.values(CLOUD_TABLES)
    return validTables.includes(table as any)
  }
}

// Singleton instance
export const cloudStorageManager = new CloudStorageManager()
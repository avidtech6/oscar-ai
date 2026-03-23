// Sync Cloud Manager Core - Layer 1 Pure Logic
import type { 
  CloudStorageStats, 
  CloudConnectivityResult, 
  BulkOperationResult,
  CloudSyncResult,
  CloudToLocalSyncResult,
  CloudRecord,
  SyncMetadata
} from './syncCloudManagerTypes'

// Pure core logic extracted from CloudStorageManager
export class CloudStorageManagerCore {
  private supabase: any = null
  
  private getSupabase(): any {
    if (!this.supabase) {
      this.supabase = getSupabaseClient()
    }
    return this.supabase
  }
  
  // Check if a table is valid - pure logic
  isValidTable(table: string): boolean {
    const validTables = Object.values(CLOUD_TABLES)
    return validTables.includes(table as any)
  }
  
  // Get all tables - pure logic
  getTables(): string[] {
    return Object.values(CLOUD_TABLES)
  }
  
  // Validate sync parameters - pure logic
  validateSyncParams(
    table: string,
    recordId: string,
    data: any,
    metadata: SyncMetadata
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!table || typeof table !== 'string') {
      errors.push('Invalid table name')
    }
    
    if (!recordId || typeof recordId !== 'string') {
      errors.push('Invalid record ID')
    }
    
    if (!metadata || !metadata.id || !metadata.recordId || !metadata.table) {
      errors.push('Invalid metadata structure')
    }
    
    if (table !== metadata.table) {
      errors.push('Table mismatch between parameter and metadata')
    }
    
    if (recordId !== metadata.recordId) {
      errors.push('Record ID mismatch between parameter and metadata')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  // Process bulk operation result - pure logic
  processBulkOperationResult(result: BulkOperationResult): {
    success: boolean
    successRate: number
    failureRate: number
    conflictRate: number
  } {
    const successRate = result.total > 0 ? result.uploaded / result.total : 0
    const failureRate = result.total > 0 ? result.failed / result.total : 0
    const conflictRate = result.total > 0 ? result.conflicts / result.total : 0
    
    return {
      success: result.uploaded > 0,
      successRate,
      failureRate,
      conflictRate
    }
  }
  
  // Process connectivity result - pure logic
  processConnectivityResult(result: CloudConnectivityResult): {
    isOnline: boolean
    isAuth: boolean
    health: 'excellent' | 'good' | 'poor' | 'offline'
    latencyGrade: 'low' | 'medium' | 'high' | 'unknown'
  } {
    const isOnline = result.connected && result.authenticated
    const health = isOnline ? 
      (result.latency && result.latency < 100 ? 'excellent' : 
       result.latency && result.latency < 500 ? 'good' : 'poor') : 'offline'
    
    const latencyGrade = result.latency ? 
      (result.latency < 100 ? 'low' : 
       result.latency < 500 ? 'medium' : 'high') : 'unknown'
    
    return {
      isOnline,
      isAuth: result.authenticated,
      health,
      latencyGrade
    }
  }
  
  // Process cloud storage stats - pure logic
  processCloudStats(stats: CloudStorageStats): {
    totalSizeFormatted: string
    tableCounts: Array<{ table: string; count: number; percentage: number }>
    avgSizePerRecord: number
    lastSyncFormatted: string
  } {
    const totalSizeFormatted = this.formatFileSize(stats.totalSize)
    const totalRecords = stats.totalRecords || 0
    
    const tableCounts = Object.entries(stats.byTable || {}).map(([table, data]) => ({
      table,
      count: data.count,
      percentage: totalRecords > 0 ? (data.count / totalRecords) * 100 : 0
    }))
    
    const avgSizePerRecord = totalRecords > 0 ? stats.totalSize / totalRecords : 0
    
    const lastSyncFormatted = stats.lastSync ? 
      new Date(stats.lastSync).toLocaleString() : 'Never'
    
    return {
      totalSizeFormatted,
      tableCounts,
      avgSizePerRecord,
      lastSyncFormatted
    }
  }
  
  // Format file size - pure utility
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // Generate sync conflict resolution strategy - pure logic
  generateConflictResolutionStrategy(
    localData: any,
    cloudData: any,
    localMetadata: SyncMetadata,
    cloudMetadata: SyncMetadata
  ): 'local' | 'cloud' | 'manual' | 'auto' {
    // Use the resolution strategy from metadata if available
    if (localMetadata.conflictResolution !== 'auto') {
      return localMetadata.conflictResolution
    }
    
    // Auto resolution based on timestamp
    const localTime = new Date(localMetadata.lastSync).getTime()
    const cloudTime = new Date(cloudMetadata.lastSync).getTime()
    
    return cloudTime > localTime ? 'cloud' : 'local'
  }
  
  // Validate cloud record - pure logic
  validateCloudRecord(record: CloudRecord): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!record.id || typeof record.id !== 'string') {
      errors.push('Invalid record ID')
    }
    
    if (!record.table || typeof record.table !== 'string') {
      errors.push('Invalid table name')
    }
    
    if (!record.data || typeof record.data !== 'object') {
      errors.push('Invalid record data')
    }
    
    if (!record.metadata || !record.metadata.id || !record.metadata.hash) {
      errors.push('Invalid record metadata')
    }
    
    if (!record.createdAt || !record.updatedAt) {
      errors.push('Invalid timestamps')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Helper functions - pure utilities
export function createCloudSyncResult(
  success: boolean,
  cloudRecord?: CloudRecord,
  conflict?: boolean,
  resolvedData?: any
): CloudSyncResult {
  return {
    success,
    cloudRecord,
    conflict,
    resolvedData
  }
}

export function createCloudToLocalSyncResult(
  success: boolean,
  data?: any,
  metadata?: SyncMetadata,
  conflict?: boolean,
  source: 'cloud' | 'local' | 'merged' = 'cloud'
): CloudToLocalSyncResult {
  return {
    success,
    data,
    metadata,
    conflict,
    source
  }
}

// Note: getSupabaseClient and CLOUD_TABLES are imported from supabaseCloudClient
// This is a placeholder for the actual imports
function getSupabaseClient(): any {
  throw new Error('getSupabaseClient should be imported from supabaseCloudClient')
}

const CLOUD_TABLES = {} as any
export { CLOUD_TABLES }
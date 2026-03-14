// Supabase Cloud Connectivity and Statistics
import { browser } from '$app/environment'
import { getSupabaseClient, CLOUD_TABLES } from './supabaseCloudClient'

// Check cloud connectivity (matches original interface)
export async function checkCloudConnectivity(): Promise<{
  connected: boolean
  authenticated: boolean
  latency: number | null
  error?: string
}> {
  if (!browser) {
    return { connected: false, authenticated: false, latency: null, error: 'Browser required' }
  }
  
  const supabase = getSupabaseClient()
  
  try {
    const startTime = performance.now()
    
    // Simple ping to Supabase
    const { data, error } = await supabase.from(CLOUD_TABLES.SYNC_METADATA).select('count').limit(1)
    
    const latency = performance.now() - startTime
    
    if (error) {
      // Check if it's an auth error
      if (error.message.includes('JWT')) {
        return {
          connected: true,
          authenticated: false,
          latency,
          error: 'Authentication required'
        }
      }
      
      return {
        connected: false,
        authenticated: false,
        latency,
        error: error.message
      }
    }
    
    // Check authentication status
    const { data: session } = await supabase.auth.getSession()
    
    return {
      connected: true,
      authenticated: !!session.session,
      latency
    }
  } catch (error: any) {
    return {
      connected: false,
      authenticated: false,
      latency: null,
      error: error.message || 'Unknown error'
    }
  }
}

// Get cloud storage statistics (matches original interface)
export async function getCloudStorageStats(): Promise<{
  totalRecords: number
  totalSize: number
  byTable: Record<string, { count: number; size: number }>
  lastSync: string | null
}> {
  if (!browser) {
    return {
      totalRecords: 0,
      totalSize: 0,
      byTable: {},
      lastSync: null
    }
  }
  
  const supabase = getSupabaseClient()
  
  try {
    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      throw new Error('Not authenticated')
    }
    
    const userId = session.session.user.id
    
    // Get all records
    const { data: allRecords, error } = await supabase
      .from(CLOUD_TABLES.SYNC_METADATA)
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
    
    if (error) {
      throw new Error(`Failed to get cloud records: ${error.message}`)
    }
    
    let totalSize = 0
    const byTable: Record<string, { count: number; size: number }> = {}
    
    if (allRecords && allRecords.length > 0) {
      // Calculate approximate size and group by table
      allRecords.forEach((record: any) => {
        const recordSize = JSON.stringify(record).length
        totalSize += recordSize
        
        const tableName = record.table
        if (!byTable[tableName]) {
          byTable[tableName] = { count: 0, size: 0 }
        }
        
        byTable[tableName].count += 1
        byTable[tableName].size += recordSize
      })
      
      // Get last sync time (most recent updated_at)
      const lastRecord = allRecords.reduce((latest: any, record: any) => {
        return new Date(record.updated_at) > new Date(latest.updated_at) ? record : latest
      }, allRecords[0])
      
      return {
        totalRecords: allRecords.length,
        totalSize,
        byTable,
        lastSync: lastRecord.updated_at
      }
    }
    
    return {
      totalRecords: 0,
      totalSize: 0,
      byTable: {},
      lastSync: null
    }
  } catch (error) {
    console.error('Failed to get cloud storage stats:', error)
    return {
      totalRecords: 0,
      totalSize: 0,
      byTable: {},
      lastSync: null
    }
  }
}
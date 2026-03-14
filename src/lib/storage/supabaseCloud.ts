// Supabase Cloud Storage Layer - Barrel Export
// This file re-exports all functionality from split modules to maintain backward compatibility.

// Client and configuration
export { getSupabaseClient, CLOUD_TABLES, type CloudRecord } from './supabaseCloudClient'

// CRUD operations
export { uploadToCloud, downloadFromCloud, deleteFromCloud, listCloudRecords } from './supabaseCloudCrud'

// Sync and conflict resolution
export { syncToCloud, syncFromCloud } from './supabaseCloudSync'

// Bulk operations
export { bulkUploadToCloud, bulkDownloadFromCloud } from './supabaseCloudBulk'

// Connectivity and statistics
export { checkCloudConnectivity, getCloudStorageStats } from './supabaseCloudConnectivity'

// Manager class
export { CloudStorageManager, cloudStorageManager } from './supabaseCloudManager'
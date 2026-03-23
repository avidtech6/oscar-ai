// Core utility functions for sync metadata
// Extracted from syncMetadata.ts for Layer 1 purity

// Generate hash for data (pure version)
export async function generateHashCore(data: any): Promise<string> {
  const encoder = new TextEncoder()
  const dataString = JSON.stringify(data)
  const dataBuffer = encoder.encode(dataString)
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Create sync metadata (pure version)
export async function createSyncMetadataCore(
  tableName: string,
  recordId: string,
  deviceId: string,
  data: any
): Promise<{
  id: string
  tableName: string
  recordId: string
  lastSyncedAt: number | null
  hash: string
  deviceId: string
  version: number
  conflict: boolean
  conflictResolution: 'local' | 'cloud' | 'merged' | null
  createdAt: number
  updatedAt: number
}> {
  const hash = await generateHashCore(data)
  const now = Date.now()
  
  return {
    id: `${tableName}:${recordId}:${deviceId}`,
    tableName,
    recordId,
    lastSyncedAt: null,
    hash,
    deviceId,
    version: 1,
    conflict: false,
    conflictResolution: null,
    createdAt: now,
    updatedAt: now
  }
}

// Update sync metadata (pure version)
export async function updateSyncMetadataCore(
  metadata: {
    id: string
    tableName: string
    recordId: string
    lastSyncedAt: number | null
    hash: string
    deviceId: string
    version: number
    conflict: boolean
    conflictResolution: 'local' | 'cloud' | 'merged' | null
    createdAt: number
    updatedAt: number
  },
  data: any
): Promise<typeof metadata> {
  const hash = await generateHashCore(data)
  const now = Date.now()
  
  return {
    ...metadata,
    hash,
    version: metadata.version + 1,
    updatedAt: now,
    lastSyncedAt: metadata.conflict ? metadata.lastSyncedAt : null
  }
}

// Mark as synced (pure version)
export function markAsSyncedCore(metadata: {
  id: string
  tableName: string
  recordId: string
  lastSyncedAt: number | null
  hash: string
  deviceId: string
  version: number
  conflict: boolean
  conflictResolution: 'local' | 'cloud' | 'merged' | null
  createdAt: number
  updatedAt: number
}): typeof metadata {
  return {
    ...metadata,
    lastSyncedAt: Date.now(),
    conflict: false,
    conflictResolution: null,
    updatedAt: Date.now()
  }
}

// Mark as conflicted (pure version)
export function markAsConflictedCore(metadata: {
  id: string
  tableName: string
  recordId: string
  lastSyncedAt: number | null
  hash: string
  deviceId: string
  version: number
  conflict: boolean
  conflictResolution: 'local' | 'cloud' | 'merged' | null
  createdAt: number
  updatedAt: number
}): typeof metadata {
  return {
    ...metadata,
    conflict: true,
    updatedAt: Date.now()
  }
}

// Resolve conflict (pure version)
export function resolveConflictCore(
  metadata: {
    id: string
    tableName: string
    recordId: string
    lastSyncedAt: number | null
    hash: string
    deviceId: string
    version: number
    conflict: boolean
    conflictResolution: 'local' | 'cloud' | 'merged' | null
    createdAt: number
    updatedAt: number
  },
  resolution: 'local' | 'cloud' | 'merged'
): typeof metadata {
  return {
    ...metadata,
    conflict: false,
    conflictResolution: resolution,
    updatedAt: Date.now()
  }
}

// Compare metadata for changes (pure version)
export async function hasChangesCore(
  metadata: {
    hash: string
  },
  data: any
): Promise<boolean> {
  const currentHash = await generateHashCore(data)
  return currentHash !== metadata.hash
}

// Check if record needs sync (pure version)
export function needsSyncCore(metadata: {
  lastSyncedAt: number | null
  conflict: boolean
}): boolean {
  return metadata.lastSyncedAt === null || metadata.conflict
}

// Get sync status (pure version)
export function getSyncStatusCore(metadata: {
  lastSyncedAt: number | null
  conflict: boolean
}): 'synced' | 'pending' | 'conflict' | 'local' {
  if (metadata.conflict) {
    return 'conflict'
  }
  
  if (metadata.lastSyncedAt === null) {
    return 'local'
  }
  
  // Check if synced within last 5 minutes
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
  if (metadata.lastSyncedAt < fiveMinutesAgo) {
    return 'pending'
  }
  
  return 'synced'
}

// Create empty sync report (pure version)
export function createEmptySyncReportCore(deviceId: string): {
  totalRecords: number
  syncedRecords: number
  pendingRecords: number
  conflictedRecords: number
  localRecords: number
  lastSyncTime: number | null
  deviceId: string
  tables: Record<string, {
    total: number
    synced: number
    pending: number
    conflicted: number
  }>
} {
  return {
    totalRecords: 0,
    syncedRecords: 0,
    pendingRecords: 0,
    conflictedRecords: 0,
    localRecords: 0,
    lastSyncTime: null,
    deviceId,
    tables: {}
  }
}
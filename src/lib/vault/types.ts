// Vault Types - Shared type definitions for API key management

// API Key Provider
export type APIKeyProvider = 'openai' | 'anthropic' | 'google' | 'azure' | 'grok' | 'custom'

// API Key Input (for creating/updating keys)
export interface APIKeyInput {
  keyName: string
  plaintextKey: string
  provider: APIKeyProvider
  modelFamily?: string
  isActive?: boolean
  cloudId?: string
}

// API Key (stored format)
export interface APIKey {
  id: string
  keyName: string
  provider: APIKeyProvider
  modelFamily?: string
  encryptedKey: string // Base64 encoded AES-GCM encrypted key
  iv: string // Base64 encoded initialization vector
  keyVersion: number
  isActive: boolean
  lastUsedAt?: number
  usageCount: number
  rotationDueAt?: number
  createdAt: number
  updatedAt: number
  localHash: string // For conflict detection
  lastSyncedAt?: number
  cloudId?: string // ID in cloud database
}

// Sync Status
export interface SyncStatus {
  status: 'idle' | 'in-progress' | 'success' | 'error' | 'offline'
  message: string
  timestamp: Date
  details?: {
    added?: number
    updated?: number
    deleted?: number
    conflicts?: number
  }
  error?: string
}

// Vault Statistics
export interface VaultStats {
  totalKeys: number
  localKeys: number
  cloudKeys: number
  syncedKeys: number
  lastSync: Date | null
  cloudAvailable: boolean
  providers: Record<string, number>
}

// Encryption Result
export interface EncryptionResult {
  encryptedKey: string
  iv: string
}

// Conflict Resolution
export type ConflictResolution = 'local' | 'cloud' | 'merged'

// Sync Result
export interface SyncResult {
  added: number
  updated: number
  deleted: number
  conflicts: number
  errors: string[]
}

// Cloud Connectivity
export interface CloudConnectivity {
  connected: boolean
  authenticated: boolean
  latency: number | null
  error?: string
}

// Vault Configuration
export interface VaultConfig {
  autoSync: boolean
  syncInterval: number
  maxRetries: number
  requireBiometric: boolean
}

// Key Rotation Info
export interface KeyRotationInfo {
  keyId: string
  keyName: string
  provider: APIKeyProvider
  currentVersion: number
  rotationDueAt: number
  daysUntilRotation: number
  needsRotation: boolean
}

// Export Format
export interface VaultExport {
  version: string
  exportedAt: number
  keys: Omit<APIKey, 'lastSyncedAt' | 'cloudId'>[]
  metadata: {
    totalKeys: number
    providers: Record<string, number>
  }
}

// Import Result
export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}
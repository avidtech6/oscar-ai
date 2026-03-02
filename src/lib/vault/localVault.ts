// Local Encrypted Vault for API Keys
// Uses AES-GCM encryption with PIN/biometric-derived keys
import { browser } from '$app/environment'

// API Key interface
export interface ApiKey {
  id: string
  keyName: string
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'grok' | 'custom'
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
}

// Vault configuration
const VAULT_CONFIG = {
  DB_NAME: 'oscar_ai_api_vault',
  DB_VERSION: 1,
  STORE_NAME: 'api_keys',
  KEY_ROTATION_DAYS: 90,
  MAX_KEY_VERSIONS: 3
}

// IndexedDB instance
let db: IDBDatabase | null = null

// Initialize the vault database
async function initVaultDB(): Promise<IDBDatabase> {
  if (!browser) {
    throw new Error('Local vault requires browser environment')
  }
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(VAULT_CONFIG.DB_NAME, VAULT_CONFIG.DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      // Create object store for API keys
      if (!db.objectStoreNames.contains(VAULT_CONFIG.STORE_NAME)) {
        const store = db.createObjectStore(VAULT_CONFIG.STORE_NAME, { keyPath: 'id' })
        
        // Create indexes for efficient queries
        store.createIndex('provider', 'provider')
        store.createIndex('isActive', 'isActive')
        store.createIndex('keyName', 'keyName', { unique: false })
        store.createIndex('lastSyncedAt', 'lastSyncedAt')
        store.createIndex('rotationDueAt', 'rotationDueAt')
      }
    }
  })
}

// Get database instance
async function getDB(): Promise<IDBDatabase> {
  if (!db) {
    db = await initVaultDB()
  }
  return db
}

// Generate hash for data (for conflict detection)
export async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Derive encryption key from PIN (simplified for now)
async function deriveEncryptionKey(pin: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const salt = encoder.encode('oscar-ai-vault-salt') // In production, use unique salt per user
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

// Get encryption key (simplified - in production, use PIN/biometric manager)
async function getEncryptionKey(): Promise<CryptoKey> {
  // For now, use a placeholder - in production, this would get the key from PIN/biometric manager
  const placeholderPin = 'vault-key-placeholder'
  return deriveEncryptionKey(placeholderPin)
}

// Encrypt API key using PIN/biometric-derived key
export async function encryptApiKey(plaintextKey: string): Promise<{ encryptedKey: string; iv: string }> {
  if (!browser) {
    throw new Error('Encryption requires browser environment')
  }
  
  // Get encryption key
  const encryptionKey = await getEncryptionKey()
  
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  // Encrypt the key
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintextKey)
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    encryptionKey,
    data
  )
  
  // Convert to base64 for storage
  const encryptedKey = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)))
  const ivBase64 = btoa(String.fromCharCode(...iv))
  
  return { encryptedKey, iv: ivBase64 }
}

// Decrypt API key (only for local operations, never sent to server)
export async function decryptApiKey(encryptedKey: string, iv: string): Promise<string> {
  if (!browser) {
    throw new Error('Decryption requires browser environment')
  }
  
  // Get encryption key
  const encryptionKey = await getEncryptionKey()
  
  // Convert from base64
  const encryptedData = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0))
  const ivData = Uint8Array.from(atob(iv), c => c.charCodeAt(0))
  
  // Decrypt the key
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivData
    },
    encryptionKey,
    encryptedData
  )
  
  // Convert to string
  const decoder = new TextDecoder()
  return decoder.decode(decryptedBuffer)
}

// Store API key in local vault
export async function storeApiKey(
  keyName: string,
  plaintextKey: string,
  provider: ApiKey['provider'],
  modelFamily?: string
): Promise<ApiKey> {
  if (!browser) {
    throw new Error('Local vault requires browser environment')
  }
  
  // Encrypt the key
  const { encryptedKey, iv } = await encryptApiKey(plaintextKey)
  
  // Generate hash for conflict detection
  const hashData = `${keyName}:${provider}:${encryptedKey}:${iv}`
  const localHash = await generateHash(hashData)
  
  const now = Date.now()
  const rotationDueAt = now + (VAULT_CONFIG.KEY_ROTATION_DAYS * 24 * 60 * 60 * 1000)
  
  const apiKey: ApiKey = {
    id: crypto.randomUUID(),
    keyName,
    provider,
    modelFamily,
    encryptedKey,
    iv,
    keyVersion: 1,
    isActive: true,
    usageCount: 0,
    rotationDueAt,
    createdAt: now,
    updatedAt: now,
    localHash
  }
  
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readwrite')
    const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
    
    const request = store.put(apiKey)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(apiKey)
  })
}

// Get API key from local vault (returns encrypted data only)
export async function getApiKey(keyId: string): Promise<ApiKey | null> {
  if (!browser) {
    return null
  }
  
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readonly')
    const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
    
    const request = store.get(keyId)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || null)
  })
}

// Get all API keys from local vault
export async function getAllApiKeys(): Promise<ApiKey[]> {
  if (!browser) {
    return []
  }
  
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readonly')
    const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
    
    const request = store.getAll()
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || [])
  })
}

// Get active API keys
export async function getActiveApiKeys(): Promise<ApiKey[]> {
  const allKeys = await getAllApiKeys()
  return allKeys.filter(key => key.isActive)
}

// Update API key
export async function updateApiKey(
  keyId: string,
  updates: Partial<Omit<ApiKey, 'id' | 'encryptedKey' | 'iv' | 'createdAt'>>
): Promise<ApiKey | null> {
  if (!browser) {
    return null
  }
  
  const existingKey = await getApiKey(keyId)
  if (!existingKey) {
    throw new Error(`API key ${keyId} not found`)
  }
  
  const updatedKey: ApiKey = {
    ...existingKey,
    ...updates,
    updatedAt: Date.now()
  }
  
  // Update hash if key name or provider changed
  if (updates.keyName || updates.provider) {
    const hashData = `${updatedKey.keyName}:${updatedKey.provider}:${updatedKey.encryptedKey}:${updatedKey.iv}`
    updatedKey.localHash = await generateHash(hashData)
  }
  
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readwrite')
    const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
    
    const request = store.put(updatedKey)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(updatedKey)
  })
}

// Rotate API key (create new version)
export async function rotateApiKey(
  keyId: string,
  newPlaintextKey: string
): Promise<ApiKey> {
  if (!browser) {
    throw new Error('Local vault requires browser environment')
  }
  
  const existingKey = await getApiKey(keyId)
  if (!existingKey) {
    throw new Error(`API key ${keyId} not found`)
  }
  
  // Encrypt the new key
  const { encryptedKey, iv } = await encryptApiKey(newPlaintextKey)
  
  // Generate new hash
  const hashData = `${existingKey.keyName}:${existingKey.provider}:${encryptedKey}:${iv}`
  const localHash = await generateHash(hashData)
  
  const now = Date.now()
  const rotationDueAt = now + (VAULT_CONFIG.KEY_ROTATION_DAYS * 24 * 60 * 60 * 1000)
  
  const rotatedKey: ApiKey = {
    ...existingKey,
    encryptedKey,
    iv,
    keyVersion: existingKey.keyVersion + 1,
    lastUsedAt: now,
    rotationDueAt,
    updatedAt: now,
    localHash,
    lastSyncedAt: undefined // Reset sync status
  }
  
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readwrite')
    const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
    
    const request = store.put(rotatedKey)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(rotatedKey)
  })
}

// Delete API key
export async function deleteApiKey(keyId: string): Promise<void> {
  if (!browser) {
    return
  }
  
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readwrite')
    const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
    
    const request = store.delete(keyId)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Mark key as used (increment usage count)
export async function markKeyAsUsed(keyId: string): Promise<void> {
  if (!browser) {
    return
  }
  
  const existingKey = await getApiKey(keyId)
  if (!existingKey) {
    return
  }
  
  await updateApiKey(keyId, {
    lastUsedAt: Date.now(),
    usageCount: existingKey.usageCount + 1
  })
}

// Get keys needing rotation
export async function getKeysNeedingRotation(warningDays: number = 7): Promise<ApiKey[]> {
  const activeKeys = await getActiveApiKeys()
  const now = Date.now()
  const warningThreshold = now + (warningDays * 24 * 60 * 60 * 1000)
  
  return activeKeys.filter(key => 
    key.rotationDueAt && key.rotationDueAt < warningThreshold
  )
}

// Deactivate expired keys
export async function deactivateExpiredKeys(): Promise<string[]> {
  const activeKeys = await getActiveApiKeys()
  const now = Date.now()
  const deactivatedIds: string[] = []
  
  for (const key of activeKeys) {
    if (key.rotationDueAt && key.rotationDueAt < now) {
      await updateApiKey(key.id, { isActive: false })
      deactivatedIds.push(key.id)
    }
  }
  
  return deactivatedIds
}

// Search API keys
export async function searchApiKeys(
  query: string,
  provider?: ApiKey['provider']
): Promise<ApiKey[]> {
  const allKeys = await getAllApiKeys()
  
  return allKeys.filter(key => {
    // Filter by provider if specified
    if (provider && key.provider !== provider) {
      return false
    }
    
    // Search in key name and model family
    const searchText = query.toLowerCase()
    return (
      key.keyName.toLowerCase().includes(searchText) ||
      (key.modelFamily && key.modelFamily.toLowerCase().includes(searchText))
    )
  })
}

// Get vault statistics
export async function getVaultStats(): Promise<{
  totalKeys: number
  activeKeys: number
  expiredKeys: number
  byProvider: Record<string, number>
  totalUsage: number
}> {
  const allKeys = await getAllApiKeys()
  const activeKeys = allKeys.filter(key => key.isActive)
  const expiredKeys = allKeys.filter(key => 
    key.rotationDueAt && key.rotationDueAt < Date.now()
  )
  
  const byProvider: Record<string, number> = {}
  let totalUsage = 0
  
  allKeys.forEach(key => {
    byProvider[key.provider] = (byProvider[key.provider] || 0) + 1
    totalUsage += key.usageCount
  })
  
  return {
    totalKeys: allKeys.length,
    activeKeys: activeKeys.length,
    expiredKeys: expiredKeys.length,
    byProvider,
    totalUsage
  }
}

// Export keys for backup (encrypted)
export async function exportEncryptedKeys(): Promise<string> {
  const allKeys = await getAllApiKeys()
  
  // Remove sensitive sync metadata
  const exportData = allKeys.map(key => ({
    id: key.id,
    keyName: key.keyName,
    provider: key.provider,
    modelFamily: key.modelFamily,
    encryptedKey: key.encryptedKey,
    iv: key.iv,
    keyVersion: key.keyVersion,
    isActive: key.isActive,
    createdAt: key.createdAt,
    updatedAt: key.updatedAt
  }))
  
  return JSON.stringify(exportData, null, 2)
}

// Import keys from backup
export async function importEncryptedKeys(backupData: string): Promise<number> {
  if (!browser) {
    return 0
  }
  
  const keysToImport = JSON.parse(backupData)
  let importedCount = 0
  
  const db = await getDB()
  
  for (const keyData of keysToImport) {
    try {
      // Generate hash for imported key
      const hashData = `${keyData.keyName}:${keyData.provider}:${keyData.encryptedKey}:${keyData.iv}`
      const localHash = await generateHash(hashData)
      
      const apiKey: ApiKey = {
        ...keyData,
        lastUsedAt: undefined,
        usageCount: 0,
        rotationDueAt: keyData.createdAt + (VAULT_CONFIG.KEY_ROTATION_DAYS * 24 * 60 * 60 * 1000),
        localHash,
        lastSyncedAt: undefined
      }
      
      await new Promise((resolve, reject) => {
        const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readwrite')
        const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
        
        const request = store.put(apiKey)
        
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(null)
      })
      
      importedCount++
    } catch (error) {
      console.error(`Failed to import key ${keyData.id}:`, error)
    }
  }
  
  return importedCount
}

// Clear all keys (for testing/reset)
export async function clearVault(): Promise<void> {
  if (!browser) {
    return
  }
  
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readwrite')
    const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
    
    const request = store.clear()
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
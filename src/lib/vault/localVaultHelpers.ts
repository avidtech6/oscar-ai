/**
 * Helper functions for local vault (encryption, database, hash)
 */

import { browser } from '$app/environment'
import { VAULT_CONFIG } from './localVaultTypes'

// IndexedDB instance
let db: IDBDatabase | null = null

// Initialize the vault database
export async function initVaultDB(): Promise<IDBDatabase> {
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
export async function getDB(): Promise<IDBDatabase> {
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
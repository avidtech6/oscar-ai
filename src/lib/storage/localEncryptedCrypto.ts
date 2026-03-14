// Encryption utilities for local encrypted storage
import { browser } from '$app/environment'

// Table names
export const TABLES = {
	REPORTS: 'reports',
	NOTES: 'notes',
	SETTINGS: 'settings',
	INTELLIGENCE_TRACES: 'intelligence_traces',
	SYNC_METADATA: 'sync_metadata'
} as const

// Encryption key management
let encryptionKey: CryptoKey | null = null

// Initialize encryption key from PIN
export async function initEncryptionKey(pin: string, salt: string): Promise<CryptoKey> {
	if (!browser) {
		throw new Error('Encryption requires browser environment')
	}
	
	// Derive key using PBKDF2
	const encoder = new TextEncoder()
	const pinBuffer = encoder.encode(pin)
	const saltBuffer = encoder.encode(salt)
	
	const baseKey = await crypto.subtle.importKey(
		'raw',
		pinBuffer,
		'PBKDF2',
		false,
		['deriveKey']
	)
	
	encryptionKey = await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: saltBuffer,
			iterations: 100000,
			hash: 'SHA-256'
		},
		baseKey,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	)
	
	return encryptionKey
}

// Clear encryption key (for logout)
export function clearEncryptionKey(): void {
	encryptionKey = null
}

// Check if encryption is ready
export function isEncryptionReady(): boolean {
	return encryptionKey !== null
}

// Encrypt data
export async function encryptData(data: any): Promise<{ iv: Uint8Array; ciphertext: ArrayBuffer }> {
	if (!encryptionKey) {
		throw new Error('Encryption key not initialized')
	}
	
	const encoder = new TextEncoder()
	const dataString = JSON.stringify(data)
	const dataBuffer = encoder.encode(dataString)
	
	// Generate random IV
	const iv = crypto.getRandomValues(new Uint8Array(12))
	
	// Create a proper ArrayBuffer from the IV
	const ivBuffer = new Uint8Array(iv).buffer
	
	// Encrypt
	const ciphertext = await crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv: ivBuffer
		},
		encryptionKey,
		dataBuffer
	)
	
	return { iv, ciphertext }
}

// Decrypt data
export async function decryptData(iv: Uint8Array, ciphertext: ArrayBuffer): Promise<any> {
	if (!encryptionKey) {
		throw new Error('Encryption key not initialized')
	}
	
	try {
		// Create a proper ArrayBuffer from the IV
		const ivBuffer = new Uint8Array(iv).buffer
		
		const decryptedBuffer = await crypto.subtle.decrypt(
			{
				name: 'AES-GCM',
				iv: ivBuffer
			},
			encryptionKey,
			ciphertext
		)
		
		const decoder = new TextDecoder()
		const decryptedString = decoder.decode(decryptedBuffer)
		return JSON.parse(decryptedString)
	} catch (error) {
		console.error('Decryption failed:', error)
		throw new Error('Failed to decrypt data')
	}
}
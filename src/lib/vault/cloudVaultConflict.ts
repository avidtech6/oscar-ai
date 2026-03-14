/**
 * Cloud vault conflict detection and resolution
 */

import type { ApiKey } from './localVault'

// Detect conflict between local and cloud keys
export async function detectConflict(localKey: ApiKey, cloudKey: ApiKey): Promise<boolean> {
	// Compare hashes first
	if (localKey.localHash && cloudKey.localHash) {
		return localKey.localHash !== cloudKey.localHash
	}
	
	// Fallback to timestamp comparison
	return localKey.updatedAt !== new Date(cloudKey.updatedAt).getTime()
}

// Resolve conflict between local and cloud keys
export async function resolveConflict(
	localKey: ApiKey,
	cloudKey: ApiKey
): Promise<'local' | 'cloud' | 'merged'> {
	const localTime = localKey.updatedAt
	const cloudTime = new Date(cloudKey.updatedAt).getTime()
	
	// Simple timestamp-based resolution
	if (localTime > cloudTime) {
		return 'local'
	} else if (cloudTime > localTime) {
		return 'cloud'
	}
	
	// Same timestamp, compare versions
	if (localKey.keyVersion > cloudKey.keyVersion) {
		return 'local'
	} else if (cloudKey.keyVersion > localKey.keyVersion) {
		return 'cloud'
	}
	
	// Default to local
	return 'local'
}
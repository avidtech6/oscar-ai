// Conflict detection and resolution for Supabase Cloud Storage
import type { SyncMetadata } from './syncMetadata'
import { intelligentMerge } from './syncMetadata'

// Conflict detection
export function detectConflict(localMetadata: SyncMetadata, cloudMetadata: SyncMetadata): boolean {
	return localMetadata.hash !== cloudMetadata.hash
}

// Conflict resolution
export interface ConflictResolution {
	data: any
	metadata: SyncMetadata
	strategy: 'local_wins' | 'cloud_wins' | 'merge'
}

export function resolveConflict(
	localData: any,
	localMetadata: SyncMetadata,
	cloudData: any,
	cloudMetadata: SyncMetadata
): ConflictResolution {
	// Determine data type from table name
	let dataType: 'report' | 'note' | 'setting' | 'trace' = 'report'
	if (localMetadata.tableName.includes('note')) dataType = 'note'
	if (localMetadata.tableName.includes('setting')) dataType = 'setting'
	if (localMetadata.tableName.includes('trace')) dataType = 'trace'
	
	// Use intelligent merge for appropriate data types
	const mergeResult = intelligentMerge(
		localData,
		cloudData,
		localMetadata,
		cloudMetadata,
		dataType
	)
	
	// Create updated metadata
	const resolvedMetadata: SyncMetadata = {
		...localMetadata,
		conflict: false,
		conflictResolution: mergeResult.resolution,
		updatedAt: Date.now(),
		version: Math.max(localMetadata.version, cloudMetadata.version) + 1
	}
	
	return {
		data: mergeResult.mergedData,
		metadata: resolvedMetadata,
		strategy: mergeResult.resolution === 'local' ? 'local_wins' :
				  mergeResult.resolution === 'cloud' ? 'cloud_wins' : 'merge'
	}
}
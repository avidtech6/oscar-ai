/**
 * Sync State Type (Phase 18)
 * 
 * Minimal interface for sync state.
 */

export type SyncStatus = 'idle' | 'syncing' | 'paused' | 'error';

export interface SyncState {
	status: SyncStatus;
	lastSyncedAt: Date | null;
	pendingChanges: number;
	error: string | null;
}

export function createDefaultSyncState(): SyncState {
	return {
		status: 'idle',
		lastSyncedAt: null,
		pendingChanges: 0,
		error: null
	};
}
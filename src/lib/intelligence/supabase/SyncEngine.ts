/**
 * Sync Engine (Phase 18)
 * 
 * Minimal placeholder for Supabase sync engine.
 */

import type { SyncState } from '../types/SyncState';

export interface SyncEngine {
	/** Start syncing */
	start(): Promise<void>;
	/** Stop syncing */
	stop(): void;
	/** Force a sync */
	syncNow(): Promise<boolean>;
	/** Get current sync state */
	getState(): SyncState;
	/** Pause syncing */
	pause(): void;
	/** Resume syncing */
	resume(): void;
}

export class DefaultSyncEngine implements SyncEngine {
	private state: SyncState = {
		status: 'idle',
		lastSyncedAt: null,
		pendingChanges: 0,
		error: null
	};

	async start(): Promise<void> {
		console.log('SyncEngine start');
		this.state.status = 'syncing';
		this.state.lastSyncedAt = new Date();
	}

	stop(): void {
		console.log('SyncEngine stop');
		this.state.status = 'idle';
	}

	async syncNow(): Promise<boolean> {
		console.log('SyncEngine syncNow');
		this.state.status = 'syncing';
		await new Promise(resolve => setTimeout(resolve, 100));
		this.state.status = 'idle';
		this.state.lastSyncedAt = new Date();
		this.state.pendingChanges = 0;
		return true;
	}

	getState(): SyncState {
		return { ...this.state };
	}

	pause(): void {
		console.log('SyncEngine pause');
		this.state.status = 'paused';
	}

	resume(): void {
		console.log('SyncEngine resume');
		this.state.status = 'idle';
	}
}

export default DefaultSyncEngine;
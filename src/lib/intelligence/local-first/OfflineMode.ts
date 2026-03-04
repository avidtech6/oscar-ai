/**
 * Offline Mode (Phase 18)
 * 
 * Minimal placeholder for offline mode detection and handling.
 */

export interface OfflineMode {
	/** Check if offline */
	isOffline(): boolean;
	/** Enable offline mode */
	enable(): void;
	/** Disable offline mode */
	disable(): void;
	/** Get offline status changes */
	onStatusChange(callback: (offline: boolean) => void): void;
	/** Get pending operations count */
	getPendingOperationsCount(): number;
	/** Sync when online */
	syncWhenOnline(): Promise<void>;
}

export class DefaultOfflineMode implements OfflineMode {
	private offline = false;
	private callbacks: ((offline: boolean) => void)[] = [];

	isOffline(): boolean {
		return this.offline;
	}

	enable(): void {
		this.offline = true;
		this.callbacks.forEach(cb => cb(true));
		console.log('OfflineMode enabled');
	}

	disable(): void {
		this.offline = false;
		this.callbacks.forEach(cb => cb(false));
		console.log('OfflineMode disabled');
	}

	onStatusChange(callback: (offline: boolean) => void): void {
		this.callbacks.push(callback);
	}

	getPendingOperationsCount(): number {
		return 0; // placeholder
	}

	async syncWhenOnline(): Promise<void> {
		console.log('OfflineMode syncWhenOnline');
	}
}

export default DefaultOfflineMode;
/**
 * Local Sync Queue (Phase 18)
 * 
 * Minimal placeholder for local sync queue (offline‑first).
 */

export interface LocalSyncQueue {
	/** Enqueue a sync operation */
	enqueue(operation: unknown): Promise<string>;
	/** Process the queue */
	process(): Promise<void>;
	/** Clear the queue */
	clear(): void;
	/** Get pending count */
	getPendingCount(): number;
	/** Retry failed operations */
	retryFailed(): Promise<void>;
}

export class DefaultLocalSyncQueue implements LocalSyncQueue {
	private queue: unknown[] = [];
	private failed: unknown[] = [];

	async enqueue(operation: unknown): Promise<string> {
		this.queue.push(operation);
		const id = `op-${Date.now()}-${this.queue.length}`;
		console.log('LocalSyncQueue enqueue:', id);
		return id;
	}

	async process(): Promise<void> {
		console.log('LocalSyncQueue process:', this.queue.length, 'pending');
		while (this.queue.length > 0) {
			const op = this.queue.shift();
			console.log('Processing operation:', op);
		}
	}

	clear(): void {
		this.queue = [];
		this.failed = [];
		console.log('LocalSyncQueue clear');
	}

	getPendingCount(): number {
		return this.queue.length;
	}

	async retryFailed(): Promise<void> {
		console.log('LocalSyncQueue retryFailed:', this.failed.length, 'failed');
		this.queue.push(...this.failed);
		this.failed = [];
	}
}

export default DefaultLocalSyncQueue;
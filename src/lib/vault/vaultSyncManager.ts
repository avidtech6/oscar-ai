// Vault sync management

import type { SyncStatus } from './types'
import { syncOperation } from './vaultSyncOperations'

export class VaultSyncManager {
	private syncIntervalId: number | null = null
	private syncInProgress = false
	private lastSyncTime: Date | null = null
	private syncListeners: Array<(status: SyncStatus) => void> = []

	// Start automatic sync
	startAutoSync(syncInterval: number): void {
		if (this.syncIntervalId) {
			clearInterval(this.syncIntervalId)
		}

		this.syncIntervalId = window.setInterval(() => {
			this.sync().catch(error => {
				console.warn('Auto-sync failed:', error)
			})
		}, syncInterval)

		console.log(`Auto-sync started (interval: ${syncInterval}ms)`)
	}

	// Stop automatic sync
	stopAutoSync(): void {
		if (this.syncIntervalId) {
			clearInterval(this.syncIntervalId)
			this.syncIntervalId = null
			console.log('Auto-sync stopped')
		}
	}

	// Add sync listener
	addSyncListener(listener: (status: SyncStatus) => void): void {
		this.syncListeners.push(listener)
	}

	// Remove sync listener
	removeSyncListener(listener: (status: SyncStatus) => void): void {
		this.syncListeners = this.syncListeners.filter(l => l !== listener)
	}

	// Notify sync listeners
	private notifySyncListeners(status: SyncStatus): void {
		this.syncListeners.forEach(listener => {
			try {
				listener(status)
			} catch (error) {
				console.error('Sync listener error:', error)
			}
		})
	}

	// Perform sync operation
	async sync(): Promise<SyncStatus> {
		if (this.syncInProgress) {
			return { status: 'in-progress', message: 'Sync already in progress', timestamp: new Date() }
		}

		this.syncInProgress = true
		this.notifySyncListeners({ status: 'in-progress', message: 'Sync started', timestamp: new Date() })

		try {
			const result = await syncOperation()

			if (result.status === 'success') {
				this.lastSyncTime = new Date()
				this.notifySyncListeners({ 
					status: 'success', 
					message: 'Sync completed successfully',
					timestamp: this.lastSyncTime 
				})
				return result
			} else {
				this.notifySyncListeners({ 
					status: 'error', 
					message: result.error || 'Sync failed',
					error: result.error,
					timestamp: new Date()
				})
				return result
			}
		} catch (error) {
			console.error('Sync operation failed:', error)
			const errorStatus: SyncStatus = {
				status: 'error',
				message: 'Sync operation failed',
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date()
			}
			this.notifySyncListeners(errorStatus)
			return errorStatus
		} finally {
			this.syncInProgress = false
		}
	}

	// Get sync status
	getSyncStatus(): SyncStatus {
		const status: SyncStatus = {
			status: this.syncInProgress ? 'in-progress' : 'idle',
			message: this.syncInProgress ? 'Sync in progress' : 'Ready',
			timestamp: new Date()
		}
		return status
	}

	// Get last sync time
	getLastSyncTime(): Date | null {
		return this.lastSyncTime
	}

	// Check if sync is in progress
	isSyncInProgress(): boolean {
		return this.syncInProgress
	}
}
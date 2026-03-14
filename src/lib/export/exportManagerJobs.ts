// Export Manager Jobs - Job lifecycle management for export operations
// Handles job creation, execution, and lifecycle events

import type { ExportJob, ExportRequest, ExportResponse, ExportEvent } from './types'
import { generateId } from './exportManagerHelpers'
import { ExportManagerState } from './exportManagerState'
import { ExportManagerNetwork } from './exportManagerNetwork'

export class ExportManagerJobs {
	protected state: ExportManagerState
	protected network: ExportManagerNetwork
	protected eventListeners: Array<(event: ExportEvent) => void> = []
	protected retryTimeouts: Map<string, number> = new Map()

	constructor(state: ExportManagerState) {
		this.state = state
		this.network = new ExportManagerNetwork()
	}

	// Add event listener
	addEventListener(listener: (event: ExportEvent) => void): void {
		this.eventListeners.push(listener)
	}

	// Remove event listener
	removeEventListener(listener: (event: ExportEvent) => void): void {
		this.eventListeners = this.eventListeners.filter(l => l !== listener)
	}

	// Emit event
	protected emitEvent(event: ExportEvent): void {
		this.eventListeners.forEach(listener => {
			try {
				listener(event)
			} catch (error) {
				console.error('Export event listener error:', error)
			}
		})
	}

	// Create a new export job
	createJob(request: ExportRequest): ExportJob {
		const job: ExportJob = {
			id: generateId(),
			request,
			status: 'pending',
			createdAt: new Date(),
			updatedAt: new Date(),
			retryCount: 0,
			maxRetries: this.state.getConfig().maxRetries
		}

		this.state.createJob(job)
		this.emitEvent({ type: 'job-created', job })
		return job
	}

	// Execute an export job
	async executeJob(jobId: string): Promise<void> {
		const job = this.state.getJob(jobId)
		if (!job || job.status === 'completed' || job.status === 'failed') {
			return
		}

		this.state.updateJob(jobId, { status: 'in-progress' })
		this.emitEvent({ type: 'job-started', jobId })

		try {
			const result = await this.network.callExportFunction(job.request)
			
			this.state.updateJob(jobId, {
				status: 'completed',
				result,
				error: undefined
			})

			this.emitEvent({ type: 'job-completed', jobId, result })

			// If there's a document URL, trigger download
			if (result.documentData && result.fileName) {
				this.network.downloadFile(result.documentData, result.fileName, job.request.documentType)
			}

		} catch (error: any) {
			const retryCount = job.retryCount + 1
			const canRetry = retryCount < job.maxRetries

			this.state.updateJob(jobId, {
				status: canRetry ? 'pending' : 'failed',
				retryCount,
				error: error.message
			})

			this.emitEvent({
				type: 'job-failed',
				jobId,
				error: error.message,
				retryCount
			})

			// Schedule retry if applicable
			if (canRetry) {
				this.scheduleRetry(jobId)
			}
		}
	}

	// Schedule a retry for a failed job
	protected scheduleRetry(jobId: string): void {
		const timeoutId = window.setTimeout(() => {
			this.retryTimeouts.delete(jobId)
			if (this.isOnline()) {
				this.executeJob(jobId).catch(console.error)
			} else {
				// Still offline, move to offline queue
				this.moveToOfflineQueue(jobId)
			}
		}, this.state.getConfig().retryDelay)

		this.retryTimeouts.set(jobId, timeoutId)
	}

	// Move job to offline queue
	protected moveToOfflineQueue(jobId: string): void {
		const job = this.state.getJob(jobId)
		if (!job) {
			return
		}

		this.state.updateJob(jobId, { status: 'queued-offline' })
		this.state.addToOfflineQueue(job)
		this.emitEvent({ type: 'offline-queue-updated', queueSize: this.state.getOfflineQueue().length })
	}

	// Process offline queue
	async processOfflineQueue(): Promise<void> {
		if (!this.isOnline() || this.state.getOfflineQueue().length === 0) {
			return
		}

		const jobsToProcess = [...this.state.getOfflineQueue()]
		this.state = new ExportManagerState(this.state.getConfig()) // Reset queue
		this.state.initialize().catch(console.error)

		for (const job of jobsToProcess) {
			this.state.updateJob(job.id, { status: 'pending' })
			await this.executeJob(job.id).catch(() => {
				// If still fails, put back in queue
				this.state.addToOfflineQueue(job)
			})
		}

		this.emitEvent({ type: 'offline-queue-updated', queueSize: this.state.getOfflineQueue().length })
	}

	// Retry a failed job
	retryJob(jobId: string): void {
		const job = this.state.getJob(jobId)
		if (!job || job.status !== 'failed') {
			return
		}

		this.state.updateJob(jobId, { status: 'pending', retryCount: 0 })
		
		if (this.isOnline()) {
			this.executeJob(jobId).catch(console.error)
		} else if (this.state.getConfig().autoQueueOffline) {
			this.moveToOfflineQueue(jobId)
		}
	}

	// Cancel a job
	cancelJob(jobId: string): void {
		const job = this.state.getJob(jobId)
		if (!job || job.status === 'completed' || job.status === 'failed') {
			return
		}

		// Clear retry timeout if exists
		const timeoutId = this.retryTimeouts.get(jobId)
		if (timeoutId) {
			clearTimeout(timeoutId)
			this.retryTimeouts.delete(jobId)
		}

		// Remove from offline queue
		this.state.removeFromOfflineQueue(jobId)

		this.state.updateJob(jobId, { status: 'failed', error: 'Cancelled by user' })
		this.emitEvent({ type: 'offline-queue-updated', queueSize: this.state.getOfflineQueue().length })
	}

	// Get all jobs
	getAllJobs(): ExportJob[] {
		return this.state.getAllJobs()
	}

	// Get job by ID
	getJob(jobId: string): ExportJob | null {
		return this.state.getJob(jobId)
	}

	// Check if online
	protected isOnline(): boolean {
		return navigator.onLine
	}

	// Call export function (to be implemented by network layer)
	protected async callExportFunction(request: ExportRequest): Promise<ExportResponse> {
		throw new Error('callExportFunction must be implemented by network layer')
	}

	// Download file (to be implemented by network layer)
	protected downloadFile(data: any, filename: string, type: string): void {
		throw new Error('downloadFile must be implemented by network layer')
	}

	// Cleanup resources
	cleanup(): void {
		// Clear all timeouts
		this.retryTimeouts.forEach(timeoutId => {
			clearTimeout(timeoutId)
		})
		this.retryTimeouts.clear()
		this.eventListeners = []
	}
}
// Export Manager Core - Core functionality for export management
// Handles offline queueing, retry logic, and communication with Supabase Edge Functions

import {
	type ExportFormat,
	type ExportContent,
	type ExportRequest,
	type ExportResponse,
	type ExportJob,
	type ExportStats,
	type ExportConfig,
	type ExportEvent,
	DEFAULT_EXPORT_CONFIG
} from './types'

import { downloadHtmlSnapshot, snapshotForExport } from './htmlSnapshot'
import { exportContentToMarkdown, downloadMarkdown } from './markdown'
import {
	EXPORT_FUNCTION_URL,
	OFFLINE_QUEUE_KEY,
	EXPORT_JOBS_KEY,
	EXPORT_CONFIG_KEY,
	generateId,
	getSupabaseToken,
	isOnline
} from './exportManagerHelpers'
import { callExportFunction, downloadFile } from './exportManagerNetwork'
import { computeStats } from './exportManagerStats'

// Export Manager class (core)
export class ExportManagerCore {
	protected config: ExportConfig
	protected jobs: Map<string, ExportJob> = new Map()
	protected offlineQueue: ExportJob[] = []
	protected eventListeners: Array<(event: ExportEvent) => void> = []
	protected isInitialized = false
	protected retryTimeouts: Map<string, number> = new Map()

	constructor(config: Partial<ExportConfig> = {}) {
		this.config = { ...DEFAULT_EXPORT_CONFIG, ...config }
	}

	// Initialize the manager (load from localStorage)
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return
		}

		try {
			// Load config
			const savedConfig = localStorage.getItem(EXPORT_CONFIG_KEY)
			if (savedConfig) {
				this.config = { ...this.config, ...JSON.parse(savedConfig) }
			}

			// Load jobs
			const savedJobs = localStorage.getItem(EXPORT_JOBS_KEY)
			if (savedJobs) {
				const jobs: ExportJob[] = JSON.parse(savedJobs)
				jobs.forEach(job => {
					// Convert date strings back to Date objects
					job.createdAt = new Date(job.createdAt)
					job.updatedAt = new Date(job.updatedAt)
					this.jobs.set(job.id, job)
				})
			}

			// Load offline queue
			const savedQueue = localStorage.getItem(OFFLINE_QUEUE_KEY)
			if (savedQueue) {
				const queue: ExportJob[] = JSON.parse(savedQueue)
				queue.forEach(job => {
					job.createdAt = new Date(job.createdAt)
					job.updatedAt = new Date(job.updatedAt)
				})
				this.offlineQueue = queue
			}

			// Process offline queue if online
			if (isOnline() && this.offlineQueue.length > 0) {
				setTimeout(() => this.processOfflineQueue(), 1000)
			}

			this.isInitialized = true
			console.log('Export manager initialized')
		} catch (error) {
			console.error('Failed to initialize export manager:', error)
			throw error
		}
	}

	// Save state to localStorage
	protected saveState(): void {
		try {
			// Save jobs
			const jobsArray = Array.from(this.jobs.values()).map(job => ({
				...job,
				createdAt: job.createdAt.toISOString(),
				updatedAt: job.updatedAt.toISOString()
			}))
			localStorage.setItem(EXPORT_JOBS_KEY, JSON.stringify(jobsArray))

			// Save offline queue
			const queueArray = this.offlineQueue.map(job => ({
				...job,
				createdAt: job.createdAt.toISOString(),
				updatedAt: job.updatedAt.toISOString()
			}))
			localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queueArray))

			// Save config
			localStorage.setItem(EXPORT_CONFIG_KEY, JSON.stringify(this.config))
		} catch (error) {
			console.warn('Failed to save export manager state:', error)
		}
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
	protected createJob(request: ExportRequest): ExportJob {
		const job: ExportJob = {
			id: generateId(),
			request,
			status: 'pending',
			createdAt: new Date(),
			updatedAt: new Date(),
			retryCount: 0,
			maxRetries: this.config.maxRetries
		}

		this.jobs.set(job.id, job)
		this.emitEvent({ type: 'job-created', job })
		this.saveState()

		return job
	}

	// Update job status
	protected updateJob(jobId: string, updates: Partial<ExportJob>): void {
		const job = this.jobs.get(jobId)
		if (!job) {
			return
		}

		Object.assign(job, updates, { updatedAt: new Date() })
		this.jobs.set(jobId, job)
		this.saveState()
	}

	// Execute an export job
	protected async executeJob(jobId: string): Promise<void> {
		const job = this.jobs.get(jobId)
		if (!job || job.status === 'completed' || job.status === 'failed') {
			return
		}

		this.updateJob(jobId, { status: 'in-progress' })
		this.emitEvent({ type: 'job-started', jobId })

		try {
			const result = await callExportFunction(job.request)
			
			this.updateJob(jobId, {
				status: 'completed',
				result,
				error: undefined
			})

			this.emitEvent({ type: 'job-completed', jobId, result })

			// If there's a document URL, trigger download
			if (result.documentData && result.fileName) {
				downloadFile(result.documentData, result.fileName, job.request.documentType)
			}

		} catch (error: any) {
			const retryCount = job.retryCount + 1
			const canRetry = retryCount < job.maxRetries

			this.updateJob(jobId, {
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
			if (isOnline()) {
				this.executeJob(jobId).catch(console.error)
			} else {
				// Still offline, move to offline queue
				this.moveToOfflineQueue(jobId)
			}
		}, this.config.retryDelay)

		this.retryTimeouts.set(jobId, timeoutId)
	}

	// Move job to offline queue
	protected moveToOfflineQueue(jobId: string): void {
		const job = this.jobs.get(jobId)
		if (!job) {
			return
		}

		this.updateJob(jobId, { status: 'queued-offline' })
		this.offlineQueue.push(job)
		this.emitEvent({ type: 'offline-queue-updated', queueSize: this.offlineQueue.length })
		this.saveState()
	}

	// Process offline queue
	protected async processOfflineQueue(): Promise<void> {
		if (!isOnline() || this.offlineQueue.length === 0) {
			return
		}

		const jobsToProcess = [...this.offlineQueue]
		this.offlineQueue = []

		for (const job of jobsToProcess) {
			this.updateJob(job.id, { status: 'pending' })
			await this.executeJob(job.id).catch(() => {
				// If still fails, put back in queue
				this.offlineQueue.push(job)
			})
		}

		this.emitEvent({ type: 'offline-queue-updated', queueSize: this.offlineQueue.length })
		this.saveState()
	}

	// Get job by ID
	getJob(jobId: string): ExportJob | null {
		return this.jobs.get(jobId) || null
	}

	// Get all jobs
	getAllJobs(): ExportJob[] {
		return Array.from(this.jobs.values()).sort((a, b) => 
			b.createdAt.getTime() - a.createdAt.getTime()
		)
	}

	// Get statistics
	getStats(): ExportStats {
		return computeStats(this.getAllJobs(), this.offlineQueue)
	}

	// Retry a failed job
	retryJob(jobId: string): void {
		const job = this.jobs.get(jobId)
		if (!job || job.status !== 'failed') {
			return
		}

		this.updateJob(jobId, { status: 'pending', retryCount: 0 })
		
		if (isOnline()) {
			this.executeJob(jobId).catch(console.error)
		} else if (this.config.autoQueueOffline) {
			this.moveToOfflineQueue(jobId)
		}
	}

	// Cancel a job
	cancelJob(jobId: string): void {
		const job = this.jobs.get(jobId)
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
		this.offlineQueue = this.offlineQueue.filter(j => j.id !== jobId)

		this.updateJob(jobId, { status: 'failed', error: 'Cancelled by user' })
		this.emitEvent({ type: 'offline-queue-updated', queueSize: this.offlineQueue.length })
	}

	// Clear completed jobs
	clearCompletedJobs(): void {
		const completedIds: string[] = []
		this.jobs.forEach((job, id) => {
			if (job.status === 'completed' || job.status === 'failed') {
				completedIds.push(id)
			}
		})

		completedIds.forEach(id => {
			this.jobs.delete(id)
			const timeoutId = this.retryTimeouts.get(id)
			if (timeoutId) {
				clearTimeout(timeoutId)
				this.retryTimeouts.delete(id)
			}
		})

		this.saveState()
		this.emitEvent({ type: 'offline-queue-updated', queueSize: this.offlineQueue.length })
	}

	// Get configuration
	getConfig(): ExportConfig {
		return { ...this.config }
	}

	// Update configuration
	updateConfig(newConfig: Partial<ExportConfig>): void {
		this.config = { ...this.config, ...newConfig }
		localStorage.setItem(EXPORT_CONFIG_KEY, JSON.stringify(this.config))
		this.emitEvent({ type: 'config-updated', config: this.config })
	}

	// Cleanup resources
	cleanup(): void {
		// Clear all timeouts
		this.retryTimeouts.forEach(timeoutId => {
			clearTimeout(timeoutId)
		})
		this.retryTimeouts.clear()
		this.eventListeners = []
		this.isInitialized = false
	}
}
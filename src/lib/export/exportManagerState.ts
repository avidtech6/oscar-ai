// Export Manager State - State management for export operations
// Handles localStorage persistence and state synchronization

import type { ExportJob, ExportConfig, ExportStats, ExportEvent } from './types'
import { EXPORT_JOBS_KEY, OFFLINE_QUEUE_KEY, EXPORT_CONFIG_KEY } from './exportManagerHelpers'
import { computeStats } from './exportManagerStats'

export class ExportManagerState {
	protected config: ExportConfig
	protected jobs: Map<string, ExportJob> = new Map()
	protected offlineQueue: ExportJob[] = []
	protected isInitialized = false

	constructor(config: ExportConfig) {
		this.config = config
	}

	// Initialize the state (load from localStorage)
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

			this.isInitialized = true
			console.log('Export manager state initialized')
		} catch (error) {
			console.error('Failed to initialize export manager state:', error)
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

	// Get offline queue
	getOfflineQueue(): ExportJob[] {
		return [...this.offlineQueue]
	}

	// Update job status
	updateJob(jobId: string, updates: Partial<ExportJob>): void {
		const job = this.jobs.get(jobId)
		if (!job) {
			return
		}

		Object.assign(job, updates, { updatedAt: new Date() })
		this.jobs.set(jobId, job)
		this.saveState()
	}

	// Create a new job
	createJob(job: ExportJob): void {
		this.jobs.set(job.id, job)
		this.saveState()
	}

	// Add job to offline queue
 addToOfflineQueue(job: ExportJob): void {
		this.offlineQueue.push(job)
		this.saveState()
	}

	// Remove job from offline queue
 removeFromOfflineQueue(jobId: string): void {
		this.offlineQueue = this.offlineQueue.filter(j => j.id !== jobId)
		this.saveState()
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
		})

		this.saveState()
	}

	// Get configuration
	getConfig(): ExportConfig {
		return { ...this.config }
	}

	// Update configuration
	updateConfig(newConfig: Partial<ExportConfig>): void {
		this.config = { ...this.config, ...newConfig }
		this.saveState()
	}

	// Check if initialized
	isReady(): boolean {
		return this.isInitialized
	}

	// Get statistics
	getStats(): any {
		return computeStats(this.getAllJobs(), this.offlineQueue)
	}

	// Cleanup resources
	cleanup(): void {
		this.jobs.clear()
		this.offlineQueue = []
		this.isInitialized = false
	}
}
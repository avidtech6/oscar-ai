// Export Manager - Main orchestrator for export management
// Coordinates state, jobs, and network operations

import type { ExportConfig, ExportEvent } from './types'
import { DEFAULT_EXPORT_CONFIG } from './types'
import { ExportManagerState } from './exportManagerState'
import { ExportManagerJobs } from './exportManagerJobs'
import { ExportManagerNetwork } from './exportManagerNetwork'
import { isOnline } from './exportManagerHelpers'

export class ExportManager {
	protected state: ExportManagerState
	protected jobs: ExportManagerJobs
	protected network: ExportManagerNetwork
	protected isInitialized = false

	constructor(config: Partial<ExportConfig> = {}) {
		this.state = new ExportManagerState(config as ExportConfig)
		this.network = new ExportManagerNetwork()
		this.jobs = new ExportManagerJobs(this.state)
	}

	// Initialize the manager (load from localStorage)
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return
		}

		await this.state.initialize()

		// Process offline queue if online
		if (isOnline() && this.state.getOfflineQueue().length > 0) {
			setTimeout(() => this.processOfflineQueue(), 1000)
		}

		this.isInitialized = true
		console.log('Export manager initialized')
	}

	// Add event listener
	addEventListener(listener: (event: ExportEvent) => void): void {
		this.jobs.addEventListener(listener)
	}

	// Remove event listener
	removeEventListener(listener: (event: ExportEvent) => void): void {
		this.jobs.removeEventListener(listener)
	}

	// Create a new export job
	createJob(request: any): any {
		return this.jobs.createJob(request)
	}

	// Execute an export job
	async executeJob(jobId: string): Promise<void> {
		return this.jobs.executeJob(jobId)
	}

	// Get job by ID
	getJob(jobId: string): any {
		return this.state.getJob(jobId)
	}

	// Get all jobs
	getAllJobs(): any[] {
		return this.state.getAllJobs()
	}

	// Get statistics
	getStats(): any {
		return this.state.getStats()
	}

	// Retry a failed job
	retryJob(jobId: string): void {
		return this.jobs.retryJob(jobId)
	}

	// Cancel a job
	cancelJob(jobId: string): void {
		return this.jobs.cancelJob(jobId)
	}

	// Clear completed jobs
	clearCompletedJobs(): void {
		return this.state.clearCompletedJobs()
	}

	// Get configuration
	getConfig(): any {
		return this.state.getConfig()
	}

	// Update configuration
	updateConfig(newConfig: any): void {
		this.state.updateConfig(newConfig)
	}

	// Process offline queue
	async processOfflineQueue(): Promise<void> {
		return this.jobs.processOfflineQueue()
	}

	// Cleanup resources
	cleanup(): void {
		this.jobs.cleanup()
		this.state.cleanup()
	}
}

// Export singleton instance
export const exportManager = new ExportManager()

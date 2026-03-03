// Export Manager - Unified interface for document export
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

// Edge Function endpoint (should be configured via environment)
const EXPORT_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-document`
  : 'http://localhost:54321/functions/v1/export-document'

// Local storage keys
const OFFLINE_QUEUE_KEY = 'oscar-export-offline-queue'
const EXPORT_JOBS_KEY = 'oscar-export-jobs'
const EXPORT_CONFIG_KEY = 'oscar-export-config'

// Helper to generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Helper to get Supabase JWT (from auth store)
async function getSupabaseToken(): Promise<string | null> {
  // In a real implementation, retrieve from auth store
  // For now, we'll try to get it from localStorage
  const token = localStorage.getItem('supabase.auth.token')
  if (token) {
    try {
      const parsed = JSON.parse(token)
      return parsed.access_token || null
    } catch {
      return null
    }
  }
  return null
}

// Check network connectivity
function isOnline(): boolean {
  return navigator.onLine
}

// Export Manager class
export class ExportManager {
  private config: ExportConfig
  private jobs: Map<string, ExportJob> = new Map()
  private offlineQueue: ExportJob[] = []
  private eventListeners: Array<(event: ExportEvent) => void> = []
  private isInitialized = false
  private retryTimeouts: Map<string, number> = new Map()

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
  private saveState(): void {
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
  private emitEvent(event: ExportEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Export event listener error:', error)
      }
    })
  }

  // Create a new export job
  private createJob(request: ExportRequest): ExportJob {
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
  private updateJob(jobId: string, updates: Partial<ExportJob>): void {
    const job = this.jobs.get(jobId)
    if (!job) {
      return
    }

    Object.assign(job, updates, { updatedAt: new Date() })
    this.jobs.set(jobId, job)
    this.saveState()
  }

  // Call the Edge Function
  private async callExportFunction(request: ExportRequest): Promise<ExportResponse> {
    const token = await getSupabaseToken()
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(EXPORT_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Export failed: ${response.status} ${errorText}`)
    }

    const result: ExportResponse = await response.json()
    return result
  }

  // Execute an export job
  private async executeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId)
    if (!job || job.status === 'completed' || job.status === 'failed') {
      return
    }

    this.updateJob(jobId, { status: 'in-progress' })
    this.emitEvent({ type: 'job-started', jobId })

    try {
      const result = await this.callExportFunction(job.request)
      
      this.updateJob(jobId, {
        status: 'completed',
        result,
        error: undefined
      })

      this.emitEvent({ type: 'job-completed', jobId, result })

      // If there's a document URL, trigger download
      if (result.documentData && result.fileName) {
        this.downloadFile(result.documentData, result.fileName, job.request.documentType)
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
  private scheduleRetry(jobId: string): void {
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
  private moveToOfflineQueue(jobId: string): void {
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
  private async processOfflineQueue(): Promise<void> {
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

  // Download file from base64 data
  private downloadFile(base64Data: string, fileName: string, format: ExportFormat): void {
    try {
      const mimeTypes: Record<ExportFormat, string> = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        html: 'text/html',
        markdown: 'text/markdown'
      }

      const mimeType = mimeTypes[format]
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      const blob = new Blob([bytes], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download file:', error)
    }
  }

  // Public API

  // Export a report
  async exportReport(
    reportId: string,
    format: ExportFormat = this.config.defaultFormat,
    options?: Partial<ExportRequest>
  ): Promise<ExportJob> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // In a real implementation, fetch report data from store/API
    // For now, create a placeholder content
    const content: ExportContent = {
      title: `Report ${reportId}`,
      sections: [
        {
          title: 'Summary',
          content: 'This is a placeholder for report content.',
          level: 1
        }
      ],
      metadata: {
        reportId,
        exportedAt: new Date().toISOString()
      }
    }

    const request: ExportRequest = {
      documentType: format,
      content,
      fileName: options?.fileName || `report_${reportId}_${Date.now()}.${format}`,
      includeHeader: options?.includeHeader ?? true,
      includeFooter: options?.includeFooter ?? true
    }

    const job = this.createJob(request)

    // Execute immediately if online, otherwise queue offline
    if (isOnline()) {
      this.executeJob(job.id).catch(console.error)
    } else if (this.config.autoQueueOffline) {
      this.moveToOfflineQueue(job.id)
    }

    return job
  }

  // Export a note
  async exportNote(
    noteId: string,
    format: ExportFormat = this.config.defaultFormat,
    options?: Partial<ExportRequest>
  ): Promise<ExportJob> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // Placeholder content
    const content: ExportContent = {
      title: `Note ${noteId}`,
      sections: [
        {
          title: 'Content',
          content: 'This is a placeholder for note content.',
          level: 1
        }
      ],
      metadata: {
        noteId,
        exportedAt: new Date().toISOString()
      }
    }

    const request: ExportRequest = {
      documentType: format,
      content,
      fileName: options?.fileName || `note_${noteId}_${Date.now()}.${format}`,
      includeHeader: options?.includeHeader ?? true,
      includeFooter: options?.includeFooter ?? true
    }

    const job = this.createJob(request)

    if (isOnline()) {
      this.executeJob(job.id).catch(console.error)
    } else if (this.config.autoQueueOffline) {
      this.moveToOfflineQueue(job.id)
    }

    return job
  }

  // Export a summary (multiple items)
  async exportSummary(
    items: Array<{ id: string; title: string; content: string }>,
    format: ExportFormat = this.config.defaultFormat,
    options?: Partial<ExportRequest>
  ): Promise<ExportJob> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const sections = items.map((item, index) => ({
      title: item.title,
      content: item.content,
      level: 1
    }))

    const content: ExportContent = {
      title: `Summary ${new Date().toLocaleDateString()}`,
      sections,
      metadata: {
        itemCount: items.length,
        exportedAt: new Date().toISOString()
      }
    }

    const request: ExportRequest = {
      documentType: format,
      content,
      fileName: options?.fileName || `summary_${Date.now()}.${format}`,
      includeHeader: options?.includeHeader ?? true,
      includeFooter: options?.includeFooter ?? true
    }

    const job = this.createJob(request)

    if (isOnline()) {
      this.executeJob(job.id).catch(console.error)
    } else if (this.config.autoQueueOffline) {
      this.moveToOfflineQueue(job.id)
    }

    return job
  }

  // Export HTML snapshot of a DOM element (client‑side only)
  async exportHtmlSnapshot(
    elementOrSelector: HTMLElement | string,
    options?: {
      title?: string
      filename?: string
      includeStyles?: boolean
      inlineStyles?: boolean
    }
  ): Promise<ExportJob> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // Create a job for tracking
    const request: ExportRequest = {
      documentType: 'html',
      content: {
        title: options?.title || 'HTML Snapshot',
        sections: [],
        metadata: {
          snapshot: true,
          timestamp: new Date().toISOString()
        }
      },
      fileName: options?.filename || `snapshot_${Date.now()}.html`,
      includeHeader: false,
      includeFooter: false
    }

    const job = this.createJob(request)
    this.updateJob(job.id, { status: 'in-progress' })
    this.emitEvent({ type: 'job-started', jobId: job.id })

    try {
      // Use the htmlSnapshot utility to generate and download
      downloadHtmlSnapshot(elementOrSelector, {
        title: options?.title || 'HTML Snapshot',
        filename: options?.filename || `snapshot_${Date.now()}.html`,
        includeStyles: options?.includeStyles ?? true,
        inlineStyles: options?.inlineStyles ?? false
      })

      const result: ExportResponse = {
        success: true,
        fileName: request.fileName!,
        documentData: ''
      }
      this.updateJob(job.id, {
        status: 'completed',
        result
      })
      this.emitEvent({ type: 'job-completed', jobId: job.id, result })
    } catch (error: any) {
      this.updateJob(job.id, {
        status: 'failed',
        error: error.message
      })
      this.emitEvent({
        type: 'job-failed',
        jobId: job.id,
        error: error.message,
        retryCount: 0
      })
    }

    return job
  }

  // Export structured content as HTML (client‑side)
  async exportHtmlFromContent(
    content: ExportContent,
    options?: Partial<ExportRequest>
  ): Promise<ExportJob> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const request: ExportRequest = {
      documentType: 'html',
      content,
      fileName: options?.fileName || `content_${Date.now()}.html`,
      includeHeader: options?.includeHeader ?? true,
      includeFooter: options?.includeFooter ?? true
    }

    const job = this.createJob(request)
    this.updateJob(job.id, { status: 'in-progress' })
    this.emitEvent({ type: 'job-started', jobId: job.id })

    try {
      const html = snapshotForExport(content, {
        title: content.title,
        filename: request.fileName!
      })

      // Download the HTML
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = request.fileName!
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      const result: ExportResponse = {
        success: true,
        fileName: request.fileName!,
        documentData: ''
      }
      this.updateJob(job.id, {
        status: 'completed',
        result
      })
      this.emitEvent({ type: 'job-completed', jobId: job.id, result })
    } catch (error: any) {
      this.updateJob(job.id, {
        status: 'failed',
        error: error.message
      })
      this.emitEvent({
        type: 'job-failed',
        jobId: job.id,
        error: error.message,
        retryCount: 0
      })
    }

    return job
  }

  // Export structured content as Markdown (client‑side)
  async exportMarkdownFromContent(
    content: ExportContent,
    options?: Partial<ExportRequest>
  ): Promise<ExportJob> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const request: ExportRequest = {
      documentType: 'markdown',
      content,
      fileName: options?.fileName || `content_${Date.now()}.md`,
      includeHeader: options?.includeHeader ?? true,
      includeFooter: options?.includeFooter ?? true
    }

    const job = this.createJob(request)
    this.updateJob(job.id, { status: 'in-progress' })
    this.emitEvent({ type: 'job-started', jobId: job.id })

    try {
      const markdown = exportContentToMarkdown(content, {
        includeMetadata: true,
        includeHeader: request.includeHeader,
        includeFooter: request.includeFooter,
        filename: request.fileName!
      })

      downloadMarkdown(markdown, request.fileName!)

      const result: ExportResponse = {
        success: true,
        fileName: request.fileName!,
        documentData: ''
      }
      this.updateJob(job.id, {
        status: 'completed',
        result
      })
      this.emitEvent({ type: 'job-completed', jobId: job.id, result })
    } catch (error: any) {
      this.updateJob(job.id, {
        status: 'failed',
        error: error.message
      })
      this.emitEvent({
        type: 'job-failed',
        jobId: job.id,
        error: error.message,
        retryCount: 0
      })
    }

    return job
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
    const jobs = this.getAllJobs()
    const formats: Record<ExportFormat, number> = {
      pdf: 0,
      docx: 0,
      html: 0,
      markdown: 0
    }

    jobs.forEach(job => {
      formats[job.request.documentType]++
    })

    return {
      totalExports: jobs.length,
      successfulExports: jobs.filter(j => j.status === 'completed').length,
      failedExports: jobs.filter(j => j.status === 'failed').length,
      pendingExports: jobs.filter(j => j.status === 'pending' || j.status === 'in-progress').length,
      offlineQueueSize: this.offlineQueue.length,
      lastExport: jobs.length > 0 ? jobs[0].createdAt : undefined,
      formats
    }
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

// Create singleton instance
export const exportManager = new ExportManager()

// Export types
export type { ExportFormat, ExportContent, ExportRequest, ExportResponse, ExportJob, ExportStats, ExportConfig, ExportEvent }

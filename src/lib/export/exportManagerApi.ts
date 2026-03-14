// Export Manager API - Public API methods for export operations

import { ExportManagerCore } from './exportManagerCore'
import type { ExportFormat, ExportRequest, ExportContent, ExportJob } from './types'
import { downloadHtmlSnapshot, snapshotForExport } from './htmlSnapshot'
import { exportContentToMarkdown, downloadMarkdown } from './markdown'
import { isOnline } from './exportManagerHelpers'

export class ExportManager extends ExportManagerCore {
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

			const result = {
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

			const result = {
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

			const result = {
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
}
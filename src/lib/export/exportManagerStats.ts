import type { ExportFormat, ExportJob, ExportStats } from './types'

export function computeStats(jobs: ExportJob[], offlineQueue: ExportJob[]): ExportStats {
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
		offlineQueueSize: offlineQueue.length,
		lastExport: jobs.length > 0 ? jobs[0].createdAt : undefined,
		formats
	}
}
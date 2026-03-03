// Export Layer Types

export type ExportFormat = 'pdf' | 'docx' | 'html' | 'markdown'

export interface ExportContent {
  title: string
  author?: string
  date?: string
  sections: Array<{
    title: string
    content: string
    level: number
  }>
  metadata?: Record<string, any>
  style?: {
    fontFamily?: string
    fontSize?: number
    lineHeight?: number
    margins?: {
      top: number
      right: number
      bottom: number
      left: number
    }
  }
}

export interface ExportRequest {
  documentType: ExportFormat
  content: ExportContent
  fileName?: string
  includeHeader?: boolean
  includeFooter?: boolean
}

export interface ExportResponse {
  success: boolean
  documentUrl?: string
  documentData?: string // Base64 encoded for binary formats
  fileName?: string
  error?: string
  fileSize?: number
}

export interface ExportJob {
  id: string
  request: ExportRequest
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'queued-offline'
  createdAt: Date
  updatedAt: Date
  result?: ExportResponse
  retryCount: number
  maxRetries: number
  error?: string
}

export interface ExportStats {
  totalExports: number
  successfulExports: number
  failedExports: number
  pendingExports: number
  offlineQueueSize: number
  lastExport?: Date
  formats: Record<ExportFormat, number>
}

export interface ExportConfig {
  autoQueueOffline: boolean
  maxRetries: number
  retryDelay: number // ms
  enableCloudStorage: boolean
  defaultFormat: ExportFormat
  includeMetadata: boolean
}

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  autoQueueOffline: true,
  maxRetries: 3,
  retryDelay: 5000,
  enableCloudStorage: true,
  defaultFormat: 'pdf',
  includeMetadata: true
}

export type ExportEvent =
  | { type: 'job-created'; job: ExportJob }
  | { type: 'job-started'; jobId: string }
  | { type: 'job-completed'; jobId: string; result: ExportResponse }
  | { type: 'job-failed'; jobId: string; error: string; retryCount: number }
  | { type: 'offline-queue-updated'; queueSize: number }
  | { type: 'config-updated'; config: ExportConfig }

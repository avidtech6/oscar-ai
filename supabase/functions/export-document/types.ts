// Document types
export type DocumentType = 'pdf' | 'docx' | 'html' | 'markdown'

// Export request interface
export interface ExportRequest {
  documentType: DocumentType
  content: {
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
  fileName?: string
  includeHeader?: boolean
  includeFooter?: boolean
}

// Export response interface
export interface ExportResponse {
  success: boolean
  documentUrl?: string
  documentData?: string // Base64 encoded for binary formats
  fileName?: string
  error?: string
  fileSize?: number
}
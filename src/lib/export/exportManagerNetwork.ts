// Export Manager Network - Network operations for export management
// Handles communication with Supabase Edge Functions and file downloads

import type { ExportRequest, ExportResponse } from './types'
import { getSupabaseToken } from './exportManagerHelpers'

export class ExportManagerNetwork {
	// Call the export function via Supabase Edge Function
	async callExportFunction(request: ExportRequest): Promise<ExportResponse> {
		const token = await getSupabaseToken()
		const response = await fetch('/functions/v1/export-document', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(request)
		})

		if (!response.ok) {
			throw new Error(`Export function failed: ${response.statusText}`)
		}

		return response.json()
	}

	// Download a file from the provided data
	downloadFile(data: any, filename: string, type: string): void {
		const blob = new Blob([data], { type })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = filename
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
	}

	// Check if online
	isOnline(): boolean {
		return navigator.onLine
	}
}
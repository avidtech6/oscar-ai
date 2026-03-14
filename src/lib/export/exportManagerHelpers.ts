// Helper functions and constants for ExportManager

// Edge Function endpoint (should be configured via environment)
export const EXPORT_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-document`
  : 'http://localhost:54321/functions/v1/export-document'

// Local storage keys
export const OFFLINE_QUEUE_KEY = 'oscar-export-offline-queue'
export const EXPORT_JOBS_KEY = 'oscar-export-jobs'
export const EXPORT_CONFIG_KEY = 'oscar-export-config'

// Helper to generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Helper to get Supabase JWT (from auth store)
export async function getSupabaseToken(): Promise<string | null> {
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
export function isOnline(): boolean {
  return navigator.onLine
}
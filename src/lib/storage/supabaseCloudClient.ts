// Supabase Cloud Client and Configuration
import { createClient } from '@supabase/supabase-js'
import { browser } from '$app/environment'
import type { SyncMetadata } from './syncMetadata'

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase: any = null

if (browser) {
  supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
  )
}

export function getSupabaseClient() {
  if (!browser) {
    throw new Error("Supabase client requires browser environment")
  }
  return supabase
}

// Cloud table names (match local tables)
export const CLOUD_TABLES = {
  REPORTS: 'reports',
  NOTES: 'notes',
  SETTINGS: 'settings',
  INTELLIGENCE_TRACES: 'intelligence_traces',
  SYNC_METADATA: 'sync_metadata'
} as const

// Cloud record interface
export interface CloudRecord {
  id: string
  table: string
  data: any
  metadata: SyncMetadata
  created_at: string
  updated_at: string
  deleted_at: string | null
  version: number
}
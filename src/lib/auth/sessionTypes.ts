// Session management types and interfaces

import type { Session, User } from '@supabase/supabase-js'
import type { AuthError } from './types'

export interface SessionResult {
  session: Session | null
  error: AuthError | null
}

export interface SignInResult {
  error: AuthError | null
}

export interface SessionChangeCallback {
  (session: Session | null): void
}

export interface SessionConfig {
  autoRefresh: boolean
  refreshBufferMs: number
}

// Default configuration
export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  autoRefresh: true,
  refreshBufferMs: 300000 // 5 minutes
}
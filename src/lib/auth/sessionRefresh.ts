// Session refresh management

import { shouldBypassAuth } from './client'
import type { Session } from '@supabase/supabase-js'
import { getBrowserClient } from './client'

export class SessionRefreshManager {
  private refreshInterval: NodeJS.Timeout | null = null

  // Start automatic session refresh
  start(session: Session, config: { refreshBufferMs: number } = { refreshBufferMs: 300000 }): void {
    this.stop()

    const expiresAt = session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000
    const refreshTime = expiresAt - Date.now() - config.refreshBufferMs

    if (refreshTime > 0) {
      this.refreshInterval = setTimeout(async () => {
        try {
          await this.refresh()
        } catch (error) {
          console.error('Failed to refresh session:', error)
        }
      }, refreshTime)
    }
  }

  // Stop session refresh
  stop(): void {
    if (this.refreshInterval) {
      clearTimeout(this.refreshInterval)
      this.refreshInterval = null
    }
  }

  // Refresh session
  private async refresh(): Promise<void> {
    if (shouldBypassAuth()) {
      return
    }

    const client = getBrowserClient()
    const { data: { session }, error } = await client.auth.refreshSession()

    if (error) {
      console.error('Session refresh failed:', error)
      return
    }

    if (session) {
      this.start(session)
    }
  }

  // Check if session is valid
  isSessionValid(session: Session | null): boolean {
    if (!session) return false

    const expiresAt = session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000
    return Date.now() < expiresAt - 60000 // Consider valid if not expired within 1 minute
  }

  // Get session expiry time
  getSessionExpiry(session: Session): Date {
    const expiresAt = session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000
    return new Date(expiresAt)
  }
}
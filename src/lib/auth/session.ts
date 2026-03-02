// Session management with automatic refresh
import { getBrowserClient, createMockClient, shouldBypassAuth, isSupabaseConfigured } from './client'
import type { Session, User, AuthError as SupabaseAuthError } from '@supabase/supabase-js'
import type { AuthError } from './types'

export class AuthSessionService {
  private client: any
  private refreshInterval: NodeJS.Timeout | null = null
  private sessionChangeCallbacks: Array<(session: Session | null) => void> = []

  constructor() {
    // Use mock client if auth should be bypassed or Supabase is not configured
    if (shouldBypassAuth() || !isSupabaseConfigured()) {
      this.client = createMockClient()
    } else {
      this.client = getBrowserClient()
    }
  }

  // Sign in with email magic link
  async signIn(email: string): Promise<{ error: AuthError | null }> {
    try {
      if (shouldBypassAuth()) {
        // Mock successful sign-in for development
        console.log('[DEV] Mock sign-in for:', email)
        return { error: null }
      }

      const { error } = await this.client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return {
          error: {
            code: error.code || 'sign_in_failed',
            message: error.message || 'Failed to send magic link',
            details: error
          }
        }
      }

      return { error: null }
    } catch (error: any) {
      return {
        error: {
          code: 'unexpected_error',
          message: error.message || 'Unexpected error during sign in',
          details: error
        }
      }
    }
  }

  // Handle OAuth callback
  async handleCallback(): Promise<{ session: Session | null; error: AuthError | null }> {
    try {
      if (shouldBypassAuth()) {
        // Return mock session for development
        const mockSession: Session = {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: {
            id: 'mock-user-id',
            email: 'dev@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
          } as User
        }
        return { session: mockSession, error: null }
      }

      const { data: { session }, error } = await this.client.auth.getSession()

      if (error) {
        return {
          session: null,
          error: {
            code: error.code || 'session_error',
            message: error.message || 'Failed to get session',
            details: error
          }
        }
      }

      if (session) {
        this.startSessionRefresh(session)
        this.notifySessionChange(session)
      }

      return { session, error: null }
    } catch (error: any) {
      return {
        session: null,
        error: {
          code: 'unexpected_error',
          message: error.message || 'Unexpected error during callback',
          details: error
        }
      }
    }
  }

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      if (shouldBypassAuth()) {
        console.log('[DEV] Mock sign-out')
        this.stopSessionRefresh()
        this.notifySessionChange(null)
        return { error: null }
      }

      const { error } = await this.client.auth.signOut()

      if (error) {
        return {
          error: {
            code: error.code || 'sign_out_failed',
            message: error.message || 'Failed to sign out',
            details: error
          }
        }
      }

      this.stopSessionRefresh()
      this.notifySessionChange(null)

      return { error: null }
    } catch (error: any) {
      return {
        error: {
          code: 'unexpected_error',
          message: error.message || 'Unexpected error during sign out',
          details: error
        }
      }
    }
  }

  // Get current session
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    try {
      if (shouldBypassAuth()) {
        // Check if we have a mock session in localStorage for development
        const mockSessionStr = localStorage.getItem('mock_auth_session')
        if (mockSessionStr) {
          const session = JSON.parse(mockSessionStr)
          return { session, error: null }
        }
        return { session: null, error: null }
      }

      const { data: { session }, error } = await this.client.auth.getSession()

      if (error) {
        return {
          session: null,
          error: {
            code: error.code || 'session_error',
            message: error.message || 'Failed to get session',
            details: error
          }
        }
      }

      return { session, error: null }
    } catch (error: any) {
      return {
        session: null,
        error: {
          code: 'unexpected_error',
          message: error.message || 'Unexpected error getting session',
          details: error
        }
      }
    }
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (session: Session | null) => void) {
    this.sessionChangeCallbacks.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.sessionChangeCallbacks.indexOf(callback)
      if (index > -1) {
        this.sessionChangeCallbacks.splice(index, 1)
      }
    }
  }

  // Start automatic session refresh
  private startSessionRefresh(session: Session) {
    this.stopSessionRefresh()

    const expiresAt = session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000
    const refreshTime = expiresAt - Date.now() - 300000 // Refresh 5 minutes before expiry

    if (refreshTime > 0) {
      this.refreshInterval = setTimeout(async () => {
        try {
          await this.refreshSession()
        } catch (error) {
          console.error('Failed to refresh session:', error)
        }
      }, refreshTime)
    }
  }

  // Stop session refresh
  private stopSessionRefresh() {
    if (this.refreshInterval) {
      clearTimeout(this.refreshInterval)
      this.refreshInterval = null
    }
  }

  // Refresh session
  private async refreshSession(): Promise<void> {
    if (shouldBypassAuth()) {
      return
    }

    const { data: { session }, error } = await this.client.auth.refreshSession()

    if (error) {
      console.error('Session refresh failed:', error)
      this.notifySessionChange(null)
      return
    }

    if (session) {
      this.startSessionRefresh(session)
      this.notifySessionChange(session)
    }
  }

  // Notify all callbacks of session change
  private notifySessionChange(session: Session | null) {
    this.sessionChangeCallbacks.forEach(callback => {
      try {
        callback(session)
      } catch (error) {
        console.error('Error in session change callback:', error)
      }
    })
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

// Singleton instance
export const authSessionService = new AuthSessionService()
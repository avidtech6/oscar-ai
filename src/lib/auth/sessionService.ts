// Main session service - Orchestrates all session management components

import { getBrowserClient, shouldBypassAuth, isSupabaseConfigured, createMockClient } from './client'
import type { Session } from '@supabase/supabase-js'
import type { AuthError } from './types'
import type { SessionConfig } from './sessionTypes'
import { SessionRefreshManager } from './sessionRefresh'
import { SessionCallbackManager } from './sessionCallbacks'
import { signIn, handleCallback, signOut, getSession } from './sessionOperations'

export class AuthSessionService {
  private client: any
  private refreshManager: SessionRefreshManager
  private callbackManager: SessionCallbackManager
  private isInitialized = false

  constructor(config: SessionConfig = { autoRefresh: true, refreshBufferMs: 300000 }) {
    // Use mock client if auth should be bypassed or Supabase is not configured
    if (shouldBypassAuth() || !isSupabaseConfigured()) {
      this.client = createMockClient()
    } else {
      this.client = getBrowserClient()
    }

    this.refreshManager = new SessionRefreshManager()
    this.callbackManager = new SessionCallbackManager()
  }

  // Initialize the session service
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      this.isInitialized = true
      console.log('Auth session service initialized')
    } catch (error) {
      console.error('Failed to initialize auth session service:', error)
      throw error
    }
  }

  // Sign in with email magic link
  async signIn(email: string): Promise<{ error: AuthError | null }> {
    return await signIn(email)
  }

  // Handle OAuth callback
  async handleCallback(): Promise<{ session: Session | null; error: AuthError | null }> {
    const result = await handleCallback()
    
    if (result.session) {
      this.refreshManager.start(result.session)
      this.callbackManager.notifySessionChange(result.session)
    }

    return result
  }

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    const result = await signOut()
    
    this.refreshManager.stop()
    this.callbackManager.notifySessionChange(null)

    return result
  }

  // Get current session
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    return await getSession()
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (session: Session | null) => void) {
    return this.callbackManager.addCallback(callback)
  }

  // Check if session is valid
  isSessionValid(session: Session | null): boolean {
    return this.refreshManager.isSessionValid(session)
  }

  // Get session expiry time
  getSessionExpiry(session: Session): Date {
    return this.refreshManager.getSessionExpiry(session)
  }

  // Stop session refresh
  stopSessionRefresh(): void {
    this.refreshManager.stop()
  }

  // Get number of active callbacks
  getCallbackCount(): number {
    return this.callbackManager.getCallbackCount()
  }
}

// Singleton instance
export const authSessionService = new AuthSessionService()
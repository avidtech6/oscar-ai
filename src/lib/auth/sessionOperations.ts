// Session operations - Core session management logic

import { getBrowserClient, createMockClient, shouldBypassAuth, isSupabaseConfigured } from './client'
import type { Session, User } from '@supabase/supabase-js'
import type { AuthError } from './types'

// Mock session creation for development
export function createMockSession(): Session {
  return {
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
}

// Sign in with email magic link
export async function signIn(email: string): Promise<{ error: AuthError | null }> {
  try {
    if (shouldBypassAuth()) {
      // Mock successful sign-in for development
      console.log('[DEV] Mock sign-in for:', email)
      return { error: null }
    }

    const client = getBrowserClient()
    const { error } = await client.auth.signInWithOtp({
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
export async function handleCallback(): Promise<{ session: Session | null; error: AuthError | null }> {
  try {
    if (shouldBypassAuth()) {
      // Return mock session for development
      const mockSession = createMockSession()
      return { session: mockSession, error: null }
    }

    const client = getBrowserClient()
    const { data: { session }, error } = await client.auth.getSession()

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
        message: error.message || 'Unexpected error during callback',
        details: error
      }
    }
  }
}

// Sign out
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    if (shouldBypassAuth()) {
      console.log('[DEV] Mock sign-out')
      return { error: null }
    }

    const client = getBrowserClient()
    const { error } = await client.auth.signOut()

    if (error) {
      return {
        error: {
          code: error.code || 'sign_out_failed',
          message: error.message || 'Failed to sign out',
          details: error
        }
      }
    }

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
export async function getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
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

    const client = getBrowserClient()
    const { data: { session }, error } = await client.auth.getSession()

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
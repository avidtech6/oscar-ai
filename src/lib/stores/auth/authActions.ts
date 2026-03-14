// Auth store actions
import { writable } from 'svelte/store'
import { authSessionService } from '$lib/auth/session'
import type { AuthState, PinState, BiometricState, RecoveryState } from '$lib/auth/types'
import type { Session, User } from '@supabase/supabase-js'

// Import stores (they will be passed or imported)
import { authStore, pinStore, biometricStore, recoveryStore } from './auth'

// Initial states (duplicated from auth.ts to avoid circular dependency)
const initialAuthState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isUnlocked: false,
  isLoading: true,
  error: null
}

const initialPinState: PinState = {
  isSet: false,
  isLocked: false,
  attempts: 0,
  lockedUntil: null
}

const initialBiometricState: BiometricState = {
  isAvailable: false,
  isEnrolled: false,
  isSupported: false
}

const initialRecoveryState: RecoveryState = {
  token: null,
  expiresAt: null,
  isPending: false
}

// Auth store actions
export const authActions = {
  // Initialize auth state
  async initialize(): Promise<void> {
    authStore.update(state => ({ ...state, isLoading: true }))

    try {
      // Check for existing session
      const { session, error } = await authSessionService.getSession()

      if (error) {
        authStore.update(state => ({
          ...state,
          isLoading: false,
          error: error.message
        }))
        return
      }

      if (session) {
        // Check if PIN is required (session exists but not unlocked)
        const pinRequired = await this.checkPinRequired()
        
        authStore.update(state => ({
          ...state,
          session,
          user: session.user,
          isAuthenticated: true,
          isUnlocked: !pinRequired,
          isLoading: false,
          error: null
        }))

        // Start listening for auth state changes
        this.subscribeToAuthChanges()
      } else {
        authStore.update(state => ({
          ...initialAuthState,
          isLoading: false
        }))
      }
    } catch (error: any) {
      authStore.update(state => ({
        ...state,
        isLoading: false,
        error: error.message || 'Failed to initialize auth'
      }))
    }
  },

  // Sign in with email
  async signIn(email: string): Promise<{ success: boolean; error?: string }> {
    authStore.update(state => ({ ...state, isLoading: true, error: null }))

    try {
      const { error } = await authSessionService.signIn(email)

      if (error) {
        authStore.update(state => ({
          ...state,
          isLoading: false,
          error: error.message
        }))
        return { success: false, error: error.message }
      }

      authStore.update(state => ({
        ...state,
        isLoading: false
      }))

      return { success: true }
    } catch (error: any) {
      authStore.update(state => ({
        ...state,
        isLoading: false,
        error: error.message || 'Sign in failed'
      }))
      return { success: false, error: error.message }
    }
  },

  // Handle auth callback (after magic link click)
  async handleCallback(): Promise<{ success: boolean; error?: string }> {
    authStore.update(state => ({ ...state, isLoading: true, error: null }))

    try {
      const { session, error } = await authSessionService.handleCallback()

      if (error) {
        authStore.update(state => ({
          ...state,
          isLoading: false,
          error: error.message
        }))
        return { success: false, error: error.message }
      }

      if (session) {
        // Check if PIN setup is required (first login)
        const pinSetupRequired = await this.checkPinSetupRequired(session.user)
        
        authStore.update(state => ({
          ...state,
          session,
          user: session.user,
          isAuthenticated: true,
          isUnlocked: !pinSetupRequired, // Unlocked if no PIN setup required
          isLoading: false,
          error: null
        }))

        // Start listening for auth state changes
        this.subscribeToAuthChanges()

        return { success: true }
      } else {
        authStore.update(state => ({
          ...state,
          isLoading: false,
          error: 'No session returned'
        }))
        return { success: false, error: 'No session returned' }
      }
    } catch (error: any) {
      authStore.update(state => ({
        ...state,
        isLoading: false,
        error: error.message || 'Auth callback failed'
      }))
      return { success: false, error: error.message }
    }
  },

  // Sign out
  async signOut(): Promise<{ success: boolean; error?: string }> {
    authStore.update(state => ({ ...state, isLoading: true, error: null }))

    try {
      const { error } = await authSessionService.signOut()

      if (error) {
        authStore.update(state => ({
          ...state,
          isLoading: false,
          error: error.message
        }))
        return { success: false, error: error.message }
      }

      // Reset all stores
      authStore.set(initialAuthState)
      pinStore.set(initialPinState)
      biometricStore.set(initialBiometricState)
      recoveryStore.set(initialRecoveryState)

      return { success: true }
    } catch (error: any) {
      authStore.update(state => ({
        ...state,
        isLoading: false,
        error: error.message || 'Sign out failed'
      }))
      return { success: false, error: error.message }
    }
  },

  // Unlock with PIN
  async unlockWithPin(pin: string): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement PIN validation
    // For now, mock successful unlock
    authStore.update(state => ({ ...state, isUnlocked: true }))
    pinStore.update(state => ({ ...state, attempts: 0, isLocked: false }))
    
    return { success: true }
  },

  // Unlock with biometrics
  async unlockWithBiometric(): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement biometric validation
    // For now, mock successful unlock
    authStore.update(state => ({ ...state, isUnlocked: true }))
    
    return { success: true }
  },

  // Check if PIN setup is required (first login)
  async checkPinSetupRequired(user: User): Promise<boolean> {
    // TODO: Check if user has PIN set in encrypted storage
    // For now, return true to require PIN setup
    return true
  },

  // Check if PIN is required (session exists but not unlocked)
  async checkPinRequired(): Promise<boolean> {
    // TODO: Check if PIN is set and session is locked
    // For now, return false
    return false
  },

  // Subscribe to auth state changes
  subscribeToAuthChanges(): void {
    authSessionService.onAuthStateChange((session) => {
      if (session) {
        authStore.update(state => ({
          ...state,
          session,
          user: session.user,
          isAuthenticated: true
        }))
      } else {
        // Session expired or signed out
        authStore.update(state => ({
          ...state,
          session: null,
          user: null,
          isAuthenticated: false,
          isUnlocked: false
        }))
      }
    })
  },

  // Clear error
  clearError(): void {
    authStore.update(state => ({ ...state, error: null }))
  },

  // Set loading state
  setLoading(loading: boolean): void {
    authStore.update(state => ({ ...state, isLoading: loading }))
  }
}
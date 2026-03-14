// Session management - Main entry point using refactored modules
import { authSessionService } from './sessionService'

// Export the singleton instance
export { authSessionService }

// Export convenience functions for backward compatibility
export const signIn = (email: string) => authSessionService.signIn(email)
export const handleCallback = () => authSessionService.handleCallback()
export const signOut = () => authSessionService.signOut()
export const getSession = () => authSessionService.getSession()
export const onAuthStateChange = (callback: (session: any | null) => void) => authSessionService.onAuthStateChange(callback)

// Export type definitions
export type { Session } from '@supabase/supabase-js'
export type { AuthError, EncryptionMetadata } from './types'
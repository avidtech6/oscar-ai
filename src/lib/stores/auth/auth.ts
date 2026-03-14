// Main auth store
import { writable, derived } from 'svelte/store'
import type { AuthState, PinState, BiometricState, RecoveryState } from '$lib/auth/types'
import { authActions } from './authActions'

// Initial state
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

// Create writable stores
export const authStore = writable<AuthState>(initialAuthState)
export const pinStore = writable<PinState>(initialPinState)
export const biometricStore = writable<BiometricState>(initialBiometricState)
export const recoveryStore = writable<RecoveryState>(initialRecoveryState)

// Derived stores for common queries
export const isAuthenticated = derived(authStore, $auth => $auth.isAuthenticated)
export const isUnlocked = derived(authStore, $auth => $auth.isUnlocked)
export const currentUser = derived(authStore, $auth => $auth.user)
export const isLoading = derived(authStore, $auth => $auth.isLoading)
export const authError = derived(authStore, $auth => $auth.error)

export const isPinSet = derived(pinStore, $pin => $pin.isSet)
export const isPinLocked = derived(pinStore, $pin => $pin.isLocked)
export const pinAttempts = derived(pinStore, $pin => $pin.attempts)

export const isBiometricAvailable = derived(biometricStore, $bio => $bio.isAvailable)
export const isBiometricEnrolled = derived(biometricStore, $bio => $bio.isEnrolled)

// Initialize auth on store creation
authActions.initialize()

// Export store instance for direct access
export default {
  auth: authStore,
  pin: pinStore,
  biometric: biometricStore,
  recovery: recoveryStore,
  isAuthenticated,
  isUnlocked,
  currentUser,
  isLoading,
  authError,
  isPinSet,
  isPinLocked,
  pinAttempts,
  isBiometricAvailable,
  isBiometricEnrolled,
  ...authActions
}
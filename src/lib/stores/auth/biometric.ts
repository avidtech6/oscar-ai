// Biometric store for state management
import { writable, get } from 'svelte/store'
import { browser } from '$app/environment'
import { BiometricManager, BiometricError } from '$lib/auth/biometric'
import { authStore } from './auth'
import {
  type BiometricState,
  initialBiometricState,
  BIOMETRIC_STORAGE_KEYS,
  BIOMETRIC_CONFIG
} from './biometricStoreTypes'
import { loadBiometricState, saveBiometricStateToStorage } from './biometricStoreHelpers'

// Create the store
const createBiometricStore = () => {
  const { subscribe, set, update } = writable<BiometricState>(initialBiometricState)

  // Load state from localStorage and check capabilities
  const loadState = async () => {
    if (!browser) return
    const loaded = await loadBiometricState()
    set({ ...initialBiometricState, ...loaded })
  }

  // Save state to localStorage
  const saveToStorage = (state: BiometricState) => {
    saveBiometricStateToStorage(state)
  }

  // Initialize
  loadState()

  return {
    subscribe,
    
    // Refresh state (re-check capabilities)
    async refresh(): Promise<void> {
      await loadState()
    },
    
    // Enroll biometrics
    async enroll(): Promise<void> {
      if (!browser) throw new Error('Biometric enrollment requires browser environment')
      
      const state = get({ subscribe })
      
      if (!state.isSupported) {
        throw new BiometricError('Biometrics not supported on this device', 'NOT_SUPPORTED')
      }
      
      if (!state.isAvailable) {
        throw new BiometricError('Platform authenticator not available', 'NOT_SUPPORTED')
      }
      
      if (state.isLocked) {
        throw new BiometricError('Biometrics are locked due to too many failed attempts', 'AUTHENTICATION_FAILED')
      }
      
      try {
        // Get current user ID from auth store
        const { user } = get(authStore)
        const userId = user?.id || crypto.randomUUID()
        
        // Register biometric credential
        const credential = await BiometricManager.register(userId)
        const credentialId = BiometricManager.getCredentialId(credential)
        
        // Save credential ID and mark as enrolled
        localStorage.setItem(BIOMETRIC_STORAGE_KEYS.CREDENTIAL_ID, credentialId)
        localStorage.setItem(BIOMETRIC_STORAGE_KEYS.USER_ID, userId)
        localStorage.setItem(BIOMETRIC_STORAGE_KEYS.IS_ENROLLED, 'true')
        localStorage.setItem(BIOMETRIC_STORAGE_KEYS.FAILED_ATTEMPTS, '0')
        localStorage.removeItem(BIOMETRIC_STORAGE_KEYS.LOCKED_UNTIL)
        
        update(state => ({
          ...state,
          isEnrolled: true,
          isLocked: false,
          lockedUntil: null,
          failedAttempts: 0,
          lastUsed: Date.now(),
          isEnabled: true
        }))
      } catch (error: any) {
        if (error instanceof BiometricError) {
          throw error
        }
        throw new BiometricError(`Enrollment failed: ${error.message}`, 'REGISTRATION_FAILED')
      }
    },
    
    // Authenticate with biometrics
    async authenticate(): Promise<boolean> {
      if (!browser) return false
      
      const state = get({ subscribe })
      
      if (!state.isEnrolled) {
        throw new BiometricError('Biometrics not enrolled', 'NO_CREDENTIALS')
      }
      
      if (state.isLocked && state.lockedUntil && Date.now() < state.lockedUntil) {
        throw new BiometricError('Biometrics are locked. Try again later.', 'AUTHENTICATION_FAILED')
      }
      
      try {
        const credential = await BiometricManager.authenticate()
        
        if (!credential) {
          throw new BiometricError('Authentication failed', 'AUTHENTICATION_FAILED')
        }
        
        // Reset failed attempts and update last used
        localStorage.setItem(BIOMETRIC_STORAGE_KEYS.FAILED_ATTEMPTS, '0')
        localStorage.setItem(BIOMETRIC_STORAGE_KEYS.LAST_USED, Date.now().toString())
        localStorage.removeItem(BIOMETRIC_STORAGE_KEYS.LOCKED_UNTIL)
        
        update(state => ({
          ...state,
          failedAttempts: 0,
          isLocked: false,
          lockedUntil: null,
          lastUsed: Date.now()
        }))
        
        return true
      } catch (error: any) {
        // Increment failed attempts
        const newFailedAttempts = state.failedAttempts + 1
        localStorage.setItem(BIOMETRIC_STORAGE_KEYS.FAILED_ATTEMPTS, newFailedAttempts.toString())
        
        // Check if should lock
        let lockedUntil: number | null = null
        if (newFailedAttempts >= BIOMETRIC_CONFIG.MAX_FAILED_ATTEMPTS) {
          lockedUntil = Date.now() + BIOMETRIC_CONFIG.LOCKOUT_DURATION
          localStorage.setItem(BIOMETRIC_STORAGE_KEYS.LOCKED_UNTIL, lockedUntil.toString())
        }
        
        update(state => ({
          ...state,
          failedAttempts: newFailedAttempts,
          isLocked: newFailedAttempts >= BIOMETRIC_CONFIG.MAX_FAILED_ATTEMPTS,
          lockedUntil
        }))
        
        if (error instanceof BiometricError) {
          throw error
        }
        throw new BiometricError(`Authentication failed: ${error.message}`, 'AUTHENTICATION_FAILED')
      }
    },
    
    // Remove biometric enrollment
    async remove(): Promise<void> {
      if (!browser) return
      
      try {
        // Note: WebAuthn credentials cannot be removed client-side
        // We can only clear our local storage
        Object.values(BIOMETRIC_STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key)
        })
        
        update(state => ({
          ...state,
          isEnrolled: false,
          isLocked: false,
          lockedUntil: null,
          failedAttempts: 0,
          lastUsed: null,
          isEnabled: false
        }))
      } catch (error) {
        console.error('Failed to remove biometric enrollment:', error)
        throw new BiometricError('Failed to remove biometric enrollment', 'UNKNOWN_ERROR')
      }
    },
    
    // Check if biometric authentication is required
    isAuthenticationRequired(): boolean {
      if (!browser) return false
      
      const state = get({ subscribe })
      
      if (!state.isEnrolled) return false
      if (state.isLocked) return true
      
      // Check if last authentication was recent (within session duration)
      if (state.lastUsed) {
        const sessionExpired = Date.now() - state.lastUsed > BIOMETRIC_CONFIG.SESSION_DURATION
        return sessionExpired
      }
      
      return true
    },
    
    // Get remaining attempts
    getRemainingAttempts(): number {
      const state = get({ subscribe })
      return Math.max(0, BIOMETRIC_CONFIG.MAX_FAILED_ATTEMPTS - state.failedAttempts)
    },
    
    // Get lockout time remaining in seconds
    getLockoutRemaining(): number {
      const state = get({ subscribe })
      
      if (!state.lockedUntil) return 0
      
      const remaining = state.lockedUntil - Date.now()
      return Math.max(0, Math.ceil(remaining / 1000))
    },
    
    // Reset lockout (for testing/recovery)
    resetLockout(): void {
      if (!browser) return
      
      localStorage.setItem(BIOMETRIC_STORAGE_KEYS.FAILED_ATTEMPTS, '0')
      localStorage.removeItem(BIOMETRIC_STORAGE_KEYS.LOCKED_UNTIL)
      
      update(state => ({
        ...state,
        failedAttempts: 0,
        isLocked: false,
        lockedUntil: null
      }))
    },
    
    // Get biometric icon
    getBiometricIcon(): string {
      const state = get({ subscribe })
      return BiometricManager.getBiometricIcon(state.biometricType)
    },
    
    // Get biometric label
    getBiometricLabel(): string {
      const state = get({ subscribe })
      return BiometricManager.getBiometricLabel(state.biometricType)
    },
    
    // Check if biometrics should be offered as an option
    shouldOfferBiometrics(): boolean {
      const state = get({ subscribe })
      return state.isSupported && state.isAvailable && state.isEnrolled && !state.isLocked
    },
    
    // Get session time remaining in seconds
    getSessionRemaining(): number {
      const state = get({ subscribe })
      
      if (!state.lastUsed) return 0
      
      const elapsed = Date.now() - state.lastUsed
      const remaining = BIOMETRIC_CONFIG.SESSION_DURATION - elapsed
      return Math.max(0, Math.ceil(remaining / 1000))
    },
    
    // Extend session (call after successful PIN or other auth)
    extendSession(): void {
      if (!browser) return
      
      localStorage.setItem(BIOMETRIC_STORAGE_KEYS.LAST_USED, Date.now().toString())
      
      update(state => ({
        ...state,
        lastUsed: Date.now()
      }))
    }
  }
}

export const biometricStore = createBiometricStore()

// Re-export derived stores from separate module
export {
  biometricIsSupported,
  biometricIsAvailable,
  biometricIsEnrolled,
  biometricIsLocked,
  biometricIsEnabled,
  biometricType,
  biometricIcon,
  biometricLabel,
  shouldShowBiometrics,
  shouldShowAuth
} from './biometricStoreDerived'
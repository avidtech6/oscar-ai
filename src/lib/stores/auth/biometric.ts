// Biometric store for state management
import { writable, derived, get } from 'svelte/store'
import { browser } from '$app/environment'
import { BiometricManager, BIOMETRIC_STORAGE_KEYS, BiometricError, BIOMETRIC_CONFIG } from '$lib/auth/biometric'
import { authStore } from './auth'

// Biometric state interface
export interface BiometricState {
  isSupported: boolean
  isAvailable: boolean
  isEnrolled: boolean
  isLocked: boolean
  lockedUntil: number | null
  failedAttempts: number
  lastUsed: number | null
  biometricType: 'fingerprint' | 'face' | 'iris' | 'unknown'
  isEnabled: boolean
}

// Initial state
const initialState: BiometricState = {
  isSupported: false,
  isAvailable: false,
  isEnrolled: false,
  isLocked: false,
  lockedUntil: null,
  failedAttempts: 0,
  lastUsed: null,
  biometricType: 'unknown',
  isEnabled: false
}

// Create the store
const createBiometricStore = () => {
  const { subscribe, set, update } = writable<BiometricState>(initialState)

  // Load state from localStorage and check capabilities
  const loadState = async () => {
    if (!browser) return

    try {
      // Check support and availability
      const isSupported = BiometricManager.isSupported()
      const isAvailable = isSupported ? await BiometricManager.isPlatformAuthenticatorAvailable() : false
      const biometricType = isAvailable ? await BiometricManager.getBiometricType() : 'unknown'
      
      // Load from localStorage
      const isEnrolled = localStorage.getItem(BIOMETRIC_STORAGE_KEYS.IS_ENROLLED) === 'true'
      const failedAttempts = parseInt(localStorage.getItem(BIOMETRIC_STORAGE_KEYS.FAILED_ATTEMPTS) || '0')
      const lockedUntil = localStorage.getItem(BIOMETRIC_STORAGE_KEYS.LOCKED_UNTIL)
      const lastUsed = localStorage.getItem(BIOMETRIC_STORAGE_KEYS.LAST_USED)
      
      const now = Date.now()
      const isLocked = lockedUntil ? parseInt(lockedUntil) > now : false
      const isEnabled = isEnrolled && !isLocked

      set({
        isSupported,
        isAvailable,
        isEnrolled,
        isLocked,
        lockedUntil: lockedUntil ? parseInt(lockedUntil) : null,
        failedAttempts,
        lastUsed: lastUsed ? parseInt(lastUsed) : null,
        biometricType,
        isEnabled
      })
    } catch (error) {
      console.error('Failed to load biometric state:', error)
      set({
        ...initialState,
        isSupported: false,
        isAvailable: false
      })
    }
  }

  // Save state to localStorage
  const saveToStorage = (state: BiometricState) => {
    if (!browser) return

    try {
      localStorage.setItem(BIOMETRIC_STORAGE_KEYS.IS_ENROLLED, state.isEnrolled.toString())
      localStorage.setItem(BIOMETRIC_STORAGE_KEYS.FAILED_ATTEMPTS, state.failedAttempts.toString())
      
      if (state.lockedUntil) {
        localStorage.setItem(BIOMETRIC_STORAGE_KEYS.LOCKED_UNTIL, state.lockedUntil.toString())
      } else {
        localStorage.removeItem(BIOMETRIC_STORAGE_KEYS.LOCKED_UNTIL)
      }
      
      if (state.lastUsed) {
        localStorage.setItem(BIOMETRIC_STORAGE_KEYS.LAST_USED, state.lastUsed.toString())
      } else {
        localStorage.removeItem(BIOMETRIC_STORAGE_KEYS.LAST_USED)
      }
    } catch (error) {
      console.error('Failed to save biometric state to storage:', error)
    }
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

// Derived stores
export const biometricIsSupported = derived(biometricStore, $bio => $bio.isSupported)
export const biometricIsAvailable = derived(biometricStore, $bio => $bio.isAvailable)
export const biometricIsEnrolled = derived(biometricStore, $bio => $bio.isEnrolled)
export const biometricIsLocked = derived(biometricStore, $bio => $bio.isLocked)
export const biometricIsEnabled = derived(biometricStore, $bio => $bio.isEnabled)
export const biometricType = derived(biometricStore, $bio => $bio.biometricType)
export const biometricIcon = derived(biometricStore, $bio => BiometricManager.getBiometricIcon($bio.biometricType))
export const biometricLabel = derived(biometricStore, $bio => BiometricManager.getBiometricLabel($bio.biometricType))

// Helper to check if biometrics should be shown
export const shouldShowBiometrics = derived(
  [biometricStore],
  ([$bio]) => {
    if (!browser) return false
    
    if (!$bio.isEnrolled) return false
    if ($bio.isLocked) return true
    
    // Check if last authentication was recent (within session duration)
    if ($bio.lastUsed) {
      const sessionExpired = Date.now() - $bio.lastUsed > BIOMETRIC_CONFIG.SESSION_DURATION
      return sessionExpired
    }
    
    return true
  }
)

// Combined auth requirement (PIN or biometrics)
export const shouldShowAuth = derived(
  [biometricStore],
  ([$bio]) => {
    if (!browser) return false
    
    if (!$bio.isEnrolled) return false
    if ($bio.isLocked) return true
    
    // Check if last authentication was recent (within session duration)
    if ($bio.lastUsed) {
      const sessionExpired = Date.now() - $bio.lastUsed > BIOMETRIC_CONFIG.SESSION_DURATION
      return sessionExpired
    }
    
    return true
  }
)
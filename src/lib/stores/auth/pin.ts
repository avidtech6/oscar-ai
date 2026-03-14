// PIN store for state management
import { writable, derived, get } from 'svelte/store'
import { browser } from '$app/environment'
import { PinManager, PIN_STORAGE_KEYS, PinError, PIN_LOCKOUT_CONFIG } from '$lib/auth/pin'
import type { PinState } from './pinStoreTypes'
import { initialState } from './pinStoreTypes'
import { loadPinFromStorage } from './pinStoreHelpers'

// Create the store
const createPinStore = () => {
  const { subscribe, set, update } = writable<PinState>(initialState)

  // Load initial state from localStorage
  loadPinFromStorage(set)

  return {
    subscribe,
    
    // Setup new PIN
    async setupPin(pin: string): Promise<void> {
      if (!browser) throw new Error('PIN setup requires browser environment')
      
      try {
        const { salt, hash } = await PinManager.setupPin(pin)
        
        // Save to localStorage
        localStorage.setItem(PIN_STORAGE_KEYS.SALT, salt)
        localStorage.setItem(PIN_STORAGE_KEYS.HASH, hash)
        localStorage.setItem(PIN_STORAGE_KEYS.IS_SET, 'true')
        localStorage.setItem(PIN_STORAGE_KEYS.ATTEMPTS, '0')
        localStorage.removeItem(PIN_STORAGE_KEYS.LOCKED_UNTIL)
        
        update(state => ({
          ...state,
          isSet: true,
          isLocked: false,
          attempts: 0,
          lockedUntil: null,
          requiresSetup: false
        }))
      } catch (error) {
        if (error instanceof PinError) {
          throw error
        }
        throw new PinError('Failed to setup PIN', 'SETUP_FAILED')
      }
    },

    // Validate PIN
    async validatePin(pin: string): Promise<boolean> {
      if (!browser) return false
      
      const state = get({ subscribe })
      
      // Check if locked
      if (state.isLocked && state.lockedUntil && Date.now() < state.lockedUntil) {
        throw new PinError('PIN is locked. Try again later.', 'PIN_LOCKED')
      }
      
      // Get stored hash and salt
      const storedHash = localStorage.getItem(PIN_STORAGE_KEYS.HASH)
      const storedSalt = localStorage.getItem(PIN_STORAGE_KEYS.SALT)
      
      if (!storedHash || !storedSalt) {
        throw new PinError('PIN not configured', 'VALIDATION_FAILED')
      }
      
      // Validate PIN
      const isValid = await PinManager.validatePin(pin, storedHash, storedSalt)
      
      if (isValid) {
        // Reset attempts and update last validated
        localStorage.setItem(PIN_STORAGE_KEYS.ATTEMPTS, '0')
        localStorage.setItem(PIN_STORAGE_KEYS.LAST_VALIDATED, Date.now().toString())
        localStorage.removeItem(PIN_STORAGE_KEYS.LOCKED_UNTIL)
        
        update(state => ({
          ...state,
          attempts: 0,
          isLocked: false,
          lockedUntil: null,
          lastValidated: Date.now()
        }))
        
        return true
      } else {
        // Increment attempts
        const newAttempts = state.attempts + 1
        localStorage.setItem(PIN_STORAGE_KEYS.ATTEMPTS, newAttempts.toString())
        
        // Check if should lock
        let lockedUntil: number | null = null
        if (newAttempts >= PIN_LOCKOUT_CONFIG.MAX_ATTEMPTS) {
          lockedUntil = Date.now() + PIN_LOCKOUT_CONFIG.LOCKOUT_DURATION
          localStorage.setItem(PIN_STORAGE_KEYS.LOCKED_UNTIL, lockedUntil.toString())
        }
        
        update(state => ({
          ...state,
          attempts: newAttempts,
          isLocked: newAttempts >= PIN_LOCKOUT_CONFIG.MAX_ATTEMPTS,
          lockedUntil
        }))
        
        throw new PinError(`Invalid PIN. ${PIN_LOCKOUT_CONFIG.MAX_ATTEMPTS - newAttempts} attempts remaining.`, 'INVALID_PIN')
      }
    },

    // Change PIN
    async changePin(oldPin: string, newPin: string): Promise<void> {
      if (!browser) throw new Error('PIN change requires browser environment')
      
      const storedHash = localStorage.getItem(PIN_STORAGE_KEYS.HASH)
      const storedSalt = localStorage.getItem(PIN_STORAGE_KEYS.SALT)
      
      if (!storedHash || !storedSalt) {
        throw new PinError('PIN not configured', 'VALIDATION_FAILED')
      }
      
      try {
        const { newSalt, newHash } = await PinManager.changePin(oldPin, newPin, storedHash, storedSalt)
        
        // Update storage
        localStorage.setItem(PIN_STORAGE_KEYS.SALT, newSalt)
        localStorage.setItem(PIN_STORAGE_KEYS.HASH, newHash)
        localStorage.setItem(PIN_STORAGE_KEYS.ATTEMPTS, '0')
        localStorage.removeItem(PIN_STORAGE_KEYS.LOCKED_UNTIL)
        
        update(state => ({
          ...state,
          attempts: 0,
          isLocked: false,
          lockedUntil: null
        }))
      } catch (error) {
        if (error instanceof PinError) {
          throw error
        }
        throw new PinError('Failed to change PIN', 'VALIDATION_FAILED')
      }
    },

    // Remove PIN (for testing/reset)
    removePin(): void {
      if (!browser) return
      
      Object.values(PIN_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      
      set(initialState)
    },

    // Check if PIN validation is required
    isValidationRequired(): boolean {
      if (!browser) return false
      
      const state = get({ subscribe })
      
      if (!state.isSet) return false
      if (state.isLocked) return true
      
      // Check if last validation was recent (within 5 minutes)
      if (state.lastValidated) {
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
        return state.lastValidated < fiveMinutesAgo
      }
      
      return true
    },

    // Get remaining attempts
    getRemainingAttempts(): number {
      const state = get({ subscribe })
      return Math.max(0, PIN_LOCKOUT_CONFIG.MAX_ATTEMPTS - state.attempts)
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
      
      localStorage.setItem(PIN_STORAGE_KEYS.ATTEMPTS, '0')
      localStorage.removeItem(PIN_STORAGE_KEYS.LOCKED_UNTIL)
      
      update(state => ({
        ...state,
        attempts: 0,
        isLocked: false,
        lockedUntil: null
      }))
    },

    // Generate recovery token
    generateRecoveryToken(): string {
      if (!browser) return ''
      
      const token = PinManager.generateRecoveryToken()
      localStorage.setItem(PIN_STORAGE_KEYS.RECOVERY_TOKEN, token)
      return token
    },

    // Validate recovery token
    validateRecoveryToken(token: string): boolean {
      if (!browser) return false
      
      const storedToken = localStorage.getItem(PIN_STORAGE_KEYS.RECOVERY_TOKEN)
      if (!storedToken) return false
      
      const isValid = PinManager.validateRecoveryToken(token, storedToken)
      
      if (isValid) {
        // Reset lockout on successful recovery
        this.resetLockout()
      }
      
      return isValid
    },

    // Clear recovery token
    clearRecoveryToken(): void {
      if (!browser) return
      localStorage.removeItem(PIN_STORAGE_KEYS.RECOVERY_TOKEN)
    }
  }
}

export const pinStore = createPinStore()

// Derived stores
export const pinIsSet = derived(pinStore, $pin => $pin.isSet)
export const pinIsLocked = derived(pinStore, $pin => $pin.isLocked)
export const pinAttempts = derived(pinStore, $pin => $pin.attempts)
export const pinRequiresSetup = derived(pinStore, $pin => $pin.requiresSetup)
export const pinLockoutRemaining = derived(pinStore, $pin => {
  if (!$pin.lockedUntil) return 0
  const remaining = $pin.lockedUntil - Date.now()
  return Math.max(0, Math.ceil(remaining / 1000))
})

// Helper to check if PIN should be shown
export const shouldShowPin = derived(
  [pinStore],
  ([$pin]) => {
    if (!browser) return false
    
    if (!$pin.isSet) return false
    if ($pin.isLocked) return true
    
    // Check if last validation was recent (within 5 minutes)
    if ($pin.lastValidated) {
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
      return $pin.lastValidated < fiveMinutesAgo
    }
    
    return true
  }
)
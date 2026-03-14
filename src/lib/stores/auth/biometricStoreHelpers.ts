// Helper functions for biometric store
import { browser } from '$app/environment'
import { BiometricManager } from '$lib/auth/biometric'
import { BIOMETRIC_STORAGE_KEYS, BIOMETRIC_CONFIG } from './biometricStoreTypes'
import type { BiometricState } from './biometricStoreTypes'

// Load state from localStorage and check capabilities
export async function loadBiometricState(): Promise<Partial<BiometricState>> {
  if (!browser) return {}
  
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
    
    return {
      isSupported,
      isAvailable,
      isEnrolled,
      isLocked,
      lockedUntil: lockedUntil ? parseInt(lockedUntil) : null,
      failedAttempts,
      lastUsed: lastUsed ? parseInt(lastUsed) : null,
      biometricType,
      isEnabled
    }
  } catch (error) {
    console.error('Failed to load biometric state:', error)
    return {
      isSupported: false,
      isAvailable: false
    }
  }
}

// Save state to localStorage
export function saveBiometricStateToStorage(state: BiometricState): void {
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
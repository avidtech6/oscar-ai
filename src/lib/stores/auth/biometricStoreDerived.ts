// Derived stores and helpers for biometric store
import { derived } from 'svelte/store'
import { browser } from '$app/environment'
import { BiometricManager, BIOMETRIC_CONFIG } from '$lib/auth/biometric'
import { biometricStore } from './biometric'

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
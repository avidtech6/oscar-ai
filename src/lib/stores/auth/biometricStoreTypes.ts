// Biometric store types and constants
import { BIOMETRIC_STORAGE_KEYS, BIOMETRIC_CONFIG } from '$lib/auth/biometric'

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
export const initialBiometricState: BiometricState = {
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

// Storage keys
export { BIOMETRIC_STORAGE_KEYS, BIOMETRIC_CONFIG }
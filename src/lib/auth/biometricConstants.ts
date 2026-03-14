// Biometric constants and configuration

// Local storage keys for biometric metadata
export const BIOMETRIC_STORAGE_KEYS = {
  IS_ENROLLED: 'biometric_is_enrolled',
  CREDENTIAL_ID: 'biometric_credential_id',
  USER_ID: 'biometric_user_id',
  LAST_USED: 'biometric_last_used',
  FAILED_ATTEMPTS: 'biometric_failed_attempts',
  LOCKED_UNTIL: 'biometric_locked_until'
} as const

// Biometric configuration
export const BIOMETRIC_CONFIG = {
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION: 5 * 60 * 1000, // 5 minutes
  SESSION_DURATION: 30 * 60 * 1000 // 30 minutes
} as const
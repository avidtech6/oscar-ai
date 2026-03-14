// Biometric errors

export class BiometricError extends Error {
  constructor(
    message: string,
    public code: 'NOT_SUPPORTED' | 'USER_CANCELLED' | 'REGISTRATION_FAILED' | 
                'AUTHENTICATION_FAILED' | 'ALREADY_REGISTERED' | 'NO_CREDENTIALS' |
                'VALIDATION_FAILED' | 'UNKNOWN_ERROR'
  ) {
    super(message)
    this.name = 'BiometricError'
  }
}
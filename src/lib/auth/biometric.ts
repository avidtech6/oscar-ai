// Biometric authentication manager
// Uses WebAuthn API for passwordless authentication

export class BiometricManager {
  private static readonly RP_ID = window.location.hostname
  private static readonly RP_NAME = 'Oscar AI'
  private static readonly USER_DISPLAY_NAME = 'Oscar AI User'
  
  // Check if WebAuthn is supported
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'PublicKeyCredential' in window &&
           typeof PublicKeyCredential === 'function' &&
           'isUserVerifyingPlatformAuthenticatorAvailable' in PublicKeyCredential
  }
  
  // Check if platform authenticator is available (Touch ID, Face ID, Windows Hello)
  static async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false
    
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    } catch {
      return false
    }
  }
  
  // Check if biometrics are enrolled
  static async isEnrolled(): Promise<boolean> {
    if (!this.isSupported()) return false
    
    try {
      const credentials = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          rpId: this.RP_ID,
          timeout: 1000
        }
      } as CredentialRequestOptions)
      return !!credentials
    } catch {
      return false
    }
  }
  
  // Register new biometric credential
  static async register(userId: string, userName: string = this.USER_DISPLAY_NAME): Promise<PublicKeyCredential> {
    if (!this.isSupported()) {
      throw new BiometricError('WebAuthn not supported', 'NOT_SUPPORTED')
    }
    
    // Generate a random user ID if not provided
    const userIdBuffer = new TextEncoder().encode(userId)
    
    // Generate a random challenge
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    
    // Create registration options
    const publicKey: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: this.RP_NAME,
        id: this.RP_ID
      },
      user: {
        id: userIdBuffer,
        name: userName,
        displayName: userName
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },  // ES256
        { type: 'public-key', alg: -257 } // RS256
      ],
      timeout: 60000,
      attestation: 'direct',
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Platform authenticator (Touch ID, Face ID, Windows Hello)
        userVerification: 'required',
        requireResidentKey: true,
        residentKey: 'required'
      }
    }
    
    try {
      const credential = await navigator.credentials.create({
        publicKey
      }) as PublicKeyCredential
      
      if (!credential) {
        throw new BiometricError('Failed to create credential', 'REGISTRATION_FAILED')
      }
      
      return credential
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        throw new BiometricError('Registration cancelled by user', 'USER_CANCELLED')
      } else if (error.name === 'InvalidStateError') {
        throw new BiometricError('Credential already registered', 'ALREADY_REGISTERED')
      } else {
        throw new BiometricError(`Registration failed: ${error.message}`, 'REGISTRATION_FAILED')
      }
    }
  }
  
  // Authenticate with biometrics
  static async authenticate(): Promise<PublicKeyCredential> {
    if (!this.isSupported()) {
      throw new BiometricError('WebAuthn not supported', 'NOT_SUPPORTED')
    }
    
    // Generate a random challenge
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    
    // Create authentication options
    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge,
      rpId: this.RP_ID,
      timeout: 60000,
      userVerification: 'required'
    }
    
    try {
      const credential = await navigator.credentials.get({
        publicKey
      }) as PublicKeyCredential
      
      if (!credential) {
        throw new BiometricError('Authentication failed', 'AUTHENTICATION_FAILED')
      }
      
      return credential
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        throw new BiometricError('Authentication cancelled by user', 'USER_CANCELLED')
      } else if (error.name === 'NotFoundError') {
        throw new BiometricError('No credentials found', 'NO_CREDENTIALS')
      } else {
        throw new BiometricError(`Authentication failed: ${error.message}`, 'AUTHENTICATION_FAILED')
      }
    }
  }
  
  // Get credential ID from registration
  static getCredentialId(credential: PublicKeyCredential): string {
    const arrayBuffer = credential.rawId
    const uint8Array = new Uint8Array(arrayBuffer)
    return Array.from(uint8Array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
  
  // Get attestation object
  static getAttestationObject(credential: PublicKeyCredential): ArrayBuffer {
    const response = credential.response as AuthenticatorAttestationResponse
    return response.attestationObject
  }
  
  // Get authenticator data
  static getAuthenticatorData(credential: PublicKeyCredential): ArrayBuffer {
    const response = credential.response as AuthenticatorAssertionResponse
    return response.authenticatorData
  }
  
  // Get signature
  static getSignature(credential: PublicKeyCredential): ArrayBuffer {
    const response = credential.response as AuthenticatorAssertionResponse
    return response.signature
  }
  
  // Get client data JSON
  static getClientDataJSON(credential: PublicKeyCredential): string {
    const response = credential.response as AuthenticatorAttestationResponse | AuthenticatorAssertionResponse
    return new TextDecoder().decode(response.clientDataJSON)
  }
  
  // Get user handle
  static getUserHandle(credential: PublicKeyCredential): string | null {
    const response = credential.response as AuthenticatorAssertionResponse
    if (response.userHandle) {
      return new TextDecoder().decode(response.userHandle)
    }
    return null
  }
  
  // Validate authentication response
  static async validateAuthentication(
    credential: PublicKeyCredential,
    expectedChallenge: Uint8Array
  ): Promise<boolean> {
    try {
      const clientDataJSON = this.getClientDataJSON(credential)
      const clientData = JSON.parse(clientDataJSON)
      
      // Verify challenge
      const challengeBuffer = new Uint8Array(
        atob(clientData.challenge).split('').map(c => c.charCodeAt(0))
      )
      
      // Compare challenges
      if (challengeBuffer.length !== expectedChallenge.length) {
        return false
      }
      
      for (let i = 0; i < challengeBuffer.length; i++) {
        if (challengeBuffer[i] !== expectedChallenge[i]) {
          return false
        }
      }
      
      // Verify origin
      if (clientData.origin !== window.location.origin) {
        return false
      }
      
      // Verify type
      if (clientData.type !== 'webauthn.get') {
        return false
      }
      
      return true
    } catch {
      return false
    }
  }
  
  // Remove all biometric credentials
  static async removeAllCredentials(): Promise<void> {
    if (!this.isSupported()) return
    
    try {
      // Note: There's no direct API to remove credentials in WebAuthn
      // This would typically be handled server-side
      // For client-side, we can only clear our local storage
      console.warn('WebAuthn credentials cannot be removed client-side. Use platform settings.')
    } catch (error) {
      console.error('Failed to remove credentials:', error)
    }
  }
  
  // Get biometric type (fingerprint, face, etc.)
  static async getBiometricType(): Promise<'fingerprint' | 'face' | 'iris' | 'unknown'> {
    if (!this.isSupported()) return 'unknown'
    
    try {
      // Check platform
      const platform = navigator.platform.toLowerCase()
      
      if (platform.includes('mac') || platform.includes('iphone') || platform.includes('ipad')) {
        // Check for Touch ID or Face ID
        const hasPlatformAuth = await this.isPlatformAuthenticatorAvailable()
        if (hasPlatformAuth) {
          // iOS/macOS with biometrics
          return 'fingerprint' // Could be Face ID on newer devices
        }
      } else if (platform.includes('win')) {
        // Windows Hello
        return 'fingerprint' // Could be face or iris
      } else if (platform.includes('android')) {
        // Android biometrics
        return 'fingerprint'
      }
      
      return 'unknown'
    } catch {
      return 'unknown'
    }
  }
  
  // Get biometric icon based on type
  static getBiometricIcon(type: 'fingerprint' | 'face' | 'iris' | 'unknown'): string {
    switch (type) {
      case 'fingerprint':
        return '👆'
      case 'face':
        return '👤'
      case 'iris':
        return '👁️'
      default:
        return '🔒'
    }
  }
  
  // Get biometric label based on type
  static getBiometricLabel(type: 'fingerprint' | 'face' | 'iris' | 'unknown'): string {
    switch (type) {
      case 'fingerprint':
        return 'Touch ID / Fingerprint'
      case 'face':
        return 'Face ID / Facial Recognition'
      case 'iris':
        return 'Iris Scanner'
      default:
        return 'Biometric Authentication'
    }
  }
}

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
// Biometric authentication manager
// Uses WebAuthn API for passwordless authentication

import { BiometricError } from './biometricErrors'
import { BIOMETRIC_STORAGE_KEYS, BIOMETRIC_CONFIG } from './biometricConstants'
import * as credentialHelpers from './biometricCredentialHelpers'
import * as biometricUtils from './biometricUtils'

export class BiometricManager {
  private static readonly RP_ID = window.location.hostname
  private static readonly RP_NAME = 'Oscar AI'
  private static readonly USER_DISPLAY_NAME = 'Oscar AI User'
  
  // Delegate to utility functions
  static isSupported = biometricUtils.isSupported
  static isPlatformAuthenticatorAvailable = biometricUtils.isPlatformAuthenticatorAvailable
  
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
  
  // Delegate to credential helpers
  static getCredentialId = credentialHelpers.getCredentialId
  static getAttestationObject = credentialHelpers.getAttestationObject
  static getAuthenticatorData = credentialHelpers.getAuthenticatorData
  static getSignature = credentialHelpers.getSignature
  static getClientDataJSON = credentialHelpers.getClientDataJSON
  static getUserHandle = credentialHelpers.getUserHandle
  
  // Delegate to utility functions
  static validateAuthentication = biometricUtils.validateAuthentication
  static getBiometricType = biometricUtils.getBiometricType
  static getBiometricIcon = biometricUtils.getBiometricIcon
  static getBiometricLabel = biometricUtils.getBiometricLabel
}

// Re-export constants and errors for backward compatibility
export { BiometricError, BIOMETRIC_STORAGE_KEYS, BIOMETRIC_CONFIG }
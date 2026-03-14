// Utility functions for biometric authentication

import { BiometricError } from './biometricErrors'

// Validate authentication response
export async function validateAuthentication(
  credential: PublicKeyCredential,
  expectedChallenge: Uint8Array
): Promise<boolean> {
  try {
    const clientDataJSON = getClientDataJSON(credential)
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

// Get biometric type (fingerprint, face, etc.)
export async function getBiometricType(): Promise<'fingerprint' | 'face' | 'iris' | 'unknown'> {
  // Check platform
  const platform = navigator.platform.toLowerCase()
  
  if (platform.includes('mac') || platform.includes('iphone') || platform.includes('ipad')) {
    // Check for Touch ID or Face ID
    const hasPlatformAuth = await isPlatformAuthenticatorAvailable()
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
}

// Get biometric icon based on type
export function getBiometricIcon(type: 'fingerprint' | 'face' | 'iris' | 'unknown'): string {
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
export function getBiometricLabel(type: 'fingerprint' | 'face' | 'iris' | 'unknown'): string {
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

// Check if WebAuthn is supported
export function isSupported(): boolean {
  return typeof window !== 'undefined' &&
         'PublicKeyCredential' in window &&
         typeof PublicKeyCredential === 'function' &&
         'isUserVerifyingPlatformAuthenticatorAvailable' in PublicKeyCredential
}

// Check if platform authenticator is available (Touch ID, Face ID, Windows Hello)
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isSupported()) return false
  
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

// Helper: get client data JSON (duplicate from credentialHelpers, but we can import)
import { getClientDataJSON } from './biometricCredentialHelpers'
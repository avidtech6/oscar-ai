// Helper functions for extracting data from WebAuthn credentials

// Get credential ID from registration
export function getCredentialId(credential: PublicKeyCredential): string {
  const arrayBuffer = credential.rawId
  const uint8Array = new Uint8Array(arrayBuffer)
  return Array.from(uint8Array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Get attestation object
export function getAttestationObject(credential: PublicKeyCredential): ArrayBuffer {
  const response = credential.response as AuthenticatorAttestationResponse
  return response.attestationObject
}

// Get authenticator data
export function getAuthenticatorData(credential: PublicKeyCredential): ArrayBuffer {
  const response = credential.response as AuthenticatorAssertionResponse
  return response.authenticatorData
}

// Get signature
export function getSignature(credential: PublicKeyCredential): ArrayBuffer {
  const response = credential.response as AuthenticatorAssertionResponse
  return response.signature
}

// Get client data JSON
export function getClientDataJSON(credential: PublicKeyCredential): string {
  const response = credential.response as AuthenticatorAttestationResponse | AuthenticatorAssertionResponse
  return new TextDecoder().decode(response.clientDataJSON)
}

// Get user handle
export function getUserHandle(credential: PublicKeyCredential): string | null {
  const response = credential.response as AuthenticatorAssertionResponse
  if (response.userHandle) {
    return new TextDecoder().decode(response.userHandle)
  }
  return null
}
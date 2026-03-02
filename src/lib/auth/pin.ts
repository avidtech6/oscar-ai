// PIN management with secure key derivation
// Simplified version for initial implementation

export class PinManager {
  private static readonly PBKDF2_ITERATIONS = 100000
  private static readonly SALT_LENGTH = 32

  // Validate PIN format
  static isValidPin(pin: string): boolean {
    return /^\d{4,6}$/.test(pin)
  }

  // Check if PIN is weak (common patterns)
  static isWeakPin(pin: string): boolean {
    const weakPatterns = [
      '1234', '1111', '0000', '2222', '3333', '4444', '5555',
      '6666', '7777', '8888', '9999', '1212', '1313', '2323',
      '1122', '2233', '3344', '4455', '5566', '6677', '7788',
      '8899', '9876', '123456', '654321'
    ]
    
    return weakPatterns.includes(pin)
  }

  // Get PIN strength score (0-100)
  static getPinStrength(pin: string): number {
    if (!this.isValidPin(pin)) return 0
    
    let score = 0
    
    // Length score
    score += pin.length * 10
    
    // Diversity score (unique digits)
    const uniqueDigits = new Set(pin.split('')).size
    score += uniqueDigits * 5
    
    // Pattern penalty
    if (this.isWeakPin(pin)) {
      score -= 30
    }
    
    // Sequential pattern penalty
    if (/0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210/.test(pin)) {
      score -= 20
    }
    
    // Repeated pattern penalty
    if (/(\d)\1{2,}/.test(pin)) {
      score -= 15
    }
    
    return Math.max(0, Math.min(100, score))
  }

  // Get PIN strength category
  static getPinStrengthCategory(pin: string): 'weak' | 'fair' | 'good' | 'strong' {
    const score = this.getPinStrength(pin)
    
    if (score < 40) return 'weak'
    if (score < 60) return 'fair'
    if (score < 80) return 'good'
    return 'strong'
  }

  // Hash PIN for storage (simplified - in production use proper key derivation)
  static async hashPin(pin: string, salt: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(pin + salt)
    
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch {
      // Fallback for environments without crypto
      return btoa(pin + salt)
    }
  }

  // Generate random salt
  static generateSalt(): string {
    const array = new Uint8Array(this.SALT_LENGTH)
    crypto.getRandomValues(array)
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Validate PIN against stored hash
  static async validatePin(
    enteredPin: string,
    storedHash: string,
    salt: string
  ): Promise<boolean> {
    if (!this.isValidPin(enteredPin)) {
      return false
    }

    const computedHash = await this.hashPin(enteredPin, salt)
    return computedHash === storedHash
  }

  // Setup new PIN
  static async setupPin(pin: string): Promise<{
    salt: string
    hash: string
  }> {
    if (!this.isValidPin(pin)) {
      throw new PinError('PIN must be 4-6 digits', 'INVALID_PIN')
    }

    if (this.isWeakPin(pin)) {
      throw new PinError('PIN is too weak - choose a stronger PIN', 'WEAK_PIN')
    }

    const salt = this.generateSalt()
    const hash = await this.hashPin(pin, salt)
    
    return { salt, hash }
  }

  // Change existing PIN
  static async changePin(
    oldPin: string,
    newPin: string,
    oldHash: string,
    oldSalt: string
  ): Promise<{
    newSalt: string
    newHash: string
  }> {
    // Validate old PIN first
    const isValid = await this.validatePin(oldPin, oldHash, oldSalt)
    if (!isValid) {
      throw new PinError('Invalid current PIN', 'INVALID_PIN')
    }

    // Setup new PIN
    const { salt: newSalt, hash: newHash } = await this.setupPin(newPin)
    return { newSalt, newHash }
  }

  // Generate recovery token
  static generateRecoveryToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Validate recovery token (simple comparison)
  static validateRecoveryToken(token: string, storedToken: string): boolean {
    // Constant-time comparison
    if (token.length !== storedToken.length) return false
    
    let result = 0
    for (let i = 0; i < token.length; i++) {
      result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i)
    }
    return result === 0
  }
}

// Local storage keys for PIN metadata
export const PIN_STORAGE_KEYS = {
  SALT: 'pin_salt',
  HASH: 'pin_hash',
  IS_SET: 'pin_is_set',
  ATTEMPTS: 'pin_attempts',
  LOCKED_UNTIL: 'pin_locked_until',
  LAST_VALIDATED: 'pin_last_validated',
  RECOVERY_TOKEN: 'pin_recovery_token'
} as const

// PIN validation errors
export class PinError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_PIN' | 'PIN_LOCKED' | 'WEAK_PIN' | 'SETUP_FAILED' | 'VALIDATION_FAILED'
  ) {
    super(message)
    this.name = 'PinError'
  }
}

// PIN lockout configuration
export const PIN_LOCKOUT_CONFIG = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
  WARNING_THRESHOLD: 3
} as const
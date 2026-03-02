// Auth types and interfaces
import type { Session, User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isUnlocked: boolean
  isLoading: boolean
  error: string | null
}

export interface PinState {
  isSet: boolean
  isLocked: boolean
  attempts: number
  lockedUntil: Date | null
}

export interface BiometricState {
  isAvailable: boolean
  isEnrolled: boolean
  isSupported: boolean
}

export interface RecoveryState {
  token: string | null
  expiresAt: Date | null
  isPending: boolean
}

export interface EncryptionMetadata {
  salt: Uint8Array
  keyHash: Uint8Array
  publicKey?: string // For biometrics
  createdAt: Date
  updatedAt: Date
}

export interface AuthError {
  code: string
  message: string
  details?: any
}

// Supabase database types (extend as needed)
export interface Database {
  public: {
    Tables: {
      user_encryption_metadata: {
        Row: {
          id: string
          pin_salt: string
          encryption_key_hash: string
          biometric_public_key: string | null
          recovery_token_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          pin_salt: string
          encryption_key_hash: string
          biometric_public_key?: string | null
          recovery_token_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pin_salt?: string
          encryption_key_hash?: string
          biometric_public_key?: string | null
          recovery_token_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          encrypted_data: string
          sync_version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          encrypted_data: string
          sync_version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          encrypted_data?: string
          sync_version?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
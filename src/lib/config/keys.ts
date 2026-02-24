// API keys loaded from CredentialManager
// This file provides backward compatibility for existing code while migrating to CredentialManager

import { credentialManager } from '$lib/system/CredentialManager';

// Default values for development/demo purposes (fallback if CredentialManager not ready)
const DEFAULT_SUPABASE_URL = "https://uoznborffctkpwgnghdr.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_8cCgepMSrGtTMb-kZEcuLg_eeihm7_R";

// Helper function to get values from CredentialManager with fallback
function getGroqApiKey(): string {
  try {
    if (credentialManager.isReady()) {
      return credentialManager.getGroqKey();
    }
  } catch (error) {
    console.warn('CredentialManager not ready for Groq key:', error);
  }
  return "";
}

function getSupabaseUrl(): string {
  try {
    if (credentialManager.isReady()) {
      return credentialManager.getSupabaseUrl();
    }
  } catch (error) {
    console.warn('CredentialManager not ready for Supabase URL:', error);
  }
  return DEFAULT_SUPABASE_URL;
}

function getSupabaseAnonKey(): string {
  try {
    if (credentialManager.isReady()) {
      return credentialManager.getSupabaseAnonKey();
    }
  } catch (error) {
    console.warn('CredentialManager not ready for Supabase anon key:', error);
  }
  return DEFAULT_SUPABASE_ANON_KEY;
}

// Export getter functions instead of constants
export function getGROQ_API_KEY(): string {
  return getGroqApiKey();
}

export function getSUPABASE_URL(): string {
  return getSupabaseUrl();
}

export function getSUPABASE_ANON_KEY(): string {
  return getSupabaseAnonKey();
}

// Check if we have valid credentials
export function hasValidSupabase(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return !!(url && url !== DEFAULT_SUPABASE_URL && key && key !== DEFAULT_SUPABASE_ANON_KEY);
}

export function hasValidGroq(): boolean {
  return !!getGroqApiKey();
}

// Legacy exports for backward compatibility (deprecated - use getter functions instead)
export const GROQ_API_KEY = getGroqApiKey();
export const SUPABASE_URL = getSupabaseUrl();
export const SUPABASE_ANON_KEY = getSupabaseAnonKey();
export const HAS_VALID_SUPABASE = hasValidSupabase();
export const HAS_VALID_GROQ = hasValidGroq();

// Log warnings for migration
console.log('Keys module: Using CredentialManager-based credential system');
console.log('Note: Legacy constants are deprecated. Use getter functions instead.');
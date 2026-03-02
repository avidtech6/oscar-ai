// Supabase client configuration with graceful fallback
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import type { Database } from './types'

// Get environment variables with fallbacks
const getEnvVars = () => {
  try {
    // Try to import from environment (will fail if not configured)
    const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } = import.meta.env
    return {
      url: PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
      anonKey: PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
    }
  } catch {
    // Fallback for development
    return {
      url: 'https://your-project.supabase.co',
      anonKey: 'your-anon-key'
    }
  }
}

const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = getEnvVars()

// Create browser client for client-side usage
export const createClient = () => {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}

// Create server client for server-side usage (load functions, actions)
export const createServerClientWithCookies = (cookies: any) => {
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get: (key) => cookies.get(key),
      set: (key, value, options) => {
        cookies.set(key, value, { ...options, path: '/' })
      },
      remove: (key, options) => {
        cookies.delete(key, { ...options, path: '/' })
      }
    }
  })
}

// Singleton client instance for client-side usage
let browserClient: ReturnType<typeof createClient> | null = null

export const getBrowserClient = () => {
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return SUPABASE_URL && SUPABASE_URL !== 'https://your-project.supabase.co' &&
         SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'your-anon-key'
}

// Development helper to bypass auth
export const shouldBypassAuth = () => {
  try {
    const devBypass = import.meta.env.PUBLIC_DEV_BYPASS_AUTH
    return devBypass === 'true' || devBypass === true
  } catch {
    return false
  }
}

// Mock client for development when Supabase is not configured
export const createMockClient = () => {
  return {
    auth: {
      signInWithOtp: async () => ({ error: null, data: { user: null, session: null } }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  } as any
}
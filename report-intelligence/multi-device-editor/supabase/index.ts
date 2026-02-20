// Supabase module exports for the multi-device editor
// Phase 18 - Supabase Module v1.0

// Export client module
export * from './client';
export {
  SupabaseClientWrapper,
  type SupabaseConfig,
  defaultSupabaseClient,
  supabase,
} from './client';

// Note: In a complete implementation, we would also export:
// - auth.ts: Authentication helpers
// - realtime.ts: Realtime subscription management
// - storage.ts: File storage integration
// - types.ts: Supabase-specific type definitions

// For now, we'll create placeholder exports for the planned modules
export const auth = {
  // Will be implemented in auth.ts
};

export const realtime = {
  // Will be implemented in realtime.ts
};

export const storage = {
  // Will be implemented in storage.ts
};
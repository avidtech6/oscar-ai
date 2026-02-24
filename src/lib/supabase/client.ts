import { createClient } from '@supabase/supabase-js';
import { getSUPABASE_URL, getSUPABASE_ANON_KEY } from '$lib/config/keys';

// Create a lazy-initialized supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    const url = getSUPABASE_URL();
    const anonKey = getSUPABASE_ANON_KEY();
    
    if (!url || !anonKey) {
      console.warn('Supabase credentials not configured. Some features may be limited.');
      // Return a dummy client that will fail gracefully
      supabaseInstance = createClient('https://dummy.supabase.co', 'dummy-key');
    } else {
      supabaseInstance = createClient(url, anonKey);
    }
  }
  return supabaseInstance;
}

// Export the getter function
export const supabase = getSupabaseClient();

// Helper function to get the current user's ID
export async function getCurrentUserId(): Promise<string | null> {
	const { data: { user } } = await supabase.auth.getUser();
	return user?.id || null;
}

// Helper function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
	const { data: { user } } = await supabase.auth.getUser();
	return !!user;
}

// Helper function to sign in
export async function signIn(email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	});
	return { data, error };
}

// Helper function to sign out
export async function signOut() {
	const { error } = await supabase.auth.signOut();
	return { error };
}

// Helper function to sign up
export async function signUp(email: string, password: string) {
	const { data, error } = await supabase.auth.signUp({
		email,
		password
	});
	return { data, error };
}

// Helper to reset the client (for testing or credential updates)
export function resetSupabaseClient() {
  supabaseInstance = null;
}
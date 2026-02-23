import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$lib/config/keys';

// Create a single supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
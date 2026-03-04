/**
 * Auth Manager (Phase 18)
 * 
 * Minimal placeholder for Supabase authentication manager.
 */

import type { UserAccount } from '../types/UserAccount';

export interface AuthManager {
	/** Sign in with email/password */
	signIn(email: string, password: string): Promise<UserAccount | null>;
	/** Sign up new user */
	signUp(email: string, password: string): Promise<UserAccount | null>;
	/** Sign out */
	signOut(): Promise<void>;
	/** Get current user */
	getCurrentUser(): UserAccount | null;
	/** Check if user is authenticated */
	isAuthenticated(): boolean;
	/** Reset password */
	resetPassword(email: string): Promise<void>;
}

export class DefaultAuthManager implements AuthManager {
	private currentUser: UserAccount | null = null;

	async signIn(email: string, password: string): Promise<UserAccount | null> {
		console.log('AuthManager signIn:', email, password ? '***' : '');
		this.currentUser = {
			id: `user-${Date.now()}`,
			email,
			displayName: email.split('@')[0],
			createdAt: new Date(),
			updatedAt: new Date(),
			roles: ['user']
		};
		return this.currentUser;
	}

	async signUp(email: string, password: string): Promise<UserAccount | null> {
		console.log('AuthManager signUp:', email, password ? '***' : '');
		this.currentUser = {
			id: `user-${Date.now()}`,
			email,
			displayName: email.split('@')[0],
			createdAt: new Date(),
			updatedAt: new Date(),
			roles: ['user']
		};
		return this.currentUser;
	}

	async signOut(): Promise<void> {
		console.log('AuthManager signOut');
		this.currentUser = null;
	}

	getCurrentUser(): UserAccount | null {
		return this.currentUser;
	}

	isAuthenticated(): boolean {
		return this.currentUser !== null;
	}

	async resetPassword(email: string): Promise<void> {
		console.log('AuthManager resetPassword:', email);
	}
}

export default DefaultAuthManager;
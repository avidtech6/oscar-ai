/**
 * User Account Type (Phase 18)
 * 
 * Minimal interface for user account data.
 */

export interface UserAccount {
	id: string;
	email: string;
	displayName?: string;
	avatarUrl?: string;
	createdAt: Date;
	updatedAt: Date;
	roles: string[];
	metadata?: Record<string, unknown>;
}

export function createUserAccount(
	email: string,
	options?: Partial<UserAccount>
): UserAccount {
	const now = new Date();
	return {
		id: `user-${Date.now()}`,
		email,
		displayName: email.split('@')[0],
		avatarUrl: '',
		createdAt: now,
		updatedAt: now,
		roles: ['user'],
		metadata: {},
		...options
	};
}
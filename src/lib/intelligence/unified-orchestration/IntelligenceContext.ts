/**
 * IntelligenceContext – immutable context for intelligence tasks.
 *
 * Responsibilities:
 * - Hold immutable context data (user, environment, permissions)
 * - Provide scoped sub‑contexts
 * - No mutation after creation
 * - No side effects
 *
 * FreshVibe Rules:
 * - Single responsibility (context only)
 * - Immutable data
 * - No external dependencies
 */

export interface UserIdentity {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'editor' | 'viewer';
}

export interface Environment {
	mode: 'development' | 'production' | 'testing';
	locale: string;
	timezone: string;
}

export interface Permissions {
	canEdit: boolean;
	canDelete: boolean;
	canShare: boolean;
	canExport: boolean;
}

export interface IntelligenceContextData {
	user: UserIdentity;
	environment: Environment;
	permissions: Permissions;
	timestamp: number;
	sessionId: string;
}

/**
 * IntelligenceContext – immutable context container.
 */
export class IntelligenceContext {
	private readonly data: IntelligenceContextData;

	constructor(data: IntelligenceContextData) {
		this.data = Object.freeze({ ...data });
	}

	/**
	 * Get the underlying data (read‑only).
	 */
	getData(): Readonly<IntelligenceContextData> {
		return this.data;
	}

	/**
	 * Create a derived context with overrides.
	 */
	derive(overrides: Partial<IntelligenceContextData>): IntelligenceContext {
		const newData = {
			...this.data,
			...overrides,
			timestamp: Date.now(), // always update timestamp on derivation
		};
		return new IntelligenceContext(newData);
	}

	/**
	 * Create a sub‑context for a specific capability.
	 */
	scopeToCapability(capabilityId: string): IntelligenceContext {
		return this.derive({
			sessionId: `${this.data.sessionId}::${capabilityId}`,
		});
	}

	/**
	 * Check if a permission is granted.
	 */
	hasPermission(permission: keyof Permissions): boolean {
		return this.data.permissions[permission];
	}

	/**
	 * Get user role.
	 */
	getUserRole(): string {
		return this.data.user.role;
	}

	/**
	 * Get environment mode.
	 */
	getMode(): string {
		return this.data.environment.mode;
	}

	/**
	 * Check if the context is stale (older than threshold).
	 */
	isStale(thresholdMs: number = 300_000): boolean {
		return Date.now() - this.data.timestamp > thresholdMs;
	}

	/**
	 * Create a default context for testing.
	 */
	static createDefault(): IntelligenceContext {
		return new IntelligenceContext({
			user: {
				id: 'default-user',
				name: 'Default User',
				email: 'user@example.com',
				role: 'viewer',
			},
			environment: {
				mode: 'development',
				locale: 'en-GB',
				timezone: 'UTC',
			},
			permissions: {
				canEdit: false,
				canDelete: false,
				canShare: false,
				canExport: false,
			},
			timestamp: Date.now(),
			sessionId: `session_${Date.now()}`,
		});
	}
}
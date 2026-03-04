/**
 * RuntimeGuards – enforce runtime constraints and safety limits.
 *
 * Responsibilities:
 * - Validate inputs, outputs, and state before operations
 * - Enforce rate limits, timeouts, and resource bounds
 * - Provide guardrails for safe execution
 * - No side effects, no external dependencies
 *
 * FreshVibe Rules:
 * - Single responsibility (guards only)
 * - Deterministic validation
 * - Max 80 lines per function
 */

export interface GuardRule {
	id: string;
	condition: () => boolean;
	message: string;
	severity: 'warning' | 'error' | 'fatal';
}

export interface RateLimit {
	calls: number;
	windowMs: number;
}

export interface ResourceBounds {
	maxMemoryMb?: number;
	maxTimeMs?: number;
	maxConcurrent?: number;
}

/**
 * RuntimeGuards – collection of safety guards.
 */
export class RuntimeGuards {
	private rules: GuardRule[] = [];
	private rateLimits: Map<string, { limit: RateLimit; calls: number[] }> = new Map();
	private resourceBounds: Map<string, ResourceBounds> = new Map();

	/**
	 * Add a guard rule.
	 */
	addRule(rule: GuardRule): void {
		this.rules.push(rule);
	}

	/**
	 * Remove a guard rule by ID.
	 */
	removeRule(id: string): void {
		this.rules = this.rules.filter((r) => r.id !== id);
	}

	/**
	 * Evaluate all guard rules.
	 */
	evaluate(): { passed: boolean; failures: GuardRule[] } {
		const failures: GuardRule[] = [];

		for (const rule of this.rules) {
			try {
				if (!rule.condition()) {
					failures.push(rule);
				}
			} catch (err) {
				// If condition throws, treat as failure
				failures.push({
					...rule,
					message: `${rule.message} (condition threw: ${err})`,
				});
			}
		}

		return {
			passed: failures.length === 0,
			failures,
		};
	}

	/**
	 * Set a rate limit for a key.
	 */
	setRateLimit(key: string, limit: RateLimit): void {
		this.rateLimits.set(key, { limit, calls: [] });
	}

	/**
	 * Check if a rate‑limited call is allowed.
	 */
	checkRateLimit(key: string): { allowed: boolean; remaining: number; resetInMs: number } {
		const record = this.rateLimits.get(key);
		if (!record) {
			return { allowed: true, remaining: Infinity, resetInMs: 0 };
		}

		const now = Date.now();
		const windowStart = now - record.limit.windowMs;

		// Remove calls outside the window
		record.calls = record.calls.filter((t) => t > windowStart);

		const used = record.calls.length;
		const remaining = Math.max(0, record.limit.calls - used);
		const allowed = used < record.limit.calls;

		if (allowed) {
			record.calls.push(now);
		}

		// Calculate reset time
		const oldestCall = record.calls[0];
		const resetInMs = oldestCall ? Math.max(0, oldestCall + record.limit.windowMs - now) : 0;

		return { allowed, remaining, resetInMs };
	}

	/**
	 * Set resource bounds for a component.
	 */
	setResourceBounds(component: string, bounds: ResourceBounds): void {
		this.resourceBounds.set(component, bounds);
	}

	/**
	 * Validate resource usage against bounds.
	 */
	validateResources(component: string, usage: {
		memoryMb?: number;
		timeMs?: number;
		concurrent?: number;
	}): { valid: boolean; violations: string[] } {
		const bounds = this.resourceBounds.get(component);
		if (!bounds) {
			return { valid: true, violations: [] };
		}

		const violations: string[] = [];

		if (bounds.maxMemoryMb !== undefined && usage.memoryMb !== undefined && usage.memoryMb > bounds.maxMemoryMb) {
			violations.push(`Memory ${usage.memoryMb}MB exceeds limit ${bounds.maxMemoryMb}MB`);
		}

		if (bounds.maxTimeMs !== undefined && usage.timeMs !== undefined && usage.timeMs > bounds.maxTimeMs) {
			violations.push(`Time ${usage.timeMs}ms exceeds limit ${bounds.maxTimeMs}ms`);
		}

		if (bounds.maxConcurrent !== undefined && usage.concurrent !== undefined && usage.concurrent > bounds.maxConcurrent) {
			violations.push(`Concurrent ${usage.concurrent} exceeds limit ${bounds.maxConcurrent}`);
		}

		return {
			valid: violations.length === 0,
			violations,
		};
	}

	/**
	 * Create a default set of guard rules.
	 */
	static createDefaultGuards(): RuntimeGuards {
		const guards = new RuntimeGuards();

		// Environment guards
		guards.addRule({
			id: 'env_not_production',
			condition: () => process.env.NODE_ENV !== 'production',
			message: 'Running in non‑production environment',
			severity: 'warning',
		});

		// Platform guards
		guards.addRule({
			id: 'platform_supported',
			condition: () => typeof window !== 'undefined' || typeof global !== 'undefined',
			message: 'Platform must be browser or Node.js',
			severity: 'error',
		});

		// Time guard
		guards.addRule({
			id: 'system_time_sane',
			condition: () => Date.now() > 1_600_000_000_000, // after 2020‑09‑13
			message: 'System time appears incorrect',
			severity: 'warning',
		});

		return guards;
	}
}
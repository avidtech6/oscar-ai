/**
 * Rate Limiter
 * 
 * Implements rate limiting for email sending to avoid overwhelming SMTP servers
 * and staying within provider limits.
 */

export interface RateLimitConfig {
	/** Maximum number of requests per window */
	maxRequests: number;
	/** Time window in milliseconds */
	windowMs: number;
	/** Whether to delay requests when limit is reached (vs reject) */
	delayExcess: boolean;
	/** Maximum delay for excess requests (ms) */
	maxDelayMs?: number;
}

export interface RateLimitState {
	/** Timestamps of recent requests */
	requests: number[];
	/** Current request count in window */
	count: number;
	/** When the current window ends */
	windowEnd: number;
}

export class RateLimiter {
	private config: RateLimitConfig;
	private state: RateLimitState;
	
	constructor(config: Partial<RateLimitConfig> = {}) {
		this.config = {
			maxRequests: config.maxRequests || 100,
			windowMs: config.windowMs || 60 * 1000, // 1 minute default
			delayExcess: config.delayExcess !== undefined ? config.delayExcess : true,
			maxDelayMs: config.maxDelayMs || 30 * 1000 // 30 seconds max delay
		};
		
		this.state = {
			requests: [],
			count: 0,
			windowEnd: Date.now() + this.config.windowMs
		};
	}
	
	/**
	 * Check if a request is allowed, and optionally wait if needed
	 */
	async checkLimit(): Promise<{
		allowed: boolean;
		delayMs?: number;
		remaining: number;
		resetAfter: number;
	}> {
		const now = Date.now();
		
		// Clean up old requests outside the window
		this.cleanupOldRequests(now);
		
		// Check if we're in a new window
		if (now >= this.state.windowEnd) {
			this.resetWindow(now);
		}
		
		const remaining = this.config.maxRequests - this.state.count;
		const resetAfter = this.state.windowEnd - now;
		
		if (remaining > 0) {
			// Request allowed immediately
			this.state.requests.push(now);
			this.state.count++;
			
			return {
				allowed: true,
				remaining: remaining - 1,
				resetAfter
			};
		}
		
		// No remaining capacity in current window
		if (!this.config.delayExcess) {
			// Reject immediately
			return {
				allowed: false,
				remaining: 0,
				resetAfter
			};
		}
		
		// Calculate delay until next available slot
		const oldestRequest = this.state.requests[0];
		const delayNeeded = oldestRequest + this.config.windowMs - now;
		
		// Cap the delay
		const delayMs = Math.min(delayNeeded, this.config.maxDelayMs || Infinity);
		
		if (delayMs <= 0) {
			// Shouldn't happen, but handle it
			this.state.requests.push(now);
			this.state.count++;
			
			return {
				allowed: true,
				delayMs: 0,
				remaining: this.config.maxRequests - this.state.count,
				resetAfter: this.state.windowEnd - now
			};
		}
		
		return {
			allowed: true,
			delayMs,
			remaining: 0,
			resetAfter: delayMs
		};
	}
	
	/**
	 * Wait for rate limit if needed, then proceed
	 */
	async waitIfNeeded(): Promise<void> {
		const result = await this.checkLimit();
		
		if (result.allowed && result.delayMs && result.delayMs > 0) {
			await this.delay(result.delayMs);
			
			// After delay, we need to check again since state may have changed
			// For simplicity, we'll just record the request now
			const now = Date.now();
			this.cleanupOldRequests(now);
			
			if (now >= this.state.windowEnd) {
				this.resetWindow(now);
			}
			
			this.state.requests.push(now);
			this.state.count++;
		}
	}
	
	/**
	 * Record a request (for manual tracking)
	 */
	recordRequest(): void {
		const now = Date.now();
		this.cleanupOldRequests(now);
		
		if (now >= this.state.windowEnd) {
			this.resetWindow(now);
		}
		
		this.state.requests.push(now);
		this.state.count++;
	}
	
	/**
	 * Get current rate limit status
	 */
	getStatus(): {
		remaining: number;
		resetAfter: number;
		limit: number;
		used: number;
	} {
		const now = Date.now();
		this.cleanupOldRequests(now);
		
		if (now >= this.state.windowEnd) {
			this.resetWindow(now);
		}
		
		return {
			remaining: this.config.maxRequests - this.state.count,
			resetAfter: this.state.windowEnd - now,
			limit: this.config.maxRequests,
			used: this.state.count
		};
	}
	
	/**
	 * Reset the rate limiter
	 */
	reset(): void {
		const now = Date.now();
		this.resetWindow(now);
	}
	
	/**
	 * Clean up old requests outside the current window
	 */
	private cleanupOldRequests(now: number): void {
		const cutoff = now - this.config.windowMs;
		
		// Remove requests older than cutoff
		const validRequests = this.state.requests.filter(timestamp => timestamp > cutoff);
		this.state.requests = validRequests;
		this.state.count = validRequests.length;
	}
	
	/**
	 * Reset to a new window starting at the given time
	 */
	private resetWindow(now: number): void {
		this.state.requests = [];
		this.state.count = 0;
		this.state.windowEnd = now + this.config.windowMs;
	}
	
	/**
	 * Delay for specified milliseconds
	 */
	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

/**
 * Provider-specific rate limit configurations
 */
export const PROVIDER_RATE_LIMITS: Record<string, RateLimitConfig> = {
	// Personal email providers (anti-spam limits)
	'gmail': {
		maxRequests: 500, // Gmail's daily limit is 500, but we limit per hour
		windowMs: 60 * 60 * 1000, // 1 hour
		delayExcess: true,
		maxDelayMs: 30 * 60 * 1000 // 30 minutes max delay
	},
	
	'outlook': {
		maxRequests: 300,
		windowMs: 60 * 60 * 1000, // 1 hour
		delayExcess: true,
		maxDelayMs: 30 * 60 * 1000
	},
	
	// Transactional providers (API limits)
	'brevo': {
		maxRequests: 300, // Free tier: 300/day
		windowMs: 24 * 60 * 60 * 1000, // 24 hours
		delayExcess: true,
		maxDelayMs: 60 * 60 * 1000 // 1 hour max delay
	},
	
	'sendgrid': {
		maxRequests: 100, // Free tier: 100/day
		windowMs: 24 * 60 * 60 * 1000, // 24 hours
		delayExcess: true,
		maxDelayMs: 60 * 60 * 1000
	},
	
	'mailgun': {
		maxRequests: 300, // Free tier: 300/day
		windowMs: 24 * 60 * 60 * 1000, // 24 hours
		delayExcess: true,
		maxDelayMs: 60 * 60 * 1000
	},
	
	'postmark': {
		maxRequests: 100, // Trial: 100 total
		windowMs: 24 * 60 * 60 * 1000, // 24 hours
		delayExcess: true,
		maxDelayMs: 60 * 60 * 1000
	},
	
	'ses': {
		maxRequests: 200, // Sandbox: 200/day
		windowMs: 24 * 60 * 60 * 1000, // 24 hours
		delayExcess: true,
		maxDelayMs: 60 * 60 * 1000
	},
	
	// Default for unknown/custom providers
	'default': {
		maxRequests: 100,
		windowMs: 60 * 60 * 1000, // 1 hour
		delayExcess: true,
		maxDelayMs: 30 * 60 * 1000
	}
};

/**
 * Get rate limit configuration for a provider
 */
export function getRateLimitConfig(providerId: string): RateLimitConfig {
	return PROVIDER_RATE_LIMITS[providerId.toLowerCase()] || PROVIDER_RATE_LIMITS.default;
}

/**
 * Create a rate limiter for a provider
 */
export function createProviderRateLimiter(providerId: string): RateLimiter {
	const config = getRateLimitConfig(providerId);
	return new RateLimiter(config);
}

/**
 * Multi-level rate limiter for different priority emails
 */
export class PriorityRateLimiter {
	private limiters: Map<string, RateLimiter>;
	
	constructor() {
		this.limiters = new Map();
		
		// Create limiters for different priorities
		this.limiters.set('high', new RateLimiter({ maxRequests: 50, windowMs: 60 * 1000 })); // 50/min
		this.limiters.set('normal', new RateLimiter({ maxRequests: 20, windowMs: 60 * 1000 })); // 20/min
		this.limiters.set('low', new RateLimiter({ maxRequests: 10, windowMs: 60 * 1000 })); // 10/min
		this.limiters.set('bulk', new RateLimiter({ maxRequests: 5, windowMs: 60 * 1000 })); // 5/min
	}
	
	/**
	 * Check limit for a priority level
	 */
	async checkLimit(priority: 'high' | 'normal' | 'low' | 'bulk' = 'normal'): Promise<{
		allowed: boolean;
		delayMs?: number;
		limiter: RateLimiter;
	}> {
		const limiter = this.limiters.get(priority) || this.limiters.get('normal')!;
		const result = await limiter.checkLimit();
		
		return {
			allowed: result.allowed,
			delayMs: result.delayMs,
			limiter
		};
	}
	
	/**
	 * Wait for rate limit if needed for a priority level
	 */
	async waitIfNeeded(priority: 'high' | 'normal' | 'low' | 'bulk' = 'normal'): Promise<void> {
		const limiter = this.limiters.get(priority) || this.limiters.get('normal')!;
		await limiter.waitIfNeeded();
	}
	
	/**
	 * Get status for all priority levels
	 */
	getAllStatus(): Record<string, ReturnType<RateLimiter['getStatus']>> {
		const status: Record<string, ReturnType<RateLimiter['getStatus']>> = {};
		
		for (const [priority, limiter] of this.limiters.entries()) {
			status[priority] = limiter.getStatus();
		}
		
		return status;
	}
	
	/**
	 * Reset all limiters
	 */
	resetAll(): void {
		for (const limiter of this.limiters.values()) {
			limiter.reset();
		}
	}
}

/**
 * Concurrency limiter for controlling parallel email sends
 */
export class ConcurrencyLimiter {
	private maxConcurrent: number;
	private current: number;
	private queue: Array<() => void>;
	
	constructor(maxConcurrent: number = 5) {
		this.maxConcurrent = maxConcurrent;
		this.current = 0;
		this.queue = [];
	}
	
	/**
	 * Acquire a slot for concurrent operation
	 */
	async acquire(): Promise<() => void> {
		if (this.current < this.maxConcurrent) {
			this.current++;
			return () => this.release();
		}
		
		// Wait for a slot to become available
		return new Promise(resolve => {
			this.queue.push(() => {
				this.current++;
				resolve(() => this.release());
			});
		});
	}
	
	/**
	 * Release a slot
	 */
	private release(): void {
		this.current--;
		
		// If there are queued requests and we have capacity, resolve the next one
		if (this.queue.length > 0 && this.current < this.maxConcurrent) {
			const next = this.queue.shift();
			if (next) {
				next();
			}
		}
	}
	
	/**
	 * Get current concurrency status
	 */
	getStatus(): {
		current: number;
		max: number;
		queued: number;
		available: number;
	} {
		return {
			current: this.current,
			max: this.maxConcurrent,
			queued: this.queue.length,
			available: Math.max(0, this.maxConcurrent - this.current)
		};
	}
	
	/**
	 * Run a function with concurrency control
	 */
	async run<T>(fn: () => Promise<T>): Promise<T> {
		const release = await this.acquire();
		
		try {
			return await fn();
		} finally {
			release();
		}
	}
}

/**
 * Combined rate and concurrency limiter for email sending
 */
export class EmailSendLimiter {
	private rateLimiter: RateLimiter;
	private concurrencyLimiter: ConcurrencyLimiter;
	private providerId: string;
	
	constructor(providerId: string, maxConcurrent: number = 3) {
		this.providerId = providerId;
		this.rateLimiter = createProviderRateLimiter(providerId);
		this.concurrencyLimiter = new ConcurrencyLimiter(maxConcurrent);
	}
	
	/**
	 * Send email with rate and concurrency limiting
	 */
	async send<T>(sendFn: () => Promise<T>): Promise<T> {
		// Wait for rate limit
		await this.rateLimiter.waitIfNeeded();
		
		// Wait for concurrency slot
		return this.concurrencyLimiter.run(sendFn);
	}
	
	/**
	 * Get current status
	 */
	getStatus(): {
		provider: string;
		rate: ReturnType<RateLimiter['getStatus']>;
		concurrency: ReturnType<ConcurrencyLimiter['getStatus']>;
	} {
		return {
			provider: this.providerId,
			rate: this.rateLimiter.getStatus(),
			concurrency: this.concurrencyLimiter.getStatus()
		};
	}
	
	/**
	 * Reset both limiters
	 */
	reset(): void {
		this.rateLimiter.reset();
		// Note: ConcurrencyLimiter doesn't have a reset method
		// We'll create a new one
		this.concurrencyLimiter = new ConcurrencyLimiter(this.concurrencyLimiter.getStatus().max);
	}
}
/**
 * API Rate Limiting and Safety Guardrails
 * Protects communication APIs from abuse and ensures fair usage
 */

interface RateLimitConfig {
	maxRequests: number;
	windowMs: number; // Time window in milliseconds
}

interface RateLimitBucket {
	count: number;
	resetTime: number;
}

// Default rate limits for different API categories
const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
	// Email API limits
	email_send: { maxRequests: 100, windowMs: 60 * 60 * 1000 }, // 100 emails per hour
	email_fetch: { maxRequests: 1000, windowMs: 60 * 60 * 1000 }, // 1000 fetches per hour
	
	// Campaign API limits
	campaign_create: { maxRequests: 50, windowMs: 24 * 60 * 60 * 1000 }, // 50 campaigns per day
	campaign_send: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 campaign sends per hour
	
	// Calendar API limits
	calendar_event_create: { maxRequests: 500, windowMs: 24 * 60 * 60 * 1000 }, // 500 events per day
	calendar_event_fetch: { maxRequests: 5000, windowMs: 60 * 60 * 1000 }, // 5000 fetches per hour
	
	// Notifications API limits
	notification_send: { maxRequests: 1000, windowMs: 60 * 60 * 1000 }, // 1000 notifications per hour
	
	// AppFlowy API limits
	appflowy_document_create: { maxRequests: 100, windowMs: 60 * 60 * 1000 }, // 100 documents per hour
	appflowy_document_update: { maxRequests: 1000, windowMs: 60 * 60 * 1000 }, // 1000 updates per hour
};

// In-memory rate limit store (in production, use Redis or database)
const rateLimitStore = new Map<string, RateLimitBucket>();

/**
 * Check if a request is allowed based on rate limits
 * @param userId User identifier
 * @param endpoint API endpoint identifier
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(userId: string, endpoint: string): {
	allowed: boolean;
	remaining: number;
	resetTime: number;
	limit: number;
} {
	const config = DEFAULT_RATE_LIMITS[endpoint] || { maxRequests: 100, windowMs: 60 * 60 * 1000 };
	const key = `${userId}:${endpoint}`;
	const now = Date.now();
	
	let bucket = rateLimitStore.get(key);
	
	// Create new bucket if none exists or if window has expired
	if (!bucket || now >= bucket.resetTime) {
		bucket = {
			count: 0,
			resetTime: now + config.windowMs
		};
		rateLimitStore.set(key, bucket);
	}
	
	// Check if limit exceeded
	const remaining = Math.max(0, config.maxRequests - bucket.count);
	const allowed = bucket.count < config.maxRequests;
	
	if (allowed) {
		bucket.count++;
	}
	
	return {
		allowed,
		remaining,
		resetTime: bucket.resetTime,
		limit: config.maxRequests
	};
}

/**
 * Get current rate limit status for a user and endpoint
 */
export function getRateLimitStatus(userId: string, endpoint: string): {
	used: number;
	remaining: number;
	resetTime: number;
	limit: number;
} {
	const config = DEFAULT_RATE_LIMITS[endpoint] || { maxRequests: 100, windowMs: 60 * 60 * 1000 };
	const key = `${userId}:${endpoint}`;
	const now = Date.now();
	
	const bucket = rateLimitStore.get(key);
	
	if (!bucket || now >= bucket.resetTime) {
		return {
			used: 0,
			remaining: config.maxRequests,
			resetTime: now + config.windowMs,
			limit: config.maxRequests
		};
	}
	
	return {
		used: bucket.count,
		remaining: Math.max(0, config.maxRequests - bucket.count),
		resetTime: bucket.resetTime,
		limit: config.maxRequests
	};
}

/**
 * Reset rate limit for a user and endpoint
 */
export function resetRateLimit(userId: string, endpoint: string): boolean {
	const key = `${userId}:${endpoint}`;
	return rateLimitStore.delete(key);
}

/**
 * Safety guardrails for API requests
 */
export class SafetyGuardrails {
	/**
	 * Validate email sending parameters
	 */
	static validateEmailSend(params: {
		to: string[];
		subject: string;
		body: string;
		attachments?: File[];
	}): { valid: boolean; error?: string } {
		// Check recipient count
		if (params.to.length > 100) {
			return { valid: false, error: 'Cannot send to more than 100 recipients at once' };
		}
		
		// Validate email addresses
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		for (const email of params.to) {
			if (!emailRegex.test(email)) {
				return { valid: false, error: `Invalid email address: ${email}` };
			}
		}
		
		// Check subject length
		if (params.subject.length > 200) {
			return { valid: false, error: 'Subject must be 200 characters or less' };
		}
		
		// Check body size (rough estimate)
		const bodySize = new Blob([params.body]).size;
		if (bodySize > 10 * 1024 * 1024) { // 10MB
			return { valid: false, error: 'Email body too large (max 10MB)' };
		}
		
		// Check attachments
		if (params.attachments) {
			const totalSize = params.attachments.reduce((sum, file) => sum + file.size, 0);
			if (totalSize > 25 * 1024 * 1024) { // 25MB
				return { valid: false, error: 'Total attachment size exceeds 25MB limit' };
			}
			
			if (params.attachments.length > 10) {
				return { valid: false, error: 'Cannot attach more than 10 files' };
			}
		}
		
		return { valid: true };
	}
	
	/**
	 * Validate campaign creation parameters
	 */
	static validateCampaignCreate(params: {
		name: string;
		recipientCount: number;
		scheduleDate?: Date;
	}): { valid: boolean; error?: string } {
		// Check campaign name
		if (!params.name.trim()) {
			return { valid: false, error: 'Campaign name is required' };
		}
		
		if (params.name.length > 100) {
			return { valid: false, error: 'Campaign name must be 100 characters or less' };
		}
		
		// Check recipient count
		if (params.recipientCount > 10000) {
			return { valid: false, error: 'Cannot create campaign with more than 10,000 recipients' };
		}
		
		if (params.recipientCount < 1) {
			return { valid: false, error: 'Campaign must have at least 1 recipient' };
		}
		
		// Check schedule date (if provided)
		if (params.scheduleDate) {
			const now = new Date();
			const minDate = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
			const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
			
			if (params.scheduleDate < minDate) {
				return { valid: false, error: 'Campaign must be scheduled at least 5 minutes in advance' };
			}
			
			if (params.scheduleDate > maxDate) {
				return { valid: false, error: 'Campaign cannot be scheduled more than 30 days in advance' };
			}
		}
		
		return { valid: true };
	}
	
	/**
	 * Validate calendar event parameters
	 */
	static validateCalendarEvent(params: {
		title: string;
		startTime: Date;
		endTime: Date;
		attendees?: string[];
	}): { valid: boolean; error?: string } {
		// Check title
		if (!params.title.trim()) {
			return { valid: false, error: 'Event title is required' };
		}
		
		if (params.title.length > 200) {
			return { valid: false, error: 'Event title must be 200 characters or less' };
		}
		
		// Check time validity
		if (params.startTime >= params.endTime) {
			return { valid: false, error: 'Event end time must be after start time' };
		}
		
		const duration = params.endTime.getTime() - params.startTime.getTime();
		const maxDuration = 24 * 60 * 60 * 1000; // 24 hours
		
		if (duration > maxDuration) {
			return { valid: false, error: 'Event cannot be longer than 24 hours' };
		}
		
		// Check attendees
		if (params.attendees && params.attendees.length > 100) {
			return { valid: false, error: 'Cannot invite more than 100 attendees' };
		}
		
		return { valid: true };
	}
	
	/**
	 * Validate notification parameters
	 */
	static validateNotification(params: {
		title: string;
		message: string;
		recipientIds: string[];
	}): { valid: boolean; error?: string } {
		// Check title
		if (!params.title.trim()) {
			return { valid: false, error: 'Notification title is required' };
		}
		
		if (params.title.length > 100) {
			return { valid: false, error: 'Notification title must be 100 characters or less' };
		}
		
		// Check message
		if (!params.message.trim()) {
			return { valid: false, error: 'Notification message is required' };
		}
		
		if (params.message.length > 1000) {
			return { valid: false, error: 'Notification message must be 1000 characters or less' };
		}
		
		// Check recipients
		if (params.recipientIds.length > 1000) {
			return { valid: false, error: 'Cannot send notification to more than 1000 recipients at once' };
		}
		
		if (params.recipientIds.length === 0) {
			return { valid: false, error: 'Notification must have at least 1 recipient' };
		}
		
		return { valid: true };
	}
	
	/**
	 * Validate AppFlowy document parameters
	 */
	static validateAppFlowyDocument(params: {
		title: string;
		content: any;
	}): { valid: boolean; error?: string } {
		// Check title
		if (!params.title.trim()) {
			return { valid: false, error: 'Document title is required' };
		}
		
		if (params.title.length > 200) {
			return { valid: false, error: 'Document title must be 200 characters or less' };
		}
		
		// Check content size
		const contentSize = new Blob([JSON.stringify(params.content)]).size;
		if (contentSize > 10 * 1024 * 1024) { // 10MB
			return { valid: false, error: 'Document content too large (max 10MB)' };
		}
		
		return { valid: true };
	}
}

/**
 * Middleware function to apply rate limiting to API calls
 */
export function withRateLimit(
	userId: string,
	endpoint: string,
	action: () => Promise<any>
): Promise<{ success: boolean; data?: any; error?: string; rateLimit?: any }> {
	const rateLimitResult = checkRateLimit(userId, endpoint);
	
	if (!rateLimitResult.allowed) {
		return Promise.resolve({
			success: false,
			error: `Rate limit exceeded. Please try again in ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000 / 60)} minutes.`,
			rateLimit: {
				used: rateLimitResult.limit - rateLimitResult.remaining,
				remaining: 0,
				resetTime: rateLimitResult.resetTime,
				limit: rateLimitResult.limit
			}
		});
	}
	
	return action().then(data => ({
		success: true,
		data,
		rateLimit: {
			used: rateLimitResult.limit - rateLimitResult.remaining + 1,
			remaining: rateLimitResult.remaining - 1,
			resetTime: rateLimitResult.resetTime,
			limit: rateLimitResult.limit
		}
	})).catch(error => ({
		success: false,
		error: error instanceof Error ? error.message : 'Unknown error',
		rateLimit: {
			used: rateLimitResult.limit - rateLimitResult.remaining + 1,
			remaining: rateLimitResult.remaining - 1,
			resetTime: rateLimitResult.resetTime,
			limit: rateLimitResult.limit
		}
	}));
}

/**
 * Clean up expired rate limit buckets (call periodically)
 */
export function cleanupExpiredRateLimits(): number {
	const now = Date.now();
	let cleaned = 0;
	
	for (const [key, bucket] of rateLimitStore.entries()) {
		if (now >= bucket.resetTime) {
			rateLimitStore.delete(key);
			cleaned++;
		}
	}
	
	return cleaned;
}

/**
 * Get all rate limit configurations
 */
export function getRateLimitConfigs(): Record<string, RateLimitConfig> {
	return { ...DEFAULT_RATE_LIMITS };
}
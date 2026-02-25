/**
 * Provider Limits
 * 
 * Defines free-tier limits and usage restrictions for email providers.
 */

import type { EmailProvider } from './providerDefaults';

export interface ProviderLimit {
	/** Provider ID */
	providerId: string;
	/** Daily sending limit (emails per day) */
	dailyLimit: number;
	/** Monthly sending limit (emails per month) */
	monthlyLimit?: number;
	/** Rate limit (emails per hour) */
	rateLimit?: number;
	/** Maximum recipients per email */
	maxRecipients?: number;
	/** Maximum attachment size (in bytes) */
	maxAttachmentSize?: number;
	/** Whether sandbox mode is required for free tier */
	sandboxRequired?: boolean;
	/** Additional restrictions */
	restrictions?: string[];
}

/**
 * Provider limits registry
 */
export const PROVIDER_LIMITS: Record<string, ProviderLimit> = {
	// Personal providers typically have no explicit sending limits
	// but may have anti-spam thresholds
	'gmail': {
		providerId: 'gmail',
		dailyLimit: 500, // Gmail's daily sending limit for regular accounts
		rateLimit: 100, // Emails per hour
		maxRecipients: 500, // Total recipients per day
		maxAttachmentSize: 25 * 1024 * 1024, // 25MB
		restrictions: [
			'Requires app password for third-party apps',
			'May flag as spam if sending to many recipients',
			'Not recommended for bulk/campaign sending'
		]
	},
	
	'outlook': {
		providerId: 'outlook',
		dailyLimit: 300,
		rateLimit: 30,
		maxRecipients: 100,
		maxAttachmentSize: 20 * 1024 * 1024, // 20MB
		restrictions: [
			'May require additional authentication steps',
			'Not designed for bulk sending'
		]
	},
	
	// Transactional providers with free tier limits
	'brevo': {
		providerId: 'brevo',
		dailyLimit: 300, // Free tier: 300 emails/day
		monthlyLimit: 9000, // 300 * 30
		rateLimit: 10, // Conservative rate limit
		maxRecipients: 50,
		maxAttachmentSize: 10 * 1024 * 1024, // 10MB
		sandboxRequired: false,
		restrictions: [
			'Free tier limited to 300 emails per day',
			'Brevo branding in emails for free tier',
			'No dedicated IP'
		]
	},
	
	'sendgrid': {
		providerId: 'sendgrid',
		dailyLimit: 100, // Free tier: 100 emails/day
		monthlyLimit: 3000, // 100 * 30
		rateLimit: 5,
		maxRecipients: 100,
		maxAttachmentSize: 30 * 1024 * 1024, // 30MB
		sandboxRequired: false,
		restrictions: [
			'Free tier limited to 100 emails per day',
			'SendGrid footer in emails',
			'Limited support'
		]
	},
	
	'mailgun': {
		providerId: 'mailgun',
		dailyLimit: 300, // Free tier: 300 emails/day
		monthlyLimit: 5000, // Actually 5,000 free emails/month
		rateLimit: 1, // Very conservative for sandbox
		maxRecipients: 3, // Sandbox: only authorized recipients
		maxAttachmentSize: 25 * 1024 * 1024, // 25MB
		sandboxRequired: true, // Free tier requires sandbox domain
		restrictions: [
			'Sandbox mode only for free tier',
			'Only pre-authorized recipients can receive emails',
			'Not suitable for production without upgrade'
		]
	},
	
	'postmark': {
		providerId: 'postmark',
		dailyLimit: 100, // Free trial: 100 emails/month total
		monthlyLimit: 100,
		rateLimit: 10,
		maxRecipients: 50,
		maxAttachmentSize: 10 * 1024 * 1024, // 10MB
		sandboxRequired: false,
		restrictions: [
			'100 free emails total (not per month)',
			'After trial, paid plans only',
			'High deliverability focus'
		]
	},
	
	'ses': {
		providerId: 'ses',
		dailyLimit: 200, // Sandbox: 200 emails/day
		rateLimit: 1,
		maxRecipients: 50,
		maxAttachmentSize: 10 * 1024 * 1024, // 10MB
		sandboxRequired: true, // SES starts in sandbox mode
		restrictions: [
			'Starts in sandbox mode',
			'Must request production access',
			'Only verified email addresses/domains',
			'Region-specific limits apply'
		]
	},
	
	// Custom SMTP - no predefined limits
	'custom': {
		providerId: 'custom',
		dailyLimit: 0, // Unknown - depends on provider
		restrictions: [
			'Limits depend on the specific SMTP provider',
			'May have anti-spam filters',
			'Deliverability varies widely'
		]
	}
};

/**
 * Get limits for a provider
 */
export function getProviderLimits(providerId: string): ProviderLimit | undefined {
	return PROVIDER_LIMITS[providerId.toLowerCase()];
}

/**
 * Check if provider is in free tier
 */
export function isFreeTier(providerId: string): boolean {
	const limits = getProviderLimits(providerId);
	if (!limits) return false;
	
	// Transactional providers with low limits are considered free tier
	const freeTierProviders = ['brevo', 'sendgrid', 'mailgun', 'postmark', 'ses'];
	return freeTierProviders.includes(providerId.toLowerCase());
}

/**
 * Check if provider requires sandbox mode
 */
export function requiresSandbox(providerId: string): boolean {
	const limits = getProviderLimits(providerId);
	return limits?.sandboxRequired || false;
}

/**
 * Check if usage exceeds daily limit
 */
export function exceedsDailyLimit(providerId: string, emailsSentToday: number): boolean {
	const limits = getProviderLimits(providerId);
	if (!limits || limits.dailyLimit === 0) return false;
	
	return emailsSentToday >= limits.dailyLimit;
}

/**
 * Get recommended upgrade suggestion based on usage
 */
export function getUpgradeSuggestion(providerId: string, usage: {
	emailsSentToday: number;
	emailsSentThisMonth: number;
}): string | null {
	const limits = getProviderLimits(providerId);
	if (!limits) return null;
	
	const { emailsSentToday, emailsSentThisMonth } = usage;
	
	// Check daily limit
	if (limits.dailyLimit > 0 && emailsSentToday >= limits.dailyLimit * 0.8) {
		return `You've used ${emailsSentToday}/${limits.dailyLimit} emails today. Consider upgrading for higher limits.`;
	}
	
	// Check monthly limit
	if (limits.monthlyLimit && emailsSentThisMonth >= limits.monthlyLimit * 0.8) {
		return `You've used ${emailsSentThisMonth}/${limits.monthlyLimit} emails this month. Consider upgrading for higher limits.`;
	}
	
	// Check sandbox restrictions
	if (limits.sandboxRequired) {
		return 'This provider requires sandbox mode. Request production access for sending to any recipient.';
	}
	
	return null;
}

/**
 * Get safe sending recommendations
 */
export function getSendingRecommendations(providerId: string): string[] {
	const recommendations: string[] = [];
	const limits = getProviderLimits(providerId);
	
	if (!limits) {
		return ['No specific recommendations available for this provider.'];
	}
	
	// Rate limiting recommendations
	if (limits.rateLimit && limits.rateLimit < 10) {
		recommendations.push(`Limit sending to ${limits.rateLimit} emails per hour to avoid rate limiting.`);
	}
	
	// Recipient limits
	if (limits.maxRecipients && limits.maxRecipients < 100) {
		recommendations.push(`Keep recipient lists under ${limits.maxRecipients} per email.`);
	}
	
	// Attachment limits
	if (limits.maxAttachmentSize) {
		const mb = Math.round(limits.maxAttachmentSize / (1024 * 1024));
		recommendations.push(`Keep attachments under ${mb}MB.`);
	}
	
	// General recommendations based on provider type
	if (isFreeTier(providerId)) {
		recommendations.push('Free tier may have deliverability limitations. Consider warming up IP reputation.');
		recommendations.push('Monitor bounce and complaint rates closely.');
	}
	
	if (providerId === 'gmail' || providerId === 'outlook') {
		recommendations.push('Personal email providers are not designed for bulk sending. Use for personal correspondence only.');
		recommendations.push('High-volume sending may trigger spam filters or account restrictions.');
	}
	
	return recommendations;
}

/**
 * Calculate remaining daily quota
 */
export function getRemainingDailyQuota(providerId: string, emailsSentToday: number): number {
	const limits = getProviderLimits(providerId);
	if (!limits || limits.dailyLimit === 0) return Infinity;
	
	return Math.max(0, limits.dailyLimit - emailsSentToday);
}
/**
 * Deliverability + Safety Layer
 * 
 * Implements DKIM/SPF/DMARC checks, spam trigger scoring, unsafe provider warnings,
 * free-tier limit detection, and provider switching suggestions.
 */

import type { EmailMessage } from '../smtp/smtpTypes';
import { getProviderLimits, isFreeTier, requiresSandbox } from '../providers/providerLimits';

export interface DeliverabilityCheck {
	/** Overall score (0-100, higher is better) */
	score: number;
	/** Whether email is likely to be delivered */
	likelyToDeliver: boolean;
	/** Warnings that may affect deliverability */
	warnings: string[];
	/** Critical issues that will likely prevent delivery */
	errors: string[];
	/** Suggestions for improvement */
	suggestions: string[];
	/** Spam trigger analysis */
	spamTriggers: SpamTrigger[];
	/** Authentication check results */
	authentication: AuthenticationCheck;
}

export interface SpamTrigger {
	/** Trigger type */
	type: 'content' | 'headers' | 'format' | 'reputation';
	/** Description of the trigger */
	description: string;
	/** Severity: low, medium, high, critical */
	severity: 'low' | 'medium' | 'high' | 'critical';
	/** How to fix it */
	fix: string;
}

export interface AuthenticationCheck {
	/** DKIM check result */
	dkim: 'pass' | 'fail' | 'neutral' | 'none';
	/** SPF check result */
	spf: 'pass' | 'fail' | 'neutral' | 'none';
	/** DMARC check result */
	dmarc: 'pass' | 'fail' | 'neutral' | 'none';
	/** Overall authentication result */
	overall: 'pass' | 'fail' | 'partial';
}

export interface ProviderSafetyCheck {
	/** Provider ID */
	providerId: string;
	/** Whether provider is considered safe for sending */
	safe: boolean;
	/** Safety issues */
	issues: string[];
	/** Recommendations */
	recommendations: string[];
	/** Whether provider is in free tier */
	freeTier: boolean;
	/** Whether provider requires sandbox mode */
	sandboxRequired: boolean;
	/** Suggested alternative providers */
	alternatives: string[];
}

/**
 * Check email deliverability
 */
export function checkDeliverability(
	message: EmailMessage,
	providerId: string,
	options: {
		senderReputation?: 'good' | 'neutral' | 'poor';
		previousBounceRate?: number;
		previousComplaintRate?: number;
	} = {}
): DeliverabilityCheck {
	const warnings: string[] = [];
	const errors: string[] = [];
	const spamTriggers: SpamTrigger[] = [];
	const suggestions: string[] = [];
	
	// Start with a perfect score
	let score = 100;
	
	// 1. Check message content for spam triggers
	const contentTriggers = checkContentSpamTriggers(message);
	spamTriggers.push(...contentTriggers);
	score -= calculateScorePenalty(contentTriggers);
	
	// 2. Check headers
	const headerTriggers = checkHeaderSpamTriggers(message);
	spamTriggers.push(...headerTriggers);
	score -= calculateScorePenalty(headerTriggers);
	
	// 3. Check format and structure
	const formatTriggers = checkFormatSpamTriggers(message);
	spamTriggers.push(...formatTriggers);
	score -= calculateScorePenalty(formatTriggers);
	
	// 4. Check provider-specific issues
	const providerIssues = checkProviderIssues(providerId, message);
	if (providerIssues.errors.length > 0) {
		errors.push(...providerIssues.errors);
		score -= 30; // Significant penalty for provider issues
	}
	if (providerIssues.warnings.length > 0) {
		warnings.push(...providerIssues.warnings);
		score -= 10;
	}
	
	// 5. Check authentication (placeholder - would require actual DNS checks)
	const authentication = checkAuthentication(message, providerId);
	if (authentication.overall === 'fail') {
		errors.push('Email authentication (DKIM/SPF/DMARC) is failing. This significantly reduces deliverability.');
		score -= 40;
	} else if (authentication.overall === 'partial') {
		warnings.push('Email authentication is partial. Consider improving DKIM/SPF/DMARC setup.');
		score -= 15;
	}
	
	// 6. Check sender reputation
	if (options.senderReputation === 'poor') {
		warnings.push('Sender reputation is poor. This may affect deliverability.');
		score -= 20;
		suggestions.push('Warm up your sending domain/IP gradually.');
		suggestions.push('Clean your email list to remove invalid addresses.');
	}
	
	// 7. Check bounce/complaint rates
	if (options.previousBounceRate && options.previousBounceRate > 0.05) {
		warnings.push(`Bounce rate (${(options.previousBounceRate * 100).toFixed(1)}%) is high. Aim for <5%.`);
		score -= 15;
		suggestions.push('Clean your email list to remove invalid addresses.');
	}
	
	if (options.previousComplaintRate && options.previousComplaintRate > 0.01) {
		errors.push(`Complaint rate (${(options.previousComplaintRate * 100).toFixed(2)}%) is critically high. Aim for <0.1%.`);
		score -= 30;
		suggestions.push('Review email content and frequency.');
		suggestions.push('Ensure recipients have opted in.');
	}
	
	// 8. Check for common issues
	const commonIssues = checkCommonIssues(message);
	warnings.push(...commonIssues.warnings);
	errors.push(...commonIssues.errors);
	score -= commonIssues.scorePenalty;
	
	// Add suggestions based on issues
	if (score < 70) {
		suggestions.push('Consider using a dedicated IP for better reputation control.');
		suggestions.push('Implement proper email authentication (DKIM, SPF, DMARC).');
	}
	
	if (score < 50) {
		suggestions.push('Consider using a professional email delivery service.');
		suggestions.push('Review and clean your email list thoroughly.');
	}
	
	// Ensure score is within bounds
	score = Math.max(0, Math.min(100, score));
	
	return {
		score,
		likelyToDeliver: score >= 60 && errors.length === 0,
		warnings,
		errors,
		suggestions,
		spamTriggers,
		authentication
	};
}

/**
 * Check content for spam triggers
 */
function checkContentSpamTriggers(message: EmailMessage): SpamTrigger[] {
	const triggers: SpamTrigger[] = [];
	const subject = message.subject?.toLowerCase() || '';
	const text = message.text?.toLowerCase() || '';
	const html = message.html?.toLowerCase() || '';
	const combined = text + ' ' + html;
	
	// Check for spammy words in subject
	const spammySubjectWords = [
		'free', 'win', 'winner', 'prize', 'cash', 'money', 'guaranteed',
		'risk-free', 'no cost', 'act now', 'limited time', 'urgent',
		'important information', 'buy now', 'click here', 'discount'
	];
	
	for (const word of spammySubjectWords) {
		if (subject.includes(word)) {
			triggers.push({
				type: 'content',
				description: `Subject contains potentially spammy word: "${word}"`,
				severity: 'medium',
				fix: 'Avoid spam trigger words in subject lines.'
			});
		}
	}
	
	// Check for excessive capitalization
	const capsRatio = (subject.match(/[A-Z]/g) || []).length / Math.max(subject.length, 1);
	if (capsRatio > 0.5) {
		triggers.push({
			type: 'content',
			description: 'Subject uses excessive capitalization',
			severity: 'medium',
			fix: 'Use normal capitalization in subject lines.'
		});
	}
	
	// Check for spammy phrases in body
	const spammyPhrases = [
		'click here', 'buy now', 'order now', 'limited offer',
		'money back', 'risk free', 'special promotion',
		'this isn\'t spam', 'unsubscribe', 'opt-out'
	];
	
	for (const phrase of spammyPhrases) {
		if (combined.includes(phrase)) {
			triggers.push({
				type: 'content',
				description: `Body contains spammy phrase: "${phrase}"`,
				severity: 'low',
				fix: 'Avoid common spam phrases in email content.'
			});
		}
	}
	
	// Check for too many links
	const linkCount = (combined.match(/https?:\/\//g) || []).length;
	if (linkCount > 5) {
		triggers.push({
			type: 'content',
			description: `Email contains ${linkCount} links (may appear spammy)`,
			severity: 'medium',
			fix: 'Limit the number of links in your email.'
		});
	}
	
	// Check for image-only emails
	if ((!text || text.trim().length < 50) && html && html.includes('<img')) {
		triggers.push({
			type: 'content',
			description: 'Email may be image-only with little text content',
			severity: 'high',
			fix: 'Include sufficient text content alongside images.'
		});
	}
	
	return triggers;
}

/**
 * Check headers for spam triggers
 */
function checkHeaderSpamTriggers(message: EmailMessage): SpamTrigger[] {
	const triggers: SpamTrigger[] = [];
	
	// Check for missing or suspicious From address
	if (!message.from) {
		triggers.push({
			type: 'headers',
			description: 'Missing From address',
			severity: 'critical',
			fix: 'Always include a valid From address.'
		});
	}
	
	// Check for suspicious From domain
	if (message.from) {
		const fromStr = typeof message.from === 'string' ? message.from : message.from.address;
		if (fromStr.includes('noreply') || fromStr.includes('no-reply')) {
			triggers.push({
				type: 'headers',
				description: 'From address uses "noreply" which may reduce engagement',
				severity: 'low',
				fix: 'Consider using a more engaging From address.'
			});
		}
	}
	
	// Check for missing Subject
	if (!message.subject || message.subject.trim() === '') {
		triggers.push({
			type: 'headers',
			description: 'Missing subject line',
			severity: 'high',
			fix: 'Always include a subject line.'
		});
	}
	
	// Check subject length
	if (message.subject && message.subject.length > 100) {
		triggers.push({
			type: 'headers',
			description: 'Subject line is too long',
			severity: 'low',
			fix: 'Keep subject lines under 100 characters.'
		});
	}
	
	return triggers;
}

/**
 * Check format for spam triggers
 */
function checkFormatSpamTriggers(message: EmailMessage): SpamTrigger[] {
	const triggers: SpamTrigger[] = [];
	
	// Check for missing text body
	if (!message.text && !message.html) {
		triggers.push({
			type: 'format',
			description: 'Email has no text or HTML body',
			severity: 'critical',
			fix: 'Include at least a text or HTML body.'
		});
	}
	
	// Check text-to-HTML ratio
	if (message.text && message.html) {
		const textLength = message.text.length;
		const htmlLength = message.html.length;
		
		if (textLength < 50 && htmlLength > 500) {
			triggers.push({
				type: 'format',
				description: 'Email has very little text compared to HTML',
				severity: 'medium',
				fix: 'Include sufficient text content for email clients that disable HTML.'
			});
		}
	}
	
	// Check for common HTML issues
	if (message.html) {
		// Check for missing alt text on images
		const imgTags = (message.html.match(/<img[^>]*>/gi) || []).length;
		const imgWithAlt = (message.html.match(/<img[^>]*alt=["'][^"']*["'][^>]*>/gi) || []).length;
		
		if (imgTags > 0 && imgWithAlt < imgTags) {
			triggers.push({
				type: 'format',
				description: 'Some images are missing alt text',
				severity: 'low',
				fix: 'Add alt text to all images for accessibility and spam filtering.'
			});
		}
		
		// Check for very large HTML
		if (message.html.length > 1024 * 100) { // 100KB
			triggers.push({
				type: 'format',
				description: 'HTML body is very large',
				severity: 'medium',
				fix: 'Optimize HTML size for better deliverability.'
			});
		}
	}
	
	return triggers;
}

/**
 * Check provider-specific issues
 */
function checkProviderIssues(providerId: string, message: EmailMessage): {
	warnings: string[];
	errors: string[];
} {
	const warnings: string[] = [];
	const errors: string[] = [];
	
	const limits = getProviderLimits(providerId);
	
	// Check if provider is in free tier
	if (isFreeTier(providerId)) {
		warnings.push(`Using ${providerId} free tier may have deliverability limitations.`);
		
		// Check for sandbox requirements
		if (requiresSandbox(providerId)) {
			errors.push(`${providerId} requires sandbox mode. You can only send to pre-authorized recipients.`);
		}
	}
	
	// Check for unsafe providers
	const unsafeProviders = ['cpanel', 'plesk', 'shared-hosting', 'godaddy-workspace'];
	if (unsafeProviders.some(unsafe => providerId.toLowerCase().includes(unsafe))) {
		warnings.push(`${providerId} is often used for spam. Consider using a dedicated email service.`);
	}
	
	// Check if personal email provider is being used for bulk sending
	const personalProviders = ['gmail', 'outlook', 'yahoo', 'icloud'];
	if (personalProviders.includes(providerId.toLowerCase())) {
		// Check if this looks like bulk sending (multiple recipients)
		const recipients = Array.isArray(message.to) ? message.to.length : 1;
		if (recipients > 10) {
			warnings.push(`Using personal email provider (${providerId}) for bulk sending to ${recipients} recipients. This may trigger spam filters.`);
		}
	}
	
	return { warnings, errors };
}

/**
 * Check authentication (placeholder implementation)
 */
function checkAuthentication(message: EmailMessage, providerId: string): AuthenticationCheck {
	// In a real implementation, this would check DNS records
	// For now, return placeholder results
	
	const fromDomain = extractDomain(message.from);
	
	if (!fromDomain) {
		return {
			dkim: 'none',
			spf: 'none',
			dmarc: 'none',
			overall: 'fail'
		};
	}
	
	// Check for common domains that likely have authentication
	const domainsWithAuth = ['gmail.com', 'google.com', 'outlook.com', 'microsoft.com', 'yahoo.com'];
	
	if (domainsWithAuth.some(domain => fromDomain.includes(domain))) {
		return {
			dkim: 'pass',
			spf: 'pass',
			dmarc: 'pass',
			overall: 'pass'
		};
	}
	
	// For transactional providers
	const transactionalProviders = ['brevo', 'sendgrid', 'mailgun', 'postmark', 'ses'];
	if (transactionalProviders.includes(providerId.toLowerCase())) {
		return {
			dkim: 'pass',
			spf: 'pass',
			dmarc: 'neutral',
			overall: 'partial'
		};
	}
	
	// Unknown domain - assume no authentication
	return {
		dkim: 'none',
		spf: 'none',
		dmarc: 'none',
		overall: 'fail'
	};
}

/**
 * Check for common issues
 */
function checkCommonIssues(message: EmailMessage): {
	warnings: string[];
	errors: string[];
	scorePenalty: number;
} {
	const warnings: string[] = [];
	const errors: string[] = [];
	let scorePenalty = 0;
	
	// Check for missing List-Unsubscribe header (for bulk emails)
	const recipients = Array.isArray(message.to) ? message.to.length : 1;
	if (recipients > 1 && !message.headers?.['List-Unsubscribe']) {
		warnings.push('Missing List-Unsubscribe header for bulk email. Required by some ESPs.');
		scorePenalty += 5;
	}
	
	// Check for suspicious sender/recipient mismatch
	const fromDomain = extractDomain(message.from);
	if (fromDomain) {
		// Check if sending to many different domains
		const toDomains = new Set<string>();
		const toList = Array.isArray(message.to) ? message.to : [message.to];
		
		for (const to of toList) {
			const domain = extractDomain(to);
			if (domain) {
				toDomains.add(domain);
			}
		}
		
		if (toDomains.size > 10 && !fromDomain.includes('transactional')) {
			warnings.push(`Sending from ${fromDomain} to ${toDomains.size} different domains may appear suspicious.`);
			scorePenalty += 10;
		}
	}
	
	return { warnings, errors, scorePenalty };
}

/**
 * Extract domain from email address
 */
function extractDomain(email: any): string | null {
	if (!email) return null;
	
	const emailStr = typeof email === 'string' ? email : email.address;
	if (!emailStr || typeof emailStr !== 'string') return null;
	
	const parts = emailStr.split('@');
	if (parts.length !== 2) return null;
	
	return parts[1].toLowerCase();
}

/**
 * Calculate score penalty from spam triggers
 */
function calculateScorePenalty(triggers: SpamTrigger[]): number {
	let penalty = 0;
	
	for (const trigger of triggers) {
		switch (trigger.severity) {
			case 'critical':
				penalty += 20;
				break;
			case 'high':
				penalty += 10;
				break;
			case 'medium':
				penalty += 5;
				break;
			case 'low':
				penalty += 2;
				break;
		}
	}
	
	return Math.min(penalty, 50); // Cap at 50 points
}

/**
 * Check provider safety
 */
export function checkProviderSafety(providerId: string): ProviderSafetyCheck {
	const issues: string[] = [];
	const recommendations: string[] = [];
	const alternatives: string[] = [];
	
	const freeTier = isFreeTier(providerId);
	const sandboxRequired = requiresSandbox(providerId);
	
	// Check for unsafe providers
	const unsafeProviders = ['cpanel', 'plesk', 'shared-hosting', 'godaddy-workspace'];
	let safe = true;
	
	for (const unsafe of unsafeProviders) {
		if (providerId.toLowerCase().includes(unsafe)) {
			safe = false;
			issues.push(`Provider "${providerId}" is often associated with spam.`);
			recommendations.push('Consider switching to a dedicated email service.');
			alternatives.push('brevo', 'sendgrid', 'mailgun', 'postmark');
			break;
		}
	}
	
	// Check free tier limitations
	if (freeTier) {
		issues.push(`Provider "${providerId}" is in free tier, which may have deliverability limitations.`);
		recommendations.push('Consider upgrading to a paid plan for better deliverability.');
	}
	
	// Check sandbox requirements
	if (sandboxRequired) {
		issues.push(`Provider "${providerId}" requires sandbox mode.`);
		recommendations.push('Request production access or verify your domain.');
	}
	
	// Check personal providers for bulk sending
	const personalProviders = ['gmail', 'outlook', 'yahoo', 'icloud'];
	if (personalProviders.includes(providerId.toLowerCase())) {
		issues.push(`Personal email provider "${providerId}" is not designed for bulk sending.`);
		recommendations.push('Use a transactional email service for bulk/campaign emails.');
		alternatives.push('brevo', 'sendgrid', 'mailgun');
	}
	
	// If no alternatives suggested yet, suggest some based on provider type
	if (alternatives.length === 0) {
		if (personalProviders.includes(providerId.toLowerCase())) {
			alternatives.push('brevo', 'sendgrid', 'mailgun');
		} else if (freeTier) {
			alternatives.push('brevo', 'sendgrid', 'postmark');
		}
	}
	
	return {
		providerId,
		safe,
		issues,
		recommendations,
		freeTier,
		sandboxRequired,
		alternatives: [...new Set(alternatives)] // Remove duplicates
	};
}

/**
 * Get deliverability suggestions based on score
 */
export function getDeliverabilitySuggestions(score: number): string[] {
	const suggestions: string[] = [];
	
	if (score >= 80) {
		suggestions.push('Deliverability looks good. Maintain current practices.');
	} else if (score >= 60) {
		suggestions.push('Deliverability is acceptable but could be improved.');
		suggestions.push('Consider implementing DKIM/SPF/DMARC authentication.');
		suggestions.push('Review email content for spam triggers.');
	} else if (score >= 40) {
		suggestions.push('Deliverability is poor. Significant improvements needed.');
		suggestions.push('Implement full email authentication (DKIM, SPF, DMARC).');
		suggestions.push('Clean your email list to remove invalid addresses.');
		suggestions.push('Consider using a dedicated IP or email service.');
	} else {
		suggestions.push('Deliverability is very poor. Email may be blocked or marked as spam.');
		suggestions.push('Immediately implement email authentication.');
		suggestions.push('Thoroughly clean your email list.');
		suggestions.push('Consider switching to a professional email delivery service.');
		suggestions.push('Warm up your sending domain/IP gradually.');
	}
	
	return suggestions;
}

/**
 * Check if email is likely to be marked as spam
 */
export function isLikelySpam(message: EmailMessage, providerId: string): boolean {
	const check = checkDeliverability(message, providerId);
	return check.score < 50 || check.errors.length > 0;
}

/**
 * Get quick deliverability assessment
 */
export function quickAssessment(message: EmailMessage): {
	status: 'good' | 'warning' | 'poor';
	issues: string[];
} {
	const issues: string[] = [];
	
	// Check for critical issues
	if (!message.from) {
		issues.push('Missing From address');
	}
	
	if (!message.subject || message.subject.trim() === '') {
		issues.push('Missing subject');
	}
	
	if (!message.text && !message.html) {
		issues.push('Missing email body');
	}
	
	// Check for spammy subject
	if (message.subject) {
		const spammyWords = ['free', 'win', 'prize', 'urgent', 'act now'];
		const lowerSubject = message.subject.toLowerCase();
		
		for (const word of spammyWords) {
			if (lowerSubject.includes(word)) {
				issues.push(`Subject contains spammy word: "${word}"`);
				break;
			}
		}
	}
	
	// Determine status
	if (issues.length === 0) {
		return { status: 'good', issues: [] };
	} else if (issues.length <= 2 && !issues.some(i => i.includes('Missing'))) {
		return { status: 'warning', issues };
	} else {
		return { status: 'poor', issues };
	}
}
				
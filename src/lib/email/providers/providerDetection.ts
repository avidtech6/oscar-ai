/**
 * Provider Detection
 * 
 * Detects email provider from email domain, MX records, or user selection.
 */

import type { EmailProvider } from './providerDefaults';
import { getProviderByDomain, getProviderById } from './providerRegistry';

/**
 * Extract domain from email address
 */
export function extractDomainFromEmail(email: string): string | null {
	if (!email || typeof email !== 'string') return null;
	
	const parts = email.trim().toLowerCase().split('@');
	if (parts.length !== 2) return null;
	
	return parts[1];
}

/**
 * Detect provider from email address
 */
export function detectProviderFromEmail(email: string): EmailProvider | null {
	const domain = extractDomainFromEmail(email);
	if (!domain) return null;
	
	// First, try to match by domain
	const provider = getProviderByDomain(domain);
	if (provider) return provider;
	
	// Check for common domain patterns
	if (domain.endsWith('.gmail.com') || domain === 'googlemail.com') {
		return getProviderById('gmail') || null;
	}
	
	if (domain.endsWith('.outlook.com') || domain.endsWith('.hotmail.com') || domain.endsWith('.live.com')) {
		return getProviderById('outlook') || null;
	}
	
	if (domain.endsWith('.yahoo.com') || domain.endsWith('.ymail.com')) {
		return getProviderById('yahoo') || null;
	}
	
	if (domain.endsWith('.icloud.com') || domain.endsWith('.me.com') || domain.endsWith('.mac.com')) {
		return getProviderById('icloud') || null;
	}
	
	// Check for company domains that might use Google Workspace or Microsoft 365
	// This is a simple heuristic - in production, you'd need to check MX records
	if (domain.includes('.com') || domain.includes('.org') || domain.includes('.net')) {
		// Could be custom domain using Google Workspace or Microsoft 365
		// We can't determine without MX lookup
		return null;
	}
	
	return null;
}

/**
 * Guess provider type from domain patterns
 */
export function guessProviderType(domain: string): 'personal' | 'business' | 'transactional' | 'unknown' {
	if (!domain) return 'unknown';
	
	const personalDomains = [
		'gmail.com', 'googlemail.com',
		'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
		'yahoo.com', 'ymail.com', 'rocketmail.com',
		'icloud.com', 'me.com', 'mac.com',
		'aol.com', 'protonmail.com', 'zoho.com'
	];
	
	if (personalDomains.includes(domain.toLowerCase())) {
		return 'personal';
	}
	
	// Check for known transactional provider domains
	const transactionalDomains = [
		'brevo.com', 'sendinblue.com',
		'sendgrid.net',
		'mailgun.org', 'mailgun.com',
		'postmarkapp.com',
		'amazonaws.com' // SES
	];
	
	for (const tld of transactionalDomains) {
		if (domain.toLowerCase().includes(tld)) {
			return 'transactional';
		}
	}
	
	// Otherwise, assume business/custom domain
	return 'business';
}

/**
 * Get MX records for a domain (placeholder - would require DNS lookup in production)
 */
export async function getMxRecords(domain: string): Promise<string[]> {
	// In a real implementation, this would perform DNS MX lookup
	// For now, return empty array as placeholder
	console.log(`[Placeholder] Would perform MX lookup for: ${domain}`);
	return [];
}

/**
 * Detect provider from MX records
 */
export async function detectProviderFromMx(domain: string): Promise<EmailProvider | null> {
	try {
		const mxRecords = await getMxRecords(domain);
		
		// Check MX records for known provider patterns
		const mxString = mxRecords.join(' ').toLowerCase();
		
		if (mxString.includes('google') || mxString.includes('aspmx.l.google.com')) {
			return getProviderById('gmail') || null;
		}
		
		if (mxString.includes('outlook') || mxString.includes('office365') || mxString.includes('protection.outlook.com')) {
			return getProviderById('outlook') || null;
		}
		
		if (mxString.includes('yahoo')) {
			return getProviderById('yahoo') || null;
		}
		
		if (mxString.includes('apple') || mxString.includes('icloud')) {
			return getProviderById('icloud') || null;
		}
		
		// Check for Microsoft Exchange
		if (mxString.includes('exchange') || mxString.includes('mail.protection.outlook.com')) {
			// Likely Microsoft 365/Exchange
			return {
				id: 'exchange',
				name: 'Microsoft Exchange',
				type: 'custom',
				domains: [domain],
				imap: {
					host: 'outlook.office365.com', // Common Exchange Online host
					port: 993,
					secure: true,
					authMethod: 'password'
				},
				smtp: {
					host: 'smtp.office365.com',
					port: 587,
					secure: false,
					authMethod: 'password'
				},
				requiresAppPassword: false,
				oauthSupported: true
			};
		}
		
		// Check for Google Workspace
		if (mxString.includes('aspmx.l.google.com')) {
			// Google Workspace (G Suite)
			return {
				id: 'google-workspace',
				name: 'Google Workspace',
				type: 'custom',
				domains: [domain],
				imap: {
					host: 'imap.gmail.com',
					port: 993,
					secure: true,
					authMethod: 'password'
				},
				smtp: {
					host: 'smtp.gmail.com',
					port: 465,
					secure: true,
					authMethod: 'password'
				},
				requiresAppPassword: true,
				oauthSupported: true
			};
		}
		
	} catch (error) {
		console.error('Error detecting provider from MX records:', error);
	}
	
	return null;
}

/**
 * Smart provider detection combining multiple methods
 */
export async function detectProvider(
	email: string,
	options: {
		useMxLookup?: boolean;
		preferredProvider?: string;
	} = {}
): Promise<{
	provider: EmailProvider | null;
	method: 'domain' | 'mx' | 'guess' | 'preferred' | 'none';
	confidence: 'high' | 'medium' | 'low';
}> {
	const { useMxLookup = false, preferredProvider } = options;
	
	// If user has a preferred provider, use it (with medium confidence)
	if (preferredProvider) {
		const provider = getProviderById(preferredProvider);
		if (provider) {
			return {
				provider,
				method: 'preferred',
				confidence: 'medium'
			};
		}
	}
	
	const domain = extractDomainFromEmail(email);
	if (!domain) {
		return {
			provider: null,
			method: 'none',
			confidence: 'low'
		};
	}
	
	// Try domain-based detection first (fastest)
	const domainProvider = detectProviderFromEmail(email);
	if (domainProvider) {
		return {
			provider: domainProvider,
			method: 'domain',
			confidence: 'high'
		};
	}
	
	// Try MX lookup if enabled
	if (useMxLookup) {
		const mxProvider = await detectProviderFromMx(domain);
		if (mxProvider) {
			return {
				provider: mxProvider,
				method: 'mx',
				confidence: 'high'
			};
		}
	}
	
	// Last resort: guess based on domain patterns
	const guessedType = guessProviderType(domain);
	if (guessedType === 'personal') {
		// For personal domains we couldn't identify, suggest generic settings
		const genericProvider: EmailProvider = {
			id: 'generic-personal',
			name: 'Personal Email',
			type: 'personal',
			domains: [domain],
			imap: {
				host: `imap.${domain}`,
				port: 993,
				secure: true,
				authMethod: 'password'
			},
			smtp: {
				host: `smtp.${domain}`,
				port: 587,
				secure: false, // STARTTLS
				authMethod: 'password'
			},
			requiresAppPassword: false,
			oauthSupported: false
		};
		
		return {
			provider: genericProvider,
			method: 'guess',
			confidence: 'low'
		};
	}
	
	// Business domain - can't guess specific provider
	return {
		provider: null,
		method: 'none',
		confidence: 'low'
	};
}

/**
 * Get provider suggestions for an email address
 */
export function getProviderSuggestions(email: string): Array<{
	provider: EmailProvider;
	reason: string;
}> {
	const suggestions: Array<{ provider: EmailProvider; reason: string }> = [];
	const domain = extractDomainFromEmail(email);
	
	if (!domain) return suggestions;
	
	// Always suggest common providers
	const commonProviders = ['gmail', 'outlook', 'yahoo', 'icloud'];
	
	for (const providerId of commonProviders) {
		const provider = getProviderById(providerId);
		if (provider) {
			suggestions.push({
				provider,
				reason: 'Common email provider'
			});
		}
	}
	
	// If domain looks like a business domain, suggest transactional providers
	const guessedType = guessProviderType(domain);
	if (guessedType === 'business') {
		const transactionalProviders = ['brevo', 'sendgrid', 'mailgun', 'postmark', 'ses'];
		
		for (const providerId of transactionalProviders) {
			const provider = getProviderById(providerId);
			if (provider) {
				suggestions.push({
					provider,
					reason: 'Suitable for business email sending'
				});
			}
		}
	}
	
	return suggestions;
}

/**
 * Validate provider configuration
 */
export function validateProviderConfig(
	providerId: string,
	config: {
		imap?: any;
		smtp?: any;
		email?: string;
	}
): { valid: boolean; errors: string[]; warnings: string[] } {
	const errors: string[] = [];
	const warnings: string[] = [];
	
	const provider = getProviderById(providerId);
	if (!provider) {
		errors.push(`Unknown provider: ${providerId}`);
		return { valid: false, errors, warnings };
	}
	
	// Validate email format if provided
	if (config.email) {
		const domain = extractDomainFromEmail(config.email);
		if (!domain) {
			errors.push('Invalid email address format');
		}
		
		// Check if email domain matches provider domains (for personal providers)
		if (provider.domains.length > 0 && domain) {
			if (!provider.domains.includes(domain.toLowerCase())) {
				warnings.push(`Email domain (${domain}) doesn't match typical domains for ${provider.name}`);
			}
		}
	}
	
	// Validate IMAP configuration if provider supports it
	if (provider.imap && config.imap) {
		if (!config.imap.host || !config.imap.port) {
			errors.push('IMAP configuration requires host and port');
		}
		
		// Check if provided host matches expected host
		if (config.imap.host && provider.imap.host && 
			config.imap.host.toLowerCase() !== provider.imap.host.toLowerCase()) {
			warnings.push(`IMAP host (${config.imap.host}) differs from default (${provider.imap.host})`);
		}
		
		// Check port
		if (config.imap.port && provider.imap.port && 
			config.imap.port !== provider.imap.port) {
			warnings.push(`IMAP port (${config.imap.port}) differs from default (${provider.imap.port})`);
		}
	}
	
	// Validate SMTP configuration if provider supports it
	if (provider.smtp && config.smtp) {
		if (!config.smtp.host || !config.smtp.port) {
			errors.push('SMTP configuration requires host and port');
		}
		
		// Check if provided host matches expected host
		if (config.smtp.host && provider.smtp.host && 
			config.smtp.host.toLowerCase() !== provider.smtp.host.toLowerCase()) {
			warnings.push(`SMTP host (${config.smtp.host}) differs from default (${provider.smtp.host})`);
		}
		
		// Check port
		if (config.smtp.port && provider.smtp.port && 
			config.smtp.port !== provider.smtp.port) {
			warnings.push(`SMTP port (${config.smtp.port}) differs from default (${provider.smtp.port})`);
		}
	}
	
	// Check for missing configuration
	if (provider.imap && !config.imap) {
		warnings.push(`${provider.name} typically supports IMAP, but no IMAP configuration provided`);
	}
	
	if (provider.smtp && !config.smtp) {
		warnings.push(`${provider.name} typically supports SMTP, but no SMTP configuration provided`);
	}
	
	return {
		valid: errors.length === 0,
		errors,
		warnings
	};
}
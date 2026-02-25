/**
 * Provider Registry
 * 
 * Registers known email providers with their configuration details.
 * Supports: Gmail, Outlook, iCloud, Yahoo, Brevo, SendGrid, Mailgun, Postmark, SES, Custom SMTP.
 */

import type { EmailProvider, ProviderConfig } from './providerDefaults';

export const PROVIDER_REGISTRY: Record<string, EmailProvider> = {
	// Personal Email Providers
	'gmail': {
		id: 'gmail',
		name: 'Gmail',
		type: 'personal',
		domains: ['gmail.com', 'googlemail.com'],
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
	},
	
	'outlook': {
		id: 'outlook',
		name: 'Outlook / Microsoft 365',
		type: 'personal',
		domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'],
		imap: {
			host: 'outlook.office365.com',
			port: 993,
			secure: true,
			authMethod: 'password'
		},
		smtp: {
			host: 'smtp.office365.com',
			port: 587,
			secure: false, // STARTTLS
			authMethod: 'password'
		},
		requiresAppPassword: false,
		oauthSupported: true
	},
	
	'icloud': {
		id: 'icloud',
		name: 'iCloud Mail',
		type: 'personal',
		domains: ['icloud.com', 'me.com', 'mac.com'],
		imap: {
			host: 'imap.mail.me.com',
			port: 993,
			secure: true,
			authMethod: 'password'
		},
		smtp: {
			host: 'smtp.mail.me.com',
			port: 587,
			secure: false, // STARTTLS
			authMethod: 'password'
		},
		requiresAppPassword: true,
		oauthSupported: false
	},
	
	'yahoo': {
		id: 'yahoo',
		name: 'Yahoo Mail',
		type: 'personal',
		domains: ['yahoo.com', 'ymail.com', 'rocketmail.com'],
		imap: {
			host: 'imap.mail.yahoo.com',
			port: 993,
			secure: true,
			authMethod: 'password'
		},
		smtp: {
			host: 'smtp.mail.yahoo.com',
			port: 465,
			secure: true,
			authMethod: 'password'
		},
		requiresAppPassword: true,
		oauthSupported: true
	},
	
	// Transactional Email Providers
	'brevo': {
		id: 'brevo',
		name: 'Brevo (Sendinblue)',
		type: 'transactional',
		domains: [], // Brevo uses its own domains for sending
		imap: null, // No IMAP support
		smtp: {
			host: 'smtp-relay.brevo.com',
			port: 587,
			secure: false, // STARTTLS
			authMethod: 'api-key'
		},
		requiresAppPassword: false,
		oauthSupported: false,
		apiBased: true
	},
	
	'sendgrid': {
		id: 'sendgrid',
		name: 'SendGrid',
		type: 'transactional',
		domains: [],
		imap: null,
		smtp: {
			host: 'smtp.sendgrid.net',
			port: 587,
			secure: false, // STARTTLS
			authMethod: 'api-key'
		},
		requiresAppPassword: false,
		oauthSupported: false,
		apiBased: true
	},
	
	'mailgun': {
		id: 'mailgun',
		name: 'Mailgun',
		type: 'transactional',
		domains: [],
		imap: null,
		smtp: {
			host: 'smtp.mailgun.org',
			port: 587,
			secure: false, // STARTTLS
			authMethod: 'api-key'
		},
		requiresAppPassword: false,
		oauthSupported: false,
		apiBased: true
	},
	
	'postmark': {
		id: 'postmark',
		name: 'Postmark',
		type: 'transactional',
		domains: [],
		imap: null,
		smtp: {
			host: 'smtp.postmarkapp.com',
			port: 587,
			secure: false, // STARTTLS
			authMethod: 'api-key'
		},
		requiresAppPassword: false,
		oauthSupported: false,
		apiBased: true
	},
	
	'ses': {
		id: 'ses',
		name: 'Amazon SES',
		type: 'transactional',
		domains: [],
		imap: null,
		smtp: {
			host: 'email-smtp.us-east-1.amazonaws.com', // Region-specific
			port: 587,
			secure: false, // STARTTLS
			authMethod: 'access-key'
		},
		requiresAppPassword: false,
		oauthSupported: false,
		apiBased: true,
		regionBased: true
	},
	
	'custom': {
		id: 'custom',
		name: 'Custom SMTP',
		type: 'custom',
		domains: [],
		imap: null,
		smtp: null, // User must provide all details
		requiresAppPassword: false,
		oauthSupported: false
	}
};

/**
 * Get provider by ID
 */
export function getProviderById(id: string): EmailProvider | undefined {
	return PROVIDER_REGISTRY[id.toLowerCase()];
}

/**
 * Get provider by email domain
 */
export function getProviderByDomain(domain: string): EmailProvider | undefined {
	const normalizedDomain = domain.toLowerCase();
	
	for (const provider of Object.values(PROVIDER_REGISTRY)) {
		if (provider.domains.includes(normalizedDomain)) {
			return provider;
		}
	}
	
	return undefined;
}

/**
 * Get provider by name (case-insensitive partial match)
 */
export function getProviderByName(name: string): EmailProvider | undefined {
	const searchName = name.toLowerCase();
	
	for (const provider of Object.values(PROVIDER_REGISTRY)) {
		if (provider.name.toLowerCase().includes(searchName)) {
			return provider;
		}
	}
	
	return undefined;
}

/**
 * Get all providers of a specific type
 */
export function getProvidersByType(type: 'personal' | 'transactional' | 'custom'): EmailProvider[] {
	return Object.values(PROVIDER_REGISTRY).filter(provider => provider.type === type);
}

/**
 * Get all registered provider IDs
 */
export function getAllProviderIds(): string[] {
	return Object.keys(PROVIDER_REGISTRY);
}

/**
 * Check if a provider supports IMAP
 */
export function providerSupportsImap(providerId: string): boolean {
	const provider = getProviderById(providerId);
	return !!provider?.imap;
}

/**
 * Check if a provider supports SMTP
 */
export function providerSupportsSmtp(providerId: string): boolean {
	const provider = getProviderById(providerId);
	return !!provider?.smtp;
}

/**
 * Get default configuration for a provider
 */
export function getDefaultConfig(providerId: string, email?: string): ProviderConfig | undefined {
	const provider = getProviderById(providerId);
	if (!provider) return undefined;
	
	const config: ProviderConfig = {
		providerId: provider.id,
		providerName: provider.name,
		email: email || '',
		requiresAppPassword: provider.requiresAppPassword,
		oauthSupported: provider.oauthSupported
	};
	
	if (provider.imap) {
		config.imap = {
			host: provider.imap.host,
			port: provider.imap.port,
			secure: provider.imap.secure,
			auth: { user: email || '', pass: '' }
		};
	}
	
	if (provider.smtp) {
		config.smtp = {
			host: provider.smtp.host,
			port: provider.smtp.port,
			secure: provider.smtp.secure,
			auth: { user: email || '', pass: '' }
		};
	}
	
	return config;
}
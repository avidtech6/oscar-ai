/**
 * Provider Defaults and Types
 * 
 * Defines the types and default configurations for email providers.
 */

import type { ImapConnectionConfig } from '../imap/imapTypes';
import type { SmtpConnectionConfig } from '../smtp/smtpTypes';

export interface EmailProvider {
	/** Unique identifier (e.g., 'gmail', 'outlook') */
	id: string;
	/** Display name */
	name: string;
	/** Provider type */
	type: 'personal' | 'transactional' | 'custom';
	/** Supported email domains (for personal providers) */
	domains: string[];
	/** Default IMAP configuration (null if not supported) */
	imap: {
		host: string;
		port: number;
		secure: boolean;
		authMethod: 'password' | 'oauth' | 'api-key' | 'access-key';
	} | null;
	/** Default SMTP configuration (null if not supported) */
	smtp: {
		host: string;
		port: number;
		secure: boolean;
		authMethod: 'password' | 'oauth' | 'api-key' | 'access-key';
	} | null;
	/** Whether this provider requires an app password (vs regular password) */
	requiresAppPassword: boolean;
	/** Whether OAuth authentication is supported */
	oauthSupported: boolean;
	/** Whether this provider is API-based (transactional providers) */
	apiBased?: boolean;
	/** Whether configuration is region-specific (e.g., AWS SES) */
	regionBased?: boolean;
}

export interface ProviderConfig {
	/** Provider ID */
	providerId: string;
	/** Provider display name */
	providerName: string;
	/** Email address */
	email: string;
	/** IMAP configuration (if applicable) */
	imap?: ImapConnectionConfig;
	/** SMTP configuration (if applicable) */
	smtp?: SmtpConnectionConfig;
	/** Whether app password is required */
	requiresAppPassword: boolean;
	/** Whether OAuth is supported */
	oauthSupported: boolean;
	/** API key (for transactional providers) */
	apiKey?: string;
	/** Region (for region-based providers) */
	region?: string;
}

/**
 * Get default IMAP configuration for a provider
 */
export function getDefaultImapConfig(providerId: string, email: string): ImapConnectionConfig | undefined {
	const defaults = getProviderDefaults(providerId);
	if (!defaults?.imap) return undefined;
	
	return {
		host: defaults.imap.host,
		port: defaults.imap.port,
		secure: defaults.imap.secure,
		auth: {
			user: email,
			pass: ''
		},
		clientId: 'OscarAI'
	};
}

/**
 * Get default SMTP configuration for a provider
 */
export function getDefaultSmtpConfig(providerId: string, email: string): SmtpConnectionConfig | undefined {
	const defaults = getProviderDefaults(providerId);
	if (!defaults?.smtp) return undefined;
	
	return {
		host: defaults.smtp.host,
		port: defaults.smtp.port,
		secure: defaults.smtp.secure,
		auth: {
			user: email,
			pass: ''
		},
		timeout: 30000
	};
}

/**
 * Get provider defaults by ID (placeholder - actual implementation in providerRegistry)
 */
function getProviderDefaults(providerId: string): EmailProvider | undefined {
	// This function would normally import from providerRegistry
	// For now, return a minimal placeholder
	return undefined;
}

/**
 * Check if a provider requires app password
 */
export function requiresAppPassword(providerId: string): boolean {
	const provider = getProviderDefaults(providerId);
	return provider?.requiresAppPassword || false;
}

/**
 * Check if a provider supports OAuth
 */
export function supportsOAuth(providerId: string): boolean {
	const provider = getProviderDefaults(providerId);
	return provider?.oauthSupported || false;
}

/**
 * Get authentication method for a provider
 */
export function getAuthMethod(providerId: string, service: 'imap' | 'smtp'): string {
	const provider = getProviderDefaults(providerId);
	if (!provider) return 'password';
	
	if (service === 'imap' && provider.imap) {
		return provider.imap.authMethod;
	}
	
	if (service === 'smtp' && provider.smtp) {
		return provider.smtp.authMethod;
	}
	
	return 'password';
}
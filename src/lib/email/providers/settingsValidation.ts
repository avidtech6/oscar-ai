/**
 * Settings Validation
 * 
 * Validates IMAP/SMTP settings, detects incorrect configurations,
 * missing app passwords, unsafe providers, etc.
 */

import type { ImapConnectionConfig } from '../imap/imapTypes';
import type { SmtpConnectionConfig } from '../smtp/smtpTypes';
import type { EmailProvider } from './providerDefaults';
import { getProviderById, providerSupportsImap, providerSupportsSmtp } from './providerRegistry';
import { isFreeTier, requiresSandbox } from './providerLimits';

export interface ValidationResult {
	/** Whether the configuration is valid */
	valid: boolean;
	/** Validation errors */
	errors: string[];
	/** Validation warnings */
	warnings: string[];
	/** Suggestions for improvement */
	suggestions: string[];
	/** Detected provider (if any) */
	detectedProvider?: EmailProvider;
}

/**
 * Validate IMAP settings
 */
export function validateImapSettings(
	config: ImapConnectionConfig,
	providerId?: string
): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];
	const suggestions: string[] = [];
	
	// Basic validation
	if (!config.host || config.host.trim() === '') {
		errors.push('IMAP host is required');
	}
	
	if (!config.port || config.port < 1 || config.port > 65535) {
		errors.push('IMAP port must be between 1 and 65535');
	}
	
	if (!config.auth?.user || config.auth.user.trim() === '') {
		errors.push('IMAP username is required');
	}
	
	if (!config.auth?.pass || config.auth.pass.trim() === '') {
		warnings.push('IMAP password is empty');
	}
	
	// Check for common misconfigurations
	if (config.port === 143 && config.secure === true) {
		// Port 143 is usually for plain text/STARTTLS, not SSL
		warnings.push('Port 143 is typically used with STARTTLS (secure: false), not SSL (secure: true)');
		suggestions.push('Try secure: false for port 143, or use port 993 for SSL');
	}
	
	if (config.port === 993 && config.secure === false) {
		// Port 993 is for SSL, not plain text
		warnings.push('Port 993 is for SSL (secure: true), but secure is set to false');
		suggestions.push('Set secure: true for port 993');
	}
	
	// Check for well-known ports
	if (config.port === 143 || config.port === 993) {
		// Standard IMAP ports
	} else if (config.port === 110 || config.port === 995) {
		warnings.push(`Port ${config.port} is typically used for POP3, not IMAP`);
		suggestions.push('Check if you should be using IMAP (ports 143/993) instead of POP3');
	} else if (config.port === 25 || config.port === 465 || config.port === 587) {
		warnings.push(`Port ${config.port} is typically used for SMTP, not IMAP`);
		suggestions.push('Check if you should be using SMTP instead of IMAP');
	} else {
		warnings.push(`Port ${config.port} is not a standard IMAP port`);
	}
	
	// Provider-specific validation
	let detectedProvider: EmailProvider | undefined;
	
	if (providerId) {
		const provider = getProviderById(providerId);
		if (provider) {
			detectedProvider = provider;
			
			// Check if provider supports IMAP
			if (!providerSupportsImap(providerId)) {
				warnings.push(`Provider ${provider.name} does not typically support IMAP`);
			}
			
			// Check if provider requires app password
			if (provider.requiresAppPassword) {
				// Simple check for app password format (Gmail app passwords are 16 chars)
				if (config.auth.pass && config.auth.pass.length < 16) {
					warnings.push(`${provider.name} may require an app password instead of your regular password`);
					suggestions.push('Generate an app password in your account security settings');
				}
			}
			
			// Check if default host/port matches
			if (provider.imap) {
				if (config.host !== provider.imap.host) {
					warnings.push(`Host ${config.host} differs from default ${provider.imap.host} for ${provider.name}`);
				}
				
				if (config.port !== provider.imap.port) {
					warnings.push(`Port ${config.port} differs from default ${provider.imap.port} for ${provider.name}`);
				}
				
				if (config.secure !== provider.imap.secure) {
					warnings.push(`SSL setting (secure: ${config.secure}) differs from default (secure: ${provider.imap.secure}) for ${provider.name}`);
				}
			}
		}
	}
	
	// Try to detect provider from host
	if (!detectedProvider) {
		detectedProvider = detectProviderFromHost(config.host);
		if (detectedProvider) {
			warnings.push(`Detected provider: ${detectedProvider.name} (from hostname)`);
		}
	}
	
	// Check for unsafe providers
	if (detectedProvider) {
		const safetyCheck = checkProviderSafety(detectedProvider.id);
		if (!safetyCheck.safe) {
			warnings.push(...safetyCheck.issues);
			suggestions.push(...safetyCheck.recommendations);
		}
	}
	
	return {
		valid: errors.length === 0,
		errors,
		warnings,
		suggestions,
		detectedProvider
	};
}

/**
 * Validate SMTP settings
 */
export function validateSmtpSettings(
	config: SmtpConnectionConfig,
	providerId?: string
): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];
	const suggestions: string[] = [];
	
	// Basic validation
	if (!config.host || config.host.trim() === '') {
		errors.push('SMTP host is required');
	}
	
	if (!config.port || config.port < 1 || config.port > 65535) {
		errors.push('SMTP port must be between 1 and 65535');
	}
	
	if (!config.auth?.user || config.auth.user.trim() === '') {
		errors.push('SMTP username is required');
	}
	
	if (!config.auth?.pass || config.auth.pass.trim() === '') {
		warnings.push('SMTP password is empty');
	}
	
	// Check for common misconfigurations
	if (config.port === 587 && config.secure === true) {
		// Port 587 is usually for STARTTLS, not SSL
		warnings.push('Port 587 is typically used with STARTTLS (secure: false), not SSL (secure: true)');
		suggestions.push('Try secure: false for port 587, or use port 465 for SSL');
	}
	
	if (config.port === 465 && config.secure === false) {
		// Port 465 is for SSL, not plain text
		warnings.push('Port 465 is for SSL (secure: true), but secure is set to false');
		suggestions.push('Set secure: true for port 465');
	}
	
	if (config.port === 25) {
		// Port 25 is often blocked by ISPs
		warnings.push('Port 25 is often blocked by ISPs for outgoing mail');
		suggestions.push('Consider using port 587 or 465 instead');
	}
	
	// Check for well-known ports
	if (config.port === 25 || config.port === 465 || config.port === 587) {
		// Standard SMTP ports
	} else if (config.port === 143 || config.port === 993) {
		warnings.push(`Port ${config.port} is typically used for IMAP, not SMTP`);
		suggestions.push('Check if you should be using IMAP instead of SMTP');
	} else if (config.port === 110 || config.port === 995) {
		warnings.push(`Port ${config.port} is typically used for POP3, not SMTP`);
		suggestions.push('Check if you should be using POP3 instead of SMTP');
	} else {
		warnings.push(`Port ${config.port} is not a standard SMTP port`);
	}
	
	// Provider-specific validation
	let detectedProvider: EmailProvider | undefined;
	
	if (providerId) {
		const provider = getProviderById(providerId);
		if (provider) {
			detectedProvider = provider;
			
			// Check if provider supports SMTP
			if (!providerSupportsSmtp(providerId)) {
				warnings.push(`Provider ${provider.name} does not typically support SMTP`);
			}
			
			// Check if provider requires app password
			if (provider.requiresAppPassword) {
				// Simple check for app password format
				if (config.auth.pass && config.auth.pass.length < 16) {
					warnings.push(`${provider.name} may require an app password instead of your regular password`);
					suggestions.push('Generate an app password in your account security settings');
				}
			}
			
			// Check if default host/port matches
			if (provider.smtp) {
				if (config.host !== provider.smtp.host) {
					warnings.push(`Host ${config.host} differs from default ${provider.smtp.host} for ${provider.name}`);
				}
				
				if (config.port !== provider.smtp.port) {
					warnings.push(`Port ${config.port} differs from default ${provider.smtp.port} for ${provider.name}`);
				}
				
				if (config.secure !== provider.smtp.secure) {
					warnings.push(`SSL setting (secure: ${config.secure}) differs from default (secure: ${provider.smtp.secure}) for ${provider.name}`);
				}
			}
		}
	}
	
	// Try to detect provider from host
	if (!detectedProvider) {
		detectedProvider = detectProviderFromHost(config.host);
		if (detectedProvider) {
			warnings.push(`Detected provider: ${detectedProvider.name} (from hostname)`);
		}
	}
	
	// Check for unsafe providers
	if (detectedProvider) {
		const safetyCheck = checkProviderSafety(detectedProvider.id);
		if (!safetyCheck.safe) {
			warnings.push(...safetyCheck.issues);
			suggestions.push(...safetyCheck.recommendations);
		}
	}
	
	// Check for free tier limitations
	if (detectedProvider && isFreeTier(detectedProvider.id)) {
		warnings.push(`Provider ${detectedProvider.name} is in free tier, which may have sending limits`);
	}
	
	// Check for sandbox requirements
	if (detectedProvider && requiresSandbox(detectedProvider.id)) {
		warnings.push(`Provider ${detectedProvider.name} requires sandbox mode. You can only send to pre-authorized recipients.`);
		suggestions.push('Request production access or verify your sending domain');
	}
	
	return {
		valid: errors.length === 0,
		errors,
		warnings,
		suggestions,
		detectedProvider
	};
}

/**
 * Detect provider from hostname
 */
function detectProviderFromHost(host: string): EmailProvider | undefined {
	const hostLower = host.toLowerCase();
	
	// Check for known provider hostnames
	const providerHosts: Record<string, string> = {
		'imap.gmail.com': 'gmail',
		'smtp.gmail.com': 'gmail',
		'imap-mail.outlook.com': 'outlook',
		'outlook.office365.com': 'outlook',
		'smtp.office365.com': 'outlook',
		'imap.mail.yahoo.com': 'yahoo',
		'smtp.mail.yahoo.com': 'yahoo',
		'imap.mail.me.com': 'icloud',
		'smtp.mail.me.com': 'icloud',
		'smtp-relay.brevo.com': 'brevo',
		'smtp.sendgrid.net': 'sendgrid',
		'smtp.mailgun.org': 'mailgun',
		'smtp.postmarkapp.com': 'postmark',
		'email-smtp.': 'ses' // AWS SES (region-specific)
	};
	
	for (const [hostPattern, providerId] of Object.entries(providerHosts)) {
		if (hostLower.includes(hostPattern)) {
			return getProviderById(providerId);
		}
	}
	
	return undefined;
}

/**
 * Check provider safety
 */
function checkProviderSafety(providerId: string): {
	safe: boolean;
	issues: string[];
	recommendations: string[];
} {
	const issues: string[] = [];
	const recommendations: string[] = [];
	
	// Check for unsafe providers
	const unsafeProviders = ['cpanel', 'plesk', 'shared-hosting', 'godaddy-workspace', 'hostgator', 'bluehost'];
	
	for (const unsafe of unsafeProviders) {
		if (providerId.toLowerCase().includes(unsafe)) {
			issues.push(`Provider "${providerId}" is often associated with spam and poor deliverability`);
			recommendations.push('Consider switching to a dedicated email service like Brevo, SendGrid, or Mailgun');
			return {
				safe: false,
				issues,
				recommendations
			};
		}
	}
	
	// Check personal providers for business use
	const personalProviders = ['gmail', 'outlook', 'yahoo', 'icloud', 'aol'];
	if (personalProviders.includes(providerId.toLowerCase())) {
		issues.push(`Personal email provider "${providerId}" is not designed for business/bulk sending`);
		recommendations.push('For business email, consider using a transactional email service');
	}
	
	return {
		safe: issues.length === 0,
		issues,
		recommendations
	};
}

/**
 * Validate complete email account settings (IMAP + SMTP)
 */
export function validateEmailAccountSettings(options: {
	imap?: ImapConnectionConfig;
	smtp?: SmtpConnectionConfig;
	providerId?: string;
	email?: string;
}): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];
	const suggestions: string[] = [];
	
	// Validate IMAP if provided
	let imapResult: ValidationResult | undefined;
	if (options.imap) {
		imapResult = validateImapSettings(options.imap, options.providerId);
		errors.push(...imapResult.errors);
		warnings.push(...imapResult.warnings);
		suggestions.push(...imapResult.suggestions);
	}
	
	// Validate SMTP if provided
	let smtpResult: ValidationResult | undefined;
	if (options.smtp) {
		smtpResult = validateSmtpSettings(options.smtp, options.providerId);
		errors.push(...smtpResult.errors);
		warnings.push(...smtpResult.warnings);
		suggestions.push(...smtpResult.suggestions);
	}
	
	// Check if both IMAP and SMTP are missing
	if (!options.imap && !options.smtp) {
		errors.push('Either IMAP or SMTP configuration is required');
	}
	
	// Check for consistency between IMAP and SMTP
	if (imapResult?.detectedProvider && smtpResult?.detectedProvider) {
		if (imapResult.detectedProvider.id !== smtpResult.detectedProvider.id) {
			warnings.push(`IMAP provider (${imapResult.detectedProvider.name}) differs from SMTP provider (${smtpResult.detectedProvider.name})`);
			suggestions.push('Ensure both IMAP and SMTP are configured for the same provider');
		}
	}
	
	// Check email format if provided
	if (options.email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(options.email)) {
			errors.push('Invalid email address format');
		}
	}
	
	return {
		valid: errors.length === 0,
		errors,
		warnings,
		suggestions,
		detectedProvider: imapResult?.detectedProvider || smtpResult?.detectedProvider
	};
}

/**
 * Test connection settings (placeholder - would actually test connection)
 */
export async function testConnectionSettings(options: {
	imap?: ImapConnectionConfig;
	smtp?: SmtpConnectionConfig;
}): Promise<{
	imapSuccess?: boolean;
	smtpSuccess?: boolean;
	imapError?: string;
	smtpError?: string;
}> {
	console.log('[Settings Validation] Testing connection settings (placeholder)');
	
	// In a real implementation, this would actually test the connections
	// For now, return placeholder results
	
	const result: {
		imapSuccess?: boolean;
		smtpSuccess?: boolean;
		imapError?: string;
		smtpError?: string;
	} = {};
	
	if (options.imap) {
		// Simulate IMAP connection test
		console.log(`  Testing IMAP connection to ${options.imap.host}:${options.imap.port}`);
		result.imapSuccess = true; // Assume success for placeholder
	}
	
	if (options.smtp) {
		// Simulate SMTP connection test
		console.log(`  Testing SMTP connection to ${options.smtp.host}:${options.smtp.port}`);
		result.smtpSuccess = true; // Assume success for placeholder
	}
	
	return result;
}

/**
 * Get configuration suggestions based on provider
 */
export function getConfigurationSuggestions(providerId: string): {
	imap?: ImapConnectionConfig;
	smtp?: SmtpConnectionConfig;
	warnings: string[];
} {
	const provider = getProviderById(providerId);
	const warnings: string[] = [];
	
	if (!provider) {
		return { warnings: [`Unknown provider: ${providerId}`] };
	}
	
	const result: {
		imap?: ImapConnectionConfig;
		smtp?: SmtpConnectionConfig;
		warnings: string[];
	} = { warnings };
	
	// Provide IMAP configuration if supported
	if (provider.imap) {
		result.imap = {
			host: provider.imap.host,
			port: provider.imap.port,
			secure: provider.imap.secure,
			auth: {
				user: '',
				pass: ''
			},
			clientId: 'OscarAI'
		};
	}
	
	// Provide SMTP configuration if supported
	if (provider.smtp) {
		result.smtp = {
			host: provider.smtp.host,
			port: provider.smtp.port,
			secure: provider.smtp.secure,
			auth: {
				user: '',
				pass: ''
			},
			timeout: 30000
		};
	}
	
	// Add warnings based on provider
	if (provider.requiresAppPassword) {
		warnings.push(`${provider.name} requires an app password for third-party access`);
	}
	
	if (isFreeTier(providerId)) {
		warnings.push(`${provider.name} free tier has sending limits`);
	}
	
	if (requiresSandbox(providerId)) {
		warnings.push(`${provider.name} requires sandbox mode. You'll need to request production access.`);
	}
	
	return result;
}
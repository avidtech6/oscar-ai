/**
 * Smart Share Registry
 * 
 * Registry for Smart Share providers, capabilities, and patterns.
 * Provides detection and matching for automated email setup assistance.
 */

import type {
	SmartShareProviderCapability,
	SmartShareAssistanceType
} from './smartShareTypes';

/**
 * Known email providers and their Smart Share capabilities
 */
export const providerCapabilities: SmartShareProviderCapability[] = [
	// Gmail / Google Workspace
	{
		providerName: 'Gmail',
		supportedAssistanceTypes: [
			'provider-setup',
			'app-password',
			'oauth-setup',
			'dkim-spf-instructions',
			'dns-configuration'
		],
		supportsEmailScanning: true,
		supportsApiKeyExtraction: false,
		supportsVerificationCodeExtraction: true,
		supportsDnsConfiguration: true,
		emailPatterns: [
			'*@gmail.com',
			'*@googlemail.com',
			'*@yourdomain.com' // For Google Workspace
		],
		senderPatterns: [
			'*@google.com',
			'*@accounts.google.com',
			'*@mail.google.com',
			'noreply@google.com'
		],
		subjectPatterns: [
			'*verification code*',
			'*confirm your email*',
			'*Google Account*',
			'*App password*',
			'*Sign-in attempt*'
		]
	},
	
	// Microsoft Outlook / Office 365
	{
		providerName: 'Outlook',
		supportedAssistanceTypes: [
			'provider-setup',
			'app-password',
			'oauth-setup',
			'dkim-spf-instructions',
			'dns-configuration'
		],
		supportsEmailScanning: true,
		supportsApiKeyExtraction: false,
		supportsVerificationCodeExtraction: true,
		supportsDnsConfiguration: true,
		emailPatterns: [
			'*@outlook.com',
			'*@hotmail.com',
			'*@live.com',
			'*@msn.com',
			'*@office365.com'
		],
		senderPatterns: [
			'*@microsoft.com',
			'*@account.microsoft.com',
			'*@outlook.com',
			'*@office365.com'
		],
		subjectPatterns: [
			'*verification code*',
			'*security code*',
			'*Microsoft account*',
			'*App password*',
			'*Office 365*'
		]
	},
	
	// iCloud / Apple
	{
		providerName: 'iCloud',
		supportedAssistanceTypes: [
			'provider-setup',
			'app-password',
			'verification-code'
		],
		supportsEmailScanning: true,
		supportsApiKeyExtraction: false,
		supportsVerificationCodeExtraction: true,
		supportsDnsConfiguration: false,
		emailPatterns: [
			'*@icloud.com',
			'*@me.com',
			'*@mac.com'
		],
		senderPatterns: [
			'*@apple.com',
			'*@icloud.com',
			'*@id.apple.com'
		],
		subjectPatterns: [
			'*Apple ID*',
			'*verification code*',
			'*sign in*',
			'*app-specific password*'
		]
	},
	
	// Yahoo
	{
		providerName: 'Yahoo',
		supportedAssistanceTypes: [
			'provider-setup',
			'app-password',
			'verification-code'
		],
		supportsEmailScanning: true,
		supportsApiKeyExtraction: false,
		supportsVerificationCodeExtraction: true,
		supportsDnsConfiguration: false,
		emailPatterns: [
			'*@yahoo.com',
			'*@ymail.com',
			'*@rocketmail.com'
		],
		senderPatterns: [
			'*@yahoo.com',
			'*@yahoo-inc.com',
			'*@account.yahoo.com'
		],
		subjectPatterns: [
			'*Yahoo*',
			'*verification code*',
			'*account security*',
			'*app password*'
		]
	},
	
	// Brevo (formerly Sendinblue)
	{
		providerName: 'Brevo',
		supportedAssistanceTypes: [
			'provider-setup',
			'api-key',
			'dkim-spf-instructions',
			'dns-configuration'
		],
		supportsEmailScanning: true,
		supportsApiKeyExtraction: true,
		supportsVerificationCodeExtraction: true,
		supportsDnsConfiguration: true,
		emailPatterns: [
			'*@brevo.com',
			'*@sendinblue.com'
		],
		senderPatterns: [
			'*@brevo.com',
			'*@sendinblue.com',
			'*@notifications.brevo.com'
		],
		subjectPatterns: [
			'*Welcome to Brevo*',
			'*Your API key*',
			'*Verify your email*',
			'*DNS configuration*',
			'*SMTP settings*'
		]
	},
	
	// SendGrid
	{
		providerName: 'SendGrid',
		supportedAssistanceTypes: [
			'provider-setup',
			'api-key',
			'dkim-spf-instructions',
			'dns-configuration'
		],
		supportsEmailScanning: true,
		supportsApiKeyExtraction: true,
		supportsVerificationCodeExtraction: true,
		supportsDnsConfiguration: true,
		emailPatterns: [
			'*@sendgrid.com',
			'*@twilio.com'
		],
		senderPatterns: [
			'*@sendgrid.com',
			'*@twilio.com',
			'*@notifications.sendgrid.com'
		],
		subjectPatterns: [
			'*Welcome to SendGrid*',
			'*Your API Key*',
			'*Verify your email*',
			'*Domain authentication*',
			'*SMTP credentials*'
		]
	},
	
	// Mailgun
	{
		providerName: 'Mailgun',
		supportedAssistanceTypes: [
			'provider-setup',
			'api-key',
			'dkim-spf-instructions',
			'dns-configuration'
		],
		supportsEmailScanning: true,
		supportsApiKeyExtraction: true,
		supportsVerificationCodeExtraction: true,
		supportsDnsConfiguration: true,
		emailPatterns: [
			'*@mailgun.com',
			'*@mailgun.org'
		],
		senderPatterns: [
			'*@mailgun.com',
			'*@mailgun.org',
			'*@notifications.mailgun.com'
		],
		subjectPatterns: [
			'*Welcome to Mailgun*',
			'*Your API key*',
			'*Domain verification*',
			'*SMTP credentials*',
			'*DNS records*'
		]
	},
	
	// Postmark
	{
		providerName: 'Postmark',
		supportedAssistanceTypes: [
			'provider-setup',
			'api-key',
			'dkim-spf-instructions',
			'dns-configuration'
		],
		supportsEmailScanning: true,
		supportsApiKeyExtraction: true,
		supportsVerificationCodeExtraction: true,
		supportsDnsConfiguration: true,
		emailPatterns: [
			'*@postmarkapp.com',
			'*@wildbit.com'
		],
		senderPatterns: [
			'*@postmarkapp.com',
			'*@wildbit.com',
			'*@notifications.postmarkapp.com'
		],
		subjectPatterns: [
			'*Welcome to Postmark*',
			'*Your server API token*',
			'*Verify your domain*',
			'*SPF/DKIM setup*',
			'*SMTP settings*'
		]
	},
	
	// Amazon SES
	{
		providerName: 'Amazon SES',
		supportedAssistanceTypes: [
			'provider-setup',
			'api-key',
			'dkim-spf-instructions',
			'dns-configuration'
		],
		supportsEmailScanning: true,
		supportsApiKeyExtraction: true,
		supportsVerificationCodeExtraction: true,
		supportsDnsConfiguration: true,
		emailPatterns: [
			'*@amazon.com',
			'*@aws.amazon.com'
		],
		senderPatterns: [
			'*@amazon.com',
			'*@aws.amazon.com',
			'*@ses.amazonaws.com'
		],
		subjectPatterns: [
			'*Amazon SES*',
			'*AWS credentials*',
			'*Domain verification*',
			'*DKIM setup*',
			'*SMTP settings*'
		]
	},
	
	// Custom SMTP
	{
		providerName: 'Custom SMTP',
		supportedAssistanceTypes: [
			'provider-setup',
			'dkim-spf-instructions',
			'dns-configuration'
		],
		supportsEmailScanning: false,
		supportsApiKeyExtraction: false,
		supportsVerificationCodeExtraction: false,
		supportsDnsConfiguration: true,
		emailPatterns: [],
		senderPatterns: [],
		subjectPatterns: []
	}
];

/**
 * Pattern matchers for different assistance types
 */
export const assistanceTypePatterns: Record<SmartShareAssistanceType, {
	keywords: string[];
	patterns: RegExp[];
	priority: number;
}> = {
	'provider-setup': {
		keywords: ['setup', 'configure', 'settings', 'credentials', 'smtp', 'imap'],
		patterns: [
			/setup.*email/i,
			/configure.*provider/i,
			/email.*settings/i,
			/smtp.*credentials/i,
			/imap.*settings/i
		],
		priority: 1
	},
	'verification-code': {
		keywords: ['verification', 'code', 'confirm', 'verify', 'otp', 'security code'],
		patterns: [
			/verification.*code/i,
			/security.*code/i,
			/confirm.*email/i,
			/otp.*is/i,
			/code.*is.*\d{4,8}/i
		],
		priority: 2
	},
	'api-key': {
		keywords: ['api key', 'api token', 'secret key', 'access token', 'credentials'],
		patterns: [
			/api.*key/i,
			/api.*token/i,
			/secret.*key/i,
			/access.*token/i,
			/credentials.*:/i
		],
		priority: 3
	},
	'app-password': {
		keywords: ['app password', 'application password', 'app-specific', 'generated password'],
		patterns: [
			/app.*password/i,
			/application.*password/i,
			/app-specific.*password/i,
			/generated.*password/i
		],
		priority: 2
	},
	'oauth-setup': {
		keywords: ['oauth', 'oauth2', 'authorization', 'consent', 'permissions'],
		patterns: [
			/oauth.*setup/i,
			/authorization.*code/i,
			/consent.*screen/i,
			/permissions.*required/i
		],
		priority: 3
	},
	'dkim-spf-instructions': {
		keywords: ['dkim', 'spf', 'dmarc', 'dns', 'authentication', 'records'],
		patterns: [
			/dkim.*record/i,
			/spf.*record/i,
			/dmarc.*record/i,
			/dns.*configuration/i,
			/domain.*authentication/i
		],
		priority: 4
	},
	'dns-configuration': {
		keywords: ['dns', 'mx record', 'txt record', 'cname', 'nameserver'],
		patterns: [
			/dns.*settings/i,
			/mx.*record/i,
			/txt.*record/i,
			/cname.*record/i,
			/nameserver.*update/i
		],
		priority: 4
	},
	'general': {
		keywords: ['help', 'assistance', 'support', 'guide', 'tutorial'],
		patterns: [
			/need.*help/i,
			/assistance.*required/i,
			/support.*needed/i,
			/how.*to.*setup/i
		],
		priority: 5
	}
};

/**
 * Registry for managing Smart Share providers and patterns
 */
export class SmartShareRegistry {
	private capabilities: Map<string, SmartShareProviderCapability> = new Map();
	private providerPatterns: Map<string, RegExp[]> = new Map();

	constructor() {
		this.initialize();
	}

	/**
	 * Initialize the registry
	 */
	private initialize(): void {
		// Register all provider capabilities
		for (const capability of providerCapabilities) {
			this.capabilities.set(capability.providerName, capability);
			
			// Compile email patterns to regex
			const emailRegexes = capability.emailPatterns.map(pattern => {
				const regexPattern = pattern.replace(/\*/g, '.*').replace(/\./g, '\\.');
				return new RegExp(`^${regexPattern}$`, 'i');
			});
			this.providerPatterns.set(capability.providerName, emailRegexes);
		}
	}

	/**
	 * Detect provider from email address
	 */
	detectProviderFromEmail(email: string): string | null {
		const emailLower = email.toLowerCase();
		
		for (const [providerName, regexes] of this.providerPatterns.entries()) {
			for (const regex of regexes) {
				if (regex.test(emailLower)) {
					return providerName;
				}
			}
		}
		
		// Fallback: check domain patterns
		const domain = emailLower.split('@')[1];
		if (!domain) return null;
		
		// Common domain patterns
		const domainPatterns: Record<string, string> = {
			'gmail.com': 'Gmail',
			'googlemail.com': 'Gmail',
			'outlook.com': 'Outlook',
			'hotmail.com': 'Outlook',
			'live.com': 'Outlook',
			'msn.com': 'Outlook',
			'office365.com': 'Outlook',
			'icloud.com': 'iCloud',
			'me.com': 'iCloud',
			'mac.com': 'iCloud',
			'yahoo.com': 'Yahoo',
			'ymail.com': 'Yahoo',
			'rocketmail.com': 'Yahoo',
			'brevo.com': 'Brevo',
			'sendinblue.com': 'Brevo',
			'sendgrid.com': 'SendGrid',
			'twilio.com': 'SendGrid',
			'mailgun.com': 'Mailgun',
			'mailgun.org': 'Mailgun',
			'postmarkapp.com': 'Postmark',
			'wildbit.com': 'Postmark',
			'amazon.com': 'Amazon SES',
			'aws.amazon.com': 'Amazon SES'
		};
		
		return domainPatterns[domain] || null;
	}

	/**
	 * Get provider capability by name
	 */
	getProviderCapability(providerName: string): SmartShareProviderCapability | null {
		return this.capabilities.get(providerName) || null;
	}

	/**
	 * Get all provider capabilities
	 */
	getAllProviderCapabilities(): SmartShareProviderCapability[] {
		return Array.from(this.capabilities.values());
	}

	/**
	 * Get providers that support a specific assistance type
	 */
	getProvidersByAssistanceType(assistanceType: SmartShareAssistanceType): string[] {
		const providers: string[] = [];
		
		for (const capability of this.capabilities.values()) {
			if (capability.supportedAssistanceTypes.includes(assistanceType)) {
				providers.push(capability.providerName);
			}
		}
		
		return providers;
	}
/**
 * Detect assistance type from text
 */
detectAssistanceType(text: string): SmartShareAssistanceType[] {
	const detectedTypes: Array<{ type: SmartShareAssistanceType; score: number }> = [];
	const textLower = text.toLowerCase();
	
	for (const [type, patterns] of Object.entries(assistanceTypePatterns)) {
		let score = 0;
		
		// Check keywords
		for (const keyword of patterns.keywords) {
			if (textLower.includes(keyword.toLowerCase())) {
				score += 2;
			}
		}
		
		// Check regex patterns
		for (const pattern of patterns.patterns) {
			if (pattern.test(textLower)) {
				score += 3;
			}
		}
		
		if (score > 0) {
			detectedTypes.push({
				type: type as SmartShareAssistanceType,
				score: score - patterns.priority // Adjust by priority
			});
		}
	}
	
	// Sort by score (highest first) and return types
	return detectedTypes
		.sort((a, b) => b.score - a.score)
		.map(item => item.type)
		.slice(0, 3); // Return top 3 types
}

/**
 * Get assistance type patterns
 */
getAssistanceTypePatterns(type: SmartShareAssistanceType) {
	return assistanceTypePatterns[type];
}

/**
 * Check if provider supports assistance type
 */
providerSupportsAssistanceType(providerName: string, assistanceType: SmartShareAssistanceType): boolean {
	const capability = this.capabilities.get(providerName);
	if (!capability) return false;
	
	return capability.supportedAssistanceTypes.includes(assistanceType);
}

/**
 * Get sender patterns for provider
 */
getSenderPatterns(providerName: string): string[] {
	const capability = this.capabilities.get(providerName);
	return capability?.senderPatterns || [];
}

/**
 * Get subject patterns for provider
 */
getSubjectPatterns(providerName: string): string[] {
	const capability = this.capabilities.get(providerName);
	return capability?.subjectPatterns || [];
}

/**
 * Match email against provider patterns
 */
matchEmailAgainstProvider(email: string, providerName: string): boolean {
	const regexes = this.providerPatterns.get(providerName);
	if (!regexes) return false;
	
	const emailLower = email.toLowerCase();
	return regexes.some(regex => regex.test(emailLower));
}

/**
 * Get all provider names
 */
getAllProviderNames(): string[] {
	return Array.from(this.capabilities.keys());
}

/**
 * Add custom provider capability
 */
addProviderCapability(capability: SmartShareProviderCapability): void {
	this.capabilities.set(capability.providerName, capability);
	
	// Compile email patterns to regex
	const emailRegexes = capability.emailPatterns.map(pattern => {
		const regexPattern = pattern.replace(/\*/g, '.*').replace(/\./g, '\\.');
		return new RegExp(`^${regexPattern}$`, 'i');
	});
	this.providerPatterns.set(capability.providerName, emailRegexes);
}

/**
 * Remove provider capability
 */
removeProviderCapability(providerName: string): boolean {
	const deleted = this.capabilities.delete(providerName);
	this.providerPatterns.delete(providerName);
	return deleted;
}

/**
 * Clear all provider capabilities
 */
clear(): void {
	this.capabilities.clear();
	this.providerPatterns.clear();
}
}

// Export singleton instance
export const smartShareRegistry = new SmartShareRegistry();
		
	
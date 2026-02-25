/**
 * Provider Validation
 * 
 * Validation rules and checks for email provider configurations.
 * Ensures provider settings are correct, secure, and optimized.
 */

import type { ProviderConfig } from './providerIntelligence';

/**
 * Validation result
 */
export interface ValidationResult {
	/** Whether validation passed */
	valid: boolean;
	
	/** Validation errors */
	errors: ValidationError[];
	
	/** Validation warnings */
	warnings: ValidationWarning[];
	
	/** Validation suggestions */
	suggestions: ValidationSuggestion[];
	
	/** Overall score (0-100) */
	score: number;
}

/**
 * Validation error
 */
export interface ValidationError {
	/** Error code */
	code: string;
	
	/** Error message */
	message: string;
	
	/** Field that caused the error */
	field?: string;
	
	/** How to fix the error */
	fix: string;
	
	/** Priority (higher = more critical) */
	priority: number;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
	/** Warning code */
	code: string;
	
	/** Warning message */
	message: string;
	
	/** Field that caused the warning */
	field?: string;
	
	/** Recommendation */
	recommendation: string;
	
	/** Priority (higher = more important) */
	priority: number;
}

/**
 * Validation suggestion
 */
export interface ValidationSuggestion {
	/** Suggestion code */
	code: string;
	
	/** Suggestion message */
	message: string;
	
	/** Benefit of implementing */
	benefit: string;
	
	/** Effort required */
	effort: 'low' | 'medium' | 'high';
}

/**
 * Provider configuration to validate
 */
export interface ProviderConfigToValidate {
	/** Provider ID */
	providerId: string;
	
	/** IMAP settings */
	imap?: {
		host: string;
		port: number;
		encryption: 'ssl' | 'tls' | 'starttls' | 'none';
		username: string;
		password?: string;
		appPassword?: boolean;
	};
	
	/** SMTP settings */
	smtp?: {
		host: string;
		port: number;
		encryption: 'ssl' | 'tls' | 'starttls' | 'none';
		username: string;
		password?: string;
		requiresAuth: boolean;
	};
	
	/** API settings */
	api?: {
		endpoint: string;
		apiKey?: string;
		apiSecret?: string;
	};
	
	/** Domain settings */
	domain?: {
		domainName: string;
		dkimConfigured: boolean;
		spfConfigured: boolean;
		dmarcConfigured: boolean;
	};
	
	/** Security settings */
	security?: {
		requires2fa: boolean;
		appPasswordUsed: boolean;
		oauthUsed: boolean;
	};
	
	/** Free tier status */
	freeTier?: boolean;
}

/**
 * Provider validation engine
 */
export class ProviderValidation {
	private providerIntelligence: any; // Would import providerIntelligence in real implementation

	constructor() {
		// In a real implementation, we would import providerIntelligence
		// For now, we'll create a mock
	}

	/**
	 * Validate provider configuration
	 */
	validate(config: ProviderConfigToValidate): ValidationResult {
		const errors: ValidationError[] = [];
		const warnings: ValidationWarning[] = [];
		const suggestions: ValidationSuggestion[] = [];
		
		// Get provider reference configuration
		const providerRef = this.getProviderReference(config.providerId);
		
		// Run validation checks
		this.validateImap(config, providerRef, errors, warnings, suggestions);
		this.validateSmtp(config, providerRef, errors, warnings, suggestions);
		this.validateApi(config, providerRef, errors, warnings, suggestions);
		this.validateSecurity(config, providerRef, errors, warnings, suggestions);
		this.validateDomain(config, providerRef, errors, warnings, suggestions);
		
		// Calculate score
		const score = this.calculateScore(errors, warnings, suggestions);
		
		return {
			valid: errors.length === 0,
			errors,
			warnings,
			suggestions,
			score
		};
	}

	/**
	 * Validate IMAP settings
	 */
	private validateImap(
		config: ProviderConfigToValidate,
		providerRef: ProviderConfig | undefined,
		errors: ValidationError[],
		warnings: ValidationWarning[],
		suggestions: ValidationSuggestion[]
	): void {
		if (!config.imap) return;
		
		const { imap } = config;
		
		// Check required fields
		if (!imap.host) {
			errors.push({
				code: 'IMAP_HOST_MISSING',
				message: 'IMAP host is required',
				field: 'imap.host',
				fix: 'Enter the IMAP server hostname',
				priority: 100
			});
		}
		
		if (!imap.port) {
			errors.push({
				code: 'IMAP_PORT_MISSING',
				message: 'IMAP port is required',
				field: 'imap.port',
				fix: 'Enter the IMAP server port',
				priority: 100
			});
		}
		
		if (!imap.username) {
			errors.push({
				code: 'IMAP_USERNAME_MISSING',
				message: 'IMAP username is required',
				field: 'imap.username',
				fix: 'Enter your email address or username',
				priority: 100
			});
		}
		
		// Check against reference configuration
		if (providerRef?.imap) {
			const ref = providerRef.imap;
			
			// Check port
			if (imap.port !== ref.port) {
				warnings.push({
					code: 'IMAP_PORT_MISMATCH',
					message: `IMAP port ${imap.port} differs from recommended port ${ref.port}`,
					field: 'imap.port',
					recommendation: `Use port ${ref.port} for better compatibility`,
					priority: 70
				});
			}
			
			// Check encryption
			if (imap.encryption !== ref.encryption) {
				warnings.push({
					code: 'IMAP_ENCRYPTION_MISMATCH',
					message: `IMAP encryption ${imap.encryption} differs from recommended ${ref.encryption}`,
					field: 'imap.encryption',
					recommendation: `Use ${ref.encryption} encryption for security`,
					priority: 80
				});
			}
			
			// Check app password requirement
			if (ref.requiresAppPassword && !imap.appPassword) {
				warnings.push({
					code: 'APP_PASSWORD_RECOMMENDED',
					message: 'App password recommended for IMAP access',
					field: 'imap.password',
					recommendation: 'Use app-specific password instead of regular password',
					priority: 90
				});
			}
		}
		
		// Check encryption security
		if (imap.encryption === 'none') {
			warnings.push({
				code: 'IMAP_NO_ENCRYPTION',
				message: 'IMAP connection is not encrypted',
				field: 'imap.encryption',
				recommendation: 'Use SSL or TLS encryption for security',
				priority: 95
			});
		}
		
		// Check for common mistakes
		if (imap.host.includes('gmail.com') && imap.port === 143) {
			errors.push({
				code: 'GMAIL_PORT_MISMATCH',
				message: 'Gmail requires port 993 for IMAP with SSL',
				field: 'imap.port',
				fix: 'Change port to 993 and encryption to SSL',
				priority: 100
			});
		}
	}

	/**
	 * Validate SMTP settings
	 */
	private validateSmtp(
		config: ProviderConfigToValidate,
		providerRef: ProviderConfig | undefined,
		errors: ValidationError[],
		warnings: ValidationWarning[],
		suggestions: ValidationSuggestion[]
	): void {
		if (!config.smtp) return;
		
		const { smtp } = config;
		
		// Check required fields
		if (!smtp.host) {
			errors.push({
				code: 'SMTP_HOST_MISSING',
				message: 'SMTP host is required',
				field: 'smtp.host',
				fix: 'Enter the SMTP server hostname',
				priority: 100
			});
		}
		
		if (!smtp.port) {
			errors.push({
				code: 'SMTP_PORT_MISSING',
				message: 'SMTP port is required',
				field: 'smtp.port',
				fix: 'Enter the SMTP server port',
				priority: 100
			});
		}
		
		// Check against reference configuration
		if (providerRef?.smtp) {
			const ref = providerRef.smtp;
			
			// Check port
			if (smtp.port !== ref.port) {
				warnings.push({
					code: 'SMTP_PORT_MISMATCH',
					message: `SMTP port ${smtp.port} differs from recommended port ${ref.port}`,
					field: 'smtp.port',
					recommendation: `Use port ${ref.port} for better compatibility`,
					priority: 70
				});
			}
			
			// Check encryption
			if (smtp.encryption !== ref.encryption) {
				warnings.push({
					code: 'SMTP_ENCRYPTION_MISMATCH',
					message: `SMTP encryption ${smtp.encryption} differs from recommended ${ref.encryption}`,
					field: 'smtp.encryption',
					recommendation: `Use ${ref.encryption} encryption for security`,
					priority: 80
				});
			}
			
			// Check authentication requirement
			if (ref.requiresAuthentication && !smtp.requiresAuth) {
				warnings.push({
					code: 'SMTP_AUTH_RECOMMENDED',
					message: 'SMTP authentication is recommended',
					field: 'smtp.requiresAuth',
					recommendation: 'Enable SMTP authentication for security',
					priority: 85
				});
			}
		}
		
		// Check encryption security
		if (smtp.encryption === 'none') {
			warnings.push({
				code: 'SMTP_NO_ENCRYPTION',
				message: 'SMTP connection is not encrypted',
				field: 'smtp.encryption',
				recommendation: 'Use SSL or TLS encryption for security',
				priority: 95
			});
		}
		
		// Check for STARTTLS on port 587
		if (smtp.port === 587 && smtp.encryption !== 'starttls') {
			warnings.push({
				code: 'STARTTLS_RECOMMENDED',
				message: 'Port 587 typically requires STARTTLS encryption',
				field: 'smtp.encryption',
				recommendation: 'Use STARTTLS encryption on port 587',
				priority: 75
			});
		}
		
		// Check for SSL on port 465
		if (smtp.port === 465 && smtp.encryption !== 'ssl') {
			warnings.push({
				code: 'SSL_RECOMMENDED',
				message: 'Port 465 typically requires SSL encryption',
				field: 'smtp.encryption',
				recommendation: 'Use SSL encryption on port 465',
				priority: 75
			});
		}
	}

	/**
	 * Validate API settings
	 */
	private validateApi(
		config: ProviderConfigToValidate,
		providerRef: ProviderConfig | undefined,
		errors: ValidationError[],
		warnings: ValidationWarning[],
		suggestions: ValidationSuggestion[]
	): void {
		if (!config.api) return;
		
		const { api } = config;
		
		// Check API key for API-based providers
		if (providerRef?.authMethod === 'api-key' && !api.apiKey) {
			errors.push({
				code: 'API_KEY_MISSING',
				message: 'API key is required for this provider',
				field: 'api.apiKey',
				fix: 'Enter your API key from the provider dashboard',
				priority: 100
			});
		}
		
		// Check endpoint format
		if (api.endpoint && !api.endpoint.startsWith('http')) {
			warnings.push({
				code: 'API_ENDPOINT_FORMAT',
				message: 'API endpoint should start with http:// or https://',
				field: 'api.endpoint',
				recommendation: 'Use full URL including protocol',
				priority: 60
			});
		}
		
		// Suggest API key rotation
		if (api.apiKey) {
			suggestions.push({
				code: 'ROTATE_API_KEY',
				message: 'Consider rotating API keys regularly',
				benefit: 'Improves security by limiting exposure of compromised keys',
				effort: 'medium'
			});
		}
	}

	/**
	 * Validate security settings
	 */
	private validateSecurity(
		config: ProviderConfigToValidate,
		providerRef: ProviderConfig | undefined,
		errors: ValidationError[],
		warnings: ValidationWarning[],
		suggestions: ValidationSuggestion[]
	): void {
		const { security } = config;
		if (!security) return;
		
		// Check 2FA requirement
		if (security.requires2fa && !security.appPasswordUsed && !security.oauthUsed) {
			warnings.push({
				code: '2FA_RECOMMENDED',
				message: 'Two-factor authentication is enabled but not configured for app access',
				field: 'security',
				recommendation: 'Use app password or OAuth for 2FA-enabled accounts',
				priority: 90
			});
		}
		
		// Check app password usage
		if (security.appPasswordUsed) {
			suggestions.push({
				code: 'APP_PASSWORD_SECURE',
				message: 'App passwords are more secure than regular passwords',
				benefit: 'Limited scope and can be revoked individually',
				effort: 'low'
			});
		}
		
		// Check OAuth usage
		if (security.oauthUsed) {
			suggestions.push({
				code: 'OAUTH_RECOMMENDED',
				message: 'OAuth is the most secure authentication method',
				benefit: 'No password storage, token-based, revocable',
				effort: 'medium'
			});
		}
	}

	/**
	 * Validate domain settings
	 */
	private validateDomain(
		config: ProviderConfigToValidate,
		providerRef: ProviderConfig | undefined,
		errors: ValidationError[],
		warnings: ValidationWarning[],
		suggestions: ValidationSuggestion[]
	): void {
		const { domain } = config;
		if (!domain) return;
		
		// Check domain name format
		if (domain.domainName && !this.isValidDomain(domain.domainName)) {
			warnings.push({
				code: 'DOMAIN_FORMAT',
				message: `Domain "${domain.domainName}" may not be valid`,
				field: 'domain.domainName',
				recommendation: 'Check domain format (e.g., example.com)',
				priority: 50
			});
		}
		
		// Check DKIM configuration
		if (providerRef?.security.requiresDkim && !domain.dkimConfigured) {
			warnings.push({
				code: 'DKIM_NOT_CONFIGURED',
				message: 'DKIM is not configured but is recommended',
				field: 'domain.dkimConfigured',
				recommendation: 'Configure DKIM to improve email authentication',
				priority: 85
			});
		}
		
		// Check SPF configuration
		if (providerRef?.security.requiresSpf && !domain.spfConfigured) {
			warnings.push({
				code: 'SPF_NOT_CONFIGURED',
				message: 'SPF is not configured but is recommended',
				field: 'domain.spfConfigured',
				recommendation: 'Configure SPF to prevent email spoofing',
				priority: 90
			});
		}
		
		// Check DMARC configuration
		if (providerRef?.security.requiresDmarc && !domain.dmarcConfigured) {
			warnings.push({
				code: 'DMARC_NOT_CONFIGURED',
				message: 'DMARC is not configured but is recommended',
				field: 'domain.dmarcConfigured',
				recommendation: 'Configure DMARC for email reporting and policy enforcement',
				priority: 80
			});
		}
		
		// Suggest domain authentication
		if (!domain.dkimConfigured || !domain.spfConfigured) {
			suggestions.push({
				code: 'DOMAIN_AUTHENTICATION',
				message: 'Set up domain authentication (DKIM/SPF)',
				benefit: 'Improves deliverability and prevents spoofing',
				effort: 'high'
			});
		}
	}

	/**
	 * Calculate validation score
	 */
	private calculateScore(
		errors: ValidationError[],
		warnings: ValidationWarning[],
		suggestions: ValidationSuggestion[]
	): number {
		let score = 100;
		
		// Deduct for errors
		for (const error of errors) {
			score -= error.priority * 0.5; // More critical errors reduce score more
		}
		
		// Deduct for warnings
		for (const warning of warnings) {
			score -= warning.priority * 0.2;
		}
		
		// Add for suggestions (but less than deductions)
		score += suggestions.length * 2;
		
		// Ensure score is between 0 and 100
		return Math.max(0, Math.min(100, Math.round(score)));
	}

	/**
	 * Check if domain is valid
	 */
	private isValidDomain(domain: string): boolean {
		// Simple domain validation
		const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
		return domainRegex.test(domain);
	}

	/**
	 * Get provider reference configuration
	 */
	private getProviderReference(providerId: string): ProviderConfig | undefined {
		// In a real implementation, this would use providerIntelligence
		// For now, return a mock based on providerId
		const mockProviders: Record<string, ProviderConfig> = {
			'gmail': {
				id: 'gmail',
				name: 'Gmail',
				type: 'personal',
				authMethod: 'oauth',
				imap: {
					host: 'imap.gmail.com',
					port: 993,
					encryption: 'ssl',
					requiresAppPassword: true
				},
				smtp: {
					host: 'smtp.gmail.com',
					port: 465,
					encryption: 'ssl',
					requiresAuthentication: true
				},
				security: {
					requiresDkim: true,
					requiresSpf: true,
					requiresDmarc: false,
					requiresSsl: true
				},
				deliverabilityRating: 5,
				setupDifficulty: 2,
				recommendedFor: ['personal', 'small-business'],
				commonIssues: []
			},
			'outlook': {
				id: 'outlook',
				name: 'Outlook',
				type: 'personal',
				authMethod: 'oauth',
				imap: {
					host: 'outlook.office365.com',
					port: 993,
					encryption: 'ssl',
					requiresAppPassword: true
				},
				smtp: {
					host: 'smtp.office365.com',
					port: 587,
					encryption: 'starttls',
					requiresAuthentication: true
				},
				security: {
					requiresDkim: true,
					requiresSpf: true,
					requiresDmarc: true,
					requiresSsl: true
				},
				deliverabilityRating: 5,
				setupDifficulty: 3,
				recommendedFor: ['small-business', 'enterprise'],
				commonIssues: []
			},
			'brevo': {
				id: 'brevo',
				name: 'Brevo',
				type: 'marketing',
				authMethod: 'api-key',
				smtp: {
					host: 'smtp-relay.brevo.com',
					port: 587,
					encryption: 'starttls',
					requiresAuthentication: true
				},
				security: {
					requiresDkim: true,
					requiresSpf: true,
					requiresDmarc: false,
					requiresSsl: true
				},
				deliverabilityRating: 4,
				setupDifficulty: 2,
				recommendedFor: ['marketing', 'small-business'],
				commonIssues: []
			},
			'sendgrid': {
				id: 'sendgrid',
				name: 'SendGrid',
				type: 'transactional',
				authMethod: 'api-key',
				smtp: {
					host: 'smtp.sendgrid.net',
					port: 587,
					encryption: 'starttls',
					requiresAuthentication: true
				},
				security: {
					requiresDkim: true,
					requiresSpf: true,
					requiresDmarc: true,
					requiresSsl: true
				},
				deliverabilityRating: 5,
				setupDifficulty: 3,
				recommendedFor: ['transactional', 'marketing'],
				commonIssues: []
			}
		};
		
		return mockProviders[providerId];
	}

	/**
	 * Get validation summary
	 */
	getValidationSummary(result: ValidationResult): {
		status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
		summary: string;
		nextSteps: string[];
	} {
		const { score, errors, warnings } = result;
		
		let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
		let summary: string;
		const nextSteps: string[] = [];
		
		if (score >= 90) {
			status = 'excellent';
			summary = 'Configuration is excellent and ready for use';
		} else if (score >= 75) {
			status = 'good';
			summary = 'Configuration is good with minor improvements possible';
		} else if (score >= 60) {
			status = 'fair';
			summary = 'Configuration needs attention but is functional';
		} else if (score >= 40) {
			status = 'poor';
			summary = 'Configuration has significant issues';
		} else {
			status = 'critical';
			summary = 'Configuration has critical issues that must be fixed';
		}
		
		// Add next steps based on issues
		if (errors.length > 0) {
			nextSteps.push('Fix critical errors first');
		}
		if (warnings.length > 0) {
			nextSteps.push('Address important warnings');
		}
		if (score < 80) {
			nextSteps.push('Consider implementing suggestions for improvement');
		}
		if (score >= 80) {
			nextSteps.push('Test sending to ensure everything works');
		}
		
		return { status, summary, nextSteps };
	}

	/**
	 * Quick validation for common issues
	 */
	quickValidate(config: ProviderConfigToValidate): {
		hasCriticalIssues: boolean;
		commonIssues: string[];
		quickFixes: string[];
	} {
		const result = this.validate(config);
		
		const commonIssues = result.errors
			.filter(error => error.priority >= 80)
			.map(error => error.message);
		
		const quickFixes = result.errors
			.filter(error => error.priority >= 80)
			.map(error => error.fix);
		
		return {
			hasCriticalIssues: result.errors.some(error => error.priority >= 80),
			commonIssues,
			quickFixes
		};
	}

	/**
	 * Validate specific field
	 */
	validateField(
		config: ProviderConfigToValidate,
		field: string,
		value: any
	): ValidationResult {
		// Create a copy of config with updated field
		const updatedConfig = JSON.parse(JSON.stringify(config));
		
		// Update the field (simplified - in real implementation would use proper path)
		if (field.startsWith('imap.')) {
			const subField = field.replace('imap.', '');
			if (!updatedConfig.imap) updatedConfig.imap = {} as any;
			(updatedConfig.imap as any)[subField] = value;
		} else if (field.startsWith('smtp.')) {
			const subField = field.replace('smtp.', '');
			if (!updatedConfig.smtp) updatedConfig.smtp = {} as any;
			(updatedConfig.smtp as any)[subField] = value;
		} else if (field.startsWith('api.')) {
			const subField = field.replace('api.', '');
			if (!updatedConfig.api) updatedConfig.api = {} as any;
			(updatedConfig.api as any)[subField] = value;
		} else if (field.startsWith('domain.')) {
			const subField = field.replace('domain.', '');
			if (!updatedConfig.domain) updatedConfig.domain = {} as any;
			(updatedConfig.domain as any)[subField] = value;
		} else if (field.startsWith('security.')) {
			const subField = field.replace('security.', '');
			if (!updatedConfig.security) updatedConfig.security = {} as any;
			(updatedConfig.security as any)[subField] = value;
		}
		
		return this.validate(updatedConfig);
	}
}

// Export singleton instance
export const providerValidation = new ProviderValidation();

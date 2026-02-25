/**
 * Provider Intelligence
 * 
 * Intelligence layer for email provider setup, validation, and optimization.
 * Provides smart defaults, validation rules, and setup recommendations.
 */

import type { CopilotContext } from '../context/contextTypes';

/**
 * Provider configuration type
 */
export interface ProviderConfig {
	/** Provider ID */
	id: string;
	
	/** Provider name */
	name: string;
	
	/** Provider type */
	type: 'personal' | 'business' | 'transactional' | 'marketing';
	
	/** Authentication method */
	authMethod: 'password' | 'oauth' | 'api-key' | 'app-password';
	
	/** IMAP settings */
	imap?: {
		host: string;
		port: number;
		encryption: 'ssl' | 'tls' | 'starttls' | 'none';
		requiresAppPassword: boolean;
	};
	
	/** SMTP settings */
	smtp?: {
		host: string;
		port: number;
		encryption: 'ssl' | 'tls' | 'starttls' | 'none';
		requiresAuthentication: boolean;
	};
	
	/** API settings */
	api?: {
		endpoint: string;
		version: string;
		requiresApiKey: boolean;
	};
	
	/** Free tier limits */
	freeTierLimits?: {
		dailySends: number;
		monthlySends: number;
		recipientLimit: number;
		attachmentSizeLimit: number;
	};
	
	/** Security requirements */
	security: {
		requiresDkim: boolean;
		requiresSpf: boolean;
		requiresDmarc: boolean;
		requiresSsl: boolean;
	};
	
	/** Deliverability rating (1-5) */
	deliverabilityRating: number;
	
	/** Setup difficulty (1-5) */
	setupDifficulty: number;
	
	/** Recommended for */
	recommendedFor: Array<'personal' | 'small-business' | 'enterprise' | 'marketing' | 'transactional'>;
	
	/** Common issues */
	commonIssues: Array<{
		issue: string;
		solution: string;
		frequency: 'common' | 'occasional' | 'rare';
	}>;
}

/**
 * Provider setup recommendation
 */
export interface ProviderRecommendation {
	/** Provider ID */
	providerId: string;
	
	/** Provider name */
	providerName: string;
	
	/** Match score (0-100) */
	matchScore: number;
	
	/** Reasons for recommendation */
	reasons: string[];
	
	/** Setup steps */
	setupSteps: Array<{
		step: number;
		title: string;
		description: string;
		estimatedTime: string;
		difficulty: 'easy' | 'medium' | 'hard';
	}>;
	
	/** Estimated setup time */
	estimatedSetupTime: string;
	
	/** Cost estimate */
	costEstimate?: {
		monthly: number;
		currency: string;
		tier: 'free' | 'basic' | 'pro' | 'enterprise';
	};
	
	/** Limitations to be aware of */
	limitations: string[];
	
	/** Best for */
	bestFor: string[];
}

/**
 * Provider intelligence engine
 */
export class ProviderIntelligence {
	private providers: Map<string, ProviderConfig> = new Map();
	private providerPatterns: Map<string, RegExp[]> = new Map();

	constructor() {
		this.initializeProviders();
	}

	/**
	 * Initialize known providers
	 */
	private initializeProviders(): void {
		const providers: ProviderConfig[] = [
			// Gmail / Google Workspace
			{
				id: 'gmail',
				name: 'Gmail / Google Workspace',
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
				freeTierLimits: {
					dailySends: 500,
					monthlySends: 10000,
					recipientLimit: 100,
					attachmentSizeLimit: 25 * 1024 * 1024 // 25MB
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
				commonIssues: [
					{
						issue: 'App password required for IMAP access',
						solution: 'Generate app password in Google Account security settings',
						frequency: 'common'
					},
					{
						issue: 'Less secure apps blocked',
						solution: 'Enable less secure apps or use OAuth',
						frequency: 'common'
					},
					{
						issue: 'Daily sending limits exceeded',
						solution: 'Upgrade to Google Workspace or wait 24 hours',
						frequency: 'occasional'
					}
				]
			},

			// Microsoft Outlook / Office 365
			{
				id: 'outlook',
				name: 'Microsoft Outlook / Office 365',
				type: 'business',
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
				freeTierLimits: {
					dailySends: 300,
					monthlySends: 10000,
					recipientLimit: 100,
					attachmentSizeLimit: 20 * 1024 * 1024 // 20MB
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
				commonIssues: [
					{
						issue: 'Modern authentication required',
						solution: 'Enable modern authentication in Azure AD',
						frequency: 'common'
					},
					{
						issue: 'App password required for IMAP',
						solution: 'Generate app password in Microsoft account security',
						frequency: 'common'
					},
					{
						issue: 'SMTP requires STARTTLS on port 587',
						solution: 'Use port 587 with STARTTLS encryption',
						frequency: 'common'
					}
				]
			},

			// iCloud
			{
				id: 'icloud',
				name: 'iCloud Mail',
				type: 'personal',
				authMethod: 'app-password',
				imap: {
					host: 'imap.mail.me.com',
					port: 993,
					encryption: 'ssl',
					requiresAppPassword: true
				},
				smtp: {
					host: 'smtp.mail.me.com',
					port: 587,
					encryption: 'starttls',
					requiresAuthentication: true
				},
				freeTierLimits: {
					dailySends: 100,
					monthlySends: 1000,
					recipientLimit: 50,
					attachmentSizeLimit: 20 * 1024 * 1024 // 20MB
				},
				security: {
					requiresDkim: false,
					requiresSpf: true,
					requiresDmarc: false,
					requiresSsl: true
				},
				deliverabilityRating: 4,
				setupDifficulty: 4,
				recommendedFor: ['personal'],
				commonIssues: [
					{
						issue: 'App-specific password required',
						solution: 'Generate app-specific password in Apple ID settings',
						frequency: 'common'
					},
					{
						issue: 'Two-factor authentication required',
						solution: 'Enable 2FA on Apple ID',
						frequency: 'common'
					},
					{
						issue: 'Limited sending capacity',
						solution: 'Consider alternative for bulk sending',
						frequency: 'common'
					}
				]
			},

			// Brevo (formerly Sendinblue)
			{
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
				api: {
					endpoint: 'https://api.brevo.com/v3',
					version: 'v3',
					requiresApiKey: true
				},
				freeTierLimits: {
					dailySends: 300,
					monthlySends: 9000,
					recipientLimit: 300,
					attachmentSizeLimit: 10 * 1024 * 1024 // 10MB
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
				commonIssues: [
					{
						issue: 'Free tier daily limit',
						solution: 'Upgrade to paid plan or spread sends across days',
						frequency: 'common'
					},
					{
						issue: 'Domain verification required',
						solution: 'Add DNS records for domain authentication',
						frequency: 'common'
					},
					{
						issue: 'API key security',
						solution: 'Rotate API keys regularly and keep them secure',
						frequency: 'occasional'
					}
				]
			},

			// SendGrid
			{
				id: 'sendgrid',
				name: 'SendGrid (Twilio)',
				type: 'transactional',
				authMethod: 'api-key',
				smtp: {
					host: 'smtp.sendgrid.net',
					port: 587,
					encryption: 'starttls',
					requiresAuthentication: true
				},
				api: {
					endpoint: 'https://api.sendgrid.com/v3',
					version: 'v3',
					requiresApiKey: true
				},
				freeTierLimits: {
					dailySends: 100,
					monthlySends: 3000,
					recipientLimit: 100,
					attachmentSizeLimit: 30 * 1024 * 1024 // 30MB
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
				commonIssues: [
					{
						issue: 'Domain authentication required',
						solution: 'Set up domain authentication in SendGrid dashboard',
						frequency: 'common'
					},
					{
						issue: 'Free tier IP reputation',
						solution: 'Consider dedicated IP for better deliverability',
						frequency: 'occasional'
					},
					{
						issue: 'Rate limiting',
						solution: 'Implement exponential backoff in sending logic',
						frequency: 'occasional'
					}
				]
			},

			// Amazon SES
			{
				id: 'ses',
				name: 'Amazon SES',
				type: 'transactional',
				authMethod: 'api-key',
				smtp: {
					host: 'email-smtp.us-east-1.amazonaws.com',
					port: 587,
					encryption: 'starttls',
					requiresAuthentication: true
				},
				api: {
					endpoint: 'https://email.us-east-1.amazonaws.com',
					version: '2010-12-01',
					requiresApiKey: true
				},
				freeTierLimits: {
					dailySends: 200,
					monthlySends: 62000,
					recipientLimit: 50,
					attachmentSizeLimit: 10 * 1024 * 1024 // 10MB
				},
				security: {
					requiresDkim: true,
					requiresSpf: true,
					requiresDmarc: true,
					requiresSsl: true
				},
				deliverabilityRating: 5,
				setupDifficulty: 4,
				recommendedFor: ['enterprise', 'transactional'],
				commonIssues: [
					{
						issue: 'Sandbox mode by default',
						solution: 'Request production access and verify domain',
						frequency: 'common'
					},
					{
						issue: 'AWS IAM permissions',
						solution: 'Configure proper IAM policies for SES access',
						frequency: 'common'
					},
					{
						issue: 'Bounce/complaint rates',
						solution: 'Monitor metrics and maintain good sending practices',
						frequency: 'occasional'
					}
				]
			}
		];

		// Register all providers
		for (const provider of providers) {
			this.providers.set(provider.id, provider);
		}
	}

	/**
	 * Get provider configuration by ID
	 */
	getProvider(id: string): ProviderConfig | undefined {
		return this.providers.get(id);
	}

	/**
	 * Get all providers
	 */
	getAllProviders(): ProviderConfig[] {
		return Array.from(this.providers.values());
	}

	/**
	 * Get providers by type
	 */
	getProvidersByType(type: ProviderConfig['type']): ProviderConfig[] {
		return this.getAllProviders().filter(provider => provider.type === type);
	}

	/**
	 * Get providers recommended for use case
	 */
	getProvidersForUseCase(useCase: ProviderConfig['recommendedFor'][0]): ProviderConfig[] {
		return this.getAllProviders().filter(provider => 
			provider.recommendedFor.includes(useCase)
		);
	}

	/**
	 * Analyze context and recommend providers
	 */
	recommendProviders(context: CopilotContext): ProviderRecommendation[] {
		const recommendations: ProviderRecommendation[] = [];
		
		// Extract user needs from context
		const needs = this.analyzeUserNeeds(context);
		
		// Score each provider based on needs
		for (const provider of this.getAllProviders()) {
			const score = this.calculateProviderScore(provider, needs);
			
			if (score > 50) { // Only recommend if score > 50
				recommendations.push(this.createRecommendation(provider, score, needs));
			}
		}
		
		// Sort by match score (highest first)
		return recommendations.sort((a, b) => b.matchScore - a.matchScore);
	}

	/**
	 * Analyze user needs from context
	 */
	private analyzeUserNeeds(context: CopilotContext): {
		useCase: 'personal' | 'business' | 'marketing' | 'transactional';
		volume: 'low' | 'medium' | 'high';
		technicalSkill: 'low' | 'medium' | 'high';
		budget: 'free' | 'low' | 'medium' | 'high';
		securityNeeds: 'basic' | 'standard' | 'high';
		deliverabilityNeeds: 'standard' | 'high' | 'critical';
	} {
		// Default analysis (in a real implementation, this would analyze context)
		return {
			useCase: 'business',
			volume: 'medium',
			technicalSkill: 'medium',
			budget: 'low',
			securityNeeds: 'standard',
			deliverabilityNeeds: 'high'
		};
	}

	/**
	 * Calculate provider score based on needs
	 */
	private calculateProviderScore(provider: ProviderConfig, needs: ReturnType<typeof this.analyzeUserNeeds>): number {
		let score = 50; // Base score
		
		// Adjust based on use case match
		if (provider.recommendedFor.includes(needs.useCase as any)) {
			score += 20;
		}
		
		// Adjust based on setup difficulty vs technical skill
		const difficultyMap = { 'low': 1, 'medium': 3, 'high': 5 };
		const skillMap = { 'low': 1, 'medium': 3, 'high': 5 };
		
		const difficultyScore = difficultyMap[needs.technicalSkill] || 3;
		if (provider.setupDifficulty <= difficultyScore) {
			score += 15;
		} else {
			score -= (provider.setupDifficulty - difficultyScore) * 5;
		}
		
		// Adjust based on budget
		if (needs.budget === 'free' && provider.freeTierLimits) {
			score += 20;
		} else if (needs.budget !== 'free') {
			score += 10; // Paid providers get a boost for non-free budgets
		}
		
		// Adjust based on deliverability needs
		const deliverabilityMap = { 'standard': 3, 'high': 4, 'critical': 5 };
		const neededDeliverability = deliverabilityMap[needs.deliverabilityNeeds] || 3;
		if (provider.deliverabilityRating >= neededDeliverability) {
			score += 15;
		} else {
			score -= (neededDeliverability - provider.deliverabilityRating) * 5;
		}
		
		// Adjust based on security needs
		const securityMap = { 'basic': 1, 'standard': 3, 'high': 5 };
		const neededSecurity = securityMap[needs.securityNeeds] || 3;
		
		let securityScore = 0;
		if (provider.security.requiresDkim) securityScore++;
		if (provider.security.requiresSpf) securityScore++;
		if (provider.security.requiresDmarc) securityScore++;
		if (provider.security.requiresSsl) securityScore++;
		
		if (securityScore >= neededSecurity) {
			score += 10;
		}
		
		// Cap score at 100
		return Math.min(100, Math.max(0, score));
	}

/**
	* Create provider recommendation
	*/
private createRecommendation(provider: ProviderConfig, score: number, needs: ReturnType<typeof this.analyzeUserNeeds>): ProviderRecommendation {
	const setupSteps: Array<{
		step: number;
		title: string;
		description: string;
		estimatedTime: string;
		difficulty: 'easy' | 'medium' | 'hard';
	}> = [];
	
	// Generate setup steps based on provider type
	let stepNumber = 1;
	
	if (provider.authMethod === 'oauth' || provider.authMethod === 'app-password') {
		setupSteps.push({
			step: stepNumber++,
			title: 'Create App Password / OAuth Credentials',
			description: `Generate ${provider.authMethod === 'oauth' ? 'OAuth credentials' : 'app-specific password'} for ${provider.name}`,
			estimatedTime: '5-10 minutes',
			difficulty: 'medium'
		});
	}
	
	if (provider.authMethod === 'api-key') {
		setupSteps.push({
			step: stepNumber++,
			title: 'Generate API Key',
			description: `Create API key in ${provider.name} dashboard`,
			estimatedTime: '5 minutes',
			difficulty: 'easy'
		});
	}
	
	if (provider.imap || provider.smtp) {
		setupSteps.push({
			step: stepNumber++,
			title: 'Configure Server Settings',
			description: `Enter ${provider.name} server settings (host, port, encryption)`,
			estimatedTime: '2-5 minutes',
			difficulty: 'easy'
		});
	}
	
	if (provider.security.requiresDkim || provider.security.requiresSpf) {
		setupSteps.push({
			step: stepNumber++,
			title: 'Set Up Domain Authentication',
			description: `Configure DKIM/SPF records for ${provider.name}`,
			estimatedTime: '10-30 minutes',
			difficulty: 'hard'
		});
	}
	
	setupSteps.push({
		step: stepNumber++,
		title: 'Test Configuration',
		description: `Send test email to verify ${provider.name} setup`,
		estimatedTime: '2 minutes',
		difficulty: 'easy'
	});
	
	// Generate reasons for recommendation
	const reasons: string[] = [];
	if (provider.recommendedFor.includes(needs.useCase as any)) {
		reasons.push(`Excellent for ${needs.useCase} use cases`);
	}
	if (provider.deliverabilityRating >= 4) {
		reasons.push('High deliverability rating');
	}
	if (provider.setupDifficulty <= 3) {
		reasons.push('Relatively easy to set up');
	}
	if (provider.freeTierLimits && needs.budget === 'free') {
		reasons.push('Free tier available');
	}
	
	// Generate limitations
	const limitations: string[] = [];
	if (provider.freeTierLimits) {
		limitations.push(`Free tier limits: ${provider.freeTierLimits.dailySends} daily sends`);
	}
	if (provider.setupDifficulty >= 4) {
		limitations.push('Can be challenging to set up');
	}
	if (provider.commonIssues.length > 0) {
		limitations.push(`Common issues: ${provider.commonIssues[0].issue}`);
	}
	
	// Generate best for list
	const bestFor = provider.recommendedFor.map(useCase => {
		switch (useCase) {
			case 'personal': return 'Personal email';
			case 'small-business': return 'Small businesses';
			case 'enterprise': return 'Enterprise use';
			case 'marketing': return 'Email marketing';
			case 'transactional': return 'Transactional emails';
			default: return useCase;
		}
	});
	
	// Calculate estimated setup time
	let estimatedMinutes = 0;
	for (const step of setupSteps) {
		const timeMatch = step.estimatedTime.match(/(\d+)/);
		if (timeMatch) {
			estimatedMinutes += parseInt(timeMatch[1]);
		}
	}
	const estimatedSetupTime = estimatedMinutes < 60 ?
		`${estimatedMinutes} minutes` :
		`${Math.ceil(estimatedMinutes / 60)} hours`;
	
	return {
		providerId: provider.id,
		providerName: provider.name,
		matchScore: score,
		reasons,
		setupSteps,
		estimatedSetupTime,
		costEstimate: provider.freeTierLimits ? {
			monthly: 0,
			currency: 'USD',
			tier: 'free'
		} : undefined,
		limitations,
		bestFor
	};
}

/**
	* Get provider setup checklist
	*/
getSetupChecklist(providerId: string): Array<{
	id: string;
	title: string;
	description: string;
	completed: boolean;
	required: boolean;
	helpText?: string;
}> {
	const provider = this.getProvider(providerId);
	if (!provider) return [];
	
	const checklist: Array<{
		id: string;
		title: string;
		description: string;
		completed: boolean;
		required: boolean;
		helpText?: string;
	}> = [];
	
	// Authentication checklist
	if (provider.authMethod === 'app-password') {
		checklist.push({
			id: 'app-password',
			title: 'Generate App Password',
			description: 'Create app-specific password in provider settings',
			completed: false,
			required: true,
			helpText: 'Required for IMAP/SMTP access with 2FA enabled'
		});
	}
	
	if (provider.authMethod === 'api-key') {
		checklist.push({
			id: 'api-key',
			title: 'Generate API Key',
			description: 'Create API key in provider dashboard',
			completed: false,
			required: true,
			helpText: 'Keep this key secure and never share it'
		});
	}
	
	// Server configuration checklist
	if (provider.imap) {
		checklist.push({
			id: 'imap-config',
			title: 'Configure IMAP Settings',
			description: `Host: ${provider.imap.host}, Port: ${provider.imap.port}, Encryption: ${provider.imap.encryption}`,
			completed: false,
			required: !!provider.imap,
			helpText: 'Required for receiving emails'
		});
	}
	
	if (provider.smtp) {
		checklist.push({
			id: 'smtp-config',
			title: 'Configure SMTP Settings',
			description: `Host: ${provider.smtp.host}, Port: ${provider.smtp.port}, Encryption: ${provider.smtp.encryption}`,
			completed: false,
			required: !!provider.smtp,
			helpText: 'Required for sending emails'
		});
	}
	
	// Security checklist
	if (provider.security.requiresDkim) {
		checklist.push({
			id: 'dkim-setup',
			title: 'Set Up DKIM',
			description: 'Add DKIM record to DNS',
			completed: false,
			required: true,
			helpText: 'Improves email authentication and deliverability'
		});
	}
	
	if (provider.security.requiresSpf) {
		checklist.push({
			id: 'spf-setup',
			title: 'Set Up SPF',
			description: 'Add SPF record to DNS',
			completed: false,
			required: true,
			helpText: 'Prevents email spoofing'
		});
	}
	
	// Test checklist
	checklist.push({
		id: 'test-connection',
		title: 'Test Connection',
		description: 'Verify settings work by sending test email',
		completed: false,
		required: true,
		helpText: 'Ensure everything is configured correctly'
	});
	
	return checklist;
}

/**
	* Get common issues for provider
	*/
getCommonIssues(providerId: string): Array<{
	issue: string;
	solution: string;
	frequency: 'common' | 'occasional' | 'rare';
	helpLink?: string;
}> {
	const provider = this.getProvider(providerId);
	if (!provider) return [];
	
	return provider.commonIssues.map(issue => ({
		...issue,
		helpLink: this.getHelpLinkForIssue(providerId, issue.issue)
	}));
}

/**
	* Get help link for issue
	*/
private getHelpLinkForIssue(providerId: string, issue: string): string | undefined {
	// In a real implementation, this would return actual help links
	// For now, return placeholder links
	const baseUrls: Record<string, string> = {
		'gmail': 'https://support.google.com/mail',
		'outlook': 'https://support.microsoft.com/outlook',
		'icloud': 'https://support.apple.com/icloud',
		'brevo': 'https://help.brevo.com',
		'sendgrid': 'https://docs.sendgrid.com',
		'ses': 'https://docs.aws.amazon.com/ses'
	};
	
	return baseUrls[providerId];
}

/**
	* Get provider comparison
	*/
compareProviders(providerIds: string[]): Array<{
	feature: string;
	values: Record<string, string | number | boolean>;
	importance: 'high' | 'medium' | 'low';
}> {
	const providers = providerIds.map(id => this.getProvider(id)).filter(Boolean) as ProviderConfig[];
	
	const comparison: Array<{
		feature: string;
		values: Record<string, string | number | boolean>;
		importance: 'high' | 'medium' | 'low';
	}> = [];
	
	// Add comparison features
	comparison.push({
		feature: 'Deliverability Rating',
		values: Object.fromEntries(providers.map(p => [p.id, p.deliverabilityRating])),
		importance: 'high'
	});
	
	comparison.push({
		feature: 'Setup Difficulty',
		values: Object.fromEntries(providers.map(p => [p.id, p.setupDifficulty])),
		importance: 'medium'
	});
	
	comparison.push({
		feature: 'Free Tier Available',
		values: Object.fromEntries(providers.map(p => [p.id, !!p.freeTierLimits])),
		importance: 'high'
	});
	
	comparison.push({
		feature: 'Authentication Method',
		values: Object.fromEntries(providers.map(p => [p.id, p.authMethod])),
		importance: 'medium'
	});
	
	comparison.push({
		feature: 'DKIM Required',
		values: Object.fromEntries(providers.map(p => [p.id, p.security.requiresDkim])),
		importance: 'high'
	});
	
	comparison.push({
		feature: 'SPF Required',
		values: Object.fromEntries(providers.map(p => [p.id, p.security.requiresSpf])),
		importance: 'high'
	});
	
	// Add free tier limits if available
	providers.forEach(provider => {
		if (provider.freeTierLimits) {
			comparison.push({
				feature: 'Daily Send Limit',
				values: Object.fromEntries(providers.map(p => [
					p.id,
					p.freeTierLimits?.dailySends || 'N/A'
				])),
				importance: 'medium'
			});
		}
	});
	
	return comparison;
}
}

// Export singleton instance
export const providerIntelligence = new ProviderIntelligence();
	
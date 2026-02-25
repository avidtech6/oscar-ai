/**
 * Provider Detection
 * 
 * Detects email providers from various signals and provides intelligent
 * recommendations based on user context and requirements.
 */

import type { CopilotContext } from '../context/contextTypes';
import type { ProviderConfig } from './providerIntelligence';

/**
 * Detection signal
 */
export interface DetectionSignal {
	/** Signal type */
	type: 'email-domain' | 'mx-record' | 'user-input' | 'context' | 'historical';
	
	/** Signal value */
	value: string;
	
	/** Confidence (0-100) */
	confidence: number;
	
	/** Source of signal */
	source: string;
	
	/** Timestamp */
	timestamp: Date;
}

/**
 * Detection result
 */
export interface DetectionResult {
	/** Detected provider ID */
	providerId: string;
	
	/** Detection confidence (0-100) */
	confidence: number;
	
	/** Signals that contributed to detection */
	signals: DetectionSignal[];
	
	/** Alternative providers (if any) */
	alternatives: Array<{
		providerId: string;
		confidence: number;
		reason: string;
	}>;
	
	/** Recommended action */
	recommendedAction: 'use-detected' | 'ask-user' | 'investigate-further' | 'not-supported';
	
	/** Detection notes */
	notes: string[];
}

/**
 * Provider detection engine
 */
export class ProviderDetection {
	private emailPatterns: Map<string, RegExp[]> = new Map();
	private mxRecordPatterns: Map<string, RegExp[]> = new Map();
	private commonProviders: ProviderConfig[] = [];

	constructor() {
		this.initializePatterns();
	}

	/**
	 * Initialize detection patterns
	 */
	private initializePatterns(): void {
		// Email domain patterns
		this.emailPatterns.set('gmail', [
			/^[a-zA-Z0-9._%+-]+@gmail\.com$/i,
			/^[a-zA-Z0-9._%+-]+@googlemail\.com$/i
		]);
		
		this.emailPatterns.set('outlook', [
			/^[a-zA-Z0-9._%+-]+@outlook\.com$/i,
			/^[a-zA-Z0-9._%+-]+@hotmail\.com$/i,
			/^[a-zA-Z0-9._%+-]+@live\.com$/i,
			/^[a-zA-Z0-9._%+-]+@msn\.com$/i
		]);
		
		this.emailPatterns.set('icloud', [
			/^[a-zA-Z0-9._%+-]+@icloud\.com$/i,
			/^[a-zA-Z0-9._%+-]+@me\.com$/i,
			/^[a-zA-Z0-9._%+-]+@mac\.com$/i
		]);
		
		this.emailPatterns.set('yahoo', [
			/^[a-zA-Z0-9._%+-]+@yahoo\.com$/i,
			/^[a-zA-Z0-9._%+-]+@ymail\.com$/i,
			/^[a-zA-Z0-9._%+-]+@rocketmail\.com$/i
		]);
		
		this.emailPatterns.set('brevo', [
			/^[a-zA-Z0-9._%+-]+@brevo\.com$/i,
			/^[a-zA-Z0-9._%+-]+@sendinblue\.com$/i
		]);
		
		this.emailPatterns.set('sendgrid', [
			/^[a-zA-Z0-9._%+-]+@sendgrid\.com$/i,
			/^[a-zA-Z0-9._%+-]+@twilio\.com$/i
		]);
		
		// MX record patterns
		this.mxRecordPatterns.set('gmail', [
			/^aspmx\.l\.google\.com$/i,
			/^alt[0-9]\.aspmx\.l\.google\.com$/i
		]);
		
		this.mxRecordPatterns.set('outlook', [
			/^[a-z0-9-]+\.mail\.protection\.outlook\.com$/i,
			/^[a-z0-9-]+\.mail\.outlook\.com$/i
		]);
		
		this.mxRecordPatterns.set('yahoo', [
			/^mx-[0-9]\.yahoo\.com$/i,
			/^mta-[0-9]\.am[0-9]\.yahoodns\.net$/i
		]);
		
		this.mxRecordPatterns.set('brevo', [
			/^mx[0-9]\.brevo\.com$/i,
			/^mx[0-9]\.sendinblue\.com$/i
		]);
		
		this.mxRecordPatterns.set('sendgrid', [
			/^mx\.sendgrid\.net$/i,
			/^smtp\.sendgrid\.net$/i
		]);
		
		// Initialize common providers (would import from providerIntelligence in real implementation)
		this.commonProviders = [
			{
				id: 'gmail',
				name: 'Gmail',
				type: 'personal',
				authMethod: 'oauth',
				imap: { host: 'imap.gmail.com', port: 993, encryption: 'ssl', requiresAppPassword: true },
				smtp: { host: 'smtp.gmail.com', port: 465, encryption: 'ssl', requiresAuthentication: true },
				security: { requiresDkim: true, requiresSpf: true, requiresDmarc: false, requiresSsl: true },
				deliverabilityRating: 5,
				setupDifficulty: 2,
				recommendedFor: ['personal', 'small-business'],
				commonIssues: []
			},
			{
				id: 'outlook',
				name: 'Outlook',
				type: 'personal',
				authMethod: 'oauth',
				imap: { host: 'outlook.office365.com', port: 993, encryption: 'ssl', requiresAppPassword: true },
				smtp: { host: 'smtp.office365.com', port: 587, encryption: 'starttls', requiresAuthentication: true },
				security: { requiresDkim: true, requiresSpf: true, requiresDmarc: true, requiresSsl: true },
				deliverabilityRating: 5,
				setupDifficulty: 3,
				recommendedFor: ['small-business', 'enterprise'],
				commonIssues: []
			},
			{
				id: 'brevo',
				name: 'Brevo',
				type: 'marketing',
				authMethod: 'api-key',
				smtp: { host: 'smtp-relay.brevo.com', port: 587, encryption: 'starttls', requiresAuthentication: true },
				security: { requiresDkim: true, requiresSpf: true, requiresDmarc: false, requiresSsl: true },
				deliverabilityRating: 4,
				setupDifficulty: 2,
				recommendedFor: ['marketing', 'small-business'],
				commonIssues: []
			},
			{
				id: 'sendgrid',
				name: 'SendGrid',
				type: 'transactional',
				authMethod: 'api-key',
				smtp: { host: 'smtp.sendgrid.net', port: 587, encryption: 'starttls', requiresAuthentication: true },
				security: { requiresDkim: true, requiresSpf: true, requiresDmarc: true, requiresSsl: true },
				deliverabilityRating: 5,
				setupDifficulty: 3,
				recommendedFor: ['transactional', 'marketing'],
				commonIssues: []
			}
		];
	}

	/**
	 * Detect provider from email address
	 */
	detectFromEmail(email: string): DetectionResult {
		const signals: DetectionSignal[] = [];
		const domain = this.extractDomain(email);
		
		if (!domain) {
			return this.createNoDetectionResult('Invalid email address');
		}
		
		// Check email domain patterns
		const domainResult = this.checkDomainPatterns(domain);
		if (domainResult) {
			signals.push({
				type: 'email-domain',
				value: domain,
				confidence: 95,
				source: 'domain-pattern',
				timestamp: new Date()
			});
			
			return this.createDetectionResult(domainResult.providerId, 95, signals, [
				`Detected from email domain: ${domain}`
			]);
		}
		
		// Check common domain patterns
		const commonProvider = this.checkCommonDomains(domain);
		if (commonProvider) {
			signals.push({
				type: 'email-domain',
				value: domain,
				confidence: 85,
				source: 'common-domain',
				timestamp: new Date()
			});
			
			return this.createDetectionResult(commonProvider, 85, signals, [
				`Detected from common domain: ${domain}`
			]);
		}
		
		// Could not detect from email
		return this.createNoDetectionResult(`Could not detect provider from email domain: ${domain}`);
	}

	/**
	 * Detect provider from MX records
	 */
	detectFromMxRecords(mxRecords: string[]): DetectionResult {
		const signals: DetectionSignal[] = [];
		const matches: Array<{ providerId: string; confidence: number }> = [];
		
		for (const mxRecord of mxRecords) {
			for (const [providerId, patterns] of this.mxRecordPatterns.entries()) {
				for (const pattern of patterns) {
					if (pattern.test(mxRecord)) {
						matches.push({ providerId, confidence: 90 });
						signals.push({
							type: 'mx-record',
							value: mxRecord,
							confidence: 90,
							source: 'mx-pattern',
							timestamp: new Date()
						});
						break;
					}
				}
			}
		}
		
		if (matches.length > 0) {
			// Find best match (highest confidence)
			const bestMatch = matches.reduce((best, current) => 
				current.confidence > best.confidence ? current : best
			);
			
			return this.createDetectionResult(bestMatch.providerId, bestMatch.confidence, signals, [
				`Detected from MX records: ${mxRecords.join(', ')}`
			]);
		}
		
		return this.createNoDetectionResult(`Could not detect provider from MX records: ${mxRecords.join(', ')}`);
	}

	/**
	 * Detect provider from context
	 */
	detectFromContext(context: CopilotContext): DetectionResult {
		const signals: DetectionSignal[] = [];
		const notes: string[] = [];
		
		// Extract potential signals from context
		const potentialProviders: Array<{ providerId: string; confidence: number; reason: string }> = [];
		
		// Check if user is on provider setup screen
		if (context.ui?.currentScreen === 'provider-setup') {
			notes.push('User is on provider setup screen');
			
			// Check if there's a provider ID in context
			if (context.provider?.providerId) {
				const providerId = context.provider.providerId.toLowerCase();
				potentialProviders.push({
					providerId,
					confidence: 80,
					reason: 'Found in current context'
				});
				
				signals.push({
					type: 'context',
					value: providerId,
					confidence: 80,
					source: 'context-provider-id',
					timestamp: new Date()
				});
			}
			
			// Check if there are validation errors that hint at provider
			const validationErrors = context.provider?.validationErrors;
			if (validationErrors && validationErrors.length > 0) {
				const errors = validationErrors.join(' ').toLowerCase();
				
				if (errors.includes('gmail')) {
					potentialProviders.push({
						providerId: 'gmail',
						confidence: 75,
						reason: 'Mentioned in validation errors'
					});
				}
				if (errors.includes('outlook') || errors.includes('office365')) {
					potentialProviders.push({
						providerId: 'outlook',
						confidence: 75,
						reason: 'Mentioned in validation errors'
					});
				}
			}
		}
		
		// Check navigation history for provider hints
		if (context.navigationHistory?.length > 0) {
			const history = context.navigationHistory.join(' ').toLowerCase();
			
			if (history.includes('gmail') || history.includes('google')) {
				potentialProviders.push({
					providerId: 'gmail',
					confidence: 70,
					reason: 'Found in navigation history'
				});
			}
			if (history.includes('outlook') || history.includes('microsoft') || history.includes('office365')) {
				potentialProviders.push({
					providerId: 'outlook',
					confidence: 70,
					reason: 'Found in navigation history'
				});
			}
			if (history.includes('brevo') || history.includes('sendinblue')) {
				potentialProviders.push({
					providerId: 'brevo',
					confidence: 70,
					reason: 'Found in navigation history'
				});
			}
			if (history.includes('sendgrid') || history.includes('twilio')) {
				potentialProviders.push({
					providerId: 'sendgrid',
					confidence: 70,
					reason: 'Found in navigation history'
				});
			}
		}
		
		// If we have potential providers, return the best one
		if (potentialProviders.length > 0) {
			const bestProvider = potentialProviders.reduce((best, current) => 
				current.confidence > best.confidence ? current : best
			);
			
			return this.createDetectionResult(
				bestProvider.providerId,
				bestProvider.confidence,
				signals,
				[...notes, bestProvider.reason]
			);
		}
		
		return this.createNoDetectionResult('Could not detect provider from context');
	}

	/**
	 * Detect provider from multiple signals
	 */
	detectFromMultipleSignals(signals: DetectionSignal[]): DetectionResult {
		const providerScores: Record<string, { score: number; signals: DetectionSignal[] }> = {};
		
		// Aggregate scores from all signals
		for (const signal of signals) {
			// Extract provider from signal value (simplified)
			let providerId: string | null = null;
			
			if (signal.type === 'email-domain') {
				const domain = this.extractDomain(signal.value);
				if (domain) {
					const result = this.checkDomainPatterns(domain);
					if (result) {
						providerId = result.providerId;
					}
				}
			} else if (signal.type === 'mx-record') {
				for (const [providerIdPattern, patterns] of this.mxRecordPatterns.entries()) {
					for (const pattern of patterns) {
						if (pattern.test(signal.value)) {
							providerId = providerIdPattern;
							break;
						}
					}
					if (providerId) break;
				}
			}
			
			if (providerId) {
				if (!providerScores[providerId]) {
					providerScores[providerId] = { score: 0, signals: [] };
				}
				providerScores[providerId].score += signal.confidence;
				providerScores[providerId].signals.push(signal);
			}
		}
		
		// Find provider with highest score
		let bestProviderId: string | null = null;
		let bestScore = 0;
		let bestSignals: DetectionSignal[] = [];
		
		for (const [providerId, data] of Object.entries(providerScores)) {
			const averageScore = data.score / data.signals.length;
			if (averageScore > bestScore) {
				bestScore = averageScore;
				bestProviderId = providerId;
				bestSignals = data.signals;
			}
		}
		
		if (bestProviderId) {
			return this.createDetectionResult(
				bestProviderId,
				Math.min(100, Math.round(bestScore)),
				bestSignals,
				[`Detected from ${bestSignals.length} signals`]
			);
		}
		
		return this.createNoDetectionResult('Could not detect provider from signals');
	}

	/**
	 * Extract domain from email
	 */
	private extractDomain(email: string): string | null {
		const match = email.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/);
		return match ? match[1].toLowerCase() : null;
	}

	/**
	 * Check domain against known patterns
	 */
	private checkDomainPatterns(domain: string): { providerId: string; pattern: RegExp } | null {
		for (const [providerId, patterns] of this.emailPatterns.entries()) {
			for (const pattern of patterns) {
				if (pattern.test(`test@${domain}`)) {
					return { providerId, pattern };
				}
			}
		}
		return null;
	}

	/**
	 * Check common domains
	 */
	private checkCommonDomains(domain: string): string | null {
		const commonDomains: Record<string, string> = {
			'gmail.com': 'gmail',
			'googlemail.com': 'gmail',
			'outlook.com': 'outlook',
			'hotmail.com': 'outlook',
			'live.com': 'outlook',
			'msn.com': 'outlook',
			'icloud.com': 'icloud',
			'me.com': 'icloud',
			'mac.com': 'icloud',
			'yahoo.com': 'yahoo',
			'ymail.com': 'yahoo',
			'rocketmail.com': 'yahoo',
			'brevo.com': 'brevo',
			'sendinblue.com': 'brevo',
			'sendgrid.com': 'sendgrid',
			'twilio.com': 'sendgrid',
			'mailgun.com': 'mailgun',
			'mailgun.org': 'mailgun',
			'postmarkapp.com': 'postmark',
			'wildbit.com': 'postmark',
			'amazon.com': 'ses',
			'aws.amazon.com': 'ses'
		};
		
		return commonDomains[domain] || null;
	}

	/**
	 * Create detection result
	 */
	private createDetectionResult(
		providerId: string,
		confidence: number,
		signals: DetectionSignal[],
		notes: string[]
	): DetectionResult {
		// Get provider info
		const provider = this.commonProviders.find(p => p.id === providerId);
		
		// Determine recommended action based on confidence
		let recommendedAction: DetectionResult['recommendedAction'];
		if (confidence >= 90) {
			recommendedAction = 'use-detected';
		} else if (confidence >= 70) {
			recommendedAction = 'ask-user';
		} else if (confidence >= 50) {
			recommendedAction = 'investigate-further';
		} else {
			recommendedAction = 'not-supported';
		}
		
		// Find alternatives (other providers with similar characteristics)
		const alternatives = this.getAlternativeProviders(providerId);
		
		return {
			providerId,
			confidence,
			signals,
			alternatives,
			recommendedAction,
			notes: [
				`Detected ${provider?.name || providerId} with ${confidence}% confidence`,
				...notes
			]
		};
	}

	/**
	 * Create no detection result
	 */
	private createNoDetectionResult(reason: string): DetectionResult {
		return {
			providerId: 'unknown',
			confidence: 0,
			signals: [],
			alternatives: this.getCommonProvidersAsAlternatives(),
			recommendedAction: 'investigate-further',
			notes: [`No provider detected: ${reason}`]
		};
	}

	/**
	 * Get alternative providers
	 */
	private getAlternativeProviders(providerId: string): Array<{
		providerId: string;
		confidence: number;
		reason: string;
	}> {
		const provider = this.commonProviders.find(p => p.id === providerId);
		if (!provider) return [];
		
		const alternatives: Array<{ providerId: string; confidence: number; reason: string }> = [];
		
		// Find providers with similar type
		for (const otherProvider of this.commonProviders) {
			if (otherProvider.id === providerId) continue;
			
			let confidence = 0;
			let reason = '';
			
			if (otherProvider.type === provider.type) {
				confidence += 30;
				reason += 'Same provider type; ';
			}
			
			if (otherProvider.authMethod === provider.authMethod) {
				confidence += 20;
				reason += 'Same authentication method; ';
			}
			
			if (Math.abs(otherProvider.setupDifficulty - provider.setupDifficulty) <= 1) {
				confidence += 15;
				reason += 'Similar setup difficulty; ';
			}
			
			if (otherProvider.deliverabilityRating >= provider.deliverabilityRating - 1) {
				confidence += 15;
				reason += 'Similar deliverability; ';
			}
			
			if (confidence > 0) {
				alternatives.push({
					providerId: otherProvider.id,
					confidence,
					reason: reason.trim()
				});
			}
		}
		
		// Sort by confidence (highest first)
		return alternatives.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
	}

	/**
	 * Get common providers as alternatives
	 */
	private getCommonProvidersAsAlternatives(): Array<{
		providerId: string;
		confidence: number;
		reason: string;
	}> {
		return this.commonProviders.slice(0, 3).map(provider => ({
			providerId: provider.id,
			confidence: 50,
			reason: 'Commonly used provider'
		}));
	}

	/**
	 * Get all detectable providers
	 */
	getDetectableProviders(): string[] {
		return Array.from(this.emailPatterns.keys());
	}

	/**
	 * Get provider detection patterns
	 */
	getDetectionPatterns(providerId: string): {
		emailPatterns: RegExp[];
		mxPatterns: RegExp[];
	} {
		return {
			emailPatterns: this.emailPatterns.get(providerId) || [],
			mxPatterns: this.mxRecordPatterns.get(providerId) || []
		};
	}

	/**
	 * Add custom detection pattern
	 */
	addDetectionPattern(
		providerId: string,
		emailPattern: RegExp,
		mxPattern?: RegExp
	): void {
		if (!this.emailPatterns.has(providerId)) {
			this.emailPatterns.set(providerId, []);
		}
		this.emailPatterns.get(providerId)!.push(emailPattern);
		
		if (mxPattern) {
			if (!this.mxRecordPatterns.has(providerId)) {
				this.mxRecordPatterns.set(providerId, []);
			}
			this.mxRecordPatterns.get(providerId)!.push(mxPattern);
		}
	}

	/**
	 * Clear all detection patterns
	 */
	clearDetectionPatterns(): void {
		this.emailPatterns.clear();
		this.mxRecordPatterns.clear();
	}

	/**
	 * Get detection statistics
	 */
	getDetectionStats(): {
		totalProviders: number;
		totalEmailPatterns: number;
		totalMxPatterns: number;
		mostCommonProvider: string;
	} {
		let totalEmailPatterns = 0;
		let totalMxPatterns = 0;
		
		for (const patterns of this.emailPatterns.values()) {
			totalEmailPatterns += patterns.length;
		}
		
		for (const patterns of this.mxRecordPatterns.values()) {
			totalMxPatterns += patterns.length;
		}
		
		// Find most common provider (simplified)
		let mostCommonProvider = 'unknown';
		let maxPatterns = 0;
		
		for (const [providerId, patterns] of this.emailPatterns.entries()) {
			if (patterns.length > maxPatterns) {
				maxPatterns = patterns.length;
				mostCommonProvider = providerId;
			}
		}
		
		return {
			totalProviders: this.emailPatterns.size,
			totalEmailPatterns,
			totalMxPatterns,
			mostCommonProvider
		};
	}
}

// Export singleton instance
export const providerDetection = new ProviderDetection();
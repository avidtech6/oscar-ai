/**
 * Deliverability Engine
 * 
 * Core engine for email deliverability intelligence, spam scoring,
 * and authentication checks in the Communication Hub.
 */

import type { CopilotContext } from '../context/contextTypes';

/**
 * Deliverability score
 */
export interface DeliverabilityScore {
	/** Overall score (0-100, higher is better) */
	overall: number;
	
	/** Spam risk score (0-100, lower is better) */
	spamRisk: number;
	
	/** Authentication score (0-100, higher is better) */
	authentication: number;
	
	/** Content quality score (0-100, higher is better) */
	contentQuality: number;
	
	/** Sender reputation score (0-100, higher is better) */
	senderReputation: number;
	
	/** Risk level */
	riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'excellent';
	
	/** Confidence in score (0-100) */
	confidence: number;
	
	/** Factors affecting score */
	factors: Array<{
		factor: string;
		impact: 'positive' | 'negative' | 'neutral';
		weight: number;
		description: string;
	}>;
	
	/** Recommendations for improvement */
	recommendations: string[];
	
	/** Timestamp */
	timestamp: Date;
}

/**
 * Spam analysis result
 */
export interface SpamAnalysis {
	/** Spam score (0-100) */
	score: number;
	
	/** Spam triggers found */
	triggers: Array<{
		type: 'content' | 'headers' | 'authentication' | 'reputation' | 'behavior';
		trigger: string;
		severity: 'critical' | 'high' | 'medium' | 'low';
		description: string;
		fix: string;
	}>;
	
	/** Likelihood of being marked as spam */
	likelihood: 'certain' | 'very-likely' | 'likely' | 'possible' | 'unlikely';
	
	/** Estimated inbox placement */
	inboxPlacement: 'inbox' | 'promotions' | 'spam' | 'blocked';
	
	/** Confidence in analysis */
	confidence: number;
}

/**
 * Authentication check result
 */
export interface AuthenticationCheck {
	/** DKIM status */
	dkim: {
		configured: boolean;
		valid: boolean;
		strength: 'strong' | 'weak' | 'none';
		issues: string[];
	};
	
	/** SPF status */
	spf: {
		configured: boolean;
		valid: boolean;
		strength: 'strong' | 'weak' | 'none';
		issues: string[];
	};
	
	/** DMARC status */
	dmarc: {
		configured: boolean;
		valid: boolean;
		policy: 'none' | 'quarantine' | 'reject' | 'unknown';
		issues: string[];
	};
	
	/** Overall authentication status */
	overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
	
	/** Recommendations */
	recommendations: string[];
}

/**
 * Content analysis result
 */
export interface ContentAnalysis {
	/** Image-to-text ratio */
	imageTextRatio: {
		ratio: number;
		status: 'good' | 'warning' | 'poor';
		recommendation: string;
	};
	
	/** Spam keywords found */
	spamKeywords: Array<{
		keyword: string;
		severity: 'high' | 'medium' | 'low';
		count: number;
	}>;
	
	/** Link analysis */
	links: {
		total: number;
		suspicious: number;
		shortened: number;
		recommendation: string;
	};
	
	/** HTML complexity */
	htmlComplexity: {
		score: number;
		status: 'good' | 'warning' | 'poor';
		issues: string[];
	};
	
	/** Personalization level */
	personalization: {
		score: number;
		status: 'good' | 'warning' | 'poor';
		recommendations: string[];
	};
}

/**
 * Deliverability engine
 */
export class DeliverabilityEngine {
	private spamKeywords: Set<string> = new Set();
	private suspiciousDomains: Set<string> = new Set();
	private reputationData: Map<string, number> = new Map();

	constructor() {
		this.initializeData();
	}

	/**
	 * Initialize data
	 */
	private initializeData(): void {
		// Common spam keywords
		const commonSpamKeywords = [
			'free', 'winner', 'prize', 'cash', 'money', 'guaranteed', 'risk-free',
			'no cost', 'no fees', 'special promotion', 'limited time', 'act now',
			'urgent', 'important', 'attention', 'congratulations', 'amazing',
			'miracle', 'secret', 'hidden', 'exclusive', 'once in a lifetime',
			'double your', 'triple your', 'make money', 'earn money', 'get rich',
			'work from home', 'financial freedom', 'debt free', 'credit score',
			'loan', 'mortgage', 'refinance', 'insurance', 'claim', 'settlement',
			'pharmacy', 'prescription', 'weight loss', 'diet', 'supplement',
			'enhancement', 'enlargement', 'viagra', 'cialis', 'testosterone'
		];
		
		for (const keyword of commonSpamKeywords) {
			this.spamKeywords.add(keyword.toLowerCase());
		}
		
		// Known suspicious domains (simplified)
		const suspiciousDomains = [
			'free-email-service.com',
			'bulk-email-provider.net',
			'spam-hosting.org',
			'blacklisted-domain.com'
		];
		
		for (const domain of suspiciousDomains) {
			this.suspiciousDomains.add(domain);
		}
		
		// Reputation data (simplified)
		this.reputationData.set('gmail.com', 95);
		this.reputationData.set('outlook.com', 92);
		this.reputationData.set('yahoo.com', 88);
		this.reputationData.set('brevo.com', 85);
		this.reputationData.set('sendgrid.com', 90);
		this.reputationData.set('mailgun.com', 87);
		this.reputationData.set('postmarkapp.com', 93);
		this.reputationData.set('amazon.com', 94);
	}

	/**
	 * Analyze email for deliverability
	 */
	analyzeEmail(context: CopilotContext): DeliverabilityScore {
		const spamAnalysis = this.analyzeSpam(context);
		const authCheck = this.checkAuthentication(context);
		const contentAnalysis = this.analyzeContent(context);
		const reputationScore = this.calculateReputation(context);
		
		// Calculate overall score
		const overallScore = this.calculateOverallScore(
			spamAnalysis,
			authCheck,
			contentAnalysis,
			reputationScore
		);
		
		// Determine risk level
		const riskLevel = this.determineRiskLevel(overallScore.overall);
		
		// Generate factors
		const factors = this.generateFactors(
			spamAnalysis,
			authCheck,
			contentAnalysis,
			reputationScore
		);
		
		// Generate recommendations
		const recommendations = this.generateRecommendations(
			spamAnalysis,
			authCheck,
			contentAnalysis,
			reputationScore
		);
		
		return {
			overall: overallScore.overall,
			spamRisk: overallScore.spamRisk,
			authentication: overallScore.authentication,
			contentQuality: overallScore.contentQuality,
			senderReputation: overallScore.senderReputation,
			riskLevel,
			confidence: 85, // Default confidence
			factors,
			recommendations,
			timestamp: new Date()
		};
	}

	/**
	 * Analyze spam risk
	 */
	analyzeSpam(context: CopilotContext): SpamAnalysis {
		const triggers: SpamAnalysis['triggers'] = [];
		let score = 0;
		
		// Check content for spam keywords - using a placeholder since we don't have access to email content
		// In a real implementation, this would come from the email being composed
		const content = ''; // Placeholder - would come from email context
		const spamKeywordMatches = this.checkSpamKeywords(content);
		
		for (const match of spamKeywordMatches) {
			triggers.push({
				type: 'content',
				trigger: match.keyword,
				severity: match.severity,
				description: `Spam keyword "${match.keyword}" found`,
				fix: 'Consider removing or rephrasing spammy language'
			});
			score += match.severity === 'high' ? 15 : match.severity === 'medium' ? 10 : 5;
		}
		
		// Check authentication (simplified)
		const authStatus = context.deliverability;
		if (!authStatus?.dkimConfigured) {
			triggers.push({
				type: 'authentication',
				trigger: 'dkim-missing',
				severity: 'high',
				description: 'DKIM not configured',
				fix: 'Set up DKIM authentication for your domain'
			});
			score += 20;
		}
		
		if (!authStatus?.spfConfigured) {
			triggers.push({
				type: 'authentication',
				trigger: 'spf-missing',
				severity: 'high',
				description: 'SPF not configured',
				fix: 'Set up SPF records for your domain'
			});
			score += 20;
		}
		
		// Check sender reputation
		const senderDomain = this.extractSenderDomain(context);
		if (senderDomain && this.suspiciousDomains.has(senderDomain)) {
			triggers.push({
				type: 'reputation',
				trigger: 'suspicious-domain',
				severity: 'critical',
				description: `Sender domain "${senderDomain}" is known for poor reputation`,
				fix: 'Consider using a reputable email service provider'
			});
			score += 30;
		}
		
		// Check image-to-text ratio
		if (authStatus?.imageTextRatioWarning) {
			triggers.push({
				type: 'content',
				trigger: 'high-image-ratio',
				severity: 'medium',
				description: 'High image-to-text ratio may trigger spam filters',
				fix: 'Balance images with text content'
			});
			score += 10;
		}
		
		// Cap score at 100
		score = Math.min(100, score);
		
		// Determine likelihood
		const likelihood = this.determineSpamLikelihood(score);
		
		// Determine inbox placement
		const inboxPlacement = this.determineInboxPlacement(score, triggers);
		
		return {
			score,
			triggers,
			likelihood,
			inboxPlacement,
			confidence: 80
		};
	}

	/**
	 * Check authentication
	 */
	checkAuthentication(context: CopilotContext): AuthenticationCheck {
		const authStatus = context.deliverability;
		
		const dkim = {
			configured: authStatus?.dkimConfigured || false,
			valid: authStatus?.dkimConfigured || false, // Simplified
			strength: (authStatus?.dkimConfigured ? 'strong' : 'none') as 'strong' | 'weak' | 'none',
			issues: authStatus?.dkimConfigured ? [] : ['DKIM not configured']
		};
		
		const spf = {
			configured: authStatus?.spfConfigured || false,
			valid: authStatus?.spfConfigured || false, // Simplified
			strength: (authStatus?.spfConfigured ? 'strong' : 'none') as 'strong' | 'weak' | 'none',
			issues: authStatus?.spfConfigured ? [] : ['SPF not configured']
		};
		
		const dmarc = {
			configured: authStatus?.dmarcConfigured || false,
			valid: authStatus?.dmarcConfigured || false, // Simplified
			policy: (authStatus?.dmarcConfigured ? 'none' : 'unknown') as 'none' | 'quarantine' | 'reject' | 'unknown',
			issues: authStatus?.dmarcConfigured ? [] : ['DMARC not configured']
		};
		
		// Calculate overall status
		const authScore = (dkim.configured ? 1 : 0) + (spf.configured ? 1 : 0) + (dmarc.configured ? 0.5 : 0);
		let overall: AuthenticationCheck['overall'];
		
		if (authScore >= 2.5) {
			overall = 'excellent';
		} else if (authScore >= 2) {
			overall = 'good';
		} else if (authScore >= 1) {
			overall = 'fair';
		} else if (authScore >= 0.5) {
			overall = 'poor';
		} else {
			overall = 'critical';
		}
		
		// Generate recommendations
		const recommendations: string[] = [];
		if (!dkim.configured) {
			recommendations.push('Configure DKIM for better authentication');
		}
		if (!spf.configured) {
			recommendations.push('Configure SPF to prevent spoofing');
		}
		if (!dmarc.configured) {
			recommendations.push('Consider setting up DMARC for reporting');
		}
		
		return {
			dkim,
			spf,
			dmarc,
			overall,
			recommendations
		};
	}

	/**
	 * Analyze content
	 */
	analyzeContent(context: CopilotContext): ContentAnalysis {
		// In a real implementation, this would come from the email being composed
		// For now, use placeholder content
		const content = ''; // Placeholder - would come from email context
		
		// Calculate image-to-text ratio (simplified)
		const imageCount = (content.match(/<img/g) || []).length;
		const textLength = content.replace(/<[^>]*>/g, '').length;
		const imageTextRatio = textLength > 0 ? imageCount / textLength * 1000 : 0;
		
		let ratioStatus: ContentAnalysis['imageTextRatio']['status'];
		let ratioRecommendation: string;
		
		if (imageTextRatio > 50) {
			ratioStatus = 'poor';
			ratioRecommendation = 'High image-to-text ratio may trigger spam filters. Add more text content.';
		} else if (imageTextRatio > 20) {
			ratioStatus = 'warning';
			ratioRecommendation = 'Moderate image-to-text ratio. Consider balancing with more text.';
		} else {
			ratioStatus = 'good';
			ratioRecommendation = 'Good image-to-text ratio.';
		}
		
		// Check spam keywords
		const spamKeywordMatches = this.checkSpamKeywords(content);
		
		// Link analysis (simplified)
		const linkMatches = content.match(/href=["']([^"']+)["']/g) || [];
		const totalLinks = linkMatches.length;
		const suspiciousLinks = linkMatches.filter((link: string) =>
			link.includes('.xyz') || link.includes('.top') || link.includes('.club')
		).length;
		const shortenedLinks = linkMatches.filter((link: string) =>
			link.includes('bit.ly') || link.includes('tinyurl.com') || link.includes('goo.gl')
		).length;
		
		let linkRecommendation = '';
		if (suspiciousLinks > 0) {
			linkRecommendation = `Contains ${suspiciousLinks} suspicious links. Consider using reputable domains.`;
		} else if (shortenedLinks > 0) {
			linkRecommendation = `Contains ${shortenedLinks} shortened links. Some spam filters distrust URL shorteners.`;
		} else if (totalLinks > 10) {
			linkRecommendation = 'High number of links. Consider reducing to avoid spam filters.';
		} else {
			linkRecommendation = 'Link usage looks good.';
		}
		
		// HTML complexity (simplified)
		const htmlTags = (content.match(/<[^>]+>/g) || []).length;
		const textRatio = textLength / (content.length || 1);
		const htmlComplexityScore = htmlTags * (1 - textRatio);
		
		let htmlStatus: ContentAnalysis['htmlComplexity']['status'];
		let htmlIssues: string[] = [];
		
		if (htmlComplexityScore > 50) {
			htmlStatus = 'poor';
			htmlIssues = ['High HTML complexity may trigger spam filters'];
		} else if (htmlComplexityScore > 20) {
			htmlStatus = 'warning';
			htmlIssues = ['Moderate HTML complexity'];
		} else {
			htmlStatus = 'good';
			htmlIssues = [];
		}
		
		// Personalization (simplified)
		const hasName = content.includes('{{name}}') || content.includes('${name}') ||
					   content.toLowerCase().includes('dear') || content.toLowerCase().includes('hello');
		const personalizationScore = hasName ? 80 : 30;
		
		let personalizationStatus: ContentAnalysis['personalization']['status'];
		let personalizationRecommendations: string[] = [];
		
		if (personalizationScore >= 70) {
			personalizationStatus = 'good';
			personalizationRecommendations = ['Good personalization level'];
		} else if (personalizationScore >= 40) {
			personalizationStatus = 'warning';
			personalizationRecommendations = ['Consider adding more personalization'];
		} else {
			personalizationStatus = 'poor';
			personalizationRecommendations = ['Add personalization (e.g., recipient name) to improve engagement'];
		}
		
		return {
			imageTextRatio: {
				ratio: imageTextRatio,
				status: ratioStatus,
				recommendation: ratioRecommendation
			},
			spamKeywords: spamKeywordMatches,
			links: {
				total: totalLinks,
				suspicious: suspiciousLinks,
				shortened: shortenedLinks,
				recommendation: linkRecommendation
			},
			htmlComplexity: {
				score: htmlComplexityScore,
				status: htmlStatus,
				issues: htmlIssues
			},
			personalization: {
				score: personalizationScore,
				status: personalizationStatus,
				recommendations: personalizationRecommendations
			}
		};
	}

	/**
		* Check spam keywords in content
		*/
	private checkSpamKeywords(content: string): Array<{keyword: string, severity: 'high' | 'medium' | 'low', count: number}> {
		const contentLower = content.toLowerCase();
		const matches: Array<{keyword: string, severity: 'high' | 'medium' | 'low', count: number}> = [];
		
		// Convert Set to Array for iteration
		const spamKeywordsArray = Array.from(this.spamKeywords);
		
		for (const keyword of spamKeywordsArray) {
			const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
			const count = (contentLower.match(regex) || []).length;
			
			if (count > 0) {
				// Determine severity based on keyword
				let severity: 'high' | 'medium' | 'low' = 'low';
				
				if (['free', 'winner', 'prize', 'cash', 'money', 'guaranteed'].includes(keyword)) {
					severity = 'high';
				} else if (['urgent', 'important', 'attention', 'congratulations', 'amazing'].includes(keyword)) {
					severity = 'medium';
				}
				
				matches.push({ keyword, severity, count });
			}
		}
		
		return matches;
	}

	/**
	 * Extract sender domain from context
	 */
	private extractSenderDomain(context: CopilotContext): string | null {
		// In a real implementation, this would come from the email sender or provider settings
		// For now, extract from provider ID if available
		const providerId = context.provider?.providerId;
		if (providerId) {
			// Extract domain from provider ID (e.g., "gmail.com" from "gmail")
			const domainMap: Record<string, string> = {
				'gmail': 'gmail.com',
				'outlook': 'outlook.com',
				'yahoo': 'yahoo.com',
				'brevo': 'brevo.com',
				'sendgrid': 'sendgrid.com',
				'mailgun': 'mailgun.com',
				'postmark': 'postmarkapp.com',
				'ses': 'amazon.com'
			};
			
			return domainMap[providerId] || `${providerId}.com`;
		}
		
		// Fallback to a placeholder
		return 'example.com';
	}

	/**
		* Calculate sender reputation
		*/
	private calculateReputation(context: CopilotContext): number {
		const senderDomain = this.extractSenderDomain(context);
		if (!senderDomain) return 50; // Default neutral score
		
		// Check if we have reputation data for this domain
		if (this.reputationData.has(senderDomain)) {
			return this.reputationData.get(senderDomain)!;
		}
		
		// Check for suspicious domains
		if (this.suspiciousDomains.has(senderDomain)) {
			return 20; // Low reputation
		}
		
		// Default based on TLD
		const tld = senderDomain.split('.').pop();
		if (['com', 'org', 'net', 'edu', 'gov'].includes(tld || '')) {
			return 70; // Reasonable reputation
		}
		
		if (['xyz', 'top', 'club', 'online', 'site'].includes(tld || '')) {
			return 40; // Lower reputation
		}
		
		return 60; // Neutral
	}

	/**
		* Calculate overall score
		*/
	private calculateOverallScore(
		spamAnalysis: SpamAnalysis,
		authCheck: AuthenticationCheck,
		contentAnalysis: ContentAnalysis,
		reputationScore: number
	): {
		overall: number;
		spamRisk: number;
		authentication: number;
		contentQuality: number;
		senderReputation: number;
	} {
		// Convert spam score to risk score (inverse)
		const spamRisk = 100 - spamAnalysis.score;
		
		// Convert authentication status to score
		let authenticationScore: number;
		switch (authCheck.overall) {
			case 'excellent': authenticationScore = 95; break;
			case 'good': authenticationScore = 80; break;
			case 'fair': authenticationScore = 60; break;
			case 'poor': authenticationScore = 40; break;
			case 'critical': authenticationScore = 20; break;
			default: authenticationScore = 50;
		}
		
		// Calculate content quality score
		let contentQuality = 70; // Base
		
		// Adjust based on image-to-text ratio
		if (contentAnalysis.imageTextRatio.status === 'poor') contentQuality -= 20;
		else if (contentAnalysis.imageTextRatio.status === 'warning') contentQuality -= 10;
		
		// Adjust based on spam keywords
		if (contentAnalysis.spamKeywords.length > 0) {
			const highSeverityCount = contentAnalysis.spamKeywords.filter(k => k.severity === 'high').length;
			const mediumSeverityCount = contentAnalysis.spamKeywords.filter(k => k.severity === 'medium').length;
			contentQuality -= (highSeverityCount * 10 + mediumSeverityCount * 5);
		}
		
		// Adjust based on links
		if (contentAnalysis.links.suspicious > 0) contentQuality -= 15;
		else if (contentAnalysis.links.shortened > 0) contentQuality -= 10;
		else if (contentAnalysis.links.total > 10) contentQuality -= 5;
		
		// Adjust based on HTML complexity
		if (contentAnalysis.htmlComplexity.status === 'poor') contentQuality -= 15;
		else if (contentAnalysis.htmlComplexity.status === 'warning') contentQuality -= 8;
		
		// Adjust based on personalization
		if (contentAnalysis.personalization.status === 'poor') contentQuality -= 10;
		else if (contentAnalysis.personalization.status === 'warning') contentQuality -= 5;
		
		// Cap scores
		contentQuality = Math.max(0, Math.min(100, contentQuality));
		
		// Calculate overall weighted score
		const overall = (
			spamRisk * 0.3 +          // 30% spam risk
			authenticationScore * 0.3 + // 30% authentication
			contentQuality * 0.2 +      // 20% content quality
			reputationScore * 0.2       // 20% sender reputation
		);
		
		return {
			overall: Math.round(overall),
			spamRisk: Math.round(spamRisk),
			authentication: Math.round(authenticationScore),
			contentQuality: Math.round(contentQuality),
			senderReputation: Math.round(reputationScore)
		};
	}

	/**
		* Determine risk level
		*/
	private determineRiskLevel(score: number): DeliverabilityScore['riskLevel'] {
		if (score >= 90) return 'excellent';
		if (score >= 75) return 'low';
		if (score >= 60) return 'medium';
		if (score >= 40) return 'high';
		return 'critical';
	}

	/**
		* Determine spam likelihood
		*/
	private determineSpamLikelihood(score: number): SpamAnalysis['likelihood'] {
		if (score >= 80) return 'certain';
		if (score >= 60) return 'very-likely';
		if (score >= 40) return 'likely';
		if (score >= 20) return 'possible';
		return 'unlikely';
	}

	/**
		* Determine inbox placement
		*/
	private determineInboxPlacement(score: number, triggers: SpamAnalysis['triggers']): SpamAnalysis['inboxPlacement'] {
		if (score >= 70) return 'spam';
		if (score >= 50) return 'promotions';
		if (score >= 30) return 'inbox';
		
		// Check for critical triggers
		const hasCritical = triggers.some(t => t.severity === 'critical');
		if (hasCritical) return 'blocked';
		
		return 'inbox';
	}

	/**
		* Generate factors affecting score
		*/
	private generateFactors(
		spamAnalysis: SpamAnalysis,
		authCheck: AuthenticationCheck,
		contentAnalysis: ContentAnalysis,
		reputationScore: number
	): DeliverabilityScore['factors'] {
		const factors: DeliverabilityScore['factors'] = [];
		
		// Spam risk factors
		if (spamAnalysis.score > 0) {
			factors.push({
				factor: 'Spam risk',
				impact: spamAnalysis.score > 50 ? 'negative' : 'neutral',
				weight: 0.3,
				description: `Spam score: ${spamAnalysis.score}/100`
			});
		}
		
		// Authentication factors
		if (authCheck.overall !== 'excellent') {
			factors.push({
				factor: 'Authentication',
				impact: authCheck.overall === 'critical' || authCheck.overall === 'poor' ? 'negative' : 'neutral',
				weight: 0.3,
				description: `Authentication status: ${authCheck.overall}`
			});
		}
		
		// Content quality factors
		if (contentAnalysis.imageTextRatio.status !== 'good') {
			factors.push({
				factor: 'Image-to-text ratio',
				impact: contentAnalysis.imageTextRatio.status === 'poor' ? 'negative' : 'neutral',
				weight: 0.1,
				description: contentAnalysis.imageTextRatio.recommendation
			});
		}
		
		if (contentAnalysis.spamKeywords.length > 0) {
			factors.push({
				factor: 'Spam keywords',
				impact: 'negative',
				weight: 0.15,
				description: `Found ${contentAnalysis.spamKeywords.length} spam keywords`
			});
		}
		
		// Sender reputation factor
		if (reputationScore < 70) {
			factors.push({
				factor: 'Sender reputation',
				impact: reputationScore < 40 ? 'negative' : 'neutral',
				weight: 0.15,
				description: `Sender reputation score: ${reputationScore}/100`
			});
		}
		
		return factors;
	}

	/**
		* Generate recommendations
		*/
	private generateRecommendations(
		spamAnalysis: SpamAnalysis,
		authCheck: AuthenticationCheck,
		contentAnalysis: ContentAnalysis,
		reputationScore: number
	): string[] {
		const recommendations: string[] = [];
		
		// Spam recommendations
		if (spamAnalysis.score > 50) {
			recommendations.push('Reduce spammy language and avoid common spam triggers');
		}
		
		if (spamAnalysis.triggers.length > 0) {
			const criticalTriggers = spamAnalysis.triggers.filter(t => t.severity === 'critical');
			if (criticalTriggers.length > 0) {
				recommendations.push(`Fix critical issues: ${criticalTriggers.map(t => t.trigger).join(', ')}`);
			}
		}
		
		// Authentication recommendations
		if (authCheck.recommendations.length > 0) {
			recommendations.push(...authCheck.recommendations);
		}
		
		// Content recommendations
		if (contentAnalysis.imageTextRatio.status === 'poor') {
			recommendations.push('Reduce image usage and add more text content');
		}
		
		if (contentAnalysis.spamKeywords.length > 0) {
			recommendations.push('Remove or rephrase spammy keywords');
		}
		
		if (contentAnalysis.links.suspicious > 0) {
			recommendations.push('Replace suspicious links with reputable domains');
		}
		
		if (contentAnalysis.personalization.status === 'poor') {
			recommendations.push('Add personalization (recipient name, company) to improve engagement');
		}
		
		// Reputation recommendations
		if (reputationScore < 60) {
			recommendations.push('Consider using a more reputable email service provider');
		}
		
		// Limit to 5 most important recommendations
		return recommendations.slice(0, 5);
	}

	/**
		* Get deliverability summary for hint engine
		*/
	getDeliverabilitySummary(context: CopilotContext): {
		score: number;
		riskLevel: string;
		primaryIssue: string | null;
		recommendations: string[];
	} {
		const score = this.analyzeEmail(context);
		
		let primaryIssue: string | null = null;
		if (score.riskLevel === 'critical' || score.riskLevel === 'high') {
			// Find the most significant factor
			const negativeFactors = score.factors.filter(f => f.impact === 'negative');
			if (negativeFactors.length > 0) {
				primaryIssue = negativeFactors[0].factor;
			} else {
				primaryIssue = 'High spam risk';
			}
		}
		
		return {
			score: score.overall,
			riskLevel: score.riskLevel,
			primaryIssue,
			recommendations: score.recommendations.slice(0, 3) // Top 3 recommendations
		};
	}
}

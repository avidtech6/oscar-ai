/**
 * Deliverability Memory Engine
 * 
 * Manages deliverability-level memory, spam score tracking, and deliverability issue resolution.
 * Provides deliverability intelligence for context-aware email sending.
 */

import type { 
	DeliverabilityHistory, 
	MemoryItem, 
	MemoryCategory,
	MemoryWriteOptions 
} from './memoryTypes';
import { MemoryEngine } from './memoryEngine';
import { MemorySelectors } from './memorySelectors';

/**
 * Deliverability Engine Configuration
 */
export interface DeliverabilityEngineConfig {
	/** Memory engine instance */
	memoryEngine: MemoryEngine;
	
	/** Memory selectors instance */
	memorySelectors: MemorySelectors;
	
	/** Whether to auto-track spam scores */
	autoTrackSpamScores: boolean;
	
	/** Whether to track authentication failures */
	trackAuthenticationFailures: boolean;
	
	/** Whether to track DNS issues */
	trackDnsIssues: boolean;
	
	/** Whether to track fixes applied */
	trackFixesApplied: boolean;
	
	/** Update interval in milliseconds */
	updateIntervalMs: number;
}

/**
 * Deliverability Analysis Result
 */
export interface DeliverabilityAnalysis {
	/** Domain or identifier */
	domain: string;
	
	/** Spam score analysis */
	spamScore: {
		current: number;
		average: number;
		trend: 'improving' | 'stable' | 'declining';
		issues: string[];
		riskLevel: 'low' | 'medium' | 'high' | 'critical';
	};
	
	/** Authentication status */
	authentication: {
		dkim: 'valid' | 'invalid' | 'unknown';
		spf: 'valid' | 'invalid' | 'unknown';
		dmarc: 'valid' | 'invalid' | 'unknown';
		overall: 'good' | 'partial' | 'poor';
		issues: string[];
	};
	
	/** DNS status */
	dns: {
		mx: 'valid' | 'invalid' | 'unknown';
		txt: 'valid' | 'invalid' | 'unknown';
		overall: 'good' | 'partial' | 'poor';
		issues: string[];
	};
	
	/** Fix effectiveness */
	fixes: {
		totalApplied: number;
		successRate: number;
		lastFix: Date | null;
		mostEffectiveFixes: string[];
	};
	
	/** Patterns detected */
	patterns: {
		unsafeSendingPatterns: string[];
		highRiskTimes: string[];
		highRiskContent: string[];
	};
	
	/** Recommendations */
	recommendations: string[];
	
	/** Confidence score (0-100) */
	confidence: number;
}

/**
 * Deliverability Memory Engine
 */
export class DeliverabilityEngine {
	private memoryEngine: MemoryEngine;
	private memorySelectors: MemorySelectors;
	private config: DeliverabilityEngineConfig;
	private updateInterval: NodeJS.Timeout | null = null;
	
	constructor(config: Partial<DeliverabilityEngineConfig> = {}) {
		this.memoryEngine = config.memoryEngine ?? new MemoryEngine();
		this.memorySelectors = config.memorySelectors ?? new MemorySelectors({ memoryEngine: this.memoryEngine });
		
		this.config = {
			memoryEngine: this.memoryEngine,
			memorySelectors: this.memorySelectors,
			autoTrackSpamScores: config.autoTrackSpamScores ?? true,
			trackAuthenticationFailures: config.trackAuthenticationFailures ?? true,
			trackDnsIssues: config.trackDnsIssues ?? true,
			trackFixesApplied: config.trackFixesApplied ?? true,
			updateIntervalMs: config.updateIntervalMs ?? 2 * 60 * 60 * 1000 // 2 hours
		};
		
		// Start auto-update if enabled
		if (this.config.autoTrackSpamScores) {
			this.startAutoUpdate();
		}
	}
	
	/**
	 * Start auto-update interval
	 */
	private startAutoUpdate(): void {
		if (this.updateInterval) {
			clearInterval(this.updateInterval);
		}
		
		this.updateInterval = setInterval(async () => {
			try {
				await this.autoUpdateDeliverabilityMetrics();
			} catch (error) {
				console.error('Auto-update of deliverability metrics failed:', error);
			}
		}, this.config.updateIntervalMs);
	}
	
	/**
	 * Stop auto-update interval
	 */
	stopAutoUpdate(): void {
		if (this.updateInterval) {
			clearInterval(this.updateInterval);
			this.updateInterval = null;
		}
	}
	
	/**
	 * Auto-update deliverability metrics
	 */
	private async autoUpdateDeliverabilityMetrics(): Promise<void> {
		console.log('Auto-updating deliverability metrics...');
		
		// Get recent deliverability memories
		const recentMemories = await this.memorySelectors.getRecentMemories(100);
		const deliverabilityMemories = recentMemories.filter(m =>
			m.category === 'deliverability'
		);
		
		if (deliverabilityMemories.length === 0) {
			return;
		}
		
		// Group by domain
		const domainGroups = new Map<string, MemoryItem[]>();
		for (const memory of deliverabilityMemories) {
			const domain = memory.content.domain ||
						  this.extractDomainFromContent(memory) ||
						  'unknown';
			if (!domainGroups.has(domain)) {
				domainGroups.set(domain, []);
			}
			domainGroups.get(domain)!.push(memory);
		}
		
		// Update metrics for each domain
		const entries = Array.from(domainGroups.entries());
		for (const [domain, memories] of entries) {
			if (domain !== 'unknown') {
				try {
					await this.updateDeliverabilityMetrics(domain, memories);
					console.log(`Updated metrics for domain: ${domain}`);
				} catch (error) {
					console.error(`Failed to update metrics for domain ${domain}:`, error);
				}
			}
		}
	}
	
	/**
	 * Update deliverability metrics
	 */
	private async updateDeliverabilityMetrics(domain: string, memories: MemoryItem[]): Promise<void> {
		const analysis = await this.analyzeDeliverability(domain);
		
		// Create deliverability history from analysis
		const history: DeliverabilityHistory = {
			domain,
			spamScores: [],
			authenticationFailures: [],
			dnsIssues: [],
			fixesApplied: [],
			patterns: {
				unsafeSendingPatterns: analysis.patterns.unsafeSendingPatterns,
				highRiskTimes: analysis.patterns.highRiskTimes,
				highRiskContent: analysis.patterns.highRiskContent
			},
			lastUpdated: new Date()
		};
		
		// Save history to memory
		await this.memoryEngine.writeMemory(
			'deliverability',
			'system',
			history,
			`Deliverability metrics updated: ${domain}`,
			{
				tags: ['deliverability-metrics', domain, 'auto-updated'],
				importance: 60,
				confidence: analysis.confidence
			}
		);
	}
	
	/**
	 * Get deliverability history
	 */
	async getDeliverabilityHistory(domain: string): Promise<DeliverabilityHistory | null> {
		return await this.memorySelectors.getDeliverabilityHistory(domain);
	}
	
	/**
	 * Analyze deliverability
	 */
	async analyzeDeliverability(domain: string): Promise<DeliverabilityAnalysis> {
		const history = await this.getDeliverabilityHistory(domain);
		const memories = await this.getDeliverabilityMemories(domain);
		
		if (memories.length === 0) {
			return this.createDefaultAnalysis(domain);
		}
		
		// Analyze deliverability data
		const spamScore = this.analyzeSpamScore(memories);
		const authentication = this.analyzeAuthentication(memories);
		const dns = this.analyzeDns(memories);
		const fixes = this.analyzeFixes(memories);
		const patterns = this.analyzePatterns(memories);
		const recommendations = this.generateRecommendations(spamScore, authentication, dns, fixes, patterns);
		
		// Calculate confidence based on data points
		const confidence = Math.min(100, memories.length * 5);
		
		return {
			domain,
			spamScore,
			authentication,
			dns,
			fixes,
			patterns,
			recommendations,
			confidence
		};
	}
	
	/**
	 * Record spam score
	 */
	async recordSpamScore(
		domain: string,
		score: {
			score: number;
			issues: string[];
			testType?: string;
			testDate?: Date;
		}
	): Promise<void> {
		const now = new Date();
		
		// Create spam score memory
		const memoryContent = {
			domain,
			score: score.score,
			issues: score.issues,
			testType: score.testType || 'automated',
			testDate: score.testDate || now,
			timestamp: now
		};
		
		await this.memoryEngine.writeMemory(
			'deliverability',
			'system',
			memoryContent,
			`Spam score: ${score.score}/100 - ${score.issues.length} issues`,
			{
				tags: ['spam-score', domain, `score-${score.score}`],
				importance: 70,
				confidence: 85
			}
		);
		
		// Auto-update metrics
		if (this.config.autoTrackSpamScores) {
			const memories = await this.getDeliverabilityMemories(domain);
			await this.updateDeliverabilityMetrics(domain, memories);
		}
	}
	
	/**
	 * Record authentication failure
	 */
	async recordAuthenticationFailure(
		domain: string,
		failure: {
			type: 'dkim' | 'spf' | 'dmarc' | 'other';
			error: string;
			resolved?: boolean;
			resolution?: string;
		}
	): Promise<void> {
		const now = new Date();
		
		// Create authentication failure memory
		const memoryContent = {
			domain,
			type: failure.type,
			error: failure.error,
			resolved: failure.resolved || false,
			resolution: failure.resolution,
			timestamp: now
		};
		
		await this.memoryEngine.writeMemory(
			'deliverability',
			'system',
			memoryContent,
			`Authentication failure (${failure.type}): ${failure.error.substring(0, 50)}...`,
			{
				tags: ['authentication-failure', domain, failure.type],
				importance: 80,
				confidence: 90
			}
		);
		
		// Auto-update metrics
		if (this.config.trackAuthenticationFailures) {
			const memories = await this.getDeliverabilityMemories(domain);
			await this.updateDeliverabilityMetrics(domain, memories);
		}
	}
	
	/**
	 * Record DNS issue
	 */
	async recordDnsIssue(
		domain: string,
		issue: {
			type: 'mx' | 'txt' | 'a' | 'cname' | 'other';
			error: string;
			resolved?: boolean;
			resolution?: string;
		}
	): Promise<void> {
		const now = new Date();
		
		// Create DNS issue memory
		const memoryContent = {
			domain,
			type: issue.type,
			error: issue.error,
			resolved: issue.resolved || false,
			resolution: issue.resolution,
			timestamp: now
		};
		
		await this.memoryEngine.writeMemory(
			'deliverability',
			'system',
			memoryContent,
			`DNS issue (${issue.type}): ${issue.error.substring(0, 50)}...`,
			{
				tags: ['dns-issue', domain, issue.type],
				importance: 75,
				confidence: 85
			}
		);
		
		// Auto-update metrics
		if (this.config.trackDnsIssues) {
			const memories = await this.getDeliverabilityMemories(domain);
			await this.updateDeliverabilityMetrics(domain, memories);
		}
	}
	
	/**
	 * Record fix applied
	 */
	async recordFixApplied(
		domain: string,
		fix: {
			fix: string;
			appliedBy: 'user' | 'ai' | 'system';
			success: boolean;
			improvement?: number;
			context?: any;
		}
	): Promise<void> {
		const now = new Date();
		
		// Create fix memory
		const memoryContent = {
			domain,
			fix: fix.fix,
			appliedBy: fix.appliedBy,
			success: fix.success,
			improvement: fix.improvement,
			context: fix.context,
			timestamp: now
		};
		
		await this.memoryEngine.writeMemory(
			'deliverability',
			fix.appliedBy === 'ai' ? 'ai-action' : 'user-action',
			memoryContent,
			`Fix applied: ${fix.fix.substring(0, 50)}...`,
			{
				tags: ['fix-applied', domain, fix.appliedBy],
				importance: 70,
				confidence: 80
			}
		);
		
		// Auto-update metrics
		if (this.config.trackFixesApplied) {
			const memories = await this.getDeliverabilityMemories(domain);
			await this.updateDeliverabilityMetrics(domain, memories);
		}
	}
	
	/**
	 * Suggest deliverability improvements
	 */
	async suggestDeliverabilityImprovements(domain: string): Promise<string[]> {
		const analysis = await this.analyzeDeliverability(domain);
		return analysis.recommendations;
	}
	
	/**
	 * Get deliverability memories
	 */
	private async getDeliverabilityMemories(domain: string): Promise<MemoryItem[]> {
		const query = {
			category: 'deliverability' as MemoryCategory,
			limit: 200,
			sortBy: 'createdAt' as const,
			sortOrder: 'desc' as const
		};
		
		const result = await this.memoryEngine.queryMemories(query);
		
		// Filter memories for this domain
		return result.items.filter(memory => {
			return memory.content.domain === domain || 
				   memory.content.email?.includes(`@${domain}`) ||
				   memory.summary.includes(domain) ||
				   this.extractDomainFromContent(memory) === domain;
		});
	}
	
	/**
	 * Extract domain from memory content
	 */
	private extractDomainFromContent(memory: MemoryItem): string | null {
		// Try to extract domain from various fields
		if (memory.content.domain) {
			return memory.content.domain;
		}
		
		if (memory.content.email) {
			const emailMatch = memory.content.email.match(/@([^@]+)$/);
			if (emailMatch) {
				return emailMatch[1];
			}
		}
		
		if (memory.summary) {
			const domainMatch = memory.summary.match(/\b([a-zA-Z0-9-]+\.[a-zA-Z]{2,})\b/);
			if (domainMatch) {
				return domainMatch[1];
			}
		}
		
		return null;
	}
	
	/**
	 * Create default analysis for new domains
	 */
	private createDefaultAnalysis(domain: string): DeliverabilityAnalysis {
		return {
			domain,
			spamScore: {
				current: 0,
				average: 0,
				trend: 'stable',
				issues: [],
				riskLevel: 'low'
			},
			authentication: {
				dkim: 'unknown',
				spf: 'unknown',
				dmarc: 'unknown',
				overall: 'good',
				issues: []
			},
			dns: {
				mx: 'unknown',
				txt: 'unknown',
				overall: 'good',
				issues: []
			},
			fixes: {
				totalApplied: 0,
				successRate: 0,
				lastFix: null,
				mostEffectiveFixes: []
			},
			patterns: {
				unsafeSendingPatterns: [],
				highRiskTimes: [],
				highRiskContent: []
			},
			recommendations: [
				'Test spam score for this domain',
				'Check authentication records (DKIM, SPF, DMARC)',
				'Verify DNS configuration'
			],
			confidence: 0
		};
	}
	
	/**
	 * Analyze spam score from memories
	 */
	private analyzeSpamScore(memories: MemoryItem[]): {
		current: number;
		average: number;
		trend: 'improving' | 'stable' | 'declining';
		issues: string[];
		riskLevel: 'low' | 'medium' | 'high' | 'critical';
	} {
		const spamScoreMemories = memories.filter(m => 
			m.content.score !== undefined ||
			m.metadata.tags?.includes('spam-score')
		);
		
		if (spamScoreMemories.length === 0) {
			return {
				current: 0,
				average: 0,
				trend: 'stable',
				issues: [],
				riskLevel: 'low'
			};
		}
		
		// Calculate scores
		let totalScore = 0;
		let currentScore = 0;
		const allIssues: string[] = [];
		
		for (const memory of spamScoreMemories) {
			const score = memory.content.score || 0;
			totalScore += score;
			
			// Get current score (most recent)
			if (currentScore === 0) {
				currentScore = score;
			}
			
			// Collect issues
			if (memory.content.issues && Array.isArray(memory.content.issues)) {
				for (const issue of memory.content.issues) {
					if (!allIssues.includes(issue)) {
						allIssues.push(issue);
					}
				}
			}
		}
		
		const averageScore = spamScoreMemories.length > 0 ? totalScore / spamScoreMemories.length : 0;
		
		// Determine trend
		let trend: 'improving' | 'stable' | 'declining' = 'stable';
		if (spamScoreMemories.length >= 3) {
			const recentScores = spamScoreMemories.slice(0, 3).map(m => m.content.score || 0);
			const olderScores = spamScoreMemories.slice(-3).map(m => m.content.score || 0);
			
			const recentAverage = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
			const olderAverage = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
			
			if (recentAverage < olderAverage - 5) {
				trend = 'improving';
			} else if (recentAverage > olderAverage + 5) {
				trend = 'declining';
			}
		}
		
		// Determine risk level
		let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
		if (currentScore >= 80) {
			riskLevel = 'critical';
		} else if (currentScore >= 60) {
			riskLevel = 'high';
		} else if (currentScore >= 40) {
			riskLevel = 'medium';
		}
		
		return {
			current: currentScore,
			average: averageScore,
			trend,
			issues: allIssues.slice(0, 10),
			riskLevel
		};
	}
	
	/**
		* Analyze authentication from memories
		*/
	private analyzeAuthentication(memories: MemoryItem[]): {
		dkim: 'valid' | 'invalid' | 'unknown';
		spf: 'valid' | 'invalid' | 'unknown';
		dmarc: 'valid' | 'invalid' | 'unknown';
		overall: 'good' | 'partial' | 'poor';
		issues: string[];
	} {
		const authMemories = memories.filter(m =>
			m.content.type === 'dkim' ||
			m.content.type === 'spf' ||
			m.content.type === 'dmarc' ||
			m.metadata.tags?.includes('authentication-failure')
		);
		
		let dkim: 'valid' | 'invalid' | 'unknown' = 'unknown';
		let spf: 'valid' | 'invalid' | 'unknown' = 'unknown';
		let dmarc: 'valid' | 'invalid' | 'unknown' = 'unknown';
		const issues: string[] = [];
		
		for (const memory of authMemories) {
			const type = memory.content.type;
			const resolved = memory.content.resolved === true;
			
			if (type === 'dkim') {
				dkim = resolved ? 'valid' : 'invalid';
			} else if (type === 'spf') {
				spf = resolved ? 'valid' : 'invalid';
			} else if (type === 'dmarc') {
				dmarc = resolved ? 'valid' : 'invalid';
			}
			
			if (!resolved && memory.content.error) {
				issues.push(`${type.toUpperCase()}: ${memory.content.error}`);
			}
		}
		
		// Determine overall status
		let overall: 'good' | 'partial' | 'poor' = 'good';
		const invalidCount = [dkim, spf, dmarc].filter(status => status === 'invalid').length;
		const unknownCount = [dkim, spf, dmarc].filter(status => status === 'unknown').length;
		
		if (invalidCount >= 2) {
			overall = 'poor';
		} else if (invalidCount >= 1 || unknownCount >= 2) {
			overall = 'partial';
		}
		
		return {
			dkim,
			spf,
			dmarc,
			overall,
			issues
		};
	}
	
	/**
		* Analyze DNS from memories
		*/
	private analyzeDns(memories: MemoryItem[]): {
		mx: 'valid' | 'invalid' | 'unknown';
		txt: 'valid' | 'invalid' | 'unknown';
		overall: 'good' | 'partial' | 'poor';
		issues: string[];
	} {
		const dnsMemories = memories.filter(m =>
			m.content.type === 'mx' ||
			m.content.type === 'txt' ||
			m.content.type === 'a' ||
			m.content.type === 'cname' ||
			m.metadata.tags?.includes('dns-issue')
		);
		
		let mx: 'valid' | 'invalid' | 'unknown' = 'unknown';
		let txt: 'valid' | 'invalid' | 'unknown' = 'unknown';
		const issues: string[] = [];
		
		for (const memory of dnsMemories) {
			const type = memory.content.type;
			const resolved = memory.content.resolved === true;
			
			if (type === 'mx') {
				mx = resolved ? 'valid' : 'invalid';
			} else if (type === 'txt') {
				txt = resolved ? 'valid' : 'invalid';
			}
			
			if (!resolved && memory.content.error) {
				issues.push(`${type.toUpperCase()}: ${memory.content.error}`);
			}
		}
		
		// Determine overall status
		let overall: 'good' | 'partial' | 'poor' = 'good';
		const invalidCount = [mx, txt].filter(status => status === 'invalid').length;
		const unknownCount = [mx, txt].filter(status => status === 'unknown').length;
		
		if (invalidCount >= 1) {
			overall = 'poor';
		} else if (unknownCount >= 1) {
			overall = 'partial';
		}
		
		return {
			mx,
			txt,
			overall,
			issues
		};
	}
	
	/**
		* Analyze fixes from memories
		*/
	private analyzeFixes(memories: MemoryItem[]): {
		totalApplied: number;
		successRate: number;
		lastFix: Date | null;
		mostEffectiveFixes: string[];
	} {
		const fixMemories = memories.filter(m =>
			m.content.fix ||
			m.metadata.tags?.includes('fix-applied')
		);
		
		if (fixMemories.length === 0) {
			return {
				totalApplied: 0,
				successRate: 0,
				lastFix: null,
				mostEffectiveFixes: []
			};
		}
		
		let totalApplied = 0;
		let successfulFixes = 0;
		let lastFix: Date | null = null;
		const fixEffectiveness = new Map<string, { count: number; success: number; improvement: number }>();
		
		for (const memory of fixMemories) {
			totalApplied++;
			
			const success = memory.content.success === true;
			if (success) {
				successfulFixes++;
			}
			
			const fix = memory.content.fix || 'Unknown fix';
			const improvement = memory.content.improvement || 0;
			
			if (!fixEffectiveness.has(fix)) {
				fixEffectiveness.set(fix, { count: 0, success: 0, improvement: 0 });
			}
			
			const stats = fixEffectiveness.get(fix)!;
			stats.count++;
			if (success) stats.success++;
			stats.improvement += improvement;
			
			// Update last fix date
			if (memory.metadata.createdAt && (!lastFix || memory.metadata.createdAt > lastFix)) {
				lastFix = memory.metadata.createdAt;
			}
		}
		
		const successRate = totalApplied > 0 ? (successfulFixes / totalApplied) * 100 : 0;
		
		// Get most effective fixes
		const mostEffectiveFixes = Array.from(fixEffectiveness.entries())
			.map(([fix, stats]) => ({
				fix,
				effectiveness: stats.count > 0 ? (stats.success / stats.count) * 100 : 0,
				averageImprovement: stats.count > 0 ? stats.improvement / stats.count : 0
			}))
			.sort((a, b) => b.effectiveness - a.effectiveness || b.averageImprovement - a.averageImprovement)
			.slice(0, 5)
			.map(item => `${item.fix} (${item.effectiveness.toFixed(0)}% effective)`);
		
		return {
			totalApplied,
			successRate,
			lastFix,
			mostEffectiveFixes
		};
	}
	
	/**
		* Analyze patterns from memories
		*/
	private analyzePatterns(memories: MemoryItem[]): {
		unsafeSendingPatterns: string[];
		highRiskTimes: string[];
		highRiskContent: string[];
	} {
		const unsafePatterns: string[] = [];
		const highRiskTimes: string[] = [];
		const highRiskContent: string[] = [];
		
		// Common patterns to look for
		const commonUnsafePatterns = [
			'high volume sending',
			'rapid sending',
			'similar content',
			'high bounce rate',
			'high complaint rate'
		];
		
		const commonHighRiskTimes = [
			'late night',
			'early morning',
			'weekend',
			'holiday'
		];
		
		const commonHighRiskContent = [
			'sales language',
			'urgent language',
			'financial terms',
			'health claims',
			'weight loss'
		];
		
		for (const memory of memories) {
			const content = JSON.stringify(memory.content).toLowerCase();
			const summary = memory.summary.toLowerCase();
			const text = content + ' ' + summary;
			
			// Check for unsafe sending patterns
			for (const pattern of commonUnsafePatterns) {
				if (text.includes(pattern) && !unsafePatterns.includes(pattern)) {
					unsafePatterns.push(pattern);
				}
			}
			
			// Check for high risk times
			for (const time of commonHighRiskTimes) {
				if (text.includes(time) && !highRiskTimes.includes(time)) {
					highRiskTimes.push(time);
				}
			}
			
			// Check for high risk content
			for (const contentType of commonHighRiskContent) {
				if (text.includes(contentType) && !highRiskContent.includes(contentType)) {
					highRiskContent.push(contentType);
				}
			}
		}
		
		return {
			unsafeSendingPatterns: unsafePatterns,
			highRiskTimes: highRiskTimes,
			highRiskContent: highRiskContent
		};
	}
	
	/**
		* Generate recommendations
		*/
	private generateRecommendations(
		spamScore: any,
		authentication: any,
		dns: any,
		fixes: any,
		patterns: any
	): string[] {
		const recommendations: string[] = [];
		
		// Spam score recommendations
		if (spamScore.riskLevel === 'critical') {
			recommendations.push('Immediate action required: spam score is critical');
		} else if (spamScore.riskLevel === 'high') {
			recommendations.push('Address high spam score issues');
		} else if (spamScore.riskLevel === 'medium') {
			recommendations.push('Monitor and improve spam score');
		}
		
		if (spamScore.trend === 'declining') {
			recommendations.push('Address declining spam score trend');
		}
		
		if (spamScore.issues.length > 0) {
			recommendations.push(`Fix identified issues: ${spamScore.issues.slice(0, 3).join(', ')}`);
		}
		
		// Authentication recommendations
		if (authentication.overall === 'poor') {
			recommendations.push('Fix authentication failures immediately');
		} else if (authentication.overall === 'partial') {
			recommendations.push('Complete authentication setup');
		}
		
		if (authentication.dkim === 'invalid') {
			recommendations.push('Fix DKIM authentication');
		}
		if (authentication.spf === 'invalid') {
			recommendations.push('Fix SPF authentication');
		}
		if (authentication.dmarc === 'invalid') {
			recommendations.push('Fix DMARC authentication');
		}
		
		// DNS recommendations
		if (dns.overall === 'poor') {
			recommendations.push('Fix DNS configuration issues');
		} else if (dns.overall === 'partial') {
			recommendations.push('Verify DNS configuration');
		}
		
		if (dns.mx === 'invalid') {
			recommendations.push('Fix MX records');
		}
		if (dns.txt === 'invalid') {
			recommendations.push('Fix TXT records');
		}
		
		// Fix recommendations
		if (fixes.successRate < 70) {
			recommendations.push('Improve fix success rate');
		}
		
		if (fixes.mostEffectiveFixes.length > 0) {
			recommendations.push(`Consider applying: ${fixes.mostEffectiveFixes[0]}`);
		}
		
		// Pattern recommendations
		if (patterns.unsafeSendingPatterns.length > 0) {
			recommendations.push(`Avoid: ${patterns.unsafeSendingPatterns.slice(0, 2).join(', ')}`);
		}
		
		if (patterns.highRiskTimes.length > 0) {
			recommendations.push(`Schedule sends to avoid: ${patterns.highRiskTimes.slice(0, 2).join(', ')}`);
		}
		
		if (patterns.highRiskContent.length > 0) {
			recommendations.push(`Review content for: ${patterns.highRiskContent.slice(0, 2).join(', ')}`);
		}
		
		return recommendations.slice(0, 10);
	}
}
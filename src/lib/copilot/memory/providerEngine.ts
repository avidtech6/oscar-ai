/**
 * Provider Memory Engine
 * 
 * Manages provider-level memory, provider intelligence, and provider history tracking.
 * Provides provider intelligence for context-aware provider management.
 */

import type { 
	ProviderHistory, 
	MemoryItem, 
	MemoryCategory,
	MemoryWriteOptions 
} from './memoryTypes';
import { MemoryEngine } from './memoryEngine';
import { MemorySelectors } from './memorySelectors';

/**
 * Provider Engine Configuration
 */
export interface ProviderEngineConfig {
	/** Memory engine instance */
	memoryEngine: MemoryEngine;
	
	/** Memory selectors instance */
	memorySelectors: MemorySelectors;
	
	/** Whether to auto-track provider performance */
	autoTrackPerformance: boolean;
	
	/** Whether to track verification attempts */
	trackVerificationAttempts: boolean;
	
	/** Whether to track smart share events */
	trackSmartShareEvents: boolean;
	
	/** Update interval in milliseconds */
	updateIntervalMs: number;
}

/**
 * Provider Analysis Result
 */
export interface ProviderAnalysis {
	/** Provider identifier */
	providerId: string;
	
	/** Provider type */
	providerType: 'email' | 'smtp' | 'api' | 'combined';
	
	/** Configuration status */
	configuration: {
		status: 'configured' | 'partial' | 'not-configured';
		lastConfigured: Date | null;
		configurationCount: number;
		successRate: number;
	};
	
	/** Verification status */
	verification: {
		status: 'verified' | 'pending' | 'failed';
		lastAttempt: Date | null;
		attemptCount: number;
		successRate: number;
	};
	
	/** Performance metrics */
	performance: {
		averageResponseTimeMs: number;
		successRate: number;
		lastTested: Date | null;
		trend: 'improving' | 'stable' | 'declining';
	};
	
	/** Error analysis */
	errors: {
		totalErrors: number;
		criticalErrors: number;
		lastError: Date | null;
		commonErrorTypes: string[];
		resolutionRate: number;
	};
	
	/** Smart Share integration */
	smartShare: {
		enabled: boolean;
		eventsCount: number;
		lastEvent: Date | null;
		successRate: number;
	};
	
	/** Recommendations */
	recommendations: string[];
	
	/** Confidence score (0-100) */
	confidence: number;
}

/**
 * Provider Memory Engine
 */
export class ProviderEngine {
	private memoryEngine: MemoryEngine;
	private memorySelectors: MemorySelectors;
	private config: ProviderEngineConfig;
	private updateInterval: NodeJS.Timeout | null = null;
	
	constructor(config: Partial<ProviderEngineConfig> = {}) {
		this.memoryEngine = config.memoryEngine ?? new MemoryEngine();
		this.memorySelectors = config.memorySelectors ?? new MemorySelectors({ memoryEngine: this.memoryEngine });
		
		this.config = {
			memoryEngine: this.memoryEngine,
			memorySelectors: this.memorySelectors,
			autoTrackPerformance: config.autoTrackPerformance ?? true,
			trackVerificationAttempts: config.trackVerificationAttempts ?? true,
			trackSmartShareEvents: config.trackSmartShareEvents ?? true,
			updateIntervalMs: config.updateIntervalMs ?? 60 * 60 * 1000 // 1 hour
		};
		
		// Start auto-update if enabled
		if (this.config.autoTrackPerformance) {
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
				await this.autoUpdateProviderMetrics();
			} catch (error) {
				console.error('Auto-update of provider metrics failed:', error);
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
	 * Auto-update provider metrics
	 */
	private async autoUpdateProviderMetrics(): Promise<void> {
		console.log('Auto-updating provider metrics...');
		
		// Get recent provider memories
		const recentMemories = await this.memorySelectors.getRecentMemories(100);
		const providerMemories = recentMemories.filter(m =>
			m.category === 'provider'
		);
		
		if (providerMemories.length === 0) {
			return;
		}
		
		// Group by provider
		const providerGroups = new Map<string, MemoryItem[]>();
		for (const memory of providerMemories) {
			const providerId = memory.metadata.relatedEntities.providerId ||
							  memory.content.providerId ||
							  'unknown';
			if (!providerGroups.has(providerId)) {
				providerGroups.set(providerId, []);
			}
			providerGroups.get(providerId)!.push(memory);
		}
		
		// Update metrics for each provider
		const entries = Array.from(providerGroups.entries());
		for (const [providerId, memories] of entries) {
			if (providerId !== 'unknown') {
				try {
					await this.updateProviderMetrics(providerId, memories);
					console.log(`Updated metrics for provider: ${providerId}`);
				} catch (error) {
					console.error(`Failed to update metrics for provider ${providerId}:`, error);
				}
			}
		}
	}
	
	/**
	 * Update provider metrics
	 */
	private async updateProviderMetrics(providerId: string, memories: MemoryItem[]): Promise<void> {
		const analysis = await this.analyzeProvider(providerId);
		
		// Create provider history from analysis
		const history: ProviderHistory = {
			providerId,
			providerType: analysis.providerType,
			configurations: [],
			verificationAttempts: [],
			smartShareEvents: [],
			errors: [],
			performance: {
				averageResponseTimeMs: analysis.performance.averageResponseTimeMs,
				successRate: analysis.performance.successRate,
				lastTested: analysis.performance.lastTested || new Date()
			},
			lastUpdated: new Date()
		};
		
		// Save history to memory
		await this.memoryEngine.writeMemory(
			'provider',
			'system',
			history,
			`Provider metrics updated: ${providerId}`,
			{
				tags: ['provider-metrics', providerId, 'auto-updated'],
				importance: 60,
				confidence: analysis.confidence
			}
		);
	}
	
	/**
	 * Get provider history
	 */
	async getProviderHistory(providerId: string): Promise<ProviderHistory | null> {
		return await this.memorySelectors.getProviderHistory(providerId);
	}
	
	/**
	 * Analyze provider
	 */
	async analyzeProvider(providerId: string): Promise<ProviderAnalysis> {
		const history = await this.getProviderHistory(providerId);
		const memories = await this.getProviderMemories(providerId);
		
		if (memories.length === 0) {
			return this.createDefaultAnalysis(providerId);
		}
		
		// Analyze provider data
		const configuration = this.analyzeConfiguration(memories);
		const verification = this.analyzeVerification(memories);
		const performance = this.analyzePerformance(memories);
		const errors = this.analyzeErrors(memories);
		const smartShare = this.analyzeSmartShare(memories);
		const recommendations = this.generateRecommendations(memories, configuration, verification, performance, errors);
		
		// Calculate confidence based on data points
		const confidence = Math.min(100, memories.length * 5);
		
		return {
			providerId,
			providerType: this.detectProviderType(memories),
			configuration,
			verification,
			performance,
			errors,
			smartShare,
			recommendations,
			confidence
		};
	}
	
	/**
	 * Record provider configuration
	 */
	async recordConfiguration(
		providerId: string,
		config: {
			type: 'email' | 'smtp' | 'api' | 'combined';
			settings: any;
			success: boolean;
			errors?: string[];
			warnings?: string[];
		}
	): Promise<void> {
		const now = new Date();
		
		// Create configuration memory
		const memoryContent = {
			providerId,
			type: config.type,
			settings: config.settings,
			success: config.success,
			errors: config.errors || [],
			warnings: config.warnings || [],
			timestamp: now
		};
		
		await this.memoryEngine.writeMemory(
			'provider',
			'user-action',
			memoryContent,
			`Provider configuration: ${config.success ? 'success' : 'failed'}`,
			{
				tags: ['provider-configuration', providerId, config.type],
				importance: 70,
				confidence: 80
			}
		);
		
		// Auto-update metrics
		if (this.config.autoTrackPerformance) {
			const memories = await this.getProviderMemories(providerId);
			await this.updateProviderMetrics(providerId, memories);
		}
	}
	
	/**
	 * Record verification attempt
	 */
	async recordVerificationAttempt(
		providerId: string,
		attempt: {
			method: 'manual' | 'smart-share' | 'api';
			success: boolean;
			error?: string;
			verificationCode?: string;
		}
	): Promise<void> {
		const now = new Date();
		
		// Create verification memory
		const memoryContent = {
			providerId,
			method: attempt.method,
			success: attempt.success,
			error: attempt.error,
			verificationCode: attempt.verificationCode,
			timestamp: now
		};
		
		await this.memoryEngine.writeMemory(
			'provider',
			'user-action',
			memoryContent,
			`Verification attempt: ${attempt.success ? 'success' : 'failed'}`,
			{
				tags: ['provider-verification', providerId, attempt.method],
				importance: 70,
				confidence: 85
			}
		);
		
		// Auto-update metrics
		if (this.config.autoTrackPerformance) {
			const memories = await this.getProviderMemories(providerId);
			await this.updateProviderMetrics(providerId, memories);
		}
	}
	
	/**
	 * Record smart share event
	 */
	async recordSmartShareEvent(
		providerId: string,
		event: {
			event: 'requested' | 'completed' | 'failed';
			data?: any;
			error?: string;
		}
	): Promise<void> {
		const now = new Date();
		
		// Create smart share memory
		const memoryContent = {
			providerId,
			event: event.event,
			data: event.data,
			error: event.error,
			timestamp: now
		};
		
		await this.memoryEngine.writeMemory(
			'provider',
			'smart-share',
			memoryContent,
			`Smart Share event: ${event.event}`,
			{
				tags: ['smart-share', providerId, event.event],
				importance: 60,
				confidence: 75
			}
		);
		
		// Auto-update metrics
		if (this.config.autoTrackPerformance) {
			const memories = await this.getProviderMemories(providerId);
			await this.updateProviderMetrics(providerId, memories);
		}
	}
	
	/**
	 * Record provider error
	 */
	async recordError(
		providerId: string,
		error: {
			error: string;
			severity: 'low' | 'medium' | 'high' | 'critical';
			context?: any;
			resolved?: boolean;
			resolution?: string;
		}
	): Promise<void> {
		const now = new Date();
		
		// Create error memory
		const memoryContent = {
			providerId,
			error: error.error,
			severity: error.severity,
			context: error.context,
			resolved: error.resolved || false,
			resolution: error.resolution,
			timestamp: now
		};
		
		await this.memoryEngine.writeMemory(
			'provider',
			'system',
			memoryContent,
			`Provider error: ${error.error.substring(0, 50)}...`,
			{
				tags: ['provider-error', providerId, error.severity],
				importance: error.severity === 'critical' ? 90 : 
						   error.severity === 'high' ? 80 : 
						   error.severity === 'medium' ? 70 : 60,
				confidence: 85
			}
		);
		
		// Auto-update metrics
		if (this.config.autoTrackPerformance) {
			const memories = await this.getProviderMemories(providerId);
			await this.updateProviderMetrics(providerId, memories);
		}
	}
	
	/**
	 * Suggest provider improvements
	 */
	async suggestProviderImprovements(providerId: string): Promise<string[]> {
		const analysis = await this.analyzeProvider(providerId);
		return analysis.recommendations;
	}
	
	/**
	 * Get provider memories
	 */
	private async getProviderMemories(providerId: string): Promise<MemoryItem[]> {
		const query = {
			category: 'provider' as MemoryCategory,
			relatedTo: { providerId },
			limit: 200,
			sortBy: 'createdAt' as const,
			sortOrder: 'desc' as const
		};
		
		const result = await this.memoryEngine.queryMemories(query);
		return result.items;
	}
	
	/**
	 * Create default analysis for new providers
	 */
	private createDefaultAnalysis(providerId: string): ProviderAnalysis {
		return {
			providerId,
			providerType: 'email',
			configuration: {
				status: 'not-configured',
				lastConfigured: null,
				configurationCount: 0,
				successRate: 0
			},
			verification: {
				status: 'pending',
				lastAttempt: null,
				attemptCount: 0,
				successRate: 0
			},
			performance: {
				averageResponseTimeMs: 0,
				successRate: 0,
				lastTested: null,
				trend: 'stable'
			},
			errors: {
				totalErrors: 0,
				criticalErrors: 0,
				lastError: null,
				commonErrorTypes: [],
				resolutionRate: 0
			},
			smartShare: {
				enabled: false,
				eventsCount: 0,
				lastEvent: null,
				successRate: 0
			},
			recommendations: ['Configure provider settings', 'Verify provider connection'],
			confidence: 0
		};
	}
	
	/**
	 * Detect provider type from memories
	 */
	private detectProviderType(memories: MemoryItem[]): 'email' | 'smtp' | 'api' | 'combined' {
		// Look for type in provider memories
		for (const memory of memories) {
			if (memory.content.type) {
				return memory.content.type;
			}
			if (memory.content.providerType) {
				return memory.content.providerType;
			}
		}
		
		// Infer from content
		for (const memory of memories) {
			const content = JSON.stringify(memory.content).toLowerCase();
			if (content.includes('smtp') && content.includes('imap')) {
				return 'email';
			} else if (content.includes('smtp')) {
				return 'smtp';
			} else if (content.includes('api')) {
				return 'api';
			}
		}
		
		return 'email';
	}
	
	/**
	 * Analyze configuration from memories
	 */
	private analyzeConfiguration(memories: MemoryItem[]): {
		status: 'configured' | 'partial' | 'not-configured';
		lastConfigured: Date | null;
		configurationCount: number;
		successRate: number;
	} {
		const configMemories = memories.filter(m => 
			m.content.settings || 
			m.summary.toLowerCase().includes('config') ||
			m.tags?.includes('provider-configuration')
		);
		
		if (configMemories.length === 0) {
			return {
				status: 'not-configured',
				lastConfigured: null,
				configurationCount: 0,
				successRate: 0
			};
		}
		
		// Find successful configurations
		const successfulConfigs = configMemories.filter(m => 
			m.content.success === true
		);
		
		const lastConfigured = configMemories.length > 0 
			? configMemories[0].metadata.createdAt 
			: null;
		
		const successRate = configMemories.length > 0
			? (successfulConfigs.length / configMemories.length) * 100
			: 0;
		
		let status: 'configured' | 'partial' | 'not-configured' = 'not-configured';
		if (successfulConfigs.length > 0) {
			status = 'configured';
		} else if (configMemories.length > 0) {
			status = 'partial';
		}
		
		return {
			status,
			lastConfigured,
			configurationCount: configMemories.length,
			successRate
		};
	}
	
	/**
	 * Analyze verification from memories
	 */
	private analyzeVerification(memories: MemoryItem[]): {
		status: 'verified' | 'pending' | 'failed';
		lastAttempt: Date | null;
		attemptCount: number;
		successRate: number;
	} {
		const verificationMemories = memories.filter(m =>
			m.content.method ||
			m.summary.toLowerCase().includes('verification') ||
			m.metadata.tags?.includes('provider-verification')
		);
		
		if (verificationMemories.length === 0) {
			return {
				status: 'pending',
				lastAttempt: null,
				attemptCount: 0,
				successRate: 0
			};
		}
		
		// Find successful verifications
		const successfulVerifications = verificationMemories.filter(m =>
			m.content.success === true
		);
		
		const lastAttempt = verificationMemories.length > 0
			? verificationMemories[0].metadata.createdAt
			: null;
		
		const successRate = verificationMemories.length > 0
			? (successfulVerifications.length / verificationMemories.length) * 100
			: 0;
		
		let status: 'verified' | 'pending' | 'failed' = 'pending';
		if (successfulVerifications.length > 0) {
			status = 'verified';
		} else if (verificationMemories.length > 0) {
			status = 'failed';
		}
		
		return {
			status,
			lastAttempt,
			attemptCount: verificationMemories.length,
			successRate
		};
	}
	
	/**
	 * Analyze performance from memories
	 */
	private analyzePerformance(memories: MemoryItem[]): {
		averageResponseTimeMs: number;
		successRate: number;
		lastTested: Date | null;
		trend: 'improving' | 'stable' | 'declining';
	} {
		const performanceMemories = memories.filter(m =>
			m.content.responseTime ||
			m.content.successRate ||
			m.summary.toLowerCase().includes('performance') ||
			m.metadata.tags?.includes('provider-metrics')
		);
		
		if (performanceMemories.length === 0) {
			return {
				averageResponseTimeMs: 0,
				successRate: 0,
				lastTested: null,
				trend: 'stable'
			};
		}
		
		// Calculate average response time
		let totalResponseTime = 0;
		let responseTimeCount = 0;
		let totalSuccessRate = 0;
		let successRateCount = 0;
		let lastTested: Date | null = null;
		
		for (const memory of performanceMemories) {
			if (memory.content.responseTime) {
				totalResponseTime += memory.content.responseTime;
				responseTimeCount++;
			}
			if (memory.content.successRate) {
				totalSuccessRate += memory.content.successRate;
				successRateCount++;
			}
			if (memory.metadata.createdAt && (!lastTested || memory.metadata.createdAt > lastTested)) {
				lastTested = memory.metadata.createdAt;
			}
		}
		
		const averageResponseTimeMs = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
		const successRate = successRateCount > 0 ? totalSuccessRate / successRateCount : 0;
		
		// Simple trend analysis (would be more sophisticated in production)
		let trend: 'improving' | 'stable' | 'declining' = 'stable';
		if (performanceMemories.length >= 3) {
			const recentMemories = performanceMemories.slice(0, 3);
			const olderMemories = performanceMemories.slice(-3);
			
			let recentSuccessRate = 0;
			let olderSuccessRate = 0;
			
			for (const memory of recentMemories) {
				if (memory.content.successRate) {
					recentSuccessRate += memory.content.successRate;
				}
			}
			
			for (const memory of olderMemories) {
				if (memory.content.successRate) {
					olderSuccessRate += memory.content.successRate;
				}
			}
			
			if (recentSuccessRate > olderSuccessRate + 10) {
				trend = 'improving';
			} else if (recentSuccessRate < olderSuccessRate - 10) {
				trend = 'declining';
			}
		}
		
		return {
			averageResponseTimeMs,
			successRate,
			lastTested,
			trend
		};
	}
	
	/**
	 * Analyze errors from memories
	 */
	private analyzeErrors(memories: MemoryItem[]): {
		totalErrors: number;
		criticalErrors: number;
		lastError: Date | null;
		commonErrorTypes: string[];
		resolutionRate: number;
	} {
		const errorMemories = memories.filter(m =>
			m.content.error ||
			m.summary.toLowerCase().includes('error') ||
			m.metadata.tags?.includes('provider-error')
		);
		
		if (errorMemories.length === 0) {
			return {
				totalErrors: 0,
				criticalErrors: 0,
				lastError: null,
				commonErrorTypes: [],
				resolutionRate: 0
			};
		}
		
		// Analyze errors
		let totalErrors = 0;
		let criticalErrors = 0;
		let resolvedErrors = 0;
		let lastError: Date | null = null;
		const errorTypes = new Map<string, number>();
		
		for (const memory of errorMemories) {
			totalErrors++;
			
			// Check severity
			if (memory.content.severity === 'critical' || memory.content.severity === 'high') {
				criticalErrors++;
			}
			
			// Check if resolved
			if (memory.content.resolved === true) {
				resolvedErrors++;
			}
			
			// Track error type
			const errorText = memory.content.error || memory.summary;
			if (errorText) {
				// Extract first few words as error type
				const words = errorText.split(' ').slice(0, 3).join(' ');
				errorTypes.set(words, (errorTypes.get(words) || 0) + 1);
			}
			
			// Update last error date
			if (memory.metadata.createdAt && (!lastError || memory.metadata.createdAt > lastError)) {
				lastError = memory.metadata.createdAt;
			}
		}
		
		// Get most common error types
		const commonErrorTypes = Array.from(errorTypes.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([error]) => error);
		
		const resolutionRate = totalErrors > 0 ? (resolvedErrors / totalErrors) * 100 : 0;
		
		return {
			totalErrors,
			criticalErrors,
			lastError,
			commonErrorTypes,
			resolutionRate
		};
	}
	
	/**
	 * Analyze smart share from memories
	 */
	private analyzeSmartShare(memories: MemoryItem[]): {
		enabled: boolean;
		eventsCount: number;
		lastEvent: Date | null;
		successRate: number;
	} {
		const smartShareMemories = memories.filter(m =>
			m.source === 'smart-share' ||
			m.summary.toLowerCase().includes('smart share') ||
			m.metadata.tags?.includes('smart-share')
		);
		
		if (smartShareMemories.length === 0) {
			return {
				enabled: false,
				eventsCount: 0,
				lastEvent: null,
				successRate: 0
			};
		}
		
		// Analyze smart share events
		let eventsCount = 0;
		let successfulEvents = 0;
		let lastEvent: Date | null = null;
		
		for (const memory of smartShareMemories) {
			eventsCount++;
			
			// Check if event was successful
			if (memory.content.event === 'completed' || memory.content.success === true) {
				successfulEvents++;
			}
			
			// Update last event date
			if (memory.metadata.createdAt && (!lastEvent || memory.metadata.createdAt > lastEvent)) {
				lastEvent = memory.metadata.createdAt;
			}
		}
		
		const successRate = eventsCount > 0 ? (successfulEvents / eventsCount) * 100 : 0;
		const enabled = eventsCount > 0;
		
		return {
			enabled,
			eventsCount,
			lastEvent,
			successRate
		};
	}
	
	/**
	 * Generate recommendations
	 */
	private generateRecommendations(
		memories: MemoryItem[],
		configuration: any,
		verification: any,
		performance: any,
		errors: any
	): string[] {
		const recommendations: string[] = [];
		
		// Configuration recommendations
		if (configuration.status === 'not-configured') {
			recommendations.push('Configure provider settings');
		} else if (configuration.status === 'partial') {
			recommendations.push('Complete provider configuration');
		} else if (configuration.successRate < 80) {
			recommendations.push('Review and fix configuration issues');
		}
		
		// Verification recommendations
		if (verification.status === 'pending') {
			recommendations.push('Verify provider connection');
		} else if (verification.status === 'failed') {
			recommendations.push('Retry verification with correct credentials');
		} else if (verification.successRate < 70) {
			recommendations.push('Improve verification success rate');
		}
		
		// Performance recommendations
		if (performance.successRate < 90) {
			recommendations.push('Investigate performance issues');
		}
		if (performance.averageResponseTimeMs > 5000) {
			recommendations.push('Optimize provider response time');
		}
		if (performance.trend === 'declining') {
			recommendations.push('Address declining performance trend');
		}
		
		// Error recommendations
		if (errors.totalErrors > 10) {
			recommendations.push('Reduce error frequency');
		}
		if (errors.criticalErrors > 0) {
			recommendations.push('Resolve critical errors immediately');
		}
		if (errors.resolutionRate < 80) {
			recommendations.push('Improve error resolution rate');
		}
		
		// Smart Share recommendations
		const smartShare = this.analyzeSmartShare(memories);
		if (!smartShare.enabled && memories.length > 5) {
			recommendations.push('Consider enabling Smart Share for easier setup');
		} else if (smartShare.enabled && smartShare.successRate < 80) {
			recommendations.push('Improve Smart Share success rate');
		}
		
		return recommendations.slice(0, 5);
	}
}
/**
 * Memory Selectors
 * 
 * Provides high-level selectors for accessing memory data.
 * These selectors abstract the underlying memory engine and provide
 * convenient access to common memory queries.
 */

import type {
	MemoryItem,
	MemoryCategory,
	MemorySource,
	MemoryQuery,
	MemoryResult,
	ClientProfile,
	ThreadSummary,
	DocumentSummary,
	StyleProfile,
	ProviderHistory,
	DeliverabilityHistory,
	WorkflowHistory
} from './memoryTypes';
import { MemoryEngine } from './memoryEngine';

/**
 * Memory Selectors Configuration
 */
export interface MemorySelectorsConfig {
	/** Memory engine instance */
	memoryEngine: MemoryEngine;
	
	/** Default limit for queries */
	defaultLimit: number;
	
	/** Whether to cache selector results */
	cacheResults: boolean;
	
	/** Cache TTL in milliseconds */
	cacheTtlMs: number;
}

/**
 * Cached selector result
 */
interface CachedResult<T> {
	data: T;
	timestamp: Date;
	expiresAt: Date;
}

/**
 * Memory Selectors
 */
export class MemorySelectors {
	private memoryEngine: MemoryEngine;
	private config: MemorySelectorsConfig;
	private cache: Map<string, CachedResult<any>> = new Map();
	
	constructor(config: Partial<MemorySelectorsConfig> = {}) {
		this.memoryEngine = config.memoryEngine ?? new MemoryEngine();
		this.config = {
			memoryEngine: this.memoryEngine,
			defaultLimit: config.defaultLimit ?? 50,
			cacheResults: config.cacheResults ?? true,
			cacheTtlMs: config.cacheTtlMs ?? 5 * 60 * 1000 // 5 minutes
		};
	}
	
	/**
	 * Get client profile
	 */
	async getClientProfile(clientId: string): Promise<ClientProfile | null> {
		const cacheKey = `clientProfile:${clientId}`;
		
		// Check cache
		const cached = this.getFromCache<ClientProfile>(cacheKey);
		if (cached) {
			return cached;
		}
		
		// Query memories for this client
		const query: MemoryQuery = {
			category: ['client', 'email', 'document', 'workflow'],
			relatedTo: { clientId },
			limit: 100,
			sortBy: 'createdAt',
			sortOrder: 'desc'
		};
		
		const result = await this.memoryEngine.queryMemories(query);
		
		// Build client profile from memories
		const profile = this.buildClientProfile(clientId, result.items);
		
		// Cache result
		if (profile && this.config.cacheResults) {
			this.setCache(cacheKey, profile);
		}
		
		return profile;
	}
	
	/**
	 * Get thread summary
	 */
	async getThreadSummary(threadId: string): Promise<ThreadSummary | null> {
		const cacheKey = `threadSummary:${threadId}`;
		
		// Check cache
		const cached = this.getFromCache<ThreadSummary>(cacheKey);
		if (cached) {
			return cached;
		}
		
		// Query memories for this thread
		const query: MemoryQuery = {
			category: ['thread', 'email'],
			relatedTo: { threadId },
			limit: 100,
			sortBy: 'createdAt',
			sortOrder: 'asc' // Chronological order for threads
		};
		
		const result = await this.memoryEngine.queryMemories(query);
		
		// Build thread summary from memories
		const summary = this.buildThreadSummary(threadId, result.items);
		
		// Cache result
		if (summary && this.config.cacheResults) {
			this.setCache(cacheKey, summary);
		}
		
		return summary;
	}
	
	/**
	 * Get document history
	 */
	async getDocumentHistory(documentId: string): Promise<DocumentSummary | null> {
		const cacheKey = `documentHistory:${documentId}`;
		
		// Check cache
		const cached = this.getFromCache<DocumentSummary>(cacheKey);
		if (cached) {
			return cached;
		}
		
		// Query memories for this document
		const query: MemoryQuery = {
			category: ['document', 'email', 'workflow'],
			relatedTo: { documentId },
			limit: 50,
			sortBy: 'createdAt',
			sortOrder: 'desc'
		};
		
		const result = await this.memoryEngine.queryMemories(query);
		
		// Build document summary from memories
		const summary = this.buildDocumentSummary(documentId, result.items);
		
		// Cache result
		if (summary && this.config.cacheResults) {
			this.setCache(cacheKey, summary);
		}
		
		return summary;
	}
	
	/**
	 * Get provider history
	 */
	async getProviderHistory(providerId: string): Promise<ProviderHistory | null> {
		const cacheKey = `providerHistory:${providerId}`;
		
		// Check cache
		const cached = this.getFromCache<ProviderHistory>(cacheKey);
		if (cached) {
			return cached;
		}
		
		// Query memories for this provider
		const query: MemoryQuery = {
			category: ['provider', 'workflow'],
			relatedTo: { providerId },
			limit: 100,
			sortBy: 'createdAt',
			sortOrder: 'desc'
		};
		
		const result = await this.memoryEngine.queryMemories(query);
		
		// Build provider history from memories
		const history = this.buildProviderHistory(providerId, result.items);
		
		// Cache result
		if (history && this.config.cacheResults) {
			this.setCache(cacheKey, history);
		}
		
		return history;
	}
	
	/**
	 * Get deliverability history
	 */
	async getDeliverabilityHistory(domain: string): Promise<DeliverabilityHistory | null> {
		const cacheKey = `deliverabilityHistory:${domain}`;
		
		// Check cache
		const cached = this.getFromCache<DeliverabilityHistory>(cacheKey);
		if (cached) {
			return cached;
		}
		
		// Query memories for this domain
		const query: MemoryQuery = {
			category: ['deliverability', 'email'],
			limit: 100,
			sortBy: 'createdAt',
			sortOrder: 'desc'
		};
		
		const result = await this.memoryEngine.queryMemories(query);
		
		// Filter memories for this domain
		const domainMemories = result.items.filter(memory => {
			return memory.content.domain === domain || 
				   memory.content.email?.includes(`@${domain}`) ||
				   memory.summary.includes(domain);
		});
		
		// Build deliverability history from memories
		const history = this.buildDeliverabilityHistory(domain, domainMemories);
		
		// Cache result
		if (history && this.config.cacheResults) {
			this.setCache(cacheKey, history);
		}
		
		return history;
	}
	
	/**
	 * Get workflow history
	 */
	async getWorkflowHistory(workflowId: string): Promise<WorkflowHistory | null> {
		const cacheKey = `workflowHistory:${workflowId}`;
		
		// Check cache
		const cached = this.getFromCache<WorkflowHistory>(cacheKey);
		if (cached) {
			return cached;
		}
		
		// Query memories for this workflow
		const query: MemoryQuery = {
			category: 'workflow',
			relatedTo: { workflowId },
			limit: 100,
			sortBy: 'createdAt',
			sortOrder: 'desc'
		};
		
		const result = await this.memoryEngine.queryMemories(query);
		
		// Build workflow history from memories
		const history = this.buildWorkflowHistory(workflowId, result.items);
		
		// Cache result
		if (history && this.config.cacheResults) {
			this.setCache(cacheKey, history);
		}
		
		return history;
	}
	
	/**
	 * Get style profile
	 */
	async getStyleProfile(userId: string = 'default'): Promise<StyleProfile | null> {
		const cacheKey = `styleProfile:${userId}`;
		
		// Check cache
		const cached = this.getFromCache<StyleProfile>(cacheKey);
		if (cached) {
			return cached;
		}
		
		// Query memories for style learning
		const query: MemoryQuery = {
			category: ['style', 'email', 'document'],
			limit: 200,
			sortBy: 'createdAt',
			sortOrder: 'desc'
		};
		
		const result = await this.memoryEngine.queryMemories(query);
		
		// Build style profile from memories
		const profile = this.buildStyleProfile(userId, result.items);
		
		// Cache result
		if (profile && this.config.cacheResults) {
			this.setCache(cacheKey, profile);
		}
		
		return profile;
	}
	
	/**
	 * Get recent memories
	 */
	async getRecentMemories(limit?: number): Promise<MemoryItem[]> {
		const query: MemoryQuery = {
			limit: limit ?? this.config.defaultLimit,
			sortBy: 'createdAt',
			sortOrder: 'desc'
		};
		
		const result = await this.memoryEngine.queryMemories(query);
		return result.items;
	}
	
	/**
	 * Search memory by text query
	 */
	async searchMemory(query: string, limit?: number): Promise<MemoryItem[]> {
		const searchQuery: MemoryQuery = {
			textSearch: query,
			limit: limit ?? this.config.defaultLimit,
			sortBy: 'importance',
			sortOrder: 'desc'
		};
		
		const result = await this.memoryEngine.queryMemories(searchQuery);
		return result.items;
	}
	
	/**
	 * Search memory by embedding similarity (placeholder)
	 */
	async searchByEmbedding(embedding: number[], threshold: number = 0.7, limit?: number): Promise<MemoryItem[]> {
		// This would use a vector database in production
		// For now, return empty array
		console.warn('searchByEmbedding not implemented - returning empty array');
		return [];
	}
	
	/**
	 * Clear selector cache
	 */
	clearCache(): void {
		this.cache.clear();
	}
	
	/**
	 * Get cache statistics
	 */
	getCacheStats(): { size: number; hits: number; misses: number } {
		// Simple cache stats (would track hits/misses in production)
		return {
			size: this.cache.size,
			hits: 0, // Would track in production
			misses: 0 // Would track in production
		};
	}
	
	/**
	 * Get from cache
	 */
	private getFromCache<T>(key: string): T | null {
		if (!this.config.cacheResults) {
			return null;
		}
		
		const cached = this.cache.get(key);
		if (!cached) {
			return null;
		}
		
		// Check if cache entry has expired
		if (cached.expiresAt < new Date()) {
			this.cache.delete(key);
			return null;
		}
		
		return cached.data;
	}
	
	/**
	 * Set cache
	 */
	private setCache<T>(key: string, data: T): void {
		if (!this.config.cacheResults) {
			return;
		}
		
		const now = new Date();
		const cached: CachedResult<T> = {
			data,
			timestamp: now,
			expiresAt: new Date(now.getTime() + this.config.cacheTtlMs)
		};
		
		this.cache.set(key, cached);
		
		// Clean up expired entries occasionally
		if (this.cache.size > 100) {
			this.cleanupCache();
		}
	}
	
	/**
	 * Cleanup expired cache entries
	 */
	private cleanupCache(): void {
		const now = new Date();
		const entries = Array.from(this.cache.entries());
		for (const [key, cached] of entries) {
			if (cached.expiresAt < now) {
				this.cache.delete(key);
			}
		}
	}
	
	/**
	 * Build client profile from memories
	 */
	private buildClientProfile(clientId: string, memories: MemoryItem[]): ClientProfile | null {
		if (memories.length === 0) {
			return null;
		}
		
		const now = new Date();
		const clientMemories = memories.filter(m => 
			m.metadata.relatedEntities.clientId === clientId ||
			m.content.clientId === clientId
		);
		
		if (clientMemories.length === 0) {
			return null;
		}
		
		// Extract client information from memories
		let name: string | undefined;
		let email: string | undefined;
		const interactions: Array<{
			date: Date;
			type: 'email' | 'document' | 'workflow' | 'meeting';
			summary: string;
			outcome?: 'positive' | 'neutral' | 'negative';
		}> = [];
		
		const deliverabilityIssues: Array<{
			date: Date;
			issue: string;
			resolved: boolean;
		}> = [];
		
		const providerIssues: Array<{
			date: Date;
			providerId: string;
			issue: string;
			resolved: boolean;
		}> = [];
		
		const documents: Array<{
			documentId: string;
			type: 'report' | 'survey' | 'proposal' | 'contract' | 'other';
			title: string;
			sharedDate: Date;
			clientFeedback?: string;
		}> = [];
		
		for (const memory of clientMemories) {
			// Extract basic info
			if (memory.category === 'client') {
				name = memory.content.name || name;
				email = memory.content.email || email;
			}
			
			// Track interactions
			if (memory.category === 'email') {
				interactions.push({
					date: memory.metadata.createdAt,
					type: 'email',
					summary: memory.summary
				});
			} else if (memory.category === 'document') {
				documents.push({
					documentId: memory.content.documentId || memory.id,
					type: memory.content.type || 'other',
					title: memory.content.title || 'Untitled',
					sharedDate: memory.metadata.createdAt,
					clientFeedback: memory.content.feedback
				});
			}
			
			// Track issues
			if (memory.category === 'deliverability' && memory.content.issue) {
				deliverabilityIssues.push({
					date: memory.metadata.createdAt,
					issue: memory.content.issue,
					resolved: memory.content.resolved || false
				});
			}
			
			if (memory.category === 'provider' && memory.content.issue) {
				providerIssues.push({
					date: memory.metadata.createdAt,
					providerId: memory.content.providerId || 'unknown',
					issue: memory.content.issue,
					resolved: memory.content.resolved || false
				});
			}
		}
		
		// Sort interactions by date
		interactions.sort((a, b) => b.date.getTime() - a.date.getTime());
		
		// Calculate first and last contact
		const firstContact = interactions.length > 0 
			? interactions[interactions.length - 1].date 
			: now;
		const lastContact = interactions.length > 0 
			? interactions[0].date 
			: now;
		
		// Build profile
		const profile: ClientProfile = {
			clientId,
			name,
			email,
			preferences: {
				topicsOfInterest: [],
				topicsToAvoid: []
			},
			patterns: {
				averageResponseTimeHours: 24,
				typicalMessageLength: 'medium',
				greetingPatterns: [],
				closingPatterns: [],
				commonQuestions: [],
				commonConcerns: []
			},
			history: {
				firstContact,
				lastContact,
				totalInteractions: interactions.length,
				recentInteractions: interactions.slice(0, 10),
				deliverabilityIssues,
				providerIssues
			},
			documents,
			lastUpdated: now,
			confidence: Math.min(100, clientMemories.length * 10) // Rough confidence based on data points
		};
		
		return profile;
	}
	
	/**
	 * Build thread summary from memories
	 */
	private buildThreadSummary(threadId: string, memories: MemoryItem[]): ThreadSummary | null {
		if (memories.length === 0) {
			return null;
		}
		
		const threadMemories = memories.filter(m => 
			m.metadata.relatedEntities.threadId === threadId ||
			m.content.threadId === threadId
		);
		
		if (threadMemories.length === 0) {
			return null;
		}
		
		// Extract thread information
		let title = 'Untitled Thread';
		const participants = new Set<string>();
		const topics: string[] = [];
		const tasks: Array<{
			description: string;
			assignedTo?: string;
			dueDate?: Date;
			status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
			completedDate?: Date;
		}> = [];
		
		const actionsTaken: Array<{
			action: string;
			performedBy: 'user' | 'ai' | 'system';
			timestamp: Date;
			outcome?: 'success' | 'partial' | 'failure';
		}> = [];
		
		const pendingItems: Array<{
			item: string;
			priority: 'low' | 'medium' | 'high' | 'critical';
			deadline?: Date;
			assignedTo?: string;
		}> = [];
		
		const timeline: Array<{
			timestamp: Date;
			event: string;
			summary: string;
		}> = [];
		
		let lastActivity = new Date(0);
		
		for (const memory of threadMemories) {
			// Update title
			if (memory.content.subject && title === 'Untitled Thread') {
				title = memory.content.subject;
			}
			
			// Add participants
			if (memory.content.from) {
				participants.add(memory.content.from);
			}
			if (memory.content.to) {
				const recipients = Array.isArray(memory.content.to) ? memory.content.to : [memory.content.to];
				recipients.forEach((recipient: string) => participants.add(recipient));
			}
			
			// Add to timeline
			timeline.push({
				timestamp: memory.metadata.createdAt,
				event: memory.category === 'email' ? 'Email sent' : 'Thread updated',
				summary: memory.summary
			});
			
			// Update last activity
			if (memory.metadata.createdAt > lastActivity) {
				lastActivity = memory.metadata.createdAt;
			}
		}
		
		// Sort timeline chronologically
		timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
		
		// Build summary
		const summary: ThreadSummary = {
			threadId,
			title,
			participants: Array.from(participants).map(email => ({
				email,
				role: 'sender' // Simplified
			})),
			topics,
			tasks,
			actionsTaken,
			pendingItems,
			sentiment: {
				overall: 'neutral',
				confidence: 50,
				keyPhrases: []
			},
			timeline,
			lastActivity,
			archived: false
		};
		
		return summary;
	}
	
	/**
		* Build document summary from memories
		*/
	private buildDocumentSummary(documentId: string, memories: MemoryItem[]): DocumentSummary | null {
		if (memories.length === 0) {
			return null;
		}
		
		const now = new Date();
		const summary: DocumentSummary = {
			documentId,
			type: 'other',
			title: 'Untitled Document',
			topics: [],
			keyFindings: [],
			recommendations: [],
			actionsRequired: [],
			revisions: [],
			relatedDocuments: [],
			lastAccessed: now,
			archived: false
		};
		
		return summary;
	}
	
	/**
		* Build provider history from memories
		*/
	private buildProviderHistory(providerId: string, memories: MemoryItem[]): ProviderHistory | null {
		if (memories.length === 0) {
			return null;
		}
		
		const now = new Date();
		const history: ProviderHistory = {
			providerId,
			providerType: 'email',
			configurations: [],
			verificationAttempts: [],
			smartShareEvents: [],
			errors: [],
			performance: {
				averageResponseTimeMs: 0,
				successRate: 100,
				lastTested: now
			},
			lastUpdated: now
		};
		
		return history;
	}
	
	/**
		* Build deliverability history from memories
		*/
	private buildDeliverabilityHistory(domain: string, memories: MemoryItem[]): DeliverabilityHistory | null {
		if (memories.length === 0) {
			return null;
		}
		
		const now = new Date();
		const history: DeliverabilityHistory = {
			domain,
			spamScores: [],
			authenticationFailures: [],
			dnsIssues: [],
			fixesApplied: [],
			patterns: {
				unsafeSendingPatterns: [],
				highRiskTimes: [],
				highRiskContent: []
			},
			lastUpdated: now
		};
		
		return history;
	}
	
	/**
		* Build workflow history from memories
		*/
	private buildWorkflowHistory(workflowId: string, memories: MemoryItem[]): WorkflowHistory | null {
		if (memories.length === 0) {
			return null;
		}
		
		const now = new Date();
		const history: WorkflowHistory = {
			workflowId,
			executions: [],
			userPreferences: {
				autoStart: false,
				notifications: true
			},
			automationPatterns: {
				commonTriggers: [],
				commonContexts: [],
				successRate: 100,
				averageDurationMs: 0
			},
			lastExecuted: now,
			totalExecutions: 0,
			successRate: 100
		};
		
		return history;
	}
	
	/**
		* Build style profile from memories
		*/
	private buildStyleProfile(userId: string, memories: MemoryItem[]): StyleProfile | null {
		if (memories.length === 0) {
			return null;
		}
		
		const now = new Date();
		const profile: StyleProfile = {
			userId,
			tone: {
				overall: 'professional',
				variations: []
			},
			structure: {
				greetingPatterns: [],
				closingPatterns: [],
				signaturePatterns: [],
				paragraphLength: 'medium',
				sentenceLength: 'medium',
				bulletUsage: 'moderate',
				headingUsage: 'moderate'
			},
			vocabulary: {
				favoriteWords: [],
				avoidedWords: [],
				technicalTerms: [],
				formalityLevel: 'medium'
			},
			emailPreferences: {
				subjectLineStyle: 'descriptive',
				salutation: 'formal',
				valediction: 'formal',
				includeSignature: true
			},
			learning: {
				samplesAnalyzed: memories.length,
				lastAnalysis: now,
				confidence: Math.min(100, memories.length * 5),
				patterns: []
			},
			lastUpdated: now
		};
		
		return profile;
	}
}

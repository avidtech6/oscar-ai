/**
 * Client Profile Engine
 * 
 * Manages client profiles, aggregates client data from memories,
 * and provides client intelligence for personalized communication.
 */

import type { 
	ClientProfile, 
	MemoryItem, 
	MemoryCategory, 
	MemorySource,
	MemoryWriteOptions 
} from './memoryTypes';
import { MemoryEngine } from './memoryEngine';
import { MemorySelectors } from './memorySelectors';

/**
 * Client Engine Configuration
 */
export interface ClientEngineConfig {
	/** Memory engine instance */
	memoryEngine: MemoryEngine;
	
	/** Memory selectors instance */
	memorySelectors: MemorySelectors;
	
	/** Minimum interactions for reliable profile */
	minInteractionsForProfile: number;
	
	/** Whether to auto-update client profiles */
	autoUpdateProfiles: boolean;
	
	/** Update interval in milliseconds */
	updateIntervalMs: number;
	
	/** Whether to track communication patterns */
	trackPatterns: boolean;
	
	/** Whether to track sentiment */
	trackSentiment: boolean;
}

/**
 * Client Analysis Result
 */
export interface ClientAnalysis {
	/** Client identifier */
	clientId: string;
	
	/** Communication style preferences */
	communicationStyle: 'formal' | 'casual' | 'technical' | 'brief' | 'detailed';
	
	/** Preferred response time */
	preferredResponseTime: 'immediate' | 'same-day' | 'next-day' | 'flexible';
	
	/** Preferred communication channel */
	preferredChannel: 'email' | 'chat' | 'call' | 'meeting';
	
	/** Topics of interest */
	topicsOfInterest: string[];
	
	/** Topics to avoid */
	topicsToAvoid: string[];
	
	/** Average response time in hours */
	averageResponseTimeHours: number;
	
	/** Typical message length */
	typicalMessageLength: 'short' | 'medium' | 'long';
	
	/** Common greeting patterns */
	greetingPatterns: string[];
	
	/** Common closing patterns */
	closingPatterns: string[];
	
	/** Common questions asked */
	commonQuestions: string[];
	
	/** Common concerns raised */
	commonConcerns: string[];
	
	/** Overall sentiment trend */
	sentimentTrend: 'positive' | 'neutral' | 'negative';
	
	/** Confidence score (0-100) */
	confidence: number;
}

/**
 * Client Profile Engine
 */
export class ClientEngine {
	private memoryEngine: MemoryEngine;
	private memorySelectors: MemorySelectors;
	private config: ClientEngineConfig;
	private updateInterval: NodeJS.Timeout | null = null;
	
	constructor(config: Partial<ClientEngineConfig> = {}) {
		this.memoryEngine = config.memoryEngine ?? new MemoryEngine();
		this.memorySelectors = config.memorySelectors ?? new MemorySelectors({ memoryEngine: this.memoryEngine });
		
		this.config = {
			memoryEngine: this.memoryEngine,
			memorySelectors: this.memorySelectors,
			minInteractionsForProfile: config.minInteractionsForProfile ?? 5,
			autoUpdateProfiles: config.autoUpdateProfiles ?? true,
			updateIntervalMs: config.updateIntervalMs ?? 30 * 60 * 1000, // 30 minutes
			trackPatterns: config.trackPatterns ?? true,
			trackSentiment: config.trackSentiment ?? true
		};
		
		// Start auto-update if enabled
		if (this.config.autoUpdateProfiles) {
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
				await this.autoUpdateProfiles();
			} catch (error) {
				console.error('Auto-update of client profiles failed:', error);
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
	 * Auto-update all client profiles
	 */
	private async autoUpdateProfiles(): Promise<void> {
		console.log('Auto-updating client profiles...');
		
		// Get recent client memories
		const recentMemories = await this.memorySelectors.getRecentMemories(100);
		const clientMemories = recentMemories.filter(m =>
			m.category === 'client' ||
			m.metadata.relatedEntities.clientId
		);
		
		if (clientMemories.length === 0) {
			return;
		}
		
		// Group by client
		const clientGroups = new Map<string, MemoryItem[]>();
		for (const memory of clientMemories) {
			const clientId = memory.metadata.relatedEntities.clientId ||
							memory.content.clientId ||
							'unknown';
			if (!clientGroups.has(clientId)) {
				clientGroups.set(clientId, []);
			}
			clientGroups.get(clientId)!.push(memory);
		}
		
		// Update profiles for each client with enough interactions
		const entries = Array.from(clientGroups.entries());
		for (const [clientId, memories] of entries) {
			if (clientId !== 'unknown' && memories.length >= this.config.minInteractionsForProfile) {
				try {
					// Re-analyze client
					const analysis = await this.analyzeClient(clientId);
					console.log(`Updated client profile for: ${clientId}`);
				} catch (error) {
					console.error(`Failed to update client profile for ${clientId}:`, error);
				}
			}
		}
	}
	
	/**
	 * Get client profile
	 */
	async getClientProfile(clientId: string): Promise<ClientProfile | null> {
		return await this.memorySelectors.getClientProfile(clientId);
	}
	
	/**
	 * Analyze client interactions
	 */
	async analyzeClient(clientId: string): Promise<ClientAnalysis> {
		const profile = await this.getClientProfile(clientId);
		const memories = await this.getClientMemories(clientId);
		
		if (memories.length === 0) {
			return this.createDefaultAnalysis(clientId);
		}
		
		// Analyze communication patterns
		const patterns = this.analyzeCommunicationPatterns(memories);
		const sentiment = this.analyzeSentiment(memories);
		const topics = this.extractTopics(memories);
		
		// Calculate confidence based on data points
		const confidence = Math.min(100, memories.length * 10);
		
		return {
			clientId,
			communicationStyle: this.determineCommunicationStyle(patterns, sentiment),
			preferredResponseTime: this.calculatePreferredResponseTime(memories),
			preferredChannel: 'email', // Default - would implement determinePreferredChannel in production
			topicsOfInterest: topics.interest,
			topicsToAvoid: topics.avoid,
			averageResponseTimeHours: patterns.averageResponseTimeHours,
			typicalMessageLength: patterns.typicalMessageLength,
			greetingPatterns: patterns.greetingPatterns,
			closingPatterns: patterns.closingPatterns,
			commonQuestions: patterns.commonQuestions,
			commonConcerns: patterns.commonConcerns,
			sentimentTrend: sentiment.trend,
			confidence
		};
	}
	
	/**
	 * Update client profile with new interaction
	 */
	async updateClientProfile(
		clientId: string, 
		interaction: {
			type: 'email' | 'document' | 'workflow' | 'meeting';
			content: any;
			summary: string;
			sentiment?: 'positive' | 'neutral' | 'negative';
		}
	): Promise<ClientProfile> {
		const existingProfile = await this.getClientProfile(clientId);
		const now = new Date();
		
		// Create or update client memory
		const memoryContent = {
			clientId,
			type: interaction.type,
			content: interaction.content,
			sentiment: interaction.sentiment,
			timestamp: now
		};
		
		await this.memoryEngine.writeMemory(
			'client',
			'user-action',
			memoryContent,
			`Client interaction: ${interaction.summary}`,
			{
				tags: ['client-interaction', clientId, interaction.type],
				importance: 70,
				confidence: 80
			}
		);
		
		// Get updated profile
		const updatedProfile = await this.memorySelectors.getClientProfile(clientId);
		if (!updatedProfile) {
			throw new Error(`Failed to create/update profile for client ${clientId}`);
		}
		
		return updatedProfile;
	}
	
	/**
	 * Suggest personalized communication approach
	 */
	async suggestCommunicationApproach(
		clientId: string, 
		context: 'email' | 'document' | 'meeting' | 'general'
	): Promise<string[]> {
		const analysis = await this.analyzeClient(clientId);
		const suggestions: string[] = [];
		
		// Communication style suggestions
		if (analysis.communicationStyle === 'formal') {
			suggestions.push('Use formal language and proper salutations');
		} else if (analysis.communicationStyle === 'casual') {
			suggestions.push('Use casual, friendly tone');
		} else if (analysis.communicationStyle === 'technical') {
			suggestions.push('Include technical details and specifications');
		}
		
		// Response time suggestions
		if (analysis.preferredResponseTime === 'immediate') {
			suggestions.push('Respond as quickly as possible');
		} else if (analysis.preferredResponseTime === 'same-day') {
			suggestions.push('Respond within the same business day');
		}
		
		// Channel preferences
		if (analysis.preferredChannel === 'email' && context !== 'email') {
			suggestions.push('Consider following up via email for documentation');
		} else if (analysis.preferredChannel === 'call' && context === 'email') {
			suggestions.push('Consider scheduling a call for complex discussions');
		}
		
		// Topic suggestions
		if (analysis.topicsOfInterest.length > 0) {
			suggestions.push(`Reference topics of interest: ${analysis.topicsOfInterest.slice(0, 3).join(', ')}`);
		}
		
		if (analysis.topicsToAvoid.length > 0) {
			suggestions.push(`Avoid topics: ${analysis.topicsToAvoid.slice(0, 3).join(', ')}`);
		}
		
		// Sentiment-based suggestions
		if (analysis.sentimentTrend === 'negative') {
			suggestions.push('Use empathetic language and address concerns proactively');
		} else if (analysis.sentimentTrend === 'positive') {
			suggestions.push('Leverage positive relationship for collaboration');
		}
		
		return suggestions;
	}
	
	/**
	 * Get similar clients based on profile
	 */
	async findSimilarClients(clientId: string, limit: number = 5): Promise<string[]> {
		const profile = await this.getClientProfile(clientId);
		if (!profile) {
			return [];
		}
		
		// In production, this would use vector similarity or clustering
		// For now, return empty array (placeholder)
		console.log(`Finding similar clients to ${clientId} (not implemented)`);
		return [];
	}
	
	/**
	 * Get client memories
	 */
	private async getClientMemories(clientId: string): Promise<MemoryItem[]> {
		const query = {
			category: ['client', 'email', 'document', 'workflow', 'meeting'] as MemoryCategory[],
			relatedTo: { clientId },
			limit: 200,
			sortBy: 'createdAt' as const,
			sortOrder: 'desc' as const
		};
		
		const result = await this.memoryEngine.queryMemories(query);
		return result.items;
	}
	
	/**
	 * Create default analysis for new clients
	 */
	private createDefaultAnalysis(clientId: string): ClientAnalysis {
		return {
			clientId,
			communicationStyle: 'formal',
			preferredResponseTime: 'same-day',
			preferredChannel: 'email',
			topicsOfInterest: [],
			topicsToAvoid: [],
			averageResponseTimeHours: 24,
			typicalMessageLength: 'medium',
			greetingPatterns: [],
			closingPatterns: [],
			commonQuestions: [],
			commonConcerns: [],
			sentimentTrend: 'neutral',
			confidence: 0
		};
	}
	
	/**
	 * Analyze communication patterns
	 */
	private analyzeCommunicationPatterns(memories: MemoryItem[]): {
		averageResponseTimeHours: number;
		typicalMessageLength: 'short' | 'medium' | 'long';
		greetingPatterns: string[];
		closingPatterns: string[];
		commonQuestions: string[];
		commonConcerns: string[];
	} {
		// Simplified analysis - in production would use NLP
		const emailMemories = memories.filter(m => m.category === 'email');
		
		// Calculate average response time (placeholder)
		let totalResponseTime = 0;
		let responseCount = 0;
		
		// Extract patterns
		const greetingPatterns: string[] = [];
		const closingPatterns: string[] = [];
		const commonQuestions: string[] = [];
		const commonConcerns: string[] = [];
		
		for (const memory of emailMemories) {
			const content = memory.content;
			
			// Extract greeting and closing patterns
			if (content.greeting && !greetingPatterns.includes(content.greeting)) {
				greetingPatterns.push(content.greeting);
			}
			
			if (content.closing && !closingPatterns.includes(content.closing)) {
				closingPatterns.push(content.closing);
			}
			
			// Extract questions and concerns (simplified)
			if (content.body?.includes('?')) {
				// Simple question detection
				commonQuestions.push('General inquiry');
			}
			
			if (content.body?.toLowerCase().includes('concern') || 
				content.body?.toLowerCase().includes('issue') ||
				content.body?.toLowerCase().includes('problem')) {
				commonConcerns.push('General concern');
			}
		}
		
		// Determine typical message length
		let typicalMessageLength: 'short' | 'medium' | 'long' = 'medium';
		const totalContentLength = emailMemories.reduce((sum, m) => {
			const content = m.content.body || '';
			return sum + content.length;
		}, 0);
		
		const avgLength = emailMemories.length > 0 ? totalContentLength / emailMemories.length : 0;
		if (avgLength < 100) typicalMessageLength = 'short';
		else if (avgLength > 500) typicalMessageLength = 'long';
		
		return {
			averageResponseTimeHours: responseCount > 0 ? totalResponseTime / responseCount : 24,
			typicalMessageLength,
			greetingPatterns: greetingPatterns.slice(0, 5),
			closingPatterns: closingPatterns.slice(0, 5),
			commonQuestions: commonQuestions.slice(0, 10),
			commonConcerns: commonConcerns.slice(0, 10)
		};
	}
	
	/**
	 * Analyze sentiment from memories
	 */
	private analyzeSentiment(memories: MemoryItem[]): {
		trend: 'positive' | 'neutral' | 'negative';
		confidence: number;
		keyPhrases: string[];
	} {
		// Simplified sentiment analysis
		let positiveCount = 0;
		let negativeCount = 0;
		let neutralCount = 0;
		
		const positiveWords = ['great', 'excellent', 'thanks', 'appreciate', 'happy', 'pleased'];
		const negativeWords = ['concern', 'issue', 'problem', 'disappointed', 'unhappy', 'frustrated'];
		
		for (const memory of memories) {
			const content = JSON.stringify(memory.content).toLowerCase();
			const summary = memory.summary.toLowerCase();
			const text = content + ' ' + summary;
			
			let sentimentScore = 0;
			for (const word of positiveWords) {
				if (text.includes(word)) sentimentScore++;
			}
			for (const word of negativeWords) {
				if (text.includes(word)) sentimentScore--;
			}
			
			if (sentimentScore > 0) positiveCount++;
			else if (sentimentScore < 0) negativeCount++;
			else neutralCount++;
		}
		
		const total = memories.length;
		let trend: 'positive' | 'neutral' | 'negative' = 'neutral';
		
		if (positiveCount > negativeCount && positiveCount > neutralCount) {
			trend = 'positive';
		} else if (negativeCount > positiveCount && negativeCount > neutralCount) {
			trend = 'negative';
		}
		
		const confidence = Math.min(100, total * 5);
		
		return {
			trend,
			confidence,
			keyPhrases: [] // Would extract in production
		};
	}
	
	/**
	 * Extract topics from memories
	 */
	private extractTopics(memories: MemoryItem[]): {
		interest: string[];
		avoid: string[];
	} {
		// Simplified topic extraction
		const interest: string[] = [];
		const avoid: string[] = [];
		
		// Common business topics
		const businessTopics = ['project', 'delivery', 'timeline', 'budget', 'requirements', 'specifications'];
		
		for (const memory of memories) {
			const content = JSON.stringify(memory.content).toLowerCase();
			
			for (const topic of businessTopics) {
				if (content.includes(topic) && !interest.includes(topic)) {
					interest.push(topic);
				}
			}
			
			// Simple avoidance detection (if content mentions "avoid" or "don't mention")
			if (content.includes('avoid') || content.includes("don't mention") || content.includes('not interested')) {
				// Extract the topic after "avoid"
				const avoidMatch = content.match(/avoid\s+(\w+)/i);
				if (avoidMatch && avoidMatch[1] && !avoid.includes(avoidMatch[1])) {
					avoid.push(avoidMatch[1]);
				}
			}
		}
		
		return {
			interest: interest.slice(0, 10),
			avoid: avoid.slice(0, 10)
		};
	}
	
	/**
	 * Determine communication style
	 */
	private determineCommunicationStyle(
		patterns: ReturnType<typeof this.analyzeCommunicationPatterns>,
		sentiment: ReturnType<typeof this.analyzeSentiment>
	): 'formal' | 'casual' | 'technical' | 'brief' | 'detailed' {
		// Simple heuristic based on patterns
		const hasFormalGreetings = patterns.greetingPatterns.some(g => 
			['Dear', 'To whom it may concern', 'Respected'].some(f => g.includes(f))
		);
		
		const hasCasualGreetings = patterns.greetingPatterns.some(g =>
			['Hi', 'Hey', 'Hello'].some(c => g.includes(c))
		);
		
		const hasTechnicalTerms = patterns.commonQuestions.some(q =>
			['spec', 'technical', 'implementation', 'architecture'].some(t => q.toLowerCase().includes(t))
		);
		
		if (hasTechnicalTerms) return 'technical';
		if (hasFormalGreetings && !hasCasualGreetings) return 'formal';
		if (hasCasualGreetings && !hasFormalGreetings) return 'casual';
		
		// Check message length for brief/detailed
		if (patterns.typicalMessageLength === 'short') return 'brief';
		if (patterns.typicalMessageLength === 'long') return 'detailed';
		
		return 'formal'; // Default to formal if no clear pattern
	}
	
	/**
	 * Calculate preferred response time
	 */
	private calculatePreferredResponseTime(memories: MemoryItem[]): 'immediate' | 'same-day' | 'next-day' | 'flexible' {
		const emailMemories = memories.filter(m => m.category === 'email');
		
		if (emailMemories.length === 0) {
			return 'same-day';
		}
		
		// Simple heuristic - in production would analyze actual response times
		return 'same-day';
	}
	
	/**
	 * Determine preferred communication channel
	 */
	private determinePreferredChannel(memories: MemoryItem[]): 'email' | 'chat' | 'call' | 'meeting' {
		// Simple heuristic - default to email
		return 'email';
	}
}
/**
 * Thread Memory Engine
 * 
 * Manages thread-level memory, conversation tracking, and thread summarization.
 * Provides thread intelligence for context-aware communication.
 */

import type { 
	ThreadSummary, 
	MemoryItem, 
	MemoryCategory,
	MemoryWriteOptions 
} from './memoryTypes';
import { MemoryEngine } from './memoryEngine';
import { MemorySelectors } from './memorySelectors';

/**
 * Thread Engine Configuration
 */
export interface ThreadEngineConfig {
	/** Memory engine instance */
	memoryEngine: MemoryEngine;
	
	/** Memory selectors instance */
	memorySelectors: MemorySelectors;
	
	/** Whether to auto-summarize threads */
	autoSummarizeThreads: boolean;
	
	/** Minimum messages for thread summarization */
	minMessagesForSummarization: number;
	
	/** Whether to track thread sentiment */
	trackSentiment: boolean;
	
	/** Whether to extract tasks from threads */
	extractTasks: boolean;
	
	/** Update interval in milliseconds */
	updateIntervalMs: number;
}

/**
 * Thread Analysis Result
 */
export interface ThreadAnalysis {
	/** Thread identifier */
	threadId: string;
	
	/** Thread title/subject */
	title: string;
	
	/** Key topics discussed */
	topics: string[];
	
	/** Key decisions made */
	decisions: string[];
	
	/** Action items identified */
	actionItems: Array<{
		description: string;
		assignedTo?: string;
		dueDate?: Date;
		priority: 'low' | 'medium' | 'high' | 'critical';
	}>;
	
	/** Overall sentiment */
	sentiment: {
		overall: 'positive' | 'neutral' | 'negative';
		confidence: number;
		keyPhrases: string[];
	};
	
	/** Timeline of key events */
	timeline: Array<{
		timestamp: Date;
		event: string;
		summary: string;
	}>;
	
	/** Next steps suggested */
	nextSteps: string[];
	
	/** Confidence score (0-100) */
	confidence: number;
}

/**
 * Thread Memory Engine
 */
export class ThreadEngine {
	private memoryEngine: MemoryEngine;
	private memorySelectors: MemorySelectors;
	private config: ThreadEngineConfig;
	private updateInterval: NodeJS.Timeout | null = null;
	
	constructor(config: Partial<ThreadEngineConfig> = {}) {
		this.memoryEngine = config.memoryEngine ?? new MemoryEngine();
		this.memorySelectors = config.memorySelectors ?? new MemorySelectors({ memoryEngine: this.memoryEngine });
		
		this.config = {
			memoryEngine: this.memoryEngine,
			memorySelectors: this.memorySelectors,
			autoSummarizeThreads: config.autoSummarizeThreads ?? true,
			minMessagesForSummarization: config.minMessagesForSummarization ?? 3,
			trackSentiment: config.trackSentiment ?? true,
			extractTasks: config.extractTasks ?? true,
			updateIntervalMs: config.updateIntervalMs ?? 15 * 60 * 1000 // 15 minutes
		};
		
		// Start auto-update if enabled
		if (this.config.autoSummarizeThreads) {
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
				await this.autoSummarizeAllThreads();
			} catch (error) {
				console.error('Auto-summarization of threads failed:', error);
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
	 * Auto-summarize all threads
	 */
	private async autoSummarizeAllThreads(): Promise<void> {
		console.log('Auto-summarizing threads...');
		
		// Get recent thread memories
		const recentMemories = await this.memorySelectors.getRecentMemories(100);
		const threadMemories = recentMemories.filter(m =>
			m.category === 'thread' ||
			m.metadata.relatedEntities.threadId
		);
		
		if (threadMemories.length === 0) {
			return;
		}
		
		// Group by thread
		const threadGroups = new Map<string, MemoryItem[]>();
		for (const memory of threadMemories) {
			const threadId = memory.metadata.relatedEntities.threadId ||
							memory.content.threadId ||
							'unknown';
			if (!threadGroups.has(threadId)) {
				threadGroups.set(threadId, []);
			}
			threadGroups.get(threadId)!.push(memory);
		}
		
		// Summarize threads with enough messages
		const entries = Array.from(threadGroups.entries());
		for (const [threadId, memories] of entries) {
			if (threadId !== 'unknown' && memories.length >= this.config.minMessagesForSummarization) {
				try {
					await this.autoSummarizeThread(threadId, memories);
					console.log(`Auto-summarized thread: ${threadId}`);
				} catch (error) {
					console.error(`Failed to auto-summarize thread ${threadId}:`, error);
				}
			}
		}
	}
	
	/**
	 * Auto-summarize a thread
	 */
	private async autoSummarizeThread(threadId: string, memories: MemoryItem[]): Promise<void> {
		const analysis = await this.analyzeThread(threadId);
		
		// Create thread summary from analysis
		const summary: ThreadSummary = {
			threadId,
			title: analysis.title,
			participants: this.extractParticipants(memories),
			topics: analysis.topics,
			tasks: analysis.actionItems.map(item => ({
				description: item.description,
				assignedTo: item.assignedTo,
				dueDate: item.dueDate,
				status: 'pending' as const
			})),
			actionsTaken: [],
			pendingItems: analysis.actionItems.map(item => ({
				item: item.description,
				priority: item.priority,
				deadline: item.dueDate,
				assignedTo: item.assignedTo
			})),
			sentiment: analysis.sentiment,
			timeline: analysis.timeline,
			lastActivity: new Date(),
			archived: false
		};
		
		// Save summary to memory
		await this.memoryEngine.writeMemory(
			'thread',
			'system',
			summary,
			`Thread summary: ${analysis.title}`,
			{
				tags: ['thread-summary', threadId, 'auto-generated'],
				importance: 70,
				confidence: analysis.confidence
			}
		);
	}
	
	/**
	 * Get thread summary
	 */
	async getThreadSummary(threadId: string): Promise<ThreadSummary | null> {
		return await this.memorySelectors.getThreadSummary(threadId);
	}
	
	/**
	 * Analyze thread
	 */
	async analyzeThread(threadId: string): Promise<ThreadAnalysis> {
		const summary = await this.getThreadSummary(threadId);
		const memories = await this.getThreadMemories(threadId);
		
		if (memories.length === 0) {
			return this.createDefaultAnalysis(threadId);
		}
		
		// Analyze thread content
		const topics = this.extractTopics(memories);
		const decisions = this.extractDecisions(memories);
		const actionItems = this.extractActionItems(memories);
		const sentiment = this.analyzeThreadSentiment(memories);
		const timeline = this.buildTimeline(memories);
		const nextSteps = this.suggestNextSteps(memories, actionItems);
		
		// Calculate confidence based on data points
		const confidence = Math.min(100, memories.length * 5);
		
		return {
			threadId,
			title: summary?.title || this.extractTitle(memories),
			topics,
			decisions,
			actionItems,
			sentiment,
			timeline,
			nextSteps,
			confidence
		};
	}
	
	/**
	 * Update thread with new message
	 */
	async updateThread(
		threadId: string,
		message: {
			type: 'email' | 'chat' | 'comment' | 'note';
			content: any;
			summary: string;
			sender: string;
			recipients?: string[];
			sentiment?: 'positive' | 'neutral' | 'negative';
		}
	): Promise<ThreadSummary> {
		const existingSummary = await this.getThreadSummary(threadId);
		const now = new Date();
		
		// Create or update thread memory
		const memoryContent = {
			threadId,
			type: message.type,
			content: message.content,
			sender: message.sender,
			recipients: message.recipients || [],
			sentiment: message.sentiment,
			timestamp: now
		};
		
		await this.memoryEngine.writeMemory(
			'thread',
			'user-action',
			memoryContent,
			`Thread message: ${message.summary}`,
			{
				tags: ['thread-message', threadId, message.type],
				importance: 60,
				confidence: 75
			}
		);
		
		// Auto-summarize if enough messages
		const threadMemories = await this.getThreadMemories(threadId);
		if (threadMemories.length >= this.config.minMessagesForSummarization) {
			await this.autoSummarizeThread(threadId, threadMemories);
		}
		
		// Get updated summary
		const updatedSummary = await this.memorySelectors.getThreadSummary(threadId);
		if (!updatedSummary) {
			throw new Error(`Failed to create/update summary for thread ${threadId}`);
		}
		
		return updatedSummary;
	}
	
	/**
	 * Suggest thread continuation
	 */
	async suggestThreadContinuation(
		threadId: string,
		context: 'email' | 'chat' | 'meeting' | 'general'
	): Promise<string[]> {
		const analysis = await this.analyzeThread(threadId);
		const suggestions: string[] = [];
		
		// Action item suggestions
		if (analysis.actionItems.length > 0) {
			const pendingItems = analysis.actionItems.filter(item => 
				!item.description.toLowerCase().includes('completed') &&
				!item.description.toLowerCase().includes('done')
			);
			
			if (pendingItems.length > 0) {
				suggestions.push(`Follow up on pending action items: ${pendingItems.map(item => item.description).slice(0, 3).join(', ')}`);
			}
		}
		
		// Decision follow-up suggestions
		if (analysis.decisions.length > 0) {
			suggestions.push(`Reference previous decisions: ${analysis.decisions.slice(0, 3).join(', ')}`);
		}
		
		// Next steps suggestions
		if (analysis.nextSteps.length > 0) {
			suggestions.push(`Consider next steps: ${analysis.nextSteps.slice(0, 3).join(', ')}`);
		}
		
		// Sentiment-based suggestions
		if (analysis.sentiment.overall === 'negative' && analysis.sentiment.confidence > 70) {
			suggestions.push('Address concerns raised in previous messages');
			suggestions.push('Use empathetic language to rebuild rapport');
		} else if (analysis.sentiment.overall === 'positive' && analysis.sentiment.confidence > 70) {
			suggestions.push('Leverage positive momentum for collaboration');
		}
		
		// Context-specific suggestions
		if (context === 'email') {
			suggestions.push('Include thread history for context');
		} else if (context === 'meeting') {
			suggestions.push('Prepare agenda based on thread topics');
		}
		
		return suggestions;
	}
	
	/**
	 * Find related threads
	 */
	async findRelatedThreads(threadId: string, limit: number = 5): Promise<string[]> {
		const analysis = await this.analyzeThread(threadId);
		
		if (analysis.topics.length === 0) {
			return [];
		}
		
		// In production, this would search for threads with similar topics
		// For now, return empty array (placeholder)
		console.log(`Finding related threads to ${threadId} (not implemented)`);
		return [];
	}
	
	/**
	 * Archive thread
	 */
	async archiveThread(threadId: string): Promise<boolean> {
		const summary = await this.getThreadSummary(threadId);
		if (!summary) {
			return false;
		}
		
		// Update summary with archived status
		const updatedSummary: ThreadSummary = {
			...summary,
			archived: true
		};
		
		// Save updated summary
		await this.memoryEngine.writeMemory(
			'thread',
			'system',
			updatedSummary,
			`Thread archived: ${summary.title}`,
			{
				tags: ['thread-archived', threadId],
				importance: 30,
				confidence: 90
			}
		);
		
		return true;
	}
	
	/**
	 * Get thread memories
	 */
	private async getThreadMemories(threadId: string): Promise<MemoryItem[]> {
		const query = {
			category: ['thread', 'email'] as MemoryCategory[],
			relatedTo: { threadId },
			limit: 200,
			sortBy: 'createdAt' as const,
			sortOrder: 'asc' as const // Chronological order for threads
		};
		
		const result = await this.memoryEngine.queryMemories(query);
		return result.items;
	}
	
	/**
	 * Create default analysis for new threads
	 */
	private createDefaultAnalysis(threadId: string): ThreadAnalysis {
		return {
			threadId,
			title: 'Untitled Thread',
			topics: [],
			decisions: [],
			actionItems: [],
			sentiment: {
				overall: 'neutral',
				confidence: 0,
				keyPhrases: []
			},
			timeline: [],
			nextSteps: [],
			confidence: 0
		};
	}
	
	/**
	 * Extract title from memories
	 */
	private extractTitle(memories: MemoryItem[]): string {
		// Look for subject/title in email memories
		for (const memory of memories) {
			if (memory.content.subject) {
				return memory.content.subject;
			}
			if (memory.content.title) {
				return memory.content.title;
			}
		}
		
		// Fallback: use first few words of first message
		if (memories.length > 0) {
			const firstSummary = memories[0].summary;
			const words = firstSummary.split(' ');
			return words.slice(0, 5).join(' ') + '...';
		}
		
		return 'Untitled Thread';
	}
	
	/**
	 * Extract topics from thread memories
	 */
	private extractTopics(memories: MemoryItem[]): string[] {
		const topics: string[] = [];
		
		// Common business topics
		const commonTopics = [
			'project', 'delivery', 'timeline', 'budget', 'requirements',
			'specifications', 'design', 'development', 'testing', 'deployment',
			'support', 'maintenance', 'feedback', 'review', 'approval'
		];
		
		for (const memory of memories) {
			const content = JSON.stringify(memory.content).toLowerCase();
			const summary = memory.summary.toLowerCase();
			const text = content + ' ' + summary;
			
			for (const topic of commonTopics) {
				if (text.includes(topic) && !topics.includes(topic)) {
					topics.push(topic);
				}
			}
			
			// Extract topic-like phrases (simple heuristic)
			if (text.includes('about') || text.includes('regarding') || text.includes('concerning')) {
				const aboutMatch = text.match(/(about|regarding|concerning)\s+(\w+)/i);
				if (aboutMatch && aboutMatch[2] && !topics.includes(aboutMatch[2])) {
					topics.push(aboutMatch[2]);
				}
			}
		}
		
		return topics.slice(0, 10);
	}
	
	/**
	 * Extract decisions from thread memories
	 */
	private extractDecisions(memories: MemoryItem[]): string[] {
		const decisions: string[] = [];
		const decisionIndicators = [
			'decided', 'agreed', 'concluded', 'resolved', 'determined',
			'will proceed', 'will move forward', 'approved', 'confirmed'
		];
		
		for (const memory of memories) {
			const content = JSON.stringify(memory.content).toLowerCase();
			const summary = memory.summary.toLowerCase();
			const text = content + ' ' + summary;
			
			for (const indicator of decisionIndicators) {
				if (text.includes(indicator)) {
					// Extract decision context
					const start = Math.max(0, text.indexOf(indicator) - 50);
					const end = Math.min(text.length, text.indexOf(indicator) + 100);
					const context = text.substring(start, end).trim();
					
					if (!decisions.includes(context)) {
						decisions.push(context);
					}
				}
			}
		}
		
		return decisions.slice(0, 10);
	}
	
	/**
	 * Extract action items from thread memories
	 */
	private extractActionItems(memories: MemoryItem[]): Array<{
		description: string;
		assignedTo?: string;
		dueDate?: Date;
		priority: 'low' | 'medium' | 'high' | 'critical';
	}> {
		const actionItems: Array<{
			description: string;
			assignedTo?: string;
			dueDate?: Date;
			priority: 'low' | 'medium' | 'high' | 'critical';
		}> = [];
		
		const actionIndicators = [
			'will', 'need to', 'should', 'must', 'have to',
			'action item', 'todo', 'task', 'follow up', 'next step'
		];
		
		const priorityIndicators = {
			'high': ['urgent', 'asap', 'immediately', 'critical', 'important'],
			'medium': ['soon', 'next week', 'when possible'],
			'low': ['eventually', 'when convenient', 'low priority']
		};
		
		for (const memory of memories) {
			const content = JSON.stringify(memory.content).toLowerCase();
			const summary = memory.summary.toLowerCase();
			const text = content + ' ' + summary;
			
			// Simple action item detection
			for (const indicator of actionIndicators) {
				if (text.includes(indicator)) {
					// Extract action item context
					const start = Math.max(0, text.indexOf(indicator) - 30);
					const end = Math.min(text.length, text.indexOf(indicator) + 100);
					let description = text.substring(start, end).trim();
					
					// Clean up description
					description = description.replace(/[^a-zA-Z0-9\s.,!?]/g, ' ');
					description = description.replace(/\s+/g, ' ').trim();
					
					if (description.length > 10 && description.length < 200) {
						// Determine priority
						let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
						
						for (const [prio, indicators] of Object.entries(priorityIndicators)) {
							for (const prioIndicator of indicators) {
								if (text.includes(prioIndicator)) {
									priority = prio as any;
									break;
								}
							}
						}
						
						// Extract assigned person (simple heuristic)
						let assignedTo: string | undefined;
						if (memory.content.sender) {
							assignedTo = memory.content.sender;
						}
						
						actionItems.push({
							description,
							assignedTo,
							priority
						});
					}
				}
			}
		}
		
		return actionItems.slice(0, 10);
	}
	/**
	 * Analyze thread sentiment
	 */
	private analyzeThreadSentiment(memories: MemoryItem[]): {
		overall: 'positive' | 'neutral' | 'negative';
		confidence: number;
		keyPhrases: string[];
	} {
		let positiveScore = 0;
		let negativeScore = 0;
		let neutralScore = 0;
		
		const positiveWords = ['great', 'excellent', 'thanks', 'appreciate', 'happy', 'pleased', 'good', 'awesome', 'fantastic'];
		const negativeWords = ['concern', 'issue', 'problem', 'disappointed', 'unhappy', 'frustrated', 'angry', 'upset', 'bad', 'poor'];
		
		const keyPhrases: string[] = [];
		
		for (const memory of memories) {
			const content = JSON.stringify(memory.content).toLowerCase();
			const summary = memory.summary.toLowerCase();
			const text = content + ' ' + summary;
			
			let messageScore = 0;
			
			// Count positive words
			for (const word of positiveWords) {
				if (text.includes(word)) {
					messageScore++;
					if (!keyPhrases.includes(word)) {
						keyPhrases.push(word);
					}
				}
			}
			
			// Count negative words
			for (const word of negativeWords) {
				if (text.includes(word)) {
					messageScore--;
					if (!keyPhrases.includes(word)) {
						keyPhrases.push(word);
					}
				}
			}
			
			// Classify message sentiment
			if (messageScore > 0) {
				positiveScore++;
			} else if (messageScore < 0) {
				negativeScore++;
			} else {
				neutralScore++;
			}
		}
		
		// Determine overall sentiment
		const totalMessages = memories.length;
		let overall: 'positive' | 'neutral' | 'negative' = 'neutral';
		let confidence = 0;
		
		if (totalMessages > 0) {
			const positiveRatio = positiveScore / totalMessages;
			const negativeRatio = negativeScore / totalMessages;
			
			if (positiveRatio > 0.5) {
				overall = 'positive';
				confidence = Math.round(positiveRatio * 100);
			} else if (negativeRatio > 0.5) {
				overall = 'negative';
				confidence = Math.round(negativeRatio * 100);
			} else {
				overall = 'neutral';
				confidence = Math.round((neutralScore / totalMessages) * 100);
			}
		}
		
		return {
			overall,
			confidence,
			keyPhrases: keyPhrases.slice(0, 10)
		};
	}
	
	/**
	 * Extract participants from thread memories
	 */
	private extractParticipants(memories: MemoryItem[]): Array<{
		clientId?: string;
		email: string;
		name?: string;
		role: 'sender' | 'recipient' | 'cc' | 'bcc';
	}> {
		const participantsMap = new Map<string, {
			clientId?: string;
			email: string;
			name?: string;
			role: 'sender' | 'recipient' | 'cc' | 'bcc';
		}>();
		
		for (const memory of memories) {
			// Extract sender
			if (memory.content.sender) {
				const email = memory.content.sender;
				if (!participantsMap.has(email)) {
					participantsMap.set(email, {
						email,
						role: 'sender'
					});
				}
			}
			
			// Extract recipients
			if (Array.isArray(memory.content.recipients)) {
				for (const recipient of memory.content.recipients) {
					if (recipient && !participantsMap.has(recipient)) {
						participantsMap.set(recipient, {
							email: recipient,
							role: 'recipient'
						});
					}
				}
			}
			
			// Extract from content fields
			if (memory.content.from) {
				const email = memory.content.from;
				if (!participantsMap.has(email)) {
					participantsMap.set(email, {
						email,
						role: 'sender'
					});
				}
			}
			
			if (Array.isArray(memory.content.to)) {
				for (const recipient of memory.content.to) {
					if (recipient && !participantsMap.has(recipient)) {
						participantsMap.set(recipient, {
							email: recipient,
							role: 'recipient'
						});
					}
				}
			}
			
			if (Array.isArray(memory.content.cc)) {
				for (const recipient of memory.content.cc) {
					if (recipient && !participantsMap.has(recipient)) {
						participantsMap.set(recipient, {
							email: recipient,
							role: 'cc'
						});
					}
				}
			}
			
			if (Array.isArray(memory.content.bcc)) {
				for (const recipient of memory.content.bcc) {
					if (recipient && !participantsMap.has(recipient)) {
						participantsMap.set(recipient, {
							email: recipient,
							role: 'bcc'
						});
					}
				}
			}
		}
		
		return Array.from(participantsMap.values());
	}
	
	/**
	 * Build timeline from thread memories
	 */
	private buildTimeline(memories: MemoryItem[]): Array<{
		timestamp: Date;
		event: string;
		summary: string;
	}> {
		const timeline: Array<{
			timestamp: Date;
			event: string;
			summary: string;
		}> = [];
		
		// Sort memories by creation date
		const sortedMemories = [...memories].sort((a, b) =>
			a.metadata.createdAt.getTime() - b.metadata.createdAt.getTime()
		);
		
		for (const memory of sortedMemories) {
			// Determine event type based on category
			let eventType = 'message';
			if (memory.category === 'email') {
				eventType = 'email';
			} else if (memory.category === 'note') {
				eventType = 'note';
			} else if (memory.category === 'document') {
				eventType = 'document';
			} else if (memory.category === 'report') {
				eventType = 'report';
			}
			
			// Create timeline entry
			timeline.push({
				timestamp: memory.metadata.createdAt,
				event: eventType,
				summary: memory.summary
			});
		}
		
		return timeline;
	}
	
	/**
	 * Suggest next steps based on thread memories and action items
	 */
	private suggestNextSteps(memories: MemoryItem[], actionItems: any[]): string[] {
		const nextSteps: string[] = [];
		
		// If there are pending action items, suggest following up
		if (actionItems.length > 0) {
			const pendingItems = actionItems.filter(item =>
				!item.description.toLowerCase().includes('completed') &&
				!item.description.toLowerCase().includes('done') &&
				!item.description.toLowerCase().includes('finished')
			);
			
			if (pendingItems.length > 0) {
				nextSteps.push(`Follow up on pending action items: ${pendingItems.length} items remaining`);
				nextSteps.push(`Prioritize: ${pendingItems[0].description}`);
			}
		}
		
		// Suggest based on thread length
		if (memories.length >= 10) {
			nextSteps.push('Consider summarizing the thread for new participants');
		}
		
		// Suggest based on recent activity
		const recentMemories = memories.slice(-3);
		const hasRecentQuestions = recentMemories.some(memory =>
			memory.summary.toLowerCase().includes('?') ||
			memory.summary.toLowerCase().includes('question')
		);
		
		if (hasRecentQuestions) {
			nextSteps.push('Address unanswered questions from recent messages');
		}
		
		// Suggest based on sentiment
		const sentiment = this.analyzeThreadSentiment(memories);
		if (sentiment.overall === 'negative' && sentiment.confidence > 70) {
			nextSteps.push('Schedule a call to resolve concerns');
			nextSteps.push('Provide additional clarification on key points');
		} else if (sentiment.overall === 'positive' && sentiment.confidence > 70) {
			nextSteps.push('Leverage positive momentum for collaboration');
			nextSteps.push('Request testimonials or feedback');
		}
		return nextSteps.slice(0, 5);
	}
}
			
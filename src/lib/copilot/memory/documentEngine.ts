/**
 * Document Memory Engine
 * 
 * Manages document-level memory, document intelligence, and document summarization.
 * Provides document intelligence for context-aware document management.
 */

import type { 
	DocumentSummary, 
	MemoryItem, 
	MemoryCategory,
	MemoryWriteOptions 
} from './memoryTypes';
import { MemoryEngine } from './memoryEngine';
import { MemorySelectors } from './memorySelectors';

/**
 * Document Engine Configuration
 */
export interface DocumentEngineConfig {
	/** Memory engine instance */
	memoryEngine: MemoryEngine;
	
	/** Memory selectors instance */
	memorySelectors: MemorySelectors;
	
	/** Whether to auto-summarize documents */
	autoSummarizeDocuments: boolean;
	
	/** Minimum content length for summarization */
	minContentLengthForSummarization: number;
	
	/** Whether to extract key topics */
	extractTopics: boolean;
	
	/** Whether to extract key findings */
	extractFindings: boolean;
	
	/** Whether to extract recommendations */
	extractRecommendations: boolean;
	
	/** Update interval in milliseconds */
	updateIntervalMs: number;
}

/**
 * Document Analysis Result
 */
export interface DocumentAnalysis {
	/** Document identifier */
	documentId: string;
	
	/** Document title */
	title: string;
	
	/** Document type */
	type: 'report' | 'survey' | 'proposal' | 'contract' | 'pdf' | 'note' | 'other';
	
	/** Key topics in the document */
	topics: string[];
	
	/** Key findings or conclusions */
	keyFindings: string[];
	
	/** Recommendations from the document */
	recommendations: string[];
	
	/** Actions required from the document */
	actionsRequired: Array<{
		action: string;
		assignedTo?: string;
		dueDate?: Date;
		priority: 'low' | 'medium' | 'high' | 'critical';
	}>;
	
	/** Document sentiment */
	sentiment: {
		overall: 'positive' | 'neutral' | 'negative';
		confidence: number;
		keyPhrases: string[];
	};
	
	/** Document complexity */
	complexity: {
		score: number; // 0-100
		readability: 'easy' | 'medium' | 'difficult';
		technicalLevel: 'basic' | 'intermediate' | 'advanced';
	};
	
	/** Confidence score (0-100) */
	confidence: number;
}

/**
 * Document Memory Engine
 */
export class DocumentEngine {
	private memoryEngine: MemoryEngine;
	private memorySelectors: MemorySelectors;
	private config: DocumentEngineConfig;
	private updateInterval: NodeJS.Timeout | null = null;
	
	constructor(config: Partial<DocumentEngineConfig> = {}) {
		this.memoryEngine = config.memoryEngine ?? new MemoryEngine();
		this.memorySelectors = config.memorySelectors ?? new MemorySelectors({ memoryEngine: this.memoryEngine });
		
		this.config = {
			memoryEngine: this.memoryEngine,
			memorySelectors: this.memorySelectors,
			autoSummarizeDocuments: config.autoSummarizeDocuments ?? true,
			minContentLengthForSummarization: config.minContentLengthForSummarization ?? 500,
			extractTopics: config.extractTopics ?? true,
			extractFindings: config.extractFindings ?? true,
			extractRecommendations: config.extractRecommendations ?? true,
			updateIntervalMs: config.updateIntervalMs ?? 30 * 60 * 1000 // 30 minutes
		};
		
		// Start auto-update if enabled
		if (this.config.autoSummarizeDocuments) {
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
				await this.autoSummarizeAllDocuments();
			} catch (error) {
				console.error('Auto-summarization of documents failed:', error);
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
	 * Auto-summarize all documents
	 */
	private async autoSummarizeAllDocuments(): Promise<void> {
		console.log('Auto-summarizing documents...');
		
		// Get recent document memories
		const recentMemories = await this.memorySelectors.getRecentMemories(100);
		const documentMemories = recentMemories.filter(m =>
			m.category === 'document' ||
			m.category === 'report' ||
			m.category === 'pdf' ||
			m.category === 'note'
		);
		
		if (documentMemories.length === 0) {
			return;
		}
		
		// Group by document
		const documentGroups = new Map<string, MemoryItem[]>();
		for (const memory of documentMemories) {
			const documentId = memory.metadata.relatedEntities.documentId ||
							  memory.content.documentId ||
							  'unknown';
			if (!documentGroups.has(documentId)) {
				documentGroups.set(documentId, []);
			}
			documentGroups.get(documentId)!.push(memory);
		}
		
		// Summarize documents with enough content
		const entries = Array.from(documentGroups.entries());
		for (const [documentId, memories] of entries) {
			if (documentId !== 'unknown') {
				try {
					await this.autoSummarizeDocument(documentId, memories);
					console.log(`Auto-summarized document: ${documentId}`);
				} catch (error) {
					console.error(`Failed to auto-summarize document ${documentId}:`, error);
				}
			}
		}
	}
	
	/**
	 * Auto-summarize a document
	 */
	private async autoSummarizeDocument(documentId: string, memories: MemoryItem[]): Promise<void> {
		const analysis = await this.analyzeDocument(documentId);
		
		// Create document summary from analysis
		const summary: DocumentSummary = {
			documentId,
			type: analysis.type,
			title: analysis.title,
			topics: analysis.topics,
			keyFindings: analysis.keyFindings,
			recommendations: analysis.recommendations,
			actionsRequired: analysis.actionsRequired.map(item => ({
				action: item.action,
				assignedTo: item.assignedTo,
				dueDate: item.dueDate,
				status: 'pending' as const
			})),
			revisions: [],
			relatedDocuments: [],
			clientFeedback: undefined,
			lastAccessed: new Date(),
			archived: false
		};
		
		// Save summary to memory
		await this.memoryEngine.writeMemory(
			'document',
			'system',
			summary,
			`Document summary: ${analysis.title}`,
			{
				tags: ['document-summary', documentId, 'auto-generated'],
				importance: 70,
				confidence: analysis.confidence
			}
		);
	}
	
	/**
	 * Get document summary
	 */
	async getDocumentSummary(documentId: string): Promise<DocumentSummary | null> {
		// Use getDocumentHistory from MemorySelectors
		return await this.memorySelectors.getDocumentHistory(documentId);
	}
	
	/**
	 * Analyze document
	 */
	async analyzeDocument(documentId: string): Promise<DocumentAnalysis> {
		const summary = await this.getDocumentSummary(documentId);
		const memories = await this.getDocumentMemories(documentId);
		
		if (memories.length === 0) {
			return this.createDefaultAnalysis(documentId);
		}
		
		// Analyze document content
		const topics = this.extractTopics(memories);
		const keyFindings = this.extractKeyFindings(memories);
		const recommendations = this.extractRecommendations(memories);
		const actionsRequired = this.extractActionsRequired(memories);
		const sentiment = this.analyzeDocumentSentiment(memories);
		const complexity = this.analyzeDocumentComplexity(memories);
		
		// Calculate confidence based on data points
		const confidence = Math.min(100, memories.length * 10);
		
		return {
			documentId,
			title: summary?.title || this.extractTitle(memories),
			type: summary?.type || this.detectDocumentType(memories),
			topics,
			keyFindings,
			recommendations,
			actionsRequired,
			sentiment,
			complexity,
			confidence
		};
	}
	
	/**
	 * Update document with new content
	 */
	async updateDocument(
		documentId: string,
		content: {
			type: 'report' | 'survey' | 'proposal' | 'contract' | 'pdf' | 'note' | 'other';
			title: string;
			content: any;
			summary: string;
			author?: string;
			version?: number;
			changes?: string[];
		}
	): Promise<DocumentSummary> {
		const existingSummary = await this.getDocumentSummary(documentId);
		const now = new Date();
		
		// Create or update document memory
		const memoryContent = {
			documentId,
			type: content.type,
			title: content.title,
			content: content.content,
			author: content.author,
			version: content.version || 1,
			changes: content.changes || [],
			timestamp: now
		};
		
		await this.memoryEngine.writeMemory(
			'document',
			'user-action',
			memoryContent,
			`Document update: ${content.summary}`,
			{
				tags: ['document-update', documentId, content.type],
				importance: 70,
				confidence: 80
			}
		);
		
		// Auto-summarize if enough content
		const documentMemories = await this.getDocumentMemories(documentId);
		if (this.shouldSummarizeDocument(documentMemories)) {
			await this.autoSummarizeDocument(documentId, documentMemories);
		}
		
		// Get updated summary
		const updatedSummary = await this.memorySelectors.getDocumentHistory(documentId);
		if (!updatedSummary) {
			throw new Error(`Failed to create/update summary for document ${documentId}`);
		}
		
		return updatedSummary;
	}
	
	/**
	 * Suggest document improvements
	 */
	async suggestDocumentImprovements(
		documentId: string,
		context: 'clarity' | 'completeness' | 'structure' | 'all'
	): Promise<string[]> {
		const analysis = await this.analyzeDocument(documentId);
		const suggestions: string[] = [];
		
		// Clarity suggestions
		if (context === 'clarity' || context === 'all') {
			if (analysis.complexity.readability === 'difficult') {
				suggestions.push('Simplify language for better readability');
				suggestions.push('Add definitions for technical terms');
			}
			
			if (analysis.complexity.technicalLevel === 'advanced') {
				suggestions.push('Consider adding an executive summary for non-technical readers');
			}
		}
		
		// Completeness suggestions
		if (context === 'completeness' || context === 'all') {
			if (analysis.actionsRequired.length === 0) {
				suggestions.push('Add clear action items or next steps');
			}
			
			if (analysis.recommendations.length === 0) {
				suggestions.push('Include specific recommendations based on findings');
			}
		}
		
		// Structure suggestions
		if (context === 'structure' || context === 'all') {
			if (analysis.topics.length > 10) {
				suggestions.push('Consider organizing content into sections or chapters');
			}
			
			if (analysis.keyFindings.length > 5) {
				suggestions.push('Group related findings into thematic sections');
			}
		}
		
		// Sentiment-based suggestions
		if (analysis.sentiment.overall === 'negative' && analysis.sentiment.confidence > 70) {
			suggestions.push('Balance negative findings with positive opportunities or solutions');
		}
		
		return suggestions.slice(0, 5);
	}
	
	/**
	 * Find related documents
	 */
	async findRelatedDocuments(documentId: string, limit: number = 5): Promise<string[]> {
		const analysis = await this.analyzeDocument(documentId);
		
		if (analysis.topics.length === 0) {
			return [];
		}
		
		// In production, this would search for documents with similar topics
		// For now, return empty array (placeholder)
		console.log(`Finding related documents to ${documentId} (not implemented)`);
		return [];
	}
	
	/**
	 * Archive document
	 */
	async archiveDocument(documentId: string): Promise<boolean> {
		const summary = await this.getDocumentSummary(documentId);
		if (!summary) {
			return false;
		}
		
		// Update summary with archived status
		const updatedSummary: DocumentSummary = {
			...summary,
			archived: true
		};
		
		// Save updated summary
		await this.memoryEngine.writeMemory(
			'document',
			'system',
			updatedSummary,
			`Document archived: ${summary.title}`,
			{
				tags: ['document-archived', documentId],
				importance: 30,
				confidence: 90
			}
		);
		
		return true;
	}
	
	/**
	 * Get document memories
	 */
	private async getDocumentMemories(documentId: string): Promise<MemoryItem[]> {
		const query = {
			category: ['document', 'report', 'pdf', 'note'] as MemoryCategory[],
			relatedTo: { documentId },
			limit: 200,
			sortBy: 'createdAt' as const,
			sortOrder: 'asc' as const // Chronological order for documents
		};
		
		const result = await this.memoryEngine.queryMemories(query);
		return result.items;
	}
	
	/**
	 * Check if document should be summarized
	 */
	private shouldSummarizeDocument(memories: MemoryItem[]): boolean {
		// Check if any memory has sufficient content length
		for (const memory of memories) {
			const content = JSON.stringify(memory.content);
			if (content.length >= this.config.minContentLengthForSummarization) {
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Create default analysis for new documents
	 */
	private createDefaultAnalysis(documentId: string): DocumentAnalysis {
		return {
			documentId,
			title: 'Untitled Document',
			type: 'other',
			topics: [],
			keyFindings: [],
			recommendations: [],
			actionsRequired: [],
			sentiment: {
				overall: 'neutral',
				confidence: 0,
				keyPhrases: []
			},
			complexity: {
				score: 0,
				readability: 'medium',
				technicalLevel: 'basic'
			},
			confidence: 0
		};
	}
	
	/**
	 * Extract title from memories
	 */
	private extractTitle(memories: MemoryItem[]): string {
		// Look for title in document memories
		for (const memory of memories) {
			if (memory.content.title) {
				return memory.content.title;
			}
			if (memory.content.subject) {
				return memory.content.subject;
			}
		}
		
		// Fallback: use first few words of first memory summary
		if (memories.length > 0) {
			const firstSummary = memories[0].summary;
			const words = firstSummary.split(' ');
			return words.slice(0, 5).join(' ') + '...';
		}
		
		return 'Untitled Document';
	}
	
	/**
	 * Detect document type from memories
	 */
	private detectDocumentType(memories: MemoryItem[]): 'report' | 'survey' | 'proposal' | 'contract' | 'pdf' | 'note' | 'other' {
		// Look for type in document memories
		for (const memory of memories) {
			if (memory.content.type) {
				return memory.content.type;
			}
		}
		
		// Infer from category
		for (const memory of memories) {
			if (memory.category === 'report') return 'report';
			if (memory.category === 'pdf') return 'pdf';
			if (memory.category === 'note') return 'note';
		}
		
		return 'other';
	}
	
	/**
	 * Extract topics from document memories
	 */
	private extractTopics(memories: MemoryItem[]): string[] {
		const topics: string[] = [];
		
		// Common document topics
		const commonTopics = [
			'analysis', 'findings', 'results', 'methodology', 'background',
			'introduction', 'conclusion', 'recommendations', 'implementation',
			'budget', 'timeline', 'risks', 'benefits', 'alternatives'
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
			
			// Extract topic-like phrases from headings
			if (text.includes('section') || text.includes('chapter') || text.includes('part')) {
				const headingMatch = text.match(/(section|chapter|part)\s+(\w+)/i);
				if (headingMatch && headingMatch[2] && !topics.includes(headingMatch[2])) {
					topics.push(headingMatch[2]);
				}
			}
		}
		
		return topics.slice(0, 15);
	}
	
	/**
	 * Extract key findings from document memories
	 */
	private extractKeyFindings(memories: MemoryItem[]): string[] {
		const findings: string[] = [];
		const findingIndicators = [
			'finding', 'conclusion', 'result', 'discovery', 'observation',
			'key insight', 'main point', 'important note', 'takeaway'
		];
		
		for (const memory of memories) {
			const content = JSON.stringify(memory.content).toLowerCase();
			const summary = memory.summary.toLowerCase();
			const text = content + ' ' + summary;
			
			// Look for finding indicators
			for (const indicator of findingIndicators) {
				if (text.includes(indicator)) {
					// Extract context around the indicator
					const start = Math.max(0, text.indexOf(indicator) - 50);
					const end = Math.min(text.length, text.indexOf(indicator) + 150);
					let finding = text.substring(start, end).trim();
					
					// Clean up the finding
					finding = finding.replace(/[^a-zA-Z0-9\s.,!?]/g, ' ');
					finding = finding.replace(/\s+/g, ' ').trim();
					finding = finding.charAt(0).toUpperCase() + finding.slice(1);
					
					if (finding.length > 20 && finding.length < 200 && !findings.includes(finding)) {
						findings.push(finding);
					}
				}
			}
			
			// Look for numbered or bulleted findings
			const numberedMatches = text.match(/(\d+\.\s+[^\.]+\.?)/g);
			if (numberedMatches) {
				for (const match of numberedMatches) {
					if (match.length > 10 && match.length < 150 && !findings.includes(match)) {
						findings.push(match);
					}
				}
			}
		}
		
		return findings.slice(0, 10);
	}
	
	/**
	 * Extract recommendations from document memories
	 */
	private extractRecommendations(memories: MemoryItem[]): string[] {
		const recommendations: string[] = [];
		const recommendationIndicators = [
			'recommend', 'suggest', 'propose', 'advise', 'should',
			'we recommend', 'it is recommended', 'our suggestion'
		];
		
		for (const memory of memories) {
			const content = JSON.stringify(memory.content).toLowerCase();
			const summary = memory.summary.toLowerCase();
			const text = content + ' ' + summary;
			
			for (const indicator of recommendationIndicators) {
				if (text.includes(indicator)) {
					// Extract context around the indicator
					const start = Math.max(0, text.indexOf(indicator) - 30);
					const end = Math.min(text.length, text.indexOf(indicator) + 100);
					let recommendation = text.substring(start, end).trim();
					
					// Clean up the recommendation
					recommendation = recommendation.replace(/[^a-zA-Z0-9\s.,!?]/g, ' ');
					recommendation = recommendation.replace(/\s+/g, ' ').trim();
					recommendation = recommendation.charAt(0).toUpperCase() + recommendation.slice(1);
					
					if (recommendation.length > 15 && recommendation.length < 150 && !recommendations.includes(recommendation)) {
						recommendations.push(recommendation);
					}
				}
			}
		}
		
		return recommendations.slice(0, 10);
	}
	
	/**
	 * Extract actions required from document memories
	 */
	private extractActionsRequired(memories: MemoryItem[]): Array<{
		action: string;
		assignedTo?: string;
		dueDate?: Date;
		priority: 'low' | 'medium' | 'high' | 'critical';
	}> {
		const actions: Array<{
			action: string;
			assignedTo?: string;
			dueDate?: Date;
			priority: 'low' | 'medium' | 'high' | 'critical';
		}> = [];
		
		const actionIndicators = [
			'action required', 'next step', 'todo', 'task', 'must',
			'need to', 'should be', 'will be', 'implement', 'complete'
		];
		
		const priorityIndicators = {
			'high': ['urgent', 'immediately', 'asap', 'critical', 'priority'],
			'medium': ['soon', 'next week', 'when possible', 'important'],
			'low': ['eventually', 'when convenient', 'optional', 'nice to have']
		};
		
		for (const memory of memories) {
			const content = JSON.stringify(memory.content).toLowerCase();
			const summary = memory.summary.toLowerCase();
			const text = content + ' ' + summary;
			
			for (const indicator of actionIndicators) {
				if (text.includes(indicator)) {
					// Extract action context
					const start = Math.max(0, text.indexOf(indicator) - 30);
					const end = Math.min(text.length, text.indexOf(indicator) + 100);
					let action = text.substring(start, end).trim();
					
					// Clean up the action
					action = action.replace(/[^a-zA-Z0-9\s.,!?]/g, ' ');
					action = action.replace(/\s+/g, ' ').trim();
					action = action.charAt(0).toUpperCase() + action.slice(1);
					
					if (action.length > 10 && action.length < 150) {
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
						
						// Extract assigned person if available
						let assignedTo: string | undefined;
						if (memory.content.author) {
							assignedTo = memory.content.author;
						} else if (memory.content.assignedTo) {
							assignedTo = memory.content.assignedTo;
						}
						
						actions.push({
							action,
							assignedTo,
							priority
						});
					}
				}
			}
		}
		
		return actions.slice(0, 10);
	}
	
	/**
	 * Analyze document sentiment
	 */
	private analyzeDocumentSentiment(memories: MemoryItem[]): {
		overall: 'positive' | 'neutral' | 'negative';
		confidence: number;
		keyPhrases: string[];
	} {
		let positiveScore = 0;
		let negativeScore = 0;
		let neutralScore = 0;
		
		const positiveWords = ['success', 'achievement', 'improvement', 'positive', 'good', 'excellent', 'strong', 'effective'];
		const negativeWords = ['problem', 'issue', 'challenge', 'negative', 'poor', 'weak', 'ineffective', 'failure'];
		
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
	 * Analyze document complexity
	 */
	private analyzeDocumentComplexity(memories: MemoryItem[]): {
		score: number;
		readability: 'easy' | 'medium' | 'difficult';
		technicalLevel: 'basic' | 'intermediate' | 'advanced';
	} {
		let totalWords = 0;
		let totalSentences = 0;
		let technicalTerms = 0;
		
		const technicalWords = [
			'algorithm', 'architecture', 'implementation', 'methodology',
			'framework', 'paradigm', 'optimization', 'integration',
			'configuration', 'deployment', 'infrastructure'
		];
		
		for (const memory of memories) {
			const content = JSON.stringify(memory.content);
			const summary = memory.summary;
			const text = content + ' ' + summary;
			
			// Count words and sentences (simple approximation)
			const words = text.split(/\s+/).length;
			const sentences = text.split(/[.!?]+/).length;
			
			totalWords += words;
			totalSentences += sentences;
			
			// Count technical terms
			for (const term of technicalWords) {
				if (text.toLowerCase().includes(term)) {
					technicalTerms++;
				}
			}
		}
		
		// Calculate average sentence length
		const avgSentenceLength = totalSentences > 0 ? totalWords / totalSentences : 0;
		
		// Determine readability
		let readability: 'easy' | 'medium' | 'difficult' = 'medium';
		if (avgSentenceLength < 15) {
			readability = 'easy';
		} else if (avgSentenceLength > 25) {
			readability = 'difficult';
		}
		
		// Determine technical level
		let technicalLevel: 'basic' | 'intermediate' | 'advanced' = 'basic';
		const technicalDensity = technicalTerms / Math.max(1, totalWords / 1000);
		if (technicalDensity > 10) {
			technicalLevel = 'advanced';
		} else if (technicalDensity > 3) {
			technicalLevel = 'intermediate';
		}
		
		// Calculate complexity score (0-100)
		let score = 0;
		if (readability === 'difficult') score += 40;
		else if (readability === 'medium') score += 20;
		
		if (technicalLevel === 'advanced') score += 40;
		else if (technicalLevel === 'intermediate') score += 20;
		
		// Adjust based on document length
		if (totalWords > 5000) score = Math.min(100, score + 20);
		else if (totalWords > 1000) score = Math.min(100, score + 10);
		
		return {
			score,
			readability,
			technicalLevel
		};
	}
}
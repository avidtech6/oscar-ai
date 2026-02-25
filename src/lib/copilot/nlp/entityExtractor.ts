/**
 * Entity Extractor
 * 
 * Extracts entities from natural language commands.
 * Uses regex patterns, memory lookups, workflow registry, and provider registry.
 */

import type {
	EntityType,
	ExtractedEntity,
	EntityExtractorConfig,
	CommandContext
} from './nlpTypes';

/**
 * Entity Extractor
 */
export class EntityExtractor {
	private config: EntityExtractorConfig;
	private regexPatterns: Map<EntityType, RegExp[]>;
	private memorySelectors: any;
	private workflowRegistry: any;
	private providerRegistry: any;
	
	constructor(config: Partial<EntityExtractorConfig> = {}) {
		this.config = {
			useRegexPatterns: config.useRegexPatterns ?? true,
			useMlModels: config.useMlModels ?? false,
			useMemoryLookups: config.useMemoryLookups ?? true,
			useWorkflowLookups: config.useWorkflowLookups ?? true,
			useProviderLookups: config.useProviderLookups ?? true,
			minEntityConfidence: config.minEntityConfidence ?? 0.7,
			maxEntities: config.maxEntities ?? 10
		};
		
		this.regexPatterns = new Map();
		this.initializeRegexPatterns();
	}
	
	/**
	 * Initialize regex patterns for entity extraction
	 */
	private initializeRegexPatterns(): void {
		// Client name patterns
		this.regexPatterns.set('client_name', [
			/\b(client|customer|account)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
			/\b(for|with|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
			/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(client|customer|account)\b/gi
		]);
		
		// Domain patterns
		this.regexPatterns.set('domain', [
			/\b([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}\b/g,
			/\b(domain|website)\s+([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,})\b/gi
		]);
		
		// Email address patterns
		this.regexPatterns.set('email_address', [
			/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
		]);
		
		// Date patterns
		this.regexPatterns.set('date', [
			/\b(today|tomorrow|yesterday)\b/gi,
			/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g,
			/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g,
			/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\b/gi,
			/\b(next|last)\s+(week|month|year)\b/gi
		]);
		
		// Count patterns
		this.regexPatterns.set('count', [
			/\b(\d+)\s+(emails?|messages?|threads?|clients?|documents?)\b/gi,
			/\b(\d+)\b/g
		]);
		
		// Time period patterns
		this.regexPatterns.set('time_period', [
			/\b(last|past|previous|next)\s+(\d+)\s+(days?|weeks?|months?|years?)\b/gi,
			/\b(this|current)\s+(week|month|year)\b/gi
		]);
		
		// Priority patterns
		this.regexPatterns.set('priority', [
			/\b(high|medium|low)\s+priority\b/gi,
			/\b(urgent|important|critical)\b/gi
		]);
		
		// File type patterns
		this.regexPatterns.set('file_type', [
			/\b(PDF|DOCX?|XLSX?|PPTX?|TXT|CSV|JSON|XML)\b/gi,
			/\b\.(pdf|docx?|xlsx?|pptx?|txt|csv|json|xml)\b/gi
		]);
		
		// Subject patterns
		this.regexPatterns.set('subject', [
			/\b(subject|re:|fw:|about)\s*[:"]?\s*([^.,!?]+)/gi
		]);
		
		// Tone preference patterns
		this.regexPatterns.set('tone_preference', [
			/\b(formal|professional|casual|friendly|direct|concise|detailed)\b/gi,
			/\b(tone|style)\s+(of|should be|needs to be)\s+([a-z]+)\b/gi
		]);
	}
	
	/**
	 * Set memory selectors
	 */
	setMemorySelectors(memorySelectors: any): void {
		this.memorySelectors = memorySelectors;
	}
	
	/**
	 * Set workflow registry
	 */
	setWorkflowRegistry(workflowRegistry: any): void {
		this.workflowRegistry = workflowRegistry;
	}
	
	/**
	 * Set provider registry
	 */
	setProviderRegistry(providerRegistry: any): void {
		this.providerRegistry = providerRegistry;
	}
	
	/**
	 * Extract entities from text
	 */
	async extractEntities(
		text: string,
		context?: CommandContext
	): Promise<ExtractedEntity[]> {
		const entities: ExtractedEntity[] = [];
		
		// Extract using regex patterns
		if (this.config.useRegexPatterns) {
			const regexEntities = await this.extractUsingRegex(text);
			entities.push(...regexEntities);
		}
		
		// Extract using memory lookups
		if (this.config.useMemoryLookups && this.memorySelectors && context) {
			const memoryEntities = await this.extractUsingMemory(text, context);
			entities.push(...memoryEntities);
		}
		
		// Extract using workflow registry
		if (this.config.useWorkflowLookups && this.workflowRegistry) {
			const workflowEntities = await this.extractUsingWorkflowRegistry(text);
			entities.push(...workflowEntities);
		}
		
		// Extract using provider registry
		if (this.config.useProviderLookups && this.providerRegistry) {
			const providerEntities = await this.extractUsingProviderRegistry(text);
			entities.push(...providerEntities);
		}
		
		// Filter by confidence and limit
		const filteredEntities = entities
			.filter(entity => entity.confidence >= this.config.minEntityConfidence)
			.slice(0, this.config.maxEntities);
		
		// Remove duplicates (keep highest confidence)
		const uniqueEntities = this.removeDuplicateEntities(filteredEntities);
		
		return uniqueEntities;
	}
	
	/**
	 * Extract entities using regex patterns
	 */
	private async extractUsingRegex(text: string): Promise<ExtractedEntity[]> {
		const entities: ExtractedEntity[] = [];
		
		for (const [entityType, patterns] of this.regexPatterns) {
			for (const pattern of patterns) {
				const matches = text.matchAll(pattern);
				
				for (const match of matches) {
					const value = match[0];
					const start = match.index || 0;
					const end = start + value.length;
					
					// Calculate confidence based on match quality
					let confidence = 0.8;
					
					// Adjust confidence based on entity type
					switch (entityType) {
						case 'email_address':
							confidence = 0.95; // Email regex is very reliable
							break;
						case 'date':
							confidence = 0.85; // Date patterns are fairly reliable
							break;
						case 'client_name':
							confidence = 0.7; // Client names need verification
							break;
						default:
							confidence = 0.8;
					}
					
					entities.push({
						type: entityType,
						value,
						confidence,
						start,
						end,
						metadata: {
							source: 'regex',
							pattern: pattern.toString()
						}
					});
				}
			}
		}
		
		return entities;
	}
	
	/**
	 * Extract entities using memory lookups
	 */
	private async extractUsingMemory(
		text: string,
		context: CommandContext
	): Promise<ExtractedEntity[]> {
		const entities: ExtractedEntity[] = [];
		
		if (!this.memorySelectors || !context.memoryContext) {
			return entities;
		}
		
		try {
			// Extract client names from memory
			if (context.memoryContext.clientMemories) {
				for (const clientMemory of context.memoryContext.clientMemories) {
					const clientName = clientMemory.name || clientMemory.clientName;
					if (clientName && text.toLowerCase().includes(clientName.toLowerCase())) {
						entities.push({
							type: 'client_name',
							value: clientName,
							confidence: 0.9, // High confidence from memory
							start: text.toLowerCase().indexOf(clientName.toLowerCase()),
							end: text.toLowerCase().indexOf(clientName.toLowerCase()) + clientName.length,
							metadata: {
								source: 'memory',
								memoryType: 'client',
								memoryId: clientMemory.id
							}
						});
					}
				}
			}
			
			// Extract thread IDs from memory
			if (context.memoryContext.threadMemories) {
				for (const threadMemory of context.memoryContext.threadMemories) {
					const threadId = threadMemory.threadId || threadMemory.id;
					if (threadId && text.includes(threadId)) {
						entities.push({
							type: 'thread_id',
							value: threadId,
							confidence: 0.95, // Very high confidence for exact matches
							start: text.indexOf(threadId),
							end: text.indexOf(threadId) + threadId.length,
							metadata: {
								source: 'memory',
								memoryType: 'thread',
								memoryId: threadMemory.id
							}
						});
					}
				}
			}
			
			// Extract document names from memory
			if (context.memoryContext.documentMemories) {
				for (const documentMemory of context.memoryContext.documentMemories) {
					const documentName = documentMemory.name || documentMemory.title;
					if (documentName && text.toLowerCase().includes(documentName.toLowerCase())) {
						entities.push({
							type: 'document_name',
							value: documentName,
							confidence: 0.85,
							start: text.toLowerCase().indexOf(documentName.toLowerCase()),
							end: text.toLowerCase().indexOf(documentName.toLowerCase()) + documentName.length,
							metadata: {
								source: 'memory',
								memoryType: 'document',
								memoryId: documentMemory.id
							}
						});
					}
				}
			}
			
			// Extract provider names from memory
			if (context.memoryContext.providerMemories) {
				for (const providerMemory of context.memoryContext.providerMemories) {
					const providerName = providerMemory.name || providerMemory.provider;
					if (providerName && text.toLowerCase().includes(providerName.toLowerCase())) {
						entities.push({
							type: 'provider_name',
							value: providerName,
							confidence: 0.9,
							start: text.toLowerCase().indexOf(providerName.toLowerCase()),
							end: text.toLowerCase().indexOf(providerName.toLowerCase()) + providerName.length,
							metadata: {
								source: 'memory',
								memoryType: 'provider',
								memoryId: providerMemory.id
							}
						});
					}
				}
			}
		} catch (error) {
			console.error('Error extracting entities from memory:', error);
		}
		
		return entities;
	}
	
	/**
	 * Extract entities using workflow registry
	 */
	private async extractUsingWorkflowRegistry(text: string): Promise<ExtractedEntity[]> {
		const entities: ExtractedEntity[] = [];
		
		if (!this.workflowRegistry) {
			return entities;
		}
		
		try {
			// In a real implementation, this would query the workflow registry
			// For now, we'll use a simple text match approach
			const workflowKeywords = [
				'campaign', 'newsletter', 'follow-up', 'onboarding',
				'welcome', 'reminder', 'notification', 'report',
				'analysis', 'cleanup', 'migration', 'backup'
			];
			
			for (const keyword of workflowKeywords) {
				if (text.toLowerCase().includes(keyword.toLowerCase())) {
					entities.push({
						type: 'workflow_name',
						value: keyword,
						confidence: 0.7,
						start: text.toLowerCase().indexOf(keyword.toLowerCase()),
						end: text.toLowerCase().indexOf(keyword.toLowerCase()) + keyword.length,
						metadata: {
							source: 'workflow_registry',
							keyword
						}
					});
				}
			}
		} catch (error) {
			console.error('Error extracting entities from workflow registry:', error);
		}
		
		return entities;
	}
	
	/**
	 * Extract entities using provider registry
	 */
	private async extractUsingProviderRegistry(text: string): Promise<ExtractedEntity[]> {
		const entities: ExtractedEntity[] = [];
		
		if (!this.providerRegistry) {
			return entities;
		}
		
		try {
			// Common provider names
			const providerNames = [
				'Gmail', 'Outlook', 'iCloud', 'Yahoo', 'Brevo',
				'SendGrid', 'Mailgun', 'Postmark', 'SES', 'SMTP',
				'Google Workspace', 'Microsoft 365', 'Office 365'
			];
			
			for (const providerName of providerNames) {
				if (text.toLowerCase().includes(providerName.toLowerCase())) {
					entities.push({
						type: 'provider_name',
						value: providerName,
						confidence: 0.9,
						start: text.toLowerCase().indexOf(providerName.toLowerCase()),
						end: text.toLowerCase().indexOf(providerName.toLowerCase()) + providerName.length,
						metadata: {
							source: 'provider_registry',
							providerName
						}
					});
				}
			}
		} catch (error) {
			console.error('Error extracting entities from provider registry:', error);
		}
		
		return entities;
	}
	
	/**
	 * Remove duplicate entities (keep highest confidence)
	 */
	private removeDuplicateEntities(entities: ExtractedEntity[]): ExtractedEntity[] {
		const uniqueEntities: ExtractedEntity[] = [];
		const seen = new Map<string, ExtractedEntity>();
		
		for (const entity of entities) {
			const key = `${entity.type}:${entity.value.toLowerCase()}`;
			const existing = seen.get(key);
			
			if (!existing || entity.confidence > existing.confidence) {
				seen.set(key, entity);
			}
		}
		
		return Array.from(seen.values());
	}
	
	/**
	 * Validate extracted entities
	 */
	validateEntities(entities: ExtractedEntity[]): {
		valid: ExtractedEntity[];
		invalid: ExtractedEntity[];
		missing: EntityType[];
	} {
		const valid: ExtractedEntity[] = [];
		const invalid: ExtractedEntity[] = [];
		
		for (const entity of entities) {
			if (entity.confidence >= this.config.minEntityConfidence) {
				valid.push(entity);
			} else {
				invalid.push(entity);
			}
		}
		
		// Determine missing required entities (would be used in clarification)
		const missing: EntityType[] = [];
		
		return { valid, invalid, missing };
	}
	
	/**
	 * Get entity suggestions based on context
	 */
	async getEntitySuggestions(
		entityType: EntityType,
		context?: CommandContext
	): Promise<string[]> {
		const suggestions: string[] = [];
		
		switch (entityType) {
			case 'client_name':
				if (context?.memoryContext?.clientMemories) {
					suggestions.push(
						...context.memoryContext.clientMemories
							.map((c: any) => c.name || c.clientName)
							.filter(Boolean)
					);
				}
				break;
				
			case 'workflow_name':
				if (context?.workflowContext?.availableWorkflows) {
					suggestions.push(
						...context.workflowContext.availableWorkflows
							.map((w: any) => w.name)
							.filter(Boolean)
					);
				}
				break;
				
			case 'provider_name':
				// Common providers
				suggestions.push(
					'Gmail', 'Outlook', 'iCloud', 'Yahoo', 'Brevo',
					'SendGrid', 'Mailgun', 'Postmark', 'SES'
				);
				break;
				
			case 'document_name':
				if (context?.memoryContext?.documentMemories) {
					suggestions.push(
						...context.memoryContext.documentMemories
							.map((d: any) => d.name || d.title)
							.filter(Boolean)
					);
				}
				break;
				
			case 'tone_preference':
				suggestions.push(
					'formal', 'professional', 'casual', 'friendly',
					'direct', 'concise', 'detailed'
				);
				break;
		}
		
		return suggestions.slice(0, 10); // Limit to 10 suggestions
	}
	
	/**
	 * Clean up resources
	 */
	async cleanup(): Promise<void> {
		this.regexPatterns.clear();
		this.memorySelectors = null;
		this.workflowRegistry = null;
		this.providerRegistry = null;
	}
}
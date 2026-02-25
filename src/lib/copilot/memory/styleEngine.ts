/**
 * Style Learning Engine
 * 
 * Analyzes user writing style and builds a style profile.
 * Supports tone analysis, structure patterns, vocabulary preferences,
 * and email-specific style learning.
 */

import type { StyleProfile, MemoryItem } from './memoryTypes';
import { MemoryEngine } from './memoryEngine';
import { MemorySelectors } from './memorySelectors';

/**
 * Style Analysis Result
 */
export interface StyleAnalysis {
	/** Overall tone */
	tone: 'formal' | 'casual' | 'professional' | 'friendly' | 'technical';
	
	/** Tone confidence (0-100) */
	toneConfidence: number;
	
	/** Sentence length analysis */
	sentenceLength: 'short' | 'medium' | 'long';
	
	/** Paragraph length analysis */
	paragraphLength: 'short' | 'medium' | 'long';
	
	/** Vocabulary complexity */
	vocabularyComplexity: 'simple' | 'moderate' | 'complex';
	
	/** Formality level */
	formalityLevel: 'high' | 'medium' | 'low';
	
	/** Common greeting patterns */
	greetingPatterns: string[];
	
	/** Common closing patterns */
	closingPatterns: string[];
	
	/** Signature patterns */
	signaturePatterns: string[];
	
	/** Favorite words (frequently used) */
	favoriteWords: string[];
	
	/** Avoided words (rarely used) */
	avoidedWords: string[];
	
	/** Technical terms used */
	technicalTerms: string[];
	
	/** Bullet point usage frequency */
	bulletUsage: 'frequent' | 'moderate' | 'rare';
	
	/** Heading usage frequency */
	headingUsage: 'frequent' | 'moderate' | 'rare';
}

/**
 * Style Learning Engine Configuration
 */
export interface StyleEngineConfig {
	/** Memory engine instance */
	memoryEngine: MemoryEngine;
	
	/** Memory selectors instance */
	memorySelectors: MemorySelectors;
	
	/** Minimum samples for reliable analysis */
	minSamplesForAnalysis: number;
	
	/** Whether to auto-update style profile */
	autoUpdateProfile: boolean;
	
	/** Update interval in milliseconds */
	updateIntervalMs: number;
	
	/** Confidence threshold for style application */
	confidenceThreshold: number;
}

/**
 * Style Learning Engine
 */
export class StyleEngine {
	private memoryEngine: MemoryEngine;
	private memorySelectors: MemorySelectors;
	private config: StyleEngineConfig;
	private updateInterval: NodeJS.Timeout | null = null;
	
	constructor(config: Partial<StyleEngineConfig> = {}) {
		this.memoryEngine = config.memoryEngine ?? new MemoryEngine();
		this.memorySelectors = config.memorySelectors ?? new MemorySelectors({ memoryEngine: this.memoryEngine });
		
		this.config = {
			memoryEngine: this.memoryEngine,
			memorySelectors: this.memorySelectors,
			minSamplesForAnalysis: config.minSamplesForAnalysis ?? 10,
			autoUpdateProfile: config.autoUpdateProfile ?? true,
			updateIntervalMs: config.updateIntervalMs ?? 60 * 60 * 1000, // 1 hour
			confidenceThreshold: config.confidenceThreshold ?? 70
		};
		
		// Start auto-update if enabled
		if (this.config.autoUpdateProfile) {
			this.startAutoUpdate();
		}
	}
	
	/**
	 * Get style profile for user
	 */
	async getStyleProfile(userId: string = 'default'): Promise<StyleProfile | null> {
		return await this.memorySelectors.getStyleProfile(userId);
	}
	
	/**
	 * Analyze text and return style analysis
	 */
	analyzeText(text: string, context?: string): StyleAnalysis {
		// Simple rule-based analysis
		// In production, this would use NLP libraries or AI models
		
		const lines = text.split('\n');
		const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
		const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
		
		// Calculate average sentence length
		const avgSentenceLength = sentences.length > 0 
			? words.length / sentences.length 
			: 0;
		
		// Calculate average paragraph length
		const avgParagraphLength = lines.length > 0 
			? words.length / lines.length 
			: 0;
		
		// Determine sentence length category
		let sentenceLength: 'short' | 'medium' | 'long';
		if (avgSentenceLength < 10) sentenceLength = 'short';
		else if (avgSentenceLength < 20) sentenceLength = 'medium';
		else sentenceLength = 'long';
		
		// Determine paragraph length category
		let paragraphLength: 'short' | 'medium' | 'long';
		if (avgParagraphLength < 50) paragraphLength = 'short';
		else if (avgParagraphLength < 150) paragraphLength = 'medium';
		else paragraphLength = 'long';
		
		// Analyze tone based on word usage
		const formalWords = ['therefore', 'however', 'furthermore', 'consequently', 'nevertheless'];
		const casualWords = ['hey', 'hi', 'thanks', 'cheers', 'awesome', 'great'];
		const technicalWords = ['implementation', 'architecture', 'configuration', 'optimization', 'integration'];
		
		let formalCount = 0;
		let casualCount = 0;
		let technicalCount = 0;
		
		for (const word of words) {
			if (formalWords.some(fw => word.includes(fw))) formalCount++;
			if (casualWords.some(cw => word.includes(cw))) casualCount++;
			if (technicalWords.some(tw => word.includes(tw))) technicalCount++;
		}
		
		// Determine tone
		let tone: 'formal' | 'casual' | 'professional' | 'friendly' | 'technical';
		if (technicalCount > formalCount && technicalCount > casualCount) {
			tone = 'technical';
		} else if (formalCount > casualCount) {
			tone = 'formal';
		} else if (casualCount > formalCount) {
			tone = casualCount > 3 ? 'friendly' : 'casual';
		} else {
			tone = 'professional';
		}
		
		// Analyze greeting and closing patterns
		const greetingPatterns = this.extractGreetingPatterns(text);
		const closingPatterns = this.extractClosingPatterns(text);
		const signaturePatterns = this.extractSignaturePatterns(text);
		
		// Analyze vocabulary
		const wordFrequency = this.calculateWordFrequency(words);
		const favoriteWords = Object.entries(wordFrequency)
			.sort((a: [string, number], b: [string, number]) => b[1] - a[1])
			.slice(0, 10)
			.map(([word]) => word);
		
		// Determine vocabulary complexity
		const uniqueWordRatio = Object.keys(wordFrequency).length / words.length;
		let vocabularyComplexity: 'simple' | 'moderate' | 'complex';
		if (uniqueWordRatio < 0.3) vocabularyComplexity = 'simple';
		else if (uniqueWordRatio < 0.6) vocabularyComplexity = 'moderate';
		else vocabularyComplexity = 'complex';
		
		// Determine formality level
		let formalityLevel: 'high' | 'medium' | 'low';
		if (formalCount > 5) formalityLevel = 'high';
		else if (formalCount > 2) formalityLevel = 'medium';
		else formalityLevel = 'low';
		
		// Analyze bullet and heading usage
		const bulletCount = (text.match(/[-*•]/g) || []).length;
		const headingCount = (text.match(/^#+\s+/gm) || []).length;
		
		let bulletUsage: 'frequent' | 'moderate' | 'rare';
		if (bulletCount > 5) bulletUsage = 'frequent';
		else if (bulletCount > 1) bulletUsage = 'moderate';
		else bulletUsage = 'rare';
		
		let headingUsage: 'frequent' | 'moderate' | 'rare';
		if (headingCount > 3) headingUsage = 'frequent';
		else if (headingCount > 0) headingUsage = 'moderate';
		else headingUsage = 'rare';
		
		return {
			tone,
			toneConfidence: Math.min(100, (formalCount + casualCount + technicalCount) * 10),
			sentenceLength,
			paragraphLength,
			vocabularyComplexity,
			formalityLevel,
			greetingPatterns,
			closingPatterns,
			signaturePatterns,
			favoriteWords,
			avoidedWords: [], // Would require comparison to common words
			technicalTerms: technicalWords.filter(tw => words.some(w => w.includes(tw))),
			bulletUsage,
			headingUsage
		};
	}
	
	/**
	 * Apply style profile to draft text
	 */
	applyStyleToDraft(text: string, styleProfile: StyleProfile): string {
		if (!styleProfile || styleProfile.learning.confidence < this.config.confidenceThreshold) {
			return text;
		}
		
		let modifiedText = text;
		
		// Apply greeting pattern if text doesn't have one
		if (styleProfile.structure.greetingPatterns.length > 0 && !this.hasGreeting(text)) {
			const greeting = this.selectGreeting(styleProfile.structure.greetingPatterns, styleProfile.tone.overall);
			modifiedText = greeting + '\n\n' + modifiedText;
		}
		
		// Apply closing pattern if text doesn't have one
		if (styleProfile.structure.closingPatterns.length > 0 && !this.hasClosing(text)) {
			const closing = this.selectClosing(styleProfile.structure.closingPatterns, styleProfile.tone.overall);
			modifiedText = modifiedText + '\n\n' + closing;
			
			// Add signature if configured
			if (styleProfile.emailPreferences.includeSignature && styleProfile.emailPreferences.signatureContent) {
				modifiedText += '\n\n' + styleProfile.emailPreferences.signatureContent;
			}
		}
		
		// Adjust tone if needed
		if (this.shouldAdjustTone(text, styleProfile.tone.overall)) {
			modifiedText = this.adjustTone(modifiedText, styleProfile.tone.overall);
		}
		
		// Adjust sentence length if needed
		if (styleProfile.structure.sentenceLength !== 'medium') {
			modifiedText = this.adjustSentenceLength(modifiedText, styleProfile.structure.sentenceLength);
		}
		
		return modifiedText;
	}
	
	/**
	 * Suggest style improvements for text
	 */
	suggestStyleImprovements(text: string, targetStyle?: Partial<StyleProfile>): string[] {
		const improvements: string[] = [];
		const analysis = this.analyzeText(text);
		
		// Check for missing greeting
		if (!this.hasGreeting(text)) {
			improvements.push('Consider adding a greeting (e.g., "Hello," "Hi," "Dear,")');
		}
		
		// Check for missing closing
		if (!this.hasClosing(text)) {
			improvements.push('Consider adding a closing (e.g., "Best regards," "Sincerely," "Thanks,")');
		}
		
		// Check sentence length
		if (analysis.sentenceLength === 'long') {
			improvements.push('Consider breaking up long sentences for better readability');
		} else if (analysis.sentenceLength === 'short') {
			improvements.push('Consider combining some short sentences for better flow');
		}
		
		// Check paragraph length
		if (analysis.paragraphLength === 'long') {
			improvements.push('Consider breaking up long paragraphs for better readability');
		}
		
		// Check vocabulary
		if (analysis.vocabularyComplexity === 'simple' && targetStyle?.vocabulary?.formalityLevel === 'high') {
			improvements.push('Consider using more formal vocabulary for this context');
		} else if (analysis.vocabularyComplexity === 'complex' && targetStyle?.vocabulary?.formalityLevel === 'low') {
			improvements.push('Consider simplifying vocabulary for better accessibility');
		}
		
		// Check bullet usage
		if (analysis.bulletUsage === 'rare' && this.hasListContent(text)) {
			improvements.push('Consider using bullet points for lists');
		}
		
		return improvements;
	}
	
	/**
	 * Update style profile with new text sample
	 */
	async updateStyleProfile(userId: string, text: string, context?: string): Promise<StyleProfile> {
		const existingProfile = await this.getStyleProfile(userId);
		const analysis = this.analyzeText(text, context);
		
		const now = new Date();
		const samplesAnalyzed = (existingProfile?.learning.samplesAnalyzed || 0) + 1;
		const confidence = Math.min(100, samplesAnalyzed * 5);
		
		// Map generic context to allowed context types
		const mappedContext = this.mapContextToAllowedType(context);
		
		// Merge existing profile with new analysis
		const updatedProfile: StyleProfile = {
			userId,
			tone: {
				overall: this.mergeTone(existingProfile?.tone.overall, analysis.tone, samplesAnalyzed),
				variations: this.mergeToneVariations(existingProfile?.tone.variations, analysis.tone, mappedContext)
			},
			structure: {
				greetingPatterns: this.mergePatterns(existingProfile?.structure.greetingPatterns, analysis.greetingPatterns),
				closingPatterns: this.mergePatterns(existingProfile?.structure.closingPatterns, analysis.closingPatterns),
				signaturePatterns: this.mergePatterns(existingProfile?.structure.signaturePatterns, analysis.signaturePatterns),
				paragraphLength: this.mergeLengthPreference(existingProfile?.structure.paragraphLength, analysis.paragraphLength, samplesAnalyzed),
				sentenceLength: this.mergeLengthPreference(existingProfile?.structure.sentenceLength, analysis.sentenceLength, samplesAnalyzed),
				bulletUsage: this.mergeUsagePreference(existingProfile?.structure.bulletUsage, analysis.bulletUsage, samplesAnalyzed),
				headingUsage: this.mergeUsagePreference(existingProfile?.structure.headingUsage, analysis.headingUsage, samplesAnalyzed)
			},
			vocabulary: {
				favoriteWords: this.mergeWords(existingProfile?.vocabulary.favoriteWords, analysis.favoriteWords),
				avoidedWords: this.mergeWords(existingProfile?.vocabulary.avoidedWords, analysis.avoidedWords),
				technicalTerms: this.mergeWords(existingProfile?.vocabulary.technicalTerms, analysis.technicalTerms),
				formalityLevel: this.mergeFormalityLevel(existingProfile?.vocabulary.formalityLevel, analysis.formalityLevel, samplesAnalyzed)
			},
			emailPreferences: {
				subjectLineStyle: existingProfile?.emailPreferences.subjectLineStyle || 'descriptive',
				salutation: existingProfile?.emailPreferences.salutation || 'formal',
				valediction: existingProfile?.emailPreferences.valediction || 'formal',
				includeSignature: existingProfile?.emailPreferences.includeSignature ?? true,
				signatureContent: existingProfile?.emailPreferences.signatureContent
			},
			learning: {
				samplesAnalyzed,
				lastAnalysis: now,
				confidence,
				patterns: this.mergePatternsAnalysis(existingProfile?.learning.patterns, analysis, context)
			},
			lastUpdated: now
		};
		
		// Save to memory
		await this.memoryEngine.writeMemory(
			'style',
			'user-action',
			updatedProfile,
			`Style profile update for ${userId}: ${analysis.tone} tone, ${samplesAnalyzed} samples`,
			{
				tags: ['style-learning', 'user-profile', userId],
				importance: 80,
				confidence: confidence
			}
		);
		
		return updatedProfile;
	}
	
	// Helper methods
	
	private mapContextToAllowedType(context?: string): 'client-communication' | 'internal' | 'reports' | 'proposals' | undefined {
		if (!context) return undefined;
		
		// Map common context strings to allowed types
		const contextMap: Record<string, 'client-communication' | 'internal' | 'reports' | 'proposals'> = {
			'client': 'client-communication',
			'client-communication': 'client-communication',
			'email': 'client-communication',
			'internal': 'internal',
			'team': 'internal',
			'report': 'reports',
			'reports': 'reports',
			'proposal': 'proposals',
			'proposals': 'proposals',
			'auto-update': 'internal'
		};
		
		// Check for exact match
		if (context in contextMap) {
			return contextMap[context];
		}
		
		// Check for partial match
		for (const [key, value] of Object.entries(contextMap)) {
			if (context.toLowerCase().includes(key.toLowerCase())) {
				return value;
			}
		}
		
		// Default to internal for unknown contexts
		return 'internal';
	}
	
	private extractGreetingPatterns(text: string): string[] {
		const greetings = ['Dear', 'Hello', 'Hi', 'Hey', 'Greetings', 'To whom it may concern'];
		const found: string[] = [];
		
		for (const greeting of greetings) {
			if (text.toLowerCase().includes(greeting.toLowerCase())) {
				found.push(greeting);
			}
		}
		
		return found;
	}
	
	private extractClosingPatterns(text: string): string[] {
		const closings = ['Best regards', 'Sincerely', 'Thanks', 'Thank you', 'Cheers', 'Regards', 'Yours truly'];
		const found: string[] = [];
		
		for (const closing of closings) {
			if (text.toLowerCase().includes(closing.toLowerCase())) {
				found.push(closing);
			}
		}
		
		return found;
	}
	
	private extractSignaturePatterns(text: string): string[] {
		// Simple signature detection - look for common patterns
		const patterns: string[] = [];
		const lines = text.split('\n').map(line => line.trim());
		
		// Look for signature-like lines (short lines at the end)
		const lastLines = lines.slice(-5);
		for (const line of lastLines) {
			if (line.length > 0 && line.length < 50 && !line.includes('.')) {
				patterns.push(line);
			}
		}
		
		return patterns;
	}
	
	private calculateWordFrequency(words: string[]): Record<string, number> {
		const frequency: Record<string, number> = {};
		
		for (const word of words) {
			const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
			if (cleanWord.length > 2) { // Ignore very short words
				frequency[cleanWord] = (frequency[cleanWord] || 0) + 1;
			}
		}
		
		return frequency;
	}
	
	private hasGreeting(text: string): boolean {
		return this.extractGreetingPatterns(text).length > 0;
	}
	
	private hasClosing(text: string): boolean {
		return this.extractClosingPatterns(text).length > 0;
	}
	
	private hasListContent(text: string): boolean {
		// Check if text contains list-like content
		const listIndicators = ['first', 'second', 'third', '1.', '2.', '3.', '- ', '* ', '• '];
		return listIndicators.some(indicator => text.includes(indicator));
	}
	
	private selectGreeting(patterns: string[], tone: string): string {
		if (patterns.length === 0) {
			return tone === 'formal' ? 'Dear Sir/Madam,' : 'Hello,';
		}
		
		// Return the most common greeting for the tone
		if (tone === 'formal') {
			const formalGreetings = patterns.filter(g => ['Dear', 'To whom it may concern'].includes(g));
			return formalGreetings[0] || patterns[0] + ',';
		} else {
			const casualGreetings = patterns.filter(g => ['Hi', 'Hey', 'Hello'].includes(g));
			return casualGreetings[0] || patterns[0] + ',';
		}
	}
	
	private selectClosing(patterns: string[], tone: string): string {
		if (patterns.length === 0) {
			return tone === 'formal' ? 'Sincerely,' : 'Best,';
		}
		
		// Return the most common closing for the tone
		if (tone === 'formal') {
			const formalClosings = patterns.filter(c => ['Sincerely', 'Respectfully', 'Yours truly'].includes(c));
			return formalClosings[0] || patterns[0] + ',';
		} else {
			const casualClosings = patterns.filter(c => ['Best', 'Thanks', 'Cheers'].includes(c));
			return casualClosings[0] || patterns[0] + ',';
		}
	}
	
	private shouldAdjustTone(text: string, targetTone: string): boolean {
		const analysis = this.analyzeText(text);
		return analysis.tone !== targetTone && analysis.toneConfidence > 50;
	}
	
	private adjustTone(text: string, targetTone: string): string {
		// Simple tone adjustment - in production would use more sophisticated NLP
		if (targetTone === 'formal') {
			return text
				.replace(/hey/gi, 'Hello')
				.replace(/hi/gi, 'Hello')
				.replace(/thanks/gi, 'Thank you')
				.replace(/cheers/gi, 'Best regards');
		} else if (targetTone === 'casual') {
			return text
				.replace(/Dear/gi, 'Hi')
				.replace(/Sincerely/gi, 'Best')
				.replace(/Thank you/gi, 'Thanks');
		}
		
		return text;
	}
	
	private adjustSentenceLength(text: string, targetLength: 'short' | 'medium' | 'long'): string {
		// Simple sentence length adjustment
		if (targetLength === 'short') {
			// Replace some commas with periods
			return text.replace(/, ([a-z])/g, '. $1');
		} else if (targetLength === 'long') {
			// Replace some periods with commas
			return text.replace(/\. ([A-Z])/g, ', $1');
		}
		
		return text;
	}
	
	private mergeTone(
		existing: 'formal' | 'casual' | 'professional' | 'friendly' | 'technical' | undefined,
		newTone: 'formal' | 'casual' | 'professional' | 'friendly' | 'technical',
		sampleCount: number
	): 'formal' | 'casual' | 'professional' | 'friendly' | 'technical' {
		if (!existing || sampleCount < 5) {
			return newTone;
		}
		
		// Weighted average - favor existing tone with more samples
		return sampleCount > 20 ? existing : newTone;
	}
	
	private mergeToneVariations(
		existing: Array<{ context: 'client-communication' | 'internal' | 'reports' | 'proposals'; tone: 'formal' | 'casual' | 'professional' | 'friendly' | 'technical'; confidence: number }> | undefined,
		newTone: 'formal' | 'casual' | 'professional' | 'friendly' | 'technical',
		context?: 'client-communication' | 'internal' | 'reports' | 'proposals'
	): Array<{ context: 'client-communication' | 'internal' | 'reports' | 'proposals'; tone: 'formal' | 'casual' | 'professional' | 'friendly' | 'technical'; confidence: number }> {
		const variations = existing || [];
		
		if (context) {
			// Add or update variation for this context
			const existingIndex = variations.findIndex(v => v.context === context);
			if (existingIndex >= 0) {
				variations[existingIndex] = {
					...variations[existingIndex],
					tone: newTone,
					confidence: Math.min(100, (variations[existingIndex].confidence || 0) + 10)
				};
			} else {
				variations.push({
					context,
					tone: newTone,
					confidence: 50
				});
			}
		}
		
		return variations;
	}
	
	private mergePatterns(existing: string[] | undefined, newPatterns: string[]): string[] {
		const merged = new Set(existing || []);
		newPatterns.forEach(pattern => merged.add(pattern));
		return Array.from(merged);
	}
	
	private mergeWords(existing: string[] | undefined, newWords: string[]): string[] {
		const merged = new Set(existing || []);
		newWords.forEach(word => merged.add(word));
		return Array.from(merged).slice(0, 20); // Limit to top 20
	}
	
	private mergeLengthPreference(
		existing: 'short' | 'medium' | 'long' | undefined,
		newLength: 'short' | 'medium' | 'long',
		sampleCount: number
	): 'short' | 'medium' | 'long' {
		if (!existing || sampleCount < 5) {
			return newLength;
		}
		
		// Keep existing preference if we have enough samples
		return sampleCount > 10 ? existing : newLength;
	}
	
	private mergeUsagePreference(
		existing: 'frequent' | 'moderate' | 'rare' | undefined,
		newUsage: 'frequent' | 'moderate' | 'rare',
		sampleCount: number
	): 'frequent' | 'moderate' | 'rare' {
		if (!existing || sampleCount < 5) {
			return newUsage;
		}
		
		// Keep existing preference if we have enough samples
		return sampleCount > 10 ? existing : newUsage;
	}
	
	private mergeFormalityLevel(
		existing: 'high' | 'medium' | 'low' | undefined,
		newLevel: 'high' | 'medium' | 'low',
		sampleCount: number
	): 'high' | 'medium' | 'low' {
		if (!existing || sampleCount < 5) {
			return newLevel;
		}
		
		// Keep existing preference if we have enough samples
		return sampleCount > 10 ? existing : newLevel;
	}
	
	private mergePatternsAnalysis(
		existing: Array<{ pattern: string; frequency: number; context: string }> | undefined,
		analysis: StyleAnalysis,
		context?: string
	): Array<{ pattern: string; frequency: number; context: string }> {
		const patterns = existing || [];
		
		// Add new pattern analysis
		patterns.push({
			pattern: `tone-${analysis.tone}`,
			frequency: 1,
			context: context || 'general'
		});
		
		// Limit to recent patterns
		return patterns.slice(-50);
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
				console.error('Auto-update of style profiles failed:', error);
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
	 * Auto-update all style profiles
	 */
	private async autoUpdateProfiles(): Promise<void> {
		console.log('Auto-updating style profiles...');
		
		// Get recent email memories
		const recentMemories = await this.memorySelectors.getRecentMemories(50);
		const emailMemories = recentMemories.filter(m => m.category === 'email');
		
		if (emailMemories.length === 0) {
			return;
		}
		
		// Group by user (simplified - in production would track user IDs)
		const userMemories = new Map<string, MemoryItem[]>();
		for (const memory of emailMemories) {
			const userId = memory.metadata.relatedEntities.clientId || 'default';
			if (!userMemories.has(userId)) {
				userMemories.set(userId, []);
			}
			userMemories.get(userId)!.push(memory);
		}
		
		// Update profiles for each user with enough samples
		const entries = Array.from(userMemories.entries());
		for (const [userId, memories] of entries) {
			if (memories.length >= this.config.minSamplesForAnalysis) {
				// Combine text from recent memories
				const combinedText = memories
					.map(m => m.summary + ' ' + (m.content.body || ''))
					.join(' ');
				
				if (combinedText.length > 100) {
					try {
						await this.updateStyleProfile(userId, combinedText, 'auto-update');
						console.log(`Updated style profile for user: ${userId}`);
					} catch (error) {
						console.error(`Failed to update style profile for ${userId}:`, error);
					}
				}
			}
		}
	}
}
/**
 * Document Intelligence
 * 
 * Core engine for survey → report → PDF conversion in the Communication Hub.
 * Handles email content analysis, survey extraction, and professional document generation.
 */

import type { CopilotContext } from '../context/contextTypes';

/**
 * Survey data extracted from email/survey content
 */
export interface SurveyData {
	/** Survey title or subject */
	title: string;
	
	/** Survey questions and responses */
	questions: Array<{
		question: string;
		response: string;
		type: 'text' | 'multiple-choice' | 'rating' | 'yes-no' | 'scale';
	}>;
	
	/** Respondent information */
	respondent?: {
		name?: string;
		email?: string;
		organization?: string;
	};
	
	/** Survey metadata */
	metadata: {
		surveyType: 'customer-feedback' | 'market-research' | 'employee-survey' | 'product-feedback' | 'other';
		confidence: number;
	};
}

/**
 * Report generation options
 */
export interface ReportOptions {
	/** Report type */
	type: 'summary' | 'detailed' | 'executive';
	
	/** Target audience */
	audience: 'internal' | 'client' | 'stakeholder';
}

/**
 * Generated document
 */
export interface GeneratedDocument {
	/** Document ID */
	id: string;
	
	/** Document title */
	title: string;
	
	/** Content in various formats */
	content: {
		html: string;
		markdown: string;
		plainText: string;
	};
	
	/** Metadata */
	metadata: {
		generatedAt: Date;
		source: string;
		confidence: number;
		wordCount: number;
	};
	
	/** Recommendations for next steps */
	recommendations: string[];
}

/**
 * Document intelligence engine
 */
export class DocumentIntelligence {
	private extractionCache: Map<string, SurveyData> = new Map();

	constructor() {}

	/**
	 * Extract survey data from email content
	 */
	extractSurveyFromEmail(emailContent: string): SurveyData {
		const cacheKey = `survey-${Buffer.from(emailContent).toString('base64').substring(0, 50)}`;
		
		// Check cache
		if (this.extractionCache.has(cacheKey)) {
			return this.extractionCache.get(cacheKey)!;
		}

		const lines = emailContent.split('\n');
		const questions: SurveyData['questions'] = [];
		let title = 'Survey Results';
		let respondent: SurveyData['respondent'] = {};
		let surveyType: SurveyData['metadata']['surveyType'] = 'other';

		// Extract title from subject line
		const subjectMatch = emailContent.match(/Subject[:]\s*(.+)/i);
		if (subjectMatch) {
			title = subjectMatch[1].trim();
		}

		// Detect survey type
		const contentLower = emailContent.toLowerCase();
		if (contentLower.includes('customer') || contentLower.includes('client')) {
			surveyType = 'customer-feedback';
		} else if (contentLower.includes('market') || contentLower.includes('research')) {
			surveyType = 'market-research';
		} else if (contentLower.includes('employee') || contentLower.includes('staff')) {
			surveyType = 'employee-survey';
		} else if (contentLower.includes('product') || contentLower.includes('feature')) {
			surveyType = 'product-feedback';
		}

		// Extract respondent info
		const fromMatch = emailContent.match(/From[:]\s*(.+)/i);
		if (fromMatch) {
			const fromLine = fromMatch[1].trim();
			const emailMatch = fromLine.match(/<(.+?)>/);
			if (emailMatch) {
				respondent.email = emailMatch[1];
				respondent.name = fromLine.replace(/<.+?>/, '').trim();
			} else {
				respondent.name = fromLine;
			}
		}

		// Simple extraction: look for question-like patterns
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line || line.length < 10) continue;

			// Check if line looks like a question
			const isQuestion = line.includes('?') || 
							  line.startsWith('Q') || 
							  line.match(/^\d+[.)]/) ||
							  line.match(/^[A-Z].*\?$/);

			if (isQuestion) {
				// Look for response in next line
				let response = '';
				if (i + 1 < lines.length) {
					response = lines[i + 1].trim();
					if (response.length > 200) {
						response = response.substring(0, 200) + '...';
					}
				}

				questions.push({
					question: this.cleanQuestionText(line),
					response: response || 'No response provided',
					type: this.detectResponseType(response)
				});
			}
		}

		// If no questions found, create a simple summary
		if (questions.length === 0) {
			questions.push({
				question: 'Survey Content',
				response: emailContent.substring(0, 500) + (emailContent.length > 500 ? '...' : ''),
				type: 'text'
			});
		}

		const surveyData: SurveyData = {
			title,
			questions,
			respondent: Object.keys(respondent).length > 0 ? respondent : undefined,
			metadata: {
				surveyType,
				confidence: this.calculateExtractionConfidence(questions, emailContent)
			}
		};

		// Cache the result
		this.extractionCache.set(cacheKey, surveyData);

		return surveyData;
	}

	/**
	 * Clean question text
	 */
	private cleanQuestionText(text: string): string {
		return text
			.replace(/^(Q\d+[:.]?\s*)/i, '')
			.replace(/^(\d+[.)]\s*)/, '')
			.replace(/^(Question\s*\d*[:]?\s*)/i, '')
			.trim();
	}

	/**
	 * Detect response type
	 */
	private detectResponseType(response: string): SurveyData['questions'][0]['type'] {
		if (!response) return 'text';
		
		const responseLower = response.toLowerCase().trim();

		// Check for yes/no
		if (/^(yes|no)\b/i.test(responseLower) || /^(true|false)\b/i.test(responseLower)) {
			return 'yes-no';
		}

		// Check for rating
		if (/\d+\s*\/\s*\d+/.test(responseLower) || /\d+\s*out of\s*\d+/i.test(responseLower)) {
			return 'rating';
		}

		// Check for multiple choice
		if (/^[A-D][.)]/.test(response) || /^Option\s*\d+/i.test(response)) {
			return 'multiple-choice';
		}

		// Default to text
		return 'text';
	}

	/**
	 * Calculate extraction confidence
	 */
	private calculateExtractionConfidence(questions: SurveyData['questions'], originalText: string): number {
		if (questions.length === 0) return 0;

		let confidence = 50; // Base confidence
		confidence += Math.min(questions.length * 5, 30);
		
		if (originalText.length > 100) confidence += 10;
		if (originalText.length > 500) confidence += 10;

		return Math.max(0, Math.min(100, confidence));
	}

	/**
	 * Generate report from survey data
	 */
	generateReportFromSurvey(
		surveyData: SurveyData,
		options: ReportOptions = {
			type: 'summary',
			audience: 'internal'
		}
	): GeneratedDocument {
		const startTime = Date.now();

		// Analyze survey data
		const analysis = this.analyzeSurveyData(surveyData);

		// Generate content
		const markdown = this.generateMarkdownContent(surveyData, analysis, options);
		const html = this.generateHtmlContent(markdown, surveyData, options);
		const plainText = this.generatePlainTextContent(markdown);

		const processingTime = Date.now() - startTime;

		return {
			id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			title: `${surveyData.title} - ${this.getReportTypeLabel(options.type)} Report`,
			content: {
				html,
				markdown,
				plainText
			},
			metadata: {
				generatedAt: new Date(),
				source: 'survey-email',
				confidence: surveyData.metadata.confidence,
				wordCount: this.countWords(plainText)
			},
			recommendations: this.generateRecommendationsList(analysis, options)
		};
	}

	/**
	 * Analyze survey data for insights
	 */
	private analyzeSurveyData(surveyData: SurveyData): any {
		const analysis = {
			totalQuestions: surveyData.questions.length,
			questionTypes: {} as Record<string, number>,
			sentiment: 'neutral' as 'positive' | 'neutral' | 'negative' | 'mixed',
			keyThemes: [] as string[]
		};

		// Count question types
		for (const question of surveyData.questions) {
			analysis.questionTypes[question.type] = (analysis.questionTypes[question.type] || 0) + 1;
		}

		// Simple sentiment analysis
		const positiveWords = ['good', 'excellent', 'great', 'satisfied', 'happy', 'positive', 'yes', 'agree'];
		const negativeWords = ['bad', 'poor', 'unsatisfied', 'unhappy', 'negative', 'no', 'disagree', 'problem'];
		
		let positiveCount = 0;
		let negativeCount = 0;
		
		for (const question of surveyData.questions) {
			const responseLower = question.response.toLowerCase();
			if (positiveWords.some(word => responseLower.includes(word))) positiveCount++;
			if (negativeWords.some(word => responseLower.includes(word))) negativeCount++;
		}
		
		if (positiveCount > negativeCount * 2) analysis.sentiment = 'positive';
		else if (negativeCount > positiveCount * 2) analysis.sentiment = 'negative';
		else if (positiveCount > 0 && negativeCount > 0) analysis.sentiment = 'mixed';
		else analysis.sentiment = 'neutral';

		// Extract key themes
		const commonWords = ['service', 'product', 'quality', 'support', 'price', 'experience', 'time', 'feature'];
		for (const word of commonWords) {
			for (const question of surveyData.questions) {
				if (question.response.toLowerCase().includes(word) && !analysis.keyThemes.includes(word)) {
					analysis.keyThemes.push(word);
				}
			}
		}

		return analysis;
	}

	/**
	 * Generate markdown content
	 */
	private generateMarkdownContent(surveyData: SurveyData, analysis: any, options: ReportOptions): string {
		let markdown = `# ${surveyData.title}\n\n`;
		
		if (surveyData.respondent?.name) {
			markdown += `**Respondent:** ${surveyData.respondent.name}`;
			if (surveyData.respondent.organization) {
				markdown += ` (${surveyData.respondent.organization})`;
			}
			markdown += `\n\n`;
		}

		markdown += `## Executive Summary\n\n`;
		markdown += `This report summarizes findings from the "${surveyData.title}" survey.\n`;
		markdown += `- **Total questions:** ${analysis.totalQuestions}\n`;
		markdown += `- **Overall sentiment:** ${analysis.sentiment}\n`;
		if (analysis.keyThemes.length > 0) {
			markdown += `- **Key themes:** ${analysis.keyThemes.slice(0, 3).join(', ')}\n`;
		}
		markdown += `\n`;

		markdown += `## Question Analysis\n\n`;
		for (let i = 0; i < surveyData.questions.length; i++) {
			const question = surveyData.questions[i];
			markdown += `### Q${i + 1}: ${question.question}\n\n`;
			markdown += `**Response:** ${question.response}\n\n`;
			markdown += `**Type:** ${question.type}\n\n`;
		}

		markdown += `## Recommendations\n\n`;
		markdown += this.generateRecommendationsText(analysis, options);

		return markdown;
	}

	/**
	 * Generate HTML content
	 */
	private generateHtmlContent(markdown: string, surveyData: SurveyData, options: ReportOptions): string {
		// Simple markdown to HTML conversion
		let html = markdown
			.replace(/^# (.*$)/gim, '<h1>$1</h1>')
			.replace(/^## (.*$)/gim, '<h2>$1</h2>')
			.replace(/^### (.*$)/gim, '<h3>$1</h3>')
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\n\n/g, '</p><p>')
			.replace(/\n/g, '<br>');

		return `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${surveyData.title} - Report</title>
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
		h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
		h2 { color: #34495e; margin-top: 30px; }
		h3 { color: #7f8c8d; }
		strong { color: #2c3e50; }
	</style>
</head>
<body>
	${html}
</body>
</html>`;
	}

	/**
	 * Generate plain text content
	 */
	private generatePlainTextContent(markdown: string): string {
		return markdown
			.replace(/^# (.*$)/gim, '$1\n')
			.replace(/^## (.*$)/gim, '$1\n')
			.replace(/^### (.*$)/gim, '$1\n')
			.replace(/\*\*(.*?)\*\*/g, '$1')
			.replace(/\n\n/g, '\n')
			.trim();
	}

	/**
	 * Get report type label
	 */
	private getReportTypeLabel(type: string): string {
		switch (type) {
			case 'summary': return 'Summary';
			case 'detailed': return 'Detailed';
			case 'executive': return 'Executive';
			default: return 'Analysis';
		}
	}

	/**
	 * Count words in text
	 */
	private countWords(text: string): number {
		return text.split(/\s+/).filter(word => word.length > 0).length;
	}

	/**
	 * Generate recommendations list
	 */
	private generateRecommendationsList(analysis: any, options: ReportOptions): string[] {
		const recommendations: string[] = [];

		if (analysis.sentiment === 'negative' || analysis.sentiment === 'mixed') {
			recommendations.push('Address negative feedback points identified in the survey');
			recommendations.push('Follow up with respondents for clarification on critical issues');
		}

		if (analysis.keyThemes.length > 0) {
			recommendations.push(`Focus improvement efforts on: ${analysis.keyThemes.slice(0, 3).join(', ')}`);
		}

		if (analysis.totalQuestions > 5) {
			recommendations.push('Consider implementing changes based on consistent feedback patterns');
		}

		recommendations.push('Schedule follow-up survey to measure improvement after changes');
		recommendations.push('Share findings with relevant teams for action planning');

		return recommendations.slice(0, 5); // Return top 5 recommendations
	}

	/**
	 * Generate recommendations text
	 */
	private generateRecommendationsText(analysis: any, options: ReportOptions): string {
		const recommendations = this.generateRecommendationsList(analysis, options);
		return recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n');
	}

	/**
	 * Find related documents (placeholder)
	 */
	private findRelatedDocuments(surveyData: SurveyData): Array<{
		id: string;
		title: string;
		type: string;
		relevance: number;
	}> {
		// Placeholder implementation
		return [
			{
				id: 'related-1',
				title: 'Previous Survey Analysis',
				type: 'report',
				relevance: 75
			},
			{
				id: 'related-2',
				title: 'Customer Feedback Trends',
				type: 'analysis',
				relevance: 60
			}
		];
	}

	/**
	 * Process email and generate report in one step
	 */
	processEmailAndGenerateReport(emailContent: string, options?: ReportOptions): GeneratedDocument {
		const surveyData = this.extractSurveyFromEmail(emailContent);
		return this.generateReportFromSurvey(surveyData, options);
	}

	/**
	 * Get document intelligence for copilot context
	 */
	getDocumentIntelligence(context: CopilotContext): {
		canGenerateReport: boolean;
		suggestedReportType: string;
		estimatedProcessingTime: number;
		confidence: number;
	} {
		const hasEmailContent = context.ui?.currentScreen === 'message-view' ||
							   context.ui?.currentScreen === 'compose';
		
		return {
			canGenerateReport: hasEmailContent,
			suggestedReportType: hasEmailContent ? 'summary' : 'none',
			estimatedProcessingTime: hasEmailContent ? 5000 : 0,
			confidence: hasEmailContent ? 75 : 0
		};
	}

	/**
	 * Export document to PDF (placeholder)
	 */
	exportToPdf(document: GeneratedDocument): Promise<Blob> {
		// Placeholder implementation
		return Promise.resolve(new Blob([document.content.html], { type: 'application/pdf' }));
	}

	/**
	 * Get document statistics
	 */
	getDocumentStats(): {
		totalProcessed: number;
		averageConfidence: number;
		mostCommonType: string;
	} {
		return {
			totalProcessed: this.extractionCache.size,
			averageConfidence: 75,
			mostCommonType: 'customer-feedback'
		};
	}
}
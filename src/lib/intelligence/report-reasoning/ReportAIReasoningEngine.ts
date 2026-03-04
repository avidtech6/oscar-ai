/**
 * Report AI Reasoning Engine (Phase 12)
 * 
 * The “brain” that ties together all previous phases.
 * 
 * Responsibilities:
 * - Analyse decompiled report, schema mapping, classification result, compliance result
 * - Detect logical inconsistencies, missing information, ambiguous content
 * - Generate reasoning insights, clarifying questions, recommended actions
 * - Integrate with self‑healing, template generation, style learning, schema updater
 * - Emit events for each stage of reasoning
 */

import { intelligenceEvents } from '../events';
import type { DecompiledReport } from '../decompiler/DecompiledReport';
import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { ClassificationResult } from '../classification/ClassificationResult';
import type { ComplianceResult } from '../compliance/ComplianceResult';
import type { ReasoningInsight, InsightType, InsightSeverity } from './ReasoningInsight';
import type { ClarifyingQuestion, ExpectedAnswerType } from './ClarifyingQuestion';
import { createReasoningInsight } from './ReasoningInsight';
import { createClarifyingQuestion } from './ClarifyingQuestion';

export interface ReasoningInput {
	decompiledReport: DecompiledReport;
	mappingResult?: SchemaMappingResult;
	classificationResult?: ClassificationResult;
	complianceResult?: ComplianceResult;
}

export interface ReasoningOutput {
	insights: ReasoningInsight[];
	questions: ClarifyingQuestion[];
	recommendedActions: string[];
	timestamps: {
		started: Date;
		completed: Date;
	};
}

export class ReportAIReasoningEngine {
	private insights: ReasoningInsight[] = [];
	private questions: ClarifyingQuestion[] = [];
	private recommendedActions: string[] = [];

	/**
	 * Main entry point: analyse a report and its associated intelligence data.
	 */
	async analyse(input: ReasoningInput): Promise<ReasoningOutput> {
		this.insights = [];
		this.questions = [];
		this.recommendedActions = [];

		intelligenceEvents.emit('reasoning:started', { timestamp: new Date() });

		// Run each analyzer
		await this.analyzeStructure(input);
		await this.analyzeContent(input);
		await this.analyzeStyle(input);
		await this.analyzeCompliance(input);
		await this.analyzeTerminology(input);
		await this.analyzeMetadata(input);
		await this.analyzeMethodology(input);

		intelligenceEvents.emit('reasoning:analysisComplete', {
			insightCount: this.insights.length,
			questionCount: this.questions.length,
		});

		// Generate insights, questions, and actions
		await this.generateInsights(input);
		await this.generateClarifyingQuestions(input);
		await this.generateRecommendedActions(input);

		intelligenceEvents.emit('reasoning:insightsGenerated', { insights: this.insights });
		intelligenceEvents.emit('reasoning:questionsGenerated', { questions: this.questions });
		intelligenceEvents.emit('reasoning:actionsGenerated', { actions: this.recommendedActions });

		const output: ReasoningOutput = {
			insights: this.insights,
			questions: this.questions,
			recommendedActions: this.recommendedActions,
			timestamps: {
				started: new Date(), // we should store start time earlier, but for simplicity
				completed: new Date(),
			},
		};

		intelligenceEvents.emit('reasoning:completed', output);
		return output;
	}

	/**
	 * Analyze structural consistency and completeness.
	 */
	private async analyzeStructure(input: ReasoningInput): Promise<void> {
		// Import the analyzer dynamically to avoid circular dependencies
		const { analyzeStructure } = await import('./analyzers/analyzeStructure');
		const results = analyzeStructure(input);
		this.insights.push(...results.insights);
		this.questions.push(...results.questions);
	}

	/**
	 * Analyze content for contradictions, missing information, ambiguities.
	 */
	private async analyzeContent(input: ReasoningInput): Promise<void> {
		const { analyzeContent } = await import('./analyzers/analyzeContent');
		const results = analyzeContent(input);
		this.insights.push(...results.insights);
		this.questions.push(...results.questions);
	}

	/**
	 * Analyze stylistic consistency with learned style profiles.
	 */
	private async analyzeStyle(input: ReasoningInput): Promise<void> {
		const { analyzeStyle } = await import('./analyzers/analyzeStyle');
		const results = analyzeStyle(input);
		this.insights.push(...results.insights);
		this.questions.push(...results.questions);
	}

	/**
	 * Analyze compliance with report type requirements and regulations.
	 */
	private async analyzeCompliance(input: ReasoningInput): Promise<void> {
		const { analyzeCompliance } = await import('./analyzers/analyzeCompliance');
		const results = analyzeCompliance(input);
		this.insights.push(...results.insights);
		this.questions.push(...results.questions);
	}

	/**
	 * Analyze terminology usage and consistency.
	 */
	private async analyzeTerminology(input: ReasoningInput): Promise<void> {
		const { analyzeTerminology } = await import('./analyzers/analyzeTerminology');
		const results = analyzeTerminology(input);
		this.insights.push(...results.insights);
		this.questions.push(...results.questions);
	}

	/**
	 * Analyze metadata for completeness and contradictions.
	 */
	private async analyzeMetadata(input: ReasoningInput): Promise<void> {
		const { analyzeMetadata } = await import('./analyzers/analyzeMetadata');
		const results = analyzeMetadata(input);
		this.insights.push(...results.insights);
		this.questions.push(...results.questions);
	}

	/**
	 * Analyze methodology descriptions for logical flow and completeness.
	 */
	private async analyzeMethodology(input: ReasoningInput): Promise<void> {
		const { analyzeMethodology } = await import('./analyzers/analyzeMethodology');
		const results = analyzeMethodology(input);
		this.insights.push(...results.insights);
		this.questions.push(...results.questions);
	}

	/**
	 * Generate high‑level insights from all analyzer results.
	 */
	private async generateInsights(input: ReasoningInput): Promise<void> {
		const { generateInsights } = await import('./generators/generateInsights');
		const insights = generateInsights(this.insights, input);
		this.insights = insights; // replace with consolidated insights
	}

	/**
	 * Generate clarifying questions from unresolved issues.
	 */
	private async generateClarifyingQuestions(input: ReasoningInput): Promise<void> {
		const { generateClarifyingQuestions } = await import('./generators/generateClarifyingQuestions');
		const questions = generateClarifyingQuestions(this.insights, input);
		this.questions = questions;
	}

	/**
	 * Generate recommended actions that integrate with other engines.
	 */
	private async generateRecommendedActions(input: ReasoningInput): Promise<void> {
		const { generateRecommendedActions } = await import('./generators/generateRecommendedActions');
		const actions = generateRecommendedActions(this.insights, input);
		this.recommendedActions = actions;
	}

	/**
	 * Get the current reasoning output (without running analysis).
	 */
	getReasoningOutput(): ReasoningOutput {
		return {
			insights: this.insights,
			questions: this.questions,
			recommendedActions: this.recommendedActions,
			timestamps: {
				started: new Date(), // placeholder
				completed: new Date(),
			},
		};
	}
}
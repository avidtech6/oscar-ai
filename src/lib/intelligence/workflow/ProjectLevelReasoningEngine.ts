/**
 * Project‑Level Reasoning Engine (Phase 25)
 * 
 * Understands project context, pending tasks, incomplete reports,
 * relevant notes/media, and produces prioritised answers.
 * 
 * This is a thin wrapper delegating to extracted modules.
 */

import type { WorkflowGraphEngine } from './WorkflowGraphEngine';
import type { WorkflowNode, ProjectContext, WorkflowGap, PredictedNextStep } from './WorkflowTypes';
import * as ContextManager from './ProjectContextManager';
import * as GapAnalyzer from './ProjectGapAnalyzer';
import * as NextStepPredictor from './ProjectNextStepPredictor';
import * as QuestionAnswerer from './ProjectQuestionAnswerer';

export class ProjectLevelReasoningEngine {
	private graph: WorkflowGraphEngine;

	constructor(graph: WorkflowGraphEngine) {
		this.graph = graph;
	}

	private getStore(): ContextManager.ProjectContextStore {
		return { graph: this.graph };
	}

	private getGapStore(): GapAnalyzer.ProjectGapStore {
		return { graph: this.graph };
	}

	private getPredictorStore(): NextStepPredictor.ProjectPredictorStore {
		return { graph: this.graph };
	}

	private getQaStore(): QuestionAnswerer.ProjectQaStore {
		return { graph: this.graph };
	}

	/**
	 * Get all projects (nodes of type 'project').
	 */
	getAllProjects(): WorkflowNode[] {
		return ContextManager.getAllProjects(this.getStore());
	}

	/**
	 * Get a project by its entity ID.
	 */
	getProject(projectEntityId: string): WorkflowNode | undefined {
		return ContextManager.getProject(this.getStore(), projectEntityId);
	}

	/**
	 * Get project context (including related nodes).
	 */
	getProjectContext(projectEntityId: string): ProjectContext | null {
		return ContextManager.getProjectContext(this.getStore(), projectEntityId);
	}

	/**
	 * Analyse project gaps (missing tasks, incomplete reports, stale content).
	 */
	analyseProjectGaps(projectEntityId: string): WorkflowGap[] {
		return GapAnalyzer.analyseProjectGaps(this.getGapStore(), projectEntityId);
	}

	/**
	 * Predict next steps for a project.
	 */
	predictNextSteps(projectEntityId: string): PredictedNextStep[] {
		return NextStepPredictor.predictNextSteps(this.getPredictorStore(), projectEntityId);
	}

	/**
	 * Answer a natural‑language question about the project.
	 */
	answerQuestion(projectEntityId: string, question: string): string {
		return QuestionAnswerer.answerQuestion(this.getQaStore(), projectEntityId, question);
	}

	/**
	 * Generate a summary of the project.
	 */
	generateSummary(projectEntityId: string): string {
		return QuestionAnswerer.generateSummary(this.getQaStore(), projectEntityId);
	}
}
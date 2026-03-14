/**
 * Delegation functions for WorkflowIntelligenceLayer.
 * Each function corresponds to a method that delegates to a sub‑engine.
 */

import type {
	WorkflowGap,
	PredictedNextStep,
	WorkflowNodeType,
	WorkflowEdgeType,
	WorkflowEvent,
	WorkflowEventType,
} from './WorkflowTypes';
import type { PredictionContext } from './WorkflowPredictionEngine';
import type { CrossDocumentAnalysis } from './CrossDocumentIntelligenceEngine';
import type { WorkflowAction } from './WorkflowEventModel';

import type { WorkflowGraphEngine } from './WorkflowGraphEngine';
import type { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';
import type { CrossDocumentIntelligenceEngine } from './CrossDocumentIntelligenceEngine';
import type { WorkflowPredictionEngine } from './WorkflowPredictionEngine';
import type { AutomaticTaskGenerationEngine } from './AutomaticTaskGenerationEngine';
import type { MultiDocumentWorkflowEngine } from './MultiDocumentWorkflowEngine';
import type { WorkflowAwareContextMode } from './WorkflowAwareContextMode';
import type { WorkflowAwareChatMode } from './WorkflowAwareChatMode';
import type { WorkflowEventModel } from './WorkflowEventModel';

// ==================== Project‑Level Reasoning ====================

export function analyseProjectGaps(
	projectReasoning: ProjectLevelReasoningEngine,
	projectId: string
): WorkflowGap[] {
	return projectReasoning.analyseProjectGaps(projectId);
}

export function getProjectContext(
	projectReasoning: ProjectLevelReasoningEngine,
	projectId: string
) {
	return projectReasoning.getProjectContext(projectId);
}

// ==================== Cross‑Document Intelligence ====================

export function analyseCrossDocumentRelationships(
	crossDoc: CrossDocumentIntelligenceEngine,
	projectId?: string
): CrossDocumentAnalysis {
	return crossDoc.analyseCrossDocumentRelationships(projectId);
}

export function detectNoteShouldBecomeTask(
	crossDoc: CrossDocumentIntelligenceEngine,
	noteId: string
) {
	return crossDoc.detectNoteShouldBecomeTask(noteId);
}

export function detectTaskShouldBecomeReportSection(
	crossDoc: CrossDocumentIntelligenceEngine,
	taskId: string
) {
	return crossDoc.detectTaskShouldBecomeReportSection(taskId);
}

export function detectReportShouldBecomeBlogPost(
	crossDoc: CrossDocumentIntelligenceEngine,
	reportId: string
) {
	return crossDoc.detectReportShouldBecomeBlogPost(reportId);
}

// ==================== Prediction ====================

export function predictNextSteps(
	prediction: WorkflowPredictionEngine,
	context: PredictionContext
): PredictedNextStep[] {
	return prediction.predictNextSteps(context);
}

export function getPredictionSummary(
	prediction: WorkflowPredictionEngine,
	context: PredictionContext
) {
	return prediction.getPredictionSummary(context);
}

export function explainPredictions(
	prediction: WorkflowPredictionEngine,
	context: PredictionContext
): string {
	return prediction.explainPredictions(context);
}

// ==================== Automatic Task Generation ====================

export function generateTasksForNode(
	taskGen: AutomaticTaskGenerationEngine,
	nodeId: string
) {
	return taskGen.generateTasksForNode(nodeId);
}

export function applyGeneratedTasks(
	taskGen: AutomaticTaskGenerationEngine,
	tasks: any[]
) {
	return taskGen.applyGeneratedTasks(tasks);
}

// ==================== Multi‑Document Workflows ====================

export function discoverWorkflows(
	multiDoc: MultiDocumentWorkflowEngine
) {
	return multiDoc.discoverWorkflows();
}

export function suggestWorkflows(
	multiDoc: MultiDocumentWorkflowEngine,
	nodeId: string
) {
	return multiDoc.suggestWorkflows(nodeId);
}

export function executeTemplate(
	multiDoc: MultiDocumentWorkflowEngine,
	templateId: string,
	sourceNodeIds: string[]
) {
	return multiDoc.executeTemplate(templateId, sourceNodeIds);
}

// ==================== Context Mode ====================

export function getSuggestions(
	contextMode: WorkflowAwareContextMode,
	projectId?: string
) {
	return contextMode.getSuggestions(projectId);
}

// ==================== Chat Mode ====================

export function processChatMessage(
	chatMode: WorkflowAwareChatMode,
	message: string,
	context?: { projectId?: string; activeNodeId?: string }
) {
	return chatMode.processMessage(message, context);
}

// ==================== Event Model ====================

export function subscribe(
	eventModel: WorkflowEventModel,
	eventType: WorkflowEventType,
	handler: (event: WorkflowEvent) => void
): void {
	eventModel.subscribe(eventType, handler);
}

export function unsubscribe(
	eventModel: WorkflowEventModel,
	eventType: WorkflowEventType,
	handler: (event: WorkflowEvent) => void
): void {
	eventModel.unsubscribe(eventType, handler);
}

export function emitEvent(
	eventModel: WorkflowEventModel,
	event: WorkflowEvent
): void {
	eventModel.emit(event);
}

export function getRecentActions(
	eventModel: WorkflowEventModel,
	limit = 50
): WorkflowAction[] {
	return eventModel.getRecentActions(limit);
}
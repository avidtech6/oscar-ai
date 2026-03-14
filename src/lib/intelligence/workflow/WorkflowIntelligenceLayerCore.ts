/**
 * Workflow Intelligence Layer – constructor and core accessors
 */

import type {
	WorkflowNode,
	WorkflowEdge,
	WorkflowEvent,
	WorkflowEventType,
	WorkflowGap,
	PredictedNextStep,
	WorkflowNodeType,
	WorkflowEdgeType,
} from './WorkflowTypes';

import type { WorkflowAction } from './WorkflowEventModel';
import type { CrossDocumentAnalysis } from './CrossDocumentIntelligenceEngine';

import { WorkflowGraphEngine } from './WorkflowGraphEngine';
import { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';
import { CrossDocumentIntelligenceEngine } from './CrossDocumentIntelligenceEngine';
import { WorkflowPredictionEngine, type PredictionContext } from './WorkflowPredictionEngine';
import { AutomaticTaskGenerationEngine } from './AutomaticTaskGenerationEngine';
import { MultiDocumentWorkflowEngine } from './MultiDocumentWorkflowEngine';
import { WorkflowAwareContextMode } from './WorkflowAwareContextMode';
import { WorkflowAwareChatMode } from './WorkflowAwareChatMode';
import { WorkflowEventModel } from './WorkflowEventModel';

export class WorkflowIntelligenceLayerCore {
	private graph: WorkflowGraphEngine;
	private projectReasoning: ProjectLevelReasoningEngine;
	private crossDoc: CrossDocumentIntelligenceEngine;
	private prediction: WorkflowPredictionEngine;
	private taskGen: AutomaticTaskGenerationEngine;
	private multiDoc: MultiDocumentWorkflowEngine;
	private contextMode: WorkflowAwareContextMode;
	private chatMode: WorkflowAwareChatMode;
	private eventModel: WorkflowEventModel;

	constructor() {
		this.graph = new WorkflowGraphEngine();
		this.projectReasoning = new ProjectLevelReasoningEngine(this.graph);
		this.crossDoc = new CrossDocumentIntelligenceEngine(this.graph, this.projectReasoning);
		this.prediction = new WorkflowPredictionEngine(this.graph, this.projectReasoning);
		this.taskGen = new AutomaticTaskGenerationEngine(this.graph, this.crossDoc);
		this.multiDoc = new MultiDocumentWorkflowEngine(
			this.graph,
			this.crossDoc,
			this.taskGen,
			this.projectReasoning
		);
		this.contextMode = new WorkflowAwareContextMode(this.graph, this.projectReasoning);
		this.chatMode = new WorkflowAwareChatMode(
			this.graph,
			this.projectReasoning,
			this.taskGen,
			this.crossDoc
		);
		this.eventModel = new WorkflowEventModel(
			this.graph,
			this.projectReasoning,
			this.taskGen,
			this.crossDoc,
			this.prediction
		);
	}

	// ==================== Core Accessors ====================

	/**
	 * Get the underlying workflow graph engine.
	 */
	getGraph(): WorkflowGraphEngine {
		return this.graph;
	}

	/**
	 * Get the project‑level reasoning engine.
	 */
	getProjectReasoning(): ProjectLevelReasoningEngine {
		return this.projectReasoning;
	}

	/**
	 * Get the cross‑document intelligence engine.
	 */
	getCrossDocumentIntelligence(): CrossDocumentIntelligenceEngine {
		return this.crossDoc;
	}

	/**
	 * Get the prediction engine.
	 */
	getPredictionEngine(): WorkflowPredictionEngine {
		return this.prediction;
	}

	/**
	 * Get the automatic task generation engine.
	 */
	getTaskGenerationEngine(): AutomaticTaskGenerationEngine {
		return this.taskGen;
	}

	/**
	 * Get the multi‑document workflow engine.
	 */
	getMultiDocumentWorkflowEngine(): MultiDocumentWorkflowEngine {
		return this.multiDoc;
	}

	/**
	 * Get the workflow‑aware context mode.
	 */
	getContextMode(): WorkflowAwareContextMode {
		return this.contextMode;
	}

	/**
	 * Get the workflow‑aware chat mode.
	 */
	getChatMode(): WorkflowAwareChatMode {
		return this.chatMode;
	}

	/**
	 * Get the workflow event model.
	 */
	getEventModel(): WorkflowEventModel {
		return this.eventModel;
	}
}
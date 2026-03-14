/**
 * Workflow Intelligence Layer – project-level reasoning
 */

import type { WorkflowGap } from './WorkflowTypes';
import { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';
import * as Delegates from './WorkflowIntelligenceLayerDelegates';

export class WorkflowIntelligenceLayerProject {
	private projectReasoning: ProjectLevelReasoningEngine;

	constructor(projectReasoning: ProjectLevelReasoningEngine) {
		this.projectReasoning = projectReasoning;
	}

	/**
	 * Analyse gaps in a project.
	 */
	analyseProjectGaps(projectId: string): WorkflowGap[] {
		return Delegates.analyseProjectGaps(this.projectReasoning, projectId);
	}

	/**
	 * Get the context of a project (nodes, edges, metadata).
	 */
	getProjectContext(projectId: string) {
		return Delegates.getProjectContext(this.projectReasoning, projectId);
	}
}
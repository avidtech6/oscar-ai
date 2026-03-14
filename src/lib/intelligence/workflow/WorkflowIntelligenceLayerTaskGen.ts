/**
 * Workflow Intelligence Layer – automatic task generation
 */

import { AutomaticTaskGenerationEngine } from './AutomaticTaskGenerationEngine';
import * as Delegates from './WorkflowIntelligenceLayerDelegates';

export class WorkflowIntelligenceLayerTaskGen {
	private taskGen: AutomaticTaskGenerationEngine;

	constructor(taskGen: AutomaticTaskGenerationEngine) {
		this.taskGen = taskGen;
	}

	/**
	 * Generate tasks for a given node (note, report, etc.).
	 */
	generateTasksForNode(nodeId: string) {
		return Delegates.generateTasksForNode(this.taskGen, nodeId);
	}

	/**
	 * Apply generated tasks to the graph.
	 */
	applyGeneratedTasks(tasks: any[]) {
		return Delegates.applyGeneratedTasks(this.taskGen, tasks);
	}
}
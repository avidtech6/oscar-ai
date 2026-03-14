/**
 * Workflow Intelligence Layer – multi-document workflows
 */

import { MultiDocumentWorkflowEngine } from './MultiDocumentWorkflowEngine';
import * as Delegates from './WorkflowIntelligenceLayerDelegates';

export class WorkflowIntelligenceLayerMultiDoc {
	private multiDoc: MultiDocumentWorkflowEngine;

	constructor(multiDoc: MultiDocumentWorkflowEngine) {
		this.multiDoc = multiDoc;
	}

	/**
	 * Discover potential workflows in the graph.
	 */
	discoverWorkflows() {
		return Delegates.discoverWorkflows(this.multiDoc);
	}

	/**
	 * Suggest workflows for a given node.
	 */
	suggestWorkflows(nodeId: string) {
		return Delegates.suggestWorkflows(this.multiDoc, nodeId);
	}

	/**
	 * Execute a workflow template.
	 */
	executeTemplate(templateId: string, sourceNodeIds: string[]) {
		return Delegates.executeTemplate(this.multiDoc, templateId, sourceNodeIds);
	}
}
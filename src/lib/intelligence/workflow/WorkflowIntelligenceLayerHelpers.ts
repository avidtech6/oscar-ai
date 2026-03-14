/**
 * Helper functions for WorkflowIntelligenceLayer event emission.
 */

import type { WorkflowNode, WorkflowEdge, WorkflowEventType } from './WorkflowTypes';
import { WorkflowEventModel } from './WorkflowEventModel';

/**
 * Emit a node‑creation/removal event.
 */
export function emitNodeEvent(
	eventModel: WorkflowEventModel,
	action: 'created' | 'removed',
	node: WorkflowNode
): void {
	let eventType: WorkflowEventType;
	switch (node.type) {
		case 'note':
			eventType = action === 'created' ? 'noteCreated' : 'userAction';
			break;
		case 'task':
			eventType = action === 'created' ? 'taskCreated' : 'userAction';
			break;
		case 'report':
			eventType = action === 'created' ? 'documentCreated' : 'userAction';
			break;
		case 'media':
			eventType = action === 'created' ? 'mediaAdded' : 'userAction';
			break;
		default:
			eventType = 'userAction';
	}
	eventModel.createEvent(eventType, node.entityId, { nodeType: node.type, action });
}

/**
 * Emit an edge‑creation event.
 */
export function emitEdgeEvent(
	eventModel: WorkflowEventModel,
	action: 'created',
	edge: WorkflowEdge
): void {
	eventModel.createEvent('userAction', edge.sourceId, {
		edgeType: edge.type,
		targetId: edge.targetId,
		action: 'edgeCreated',
	});
}
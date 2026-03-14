/**
 * Workflow Intelligence Layer – event model
 */

import type { WorkflowEvent, WorkflowEventType } from './WorkflowTypes';
import type { WorkflowAction } from './WorkflowEventModel';
import { WorkflowEventModel } from './WorkflowEventModel';
import * as Delegates from './WorkflowIntelligenceLayerDelegates';

export class WorkflowIntelligenceLayerEvents {
	private eventModel: WorkflowEventModel;

	constructor(eventModel: WorkflowEventModel) {
		this.eventModel = eventModel;
	}

	/**
	 * Subscribe to workflow events.
	 */
	subscribe(eventType: WorkflowEventType, handler: (event: WorkflowEvent) => void): void {
		Delegates.subscribe(this.eventModel, eventType, handler);
	}

	/**
	 * Unsubscribe from workflow events.
	 */
	unsubscribe(eventType: WorkflowEventType, handler: (event: WorkflowEvent) => void): void {
		Delegates.unsubscribe(this.eventModel, eventType, handler);
	}

	/**
	 * Emit a custom workflow event.
	 */
	emitEvent(event: WorkflowEvent): void {
		Delegates.emitEvent(this.eventModel, event);
	}

	/**
	 * Get recent workflow actions.
	 */
	getRecentActions(limit = 50): WorkflowAction[] {
		return Delegates.getRecentActions(this.eventModel, limit);
	}
}
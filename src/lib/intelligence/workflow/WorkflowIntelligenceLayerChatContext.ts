/**
 * Workflow Intelligence Layer – context and chat modes
 */

import { WorkflowAwareContextMode } from './WorkflowAwareContextMode';
import { WorkflowAwareChatMode } from './WorkflowAwareChatMode';
import * as Delegates from './WorkflowIntelligenceLayerDelegates';

export class WorkflowIntelligenceLayerChatContext {
	private contextMode: WorkflowAwareContextMode;
	private chatMode: WorkflowAwareChatMode;

	constructor(contextMode: WorkflowAwareContextMode, chatMode: WorkflowAwareChatMode) {
		this.contextMode = contextMode;
		this.chatMode = chatMode;
	}

	/**
	 * Get suggestions for the current context.
	 */
	getSuggestions(projectId?: string) {
		return Delegates.getSuggestions(this.contextMode, projectId);
	}

	/**
	 * Process a chat message with workflow awareness.
	 */
	processChatMessage(
		message: string,
		context?: { projectId?: string; activeNodeId?: string }
	) {
		return Delegates.processChatMessage(this.chatMode, message, context);
	}
}
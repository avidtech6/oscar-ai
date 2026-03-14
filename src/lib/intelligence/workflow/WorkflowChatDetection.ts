/**
 * Workflow Chat Detection (Phase 25)
 * 
 * Detects apply actions from chat messages and generates responses.
 */

import type { ApplyAction } from './WorkflowAwareChatMode';

export interface DetectionConfig {
	allowedApplyActions: string[];
}

/**
 * Detect apply actions in a chat message.
 */
export function detectApplyActions(
	message: string,
	allowedActions: string[],
	context?: { projectId?: string; activeNodeId?: string }
): ApplyAction[] {
	const actions: ApplyAction[] = [];
	const lower = message.toLowerCase();

	// Detect task creation
	if (lower.includes('task') || lower.includes('todo') || lower.includes('need to') || lower.includes('should')) {
		actions.push({
			type: 'createTask',
			parameters: { title: extractTitle(message), description: message },
			confidence: 0.7,
			description: 'Create a task from this message',
		});
	}

	// Detect note update
	if (lower.includes('note') || lower.includes('write down') || lower.includes('remember')) {
		actions.push({
			type: 'updateNote',
			targetNodeId: context?.activeNodeId,
			parameters: { content: message },
			confidence: 0.6,
			description: 'Update or create a note',
		});
	}

	// Detect report update
	if (lower.includes('report') || lower.includes('section') || lower.includes('document')) {
		actions.push({
			type: 'updateReport',
			parameters: { content: message },
			confidence: 0.5,
			description: 'Update a report section',
		});
	}

	// Detect section generation
	if (lower.includes('generate') || lower.includes('create section') || lower.includes('add to')) {
		actions.push({
			type: 'generateSection',
			parameters: { content: message },
			confidence: 0.8,
			description: 'Generate a new section',
		});
	}

	// Filter by allowed actions
	return actions.filter(action => allowedActions.includes(action.type));
}

/**
 * Extract a title from a message (simple).
 */
export function extractTitle(message: string): string {
	// Simple extraction: first 50 characters
	return message.substring(0, 50).trim() + (message.length > 50 ? '...' : '');
}

/**
 * Generate a response based on message and detected actions.
 */
export function generateResponse(
	message: string,
	applyActions: ApplyAction[],
	context?: { projectId?: string; activeNodeId?: string }
): string {
	// Simple echo with detected actions
	if (applyActions.length === 0) {
		return `I understand: "${message}".`;
	}

	const actionDescriptions = applyActions.map(a => a.description).join(', ');
	return `I understand: "${message}". I can ${actionDescriptions}. Would you like me to apply any of these?`;
}
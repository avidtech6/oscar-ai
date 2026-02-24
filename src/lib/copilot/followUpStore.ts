import { writable } from 'svelte/store';
import type { FollowUpAction } from './followUpEngine';

// Store for follow‑up suggestions
export const followUps = writable<FollowUpAction[]>([]);

/**
 * Clear all follow‑up suggestions
 */
export function clearFollowUps(): void {
	followUps.set([]);
}

/**
 * Update follow‑up suggestions based on new context and conversation
 */
export function updateFollowUps(
	context: any, // CopilotContext from hintEngine
	lastUserMessage: string,
	lastAssistantMessage: string
): void {
	// Import dynamically to avoid circular dependencies
	import('./followUpEngine').then(({ getFollowUps }) => {
		const suggestions = getFollowUps(context, lastUserMessage, lastAssistantMessage);
		followUps.set(suggestions);
	}).catch(error => {
		console.error('Failed to update follow‑ups:', error);
		followUps.set([]);
	});
}

/**
 * Apply a follow‑up action by inserting its text into the Copilot bar
 * This function should be called from UI components when a follow‑up button is clicked
 */
export function applyFollowUp(action: FollowUpAction): void {
	// Dispatch a custom event that the CopilotBar can listen for
	const event = new CustomEvent('followUpAction', {
		detail: { action: action.action }
	});
	window.dispatchEvent(event);
	
	// Clear follow‑ups after one is selected (user is taking action)
	clearFollowUps();
}
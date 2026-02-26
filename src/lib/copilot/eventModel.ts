import {
	setPageContext,
	setItemContext,
	setSelectedIds,
	setSmartHint,
	setMicroCue,
	addMessage,
	expand,
	collapse
} from './copilotStore';
import { processUserPrompt } from '$lib/services/semanticRouting';
import { handleUserPrompt } from '$lib/services/intelligenceLayer';

// Event: Page changed
export function onPageChange(pageContext: any) {
	setPageContext(pageContext);
	
	// Update smart hint based on page
	const hints: Record<string, string> = {
		'workspace': 'Try asking: "Create a new project" or "Show me overdue tasks"',
		'project': 'Try asking: "Summarize this project" or "What trees need attention?"',
		'notes': 'Try asking: "Help me write a note" or "Summarize all notes"',
		'trees': 'Try asking: "Which trees need maintenance?" or "Add a new tree"',
		'reports': 'Try asking: "Generate a report" or "Help me format this section"',
		'tasks': 'Try asking: "What tasks are overdue?" or "Create a new task"',
		'photos': 'Try asking: "Which photos are missing labels?" or "Organize photos"'
	};
	
	const hint = hints[pageContext.page] || 'Try asking Oscar AI for help with your current task';
	setSmartHint(hint);
	
	// Set micro-cue for context change
	setMicroCue('context');
	setTimeout(() => setMicroCue(null), 2000); // Clear after 2 seconds
}

// Event: Item opened (note, tree, task, etc.)
export function onItemOpen(itemContext: any) {
	setItemContext(itemContext);
	
	// Update smart hint
	setSmartHint(`Try asking about this ${itemContext.type}: "${itemContext.name || 'Item'}"`);
	
	// Expand copilot if not already expanded
	expand();
}

// Event: Item closed
export function onItemClose() {
	setItemContext({});
	setSmartHint('Try asking Oscar AI for help with your current task');
}

// Event: Selection changed (multi-select)
export function onSelectionChange(selectedIds: string[]) {
	setSelectedIds(selectedIds);
	
	if (selectedIds.length > 0) {
		setSmartHint(`You have ${selectedIds.length} items selected. Try asking: "What can I do with these?"`);
		setMicroCue('nudge');
	} else {
		setMicroCue(null);
	}
}

// Event: Modal opened
export function onModalOpen(itemContext: any) {
	setItemContext(itemContext);
	setSmartHint(`Working in ${itemContext.type} modal. Try asking for help with this ${itemContext.type}.`);
	expand();
}

// Event: Modal closed
export function onModalClose() {
	onItemClose();
	collapse();
}

// Event: AI action applied
export function onAIActionApplied(action: string, result: string) {
	addMessage('confirmation', `AI applied: ${action}`);
	
	// Show micro-cue for success
	setMicroCue('context');
	setTimeout(() => setMicroCue(null), 1500);
}

// Event: User prompt submitted
export async function onUserPrompt(prompt: string) {
	console.log('[eventModel] onUserPrompt:', prompt);
	addMessage('user', prompt);
	
	try {
		await handleUserPrompt(prompt);
	} catch (error) {
		console.error('Failed to process user prompt:', error);
		addMessage('ai', `Sorry, I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

// Initialize with default context
export function initialize() {
	onPageChange({ page: 'workspace' });
}
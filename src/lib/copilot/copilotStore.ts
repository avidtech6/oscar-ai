import { writable } from 'svelte/store';

// Store for copilot state
export const isExpanded = writable(false);
export const pageContext = writable<any>({});
export const itemContext = writable<any>({});
export const selectedIds = writable<string[]>([]);
export const messages = writable<Array<{type: string, text: string, id?: string}>>([]);
export const smartHint = writable('');
export const microCue = writable<'nudge' | 'clarify' | 'context' | null>(null);

// Three-state copilot architecture
export const copilotState = writable<'micro' | 'mid' | 'full'>('micro');

// Helper functions for three-state architecture
export function setMicro() {
	copilotState.set('micro');
}

export function setMid() {
	copilotState.set('mid');
}

export function setFull() {
	copilotState.set('full');
}

// Helper functions
export function addMessage(type: string, text: string) {
	messages.update(msgs => [...msgs, { type, text, id: Date.now().toString() }]);
}

export function addConfirmation(text: string) {
	addMessage('confirmation', text);
}

export function clearMessages() {
	messages.set([]);
}

export function setPageContext(context: any) {
	pageContext.set(context);
}

export function setItemContext(context: any) {
	itemContext.set(context);
}

export function setSelectedIds(ids: string[]) {
	selectedIds.set(ids);
}

export function setSmartHint(hint: string) {
	smartHint.set(hint);
}

export function setMicroCue(cue: 'nudge' | 'clarify' | 'context' | null) {
	microCue.set(cue);
}

export function toggleExpanded() {
	isExpanded.update(value => !value);
}

export function expand() {
	isExpanded.set(true);
}

export function collapse() {
	isExpanded.set(false);
}
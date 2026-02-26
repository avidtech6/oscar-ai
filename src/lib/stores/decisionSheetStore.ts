import { writable } from 'svelte/store';

export interface DecisionSheetAction {
	id: string;
	label: string;
	icon?: string;
	handler: () => void;
}

export interface DecisionSheetState {
	isOpen: boolean;
	title: string;
	message: string;
	actions: DecisionSheetAction[];
	// Callback when user cancels (closes without choosing)
	onCancel?: () => void;
	// Whether the sheet is ephemeral (not saved)
	ephemeral: boolean;
}

const initialState: DecisionSheetState = {
	isOpen: false,
	title: 'What would you like to do?',
	message: '',
	actions: [],
	ephemeral: true
};

const { subscribe, set, update } = writable<DecisionSheetState>(initialState);

function openSheet(
	title: string,
	message: string,
	actions: DecisionSheetAction[],
	onCancel?: () => void
) {
	console.log('[DecisionSheetStore] openSheet:', title, message, actions.length);
	set({
		isOpen: true,
		title,
		message,
		actions,
		onCancel,
		ephemeral: true
	});
}

function closeSheet() {
	update(state => ({ ...state, isOpen: false }));
}

function reset() {
	set(initialState);
}

// Helper to create a decision sheet for a detected subsystem mismatch
function openSubsystemDecision(
	subsystem: string,
	suggestedActions: string[],
	onActionSelected: (actionLabel: string) => void
) {
	const actions: DecisionSheetAction[] = suggestedActions.map((label, idx) => ({
		id: `action_${idx}`,
		label,
		handler: () => onActionSelected(label)
	}));

	openSheet(
		`Switch to ${subsystem}?`,
		`You mentioned ${subsystem}. Would you like to switch there?`,
		actions,
		() => console.log('User cancelled subsystem switch')
	);
}

// Helper to open a decision sheet for ambiguous intent
function openAmbiguousDecision(
	prompt: string,
	onActionSelected: (actionLabel: string) => void
) {
	const actions: DecisionSheetAction[] = [
		{ id: 'stay', label: 'Stay Here', handler: () => onActionSelected('Stay Here') },
		{ id: 'notes', label: 'Switch to Notes', handler: () => onActionSelected('Switch to Notes') },
		{ id: 'tasks', label: 'Switch to Tasks', handler: () => onActionSelected('Switch to Tasks') },
		{ id: 'clarify', label: 'Ask for Clarification', handler: () => onActionSelected('Ask for Clarification') }
	];

	openSheet(
		'Where should we go?',
		`I'm not sure where you'd like to go with "${prompt}".`,
		actions,
		() => console.log('User cancelled ambiguous decision')
	);
}

// Helper for media actions (photo, voice, file)
function openMediaDecision(
	mediaType: 'photo' | 'voice' | 'file',
	onActionSelected: (actionLabel: string) => void
) {
	let title = '';
	let message = '';
	let actions: DecisionSheetAction[] = [];

	switch (mediaType) {
		case 'photo':
			title = 'Photo captured';
			message = 'What would you like to do with this photo?';
			actions = [
				{ id: 'gallery', label: 'View in Gallery', handler: () => onActionSelected('View in Gallery') },
				{ id: 'tag', label: 'Tag this Photo', handler: () => onActionSelected('Tag this Photo') },
				{ id: 'attach', label: 'Attach to Note', handler: () => onActionSelected('Attach to Note') },
				{ id: 'analyse', label: 'Analyse with AI', handler: () => onActionSelected('Analyse with AI') }
			];
			break;
		case 'voice':
			title = 'Voice note recorded';
			message = 'What would you like to do with this recording?';
			actions = [
				{ id: 'transcribe', label: 'Transcribe', handler: () => onActionSelected('Transcribe') },
				{ id: 'summarise', label: 'Summarise', handler: () => onActionSelected('Summarise') },
				{ id: 'attach', label: 'Attach to Note', handler: () => onActionSelected('Attach to Note') },
				{ id: 'open', label: 'Open in Voice Notes', handler: () => onActionSelected('Open in Voice Notes') }
			];
			break;
		case 'file':
			title = 'File imported';
			message = 'What would you like to do with this file?';
			actions = [
				{ id: 'open', label: 'Open File', handler: () => onActionSelected('Open File') },
				{ id: 'attach', label: 'Attach to Note', handler: () => onActionSelected('Attach to Note') },
				{ id: 'organise', label: 'Organise', handler: () => onActionSelected('Organise') },
				{ id: 'share', label: 'Share', handler: () => onActionSelected('Share') }
			];
			break;
	}

	openSheet(title, message, actions, () => console.log(`User cancelled ${mediaType} decision`));
}

export const decisionSheetStore = {
	subscribe,
	openSheet,
	closeSheet,
	reset,
	openSubsystemDecision,
	openAmbiguousDecision,
	openMediaDecision
};

import { writable, derived, type Writable, type Readable } from 'svelte/store';
import { contextPanelStore } from '../context-panel/contextPanelStore';

// Types
export interface AssistAction {
	id: string;
	title: string;
	description: string;
	icon: string;
	action: () => void | Promise<void>;
	category: 'quick' | 'ai' | 'navigation' | 'tools' | 'communication';
	requiresConfirmation?: boolean;
	disabled?: boolean;
}

export interface AssistState {
	isOpen: boolean;
	isExpanded: boolean;
	currentTab: 'actions' | 'hints' | 'tools' | 'voice';
	quickActions: AssistAction[];
	aiActions: AssistAction[];
	navigationActions: AssistAction[];
	voiceTranscript: string;
	isListening: boolean;
	sheetHeight: number; // 0-100 percentage
	animationDuration: number;
}

// Initial state
const initialState: AssistState = {
	isOpen: false,
	isExpanded: false,
	currentTab: 'actions',
	quickActions: [
		{
			id: 'new-note',
			title: 'New Note',
			description: 'Create a quick note',
			icon: 'edit',
			action: () => { window.dispatchEvent(new CustomEvent('create-note')); },
			category: 'quick'
		},
		{
			id: 'take-photo',
			title: 'Take Photo',
			description: 'Capture with camera',
			icon: 'camera',
			action: () => { window.dispatchEvent(new CustomEvent('open-camera')); },
			category: 'quick'
		},
		{
			id: 'record-voice',
			title: 'Record Voice',
			description: 'Start voice recording',
			icon: 'mic',
			action: () => { window.dispatchEvent(new CustomEvent('start-voice-recording')); },
			category: 'quick'
		},
		{
			id: 'scan-document',
			title: 'Scan Document',
			description: 'Scan with camera',
			icon: 'scan',
			action: () => { window.dispatchEvent(new CustomEvent('open-document-scanner')); },
			category: 'quick'
		}
	],
	aiActions: [
		{
			id: 'summarize',
			title: 'Summarize',
			description: 'AI summary of current content',
			icon: 'file-text',
			action: () => { window.dispatchEvent(new CustomEvent('ai-summarize')); },
			category: 'ai'
		},
		{
			id: 'translate',
			title: 'Translate',
			description: 'Translate selected text',
			icon: 'globe',
			action: () => { window.dispatchEvent(new CustomEvent('ai-translate')); },
			category: 'ai'
		},
		{
			id: 'improve-writing',
			title: 'Improve Writing',
			description: 'AI writing assistant',
			icon: 'pen-tool',
			action: () => { window.dispatchEvent(new CustomEvent('ai-improve-writing')); },
			category: 'ai'
		},
		{
			id: 'generate-code',
			title: 'Generate Code',
			description: 'Code generation',
			icon: 'code',
			action: () => { window.dispatchEvent(new CustomEvent('ai-generate-code')); },
			category: 'ai'
		}
	],
	navigationActions: [
		{
			id: 'go-home',
			title: 'Go Home',
			description: 'Return to dashboard',
			icon: 'home',
			action: () => { window.location.href = '/'; },
			category: 'navigation'
		},
		{
			id: 'open-projects',
			title: 'Projects',
			description: 'View all projects',
			icon: 'folder',
			action: () => { window.location.href = '/projects'; },
			category: 'navigation'
		},
		{
			id: 'open-notes',
			title: 'Notes',
			description: 'View all notes',
			icon: 'file',
			action: () => { window.location.href = '/notes'; },
			category: 'navigation'
		},
		{
			id: 'open-calendar',
			title: 'Calendar',
			description: 'View calendar',
			icon: 'calendar',
			action: () => { window.location.href = '/calendar'; },
			category: 'navigation'
		}
	],
	voiceTranscript: '',
	isListening: false,
	sheetHeight: 40, // Default 40% height
	animationDuration: 300
};

// Create store
const assistLayerStore: Writable<AssistState> = writable(initialState);

// Derived stores
export const allActions: Readable<AssistAction[]> = derived(
	assistLayerStore,
	$store => [
		...$store.quickActions,
		...$store.aiActions,
		...$store.navigationActions
	]
);

export const actionsByCategory = derived(
	assistLayerStore,
	$store => ({
		quick: $store.quickActions,
		ai: $store.aiActions,
		navigation: $store.navigationActions
	})
);

// Actions
export const openAssistLayer = (height: number = 40) => {
	assistLayerStore.update(state => ({
		...state,
		isOpen: true,
		sheetHeight: height,
		currentTab: 'actions'
	}));
	
	// On mobile, close context panel when assist layer opens
	if (window.innerWidth < 768) {
		contextPanelStore.closePanel();
	}
};

export const closeAssistLayer = () => {
	assistLayerStore.update(state => ({
		...state,
		isOpen: false,
		isExpanded: false
	}));
};

export const toggleAssistLayer = () => {
	assistLayerStore.update(state => ({
		...state,
		isOpen: !state.isOpen,
		isExpanded: state.isOpen ? false : state.isExpanded
	}));
};

export const expandAssistLayer = () => {
	assistLayerStore.update(state => ({
		...state,
		isExpanded: true,
		sheetHeight: 85
	}));
};

export const collapseAssistLayer = () => {
	assistLayerStore.update(state => ({
		...state,
		isExpanded: false,
		sheetHeight: 40
	}));
};

export const setCurrentTab = (tab: AssistState['currentTab']) => {
	assistLayerStore.update(state => ({
		...state,
		currentTab: tab
	}));
};

export const setSheetHeight = (height: number) => {
	assistLayerStore.update(state => ({
		...state,
		sheetHeight: Math.max(20, Math.min(95, height))
	}));
};

export const addQuickAction = (action: AssistAction) => {
	assistLayerStore.update(state => ({
		...state,
		quickActions: [...state.quickActions, action]
	}));
};

export const removeQuickAction = (actionId: string) => {
	assistLayerStore.update(state => ({
		...state,
		quickActions: state.quickActions.filter(action => action.id !== actionId)
	}));
};

export const updateVoiceTranscript = (transcript: string) => {
	assistLayerStore.update(state => ({
		...state,
		voiceTranscript: transcript
	}));
};

export const setListening = (listening: boolean) => {
	assistLayerStore.update(state => ({
		...state,
		isListening: listening
	}));
};

export const executeAction = async (actionId: string) => {
	let actionToExecute: AssistAction | undefined;
	
	assistLayerStore.update(state => {
		const allActions = [...state.quickActions, ...state.aiActions, ...state.navigationActions];
		actionToExecute = allActions.find(action => action.id === actionId);
		return state;
	});
	
	if (actionToExecute && !actionToExecute.disabled) {
		if (actionToExecute.requiresConfirmation) {
			const confirmed = confirm(`Execute "${actionToExecute.title}"?`);
			if (!confirmed) return;
		}
		
		try {
			await actionToExecute.action();
			
			// Auto-close on mobile after action execution
			if (window.innerWidth < 768) {
				setTimeout(() => closeAssistLayer(), 300);
			}
		} catch (error) {
			console.error('Failed to execute action:', error);
			alert(`Failed to execute "${actionToExecute.title}"`);
		}
	}
};

// Mobile detection helper
export const isMobile = () => window.innerWidth < 768;

// Initialize mobile behavior
if (typeof window !== 'undefined') {
	// Sync with context panel on mobile
	let unsubscribeContextPanel: (() => void) | null = null;
	
	const checkMobile = () => {
		const mobile = isMobile();
		
		if (mobile) {
			// On mobile, assist layer replaces context panel
			if (!unsubscribeContextPanel) {
				unsubscribeContextPanel = contextPanelStore.subscribe(state => {
					if (state.isOpen) {
						openAssistLayer();
					}
				});
			}
		} else {
			// On desktop, clean up subscription
			if (unsubscribeContextPanel) {
				unsubscribeContextPanel();
				unsubscribeContextPanel = null;
			}
		}
	};
	
	checkMobile();
	window.addEventListener('resize', checkMobile);
	
	// Clean up on page unload
	window.addEventListener('beforeunload', () => {
		if (unsubscribeContextPanel) {
			unsubscribeContextPanel();
		}
	});
}

export default assistLayerStore;
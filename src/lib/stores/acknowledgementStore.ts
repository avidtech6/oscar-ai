import { writable } from 'svelte/store';
import { debugStore } from './debugStore';

export interface Acknowledgement {
	id: string;
	message: string;
	type: 'success' | 'info' | 'warning' | 'error';
	duration: number; // milliseconds
	timestamp: number;
}

interface AcknowledgementState {
	acknowledgements: Acknowledgement[];
	isVisible: boolean;
	currentAcknowledgement: Acknowledgement | null;
}

const initialState: AcknowledgementState = {
	acknowledgements: [],
	isVisible: false,
	currentAcknowledgement: null,
};

const { subscribe, set, update } = writable<AcknowledgementState>(initialState);

/**
 * Show an acknowledgement bubble
 */
function showAcknowledgement(
	message: string,
	type: 'success' | 'info' | 'warning' | 'error' = 'success',
	duration: number = 2000
): void {
	const id = `ack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	const acknowledgement: Acknowledgement = {
		id,
		message,
		type,
		duration,
		timestamp: Date.now(),
	};

	debugStore.log('AcknowledgementStore', 'showAcknowledgement', { message, type, duration });

	// Add to queue
	update(state => ({
		...state,
		acknowledgements: [...state.acknowledgements, acknowledgement],
	}));

	// If no acknowledgement is currently visible, show this one
	update(state => {
		if (!state.isVisible) {
			return {
				...state,
				isVisible: true,
				currentAcknowledgement: acknowledgement,
			};
		}
		return state;
	});

	// Auto-dismiss after duration
	setTimeout(() => {
		dismissAcknowledgement(id);
	}, duration);
}

/**
 * Dismiss a specific acknowledgement
 */
function dismissAcknowledgement(id: string): void {
	debugStore.log('AcknowledgementStore', 'dismissAcknowledgement', { id });

	update(state => {
		// Remove the acknowledgement from the queue
		const filteredAcks = state.acknowledgements.filter(ack => ack.id !== id);
		
		// If the dismissed acknowledgement is the current one, show the next one
		if (state.currentAcknowledgement?.id === id) {
			const nextAck = filteredAcks.length > 0 ? filteredAcks[0] : null;
			return {
				...state,
				acknowledgements: filteredAcks,
				isVisible: nextAck !== null,
				currentAcknowledgement: nextAck,
			};
		}
		
		return {
			...state,
			acknowledgements: filteredAcks,
		};
	});
}

/**
 * Dismiss the current acknowledgement
 */
function dismissCurrent(): void {
	update(state => {
		if (state.currentAcknowledgement) {
			const filteredAcks = state.acknowledgements.filter(ack => ack.id !== state.currentAcknowledgement?.id);
			const nextAck = filteredAcks.length > 0 ? filteredAcks[0] : null;
			return {
				...state,
				acknowledgements: filteredAcks,
				isVisible: nextAck !== null,
				currentAcknowledgement: nextAck,
			};
		}
		return state;
	});
}

/**
 * Clear all acknowledgements
 */
function clearAll(): void {
	debugStore.log('AcknowledgementStore', 'clearAll');
	set(initialState);
}

/**
 * Helper functions for common acknowledgement types
 */
function showSuccess(message: string, duration?: number): void {
	showAcknowledgement(message, 'success', duration);
}

function showInfo(message: string, duration?: number): void {
	showAcknowledgement(message, 'info', duration);
}

function showWarning(message: string, duration?: number): void {
	showAcknowledgement(message, 'warning', duration);
}

function showError(message: string, duration?: number): void {
	showAcknowledgement(message, 'error', duration);
}

/**
 * Intelligence layer integration - show acknowledgement for intent classification
 */
function showIntentAcknowledgement(
	intentType: string,
	confidence: number,
	message?: string
): void {
	const defaultMessages: Record<string, string> = {
		'smalltalk': 'Hello! How can I help you today?',
		'media_action': 'Ready to handle your media request.',
		'task_action': 'Processing your task...',
		'note_action': 'Creating your note...',
		'command_action': 'Executing your command...',
		'query_action': 'Searching for information...',
		'navigation_action': 'Navigating...',
		'ambiguous': 'Let me clarify what you mean...',
	};

	const ackMessage = message || defaultMessages[intentType] || `Processing your ${intentType} request...`;
	
	// Determine type based on confidence
	let type: 'success' | 'info' | 'warning' | 'error' = 'info';
	if (confidence > 80) type = 'success';
	else if (confidence < 50) type = 'warning';
	
	showAcknowledgement(ackMessage, type, 1500);
}

export const acknowledgementStore = {
	subscribe,
	showAcknowledgement,
	showSuccess,
	showInfo,
	showWarning,
	showError,
	showIntentAcknowledgement,
	dismissAcknowledgement,
	dismissCurrent,
	clearAll,
};
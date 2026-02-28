/**
 * Context Panel Store
 * 
 * Manages state for the Context Panel component.
 * Handles panel visibility, hints, and context-aware content.
 */

import { writable, derived, type Writable } from 'svelte/store';

export interface ContextHint {
	id: string;
	title: string;
	description: string;
	icon?: string;
	action: {
		type: 'fill_copilot' | 'navigate' | 'external_link';
		payload: string;
	};
	context: string[]; // Screen contexts where this hint is relevant
	priority: 'low' | 'medium' | 'high';
	seen: boolean;
	actionable?: boolean;
	timestamp?: number;
	actionLabel?: string;
	source?: string;
}

export interface ContextPanelState {
	isOpen: boolean;
	isMobile: boolean;
	currentContext: string; // Current screen/feature context
	hints: ContextHint[];
	hasNewHints: boolean;
	panelWidth: number; // in pixels
	animationDuration: number; // in milliseconds
}

// Default state
const defaultState: ContextPanelState = {
	isOpen: false,
	isMobile: false,
	currentContext: 'global',
	hints: [],
	hasNewHints: false,
	panelWidth: 320,
	animationDuration: 300
};

// Create writable store
const { subscribe, set, update }: Writable<ContextPanelState> = writable(defaultState);

// Context-aware hint sets
const contextHintSets: Record<string, ContextHint[]> = {
	global: [
		{
			id: 'hint-global-1',
			title: 'Getting Started',
			description: 'Learn how to use Oscar AI effectively',
			icon: 'help-circle',
			action: {
				type: 'fill_copilot',
				payload: 'How do I get started with Oscar AI?'
			},
			context: ['global'],
			priority: 'high',
			seen: false
		},
		{
			id: 'hint-global-2',
			title: 'Keyboard Shortcuts',
			description: 'View all available keyboard shortcuts',
			icon: 'command',
			action: {
				type: 'external_link',
				payload: '/docs/shortcuts'
			},
			context: ['global'],
			priority: 'medium',
			seen: false
		}
	],
	email_settings: [
		{
			id: 'hint-email-1',
			title: 'Email Setup Guide',
			description: 'Step-by-step guide to setting up your email',
			icon: 'mail',
			action: {
				type: 'fill_copilot',
				payload: 'Help me set up my email account'
			},
			context: ['email_settings'],
			priority: 'high',
			seen: false
		},
		{
			id: 'hint-email-2',
			title: 'App Passwords',
			description: 'Learn about app passwords for Gmail, iCloud, etc.',
			icon: 'key',
			action: {
				type: 'fill_copilot',
				payload: 'What are app passwords and how do I create one?'
			},
			context: ['email_settings'],
			priority: 'medium',
			seen: false
		},
		{
			id: 'hint-email-3',
			title: 'Provider Detection',
			description: 'Let Oscar detect your email provider automatically',
			icon: 'search',
			action: {
				type: 'fill_copilot',
				payload: 'Detect my email provider settings'
			},
			context: ['email_settings'],
			priority: 'medium',
			seen: false
		}
	],
	campaign_builder: [
		{
			id: 'hint-campaign-1',
			title: 'Deliverability Tips',
			description: 'Improve email deliverability with best practices',
			icon: 'trending-up',
			action: {
				type: 'fill_copilot',
				payload: 'How can I improve my email deliverability?'
			},
			context: ['campaign_builder'],
			priority: 'high',
			seen: false
		},
		{
			id: 'hint-campaign-2',
			title: 'Spam Trigger Check',
			description: 'Check your email for common spam triggers',
			icon: 'alert-triangle',
			action: {
				type: 'fill_copilot',
				payload: 'Check my email for spam triggers'
			},
			context: ['campaign_builder'],
			priority: 'medium',
			seen: false
		},
		{
			id: 'hint-campaign-3',
			title: 'Free Tier Limits',
			description: 'Understand free tier sending limits',
			icon: 'bar-chart',
			action: {
				type: 'fill_copilot',
				payload: 'What are the free tier limits for email providers?'
			},
			context: ['campaign_builder'],
			priority: 'low',
			seen: false
		}
	],
	learn_my_style: [
		{
			id: 'hint-style-1',
			title: 'Writing Samples',
			description: 'Share writing samples to teach Oscar your style',
			icon: 'edit',
			action: {
				type: 'fill_copilot',
				payload: 'How do I share writing samples with Oscar?'
			},
			context: ['learn_my_style'],
			priority: 'high',
			seen: false
		},
		{
			id: 'hint-style-2',
			title: 'Style Analysis',
			description: 'Analyze your writing style for better AI assistance',
			icon: 'brain',
			action: {
				type: 'fill_copilot',
				payload: 'Analyze my writing style'
			},
			context: ['learn_my_style'],
			priority: 'medium',
			seen: false
		}
	],
	reports: [
		{
			id: 'hint-reports-1',
			title: 'Share Email to Include',
			description: 'Share relevant emails to include in your report',
			icon: 'share',
			action: {
				type: 'fill_copilot',
				payload: 'Share an email to include in my report'
			},
			context: ['reports'],
			priority: 'high',
			seen: false
		},
		{
			id: 'hint-reports-2',
			title: 'Report Templates',
			description: 'Browse available report templates',
			icon: 'file-text',
			action: {
				type: 'external_link',
				payload: '/templates/reports'
			},
			context: ['reports'],
			priority: 'medium',
			seen: false
		}
	]
};

// Create filtered hints derived store
export const filteredHints = derived(
	{ subscribe },
	($state) => {
		return $state.hints
			.filter((hint: ContextHint) => hint.context.includes($state.currentContext))
			.sort((a: ContextHint, b: ContextHint) => {
				// Sort by priority (high first) then by whether seen (unseen first)
				const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
				const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
				if (priorityDiff !== 0) return priorityDiff;
				return a.seen === b.seen ? 0 : a.seen ? 1 : -1;
			});
	}
);

// Store API
export const contextPanelStore = {
	subscribe,
	
	// Open/close panel
	openPanel: () => update(state => ({ ...state, isOpen: true })),
	closePanel: () => update(state => ({ ...state, isOpen: false })),
	togglePanel: () => update(state => ({ ...state, isOpen: !state.isOpen })),
	
	// Set mobile state
	setMobile: (isMobile: boolean) => update(state => ({ ...state, isMobile })),
	
	// Set current context and update hints
	setContext: (context: string) => {
		update(state => {
			const hints = contextHintSets[context] || contextHintSets.global;
			const hasNewHints = hints.some(hint => !hint.seen);
			
			return {
				...state,
				currentContext: context,
				hints,
				hasNewHints
			};
		});
	},
	
	// Mark hint as seen
	markHintAsSeen: (hintId: string) => {
		update(state => {
			const hints = state.hints.map(hint =>
				hint.id === hintId ? { ...hint, seen: true } : hint
			);
			const hasNewHints = hints.some(hint => !hint.seen);
			
			return {
				...state,
				hints,
				hasNewHints
			};
		});
	},
	
	// Mark all hints as seen
	markAllHintsAsSeen: () => {
		update(state => ({
			...state,
			hints: state.hints.map(hint => ({ ...hint, seen: true })),
			hasNewHints: false
		}));
	},
	
	// Add a custom hint
	addHint: (hint: Omit<ContextHint, 'seen'>) => {
		update(state => {
			const newHint = { ...hint, seen: false };
			const hints = [...state.hints, newHint];
			const hasNewHints = true; // New hint is always unseen
			
			return {
				...state,
				hints,
				hasNewHints
			};
		});
	},
	
	// Remove a hint
	removeHint: (hintId: string) => {
		update(state => ({
			...state,
			hints: state.hints.filter(hint => hint.id !== hintId)
		}));
	},
	
	// Reset to default
	reset: () => set(defaultState)
};

// Initialize with global hints
contextPanelStore.setContext('global');

// Export helper functions
export function getContextDisplayName(context: string): string {
	const displayNames: Record<string, string> = {
		global: 'General',
		email_settings: 'Email Settings',
		campaign_builder: 'Campaign Builder',
		learn_my_style: 'Learn My Style',
		reports: 'Reports',
		communication: 'Communication Hub',
		projects: 'Projects',
		notes: 'Notes'
	};
	
	return displayNames[context] || context.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function executeHintAction(hint: ContextHint): void {
	switch (hint.action.type) {
		case 'fill_copilot':
			// This would dispatch an event to fill the copilot input
			window.dispatchEvent(new CustomEvent('fill-copilot-input', {
				detail: { text: hint.action.payload }
			}));
			break;
			
		case 'navigate':
			// This would navigate to a different screen
			window.dispatchEvent(new CustomEvent('navigate-to', {
				detail: { route: hint.action.payload }
			}));
			break;
			
		case 'external_link':
			// Open external link
			window.open(hint.action.payload, '_blank');
			break;
	}
	
	// Mark hint as seen after action
	contextPanelStore.markHintAsSeen(hint.id);
}
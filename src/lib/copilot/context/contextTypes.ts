/**
 * Copilot Context Types
 *
 * Defines the context-aware tracking system for the Communication Hub.
 * Tracks user's current screen, UI state, and provides selectors for AI intelligence.
 */

import type { Project, Note, Report, Task } from '$lib/db';

export type ScreenType =
	| 'inbox'
	| 'message-view'
	| 'compose'
	| 'settings'
	| 'provider-setup'
	| 'campaign-builder'
	| 'reports'
	| 'learn-my-style'
	| 'smart-share'
	| 'dashboard'
	| 'unknown';

export interface UIContext {
	/** Current screen the user is viewing */
	currentScreen: ScreenType;
	
	/** Whether the context panel is open */
	contextPanelOpen: boolean;
	
	/** Whether the assist layer is open (mobile) */
	assistLayerOpen: boolean;
	
	/** Whether Smart Share is currently active */
	smartShareActive: boolean;
	
	/** ID of the currently selected email (if any) */
	selectedEmailId?: string;
	
	/** Current provider setup progress (0-100) */
	providerSetupProgress?: number;
	
	/** Current provider being set up */
	currentProviderId?: string;
	
	/** Whether the user is in compose mode */
	isComposing: boolean;
	
	/** Whether the user is viewing a campaign */
	isViewingCampaign: boolean;
	
	/** Whether deliverability warnings are visible */
	deliverabilityWarningsVisible: boolean;
	
	/** Timestamp of last context update */
	lastUpdated: Date;
}

export interface ProviderContext {
	/** Current provider ID */
	providerId?: string;
	
	/** Provider configuration status */
	configStatus: 'not-started' | 'in-progress' | 'complete' | 'error';
	
	/** Validation errors (if any) */
	validationErrors: string[];
	
	/** Validation warnings (if any) */
	validationWarnings: string[];
	
	/** Whether app password is required */
	requiresAppPassword: boolean;
	
	/** Whether provider is in free tier */
	isFreeTier: boolean;
	
	/** Whether provider requires sandbox mode */
	requiresSandbox: boolean;
	
	/** Whether provider is considered unsafe */
	isUnsafeProvider: boolean;
}

export interface DeliverabilityContext {
	/** Current spam score (0-100) */
	spamScore: number;
	
	/** Whether DKIM is configured */
	dkimConfigured: boolean;
	
	/** Whether SPF is configured */
	spfConfigured: boolean;
	
	/** Whether DMARC is configured */
	dmarcConfigured: boolean;
	
	/** Image-to-text ratio warning */
	imageTextRatioWarning: boolean;
	
	/** Unsafe sending patterns detected */
	unsafePatterns: string[];
	
	/** Recent deliverability issues */
	recentIssues: Array<{
		messageId: string;
		score: number;
		issues: string[];
		timestamp: Date;
	}>;
}

export interface SmartShareContext {
	/** Whether Smart Share is currently needed */
	isNeeded: boolean;
	
	/** Reason Smart Share is needed */
	neededFor?: 
		| 'provider-setup'
		| 'verification-code'
		| 'api-key'
		| 'dkim-spf-instructions'
		| 'deliverability-diagnostics'
		| 'writing-samples'
		| 'client-messages';
	
	/** What email to look for */
	lookForEmail?: string;
	
	/** How to proceed after sharing */
	nextSteps?: string[];
	
	/** Whether Smart Share has been requested */
	requested: boolean;
	
	/** Whether Smart Share is in progress */
	inProgress: boolean;
	
	/** Result of Smart Share (if completed) */
	result?: {
		success: boolean;
		data?: any;
		error?: string;
	};
}

export interface CopilotContext {
	/** UI context */
	ui: UIContext;
	
	/** Provider context */
	provider?: ProviderContext;
	
	/** Deliverability context */
	deliverability?: DeliverabilityContext;
	
	/** Smart Share context */
	smartShare?: SmartShareContext;
	
	/** Navigation history */
	navigationHistory: ScreenType[];
	
	/** User preferences for hints */
	hintPreferences: {
		showTechnicalHints: boolean;
		showSmartSharePrompts: boolean;
		showDeliverabilityWarnings: boolean;
	};

	/** Current route/path */
	route: string;
	
	/** Currently selected project */
	selectedProject?: Project;
	
	/** Currently selected note */
	selectedNote?: Note;
	
	/** Currently selected report */
	selectedReport?: Report;
	
	/** Currently selected task */
	selectedTask?: Task;
	
	/** Most recent user action */
	recentAction?: string;
	
	/** Whether the assistant is active */
	assistantActive: boolean;
	
	/** Whether the input field is empty */
	inputEmpty: boolean;
	
	/** Whether the user is on a mobile device */
	isMobile: boolean;
}

export type ContextChangeEvent = {
	type: 'screen-change' | 'ui-state-change' | 'provider-change' | 'deliverability-change' | 'smart-share-change';
	oldContext: Partial<CopilotContext>;
	newContext: Partial<CopilotContext>;
	timestamp: Date;
};

export type ContextSelector<T> = (context: CopilotContext) => T;
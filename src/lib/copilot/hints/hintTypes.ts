/**
 * Hint Types
 * 
 * Defines types for dynamic AI hints in the Communication Hub.
 */

import type { CopilotContext } from '../context/contextTypes';

export type HintPriority = 'critical' | 'high' | 'medium' | 'low';

export type HintCategory =
	| 'provider-setup'
	| 'deliverability'
	| 'smart-share'
	| 'compose'
	| 'inbox'
	| 'campaign'
	| 'reports'
	| 'navigation'
	| 'technical'
	| 'general';

export interface Hint {
	/** Unique identifier for the hint */
	id: string;
	
	/** The hint text to display */
	text: string;
	
	/** Priority level */
	priority: HintPriority;
	
	/** Category for grouping hints */
	category: HintCategory;
	
	/** Whether this hint is actionable */
	actionable: boolean;
	
	/** Action to take when hint is clicked (if actionable) */
	action?: {
		type: 'navigate' | 'open-panel' | 'trigger-smart-share' | 'fix-settings' | 'check-deliverability';
		target: string;
		label: string;
	};
	
	/** Context conditions for when this hint should be shown */
	conditions: Array<(context: CopilotContext) => boolean>;
	
	/** Expiration time (in milliseconds) */
	expiresAfter?: number;
	
	/** When this hint was created */
	createdAt: Date;
	
	/** Whether this hint has been dismissed */
	dismissed: boolean;
	
	/** Whether this hint has been acted upon */
	actedUpon: boolean;
}

export interface HintRule {
	/** Rule identifier */
	id: string;
	
	/** Conditions that must be met for the hint to be generated */
	conditions: Array<(context: CopilotContext) => boolean>;
	
	/** Function to generate the hint text */
	generateText: (context: CopilotContext) => string;
	
	/** Priority for generated hints */
	priority: HintPriority;
	
	/** Category for generated hints */
	category: HintCategory;
	
	/** Whether the hint should be actionable */
	makeActionable: boolean;
	
	/** Action to attach (if actionable) */
	actionGenerator?: (context: CopilotContext) => Hint['action'];
	
	/** Maximum times this hint can be shown */
	maxShowCount?: number;
	
	/** Cooldown period between showing same hint (ms) */
	cooldownMs?: number;
}

export interface HintEngineConfig {
	/** Maximum number of hints to show at once */
	maxConcurrentHints: number;
	
	/** Minimum priority to show */
	minPriority: HintPriority;
	
	/** Whether to show technical hints */
	showTechnicalHints: boolean;
	
	/** Whether to show Smart Share prompts */
	showSmartSharePrompts: boolean;
	
	/** Whether to show deliverability warnings */
	showDeliverabilityWarnings: boolean;
	
	/** Default expiration time for hints (ms) */
	defaultExpirationMs: number;
	
	/** Whether to persist hints across sessions */
	persistHints: boolean;
}

export type HintFilter = (hint: Hint) => boolean;

export type HintSorter = (a: Hint, b: Hint) => number;
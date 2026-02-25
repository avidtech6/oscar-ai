/**
 * Hint Registry
 * 
 * Central registry for hint definitions, categories, and metadata.
 * Provides a way to register custom hint rules and manage hint categories.
 */

import type { HintRule, HintCategory, HintPriority } from './hintTypes';

/**
 * Hint category definitions with metadata
 */
export const hintCategories: Record<HintCategory, {
	name: string;
	description: string;
	icon?: string;
	color?: string;
	enabledByDefault: boolean;
}> = {
	'provider-setup': {
		name: 'Provider Setup',
		description: 'Hints related to email provider configuration and setup',
		icon: 'settings',
		color: '#3b82f6', // blue
		enabledByDefault: true
	},
	'deliverability': {
		name: 'Deliverability',
		description: 'Hints about email deliverability, spam scores, and authentication',
		icon: 'shield',
		color: '#ef4444', // red
		enabledByDefault: true
	},
	'smart-share': {
		name: 'Smart Share',
		description: 'Hints about using Smart Share for automated setup assistance',
		icon: 'share',
		color: '#8b5cf6', // purple
		enabledByDefault: true
	},
	'compose': {
		name: 'Compose',
		description: 'Hints for email composition and sending',
		icon: 'edit',
		color: '#10b981', // green
		enabledByDefault: true
	},
	'inbox': {
		name: 'Inbox',
		description: 'Hints for inbox management and organization',
		icon: 'inbox',
		color: '#f59e0b', // amber
		enabledByDefault: true
	},
	'campaign': {
		name: 'Campaign',
		description: 'Hints for email campaign management',
		icon: 'campaign',
		color: '#ec4899', // pink
		enabledByDefault: true
	},
	'reports': {
		name: 'Reports',
		description: 'Hints for email analytics and reporting',
		icon: 'analytics',
		color: '#06b6d4', // cyan
		enabledByDefault: true
	},
	'navigation': {
		name: 'Navigation',
		description: 'Hints for navigating the Communication Hub',
		icon: 'navigation',
		color: '#f97316', // orange
		enabledByDefault: true
	},
	'technical': {
		name: 'Technical',
		description: 'Technical hints about system configuration and advanced features',
		icon: 'code',
		color: '#6b7280', // gray
		enabledByDefault: false
	},
	'general': {
		name: 'General',
		description: 'General hints and navigation assistance',
		icon: 'help',
		color: '#6366f1', // indigo
		enabledByDefault: true
	}
};

/**
 * Default hint rules that can be extended or overridden
 */
export const defaultHintRules: HintRule[] = [
	// Provider setup rules
	{
		id: 'provider-setup-incomplete',
		conditions: [],
		generateText: () => 'Complete your provider setup to start sending emails',
		priority: 'high',
		category: 'provider-setup',
		makeActionable: true,
		actionGenerator: () => ({
			type: 'navigate',
			target: '/settings/providers',
			label: 'Complete Setup'
		})
	},
	{
		id: 'provider-validation-errors',
		conditions: [],
		generateText: () => 'Fix configuration errors',
		priority: 'critical',
		category: 'provider-setup',
		makeActionable: true,
		actionGenerator: () => ({
			type: 'fix-settings',
			target: 'provider',
			label: 'Fix Errors'
		})
	},
	{
		id: 'app-password-required',
		conditions: [],
		generateText: () => 'App password required for secure access',
		priority: 'high',
		category: 'provider-setup',
		makeActionable: true,
		actionGenerator: () => ({
			type: 'trigger-smart-share',
			target: 'verification-code',
			label: 'Get App Password'
		})
	},
	{
		id: 'free-tier-limits',
		conditions: [],
		generateText: () => 'Free tier has sending limits - consider upgrading',
		priority: 'medium',
		category: 'provider-setup',
		makeActionable: false
	},

	// Deliverability rules
	{
		id: 'high-spam-risk',
		conditions: [],
		generateText: () => 'Critical spam risk',
		priority: 'critical',
		category: 'deliverability',
		makeActionable: true,
		actionGenerator: () => ({
			type: 'check-deliverability',
			target: 'spam-score',
			label: 'Check Deliverability'
		})
	},
	{
		id: 'dkim-not-configured',
		conditions: [],
		generateText: () => 'DKIM not configured - affects email authentication',
		priority: 'high',
		category: 'deliverability',
		makeActionable: true,
		actionGenerator: () => ({
			type: 'trigger-smart-share',
			target: 'dkim-spf-instructions',
			label: 'Configure DKIM'
		})
	},
	{
		id: 'spf-not-configured',
		conditions: [],
		generateText: () => 'SPF not configured - email spoofing risk',
		priority: 'high',
		category: 'deliverability',
		makeActionable: true,
		actionGenerator: () => ({
			type: 'trigger-smart-share',
			target: 'dkim-spf-instructions',
			label: 'Configure SPF'
		})
	},

	// Smart Share rules
	{
		id: 'smart-share-needed',
		conditions: [],
		generateText: () => 'Use Smart Share to simplify provider setup',
		priority: 'medium',
		category: 'smart-share',
		makeActionable: true,
		actionGenerator: () => ({
			type: 'trigger-smart-share',
			target: 'general',
			label: 'Use Smart Share'
		})
	},

	// Compose rules
	{
		id: 'compose-check-deliverability',
		conditions: [],
		generateText: () => 'Check deliverability before sending',
		priority: 'medium',
		category: 'compose',
		makeActionable: true,
		actionGenerator: () => ({
			type: 'check-deliverability',
			target: 'compose',
			label: 'Check Now'
		})
	},

	// General rules
	{
		id: 'general-help',
		conditions: [],
		generateText: () => 'Need help? Ask Oscar anything about email',
		priority: 'low',
		category: 'general',
		makeActionable: false,
		maxShowCount: 3,
		cooldownMs: 15 * 60 * 1000 // 15 minutes
	}
];

/**
 * Registry for managing hint rules
 */
export class HintRegistry {
	private registeredRules: Map<string, HintRule> = new Map();
	private categoryRules: Map<HintCategory, Set<string>> = new Map();

	constructor() {
		// Register default rules
		this.registerDefaultRules();
	}

	/**
	 * Register a hint rule
	 */
	registerRule(rule: HintRule): void {
		if (this.registeredRules.has(rule.id)) {
			console.warn(`Hint rule with id "${rule.id}" already registered. Overwriting.`);
		}

		this.registeredRules.set(rule.id, rule);

		// Update category index
		if (!this.categoryRules.has(rule.category)) {
			this.categoryRules.set(rule.category, new Set());
		}
		this.categoryRules.get(rule.category)!.add(rule.id);
	}

	/**
	 * Register multiple hint rules
	 */
	registerRules(rules: HintRule[]): void {
		for (const rule of rules) {
			this.registerRule(rule);
		}
	}

	/**
	 * Unregister a hint rule
	 */
	unregisterRule(ruleId: string): boolean {
		const rule = this.registeredRules.get(ruleId);
		if (!rule) {
			return false;
		}

		// Remove from category index
		const categorySet = this.categoryRules.get(rule.category);
		if (categorySet) {
			categorySet.delete(ruleId);
			if (categorySet.size === 0) {
				this.categoryRules.delete(rule.category);
			}
		}

		return this.registeredRules.delete(ruleId);
	}

	/**
	 * Get a hint rule by ID
	 */
	getRule(ruleId: string): HintRule | undefined {
		return this.registeredRules.get(ruleId);
	}

	/**
	 * Get all hint rules
	 */
	getAllRules(): HintRule[] {
		return Array.from(this.registeredRules.values());
	}

	/**
	 * Get hint rules by category
	 */
	getRulesByCategory(category: HintCategory): HintRule[] {
		const ruleIds = this.categoryRules.get(category);
		if (!ruleIds) {
			return [];
		}

		return Array.from(ruleIds)
			.map(id => this.registeredRules.get(id))
			.filter((rule): rule is HintRule => rule !== undefined);
	}

	/**
	 * Get hint rules by priority
	 */
	getRulesByPriority(priority: HintPriority): HintRule[] {
		return this.getAllRules().filter(rule => rule.priority === priority);
	}

	/**
	 * Get enabled categories
	 */
	getEnabledCategories(): HintCategory[] {
		return Array.from(this.categoryRules.keys());
	}

	/**
	 * Check if a category has any rules
	 */
	hasCategoryRules(category: HintCategory): boolean {
		const ruleIds = this.categoryRules.get(category);
		return !!ruleIds && ruleIds.size > 0;
	}

	/**
	 * Clear all registered rules
	 */
	clear(): void {
		this.registeredRules.clear();
		this.categoryRules.clear();
	}

	/**
	 * Register default hint rules
	 */
	private registerDefaultRules(): void {
		this.registerRules(defaultHintRules);
	}
}

// Export singleton instance
export const hintRegistry = new HintRegistry();

// Export helper functions
export function getHintCategoryInfo(category: HintCategory) {
	return hintCategories[category];
}

export function getAllHintCategories(): HintCategory[] {
	return Object.keys(hintCategories) as HintCategory[];
}

export function isCategoryEnabledByDefault(category: HintCategory): boolean {
	return hintCategories[category]?.enabledByDefault ?? false;
}
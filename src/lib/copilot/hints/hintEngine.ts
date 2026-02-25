/**
 * Hint Engine
 * 
 * Generates dynamic AI hints based on current context for the Communication Hub.
 * Provides hints to Context Panel (desktop) and Assist Layer (mobile).
 */

import type { CopilotContext } from '../context/contextTypes';
import type { Hint, HintRule, HintEngineConfig, HintPriority, HintCategory } from './hintTypes';
import { contextEngine } from '../context/contextEngine';
import * as selectors from '../context/contextSelectors';

// Default configuration
const DEFAULT_CONFIG: HintEngineConfig = {
	maxConcurrentHints: 5,
	minPriority: 'low',
	showTechnicalHints: true,
	showSmartSharePrompts: true,
	showDeliverabilityWarnings: true,
	defaultExpirationMs: 30 * 60 * 1000, // 30 minutes
	persistHints: false
};

class HintEngine {
	private config: HintEngineConfig;
	private activeHints: Map<string, Hint>;
	private hintRules: HintRule[];
	private showCounts: Map<string, number>;
	private lastShowTimes: Map<string, number>;

	constructor(config: Partial<HintEngineConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.activeHints = new Map();
		this.showCounts = new Map();
		this.lastShowTimes = new Map();
		this.hintRules = this.initializeHintRules();
		
		// Listen for context changes
		contextEngine.addListener(() => this.updateHints());
	}

	/**
	 * Initialize hint rules for the Communication Hub
	 */
	private initializeHintRules(): HintRule[] {
		return [
			// Provider setup rules
			{
				id: 'provider-setup-incomplete',
				conditions: [
					(context) => selectors.getCurrentScreen(context) === 'provider-setup',
					(context) => selectors.getProviderConfigStatus(context) === 'in-progress'
				],
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
				conditions: [
					(context) => selectors.getProviderValidationErrors(context).length > 0
				],
				generateText: (context) => {
					const errorCount = selectors.getProviderValidationErrors(context).length;
					return `Fix ${errorCount} configuration error${errorCount > 1 ? 's' : ''}`;
				},
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
				id: 'provider-validation-warnings',
				conditions: [
					(context) => selectors.getProviderValidationWarnings(context).length > 0,
					(context) => selectors.getProviderValidationErrors(context).length === 0
				],
				generateText: (context) => {
					const warningCount = selectors.getProviderValidationWarnings(context).length;
					return `Review ${warningCount} configuration warning${warningCount > 1 ? 's' : ''}`;
				},
				priority: 'medium',
				category: 'provider-setup',
				makeActionable: true,
				actionGenerator: () => ({
					type: 'fix-settings',
					target: 'provider',
					label: 'Review Warnings'
				})
			},
			{
				id: 'app-password-required',
				conditions: [
					(context) => selectors.requiresAppPassword(context),
					(context) => selectors.getProviderConfigStatus(context) === 'in-progress'
				],
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
				conditions: [
					(context) => selectors.isFreeTierProvider(context)
				],
				generateText: () => 'Free tier has sending limits - consider upgrading',
				priority: 'medium',
				category: 'provider-setup',
				makeActionable: false
			},

			// Deliverability rules
			{
				id: 'high-spam-risk',
				conditions: [
					(context) => selectors.getSpamScore(context) > 80
				],
				generateText: (context) => `Critical spam risk: ${selectors.getSpamScore(context)}/100`,
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
				id: 'medium-spam-risk',
				conditions: [
					(context) => selectors.getSpamScore(context) > 70,
					(context) => selectors.getSpamScore(context) <= 80
				],
				generateText: (context) => `High spam risk: ${selectors.getSpamScore(context)}/100`,
				priority: 'high',
				category: 'deliverability',
				makeActionable: true,
				actionGenerator: () => ({
					type: 'check-deliverability',
					target: 'spam-score',
					label: 'Improve Score'
				})
			},
			{
				id: 'dkim-not-configured',
				conditions: [
					(context) => !selectors.isDkimConfigured(context)
				],
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
				conditions: [
					(context) => !selectors.isSpfConfigured(context)
				],
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
			{
				id: 'image-text-ratio-warning',
				conditions: [
					(context) => selectors.hasImageTextRatioWarning(context)
				],
				generateText: () => 'High image-to-text ratio may trigger spam filters',
				priority: 'medium',
				category: 'deliverability',
				makeActionable: false
			},

			// Smart Share rules
			{
				id: 'smart-share-needed',
				conditions: [
					(context) => selectors.needsSmartShareAssistance(context)
				],
				generateText: (context) => {
					const reason = selectors.getSmartShareReason(context);
					switch (reason) {
						case 'provider-setup':
							return 'Use Smart Share to simplify provider setup';
						case 'verification-code':
							return 'Smart Share can extract verification codes from emails';
						case 'api-key':
							return 'Smart Share can find API keys in welcome emails';
						case 'dkim-spf-instructions':
							return 'Smart Share can provide DNS configuration instructions';
						default:
							return 'Smart Share can help with email setup';
					}
				},
				priority: 'medium',
				category: 'smart-share',
				makeActionable: true,
				actionGenerator: (context) => ({
					type: 'trigger-smart-share',
					target: selectors.getSmartShareReason(context) || 'general',
					label: 'Use Smart Share'
				})
			},

			// Compose rules
			{
				id: 'compose-check-deliverability',
				conditions: [
					(context) => selectors.isComposingEmail(context)
				],
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
			{
				id: 'compose-use-templates',
				conditions: [
					(context) => selectors.isComposingEmail(context),
					(context) => selectors.getContextAge(context) > 60000 // After 1 minute of composing
				],
				generateText: () => 'Use templates for common emails',
				priority: 'low',
				category: 'compose',
				makeActionable: false
			},

			// Inbox rules
			{
				id: 'inbox-organize',
				conditions: [
					(context) => selectors.getCurrentScreen(context) === 'inbox'
				],
				generateText: () => 'Organize your inbox with filters and labels',
				priority: 'low',
				category: 'inbox',
				makeActionable: false
			},

			// Campaign rules
			{
				id: 'campaign-deliverability',
				conditions: [
					(context) => selectors.isViewingCampaign(context)
				],
				generateText: () => 'Review campaign deliverability before sending',
				priority: 'high',
				category: 'campaign',
				makeActionable: true,
				actionGenerator: () => ({
					type: 'check-deliverability',
					target: 'campaign',
					label: 'Review'
				})
			},

			// General navigation rules
			{
				id: 'general-help',
				conditions: [
					(context) => selectors.getContextAge(context) > 5 * 60 * 1000, // After 5 minutes
					(context) => selectors.getAssistancePriority(context) === 'none'
				],
				generateText: () => 'Need help? Ask Oscar anything about email',
				priority: 'low',
				category: 'general',
				makeActionable: false,
				maxShowCount: 3,
				cooldownMs: 15 * 60 * 1000 // 15 minutes
			}
		];
	}

	/**
	 * Update hints based on current context
	 */
	updateHints(): void {
		const context = contextEngine.getCurrentContext();
		const newHints: Hint[] = [];

		// Evaluate all hint rules
		for (const rule of this.hintRules) {
			// Check if rule should be shown based on show counts and cooldown
			const showCount = this.showCounts.get(rule.id) || 0;
			const lastShowTime = this.lastShowTimes.get(rule.id) || 0;
			const now = Date.now();

			if (rule.maxShowCount && showCount >= rule.maxShowCount) {
				continue;
			}

			if (rule.cooldownMs && (now - lastShowTime) < rule.cooldownMs) {
				continue;
			}

			// Check all conditions
			const conditionsMet = rule.conditions.every(condition => condition(context));
			if (!conditionsMet) {
				continue;
			}

			// Check configuration filters
			if (rule.category === 'technical' && !this.config.showTechnicalHints) {
				continue;
			}

			if (rule.category === 'smart-share' && !this.config.showSmartSharePrompts) {
				continue;
			}

			if (rule.category === 'deliverability' && !this.config.showDeliverabilityWarnings) {
				continue;
			}

			// Check minimum priority
			const priorityOrder: Record<HintPriority, number> = {
				critical: 4,
				high: 3,
				medium: 2,
				low: 1
			};

			if (priorityOrder[rule.priority] < priorityOrder[this.config.minPriority]) {
				continue;
			}

			// Generate hint
			const hint: Hint = {
				id: `${rule.id}-${now}`,
				text: rule.generateText(context),
				priority: rule.priority,
				category: rule.category,
				actionable: rule.makeActionable,
				action: rule.actionGenerator ? rule.actionGenerator(context) : undefined,
				conditions: rule.conditions,
				expiresAfter: this.config.defaultExpirationMs,
				createdAt: new Date(),
				dismissed: false,
				actedUpon: false
			};

			newHints.push(hint);

			// Update show counts and times
			this.showCounts.set(rule.id, showCount + 1);
			this.lastShowTimes.set(rule.id, now);
		}

		// Merge with existing hints
		this.mergeHints(newHints);
	}

	/**
	 * Merge new hints with existing active hints
	 */
	private mergeHints(newHints: Hint[]): void {
		// Remove expired hints
		const now = Date.now();
		for (const [id, hint] of this.activeHints.entries()) {
			if (hint.expiresAfter && (now - hint.createdAt.getTime()) > hint.expiresAfter) {
				this.activeHints.delete(id);
			}
			if (hint.dismissed) {
				this.activeHints.delete(id);
			}
		}

		// Add new hints (up to max concurrent)
		for (const hint of newHints) {
			if (this.activeHints.size >= this.config.maxConcurrentHints) {
				break;
			}

			// Check if similar hint already exists
			const similarHintExists = Array.from(this.activeHints.values()).some(
				existingHint => existingHint.text === hint.text && existingHint.category === hint.category
			);

			if (!similarHintExists) {
				this.activeHints.set(hint.id, hint);
			}
		}
	}

	/**
	 * Get current hints
	 */
	getCurrentHints(): Hint[] {
		const hints = Array.from(this.activeHints.values());
		
		// Sort by priority (critical first, then high, medium, low)
		const priorityOrder: Record<HintPriority, number> = {
			critical: 4,
			high: 3,
			medium: 2,
			low: 1
		};

		return hints.sort((a, b) => {
			// First by priority
			const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
			if (priorityDiff !== 0) return priorityDiff;
			
			// Then by creation time (newest first)
			return b.createdAt.getTime() - a.createdAt.getTime();
		});
	}

	/**
	 * Get hints for a specific category
	 */
	getHintsByCategory(category: HintCategory): Hint[] {
		return this.getCurrentHints().filter(hint => hint.category === category);
	}

	/**
	 * Get hints by priority
	 */
	getHintsByPriority(priority: HintPriority): Hint[] {
		return this.getCurrentHints().filter(hint => hint.priority === priority);
	}

	/**
	 * Dismiss a hint
	 */
	dismissHint(hintId: string): void {
		const hint = this.activeHints.get(hintId);
		if (hint) {
			hint.dismissed = true;
			this.activeHints.delete(hintId);
		}
	}

	/**
	 * Mark hint as acted upon
	 */
	markHintActedUpon(hintId: string): void {
		const hint = this.activeHints.get(hintId);
		if (hint) {
			hint.actedUpon = true;
			this.activeHints.delete(hintId);
		}
	}

	/**
	 * Clear all hints
	 */
	clearHints(): void {
		this.activeHints.clear();
	}

	/**
	 * Reset hint engine
	 */
	reset(): void {
		this.activeHints.clear();
		this.showCounts.clear();
		this.lastShowTimes.clear();
	}

	/**
	 * Update configuration
	 */
	updateConfig(config: Partial<HintEngineConfig>): void {
		this.config = { ...this.config, ...config };
	}

	/**
	 * Get current configuration
	 */
	getConfig(): HintEngineConfig {
		return { ...this.config };
	}
}

// Export singleton instance
export const hintEngine = new HintEngine();

// Export helper functions for backward compatibility
export function getHintForContext(context: CopilotContext): string {
	// This is a simplified version for backward compatibility
	// In the new system, hints are generated by the hintEngine
	
	const screen = context.ui?.currentScreen || 'unknown';
	
	switch (screen) {
		case 'inbox':
			return 'Check for new messages or organize your inbox';
		case 'compose':
			return 'Check deliverability before sending';
		case 'provider-setup':
			return 'Complete provider setup to start sending emails';
		case 'campaign-builder':
			return 'Review campaign deliverability';
		case 'reports':
			return 'Generate deliverability reports';
		default:
			return 'Ask Oscar anything about email';
	}
}

export function shortenHintForMobile(hint: string): string {
	if (hint.length <= 40) return hint;
	
	// Common patterns to shorten
	const shortenMap: Record<string, string> = {
		'Complete your provider setup to start sending emails': 'Complete provider setup',
		'Fix configuration errors': 'Fix errors',
		'Review configuration warnings': 'Review warnings',
		'App password required for secure access': 'App password needed',
		'Free tier has sending limits - consider upgrading': 'Free tier limits',
		'Critical spam risk: high score': 'Critical spam risk',
		'High spam risk: medium score': 'High spam risk',
		'DKIM not configured - affects email authentication': 'DKIM not configured',
		'SPF not configured - email spoofing risk': 'SPF not configured',
		'High image-to-text ratio may trigger spam filters': 'Image ratio warning',
		'Use Smart Share to simplify provider setup': 'Use Smart Share',
		'Smart Share can extract verification codes from emails': 'Get codes via Smart Share',
		'Smart Share can find API keys in welcome emails': 'Find API keys',
		'Smart Share can provide DNS configuration instructions': 'DNS instructions',
		'Check deliverability before sending': 'Check deliverability',
		'Use templates for common emails': 'Use templates',
		'Organize your inbox with filters and labels': 'Organize inbox',
		'Review campaign deliverability before sending': 'Check campaign',
		'Need help? Ask Oscar anything about email': 'Ask Oscar'
	};
	
	// Check if we have a direct mapping
	if (shortenMap[hint]) {
		return shortenMap[hint];
	}
	
	// Generic shortening: take first 40 characters and add ellipsis
	return hint.substring(0, 37) + '…';
}
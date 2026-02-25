/**
 * Copilot Context Engine
 * 
 * Tracks the user's current screen, UI state, and provides selectors for AI intelligence.
 * Emits events when context changes.
 */

import type {
	CopilotContext,
	UIContext,
	ProviderContext,
	DeliverabilityContext,
	SmartShareContext,
	ScreenType,
	ContextChangeEvent
} from './contextTypes';

// Default context state
const DEFAULT_CONTEXT: CopilotContext = {
	ui: {
		currentScreen: 'dashboard',
		contextPanelOpen: false,
		assistLayerOpen: false,
		smartShareActive: false,
		isComposing: false,
		isViewingCampaign: false,
		deliverabilityWarningsVisible: false,
		lastUpdated: new Date()
	},
	navigationHistory: ['dashboard'],
	hintPreferences: {
		showTechnicalHints: true,
		showSmartSharePrompts: true,
		showDeliverabilityWarnings: true
	}
};

class ContextEngine {
	private context: CopilotContext;
	private listeners: Array<(event: ContextChangeEvent) => void>;
	private screenMapping: Record<string, ScreenType>;

	constructor() {
		this.context = { ...DEFAULT_CONTEXT };
		this.listeners = [];
		
		// Map route patterns to screen types
		this.screenMapping = {
			'/inbox': 'inbox',
			'/email': 'inbox',
			'/message/': 'message-view',
			'/compose': 'compose',
			'/settings': 'settings',
			'/settings/providers': 'provider-setup',
			'/campaigns': 'campaign-builder',
			'/reports': 'reports',
			'/learn': 'learn-my-style',
			'/smart-share': 'smart-share',
			'/dashboard': 'dashboard'
		};
	}

	/**
	 * Update screen based on route
	 */
	updateScreenFromRoute(route: string): void {
		let screen: ScreenType = 'unknown';
		
		// Find matching screen type
		for (const [pattern, screenType] of Object.entries(this.screenMapping)) {
			if (route.includes(pattern)) {
				screen = screenType;
				break;
			}
		}
		
		this.updateUIContext({ currentScreen: screen });
		
		// Update navigation history
		if (screen !== 'unknown' && this.context.navigationHistory[this.context.navigationHistory.length - 1] !== screen) {
			const newHistory = [...this.context.navigationHistory, screen];
			// Keep only last 10 navigation items
			if (newHistory.length > 10) {
				newHistory.shift();
			}
			this.context.navigationHistory = newHistory;
		}
	}

	/**
	 * Update UI context
	 */
	updateUIContext(updates: Partial<UIContext>): void {
		const oldContext = { ...this.context };
		
		this.context.ui = {
			...this.context.ui,
			...updates,
			lastUpdated: new Date()
		};
		
		this.emitChangeEvent('ui-state-change', oldContext, this.context);
	}

	/**
	 * Update provider context
	 */
	updateProviderContext(updates: Partial<ProviderContext>): void {
		const oldContext = { ...this.context };
		
		if (!this.context.provider) {
			this.context.provider = {
				configStatus: 'not-started',
				validationErrors: [],
				validationWarnings: [],
				requiresAppPassword: false,
				isFreeTier: false,
				requiresSandbox: false,
				isUnsafeProvider: false,
				...updates
			};
		} else {
			this.context.provider = {
				...this.context.provider,
				...updates
			};
		}
		
		this.emitChangeEvent('provider-change', oldContext, this.context);
	}

	/**
	 * Update deliverability context
	 */
	updateDeliverabilityContext(updates: Partial<DeliverabilityContext>): void {
		const oldContext = { ...this.context };
		
		if (!this.context.deliverability) {
			this.context.deliverability = {
				spamScore: 0,
				dkimConfigured: false,
				spfConfigured: false,
				dmarcConfigured: false,
				imageTextRatioWarning: false,
				unsafePatterns: [],
				recentIssues: [],
				...updates
			};
		} else {
			this.context.deliverability = {
				...this.context.deliverability,
				...updates
			};
		}
		
		this.emitChangeEvent('deliverability-change', oldContext, this.context);
	}

	/**
	 * Update Smart Share context
	 */
	updateSmartShareContext(updates: Partial<SmartShareContext>): void {
		const oldContext = { ...this.context };
		
		if (!this.context.smartShare) {
			this.context.smartShare = {
				isNeeded: false,
				requested: false,
				inProgress: false,
				...updates
			};
		} else {
			this.context.smartShare = {
				...this.context.smartShare,
				...updates
			};
		}
		
		this.emitChangeEvent('smart-share-change', oldContext, this.context);
	}

	/**
	 * Get current context
	 */
	getCurrentContext(): CopilotContext {
		return { ...this.context };
	}

	/**
	 * Get relevant hints based on current context
	 */
	getRelevantHints(): string[] {
		const hints: string[] = [];
		const { ui, provider, deliverability, smartShare } = this.context;

		// Screen-based hints
		switch (ui.currentScreen) {
			case 'inbox':
				hints.push('Check for new messages');
				hints.push('Organize your inbox');
				hints.push('Set up email filters');
				break;
			case 'compose':
				hints.push('Check deliverability before sending');
				hints.push('Use templates for common emails');
				hints.push('Add attachments if needed');
				break;
			case 'provider-setup':
				hints.push('Verify your provider settings');
				hints.push('Check for app password requirements');
				hints.push('Test connection before saving');
				break;
			case 'campaign-builder':
				hints.push('Review campaign deliverability');
				hints.push('Segment your audience');
				hints.push('Schedule for optimal times');
				break;
			case 'reports':
				hints.push('Generate deliverability reports');
				hints.push('Analyze sending patterns');
				hints.push('Identify improvement areas');
				break;
		}

		// Provider-based hints
		if (provider) {
			if (provider.configStatus === 'in-progress') {
				hints.push('Complete provider setup');
			}
			if (provider.validationErrors.length > 0) {
				hints.push('Fix configuration errors');
			}
			if (provider.validationWarnings.length > 0) {
				hints.push('Review configuration warnings');
			}
			if (provider.requiresAppPassword) {
				hints.push('Set up app password for secure access');
			}
			if (provider.isFreeTier) {
				hints.push('Monitor free tier limits');
			}
			if (provider.isUnsafeProvider) {
				hints.push('Consider switching to a more reliable provider');
			}
		}

		// Deliverability-based hints
		if (deliverability) {
			if (deliverability.spamScore > 70) {
				hints.push('High spam risk - review content');
			}
			if (!deliverability.dkimConfigured) {
				hints.push('Configure DKIM for better deliverability');
			}
			if (!deliverability.spfConfigured) {
				hints.push('Configure SPF to prevent spoofing');
			}
			if (deliverability.imageTextRatioWarning) {
				hints.push('Balance text and images in emails');
			}
			if (deliverability.unsafePatterns.length > 0) {
				hints.push('Review unsafe sending patterns');
			}
		}

		// Smart Share hints
		if (smartShare?.isNeeded && !smartShare.requested) {
			hints.push('Use Smart Share to simplify setup');
		}

		return hints.slice(0, 5); // Return top 5 hints
	}

	/**
	 * Get Smart Share needs based on context
	 */
	getSmartShareNeeds(): Array<{
		reason: string;
		priority: 'high' | 'medium' | 'low';
		description: string;
	}> {
		const needs: Array<{
			reason: string;
			priority: 'high' | 'medium' | 'low';
			description: string;
		}> = [];

		const { ui, provider, deliverability } = this.context;

		// Provider setup needs
		if (ui.currentScreen === 'provider-setup' && provider?.configStatus === 'in-progress') {
			if (provider.validationErrors.length > 0) {
				needs.push({
					reason: 'provider-setup',
					priority: 'high',
					description: 'Smart Share can help fix configuration errors'
				});
			}
			if (provider.requiresAppPassword) {
				needs.push({
					reason: 'verification-code',
					priority: 'medium',
					description: 'Smart Share can extract app passwords from emails'
				});
			}
		}

		// Deliverability needs
		if (deliverability) {
			if (!deliverability.dkimConfigured || !deliverability.spfConfigured) {
				needs.push({
					reason: 'dkim-spf-instructions',
					priority: 'medium',
					description: 'Smart Share can provide DNS configuration instructions'
				});
			}
			if (deliverability.spamScore > 80) {
				needs.push({
					reason: 'deliverability-diagnostics',
					priority: 'high',
					description: 'Smart Share can analyze and fix deliverability issues'
				});
			}
		}

		return needs;
	}

	/**
	 * Get provider warnings
	 */
	getProviderWarnings(): string[] {
		const warnings: string[] = [];
		const { provider } = this.context;

		if (!provider) return warnings;

		if (provider.validationErrors.length > 0) {
			warnings.push(...provider.validationErrors);
		}
		if (provider.validationWarnings.length > 0) {
			warnings.push(...provider.validationWarnings);
		}
		if (provider.isUnsafeProvider) {
			warnings.push('This provider is known for poor deliverability');
		}
		if (provider.isFreeTier) {
			warnings.push('Free tier has sending limits that may affect deliverability');
		}
		if (provider.requiresSandbox) {
			warnings.push('Provider requires sandbox mode - verify recipients before sending');
		}

		return warnings;
	}

	/**
	 * Get deliverability warnings
	 */
	getDeliverabilityWarnings(): string[] {
		const warnings: string[] = [];
		const { deliverability } = this.context;

		if (!deliverability) return warnings;

		if (deliverability.spamScore > 70) {
			warnings.push(`High spam risk score: ${deliverability.spamScore}/100`);
		}
		if (!deliverability.dkimConfigured) {
			warnings.push('DKIM not configured - affects email authentication');
		}
		if (!deliverability.spfConfigured) {
			warnings.push('SPF not configured - email spoofing risk');
		}
		if (!deliverability.dmarcConfigured) {
			warnings.push('DMARC not configured - limited visibility into email delivery');
		}
		if (deliverability.imageTextRatioWarning) {
			warnings.push('High image-to-text ratio may trigger spam filters');
		}
		if (deliverability.unsafePatterns.length > 0) {
			warnings.push('Unsafe sending patterns detected');
		}

		return warnings;
	}

	/**
	 * Add event listener
	 */
	addListener(listener: (event: ContextChangeEvent) => void): () => void {
		this.listeners.push(listener);
		return () => {
			const index = this.listeners.indexOf(listener);
			if (index > -1) {
				this.listeners.splice(index, 1);
			}
		};
	}

	/**
	 * Emit change event
	 */
	private emitChangeEvent(
		type: ContextChangeEvent['type'],
		oldContext: Partial<CopilotContext>,
		newContext: Partial<CopilotContext>
	): void {
		const event: ContextChangeEvent = {
			type,
			oldContext,
			newContext,
			timestamp: new Date()
		};

		// Notify all listeners
		for (const listener of this.listeners) {
			try {
				listener(event);
			} catch (error) {
				console.error('Error in context change listener:', error);
			}
		}
	}

	/**
	 * Reset context to defaults
	 */
	reset(): void {
		const oldContext = { ...this.context };
		this.context = { ...DEFAULT_CONTEXT };
		this.emitChangeEvent('screen-change', oldContext, this.context);
	}
}

// Export singleton instance
export const contextEngine = new ContextEngine();
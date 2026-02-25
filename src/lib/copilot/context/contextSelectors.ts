/**
 * Context Selectors
 * 
 * Pure selector functions for extracting specific information from the copilot context.
 * These selectors are used by the hint engine, action engine, and orchestrator.
 */

import type { CopilotContext, ContextSelector } from './contextTypes';

/**
 * Get current screen type
 */
export const getCurrentScreen: ContextSelector<string> = (context) => {
	return context.ui.currentScreen;
};

/**
 * Check if context panel is open
 */
export const isContextPanelOpen: ContextSelector<boolean> = (context) => {
	return context.ui.contextPanelOpen;
};

/**
 * Check if assist layer is open (mobile)
 */
export const isAssistLayerOpen: ContextSelector<boolean> = (context) => {
	return context.ui.assistLayerOpen;
};

/**
 * Check if Smart Share is active
 */
export const isSmartShareActive: ContextSelector<boolean> = (context) => {
	return context.ui.smartShareActive;
};

/**
 * Check if user is composing an email
 */
export const isComposingEmail: ContextSelector<boolean> = (context) => {
	return context.ui.isComposing;
};

/**
 * Check if user is viewing a campaign
 */
export const isViewingCampaign: ContextSelector<boolean> = (context) => {
	return context.ui.isViewingCampaign;
};

/**
 * Check if deliverability warnings are visible
 */
export const areDeliverabilityWarningsVisible: ContextSelector<boolean> = (context) => {
	return context.ui.deliverabilityWarningsVisible;
};

/**
 * Get selected email ID (if any)
 */
export const getSelectedEmailId: ContextSelector<string | undefined> = (context) => {
	return context.ui.selectedEmailId;
};

/**
 * Get provider setup progress (0-100)
 */
export const getProviderSetupProgress: ContextSelector<number | undefined> = (context) => {
	return context.ui.providerSetupProgress;
};

/**
 * Get current provider ID (if any)
 */
export const getCurrentProviderId: ContextSelector<string | undefined> = (context) => {
	return context.ui.currentProviderId || context.provider?.providerId;
};

/**
 * Get provider configuration status
 */
export const getProviderConfigStatus: ContextSelector<'not-started' | 'in-progress' | 'complete' | 'error' | undefined> = (context) => {
	return context.provider?.configStatus;
};

/**
 * Get provider validation errors
 */
export const getProviderValidationErrors: ContextSelector<string[]> = (context) => {
	return context.provider?.validationErrors || [];
};

/**
 * Get provider validation warnings
 */
export const getProviderValidationWarnings: ContextSelector<string[]> = (context) => {
	return context.provider?.validationWarnings || [];
};

/**
 * Check if provider requires app password
 */
export const requiresAppPassword: ContextSelector<boolean> = (context) => {
	return context.provider?.requiresAppPassword || false;
};

/**
 * Check if provider is in free tier
 */
export const isFreeTierProvider: ContextSelector<boolean> = (context) => {
	return context.provider?.isFreeTier || false;
};

/**
 * Check if provider requires sandbox mode
 */
export const requiresSandboxMode: ContextSelector<boolean> = (context) => {
	return context.provider?.requiresSandbox || false;
};

/**
 * Check if provider is unsafe
 */
export const isUnsafeProvider: ContextSelector<boolean> = (context) => {
	return context.provider?.isUnsafeProvider || false;
};

/**
 * Get current spam score
 */
export const getSpamScore: ContextSelector<number> = (context) => {
	return context.deliverability?.spamScore || 0;
};

/**
 * Check if DKIM is configured
 */
export const isDkimConfigured: ContextSelector<boolean> = (context) => {
	return context.deliverability?.dkimConfigured || false;
};

/**
 * Check if SPF is configured
 */
export const isSpfConfigured: ContextSelector<boolean> = (context) => {
	return context.deliverability?.spfConfigured || false;
};

/**
 * Check if DMARC is configured
 */
export const isDmarcConfigured: ContextSelector<boolean> = (context) => {
	return context.deliverability?.dmarcConfigured || false;
};

/**
 * Check for image-to-text ratio warning
 */
export const hasImageTextRatioWarning: ContextSelector<boolean> = (context) => {
	return context.deliverability?.imageTextRatioWarning || false;
};

/**
 * Get unsafe sending patterns
 */
export const getUnsafePatterns: ContextSelector<string[]> = (context) => {
	return context.deliverability?.unsafePatterns || [];
};

/**
 * Get recent deliverability issues
 */
export const getRecentDeliverabilityIssues: ContextSelector<Array<{
	messageId: string;
	score: number;
	issues: string[];
	timestamp: Date;
}>> = (context) => {
	return context.deliverability?.recentIssues || [];
};

/**
 * Check if Smart Share is needed
 */
export const isSmartShareNeeded: ContextSelector<boolean> = (context) => {
	return context.smartShare?.isNeeded || false;
};

/**
 * Get Smart Share reason
 */
export const getSmartShareReason: ContextSelector<string | undefined> = (context) => {
	return context.smartShare?.neededFor;
};

/**
 * Check if Smart Share has been requested
 */
export const isSmartShareRequested: ContextSelector<boolean> = (context) => {
	return context.smartShare?.requested || false;
};

/**
 * Check if Smart Share is in progress
 */
export const isSmartShareInProgress: ContextSelector<boolean> = (context) => {
	return context.smartShare?.inProgress || false;
};

/**
 * Get Smart Share result
 */
export const getSmartShareResult: ContextSelector<{
	success: boolean;
	data?: any;
	error?: string;
} | undefined> = (context) => {
	return context.smartShare?.result;
};

/**
 * Get navigation history
 */
export const getNavigationHistory: ContextSelector<string[]> = (context) => {
	return context.navigationHistory;
};

/**
 * Get hint preferences
 */
export const getHintPreferences: ContextSelector<{
	showTechnicalHints: boolean;
	showSmartSharePrompts: boolean;
	showDeliverabilityWarnings: boolean;
}> = (context) => {
	return context.hintPreferences;
};

/**
 * Check if technical hints should be shown
 */
export const shouldShowTechnicalHints: ContextSelector<boolean> = (context) => {
	return context.hintPreferences.showTechnicalHints;
};

/**
 * Check if Smart Share prompts should be shown
 */
export const shouldShowSmartSharePrompts: ContextSelector<boolean> = (context) => {
	return context.hintPreferences.showSmartSharePrompts;
};

/**
 * Check if deliverability warnings should be shown
 */
export const shouldShowDeliverabilityWarnings: ContextSelector<boolean> = (context) => {
	return context.hintPreferences.showDeliverabilityWarnings;
};

/**
 * Get context age in milliseconds
 */
export const getContextAge: ContextSelector<number> = (context) => {
	return Date.now() - context.ui.lastUpdated.getTime();
};

/**
 * Check if context is stale (older than 5 minutes)
 */
export const isContextStale: ContextSelector<boolean> = (context) => {
	return getContextAge(context) > 5 * 60 * 1000; // 5 minutes
};

/**
 * Get combined provider issues (errors + warnings)
 */
export const getProviderIssues: ContextSelector<Array<{
	type: 'error' | 'warning';
	message: string;
}>> = (context) => {
	const issues: Array<{ type: 'error' | 'warning'; message: string }> = [];
	
	if (context.provider) {
		issues.push(...context.provider.validationErrors.map(msg => ({ type: 'error' as const, message: msg })));
		issues.push(...context.provider.validationWarnings.map(msg => ({ type: 'warning' as const, message: msg })));
		
		if (context.provider.isUnsafeProvider) {
			issues.push({ type: 'warning' as const, message: 'Provider is known for poor deliverability' });
		}
		if (context.provider.isFreeTier) {
			issues.push({ type: 'warning' as const, message: 'Free tier has sending limits' });
		}
		if (context.provider.requiresSandbox) {
			issues.push({ type: 'warning' as const, message: 'Requires sandbox mode - verify recipients' });
		}
	}
	
	return issues;
};

/**
 * Get combined deliverability issues
 */
export const getDeliverabilityIssues: ContextSelector<Array<{
	type: 'critical' | 'warning' | 'info';
	message: string;
	priority: number;
}>> = (context) => {
	const issues: Array<{ type: 'critical' | 'warning' | 'info'; message: string; priority: number }> = [];
	
	if (context.deliverability) {
		const { deliverability } = context;
		
		if (deliverability.spamScore > 80) {
			issues.push({ type: 'critical', message: `Critical spam risk: ${deliverability.spamScore}/100`, priority: 100 });
		} else if (deliverability.spamScore > 70) {
			issues.push({ type: 'warning', message: `High spam risk: ${deliverability.spamScore}/100`, priority: 80 });
		}
		
		if (!deliverability.dkimConfigured) {
			issues.push({ type: 'warning', message: 'DKIM not configured', priority: 70 });
		}
		if (!deliverability.spfConfigured) {
			issues.push({ type: 'warning', message: 'SPF not configured', priority: 70 });
		}
		if (!deliverability.dmarcConfigured) {
			issues.push({ type: 'info', message: 'DMARC not configured', priority: 50 });
		}
		if (deliverability.imageTextRatioWarning) {
			issues.push({ type: 'warning', message: 'High image-to-text ratio', priority: 60 });
		}
		if (deliverability.unsafePatterns.length > 0) {
			issues.push({ type: 'warning', message: 'Unsafe sending patterns detected', priority: 75 });
		}
	}
	
	// Sort by priority (highest first)
	return issues.sort((a, b) => b.priority - a.priority);
};

/**
 * Check if user needs provider setup assistance
 */
export const needsProviderSetupAssistance: ContextSelector<boolean> = (context) => {
	const screen = getCurrentScreen(context);
	const configStatus = getProviderConfigStatus(context);
	
	return (
		screen === 'provider-setup' &&
		(configStatus === 'not-started' || configStatus === 'in-progress' || configStatus === 'error')
	);
};

/**
 * Check if user needs deliverability assistance
 */
export const needsDeliverabilityAssistance: ContextSelector<boolean> = (context) => {
	const spamScore = getSpamScore(context);
	const hasDkim = isDkimConfigured(context);
	const hasSpf = isSpfConfigured(context);
	
	return spamScore > 70 || !hasDkim || !hasSpf;
};

/**
 * Check if user needs Smart Share assistance
 */
export const needsSmartShareAssistance: ContextSelector<boolean> = (context) => {
	return isSmartShareNeeded(context) && !isSmartShareRequested(context);
};

/**
 * Get overall assistance priority
 */
export const getAssistancePriority: ContextSelector<'critical' | 'high' | 'medium' | 'low' | 'none'> = (context) => {
	const providerIssues = getProviderIssues(context);
	const deliverabilityIssues = getDeliverabilityIssues(context);
	const smartShareNeeded = needsSmartShareAssistance(context);
	
	// Check for critical issues
	const hasCriticalDeliverability = deliverabilityIssues.some(issue => issue.type === 'critical');
	const hasProviderErrors = providerIssues.some(issue => issue.type === 'error');
	
	if (hasCriticalDeliverability || hasProviderErrors) {
		return 'critical';
	}
	
	// Check for high priority issues
	const hasHighPriorityDeliverability = deliverabilityIssues.some(issue => issue.priority >= 70);
	const hasProviderWarnings = providerIssues.some(issue => issue.type === 'warning');
	
	if (hasHighPriorityDeliverability || hasProviderWarnings) {
		return 'high';
	}
	
	// Check for medium priority
	if (smartShareNeeded || deliverabilityIssues.length > 0) {
		return 'medium';
	}
	
	// Check for low priority
	if (needsProviderSetupAssistance(context)) {
		return 'low';
	}
	
	return 'none';
};
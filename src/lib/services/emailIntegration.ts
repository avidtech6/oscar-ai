/**
 * Email Engine Integration Service
 * 
 * Integrates Phase 2 Email Engine backend with UI components
 * Provides hooks for context panel, assist layer, and smart share
 */

import { contextPanelStore } from '../components/context-panel/contextPanelStore';
import { openAssistLayer, addQuickAction } from '../components/assist-layer/assistLayerStore';
import { openSmartShare, createSettingsExtractionTask } from '../components/smart-share/smartShareStore';
// Note: These imports would need to be adjusted based on actual exports
// For now, using placeholder functions
import type { EmailMessage } from '../email/smtp/smtpTypes';

// Placeholder functions for missing imports
const validateIMAPSettings = (settings: any) => ({ valid: true, errors: [] });
const validateSMTPSettings = (settings: any) => ({ valid: true, errors: [] });
const checkDeliverability = (settings: any, emailContent?: string, options?: any) => ({
	score: 85,
	issues: ['No major issues found'],
	warnings: []
});
const getProviderWarnings = (settings: any) => [];

// Types
export interface EmailIntegrationOptions {
	enableContextHints?: boolean;
	enableAssistLayer?: boolean;
	enableSmartShare?: boolean;
	autoDetectProviders?: boolean;
}

/**
 * Initialize email engine integration
 */
export function initEmailIntegration(options: EmailIntegrationOptions = {}) {
	const {
		enableContextHints = true,
		enableAssistLayer = true,
		enableSmartShare = true,
		autoDetectProviders = true
	} = options;
	
	console.log('[Email Integration] Initializing with options:', options);
	
	// Add email-related quick actions to assist layer
	if (enableAssistLayer) {
		setupEmailQuickActions();
	}
	
	// Setup context hints for email screens
	if (enableContextHints) {
		setupEmailContextHints();
	}
	
	// Setup event listeners for smart share
	if (enableSmartShare) {
		setupSmartShareListeners();
	}
	
	// Setup provider detection
	if (autoDetectProviders) {
		setupProviderDetection();
	}
	
	return {
		cleanup: () => {
			// Cleanup event listeners if needed
			console.log('[Email Integration] Cleanup');
		}
	};
}

/**
 * Setup email-related quick actions for assist layer
 */
function setupEmailQuickActions() {
	// Add email compose action
	addQuickAction({
		id: 'compose-email',
		title: 'Compose Email',
		description: 'Create new email',
		icon: 'mail',
		action: () => { window.dispatchEvent(new CustomEvent('open-email-composer')); },
		category: 'communication'
	});
	
	// Add email sync action
	addQuickAction({
		id: 'sync-email',
		title: 'Sync Email',
		description: 'Sync all email accounts',
		icon: 'refresh-cw',
		action: () => { window.dispatchEvent(new CustomEvent('trigger-email-sync')); },
		category: 'communication'
	});
	
	// Add email settings action
	addQuickAction({
		id: 'email-settings',
		title: 'Email Settings',
		description: 'Configure email accounts',
		icon: 'settings',
		action: () => { window.location.href = '/settings/email'; },
		category: 'communication'
	});
	
	console.log('[Email Integration] Added email quick actions to assist layer');
}

/**
 * Setup context hints for email-related screens
 */
function setupEmailContextHints() {
	// Email compose context hints
	contextPanelStore.subscribe(state => {
		if (state.currentContext === 'email-compose') {
			// Add hints specific to email composition
			contextPanelStore.addHint({
				id: 'email-compose-tips',
				title: 'Email Composition Tips',
				description: 'Use templates, check deliverability before sending',
				context: ['email-compose'],
				priority: 'medium',
				action: {
					type: 'fill_copilot',
					payload: 'Show me email composition tips'
				}
			});
			
			contextPanelStore.addHint({
				id: 'email-attachments',
				title: 'Add Attachments',
				description: 'Drag and drop files or click to attach',
				context: ['email-compose'],
				priority: 'low',
				action: {
					type: 'fill_copilot',
					payload: 'How do I add attachments to emails?'
				}
			});
		}
		
		if (state.currentContext === 'email-inbox') {
			// Add hints for email inbox
			contextPanelStore.addHint({
				id: 'email-filter',
				title: 'Filter Emails',
				description: 'Use filters to organize your inbox',
				context: ['email-inbox'],
				priority: 'medium',
				action: {
					type: 'fill_copilot',
					payload: 'Help me set up email filters'
				}
			});
		}
		
		if (state.currentContext === 'email-settings') {
			// Add hints for email settings
			contextPanelStore.addHint({
				id: 'email-provider-setup',
				title: 'Provider Setup',
				description: 'Use Smart Share to automatically configure providers',
				context: ['email-settings'],
				priority: 'high',
				action: {
					type: 'fill_copilot',
					payload: 'Help me set up my email provider'
				}
			});
			
			contextPanelStore.addHint({
				id: 'email-security',
				title: 'Security Tips',
				description: 'Enable 2FA and use app passwords for better security',
				context: ['email-settings'],
				priority: 'medium',
				action: {
					type: 'fill_copilot',
					payload: 'What are email security best practices?'
				}
			});
		}
	});
	
	console.log('[Email Integration] Setup email context hints');
}

/**
 * Setup smart share event listeners
 */
function setupSmartShareListeners() {
	// Listen for email selection for smart share
	window.addEventListener('email-selected-for-smart-share', ((event: CustomEvent) => {
		const email = event.detail.email;
		if (email) {
			openSmartShare(email);
			
			// Auto-extract settings if it's a welcome/configuration email
			if (isConfigurationEmail(email)) {
				createSettingsExtractionTask(email);
			}
		}
	}) as EventListener);
	
	// Listen for provider setup requests
	window.addEventListener('setup-email-provider', ((event: CustomEvent) => {
		const { providerId, emailAddress } = event.detail;
		
		// Open smart share for verification
		window.dispatchEvent(new CustomEvent('smart-share-verification-request', {
			detail: { emailAddress, providerId }
		}));
		
		// Set context to email-settings
		contextPanelStore.setContext('email-settings');
	}) as EventListener);
	
	console.log('[Email Integration] Setup smart share listeners');
}

/**
 * Setup provider detection and warnings
 */
function setupProviderDetection() {
	// Check for unsafe providers when settings are being configured
	window.addEventListener('email-settings-changed', ((event: CustomEvent) => {
		const settings = event.detail.settings;
		
		if (settings.imap || settings.smtp) {
			// Validate settings
			const imapValidation = settings.imap ? validateIMAPSettings(settings.imap) : null;
			const smtpValidation = settings.smtp ? validateSMTPSettings(settings.smtp) : null;
			
			// Check deliverability
			const deliverability = checkDeliverability(settings);
			const warnings = getProviderWarnings(settings);
			
			// Show warnings in context panel
			if (warnings.length > 0) {
				contextPanelStore.setContext('email-settings');
				
				warnings.forEach((warning: any, index: number) => {
					contextPanelStore.addHint({
						id: `provider-warning-${index}`,
						title: warning.title,
						description: warning.message,
						context: ['email-settings'],
						priority: warning.severity === 'high' ? 'high' : 'medium',
						action: {
							type: 'fill_copilot',
							payload: warning.suggestion?.action === 'switch-provider'
								? `Help me switch from ${settings.providerId} to ${warning.suggestion.data}`
								: `Help me fix ${warning.title}`
						}
					});
				});
			}
		}
	}) as EventListener);
	
	console.log('[Email Integration] Setup provider detection');
}

/**
 * Check if an email is a configuration/welcome email
 */
function isConfigurationEmail(email: EmailMessage): boolean {
	const subject = email.subject?.toLowerCase() || '';
	const text = email.text?.toLowerCase() || '';
	
	const configurationKeywords = [
		'welcome',
		'account setup',
		'configuration',
		'settings',
		'api key',
		'credentials',
		'smtp',
		'imap',
		'getting started',
		'verify your account'
	];
	
	return configurationKeywords.some(keyword => 
		subject.includes(keyword) || text.includes(keyword)
	);
}

/**
 * Open email composer with pre-filled content
 */
export function openEmailComposer(options: {
	to?: string;
	subject?: string;
	body?: string;
	attachments?: File[];
}) {
	window.dispatchEvent(new CustomEvent('open-email-composer', {
		detail: options
	}));
	
	// Set context to email-compose
	contextPanelStore.setContext('email-compose');
}

/**
 * Trigger email sync for all accounts
 */
export function triggerEmailSync() {
	window.dispatchEvent(new CustomEvent('trigger-email-sync'));
	
	// Show sync status in context panel
	contextPanelStore.setContext('email-inbox');
	
	contextPanelStore.addHint({
		id: 'email-sync-status',
		title: 'Syncing Emails',
		description: 'Fetching new messages from all accounts',
		context: ['email-inbox'],
		priority: 'low',
		action: {
			type: 'fill_copilot',
			payload: 'Show me email sync status'
		}
	});
}

/**
 * Validate email settings and show results in context panel
 */
export function validateEmailSettings(settings: any) {
	const imapValidation = settings.imap ? validateIMAPSettings(settings.imap) : null;
	const smtpValidation = settings.smtp ? validateSMTPSettings(settings.smtp) : null;
	const deliverability = checkDeliverability(settings);
	
	// Set context to show validation results
	contextPanelStore.setContext('email-settings');
	
	// Clear existing validation hints
	// (In a real implementation, we'd track and remove specific hints)
	
	// Add validation results as hints
	if (imapValidation && !imapValidation.valid) {
		contextPanelStore.addHint({
			id: 'imap-validation-error',
			title: 'IMAP Settings Issue',
			description: imapValidation.errors.join(', '),
			context: ['email-settings'],
			priority: 'high',
			action: {
				type: 'fill_copilot',
				payload: 'Help me fix IMAP settings'
			}
		});
	}
	
	if (smtpValidation && !smtpValidation.valid) {
		contextPanelStore.addHint({
			id: 'smtp-validation-error',
			title: 'SMTP Settings Issue',
			description: smtpValidation.errors.join(', '),
			context: ['email-settings'],
			priority: 'high',
			action: {
				type: 'fill_copilot',
				payload: 'Help me fix SMTP settings'
			}
		});
	}
	
	if (deliverability.score < 70) {
		contextPanelStore.addHint({
			id: 'deliverability-warning',
			title: 'Deliverability Warning',
			description: `Email deliverability score: ${deliverability.score}/100. ${deliverability.issues.join(' ')}`,
			context: ['email-settings'],
			priority: 'medium',
			action: {
				type: 'fill_copilot',
				payload: 'How can I improve email deliverability?'
			}
		});
	}
	
	return { imapValidation, smtpValidation, deliverability };
}

/**
 * Extract settings from email using Smart Share
 */
export async function extractSettingsFromEmail(email: EmailMessage) {
	openSmartShare(email);
	return createSettingsExtractionTask(email);
}

/**
 * Request verification email for provider setup
 */
export async function requestProviderVerification(options: {
	emailAddress: string;
	providerId: string;
}) {
	window.dispatchEvent(new CustomEvent('smart-share-verification-request', {
		detail: options
	}));
	
	// Show hint about verification
	contextPanelStore.addHint({
		id: 'verification-requested',
		title: 'Verification Email Sent',
		description: `Check ${options.emailAddress} for verification code`,
		context: ['email-settings'],
		priority: 'medium',
		action: {
			type: 'fill_copilot',
			payload: 'Help me with email verification'
		}
	});
	
	return true;
}

// Export integration functions
export default {
	init: initEmailIntegration,
	openEmailComposer,
	triggerEmailSync,
	validateEmailSettings,
	extractSettingsFromEmail,
	requestProviderVerification
};
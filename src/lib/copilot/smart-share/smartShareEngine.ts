/**
 * Smart Share Engine
 * 
 * Core engine for Smart Share intelligence in the Communication Hub.
 * Provides automated setup assistance for email providers.
 */

import type {
	SmartShareRequest,
	SmartShareExtractionResult,
	SmartShareAssistanceType,
	SmartShareConfig,
	SmartShareStats,
	SmartShareEvent,
	SmartShareEventType
} from './smartShareTypes';
import { smartShareRegistry } from './smartShareRegistry';
import { contextEngine } from '../context/contextEngine';
import * as selectors from '../context/contextSelectors';

// Default configuration
const DEFAULT_CONFIG: SmartShareConfig = {
	enabled: true,
	autoDetect: true,
	autoScanInbox: false,
	maxScanTimeMinutes: 5,
	maxEmailsToScan: 50,
	storeExtractedData: true,
	showExtractionPreview: true,
	requireUserConfirmation: true,
	defaultAssistanceTypes: [
		'provider-setup',
		'verification-code',
		'api-key',
		'app-password'
	],
	excludedProviders: []
};

/**
 * Smart Share Engine
 */
export class SmartShareEngine {
	private config: SmartShareConfig;
	private activeRequests: Map<string, SmartShareRequest> = new Map();
	private requestHistory: SmartShareRequest[] = [];
	private stats: SmartShareStats;
	private eventListeners: Map<SmartShareEventType, Set<(event: SmartShareEvent) => void>> = new Map();

	constructor(config: Partial<SmartShareConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.stats = this.initializeStats();
		
		// Listen for context changes if auto-detection is enabled
		if (this.config.autoDetect) {
			contextEngine.addListener(() => this.autoDetectAssistanceNeeds());
		}
	}

	/**
	 * Initialize statistics
	 */
	private initializeStats(): SmartShareStats {
		return {
			totalRequests: 0,
			successfulRequests: 0,
			failedRequests: 0,
			averageExtractionTimeMs: 0,
			mostCommonAssistanceType: 'general',
			mostSuccessfulProvider: 'Unknown',
			lastRequestAt: new Date(),
			requestsByType: {} as Record<SmartShareAssistanceType, number>,
			successRateByType: {} as Record<SmartShareAssistanceType, number>
		};
	}

	/**
	 * Auto-detect assistance needs based on current context
	 */
	private autoDetectAssistanceNeeds(): void {
		if (!this.config.enabled || !this.config.autoDetect) {
			return;
		}

		const context = contextEngine.getCurrentContext();
		const screen = selectors.getCurrentScreen(context);
		const providerStatus = selectors.getProviderConfigStatus(context);
		const validationErrors = selectors.getProviderValidationErrors(context);
		const needsAppPassword = selectors.requiresAppPassword(context);

		// Detect assistance needs based on context
		const needs: Array<{ type: SmartShareAssistanceType; reason: string }> = [];

		// Provider setup screen
		if (screen === 'provider-setup') {
			if (providerStatus === 'in-progress') {
				needs.push({
					type: 'provider-setup',
					reason: 'User is configuring a provider'
				});
			}

			if (validationErrors.length > 0) {
				needs.push({
					type: 'provider-setup',
					reason: 'Provider has validation errors'
				});
			}

			if (needsAppPassword) {
				needs.push({
					type: 'app-password',
					reason: 'Provider requires app password'
				});
			}
		}

		// Compose screen with deliverability issues
		if (screen === 'compose' && selectors.getSpamScore(context) > 70) {
			needs.push({
				type: 'dkim-spf-instructions',
				reason: 'High spam score detected'
			});
		}

		// Campaign screen
		if (screen === 'campaign-builder') {
			needs.push({
				type: 'provider-setup',
				reason: 'Campaign setup may require provider configuration'
			});
		}

		// Emit events for detected needs
		for (const need of needs) {
			this.emitEvent('assistance-detected', {
				assistanceType: need.type,
				reason: need.reason
			});

			// Create hint for user (integrated with hint engine)
			this.createAssistanceHint(need.type, need.reason);
		}
	}

	/**
	 * Create assistance hint for the user
	 */
	private createAssistanceHint(type: SmartShareAssistanceType, reason: string): void {
		// This would integrate with the hint engine
		// For now, we'll just log it
		console.log(`Smart Share hint: ${type} - ${reason}`);
	}

	/**
	 * Create a new Smart Share request
	 */
	async createRequest(
		assistanceType: SmartShareAssistanceType,
		params: Partial<SmartShareRequest['params']> = {}
	): Promise<SmartShareRequest> {
		if (!this.config.enabled) {
			throw new Error('Smart Share is disabled');
		}

		const requestId = `smart-share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const context = contextEngine.getCurrentContext();
		
		const request: SmartShareRequest = {
			id: requestId,
			assistanceType,
			context: { ...context },
			params: {
				scanInbox: true,
				scanSent: false,
				...params
			},
			status: 'pending',
			progress: 0,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		this.activeRequests.set(requestId, request);
		this.requestHistory.push(request);
		this.stats.totalRequests++;
		this.stats.lastRequestAt = new Date();

		// Update requests by type
		if (!this.stats.requestsByType[assistanceType]) {
			this.stats.requestsByType[assistanceType] = 0;
		}
		this.stats.requestsByType[assistanceType]++;

		this.emitEvent('request-started', { requestId, assistanceType });

		// Start processing the request
		setTimeout(() => this.processRequest(requestId), 100);

		return request;
	}

	/**
	 * Process a Smart Share request
	 */
	private async processRequest(requestId: string): Promise<void> {
		const request = this.activeRequests.get(requestId);
		if (!request) return;

		try {
			// Update status to scanning
			request.status = 'scanning';
			request.progress = 10;
			request.updatedAt = new Date();
			this.emitEvent('scan-started', { requestId });

			// Simulate scanning process
			await this.simulateScanning(request);

			// Update status to extracting
			request.status = 'extracting';
			request.progress = 50;
			request.updatedAt = new Date();
			this.emitEvent('extraction-started', { requestId });

			// Extract data based on assistance type
			const result = await this.extractData(request);

			// Update request with result
			request.status = 'completed';
			request.progress = 100;
			request.result = result;
			request.completedAt = new Date();
			request.updatedAt = new Date();

			this.stats.successfulRequests++;
			this.updateSuccessRate(request.assistanceType, true);

			this.emitEvent('extraction-completed', { requestId, assistanceType: request.assistanceType });
			this.emitEvent('request-completed', { requestId, assistanceType: request.assistanceType });

			// If extraction was successful and user confirmation is not required, apply the result
			if (result.success && !this.config.requireUserConfirmation) {
				await this.applyExtractionResult(requestId, result);
			}

		} catch (error) {
			request.status = 'failed';
			request.error = error instanceof Error ? error.message : 'Unknown error';
			request.updatedAt = new Date();

			this.stats.failedRequests++;
			this.updateSuccessRate(request.assistanceType, false);

			this.emitEvent('request-failed', { 
				requestId, 
				assistanceType: request.assistanceType,
				error: request.error
			});
		} finally {
			// Remove from active requests after a delay
			setTimeout(() => {
				this.activeRequests.delete(requestId);
			}, 5000);
		}
	}

	/**
	 * Simulate scanning process
	 */
	private async simulateScanning(request: SmartShareRequest): Promise<void> {
		// Simulate scanning time based on request type
		const scanTime = this.getScanTimeForType(request.assistanceType);
		
		// Simulate progress updates
		const steps = 5;
		for (let i = 1; i <= steps; i++) {
			await new Promise(resolve => setTimeout(resolve, scanTime / steps));
			request.progress = 10 + (i * 8); // 10% to 50%
			request.updatedAt = new Date();
		}
	}

	/**
	 * Extract data based on assistance type
	 */
	private async extractData(request: SmartShareRequest): Promise<SmartShareExtractionResult> {
		const { assistanceType, params } = request;
		const providerName = params.providerName || this.detectProviderFromContext(request.context);
		
		// Simulate extraction based on type
		switch (assistanceType) {
			case 'verification-code':
				return this.extractVerificationCode(providerName);
			case 'api-key':
				return this.extractApiKey(providerName);
			case 'app-password':
				return this.extractAppPassword(providerName);
			case 'dkim-spf-instructions':
				return this.extractDkimSpfInstructions(providerName);
			case 'dns-configuration':
				return this.extractDnsConfiguration(providerName);
			case 'provider-setup':
				return this.extractProviderSetup(providerName);
			case 'oauth-setup':
				return this.extractOauthSetup(providerName);
			default:
				return this.extractGeneralAssistance(providerName);
		}
	}

	/**
	 * Extract verification code
	 */
	private extractVerificationCode(providerName: string): SmartShareExtractionResult {
		// Simulate finding a verification code
		const code = Math.floor(100000 + Math.random() * 900000).toString();
		
		return {
			type: 'verification-code',
			data: {
				verificationCode: code,
				providerName,
				confidence: 85
			},
			source: 'email',
			timestamp: new Date(),
			success: true
		};
	}

	/**
	 * Extract API key
	 */
	private extractApiKey(providerName: string): SmartShareExtractionResult {
		// Simulate finding an API key
		const apiKey = `sk_${Math.random().toString(36).substr(2, 32)}`;
		
		return {
			type: 'api-key',
			data: {
				apiKey,
				providerName,
				confidence: 75
			},
			source: 'email',
			timestamp: new Date(),
			success: true
		};
	}

	/**
	 * Extract app password
	 */
	private extractAppPassword(providerName: string): SmartShareExtractionResult {
		// Simulate finding an app password
		const appPassword = `app-${Math.random().toString(36).substr(2, 16)}`;
		
		return {
			type: 'app-password',
			data: {
				appPassword,
				providerName,
				confidence: 80
			},
			source: 'email',
			timestamp: new Date(),
			success: true
		};
	}

	/**
	 * Extract DKIM/SPF instructions
	 */
	private extractDkimSpfInstructions(providerName: string): SmartShareExtractionResult {
		return {
			type: 'dkim-spf-instructions',
			data: {
				providerName,
				instructions: [
					`Add TXT record: v=spf1 include:_spf.${providerName.toLowerCase().replace(' ', '')}.com ~all`,
					`Add DKIM record: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...`,
					`Add DMARC record: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`
				],
				confidence: 90
			},
			source: 'document',
			timestamp: new Date(),
			success: true
		};
	}

	/**
	 * Extract DNS configuration
	 */
	private extractDnsConfiguration(providerName: string): SmartShareExtractionResult {
		return {
			type: 'dns-configuration',
			data: {
				providerName,
				dnsRecords: [
					{ type: 'MX', name: '@', value: `mx1.${providerName.toLowerCase().replace(' ', '')}.com`, ttl: 3600 },
					{ type: 'MX', name: '@', value: `mx2.${providerName.toLowerCase().replace(' ', '')}.com`, ttl: 3600 },
					{ type: 'TXT', name: '@', value: 'v=spf1 include:_spf.example.com ~all', ttl: 3600 }
				],
				confidence: 85
			},
			source: 'document',
			timestamp: new Date(),
			success: true
		};
	}

	/**
	 * Extract provider setup
	 */
	private extractProviderSetup(providerName: string): SmartShareExtractionResult {
		return {
			type: 'provider-setup',
			data: {
				providerName,
				imapSettings: {
					host: `imap.${providerName.toLowerCase().replace(' ', '')}.com`,
					port: 993,
					encryption: 'ssl'
				},
				smtpSettings: {
					host: `smtp.${providerName.toLowerCase().replace(' ', '')}.com`,
					port: 465,
					encryption: 'ssl'
				},
				confidence: 95
			},
			source: 'document',
			timestamp: new Date(),
			success: true
		};
	}

	/**
	 * Extract OAuth setup
	 */
	private extractOauthSetup(providerName: string): SmartShareExtractionResult {
		return {
			type: 'oauth-setup',
			data: {
				providerName,
				instructions: [
					`Go to ${providerName} Developer Console`,
					`Create new OAuth 2.0 credentials`,
					`Add redirect URI: https://yourapp.com/oauth/callback`,
					`Copy Client ID and Client Secret`
				],
				confidence: 80
			},
			source: 'webpage',
			timestamp: new Date(),
			success: true
		};
	}

	/**
	 * Extract general assistance
	 */
	private extractGeneralAssistance(providerName: string): SmartShareExtractionResult {
		return {
			type: 'general',
			data: {
				providerName,
				instructions: [
					`Check ${providerName} documentation for setup instructions`,
					`Contact ${providerName} support if needed`,
					`Verify your domain with ${providerName}`
				],
				confidence: 70
			},
			source: 'manual',
			timestamp: new Date(),
			success: true
		};
	}

	/**
	 * Apply extraction result
	 */
	private async applyExtractionResult(requestId: string, result: SmartShareExtractionResult): Promise<void> {
		// This would integrate with the provider configuration system
		// For now, we'll just log it
		console.log(`Applying Smart Share result for request ${requestId}:`, result);
	}

	/**
	 * Detect provider from context
	 */
	private detectProviderFromContext(context: any): string {
		// Try to detect provider from context
		// Check if there's a provider configured in context
		const providerId = selectors.getCurrentProviderId(context);
		if (providerId) {
			// Extract provider name from ID (simplified)
			if (providerId.includes('gmail')) return 'Gmail';
			if (providerId.includes('outlook')) return 'Outlook';
			if (providerId.includes('icloud')) return 'iCloud';
			if (providerId.includes('yahoo')) return 'Yahoo';
			if (providerId.includes('brevo')) return 'Brevo';
			if (providerId.includes('sendgrid')) return 'SendGrid';
			if (providerId.includes('mailgun')) return 'Mailgun';
			if (providerId.includes('postmark')) return 'Postmark';
			if (providerId.includes('ses')) return 'Amazon SES';
		}

		// Fallback to default
		return 'Gmail';
	}

	/**
	 * Get scan time for assistance type
	 */
	private getScanTimeForType(type: SmartShareAssistanceType): number {
		const times: Record<SmartShareAssistanceType, number> = {
			'verification-code': 2000,
			'api-key': 3000,
			'app-password': 2500,
			'dkim-spf-instructions': 4000,
			'dns-configuration': 5000,
			'provider-setup': 3000,
			'oauth-setup': 3500,
			'general': 1500
		};
		return times[type] || 2000;
	}

	/**
	 * Update success rate for assistance type
	 */
	private updateSuccessRate(type: SmartShareAssistanceType, success: boolean): void {
		if (!this.stats.successRateByType[type]) {
			this.stats.successRateByType[type] = 0;
		}

		// Simple moving average
		const currentRate = this.stats.successRateByType[type];
		const totalRequests = this.stats.requestsByType[type] || 1;
		const newRate = success ?
			(currentRate * (totalRequests - 1) + 100) / totalRequests :
			(currentRate * (totalRequests - 1)) / totalRequests;
		
		this.stats.successRateByType[type] = newRate;
	}

	/**
	 * Emit event to listeners
	 */
	private emitEvent(type: SmartShareEventType, data?: Record<string, any>): void {
		const event: SmartShareEvent = {
			type,
			...data,
			timestamp: new Date()
		};

		const listeners = this.eventListeners.get(type);
		if (listeners) {
			for (const listener of listeners) {
				try {
					listener(event);
				} catch (error) {
					console.error(`Error in Smart Share event listener for ${type}:`, error);
				}
			}
		}

		// Also emit to wildcard listeners
		const wildcardListeners = this.eventListeners.get('*' as SmartShareEventType);
		if (wildcardListeners) {
			for (const listener of wildcardListeners) {
				try {
					listener(event);
				} catch (error) {
					console.error(`Error in Smart Share wildcard event listener:`, error);
				}
			}
		}
	}

	/**
	 * Add event listener
	 */
	addEventListener(type: SmartShareEventType, listener: (event: SmartShareEvent) => void): void {
		if (!this.eventListeners.has(type)) {
			this.eventListeners.set(type, new Set());
		}
		this.eventListeners.get(type)!.add(listener);
	}

	/**
	 * Remove event listener
	 */
	removeEventListener(type: SmartShareEventType, listener: (event: SmartShareEvent) => void): void {
		const listeners = this.eventListeners.get(type);
		if (listeners) {
			listeners.delete(listener);
			if (listeners.size === 0) {
				this.eventListeners.delete(type);
			}
		}
	}

	/**
	 * Get active requests
	 */
	getActiveRequests(): SmartShareRequest[] {
		return Array.from(this.activeRequests.values());
	}

	/**
	 * Get request by ID
	 */
	getRequest(requestId: string): SmartShareRequest | undefined {
		return this.activeRequests.get(requestId) ||
			this.requestHistory.find(req => req.id === requestId);
	}

	/**
	 * Get request history
	 */
	getRequestHistory(): SmartShareRequest[] {
		return [...this.requestHistory];
	}

	/**
	 * Get statistics
	 */
	getStats(): SmartShareStats {
		return { ...this.stats };
	}

	/**
	 * Get configuration
	 */
	getConfig(): SmartShareConfig {
		return { ...this.config };
	}

	/**
	 * Update configuration
	 */
	updateConfig(config: Partial<SmartShareConfig>): void {
		this.config = { ...this.config, ...config };
		
		// Update auto-detection listener if needed
		if (config.autoDetect !== undefined) {
			// In a real implementation, we would add/remove the listener
			// For now, we'll just note the change
			console.log(`Smart Share auto-detection ${config.autoDetect ? 'enabled' : 'disabled'}`);
		}
	}

	/**
	 * Cancel a request
	 */
	cancelRequest(requestId: string): boolean {
		const request = this.activeRequests.get(requestId);
		if (!request) return false;

		request.status = 'cancelled';
		request.updatedAt = new Date();
		this.emitEvent('user-cancelled', { requestId });

		// Remove from active requests
		this.activeRequests.delete(requestId);
		return true;
	}

	/**
	 * Confirm and apply extraction result
	 */
	async confirmAndApplyResult(requestId: string): Promise<boolean> {
		const request = this.getRequest(requestId);
		if (!request || !request.result || !request.result.success) {
			return false;
		}

		try {
			await this.applyExtractionResult(requestId, request.result);
			this.emitEvent('user-confirmed', { requestId });
			return true;
		} catch (error) {
			console.error(`Error applying Smart Share result for ${requestId}:`, error);
			return false;
		}
	}

	/**
	 * Clear request history
	 */
	clearHistory(): void {
		this.requestHistory = [];
	}

	/**
	 * Reset engine
	 */
	reset(): void {
		this.activeRequests.clear();
		this.requestHistory = [];
		this.stats = this.initializeStats();
		this.eventListeners.clear();
	}
}

// Export singleton instance
export const smartShareEngine = new SmartShareEngine();
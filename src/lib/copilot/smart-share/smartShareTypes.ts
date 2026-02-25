/**
 * Smart Share Types
 * 
 * Defines types for Smart Share intelligence in the Communication Hub.
 * Smart Share helps users with automated setup assistance for email providers.
 */

import type { CopilotContext } from '../context/contextTypes';

/**
 * Smart Share assistance types
 */
export type SmartShareAssistanceType =
	| 'provider-setup'
	| 'verification-code'
	| 'api-key'
	| 'dkim-spf-instructions'
	| 'app-password'
	| 'oauth-setup'
	| 'dns-configuration'
	| 'general';

/**
 * Smart Share request status
 */
export type SmartShareRequestStatus =
	| 'idle'
	| 'pending'
	| 'scanning'
	| 'extracting'
	| 'completed'
	| 'failed'
	| 'cancelled';

/**
 * Smart Share extraction result
 */
export interface SmartShareExtractionResult {
	/** Type of assistance */
	type: SmartShareAssistanceType;
	
	/** Extracted data */
	data: {
		/** Verification code (if type is verification-code) */
		verificationCode?: string;
		
		/** API key (if type is api-key) */
		apiKey?: string;
		
		/** App password (if type is app-password) */
		appPassword?: string;
		
		/** Provider name */
		providerName?: string;
		
		/** IMAP/SMTP settings */
		imapSettings?: {
			host: string;
			port: number;
			encryption: 'ssl' | 'tls' | 'starttls' | 'none';
		};
		
		/** SMTP settings */
		smtpSettings?: {
			host: string;
			port: number;
			encryption: 'ssl' | 'tls' | 'starttls' | 'none';
		};
		
		/** DNS records */
		dnsRecords?: Array<{
			type: 'TXT' | 'MX' | 'CNAME' | 'A';
			name: string;
			value: string;
			ttl: number;
		}>;
		
		/** Instructions */
		instructions?: string[];
		
		/** Raw extracted text */
		rawText?: string;
		
		/** Confidence score (0-100) */
		confidence: number;
	};
	
	/** Source of extraction */
	source: 'email' | 'document' | 'webpage' | 'manual' | 'api';
	
	/** Timestamp of extraction */
	timestamp: Date;
	
	/** Whether the extraction was successful */
	success: boolean;
	
	/** Error message if failed */
	error?: string;
}

/**
 * Smart Share request
 */
export interface SmartShareRequest {
	/** Request ID */
	id: string;
	
	/** Type of assistance needed */
	assistanceType: SmartShareAssistanceType;
	
	/** Current context */
	context: CopilotContext;
	
	/** Request parameters */
	params: {
		/** Email address to scan for */
		emailAddress?: string;
		
		/** Provider name */
		providerName?: string;
		
		/** Time range to scan (in hours) */
		timeRangeHours?: number;
		
		/** Specific keywords to look for */
		keywords?: string[];
		
		/** Whether to scan inbox */
		scanInbox: boolean;
		
		/** Whether to scan sent items */
		scanSent: boolean;
		
		/** Whether to scan specific folders */
		folders?: string[];
	};
	
	/** Current status */
	status: SmartShareRequestStatus;
	
	/** Progress (0-100) */
	progress: number;
	
	/** Result of the request */
	result?: SmartShareExtractionResult;
	
	/** Error message if failed */
	error?: string;
	
	/** When the request was created */
	createdAt: Date;
	
	/** When the request was last updated */
	updatedAt: Date;
	
	/** When the request was completed */
	completedAt?: Date;
}

/**
 * Smart Share provider capability
 */
export interface SmartShareProviderCapability {
	/** Provider name */
	providerName: string;
	
	/** Supported assistance types */
	supportedAssistanceTypes: SmartShareAssistanceType[];
	
	/** Whether provider supports email scanning */
	supportsEmailScanning: boolean;
	
	/** Whether provider supports API key extraction */
	supportsApiKeyExtraction: boolean;
	
	/** Whether provider supports verification code extraction */
	supportsVerificationCodeExtraction: boolean;
	
	/** Whether provider supports DNS configuration */
	supportsDnsConfiguration: boolean;
	
	/** Typical email patterns for this provider */
	emailPatterns: string[];
	
	/** Typical sender addresses for this provider */
	senderPatterns: string[];
	
	/** Typical subject patterns for this provider */
	subjectPatterns: string[];
}

/**
 * Smart Share configuration
 */
export interface SmartShareConfig {
	/** Whether Smart Share is enabled */
	enabled: boolean;
	
	/** Whether to auto-detect assistance needs */
	autoDetect: boolean;
	
	/** Whether to auto-scan inbox for setup emails */
	autoScanInbox: boolean;
	
	/** Maximum scan time (in minutes) */
	maxScanTimeMinutes: number;
	
	/** Maximum emails to scan */
	maxEmailsToScan: number;
	
	/** Whether to store extracted data */
	storeExtractedData: boolean;
	
	/** Whether to show extraction preview */
	showExtractionPreview: boolean;
	
	/** Whether to require user confirmation */
	requireUserConfirmation: boolean;
	
	/** Default assistance types to offer */
	defaultAssistanceTypes: SmartShareAssistanceType[];
	
	/** Providers to exclude from scanning */
	excludedProviders: string[];
}

/**
 * Smart Share statistics
 */
export interface SmartShareStats {
	/** Total requests made */
	totalRequests: number;
	
	/** Successful requests */
	successfulRequests: number;
	
	/** Failed requests */
	failedRequests: number;
	
	/** Average extraction time (ms) */
	averageExtractionTimeMs: number;
	
	/** Most common assistance type */
	mostCommonAssistanceType: SmartShareAssistanceType;
	
	/** Most successful provider */
	mostSuccessfulProvider: string;
	
	/** Last request timestamp */
	lastRequestAt: Date;
	
	/** Requests by type */
	requestsByType: Record<SmartShareAssistanceType, number>;
	
	/** Success rate by type */
	successRateByType: Record<SmartShareAssistanceType, number>;
}

/**
 * Smart Share event types
 */
export type SmartShareEventType =
	| 'request-started'
	| 'request-completed'
	| 'request-failed'
	| 'extraction-started'
	| 'extraction-completed'
	| 'scan-started'
	| 'scan-completed'
	| 'assistance-detected'
	| 'user-confirmed'
	| 'user-cancelled';

/**
 * Smart Share event
 */
export interface SmartShareEvent {
	/** Event type */
	type: SmartShareEventType;
	
	/** Request ID (if applicable) */
	requestId?: string;
	
	/** Assistance type (if applicable) */
	assistanceType?: SmartShareAssistanceType;
	
	/** Provider name (if applicable) */
	providerName?: string;
	
	/** Data associated with the event */
	data?: Record<string, any>;
	
	/** Timestamp */
	timestamp: Date;
}
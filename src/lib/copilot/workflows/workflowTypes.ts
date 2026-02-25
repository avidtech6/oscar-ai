/**
 * Workflow Types
 * 
 * Defines the core types for AI-driven workflows and automation in the Communication Hub.
 * Workflows enable multi-step processes with pausing, resuming, and integration with
 * Smart Share, provider intelligence, deliverability intelligence, and document intelligence.
 */

import type { CopilotContext } from '../context/contextTypes';
import type { Hint } from '../hints/hintTypes';
import type { SmartShareEvent } from '../smart-share/smartShareTypes';
import type { DeliverabilityScore } from '../deliverability/deliverabilityEngine';
import type { SurveyData, GeneratedDocument } from '../document/documentIntelligence';
import type { ActionDefinition, ActionResult } from '../actions/actionEngine';

/**
 * Step types supported by the workflow engine
 */
export type StepType =
	| 'ai_action'              // AI-generated step (automatic)
	| 'user_action'            // Requires user interaction
	| 'smart_share'            // Requires Smart Share (verification code, API key, etc.)
	| 'provider_verification'  // Requires provider verification
	| 'deliverability_fix'     // Deliverability repair step
	| 'document_generation'    // Document generation step
	| 'email_send'             // Email sending step
	| 'wait'                   // Wait step (timed or conditional)
	| 'context_check';         // Check context conditions

/**
 * Step status
 */
export type StepStatus =
	| 'pending'      // Step hasn't started yet
	| 'in_progress'  // Step is currently executing
	| 'paused'       // Step is paused (waiting for user/Smart Share)
	| 'completed'    // Step completed successfully
	| 'failed'       // Step failed
	| 'skipped';     // Step was skipped

/**
 * Workflow status
 */
export type WorkflowStatus =
	| 'draft'        // Workflow defined but not started
	| 'active'       // Workflow is currently running
	| 'paused'       // Workflow is paused
	| 'completed'    // Workflow completed successfully
	| 'failed'       // Workflow failed
	| 'cancelled';   // Workflow was cancelled

/**
 * Workflow step definition
 */
export interface WorkflowStep {
	/** Step ID (unique within workflow) */
	id: string;
	
	/** Step type */
	type: StepType;
	
	/** Step title (displayed to user) */
	title: string;
	
	/** Step description (displayed to user) */
	description: string;
	
	/** Step status */
	status: StepStatus;
	
	/** Step configuration (type-specific) */
	config: StepConfig;
	
	/** Step dependencies (step IDs that must complete before this step) */
	dependencies: string[];
	
	/** Step timeout in milliseconds (0 = no timeout) */
	timeout: number;
	
	/** Step retry count (0 = no retry) */
	retryCount: number;
	
	/** Maximum retries allowed */
	maxRetries: number;
	
	/** Step result data (populated when step completes) */
	result?: StepResult;
	
	/** Step error (populated when step fails) */
	error?: StepError;
	
	/** Step start timestamp */
	startedAt?: Date;
	
	/** Step completion timestamp */
	completedAt?: Date;
	
	/** Step metadata */
	metadata: Record<string, any>;
}

/**
 * Step configuration (type-specific)
 */
export type StepConfig =
	| AIStepConfig
	| UserActionStepConfig
	| SmartShareStepConfig
	| ProviderVerificationStepConfig
	| DeliverabilityFixStepConfig
	| DocumentGenerationStepConfig
	| EmailSendStepConfig
	| WaitStepConfig
	| ContextCheckStepConfig;

/**
 * AI action step configuration
 */
export interface AIStepConfig {
	/** Action ID to execute */
	actionId: string;
	
	/** Action parameters */
	params?: Record<string, any>;
	
	/** Expected result type */
	expectedResult?: string;
}

/**
 * User action step configuration
 */
export interface UserActionStepConfig {
	/** Action title (displayed to user) */
	actionTitle: string;
	
	/** Action description (displayed to user) */
	actionDescription: string;
	
	/** Action type (button, form, etc.) */
	actionType: 'button' | 'form' | 'choice' | 'confirmation';
	
	/** Action options (for choice type) */
	options?: Array<{
		label: string;
		value: string;
		description?: string;
	}>;
	
	/** Default value */
	defaultValue?: any;
	
	/** Validation rules */
	validation?: {
		required?: boolean;
		pattern?: string;
		min?: number;
		max?: number;
	};
}

/**
 * Smart Share step configuration
 */
export interface SmartShareStepConfig {
	/** What to look for */
	lookFor: 'verification_code' | 'api_key' | 'dkim_spf_instructions' | 'provider_settings';
	
	/** Expected email subject pattern */
	subjectPattern?: string;
	
	/** Expected sender pattern */
	senderPattern?: string;
	
	/** Extraction pattern (regex) */
	extractionPattern?: string;
	
	/** What to do with extracted data */
	onExtract: 'apply_to_provider' | 'store_in_settings' | 'display_to_user';
	
	/** Timeout for Smart Share (milliseconds) */
	timeoutMs: number;
}

/**
 * Provider verification step configuration
 */
export interface ProviderVerificationStepConfig {
	/** Provider ID */
	providerId: string;
	
	/** Verification type */
	verificationType: 'connection_test' | 'credentials_check' | 'app_password' | 'oauth';
	
	/** Expected result */
	expectedResult: 'connected' | 'authenticated' | 'verified';
	
	/** Retry delay (milliseconds) */
	retryDelayMs: number;
}

/**
 * Deliverability fix step configuration
 */
export interface DeliverabilityFixStepConfig {
	/** Issue to fix */
	issue: 'dkim' | 'spf' | 'dmarc' | 'spam_score' | 'image_ratio' | 'unsafe_patterns';
	
	/** Target score improvement */
	targetScore?: number;
	
	/** Instructions for fixing */
	instructions?: string;
	
	/** Whether to use Smart Share for instructions */
	useSmartShare: boolean;
}

/**
 * Document generation step configuration
 */
export interface DocumentGenerationStepConfig {
	/** Document type */
	documentType: 'report' | 'summary' | 'risk_assessment' | 'client_brief';
	
	/** Source data */
	source: 'survey' | 'email' | 'context' | 'manual';
	
	/** Template ID */
	templateId?: string;
	
	/** Output format */
	outputFormat: 'html' | 'markdown' | 'pdf' | 'docx';
	
	/** Quality level */
	quality: 'draft' | 'review' | 'final';
}

/**
 * Email send step configuration
 */
export interface EmailSendStepConfig {
	/** Email template ID */
	templateId?: string;
	
	/** Recipients */
	to: string[];
	
	/** Subject */
	subject: string;
	
	/** Body source */
	bodySource: 'generated' | 'template' | 'manual';
	
	/** Attachments */
	attachments?: Array<{
		type: 'document' | 'file' | 'image';
		source: 'generated' | 'uploaded';
		reference: string;
	}>;
	
	/** Send options */
	options: {
		checkDeliverability: boolean;
		schedule?: Date;
		priority: 'low' | 'normal' | 'high';
	};
}

/**
 * Wait step configuration
 */
export interface WaitStepConfig {
	/** Wait type */
	waitType: 'time' | 'condition' | 'event';
	
	/** Wait duration (for time type) */
	durationMs?: number;
	
	/** Condition to wait for (for condition type) */
	condition?: {
		contextPath: string;
		operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
		value: any;
	};
	
	/** Event to wait for (for event type) */
	event?: string;
}

/**
 * Context check step configuration
 */
export interface ContextCheckStepConfig {
	/** Context path to check */
	contextPath: string;
	
	/** Expected value */
	expectedValue: any;
	
	/** Operator for comparison */
	operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
	
	/** Action if check fails */
	onFailure: 'retry' | 'skip' | 'fail' | 'branch';
	
	/** Branch to go to if check fails (for branch action) */
	branchToStepId?: string;
}

/**
 * Step result
 */
export interface StepResult {
	/** Result type */
	type: string;
	
	/** Result data */
	data: any;
	
	/** Success flag */
	success: boolean;
	
	/** Result message */
	message?: string;
	
	/** Result metadata */
	metadata: Record<string, any>;
}

/**
 * Step error
 */
export interface StepError {
	/** Error code */
	code: string;
	
	/** Error message */
	message: string;
	
	/** Error details */
	details?: any;
	
	/** Whether error is recoverable */
	recoverable: boolean;
	
	/** Suggested recovery action */
	recoveryAction?: string;
}

/**
 * Workflow definition
 */
export interface WorkflowDefinition {
	/** Workflow ID (unique) */
	id: string;
	
	/** Workflow name */
	name: string;
	
	/** Workflow description */
	description: string;
	
	/** Workflow category */
	category: 'provider' | 'deliverability' | 'document' | 'inbox' | 'email' | 'client' | 'risk';
	
	/** Workflow version */
	version: string;
	
	/** Workflow steps */
	steps: WorkflowStep[];
	
	/** Entry point step ID */
	entryStepId: string;
	
	/** Workflow metadata */
	metadata: Record<string, any>;
	
	/** Required context for workflow to be suggested */
	requiredContext?: Partial<CopilotContext>;
	
	/** Estimated completion time (minutes) */
	estimatedTimeMinutes: number;
	
	/** Priority (1-10, higher = more important) */
	priority: number;
	
	/** Whether workflow can be automated */
	automationLevel: 'manual' | 'semi_auto' | 'full_auto';
}

/**
 * Workflow instance
 */
export interface WorkflowInstance {
	/** Instance ID (unique) */
	id: string;
	
	/** Workflow definition ID */
	workflowId: string;
	
	/** Current step ID */
	currentStepId: string;
	
	/** Workflow status */
	status: WorkflowStatus;
	
	/** Workflow context (snapshot when workflow started) */
	context: CopilotContext;
	
	/** Workflow steps (with instance-specific data) */
	steps: WorkflowStep[];
	
	/** Workflow result */
	result?: WorkflowResult;
	
	/** Workflow error */
	error?: WorkflowError;
	
	/** Workflow start timestamp */
	startedAt: Date;
	
	/** Workflow pause timestamp (if paused) */
	pausedAt?: Date;
	
	/** Workflow completion timestamp (if completed) */
	completedAt?: Date;
	
	/** Workflow metadata */
	metadata: Record<string, any>;
	
	/** User who started the workflow */
	userId?: string;
	
	/** Whether workflow is persistent */
	persistent: boolean;
}

/**
 * Workflow result
 */
export interface WorkflowResult {
	/** Result type */
	type: 'success' | 'partial_success' | 'cancelled';
	
	/** Result data */
	data: any;
	
	/** Result message */
	message: string;
	
	/** Summary of what was accomplished */
	summary: string[];
	
	/** Next steps suggested */
	nextSteps: string[];
	
	/** Generated artifacts (documents, emails, etc.) */
	artifacts: Array<{
		type: string;
		id: string;
		title: string;
		description: string;
	}>;
}

/**
 * Workflow error
 */
export interface WorkflowError {
	/** Error code */
	code: string;
	
	/** Error message */
	message: string;
	
	/** Error step ID */
	stepId?: string;
	
	/** Error details */
	details?: any;
	
	/** Whether error is recoverable */
	recoverable: boolean;
	
	/** Suggested recovery action */
	recoveryAction?: string;
}

/**
 * Workflow event
 */
export interface WorkflowEvent {
	/** Event type */
	type: 'workflow_started' | 'workflow_paused' | 'workflow_resumed' | 'workflow_completed' |
	       'workflow_failed' | 'workflow_cancelled' | 'step_started' | 'step_completed' |
	       'step_failed' | 'step_paused' | 'step_resumed' | 'smart_share_requested' |
	       'user_action_required' | 'context_check_failed';
	
	/** Workflow instance ID */
	workflowInstanceId: string;
	
	/** Step ID (if step event) */
	stepId?: string;
	
	/** Event data */
	data: any;
	
	/** Event timestamp */
	timestamp: Date;
}

/**
 * Workflow context (passed between steps)
 */
export interface WorkflowContext {
	/** Copilot context snapshot */
	copilotContext: CopilotContext;
	
	/** Workflow data (accumulated during execution) */
	data: Record<string, any>;
	
	/** Generated artifacts */
	artifacts: Array<{
		type: string;
		id: string;
		data: any;
	}>;
	
	/** Step results (by step ID) */
	stepResults: Record<string, StepResult>;
	
	/** User inputs (by step ID) */
	userInputs: Record<string, any>;
	
	/** Smart Share results (by step ID) */
	smartShareResults: Record<string, any>;
}
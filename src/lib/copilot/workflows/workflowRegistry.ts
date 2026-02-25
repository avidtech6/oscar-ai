/**
 * Workflow Registry
 * 
 * Registry for predefined AI-driven workflows in the Communication Hub.
 * Contains workflow definitions for provider setup, deliverability repair,
 * document generation, inbox cleanup, and other automation scenarios.
 */

import type {
	WorkflowDefinition,
	WorkflowStep,
	AIStepConfig,
	UserActionStepConfig,
	SmartShareStepConfig,
	ProviderVerificationStepConfig,
	DeliverabilityFixStepConfig,
	DocumentGenerationStepConfig,
	EmailSendStepConfig,
	WaitStepConfig,
	ContextCheckStepConfig
} from './workflowTypes';

import type { CopilotContext } from '../context/contextTypes';

/**
 * Workflow registry
 */
export class WorkflowRegistry {
	private workflows: Map<string, WorkflowDefinition> = new Map();
	
	constructor() {
		this.registerDefaultWorkflows();
	}
	
	/**
	 * Register a workflow definition
	 */
	registerWorkflow(workflow: WorkflowDefinition): void {
		this.workflows.set(workflow.id, workflow);
	}
	
	/**
	 * Get workflow by ID
	 */
	getWorkflow(id: string): WorkflowDefinition | undefined {
		return this.workflows.get(id);
	}
	
	/**
	 * Get all workflows
	 */
	getAllWorkflows(): WorkflowDefinition[] {
		return Array.from(this.workflows.values());
	}
	
	/**
	 * Get workflows matching context
	 */
	getWorkflowsForContext(context: CopilotContext): WorkflowDefinition[] {
		return this.getAllWorkflows().filter(workflow => 
			this.doesContextMatch(workflow, context)
		);
	}
	
	/**
	 * Check if context matches workflow requirements
	 */
	private doesContextMatch(workflow: WorkflowDefinition, context: CopilotContext): boolean {
		if (!workflow.requiredContext) {
			return true;
		}
		
		// For now, use a simple matching approach
		// In a real implementation, this would be more sophisticated
		// checking nested properties and operators
		return true; // Simplified for now
	}
	
	/**
	 * Register default workflows
	 */
	private registerDefaultWorkflows(): void {
		// Provider Setup Workflow
		this.registerWorkflow({
			id: 'provider_setup',
			name: 'Provider Setup',
			description: 'Setup and verify email provider configuration',
			category: 'provider',
			version: '1.0.0',
			steps: [
				{
					id: 'detect_provider',
					type: 'ai_action',
					title: 'Detect Provider',
					description: 'Analyze email domain to detect provider',
					status: 'pending',
					config: {
						actionId: 'detect_email_provider',
						params: {}
					} as AIStepConfig,
					dependencies: [],
					timeout: 30000,
					retryCount: 0,
					maxRetries: 3,
					metadata: {}
				},
				{
					id: 'smart_share_credentials',
					type: 'smart_share',
					title: 'Find Credentials',
					description: 'Use Smart Share to find provider credentials',
					status: 'pending',
					config: {
						lookFor: 'provider_settings',
						subjectPattern: '.*credentials.*',
						onExtract: 'apply_to_provider',
						timeoutMs: 60000
					} as SmartShareStepConfig,
					dependencies: ['detect_provider'],
					timeout: 90000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				},
				{
					id: 'verify_connection',
					type: 'provider_verification',
					title: 'Verify Connection',
					description: 'Test connection to provider',
					status: 'pending',
					config: {
						providerId: 'detected',
						verificationType: 'connection_test',
						expectedResult: 'connected',
						retryDelayMs: 5000
					} as ProviderVerificationStepConfig,
					dependencies: ['smart_share_credentials'],
					timeout: 60000,
					retryCount: 0,
					maxRetries: 3,
					metadata: {}
				},
				{
					id: 'user_confirmation',
					type: 'user_action',
					title: 'Confirm Setup',
					description: 'Confirm provider setup is complete',
					status: 'pending',
					config: {
						actionTitle: 'Confirm Provider Setup',
						actionDescription: 'Please confirm the provider setup is working correctly',
						actionType: 'confirmation',
						defaultValue: true
					} as UserActionStepConfig,
					dependencies: ['verify_connection'],
					timeout: 0,
					retryCount: 0,
					maxRetries: 0,
					metadata: {}
				}
			],
			entryStepId: 'detect_provider',
			metadata: {},
			requiredContext: {},
			estimatedTimeMinutes: 5,
			priority: 8,
			automationLevel: 'semi_auto'
		});
		
		// Deliverability Repair Workflow
		this.registerWorkflow({
			id: 'deliverability_repair',
			name: 'Deliverability Repair',
			description: 'Fix email deliverability issues',
			category: 'deliverability',
			version: '1.0.0',
			steps: [
				{
					id: 'analyze_deliverability',
					type: 'deliverability_fix',
					title: 'Analyze Deliverability',
					description: 'Analyze current deliverability score',
					status: 'pending',
					config: {
						issue: 'spam_score',
						targetScore: 85,
						useSmartShare: true
					} as DeliverabilityFixStepConfig,
					dependencies: [],
					timeout: 30000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				},
				{
					id: 'fix_dkim',
					type: 'deliverability_fix',
					title: 'Fix DKIM',
					description: 'Fix DKIM configuration issues',
					status: 'pending',
					config: {
						issue: 'dkim',
						useSmartShare: true
					} as DeliverabilityFixStepConfig,
					dependencies: ['analyze_deliverability'],
					timeout: 45000,
					retryCount: 0,
					maxRetries: 3,
					metadata: {}
				},
				{
					id: 'fix_spf',
					type: 'deliverability_fix',
					title: 'Fix SPF',
					description: 'Fix SPF configuration issues',
					status: 'pending',
					config: {
						issue: 'spf',
						useSmartShare: true
					} as DeliverabilityFixStepConfig,
					dependencies: ['fix_dkim'],
					timeout: 45000,
					retryCount: 0,
					maxRetries: 3,
					metadata: {}
				},
				{
					id: 'verify_fixes',
					type: 'deliverability_fix',
					title: 'Verify Fixes',
					description: 'Verify deliverability improvements',
					status: 'pending',
					config: {
						issue: 'spam_score',
						targetScore: 90,
						useSmartShare: false
					} as DeliverabilityFixStepConfig,
					dependencies: ['fix_spf'],
					timeout: 30000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				}
			],
			entryStepId: 'analyze_deliverability',
			metadata: {},
			requiredContext: {},
			estimatedTimeMinutes: 10,
			priority: 7,
			automationLevel: 'semi_auto'
		});
		
		// Document Generation Workflow
		this.registerWorkflow({
			id: 'document_generation',
			name: 'Document Generation',
			description: 'Generate professional documents from survey data',
			category: 'document',
			version: '1.0.0',
			steps: [
				{
					id: 'analyze_survey',
					type: 'ai_action',
					title: 'Analyze Survey Data',
					description: 'Analyze survey responses for document generation',
					status: 'pending',
					config: {
						actionId: 'analyze_survey_data',
						params: {}
					} as AIStepConfig,
					dependencies: [],
					timeout: 45000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				},
				{
					id: 'generate_document',
					type: 'document_generation',
					title: 'Generate Document',
					description: 'Generate professional document from analyzed data',
					status: 'pending',
					config: {
						documentType: 'report',
						source: 'survey',
						outputFormat: 'html',
						quality: 'final'
					} as DocumentGenerationStepConfig,
					dependencies: ['analyze_survey'],
					timeout: 60000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				},
				{
					id: 'review_document',
					type: 'user_action',
					title: 'Review Document',
					description: 'Review and approve generated document',
					status: 'pending',
					config: {
						actionTitle: 'Review Document',
						actionDescription: 'Please review the generated document and make any necessary edits',
						actionType: 'form',
						validation: { required: true }
					} as UserActionStepConfig,
					dependencies: ['generate_document'],
					timeout: 0,
					retryCount: 0,
					maxRetries: 0,
					metadata: {}
				},
				{
					id: 'export_document',
					type: 'ai_action',
					title: 'Export Document',
					description: 'Export document to requested format',
					status: 'pending',
					config: {
						actionId: 'export_document',
						params: { format: 'pdf' }
					} as AIStepConfig,
					dependencies: ['review_document'],
					timeout: 30000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				}
			],
			entryStepId: 'analyze_survey',
			metadata: {},
			requiredContext: {},
			estimatedTimeMinutes: 15,
			priority: 6,
			automationLevel: 'semi_auto'
		});
		
		// Inbox Cleanup Workflow
		this.registerWorkflow({
			id: 'inbox_cleanup',
			name: 'Inbox Cleanup',
			description: 'Clean and organize email inbox',
			category: 'inbox',
			version: '1.0.0',
			steps: [
				{
					id: 'analyze_inbox',
					type: 'ai_action',
					title: 'Analyze Inbox',
					description: 'Analyze inbox for organization opportunities',
					status: 'pending',
					config: {
						actionId: 'analyze_inbox',
						params: {}
					} as AIStepConfig,
					dependencies: [],
					timeout: 30000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				},
				{
					id: 'categorize_emails',
					type: 'ai_action',
					title: 'Categorize Emails',
					description: 'Categorize emails by priority and type',
					status: 'pending',
					config: {
						actionId: 'categorize_emails',
						params: {}
					} as AIStepConfig,
					dependencies: ['analyze_inbox'],
					timeout: 45000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				},
				{
					id: 'create_folders',
					type: 'ai_action',
					title: 'Create Folders',
					description: 'Create organized folder structure',
					status: 'pending',
					config: {
						actionId: 'create_email_folders',
						params: {}
					} as AIStepConfig,
					dependencies: ['categorize_emails'],
					timeout: 30000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				},
				{
					id: 'move_emails',
					type: 'ai_action',
					title: 'Move Emails',
					description: 'Move emails to appropriate folders',
					status: 'pending',
					config: {
						actionId: 'move_emails_to_folders',
						params: {}
					} as AIStepConfig,
					dependencies: ['create_folders'],
					timeout: 60000,
					retryCount: 0,
					maxRetries: 3,
					metadata: {}
				},
				{
					id: 'user_confirmation',
					type: 'user_action',
					title: 'Confirm Cleanup',
					description: 'Confirm inbox cleanup is complete',
					status: 'pending',
					config: {
						actionTitle: 'Confirm Inbox Cleanup',
						actionDescription: 'Please review the organized inbox and confirm completion',
						actionType: 'confirmation',
						defaultValue: true
					} as UserActionStepConfig,
					dependencies: ['move_emails'],
					timeout: 0,
					retryCount: 0,
					maxRetries: 0,
					metadata: {}
				}
			],
			entryStepId: 'analyze_inbox',
			metadata: {},
			requiredContext: {},
			estimatedTimeMinutes: 8,
			priority: 5,
			automationLevel: 'semi_auto'
		});
		
		// Email Campaign Workflow
		this.registerWorkflow({
			id: 'email_campaign',
			name: 'Email Campaign',
			description: 'Create and send email campaign',
			category: 'email',
			version: '1.0.0',
			steps: [
				{
					id: 'create_template',
					type: 'ai_action',
					title: 'Create Template',
					description: 'Create email campaign template',
					status: 'pending',
					config: {
						actionId: 'create_email_template',
						params: {}
					} as AIStepConfig,
					dependencies: [],
					timeout: 45000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				},
				{
					id: 'check_deliverability',
					type: 'deliverability_fix',
					title: 'Check Deliverability',
					description: 'Check campaign deliverability',
					status: 'pending',
					config: {
						issue: 'spam_score',
						targetScore: 80,
						useSmartShare: false
					} as DeliverabilityFixStepConfig,
					dependencies: ['create_template'],
					timeout: 30000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				},
				{
					id: 'review_campaign',
					type: 'user_action',
					title: 'Review Campaign',
					description: 'Review and approve campaign',
					status: 'pending',
					config: {
						actionTitle: 'Review Email Campaign',
						actionDescription: 'Please review the campaign content and settings',
						actionType: 'form',
						validation: { required: true }
					} as UserActionStepConfig,
					dependencies: ['check_deliverability'],
					timeout: 0,
					retryCount: 0,
					maxRetries: 0,
					metadata: {}
				},
				{
					id: 'send_campaign',
					type: 'email_send',
					title: 'Send Campaign',
					description: 'Send email campaign to recipients',
					status: 'pending',
					config: {
						to: ['recipients@example.com'],
						subject: 'Campaign Email',
						bodySource: 'generated',
						options: {
							checkDeliverability: true,
							priority: 'normal'
						}
					} as EmailSendStepConfig,
					dependencies: ['review_campaign'],
					timeout: 60000,
					retryCount: 0,
					maxRetries: 3,
					metadata: {}
				}
			],
			entryStepId: 'create_template',
			metadata: {},
			requiredContext: {},
			estimatedTimeMinutes: 12,
			priority: 7,
			automationLevel: 'semi_auto'
		});
		
		// Client Onboarding Workflow
		this.registerWorkflow({
			id: 'client_onboarding',
			name: 'Client Onboarding',
			description: 'Onboard new client with automated setup',
			category: 'client',
			version: '1.0.0',
			steps: [
				{
					id: 'collect_client_info',
					type: 'user_action',
					title: 'Collect Client Information',
					description: 'Collect basic client information for onboarding',
					status: 'pending',
					config: {
						actionTitle: 'Client Information',
						actionDescription: 'Please enter client information',
						actionType: 'form',
						validation: { required: true }
					} as UserActionStepConfig,
					dependencies: [],
					timeout: 0,
					retryCount: 0,
					maxRetries: 0,
					metadata: {}
				},
				{
					id: 'setup_provider',
					type: 'ai_action',
					title: 'Setup Provider',
					description: 'Setup email provider for client',
					status: 'pending',
					config: {
						actionId: 'setup_client_provider',
						params: {}
					} as AIStepConfig,
					dependencies: ['collect_client_info'],
					timeout: 60000,
					retryCount: 0,
					maxRetries: 3,
					metadata: {}
				},
				{
					id: 'generate_welcome_doc',
					type: 'document_generation',
					title: 'Generate Welcome Document',
					description: 'Generate welcome document for client',
					status: 'pending',
					config: {
						documentType: 'client_brief',
						source: 'manual',
						outputFormat: 'pdf',
						quality: 'final'
					} as DocumentGenerationStepConfig,
					dependencies: ['setup_provider'],
					timeout: 45000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				},
				{
					id: 'send_welcome_email',
					type: 'email_send',
					title: 'Send Welcome Email',
					description: 'Send welcome email to client',
					status: 'pending',
					config: {
						to: ['client@example.com'],
						subject: 'Welcome to Our Service',
						bodySource: 'generated',
						options: {
							checkDeliverability: true,
							priority: 'normal'
						}
					} as EmailSendStepConfig,
					dependencies: ['generate_welcome_doc'],
					timeout: 30000,
					retryCount: 0,
					maxRetries: 3,
					metadata: {}
				}
			],
			entryStepId: 'collect_client_info',
			metadata: {},
			requiredContext: {},
			estimatedTimeMinutes: 20,
			priority: 9,
			automationLevel: 'semi_auto'
		});
		
		// Risk Assessment Workflow
		this.registerWorkflow({
			id: 'risk_assessment',
			name: 'Risk Assessment',
			description: 'Assess and mitigate communication risks',
			category: 'risk',
			version: '1.0.0',
			steps: [
				{
					id: 'analyze_risks',
					type: 'ai_action',
					title: 'Analyze Risks',
					description: 'Analyze communication risks',
					status: 'pending',
					config: {
						actionId: 'analyze_communication_risks',
						params: {}
					} as AIStepConfig,
					dependencies: [],
					timeout: 45000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				},
				{
					id: 'generate_report',
					type: 'document_generation',
					title: 'Generate Risk Report',
					description: 'Generate risk assessment report',
					status: 'pending',
					config: {
						documentType: 'risk_assessment',
						source: 'context',
						outputFormat: 'pdf',
						quality: 'final'
					} as DocumentGenerationStepConfig,
					dependencies: ['analyze_risks'],
					timeout: 60000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				},
				{
					id: 'recommend_actions',
					type: 'ai_action',
					title: 'Recommend Actions',
					description: 'Recommend risk mitigation actions',
					status: 'pending',
					config: {
						actionId: 'recommend_risk_actions',
						params: {}
					} as AIStepConfig,
					dependencies: ['generate_report'],
					timeout: 30000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				},
				{
					id: 'user_review',
					type: 'user_action',
					title: 'Review Recommendations',
					description: 'Review and approve risk mitigation recommendations',
					status: 'pending',
					config: {
						actionTitle: 'Review Risk Recommendations',
						actionDescription: 'Please review the risk assessment and recommendations',
						actionType: 'choice',
						options: [
							{ label: 'Approve All', value: 'approve_all' },
							{ label: 'Approve Some', value: 'approve_some' },
							{ label: 'Request Changes', value: 'request_changes' }
						]
					} as UserActionStepConfig,
					dependencies: ['recommend_actions'],
					timeout: 0,
					retryCount: 0,
					maxRetries: 0,
					metadata: {}
				}
			],
			entryStepId: 'analyze_risks',
			metadata: {},
			requiredContext: {},
			estimatedTimeMinutes: 15,
			priority: 8,
			automationLevel: 'semi_auto'
		});
		
		// Smart Share Verification Workflow
		this.registerWorkflow({
			id: 'smart_share_verification',
			name: 'Smart Share Verification',
			description: 'Use Smart Share for verification and setup',
			category: 'provider',
			version: '1.0.0',
			steps: [
				{
					id: 'request_smart_share',
					type: 'smart_share',
					title: 'Request Smart Share',
					description: 'Request Smart Share for verification',
					status: 'pending',
					config: {
						lookFor: 'verification_code',
						subjectPattern: '.*verification.*',
						onExtract: 'apply_to_provider',
						timeoutMs: 120000
					} as SmartShareStepConfig,
					dependencies: [],
					timeout: 150000,
					retryCount: 0,
					maxRetries: 2,
					metadata: {}
				},
				{
					id: 'wait_for_email',
					type: 'wait',
					title: 'Wait for Email',
					description: 'Wait for verification email to arrive',
					status: 'pending',
					config: {
						waitType: 'time',
						durationMs: 30000
					} as WaitStepConfig,
					dependencies: ['request_smart_share'],
					timeout: 120000,
					retryCount: 0,
					maxRetries: 0,
					metadata: {}
				},
				{
					id: 'extract_code',
					type: 'ai_action',
					title: 'Extract Verification Code',
					description: 'Extract verification code from email',
					status: 'pending',
					config: {
						actionId: 'extract_verification_code',
						params: {}
					} as AIStepConfig,
					dependencies: ['wait_for_email'],
					timeout: 30000,
					retryCount: 0,
					maxRetries: 3,
					metadata: {}
				},
				{
					id: 'apply_verification',
					type: 'provider_verification',
					title: 'Apply Verification',
					description: 'Apply verification code to provider',
					status: 'pending',
					config: {
						providerId: 'current',
						verificationType: 'credentials_check',
						expectedResult: 'verified',
						retryDelayMs: 5000
					} as ProviderVerificationStepConfig,
					dependencies: ['extract_code'],
					timeout: 60000,
					retryCount: 0,
					maxRetries: 3,
					metadata: {}
				}
			],
			entryStepId: 'request_smart_share',
			metadata: {},
			requiredContext: {},
			estimatedTimeMinutes: 5,
			priority: 9,
			automationLevel: 'semi_auto'
		});
	}
	
	/**
		* Get workflow categories
		*/
	getCategories(): string[] {
		const categories = new Set<string>();
		for (const workflow of this.workflows.values()) {
			categories.add(workflow.category);
		}
		return Array.from(categories);
	}
	
	/**
		* Get workflows by category
		*/
	getWorkflowsByCategory(category: string): WorkflowDefinition[] {
		return this.getAllWorkflows().filter(workflow => workflow.category === category);
	}
	
	/**
		* Get suggested workflows for current context
		*/
	getSuggestedWorkflows(context: CopilotContext): WorkflowDefinition[] {
		const matchingWorkflows = this.getWorkflowsForContext(context);
		
		// Sort by priority (higher first), then estimated time (lower first)
		return matchingWorkflows.sort((a, b) => {
			if (b.priority !== a.priority) {
				return b.priority - a.priority;
			}
			return a.estimatedTimeMinutes - b.estimatedTimeMinutes;
		});
	}
	
	/**
		* Check if workflow can be automated
		*/
	canAutomateWorkflow(workflowId: string): boolean {
		const workflow = this.getWorkflow(workflowId);
		if (!workflow) return false;
		
		return workflow.automationLevel === 'full_auto' ||
			   workflow.automationLevel === 'semi_auto';
	}
	
	/**
		* Get workflow statistics
		*/
	getStatistics(): {
		totalWorkflows: number;
		byCategory: Record<string, number>;
		automationLevels: Record<string, number>;
		averageTimeMinutes: number;
	} {
		const byCategory: Record<string, number> = {};
		const automationLevels: Record<string, number> = {};
		let totalTime = 0;
		
		for (const workflow of this.workflows.values()) {
			byCategory[workflow.category] = (byCategory[workflow.category] || 0) + 1;
			automationLevels[workflow.automationLevel] = (automationLevels[workflow.automationLevel] || 0) + 1;
			totalTime += workflow.estimatedTimeMinutes;
		}
		
		return {
			totalWorkflows: this.workflows.size,
			byCategory,
			automationLevels,
			averageTimeMinutes: this.workflows.size > 0 ? Math.round(totalTime / this.workflows.size) : 0
		};
	}
}

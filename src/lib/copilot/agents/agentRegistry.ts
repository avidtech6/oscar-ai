/**
 * Agent Registry
 * 
 * Registry of predefined agents for the background intelligence layer.
 * Provides agent factories, configuration templates, and agent discovery.
 */

import type {
	Agent,
	AgentConfig,
	AgentRegistryEntry,
	AgentType,
	AgentTrigger,
	AgentSchedule,
	AgentState,
	AgentResult
} from './agentTypes';

/**
 * Agent factory function
 */
type AgentFactory = (config: AgentConfig) => Promise<Agent>;

/**
 * Agent template
 */
interface AgentTemplate {
	/** Template ID */
	id: string;
	
	/** Template name */
	name: string;
	
	/** Template description */
	description: string;
	
	/** Agent type */
	type: AgentType;
	
	/** Default configuration */
	defaultConfig: Partial<AgentConfig>;
	
	/** Default triggers */
	defaultTriggers: AgentTrigger[];
	
	/** Default schedule */
	defaultSchedule?: AgentSchedule;
	
	/** Factory function */
	factory: AgentFactory;
	
	/** Whether the agent is enabled by default */
	enabledByDefault: boolean;
	
	/** Agent category */
	category: string;
	
	/** Agent tags */
	tags: string[];
	
	/** Agent dependencies */
	dependencies: string[];
	
	/** Agent capabilities */
	capabilities: string[];
}

/**
 * Agent Registry
 */
export class AgentRegistry {
	private agentTemplates: Map<string, AgentTemplate> = new Map();
	private registeredAgents: Map<string, AgentRegistryEntry> = new Map();
	
	constructor() {
		this.initializeDefaultTemplates();
	}
	
	/**
	 * Initialize default agent templates
	 */
	private initializeDefaultTemplates(): void {
		// Create a generic agent factory that can be used for all templates
		const createGenericAgent = async (config: AgentConfig, agentType: string): Promise<Agent> => {
			const state: AgentState = {
				agentId: config.id,
				status: 'idle',
				executionCount: 0,
				successCount: 0,
				errorCount: 0,
				averageExecutionTimeMs: 0,
				pausedByUser: false,
				lastUpdated: new Date()
			};
			
			return {
				config,
				state,
				initialize: async (context) => {
					console.log(`[${agentType}] Initializing agent ${config.id}`);
					state.status = 'idle';
					state.lastUpdated = new Date();
				},
				execute: async (context) => {
					console.log(`[${agentType}] Executing agent ${config.id}`);
					state.status = 'running';
					state.lastUpdated = new Date();
					
					// Simulate execution
					const executionTime = 500 + Math.random() * 1000;
					await new Promise(resolve => setTimeout(resolve, executionTime));
					
					// Update state
					state.executionCount++;
					state.successCount++;
					state.lastExecutionTime = new Date();
					state.status = 'idle';
					state.lastUpdated = new Date();
					
					// Return results
					return {
						success: true,
						data: {
							agentType,
							executionTimeMs: executionTime,
							timestamp: new Date().toISOString()
						},
						executionTimeMs: executionTime,
						suggestions: [
							`${agentType} completed successfully`,
							`Consider reviewing the results in the dashboard`
						]
					};
				},
				pause: async (reason?: string) => {
					console.log(`[${agentType}] Pausing agent ${config.id}: ${reason || 'No reason provided'}`);
					state.status = 'paused';
					state.pausedByUser = true;
					state.pauseReason = reason;
					state.lastUpdated = new Date();
				},
				resume: async () => {
					console.log(`[${agentType}] Resuming agent ${config.id}`);
					state.status = 'idle';
					state.pausedByUser = false;
					state.pauseReason = undefined;
					state.lastUpdated = new Date();
				},
				stop: async () => {
					console.log(`[${agentType}] Stopping agent ${config.id}`);
					state.status = 'stopped';
					state.lastUpdated = new Date();
				},
				cleanup: async () => {
					console.log(`[${agentType}] Cleaning up agent ${config.id}`);
					state.status = 'stopped';
					state.lastUpdated = new Date();
				},
				getSuggestions: async (context) => {
					return [
						`${agentType} is running normally`,
						`Consider adjusting the schedule for better performance`
					];
				},
				getStatus: () => state.status,
				updateState: (updates) => {
					Object.assign(state, updates);
					state.lastUpdated = new Date();
				}
			};
		};
		
		// Periodic inbox scanner
		this.registerTemplate({
			id: 'inbox-scanner',
			name: 'Inbox Scanner',
			description: 'Periodically scans inbox for new emails and opportunities',
			type: 'inbox_scanner',
			defaultConfig: {
				priority: 70,
				maxExecutionTimeMs: 30000,
				persistState: true,
				logActivity: true,
				agentSpecificConfig: {
					scanIntervalMs: 5 * 60 * 1000,
					maxEmailsPerScan: 50,
					processUnreadOnly: true
				}
			},
			defaultTriggers: [
				{
					type: 'periodic',
					config: {
						intervalMs: 5 * 60 * 1000
					}
				}
			],
			defaultSchedule: {
				when: 'immediate'
			},
			factory: (config) => createGenericAgent(config, 'Inbox Scanner'),
			enabledByDefault: true,
			category: 'email',
			tags: ['periodic', 'inbox', 'email', 'scanner'],
			dependencies: ['memory-engine', 'email-client'],
			capabilities: ['email-scanning', 'opportunity-detection', 'priority-sorting']
		});
		
		// Memory-driven client monitor
		this.registerTemplate({
			id: 'client-monitor',
			name: 'Client Monitor',
			description: 'Monitors client behavior and updates client profiles',
			type: 'client_monitor',
			defaultConfig: {
				priority: 60,
				maxExecutionTimeMs: 15000,
				persistState: true,
				logActivity: true,
				agentSpecificConfig: {
					clientUpdateIntervalMs: 60 * 60 * 1000,
					maxClientsPerRun: 20,
					importanceThreshold: 0.7
				}
			},
			defaultTriggers: [
				{
					type: 'memory',
					config: {
						memoryCategories: ['client_interaction', 'email_exchange'],
						minImportance: 0.5
					}
				},
				{
					type: 'periodic',
					config: {
						intervalMs: 60 * 60 * 1000
					}
				}
			],
			factory: (config) => createGenericAgent(config, 'Client Monitor'),
			enabledByDefault: true,
			category: 'client',
			tags: ['memory', 'client', 'profile', 'monitor'],
			dependencies: ['memory-engine', 'client-database'],
			capabilities: ['client-profiling', 'behavior-analysis', 'importance-scoring']
		});
		
		// Style learning monitor
		this.registerTemplate({
			id: 'style-monitor',
			name: 'Style Monitor',
			description: 'Monitors and learns user writing style from emails and documents',
			type: 'style_monitor',
			defaultConfig: {
				priority: 50,
				maxExecutionTimeMs: 20000,
				persistState: true,
				logActivity: true,
				agentSpecificConfig: {
					learningBatchSize: 10,
					styleUpdateThreshold: 0.8,
					maxDocumentsPerRun: 5
				}
			},
			defaultTriggers: [
				{
					type: 'memory',
					config: {
						memoryCategories: ['email_sent', 'document_created'],
						minConfidence: 0.6
					}
				}
			],
			factory: (config) => createGenericAgent(config, 'Style Monitor'),
			enabledByDefault: true,
			category: 'style',
			tags: ['style', 'learning', 'writing', 'monitor'],
			dependencies: ['memory-engine', 'style-engine'],
			capabilities: ['style-learning', 'pattern-recognition', 'suggestion-generation']
		});
		
		// Deliverability monitor
		this.registerTemplate({
			id: 'deliverability-monitor',
			name: 'Deliverability Monitor',
			description: 'Monitors email deliverability and provider health',
			type: 'deliverability_monitor',
			defaultConfig: {
				priority: 80,
				maxExecutionTimeMs: 25000,
				persistState: true,
				logActivity: true,
				agentSpecificConfig: {
					checkIntervalMs: 15 * 60 * 1000,
					providersToMonitor: ['gmail', 'outlook', 'brevo', 'sendgrid'],
					alertThreshold: 0.9
				}
			},
			defaultTriggers: [
				{
					type: 'periodic',
					config: {
						intervalMs: 15 * 60 * 1000
					}
				},
				{
					type: 'event',
					config: {
						eventTypes: ['email_send_failed', 'provider_error']
					}
				}
			],
			factory: (config) => createGenericAgent(config, 'Deliverability Monitor'),
			enabledByDefault: true,
			category: 'deliverability',
			tags: ['deliverability', 'provider', 'monitor', 'health'],
			dependencies: ['email-client', 'provider-registry'],
			capabilities: ['deliverability-checking', 'provider-health', 'alert-generation']
		});
		
		// Workflow opportunity detector
		this.registerTemplate({
			id: 'workflow-opportunity',
			name: 'Workflow Opportunity Detector',
			description: 'Detects opportunities to trigger workflows based on context',
			type: 'workflow_opportunity',
			defaultConfig: {
				priority: 40,
				maxExecutionTimeMs: 10000,
				persistState: true,
				logActivity: true,
				agentSpecificConfig: {
					opportunityCheckIntervalMs: 2 * 60 * 1000,
					minConfidenceThreshold: 0.7,
					maxOpportunitiesPerRun: 5
				}
			},
			defaultTriggers: [
				{
					type: 'periodic',
					config: {
						intervalMs: 2 * 60 * 1000
					}
				},
				{
					type: 'memory',
					config: {
						memoryCategories: ['client_interaction', 'email_received'],
						minImportance: 0.6
					}
				}
			],
			factory: (config) => createGenericAgent(config, 'Workflow Opportunity'),
			enabledByDefault: true,
			category: 'workflow',
			tags: ['workflow', 'opportunity', 'detection', 'automation'],
			dependencies: ['memory-engine', 'workflow-engine'],
			capabilities: ['opportunity-detection', 'workflow-triggering', 'context-analysis']
		});
		
		// Document lifecycle monitor
		this.registerTemplate({
			id: 'document-monitor',
			name: 'Document Lifecycle Monitor',
			description: 'Monitors document lifecycle and triggers appropriate actions',
			type: 'document_monitor',
			defaultConfig: {
				priority: 30,
				maxExecutionTimeMs: 15000,
				persistState: true,
				logActivity: true,
				agentSpecificConfig: {
					documentCheckIntervalMs: 10 * 60 * 1000,
					maxDocumentsPerRun: 15,
					lifecycleStages: ['draft', 'review', 'final', 'archived']
				}
			},
			defaultTriggers: [
				{
					type: 'periodic',
					config: {
						intervalMs: 10 * 60 * 1000
					}
				},
				{
					type: 'event',
					config: {
						eventTypes: ['document_created', 'document_modified', 'document_status_changed']
					}
				}
			],
			factory: (config) => createGenericAgent(config, 'Document Monitor'),
			enabledByDefault: true,
			category: 'document',
			tags: ['document', 'lifecycle', 'monitor', 'management'],
			dependencies: ['document-engine', 'memory-engine'],
			capabilities: ['document-tracking', 'lifecycle-management', 'action-triggering']
		});
		
		// Provider health monitor
		this.registerTemplate({
			id: 'provider-monitor',
			name: 'Provider Health Monitor',
			description: 'Monitors email provider health and performance',
			type: 'provider_monitor',
			defaultConfig: {
				priority: 85,
				maxExecutionTimeMs: 20000,
				persistState: true,
				logActivity: true,
				agentSpecificConfig: {
					healthCheckIntervalMs: 10 * 60 * 1000,
					providers: ['gmail', 'outlook', 'icloud', 'yahoo', 'brevo', 'sendgrid', 'mailgun'],
					performanceThreshold: 0.95
				}
			},
			defaultTriggers: [
				{
					type: 'periodic',
					config: {
						intervalMs: 10 * 60 * 1000
					}
				}
			],
			factory: (config) => createGenericAgent(config, 'Provider Monitor'),
			enabledByDefault: true,
			category: 'provider',
			tags: ['provider', 'health', 'monitor', 'performance'],
			dependencies: ['provider-registry', 'email-client'],
			capabilities: ['health-checking', 'performance-monitoring', 'alert-generation']
		});
		
		// Thread activity monitor
		this.registerTemplate({
			id: 'thread-monitor',
			name: 'Thread Activity Monitor',
			description: 'Monitors email thread activity and updates thread memory',
			type: 'thread_monitor',
			defaultConfig: {
				priority: 45,
				maxExecutionTimeMs: 12000,
				persistState: true,
				logActivity: true,
				agentSpecificConfig: {
					threadCheckIntervalMs: 3 * 60 * 1000,
					maxThreadsPerRun: 10,
					activityThreshold: 0.5
				}
			},
			defaultTriggers: [
				{
					type: 'periodic',
					config: {
						intervalMs: 3 * 60 * 1000
					}
				},
				{
					type: 'event',
					config: {
						eventTypes: ['email_received', 'email_sent']
					}
				}
			],
			factory: (config) => createGenericAgent(config, 'Thread Monitor'),
			enabledByDefault: true,
			category: 'thread',
			tags: ['thread', 'activity', 'monitor', 'email'],
			dependencies: ['email-client', 'memory-engine'],
			capabilities: ['thread-tracking', 'activity-monitoring', 'memory-updating']
		});
		
		console.log(`Initialized ${this.agentTemplates.size} agent templates`);
	}
	
	/**
	 * Register an agent template
	 */
	registerTemplate(template: AgentTemplate): boolean {
		if (this.agentTemplates.has(template.id)) {
			console.warn(`Agent template with ID ${template.id} already exists`);
			return false;
		}
		
		this.agentTemplates.set(template.id, template);
		console.log(`Registered agent template: ${template.name} (${template.id})`);
		
		return true;
	}
	
	/**
	 * Unregister an agent template
	 */
	unregisterTemplate(templateId: string): boolean {
		const existed = this.agentTemplates.has(templateId);
		
		if (existed) {
			this.agentTemplates.delete(templateId);
			console.log(`Unregistered agent template: ${templateId}`);
		}
		
		return existed;
	}
	
	/**
	 * Get agent template by ID
	 */
	getTemplate(templateId: string): AgentTemplate | null {
		return this.agentTemplates.get(templateId) || null;
	}
	
	/**
	 * Get all agent templates
	 */
	getAllTemplates(): AgentTemplate[] {
		return Array.from(this.agentTemplates.values());
	}
	
	/**
	 * Get agent templates by category
	 */
	getTemplatesByCategory(category: string): AgentTemplate[] {
		return Array.from(this.agentTemplates.values()).filter(
			template => template.category === category
		);
	}
	
	/**
	 * Get agent templates by tag
	 */
	getTemplatesByTag(tag: string): AgentTemplate[] {
		return Array.from(this.agentTemplates.values()).filter(
			template => template.tags.includes(tag)
		);
	}
	
	/**
	 * Get agent templates by type
	 */
	getTemplatesByType(type: AgentType): AgentTemplate[] {
		return Array.from(this.agentTemplates.values()).filter(
			template => template.type === type
		);
	}
	/**
	 * Create agent from template
	 */
	async createAgentFromTemplate(templateId: string, customConfig?: Partial<AgentConfig>): Promise<AgentConfig> {
		const template = this.getTemplate(templateId);
		if (!template) {
			throw new Error(`Agent template not found: ${templateId}`);
		}
		
		// Merge default config with custom config
		const config: AgentConfig = {
			id: `${templateId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			name: template.name,
			description: template.description,
			type: template.type,
			triggers: [...template.defaultTriggers],
			schedule: template.defaultSchedule ? { ...template.defaultSchedule } : undefined,
			enabled: template.enabledByDefault,
			priority: template.defaultConfig.priority || 50,
			maxExecutionTimeMs: template.defaultConfig.maxExecutionTimeMs || 30000,
			persistState: template.defaultConfig.persistState !== undefined ? template.defaultConfig.persistState : true,
			logActivity: template.defaultConfig.logActivity !== undefined ? template.defaultConfig.logActivity : true,
			agentSpecificConfig: template.defaultConfig.agentSpecificConfig ? { ...template.defaultConfig.agentSpecificConfig } : {}
		};
		
		// Apply custom configuration
		if (customConfig) {
			Object.assign(config, customConfig);
			
			// Ensure ID is not overwritten
			if (customConfig.id) {
				config.id = customConfig.id;
			}
		}
		
		return config;
	}
	
	/**
	 * Instantiate agent from template
	 */
	async instantiateAgentFromTemplate(templateId: string, customConfig?: Partial<AgentConfig>): Promise<Agent> {
		const template = this.getTemplate(templateId);
		if (!template) {
			throw new Error(`Agent template not found: ${templateId}`);
		}
		
		// Create agent configuration
		const config = await this.createAgentFromTemplate(templateId, customConfig);
		
		// Create agent instance using factory
		const agent = await template.factory(config);
		
		// Create registry entry
		const registryEntry: AgentRegistryEntry = {
			id: config.id,
			config,
			factory: template.factory,
			registered: true,
			registeredAt: new Date()
		};
		
		this.registeredAgents.set(config.id, registryEntry);
		
		console.log(`Instantiated agent from template: ${config.name} (${config.id})`);
		
		return agent;
	}
	
	/**
	 * Register an agent instance
	 */
	registerAgentInstance(agent: Agent, factory: AgentFactory): boolean {
		if (this.registeredAgents.has(agent.config.id)) {
			console.warn(`Agent with ID ${agent.config.id} is already registered`);
			return false;
		}
		
		const registryEntry: AgentRegistryEntry = {
			id: agent.config.id,
			config: agent.config,
			factory,
			registered: true,
			registeredAt: new Date()
		};
		
		this.registeredAgents.set(agent.config.id, registryEntry);
		console.log(`Registered agent instance: ${agent.config.name} (${agent.config.id})`);
		
		return true;
	}
	
	/**
	 * Unregister an agent instance
	 */
	unregisterAgentInstance(agentId: string): boolean {
		const existed = this.registeredAgents.has(agentId);
		
		if (existed) {
			this.registeredAgents.delete(agentId);
			console.log(`Unregistered agent instance: ${agentId}`);
		}
		
		return existed;
	}
	
	/**
	 * Get registered agent by ID
	 */
	getRegisteredAgent(agentId: string): AgentRegistryEntry | null {
		return this.registeredAgents.get(agentId) || null;
	}
	
	/**
	 * Get all registered agents
	 */
	getAllRegisteredAgents(): AgentRegistryEntry[] {
		return Array.from(this.registeredAgents.values());
	}
	
	/**
	 * Get registered agents by template ID
	 */
	getRegisteredAgentsByTemplate(templateId: string): AgentRegistryEntry[] {
		return Array.from(this.registeredAgents.values()).filter(
			entry => entry.config.type === templateId
		);
	}
	
	/**
	 * Get registered agents by category
	 */
	getRegisteredAgentsByCategory(category: string): AgentRegistryEntry[] {
		const templates = this.getTemplatesByCategory(category);
		const templateIds = templates.map(t => t.id);
		
		return Array.from(this.registeredAgents.values()).filter(
			entry => templateIds.includes(entry.config.type)
		);
	}
	
	/**
	 * Get registered agents by status
	 */
	getRegisteredAgentsByStatus(enabled: boolean): AgentRegistryEntry[] {
		return Array.from(this.registeredAgents.values()).filter(
			entry => entry.config.enabled === enabled
		);
	}
	
	/**
	 * Export agent templates as JSON
	 */
	exportTemplatesAsJson(): string {
		const templates = this.getAllTemplates();
		const exportData = templates.map(template => ({
			id: template.id,
			name: template.name,
			description: template.description,
			type: template.type,
			category: template.category,
			tags: template.tags,
			dependencies: template.dependencies,
			capabilities: template.capabilities,
			enabledByDefault: template.enabledByDefault
		}));
		
		return JSON.stringify(exportData, null, 2);
	}
	
	/**
	 * Import agent templates from JSON
	 */
	importTemplatesFromJson(json: string): number {
		try {
			const templates = JSON.parse(json);
			let importedCount = 0;
			
			for (const templateData of templates) {
				// Create a basic factory for imported templates
				const factory: AgentFactory = async (config: AgentConfig) => {
					const state: AgentState = {
						agentId: config.id,
						status: 'idle',
						executionCount: 0,
						successCount: 0,
						errorCount: 0,
						averageExecutionTimeMs: 0,
						pausedByUser: false,
						lastUpdated: new Date()
					};
					
					return {
						config,
						state,
						initialize: async (context) => {
							console.log(`[Imported Agent ${templateData.id}] Initializing`);
							state.status = 'idle';
							state.lastUpdated = new Date();
						},
						execute: async (context) => {
							console.log(`[Imported Agent ${templateData.id}] Executing`);
							state.status = 'running';
							state.lastUpdated = new Date();
							
							await new Promise(resolve => setTimeout(resolve, 500));
							
							state.executionCount++;
							state.successCount++;
							state.lastExecutionTime = new Date();
							state.status = 'idle';
							state.lastUpdated = new Date();
							
							return {
								success: true,
								data: { imported: true, templateId: templateData.id },
								executionTimeMs: 500,
								suggestions: [`Imported agent ${templateData.name} executed successfully`]
							};
						},
						pause: async (reason?: string) => {
							state.status = 'paused';
							state.pausedByUser = true;
							state.pauseReason = reason;
							state.lastUpdated = new Date();
						},
						resume: async () => {
							state.status = 'idle';
							state.pausedByUser = false;
							state.pauseReason = undefined;
							state.lastUpdated = new Date();
						},
						stop: async () => {
							state.status = 'stopped';
							state.lastUpdated = new Date();
						},
						cleanup: async () => {
							state.status = 'stopped';
							state.lastUpdated = new Date();
						},
						getSuggestions: async (context) => {
							return [`Imported agent ${templateData.name} is running normally`];
						},
						getStatus: () => state.status,
						updateState: (updates) => {
							Object.assign(state, updates);
							state.lastUpdated = new Date();
						}
					};
				};
				
				const template: AgentTemplate = {
					id: templateData.id,
					name: templateData.name,
					description: templateData.description,
					type: templateData.type,
					defaultConfig: {},
					defaultTriggers: [],
					factory,
					enabledByDefault: templateData.enabledByDefault || false,
					category: templateData.category || 'custom',
					tags: templateData.tags || [],
					dependencies: templateData.dependencies || [],
					capabilities: templateData.capabilities || []
				};
				
				if (this.registerTemplate(template)) {
					importedCount++;
				}
			}
			
			console.log(`Imported ${importedCount} agent templates from JSON`);
			return importedCount;
		} catch (error) {
			console.error('Failed to import agent templates from JSON:', error);
			return 0;
		}
	}
}

/**
	* Create a default agent registry instance
	*/
export function createDefaultAgentRegistry(): AgentRegistry {
	return new AgentRegistry();
}

/**
	* Get a singleton instance of the agent registry
	*/
let singletonRegistry: AgentRegistry | null = null;

export function getAgentRegistry(): AgentRegistry {
	if (!singletonRegistry) {
		singletonRegistry = new AgentRegistry();
	}
	return singletonRegistry;
}
		

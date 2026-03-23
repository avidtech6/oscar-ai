/**
 * Integration Framework interfaces
 * 
 * Defines the interfaces for PHASE_17: Report Intelligence Integration
 */
export interface IntegrationProvider {
  /**
   * Provider ID
   */
  providerId: string;

  /**
   * Provider name
   */
  name: string;

  /**
   * Provider type
   */
  type: 'api' | 'database' | 'file' | 'cloud' | 'messaging' | 'authentication';

  /**
   * Provider configuration
   */
  config: Record<string, any>;

  /**
   * Provider status
   */
  status: 'active' | 'inactive' | 'error';

  /**
   * Provider capabilities
   */
  capabilities: string[];

  /**
   * Provider metadata
   */
  metadata: {
    version: string;
    createdAt: string;
    updatedAt: string;
    author: string;
  };
}

export interface IntegrationConnection {
  /**
   * Connection ID
   */
  connectionId: string;

  /**
   * Provider ID
   */
  providerId: string;

  /**
   * Connection configuration
   */
  config: Record<string, any>;

  /**
   * Connection status
   */
  status: 'connected' | 'disconnected' | 'error';

  /**
   * Connection metadata
   */
  metadata: {
    connectedAt: string;
    lastActivity: string;
    version: string;
  };
}

export interface IntegrationFlow {
  /**
   * Flow ID
   */
  flowId: string;

  /**
   * Flow name
   */
  name: string;

  /**
   * Flow description
   */
  description: string;

  /**
   * Flow steps
   */
  steps: IntegrationStep[];

  /**
   * Flow triggers
   */
  triggers: IntegrationTrigger[];

  /**
   * Flow status
   */
  status: 'active' | 'inactive' | 'error';

  /**
   * Flow metadata
   */
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    author: string;
  };
}

export interface IntegrationStep {
  /**
   * Step ID
   */
  stepId: string;

  /**
   * Step type
   */
  type: 'transform' | 'filter' | 'map' | 'validate' | 'enrich' | 'route' | 'aggregate';

  /**
   * Step configuration
   */
  config: Record<string, any>;

  /**
   * Step dependencies
   */
  dependencies: string[];

  /**
   * Step outputs
   */
  outputs: string[];

  /**
   * Step error handling
   */
  errorHandling: {
    retryCount: number;
    retryDelay: number;
    onFailure: 'continue' | 'stop' | 'fallback';
  };
}

export interface IntegrationTrigger {
  /**
   * Trigger ID
   */
  triggerId: string;

  /**
   * Trigger type
   */
  type: 'schedule' | 'event' | 'webhook' | 'manual';

  /**
   * Trigger configuration
   */
  config: Record<string, any>;

  /**
   * Trigger conditions
   */
  conditions: Record<string, any>;

  /**
   * Trigger metadata
   */
  metadata: {
    enabled: boolean;
    lastTriggered: string;
    nextTrigger: string;
  };
}

export interface IntegrationDataMapping {
  /**
   * Mapping ID
   */
  mappingId: string;

  /**
   * Source schema
   */
  sourceSchema: Record<string, any>;

  /**
   * Target schema
   */
  targetSchema: Record<string, any>;

  /**
   * Mapping rules
   */
  rules: MappingRule[];

  /**
   * Mapping metadata
   */
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
}

export interface MappingRule {
  /**
   * Rule ID
   */
  ruleId: string;

  /**
   * Source field
   */
  source: string;

  /**
   * Target field
   */
  target: string;

  /**
   * Transformation type
   */
  transformation: 'direct' | 'convert' | 'extract' | 'combine' | 'split' | 'format';

  /**
   * Transformation parameters
   */
  parameters: Record<string, any>;

  /**
   * Conditions
   */
  conditions?: Record<string, any>;
}

export interface IntegrationEvent {
  /**
   * Event ID
   */
  eventId: string;

  /**
   * Event type
   */
  type: 'data_received' | 'data_processed' | 'data_sent' | 'error' | 'system';

  /**
   * Event payload
   */
  payload: Record<string, any>;

  /**
   * Event timestamp
   */
  timestamp: string;

  /**
   * Event source
   */
  source: string;

  /**
   * Event destination
   */
  destination?: string;

  /**
   * Event status
   */
  status: 'success' | 'failure' | 'pending';

  /**
   * Event metadata
   */
  metadata: {
    flowId?: string;
    stepId?: string;
    connectionId?: string;
    version: string;
  };
}

/**
 * Integration Framework class
 * 
 * Implements PHASE_17: Report Intelligence Integration from the Phase Compliance Package.
 * Provides comprehensive integration capabilities for the Report Intelligence System.
 */
export class IntegrationFramework {
  /**
   * Integration providers
   */
  private providers: Map<string, IntegrationProvider> = new Map();

  /**
   * Integration connections
   */
  private connections: Map<string, IntegrationConnection> = new Map();

  /**
   * Integration flows
   */
  private flows: Map<string, IntegrationFlow> = new Map();

  /**
   * Integration data mappings
   */
  private mappings: Map<string, IntegrationDataMapping> = new Map();

  /**
   * Integration events
   */
  private events: Map<string, IntegrationEvent[]> = new Map();

  /**
   * Event handlers
   */
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * Initialize the Integration Framework
   */
  constructor() {
    this.initializeDefaultProviders();
  }

  /**
   * Register an integration provider
   * @param provider - Provider to register
   * @returns Provider ID
   */
  registerProvider(provider: Omit<IntegrationProvider, 'providerId' | 'metadata'>): string {
    const providerId = `provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullProvider: IntegrationProvider = {
      providerId,
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'system'
      },
      ...provider
    };

    this.providers.set(providerId, fullProvider);
    this.emit('providerRegistered', fullProvider);
    return providerId;
  }

  /**
   * Get an integration provider
   * @param providerId - ID of the provider to get
   * @returns Integration provider or undefined
   */
  getProvider(providerId: string): IntegrationProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Get all integration providers
   * @param filters - Filters for providers
   * @returns Array of integration providers
   */
  getProviders(filters?: {
    type?: IntegrationProvider['type'];
    status?: IntegrationProvider['status'];
  }): IntegrationProvider[] {
    let providers = Array.from(this.providers.values());

    if (filters) {
      if (filters.type) {
        providers = providers.filter(provider => provider.type === filters.type);
      }
      if (filters.status) {
        providers = providers.filter(provider => provider.status === filters.status);
      }
    }

    return providers;
  }

  /**
   * Update an integration provider
   * @param providerId - ID of the provider to update
   * @param updates - Provider updates
   * @returns Success status
   */
  updateProvider(providerId: string, updates: Partial<IntegrationProvider>): boolean {
    const provider = this.providers.get(providerId);
    if (!provider) {
      return false;
    }

    this.providers.set(providerId, {
      ...provider,
      ...updates,
      metadata: {
        ...provider.metadata,
        updatedAt: new Date().toISOString()
      }
    });

    this.emit('providerUpdated', this.providers.get(providerId)!);
    return true;
  }

  /**
   * Delete an integration provider
   * @param providerId - ID of the provider to delete
   * @returns Success status
   */
  deleteProvider(providerId: string): boolean {
    const provider = this.providers.get(providerId);
    if (!provider) {
      return false;
    }

    // Check if there are active connections using this provider
    const activeConnections = Array.from(this.connections.values()).filter(
      conn => conn.providerId === providerId && conn.status === 'connected'
    );

    if (activeConnections.length > 0) {
      return false; // Cannot delete provider with active connections
    }

    this.providers.delete(providerId);
    this.emit('providerDeleted', provider);
    return true;
  }

  /**
   * Create an integration connection
   * @param connection - Connection to create
   * @returns Connection ID
   */
  createConnection(connection: Omit<IntegrationConnection, 'connectionId' | 'metadata'>): string {
    const connectionId = `connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullConnection: IntegrationConnection = {
      connectionId,
      metadata: {
        connectedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        version: '1.0.0'
      },
      ...connection
    };

    this.connections.set(connectionId, fullConnection);
    this.emit('connectionCreated', fullConnection);
    return connectionId;
  }

  /**
   * Get an integration connection
   * @param connectionId - ID of the connection to get
   * @returns Integration connection or undefined
   */
  getConnection(connectionId: string): IntegrationConnection | undefined {
    return this.connections.get(connectionId);
  }

  /**
   * Get all integration connections
   * @param filters - Filters for connections
   * @returns Array of integration connections
   */
  getConnections(filters?: {
    providerId?: string;
    status?: IntegrationConnection['status'];
  }): IntegrationConnection[] {
    let connections = Array.from(this.connections.values());

    if (filters) {
      if (filters.providerId) {
        connections = connections.filter(conn => conn.providerId === filters.providerId);
      }
      if (filters.status) {
        connections = connections.filter(conn => conn.status === filters.status);
      }
    }

    return connections;
  }

  /**
   * Connect to a provider
   * @param connectionId - ID of the connection to activate
   * @returns Success status
   */
  async connect(connectionId: string): Promise<boolean> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    const provider = this.providers.get(connection.providerId);
    if (!provider) {
      return false;
    }

    try {
      // Placeholder for actual connection logic
      // In a real implementation, this would establish the actual connection
      connection.status = 'connected';
      connection.metadata.connectedAt = new Date().toISOString();
      connection.metadata.lastActivity = new Date().toISOString();
      
      this.connections.set(connectionId, connection);
      this.emit('connectionConnected', connection);
      return true;
    } catch (error) {
      connection.status = 'error';
      this.connections.set(connectionId, connection);
      this.emit('connectionError', { connectionId, error });
      return false;
    }
  }

  /**
   * Disconnect from a provider
   * @param connectionId - ID of the connection to deactivate
   * @returns Success status
   */
  async disconnect(connectionId: string): Promise<boolean> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    try {
      // Placeholder for actual disconnection logic
      connection.status = 'disconnected';
      connection.metadata.lastActivity = new Date().toISOString();
      
      this.connections.set(connectionId, connection);
      this.emit('connectionDisconnected', connection);
      return true;
    } catch (error) {
      this.emit('connectionError', { connectionId, error });
      return false;
    }
  }

  /**
   * Create an integration flow
   * @param flow - Flow to create
   * @returns Flow ID
   */
  createFlow(flow: Omit<IntegrationFlow, 'flowId' | 'metadata'>): string {
    const flowId = `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullFlow: IntegrationFlow = {
      flowId,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        author: 'system'
      },
      ...flow
    };

    this.flows.set(flowId, fullFlow);
    this.emit('flowCreated', fullFlow);
    return flowId;
  }

  /**
   * Get an integration flow
   * @param flowId - ID of the flow to get
   * @returns Integration flow or undefined
   */
  getFlow(flowId: string): IntegrationFlow | undefined {
    return this.flows.get(flowId);
  }

  /**
   * Get all integration flows
   * @param filters - Filters for flows
   * @returns Array of integration flows
   */
  getFlows(filters?: {
    status?: IntegrationFlow['status'];
  }): IntegrationFlow[] {
    let flows = Array.from(this.flows.values());

    if (filters) {
      if (filters.status) {
        flows = flows.filter(flow => flow.status === filters.status);
      }
    }

    return flows;
  }

  /**
   * Execute an integration flow
   * @param flowId - ID of the flow to execute
   * @param inputData - Input data for the flow
   * @returns Execution result
   */
  async executeFlow(flowId: string, inputData: Record<string, any>): Promise<{
    success: boolean;
    data?: any;
    errors?: string[];
    metadata: {
      startTime: string;
      endTime: string;
      duration: number;
      stepsExecuted: string[];
    };
  }> {
    const flow = this.flows.get(flowId);
    if (!flow) {
      return {
        success: false,
        errors: ['Flow not found'],
        metadata: {
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: 0,
          stepsExecuted: []
        }
      };
    }

    const startTime = new Date().toISOString();
    const stepsExecuted: string[] = [];
    const errors: string[] = [];
    let currentData = inputData;

    try {
      // Execute each step in the flow
      for (const step of flow.steps) {
        try {
          const result = await this.executeStep(step, currentData);
          stepsExecuted.push(step.stepId);
          
          if (result.success) {
            currentData = result.data;
          } else {
            errors.push(`Step ${step.stepId} failed: ${result.error}`);
            
            // Handle error according to error handling configuration
            if (step.errorHandling.onFailure === 'stop') {
              break;
            }
          }
        } catch (error) {
          errors.push(`Step ${step.stepId} error: ${error}`);
          
          if (step.errorHandling.onFailure === 'stop') {
            break;
          }
        }
      }

      const endTime = new Date().toISOString();
      const duration = new Date(endTime).getTime() - new Date(startTime).getTime();

      return {
        success: errors.length === 0,
        data: currentData,
        errors: errors.length > 0 ? errors : undefined,
        metadata: {
          startTime,
          endTime,
          duration,
          stepsExecuted
        }
      };
    } catch (error) {
      const endTime = new Date().toISOString();
      const duration = new Date(endTime).getTime() - new Date(startTime).getTime();

      return {
        success: false,
        errors: [`Flow execution failed: ${error}`],
        metadata: {
          startTime,
          endTime,
          duration,
          stepsExecuted
        }
      };
    }
  }

  /**
   * Execute a single integration step
   * @param step - Step to execute
   * @param inputData - Input data for the step
   * @returns Step execution result
   */
  private async executeStep(step: IntegrationStep, inputData: Record<string, any>): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      switch (step.type) {
        case 'transform':
          return {
            success: true,
            data: this.transformData(step.config, inputData)
          };
        case 'filter':
          return {
            success: true,
            data: this.filterData(step.config, inputData)
          };
        case 'map':
          return {
            success: true,
            data: this.mapData(step.config, inputData)
          };
        case 'validate':
          return {
            success: true,
            data: this.validateData(step.config, inputData)
          };
        case 'enrich':
          return {
            success: true,
            data: this.enrichData(step.config, inputData)
          };
        case 'route':
          return {
            success: true,
            data: this.routeData(step.config, inputData)
          };
        case 'aggregate':
          return {
            success: true,
            data: this.aggregateData(step.config, inputData)
          };
        default:
          return {
            success: false,
            error: `Unknown step type: ${step.type}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Transform data
   * @param config - Transformation configuration
   * @param data - Data to transform
   * @returns Transformed data
   */
  private transformData(config: Record<string, any>, data: Record<string, any>): Record<string, any> {
    // Placeholder for actual transformation logic
    return { ...data };
  }

  /**
   * Filter data
   * @param config - Filter configuration
   * @param data - Data to filter
   * @returns Filtered data
   */
  private filterData(config: Record<string, any>, data: Record<string, any>): Record<string, any> {
    // Placeholder for actual filtering logic
    return { ...data };
  }

  /**
   * Map data
   * @param config - Mapping configuration
   * @param data - Data to map
   * @returns Mapped data
   */
  private mapData(config: Record<string, any>, data: Record<string, any>): Record<string, any> {
    // Placeholder for actual mapping logic
    return { ...data };
  }

  /**
   * Validate data
   * @param config - Validation configuration
   * @param data - Data to validate
   * @returns Validated data
   */
  private validateData(config: Record<string, any>, data: Record<string, any>): Record<string, any> {
    // Placeholder for actual validation logic
    return { ...data };
  }

  /**
   * Enrich data
   * @param config - Enrichment configuration
   * @param data - Data to enrich
   * @returns Enriched data
   */
  private enrichData(config: Record<string, any>, data: Record<string, any>): Record<string, any> {
    // Placeholder for actual enrichment logic
    return { ...data };
  }

  /**
   * Route data
   * @param config - Routing configuration
   * @param data - Data to route
   * @returns Routed data
   */
  private routeData(config: Record<string, any>, data: Record<string, any>): Record<string, any> {
    // Placeholder for actual routing logic
    return { ...data };
  }

  /**
   * Aggregate data
   * @param config - Aggregation configuration
   * @param data - Data to aggregate
   * @returns Aggregated data
   */
  private aggregateData(config: Record<string, any>, data: Record<string, any>): Record<string, any> {
    // Placeholder for actual aggregation logic
    return { ...data };
  }

  /**
   * Create a data mapping
   * @param mapping - Mapping to create
   * @returns Mapping ID
   */
  createMapping(mapping: Omit<IntegrationDataMapping, 'mappingId' | 'metadata'>): string {
    const mappingId = `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullMapping: IntegrationDataMapping = {
      mappingId,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0'
      },
      ...mapping
    };

    this.mappings.set(mappingId, fullMapping);
    this.emit('mappingCreated', fullMapping);
    return mappingId;
  }

  /**
   * Get a data mapping
   * @param mappingId - ID of the mapping to get
   * @returns Integration data mapping or undefined
   */
  getMapping(mappingId: string): IntegrationDataMapping | undefined {
    return this.mappings.get(mappingId);
  }

  /**
   * Get all data mappings
   * @returns Array of integration data mappings
   */
  getMappings(): IntegrationDataMapping[] {
    return Array.from(this.mappings.values());
  }

  /**
   * Apply a data mapping
   * @param mappingId - ID of the mapping to apply
   * @param data - Data to map
   * @returns Mapped data
   */
  applyMapping(mappingId: string, data: Record<string, any>): Record<string, any> {
    const mapping = this.mappings.get(mappingId);
    if (!mapping) {
      return data;
    }

    const result: Record<string, any> = {};

    // Apply each mapping rule
    for (const rule of mapping.rules) {
      const sourceValue = this.getNestedValue(data, rule.source);
      
      if (sourceValue !== undefined) {
        const transformedValue = this.applyTransformation(rule.transformation, sourceValue, rule.parameters);
        this.setNestedValue(result, rule.target, transformedValue);
      }
    }

    return result;
  }

  /**
   * Log an integration event
   * @param event - Event to log
   * @returns Event ID
   */
  logEvent(event: Omit<IntegrationEvent, 'eventId' | 'timestamp'>): string {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullEvent: IntegrationEvent = {
      eventId,
      timestamp: new Date().toISOString(),
      ...event
    };

    // Store event by type
    if (!this.events.has(event.type)) {
      this.events.set(event.type, []);
    }
    this.events.get(event.type)!.push(fullEvent);

    // Keep only last 1000 events per type
    const events = this.events.get(event.type)!;
    if (events.length > 1000) {
      this.events.set(event.type, events.slice(-1000));
    }

    this.emit('eventLogged', fullEvent);
    return eventId;
  }

  /**
   * Get integration events
   * @param filters - Filters for events
   * @returns Array of integration events
   */
  getEvents(filters?: {
    type?: IntegrationEvent['type'];
    status?: IntegrationEvent['status'];
    source?: string;
    startDate?: string;
    endDate?: string;
  }): IntegrationEvent[] {
    let allEvents: IntegrationEvent[] = [];
    
    // Collect all events
    this.events.forEach(eventList => {
      allEvents = allEvents.concat(eventList);
    });

    if (filters) {
      if (filters.type) {
        allEvents = allEvents.filter(event => event.type === filters.type);
      }
      if (filters.status) {
        allEvents = allEvents.filter(event => event.status === filters.status);
      }
      if (filters.source) {
        allEvents = allEvents.filter(event => event.source === filters.source);
      }
      if (filters.startDate) {
        allEvents = allEvents.filter(event => event.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        allEvents = allEvents.filter(event => event.timestamp <= filters.endDate!);
      }
    }

    return allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Add event handler
   * @param event - Event name
   * @param handler - Event handler function
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Remove event handler
   * @param event - Event name
   * @param handler - Event handler function to remove
   */
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   * @param event - Event name
   * @param data - Event data
   */
  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Initialize default providers
   */
  private initializeDefaultProviders(): void {
    // Default REST API provider
    this.registerProvider({
      name: 'REST API',
      type: 'api',
      config: {
        baseUrl: '',
        timeout: 30000,
        retries: 3,
        headers: {
          'Content-Type': 'application/json'
        }
      },
      status: 'active',
      capabilities: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    });

    // Default Database provider
    this.registerProvider({
      name: 'Database',
      type: 'database',
      config: {
        host: '',
        port: 5432,
        database: '',
        username: '',
        password: ''
      },
      status: 'active',
      capabilities: ['SELECT', 'INSERT', 'UPDATE', 'DELETE']
    });

    // Default File provider
    this.registerProvider({
      name: 'File System',
      type: 'file',
      config: {
        basePath: './data',
        supportedFormats: ['json', 'csv', 'xml', 'txt']
      },
      status: 'active',
      capabilities: ['read', 'write', 'delete', 'list']
    });

    // Default Cloud Storage provider
    this.registerProvider({
      name: 'Cloud Storage',
      type: 'cloud',
      config: {
        provider: 'aws',
        region: 'us-east-1',
        bucket: ''
      },
      status: 'active',
      capabilities: ['upload', 'download', 'delete', 'list']
    });
  }

  /**
   * Get nested value from object
   * @param obj - Object to get value from
   * @param path - Path to the value (e.g., 'user.profile.name')
   * @returns Value or undefined
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Set nested value in object
   * @param obj - Object to set value in
   * @param path - Path to the value (e.g., 'user.profile.name')
   * @param value - Value to set
   */
  private setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    
    const target = keys.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }

  /**
   * Apply transformation to a value
   * @param transformation - Transformation type
   * @param value - Value to transform
   * @param parameters - Transformation parameters
   * @returns Transformed value
   */
  private applyTransformation(transformation: MappingRule['transformation'], value: any, parameters: Record<string, any>): any {
    switch (transformation) {
      case 'direct':
        return value;
      case 'convert':
        return parameters.type === 'string' ? String(value) :
               parameters.type === 'number' ? Number(value) :
               parameters.type === 'boolean' ? Boolean(value) :
               value;
      case 'extract':
        if (parameters.regex) {
          const match = String(value).match(new RegExp(parameters.regex));
          return match ? match[1] : value;
        }
        return value;
      case 'combine':
        if (parameters.delimiter) {
          return Array.isArray(value) ? value.join(parameters.delimiter) : String(value);
        }
        return value;
      case 'split':
        if (parameters.delimiter) {
          return String(value).split(parameters.delimiter);
        }
        return value;
      case 'format':
        if (parameters.format) {
          return parameters.format.replace(/{(\w+)}/g, (match: string, key: string) => {
            return value[key] || match;
          });
        }
        return value;
      default:
        return value;
    }
  }
}
/**
 * Intelligence Security interfaces
 * 
 * Defines the interfaces for PHASE_15: Report Intelligence Security
 */
export interface SecurityPolicy {
  /**
   * Policy identifier
   */
  policyId: string;

  /**
   * Policy name
   */
  name: string;

  /**
   * Policy description
   */
  description: string;

  /**
   * Policy type
   */
  type: 'access-control' | 'data-protection' | 'encryption' | 'audit' | 'compliance';

  /**
   * Policy rules
   */
  rules: SecurityRule[];

  /**
   * Policy priority
   */
  priority: number;

  /**
   * Whether the policy is enabled
   */
  enabled: boolean;

  /**
   * Policy metadata
   */
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    owner: string;
  };
}

export interface SecurityRule {
  /**
   * Rule identifier
   */
  ruleId: string;

  /**
   * Rule name
   */
  name: string;

  /**
   * Rule conditions
   */
  conditions: Record<string, any>;

  /**
   * Rule actions
   */
  actions: SecurityAction[];

  /**
   * Rule effect
   */
  effect: 'allow' | 'deny' | 'log';

  /**
   * Rule priority
   */
  priority: number;
}

export interface SecurityAction {
  /**
   * Action type
   */
  type: 'grant' | 'deny' | 'log' | 'alert' | 'encrypt' | 'decrypt' | 'mask' | 'audit';

  /**
   * Action parameters
   */
  parameters: Record<string, any>;

  /**
   * Action conditions
   */
  conditions?: Record<string, any>;
}

export interface SecurityAudit {
  /**
   * Audit ID
   */
  auditId: string;

  /**
   * Audit type
   */
  type: 'access' | 'data' | 'system' | 'compliance';

  /**
   * User ID
   */
  userId: string;

  /**
   * Action performed
   */
  action: string;

  /**
   * Resource affected
   */
  resource: string;

  /**
   * Timestamp
   */
  timestamp: string;

  /**
   * Result
   */
  result: 'success' | 'failure' | 'warning';

  /**
   * Details
   */
  details: Record<string, any>;

  /**
   * IP address
   */
  ipAddress: string;

  /**
   * User agent
   */
  userAgent: string;
}

export interface SecurityIncident {
  /**
   * Incident ID
   */
  incidentId: string;

  /**
   * Incident type
   */
  type: 'breach' | 'violation' | 'anomaly' | 'attack';

  /**
   * Severity level
   */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /**
   * Description
   */
  description: string;

  /**
   * Affected resources
   */
  affectedResources: string[];

  /**
   * Timestamp
   */
  timestamp: string;

  /**
   * Status
   */
  status: 'open' | 'investigating' | 'resolved' | 'closed';

  /**
   * Mitigation steps
   */
  mitigationSteps: string[];

  /**
   * Assigned to
   */
  assignedTo?: string;

  /**
   * Resolution details
   */
  resolution?: {
    resolvedAt: string;
    actionsTaken: string[];
    outcome: string;
  };
}

export interface EncryptionConfig {
  /**
   * Encryption algorithm
   */
  algorithm: 'AES-256' | 'RSA-2048' | 'RSA-4096' | 'ECC-P256' | 'ECC-P384';

  /**
   * Key length
   */
  keyLength: number;

  /**
   * Mode of operation
   */
  mode: 'CBC' | 'GCM' | 'ECB';

  /**
   * Key rotation schedule
   */
  keyRotation: {
    enabled: boolean;
    interval: number; // in days
    retention: number; // in days
  };

  /**
   * Key storage
   */
  keyStorage: {
    type: 'hsm' | 'cloud' | 'local';
    location: string;
  };
}

/**
 * Intelligence Security class
 * 
 * Implements PHASE_15: Report Intelligence Security from the Phase Compliance Package.
 * Provides comprehensive security features for the Report Intelligence System.
 */
export class IntelligenceSecurity {
  /**
   * Security policies
   */
  private policies: Map<string, SecurityPolicy> = new Map();

  /**
   * Security audit logs
   */
  private auditLogs: SecurityAudit[] = [];

  /**
   * Security incidents
   */
  private incidents: Map<string, SecurityIncident> = new Map();

  /**
   * Encryption configuration
   */
  private encryptionConfig: EncryptionConfig;

  /**
   * Event handlers
   */
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * Initialize the Intelligence Security system
   * @param encryptionConfig - Encryption configuration
   */
  constructor(encryptionConfig: Partial<EncryptionConfig> = {}) {
    this.encryptionConfig = this.initializeEncryptionConfig(encryptionConfig);
    this.initializeDefaultPolicies();
  }

  /**
   * Create a security policy
   * @param policy - Policy to create
   * @returns Success status
   */
  createPolicy(policy: Omit<SecurityPolicy, 'policyId' | 'metadata'>): boolean {
    const policyId = `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullPolicy: SecurityPolicy = {
      policyId,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        owner: 'system'
      },
      ...policy
    };

    this.policies.set(policyId, fullPolicy);
    this.emit('policyCreated', fullPolicy);
    return true;
  }

  /**
   * Update a security policy
   * @param policyId - ID of the policy to update
   * @param updates - Policy updates
   * @returns Success status
   */
  updatePolicy(policyId: string, updates: Partial<SecurityPolicy>): boolean {
    const policy = this.policies.get(policyId);
    if (!policy) {
      return false;
    }

    this.policies.set(policyId, {
      ...policy,
      ...updates,
      metadata: {
        ...policy.metadata,
        updatedAt: new Date().toISOString()
      }
    });

    this.emit('policyUpdated', this.policies.get(policyId)!);
    return true;
  }

  /**
   * Delete a security policy
   * @param policyId - ID of the policy to delete
   * @returns Success status
   */
  deletePolicy(policyId: string): boolean {
    const policy = this.policies.get(policyId);
    if (!policy) {
      return false;
    }

    this.policies.delete(policyId);
    this.emit('policyDeleted', policy);
    return true;
  }

  /**
   * Get a security policy
   * @param policyId - ID of the policy to get
   * @returns Security policy or undefined
   */
  getPolicy(policyId: string): SecurityPolicy | undefined {
    return this.policies.get(policyId);
  }

  /**
   * Get all security policies
   * @returns Array of all security policies
   */
  getPolicies(): SecurityPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Evaluate security policies for a request
   * @param request - Request to evaluate
   * @returns Evaluation result
   */
  evaluatePolicies(request: Record<string, any>): { allowed: boolean; policies: string[]; reasons: string[] } {
    const applicablePolicies = Array.from(this.policies.values()).filter(policy => 
      policy.enabled && this.isPolicyApplicable(policy, request)
    );

    const deniedPolicies: SecurityPolicy[] = [];
    const allowedPolicies: SecurityPolicy[] = [];

    for (const policy of applicablePolicies) {
      const evaluation = this.evaluatePolicy(policy, request);
      if (evaluation.allowed) {
        allowedPolicies.push(policy);
      } else {
        deniedPolicies.push(policy);
      }
    }

    // If any deny policies, deny the request
    if (deniedPolicies.length > 0) {
      return {
        allowed: false,
        policies: deniedPolicies.map(p => p.policyId),
        reasons: deniedPolicies.map(p => `Policy ${p.name} denied access`)
      };
    }

    // If allow policies, allow the request
    if (allowedPolicies.length > 0) {
      return {
        allowed: true,
        policies: allowedPolicies.map(p => p.policyId),
        reasons: allowedPolicies.map(p => `Policy ${p.name} allowed access`)
      };
    }

    // Default deny
    return {
      allowed: false,
      policies: [],
      reasons: ['No applicable policies found']
    };
  }

  /**
   * Log a security audit event
   * @param audit - Audit event to log
   * @returns Audit ID
   */
  logAudit(audit: Omit<SecurityAudit, 'auditId' | 'timestamp'>): string {
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullAudit: SecurityAudit = {
      auditId,
      timestamp: new Date().toISOString(),
      ...audit
    };

    this.auditLogs.push(fullAudit);
    
    // Keep only last 1000 audit logs
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }

    this.emit('auditLogged', fullAudit);
    return auditId;
  }

  /**
   * Get audit logs
   * @param filters - Filters for audit logs
   * @returns Array of audit logs
   */
  getAuditLogs(filters?: {
    userId?: string;
    type?: SecurityAudit['type'];
    result?: SecurityAudit['result'];
    startDate?: string;
    endDate?: string;
  }): SecurityAudit[] {
    let logs = [...this.auditLogs];

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.type) {
        logs = logs.filter(log => log.type === filters.type);
      }
      if (filters.result) {
        logs = logs.filter(log => log.result === filters.result);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }
    }

    return logs.reverse(); // Most recent first
  }

  /**
   * Create a security incident
   * @param incident - Incident to create
   * @returns Incident ID
   */
  createIncident(incident: Omit<SecurityIncident, 'incidentId' | 'timestamp'>): string {
    const incidentId = `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullIncident: SecurityIncident = {
      incidentId,
      timestamp: new Date().toISOString(),
      ...incident
    };

    this.incidents.set(incidentId, fullIncident);
    this.emit('incidentCreated', fullIncident);
    return incidentId;
  }

  /**
   * Update a security incident
   * @param incidentId - ID of the incident to update
   * @param updates - Incident updates
   * @returns Success status
   */
  updateIncident(incidentId: string, updates: Partial<SecurityIncident>): boolean {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      return false;
    }

    this.incidents.set(incidentId, {
      ...incident,
      ...updates
    });

    this.emit('incidentUpdated', this.incidents.get(incidentId)!);
    return true;
  }

  /**
   * Get a security incident
   * @param incidentId - ID of the incident to get
   * @returns Security incident or undefined
   */
  getIncident(incidentId: string): SecurityIncident | undefined {
    return this.incidents.get(incidentId);
  }

  /**
   * Get all security incidents
   * @param filters - Filters for incidents
   * @returns Array of security incidents
   */
  getIncidents(filters?: {
    type?: SecurityIncident['type'];
    severity?: SecurityIncident['severity'];
    status?: SecurityIncident['status'];
    startDate?: string;
    endDate?: string;
  }): SecurityIncident[] {
    let incidents = Array.from(this.incidents.values());

    if (filters) {
      if (filters.type) {
        incidents = incidents.filter(incident => incident.type === filters.type);
      }
      if (filters.severity) {
        incidents = incidents.filter(incident => incident.severity === filters.severity);
      }
      if (filters.status) {
        incidents = incidents.filter(incident => incident.status === filters.status);
      }
      if (filters.startDate) {
        incidents = incidents.filter(incident => incident.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        incidents = incidents.filter(incident => incident.timestamp <= filters.endDate!);
      }
    }

    return incidents.reverse(); // Most recent first
  }

  /**
   * Encrypt data
   * @param data - Data to encrypt
   * @returns Encrypted data
   */
  async encryptData(data: string): Promise<string> {
    // Placeholder for actual encryption logic
    // In a real implementation, this would use the encryption configuration
    return `encrypted_${data}_${Date.now()}`;
  }

  /**
   * Decrypt data
   * @param encryptedData - Encrypted data to decrypt
   * @returns Decrypted data
   */
  async decryptData(encryptedData: string): Promise<string> {
    // Placeholder for actual decryption logic
    // In a real implementation, this would use the encryption configuration
    return encryptedData.replace(/^encrypted_|_\d+$/, '');
  }

  /**
   * Mask sensitive data
   * @param data - Data to mask
   * @param maskChar - Character to use for masking
   * @returns Masked data
   */
  maskData(data: string, maskChar: string = '*'): string {
    if (data.length <= 4) {
      return maskChar.repeat(data.length);
    }
    
    return maskChar.repeat(4) + data.slice(-4);
  }

  /**
   * Check if data contains sensitive information
   * @param data - Data to check
   * @returns Whether data contains sensitive information
   */
  containsSensitiveData(data: string): boolean {
    const sensitivePatterns = [
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email
      /\b\d{10}\b/, // Phone number
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone number with formatting
    ];

    return sensitivePatterns.some(pattern => pattern.test(data));
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
   * Initialize encryption configuration
   * @param config - Partial encryption configuration
   * @returns Complete encryption configuration
   */
  private initializeEncryptionConfig(config: Partial<EncryptionConfig>): EncryptionConfig {
    return {
      algorithm: config.algorithm || 'AES-256',
      keyLength: config.keyLength || 256,
      mode: config.mode || 'GCM',
      keyRotation: {
        enabled: config.keyRotation?.enabled ?? true,
        interval: config.keyRotation?.interval || 90,
        retention: config.keyRotation?.retention || 365
      },
      keyStorage: {
        type: config.keyStorage?.type || 'hsm',
        location: config.keyStorage?.location || '/secure-keys'
      }
    };
  }

  /**
   * Initialize default security policies
   */
  private initializeDefaultPolicies(): void {
    // Default access control policy
    this.createPolicy({
      name: 'Default Access Control',
      description: 'Default policy for controlling access to intelligence resources',
      type: 'access-control',
      rules: [
        {
          ruleId: 'allow_authenticated',
          name: 'Allow Authenticated Users',
          conditions: {
            authenticated: true
          },
          actions: [
            {
              type: 'grant',
              parameters: {}
            }
          ],
          effect: 'allow',
          priority: 10
        },
        {
          ruleId: 'deny_unauthenticated',
          name: 'Deny Unauthenticated Users',
          conditions: {
            authenticated: false
          },
          actions: [
            {
              type: 'deny',
              parameters: {}
            }
          ],
          effect: 'deny',
          priority: 20
        }
      ],
      priority: 1,
      enabled: true
    });

    // Default data protection policy
    this.createPolicy({
      name: 'Data Protection',
      description: 'Policy for protecting sensitive data',
      type: 'data-protection',
      rules: [
        {
          ruleId: 'encrypt_sensitive_data',
          name: 'Encrypt Sensitive Data',
          conditions: {
            containsSensitiveData: true
          },
          actions: [
            {
              type: 'encrypt',
              parameters: {}
            }
          ],
          effect: 'allow',
          priority: 15
        },
        {
          ruleId: 'mask_personal_info',
          name: 'Mask Personal Information',
          conditions: {
            containsPersonalInfo: true
          },
          actions: [
            {
              type: 'mask',
              parameters: {
                maskChar: '*'
              }
            }
          ],
          effect: 'allow',
          priority: 10
        }
      ],
      priority: 2,
      enabled: true
    });

    // Default audit policy
    this.createPolicy({
      name: 'Audit Logging',
      description: 'Policy for logging all access and modification attempts',
      type: 'audit',
      rules: [
        {
          ruleId: 'log_all_access',
          name: 'Log All Access Attempts',
          conditions: {},
          actions: [
            {
              type: 'log',
              parameters: {
                logLevel: 'info'
              }
            }
          ],
          effect: 'log',
          priority: 5
        }
      ],
      priority: 3,
      enabled: true
    });
  }

  /**
   * Check if a policy is applicable to a request
   * @param policy - Policy to check
   * @param request - Request to evaluate
   * @returns Whether the policy is applicable
   */
  private isPolicyApplicable(policy: SecurityPolicy, request: Record<string, any>): boolean {
    // Placeholder for actual policy applicability logic
    return true;
  }

  /**
   * Evaluate a policy for a request
   * @param policy - Policy to evaluate
   * @param request - Request to evaluate
   * @returns Evaluation result
   */
  private evaluatePolicy(policy: SecurityPolicy, request: Record<string, any>): { allowed: boolean; reasons: string[] } {
    const deniedRules: SecurityRule[] = [];
    const allowedRules: SecurityRule[] = [];

    for (const rule of policy.rules) {
      const evaluation = this.evaluateRule(rule, request);
      if (evaluation.allowed) {
        allowedRules.push(rule);
      } else {
        deniedRules.push(rule);
      }
    }

    // If any deny rules, deny the request
    if (deniedRules.length > 0) {
      return {
        allowed: false,
        reasons: deniedRules.map(r => `Rule ${r.name} denied access`)
      };
    }

    // If allow rules, allow the request
    if (allowedRules.length > 0) {
      return {
        allowed: true,
        reasons: allowedRules.map(r => `Rule ${r.name} allowed access`)
      };
    }

    // Default deny
    return {
      allowed: false,
      reasons: ['No applicable rules found']
    };
  }

  /**
   * Evaluate a rule for a request
   * @param rule - Rule to evaluate
   * @param request - Request to evaluate
   * @returns Evaluation result
   */
  private evaluateRule(rule: SecurityRule, request: Record<string, any>): { allowed: boolean; reasons: string[] } {
    // Check if conditions are met
    const conditionsMet = this.checkConditions(rule.conditions, request);
    
    if (!conditionsMet) {
      return {
        allowed: false,
        reasons: ['Rule conditions not met']
      };
    }

    // Apply rule effect
    switch (rule.effect) {
      case 'allow':
        return {
          allowed: true,
          reasons: ['Rule effect is allow']
        };
      case 'deny':
        return {
          allowed: false,
          reasons: ['Rule effect is deny']
        };
      case 'log':
        // Log the action
        this.logAudit({
          type: 'access',
          userId: request.userId || 'unknown',
          action: `Rule ${rule.name} evaluated`,
          resource: request.resource || 'unknown',
          result: 'success',
          details: {
            ruleId: rule.ruleId,
            conditions: rule.conditions,
            effect: rule.effect
          },
          ipAddress: request.ipAddress || 'unknown',
          userAgent: request.userAgent || 'unknown'
        });
        return {
          allowed: true,
          reasons: ['Rule effect is log']
        };
      default:
        return {
          allowed: false,
          reasons: ['Unknown rule effect']
        };
    }
  }

  /**
   * Check if conditions are met
   * @param conditions - Conditions to check
   * @param request - Request to evaluate
   * @returns Whether conditions are met
   */
  private checkConditions(conditions: Record<string, any>, request: Record<string, any>): boolean {
    // Placeholder for actual condition checking logic
    return true;
  }
}
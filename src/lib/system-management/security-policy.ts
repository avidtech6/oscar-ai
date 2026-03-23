/**
 * Security Policy interfaces for Oscar AI Phase Compliance Package
 * 
 * This file defines the interfaces for the Security Policy system used by the System Management System.
 * 
 * File: src/lib/system-management/security-policy.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

/**
 * Represents a security policy rule
 */
export interface SecurityRule {
  /**
   * Rule identifier
   */
  id: string;

  /**
   * Rule name
   */
  name: string;

  /**
   * Rule type
   */
  type: 'allow' | 'deny' | 'encrypt' | 'decrypt' | 'alert' | 'log' | 'block';

  /**
   * Rule conditions
   */
  conditions: Record<string, any>;

  /**
   * Rule actions
   */
  actions: SecurityAction[];

  /**
   * Rule priority
   */
  priority: number;

  /**
   * Rule metadata
   */
  metadata: {
    enabled: boolean;
    triggerCount: number;
    effectiveness: number;
  };
}

/**
 * Represents a security policy action
 */
export interface SecurityAction {
  /**
   * Action type
   */
  type: 'allow' | 'deny' | 'encrypt' | 'decrypt' | 'alert' | 'log' | 'block';

  /**
   * Action parameters
   */
  parameters: Record<string, any>;

  /**
   * Action metadata
   */
  metadata: {
    enabled: boolean;
    lastExecuted?: Date;
    executionCount: number;
    successRate: number;
  };
}

/**
 * Represents a security policy
 */
export interface SecurityPolicy {
  /**
   * Policy identifier
   */
  id: string;

  /**
   * Policy name
   */
  name: string;

  /**
   * Policy type
   */
  type: 'access-control' | 'data-protection' | 'network-security' | 'application-security' | 'compliance';

  /**
   * Policy rules
   */
  rules: SecurityRule[];

  /**
   * Policy status
   */
  status: 'active' | 'inactive' | 'pending' | 'error';

  /**
   * Policy metadata
   */
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
    updatedBy: string;
    version: string;
    description: string;
    complianceStandards: string[];
  };
}
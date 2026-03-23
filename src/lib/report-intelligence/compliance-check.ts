/**
 * ComplianceCheck interface
 * 
 * Represents a single compliance check operation with its results and metadata.
 * This interface defines the structure for individual compliance validation operations.
 */
export interface ComplianceCheck {
  /**
   * The type of compliance check being performed
   * e.g., 'format', 'content', 'structure', 'standards'
   */
  checkType: string;

  /**
   * The compliance standard or regulation being checked against
   * e.g., 'BS5837:2012', 'ISO 9001', 'Company Standards'
   */
  standard: string;

  /**
   * The result of the compliance check
   * true if compliant, false if non-compliant
   */
  result: boolean;

  /**
   * ISO timestamp when the compliance check was performed
   */
  timestamp: string;

  /**
   * Additional metadata about the compliance check
   * can include details about specific requirements, severity levels, etc.
   */
  metadata: Record<string, any>;
}
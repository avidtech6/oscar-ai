/**
 * Architecture Compliance Verification - Types
 * 
 * Interfaces and types for compliance checking.
 */

export interface ComplianceRule {
	id: string;
	description: string;
	check: () => Promise<ComplianceCheckResult>;
	severity: 'critical' | 'warning' | 'info';
}

export interface ComplianceCheckResult {
	ruleId: string;
	passed: boolean;
	message: string;
	details?: any;
	timestamp: Date;
}

export interface ComplianceReport {
	totalChecks: number;
	passedChecks: number;
	failedChecks: number;
	warnings: number;
	results: ComplianceCheckResult[];
	overallStatus: 'compliant' | 'non-compliant' | 'partial';
	timestamp: Date;
}
/**
 * Architecture Compliance Verification - Checks
 * 
 * Functions to run compliance checks and generate reports.
 */

import { architectureRules } from './complianceRules';
import { getIntelligenceEngine } from './engine';
import type { ComplianceReport, ComplianceCheckResult } from './complianceTypes';

/**
 * Run all compliance checks
 */
export async function runComplianceChecks(): Promise<ComplianceReport> {
	const results: ComplianceCheckResult[] = [];
	
	for (const rule of architectureRules) {
		try {
			const result = await rule.check();
			results.push(result);
		} catch (error) {
			results.push({
				ruleId: rule.id,
				passed: false,
				message: `Check failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				timestamp: new Date()
			});
		}
	}
	
	const totalChecks = results.length;
	const passedChecks = results.filter(r => r.passed).length;
	const failedChecks = results.filter(r => !r.passed).length;
	const warnings = results.filter(r => !r.passed && architectureRules.find(rule => rule.id === r.ruleId)?.severity === 'warning').length;
	
	// Determine overall status
	let overallStatus: 'compliant' | 'non-compliant' | 'partial';
	const criticalFailures = results.filter(r => !r.passed && architectureRules.find(rule => rule.id === r.ruleId)?.severity === 'critical').length;
	
	if (criticalFailures === 0 && failedChecks === 0) {
		overallStatus = 'compliant';
	} else if (criticalFailures > 0) {
		overallStatus = 'non-compliant';
	} else {
		overallStatus = 'partial';
	}
	
	return {
		totalChecks,
		passedChecks,
		failedChecks,
		warnings,
		results,
		overallStatus,
		timestamp: new Date()
	};
}

/**
 * Generate a human-readable compliance report
 */
export async function generateComplianceReport(): Promise<string> {
	const report = await runComplianceChecks();
	
	let output = `# Architecture Compliance Report\n`;
	output += `Generated: ${report.timestamp.toISOString()}\n`;
	output += `Overall Status: ${report.overallStatus.toUpperCase()}\n`;
	output += `\n`;
	output += `## Summary\n`;
	output += `- Total Checks: ${report.totalChecks}\n`;
	output += `- Passed: ${report.passedChecks}\n`;
	output += `- Failed: ${report.failedChecks}\n`;
	output += `- Warnings: ${report.warnings}\n`;
	output += `\n`;
	output += `## Detailed Results\n`;
	
	for (const result of report.results) {
		const rule = architectureRules.find(r => r.id === result.ruleId);
		const status = result.passed ? '✅ PASS' : (rule?.severity === 'critical' ? '❌ FAIL' : '⚠️ WARNING');
		
		output += `\n### ${rule?.description || result.ruleId}\n`;
		output += `Status: ${status}\n`;
		output += `Message: ${result.message}\n`;
		
		if (result.details) {
			output += `Details: ${JSON.stringify(result.details, null, 2)}\n`;
		}
	}
	
	output += `\n## Recommendations\n`;
	
	if (report.overallStatus === 'compliant') {
		output += `✅ All architecture rules are satisfied. The reconstruction follows the Phase File blueprint correctly.\n`;
	} else if (report.overallStatus === 'partial') {
		output += `⚠️ Some non-critical rules failed. Review warnings and consider improvements.\n`;
	} else {
		output += `❌ Critical architecture violations detected. The reconstruction does not properly follow the Phase File blueprint.\n`;
		output += `   Required actions:\n`;
		output += `   1. Ensure Phase Files are copied to src/lib/intelligence/\n`;
		output += `   2. Verify intelligence engine is properly initialized\n`;
		output += `   3. Check that UI uses intelligence API, not hardcoded logic\n`;
	}
	
	return output;
}

/**
 * Quick compliance check for development
 */
export async function quickComplianceCheck(): Promise<{ compliant: boolean; message: string; details?: any }> {
	try {
		const engine = await getIntelligenceEngine();
		const metadata = engine.getAllMetadata();
		const reportTypes = engine.getReportTypes();
		const workflows = engine.getWorkflowDefinitions();
		
		const hasPhaseFiles = metadata.length > 0;
		const hasIntelligenceData = reportTypes.length > 0 || workflows.length > 0;
		const hasCorePhases = metadata.filter(m => m.phaseNumber <= 5).length >= 3;
		
		const compliant = hasPhaseFiles && hasIntelligenceData && hasCorePhases;
		
		return {
			compliant,
			message: compliant 
				? `Architecture compliant: ${metadata.length} phases, ${reportTypes.length} report types, ${workflows.length} workflows`
				: `Architecture issues: ${hasPhaseFiles ? 'Phase Files OK' : 'Missing Phase Files'}, ${hasIntelligenceData ? 'Intelligence data OK' : 'Missing intelligence data'}, ${hasCorePhases ? 'Core phases OK' : 'Missing core phases'}`,
			details: {
				phaseCount: metadata.length,
				reportTypesCount: reportTypes.length,
				workflowsCount: workflows.length,
				corePhasesCount: metadata.filter(m => m.phaseNumber <= 5).length
			}
		};
	} catch (error) {
		return {
			compliant: false,
			message: `Compliance check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}
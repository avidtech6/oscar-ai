/**
 * Validate Compliance Rules (Phase 9)
 * 
 * Checks that the report satisfies all compliance rules.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import type { FailedRule } from '../ComplianceResult';

/**
 * Validate compliance rules
 */
export function validateComplianceRules(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): FailedRule[] {
	const failed: FailedRule[] = [];

	if (!reportType.complianceRules || reportType.complianceRules.length === 0) {
		return failed;
	}

	const text = decompiledReport.rawText.toLowerCase();

	for (const rule of reportType.complianceRules) {
		// Simple check: rule text must appear in the report (case‑insensitive)
		if (!text.includes(rule.toLowerCase())) {
			failed.push({
				ruleId: `rule_${rule.replace(/\s+/g, '_').toLowerCase()}`,
				ruleText: rule,
				reason: `Compliance rule "${rule}" not found in report.`
			});
		}
	}

	return failed;
}
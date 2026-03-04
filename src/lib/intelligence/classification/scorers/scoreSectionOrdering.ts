/**
 * Score section ordering similarity between a decompiled report and a report type.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

export function scoreSectionOrdering(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): number {
	const decompiledTitles = decompiledReport.sections.map(s => s.title.toLowerCase());
	const expectedOrder = [...reportType.requiredSections, ...reportType.optionalSections].map(s => s.toLowerCase());

	if (expectedOrder.length === 0) {
		return 0.5;
	}

	// Compute longest common subsequence (LCS) length
	function lcsLength(a: string[], b: string[]): number {
		const m = a.length;
		const n = b.length;
		const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
		for (let i = 1; i <= m; i++) {
			for (let j = 1; j <= n; j++) {
				if (a[i - 1] === b[j - 1]) {
					dp[i][j] = dp[i - 1][j - 1] + 1;
				} else {
					dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
				}
			}
		}
		return dp[m][n];
	}

	const lcs = lcsLength(decompiledTitles, expectedOrder);
	const similarity = lcs / Math.max(decompiledTitles.length, expectedOrder.length);

	// Boost if first section matches
	let firstSectionBonus = 0;
	if (decompiledTitles.length > 0 && expectedOrder.length > 0) {
		if (decompiledTitles[0] === expectedOrder[0]) {
			firstSectionBonus = 0.2;
		}
	}

	return Math.min(1, similarity + firstSectionBonus);
}
/**
 * Score metadata similarity between a decompiled report and a report type.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

export function scoreMetadata(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): number {
	const metadata = decompiledReport.metadata;
	const aiGuidance = reportType.aiGuidance.map(g => g.toLowerCase());

	if (aiGuidance.length === 0) {
		return 0.5;
	}

	// Check if metadata fields match typical expectations
	let score = 0;
	const reasons: string[] = [];

	// 1. Check for author
	if (metadata.author) {
		score += 0.2;
		reasons.push('Author metadata present');
	}

	// 2. Check for date
	if (metadata.date || metadata.createdAt || metadata.updatedAt) {
		score += 0.2;
		reasons.push('Date metadata present');
	}

	// 3. Check for client/project reference
	if (metadata.client || metadata.project || metadata.reference) {
		score += 0.2;
		reasons.push('Client/project metadata present');
	}

	// 4. Check for version
	if (metadata.version) {
		score += 0.2;
		reasons.push('Version metadata present');
	}

	// 5. Check for report type hint in metadata
	const metadataStr = JSON.stringify(metadata).toLowerCase();
	const hasTypeHint = aiGuidance.some(g => metadataStr.includes(g));
	if (hasTypeHint) {
		score += 0.2;
		reasons.push('AI guidance matched in metadata');
	}

	return Math.min(1, score);
}
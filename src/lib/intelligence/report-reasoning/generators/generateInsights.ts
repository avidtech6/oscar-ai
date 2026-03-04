/**
 * Insight Generator
 * 
 * Consolidates raw insights from analyzers, removes duplicates,
 * prioritizes by severity, and adds cross‑cutting insights.
 */

import type { ReasoningInsight } from '../ReasoningInsight';
import type { ReasoningInput } from '../ReportAIReasoningEngine';
import { createReasoningInsight } from '../ReasoningInsight';

export function generateInsights(
	rawInsights: ReasoningInsight[],
	input: ReasoningInput
): ReasoningInsight[] {
	// 1. Deduplicate insights (same type, target, and similar message)
	const uniqueInsights: ReasoningInsight[] = [];
	const seen = new Set<string>();
	rawInsights.forEach(insight => {
		const key = `${insight.type}|${insight.target}|${insight.message.substring(0, 50)}`;
		if (!seen.has(key)) {
			seen.add(key);
			uniqueInsights.push(insight);
		}
	});

	// 2. Prioritize by severity (critical > high > medium > low)
	const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
	uniqueInsights.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

	// 3. Add cross‑cutting insights that span multiple analyzers
	const crossInsights = generateCrossCuttingInsights(uniqueInsights, input);
	uniqueInsights.push(...crossInsights);

	// 4. Limit to top 20 insights to avoid overwhelming the user
	return uniqueInsights.slice(0, 20);
}

function generateCrossCuttingInsights(
	insights: ReasoningInsight[],
	input: ReasoningInput
): ReasoningInsight[] {
	const crossInsights: ReasoningInsight[] = [];

	// Count insights by category
	const categoryCount: Record<string, number> = {};
	insights.forEach(insight => {
		categoryCount[insight.type] = (categoryCount[insight.type] || 0) + 1;
	});

	// If multiple missingInfo insights, suggest a comprehensive review
	if (categoryCount['missingInfo'] >= 3) {
		crossInsights.push(createReasoningInsight(
			'improvement',
			'Multiple missing information issues detected across the report.',
			'report',
			['Conduct a comprehensive review to fill all missing sections and fields.'],
			'high'
		));
	}

	// If both compliance and terminology issues, suggest glossary alignment
	if (categoryCount['complianceIssue'] && categoryCount['warning']) {
		crossInsights.push(createReasoningInsight(
			'suggestion',
			'Compliance and terminology issues may be related.',
			'cross‑domain',
			['Align terminology with compliance requirements.'],
			'medium'
		));
	}

	// If many style issues, suggest a style guide
	if (categoryCount['styleIssue'] >= 5) {
		crossInsights.push(createReasoningInsight(
			'improvement',
			'Numerous style inconsistencies detected.',
			'style',
			['Adopt a consistent style guide for future reports.'],
			'medium'
		));
	}

	return crossInsights;
}
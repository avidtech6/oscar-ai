/**
 * Recommended Action Generator
 * 
 * Converts insights into actionable steps that integrate with other engines:
 * - Schema Updater Engine
 * - Self‑Healing Engine
 * - Template Generator
 * - Style Learner
 */

import type { ReasoningInsight } from '../ReasoningInsight';
import type { ReasoningInput } from '../ReportAIReasoningEngine';

export function generateRecommendedActions(
	insights: ReasoningInsight[],
	input: ReasoningInput
): string[] {
	const actions: string[] = [];

	// Group insights by target area
	const schemaUpdates = insights.filter(i =>
		i.type === 'missingInfo' && i.target.includes('section') ||
		i.type === 'warning' && i.target.includes('schema')
	);
	const selfHealing = insights.filter(i =>
		i.type === 'contradiction' ||
		i.type === 'ambiguity' ||
		i.severity === 'critical'
	);
	const templateUpdates = insights.filter(i =>
		i.type === 'improvement' && i.target.includes('template') ||
		i.type === 'styleIssue' && i.target.includes('formatting')
	);
	const styleLearning = insights.filter(i =>
		i.type === 'styleIssue' && i.target.includes('tone') ||
		i.type === 'improvement' && i.target.includes('sentence')
	);

	// 1. Schema Updater Engine actions
	if (schemaUpdates.length > 0) {
		actions.push('Run Schema Updater Engine to add missing sections and fields.');
		actions.push('Update report type definition with newly discovered sections.');
	}

	// 2. Self‑Healing Engine actions
	if (selfHealing.length > 0) {
		actions.push('Trigger Self‑Healing Engine to resolve contradictions and ambiguities.');
		actions.push('Apply healing actions to fix critical issues.');
	}

	// 3. Template Generator actions
	if (templateUpdates.length > 0) {
		actions.push('Regenerate report template with updated section ordering.');
		actions.push('Apply consistent formatting across all sections.');
	}

	// 4. Style Learner actions
	if (styleLearning.length > 0) {
		actions.push('Update style profile with detected tone and sentence patterns.');
		actions.push('Apply learned style preferences to future reports.');
	}

	// 5. Compliance Validator actions
	const complianceIssues = insights.filter(i => i.type === 'complianceIssue');
	if (complianceIssues.length > 0) {
		actions.push('Run Compliance Validator to verify all compliance rules.');
		actions.push('Add missing compliance references to report.');
	}

	// 6. Terminology actions
	const terminologyIssues = insights.filter(i => i.target.includes('terminology'));
	if (terminologyIssues.length > 0) {
		actions.push('Update terminology glossary with new domain‑specific terms.');
		actions.push('Ensure consistent terminology usage across the report.');
	}

	// 7. Metadata actions
	const metadataIssues = insights.filter(i => i.target.includes('metadata'));
	if (metadataIssues.length > 0) {
		actions.push('Fill missing metadata fields (author, date, version, client).');
		actions.push('Standardize metadata formatting across all reports.');
	}

	// 8. Methodology actions
	const methodologyIssues = insights.filter(i => i.target.includes('methodology'));
	if (methodologyIssues.length > 0) {
		actions.push('Add detailed methodology section with step‑by‑step procedure.');
		actions.push('Reference applicable standards in methodology.');
	}

	// Deduplicate actions
	const uniqueActions = [...new Set(actions)];

	// Limit to top 10 actions
	return uniqueActions.slice(0, 10);
}
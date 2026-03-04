/**
 * Build Style Integration (Phase 8)
 * 
 * Integrates style profiles into templates.
 */

import type { StyleProfile } from '../../style-learner/StyleProfile';
import type { TemplateSection } from '../ReportTemplate';

/**
 * Apply style profile to template sections
 */
export function buildStyleIntegration(
	sections: TemplateSection[],
	styleProfile: StyleProfile | null
): TemplateSection[] {
	if (!styleProfile) {
		return sections;
	}

	return sections.map(section => ({
		...section,
		guidance: mergeGuidance(section.guidance, styleProfile),
		fields: section.fields.map(field => ({
			...field,
			placeholder: applyStyleToPlaceholder(field.placeholder, styleProfile)
		}))
	}));
}

/**
 * Merge style‑aware guidance into section guidance
 */
function mergeGuidance(
	existingGuidance: string | undefined,
	styleProfile: StyleProfile
): string {
	const styleHints: string[] = [];

	if (styleProfile.tone) {
		styleHints.push(`Tone: ${styleProfile.tone}`);
	}
	if (styleProfile.sentencePatterns?.length) {
		styleHints.push(`Sentence patterns: ${styleProfile.sentencePatterns.join(', ')}`);
	}
	if (styleProfile.preferredPhrasing?.length) {
		styleHints.push(`Preferred phrasing: ${styleProfile.preferredPhrasing.join(', ')}`);
	}

	const styleText = styleHints.length > 0 ? `\nStyle hints: ${styleHints.join('; ')}` : '';
	return (existingGuidance || '') + styleText;
}

/**
 * Apply style to placeholder text
 */
function applyStyleToPlaceholder(
	placeholder: string | undefined,
	styleProfile: StyleProfile
): string | undefined {
	if (!placeholder) return placeholder;

	// Adjust placeholder based on tone
	if (styleProfile.tone === 'formal') {
		return `Please provide a formal ${placeholder}`;
	}
	if (styleProfile.tone === 'technical') {
		return `Provide technical details for ${placeholder}`;
	}
	if (styleProfile.tone === 'informal' || styleProfile.tone === 'conversational') {
		return `Write an informal ${placeholder}`;
	}
	// Default
	return placeholder;
}
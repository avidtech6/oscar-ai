/**
 * Regenerate Template (Phase 8)
 * 
 * Regenerates a template based on updated schema or style profile.
 */

import { reportTypeRegistry } from '../../registry/ReportTypeRegistry';
import { generateTemplate } from './generateTemplate';
import { incrementVersion } from '../ReportTemplate';
import type { ReportTemplate } from '../ReportTemplate';
import type { StyleProfile } from '../../style-learner/StyleProfile';

/**
 * Regenerate a template for a report type
 */
export function regenerateTemplate(
	reportTypeId: string,
	styleProfile: StyleProfile | null = null,
	existingTemplate?: ReportTemplate
): ReportTemplate {
	const reportType = reportTypeRegistry.getType(reportTypeId);
	if (!reportType) {
		throw new Error(`Report type "${reportTypeId}" not found`);
	}

	// Generate a fresh template
	const newTemplate = generateTemplate(reportTypeId, styleProfile);

	// If there's an existing template, preserve its ID and increment version
	if (existingTemplate) {
		newTemplate.id = existingTemplate.id;
		newTemplate.version = incrementVersion(existingTemplate.version);
		newTemplate.createdAt = existingTemplate.createdAt;
	}

	return newTemplate;
}
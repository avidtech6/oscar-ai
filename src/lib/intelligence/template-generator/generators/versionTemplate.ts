/**
 * Version Template (Phase 8)
 * 
 * Handles versioning of templates.
 */

import { incrementVersion } from '../ReportTemplate';
import type { ReportTemplate } from '../ReportTemplate';

/**
 * Create a new version of a template
 */
export function versionTemplate(template: ReportTemplate): ReportTemplate {
	const newVersion = incrementVersion(template.version);
	return {
		...template,
		version: newVersion,
		updatedAt: new Date()
	};
}
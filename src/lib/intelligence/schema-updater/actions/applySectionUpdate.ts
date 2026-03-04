/**
 * Apply a section update action.
 * 
 * Adds a new section to a report type definition.
 */

import type { SchemaUpdateAction } from '../SchemaUpdateAction';
import { reportTypeRegistry } from '../../registry/ReportTypeRegistry';

export function applySectionUpdate(action: SchemaUpdateAction): { success: boolean; error?: string } {
	try {
		const { target, payload } = action;
		const { sectionName, sectionType, description } = payload;

		if (!sectionName) {
			return { success: false, error: 'Missing sectionName in payload' };
		}

		const definition = reportTypeRegistry.getType(target);
		if (!definition) {
			return { success: false, error: `Report type "${target}" not found` };
		}

		// Determine which section array to update
		const sectionTypeLower = (sectionType || 'optional').toLowerCase();
		let arrayToUpdate: string[] | undefined;
		if (sectionTypeLower === 'required') {
			arrayToUpdate = definition.requiredSections;
		} else if (sectionTypeLower === 'conditional') {
			arrayToUpdate = definition.conditionalSections;
		} else {
			arrayToUpdate = definition.optionalSections;
		}

		// Add if not already present
		if (!arrayToUpdate.includes(sectionName)) {
			arrayToUpdate.push(sectionName);
			// Update the definition (we need a method to update)
			// For now, we'll just log.
			console.log(`[SchemaUpdater] Added ${sectionTypeLower} section "${sectionName}" to report type "${target}"`);
		}

		action.status = 'applied';
		action.appliedAt = new Date();

		return { success: true };
	} catch (err: any) {
		return { success: false, error: err.message };
	}
}
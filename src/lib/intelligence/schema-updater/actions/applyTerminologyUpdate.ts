/**
 * Apply a terminology update action.
 * 
 * Adds a new term to a report type definition's terminology.
 */

import type { SchemaUpdateAction } from '../SchemaUpdateAction';
import { reportTypeRegistry } from '../../registry/ReportTypeRegistry';

export function applyTerminologyUpdate(action: SchemaUpdateAction): { success: boolean; error?: string } {
	try {
		const { target, payload } = action;
		const { term, definition } = payload;

		if (!term) {
			return { success: false, error: 'Missing term in payload' };
		}

		const definitionObj = reportTypeRegistry.getType(target);
		if (!definitionObj) {
			return { success: false, error: `Report type "${target}" not found` };
		}

		// Ensure terminology array exists
		if (!definitionObj.terminology) {
			definitionObj.terminology = [];
		}

		// Add term if not already present
		if (!definitionObj.terminology.includes(term)) {
			definitionObj.terminology.push(term);
			console.log(`[SchemaUpdater] Added terminology "${term}" to report type "${target}"`);
		}

		action.status = 'applied';
		action.appliedAt = new Date();

		return { success: true };
	} catch (err: any) {
		return { success: false, error: err.message };
	}
}
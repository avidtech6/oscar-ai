/**
 * Apply a report type definition update action.
 * 
 * Updates a report type definition with new fields, sections, etc.
 */

import type { SchemaUpdateAction } from '../SchemaUpdateAction';
import { reportTypeRegistry } from '../../registry/ReportTypeRegistry';

export function applyReportTypeUpdate(action: SchemaUpdateAction): { success: boolean; error?: string } {
	try {
		const { target, payload } = action;
		const { updates } = payload;

		if (!updates || typeof updates !== 'object') {
			return { success: false, error: 'Missing updates object in payload' };
		}

		const definition = reportTypeRegistry.getType(target);
		if (!definition) {
			return { success: false, error: `Report type "${target}" not found` };
		}

		// Apply updates (merge)
		Object.assign(definition, updates);
		console.log(`[SchemaUpdater] Updated report type "${target}" with ${Object.keys(updates).length} fields`);

		action.status = 'applied';
		action.appliedAt = new Date();

		return { success: true };
	} catch (err: any) {
		return { success: false, error: err.message };
	}
}
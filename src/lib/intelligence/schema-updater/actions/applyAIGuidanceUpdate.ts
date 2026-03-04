/**
 * Apply an AI guidance update action.
 * 
 * Updates AI guidance for a report type.
 */

import type { SchemaUpdateAction } from '../SchemaUpdateAction';
import { reportTypeRegistry } from '../../registry/ReportTypeRegistry';

export function applyAIGuidanceUpdate(action: SchemaUpdateAction): { success: boolean; error?: string } {
	try {
		const { target, payload } = action;
		const { guidance } = payload;

		if (!guidance) {
			return { success: false, error: 'Missing guidance in payload' };
		}

		const definition = reportTypeRegistry.getType(target);
		if (!definition) {
			return { success: false, error: `Report type "${target}" not found` };
		}

		// Add guidance if not already present
		if (!definition.aiGuidance.includes(guidance)) {
			definition.aiGuidance.push(guidance);
			console.log(`[SchemaUpdater] Added AI guidance "${guidance}" to report type "${target}"`);
		}

		action.status = 'applied';
		action.appliedAt = new Date();

		return { success: true };
	} catch (err: any) {
		return { success: false, error: err.message };
	}
}
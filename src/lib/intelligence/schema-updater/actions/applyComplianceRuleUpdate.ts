/**
 * Apply a compliance rule update action.
 * 
 * Adds a new compliance rule to a report type definition.
 */

import type { SchemaUpdateAction } from '../SchemaUpdateAction';
import { reportTypeRegistry } from '../../registry/ReportTypeRegistry';

export function applyComplianceRuleUpdate(action: SchemaUpdateAction): { success: boolean; error?: string } {
	try {
		const { target, payload } = action;
		const { rule } = payload;

		if (!rule) {
			return { success: false, error: 'Missing rule in payload' };
		}

		const definition = reportTypeRegistry.getType(target);
		if (!definition) {
			return { success: false, error: `Report type "${target}" not found` };
		}

		// Add rule if not already present
		if (!definition.complianceRules.includes(rule)) {
			definition.complianceRules.push(rule);
			console.log(`[SchemaUpdater] Added compliance rule "${rule}" to report type "${target}"`);
		}

		action.status = 'applied';
		action.appliedAt = new Date();

		return { success: true };
	} catch (err: any) {
		return { success: false, error: err.message };
	}
}
/**
 * Schema Update Action (Phase 4)
 * 
 * Represents a single update action to be applied to a schema, report type definition,
 * template, AI guidance, or data model.
 */

export type SchemaUpdateActionType =
	| 'addField'
	| 'addSection'
	| 'updateSection'
	| 'addTerminology'
	| 'addComplianceRule'
	| 'updateTemplate'
	| 'updateAIGuidance'
	| 'updateReportTypeDefinition'
	| 'updateDataModel';

export interface SchemaUpdateAction {
	id: string;
	type: SchemaUpdateActionType;
	target: string; // e.g., report type ID, template ID, field path
	payload: Record<string, any>;
	reason: string;
	createdAt: Date;
	appliedAt?: Date;
	status: 'pending' | 'applied' | 'failed' | 'rolledBack';
	error?: string;
}

/**
 * Helper to create a new schema update action
 */
export function createSchemaUpdateAction(
	type: SchemaUpdateActionType,
	target: string,
	payload: Record<string, any>,
	reason: string
): SchemaUpdateAction {
	const now = new Date();
	return {
		id: `update_${now.getTime()}_${Math.random().toString(36).substring(2)}`,
		type,
		target,
		payload,
		reason,
		createdAt: now,
		status: 'pending'
	};
}
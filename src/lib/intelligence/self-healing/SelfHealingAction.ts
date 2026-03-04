/**
 * Self‑Healing Action (Phase 7)
 * 
 * Represents a single healing action to fix a detected issue.
 */

export enum SelfHealingActionType {
	ADD_MISSING_SECTION = 'addMissingSection',
	ADD_MISSING_FIELD = 'addMissingField',
	ADD_MISSING_COMPLIANCE_RULE = 'addMissingComplianceRule',
	ADD_MISSING_TERMINOLOGY = 'addMissingTerminology',
	ADD_MISSING_TEMPLATE = 'addMissingTemplate',
	ADD_MISSING_AI_GUIDANCE = 'addMissingAIGuidance',
	FIX_SCHEMA_CONTRADICTION = 'fixSchemaContradiction',
	FIX_STRUCTURAL_CONTRADICTION = 'fixStructuralContradiction',
	FIX_METADATA_CONTRADICTION = 'fixMetadataContradiction',
	UPDATE_SCHEMA = 'updateSchema',
	UPDATE_TEMPLATE = 'updateTemplate',
	UPDATE_AI_GUIDANCE = 'updateAIGuidance',
	UPDATE_COMPLIANCE_RULES = 'updateComplianceRules'
}

export enum Severity {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
	CRITICAL = 'critical'
}

export interface SelfHealingAction {
	id: string;
	type: SelfHealingActionType;
	target: string; // e.g., reportTypeId, sectionId, fieldName
	payload: Record<string, any>; // action‑specific data
	severity: Severity;
	reason: string;
	createdAt: Date;
	appliedAt: Date | null;
}

/**
 * Create a new self‑healing action
 */
export function createSelfHealingAction(
	type: SelfHealingActionType,
	target: string,
	payload: Record<string, any>,
	severity: Severity,
	reason: string
): SelfHealingAction {
	const id = `healing_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	const now = new Date();
	return {
		id,
		type,
		target,
		payload,
		severity,
		reason,
		createdAt: now,
		appliedAt: null
	};
}
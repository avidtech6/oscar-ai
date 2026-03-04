/**
 * Report Template (Phase 8)
 * 
 * Structured template for generating consistent, compliant reports.
 */

export interface ReportTemplate {
	id: string;
	reportTypeId: string;
	version: string;
	sections: TemplateSection[];
	placeholders: Record<string, PlaceholderDefinition>;
	aiGuidance: AIGuidance[];
	styleProfileId: string | null;
	complianceRules: ComplianceRule[];
	createdAt: Date;
	updatedAt: Date;
}

export interface TemplateSection {
	id: string;
	title: string;
	type: 'required' | 'optional' | 'conditional';
	order: number;
	subsections?: TemplateSection[];
	fields: TemplateField[];
	guidance?: string;
}

export interface TemplateField {
	id: string;
	name: string;
	type: 'text' | 'number' | 'date' | 'boolean' | 'list' | 'table' | 'markdown';
	required: boolean;
	defaultValue?: any;
	placeholder?: string;
	validation?: ValidationRule;
}

export interface ValidationRule {
	pattern?: string;
	min?: number;
	max?: number;
	allowedValues?: string[];
}

export interface PlaceholderDefinition {
	id: string;
	fieldId: string;
	description: string;
	example: string;
	aiPrompt?: string;
}

export interface AIGuidance {
	id: string;
	sectionId: string;
	fieldId?: string;
	prompt: string;
	examples: string[];
	styleHints: string[];
}

export interface ComplianceRule {
	id: string;
	ruleId: string;
	text: string;
	required: boolean;
	sectionId?: string;
}

/**
 * Create a new report template
 */
export function createReportTemplate(
	reportTypeId: string,
	sections: TemplateSection[],
	placeholders: Record<string, PlaceholderDefinition>,
	aiGuidance: AIGuidance[],
	styleProfileId: string | null,
	complianceRules: ComplianceRule[]
): ReportTemplate {
	const now = new Date();
	const id = `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	return {
		id,
		reportTypeId,
		version: '1.0.0',
		sections,
		placeholders,
		aiGuidance,
		styleProfileId,
		complianceRules,
		createdAt: now,
		updatedAt: now
	};
}

/**
 * Increment version number (simple semantic versioning)
 */
export function incrementVersion(currentVersion: string): string {
	const parts = currentVersion.split('.').map(Number);
	parts[2] = (parts[2] || 0) + 1; // increment patch
	return parts.join('.');
}
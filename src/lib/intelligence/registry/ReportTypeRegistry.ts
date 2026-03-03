/**
 * Report Type Registry (Phase 1)
 * 
 * Central authoritative system that defines all supported report types,
 * required sections, optional sections, conditional sections, dependencies,
 * compliance rules, metadata, versioning, and AI‑reasoning hooks.
 * 
 * This registry becomes the foundation for all future phases in the Report Intelligence System.
 */

import type { ReportTypeDefinition } from '../types';
import { EventEmitter } from '../events';

/**
 * Report Type Registry Class
 */
export class ReportTypeRegistry {
	private definitions: Map<string, ReportTypeDefinition> = new Map();
	private eventEmitter = new EventEmitter();

	constructor() {
		this.loadBuiltInTypes();
	}

	/**
	 * Register a new report type
	 */
	registerType(definition: ReportTypeDefinition): void {
		if (this.definitions.has(definition.id)) {
			throw new Error(`Report type with ID "${definition.id}" already registered`);
		}

		// Validate required fields
		if (!definition.id || !definition.name || !definition.version) {
			throw new Error('Report type definition must include id, name, and version');
		}

		const now = new Date();
		const fullDefinition: ReportTypeDefinition = {
			...definition,
			createdAt: definition.createdAt || now,
			updatedAt: now
		};

		this.definitions.set(definition.id, fullDefinition);
		this.eventEmitter.emit('type:registered', { definition: fullDefinition });
	}

	/**
	 * Get a report type by ID
	 */
	getType(id: string): ReportTypeDefinition | undefined {
		return this.definitions.get(id);
	}

	/**
	 * Get all registered report types
	 */
	getAllTypes(): ReportTypeDefinition[] {
		return Array.from(this.definitions.values());
	}

	/**
	 * Update an existing report type
	 */
	updateType(definition: ReportTypeDefinition): void {
		const existing = this.definitions.get(definition.id);
		if (!existing) {
			throw new Error(`Report type with ID "${definition.id}" not found`);
		}

		const updatedDefinition: ReportTypeDefinition = {
			...definition,
			createdAt: existing.createdAt,
			updatedAt: new Date()
		};

		this.definitions.set(definition.id, updatedDefinition);
		this.eventEmitter.emit('type:updated', { definition: updatedDefinition });
	}

	/**
	 * Deprecate a report type (soft delete)
	 */
	deprecateType(id: string): void {
		const existing = this.definitions.get(id);
		if (!existing) {
			throw new Error(`Report type with ID "${id}" not found`);
		}

		// Mark as deprecated (could add a deprecated flag to definition)
		const deprecatedDefinition: ReportTypeDefinition = {
			...existing,
			description: `${existing.description} (DEPRECATED)`,
			updatedAt: new Date()
		};

		this.definitions.set(id, deprecatedDefinition);
		this.eventEmitter.emit('type:deprecated', { definition: deprecatedDefinition });
	}

	/**
	 * Validate a report structure against a report type
	 */
	validateStructure(reportTypeId: string, structure: Record<string, any>): {
		valid: boolean;
		errors: string[];
		warnings: string[];
		missingSections: string[];
		extraSections: string[];
	} {
		const definition = this.getType(reportTypeId);
		if (!definition) {
			return {
				valid: false,
				errors: [`Report type "${reportTypeId}" not found`],
				warnings: [],
				missingSections: [],
				extraSections: []
			};
		}

		const errors: string[] = [];
		const warnings: string[] = [];
		const missingSections: string[] = [];
		const extraSections: string[] = [];

		// Check required sections
		for (const requiredSection of definition.requiredSections) {
			if (!structure[requiredSection]) {
				missingSections.push(requiredSection);
				errors.push(`Missing required section: ${requiredSection}`);
			}
		}

		// Check for extra sections (not in required, optional, or conditional)
		const allAllowedSections = [
			...definition.requiredSections,
			...definition.optionalSections,
			...definition.conditionalSections
		];

		for (const section in structure) {
			if (!allAllowedSections.includes(section)) {
				extraSections.push(section);
				warnings.push(`Extra section found: ${section}`);
			}
		}

		return {
			valid: errors.length === 0,
			errors,
			warnings,
			missingSections,
			extraSections
		};
	}

	/**
	 * Get compliance rules for a report type
	 */
	getComplianceRules(reportTypeId: string): string[] {
		const definition = this.getType(reportTypeId);
		return definition?.complianceRules || [];
	}

	/**
	 * Get AI guidance for a report type
	 */
	getAIGuidance(reportTypeId: string): string[] {
		const definition = this.getType(reportTypeId);
		return definition?.aiGuidance || [];
	}

	/**
	 * Search report types by name or description
	 */
	search(query: string): ReportTypeDefinition[] {
		const lowerQuery = query.toLowerCase();
		return Array.from(this.definitions.values()).filter(def =>
			def.name.toLowerCase().includes(lowerQuery) ||
			def.description.toLowerCase().includes(lowerQuery)
		);
	}

	/**
	 * Load built‑in report types
	 */
	private loadBuiltInTypes(): void {
		// BS5837:2012 Tree Survey
		this.registerType({
			id: 'bs5837-2012-tree-survey',
			name: 'BS5837:2012 Tree Survey',
			description: 'Standard tree survey report following BS5837:2012 guidelines',
			requiredSections: [
				'Introduction',
				'Methodology',
				'Survey Results',
				'Tree Schedule',
				'Recommendations',
				'Conclusion'
			],
			optionalSections: [
				'Appendices',
				'References',
				'Glossary',
				'Photographs'
			],
			conditionalSections: [
				'Risk Assessment',
				'Cost Analysis',
				'Timeline'
			],
			dependencies: [],
			complianceRules: [
				'Must follow BS5837:2012 standards',
				'Must include tree schedule with species, dimensions, condition',
				'Must include recommendations for retention, removal, or protection'
			],
			aiGuidance: [
				'Use structured sections with clear headings',
				'Include visual aids where appropriate',
				'Ensure recommendations are actionable and justified'
			],
			version: '1.0.0',
			createdAt: new Date('2025-01-01'),
			updatedAt: new Date('2025-01-01')
		});

		// Arboricultural Impact Assessment (AIA)
		this.registerType({
			id: 'arboricultural-impact-assessment',
			name: 'Arboricultural Impact Assessment (AIA)',
			description: 'Assessment of potential impacts of development on trees',
			requiredSections: [
				'Introduction',
				'Site Description',
				'Tree Survey',
				'Impact Assessment',
				'Mitigation Measures',
				'Conclusion'
			],
			optionalSections: [
				'Appendices',
				'References',
				'Photographs',
				'Diagrams'
			],
			conditionalSections: [
				'Cost‑Benefit Analysis',
				'Legal Considerations'
			],
			dependencies: ['bs5837-2012-tree-survey'],
			complianceRules: [
				'Must assess all potential impacts',
				'Must propose mitigation measures',
				'Must follow local planning guidelines'
			],
			aiGuidance: [
				'Focus on clear cause‑effect relationships',
				'Use diagrams to illustrate impacts',
				'Ensure mitigation measures are practical'
			],
			version: '1.0.0',
			createdAt: new Date('2025-01-01'),
			updatedAt: new Date('2025-01-01')
		});

		// Arboricultural Method Statement (AMS)
		this.registerType({
			id: 'arboricultural-method-statement',
			name: 'Arboricultural Method Statement (AMS)',
			description: 'Detailed methodology for tree‑related works',
			requiredSections: [
				'Introduction',
				'Scope of Works',
				'Methodology',
				'Health and Safety',
				'Timeline',
				'Conclusion'
			],
			optionalSections: [
				'Appendices',
				'References',
				'Diagrams',
				'Checklists'
			],
			conditionalSections: [
				'Risk Assessment',
				'Equipment List'
			],
			dependencies: ['bs5837-2012-tree-survey'],
			complianceRules: [
				'Must detail all work steps',
				'Must include health and safety measures',
				'Must be site‑specific'
			],
			aiGuidance: [
				'Use step‑by‑step instructions',
				'Include safety precautions prominently',
				'Be precise and unambiguous'
			],
			version: '1.0.0',
			createdAt: new Date('2025-01-01'),
			updatedAt: new Date('2025-01-01')
		});

		// Tree Condition Report
		this.registerType({
			id: 'tree-condition-report',
			name: 'Tree Condition Report',
			description: 'Report on the health and structural condition of a tree',
			requiredSections: [
				'Introduction',
				'Tree Details',
				'Condition Assessment',
				'Findings',
				'Recommendations',
				'Conclusion'
			],
			optionalSections: [
				'Photographs',
				'Diagrams',
				'Appendices'
			],
			conditionalSections: [
				'Risk Rating',
				'Monitoring Schedule'
			],
			dependencies: [],
			complianceRules: [
				'Must include detailed condition assessment',
				'Must provide clear recommendations',
				'Must be evidence‑based'
			],
			aiGuidance: [
				'Use descriptive language for condition',
				'Include visual evidence where possible',
				'Prioritise recommendations by urgency'
			],
			version: '1.0.0',
			createdAt: new Date('2025-01-01'),
			updatedAt: new Date('2025-01-01')
		});

		// Tree Safety / Hazard Report
		this.registerType({
			id: 'tree-safety-hazard-report',
			name: 'Tree Safety / Hazard Report',
			description: 'Report identifying tree‑related hazards and safety recommendations',
			requiredSections: [
				'Introduction',
				'Hazard Identification',
				'Risk Assessment',
				'Urgency Rating',
				'Recommendations',
				'Conclusion'
			],
			optionalSections: [
				'Photographs',
				'Diagrams',
				'Appendices'
			],
			conditionalSections: [
				'Legal Implications',
				'Monitoring Requirements'
			],
			dependencies: [],
			complianceRules: [
				'Must identify all hazards',
				'Must assess risk level',
				'Must provide urgency rating'
			],
			aiGuidance: [
				'Use clear hazard terminology',
				'Prioritise by risk level',
				'Include immediate action items'
			],
			version: '1.0.0',
			createdAt: new Date('2025-01-01'),
			updatedAt: new Date('2025-01-01')
		});

		// Mortgage / Insurance Report
		this.registerType({
			id: 'mortgage-insurance-report',
			name: 'Mortgage / Insurance Report',
			description: 'Report for mortgage or insurance purposes assessing tree‑related risks',
			requiredSections: [
				'Introduction',
				'Property Details',
				'Tree Assessment',
				'Risk Evaluation',
				'Recommendations',
				'Conclusion'
			],
			optionalSections: [
				'Photographs',
				'Diagrams',
				'Appendices'
			],
			conditionalSections: [
				'Insurance Implications',
				'Valuation Impact'
			],
			dependencies: [],
			complianceRules: [
				'Must be suitable for financial institutions',
				'Must include risk evaluation',
				'Must be objective and unbiased'
			],
			aiGuidance: [
				'Use formal, objective language',
				'Focus on financial implications',
				'Provide clear yes/no recommendations'
			],
			version: '1.0.0',
			createdAt: new Date('2025-01-01'),
			updatedAt: new Date('2025-01-01')
		});

		// Custom / User‑Defined Report
		this.registerType({
			id: 'custom-user-defined-report',
			name: 'Custom / User‑Defined Report',
			description: 'User‑defined report type with custom sections',
			requiredSections: [
				'Introduction',
				'Findings',
				'Conclusion'
			],
			optionalSections: [],
			conditionalSections: [],
			dependencies: [],
			complianceRules: [
				'Must meet user‑defined requirements',
				'Must be clearly structured'
			],
			aiGuidance: [
				'Adapt to user requirements',
				'Maintain clear structure',
				'Provide flexibility while ensuring clarity'
			],
			version: '1.0.0',
			createdAt: new Date('2025-01-01'),
			updatedAt: new Date('2025-01-01')
		});
	}

	/**
	 * Get registry status
	 */
	getStatus() {
		return {
			totalTypes: this.definitions.size,
			builtInTypes: 7,
			lastUpdated: new Date()
		};
	}
}

/**
 * Singleton instance of the Report Type Registry
 */
export const reportTypeRegistry = new ReportTypeRegistry();
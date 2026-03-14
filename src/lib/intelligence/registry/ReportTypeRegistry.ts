// Simple browser-compatible event emitter
const createEventEmitter = () => ({
  events: {},
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  },
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
});

import type { ReportTypeDefinition } from '../types';
import { EventEmitter } from '../events';
import { getBuiltInTypes } from './builtInTypes';

export class ReportTypeRegistry {
	private definitions: Map<string, ReportTypeDefinition> = new Map();
	private eventEmitter = createEventEmitter();

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
		const builtInTypes = getBuiltInTypes();
		for (const definition of builtInTypes) {
			this.registerType(definition);
		}
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

export const reportTypeRegistry = new ReportTypeRegistry();
/**
 * Intelligence Validation Core - Layer 1 Pure Functions
 * 
 * Pure intelligence validation functions extracted from apiValidation.ts
 * Contains only business logic, no presentation logic or UI concerns.
 */

import type { ReportTypeDefinition } from '../types';

/**
 * Core interface for intelligence validation operations
 */
export interface IntelligenceValidationCore {
	/**
	 * Validate if a report structure is compliant
	 */
	validateReportStructure(
		definition: ReportTypeDefinition | undefined,
		structure: Record<string, any>
	): Promise<{
		valid: boolean;
		errors: string[];
		warnings: string[];
		missingSections: string[];
		extraSections: string[];
	}>;
}

/**
 * Default implementation of intelligence validation core
 */
export const defaultIntelligenceValidationCore: IntelligenceValidationCore = {
	async validateReportStructure(definition, structure) {
		if (!definition) {
			return {
				valid: false,
				errors: [`Report type definition not found`],
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
};

/**
 * Factory function to create intelligence validation core
 */
export function createIntelligenceValidationCore(
	impl: IntelligenceValidationCore = defaultIntelligenceValidationCore
): IntelligenceValidationCore {
	return impl;
}

/**
 * Utility function to execute a validation operation
 */
async function executeValidationOperation<T>(
	operation: () => Promise<T>
): Promise<T> {
	return operation();
}

/**
 * Utility function to batch execute validation operations
 */
export async function batchExecuteValidationOperations<T>(
	operations: Array<() => Promise<T>>
): Promise<T[]> {
	const results = await Promise.all(operations.map(op => executeValidationOperation(op)));
	return results;
}
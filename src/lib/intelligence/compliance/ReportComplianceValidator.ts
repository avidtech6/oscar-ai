/**
 * Report Compliance Validator (Phase 9)
 * 
 * Validates that a report complies with all requirements.
 */

import { EventEmitter } from '../events';
import { reportTypeRegistry } from '../registry/ReportTypeRegistry';
import { createComplianceResult } from './ComplianceResult';
import { validateRequiredSections } from './validators/validateRequiredSections';
import { validateRequiredFields } from './validators/validateRequiredFields';
import { validateComplianceRules } from './validators/validateComplianceRules';
import { validateStructure } from './validators/validateStructure';
import { validateTerminology } from './validators/validateTerminology';
import { detectContradictions } from './validators/detectContradictions';
import { computeComplianceScore } from './validators/computeComplianceScore';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { DecompiledReport } from '../decompiler/DecompiledReport';
import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { ReportTemplate } from '../template-generator/ReportTemplate';
import type { ComplianceResult } from './ComplianceResult';

const STORAGE_PATH = join(process.cwd(), 'workspace', 'compliance-results.json');

export class ReportComplianceValidator {
	private eventEmitter = new EventEmitter();
	private results: ComplianceResult[] = [];

	constructor() {
		this.load();
	}

	/**
	 * Validate a decompiled report
	 */
	validate(
		decompiledReport: DecompiledReport,
		mappingResult: SchemaMappingResult | null = null,
		template: ReportTemplate | null = null
	): ComplianceResult {
		this.eventEmitter.emit('compliance:started', {
			decompiledReportId: decompiledReport.id,
			mappingResult,
			template
		});

		const reportTypeId = decompiledReport.detectedReportType || mappingResult?.reportTypeId;
		if (!reportTypeId) {
			throw new Error('Cannot validate: report type unknown');
		}

		const reportType = reportTypeRegistry.getType(reportTypeId);
		if (!reportType) {
			throw new Error(`Report type "${reportTypeId}" not found`);
		}

		// Run validators
		const missingRequiredSections = validateRequiredSections(decompiledReport, reportType);
		this.eventEmitter.emit('compliance:sectionValidation', { missingRequiredSections });

		const missingRequiredFields = validateRequiredFields(decompiledReport, reportType);
		this.eventEmitter.emit('compliance:fieldValidation', { missingRequiredFields });

		const failedComplianceRules = validateComplianceRules(decompiledReport, reportType);
		this.eventEmitter.emit('compliance:ruleValidation', { failedComplianceRules });

		const structuralIssues = validateStructure(decompiledReport, reportType);
		this.eventEmitter.emit('compliance:structureValidation', { structuralIssues });

		const terminologyIssues = validateTerminology(decompiledReport, reportType);
		const contradictions = detectContradictions(decompiledReport);
		this.eventEmitter.emit('compliance:contradictionsDetected', { contradictions });

		// Determine if passed
		const passed = missingRequiredSections.length === 0
			&& missingRequiredFields.length === 0
			&& failedComplianceRules.length === 0
			&& contradictions.length === 0;

		// Create result
		const result = createComplianceResult(
			reportTypeId,
			passed,
			missingRequiredSections,
			missingRequiredFields,
			failedComplianceRules,
			structuralIssues,
			terminologyIssues,
			contradictions,
			[], // warnings
			1.0 // placeholder confidence
		);

		// Compute confidence score
		result.confidenceScore = computeComplianceScore(result);

		this.results.push(result);
		this.save();

		this.eventEmitter.emit('compliance:completed', { result });
		return result;
	}

	/**
	 * Get compliance result by ID
	 */
	getResult(id: string): ComplianceResult | null {
		return this.results.find(r => r.id === id) || null;
	}

	/**
	 * Get all results
	 */
	getAllResults(): ComplianceResult[] {
		return [...this.results];
	}

	/**
	 * Load results from disk
	 */
	private load(): void {
		if (!existsSync(STORAGE_PATH)) {
			this.results = [];
			return;
		}

		try {
			const data = readFileSync(STORAGE_PATH, 'utf-8');
			const parsed = JSON.parse(data);
			// Convert date strings
			this.results = parsed.map((r: any) => ({
				...r,
				createdAt: new Date(r.createdAt)
			}));
		} catch (err) {
			console.error('Failed to load compliance results:', err);
			this.results = [];
		}
	}

	/**
	 * Save results to disk
	 */
	private save(): void {
		try {
			const data = JSON.stringify(this.results, null, 2);
			writeFileSync(STORAGE_PATH, data, 'utf-8');
		} catch (err) {
			console.error('Failed to save compliance results:', err);
		}
	}

	/**
	 * Event subscription
	 */
	on(event: string, callback: (data: any) => void) {
		this.eventEmitter.on(event, callback);
	}

	/**
	 * Event unsubscription
	 */
	off(event: string, callback: (data: any) => void) {
		this.eventEmitter.off(event, callback);
	}
}
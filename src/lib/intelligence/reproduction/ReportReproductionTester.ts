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

import { EventEmitter } from '../events';
import { reportTypeRegistry } from '../registry/ReportTypeRegistry';
import { ReportDecompiler } from '../decompiler/ReportDecompiler';
import { ReportSchemaMapper } from '../schema-mapper/ReportSchemaMapper';
import { ReportStyleLearner } from '../style-learner/ReportStyleLearner';
import { ReportClassificationEngine } from '../classification/ReportClassificationEngine';
import { ReportSelfHealingEngine } from '../self-healing/ReportSelfHealingEngine';
import { ReportTemplateGenerator } from '../template-generator/ReportTemplateGenerator';
import { ReportComplianceValidator } from '../compliance/ReportComplianceValidator';
import { createReproductionTestResult, type ReproductionTestResult } from './ReproductionTestResult';
import { compareStructure } from './comparators/compareStructure';
import { compareContent } from './comparators/compareContent';
import { compareStyle } from './comparators/compareStyle';
import { computeSimilarityScore } from './comparators/computeSimilarityScore';
import { runEndToEndTest } from './testers/runEndToEndTest';
import { generateRegeneratedReport } from './testers/generateRegeneratedReport';
import type { DecompiledReport } from '../decompiler/DecompiledReport';
import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { ReportTemplate } from '../template-generator/ReportTemplate';
import type { StyleProfile } from '../style-learner/StyleProfile';

const STORAGE_KEY = 'reproduction-tests';

export class ReportReproductionTester {
	private eventEmitter = createEventEmitter();
	private results: ReproductionTestResult[] = [];

	constructor() {
		this.load();
	}

	/**
	 * Run a full reproduction test on a decompiled report
	 */
	async test(decompiledReport: DecompiledReport): Promise<ReproductionTestResult> {
		this.eventEmitter.emit('reproduction:started', {
			decompiledReportId: decompiledReport.id,
			timestamp: new Date()
		});

		// Step 1: Classify
		const classificationEngine = new ReportClassificationEngine();
		const classificationResult = classificationEngine.classify(decompiledReport);
		this.eventEmitter.emit('reproduction:classified', { classificationResult });

		// Determine report type ID (use detectedReportTypeId or top candidate)
		const reportTypeId = classificationResult.detectedReportTypeId || 
			(classificationResult.rankedCandidates.length > 0 ? classificationResult.rankedCandidates[0].reportTypeId : null);
		if (!reportTypeId) {
			throw new Error('Cannot reproduce: report type unknown');
		}

		// Step 2: Map schema
		const schemaMapper = new ReportSchemaMapper();
		const mappingResult = schemaMapper.mapToReportType(decompiledReport, reportTypeId);
		this.eventEmitter.emit('reproduction:mapped', { mappingResult });

		// Step 3: Generate template
		const templateGenerator = new ReportTemplateGenerator();
		const template = templateGenerator.generate(reportTypeId, null); // styleProfileId null for now
		this.eventEmitter.emit('reproduction:templateGenerated', { template });

		// Step 4: Apply style (placeholder)
		const styleLearner = new ReportStyleLearner();
		// We need a userId; for now use 'system'
		const styleProfile = styleLearner.getStyleProfile('system', reportTypeId);
		// applyStyleProfile expects a string content, not a template; we'll skip for now
		const styledTemplate = template; // placeholder

		// Step 5: Regenerate report
		const regeneratedReport = generateRegeneratedReport(styledTemplate, decompiledReport);
		this.eventEmitter.emit('reproduction:regenerated', { regeneratedReport });

		// Step 6: Compare
		const structuralComparison = compareStructure(decompiledReport, regeneratedReport);
		const contentComparison = compareContent(decompiledReport, regeneratedReport);
		const styleComparison = compareStyle(decompiledReport, regeneratedReport, styleProfile || null);
		this.eventEmitter.emit('reproduction:compared', {
			structuralComparison,
			contentComparison,
			styleComparison
		});

		// Step 7: Compute similarity
		const similarityScore = computeSimilarityScore(
			structuralComparison,
			contentComparison,
			styleComparison
		);
		const structuralMatchScore = structuralComparison.score;
		const contentMatchScore = contentComparison.score;
		const styleMatchScore = styleComparison.score;

		// Step 8: Determine pass/fail
		const passed = similarityScore >= 0.8; // threshold

		// Step 9: Create result
		const result = createReproductionTestResult(
			reportTypeId,
			similarityScore,
			structuralMatchScore,
			contentMatchScore,
			styleMatchScore,
			structuralComparison.missingSections,
			structuralComparison.extraSections,
			contentComparison.mismatchedFields,
			contentComparison.mismatchedTerminology,
			structuralComparison.templateIssues,
			structuralComparison.schemaIssues,
			[...structuralComparison.warnings, ...contentComparison.warnings, ...styleComparison.warnings],
			passed
		);

		this.results.push(result);
		this.save();

		this.eventEmitter.emit('reproduction:completed', { result });
		return result;
	}

	/**
	 * Get test result by ID
	 */
	getResult(id: string): ReproductionTestResult | null {
		return this.results.find(r => r.id === id) || null;
	}

	/**
	 * Get all results
	 */
	getAllResults(): ReproductionTestResult[] {
		return [...this.results];
	}

	/**
	 * Load results from localStorage
	 */
	private load(): void {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) {
				this.results = [];
				return;
			}

			const parsed = JSON.parse(stored);
			// Convert date strings
			this.results = parsed.map((r: any) => ({
				...r,
				createdAt: new Date(r.createdAt),
				completedAt: new Date(r.completedAt)
			}));
		} catch (err) {
			console.error('Failed to load reproduction test results:', err);
			this.results = [];
		}
	}

	/**
	 * Save results to localStorage
	 */
	private save(): void {
		try {
			const data = JSON.stringify(this.results, null, 2);
			localStorage.setItem(STORAGE_KEY, data);
		} catch (err) {
			console.error('Failed to save reproduction test results:', err);
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
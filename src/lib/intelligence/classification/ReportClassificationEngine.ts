/**
 * Report Classification Engine (Phase 6)
 *
 * Identifies the type of report being processed.
 */

import { EventEmitter } from '../events';
import type { DecompiledReport } from '../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../registry/ReportTypeDefinition';
import { reportTypeRegistry } from '../registry/ReportTypeRegistry';
import { createClassificationResult, type ClassificationResult, AmbiguityLevel } from './ClassificationResult';
import { scoreStructureSimilarity } from './scorers/scoreStructureSimilarity';
import { scoreTerminologySimilarity } from './scorers/scoreTerminologySimilarity';
import { scoreComplianceMarkers } from './scorers/scoreComplianceMarkers';
import { scoreMetadata } from './scorers/scoreMetadata';
import { scoreSectionOrdering } from './scorers/scoreSectionOrdering';
import { rankCandidates, type ScoredCandidate } from './rankers/rankCandidates';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const STORAGE_PATH = join(process.cwd(), 'workspace', 'classification-results.json');

export class ReportClassificationEngine {
	private eventEmitter = new EventEmitter();
	private results: ClassificationResult[] = [];

	constructor() {
		this.load();
	}

	/**
	 * Classify a decompiled report
	 */
	classify(decompiledReport: DecompiledReport): ClassificationResult {
		this.eventEmitter.emit('classification:started', { decompiledReportId: decompiledReport.id });

		const reportTypes = reportTypeRegistry.getAllTypes();
		const scoredCandidates: ScoredCandidate[] = [];

		// Score each report type
		for (const reportType of reportTypes) {
			const structureScore = scoreStructureSimilarity(decompiledReport, reportType);
			const terminologyScore = scoreTerminologySimilarity(decompiledReport, reportType);
			const complianceScore = scoreComplianceMarkers(decompiledReport, reportType);
			const metadataScore = scoreMetadata(decompiledReport, reportType);
			const orderingScore = scoreSectionOrdering(decompiledReport, reportType);

			const reasons = [
				`Structure similarity: ${(structureScore * 100).toFixed(1)}%`,
				`Terminology similarity: ${(terminologyScore * 100).toFixed(1)}%`,
				`Compliance markers: ${(complianceScore * 100).toFixed(1)}%`,
				`Metadata alignment: ${(metadataScore * 100).toFixed(1)}%`,
				`Section ordering: ${(orderingScore * 100).toFixed(1)}%`
			];

			scoredCandidates.push({
				reportTypeId: reportType.id,
				scores: {
					structure: structureScore,
					terminology: terminologyScore,
					compliance: complianceScore,
					metadata: metadataScore,
					ordering: orderingScore
				},
				reasons
			});

			this.eventEmitter.emit('classification:candidateScored', {
				reportTypeId: reportType.id,
				scores: { structureScore, terminologyScore, complianceScore, metadataScore, orderingScore }
			});
		}

		// Rank candidates
		const rankedCandidates = rankCandidates(scoredCandidates);
		this.eventEmitter.emit('classification:ranked', { rankedCandidates });

		// Compute confidence and ambiguity
		const confidenceScore = this.computeConfidenceScore(rankedCandidates);
		const ambiguityLevel = this.detectAmbiguity(rankedCandidates, confidenceScore);

		// Build reasons
		const reasons = [
			`Top candidate: ${rankedCandidates[0]?.reportTypeId || 'none'} (${(rankedCandidates[0]?.score || 0) * 100}%)`,
			`Confidence: ${(confidenceScore * 100).toFixed(1)}%`,
			`Ambiguity: ${ambiguityLevel}`
		];

		// Create result
		const result = createClassificationResult(
			decompiledReport.id,
			rankedCandidates,
			confidenceScore,
			ambiguityLevel,
			reasons
		);

		this.results.push(result);
		this.save();

		this.eventEmitter.emit('classification:completed', { result });

		if (ambiguityLevel === AmbiguityLevel.HIGH || ambiguityLevel === AmbiguityLevel.INCONCLUSIVE) {
			this.eventEmitter.emit('classification:ambiguous', { result });
		}

		return result;
	}

	/**
	 * Compute overall confidence score
	 */
	private computeConfidenceScore(rankedCandidates: any[]): number {
		if (rankedCandidates.length === 0) return 0;
		const topScore = rankedCandidates[0].score;
		const secondScore = rankedCandidates[1]?.score || 0;
		const gap = topScore - secondScore;
		// Confidence increases with gap and absolute top score
		return Math.min(1, topScore * 0.7 + gap * 2);
	}

	/**
	 * Detect ambiguity level
	 */
	private detectAmbiguity(rankedCandidates: any[], confidenceScore: number): AmbiguityLevel {
		if (rankedCandidates.length === 0) return AmbiguityLevel.INCONCLUSIVE;
		if (rankedCandidates.length === 1) return AmbiguityLevel.LOW;

		const topScore = rankedCandidates[0].score;
		const secondScore = rankedCandidates[1].score;
		const gap = topScore - secondScore;

		if (confidenceScore < 0.3) return AmbiguityLevel.INCONCLUSIVE;
		if (gap < 0.1) return AmbiguityLevel.HIGH;
		if (gap < 0.2) return AmbiguityLevel.MEDIUM;
		return AmbiguityLevel.LOW;
	}

	/**
	 * Get classification result by ID
	 */
	getResult(id: string): ClassificationResult | undefined {
		return this.results.find(r => r.id === id);
	}

	/**
	 * Get results for a decompiled report
	 */
	getResultsForReport(decompiledReportId: string): ClassificationResult[] {
		return this.results.filter(r => r.decompiledReportId === decompiledReportId);
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
				createdAt: new Date(r.createdAt),
				updatedAt: new Date(r.updatedAt)
			}));
		} catch (err) {
			console.error('Failed to load classification results:', err);
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
			console.error('Failed to save classification results:', err);
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
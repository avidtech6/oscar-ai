/**
 * Report Decompiler Engine (Phase 2)
 * 
 * Ingests raw report content and extracts structured components:
 * - Sections and subsections
 * - Lists, tables, appendices
 * - Metadata, terminology, compliance markers
 * - Structure map
 */

import { EventEmitter } from '../events';
import type { DecompiledReport, DecompiledSection } from './DecompiledReport';
import { createDecompiledReport } from './DecompiledReport';
import { detectHeadings } from './detectors/detectHeadings';
import { detectSections, type DetectedSection as RawSection } from './detectors/detectSections';
import { detectLists } from './detectors/detectLists';
import { detectTables } from './detectors/detectTables';
import { detectMetadata } from './detectors/detectMetadata';
import { detectTerminology } from './detectors/detectTerminology';
import { detectComplianceMarkers } from './detectors/detectComplianceMarkers';
import { detectAppendices } from './detectors/detectAppendices';

export class ReportDecompiler {
	private eventEmitter = new EventEmitter();

	/**
	 * Ingest raw text and return a decompiled report
	 */
	ingest(rawText: string): DecompiledReport {
		this.eventEmitter.emit('decompiler:ingested', { rawTextLength: rawText.length });

		// Normalise text (basic normalisation)
		const normalisedText = this.normaliseText(rawText);

		// Run detectors
		const headings = detectHeadings(normalisedText);
		const rawSections = detectSections(normalisedText);
		const lists = detectLists(normalisedText);
		const tables = detectTables(normalisedText);
		const metadata = detectMetadata(normalisedText);
		const terminology = detectTerminology(normalisedText);
		const complianceMarkers = detectComplianceMarkers(normalisedText);
		const appendices = detectAppendices(normalisedText);

		this.eventEmitter.emit('decompiler:sectionsDetected', { sectionCount: rawSections.length });
		this.eventEmitter.emit('decompiler:metadataExtracted', { metadata });

		// Convert raw sections to DecompiledSection format
		const sections: DecompiledSection[] = this.convertSections(rawSections);

		// Build structure map
		const structureMap = this.buildStructureMap({
			headings,
			sections: rawSections,
			lists,
			tables,
			appendices
		});

		// Create decompiled report
		const report = createDecompiledReport(
			rawText,
			null, // detectedReportType (to be filled by classification engine)
			sections,
			metadata,
			terminology,
			complianceMarkers,
			structureMap
		);

		this.eventEmitter.emit('decompiler:completed', { reportId: report.id });

		return report;
	}

	/**
	 * Basic text normalisation
	 */
	private normaliseText(text: string): string {
		// Replace multiple newlines with double newline
		return text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
	}

	/**
	 * Convert raw detected sections to DecompiledSection hierarchy
	 */
	private convertSections(rawSections: RawSection[]): DecompiledSection[] {
		const convert = (raw: RawSection): DecompiledSection => ({
			id: `section_${raw.heading?.text?.replace(/\W+/g, '_') || 'untitled'}_${raw.startIndex}`,
			title: raw.heading?.text || '',
			level: raw.heading?.level || 0,
			content: raw.content,
			subsections: raw.subsections.map(convert),
			metadata: {}
		});
		return rawSections.map(convert);
	}

	/**
	 * Build a structure map summarizing the document's organisation
	 */
	private buildStructureMap(detections: {
		headings: any[];
		sections: any[];
		lists: any[];
		tables: any[];
		appendices: any[];
	}): Record<string, any> {
		return {
			headingCount: detections.headings.length,
			sectionCount: detections.sections.length,
			listCount: detections.lists.length,
			tableCount: detections.tables.length,
			appendixCount: detections.appendices.length,
			headingLevels: detections.headings.reduce((acc, h) => {
				acc[h.level] = (acc[h.level] || 0) + 1;
				return acc;
			}, {} as Record<number, number>),
			estimatedPageCount: Math.ceil(detections.sections.reduce((sum, sec) => sum + sec.content.length, 0) / 2500) // rough estimate
		};
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
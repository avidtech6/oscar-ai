/**
 * Phase 2 Integration
 * 
 * Integrates PDF parsing with the Report Decompiler Engine (Phase 2).
 * Provides extracted text, layout cues, and images to improve decompilation accuracy.
 */

import type { PDFPageData } from '../types/PDFPageData';
import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import { ReportDecompiler } from '../../decompiler';

export class Phase2Integration {
	private decompiler: ReportDecompiler;

	constructor(decompiler?: ReportDecompiler) {
		this.decompiler = decompiler || new ReportDecompiler();
	}

	/**
	 * Decompile a PDF directly, bypassing the need for pre‑extracted text.
	 */
	async decompilePDF(pages: PDFPageData[]): Promise<DecompiledReport> {
		console.log('Phase2Integration: decompiling PDF with', pages.length, 'pages');

		// Convert PDF page data into a format the decompiler expects
		const rawText = this.pagesToRawText(pages);
		const layoutCues = this.extractLayoutCues(pages);
		const images = this.extractImages(pages);

		// Call the decompiler with enriched data (the decompiler currently only accepts raw text)
		const decompiled = this.decompiler.ingest(rawText);

		// Enhance decompiled report with PDF‑specific metadata
		decompiled.metadata.pdfPageCount = pages.length;
		decompiled.metadata.pdfExtractionDate = new Date();
		decompiled.metadata.pdfLayoutAvailable = true;

		// Store layout cues and images as custom metadata
		decompiled.metadata.layoutCues = layoutCues;
		decompiled.metadata.images = images;

		return decompiled;
	}

	/**
	 * Convert PDF pages into a single raw text string (preserving some structure).
	 */
	private pagesToRawText(pages: PDFPageData[]): string {
		const lines: string[] = [];
		pages.forEach(page => {
			lines.push(`--- Page ${page.pageNumber} ---`);
			// Sort text items by reading order (simplistic)
			const sorted = page.textItems.sort((a, b) => {
				const yDiff = b.bbox[1] - a.bbox[1];
				if (Math.abs(yDiff) > 5) return yDiff;
				return a.bbox[0] - b.bbox[0];
			});
			sorted.forEach(item => {
				lines.push(item.text);
			});
		});
		return lines.join('\n');
	}

	/**
	 * Extract layout cues (headings, lists, tables) to guide decompilation.
	 */
	private extractLayoutCues(pages: PDFPageData[]): any {
		const cues: any = {
			headings: [],
			lists: [],
			tables: [],
			sections: [],
		};

		pages.forEach(page => {
			page.textItems.forEach(item => {
				if (item.isHeading && item.headingLevel) {
					cues.headings.push({
						text: item.text,
						level: item.headingLevel,
						page: page.pageNumber,
						bbox: item.bbox,
					});
				}
				if (item.isListItem) {
					cues.lists.push({
						text: item.text,
						marker: item.listMarker,
						page: page.pageNumber,
						bbox: item.bbox,
					});
				}
				if (item.isTableCell) {
					cues.tables.push({
						text: item.text,
						row: item.tableRow,
						col: item.tableCol,
						page: page.pageNumber,
						bbox: item.bbox,
					});
				}
			});

			// Section detection based on layout regions
			page.layout.contentRegions.forEach(region => {
				if (region.type === 'text' || region.type === 'title') {
					cues.sections.push({
						type: region.type,
						page: page.pageNumber,
						bbox: region.bbox,
					});
				}
			});
		});

		return cues;
	}

	/**
	 * Extract images for inclusion in decompiled report.
	 */
	private extractImages(pages: PDFPageData[]): any[] {
		const images: any[] = [];
		pages.forEach(page => {
			page.images.forEach(img => {
				images.push({
					id: img.id,
					page: img.pageNumber,
					bbox: img.bbox,
					data: img.data,
					format: img.format,
					altText: img.altText,
					isLogo: img.isLogo,
					isDiagram: img.isDiagram,
				});
			});
		});
		return images;
	}
}
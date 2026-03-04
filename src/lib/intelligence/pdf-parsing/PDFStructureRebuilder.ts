/**
 * PDF Structure Rebuilder
 * 
 * Reconstructs document structure from extracted page data:
 * sections, headings, paragraphs, lists, tables, images, metadata.
 */

import type { PDFPageData } from './types/PDFPageData';

export interface RebuiltStructure {
	/** Document title */
	title?: string;
	/** Document author */
	author?: string;
	/** List of sections */
	sections: DocumentSection[];
	/** List of tables */
	tables: DocumentTable[];
	/** List of images */
	images: DocumentImage[];
	/** Metadata */
	metadata: DocumentMetadata;
}

export interface DocumentSection {
	/** Section title */
	title: string;
	/** Heading level (1‑6) */
	level: number;
	/** Page number where section starts */
	pageStart: number;
	/** Page number where section ends */
	pageEnd: number;
	/** Paragraphs belonging to this section */
	paragraphs: string[];
	/** Subsections */
	subsections: DocumentSection[];
}

export interface DocumentTable {
	/** Table caption */
	caption?: string;
	/** Page number */
	page: number;
	/** Number of rows */
	rows: number;
	/** Number of columns */
	columns: number;
	/** Cell data (row‑major) */
	cells: string[][];
}

export interface DocumentImage {
	/** Image caption */
	caption?: string;
	/** Page number */
	page: number;
	/** Image ID */
	id: string;
	/** Base64 data */
	data: string;
	/** Width in pixels */
	width: number;
	/** Height in pixels */
	height: number;
}

export interface DocumentMetadata {
	/** Total pages */
	pageCount: number;
	/** Detected report type */
	reportType?: string;
	/** Detected language */
	language?: string;
	/** Detected compliance markers */
	complianceMarkers: string[];
}

export class PDFStructureRebuilder {
	/**
	 * Rebuild structure from extracted page data.
	 */
	rebuild(pages: PDFPageData[]): PDFPageData[] {
		console.log('PDFStructureRebuilder: rebuilding structure across', pages.length, 'pages');

		// For now, just return the pages unchanged (but we could enrich them)
		// In a real implementation, we would:
		// 1. Identify sections across pages
		// 2. Group paragraphs
		// 3. Detect tables spanning multiple pages
		// 4. Assign image captions
		// 5. Extract metadata

		// Placeholder: add a simple section detection
		pages.forEach((page, index) => {
			// Mark first page as cover
			if (index === 0) {
				page.layout.isCoverPage = true;
			}
			// Mark headings
			page.textItems.forEach(item => {
				if (item.isHeading && item.headingLevel) {
					// Could add section mapping
				}
			});
		});

		return pages;
	}

	/**
	 * Extract a full rebuilt structure.
	 */
	extractStructure(pages: PDFPageData[]): RebuiltStructure {
		const sections: DocumentSection[] = [];
		const tables: DocumentTable[] = [];
		const images: DocumentImage[] = [];

		// Process each page
		pages.forEach(page => {
			// Collect images
			page.images.forEach(img => {
				images.push({
					caption: img.altText,
					page: img.pageNumber,
					id: img.id,
					data: img.data,
					width: img.width,
					height: img.height,
				});
			});

			// Detect tables (simplistic)
			const tableCells = page.textItems.filter(item => item.isTableCell);
			if (tableCells.length > 0) {
				// Group by table (simplistic)
				const rows = new Set(tableCells.map(c => c.tableRow ?? 0));
				const cols = new Set(tableCells.map(c => c.tableCol ?? 0));
				const cells: string[][] = [];
				for (let r = 0; r < rows.size; r++) {
					cells[r] = [];
					for (let c = 0; c < cols.size; c++) {
						const cell = tableCells.find(tc => tc.tableRow === r && tc.tableCol === c);
						cells[r][c] = cell?.text ?? '';
					}
				}
				tables.push({
					caption: page.textItems.find(t => t.isHeading && t.text.includes('Table'))?.text,
					page: page.pageNumber,
					rows: rows.size,
					columns: cols.size,
					cells,
				});
			}
		});

		// Build sections from headings
		let currentSection: DocumentSection | null = null;
		pages.forEach(page => {
			page.textItems.forEach(item => {
				if (item.isHeading && item.headingLevel) {
					// Close previous section
					if (currentSection) {
						sections.push(currentSection);
					}
					// Start new section
					currentSection = {
						title: item.text,
						level: item.headingLevel,
						pageStart: page.pageNumber,
						pageEnd: page.pageNumber,
						paragraphs: [],
						subsections: [],
					};
				} else if (currentSection && !item.isHeading && !item.isTableCell) {
					// Add paragraph text
					currentSection.paragraphs.push(item.text);
				}
			});
		});
		if (currentSection) {
			sections.push(currentSection);
		}

		const metadata: DocumentMetadata = {
			pageCount: pages.length,
			reportType: this.guessReportType(pages),
			language: 'en',
			complianceMarkers: this.extractComplianceMarkers(pages),
		};

		return {
			title: this.extractTitle(pages),
			author: this.extractAuthor(pages),
			sections,
			tables,
			images,
			metadata,
		};
	}

	private extractTitle(pages: PDFPageData[]): string | undefined {
		// Look for largest heading on first page
		const firstPage = pages[0];
		const headings = firstPage.textItems.filter(item => item.isHeading);
		if (headings.length > 0) {
			return headings[0].text;
		}
		return undefined;
	}

	private extractAuthor(pages: PDFPageData[]): string | undefined {
		// Look for "Prepared by" or "Author" text
		for (const page of pages) {
			for (const item of page.textItems) {
				if (item.text.toLowerCase().includes('prepared by') || item.text.toLowerCase().includes('author')) {
					return item.text.split(':')[1]?.trim();
				}
			}
		}
		return undefined;
	}

	private guessReportType(pages: PDFPageData[]): string | undefined {
		// Simple keyword matching
		const text = pages.flatMap(p => p.textItems.map(t => t.text)).join(' ');
		if (text.includes('Arboricultural') && text.includes('Impact Assessment')) {
			return 'Arboricultural Impact Assessment (AIA)';
		}
		if (text.includes('Tree Survey')) {
			return 'BS5837:2012 Tree Survey';
		}
		return undefined;
	}

	private extractComplianceMarkers(pages: PDFPageData[]): string[] {
		const markers: string[] = [];
		const complianceKeywords = ['BS5837', 'ISO', 'compliant', 'standard', 'regulation'];
		for (const page of pages) {
			for (const item of page.textItems) {
				for (const keyword of complianceKeywords) {
					if (item.text.includes(keyword)) {
						markers.push(keyword);
					}
				}
			}
		}
		return [...new Set(markers)];
	}
}
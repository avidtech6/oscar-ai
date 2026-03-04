/**
 * PDF Page Data
 *
 * Represents a single page of a PDF with its extracted content.
 */

import type { PDFExtractedImage } from './PDFExtractedImage';
import type { PDFLayoutInfo } from './PDFLayoutInfo';
import type { PDFStyleInfo } from './PDFStyleInfo';
import type { PDFExtractedText } from './PDFExtractedText';

export interface PDFPageData {
	/** Page number (1‑based) */
	pageNumber: number;
	/** Page width in points */
	width: number;
	/** Page height in points */
	height: number;
	/** Extracted text items (in reading order) */
	textItems: PDFExtractedText[];
	/** Extracted images */
	images: PDFExtractedImage[];
	/** Layout information */
	layout: PDFLayoutInfo;
	/** Style information */
	style: PDFStyleInfo;
}

// Re‑export for convenience
export type { PDFExtractedText as PDFTextItem };
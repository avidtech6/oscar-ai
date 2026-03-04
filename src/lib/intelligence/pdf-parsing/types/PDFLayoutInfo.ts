/**
 * PDF Layout Information
 * 
 * Describes the geometric layout of a PDF page.
 */

export interface PDFLayoutInfo {
	/** Page margins in points (top, right, bottom, left) */
	margins: [number, number, number, number];
	/** Number of columns detected */
	columnCount: number;
	/** Column widths (if uniform) */
	columnWidth?: number;
	/** Column gaps (if uniform) */
	columnGap?: number;
	/** Header region bounding box (if detected) */
	header?: PDFRegion;
	/** Footer region bounding box (if detected) */
	footer?: PDFRegion;
	/** Cover page flag (true if this page is a cover) */
	isCoverPage?: boolean;
	/** Page break type (none, column, page) */
	pageBreak?: 'none' | 'column' | 'page';
	/** Detected grid lines (horizontal and vertical) */
	gridLines?: {
		horizontal: number[];
		vertical: number[];
	};
	/** Detected content regions */
	contentRegions: PDFRegion[];
}

export interface PDFRegion {
	/** Bounding box [x0, y0, x1, y1] in points */
	bbox: [number, number, number, number];
	/** Region type (text, image, table, header, footer, etc.) */
	type: string;
	/** Confidence score (0‑1) */
	confidence: number;
}
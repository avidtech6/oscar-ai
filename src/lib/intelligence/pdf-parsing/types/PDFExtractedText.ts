/**
 * PDF Extracted Text
 * 
 * Represents a single text item extracted from a PDF.
 */

export interface PDFExtractedText {
	/** Text content */
	text: string;
	/** Bounding box [x0, y0, x1, y1] in points */
	bbox: [number, number, number, number];
	/** Font family */
	fontFamily?: string;
	/** Font size in points */
	fontSize?: number;
	/** Font weight (e.g., 'bold', 'normal') */
	fontWeight?: string;
	/** Font style (e.g., 'italic', 'normal') */
	fontStyle?: string;
	/** Text color (hex or RGB) */
	color?: string;
	/** Whether this text is part of a heading */
	isHeading?: boolean;
	/** Heading level (1‑6) if applicable */
	headingLevel?: number;
	/** Whether this text is part of a list item */
	isListItem?: boolean;
	/** List item marker (bullet, number) */
	listMarker?: string;
	/** Whether this text is part of a table */
	isTableCell?: boolean;
	/** Table row index */
	tableRow?: number;
	/** Table column index */
	tableCol?: number;
}
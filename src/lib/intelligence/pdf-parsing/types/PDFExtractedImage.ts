/**
 * PDF Extracted Image
 * 
 * Represents an image extracted from a PDF.
 */

export interface PDFExtractedImage {
	/** Unique identifier for this image */
	id: string;
	/** Page number where the image appears */
	pageNumber: number;
	/** Bounding box [x0, y0, x1, y1] in points */
	bbox: [number, number, number, number];
	/** Image width in pixels */
	width: number;
	/** Image height in pixels */
	height: number;
	/** Image format (png, jpeg, etc.) */
	format: string;
	/** Base64‑encoded image data (data URL) */
	data: string;
	/** Whether this image is a logo */
	isLogo?: boolean;
	/** Whether this image is a diagram */
	isDiagram?: boolean;
	/** Whether this image is a photo */
	isPhoto?: boolean;
	/** Alt text (if available) */
	altText?: string;
	/** Original image name (if available) */
	name?: string;
}
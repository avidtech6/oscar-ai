/**
 * PDF Style Information
 * 
 * Describes typographic and visual styling extracted from a PDF.
 */

export interface PDFStyleInfo {
	/** Detected font families with frequencies */
	fontFamilies: FontFamilyUsage[];
	/** Detected font sizes with frequencies */
	fontSizes: FontSizeUsage[];
	/** Detected font weights with frequencies */
	fontWeights: FontWeightUsage[];
	/** Detected text colors with frequencies */
	colors: ColorUsage[];
	/** Detected paragraph spacing (leading) */
	paragraphSpacing?: number;
	/** Detected line height */
	lineHeight?: number;
	/** Detected indentation (first line) */
	indentation?: number;
	/** Detected list styles */
	listStyles: ListStyle[];
	/** Detected heading styles */
	headingStyles: HeadingStyle[];
	/** Detected table styles */
	tableStyles: TableStyle[];
}

export interface FontFamilyUsage {
	family: string;
	count: number;
	/** Example text using this font */
	example?: string;
}

export interface FontSizeUsage {
	size: number; // points
	count: number;
	/** Whether this size is used for body text */
	isBody?: boolean;
	/** Whether this size is used for headings */
	isHeading?: boolean;
}

export interface FontWeightUsage {
	weight: string; // 'normal', 'bold', '100', '200', etc.
	count: number;
}

export interface ColorUsage {
	color: string; // hex or RGB
	count: number;
	/** Whether this color is used for text */
	isText?: boolean;
	/** Whether this color is used for background */
	isBackground?: boolean;
}

export interface ListStyle {
	type: 'bullet' | 'number' | 'dash' | 'custom';
	marker?: string;
	indent: number;
}

export interface HeadingStyle {
	level: number;
	fontFamily?: string;
	fontSize: number;
	fontWeight?: string;
	color?: string;
	spacingBefore?: number;
	spacingAfter?: number;
}

export interface TableStyle {
	borderWidth?: number;
	borderColor?: string;
	cellPadding?: number;
	headerBackground?: string;
	alternateRowBackground?: string;
}
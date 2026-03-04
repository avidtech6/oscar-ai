/**
 * Heading Detector
 * 
 * Detects headings and subheadings in raw text based on common patterns:
 * - Lines that start with # (markdown)
 * - Lines that are all caps and short
 * - Lines that end with a colon and are followed by content
 * - Numbered headings (e.g., "1. Introduction", "1.1 Background")
 */

export interface DetectedHeading {
	text: string;
	level: number; // 1 for top-level, 2 for subheading, etc.
	lineNumber: number;
	startIndex: number;
	endIndex: number;
}

export function detectHeadings(text: string): DetectedHeading[] {
	const lines = text.split('\n');
	const headings: DetectedHeading[] = [];
	let lineNumber = 0;
	let startIndex = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();
		if (!trimmed) continue;

		let level = 0;
		let matched = false;

		// Markdown headings: #, ##, ###
		const markdownMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
		if (markdownMatch) {
			level = markdownMatch[1].length;
			matched = true;
		}

		// Numbered headings: "1. Introduction", "1.1 Background"
		const numberedMatch = trimmed.match(/^(\d+(\.\d+)*)\.?\s+(.+)$/);
		if (!matched && numberedMatch) {
			const numberParts = numberedMatch[1].split('.').length;
			level = Math.min(numberParts, 6); // treat depth as level
			matched = true;
		}

		// UPPERCASE headings (likely all caps and short)
		if (!matched && trimmed === trimmed.toUpperCase() && trimmed.length < 100 && /[A-Z]/.test(trimmed)) {
			level = 1;
			matched = true;
		}

		// Heading ending with colon (e.g., "Introduction:")
		if (!matched && trimmed.endsWith(':') && trimmed.length < 80) {
			level = 2;
			matched = true;
		}

		if (matched) {
			const headingText = trimmed.replace(/^#{1,6}\s+/, '').replace(/^\d+(\.\d+)*\.?\s+/, '').replace(/:$/, '');
			const endIndex = startIndex + line.length;
			headings.push({
				text: headingText,
				level,
				lineNumber: i,
				startIndex,
				endIndex
			});
		}

		startIndex += line.length + 1; // +1 for newline
	}

	return headings;
}
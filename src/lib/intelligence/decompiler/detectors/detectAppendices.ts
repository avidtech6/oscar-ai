/**
 * Appendix Detector
 * 
 * Detects appendix sections in report text.
 */

export interface DetectedAppendix {
	title: string;
	content: string;
	startIndex: number;
	endIndex: number;
}

export function detectAppendices(text: string): DetectedAppendix[] {
	const appendices: DetectedAppendix[] = [];
	const lines = text.split('\n');
	let inAppendix = false;
	let appendixTitle = '';
	let appendixContent: string[] = [];
	let startIndex = 0;
	let lineStartIndex = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();

		// Check for appendix heading
		const isAppendixHeading = /^Appendix\s+[A-Z\d]/i.test(trimmed) ||
			/^Appendix\s*[:‑]/i.test(trimmed) ||
			/^APPENDIX\s+[A-Z\d]/i.test(trimmed);

		if (isAppendixHeading) {
			// If we were already in an appendix, save it
			if (inAppendix) {
				appendices.push({
					title: appendixTitle,
					content: appendixContent.join('\n'),
					startIndex,
					endIndex: lineStartIndex
				});
			}
			// Start new appendix
			inAppendix = true;
			appendixTitle = trimmed;
			appendixContent = [];
			startIndex = lineStartIndex;
		} else if (inAppendix) {
			// Check if we've reached the end of appendix (start of new major section)
			const isNextMajorSection = /^(Chapter|Section|Part)\s+\d+/i.test(trimmed) ||
				/^\d+\.\s+[A-Z]/i.test(trimmed) ||
				/^[A-Z][A-Z\s]{10,}$/.test(trimmed); // All‑caps heading

			if (isNextMajorSection && appendixContent.length > 5) {
				// End current appendix
				appendices.push({
					title: appendixTitle,
					content: appendixContent.join('\n'),
					startIndex,
					endIndex: lineStartIndex
				});
				inAppendix = false;
				appendixTitle = '';
				appendixContent = [];
			} else {
				// Continue collecting appendix content
				appendixContent.push(line);
			}
		}

		lineStartIndex += line.length + 1;
	}

	// If still in appendix at end of text, finish it
	if (inAppendix && appendixContent.length > 0) {
		appendices.push({
			title: appendixTitle,
			content: appendixContent.join('\n'),
			startIndex,
			endIndex: lineStartIndex
		});
	}

	return appendices;
}
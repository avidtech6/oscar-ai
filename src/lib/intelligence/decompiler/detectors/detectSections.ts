/**
 * Section Detector
 * 
 * Divides text into sections based on detected headings.
 * Each section includes its heading and the content until the next heading.
 */

import type { DetectedHeading } from './detectHeadings';
import { detectHeadings } from './detectHeadings';

export interface DetectedSection {
	heading: DetectedHeading | null;
	content: string;
	startIndex: number;
	endIndex: number;
	subsections: DetectedSection[];
}

export function detectSections(text: string): DetectedSection[] {
	const headings = detectHeadings(text);
	if (headings.length === 0) {
		// No headings, treat entire text as a single section
		return [{
			heading: null,
			content: text,
			startIndex: 0,
			endIndex: text.length,
			subsections: []
		}];
	}

	const sections: DetectedSection[] = [];
	let previousHeading: DetectedHeading | null = null;
	let previousEnd = 0;

	// For each heading, create a section from previous heading's end to this heading's start
	for (let i = 0; i < headings.length; i++) {
		const heading = headings[i];
		const sectionStart = previousEnd;
		const sectionEnd = heading.startIndex;

		if (sectionStart < sectionEnd) {
			const content = text.substring(sectionStart, sectionEnd).trim();
			sections.push({
				heading: previousHeading,
				content,
				startIndex: sectionStart,
				endIndex: sectionEnd,
				subsections: []
			});
		}

		previousHeading = heading;
		previousEnd = heading.endIndex;
	}

	// Add final section after last heading
	const finalStart = previousEnd;
	if (finalStart < text.length) {
		const content = text.substring(finalStart).trim();
		sections.push({
			heading: previousHeading,
			content,
			startIndex: finalStart,
			endIndex: text.length,
			subsections: []
		});
	}

	// Build hierarchy based on heading levels
	return buildSectionHierarchy(sections);
}

function buildSectionHierarchy(sections: DetectedSection[]): DetectedSection[] {
	const rootSections: DetectedSection[] = [];
	const stack: { section: DetectedSection; level: number }[] = [];

	for (const section of sections) {
		const level = section.heading?.level ?? 0;

		// Pop stack until we find a parent with lower level
		while (stack.length > 0 && stack[stack.length - 1].level >= level) {
			stack.pop();
		}

		if (stack.length === 0) {
			// This is a root section
			rootSections.push(section);
			stack.push({ section, level });
		} else {
			// Add as subsection of the last section in stack
			const parent = stack[stack.length - 1].section;
			parent.subsections.push(section);
			stack.push({ section, level });
		}
	}

	return rootSections;
}
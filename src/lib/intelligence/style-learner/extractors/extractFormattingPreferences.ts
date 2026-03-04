/**
 * Extract formatting preferences from decompiled report.
 * 
 * Detects preferences like heading levels, bullet styles, numbering, etc.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';

export function extractFormattingPreferences(decompiledReport: DecompiledReport): Record<string, any> {
	const prefs: Record<string, any> = {};

	// 1. Heading levels used
	const headingLevels = decompiledReport.sections.flatMap(s => [s.level, ...s.subsections.map(sub => sub.level)]);
	const uniqueLevels = [...new Set(headingLevels)].sort();
	if (uniqueLevels.length > 0) {
		prefs.headingLevels = uniqueLevels;
	}

	// 2. Bullet style detection (simplified)
	const content = decompiledReport.sections.map(s => s.content).join(' ');
	if (content.includes('•') || content.includes('▪')) prefs.bulletStyle = 'round';
	if (content.includes('- ') || content.includes('— ')) prefs.bulletStyle = 'dash';
	if (content.includes('* ')) prefs.bulletStyle = 'asterisk';

	// 3. Numbering detection
	if (content.match(/\d+\.\s+\w/)) prefs.numberedLists = true;

	// 4. Use of bold/italic (markdown or HTML)
	if (content.includes('**') || content.includes('__')) prefs.boldEmphasis = true;
	if (content.includes('*') && content.includes('* ') === false) prefs.italicEmphasis = true;

	// 5. Use of tables
	if (decompiledReport.sections.some(s => s.content.includes('|'))) prefs.tables = true;

	// 6. Use of images (placeholder)
	if (content.includes('![') || content.includes('<img')) prefs.images = true;

	// 7. Use of footnotes
	if (content.includes('[^') || content.includes('Footnote')) prefs.footnotes = true;

	return prefs;
}
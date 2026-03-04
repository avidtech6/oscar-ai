/**
 * Extract paragraph patterns from decompiled report content.
 * 
 * Detects patterns like topic sentence first, conclusion at end, etc.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';

export function extractParagraphPatterns(decompiledReport: DecompiledReport): string[] {
	const patterns: string[] = [];
	const content = decompiledReport.sections.map(s => s.content).join('\n\n');

	// Split into paragraphs (double newline)
	const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

	if (paragraphs.length === 0) return [];

	// 1. Topic sentence first detection (first sentence is a clear topic)
	let topicFirstCount = 0;
	for (const para of paragraphs) {
		const sentences = para.split(/[.!?]+/);
		if (sentences.length > 0) {
			const first = sentences[0].toLowerCase();
			if (first.includes('this section') || first.includes('the purpose') || first.includes('in this')) {
				topicFirstCount++;
			}
		}
	}
	if (topicFirstCount > paragraphs.length * 0.5) patterns.push('topic sentence first');

	// 2. Conclusion at end detection (last sentence is a summary)
	let conclusionEndCount = 0;
	for (const para of paragraphs) {
		const sentences = para.split(/[.!?]+/);
		if (sentences.length > 1) {
			const last = sentences[sentences.length - 1].toLowerCase();
			if (last.includes('therefore') || last.includes('thus') || last.includes('in conclusion') || last.includes('summary')) {
				conclusionEndCount++;
			}
		}
	}
	if (conclusionEndCount > paragraphs.length * 0.3) patterns.push('conclusion at end');

	// 3. Paragraph length patterns
	const avgParaLength = paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length;
	if (avgParaLength < 50) patterns.push('short paragraphs');
	if (avgParaLength > 150) patterns.push('long paragraphs');

	// 4. Use of bullet points within paragraphs (already captured)
	// 5. Use of headings within sections (already captured)

	return patterns;
}
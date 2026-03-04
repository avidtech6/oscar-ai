/**
 * Extract sentence patterns from decompiled report content.
 * 
 * Detects patterns like passive voice, short sentences, bullet lists, etc.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';

export function extractSentencePatterns(decompiledReport: DecompiledReport): string[] {
	const patterns: string[] = [];
	const content = decompiledReport.sections.map(s => s.content).join(' ');

	// Split into sentences (simplified)
	const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);

	if (sentences.length === 0) return [];

	// 1. Average sentence length
	const avgLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
	if (avgLength < 10) patterns.push('short sentences');
	if (avgLength > 25) patterns.push('long sentences');

	// 2. Passive voice detection (simple)
	const passiveRegex = /\b(am|is|are|was|were|be|been|being)\s+[a-z]+ed\b/gi;
	const passiveCount = sentences.filter(s => passiveRegex.test(s)).length;
	if (passiveCount > sentences.length * 0.3) patterns.push('passive voice');

	// 3. Bullet list detection (already captured by decompiler)
	const listCount = decompiledReport.sections.flatMap(s => s.subsections).length;
	if (listCount > 5) patterns.push('bullet lists');

	// 4. Question usage
	const questionCount = sentences.filter(s => s.includes('?')).length;
	if (questionCount > 0) patterns.push('questions');

	// 5. Imperative sentences (commands)
	const imperativeCount = sentences.filter(s => /^\s*(please|ensure|make sure|do|don’t)/i.test(s)).length;
	if (imperativeCount > 0) patterns.push('imperative sentences');

	return patterns;
}
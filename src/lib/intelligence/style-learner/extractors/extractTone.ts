/**
 * Extract tone from decompiled report content.
 * 
 * Determines whether the writing style is formal, informal, technical, conversational, or neutral.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';

export type Tone = 'formal' | 'informal' | 'technical' | 'conversational' | 'neutral';

export function extractTone(decompiledReport: DecompiledReport): Tone {
	const content = decompiledReport.sections.map(s => s.content).join(' ').toLowerCase();

	// Simple keyword‑based detection
	const formalKeywords = ['shall', 'must', 'required', 'hereby', 'pursuant', 'hereinafter'];
	const informalKeywords = ['we', 'our', 'you', 'your', 'let’s', 'don’t', 'can’t'];
	const technicalKeywords = ['specification', 'parameter', 'algorithm', 'implementation', 'protocol'];
	const conversationalKeywords = ['okay', 'well', 'actually', 'basically', 'anyway'];

	let formalScore = 0;
	let informalScore = 0;
	let technicalScore = 0;
	let conversationalScore = 0;

	for (const word of content.split(/\W+/)) {
		if (formalKeywords.includes(word)) formalScore++;
		if (informalKeywords.includes(word)) informalScore++;
		if (technicalKeywords.includes(word)) technicalScore++;
		if (conversationalKeywords.includes(word)) conversationalScore++;
	}

	const scores = [
		{ tone: 'formal', score: formalScore },
		{ tone: 'informal', score: informalScore },
		{ tone: 'technical', score: technicalScore },
		{ tone: 'conversational', score: conversationalScore },
		{ tone: 'neutral', score: 1 } // default
	];

	// Find highest score
	const best = scores.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));
	return best.tone as Tone;
}
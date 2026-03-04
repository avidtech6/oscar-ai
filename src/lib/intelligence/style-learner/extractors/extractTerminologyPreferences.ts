/**
 * Extract terminology preferences from decompiled report.
 * 
 * Detects preferred terms over synonyms.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';

export function extractTerminologyPreferences(decompiledReport: DecompiledReport): string[] {
	// Use the terminology already extracted by the decompiler
	return decompiledReport.terminology || [];
}
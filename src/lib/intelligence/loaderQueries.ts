/**
 * Phase File Loader Queries
 * 
 * Query functions for searching and filtering Phase Files.
 */

import type { PhaseFile, PhaseMetadata } from './types';
import { loadPhaseFiles } from './loaderCore';
import { parsePhaseMetadata } from './metadataParser';

/**
 * Get a specific Phase File by number
 */
export async function getPhaseFileByNumber(phaseNumber: number): Promise<PhaseFile | undefined> {
	const phaseFiles = await loadPhaseFiles();
	return phaseFiles.find(file => {
		const metadata = parsePhaseMetadata(file);
		return metadata.phaseNumber === phaseNumber;
	});
}

/**
 * Get Phase Files by category
 */
export async function getPhaseFilesByCategory(category: PhaseMetadata['category']): Promise<PhaseFile[]> {
	const phaseFiles = await loadPhaseFiles();
	return phaseFiles.filter(file => {
		const metadata = parsePhaseMetadata(file);
		return metadata.category === category;
	});
}

/**
 * Search Phase Files by keyword
 */
export async function searchPhaseFiles(keyword: string): Promise<PhaseFile[]> {
	const phaseFiles = await loadPhaseFiles();
	const lowerKeyword = keyword.toLowerCase();
	
	return phaseFiles.filter(file => {
		const metadata = parsePhaseMetadata(file);
		return (
			metadata.title.toLowerCase().includes(lowerKeyword) ||
			metadata.summary.toLowerCase().includes(lowerKeyword) ||
			file.content.toLowerCase().includes(lowerKeyword)
		);
	});
}

/**
 * Get statistics about Phase Files
 */
export async function getPhaseFileStats(): Promise<{
	total: number;
	byCategory: Record<string, number>;
	executionPrompts: number;
	averageSize: number;
}> {
	const phaseFiles = await loadPhaseFiles();
	const byCategory: Record<string, number> = {};
	let executionPrompts = 0;
	let totalSize = 0;
	
	for (const file of phaseFiles) {
		const metadata = parsePhaseMetadata(file);
		const category = metadata.category;
		byCategory[category] = (byCategory[category] || 0) + 1;
		
		if (metadata.isExecutionPrompt) {
			executionPrompts++;
		}
		
		totalSize += file.size;
	}
	
	return {
		total: phaseFiles.length,
		byCategory,
		executionPrompts,
		averageSize: phaseFiles.length > 0 ? Math.round(totalSize / phaseFiles.length) : 0
	};
}
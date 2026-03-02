/**
 * Phase File Loader + Parser
 * 
 * This module handles loading all Phase Files from the intelligence directory
 * and parsing metadata from their content.
 * 
 * Responsibilities:
 * - Import all .md files from src/lib/intelligence/
 * - Read them as strings
 * - Parse metadata (phase number, title, summary)
 * - Return structured objects
 * - Ensure type safety with TypeScript interfaces
 */

import type { PhaseFile, PhaseMetadata } from './types';

/**
 * Load all Phase Files from the intelligence directory
 */
export async function loadPhaseFiles(): Promise<PhaseFile[]> {
	const phaseFiles: PhaseFile[] = [];
	
	try {
		// Get all .md files from the intelligence directory
		const mdFiles = await getPhaseFileList();
		
		for (const filename of mdFiles) {
			try {
				const content = await loadPhaseFileContent(filename);
				const file: PhaseFile = {
					filename,
					content,
					path: `src/lib/intelligence/${filename}`,
					size: content.length,
					modified: new Date() // In a real implementation, this would come from file system
				};
				phaseFiles.push(file);
			} catch (error) {
				console.warn(`Failed to load phase file ${filename}:`, error);
			}
		}
		
		console.log(`Loaded ${phaseFiles.length} Phase Files`);
		return phaseFiles;
	} catch (error) {
		console.error('Failed to load Phase Files:', error);
		throw error;
	}
}

/**
 * Get list of Phase File names
 * In a real implementation, this would read from the file system
 * For now, we return a hardcoded list based on known Phase Files
 */
async function getPhaseFileList(): Promise<string[]> {
	return [
		'PHASE_0_MASTER_VISION_COPILOT_LAYER.md',
		'PHASE_1_REPORT_TYPE_REGISTRY.md',
		'PHASE_2_REPORT_DECOMPILER_ENGINE.md',
		'PHASE_3_REPORT_SCHEMA_MAPPER.md',
		'PHASE_4_SCHEMA_UPDATER_ENGINE.md',
		'PHASE_5_REPORT_STYLE_LEARNER.md',
		'PHASE_6_REPORT_CLASSIFICATION_ENGINE.md',
		'PHASE_7_REPORT_SELF_HEALING_ENGINE.md',
		'PHASE_8_REPORT_TEMPLATE_GENERATOR.md',
		'PHASE_9_REPORT_COMPLIANCE_VALIDATOR.md',
		'PHASE_10_REPORT_REPRODUCTION_TESTER.md',
		'PHASE_11_REPORT_TYPE_EXPANSION_FRAMEWORK.md',
		'PHASE_12_AI_REASONING_INTEGRATION_FOR_REPORTS.md',
		'PHASE_13_USER_WORKFLOW_LEARNING_FOR_REPORTS.md',
		'PHASE_14_FINAL_INTEGRATION_AND_VALIDATION.md',
		'PHASE_15_HTML_RENDERING_VISUAL_REPRODUCTION_ENGINE.md',
		'PHASE_16_DIRECT_PDF_PARSING_AND_LAYOUT_EXTRACTION_ENGINE.md',
		'PHASE_17_CONTENT_INTELLIGENCE_AND_BLOG_POST_ENGINE.md',
		'PHASE_18_UNIFIED_EDITOR_AND_SUPABASE_INTEGRATION.md',
		'PHASE_19_EMAIL_CALENDAR_TASK_INTELLIGENCE_LAYER.md',
		'PHASE_20_FULL_SYSTEM_TESTING_AND_DEBUGGING.md',
		'PHASE_21_GLOBAL_ASSISTANT_INTELLIGENCE_LAYER.md',
		'PHASE_22_MEDIA_INTELLIGENCE_LAYER.md',
		'PHASE_23_AI_LAYOUT_ENGINE.md',
		'PHASE_24_DOCUMENT_INTELLIGENCE_LAYER.md',
		'PHASE_25_WORKFLOW_INTELLIGENCE_LAYER.md',
		'PHASE_26_FINAL_SYSTEM_INTEGRATION_AND_BUILD_PREP.md',
		'PHASE_26_FINAL_SYSTEM_INTEGRATION_AND_BUILD_PREPARATION.md',
		'PHASE_INDEX_REPORT_INTELLIGENCE.md',
		'Phase26ArchitectureConsolidation.md',
		'Phase26FinalBuildSpec.md',
		'Phase26IntegrationTestingSpec.md',
		'Phase26PerformanceTestScenarios.md',
		'Phase26UXConsistencyRules.md'
	];
}

/**
 * Load Phase File content
 * In a real implementation, this would read from the file system
 * For now, we return placeholder content
 */
async function loadPhaseFileContent(filename: string): Promise<string> {
	// In a real implementation, this would be:
	// return await fs.readFile(`src/lib/intelligence/${filename}`, 'utf-8');
	
	// For now, return a placeholder that includes the filename
	return `# ${filename}\n\nThis is placeholder content for ${filename}. In a real implementation, this would be the actual Phase File content from the file system.\n\nPhase Files are the authoritative architectural blueprint for Oscar AI V2.`;
}

/**
 * Parse metadata from Phase File content
 */
export function parsePhaseMetadata(phaseFile: PhaseFile): PhaseMetadata {
	const { filename, content } = phaseFile;
	
	// Extract phase number from filename
	const phaseNumber = extractPhaseNumber(filename);
	
	// Extract title from first line of content
	const title = extractTitle(content);
	
	// Extract summary from content
	const summary = extractSummary(content);
	
	// Extract objectives
	const objectives = extractSection(content, 'OBJECTIVE', 'CRITICAL REQUIREMENTS');
	
	// Extract requirements
	const requirements = extractSection(content, 'CRITICAL REQUIREMENTS', 'FILES AND FOLDERS');
	
	// Extract files
	const files = extractSection(content, 'FILES AND FOLDERS', 'IMPLEMENTATION DETAILS');
	
	// Extract completion criteria
	const completionCriteria = extractSection(content, 'COMPLETION CRITERIA', 'END OF PHASE');
	
	// Determine if this is an execution prompt
	const isExecutionPrompt = content.includes('EXECUTION PROMPT') || content.includes('ACT‑BUILD PROMPT');
	
	// Determine category based on phase number and content
	const category = determineCategory(phaseNumber, content);
	
	return {
		phaseNumber,
		title,
		summary,
		objectives,
		requirements,
		files,
		completionCriteria,
		isExecutionPrompt,
		category
	};
}

/**
 * Extract phase number from filename
 */
function extractPhaseNumber(filename: string): number {
	// Try to extract number from patterns like PHASE_1_, PHASE_2_, etc.
	const match = filename.match(/PHASE_(\d+)_/);
	if (match) {
		return parseInt(match[1], 10);
	}
	
	// Try alternative patterns
	const altMatch = filename.match(/Phase(\d+)/);
	if (altMatch) {
		return parseInt(altMatch[1], 10);
	}
	
	// Default to 0 if no number found
	return 0;
}

/**
 * Extract title from content
 */
function extractTitle(content: string): string {
	const lines = content.split('\n');
	for (const line of lines) {
		if (line.includes('PHASE') && line.includes('—')) {
			return line.trim();
		}
		if (line.includes('PHASE') && line.includes(':')) {
			return line.trim();
		}
	}
	
	// Fallback to first non-empty line
	for (const line of lines) {
		if (line.trim().length > 0) {
			return line.trim();
		}
	}
	
	return 'Unknown Phase';
}

/**
 * Extract summary from content
 */
function extractSummary(content: string): string {
	const lines = content.split('\n');
	let inSummary = false;
	const summaryLines: string[] = [];
	
	for (const line of lines) {
		if (line.includes('OBJECTIVE') || line.includes('SUMMARY') || line.includes('Purpose:')) {
			inSummary = true;
			continue;
		}
		
		if (inSummary && (line.includes('===') || line.includes('---') || line.trim().length === 0)) {
			break;
		}
		
		if (inSummary && line.trim().length > 0) {
			summaryLines.push(line.trim());
		}
	}
	
	if (summaryLines.length > 0) {
		return summaryLines.join(' ').substring(0, 200) + '...';
	}
	
	// Fallback: first 3 non-empty lines
	const firstLines = lines.filter(line => line.trim().length > 0).slice(0, 3);
	return firstLines.join(' ').substring(0, 200) + '...';
}

/**
 * Extract section from content between start and end markers
 */
function extractSection(content: string, startMarker: string, endMarker: string): string[] {
	const lines = content.split('\n');
	let inSection = false;
	const sectionLines: string[] = [];
	
	for (const line of lines) {
		if (line.includes(startMarker)) {
			inSection = true;
			continue;
		}
		
		if (line.includes(endMarker)) {
			break;
		}
		
		if (inSection && line.trim().length > 0 && !line.includes('===') && !line.includes('---')) {
			sectionLines.push(line.trim());
		}
	}
	
	return sectionLines;
}

/**
 * Determine category based on phase number and content
 */
function determineCategory(phaseNumber: number, content: string): PhaseMetadata['category'] {
	// Map phase numbers to categories
	if (phaseNumber >= 1 && phaseNumber <= 11) return 'report';
	if (phaseNumber >= 12 && phaseNumber <= 14) return 'intelligence';
	if (phaseNumber >= 15 && phaseNumber <= 19) return 'integration';
	if (phaseNumber >= 20 && phaseNumber <= 22) return 'testing';
	if (phaseNumber >= 23 && phaseNumber <= 26) return 'workflow';
	
	// Fallback based on content keywords
	const lowerContent = content.toLowerCase();
	if (lowerContent.includes('report')) return 'report';
	if (lowerContent.includes('workflow')) return 'workflow';
	if (lowerContent.includes('schema')) return 'schema';
	if (lowerContent.includes('intelligence')) return 'intelligence';
	if (lowerContent.includes('integration')) return 'integration';
	if (lowerContent.includes('test')) return 'testing';
	
	return 'other';
}

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
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

// Re-export all loader components from split modules
export { loadPhaseFiles, getPhaseFileList, loadPhaseFileContent } from './loaderCore';
export { parsePhaseMetadata, extractPhaseNumber, extractTitle, extractSummary, extractSection, determineCategory } from './metadataParser';
export { getPhaseFileByNumber, getPhaseFilesByCategory, searchPhaseFiles, getPhaseFileStats } from './loaderQueries';
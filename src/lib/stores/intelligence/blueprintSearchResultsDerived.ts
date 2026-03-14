/**
 * Derived stores for blueprint search results
 */

import { derived } from 'svelte/store';
import { blueprintSearchResults } from './blueprintSearchResults';
import { extractPhaseNumber } from './blueprintSearchResultsHelpers';

/** Derived store for filtered results */
export const filteredResults = derived(
	[blueprintSearchResults],
	([$search]) => {
		let results = $search.results;
		
		// Filter by phase if specified
		if ($search.ui.filterByPhase !== undefined) {
			results = results.filter(result => {
				const phaseNumber = extractPhaseNumber(result.phaseFile.filename);
				return phaseNumber === $search.ui.filterByPhase;
			});
		}
		
		// Filter by selected only if enabled
		if ($search.ui.showOnlySelected) {
			results = results.filter(result => result.isSelected);
		}
		
		// Sort results
		switch ($search.ui.sortBy) {
			case 'phase':
				results.sort((a, b) => {
					const phaseA = extractPhaseNumber(a.phaseFile.filename);
					const phaseB = extractPhaseNumber(b.phaseFile.filename);
					return phaseA - phaseB;
				});
				break;
			case 'title':
				results.sort((a, b) => 
					a.phaseFile.filename.localeCompare(b.phaseFile.filename)
				);
				break;
			case 'score':
				results.sort((a, b) => b.score - a.score);
				break;
			case 'relevance':
			default:
				results.sort((a, b) => b.score - a.score);
				break;
		}
		
		return results;
	}
);

/** Derived store for search statistics */
export const searchStatistics = derived(blueprintSearchResults, $search => ({
	totalResults: $search.results.length,
	selectedCount: $search.selectedIds.length,
	expandedCount: $search.expandedIds.length,
	totalMatches: $search.metadata.totalMatches,
	phaseCount: $search.metadata.phaseCount,
	searchTime: $search.metadata.searchTime,
	executedAt: $search.metadata.executedAt,
	hasResults: $search.results.length > 0,
	hasSelected: $search.selectedIds.length > 0,
	queryLength: $search.query.length
}));

/** Derived store for tag statistics */
export const tagStatistics = derived(blueprintSearchResults, $search => {
	const tagCounts: Record<string, number> = {};
	
	$search.results.forEach(result => {
		result.tags.forEach(tag => {
			tagCounts[tag] = (tagCounts[tag] || 0) + 1;
		});
	});
	
	return {
		tags: Object.entries(tagCounts)
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count),
		totalTags: Object.keys(tagCounts).length,
		mostCommonTag: Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none'
	};
});

/** Derived store for UI state */
export const searchUIState = derived(blueprintSearchResults, $search => $search.ui);
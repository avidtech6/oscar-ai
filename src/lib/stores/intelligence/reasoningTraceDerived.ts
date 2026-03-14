/**
 * Derived stores for reasoning trace
 */

import { derived } from 'svelte/store';
import { reasoningTrace } from './reasoningTrace';

/** Derived store for filtered entries */
export const filteredTraceEntries = derived(
	[reasoningTrace],
	([$trace]) => {
		let entries = $trace.entries;
		
		// Apply confidence filter
		entries = entries.filter(entry => 
			entry.confidence >= $trace.filters.minConfidence && 
			entry.confidence <= $trace.filters.maxConfidence
		);
		
		// Apply phase filter
		if ($trace.filters.phaseFilter !== undefined) {
			entries = entries.filter(entry => 
				entry.phaseReferences.includes($trace.filters.phaseFilter!)
			);
		}
		
		// Apply decision point filter
		if ($trace.filters.decisionPointFilter) {
			const filter = $trace.filters.decisionPointFilter.toLowerCase();
			entries = entries.filter(entry => 
				entry.decisionPoint.toLowerCase().includes(filter)
			);
		}
		
		// Apply date range filter
		if ($trace.filters.dateRange) {
			const { start, end } = $trace.filters.dateRange;
			entries = entries.filter(entry => 
				entry.timestamp >= start && entry.timestamp <= end
			);
		}
		
		// Filter by selected only if enabled
		if ($trace.ui.showOnlySelected) {
			entries = entries.filter(entry => entry.isSelected);
		}
		
		// Sort entries
		switch ($trace.ui.sortBy) {
			case 'confidence':
				entries.sort((a, b) => b.confidence - a.confidence);
				break;
			case 'phase':
				entries.sort((a, b) => {
					const phaseA = a.phaseReferences.length > 0 ? Math.min(...a.phaseReferences) : 0;
					const phaseB = b.phaseReferences.length > 0 ? Math.min(...b.phaseReferences) : 0;
					return phaseA - phaseB;
				});
				break;
			case 'timestamp':
			default:
				entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Newest first
				break;
		}
		
		return entries;
	}
);

/** Derived store for trace statistics */
export const traceStatistics = derived(reasoningTrace, $trace => {
	const entries = $trace.entries;
	const totalEntries = entries.length;
	
	if (totalEntries === 0) {
		return {
			totalEntries: 0,
			averageConfidence: 0,
			phaseCoverage: 0,
			decisionPoints: 0,
			timeSpan: 0,
			hasEntries: false
		};
	}
	
	// Calculate average confidence
	const totalConfidence = entries.reduce((sum, entry) => sum + entry.confidence, 0);
	const averageConfidence = totalConfidence / totalEntries;
	
	// Calculate phase coverage
	const allPhaseReferences = entries.flatMap(entry => entry.phaseReferences);
	const uniquePhases = new Set(allPhaseReferences).size;
	const phaseCoverage = uniquePhases;
	
	// Count unique decision points
	const uniqueDecisionPoints = new Set(entries.map(entry => entry.decisionPoint)).size;
	
	// Calculate time span
	const timestamps = entries.map(entry => entry.timestamp.getTime());
	const minTime = Math.min(...timestamps);
	const maxTime = Math.max(...timestamps);
	const timeSpan = maxTime - minTime; // in milliseconds
	
	return {
		totalEntries,
		averageConfidence: Math.round(averageConfidence * 10) / 10,
		phaseCoverage,
		decisionPoints: uniqueDecisionPoints,
		timeSpan,
		hasEntries: true,
		selectedCount: $trace.selectedIds.length,
		expandedCount: $trace.expandedIds.length
	};
});

/** Derived store for phase statistics */
export const phaseStatistics = derived(reasoningTrace, $trace => {
	const phaseCounts: Record<number, number> = {};
	const phaseConfidences: Record<number, number[]> = {};
	
	$trace.entries.forEach(entry => {
		entry.phaseReferences.forEach(phase => {
			phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
			if (!phaseConfidences[phase]) {
				phaseConfidences[phase] = [];
			}
			phaseConfidences[phase].push(entry.confidence);
		});
	});
	
	const phaseStats = Object.entries(phaseCounts).map(([phase, count]) => {
		const phaseNum = parseInt(phase);
		const confidences = phaseConfidences[phaseNum] || [];
		const avgConfidence = confidences.length > 0 
			? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
			: 0;
		
		return {
			phase: phaseNum,
			count,
			averageConfidence: Math.round(avgConfidence * 10) / 10,
			percentage: Math.round((count / $trace.entries.length) * 1000) / 10
		};
	}).sort((a, b) => b.count - a.count);
	
	return {
		phases: phaseStats,
		totalPhases: phaseStats.length,
		mostReferencedPhase: phaseStats[0]?.phase || 0,
		leastReferencedPhase: phaseStats[phaseStats.length - 1]?.phase || 0
	};
});

/** Derived store for confidence distribution */
export const confidenceDistribution = derived(reasoningTrace, $trace => {
	const distribution: Record<string, number> = {
		'0-20': 0,
		'21-40': 0,
		'41-60': 0,
		'61-80': 0,
		'81-100': 0
	};
	
	$trace.entries.forEach(entry => {
		if (entry.confidence <= 20) distribution['0-20']++;
		else if (entry.confidence <= 40) distribution['21-40']++;
		else if (entry.confidence <= 60) distribution['41-60']++;
		else if (entry.confidence <= 80) distribution['61-80']++;
		else distribution['81-100']++;
	});
	
	return {
		distribution,
		total: $trace.entries.length,
		hasHighConfidence: distribution['81-100'] > 0,
		hasLowConfidence: distribution['0-20'] > 0
	};
});

/** Derived store for UI state */
export const traceUIState = derived(reasoningTrace, $trace => $trace.ui);
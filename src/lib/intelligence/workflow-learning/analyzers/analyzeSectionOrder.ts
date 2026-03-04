/**
 * Analyze Section Order
 * 
 * Observes the sequence in which a user completes sections during report creation.
 * Detects common ordering patterns across multiple reports.
 */

import type { WorkflowProfile } from '../WorkflowProfile';

export interface SectionOrderObservation {
	reportId: string;
	reportTypeId: string;
	sectionOrder: string[];
	timestamp: Date;
}

/**
 * Analyze observed section orders to update the profile's commonSectionOrder.
 */
export function analyzeSectionOrder(
	observations: SectionOrderObservation[],
	existingProfile: WorkflowProfile
): WorkflowProfile {
	if (observations.length === 0) {
		return existingProfile;
	}

	// Group observations by report type (if profile is report‑type‑specific)
	const relevantObservations = existingProfile.reportTypeId
		? observations.filter(o => o.reportTypeId === existingProfile.reportTypeId)
		: observations;

	if (relevantObservations.length === 0) {
		return existingProfile;
	}

	// Compute frequency of each section appearing at each position
	const positionFrequency: Record<number, Record<string, number>> = {};
	const sectionFrequency: Record<string, number> = {};

	for (const obs of relevantObservations) {
		obs.sectionOrder.forEach((section, index) => {
			if (!positionFrequency[index]) {
				positionFrequency[index] = {};
			}
			positionFrequency[index][section] = (positionFrequency[index][section] || 0) + 1;
			sectionFrequency[section] = (sectionFrequency[section] || 0) + 1;
		});
	}

	// Determine most common order by picking the most frequent section at each position
	const maxLength = Math.max(...Object.keys(positionFrequency).map(k => parseInt(k)));
	const commonOrder: string[] = [];

	for (let i = 0; i <= maxLength; i++) {
		const freqMap = positionFrequency[i];
		if (!freqMap) {
			break;
		}
		const mostFrequent = Object.entries(freqMap).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
		commonOrder.push(mostFrequent);
	}

	// Merge with existing commonSectionOrder (weighted average)
	const existingOrder = existingProfile.commonSectionOrder;
	const mergedOrder = mergeSectionOrders(existingOrder, commonOrder);

	// Update confidence score based on number of observations
	const confidenceBoost = Math.min(0.3, relevantObservations.length * 0.05);
	const newConfidence = Math.min(1.0, existingProfile.confidenceScore + confidenceBoost);

	return {
		...existingProfile,
		commonSectionOrder: mergedOrder,
		confidenceScore: newConfidence,
	};
}

/**
 * Merge two section orders, preserving sections that appear in both and ordering by frequency.
 */
function mergeSectionOrders(orderA: string[], orderB: string[]): string[] {
	const allSections = [...new Set([...orderA, ...orderB])];
	// Simple heuristic: keep order from B if it's longer, otherwise keep order from A
	if (orderB.length >= orderA.length) {
		return orderB;
	}
	return orderA;
}
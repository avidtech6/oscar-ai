import { writable } from 'svelte/store';
import type { ProjectInsight } from './projectInsightsEngine';
import type { CopilotContext } from '$lib/copilot/context/contextTypes';
import type { Project } from '$lib/db';

// Store for project insights
export const projectInsights = writable<ProjectInsight[]>([]);

/**
 * Clear all project insights
 */
export function clearProjectInsights(): void {
	projectInsights.set([]);
}

/**
 * Update project insights based on current project and context
 */
export async function updateProjectInsights(
	project: Project,
	context: CopilotContext
): Promise<void> {
	try {
		// Import dynamically to avoid circular dependencies
		const { getProjectInsights } = await import('./projectInsightsEngine');
		const insights = await getProjectInsights(project, context);
		projectInsights.set(insights);
	} catch (error) {
		console.error('Failed to update project insights:', error);
		projectInsights.set([]);
	}
}

/**
 * Apply a project insight action by inserting its text into the Copilot bar
 * This function should be called from UI components when an insight button is clicked
 */
export function applyProjectInsight(insight: ProjectInsight): void {
	if (!insight.action) return;
	
	// Dispatch a custom event that the CopilotBar can listen for
	const event = new CustomEvent('insightAction', {
		detail: { action: insight.action }
	});
	window.dispatchEvent(event);
	
	// Clear insights after one is selected (user is taking action)
	clearProjectInsights();
}

/**
 * Shorten insight labels for mobile display
 */
export function shortenInsightForMobile(label: string): string {
	if (label.length <= 40) return label;

	// Common patterns to shorten
	const shortenMap: Record<string, string> = {
		"You may want to review them.": "Review",
		"Here are a few things that stand out.": "Highlights",
		"If helpful, I can summarise this.": "Summarise",
		"You may want to add some observations.": "Add observations",
		"You may want to plan next steps.": "Plan next steps",
		"You may want to add visual documentation.": "Add photos",
		"You may want to review transcripts.": "Review transcripts",
		"You may want to attach it to a note or task.": "Attach to note/task",
		"You may want to review the project for finalisation.": "Finalise project",
		"You may want to start with observations or tasks.": "Start project"
	};

	// Check if we have a direct mapping for common phrases
	for (const [phrase, shortened] of Object.entries(shortenMap)) {
		if (label.includes(phrase)) {
			return label.replace(phrase, shortened);
		}
	}

	// Generic shortening: take first 40 characters and add ellipsis
	return label.substring(0, 37) + "…";
}
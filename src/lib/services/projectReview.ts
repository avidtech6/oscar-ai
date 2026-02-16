import type { Project, Tree, Note } from '$lib/db';
import { db } from '$lib/db';

export interface ProjectReviewResult {
	needsReview: boolean;
	issues: Array<{
		type: 'missing-field' | 'ambiguity' | 'inconsistency' | 'missing-data' | 'low-confidence';
		field?: string;
		message: string;
		confidence?: number;
	}>;
	missingFields: string[];
}

/**
 * Check if a project needs AI review
 * Projects need review when:
 * 1. Missing essential fields (client name, location)
 * 2. Has trees with missing or low-confidence data
 * 3. Has notes with ambiguous content
 * 4. Has inconsistent data between trees and notes
 */
export async function checkProjectNeedsReview(projectId: string): Promise<ProjectReviewResult> {
	const issues: ProjectReviewResult['issues'] = [];
	const missingFields: string[] = [];

	// Load project data
	const project = await db.projects.get(projectId);
	if (!project) {
		return {
			needsReview: false,
			issues: [],
			missingFields: []
		};
	}

	// Check for missing essential fields
	if (!project.client || project.client.trim() === '') {
		missingFields.push('client');
		issues.push({
			type: 'missing-field',
			field: 'client',
			message: 'Client name is missing'
		});
	}

	if (!project.location || project.location.trim() === '') {
		missingFields.push('location');
		issues.push({
			type: 'missing-field',
			field: 'location',
			message: 'Project location is missing'
		});
	}

	// Check for missing description
	if (!project.description || project.description.trim() === '') {
		missingFields.push('description');
		issues.push({
			type: 'missing-field',
			field: 'description',
			message: 'Project description is missing'
		});
	}

	// Load trees and notes for deeper analysis
	const trees = await db.trees.where('projectId').equals(projectId).toArray();
	const notes = await db.notes.where('projectId').equals(projectId).toArray();

	// Check for trees with missing essential data
	for (const tree of trees) {
		if (!tree.species || tree.species.trim() === '') {
			issues.push({
				type: 'missing-data',
				field: 'species',
				message: `Tree ${tree.number || 'unnamed'} is missing species`
			});
		}

		if (!tree.category || tree.category.trim() === '') {
			issues.push({
				type: 'low-confidence',
				field: 'category',
				message: `Tree ${tree.number || 'unnamed'} has no category assigned`,
				confidence: 30
			});
		}

		if (tree.DBH <= 0) {
			issues.push({
				type: 'missing-data',
				field: 'DBH',
				message: `Tree ${tree.number || 'unnamed'} has invalid DBH measurement`
			});
		}
	}

	// Check for notes with ambiguous content
	for (const note of notes) {
		const content = note.content || '';
		const title = note.title || '';
		
		// Check for very short notes that might be incomplete
		if (content.length < 10 && title.length < 5) {
			issues.push({
				type: 'ambiguity',
				field: 'content',
				message: `Note "${title}" appears to be incomplete or ambiguous`
			});
		}

		// Check for notes with question marks or uncertainty indicators
		if (content.includes('?') || content.toLowerCase().includes('not sure') || content.toLowerCase().includes('maybe')) {
			issues.push({
				type: 'ambiguity',
				field: 'content',
				message: `Note "${title}" contains uncertain language`
			});
		}
	}

	// Check for data inconsistencies
	if (trees.length > 0 && notes.length === 0) {
		issues.push({
			type: 'inconsistency',
			message: 'Project has trees but no notes documenting observations'
		});
	}

	// Determine if project needs review
	const needsReview = issues.length > 0;

	return {
		needsReview,
		issues,
		missingFields
	};
}

/**
 * Get a summary of review status for display in badges
 */
export async function getProjectReviewStatus(projectId: string): Promise<{
	needsReview: boolean;
	issueCount: number;
	priority: 'high' | 'medium' | 'low';
}> {
	const result = await checkProjectNeedsReview(projectId);
	
	let priority: 'high' | 'medium' | 'low' = 'low';
	
	// Determine priority based on issue types
	const hasMissingFields = result.issues.some(issue => issue.type === 'missing-field');
	const hasInconsistencies = result.issues.some(issue => issue.type === 'inconsistency');
	
	if (hasMissingFields || hasInconsistencies) {
		priority = 'high';
	} else if (result.issues.length > 3) {
		priority = 'medium';
	}

	return {
		needsReview: result.needsReview,
		issueCount: result.issues.length,
		priority
	};
}

/**
 * Get all projects that need review
 */
export async function getProjectsNeedingReview(): Promise<Array<{
	projectId: string;
	projectName: string;
	issueCount: number;
	priority: 'high' | 'medium' | 'low';
}>> {
	const projects = await db.projects.toArray();
	const results = [];

	for (const project of projects) {
		if (!project.id) continue;
		
		const status = await getProjectReviewStatus(project.id);
		if (status.needsReview) {
			results.push({
				projectId: project.id,
				projectName: project.name,
				issueCount: status.issueCount,
				priority: status.priority
			});
		}
	}

	// Sort by priority (high first) then issue count
	return results.sort((a, b) => {
		const priorityOrder = { high: 3, medium: 2, low: 1 };
		if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
			return priorityOrder[b.priority] - priorityOrder[a.priority];
		}
		return b.issueCount - a.issueCount;
	});
}
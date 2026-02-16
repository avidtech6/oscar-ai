import { get } from 'svelte/store';
import { db } from '$lib/db';
import { chatContext } from '$lib/stores/chatContext';
import { settings } from '$lib/stores/settings';

export interface ContextInferenceResult {
	shouldSwitch: boolean;
	projectId?: string;
	projectName?: string;
	confidence: number;
	reason: string;
	multipleMatches?: Array<{ id: string; name: string }>;
}

export interface ProjectMatch {
	projectId: string;
	projectName: string;
	confidence: number;
	matches: string[];
}

// Enhanced project inference with better matching
export async function inferProjectFromMessage(message: string, projects?: any[]): Promise<ContextInferenceResult> {
	const msg = message.toLowerCase().trim();
	const currentChatContext = get(chatContext);
	
	// If projects not provided, fetch them
	let allProjects = projects;
	if (!allProjects) {
		allProjects = await db.projects.toArray();
	}
	
	// If already in project mode, check if message references other projects
	if (currentChatContext.mode === 'project' && currentChatContext.selectedProjectId) {
		const currentProject = allProjects.find(p => p.id === currentChatContext.selectedProjectId);
		if (currentProject) {
			// Check if message mentions "this project" or similar
			if (msg.includes('this project') || msg.includes('current project') || msg.includes('the project')) {
				return {
					shouldSwitch: false,
					projectId: currentProject.id,
					projectName: currentProject.name,
					confidence: 0.9,
					reason: 'Message references current project'
				};
			}
		}
	}
	
	if (allProjects.length === 0) {
		return {
			shouldSwitch: false,
			confidence: 0,
			reason: 'No projects available'
		};
	}
	
	// Find project matches with improved scoring
	const projectMatches: ProjectMatch[] = [];
	
	for (const project of allProjects) {
		const matches: string[] = [];
		let confidence = 0;
		
		const projectNameLower = project.name.toLowerCase();
		const projectClientLower = project.client ? project.client.toLowerCase() : '';
		const projectLocationLower = project.location ? project.location.toLowerCase() : '';
		
		// Exact project name match (highest confidence)
		if (msg.includes(projectNameLower)) {
			// Calculate position score - earlier mentions are more important
			const position = msg.indexOf(projectNameLower);
			const positionScore = position >= 0 ? 1 - (position / msg.length) : 0.5;
			matches.push(`Exact name match: "${project.name}"`);
			confidence += 0.8 * positionScore;
		}
		
		// Partial project name match
		const words = projectNameLower.split(/\s+/);
		for (const word of words) {
			if (word.length > 3 && msg.includes(word)) {
				matches.push(`Partial name match: "${word}"`);
				confidence += 0.4;
			}
		}
		
		// Client name match
		if (projectClientLower && msg.includes(projectClientLower)) {
			matches.push(`Client match: "${project.client}"`);
			confidence += 0.6;
		}
		
		// Location match
		if (projectLocationLower && msg.includes(projectLocationLower)) {
			matches.push(`Location match: "${project.location}"`);
			confidence += 0.5;
		}
		
		// Check for "file this in [project]" pattern
		const fileInPattern = new RegExp(`(?:file|save|put|add)\\s+(?:this|it|that)\\s+(?:in|to|under)\\s+([^,.!?]+)`, 'i');
		const fileInMatch = message.match(fileInPattern);
		if (fileInMatch) {
			const mentionedName = fileInMatch[1].trim().toLowerCase();
			if (projectNameLower.includes(mentionedName) || mentionedName.includes(projectNameLower)) {
				matches.push(`"File this in" pattern match`);
				confidence += 0.9;
			}
		}
		
		// Check for "for [project]" pattern
		const forPattern = new RegExp(`(?:for|about|regarding)\\s+([^,.!?]+)`, 'i');
		const forMatch = message.match(forPattern);
		if (forMatch) {
			const mentionedName = forMatch[1].trim().toLowerCase();
			if (projectNameLower.includes(mentionedName) || mentionedName.includes(projectNameLower)) {
				matches.push(`"For" pattern match`);
				confidence += 0.7;
			}
		}
		
		// Check for project abbreviations or codes
		if (project.code || project.abbreviation) {
			const code = (project.code || project.abbreviation).toLowerCase();
			if (msg.includes(code)) {
				matches.push(`Code/abbreviation match: "${code}"`);
				confidence += 0.8;
			}
		}
		
		if (confidence > 0 && project.id) {
			projectMatches.push({
				projectId: project.id,
				projectName: project.name,
				confidence,
				matches
			});
		}
	}
	
	// Sort by confidence
	projectMatches.sort((a, b) => b.confidence - a.confidence);
	
	if (projectMatches.length > 0) {
		const bestMatch = projectMatches[0];
		
		// Check if there are multiple high-confidence matches
		const highConfidenceMatches = projectMatches.filter(m => m.confidence >= 0.7);
		
		if (highConfidenceMatches.length > 1) {
			// Multiple projects match - ask user to choose
			return {
				shouldSwitch: true,
				projectId: '', // Empty to indicate multiple matches
				projectName: '',
				confidence: bestMatch.confidence,
				reason: `Multiple projects match: ${highConfidenceMatches.map(m => m.projectName).join(', ')}`,
				multipleMatches: highConfidenceMatches.map(m => ({ id: m.projectId, name: m.projectName }))
			};
		} else if (bestMatch.confidence >= 0.6) {
			// Single good match
			return {
				shouldSwitch: true,
				projectId: bestMatch.projectId,
				projectName: bestMatch.projectName,
				confidence: bestMatch.confidence,
				reason: `Message mentions project "${bestMatch.projectName}" (${bestMatch.matches.join(', ')})`
			};
		}
	}
	
	// Check for pronoun references
	const pronounResult = checkPronounReferences(msg, currentChatContext);
	if (pronounResult) {
		return pronounResult;
	}
	
	// Check for generic project references
	if (msg.includes('project') || msg.includes('client') || msg.includes('site') || msg.includes('job')) {
		// Generic project reference but no specific match
		return {
			shouldSwitch: false,
			confidence: 0.3,
			reason: 'Generic project reference detected but no specific match'
		};
	}
	
	return {
		shouldSwitch: false,
		confidence: 0,
		reason: 'No clear project reference detected'
	};
}

// Check for pronoun references
function checkPronounReferences(message: string, chatContext: any): ContextInferenceResult | null {
	if (message.includes('this') || message.includes('that') || message.includes('the last') || message.includes('previous')) {
		const lastAIMessage = chatContext.lastAIMessage;
		const lastReferencedItem = chatContext.lastReferencedItem;
		const lastCreatedItem = chatContext.lastCreatedItem;
		
		if (lastReferencedItem) {
			return {
				shouldSwitch: false,
				confidence: 0.8,
				reason: 'Pronoun reference detected to last referenced item'
			};
		} else if (lastCreatedItem) {
			return {
				shouldSwitch: false,
				confidence: 0.8,
				reason: 'Pronoun reference detected to last created item'
			};
		} else if (lastAIMessage) {
			return {
				shouldSwitch: false,
				confidence: 0.7,
				reason: 'Pronoun reference detected to last AI message'
			};
		}
	}
	
	return null;
}

// Propose context switch
export function proposeContextSwitch(inference: ContextInferenceResult): string {
	if (!inference.shouldSwitch || !inference.projectId || !inference.projectName) {
		return '';
	}
	
	return `Looks like this relates to **${inference.projectName}**. Save it there and focus on it?`;
}

// Handle pronoun references
export function resolvePronounReference(message: string, lastAIMessage: string, lastReferencedItem: any): string {
	const msg = message.toLowerCase();
	
	if (!msg.includes('this') && !msg.includes('that') && !msg.includes('the last') && !msg.includes('previous')) {
		return message;
	}
	
	let resolvedMessage = message;
	
	// Replace "this" or "that" with more specific reference
	if (lastReferencedItem) {
		const itemType = lastReferencedItem.type || 'item';
		const itemName = lastReferencedItem.title || lastReferencedItem.name || 'the item';
		
		if (msg.includes('this') || msg.includes('that')) {
			resolvedMessage = message.replace(/\b(this|that)\b/gi, `the ${itemType} "${itemName}"`);
		}
		
		if (msg.includes('the last') || msg.includes('previous')) {
			resolvedMessage = message.replace(/\b(the last|previous)\b/gi, `the ${itemType} "${itemName}"`);
		}
	} else if (lastAIMessage) {
		// If no specific item, reference the last AI message
		const summary = lastAIMessage.substring(0, 100) + (lastAIMessage.length > 100 ? '...' : '');
		
		if (msg.includes('this') || msg.includes('that')) {
			resolvedMessage = message.replace(/\b(this|that)\b/gi, `the previous message about "${summary}"`);
		}
	}
	
	return resolvedMessage;
}

// Check if we should auto-switch context
export async function shouldAutoSwitchContext(message: string): Promise<boolean> {
	const inference = await inferProjectFromMessage(message);
	return inference.shouldSwitch && inference.confidence >= 0.8;
}

// Get confirmation options for context switch
export function getContextSwitchOptions(inference: ContextInferenceResult) {
	if (!inference.shouldSwitch || !inference.projectId || !inference.projectName) {
		return null;
	}
	
	return {
		projectId: inference.projectId,
		projectName: inference.projectName,
		confidence: inference.confidence,
		reason: inference.reason,
		options: [
			{ id: 'yes', label: `Yes, switch to ${inference.projectName}`, action: 'switch' },
			{ id: 'choose', label: 'Choose another project', action: 'choose' },
			{ id: 'general', label: 'Keep in General Chat', action: 'general' }
		]
	};
}
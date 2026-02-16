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
}

export interface ProjectMatch {
	projectId: string;
	projectName: string;
	confidence: number;
	matches: string[];
}

// Infer project from message
export async function inferProjectFromMessage(message: string): Promise<ContextInferenceResult> {
	const msg = message.toLowerCase().trim();
	const currentChatContext = get(chatContext);
	
	// If already in project mode, check if message references other projects
	if (currentChatContext.mode === 'project' && currentChatContext.selectedProjectId) {
		const currentProject = await db.projects.get(currentChatContext.selectedProjectId);
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
	
	// Get all projects
	const allProjects = await db.projects.toArray();
	if (allProjects.length === 0) {
		return {
			shouldSwitch: false,
			confidence: 0,
			reason: 'No projects available'
		};
	}
	
	// Find project matches
	const projectMatches: ProjectMatch[] = [];
	
	for (const project of allProjects) {
		const matches: string[] = [];
		let confidence = 0;
		
		// Check for exact project name match
		if (msg.includes(project.name.toLowerCase())) {
			matches.push(`Exact name match: "${project.name}"`);
			confidence += 0.8;
		}
		
		// Check for client name match
		if (project.client && msg.includes(project.client.toLowerCase())) {
			matches.push(`Client match: "${project.client}"`);
			confidence += 0.6;
		}
		
		// Check for location match
		if (project.location && msg.includes(project.location.toLowerCase())) {
			matches.push(`Location match: "${project.location}"`);
			confidence += 0.5;
		}
		
		// Check for "file this in [project]" pattern
		const fileInPattern = new RegExp(`file\\s+(?:this|it)\\s+in\\s+([^,.!?]+)`, 'i');
		const fileInMatch = message.match(fileInPattern);
		if (fileInMatch) {
			const mentionedName = fileInMatch[1].trim().toLowerCase();
			if (project.name.toLowerCase().includes(mentionedName) || mentionedName.includes(project.name.toLowerCase())) {
				matches.push(`"File this in" pattern match`);
				confidence += 0.9;
			}
		}
		
		// Check for "save to [project]" pattern
		const saveToPattern = new RegExp(`save\\s+(?:this|it)\\s+to\\s+([^,.!?]+)`, 'i');
		const saveToMatch = message.match(saveToPattern);
		if (saveToMatch) {
			const mentionedName = saveToMatch[1].trim().toLowerCase();
			if (project.name.toLowerCase().includes(mentionedName) || mentionedName.includes(project.name.toLowerCase())) {
				matches.push(`"Save to" pattern match`);
				confidence += 0.9;
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
		
		// Only suggest switch if confidence is high enough
		if (bestMatch.confidence >= 0.7) {
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
	if (msg.includes('this') || msg.includes('that') || msg.includes('the last') || msg.includes('previous')) {
		const lastAIMessage = currentChatContext.lastAIMessage;
		const lastReferencedItem = currentChatContext.lastReferencedItem;
		
		if (lastReferencedItem) {
			return {
				shouldSwitch: false,
				confidence: 0.8,
				reason: 'Pronoun reference detected to last referenced item'
			};
		} else if (lastAIMessage) {
			return {
				shouldSwitch: false,
				confidence: 0.7,
				reason: 'Pronoun reference detected to last AI message'
			};
		}
	}
	
	return {
		shouldSwitch: false,
		confidence: 0,
		reason: 'No clear project reference detected'
	};
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
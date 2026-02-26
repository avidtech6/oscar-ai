import { semanticContext } from '$lib/stores/semanticContext';
import { get } from 'svelte/store';
import { debugStore } from '$lib/stores/debugStore';

export type PromptIntent = 
	| 'current_item'
	| 'other_subsystem'
	| 'general'
	| 'ambiguous';

export type Subsystem = 
	| 'email'
	| 'gallery'
	| 'tasks'
	| 'calendar'
	| 'files'
	| 'notes'
	| 'projects'
	| 'reports'
	| 'voice'
	| 'camera'
	| 'unknown';

export interface DetectionResult {
	intent: PromptIntent;
	subsystem?: Subsystem;
	confidence: number;
	requiresDecisionSheet: boolean;
	suggestedActions: string[];
}

/**
 * Detect if a user prompt refers to the current item, another subsystem, general, or ambiguous.
 * Now active as part of intelligence layer build.
 */
export function detectContextMismatch(prompt: string): DetectionResult {
	console.log('[ContextMismatchDetector] Analyzing prompt:', prompt.substring(0, 100));
	
	// Get current context from stores (simplified - in real implementation would use actual stores)
	const currentPage = 'workspace'; // Default
	const currentItem = null; // No item selected by default
	
	// Normalize prompt for analysis
	const normalizedPrompt = prompt.toLowerCase().trim();
	
	// Detect subsystem keywords
	const subsystemKeywords: Record<Subsystem, string[]> = {
		email: ['email', 'inbox', 'send', 'reply', 'message', 'gmail'],
		gallery: ['photo', 'image', 'picture', 'gallery', 'camera', 'upload'],
		tasks: ['task', 'todo', 'reminder', 'deadline', 'due', 'complete'],
		calendar: ['calendar', 'schedule', 'meeting', 'appointment', 'date', 'time'],
		files: ['file', 'document', 'pdf', 'upload', 'download', 'folder'],
		notes: ['note', 'write', 'journal', 'memo', 'document', 'text'],
		projects: ['project', 'workspace', 'team', 'collaborate', 'plan'],
		reports: ['report', 'summary', 'analysis', 'data', 'statistics'],
		voice: ['voice', 'audio', 'record', 'speak', 'dictate', 'transcribe'],
		camera: ['camera', 'photo', 'picture', 'scan', 'capture', 'take'],
		unknown: []
	};
	
	// Detect intent based on keywords and context
	let intent: PromptIntent = 'current_item';
	let subsystem: Subsystem | undefined = undefined;
	let confidence = 0.7; // Default confidence
	let requiresDecisionSheet = false;
	const suggestedActions: string[] = [];
	
	// Check for subsystem references
	for (const [subsys, keywords] of Object.entries(subsystemKeywords)) {
		if (keywords.some(keyword => normalizedPrompt.includes(keyword))) {
			subsystem = subsys as Subsystem;
			
			// If referring to a different subsystem than current page
			if (subsys !== currentPage && currentPage !== 'workspace') {
				intent = 'other_subsystem';
				confidence = 0.85;
				requiresDecisionSheet = true;
				suggestedActions.push(`Switch to ${subsys}`);
				suggestedActions.push(`Stay in ${currentPage}`);
				suggestedActions.push('Ask for clarification');
			}
			break;
		}
	}
	
	// Check for general/ambiguous prompts
	const generalKeywords = ['hello', 'hi', 'help', 'what can you do', 'how are you', 'thanks'];
	const ambiguousKeywords = ['this', 'that', 'it', 'they', 'them', 'those'];
	
	if (generalKeywords.some(keyword => normalizedPrompt.includes(keyword))) {
		intent = 'general';
		confidence = 0.9;
		requiresDecisionSheet = false;
	} else if (ambiguousKeywords.some(keyword => normalizedPrompt.includes(keyword)) && !currentItem) {
		intent = 'ambiguous';
		confidence = 0.6;
		requiresDecisionSheet = true;
		suggestedActions.push('Clarify which item you mean');
		suggestedActions.push('Show me all items');
		suggestedActions.push('Continue with current context');
	}
	
	// Check for media references
	const mediaKeywords = ['photo', 'image', 'picture', 'camera', 'voice', 'audio', 'file', 'document'];
	if (mediaKeywords.some(keyword => normalizedPrompt.includes(keyword))) {
		// Media actions might require decision sheet for routing
		requiresDecisionSheet = true;
		suggestedActions.push('Open camera');
		suggestedActions.push('Upload file');
		suggestedActions.push('Record voice note');
	}
	
	console.log('[ContextMismatchDetector] Detection result:', {
		intent,
		subsystem,
		confidence,
		requiresDecisionSheet,
		suggestedActions
	});
	
	return {
		intent,
		subsystem,
		confidence,
		requiresDecisionSheet,
		suggestedActions
	};
}

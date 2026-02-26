import { semanticContext } from '$lib/stores/semanticContext';
import { get } from 'svelte/store';

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
 */
export function detectContextMismatch(prompt: string): DetectionResult {
	console.log('[ContextMismatchDetector] prompt:', prompt);
	const lower = prompt.toLowerCase().trim();
	const state = get(semanticContext);
	const activeContextId = state.activeContextId;
	const activeContextType = state.activeContextType;
	const zoomLevel = state.zoomLevel;

	// Simple keyword detection for subsystems
	const subsystemKeywords: Record<Subsystem, string[]> = {
		email: ['email', 'inbox', 'send', 'reply', 'mail'],
		gallery: ['photo', 'image', 'picture', 'gallery', 'camera', 'capture'],
		tasks: ['task', 'todo', 'reminder', 'deadline', 'due'],
		calendar: ['calendar', 'schedule', 'appointment', 'meeting', 'event'],
		files: ['file', 'document', 'folder', 'upload', 'download'],
		notes: ['note', 'write', 'memo', 'journal'],
		projects: ['project', 'workspace', 'team'],
		reports: ['report', 'generate', 'summary', 'document'],
		voice: ['voice', 'record', 'audio', 'transcribe'],
		camera: ['camera', 'photo', 'picture', 'scan'],
		unknown: []
	};

	// Determine if prompt references a subsystem
	let detectedSubsystem: Subsystem | undefined;
	for (const [subsystem, keywords] of Object.entries(subsystemKeywords)) {
		if (keywords.some(kw => lower.includes(kw))) {
			detectedSubsystem = subsystem as Subsystem;
			break;
		}
	}

	// Determine if prompt references current item
	const refersToCurrentItem = activeContextId && (
		lower.includes(activeContextId) || // naive, could be improved
		lower.includes('this') ||
		lower.includes('current')
	);

	// Determine if prompt is general (weather, facts, explanations)
	const generalKeywords = ['weather', 'time', 'date', 'how', 'what', 'why', 'explain', 'define', 'tell me about'];
	const isGeneral = generalKeywords.some(kw => lower.includes(kw));

	// Determine if ambiguous (multiple possibilities)
	const isAmbiguous = !refersToCurrentItem && !detectedSubsystem && !isGeneral;

	// Decide intent
	let intent: PromptIntent;
	if (refersToCurrentItem) {
		intent = 'current_item';
	} else if (detectedSubsystem) {
		intent = 'other_subsystem';
	} else if (isGeneral) {
		intent = 'general';
	} else {
		intent = 'ambiguous';
	}

	// Determine if decision sheet is required
	let requiresDecisionSheet = false;
	let suggestedActions: string[] = [];

	if (intent === 'other_subsystem' || intent === 'ambiguous') {
		requiresDecisionSheet = true;
		// Generate suggested actions based on detected subsystem
		if (detectedSubsystem) {
			switch (detectedSubsystem) {
				case 'email':
					suggestedActions = ['Open Email', 'Compose New', 'Check Inbox'];
					break;
				case 'gallery':
					suggestedActions = ['View in Gallery', 'Tag this Photo', 'Attach to Note', 'Analyse with AI'];
					break;
				case 'tasks':
					suggestedActions = ['Open Tasks', 'Create New Task', 'View Overdue'];
					break;
				case 'calendar':
					suggestedActions = ['Open Calendar', 'Schedule Event', 'View Upcoming'];
					break;
				case 'files':
					suggestedActions = ['Open Files', 'Upload New', 'Organise'];
					break;
				case 'notes':
					suggestedActions = ['Open Notes', 'Create Note', 'Search Notes'];
					break;
				case 'voice':
					suggestedActions = ['Transcribe', 'Summarise', 'Attach to Note', 'Open in Voice Notes'];
					break;
				case 'camera':
					suggestedActions = ['View in Gallery', 'Tag this Photo', 'Attach to Note', 'Analyse with AI'];
					break;
				default:
					suggestedActions = ['Open ' + detectedSubsystem.charAt(0).toUpperCase() + detectedSubsystem.slice(1)];
			}
		} else {
			// ambiguous
			suggestedActions = ['Stay Here', 'Switch to Notes', 'Switch to Tasks', 'Ask for Clarification'];
		}
	}

	const result = {
		intent,
		subsystem: detectedSubsystem,
		confidence: 0.8, // placeholder
		requiresDecisionSheet,
		suggestedActions
	};
	console.log('[ContextMismatchDetector] result:', result);
	return result;
}

import type { CopilotContext } from './hintEngine';

export interface FollowUpAction {
	label: string;
	action: string; // text to insert into CopilotBar input
}

/**
 * Generate intelligent follow‑up suggestions based on context and conversation.
 * Returns 0–4 suggestions that are contextual, actionable, and never generic filler.
 */
export function getFollowUps(
	context: CopilotContext,
	lastUserMessage: string,
	lastAssistantMessage: string
): FollowUpAction[] {
	const suggestions: FollowUpAction[] = [];

	// 1. Analyse assistant's last message for content type
	const assistantMessage = lastAssistantMessage.toLowerCase();
	const userMessage = lastUserMessage.toLowerCase();

	// 2. Check if assistant summarised something
	if (containsAny(assistantMessage, ['summary', 'summarised', 'overview', 'recap', 'in summary'])) {
		suggestions.push(
			{ label: 'Expand this', action: 'Expand on this summary with more details' },
			{ label: 'Turn into report section', action: 'Turn this into a formal report section' },
			{ label: 'Extract action items', action: 'Extract action items from this summary' },
			{ label: 'Compile with other notes', action: 'Compile this with other notes into a draft' }
		);
	}

	// 3. Check if assistant analysed photos
	if (containsAny(assistantMessage, ['photo', 'image', 'picture', 'photograph', 'visual'])) {
		suggestions.push(
			{ label: 'Generate narrative', action: 'Generate a narrative from these photos' },
			{ label: 'Add to project note', action: 'Add these photos to a project note' }
		);
	}

	// 4. Check if assistant cleaned up text
	if (containsAny(assistantMessage, ['cleaned up', 'edited', 'rewritten', 'improved', 'polished'])) {
		suggestions.push(
			{ label: 'Make more formal', action: 'Make this more formal for a report' },
			{ label: 'Make more concise', action: 'Make this more concise' },
			{ label: 'Turn into blog post', action: 'Turn this into a blog post' }
		);
	}

	// 5. Check if assistant generated tasks
	if (containsAny(assistantMessage, ['task', 'todo', 'action item', 'next step', 'assign'])) {
		suggestions.push(
			{ label: 'Break into steps', action: 'Break these tasks into smaller steps' },
			{ label: 'Assign priorities', action: 'Assign priorities to these tasks' },
			{ label: 'Schedule them', action: 'Schedule these tasks on the calendar' }
		);
	}

	// 6. Check if assistant asked a question
	if (assistantMessage.includes('?') || containsAny(assistantMessage, ['what', 'how', 'when', 'where', 'why'])) {
		// Extract potential answer from user message context
		const questionFollowUps = getQuestionFollowUps(assistantMessage);
		suggestions.push(...questionFollowUps);
	}

	// 7. Route‑based suggestions
	const routeSuggestions = getRouteBasedSuggestions(context.route, context.isMobile);
	suggestions.push(...routeSuggestions);

	// 8. Content‑based suggestions
	if (context.selectedNote) {
		suggestions.push(
			{ label: 'Summarise note', action: 'Summarise this note' },
			{ label: 'Clean up writing', action: 'Clean up this writing' },
			{ label: 'Expand narrative', action: 'Expand this into a narrative' },
			{ label: 'Compile with project notes', action: 'Compile this note with other project notes' }
		);
	}

	if (context.selectedProject) {
		suggestions.push(
			{ label: 'Summarise project', action: 'Summarise this project' },
			{ label: 'Generate report draft', action: 'Generate a report draft for this project' },
			{ label: 'List next steps', action: 'List the next steps for this project' },
			{ label: 'Compile project notes', action: 'Compile all notes for this project into a draft' }
		);
	}

	// 9. Insight‑based suggestions (if we have project insights)
	if (context.selectedProject) {
		const insightSuggestions = getInsightBasedSuggestions(context);
		suggestions.push(...insightSuggestions);
	}

	// 10. Recent action suggestions
	if (context.recentAction) {
		const actionSuggestions = getRecentActionSuggestions(context.recentAction);
		suggestions.push(...actionSuggestions);
	}

	// 11. Limit to 4 suggestions and remove duplicates
	const uniqueSuggestions = deduplicateSuggestions(suggestions);
	return uniqueSuggestions.slice(0, 4);
}

// Helper functions

function containsAny(text: string, terms: string[]): boolean {
	return terms.some(term => text.includes(term));
}

function getQuestionFollowUps(question: string): FollowUpAction[] {
	// Provide direct follow‑up answers based on question type
	if (question.includes('what')) {
		return [
			{ label: 'Explain more', action: 'Can you explain more about that?' },
			{ label: 'Give examples', action: 'Can you give examples?' }
		];
	}
	if (question.includes('how')) {
		return [
			{ label: 'Step by step', action: 'Explain step by step' },
			{ label: 'Best approach', action: 'What is the best approach?' }
		];
	}
	return [
		{ label: 'Yes', action: 'Yes' },
		{ label: 'No', action: 'No' },
		{ label: 'Maybe', action: 'Maybe, can you clarify?' }
	];
}

function getRouteBasedSuggestions(route: string, isMobile: boolean): FollowUpAction[] {
	const normalizedRoute = route.toLowerCase();
	const suggestions: FollowUpAction[] = [];

	if (normalizedRoute === '/' || normalizedRoute.includes('dashboard')) {
		suggestions.push(
			{ label: 'Summarise day', action: 'Summarise my business today' },
			{ label: 'Plan tomorrow', action: 'Help me plan for tomorrow' }
		);
	}

	if (normalizedRoute.includes('workspace') || normalizedRoute.includes('projects')) {
		if (normalizedRoute.includes('project/')) {
			suggestions.push(
				{ label: 'Analyse project', action: 'Analyse this project' },
				{ label: 'Generate report', action: 'Generate a report for this project' }
			);
		} else {
			suggestions.push(
				{ label: 'Plan next project', action: 'Help me plan my next project' }
			);
		}
	}

	if (normalizedRoute.includes('notes')) {
		suggestions.push(
			{ label: 'Organise notes', action: 'Help me organise my notes' },
			{ label: 'Find related', action: 'Find related notes' },
			{ label: 'Compile notes', action: 'Compile selected notes into a draft' }
		);
	}

	if (normalizedRoute.includes('tasks')) {
		suggestions.push(
			{ label: 'Focus next', action: 'What should I focus on next?' },
			{ label: 'Review overdue', action: 'Review overdue tasks' }
		);
	}

	if (normalizedRoute.includes('reports')) {
		suggestions.push(
			{ label: 'Draft report', action: 'Draft a new report' },
			{ label: 'Refine existing', action: 'Help me refine an existing report' }
		);
	}

	// Shorten labels for mobile
	if (isMobile) {
		return suggestions.map(s => ({
			...s,
			label: shortenLabel(s.label)
		}));
	}

	return suggestions;
}

function getRecentActionSuggestions(recentAction: string): FollowUpAction[] {
	switch (recentAction) {
		case 'photoCaptured':
			return [
				{ label: 'Analyse photo', action: 'Analyse this photo' },
				{ label: 'Add to note', action: 'Add this photo to a note' }
			];
		case 'voiceNoteSaved':
			return [
				{ label: 'Transcribe', action: 'Transcribe this recording' },
				{ label: 'Summarise', action: 'Summarise this voice note' }
			];
		case 'taskCreated':
			return [
				{ label: 'Break down', action: 'Break this task down' },
				{ label: 'Assign subtasks', action: 'Assign subtasks for this' }
			];
		case 'noteCreated':
			return [
				{ label: 'Expand note', action: 'Expand this note' },
				{ label: 'Add structure', action: 'Add structure to this note' },
				{ label: 'Compile with others', action: 'Compile this note with other project notes' }
			];
		default:
			return [];
	}
}

function shortenLabel(label: string): string {
	if (label.length <= 20) return label;
	
	// Common shortenings for mobile
	const shortenMap: Record<string, string> = {
		'Summarise this note': 'Summarise note',
		'Clean up this writing': 'Clean up writing',
		'Expand into a narrative': 'Expand narrative',
		'Summarise this project': 'Summarise project',
		'Generate a report draft': 'Report draft',
		'List the next steps': 'Next steps',
		'Analyse this photo': 'Analyse photo',
		'Add this photo to a note': 'Add to note',
		'Transcribe this recording': 'Transcribe',
		'Summarise this voice note': 'Summarise',
		'Break this task down': 'Break down',
		'Assign subtasks for this': 'Assign subtasks',
		'Expand on this summary': 'Expand summary',
		'Turn into report section': 'Report section',
		'Extract action items': 'Action items',
		'Generate narrative': 'Narrative',
		'Add to project note': 'Project note',
		'Make more formal': 'More formal',
		'Make more concise': 'More concise',
		'Turn into blog post': 'Blog post',
		'Break into steps': 'Break steps',
		'Assign priorities': 'Priorities',
		'Schedule on calendar': 'Schedule',
		'Compile with other notes': 'Compile notes',
		'Compile this with other notes': 'Compile notes',
		'Compile with project notes': 'Compile notes',
		'Compile all notes for this project': 'Compile project notes',
		'Compile selected notes into a draft': 'Compile notes',
		'Compile this note with other project notes': 'Compile notes'
	};
	
	return shortenMap[label] || label.substring(0, 17) + '…';
}

function getInsightBasedSuggestions(context: CopilotContext): FollowUpAction[] {
	const suggestions: FollowUpAction[] = [];
	
	// In a real implementation, we would fetch project insights
	// For now, provide generic insight-based suggestions
	if (context.selectedProject) {
		suggestions.push(
			{ label: 'Review project insights', action: 'Show me insights about this project' },
			{ label: 'Check project status', action: 'What is the current status of this project?' },
			{ label: 'Identify gaps', action: 'Identify any gaps in this project documentation' }
		);
	}
	
	return suggestions;
}

function deduplicateSuggestions(suggestions: FollowUpAction[]): FollowUpAction[] {
	const seen = new Set<string>();
	const result: FollowUpAction[] = [];
	
	for (const suggestion of suggestions) {
		const key = suggestion.label + '|' + suggestion.action;
		if (!seen.has(key)) {
			seen.add(key);
			result.push(suggestion);
		}
	}
	
	return result;
}
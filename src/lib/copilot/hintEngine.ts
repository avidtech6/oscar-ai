import type { Note, Project, Report, Task } from '$lib/db';

export interface CopilotContext {
	route: string;
	selectedNote?: Note;
	selectedProject?: Project;
	selectedReport?: Report;
	selectedTask?: Task;
	recentAction?: string;
	assistantActive?: boolean;
	inputEmpty: boolean;
	isMobile: boolean;
}

export function getHint(context: CopilotContext): string {
	// 1. If assistantActive → return conversation‑aware hints.
	if (context.assistantActive) {
		return getAssistantAwareHint();
	}

	// 2. If recentAction exists → return action‑aware hints.
	if (context.recentAction) {
		const actionHint = getActionAwareHint(context.recentAction);
		if (actionHint) return actionHint;
	}

	// 3. If selectedNote → return note‑aware hints.
	if (context.selectedNote) {
		return getNoteAwareHint(context.selectedNote, context.isMobile);
	}

	// 4. If selectedProject → return project‑aware hints.
	if (context.selectedProject) {
		return getProjectAwareHint(context.selectedProject, context.isMobile);
	}

	// 5. If selectedReport → return report‑aware hints.
	if (context.selectedReport) {
		return getReportAwareHint(context.selectedReport, context.isMobile);
	}

	// 6. If selectedTask → return task‑aware hints.
	if (context.selectedTask) {
		return getTaskAwareHint(context.selectedTask, context.isMobile);
	}

	// 7. Else → return route‑aware hints.
	const routeHint = getRouteAwareHint(context.route, context.isMobile);
	if (routeHint) return routeHint;

	// 8. Fallback: "Ask Oscar anything…"
	return context.isMobile ? "Ask Oscar…" : "Ask Oscar anything…";
}

// Assistant-aware hints
function getAssistantAwareHint(): string {
	// In a real implementation, this would check the conversation state
	// For now, return a generic assistant hint
	return "Ask a follow‑up question or request more details…";
}

// Action-aware hints
function getActionAwareHint(recentAction: string): string | null {
	switch (recentAction) {
		case 'photoCaptured':
			return "Add this photo to a note or project…";
		case 'voiceNoteSaved':
			return "Transcribe or attach your recording…";
		case 'taskCreated':
			return "Want Oscar to break this down…";
		case 'noteCreated':
			return "Start writing, compile, or ask Oscar to help…";
		case 'reportGenerated':
			return "Refine or expand this report…";
		case 'notesCompiled':
			return "Generate a professional report from these notes…";
		case 'pdfExtracted':
			return "Analyse extracted content or create a note…";
		default:
			return null;
	}
}

// Note-aware hints
function getNoteAwareHint(note: Note, isMobile: boolean): string {
	const contentLength = note.content?.length || 0;
	const hasPhotos = note.attachments && note.attachments.length > 0;
	const hasVoiceNotes = note.transcript && note.transcript.length > 0;

	if (contentLength === 0) {
		return isMobile ? "Start writing…" : "Start writing or ask Oscar to draft it…";
	}

	if (contentLength > 500) {
		return isMobile ? "Summarise this note…" : "Summarise, clean up, or compile this note…";
	}

	if (hasPhotos) {
		return isMobile ? "Analyse photos…" : "Analyse these photos or add context…";
	}

	if (hasVoiceNotes) {
		return isMobile ? "Transcribe recording…" : "Transcribe or summarise your recording…";
	}

	return isMobile ? "Edit or expand…" : "Edit, expand, or ask Oscar to improve this note…";
}

// Project-aware hints
function getProjectAwareHint(project: Project, isMobile: boolean): string {
	// Use project insights for better hints
	return getProjectInsightsHint(project, isMobile);
}

// Simplified project insights hint generator
function getProjectInsightsHint(project: Project, isMobile: boolean): string {
	// These would be based on actual project data in a real implementation
	// For now, use generic but more specific hints
	const hints = [
		"Review project insights or ask for a summary…",
		"Check project status or generate a report…",
		"Analyse project data or plan next steps…",
		"Review recent activity or add observations…",
		"Compile project notes into a draft…",
		"Generate a professional arboricultural report…",
		"Create a client‑ready report from project data…",
		"Summarise findings in a formal report…",
		"Import legacy documents or PDFs…",
		"Extract data from uploaded documents…",
		"Analyse PDF content for project insights…",
		"Create notes from imported documents…"
	];
	
	// Pick a hint based on project name hash for variety
	const hash = project.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const hintIndex = hash % hints.length;
	
	return isMobile ? hints[hintIndex].replace(/…$/, '…').substring(0, 30) + "…" : hints[hintIndex];
}

// Report-aware hints
function getReportAwareHint(report: Report, isMobile: boolean): string {
	return isMobile ? "Refine or expand…" : "Refine, expand, or regenerate this report…";
}

// Task-aware hints
function getTaskAwareHint(task: Task, isMobile: boolean): string {
	return isMobile ? "Break down steps…" : "Break this task into steps or assign subtasks…";
}

// Route-aware hints
function getRouteAwareHint(route: string, isMobile: boolean): string | null {
	// Normalize route for matching
	const normalizedRoute = route.toLowerCase();

	if (normalizedRoute === '/' || normalizedRoute.includes('dashboard')) {
		return isMobile ? "Summarise your day…" : "Ask Oscar to summarise your business today…";
	}

	if (normalizedRoute.includes('workspace') || normalizedRoute.includes('projects')) {
		if (normalizedRoute.includes('project/')) {
			return isMobile ? "Analyse project…" : "Analyse this project or generate a report…";
		}
		return isMobile ? "Plan next project…" : "Ask Oscar to help plan your next project…";
	}

	if (normalizedRoute.includes('notes')) {
		if (normalizedRoute.includes('note/')) {
			return isMobile ? "Edit note…" : "Summarise, clean up, or compile this note…";
		}
		return isMobile ? "Organise notes…" : "Ask Oscar to help organise or compile your notes…";
	}

	if (normalizedRoute.includes('tasks')) {
		return isMobile ? "What to focus on…" : "What should I focus on next…";
	}

	if (normalizedRoute.includes('reports')) {
		return isMobile ? "Draft report…" : "Draft or refine a report with Oscar…";
	}

	if (normalizedRoute.includes('blog')) {
		return isMobile ? "Draft blog post…" : "Draft a blog post or outline…";
	}

	if (normalizedRoute.includes('email')) {
		return isMobile ? "Draft email…" : "Draft an email or reply…";
	}

	if (normalizedRoute.includes('oscar')) {
		return isMobile ? "Ask anything…" : "Ask Oscar anything…";
	}

	if (normalizedRoute.includes('calendar')) {
		return isMobile ? "Schedule tasks…" : "Schedule tasks or plan your week…";
	}

	if (normalizedRoute.includes('help')) {
		return isMobile ? "Get help…" : "Get help or learn how to use Oscar…";
	}

	if (normalizedRoute.includes('settings')) {
		return isMobile ? "Configure…" : "Configure settings or preferences…";
	}

	return null;
}

// Helper function to shorten hints for mobile
export function shortenHintForMobile(hint: string): string {
	if (hint.length <= 40) return hint;

	// Common patterns to shorten
	const shortenMap: Record<string, string> = {
		"Ask Oscar to summarise your business today…": "Ask Oscar…",
		"Ask Oscar to help plan your next project…": "Plan project…",
		"Analyse this project or generate a report…": "Analyse project…",
		"Ask Oscar to help organise your notes…": "Organise notes…",
		"Summarise, clean up, or expand this note…": "Edit note…",
		"What should I focus on next…": "Focus next…",
		"Draft or refine a report with Oscar…": "Draft report…",
		"Draft a blog post or outline…": "Draft blog…",
		"Draft an email or reply…": "Draft email…",
		"Ask Oscar anything…": "Ask Oscar…",
		"Start writing or ask Oscar to draft it…": "Start writing…",
		"Summarise or clean up this note…": "Summarise note…",
		"Analyse these photos or add context…": "Analyse photos…",
		"Transcribe or summarise your recording…": "Transcribe…",
		"Start building this project with Oscar…": "Start building…",
		"Plan your next steps or generate a report…": "Plan next steps…",
		"Refine, expand, or regenerate this report…": "Refine report…",
		"Break this task into steps or assign subtasks…": "Break down task…",
		"Add this photo to a note or project…": "Add photo…",
		"Transcribe or attach your recording…": "Transcribe recording…",
		"Want Oscar to break this down…": "Break down…",
		"Start writing or ask Oscar to help…": "Start writing…",
		"Start writing, compile, or ask Oscar to help…": "Start writing…",
		"Ask a follow‑up question or request more details…": "Follow‑up…",
		"Schedule tasks or plan your week…": "Schedule…",
		"Summarise, clean up, or compile this note…": "Edit note…",
		"Ask Oscar to help organise or compile your notes…": "Organise notes…",
		"Compile project notes into a draft…": "Compile notes…",
		"Get help or learn how to use Oscar…": "Get help…",
		"Configure settings or preferences…": "Configure…",
		"Generate a professional arboricultural report…": "Generate report…",
		"Create a client‑ready report from project data…": "Create report…",
		"Summarise findings in a formal report…": "Formal report…",
		"Refine or expand this report…": "Refine report…",
		"Generate a professional report from these notes…": "Generate report…",
		// PDF-related hints
		"Analyse extracted content or create a note…": "Analyse PDF…",
		"Import legacy documents or PDFs…": "Import PDFs…",
		"Extract data from uploaded documents…": "Extract data…",
		"Analyse PDF content for project insights…": "Analyse PDF…",
		"Create notes from imported documents…": "Create from PDF…"
	};

	// Check if we have a direct mapping
	if (shortenMap[hint]) {
		return shortenMap[hint];
	}

	// Generic shortening: take first 40 characters and add ellipsis
	return hint.substring(0, 37) + "…";
}
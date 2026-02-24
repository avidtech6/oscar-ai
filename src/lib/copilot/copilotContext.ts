import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Note, Project, Report, Task } from '$lib/db';
import type { CopilotContext } from './hintEngine';

// Initial context
const initialContext: CopilotContext = {
	route: '/',
	selectedNote: undefined,
	selectedProject: undefined,
	selectedReport: undefined,
	selectedTask: undefined,
	recentAction: undefined,
	assistantActive: false,
	inputEmpty: true,
	isMobile: browser ? window.innerWidth < 768 : false
};

// Create the writable store
export const copilotContext = writable<CopilotContext>(initialContext);

// Helper functions to update specific parts of the context
export function updateRoute(route: string) {
	copilotContext.update(ctx => ({ ...ctx, route }));
}

export function updateSelectedNote(note: Note | undefined) {
	copilotContext.update(ctx => ({ ...ctx, selectedNote: note }));
}

export function updateSelectedProject(project: Project | undefined) {
	copilotContext.update(ctx => ({ ...ctx, selectedProject: project }));
}

export function updateSelectedReport(report: Report | undefined) {
	copilotContext.update(ctx => ({ ...ctx, selectedReport: report }));
}

export function updateSelectedTask(task: Task | undefined) {
	copilotContext.update(ctx => ({ ...ctx, selectedTask: task }));
}

export function updateRecentAction(action: string | undefined) {
	copilotContext.update(ctx => ({ ...ctx, recentAction: action }));
	
	// Auto-clear recent action after a delay (so hint shows once)
	if (action && browser) {
		setTimeout(() => {
			copilotContext.update(ctx => {
				if (ctx.recentAction === action) {
					return { ...ctx, recentAction: undefined };
				}
				return ctx;
			});
		}, 3000);
	}
}

export function updateAssistantActive(active: boolean) {
	copilotContext.update(ctx => ({ ...ctx, assistantActive: active }));
}

export function updateInputEmpty(empty: boolean) {
	copilotContext.update(ctx => ({ ...ctx, inputEmpty: empty }));
}

export function updateIsMobile(mobile: boolean) {
	copilotContext.update(ctx => ({ ...ctx, isMobile: mobile }));
}

// Initialize mobile detection
if (browser) {
	// Set initial mobile state
	updateIsMobile(window.innerWidth < 768);
	
	// Update on resize
	window.addEventListener('resize', () => {
		updateIsMobile(window.innerWidth < 768);
	});
}

// Reset context (useful for testing or logout)
export function resetCopilotContext() {
	copilotContext.set(initialContext);
}
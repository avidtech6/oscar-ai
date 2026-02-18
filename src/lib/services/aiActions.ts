import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { db, type Project, type Tree, type Note, type BlogPost, type Diagram } from '$lib/db';
import { settings } from '$lib/stores/settings';
import { chatContext } from '$lib/services/unified/ProjectContextStore';
import { actionExecutorService } from '$lib/services/unified/ActionExecutorService';
import { unifiedIntentEngine } from '$lib/services/unified/UnifiedIntentEngine';
import { intentFeedbackService } from '$lib/services/unified/IntentFeedbackService';

// Re-export report-specific helpers from the new dedicated module
export { 
	suggestClientName, 
	suggestSiteAddress, 
	parseUserAnswer, 
	generateFollowUpQuestions, 
	generateAIGapFillQuestions 
} from './reportAIActions';

// Types for AI actions
export interface ActionResult {
	success: boolean;
	message: string;
	action?: string;
	data?: any;
	redirectUrl?: string;
	intentType?: string;
}

// Context types
export interface AIContext {
	currentProject: Project | null;
	projects: Project[];
	selectedProjectId: string;
	trees: Tree[];
	notes: Note[];
	reports: any[];
	diagrams: any[];
	blogPosts: any[];
}

// Get current context for AI
export async function getAIContext(): Promise<AIContext> {
	if (!browser) {
		return {
			currentProject: null,
			projects: [],
			selectedProjectId: '',
			trees: [],
			notes: [],
			reports: [],
			diagrams: [],
			blogPosts: []
		};
	}

	const currentChatContext = get(chatContext);
	const currentSettings = get(settings);
	const projects = await db.projects.orderBy('updatedAt').reverse().toArray();
	
	// Use chat context project ID if in project mode, otherwise use settings for backward compatibility
	let selectedProjectId = '';
	if (currentChatContext.mode === 'project' && currentChatContext.selectedProjectId) {
		selectedProjectId = currentChatContext.selectedProjectId;
	} else {
		selectedProjectId = currentSettings.currentProjectId || '';
	}

	let currentProject: Project | null = null;
	let trees: Tree[] = [];
	let notes: Note[] = [];
	let reports: any[] = [];
	let diagrams: any[] = [];
	let blogPosts: any[] = [];

	if (selectedProjectId) {
		currentProject = await db.projects.get(selectedProjectId) || null;
		trees = await db.trees.where('projectId').equals(selectedProjectId).toArray();
		notes = await db.notes.where('projectId').equals(selectedProjectId).toArray();
		reports = await db.reports.where('projectId').equals(selectedProjectId).toArray();
		
		// Load diagrams from IndexedDB
		diagrams = await db.diagrams.where('projectId').equals(selectedProjectId).toArray();
		
		// Load blog posts from IndexedDB
		blogPosts = await db.blogPosts.where('projectId').equals(selectedProjectId).toArray();
	}

	return {
		currentProject,
		projects,
		selectedProjectId,
		trees,
		notes,
		reports,
		diagrams,
		blogPosts
	};
}

// Format context for AI system prompt
export function formatContextForAI(context: AIContext): string {
	let contextText = '';
	
	// Chat mode info
	const currentChatContext = get(chatContext);
	contextText += `\nCHAT MODE: ${currentChatContext.mode.toUpperCase()}`;
	
	if (currentChatContext.mode === 'general') {
		contextText += '\n- General Chat: No automatic database writes. Offer conversion options after generating content.';
	} else if (currentChatContext.mode === 'global') {
		contextText += '\n- Global Workspace: Cross-project operations allowed.';
	} else if (currentChatContext.mode === 'project') {
		contextText += '\n- Project Mode: All created items will be tagged to the current project.';
	}

	// Current project info
	if (context.currentProject) {
		contextText += `\n\nCURRENT PROJECT: ${context.currentProject.name}`;
		contextText += `\n- Location: ${context.currentProject.location}`;
		contextText += `\n- Client: ${context.currentProject.client}`;
		contextText += `\n- Description: ${context.currentProject.description}`;
	} else if (currentChatContext.mode === 'project') {
		contextText += '\n\nNo project is currently selected. Please select a project or switch to General Chat.';
	} else {
		contextText += '\n\nNo project is currently selected.';
	}

	// Trees in current project
	if (context.trees.length > 0) {
		contextText += `\n\nTREES IN PROJECT (${context.trees.length}):`;
		context.trees.slice(0, 10).forEach(tree => {
			contextText += `\n- ${tree.number}: ${tree.species} (${tree.category}) - DBH: ${tree.DBH}mm`;
		});
		if (context.trees.length > 10) {
			contextText += `\n... and ${context.trees.length - 10} more trees`;
		}
	}

	// Notes
	if (context.notes.length > 0) {
		contextText += `\n\nNOTES (${context.notes.length}):`;
		context.notes.slice(0, 5).forEach(note => {
			contextText += `\n- ${note.title}: ${note.content.substring(0, 100)}...`;
		});
		if (context.notes.length > 5) {
			contextText += `\n... and ${context.notes.length - 5} more notes`;
		}
	}

	// Reports
	if (context.reports.length > 0) {
		contextText += `\n\nREPORTS (${context.reports.length}):`;
		context.reports.forEach(report => {
			contextText += `\n- ${report.title} (${report.type}) - ${new Date(report.generatedAt).toLocaleDateString()}`;
		});
	}

	// Diagrams
	if (context.diagrams.length > 0) {
		contextText += `\n\nDIAGRAMS (${context.diagrams.length}):`;
		context.diagrams.forEach(diagram => {
			contextText += `\n- ${diagram.title} (${diagram.type})`;
		});
	}

	// Blog posts
	if (context.blogPosts.length > 0) {
		contextText += `\n\nBLOG POSTS (${context.blogPosts.length}):`;
		context.blogPosts.forEach(post => {
			contextText += `\n- ${post.title}`;
		});
	}

	// Available projects
	if (context.projects.length > 0) {
		contextText += `\n\nAVAILABLE PROJECTS:`;
		context.projects.forEach(p => {
			contextText += `\n- ${p.name} (${p.client})`;
		});
	}

	return contextText;
}

// Legacy action execution functions have been removed as part of Phase 6 cleanup.
// All action execution is now handled by the unified ActionExecutorService.
// Import and use ActionExecutorService directly for action execution.

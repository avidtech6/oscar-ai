import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { db, type Project, type Tree, type Note } from '$lib/db';
import { groqApiKey, settings } from '$lib/stores/settings';
import { chatContext, type ChatMode, needsConfirmation } from '$lib/stores/chatContext';

// Types for AI actions
export interface ActionResult {
	success: boolean;
	message: string;
	action?: string;
	data?: any;
	redirectUrl?: string;
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
		
		// Load diagrams from localStorage
		const storedDiagrams = localStorage.getItem('oscar_diagrams');
		if (storedDiagrams) {
			const allDiagrams = JSON.parse(storedDiagrams);
			diagrams = allDiagrams.filter((d: any) => d.projectId === selectedProjectId);
		}
		
		// Load blog posts from localStorage
		const storedPosts = localStorage.getItem('oscar_blog_posts');
		if (storedPosts) {
			const allPosts = JSON.parse(storedPosts);
			blogPosts = allPosts.filter((p: any) => p.projectId === selectedProjectId);
		}
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

// Action: Create a blog post
export async function createBlogPost(data: {
	projectId: string;
	title: string;
	subtitle?: string;
	bodyContent?: string;
	tags?: string[];
}): Promise<ActionResult> {
	try {
		const blogPost = {
			id: crypto.randomUUID(),
			projectId: data.projectId,
			title: data.title,
			subtitle: data.subtitle || '',
			bodyHTML: data.bodyContent || '',
			bodyContent: data.bodyContent || '', // Store raw content for AI editing
			tags: data.tags || [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		// Get existing posts
		const stored = localStorage.getItem('oscar_blog_posts');
		const posts: any[] = stored ? JSON.parse(stored) : [];
		posts.push(blogPost);
		localStorage.setItem('oscar_blog_posts', JSON.stringify(posts));

		return {
			success: true,
			message: `Blog post "${data.title}" created successfully!`,
			action: 'createBlogPost',
			data: blogPost,
			redirectUrl: `/blog?project=${data.projectId}&post=${blogPost.id}&mode=edit`
		};
	} catch (error) {
		console.error('Error creating blog post:', error);
		return {
			success: false,
			message: 'Failed to create blog post. Please try again.'
		};
	}
}

// Action: Create a note
export async function createNoteAction(data: {
	projectId?: string;
	title: string;
	content: string;
	tags?: string[];
	type?: 'general' | 'voice' | 'field';
}): Promise<ActionResult> {
	try {
		const note = {
			projectId: data.projectId || '',
			title: data.title,
			content: data.content,
			tags: data.tags || [],
			type: data.type || 'general'
		};

		const id = await db.notes.add(note as any);

		return {
			success: true,
			message: `Note "${data.title}" created successfully!`,
			action: 'createNote',
			data: { ...note, id },
			redirectUrl: `/notes?note=${id}&mode=edit`
		};
	} catch (error) {
		console.error('Error creating note:', error);
		return {
			success: false,
			message: 'Failed to create note. Please try again.'
		};
	}
}

// Action: Create a report
export async function createReportAction(data: {
	projectId: string;
	title: string;
	type: 'bs5837' | 'impact' | 'method';
	content?: string;
}): Promise<ActionResult> {
	try {
		// Store report content in localStorage (actual PDF generation happens in reports page)
		const report = {
			id: crypto.randomUUID(),
			projectId: data.projectId,
			title: data.title,
			type: data.type,
			content: data.content || '',
			generatedAt: new Date().toISOString()
		};

		// Get existing reports
		const stored = localStorage.getItem('oscar_reports');
		const reports: any[] = stored ? JSON.parse(stored) : [];
		reports.push(report);
		localStorage.setItem('oscar_reports', JSON.stringify(reports));

		return {
			success: true,
			message: `Report "${data.title}" created successfully!`,
			action: 'createReport',
			data: report,
			redirectUrl: `/reports?project=${data.projectId}&report=${report.id}&mode=edit`
		};
	} catch (error) {
		console.error('Error creating report:', error);
		return {
			success: false,
			message: 'Failed to create report. Please try again.'
		};
	}
}

// Action: Create a project
export async function createProjectAction(data: {
	name: string;
	description?: string;
	location?: string;
	client?: string;
}): Promise<ActionResult> {
	try {
		const projectId = await db.projects.add({
			name: data.name,
			description: data.description || '',
			location: data.location || '',
			client: data.client || '',
			createdAt: new Date(),
			updatedAt: new Date()
		} as any);

		// Set as current project
		settings.update(currentSettings => ({
			...currentSettings,
			currentProjectId: projectId as string
		}));
		// Also update localStorage for backward compatibility
		localStorage.setItem('oscar_current_project_id', projectId as string);

		return {
			success: true,
			message: `Project "${data.name}" created successfully!`,
			action: 'createProject',
			data: { id: projectId, ...data },
			redirectUrl: `/project/${projectId}`
		};
	} catch (error) {
		console.error('Error creating project:', error);
		return {
			success: false,
			message: 'Failed to create project. Please try again.'
		};
	}
}

// Action: Create a diagram
export async function createDiagramAction(data: {
	projectId: string;
	title: string;
	type: string;
	content?: string;
}): Promise<ActionResult> {
	try {
		const diagram = {
			id: crypto.randomUUID(),
			projectId: data.projectId,
			title: data.title,
			type: data.type,
			content: data.content || '',
			createdAt: new Date().toISOString()
		};

		// Get existing diagrams
		const stored = localStorage.getItem('oscar_diagrams');
		const diagrams: any[] = stored ? JSON.parse(stored) : [];
		diagrams.push(diagram);
		localStorage.setItem('oscar_diagrams', JSON.stringify(diagrams));

		return {
			success: true,
			message: `Diagram "${data.title}" created successfully!`,
			action: 'createDiagram',
			data: diagram,
			redirectUrl: `/diagrams?project=${data.projectId}&diagram=${diagram.id}&mode=edit`
		};
	} catch (error) {
		console.error('Error creating diagram:', error);
		return {
			success: false,
			message: 'Failed to create diagram. Please try again.'
		};
	}
}

// Action: Add a tree
export async function createTreeAction(data: {
	projectId: string;
	number: string;
	species: string;
	DBH?: number;
	height?: number;
	age?: string;
	category?: string;
	condition?: string;
}): Promise<ActionResult> {
	try {
		const tree = {
			projectId: data.projectId,
			number: data.number,
			species: data.species,
			scientificName: '',
			DBH: data.DBH || 0,
			height: data.height || 0,
			age: data.age || 'Mature',
			category: data.category || 'C',
			condition: data.condition || 'Good',
			photos: []
		};

		const id = await db.trees.add(tree as any);

		return {
			success: true,
			message: `Tree ${data.number} (${data.species}) added successfully!`,
			action: 'createTree',
			data: { ...tree, id },
			redirectUrl: `/project/${data.projectId}?tree=${id}`
		};
	} catch (error) {
		console.error('Error creating tree:', error);
		return {
			success: false,
			message: 'Failed to add tree. Please try again.'
		};
	}
}

// Parse AI response for actions
export function detectActionRequest(userMessage: string): {
	action: string;
	data: any;
} | null {
	const message = userMessage.toLowerCase();

	// Blog post patterns
	if (message.includes('write a blog') || message.includes('create a blog') || message.includes('blog post about')) {
		return { action: 'createBlogPost', data: {} };
	}

	// Report patterns
	if (message.includes('create a report') || message.includes('write a report') || message.includes('generate a report')) {
		return { action: 'createReport', data: {} };
	}

	// Note patterns
	if (message.includes('create a note') || message.includes('take a note') || message.includes('add a note')) {
		return { action: 'createNote', data: {} };
	}

	// Project patterns
	if (message.includes('create a project') || message.includes('new project') || message.includes('start a project')) {
		return { action: 'createProject', data: {} };
	}

	// Diagram patterns
	if (message.includes('create a diagram') || message.includes('make a diagram') || message.includes('draw a')) {
		return { action: 'createDiagram', data: {} };
	}

	// Tree patterns
	if (message.includes('add a tree') || message.includes('add tree') || message.includes('new tree')) {
		return { action: 'createTree', data: {} };
	}

	return null;
}

// Execute action based on type
export async function executeAction(action: string, data: any, context: AIContext): Promise<ActionResult> {
	const currentChatContext = get(chatContext);
	const mode = currentChatContext.mode;
	
	// Check if we need confirmation for this action in current mode
	if (needsConfirmation(mode, action)) {
		// Set pending action for confirmation
		chatContext.setPendingAction({
			type: action,
			data: data,
			projectId: context.selectedProjectId
		});
		
		return {
			success: false,
			message: `This action requires confirmation in General Chat mode. Please confirm to proceed.`,
			action: 'needsConfirmation',
			data: { action, data, mode }
		};
	}
	
	// Ensure we have a project context for most actions
	const projectId = context.selectedProjectId;

	switch (action) {
		case 'createBlogPost':
			if (!projectId) {
				return { success: false, message: 'Please select a project first to create a blog post.' };
			}
			return await createBlogPost({
				projectId,
				title: data.title || 'New Blog Post',
				subtitle: data.subtitle,
				bodyContent: data.content,
				tags: data.tags
			});

		case 'createNote':
			return await createNoteAction({
				projectId: projectId || undefined,
				title: data.title || 'New Note',
				content: data.content || '',
				tags: data.tags,
				type: data.type
			});

		case 'createReport':
			if (!projectId) {
				return { success: false, message: 'Please select a project first to create a report.' };
			}
			return await createReportAction({
				projectId,
				title: data.title || 'New Report',
				type: data.type || 'bs5837',
				content: data.content
			});

		case 'createProject':
			return await createProjectAction({
				name: data.name || 'New Project',
				description: data.description,
				location: data.location,
				client: data.client
			});

		case 'createDiagram':
			if (!projectId) {
				return { success: false, message: 'Please select a project first to create a diagram.' };
			}
			return await createDiagramAction({
				projectId,
				title: data.title || 'New Diagram',
				type: data.type || 'flowchart',
				content: data.content
			});

		case 'createTree':
			if (!projectId) {
				return { success: false, message: 'Please select a project first to add a tree.' };
			}
			return await createTreeAction({
				projectId,
				number: data.number || '1',
				species: data.species || 'Unknown',
				DBH: data.DBH,
				height: data.height,
				age: data.age,
				category: data.category,
				condition: data.condition
			});

		default:
			return { success: false, message: 'Unknown action requested.' };
	}
}

// Confirm pending action
export async function confirmPendingAction(): Promise<ActionResult> {
	const currentChatContext = get(chatContext);
	const pendingAction = currentChatContext.pendingAction;
	
	if (!pendingAction) {
		return { success: false, message: 'No pending action to confirm.' };
	}
	
	// Clear pending action first
	chatContext.confirmPendingAction();
	
	// Get context for the action
	const context = await getAIContext();
	
	// Execute the action
	return await executeAction(pendingAction.type, pendingAction.data, context);
}

// Get conversion options for General Chat
export function getConversionOptions(content: string, context: AIContext) {
	const topProjects = context.projects.slice(0, 3);
	const options = [
		{ type: 'note', label: 'Save as Note', icon: '📝' },
		{ type: 'report', label: 'Save as Report', icon: '📄' },
		{ type: 'blog', label: 'Save as Blog Post', icon: '📰' },
		{ type: 'task', label: 'Save as Task', icon: '📋' }
	];
	
	return {
		content,
		options,
		projects: topProjects.map(p => ({ id: p.id, name: p.name }))
	};
}

// Navigate to URL after action
export function navigateTo(url: string) {
	if (browser) {
		goto(url);
	}
}

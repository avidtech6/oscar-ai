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

// Enhanced execute action with full context awareness
export async function executeAction(action: string, data: any, context: AIContext): Promise<ActionResult> {
	const currentChatContext = get(chatContext);
	const mode = currentChatContext.mode;
	
	// Handle different modes
	switch (mode) {
		case 'general':
			return await handleGeneralChatAction(action, data, context);
		case 'global':
			return await handleGlobalWorkspaceAction(action, data, context);
		case 'project':
			return await handleProjectModeAction(action, data, context);
		default:
			return { success: false, message: `Unknown chat mode: ${mode}` };
	}
}

// Handle actions in General Chat mode
async function handleGeneralChatAction(action: string, data: any, context: AIContext): Promise<ActionResult> {
	// Check if this action requires confirmation
	if (needsConfirmation('general', action)) {
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
			data: { action, data, mode: 'general' }
		};
	}
	
	// For General Chat, we need to ask where to save
	return {
		success: false,
		message: `Where should I save this ${action.replace('create', '')}?`,
		action: 'needsProjectSelection',
		data: {
			action,
			data,
			mode: 'general',
			availableProjects: context.projects.slice(0, 3).map(p => ({ id: p.id, name: p.name })),
			hasMoreProjects: context.projects.length > 3
		}
	};
}

// Handle actions in Global Workspace mode
async function handleGlobalWorkspaceAction(action: string, data: any, context: AIContext): Promise<ActionResult> {
	// Global Workspace behaves like General Chat but with cross-project awareness
	if (needsConfirmation('global', action)) {
		// Set pending action for confirmation
		chatContext.setPendingAction({
			type: action,
			data: data,
			projectId: context.selectedProjectId
		});
		
		return {
			success: false,
			message: `This action requires confirmation. Please confirm to proceed.`,
			action: 'needsConfirmation',
			data: { action, data, mode: 'global' }
		};
	}
	
	// Ask for project selection
	return {
		success: false,
		message: `Where should I save this ${action.replace('create', '')}?`,
		action: 'needsProjectSelection',
		data: {
			action,
			data,
			mode: 'global',
			availableProjects: context.projects.slice(0, 3).map(p => ({ id: p.id, name: p.name })),
			hasMoreProjects: context.projects.length > 3
		}
	};
}

// Handle actions in Project Mode
async function handleProjectModeAction(action: string, data: any, context: AIContext): Promise<ActionResult> {
	const projectId = context.selectedProjectId;
	
	if (!projectId) {
		return { success: false, message: 'No project selected in Project Mode. Please select a project first.' };
	}
	
	// Get project name for confirmation message
	const project = context.currentProject;
	const projectName = project ? project.name : 'the project';
	
	// Execute the action with project context
	switch (action) {
		case 'createBlogPost':
			return await createBlogPost({
				projectId,
				title: data.title || 'New Blog Post',
				subtitle: data.subtitle,
				bodyContent: data.content,
				tags: data.tags
			});

		case 'createNote':
			const noteResult = await createNoteAction({
				projectId: projectId,
				title: data.title || 'New Note',
				content: data.content || '',
				tags: data.tags,
				type: data.type
			});
			
			// Add project tagging confirmation
			if (noteResult.success) {
				noteResult.message = `${noteResult.message} (Tagged to: ${projectName})`;
				noteResult.data = { ...noteResult.data, projectTag: projectName };
			}
			return noteResult;

		case 'createReport':
			const reportResult = await createReportAction({
				projectId,
				title: data.title || 'New Report',
				type: data.type || 'bs5837',
				content: data.content
			});
			
			if (reportResult.success) {
				reportResult.message = `${reportResult.message} (Tagged to: ${projectName})`;
				reportResult.data = { ...reportResult.data, projectTag: projectName };
			}
			return reportResult;

		case 'createProject':
			// Creating a project in project mode switches to the new project
			return await createProjectAction({
				name: data.name || 'New Project',
				description: data.description,
				location: data.location,
				client: data.client
			});

		case 'createDiagram':
			const diagramResult = await createDiagramAction({
				projectId,
				title: data.title || 'New Diagram',
				type: data.type || 'flowchart',
				content: data.content
			});
			
			if (diagramResult.success) {
				diagramResult.message = `${diagramResult.message} (Tagged to: ${projectName})`;
				diagramResult.data = { ...diagramResult.data, projectTag: projectName };
			}
			return diagramResult;

		case 'createTree':
			const treeResult = await createTreeAction({
				projectId,
				number: data.number || '1',
				species: data.species || 'Unknown',
				DBH: data.DBH,
				height: data.height,
				age: data.age,
				category: data.category,
				condition: data.condition
			});
			
			if (treeResult.success) {
				treeResult.message = `${treeResult.message} (Tagged to: ${projectName})`;
				treeResult.data = { ...treeResult.data, projectTag: projectName };
			}
			return treeResult;

		default:
			return { success: false, message: 'Unknown action requested.' };
	}
}

// Execute action with project context (for backward compatibility)
export async function executeActionWithProject(action: string, data: any, context: AIContext): Promise<ActionResult> {
	return await executeAction(action, data, context);
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

// Suggest a client name based on project data with confidence score
export async function suggestClientName(projectData: any): Promise<{suggestion: string; confidence: number}> {
	try {
		// Get API key from settings
		const apiKey = get(groqApiKey);
		if (!apiKey) {
			throw new Error('Groq API key not configured. Please set it in Settings.');
		}

		// Fetch previous reports for this project (Step 19: Use Previous Reports as Context)
		let previousReportsContext = '';
		if (projectData.project?.id) {
			try {
				const previousReports = await db.reports.where('projectId').equals(projectData.project.id).toArray();
				if (previousReports.length > 0) {
					previousReportsContext = `\nPREVIOUS REPORTS FOR THIS PROJECT (${previousReports.length}):`;
					previousReports.slice(0, 5).forEach((report: any, index: number) => {
						previousReportsContext += `\n${index + 1}. ${report.title} (${report.type}) - ${new Date(report.generatedAt).toLocaleDateString('en-GB')}`;
					});
					if (previousReports.length > 5) {
						previousReportsContext += `\n... and ${previousReports.length - 5} more reports`;
					}
				}
			} catch (error) {
				console.warn('Could not fetch previous reports for context:', error);
			}
		}

		// Prepare context for AI with confidence scoring request
		const context = `
Project Name: ${projectData.project?.name || 'Unnamed Project'}
Project Description: ${projectData.project?.description || 'No description'}
Project Location: ${projectData.project?.location || 'No location specified'}
Tree Species Present: ${projectData.trees?.map((t: any) => t.species).join(', ') || 'None'}
Notes: ${projectData.notes?.slice(0, 3).map((n: any) => n.content.substring(0, 100)).join('; ') || 'None'}
${previousReportsContext}

Based on this arboricultural project context, suggest a plausible client name for the report.
The client should be a realistic organization or individual who would commission this type of work.
Consider previous reports for this project when making your suggestion.
Also provide a confidence score from 0-100% based on how confident you are in this suggestion.
Return in this exact format:
SUGGESTION: [client name]
CONFIDENCE: [number]%
`;

		const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'llama-3.1-8b-instant',
				messages: [
					{
						role: 'system',
						content: 'You are an expert arboricultural consultant. Suggest plausible client names for tree survey and management projects based on project context. Provide a confidence score from 0-100% based on how well the context supports your suggestion.'
					},
					{ role: 'user', content: context }
				],
				temperature: 0.7,
				max_tokens: 100
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error?.message || 'Failed to get AI suggestion');
		}

		const data = await response.json();
		const responseText = data.choices[0].message.content.trim();
		
		// Parse the response for suggestion and confidence
		let suggestion = '';
		let confidence = 70; // Default confidence
		
		const lines = responseText.split('\n');
		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.startsWith('SUGGESTION:')) {
				suggestion = trimmed.replace('SUGGESTION:', '').trim();
			} else if (trimmed.startsWith('CONFIDENCE:')) {
				const confidenceText = trimmed.replace('CONFIDENCE:', '').trim();
				const match = confidenceText.match(/(\d+)/);
				if (match) {
					confidence = parseInt(match[1], 10);
					// Ensure confidence is between 0-100
					confidence = Math.max(0, Math.min(100, confidence));
				}
			}
		}
		
		// Clean up the suggestion
		if (suggestion) {
			suggestion = suggestion
				.replace(/^["']|["']$/g, '') // Remove surrounding quotes
				.replace(/^Client name:?\s*/i, '') // Remove "Client name:" prefix
				.replace(/\.$/g, '') // Remove trailing period
				.trim();
		}
		
		// If no suggestion was parsed, use fallback
		if (!suggestion) {
			suggestion = responseText
				.replace(/^["']|["']$/g, '')
				.replace(/^Client name:?\s*/i, '')
				.replace(/\.$/g, '')
				.trim();
			
			// If still empty, use fallback
			if (!suggestion) {
				suggestion = 'Local Council / Property Developer';
				confidence = 50; // Lower confidence for fallback
			}
		}

		return { suggestion, confidence };
	} catch (error) {
		console.error('Error suggesting client name:', error);
		// Fallback suggestions based on project context with lower confidence
		let fallbackSuggestion = 'Property Owner / Client';
		let fallbackConfidence = 40;
		
		if (projectData.project?.location?.toLowerCase().includes('council')) {
			fallbackSuggestion = 'Local Council';
			fallbackConfidence = 60;
		} else if (projectData.trees?.length > 10) {
			fallbackSuggestion = 'Large Property Developer';
			fallbackConfidence = 55;
		} else if (projectData.project?.name?.toLowerCase().includes('school')) {
			fallbackSuggestion = 'School / Educational Institution';
			fallbackConfidence = 65;
		}
		
		return { suggestion: fallbackSuggestion, confidence: fallbackConfidence };
	}
}

// Suggest a site address based on project data with confidence score
export async function suggestSiteAddress(projectData: any): Promise<{suggestion: string; confidence: number}> {
	try {
		// Get API key from settings
		const apiKey = get(groqApiKey);
		if (!apiKey) {
			throw new Error('Groq API key not configured. Please set it in Settings.');
		}

		// Fetch previous reports for this project (Step 19: Use Previous Reports as Context)
		let previousReportsContext = '';
		if (projectData.project?.id) {
			try {
				const previousReports = await db.reports.where('projectId').equals(projectData.project.id).toArray();
				if (previousReports.length > 0) {
					previousReportsContext = `\nPREVIOUS REPORTS FOR THIS PROJECT (${previousReports.length}):`;
					previousReports.slice(0, 5).forEach((report: any, index: number) => {
						previousReportsContext += `\n${index + 1}. ${report.title} (${report.type}) - ${new Date(report.generatedAt).toLocaleDateString('en-GB')}`;
					});
					if (previousReports.length > 5) {
						previousReportsContext += `\n... and ${previousReports.length - 5} more reports`;
					}
				}
			} catch (error) {
				console.warn('Could not fetch previous reports for context:', error);
			}
		}

		// Prepare context for AI with confidence scoring request
		const context = `
Project Name: ${projectData.project?.name || 'Unnamed Project'}
Project Description: ${projectData.project?.description || 'No description'}
Project Client: ${projectData.project?.client || 'Not specified'}
Tree Species Present: ${projectData.trees?.map((t: any) => t.species).join(', ') || 'None'}
Notes: ${projectData.notes?.slice(0, 3).map((n: any) => n.content.substring(0, 100)).join('; ') || 'None'}
${previousReportsContext}

Based on this arboricultural project context, suggest a plausible site address for the report.
The address should be a realistic location for tree survey work in the UK.
Include street name, town/city, and postcode if possible.
Consider previous reports for this project when making your suggestion.
Also provide a confidence score from 0-100% based on how confident you are in this suggestion.
Return in this exact format:
SUGGESTION: [site address]
CONFIDENCE: [number]%
`;

		const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'llama-3.1-8b-instant',
				messages: [
					{
						role: 'system',
						content: 'You are an expert arboricultural consultant familiar with UK locations. Suggest plausible site addresses for tree survey projects based on project context. Provide a confidence score from 0-100% based on how well the context supports your suggestion.'
					},
					{ role: 'user', content: context }
				],
				temperature: 0.7,
				max_tokens: 150
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error?.message || 'Failed to get AI suggestion');
		}

		const data = await response.json();
		const responseText = data.choices[0].message.content.trim();
		
		// Parse the response for suggestion and confidence
		let suggestion = '';
		let confidence = 70; // Default confidence
		
		const lines = responseText.split('\n');
		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.startsWith('SUGGESTION:')) {
				suggestion = trimmed.replace('SUGGESTION:', '').trim();
			} else if (trimmed.startsWith('CONFIDENCE:')) {
				const confidenceText = trimmed.replace('CONFIDENCE:', '').trim();
				const match = confidenceText.match(/(\d+)/);
				if (match) {
					confidence = parseInt(match[1], 10);
					// Ensure confidence is between 0-100
					confidence = Math.max(0, Math.min(100, confidence));
				}
			}
		}
		
		// Clean up the suggestion
		if (suggestion) {
			suggestion = suggestion
				.replace(/^["']|["']$/g, '')
				.replace(/^Site address:?\s*/i, '')
				.replace(/^Address:?\s*/i, '')
				.replace(/\.$/g, '')
				.trim();
		}
		
		// If no suggestion was parsed, use fallback
		if (!suggestion) {
			suggestion = responseText
				.replace(/^["']|["']$/g, '')
				.replace(/^Site address:?\s*/i, '')
				.replace(/^Address:?\s*/i, '')
				.replace(/\.$/g, '')
				.trim();
			
			// If still empty, use fallback
			if (!suggestion) {
				suggestion = '123 Green Lane, London, SW1A 1AA';
				confidence = 50; // Lower confidence for fallback
			}
		}

		return { suggestion, confidence };
	} catch (error) {
		console.error('Error suggesting site address:', error);
		// Fallback suggestions based on project context with lower confidence
		let fallbackSuggestion = '123 Survey Site, Arboricultural Area, AB1 2CD';
		let fallbackConfidence = 40;
		
		if (projectData.project?.client?.toLowerCase().includes('council')) {
			fallbackSuggestion = 'Council Offices, High Street, Local Town';
			fallbackConfidence = 60;
		} else if (projectData.project?.name?.toLowerCase().includes('school')) {
			fallbackSuggestion = 'School Lane, Education Town, ED1 2AB';
			fallbackConfidence = 65;
		} else if (projectData.trees?.length > 0) {
			const species = projectData.trees[0].species;
			if (species.toLowerCase().includes('oak')) {
				fallbackSuggestion = 'Oak Tree Lane, Woodland Area, WD3 4EF';
				fallbackConfidence = 55;
			}
		}
		
		return { suggestion: fallbackSuggestion, confidence: fallbackConfidence };
	}
}

// Parse and clean user-provided free-text answers with confidence score
// For Step 17: Multi-Field Extraction - can extract both client and location from a single answer
export async function parseUserAnswer(answer: string, field: string): Promise<{cleaned: string; confidence: number}> {
	// For Step 17, handle both client and location fields with multi-field extraction
	if (field !== 'client' && field !== 'location') {
		return { cleaned: answer, confidence: 100 }; // Return as-is for other fields with high confidence
	}

	try {
		// Get API key from settings
		const apiKey = get(groqApiKey);
		if (!apiKey) {
			throw new Error('Groq API key not configured. Please set it in Settings.');
		}

		// Determine what we're extracting
		const extractionType = field === 'client' ? 'client name' : 'site address';
		
		const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'llama-3.1-8b-instant',
				messages: [
					{
						role: 'system',
						content: `You are an expert arboricultural consultant. Extract the ${extractionType} from free-text input. The user may provide both client name and site address in a single answer. Focus on extracting just the ${extractionType}, removing any extra commentary, punctuation, or irrelevant details. Also provide a confidence score from 0-100% based on how confident you are that this is the correct extracted ${extractionType}. Return in this exact format:\nCLEANED: [extracted ${extractionType}]\nCONFIDENCE: [number]%`
					},
					{
						role: 'user',
						content: `Extract the ${extractionType} from this text for a professional report: "${answer}"`
					}
				],
				temperature: 0.3,
				max_tokens: 100
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error?.message || 'Failed to parse answer');
		}

		const data = await response.json();
		const responseText = data.choices[0].message.content.trim();
		
		// Parse the response for cleaned text and confidence
		let cleaned = '';
		let confidence = 80; // Default confidence for AI cleaning
		
		const lines = responseText.split('\n');
		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.startsWith('CLEANED:')) {
				cleaned = trimmed.replace('CLEANED:', '').trim();
			} else if (trimmed.startsWith('CONFIDENCE:')) {
				const confidenceText = trimmed.replace('CONFIDENCE:', '').trim();
				const match = confidenceText.match(/(\d+)/);
				if (match) {
					confidence = parseInt(match[1], 10);
					// Ensure confidence is between 0-100
					confidence = Math.max(0, Math.min(100, confidence));
				}
			}
		}
		
		// Clean up the cleaned text
		if (cleaned) {
			cleaned = cleaned
				.replace(/^["']|["']$/g, '') // Remove surrounding quotes
				.replace(/^Cleaned (client name|site address):?\s*/i, '')
				.replace(/^(Client name|Site address):?\s*/i, '')
				.replace(/\.$/g, '')
				.trim();
		}
		
		// If no cleaned text was parsed, use fallback
		if (!cleaned) {
			cleaned = responseText
				.replace(/^["']|["']$/g, '')
				.replace(/^Cleaned (client name|site address):?\s*/i, '')
				.replace(/^(Client name|Site address):?\s*/i, '')
				.replace(/\.$/g, '')
				.trim();
			
			// If still empty, use simple cleaning
			if (!cleaned) {
				cleaned = answer
					.replace(/^[^a-zA-Z0-9]+/, '')
					.replace(/[^a-zA-Z0-9\s\/&]+$/, '')
					.replace(/\s+/g, ' ')
					.trim();
				confidence = 60; // Lower confidence for fallback cleaning
			}
		}

		return { cleaned: cleaned || answer, confidence };
	} catch (error) {
		console.error('Error parsing user answer:', error);
		// Simple fallback cleaning with lower confidence
		const simpleClean = answer
			.replace(/^[^a-zA-Z0-9]+/, '') // Remove leading non-alphanumeric
			.replace(/[^a-zA-Z0-9\s\/&]+$/, '') // Remove trailing punctuation
			.replace(/\s+/g, ' ') // Normalize spaces
			.trim();
		
		return {
			cleaned: simpleClean || answer,
			confidence: 50 // Low confidence for error case
		};
	}
}

// Generate follow-up questions for site address
export async function generateFollowUpQuestions(field: string, answer: string): Promise<string[]> {
	// For Step 14, only handle site address
	if (field !== 'location') {
		return []; // Return empty for other fields
	}

	try {
		// Get API key from settings
		const apiKey = get(groqApiKey);
		if (!apiKey) {
			throw new Error('Groq API key not configured. Please set it in Settings.');
		}

		const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'llama-3.1-8b-instant',
				messages: [
					{
						role: 'system',
						content: 'You are an expert arboricultural consultant. Based on a site address provided by the user, generate 2-3 relevant follow-up questions to gather more precise location details for a tree survey report. Return each question on a new line, numbered (1., 2., 3.).'
					},
					{
						role: 'user',
						content: `Site address: "${answer}"\n\nGenerate 2-3 follow-up questions to clarify the location details for a tree survey report.`
					}
				],
				temperature: 0.5,
				max_tokens: 150
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error?.message || 'Failed to generate follow-up questions');
		}

		const data = await response.json();
		const questionsText = data.choices[0].message.content.trim();
		
		// Parse the questions - split by new lines and clean
		const questions = questionsText
			.split('\n')
			.map((q: string) => q.replace(/^\d+\.\s*/, '').trim())
			.filter((q: string) => q.length > 0 && !q.toLowerCase().includes('note:') && !q.toLowerCase().includes('follow-up'));

		// Ensure we have at least 2 questions
		if (questions.length === 0) {
			return [
				'Is this a residential or commercial property?',
				'Are there any access restrictions we should be aware of?',
				'Do you have a site plan or map available?'
			];
		}

		return questions.slice(0, 3); // Return max 3 questions
	} catch (error) {
		console.error('Error generating follow-up questions:', error);
		// Fallback questions
		return [
			'Is this a residential or commercial property?',
			'Are there any access restrictions we should be aware of?',
			'Do you have a site plan or map available?'
		];
	}
}

// Generate AI-powered gap-fill questions based on template and project data
export async function generateAIGapFillQuestions(templateId: string, projectData: any): Promise<Array<{id: string; question: string; answer: string; field: string}>> {
	try {
		// Get API key from settings
		const apiKey = get(groqApiKey);
		if (!apiKey) {
			throw new Error('Groq API key not configured. Please set it in Settings.');
		}

		// Fetch previous reports for this project (Step 19: Use Previous Reports as Context)
		let previousReportsContext = '';
		if (projectData.project?.id) {
			try {
				const previousReports = await db.reports.where('projectId').equals(projectData.project.id).toArray();
				if (previousReports.length > 0) {
					previousReportsContext = `\nPrevious Reports for this Project: ${previousReports.length} reports found.`;
					previousReports.slice(0, 3).forEach((report: any, index: number) => {
						previousReportsContext += `\n${index + 1}. ${report.title} (${report.type})`;
					});
					if (previousReports.length > 3) {
						previousReportsContext += `\n... and ${previousReports.length - 3} more reports`;
					}
				}
			} catch (error) {
				console.warn('Could not fetch previous reports for gap-fill questions:', error);
			}
		}

		// Prepare context
		const context = `
Template: ${templateId}
Project Name: ${projectData.project?.name || 'Unnamed Project'}
Project Client: ${projectData.project?.client || 'Not specified'}
Project Location: ${projectData.project?.location || 'Not specified'}
Number of Trees: ${projectData.trees?.length || 0}
Number of Notes: ${projectData.notes?.length || 0}
${previousReportsContext}

Based on this project context and the report template, identify the most critical missing information that should be gathered before generating the report.
Consider any previous reports for this project when identifying missing information.
Focus ONLY on client name and site address fields (client, location).
Generate 1-2 questions for each missing field.
Return each question in this exact format:
FIELD: client|location
QUESTION: Your question here
`;

		const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'llama-3.1-8b-instant',
				messages: [
					{
						role: 'system',
						content: 'You are an expert arboricultural consultant. Analyze project data and identify missing information needed for a professional report. Generate focused questions to fill gaps in client name and site address fields only. Return questions in the specified format.'
					},
					{ role: 'user', content: context }
				],
				temperature: 0.4,
				max_tokens: 300
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error?.message || 'Failed to generate AI gap-fill questions');
		}

		const data = await response.json();
		const responseText = data.choices[0].message.content.trim();
		
		// Parse the response
		const questions: Array<{id: string; question: string; answer: string; field: string}> = [];
		const lines = responseText.split('\n');
		
		let currentField = '';
		let currentQuestion = '';
		
		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.startsWith('FIELD:')) {
				currentField = trimmed.replace('FIELD:', '').trim().toLowerCase();
			} else if (trimmed.startsWith('QUESTION:')) {
				currentQuestion = trimmed.replace('QUESTION:', '').trim();
				
				if (currentField && currentQuestion && (currentField === 'client' || currentField === 'location')) {
					questions.push({
						id: crypto.randomUUID(),
						question: currentQuestion,
						answer: '',
						field: currentField
					});
					// Reset for next question
					currentField = '';
					currentQuestion = '';
				}
			}
		}

		// If no questions were generated, fall back to static questions
		if (questions.length === 0) {
			const fallbackQuestions = [];
			
			if (!projectData.project?.client || projectData.project.client === 'Not specified') {
				fallbackQuestions.push({
					id: crypto.randomUUID(),
					question: 'What is the client name?',
					answer: '',
					field: 'client'
				});
			}
			
			if (!projectData.project?.location || projectData.project.location === 'Not specified') {
				fallbackQuestions.push({
					id: crypto.randomUUID(),
					question: 'What is the site address?',
					answer: '',
					field: 'location'
				});
			}
			
			return fallbackQuestions;
		}

		return questions;
	} catch (error) {
		console.error('Error generating AI gap-fill questions:', error);
		// Fallback to static questions
		const fallbackQuestions = [];
		
		if (!projectData.project?.client || projectData.project.client === 'Not specified') {
			fallbackQuestions.push({
				id: crypto.randomUUID(),
				question: 'What is the client name?',
				answer: '',
				field: 'client'
			});
		}
		
		if (!projectData.project?.location || projectData.project.location === 'Not specified') {
			fallbackQuestions.push({
				id: crypto.randomUUID(),
				question: 'What is the site address?',
				answer: '',
				field: 'location'
			});
		}
		
		return fallbackQuestions;
	}
}

// Navigate to URL after action
export function navigateTo(url: string) {
	if (browser) {
		goto(url);
	}
}

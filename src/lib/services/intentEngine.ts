import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { db, type Task, type Note, type ObjectLink, createTask, getAllTasks, getTasksByStatus, getTasksByProject, createNote, getNotes, getAllNotes, createLink, getLinkedNotesForTask, updateTask } from '$lib/db';
import { settings } from '$lib/stores/settings';

// Intent types
export type IntentType = 'task' | 'subtask' | 'note' | 'project' | 'blog' | 'report' | 'diagram' | 'tree' | 'query' | 'update' | 'chat';

export interface ClassifiedIntent {
	type: IntentType;
	action: string;
	data: any;
	confidence: number;
}

export interface ActionResult {
	success: boolean;
	message: string;
	action?: string;
	data?: any;
	redirectUrl?: string;
	intentType?: IntentType;
	objects?: any[];
}

// Intent classification function
export function classifyIntent(message: string): ClassifiedIntent | null {
	const msg = message.toLowerCase().trim();
	
	// Task patterns - "remember", "look into", "check", "buy", "fix", "schedule", "follow up", "research", "do", "complete"
	const taskPatterns = [
		/\b(remember|remind me|remind to)\b/i,
		/\b(look into|look at|find out|find information about)\b/i,
		/\b(check|verify|confirm)\b/i,
		/\b(buy|purchase|get)\b/i,
		/\b(fix|repair|solve)\b/i,
		/\b(schedule|book|arrange)\b/i,
		/\b(follow up|followup)\b/i,
		/\b(research|investigate|explore)\b/i,
		/\b(do|perform|execute|carry out)\b/i,
		/\b(complete|finish|finish up|wrap up)\b/i,
		/\b(task|todo|to-do)\b/i
	];
	
	for (const pattern of taskPatterns) {
		if (pattern.test(msg)) {
			return {
				type: 'task',
				action: 'createTask',
				data: extractTaskData(message),
				confidence: 0.9
			};
		}
	}
	
	// Subtask patterns - "under this", "as part of", "beneath this item"
	const subtaskPatterns = [
		/\b(under this|under that)\b/i,
		/\b(as part of|because of)\b/i,
		/\b(beneath this|beneath that)\b/i,
		/\b(subtask|sub-task)\b/i
	];
	
	for (const pattern of subtaskPatterns) {
		if (pattern.test(msg)) {
			return {
				type: 'subtask',
				action: 'createSubtask',
				data: extractTaskData(message),
				confidence: 0.85
			};
		}
	}
	
	// Note patterns - "note to self", "jot down", "write a note", "make a note"
	const notePatterns = [
		/\b(note to self|note:)\b/i,
		/\b(jot down|write down|put down)\b/i,
		/\b(write a note|make a note|create a note|take a note|add a note)\b/i,
		/\bnote about\b/i
	];
	
	for (const pattern of notePatterns) {
		if (pattern.test(msg)) {
			return {
				type: 'note',
				action: 'createNote',
				data: extractNoteData(message),
				confidence: 0.9
			};
		}
	}
	
	// Project patterns
	const projectPatterns = [
		/\b(start a project|create a project|new project|make a project)\b/i
	];
	
	for (const pattern of projectPatterns) {
		if (pattern.test(msg)) {
			return {
				type: 'project',
				action: 'createProject',
				data: extractProjectData(message),
				confidence: 0.9
			};
		}
	}
	
	// Blog patterns
	const blogPatterns = [
		/\b(write a blog|create a blog|blog post|write about)\b/i
	];
	
	for (const pattern of blogPatterns) {
		if (pattern.test(msg)) {
			return {
				type: 'blog',
				action: 'createBlogPost',
				data: extractBlogData(message),
				confidence: 0.9
			};
		}
	}
	
	// Report patterns
	const reportPatterns = [
		/\b(create a report|write a report|generate a report|make a report|bs5837)\b/i
	];
	
	for (const pattern of reportPatterns) {
		if (pattern.test(msg)) {
			return {
				type: 'report',
				action: 'createReport',
				data: extractReportData(message),
				confidence: 0.9
			};
		}
	}
	
	// Diagram patterns
	const diagramPatterns = [
		/\b(create a diagram|make a diagram|draw a|flowchart|mind map|gantt)\b/i
	];
	
	for (const pattern of diagramPatterns) {
		if (pattern.test(msg)) {
			return {
				type: 'diagram',
				action: 'createDiagram',
				data: extractDiagramData(message),
				confidence: 0.9
			};
		}
	}
	
	// Tree patterns
	const treePatterns = [
		/\b(add a tree|add tree|new tree|record a tree)\b/i
	];
	
	for (const pattern of treePatterns) {
		if (pattern.test(msg)) {
			return {
				type: 'tree',
				action: 'createTree',
				data: extractTreeData(message),
				confidence: 0.9
			};
		}
	}
	
	// Query patterns - "show me", "list", "what are", "summarise"
	const queryPatterns = [
		/\b(show me|show|display|view)\b/i,
		/\b(list|list all|list all)\b/i,
		/\b(what are|what is|what's|where are)\b/i,
		/\b(summarise|summary|summarize)\b/i,
		/\b(find|search|look for)\b/i
	];
	
	for (const pattern of queryPatterns) {
		if (pattern.test(msg)) {
			return {
				type: 'query',
				action: 'query',
				data: extractQueryData(message),
				confidence: 0.85
			};
		}
	}
	
	// Update patterns - "change", "update", "rename", "add tags"
	const updatePatterns = [
		/\b(change|update|modify|edit)\b/i,
		/\b(rename|renamed)\b/i,
		/\b(add tags|add tag)\b/i,
		/\b(mark complete|mark done|mark as done)\b/i
	];
	
	for (const pattern of updatePatterns) {
		if (pattern.test(msg)) {
			return {
				type: 'update',
				action: 'updateObject',
				data: extractUpdateData(message),
				confidence: 0.8
			};
		}
	}
	
	// Default to chat
	return null;
}

// Data extraction functions
function extractTaskData(message: string): any {
	const currentSettings = get(settings);
	const projectId = currentSettings.currentProjectId;
	
	let title = 'New Task';
	let content = message;
	let priority: 'low' | 'medium' | 'high' = 'medium';
	let tags: string[] = [];
	
	// Extract title from message
	const titlePatterns = [
		/(?:remember|remind me|remind to|task:?)\s*(.+)/i,
		/(?:to|that|about)\s*(.+)/i
	];
	
	for (const pattern of titlePatterns) {
		const match = message.match(pattern);
		if (match && match[1]) {
			title = match[1].trim();
			break;
		}
	}
	
	// Extract priority
	if (/\b(urgent|asap|immediately|important|high priority|critical)\b/i.test(message)) {
		priority = 'high';
	} else if (/\b(low priority|whenever|when you can)\b/i.test(message)) {
		priority = 'low';
	}
	
	// Extract tags
	const tagMatch = message.match(/#(\w+)/g);
	if (tagMatch) {
		tags = tagMatch.map((t: string) => t.replace('#', ''));
	}
	
	// Extract due date
	let dueDate: Date | undefined;
	const dateMatch = message.match(/(?:by|due|on)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
	if (dateMatch) {
		// For now, just set a placeholder - could be enhanced with proper date parsing
		dueDate = new Date();
	}
	
	return {
		title,
		content,
		status: 'todo' as const,
		priority,
		projectId: projectId || undefined,
		tags,
		dueDate
	};
}

function extractNoteData(message: string): any {
	const currentSettings = get(settings);
	const projectId = currentSettings.currentProjectId;
	
	let title = 'Quick Note';
	let content = message;
	let tags: string[] = [];
	
	// Extract title
	const titleMatch = message.match(/(?:note about|note:|title:)\s*([^,.\n]+)/i);
	if (titleMatch) {
		title = titleMatch[1].trim();
	}
	
	// Clean content
	content = message
		.replace(/^(note to self|jot down|write a note|make a note|create a note|take a note|add a note|note about|note:)\s*/i, '')
		.replace(/^title:[^\n]+\n?/i, '')
		.trim();
	
	if (!content) content = message;
	
	// Extract tags
	const tagMatch = message.match(/#(\w+)/g);
	if (tagMatch) {
		tags = tagMatch.map((t: string) => t.replace('#', ''));
	}
	
	return {
		title,
		content,
		projectId: projectId || undefined,
		tags,
		type: 'general' as const
	};
}

function extractProjectData(message: string): any {
	let name = 'New Project';
	let description = '';
	let location = '';
	let client = '';
	
	const nameMatch = message.match(/(?:project|project called)\s*([^,.\n]+)/i);
	if (nameMatch) {
		name = nameMatch[1].trim();
	}
	
	const clientMatch = message.match(/(?:for|client:)\s*([^,.\n]+)/i);
	if (clientMatch) {
		client = clientMatch[1].trim();
	}
	
	const locationMatch = message.match(/(?:at|location:)\s*([^,.\n]+)/i);
	if (locationMatch) {
		location = locationMatch[1].trim();
	}
	
	return { name, description, location, client };
}

function extractBlogData(message: string): any {
	const currentSettings = get(settings);
	const projectId = currentSettings.currentProjectId;
	
	let title = 'New Blog Post';
	let subtitle = '';
	let content = message;
	let tags: string[] = [];
	
	const titleMatch = message.match(/(?:blog post|about|write about)\s*([^,.\n]+)/i);
	if (titleMatch) {
		title = titleMatch[1].trim();
	}
	
	const tagMatch = message.match(/#(\w+)/g);
	if (tagMatch) {
		tags = tagMatch.map((t: string) => t.replace('#', ''));
	}
	
	return { title, subtitle, content, tags, projectId };
}

function extractReportData(message: string): any {
	const currentSettings = get(settings);
	const projectId = currentSettings.currentProjectId;
	
	let title = 'New Report';
	let type: 'bs5837' | 'impact' | 'method' = 'bs5837';
	
	if (/\bimpact\b/i.test(message)) {
		type = 'impact';
		title = 'Arboricultural Impact Assessment';
	} else if (/\bmethod\b/i.test(message)) {
		type = 'method';
		title = 'Arboricultural Method Statement';
	} else if (/\bbs5837\b/i.test(message)) {
		type = 'bs5837';
		title = 'BS5837 Tree Survey';
	}
	
	return { title, type, content: '', projectId };
}

function extractDiagramData(message: string): any {
	const currentSettings = get(settings);
	const projectId = currentSettings.currentProjectId;
	
	let title = 'New Diagram';
	let type = 'flowchart';
	
	if (/\bmind\b/i.test(message)) {
		type = 'mindmap';
		title = 'Mind Map';
	} else if (/\bgantt\b/i.test(message)) {
		type = 'gantt';
		title = 'Gantt Chart';
	}
	
	return { title, type, content: '', projectId };
}

function extractTreeData(message: string): any {
	const currentSettings = get(settings);
	const projectId = currentSettings.currentProjectId;
	
	let number = '1';
	let species = 'Unknown';
	let DBH = 0;
	let height = 0;
	let age = 'Mature';
	let category = 'C';
	let condition = 'Good';
	
	const speciesMatch = message.match(/(oak|ash|maple|beech|sycamore|pine|spruce|elm|birch|cherry|hawthorn|willow|poplar|lime|horse chestnut|rowan|alder|cedar|fir|hemlock)/i);
	if (speciesMatch) {
		species = speciesMatch[0].charAt(0).toUpperCase() + speciesMatch[0].slice(1).toLowerCase();
	}
	
	const numberMatch = message.match(/(?:tree\s*#?|number)\s*(\d+)/i);
	if (numberMatch) {
		number = numberMatch[1];
	}
	
	const dbhMatch = message.match(/(?:dbh|stem|diameter)\s*(\d+)/i);
	if (dbhMatch) {
		DBH = parseInt(dbhMatch[1]);
	}
	
	return { number, species, DBH, height, age, category, condition, projectId };
}

function extractQueryData(message: string): any {
	const msg = message.toLowerCase();
	
	let objectType: 'tasks' | 'notes' | 'projects' | 'trees' | 'reports' | 'diagrams' | 'blogs' = 'tasks';
	let status: string | undefined;
	let searchTerm = '';
	
	// Determine object type
	if (/\b(notes?|note)\b/i.test(msg)) {
		objectType = 'notes';
	} else if (/\b(projects?)\b/i.test(msg)) {
		objectType = 'projects';
	} else if (/\b(trees?)\b/i.test(msg)) {
		objectType = 'trees';
	} else if (/\b(reports?)\b/i.test(msg)) {
		objectType = 'reports';
	} else if (/\b(diagrams?|flows?|charts?)\b/i.test(msg)) {
		objectType = 'diagrams';
	} else if (/\b(blogs?|posts?)\b/i.test(msg)) {
		objectType = 'blogs';
	}
	
	// Determine status filter
	if (/\b(active|current|ongoing)\b/i.test(msg)) {
		status = 'todo';
	} else if (/\b(complete|completed|done|finished)\b/i.test(msg)) {
		status = 'done';
	} else if (/\b(archived|archive)\b/i.test(msg)) {
		status = 'archived';
	}
	
	// Extract search term
	searchTerm = message.replace(/^(show me|list|what are|summarise|find|search|look for)\s*/i, '').trim();
	
	return { objectType, status, searchTerm };
}

function extractUpdateData(message: string): any {
	// This would need more sophisticated parsing to identify the object to update
	// For now, return the raw message
	return { message };
}

// Execute intent
export async function executeIntent(intent: ClassifiedIntent): Promise<ActionResult> {
	if (!browser) {
		return { success: false, message: 'Cannot execute actions in server context' };
	}
	
	try {
		switch (intent.type) {
			case 'task':
				return await executeCreateTask(intent.data);
			case 'note':
				return await executeCreateNote(intent.data);
			case 'project':
				return await executeCreateProject(intent.data);
			case 'blog':
				return await executeCreateBlog(intent.data);
			case 'report':
				return await executeCreateReport(intent.data);
			case 'diagram':
				return await executeCreateDiagram(intent.data);
			case 'tree':
				return await executeCreateTree(intent.data);
			case 'query':
				return await executeQuery(intent.data);
			case 'subtask':
				return await executeCreateTask({ ...intent.data, isSubtask: true });
			default:
				return { success: false, message: 'Unknown intent type' };
		}
	} catch (error) {
		console.error('Error executing intent:', error);
		return { 
			success: false, 
			message: error instanceof Error ? error.message : 'Failed to execute action' 
		};
	}
}

// Execute functions for each intent type
async function executeCreateTask(data: any): Promise<ActionResult> {
	const { title, content, status, priority, projectId, tags, dueDate, isSubtask } = data;
	
	try {
		// Create the task
		const taskId = await createTask({
			title: title || 'New Task',
			content: content || '',
			status: status || 'todo',
			priority: priority || 'medium',
			projectId,
			tags: tags || [],
			dueDate
		});
		
		// Auto-generate a linked note with context
		const noteContent = `Task Context:\n${content || title}\n\nPriority: ${priority || 'medium'}\nStatus: ${status || 'todo'}`;
		const noteId = await createNote({
			title: `Context: ${title}`,
			content: noteContent,
			projectId,
			tags: tags || [],
			type: 'general'
		});
		
		// Link task to note
		await createLink({
			sourceId: taskId,
			sourceType: 'task',
			targetId: noteId,
			targetType: 'note',
			relationType: 'context'
		});
		
		// Update task with linked note
		await db.tasks.update(taskId, { linkedNoteId: noteId });
		
		return {
			success: true,
			message: `Task "${title}" created with linked context note`,
			action: 'createTask',
			data: { taskId, noteId },
			redirectUrl: `/notes?note=${noteId}&mode=edit`,
			intentType: 'task'
		};
	} catch (error) {
		console.error('Error creating task:', error);
		return { success: false, message: 'Failed to create task. Please try again.' };
	}
}

async function executeCreateNote(data: any): Promise<ActionResult> {
	const { title, content, projectId, tags, type } = data;
	
	try {
		const noteId = await createNote({
			title: title || 'Quick Note',
			content: content || '',
			projectId,
			tags: tags || [],
			type: type || 'general'
		});
		
		return {
			success: true,
			message: `Note "${title}" created successfully`,
			action: 'createNote',
			data: { noteId },
			redirectUrl: `/notes?note=${noteId}&mode=edit`,
			intentType: 'note'
		};
	} catch (error) {
		console.error('Error creating note:', error);
		return { success: false, message: 'Failed to create note. Please try again.' };
	}
}

async function executeCreateProject(data: any): Promise<ActionResult> {
	const { name, description, location, client } = data;
	
	try {
		const projectId = await db.projects.add({
			name: name || 'New Project',
			description: description || '',
			location: location || '',
			client: client || '',
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
			message: `Project "${name}" created successfully`,
			action: 'createProject',
			data: { projectId },
			redirectUrl: `/project/${projectId}`,
			intentType: 'project'
		};
	} catch (error) {
		console.error('Error creating project:', error);
		return { success: false, message: 'Failed to create project. Please try again.' };
	}
}

async function executeCreateBlog(data: any): Promise<ActionResult> {
	const { title, subtitle, content, tags, projectId } = data;
	
	if (!projectId) {
		return { success: false, message: 'Please select a project first to create a blog post.' };
	}
	
	try {
		const blogPost = {
			id: crypto.randomUUID(),
			projectId,
			title: title || 'New Blog Post',
			subtitle: subtitle || '',
			bodyHTML: content || '',
			bodyContent: content || '',
			tags: tags || [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		
		const stored = localStorage.getItem('oscar_blog_posts');
		const posts: any[] = stored ? JSON.parse(stored) : [];
		posts.push(blogPost);
		localStorage.setItem('oscar_blog_posts', JSON.stringify(posts));
		
		return {
			success: true,
			message: `Blog post "${title}" created successfully`,
			action: 'createBlogPost',
			data: blogPost,
			redirectUrl: `/blog?project=${projectId}&post=${blogPost.id}&mode=edit`,
			intentType: 'blog'
		};
	} catch (error) {
		console.error('Error creating blog post:', error);
		return { success: false, message: 'Failed to create blog post. Please try again.' };
	}
}

async function executeCreateReport(data: any): Promise<ActionResult> {
	const { title, type, content, projectId } = data;
	
	if (!projectId) {
		return { success: false, message: 'Please select a project first to create a report.' };
	}
	
	try {
		const report = {
			id: crypto.randomUUID(),
			projectId,
			title: title || 'New Report',
			type: type || 'bs5837',
			content: content || '',
			generatedAt: new Date().toISOString()
		};
		
		const stored = localStorage.getItem('oscar_reports');
		const reports: any[] = stored ? JSON.parse(stored) : [];
		reports.push(report);
		localStorage.setItem('oscar_reports', JSON.stringify(reports));
		
		return {
			success: true,
			message: `Report "${title}" created successfully`,
			action: 'createReport',
			data: report,
			redirectUrl: `/reports?project=${projectId}&report=${report.id}&mode=edit`,
			intentType: 'report'
		};
	} catch (error) {
		console.error('Error creating report:', error);
		return { success: false, message: 'Failed to create report. Please try again.' };
	}
}

async function executeCreateDiagram(data: any): Promise<ActionResult> {
	const { title, type, content, projectId } = data;
	
	if (!projectId) {
		return { success: false, message: 'Please select a project first to create a diagram.' };
	}
	
	try {
		const diagram = {
			id: crypto.randomUUID(),
			projectId,
			title: title || 'New Diagram',
			type: type || 'flowchart',
			content: content || '',
			createdAt: new Date().toISOString()
		};
		
		const stored = localStorage.getItem('oscar_diagrams');
		const diagrams: any[] = stored ? JSON.parse(stored) : [];
		diagrams.push(diagram);
		localStorage.setItem('oscar_diagrams', JSON.stringify(diagrams));
		
		return {
			success: true,
			message: `Diagram "${title}" created successfully`,
			action: 'createDiagram',
			data: diagram,
			redirectUrl: `/diagrams?project=${projectId}&diagram=${diagram.id}&mode=edit`,
			intentType: 'diagram'
		};
	} catch (error) {
		console.error('Error creating diagram:', error);
		return { success: false, message: 'Failed to create diagram. Please try again.' };
	}
}

async function executeCreateTree(data: any): Promise<ActionResult> {
	const { number, species, DBH, height, age, category, condition, projectId } = data;
	
	if (!projectId) {
		return { success: false, message: 'Please select a project first to add a tree.' };
	}
	
	try {
		const treeId = await db.trees.add({
			projectId,
			number: number || '1',
			species: species || 'Unknown',
			scientificName: '',
			DBH: DBH || 0,
			height: height || 0,
			age: age || 'Mature',
			category: category || 'C',
			condition: condition || 'Good',
			photos: [],
			createdAt: new Date(),
			updatedAt: new Date()
		} as any);
		
		return {
			success: true,
			message: `Tree ${number} (${species}) added successfully`,
			action: 'createTree',
			data: { treeId },
			redirectUrl: `/project/${projectId}?tree=${treeId}`,
			intentType: 'tree'
		};
	} catch (error) {
		console.error('Error adding tree:', error);
		return { success: false, message: 'Failed to add tree. Please try again.' };
	}
}

async function executeQuery(data: any): Promise<ActionResult> {
	const { objectType, status, searchTerm } = data;
	const currentSettings = get(settings);
	const projectId = currentSettings.currentProjectId;
	
	try {
		let objects: any[] = [];
		let redirectUrl = '/';
		
		switch (objectType) {
			case 'tasks':
				if (status) {
					objects = await getTasksByStatus(status as Task['status']);
				} else if (projectId) {
					objects = await getTasksByProject(projectId);
				} else {
					objects = await getAllTasks();
				}
				redirectUrl = '/tasks';
				break;
				
			case 'notes':
				if (projectId) {
					objects = await db.notes.where('projectId').equals(projectId).toArray();
				} else {
					objects = await getAllNotes();
				}
				redirectUrl = '/notes';
				break;
				
			case 'projects':
				objects = await db.projects.orderBy('updatedAt').reverse().toArray();
				redirectUrl = '/workspace';
				break;
				
			case 'trees':
				if (projectId) {
					objects = await db.trees.where('projectId').equals(projectId).toArray();
				}
				redirectUrl = `/project/${projectId}`;
				break;
				
			case 'reports':
				if (projectId) {
					objects = await db.reports.where('projectId').equals(projectId).toArray();
				}
				redirectUrl = '/reports';
				break;
				
			case 'diagrams':
				if (projectId) {
					const stored = localStorage.getItem('oscar_diagrams');
					if (stored) {
						const all = JSON.parse(stored);
						objects = all.filter((d: any) => d.projectId === projectId);
					}
				}
				redirectUrl = '/diagrams';
				break;
				
			case 'blogs':
				if (projectId) {
					const stored = localStorage.getItem('oscar_blog_posts');
					if (stored) {
						const all = JSON.parse(stored);
						objects = all.filter((p: any) => p.projectId === projectId);
					}
				}
				redirectUrl = '/blog';
				break;
		}
		
		// Filter by search term if provided
		if (searchTerm && objects.length > 0) {
			const term = searchTerm.toLowerCase();
			objects = objects.filter((obj: any) => {
				const title = (obj.title || obj.name || '').toLowerCase();
				const content = (obj.content || obj.description || '').toLowerCase();
				return title.includes(term) || content.includes(term);
			});
		}
		
		return {
			success: true,
			message: `Found ${objects.length} ${objectType}`,
			action: 'query',
			data: { objectType, status, searchTerm },
			redirectUrl,
			intentType: 'query',
			objects
		};
	} catch (error) {
		console.error('Error executing query:', error);
		return { success: false, message: 'Failed to execute query. Please try again.' };
	}
}

// Navigation helper
export function navigateTo(url: string) {
	if (browser) {
		goto(url);
	}
}

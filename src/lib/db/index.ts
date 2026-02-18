import Dexie, { type Table } from 'dexie';

export interface Project {
	id?: string;
	name: string;
	description: string;
	location: string;
	client: string;
	isDummy?: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface Tree {
	id?: string;
	projectId: string;
	number: string;
	species: string;
	scientificName: string;
	DBH: number;
	height: number;
	age: string;
	category: string;
	condition: string;
	photos: string[];
	isDummy?: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface Note {
	id?: string;
	projectId?: string;
	title: string;
	content: string;
	transcript?: string;
	tags: string[];
	type: 'general' | 'voice' | 'field';
	isDummy?: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface Photo {
	id?: string;
	projectId: string;
	treeId?: string;
	filename: string;
	blob: Blob;
	mimeType: string;
	createdAt: Date;
}

export interface Report {
	id?: string;
	projectId: string;
	title: string;
	type: 'bs5837' | 'impact' | 'method';
	pdfBlob: Blob;
	isDummy?: boolean;
	generatedAt: Date;
}

// New: Task interface for intent-based task creation
export interface Task {
	id?: string;
	title: string;
	content: string;
	status: 'todo' | 'in_progress' | 'done' | 'archived';
	priority: 'low' | 'medium' | 'high';
	dueDate?: Date;
	projectId?: string;
	linkedNoteId?: string;
	tags: string[];
	isDummy?: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// New: Link interface for bidirectional linking between objects
export interface ObjectLink {
	id?: string;
	sourceId: string;
	sourceType: 'task' | 'note' | 'project' | 'tree' | 'report' | 'blog' | 'voice_note';
	targetId: string;
	targetType: 'task' | 'note' | 'project' | 'tree' | 'report' | 'blog' | 'voice_note';
	relationType: 'context' | 'subtask' | 'voice_attachment' | 'reference';
	createdAt: Date;
}

// Chat message interface for persistent chat history
export interface ChatMessage {
	id?: string;
	role: 'user' | 'oscar';
	content: string;
	timestamp: Date;
	actionUrl?: string;
	actionType?: string;
	actionResult?: any;
	objects?: any[];
}

// Voice Note interface for unified voice recording system
export interface VoiceNote {
	id?: string;
	projectId: string | null;
	audioBlob: Blob;
	transcript: string;
	duration: number;
	intent: string;
	timestamp: Date;
	metadata: Record<string, any>;
	isDummy?: boolean;
}

// Blog Post interface for AI-generated blog posts
export interface BlogPost {
	id?: string;
	projectId: string;
	title: string;
	subtitle: string;
	bodyHTML: string;
	bodyContent: string; // Raw content for AI editing
	tags: string[];
	isDummy?: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Diagram interface for generated diagrams
export interface Diagram {
	id?: string;
	projectId: string;
	title: string;
	type: string;
	content: string; // SVG, Mermaid, or other diagram format
	isDummy?: boolean;
	createdAt: Date;
}

// Intent Log interface for audit trail
export interface IntentLog {
	id?: string;
	timestamp: Date;
	intent: string;
	confidence: number;
	input: string;
	projectId?: string | null;
	mode: 'general' | 'project' | 'global';
	action: string;
	success: boolean;
	requiresConfirmation: boolean;
	userConfirmed: boolean;
	data: Record<string, any>;
	error?: string;
}

// Settings interface for unified storage migration (Phase 5)
export interface Setting {
	key: string;
	value: any;
	updatedAt: Date;
}

export class OscarDatabase extends Dexie {
	projects!: Table<Project, string>;
	trees!: Table<Tree, string>;
	notes!: Table<Note, string>;
	photos!: Table<Photo, string>;
	reports!: Table<Report, string>;
	tasks!: Table<Task, string>;
	links!: Table<ObjectLink, string>;
	chatMessages!: Table<ChatMessage, string>;
	voiceNotes!: Table<VoiceNote, string>;
	blogPosts!: Table<BlogPost, string>;
	diagrams!: Table<Diagram, string>;
	intentLogs!: Table<IntentLog, string>;
	settings!: Table<Setting, string>;

	constructor() {
		super('OscarAI');
		
		// Version 3 - original schema
		this.version(3).stores({
			projects: 'id, name, createdAt, updatedAt',
			trees: 'id, projectId, number, species, createdAt',
			notes: 'id, projectId, title, *tags, createdAt',
			photos: 'id, projectId, treeId, createdAt',
			reports: 'id, projectId, type, generatedAt',
			tasks: 'id, status, priority, projectId, *tags, createdAt',
			links: 'id, sourceId, targetId, sourceType, targetType, relationType',
			chatMessages: 'id, role, timestamp'
		});
		
		// Version 4 - add isDummy indexes for dummy data queries
		this.version(4).stores({
			projects: 'id, name, createdAt, updatedAt, isDummy',
			trees: 'id, projectId, number, species, createdAt, isDummy',
			notes: 'id, projectId, title, *tags, createdAt, isDummy',
			photos: 'id, projectId, treeId, createdAt',
			reports: 'id, projectId, type, generatedAt, isDummy',
			tasks: 'id, status, priority, projectId, *tags, createdAt, isDummy',
			links: 'id, sourceId, targetId, sourceType, targetType, relationType',
			chatMessages: 'id, role, timestamp'
		}).upgrade(trans => {
			// Migration: ensure all existing records have isDummy = 0 (false)
			// This is a no-op migration since isDummy will be undefined/null for existing records
			// and queries with .equals(1) won't match them
			console.log('Migrating to database version 4: adding isDummy indexes');
		});
		
		// Version 5 - add voice notes table for unified voice system
		this.version(5).stores({
			projects: 'id, name, createdAt, updatedAt, isDummy',
			trees: 'id, projectId, number, species, createdAt, isDummy',
			notes: 'id, projectId, title, *tags, createdAt, isDummy',
			photos: 'id, projectId, treeId, createdAt',
			reports: 'id, projectId, type, generatedAt, isDummy',
			tasks: 'id, status, priority, projectId, *tags, createdAt, isDummy',
			links: 'id, sourceId, targetId, sourceType, targetType, relationType',
			chatMessages: 'id, role, timestamp',
			voiceNotes: 'id, projectId, intent, timestamp, isDummy'
		}).upgrade(trans => {
			console.log('Migrating to database version 5: adding voice notes table');
		});
		
		// Version 6 - add blog posts and diagrams tables for storage migration
		this.version(6).stores({
			projects: 'id, name, createdAt, updatedAt, isDummy',
			trees: 'id, projectId, number, species, createdAt, isDummy',
			notes: 'id, projectId, title, *tags, createdAt, isDummy',
			photos: 'id, projectId, treeId, createdAt',
			reports: 'id, projectId, type, generatedAt, isDummy',
			tasks: 'id, status, priority, projectId, *tags, createdAt, isDummy',
			links: 'id, sourceId, targetId, sourceType, targetType, relationType',
			chatMessages: 'id, role, timestamp',
			voiceNotes: 'id, projectId, intent, timestamp, isDummy',
			blogPosts: 'id, projectId, title, *tags, createdAt, updatedAt, isDummy',
			diagrams: 'id, projectId, title, type, createdAt, isDummy'
		}).upgrade(trans => {
			console.log('Migrating to database version 6: adding blog posts and diagrams tables');
		});
		
		// Version 7 - add intent logs table for audit trail
		this.version(7).stores({
			projects: 'id, name, createdAt, updatedAt, isDummy',
			trees: 'id, projectId, number, species, createdAt, isDummy',
			notes: 'id, projectId, title, *tags, createdAt, isDummy',
			photos: 'id, projectId, treeId, createdAt',
			reports: 'id, projectId, type, generatedAt, isDummy',
			tasks: 'id, status, priority, projectId, *tags, createdAt, isDummy',
			links: 'id, sourceId, targetId, sourceType, targetType, relationType',
			chatMessages: 'id, role, timestamp',
			voiceNotes: 'id, projectId, intent, timestamp, isDummy',
			blogPosts: 'id, projectId, title, *tags, createdAt, updatedAt, isDummy',
			diagrams: 'id, projectId, title, type, createdAt, isDummy',
			intentLogs: 'id, timestamp, intent, projectId, mode, success'
		}).upgrade(trans => {
			console.log('Migrating to database version 7: adding intent logs table for audit trail');
		});
		
		// Version 8 - add settings table for unified storage migration (Phase 5)
		this.version(8).stores({
			projects: 'id, name, createdAt, updatedAt, isDummy',
			trees: 'id, projectId, number, species, createdAt, isDummy',
			notes: 'id, projectId, title, *tags, createdAt, isDummy',
			photos: 'id, projectId, treeId, createdAt',
			reports: 'id, projectId, type, generatedAt, isDummy',
			tasks: 'id, status, priority, projectId, *tags, createdAt, isDummy',
			links: 'id, sourceId, targetId, sourceType, targetType, relationType',
			chatMessages: 'id, role, timestamp',
			voiceNotes: 'id, projectId, intent, timestamp, isDummy',
			blogPosts: 'id, projectId, title, *tags, createdAt, updatedAt, isDummy',
			diagrams: 'id, projectId, title, type, createdAt, isDummy',
			intentLogs: 'id, timestamp, intent, projectId, mode, success',
			settings: 'key, value, updatedAt'
		}).upgrade(trans => {
			console.log('Migrating to database version 8: adding settings table for unified storage migration');
		});
	}
}

export const db = new OscarDatabase();

// CRUD Operations
export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
	const now = new Date();
	const id = crypto.randomUUID();
	await db.projects.add({
		...project,
		id,
		createdAt: now,
		updatedAt: now
	});
	return id;
}

export async function getProjects(): Promise<Project[]> {
	return db.projects.orderBy('updatedAt').reverse().toArray();
}

export async function getProject(id: string): Promise<Project | undefined> {
	return db.projects.get(id);
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
	await db.projects.update(id, { ...updates, updatedAt: new Date() });
}

export async function deleteProject(id: string): Promise<void> {
	await db.transaction('rw', [db.projects, db.trees, db.notes, db.photos, db.reports], async () => {
		await db.projects.delete(id);
		await db.trees.where('projectId').equals(id).delete();
		await db.notes.where('projectId').equals(id).delete();
		await db.photos.where('projectId').equals(id).delete();
		await db.reports.where('projectId').equals(id).delete();
	});
}

export async function createTree(tree: Omit<Tree, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
	const now = new Date();
	const id = crypto.randomUUID();
	await db.trees.add({
		...tree,
		id,
		createdAt: now,
		updatedAt: now
	});
	return id;
}

export async function getTrees(projectId: string): Promise<Tree[]> {
	return db.trees.where('projectId').equals(projectId).toArray();
}

export async function updateTree(id: string, updates: Partial<Tree>): Promise<void> {
	await db.trees.update(id, { ...updates, updatedAt: new Date() });
}

export async function deleteTree(id: string): Promise<void> {
	await db.trees.delete(id);
}

export async function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
	const now = new Date();
	const id = crypto.randomUUID();
	await db.notes.add({
		...note,
		id,
		createdAt: now,
		updatedAt: now
	});
	return id;
}

export async function getNotes(projectId: string): Promise<Note[]> {
	return db.notes.where('projectId').equals(projectId).toArray();
}

export async function getAllNotes(): Promise<Note[]> {
	// Sort by createdAt (indexed) instead of updatedAt (not indexed)
	return db.notes.orderBy('createdAt').reverse().toArray();
}

export async function getNotesByTag(tag: string): Promise<Note[]> {
	return db.notes.where('tags').equals(tag).toArray();
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<void> {
	await db.notes.update(id, { ...updates, updatedAt: new Date() });
}

export async function deleteNote(id: string): Promise<void> {
	await db.notes.delete(id);
}

export async function savePhoto(photo: Omit<Photo, 'id' | 'createdAt'>): Promise<string> {
	const now = new Date();
	const id = crypto.randomUUID();
	await db.photos.add({
		...photo,
		id,
		createdAt: now
	});
	return id;
}

export async function getPhotos(projectId: string): Promise<Photo[]> {
	return db.photos.where('projectId').equals(projectId).toArray();
}

export async function deletePhoto(id: string): Promise<void> {
	await db.photos.delete(id);
}

export async function saveReport(report: Omit<Report, 'id' | 'generatedAt'>): Promise<string> {
	const now = new Date();
	const id = crypto.randomUUID();
	await db.reports.add({
		...report,
		id,
		generatedAt: now
	});
	return id;
}

export async function getReports(projectId: string): Promise<Report[]> {
	return db.reports.where('projectId').equals(projectId).toArray();
}

export async function deleteReport(id: string): Promise<void> {
	await db.reports.delete(id);
}

// Task CRUD Operations
export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
	const now = new Date();
	const id = crypto.randomUUID();
	await db.tasks.add({
		...task,
		id,
		createdAt: now,
		updatedAt: now
	});
	return id;
}

export async function getAllTasks(): Promise<Task[]> {
	return db.tasks.orderBy('createdAt').reverse().toArray();
}

export async function getTasksByStatus(status: Task['status']): Promise<Task[]> {
	return db.tasks.where('status').equals(status).toArray();
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
	return db.tasks.where('projectId').equals(projectId).toArray();
}

export async function getTask(id: string): Promise<Task | undefined> {
	return db.tasks.get(id);
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
	await db.tasks.update(id, { ...updates, updatedAt: new Date() });
}

export async function deleteTask(id: string): Promise<void> {
	await db.tasks.delete(id);
	// Also delete related links
	await db.links.where('sourceId').equals(id).delete();
	await db.links.where('targetId').equals(id).delete();
}

// Link CRUD Operations
export async function createLink(link: Omit<ObjectLink, 'id' | 'createdAt'>): Promise<string> {
	const now = new Date();
	const id = crypto.randomUUID();
	await db.links.add({
		...link,
		id,
		createdAt: now
	});
	return id;
}

export async function getLinksForObject(id: string): Promise<ObjectLink[]> {
	const sourceLinks = await db.links.where('sourceId').equals(id).toArray();
	const targetLinks = await db.links.where('targetId').equals(id).toArray();
	return [...sourceLinks, ...targetLinks];
}

export async function getLinkedNotesForTask(taskId: string): Promise<Note[]> {
	const links = await db.links.where('sourceId').equals(taskId).toArray();
	const noteLinks = links.filter(l => l.targetType === 'note');
	const notes: Note[] = [];
	for (const link of noteLinks) {
		const note = await db.notes.get(link.targetId);
		if (note) notes.push(note);
	}
	return notes;
}

export async function deleteLink(id: string): Promise<void> {
	await db.links.delete(id);
}


// Chat Message CRUD Operations
export async function saveChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> {
	const now = new Date();
	const id = crypto.randomUUID();
	await db.chatMessages.add({
		...message,
		id,
		timestamp: now
	});
	return id;
}

export async function getChatHistory(limit: number = 100): Promise<ChatMessage[]> {
	return db.chatMessages.orderBy('timestamp').reverse().limit(limit).toArray();
}

export async function clearChatHistory(): Promise<void> {
	await db.chatMessages.clear();
}

export async function deleteChatMessage(id: string): Promise<void> {
	await db.chatMessages.delete(id);
}


// Dummy Data CRUD Operations
export async function getAllDummyProjects(): Promise<Project[]> {
	return db.projects.where('isDummy').equals(1).toArray();
}

export async function getAllDummyTasks(): Promise<Task[]> {
	return db.tasks.where('isDummy').equals(1).toArray();
}

export async function getAllDummyNotes(): Promise<Note[]> {
	return db.notes.where('isDummy').equals(1).toArray();
}

export async function getAllDummyTrees(): Promise<Tree[]> {
	return db.trees.where('isDummy').equals(1).toArray();
}

export async function getAllDummyReports(): Promise<Report[]> {
	return db.reports.where('isDummy').equals(1).toArray();
}

export async function deleteAllDummyData(): Promise<void> {
	await db.transaction('rw', [db.projects, db.trees, db.notes, db.reports, db.tasks, db.voiceNotes, db.blogPosts, db.diagrams, db.intentLogs], async () => {
		console.log('deleteAllDummyData: Starting deletion of all dummy data');
		
		// Delete all dummy items in correct order to avoid foreign key constraints
		// First delete trees, reports, voice notes, blogs, diagrams, and intent logs (depend on projects)
		await db.trees.where('isDummy').equals(1).delete();
		await db.reports.where('isDummy').equals(1).delete();
		await db.voiceNotes.where('isDummy').equals(1).delete();
		await db.blogPosts.where('isDummy').equals(1).delete();
		await db.diagrams.where('isDummy').equals(1).delete();
		await db.intentLogs.where('projectId').anyOf(await db.projects.where('isDummy').equals(1).primaryKeys()).delete();
		
		// Then delete tasks and notes (may have project references)
		await db.tasks.where('isDummy').equals(1).delete();
		await db.notes.where('isDummy').equals(1).delete();
		
		// Finally delete projects
		const dummyProjects = await db.projects.where('isDummy').equals(1).toArray();
		console.log('deleteAllDummyData: Found', dummyProjects.length, 'dummy projects to delete');
		for (const project of dummyProjects) {
			if (project.id) {
				// Use deleteProject which handles related items
				await deleteProject(project.id);
				console.log('deleteAllDummyData: Deleted project', project.id, project.name);
			}
		}
		
		console.log('deleteAllDummyData: Completed deletion of all dummy data');
	});
}

export async function countDummyItems(): Promise<{
	projects: number;
	tasks: number;
	notes: number;
	trees: number;
	reports: number;
	voiceNotes: number;
	blogPosts: number;
	diagrams: number;
	intentLogs: number;
}> {
	const [projects, tasks, notes, trees, reports, voiceNotes, blogPosts, diagrams, intentLogs] = await Promise.all([
		db.projects.where('isDummy').equals(1).count(),
		db.tasks.where('isDummy').equals(1).count(),
		db.notes.where('isDummy').equals(1).count(),
		db.trees.where('isDummy').equals(1).count(),
		db.reports.where('isDummy').equals(1).count(),
		db.voiceNotes.where('isDummy').equals(1).count(),
		db.blogPosts.where('isDummy').equals(1).count(),
		db.diagrams.where('isDummy').equals(1).count(),
		db.intentLogs.where('projectId').anyOf(await db.projects.where('isDummy').equals(1).primaryKeys()).count()
	]);
	return { projects, tasks, notes, trees, reports, voiceNotes, blogPosts, diagrams, intentLogs };
}

// Voice Note CRUD Operations
export async function saveVoiceNote(voiceNote: Omit<VoiceNote, 'id' | 'timestamp'>): Promise<string> {
	const now = new Date();
	const id = crypto.randomUUID();
	await db.voiceNotes.add({
		...voiceNote,
		id,
		timestamp: now
	});
	return id;
}

export async function getVoiceNotes(projectId: string | null): Promise<VoiceNote[]> {
	if (projectId) {
		return db.voiceNotes.where('projectId').equals(projectId).reverse().sortBy('timestamp');
	}
	return db.voiceNotes.orderBy('timestamp').reverse().toArray();
}

export async function getVoiceNote(id: string): Promise<VoiceNote | undefined> {
	return db.voiceNotes.get(id);
}

export async function updateVoiceNote(id: string, updates: Partial<VoiceNote>): Promise<void> {
	await db.voiceNotes.update(id, updates);
}

export async function deleteVoiceNote(id: string): Promise<void> {
	await db.voiceNotes.delete(id);
}

export async function getAllDummyVoiceNotes(): Promise<VoiceNote[]> {
	return db.voiceNotes.where('isDummy').equals(1).toArray();
}

export async function deleteAllDummyVoiceNotes(): Promise<void> {
	await db.voiceNotes.where('isDummy').equals(1).delete();
}

// Blog Post CRUD Operations
export async function createBlogPost(blogPost: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
	const now = new Date();
	const id = crypto.randomUUID();
	await db.blogPosts.add({
		...blogPost,
		id,
		createdAt: now,
		updatedAt: now
	});
	return id;
}

export async function getBlogPosts(projectId: string): Promise<BlogPost[]> {
	const posts = await db.blogPosts.where('projectId').equals(projectId).toArray();
	return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
	return db.blogPosts.orderBy('createdAt').reverse().toArray();
}

export async function getBlogPost(id: string): Promise<BlogPost | undefined> {
	return db.blogPosts.get(id);
}

export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<void> {
	await db.blogPosts.update(id, { ...updates, updatedAt: new Date() });
}

export async function deleteBlogPost(id: string): Promise<void> {
	await db.blogPosts.delete(id);
}

// Diagram CRUD Operations
export async function createDiagram(diagram: Omit<Diagram, 'id' | 'createdAt'>): Promise<string> {
	const now = new Date();
	const id = crypto.randomUUID();
	await db.diagrams.add({
		...diagram,
		id,
		createdAt: now
	});
	return id;
}

export async function getDiagrams(projectId: string): Promise<Diagram[]> {
	const diagrams = await db.diagrams.where('projectId').equals(projectId).toArray();
	return diagrams.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getAllDiagrams(): Promise<Diagram[]> {
	return db.diagrams.orderBy('createdAt').reverse().toArray();
}

export async function getDiagram(id: string): Promise<Diagram | undefined> {
	return db.diagrams.get(id);
}

export async function updateDiagram(id: string, updates: Partial<Diagram>): Promise<void> {
	await db.diagrams.update(id, updates);
}

export async function deleteDiagram(id: string): Promise<void> {
	await db.diagrams.delete(id);
}

// Dummy data operations for blogs and diagrams
export async function getAllDummyBlogPosts(): Promise<BlogPost[]> {
	return db.blogPosts.where('isDummy').equals(1).toArray();
}

export async function getAllDummyDiagrams(): Promise<Diagram[]> {
	return db.diagrams.where('isDummy').equals(1).toArray();
}

export async function deleteAllDummyBlogPosts(): Promise<void> {
	await db.blogPosts.where('isDummy').equals(1).delete();
}

export async function deleteAllDummyDiagrams(): Promise<void> {
	await db.diagrams.where('isDummy').equals(1).delete();
}

// Intent Log CRUD Operations
export async function logIntent(intentLog: Omit<IntentLog, 'id' | 'timestamp'>): Promise<string> {
	const now = new Date();
	const id = crypto.randomUUID();
	await db.intentLogs.add({
		...intentLog,
		id,
		timestamp: now
	});
	return id;
}

export async function getIntentLogs(limit: number = 100): Promise<IntentLog[]> {
	return db.intentLogs.orderBy('timestamp').reverse().limit(limit).toArray();
}

export async function getIntentLogsByIntent(intent: string, limit: number = 50): Promise<IntentLog[]> {
	return db.intentLogs
		.where('intent')
		.equals(intent)
		.reverse()
		.sortBy('timestamp')
		.then(logs => logs.slice(0, limit));
}

export async function getIntentLogsByProject(projectId: string, limit: number = 50): Promise<IntentLog[]> {
	return db.intentLogs
		.where('projectId')
		.equals(projectId)
		.reverse()
		.sortBy('timestamp')
		.then(logs => logs.slice(0, limit));
}

export async function getIntentLogsByMode(mode: 'general' | 'project' | 'global', limit: number = 50): Promise<IntentLog[]> {
	return db.intentLogs
		.where('mode')
		.equals(mode)
		.reverse()
		.sortBy('timestamp')
		.then(logs => logs.slice(0, limit));
}

export async function getFailedIntentLogs(limit: number = 50): Promise<IntentLog[]> {
	return db.intentLogs
		.where('success')
		.equals(0)
		.reverse()
		.sortBy('timestamp')
		.then(logs => logs.slice(0, limit));
}

export async function getIntentLog(id: string): Promise<IntentLog | undefined> {
	return db.intentLogs.get(id);
}

export async function deleteIntentLog(id: string): Promise<void> {
	await db.intentLogs.delete(id);
}

export async function clearIntentLogs(): Promise<void> {
	await db.intentLogs.clear();
}

export async function getIntentStats(): Promise<{
	total: number;
	byIntent: Record<string, number>;
	byMode: Record<string, number>;
	successRate: number;
	confirmationRate: number;
}> {
	const allLogs = await db.intentLogs.toArray();
	
	const byIntent: Record<string, number> = {};
	const byMode: Record<string, number> = {};
	let successful = 0;
	let requiredConfirmation = 0;
	let userConfirmed = 0;
	
	for (const log of allLogs) {
		// Count by intent
		byIntent[log.intent] = (byIntent[log.intent] || 0) + 1;
		
		// Count by mode
		byMode[log.mode] = (byMode[log.mode] || 0) + 1;
		
		// Count successful
		if (log.success) successful++;
		
		// Count confirmation stats
		if (log.requiresConfirmation) requiredConfirmation++;
		if (log.userConfirmed) userConfirmed++;
	}
	
	const total = allLogs.length;
	const successRate = total > 0 ? (successful / total) * 100 : 0;
	const confirmationRate = requiredConfirmation > 0 ? (userConfirmed / requiredConfirmation) * 100 : 0;
	
	return {
		total,
		byIntent,
		byMode,
		successRate,
		confirmationRate
	};
}

// Settings CRUD Operations for unified storage migration (Phase 5)
export async function getSetting(key: string): Promise<any | undefined> {
	const setting = await db.settings.get(key);
	return setting?.value;
}

export async function setSetting(key: string, value: any): Promise<void> {
	const now = new Date();
	await db.settings.put({
		key,
		value,
		updatedAt: now
	});
}

export async function deleteSetting(key: string): Promise<void> {
	await db.settings.delete(key);
}

export async function getAllSettings(): Promise<Setting[]> {
	return db.settings.toArray();
}

export async function clearAllSettings(): Promise<void> {
	await db.settings.clear();
}

export async function migrateLocalStorageToIndexedDB(): Promise<void> {
	console.log('Starting localStorage to IndexedDB migration...');
	
	// List of localStorage keys to migrate
	const keysToMigrate = [
		'oscar_current_project_id',
		'groq_api_key',
		'groq_model',
		'openai_api_key',
		'openai_model',
		'voice_enabled',
		'voice_auto_transcribe',
		'voice_language',
		'ui_theme',
		'ui_compact_mode',
		'ui_sidebar_collapsed',
		'notes_view_mode',
		'projects_view_mode',
		'reports_view_mode',
		'chat_context_mode',
		'chat_history_enabled',
		'chat_auto_scroll',
		'notifications_enabled',
		'notifications_sound',
		'export_format',
		'backup_frequency',
		'last_backup_time',
		'last_sync_time',
		'user_preferences'
	];
	
	let migratedCount = 0;
	
	for (const key of keysToMigrate) {
		try {
			const value = localStorage.getItem(key);
			if (value !== null) {
				// Parse JSON if possible, otherwise store as string
				let parsedValue: any;
				try {
					parsedValue = JSON.parse(value);
				} catch {
					parsedValue = value;
				}
				
				await setSetting(key, parsedValue);
				migratedCount++;
				console.log(`Migrated setting: ${key}`);
			}
		} catch (error) {
			console.warn(`Failed to migrate setting ${key}:`, error);
		}
	}
	
	console.log(`Migration complete. Migrated ${migratedCount} settings from localStorage to IndexedDB.`);
}

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
	sourceType: 'task' | 'note' | 'project' | 'tree' | 'report' | 'blog';
	targetId: string;
	targetType: 'task' | 'note' | 'project' | 'tree' | 'report' | 'blog';
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

export class OscarDatabase extends Dexie {
	projects!: Table<Project, string>;
	trees!: Table<Tree, string>;
	notes!: Table<Note, string>;
	photos!: Table<Photo, string>;
	reports!: Table<Report, string>;
	tasks!: Table<Task, string>;
	links!: Table<ObjectLink, string>;
	chatMessages!: Table<ChatMessage, string>;

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
	await db.transaction('rw', [db.projects, db.trees, db.notes, db.reports, db.tasks], async () => {
		console.log('deleteAllDummyData: Starting deletion of all dummy data');
		
		// Delete all dummy items in correct order to avoid foreign key constraints
		// First delete trees and reports (depend on projects)
		await db.trees.where('isDummy').equals(1).delete();
		await db.reports.where('isDummy').equals(1).delete();
		
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

export async function countDummyItems(): Promise<{ projects: number; tasks: number; notes: number; trees: number; reports: number }> {
	const [projects, tasks, notes, trees, reports] = await Promise.all([
		db.projects.where('isDummy').equals(1).count(),
		db.tasks.where('isDummy').equals(1).count(),
		db.notes.where('isDummy').equals(1).count(),
		db.trees.where('isDummy').equals(1).count(),
		db.reports.where('isDummy').equals(1).count()
	]);
	return { projects, tasks, notes, trees, reports };
}

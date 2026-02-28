import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// User type
export interface User {
	id: string;
	email: string;
	name: string;
	picture?: string;
}

// Drive connection status
export const driveConnected = writable<boolean>(false);
export const driveError = writable<string | null>(null);

// Document file type for Drive integration
export interface DocFile {
	id: string;
	name: string;
	mimeType: string;
	modifiedTime: string;
	createdTime: string;
	parentId?: string;
	content?: string;
}

// Folder structure for file system
export interface DriveFolder {
	id: string;
	name: string;
	type: 'notes' | 'reports' | 'drafts' | 'logs' | 'summaries' | 'pdfs' | 'projects';
	files: DocFile[];
	children: DriveFolder[];
	expanded: boolean;
}

// Active document state
export interface ActiveDocument {
	id: string;
	name: string;
	content: string;
	folderType: 'notes' | 'reports' | 'drafts' | 'logs' | 'summaries' | 'pdfs' | 'projects';
	isDirty: boolean;
	isNew: boolean;
	lastSaved?: string;
}

// Component types for the new system
export type ComponentType = 'text' | 'map' | 'diagram' | 'photo' | 'table' | 'aerial' | 'tree-data' | 'constraints';

// Component orientation
export type ComponentOrientation = 'portrait' | 'landscape';

// Individual component
export interface ProjectComponent {
	id: string;
	type: ComponentType;
	order: number;
	content: string;
	src?: string;
	meta: {
		orientation: ComponentOrientation;
		lat?: number;
		lng?: number;
		zoom?: number;
		width?: number;
		height?: number;
		tags?: string[];
		gps?: {
			latitude: number;
			longitude: number;
		};
		timestamp?: string;
		projectId?: string;
		caption?: string;
	};
}

// Project structure with components
export interface ProjectData {
	projectId: string;
	projectName: string;
	version: number;
	createdAt: string;
	modifiedAt: string;
	components: ProjectComponent[];
}

// Full Project with Drive folders
export interface FullProject {
	id: string;
	name: string;
	folderId: string;
	createdTime: string;
	modifiedTime: string;
	components: ProjectComponent[];
	markdown: string;
	folders: {
		markdown: string;
		photos: string;
		maps: string;
		diagrams: string;
		tables: string;
		pdfs: string;
	};
}

// UI Mode for responsive layout
export type UIMode = 'chat-focused' | 'doc-focused' | 'split-view';

// View mode for document editing
export type ViewMode = 'edit' | 'preview' | 'split';

// Search result type
export interface SearchResult {
	id: string;
	name: string;
	snippet: string;
	folder: string;
	modifiedTime: string;
	mimeType: string;
}

// Project type
export interface Project {
	id: string;
	name: string;
	createdTime: string;
	modifiedTime: string;
	description?: string;
}

// Tree type for surveys
export interface Tree {
	id: string;
	number: string;
	species: string;
	scientificName?: string;
	DBH: number;
	height?: number;
	age?: string;
	category?: 'A' | 'B' | 'C' | 'U';
	condition?: string;
	notes?: string;
	RPA?: number;
	location?: {
		latitude?: number;
		longitude?: number;
	};
	photos?: string[];
}

// Notebook entry type
export interface NotebookEntry {
	id: string;
	timestamp: string;
	content: string;
	projectId: string;
	type: 'voice' | 'text' | 'photo';
	metadata?: any;
}

// Report type
export interface Report {
	id: string;
	type: 'BS5837' | 'AIA' | 'AMS' | 'TREE_CONDITION' | 'PLANNING_SUPPORT' | 'LEGAL_SUPPORT';
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	projectId: string;
}

// Stores
export const user = writable<User | null>(null);
export const projects = writable<Project[]>([]);
export const currentProject = writable<FullProject | null>(null);
export const trees = writable<Tree[]>([]);
export const notebookEntries = writable<NotebookEntry[]>([]);
export const reports = writable<Report[]>([]);
export const isLoading = writable<boolean>(false);
export const error = writable<string | null>(null);

// Document Management Stores
export const fileSystem = writable<DriveFolder[]>([]);
export const activeDocument = writable<ActiveDocument | null>(null);
export const searchResults = writable<SearchResult[]>([]);
export const isSearching = writable<boolean>(false);

// Component System Stores
export const projectComponents = writable<ProjectComponent[]>([]);
export const selectedComponent = writable<ProjectComponent | null>(null);
export const isPreviewMode = writable<boolean>(false);
export const isGeneratingPdf = writable<boolean>(false);
export const showComponentDrawer = writable<boolean>(false);

// UI State
export const sidebarOpen = writable<boolean>(browser ? window.innerWidth >= 1024 : true);
export const recording = writable<boolean>(false);
export const currentView = writable<'dashboard' | 'notebook' | 'report' | 'settings' | 'oscar' | 'document' | 'project'>('dashboard');
export const uiMode = writable<UIMode>('split-view');
export const viewMode = writable<ViewMode>('split');
export const chatCollapsed = writable<boolean>(false);
export const mobileView = writable<'chat' | 'document' | 'components'>('chat');

// Derived stores
export const isAuthenticated = derived(user, $user => $user !== null);
export const sortedNotebookEntries = derived(
	notebookEntries,
	$entries => [...$entries].sort((a, b) => 
		new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
	)
);

// Helper functions
export function addTree(tree: Tree) {
	trees.update(t => [...t, tree]);
}

export function updateTree(id: string, updates: Partial<Tree>) {
	trees.update(t => t.map(tree => 
		tree.id === id ? { ...tree, ...updates } : tree
	));
}

export function removeTree(id: string) {
	trees.update(t => t.filter(tree => tree.id !== id));
}

export function addNotebookEntry(entry: NotebookEntry) {
	notebookEntries.update(e => [...e, entry]);
}

export function addReport(report: Report) {
	reports.update(r => [...r, report]);
}

export function clearError() {
	error.set(null);
}

export function setLoading(loading: boolean) {
	isLoading.set(loading);
}

export function setActiveDocument(doc: ActiveDocument | null) {
	activeDocument.set(doc);
}

export function updateDocumentContent(content: string) {
	activeDocument.update(doc => {
		if (doc) {
			return { ...doc, content, isDirty: true };
		}
		return doc;
	});
}

export function markDocumentSaved() {
	activeDocument.update(doc => {
		if (doc) {
			return { ...doc, isDirty: false, lastSaved: new Date().toISOString() };
		}
		return doc;
	});
}

// Component helpers
export function addComponent(component: ProjectComponent) {
	projectComponents.update(components => [...components, component]);
}

export function updateComponent(id: string, updates: Partial<ProjectComponent>) {
	projectComponents.update(components => 
		components.map(c => c.id === id ? { ...c, ...updates } : c)
	);
}

export function removeComponent(id: string) {
	projectComponents.update(components => components.filter(c => c.id !== id));
}

export function reorderComponents(fromIndex: number, toIndex: number) {
	projectComponents.update(components => {
		const result = [...components];
		const [removed] = result.splice(fromIndex, 1);
		result.splice(toIndex, 0, removed);
		// Update order property
		return result.map((c, i) => ({ ...c, order: i }));
	});
}

export function setComponents(components: ProjectComponent[]) {
	projectComponents.set(components);
}

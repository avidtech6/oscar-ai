import Dexie, { type Table } from 'dexie';
import { browser } from '$app/environment';
import type {
  LayoutConfiguration,
  DeviceRule,
  DomainDefinition,
  ComponentPrimitive,
  InteractionRule,
  CrossDomainConsistencyRule,
  AskOscarBarConfiguration,
  SheetTooltipLayeringRule
} from '$lib/models/GlobalSystemRules';
import type {
  NavigationItem,
  NavigationState,
  RecentItem,
  BottomBarItem,
  DomainScrollPosition,
  NavigationPreference,
  NavigationEvent
} from '$lib/models/Navigation';
import type {
  AskOscarMessage,
  AskOscarConversation,
  AskOscarTooltip,
  AskOscarSheet,
  AskOscarAction,
  AskOscarContext,
  AskOscarDeviceBehaviour
} from '$lib/models/AskOscar';

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
	notes: string;
	photos: string[];
	RPA: number;
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
	attachments?: string[]; // Array of image URLs
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
	
	// Module 1: Global System Rules tables
	layoutConfigurations!: Table<LayoutConfiguration, string>;
	deviceRules!: Table<DeviceRule, string>;
	domainDefinitions!: Table<DomainDefinition, string>;
	componentPrimitives!: Table<ComponentPrimitive, string>;
	interactionRules!: Table<InteractionRule, string>;
	crossDomainConsistencyRules!: Table<CrossDomainConsistencyRule, string>;
	askOscarBarConfigurations!: Table<AskOscarBarConfiguration, string>;
	sheetTooltipLayeringRules!: Table<SheetTooltipLayeringRule, string>;
	
	// Module 2: Navigation tables
	navigationItems!: Table<NavigationItem, string>;
	navigationStates!: Table<NavigationState, string>;
	recentItems!: Table<RecentItem, string>;
	bottomBarItems!: Table<BottomBarItem, string>;
	domainScrollPositions!: Table<DomainScrollPosition, string>;
	navigationPreferences!: Table<NavigationPreference, string>;
	navigationEvents!: Table<NavigationEvent, string>;
	
	// Module 3: Ask Oscar tables
	askOscarMessages!: Table<AskOscarMessage, string>;
	askOscarConversations!: Table<AskOscarConversation, string>;
	askOscarTooltips!: Table<AskOscarTooltip, string>;
	askOscarSheets!: Table<AskOscarSheet, string>;
	askOscarActions!: Table<AskOscarAction, string>;
	askOscarContexts!: Table<AskOscarContext, string>;
	askOscarDeviceBehaviours!: Table<AskOscarDeviceBehaviour, string>;

	constructor() {
		// Only initialize in browser environment
		if (!browser) {
			// Return a minimal instance for SSR
			super('OscarAI_SSR');
			return;
		}
		
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
		
		// Version 9 - add Module 1: Global System Rules tables
		this.version(9).stores({
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
			settings: 'key, value, updatedAt',
			// Module 1 tables
			layoutConfigurations: 'id, name, createdAt, updatedAt',
			deviceRules: 'id, deviceType, orientation, minWidth, maxWidth, layoutConfigurationId, priority, createdAt',
			domainDefinitions: 'id, name, displayName, route, order, enabled, createdAt',
			componentPrimitives: 'id, name, type, createdAt',
			interactionRules: 'id, interactionType, appliesTo, deviceTypes, createdAt',
			crossDomainConsistencyRules: 'id, name, appliesToDomains, appliesToComponents, property, createdAt',
			askOscarBarConfigurations: 'id, name, createdAt',
			sheetTooltipLayeringRules: 'id, name, createdAt'
		}).upgrade(trans => {
			console.log('Migrating to database version 9: adding Module 1 Global System Rules tables');
		});
		
		// Version 10 - add Module 2: Navigation tables
		this.version(10).stores({
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
			settings: 'key, value, updatedAt',
			// Module 1 tables
			layoutConfigurations: 'id, name, createdAt, updatedAt',
			deviceRules: 'id, deviceType, orientation, minWidth, maxWidth, layoutConfigurationId, priority, createdAt',
			domainDefinitions: 'id, name, displayName, route, order, enabled, createdAt',
			componentPrimitives: 'id, name, type, createdAt',
			interactionRules: 'id, interactionType, appliesTo, deviceTypes, createdAt',
			crossDomainConsistencyRules: 'id, name, appliesToDomains, appliesToComponents, property, createdAt',
			askOscarBarConfigurations: 'id, name, createdAt',
			sheetTooltipLayeringRules: 'id, name, createdAt',
			// Module 2 tables
			navigationItems: 'id, domain, order, isVisible, createdAt',
			navigationStates: 'id, userId, domain, state, createdAt',
			recentItems: 'id, userId, itemId, itemType, domain, accessedAt, createdAt',
			bottomBarItems: 'id, domain, order, isVisible, createdAt',
			domainScrollPositions: 'id, userId, domain, scrollPosition, createdAt',
			navigationPreferences: 'id, userId, preferenceType, value, createdAt',
			navigationEvents: 'id, userId, eventType, domain, data, timestamp, createdAt'
		}).upgrade(trans => {
			console.log('Migrating to database version 10: adding Module 2 Navigation tables');
		});
		
		// Version 11 - add Module 3: Ask Oscar tables
		this.version(11).stores({
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
			settings: 'key, value, updatedAt',
			// Module 1 tables
			layoutConfigurations: 'id, name, createdAt, updatedAt',
			deviceRules: 'id, deviceType, orientation, minWidth, maxWidth, layoutConfigurationId, priority, createdAt',
			domainDefinitions: 'id, name, displayName, route, order, enabled, createdAt',
			componentPrimitives: 'id, name, type, createdAt',
			interactionRules: 'id, interactionType, appliesTo, deviceTypes, createdAt',
			crossDomainConsistencyRules: 'id, name, appliesToDomains, appliesToComponents, property, createdAt',
			askOscarBarConfigurations: 'id, name, createdAt',
			sheetTooltipLayeringRules: 'id, name, createdAt',
			// Module 2 tables
			navigationItems: 'id, domain, order, isVisible, createdAt',
			navigationStates: 'id, userId, domain, state, createdAt',
			recentItems: 'id, userId, itemId, itemType, domain, accessedAt, createdAt',
			bottomBarItems: 'id, domain, order, isVisible, createdAt',
			domainScrollPositions: 'id, userId, domain, scrollPosition, createdAt',
			navigationPreferences: 'id, userId, preferenceType, value, createdAt',
			navigationEvents: 'id, userId, eventType, domain, data, timestamp, createdAt',
			// Module 3 tables
			askOscarMessages: 'id, conversationId, userId, role, content, timestamp, createdAt',
			askOscarConversations: 'id, userId, title, lastMessageAt, createdAt, updatedAt',
			askOscarTooltips: 'id, elementId, content, position, isVisible, createdAt',
			askOscarSheets: 'id, title, content, position, size, isVisible, createdAt',
			askOscarActions: 'id, name, type, icon, handler, createdAt',
			askOscarContexts: 'id, name, type, data, createdAt',
			askOscarDeviceBehaviours: 'id, deviceType, orientation, behaviourType, configuration, createdAt'
		}).upgrade(trans => {
			console.log('Migrating to database version 11: adding Module 3 Ask Oscar tables');
		});
		
		// Version 12 - add Module 4: Sheet System tables
		this.version(12).stores({
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
			settings: 'key, value, updatedAt',
			// Module 1 tables
			layoutConfigurations: 'id, name, createdAt, updatedAt',
			deviceRules: 'id, deviceType, orientation, minWidth, maxWidth, layoutConfigurationId, priority, createdAt',
			domainDefinitions: 'id, name, displayName, route, order, enabled, createdAt',
			componentPrimitives: 'id, name, type, createdAt',
			interactionRules: 'id, interactionType, appliesTo, deviceTypes, createdAt',
			crossDomainConsistencyRules: 'id, name, appliesToDomains, appliesToComponents, property, createdAt',
			askOscarBarConfigurations: 'id, name, createdAt',
			sheetTooltipLayeringRules: 'id, name, createdAt',
			// Module 2 tables
			navigationItems: 'id, domain, order, isVisible, createdAt',
			navigationStates: 'id, userId, domain, state, createdAt',
			recentItems: 'id, userId, itemId, itemType, domain, accessedAt, createdAt',
			bottomBarItems: 'id, domain, order, isVisible, createdAt',
			domainScrollPositions: 'id, userId, domain, scrollPosition, createdAt',
			navigationPreferences: 'id, userId, preferenceType, value, createdAt',
			navigationEvents: 'id, userId, eventType, domain, data, timestamp, createdAt',
			// Module 3 tables
			askOscarMessages: 'id, conversationId, userId, role, content, timestamp, createdAt',
			askOscarConversations: 'id, userId, title, lastMessageAt, createdAt, updatedAt',
			askOscarTooltips: 'id, elementId, content, position, isVisible, createdAt',
			askOscarSheets: 'id, title, content, position, size, isVisible, createdAt',
			askOscarActions: 'id, name, type, icon, handler, createdAt',
			askOscarContexts: 'id, name, type, data, createdAt',
			askOscarDeviceBehaviours: 'id, deviceType, orientation, behaviourType, configuration, createdAt',
			// Module 4 tables (to be added based on SheetSystem.ts model)
			// Note: We need to import SheetSystem types first
		}).upgrade(trans => {
			console.log('Migrating to database version 12: adding Module 4 Sheet System tables');
		});
	}
	
	// Add CRUD operations for all tables here
	// (Implementation would go here)
}

// Export a singleton instance
export const db = new OscarDatabase();

// ============================================================================
// CRUD Operations (minimal implementations to prevent import errors)
// ============================================================================

// Project operations
export async function createProject(data: any): Promise<any> {
  console.warn('createProject: Not implemented in db module, using fallback');
  return { id: 'dummy-id', ...data };
}

export async function saveReport(data: any): Promise<any> {
  console.warn('saveReport: Not implemented in db module, using fallback');
  return { id: 'dummy-report-id', ...data };
}

// Task operations
export async function createTask(data: any): Promise<any> {
  console.warn('createTask: Not implemented in db module, using fallback');
  return { id: 'dummy-task-id', ...data };
}

// Note operations
export async function createNote(data: any): Promise<any> {
  console.warn('createNote: Not implemented in db module, using fallback');
  return { id: 'dummy-note-id', ...data };
}

export async function getAllNotes(): Promise<Note[]> {
  console.warn('getAllNotes: Not implemented in db module, using fallback');
  return [];
}

export async function getNotesByTag(tag: string): Promise<Note[]> {
  console.warn('getNotesByTag: Not implemented in db module, using fallback');
  return [];
}

// Tree operations
export async function createTree(data: any): Promise<any> {
  console.warn('createTree: Not implemented in db module, using fallback');
  return { id: 'dummy-tree-id', ...data };
}

// Link operations
export async function createLink(data: any): Promise<any> {
  console.warn('createLink: Not implemented in db module, using fallback');
  return { id: 'dummy-link-id', ...data };
}

// Chat operations
export async function saveChatMessage(data: any): Promise<any> {
  console.warn('saveChatMessage: Not implemented in db module, using fallback');
  return { id: 'dummy-chat-id', ...data };
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  console.warn('getChatHistory: Not implemented in db module, using fallback');
  return [];
}

export async function clearChatHistory(): Promise<void> {
  console.warn('clearChatHistory: Not implemented in db module');
}

// Dummy data operations
export async function deleteAllDummyData(): Promise<void> {
  console.warn('deleteAllDummyData: Not implemented in db module');
}

export async function countDummyItems(): Promise<number> {
  console.warn('countDummyItems: Not implemented in db module');
  return 0;
}

// Voice notes operations
export async function getVoiceNotes(projectId: string): Promise<VoiceNote[]> {
  console.warn('getVoiceNotes: Not implemented in db module, using fallback');
  return [];
}

// Task operations
export async function getTasksByProject(projectId: string): Promise<Task[]> {
  console.warn('getTasksByProject: Not implemented in db module, using fallback');
  return [];
}

// Report operations
export async function getReports(projectId?: string): Promise<Report[]> {
  console.warn('getReports: Not implemented in db module, using fallback');
  return [];
}

// Settings operations
export async function getSetting(key: string): Promise<any> {
  console.warn('getSetting: Not implemented in db module, using localStorage fallback');
  try {
    const value = localStorage.getItem(`oscar.setting.${key}`);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
}

export async function setSetting(key: string, value: any): Promise<void> {
  console.warn('setSetting: Not implemented in db module, using localStorage fallback');
  try {
    localStorage.setItem(`oscar.setting.${key}`, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving setting to localStorage:', error);
  }
}

export async function deleteSetting(key: string): Promise<void> {
  console.warn('deleteSetting: Not implemented in db module');
  try {
    localStorage.removeItem(`oscar.setting.${key}`);
  } catch (error) {
    console.error('Error deleting setting from localStorage:', error);
  }
}

export async function migrateLocalStorageToIndexedDB(): Promise<void> {
  console.warn('migrateLocalStorageToIndexedDB: Not implemented in db module');
}

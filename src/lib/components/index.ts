// Components index for Oscar AI V2
// Export all UI components for easy import

// Layout components
export { default as Sidebar } from './Sidebar.svelte';
export { default as TopNav } from './TopNav.svelte';
export { default as IntelligencePanel } from './IntelligencePanel.svelte';

// Report components
export { default as ReportCard } from './ReportCard.svelte';
export { default as ReportsFilters } from './ReportsFilters.svelte';
export { default as ReportsStats } from './ReportsStats.svelte';

// Note components
export { default as NoteCard } from './NoteCard.svelte';

// Editor components
export { default as RichTextEditor } from './RichTextEditor.svelte';
export { default as MarkdownEditor } from './MarkdownEditor.svelte';
export { default as CodeEditor } from './CodeEditor.svelte';

// Utility types
export interface Report {
	id: string;
	title: string;
	type: string;
	status: 'pending' | 'processing' | 'completed' | 'error';
	createdAt: string;
	updatedAt: string;
	author: string;
	tags: string[];
	summary?: string;
}

export interface Note {
	id: string;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	tags: string[];
	category: string;
}

export interface PhaseFile {
	id: string;
	name: string;
	description: string;
	path: string;
	size: number;
	modified: string;
}

export interface Workflow {
	name: string;
	steps: string[];
	active: boolean;
}

export interface ReportEngine {
	name: string;
	phase: string;
	status: 'active' | 'inactive' | 'pending';
}
/**
 * Metadata Type (Phase 18)
 * 
 * Minimal interface for document metadata.
 */

export interface Metadata {
	title?: string;
	author?: string;
	createdAt?: Date;
	updatedAt?: Date;
	tags?: string[];
	category?: string;
	version?: string;
	description?: string;
	keywords?: string[];
	custom?: Record<string, unknown>;
}

export function createDefaultMetadata(): Metadata {
	return {
		title: 'Untitled Document',
		author: 'Unknown',
		createdAt: new Date(),
		updatedAt: new Date(),
		tags: [],
		category: 'General',
		version: '1.0.0',
		description: '',
		keywords: [],
		custom: {}
	};
}
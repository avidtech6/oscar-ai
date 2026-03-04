/**
 * Metadata Panel (Phase 18)
 * 
 * Minimal placeholder for the unified editor's metadata panel.
 */

import type { Metadata } from '../types/Metadata';

export interface MetadataPanel {
	/** Load metadata for the current document */
	load(metadata: Metadata): void;
	/** Save metadata from the UI */
	save(): Metadata;
	/** Validate metadata fields */
	validate(): string[];
	/** Reset to defaults */
	reset(): void;
}

export class DefaultMetadataPanel implements MetadataPanel {
	private data: Metadata = {};

	load(metadata: Metadata): void {
		this.data = { ...metadata };
		console.log('MetadataPanel load:', metadata);
	}

	save(): Metadata {
		console.log('MetadataPanel save:', this.data);
		return { ...this.data };
	}

	validate(): string[] {
		const errors: string[] = [];
		if (!this.data.title) errors.push('Title is required');
		if (!this.data.author) errors.push('Author is required');
		return errors;
	}

	reset(): void {
		this.data = {};
		console.log('MetadataPanel reset');
	}
}

export default DefaultMetadataPanel;
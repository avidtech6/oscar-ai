/**
 * File capture and integration with Copilot input pipeline.
 */

import { writable } from 'svelte/store';

export interface FileAttachment {
	name: string;
	type: string;
	size: number;
	content: string | null; // extracted text
	preview: string | null; // data URL for images
}

export const fileAttachments = writable<FileAttachment[]>([]);

/**
 * Add a file attachment to the store.
 */
export function addFileAttachment(file: FileAttachment): void {
	fileAttachments.update(files => [...files, file]);
	
	// Dispatch event for other components
	window.dispatchEvent(new CustomEvent('copilot:file-added', {
		detail: file
	}));
}

/**
 * Remove a file attachment by index.
 */
export function removeFileAttachment(index: number): void {
	fileAttachments.update(files => files.filter((_, i) => i !== index));
}

/**
 * Clear all file attachments.
 */
export function clearFileAttachments(): void {
	fileAttachments.set([]);
}

/**
 * Get the current file attachments.
 */
export function getFileAttachments(): FileAttachment[] {
	let value: FileAttachment[] = [];
	fileAttachments.subscribe(v => value = v)();
	return value;
}
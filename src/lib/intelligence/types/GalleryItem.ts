/**
 * Gallery Item Type (Phase 18)
 * 
 * Minimal interface for gallery items (images, documents, etc.).
 */

export interface GalleryItem {
	id: string;
	title: string;
	description?: string;
	url: string;
	thumbnailUrl?: string;
	mimeType: string;
	size?: number;
	tags?: string[];
	createdAt: Date;
	updatedAt: Date;
	metadata?: Record<string, unknown>;
}

export function createGalleryItem(
	title: string,
	url: string,
	mimeType: string,
	options?: Partial<GalleryItem>
): GalleryItem {
	const now = new Date();
	return {
		id: `gallery-${Date.now()}-${Math.random().toString(36).substring(2)}`,
		title,
		url,
		mimeType,
		description: '',
		thumbnailUrl: url,
		size: 0,
		tags: [],
		createdAt: now,
		updatedAt: now,
		metadata: {},
		...options
	};
}
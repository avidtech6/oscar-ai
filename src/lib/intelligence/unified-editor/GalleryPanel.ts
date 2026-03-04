/**
 * Gallery Panel (Phase 18)
 * 
 * Minimal placeholder for the unified editor's gallery panel.
 */

import type { GalleryItem } from '../types/GalleryItem';

export interface GalleryPanel {
	/** Load gallery items */
	load(items: GalleryItem[]): void;
	/** Add a new item */
	add(item: Omit<GalleryItem, 'id'>): GalleryItem;
	/** Remove an item by ID */
	remove(id: string): void;
	/** Get all items */
	getAll(): GalleryItem[];
	/** Filter items by tag */
	filterByTag(tag: string): GalleryItem[];
}

export class DefaultGalleryPanel implements GalleryPanel {
	private items: GalleryItem[] = [];

	load(items: GalleryItem[]): void {
		this.items = [...items];
		console.log('GalleryPanel load:', items.length, 'items');
	}

	add(item: Omit<GalleryItem, 'id'>): GalleryItem {
		const newItem: GalleryItem = {
			...item,
			id: `gallery-${Date.now()}-${Math.random().toString(36).substring(2)}`
		};
		this.items.push(newItem);
		console.log('GalleryPanel add:', newItem);
		return newItem;
	}

	remove(id: string): void {
		this.items = this.items.filter(item => item.id !== id);
		console.log('GalleryPanel remove:', id);
	}

	getAll(): GalleryItem[] {
		return [...this.items];
	}

	filterByTag(tag: string): GalleryItem[] {
		return this.items.filter(item => item.tags?.includes(tag));
	}
}

export default DefaultGalleryPanel;
import { semanticContext } from '$lib/stores/semanticContext';
import type { SemanticEvent } from '$lib/stores/semanticContext';
import { get } from 'svelte/store';

/**
 * Zoom into an item (set active context to item, zoom level to item)
 */
export function zoomIntoItem(itemId: string) {
	semanticContext.zoomIntoItem(itemId);
}

/**
 * Zoom out to a collection (set active context to collection, zoom level to collection)
 */
export function zoomOutToCollection(collectionId: string) {
	semanticContext.zoomOutToCollection(collectionId);
}

/**
 * Zoom to the target of a semantic event.
 * Heuristic: if target contains 'collection' or starts with 'col_' treat as collection, else item.
 */
export function zoomToEventTarget(event: SemanticEvent) {
	const target = event.target;
	if (target.includes('collection') || target.startsWith('col_')) {
		zoomOutToCollection(target);
	} else {
		zoomIntoItem(target);
	}
}

/**
 * Navigate back to the previous zoom level (if currently zoomed into item, zoom out to its parent collection).
 * This requires knowledge of parent relationships, which we don't have yet.
 * For now, just zoom out to collection if zoom level is 'item' and activeContextId is an item.
 */
export function navigateBack() {
	const state = get(semanticContext);
	if (state.zoomLevel === 'item' && state.activeContextId) {
		// For now, just zoom out to a default collection
		// TODO: Implement parent relationship tracking
		zoomOutToCollection('default');
	}
}

/**
 * Check if we are currently zoomed into an item
 */
export function isZoomedIntoItem(): boolean {
	const state = get(semanticContext);
	return state.zoomLevel === 'item';
}

/**
 * Get the current active context ID
 */
export function getActiveContextId(): string | null {
	const state = get(semanticContext);
	return state.activeContextId;
}

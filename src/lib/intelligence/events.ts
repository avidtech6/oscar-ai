/**
 * Simple Event Emitter for Intelligence Layer
 * 
 * Provides basic event subscription/emission for components that need to notify listeners.
 */

type EventCallback = (data: any) => void;

export class EventEmitter {
	private listeners: Map<string, EventCallback[]> = new Map();

	/**
	 * Subscribe to an event
	 */
	on(event: string, callback: EventCallback): void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)!.push(callback);
	}

	/**
	 * Unsubscribe from an event
	 */
	off(event: string, callback: EventCallback): void {
		const callbacks = this.listeners.get(event);
		if (!callbacks) return;
		const index = callbacks.indexOf(callback);
		if (index > -1) {
			callbacks.splice(index, 1);
		}
	}

	/**
	 * Emit an event with data
	 */
	emit(event: string, data?: any): void {
		const callbacks = this.listeners.get(event);
		if (!callbacks) return;
		// Copy array to avoid mutation during iteration
		[...callbacks].forEach(callback => {
			try {
				callback(data);
			} catch (error) {
				console.error(`Error in event listener for "${event}":`, error);
			}
		});
	}

	/**
	 * Remove all listeners for an event
	 */
	removeAllListeners(event?: string): void {
		if (event) {
			this.listeners.delete(event);
		} else {
			this.listeners.clear();
		}
	}

	/**
	 * Get number of listeners for an event
	 */
	listenerCount(event: string): number {
		return this.listeners.get(event)?.length || 0;
	}
}

/**
 * Global event emitter for intelligence layer
 */
export const intelligenceEvents = new EventEmitter();
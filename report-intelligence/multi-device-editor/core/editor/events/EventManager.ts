// Event management for UnifiedEditor
// Handles event listeners and event emission

import type { 
  EditorEventType,
  EditorEvent 
} from '../../../types';
import { logger } from '../../../utils/logger';

/**
 * Event listener function type
 */
export type EventListener = (event: EditorEvent) => void;

/**
 * Event manager for handling editor events
 */
export class EventManager {
  private eventListeners: Map<EditorEventType, EventListener[]> = new Map();

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * Add event listener
   */
  addEventListener(
    eventType: EditorEventType,
    listener: EventListener
  ): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(listener);
    this.eventListeners.set(eventType, listeners);
    
    logger.debug('Event listener added', {
      eventType,
      listenerCount: listeners.length,
    });
  }

  /**
   * Remove event listener
   */
  removeEventListener(
    eventType: EditorEventType,
    listener: EventListener
  ): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      logger.debug('Event listener removed', {
        eventType,
        listenerCount: listeners.length,
      });
    }
  }

  /**
   * Remove all event listeners for a specific event type
   */
  removeAllEventListeners(eventType: EditorEventType): void {
    this.eventListeners.set(eventType, []);
    logger.debug('All event listeners removed', {
      eventType,
    });
  }

  /**
   * Clear all event listeners
   */
  clearAllEventListeners(): void {
    this.eventListeners.clear();
    this.initializeEventListeners();
    logger.debug('All event listeners cleared');
  }

  /**
   * Emit an event to all listeners
   */
  emitEvent(eventType: EditorEventType, data: Record<string, any> = {}): void {
    const event: EditorEvent = {
      type: eventType,
      timestamp: new Date(),
      source: 'editor',
      data,
    };

    const listeners = this.eventListeners.get(eventType) || [];
    
    logger.debug('Emitting event', {
      eventType,
      listenerCount: listeners.length,
      dataKeys: Object.keys(data),
    });

    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Error in event listener', error as Error, { 
          eventType,
          listener: listener.name || 'anonymous'
        });
      }
    });
  }

  /**
   * Get listener count for an event type
   */
  getListenerCount(eventType: EditorEventType): number {
    const listeners = this.eventListeners.get(eventType) || [];
    return listeners.length;
  }

  /**
   * Check if there are any listeners for an event type
   */
  hasListeners(eventType: EditorEventType): boolean {
    const listeners = this.eventListeners.get(eventType) || [];
    return listeners.length > 0;
  }

  /**
   * Initialize event listeners for all event types
   */
  private initializeEventListeners(): void {
    const eventTypes: EditorEventType[] = [
      'contentChanged',
      'selectionChanged',
      'operationApplied',
      'syncStarted',
      'syncCompleted',
      'syncFailed',
      'conflictDetected',
      'conflictResolved',
      'deviceChanged',
      'networkChanged',
      'storageChanged',
      'errorOccurred',
    ];

    eventTypes.forEach(eventType => {
      if (!this.eventListeners.has(eventType)) {
        this.eventListeners.set(eventType, []);
      }
    });
  }

  /**
   * Create a one-time event listener
   */
  addOneTimeEventListener(
    eventType: EditorEventType,
    listener: EventListener
  ): void {
    const wrappedListener = (event: EditorEvent) => {
      listener(event);
      this.removeEventListener(eventType, wrappedListener);
    };
    
    this.addEventListener(eventType, wrappedListener);
  }

  /**
   * Wait for a specific event (promise-based)
   */
  waitForEvent(eventType: EditorEventType, timeoutMs: number = 5000): Promise<EditorEvent> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.removeEventListener(eventType, eventListener);
        reject(new Error(`Timeout waiting for event: ${eventType}`));
      }, timeoutMs);

      const eventListener = (event: EditorEvent) => {
        clearTimeout(timeoutId);
        resolve(event);
      };

      this.addEventListener(eventType, eventListener);
    });
  }
}
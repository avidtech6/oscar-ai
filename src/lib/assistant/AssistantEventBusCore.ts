/**
 * Assistant Event Bus Core - Layer 1
 * Core event bus functionality without presentation concerns.
 */
import type { AssistantEvent, EventHandler } from './AssistantEventBusTypes';

export class AssistantEventBusCore {
  private handlers: Map<string, EventHandler[]> = new Map();

  constructor() {
    this.setupInternalListeners();
  }

  // Core event emission
  emit(event: AssistantEvent) {
    const eventType = event.type;
    const handlers = this.handlers.get(eventType) || [];
    handlers.forEach(handler => handler(event));
  }

  // Core event subscription
  on(eventType: string, handler: EventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    return () => this.off(eventType, handler);
  }

  // Core event unsubscription
  off(eventType: string, handler: EventHandler) {
    const handlers = this.handlers.get(eventType);
    if (!handlers) return;
    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
  }

  // Internal listeners setup
  private setupInternalListeners() {
    // In a real implementation, you'd listen to router changes, selection changes, etc.
    // This is a placeholder for integration points.
  }
}
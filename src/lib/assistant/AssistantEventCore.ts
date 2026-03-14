/**
 * Global Assistant Intelligence Layer – Event Core (Layer 1)
 * Pure event definitions, event types, payload types, and core event dispatch logic.
 */
import type { AssistantEvent } from './AssistantTypes';

type EventHandler = (event: AssistantEvent) => void;

export class AssistantEventCore {
  private handlers: Map<string, EventHandler[]> = new Map();

  constructor() {
    // Core event bus initialization
    this.initializeCoreHandlers();
  }

  // Public API: emit events
  emit(event: AssistantEvent) {
    const eventType = event.type;
    const handlers = this.handlers.get(eventType) || [];
    handlers.forEach(handler => handler(event));
  }

  // Public API: subscribe to events
  on(eventType: string, handler: EventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    return () => this.off(eventType, handler);
  }

  // Public API: unsubscribe
  off(eventType: string, handler: EventHandler) {
    const handlers = this.handlers.get(eventType);
    if (!handlers) return;
    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
  }

  // Internal: initialize core handlers
  private initializeCoreHandlers() {
    // Core event handlers initialization
  }
}
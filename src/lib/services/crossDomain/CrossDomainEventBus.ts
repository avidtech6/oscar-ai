/**
 * Cross-Domain Event Bus
 * 
 * Enables communication between different domains (modules) in the Oscar AI system.
 * Domains can publish events and subscribe to events from other domains.
 * 
 * Usage:
 * - Import: `import { crossDomainEventBus } from '$lib/services/crossDomain/CrossDomainEventBus';`
 * - Subscribe: `crossDomainEventBus.subscribe('workspace:item-created', (data) => { ... });`
 * - Publish: `crossDomainEventBus.publish('workspace:item-created', { id: '123', type: 'note' });`
 * - Unsubscribe: `const unsubscribe = crossDomainEventBus.subscribe(...); unsubscribe();`
 */

export type DomainEvent = {
  type: string;
  domain: string;
  payload: any;
  timestamp: number;
  source?: string;
};

export type EventHandler = (event: DomainEvent) => void;

export type Domain = 
  | 'workspace' 
  | 'files' 
  | 'connect' 
  | 'projects' 
  | 'timeline' 
  | 'dashboard' 
  | 'integrations' 
  | 'notifications' 
  | 'search' 
  | 'map' 
  | 'filesystem' 
  | 'identity' 
  | 'permissions' 
  | 'automations' 
  | 'eventstream' 
  | 'sync' 
  | 'ai-context'
  | 'global';

export interface CrossDomainEventBus {
  subscribe(eventType: string, handler: EventHandler): () => void;
  publish(eventType: string, payload: any, source?: string): void;
  publishToDomain(domain: Domain, eventType: string, payload: any, source?: string): void;
  getRecentEvents(limit?: number): DomainEvent[];
  clearEvents(): void;
  getSubscribersCount(): number;
}

class CrossDomainEventBusImpl implements CrossDomainEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private events: DomainEvent[] = [];
  private maxEvents = 1000;

  /**
   * Subscribe to an event type
   * @param eventType - Event type pattern (e.g., 'workspace:item-created', 'files:*')
   * @param handler - Function to call when event is published
   * @returns Unsubscribe function
   */
  subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(eventType);
        }
      }
    };
  }

  /**
   * Publish an event
   * @param eventType - Event type (e.g., 'workspace:item-created')
   * @param payload - Event data
   * @param source - Optional source identifier
   */
  publish(eventType: string, payload: any, source?: string): void {
    const [domain, ...rest] = eventType.split(':');
    const type = rest.join(':') || eventType;
    
    const event: DomainEvent = {
      type: eventType,
      domain: domain as Domain,
      payload,
      timestamp: Date.now(),
      source
    };

    // Store event
    this.events.unshift(event);
    if (this.events.length > this.maxEvents) {
      this.events.pop();
    }

    // Notify exact match subscribers
    this.notifyHandlers(eventType, event);

    // Notify wildcard subscribers
    if (eventType.includes(':')) {
      const wildcardType = `${domain}:*`;
      this.notifyHandlers(wildcardType, event);
    }

    // Notify global subscribers
    this.notifyHandlers('*', event);

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CrossDomainEventBus] Published: ${eventType}`, { payload, source });
    }
  }

  /**
   * Publish an event to a specific domain
   * @param domain - Target domain
   * @param eventType - Event type within domain
   * @param payload - Event data
   * @param source - Optional source identifier
   */
  publishToDomain(domain: Domain, eventType: string, payload: any, source?: string): void {
    this.publish(`${domain}:${eventType}`, payload, source);
  }

  /**
   * Get recent events (for debugging/monitoring)
   * @param limit - Maximum number of events to return
   * @returns Array of recent events
   */
  getRecentEvents(limit: number = 50): DomainEvent[] {
    return this.events.slice(0, limit);
  }

  /**
   * Clear all stored events
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Get total number of subscribers
   */
  getSubscribersCount(): number {
    let count = 0;
    for (const handlers of this.handlers.values()) {
      count += handlers.size;
    }
    return count;
  }

  /**
   * Notify handlers for a specific event type
   */
  private notifyHandlers(eventType: string, event: DomainEvent): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`[CrossDomainEventBus] Error in handler for ${eventType}:`, error);
        }
      });
    }
  }
}

// Singleton instance
export const crossDomainEventBus: CrossDomainEventBus = new CrossDomainEventBusImpl();

/**
 * Common event types for cross-domain communication
 */
export const CrossDomainEvents = {
  // Workspace events
  WORKSPACE_ITEM_CREATED: 'workspace:item-created',
  WORKSPACE_ITEM_UPDATED: 'workspace:item-updated',
  WORKSPACE_ITEM_DELETED: 'workspace:item-deleted',
  
  // Files events
  FILE_UPLOADED: 'files:uploaded',
  FILE_DELETED: 'files:deleted',
  FILE_SHARED: 'files:shared',
  
  // Projects events
  PROJECT_CREATED: 'projects:created',
  PROJECT_UPDATED: 'projects:updated',
  PROJECT_DELETED: 'projects:deleted',
  TASK_CREATED: 'projects:task-created',
  TASK_COMPLETED: 'projects:task-completed',
  
  // Communication events
  MESSAGE_SENT: 'connect:message-sent',
  EMAIL_RECEIVED: 'connect:email-received',
  
  // Map events
  MAP_PIN_ADDED: 'map:pin-added',
  MAP_PIN_UPDATED: 'map:pin-updated',
  MAP_LOCATION_CHANGED: 'map:location-changed',
  
  // Search events
  SEARCH_PERFORMED: 'search:performed',
  SEARCH_RESULT_SELECTED: 'search:result-selected',
  
  // Dashboard events
  DASHBOARD_WIDGET_ADDED: 'dashboard:widget-added',
  DASHBOARD_WIDGET_REMOVED: 'dashboard:widget-removed',
  
  // Timeline events
  TIMELINE_EVENT_ADDED: 'timeline:event-added',
  TIMELINE_EVENT_UPDATED: 'timeline:event-updated',
  
  // Notifications events
  NOTIFICATION_CREATED: 'notifications:created',
  NOTIFICATION_READ: 'notifications:read',
  
  // Identity events
  USER_LOGGED_IN: 'identity:user-logged-in',
  USER_PROFILE_UPDATED: 'identity:profile-updated',
  
  // Sync events
  SYNC_STARTED: 'sync:started',
  SYNC_COMPLETED: 'sync:completed',
  SYNC_FAILED: 'sync:failed',
  
  // AI Context events
  AI_CONTEXT_UPDATED: 'ai-context:updated',
  AI_RESPONSE_GENERATED: 'ai-context:response-generated',
  
  // Global events
  APP_INITIALIZED: 'global:app-initialized',
  USER_ACTION: 'global:user-action',
  ERROR_OCCURRED: 'global:error-occurred',
} as const;

/**
 * Helper function to create domain-specific event publishers
 */
export function createDomainEventPublisher(domain: Domain, source?: string) {
  return {
    publish(eventType: string, payload: any) {
      crossDomainEventBus.publishToDomain(domain, eventType, payload, source);
    },
    
    itemCreated(item: any) {
      crossDomainEventBus.publishToDomain(domain, 'item-created', item, source);
    },
    
    itemUpdated(item: any) {
      crossDomainEventBus.publishToDomain(domain, 'item-updated', item, source);
    },
    
    itemDeleted(itemId: string) {
      crossDomainEventBus.publishToDomain(domain, 'item-deleted', { id: itemId }, source);
    },
    
    error(error: Error, context?: any) {
      crossDomainEventBus.publishToDomain(domain, 'error', { error: error.message, context }, source);
    }
  };
}

/**
 * Initialize cross-domain event system
 */
export function initializeCrossDomainEventSystem() {
  // Log all events in development
  if (process.env.NODE_ENV === 'development') {
    crossDomainEventBus.subscribe('*', (event) => {
      console.log(`[CrossDomainEventBus] Event: ${event.type}`, event);
    });
  }
  
  // Set up global error handling
  crossDomainEventBus.subscribe('*:error', (event) => {
    console.error(`[CrossDomainEventBus] Domain error (${event.domain}):`, event.payload.error, event.payload.context);
  });
  
  console.log('[CrossDomainEventBus] Cross-domain event system initialized');
}
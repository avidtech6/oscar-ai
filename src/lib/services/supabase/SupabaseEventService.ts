/**
 * Supabase Event Service
 * 
 * Connects the cross-domain event bus to Supabase for:
 * 1. Persisting important events to database tables
 * 2. Handling Supabase realtime subscriptions
 * 3. Providing CRUD operations for each domain
 */

import { crossDomainEventBus, CrossDomainEvents, createDomainEventPublisher } from '$lib/services/crossDomain/CrossDomainEventBus';
import type { Domain } from '$lib/services/crossDomain/CrossDomainEventBus';
import { supabase, getCurrentUserId } from '$lib/supabase/client';

export interface SupabaseEvent {
  id?: string;
  type: string;
  domain: Domain;
  payload: any;
  user_id?: string | null;
  created_at?: string;
  metadata?: Record<string, any>;
}

export interface SupabaseEventService {
  // Event persistence
  persistEvent(eventType: string, payload: any, domain: Domain, metadata?: Record<string, any>): Promise<string | null>;
  
  // Domain-specific CRUD operations
  createItem(domain: Domain, table: string, data: any): Promise<any>;
  updateItem(domain: Domain, table: string, id: string, data: any): Promise<any>;
  deleteItem(domain: Domain, table: string, id: string): Promise<any>;
  getItems(domain: Domain, table: string, query?: any): Promise<any[]>;
  
  // Realtime subscriptions
  subscribeToTable(domain: Domain, table: string, callback: (payload: any) => void): () => void;
  subscribeToEvents(callback: (event: SupabaseEvent) => void): () => void;
  
  // Initialization
  initialize(): Promise<void>;
}

class SupabaseEventServiceImpl implements SupabaseEventService {
  private isInitialized = false;
  private subscriptions: Map<string, () => void> = new Map();

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set up event listeners for important events
      this.setupEventListeners();
      
      // Set up Supabase realtime subscriptions for key tables
      await this.setupRealtimeSubscriptions();
      
      this.isInitialized = true;
      console.log('[SupabaseEventService] Initialized');
    } catch (error) {
      console.error('[SupabaseEventService] Failed to initialize:', error);
    }
  }

  /**
   * Set up listeners for cross-domain events
   */
  private setupEventListeners(): void {
    // Listen to workspace events
    crossDomainEventBus.subscribe(CrossDomainEvents.WORKSPACE_ITEM_CREATED, async (event) => {
      await this.persistEvent(event.type, event.payload, event.domain as Domain, { source: 'workspace' });
    });

    crossDomainEventBus.subscribe(CrossDomainEvents.WORKSPACE_ITEM_UPDATED, async (event) => {
      await this.persistEvent(event.type, event.payload, event.domain as Domain, { source: 'workspace' });
    });

    crossDomainEventBus.subscribe(CrossDomainEvents.WORKSPACE_ITEM_DELETED, async (event) => {
      await this.persistEvent(event.type, event.payload, event.domain as Domain, { source: 'workspace' });
    });

    // Listen to files events
    crossDomainEventBus.subscribe(CrossDomainEvents.FILE_UPLOADED, async (event) => {
      await this.persistEvent(event.type, event.payload, event.domain as Domain, { source: 'files' });
    });

    crossDomainEventBus.subscribe(CrossDomainEvents.FILE_DELETED, async (event) => {
      await this.persistEvent(event.type, event.payload, event.domain as Domain, { source: 'files' });
    });

    // Listen to projects events
    crossDomainEventBus.subscribe(CrossDomainEvents.PROJECT_CREATED, async (event) => {
      await this.persistEvent(event.type, event.payload, event.domain as Domain, { source: 'projects' });
    });

    crossDomainEventBus.subscribe(CrossDomainEvents.PROJECT_UPDATED, async (event) => {
      await this.persistEvent(event.type, event.payload, event.domain as Domain, { source: 'projects' });
    });

    crossDomainEventBus.subscribe(CrossDomainEvents.TASK_CREATED, async (event) => {
      await this.persistEvent(event.type, event.payload, event.domain as Domain, { source: 'projects' });
    });

    // Listen to identity events
    crossDomainEventBus.subscribe(CrossDomainEvents.USER_LOGGED_IN, async (event) => {
      await this.persistEvent(event.type, event.payload, event.domain as Domain, { source: 'identity' });
    });

    // Listen to global events
    crossDomainEventBus.subscribe(CrossDomainEvents.ERROR_OCCURRED, async (event) => {
      await this.persistEvent(event.type, event.payload, event.domain as Domain, { source: 'global' });
    });

    console.log('[SupabaseEventService] Event listeners set up');
  }

  /**
   * Set up Supabase realtime subscriptions
   */
  private async setupRealtimeSubscriptions(): Promise<void> {
    // Subscribe to system_events table for all events
    const eventsSubscription = supabase
      .channel('system_events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_events' },
        (payload) => {
          // Forward database events to the cross-domain event bus
          const event = payload.new as any;
          if (event) {
            crossDomainEventBus.publish(`${event.domain}:db-${payload.eventType}`, {
              ...event,
              dbEvent: payload.eventType
            }, 'supabase');
          }
        }
      )
      .subscribe();

    this.subscriptions.set('system_events', () => {
      supabase.removeChannel(eventsSubscription);
    });

    console.log('[SupabaseEventService] Realtime subscriptions set up');
  }

  /**
   * Persist an event to the Supabase database
   */
  async persistEvent(eventType: string, payload: any, domain: Domain, metadata?: Record<string, any>): Promise<string | null> {
    try {
      const userId = await getCurrentUserId();
      
      const eventData = {
        type: eventType,
        domain,
        payload,
        user_id: userId,
        metadata: metadata || {}
      };

      const { data, error } = await supabase
        .from('system_events')
        .insert(eventData as any)
        .select()
        .single();

      if (error) {
        console.error('[SupabaseEventService] Failed to persist event:', error);
        return null;
      }

      return (data as any)?.id || null;
    } catch (error) {
      console.error('[SupabaseEventService] Error persisting event:', error);
      return null;
    }
  }

  /**
   * Create an item in a domain-specific table
   */
  async createItem(domain: Domain, table: string, data: any): Promise<any> {
    try {
      const userId = await getCurrentUserId();
      
      const itemData = {
        ...data,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await (supabase as any)
        .from(`${domain}_${table}`)
        .insert(itemData)
        .select()
        .single();

      if (error) {
        console.error(`[SupabaseEventService] Failed to create ${domain}_${table} item:`, error);
        throw error;
      }

      // Publish event
      crossDomainEventBus.publish(`${domain}:item-created`, result, 'supabase');

      return result;
    } catch (error) {
      console.error(`[SupabaseEventService] Error creating ${domain}_${table} item:`, error);
      throw error;
    }
  }

  /**
   * Update an item in a domain-specific table
   */
  async updateItem(domain: Domain, table: string, id: string, data: any): Promise<any> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await (supabase as any)
        .from(`${domain}_${table}`)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`[SupabaseEventService] Failed to update ${domain}_${table} item:`, error);
        throw error;
      }

      // Publish event
      crossDomainEventBus.publish(`${domain}:item-updated`, result, 'supabase');

      return result;
    } catch (error) {
      console.error(`[SupabaseEventService] Error updating ${domain}_${table} item:`, error);
      throw error;
    }
  }

  /**
   * Delete an item from a domain-specific table
   */
  async deleteItem(domain: Domain, table: string, id: string): Promise<any> {
    try {
      const { data: result, error } = await (supabase as any)
        .from(`${domain}_${table}`)
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`[SupabaseEventService] Failed to delete ${domain}_${table} item:`, error);
        throw error;
      }

      // Publish event
      crossDomainEventBus.publish(`${domain}:item-deleted`, { id }, 'supabase');

      return result;
    } catch (error) {
      console.error(`[SupabaseEventService] Error deleting ${domain}_${table} item:`, error);
      throw error;
    }
  }

  /**
   * Get items from a domain-specific table
   */
  async getItems(domain: Domain, table: string, query?: any): Promise<any[]> {
    try {
      let supabaseQuery = (supabase as any)
        .from(`${domain}_${table}`)
        .select('*');

      // Apply query filters if provided
      if (query) {
        if (query.orderBy) {
          supabaseQuery = supabaseQuery.order(query.orderBy, { ascending: query.ascending ?? true });
        }
        if (query.limit) {
          supabaseQuery = supabaseQuery.limit(query.limit);
        }
        if (query.eq) {
          Object.entries(query.eq).forEach(([key, value]) => {
            supabaseQuery = supabaseQuery.eq(key, value as any);
          });
        }
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        console.error(`[SupabaseEventService] Failed to get ${domain}_${table} items:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`[SupabaseEventService] Error getting ${domain}_${table} items:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to realtime changes in a domain-specific table
   */
  subscribeToTable(domain: Domain, table: string, callback: (payload: any) => void): () => void {
    const channelName = `${domain}_${table}`;
    
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: `${domain}_${table}` },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    const unsubscribe = () => {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(channelName);
    };

    this.subscriptions.set(channelName, unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to all system events
   */
  subscribeToEvents(callback: (event: SupabaseEvent) => void): () => void {
    const subscription = supabase
      .channel('all_system_events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_events' },
        (payload) => {
          if (payload.new) {
            callback(payload.new as SupabaseEvent);
          }
        }
      )
      .subscribe();

    const unsubscribe = () => {
      supabase.removeChannel(subscription);
      this.subscriptions.delete('all_system_events');
    };

    this.subscriptions.set('all_system_events', unsubscribe);
    return unsubscribe;
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    this.subscriptions.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.subscriptions.clear();
    this.isInitialized = false;
    console.log('[SupabaseEventService] Cleaned up');
  }
}

// Singleton instance
export const supabaseEventService: SupabaseEventService = new SupabaseEventServiceImpl();

/**
 * Initialize Supabase event service
 */
export async function initializeSupabaseEventService(): Promise<void> {
  await supabaseEventService.initialize();
}

/**
 * Helper to create domain-specific Supabase service
 */
export function createDomainSupabaseService(domain: Domain) {
  return {
    create: (table: string, data: any) => supabaseEventService.createItem(domain, table, data),
    update: (table: string, id: string, data: any) => supabaseEventService.updateItem(domain, table, id, data),
    delete: (table: string, id: string) => supabaseEventService.deleteItem(domain, table, id),
    get: (table: string, query?: any) => supabaseEventService.getItems(domain, table, query),
    subscribe: (table: string, callback: (payload: any) => void) => 
      supabaseEventService.subscribeToTable(domain, table, callback),
    
    // Domain-specific convenience methods
    createWorkspaceItem: (data: any) => supabaseEventService.createItem('workspace', 'items', data),
    createProject: (data: any) => supabaseEventService.createItem('projects', 'projects', data),
    createTask: (data: any) => supabaseEventService.createItem('projects', 'tasks', data),
    createFile: (data: any) => supabaseEventService.createItem('files', 'files', data),
    createNote: (data: any) => supabaseEventService.createItem('workspace', 'notes', data),
  };
}
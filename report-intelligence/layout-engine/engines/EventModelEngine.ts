/**
 * Phase 23: AI Layout Engine - Event Model Engine
 * 
 * Implements layout-focused event model for listening to and emitting
 * layout-related events in real-time.
 */

import type {
  LayoutBlock,
  LayoutConfig,
  LayoutOperationResult,
  LayoutEvent,
  BlockAddedEvent,
  BlockMovedEvent,
  BlockDeletedEvent,
  LayoutChangedEvent,
  MediaAddedEvent
} from '../types';

/**
 * Event model engine configuration
 */
export interface EventModelEngineConfig {
  /** Whether to enable event logging */
  enableLogging: boolean;
  /** Maximum event history to keep */
  maxHistorySize: number;
  /** Whether to persist events */
  persistEvents: boolean;
  /** Whether to emit events for external listeners */
  emitExternalEvents: boolean;
  /** Event debounce delay in milliseconds */
  debounceDelay: number;
}

/**
 * Default event model engine configuration
 */
export const DEFAULT_EVENT_MODEL_ENGINE_CONFIG: EventModelEngineConfig = {
  enableLogging: true,
  maxHistorySize: 100,
  persistEvents: false,
  emitExternalEvents: true,
  debounceDelay: 100
};

/**
 * Event listener callback type
 */
export type EventListener<T extends LayoutEvent = LayoutEvent> = (event: T) => void | Promise<void>;

/**
 * Event subscription handle
 */
export interface EventSubscription {
  /** Unsubscribe from events */
  unsubscribe: () => void;
  /** Event type being listened to */
  eventType: string;
}

/**
 * Layout event model engine for managing layout-related events
 */
export class EventModelEngine {
  private config: EventModelEngineConfig;
  private eventHistory: LayoutEvent[] = [];
  private listeners: Map<string, EventListener[]> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<EventModelEngineConfig> = {}) {
    this.config = { ...DEFAULT_EVENT_MODEL_ENGINE_CONFIG, ...config };
  }

  /**
   * Listen for block added events
   */
  onBlockAdded(listener: EventListener<BlockAddedEvent>): EventSubscription {
    return this.addEventListener('blockAdded', listener);
  }

  /**
   * Listen for block moved events
   */
  onBlockMoved(listener: EventListener<BlockMovedEvent>): EventSubscription {
    return this.addEventListener('blockMoved', listener);
  }

  /**
   * Listen for block deleted events
   */
  onBlockDeleted(listener: EventListener<BlockDeletedEvent>): EventSubscription {
    return this.addEventListener('blockDeleted', listener);
  }

  /**
   * Listen for layout changed events
   */
  onLayoutChange(listener: EventListener<LayoutChangedEvent>): EventSubscription {
    return this.addEventListener('layoutChanged', listener);
  }

  /**
   * Listen for media added events
   */
  onMediaAdded(listener: EventListener<MediaAddedEvent>): EventSubscription {
    return this.addEventListener('mediaAdded', listener);
  }

  /**
   * Emit block created event
   */
  emitBlockCreated(block: LayoutBlock, position?: number): void {
    const event: BlockAddedEvent = {
      type: 'blockAdded',
      blockId: block.id,
      timestamp: new Date(),
      data: {
        block,
        position
      }
    };

    this.emitEvent(event);
  }

  /**
   * Emit block updated event
   */
  emitBlockUpdated(blockId: string, oldContent: any, newContent: any): void {
    const event: LayoutEvent = {
      type: 'blockUpdated',
      blockId,
      timestamp: new Date(),
      data: {
        oldContent,
        newContent
      }
    };

    this.emitEvent(event);
  }

  /**
   * Emit block moved event
   */
  emitBlockMoved(blockId: string, fromIndex: number, toIndex: number): void {
    const event: BlockMovedEvent = {
      type: 'blockMoved',
      blockId,
      timestamp: new Date(),
      data: {
        fromIndex,
        toIndex
      }
    };

    this.emitEvent(event);
  }

  /**
   * Emit layout changed event
   */
  emitLayoutChanged(blockId: string, oldLayout: LayoutConfig, newLayout: LayoutConfig): void {
    const event: LayoutChangedEvent = {
      type: 'layoutChanged',
      blockId,
      timestamp: new Date(),
      data: {
        oldLayout,
        newLayout
      }
    };

    this.emitEvent(event);
  }

  /**
   * Emit columns created event
   */
  emitColumnsCreated(blockId: string, columnCount: number, contentBlocks: LayoutBlock[]): void {
    const event: LayoutEvent = {
      type: 'columnsCreated',
      blockId,
      timestamp: new Date(),
      data: {
        columnCount,
        contentBlocks
      }
    };

    this.emitEvent(event);
  }

  /**
   * Emit media inserted event
   */
  emitMediaInserted(blockId: string, mediaId: string, mediaType: string): void {
    const event: MediaAddedEvent = {
      type: 'mediaAdded',
      blockId,
      timestamp: new Date(),
      data: {
        mediaId,
        blockId
      }
    };

    // Add mediaType as custom property if needed
    (event.data as any).mediaType = mediaType;

    this.emitEvent(event);
  }

  /**
   * Get event history
   */
  getEventHistory(filter?: { type?: string; blockId?: string; since?: Date }): LayoutEvent[] {
    let filtered = [...this.eventHistory];

    if (filter?.type) {
      filtered = filtered.filter(event => event.type === filter.type);
    }

    if (filter?.blockId) {
      filtered = filtered.filter(event => event.blockId === filter.blockId);
    }

    if (filter?.since) {
      filtered = filtered.filter(event => event.timestamp >= filter.since!);
    }

    return filtered;
  }

  /**
   * Clear event history
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get statistics about events
   */
  getEventStatistics(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    recentActivity: { lastHour: number; lastDay: number };
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const eventsByType: Record<string, number> = {};
    let lastHourCount = 0;
    let lastDayCount = 0;

    this.eventHistory.forEach(event => {
      // Count by type
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

      // Count recent activity
      if (event.timestamp >= oneHourAgo) {
        lastHourCount++;
      }
      if (event.timestamp >= oneDayAgo) {
        lastDayCount++;
      }
    });

    return {
      totalEvents: this.eventHistory.length,
      eventsByType,
      recentActivity: {
        lastHour: lastHourCount,
        lastDay: lastDayCount
      }
    };
  }

  /**
   * Create a block with event emission
   */
  async createBlock(
    type: string,
    content: any,
    layout?: LayoutConfig
  ): Promise<LayoutOperationResult> {
    try {
      // Import createLayoutBlock dynamically to avoid circular dependencies
      const { createLayoutBlock } = await import('../types');
      
      const block = createLayoutBlock(type as any, content, { layout });
      
      // Emit event
      this.emitBlockCreated(block);
      
      return {
        success: true,
        message: `Successfully created ${type} block`,
        block
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create block: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Update a block with event emission
   */
  async updateBlock(
    blockId: string,
    updates: Partial<LayoutBlock>
  ): Promise<LayoutOperationResult> {
    try {
      // In a real implementation, this would fetch the existing block
      // For now, we'll simulate it
      const existingBlock = { id: blockId, type: 'paragraph', content: '' } as LayoutBlock;
      const oldContent = existingBlock.content;
      
      const updatedBlock = {
        ...existingBlock,
        ...updates,
        id: blockId // Ensure ID doesn't change
      };
      
      // Emit event
      this.emitBlockUpdated(blockId, oldContent, updatedBlock.content);
      
      return {
        success: true,
        message: `Successfully updated block ${blockId}`,
        block: updatedBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update block: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Move a block with event emission
   */
  async moveBlock(
    blockId: string,
    newIndex: number,
    blocks: LayoutBlock[]
  ): Promise<LayoutOperationResult> {
    try {
      const blockIndex = blocks.findIndex(block => block.id === blockId);
      
      if (blockIndex === -1) {
        return {
          success: false,
          message: `Block ${blockId} not found`
        };
      }
      
      if (blockIndex === newIndex) {
        return {
          success: true,
          message: 'Block is already at the target position',
          blocks: [...blocks]
        };
      }
      
      // Create new block order
      const newBlocks = [...blocks];
      const blockToMove = newBlocks[blockIndex];
      
      // Remove block from old position
      newBlocks.splice(blockIndex, 1);
      // Insert block at new position
      newBlocks.splice(newIndex, 0, blockToMove);
      
      // Emit event
      this.emitBlockMoved(blockId, blockIndex, newIndex);
      
      return {
        success: true,
        message: `Successfully moved block ${blockId} from position ${blockIndex} to ${newIndex}`,
        blocks: newBlocks
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to move block: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Set layout with event emission
   */
  async setLayout(
    blockId: string,
    layout: LayoutConfig,
    oldLayout?: LayoutConfig
  ): Promise<LayoutOperationResult> {
    try {
      // In a real implementation, this would update the block's layout
      // For now, we'll simulate it
      const block = { id: blockId, type: 'paragraph', content: '', layout: oldLayout } as LayoutBlock;
      
      const updatedBlock = {
        ...block,
        layout
      };
      
      // Emit event
      this.emitLayoutChanged(blockId, oldLayout || {}, layout);
      
      return {
        success: true,
        message: `Successfully set layout for block ${blockId}`,
        block: updatedBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to set layout: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Create columns with event emission
   */
  async createColumns(
    blockId: string,
    columnCount: number,
    contentBlocks: LayoutBlock[][]
  ): Promise<LayoutOperationResult> {
    try {
      // Import createColumnBlock dynamically
      const { createColumnBlock } = await import('../types');
      
      const columnBlock = createColumnBlock(contentBlocks, {
        layout: {
          columns: columnCount,
          equalWidth: true,
          columnGap: 20
        }
      });
      
      // Emit event
      this.emitColumnsCreated(blockId, columnCount, contentBlocks.flat());
      
      return {
        success: true,
        message: `Successfully created ${columnCount}-column layout`,
        block: columnBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create columns: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Insert media into block with event emission
   */
  async insertMediaIntoBlock(
    blockId: string,
    mediaId: string,
    mediaType: string = 'image'
  ): Promise<LayoutOperationResult> {
    try {
      // In a real implementation, this would insert media into the block
      // For now, we'll simulate it
      const block = { id: blockId, type: 'image', content: { src: mediaId } } as LayoutBlock;
      
      // Emit event
      this.emitMediaInserted(blockId, mediaId, mediaType);
      
      return {
        success: true,
        message: `Successfully inserted ${mediaType} into block ${blockId}`,
        block
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to insert media: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Private helper methods
   */

  private addEventListener<T extends LayoutEvent>(
    eventType: string,
    listener: EventListener<T>
  ): EventSubscription {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    const listeners = this.listeners.get(eventType)!;
    listeners.push(listener as EventListener);

    return {
      unsubscribe: () => {
        const index = listeners.indexOf(listener as EventListener);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      },
      eventType
    };
  }

  private emitEvent(event: LayoutEvent): void {
    // Add to history
    this.eventHistory.push(event);
    
    // Trim history if needed
    if (this.eventHistory.length > this.config.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.config.maxHistorySize);
    }
    
    // Log if enabled
    if (this.config.enableLogging) {
      console.log(`[EventModel] ${event.type} - ${event.blockId}`, event);
    }
    
    // Notify listeners with debouncing
    this.debounceEmit(event);
  }

  private debounceEmit(event: LayoutEvent): void {
    const key = `${event.type}:${event.blockId}`;
    
    // Clear existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!);
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      this.notifyListeners(event);
      this.debounceTimers.delete(key);
    }, this.config.debounceDelay);
    
    this.debounceTimers.set(key, timer);
  }

  private notifyListeners(event: LayoutEvent): void {
    const listeners = this.listeners.get(event.type) || [];
    
    // Notify all listeners
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    });
    
    // Also notify wildcard listeners
    const wildcardListeners = this.listeners.get('*') || [];
    wildcardListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in wildcard event listener:`, error);
      }
    });
  }
}

/**
 * Create a default event model engine instance
 */
export function createEventModelEngine(config: Partial<EventModelEngineConfig> = {}): EventModelEngine {
  return new EventModelEngine(config);
}
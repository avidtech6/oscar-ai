/**
 * Phase 17: Content Intelligence & Blog Post Engine
 * Scheduling Engine - Core
 * 
 * Main scheduling engine class for managing scheduled items,
 * processing, optimization, and conflict resolution.
 */

import type {
  ScheduleItem,
  ScheduleConfig,
  ScheduleStatus,
  ScheduleItemType,
  ScheduleConflict,
  ScheduleOptimizationResult,
  ScheduleQueryOptions,
  TimeSlot,
  DayOfWeek,
  RecurrencePattern,
  TimeOfDay
} from './types';

/**
 * Scheduling Engine Core
 */
export class SchedulingEngine {
  private items: Map<string, ScheduleItem> = new Map();
  private config: ScheduleConfig;
  private isInitialized: boolean = false;
  private processingQueue: Set<string> = new Set();
  private eventListeners: Map<string, ((...args: any[]) => void)[]> = new Map();

  constructor(config: Partial<ScheduleConfig> = {}) {
    // Default configuration
    this.config = {
      timezone: config.timezone || 'UTC',
      workingHours: config.workingHours || {
        start: '09:00',
        end: '17:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      bufferTime: config.bufferTime || 15, // minutes
      maxConcurrentItems: config.maxConcurrentItems || 5,
      retryPolicy: config.retryPolicy || {
        maxRetries: 3,
        retryDelay: 30000, // 30 seconds
        backoffMultiplier: 2
      },
      notificationSettings: config.notificationSettings || {
        onSuccess: true,
        onFailure: true,
        onScheduleChange: true,
        channels: ['email']
      },
      optimization: config.optimization || {
        preferOptimalTimes: true,
        avoidConflicts: true,
        groupSimilarItems: true,
        respectDependencies: true
      }
    };
  }

  /**
   * Initialize the scheduling engine
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load any persisted schedule items
      await this.loadScheduleItems();
      
      // Start background processing
      this.startBackgroundProcessor();
      
      this.isInitialized = true;
      this.emitEvent('initialized', { timestamp: new Date() });
    } catch (error) {
      console.error('Failed to initialize SchedulingEngine:', error);
      throw error;
    }
  }

  /**
   * Add a schedule item
   */
  public async addItem(item: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'retryCount' | 'successCount' | 'failureCount'>): Promise<ScheduleItem> {
    const newItem: ScheduleItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      retryCount: 0,
      successCount: 0,
      failureCount: 0
    };

    // Validate the item
    const validation = this.validateItem(newItem);
    if (!validation.valid) {
      throw new Error(`Invalid schedule item: ${validation.errors.join(', ')}`);
    }

    // Check for conflicts
    const conflicts = await this.checkConflicts(newItem);
    if (conflicts.length > 0) {
      const criticalConflicts = conflicts.filter(c => c.severity === 'critical' || c.severity === 'error');
      if (criticalConflicts.length > 0) {
        throw new Error(`Schedule conflicts detected: ${criticalConflicts.map(c => c.description).join(', ')}`);
      }
    }

    // Add to storage
    this.items.set(newItem.id, newItem);
    
    // Emit event
    this.emitEvent('item-added', { item: newItem, conflicts });

    return newItem;
  }

  /**
   * Update a schedule item
   */
  public async updateItem(itemId: string, updates: Partial<ScheduleItem>): Promise<ScheduleItem> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Schedule item ${itemId} not found`);
    }

    // Don't allow updating certain fields
    const { id, createdAt, ...allowedUpdates } = updates;
    const updatedItem = {
      ...item,
      ...allowedUpdates,
      updatedAt: new Date()
    };

    // Validate the updated item
    const validation = this.validateItem(updatedItem);
    if (!validation.valid) {
      throw new Error(`Invalid schedule item update: ${validation.errors.join(', ')}`);
    }

    // Check for conflicts
    const conflicts = await this.checkConflicts(updatedItem);
    if (conflicts.length > 0) {
      const criticalConflicts = conflicts.filter(c => c.severity === 'critical' || c.severity === 'error');
      if (criticalConflicts.length > 0) {
        throw new Error(`Schedule conflicts detected: ${criticalConflicts.map(c => c.description).join(', ')}`);
      }
    }

    // Update storage
    this.items.set(itemId, updatedItem);
    
    // Emit event
    this.emitEvent('item-updated', { item: updatedItem, conflicts });

    return updatedItem;
  }

  /**
   * Remove a schedule item
   */
  public async removeItem(itemId: string): Promise<boolean> {
    const item = this.items.get(itemId);
    if (!item) {
      return false;
    }

    // Check if item is being processed
    if (this.processingQueue.has(itemId)) {
      throw new Error(`Cannot remove item ${itemId} while it is being processed`);
    }

    // Remove from storage
    this.items.delete(itemId);
    
    // Emit event
    this.emitEvent('item-removed', { itemId });

    return true;
  }

  /**
   * Get a schedule item
   */
  public getItem(itemId: string): ScheduleItem | undefined {
    return this.items.get(itemId);
  }

  /**
   * Get all schedule items
   */
  public getItems(options: ScheduleQueryOptions = {}): ScheduleItem[] {
    let items = Array.from(this.items.values());

    // Apply filters
    if (options.startDate) {
      items = items.filter(item => item.scheduledFor >= options.startDate!);
    }
    if (options.endDate) {
      items = items.filter(item => item.scheduledFor <= options.endDate!);
    }
    if (options.types && options.types.length > 0) {
      items = items.filter(item => options.types!.includes(item.type));
    }
    if (options.statuses && options.statuses.length > 0) {
      items = items.filter(item => options.statuses!.includes(item.status));
    }
    if (options.platforms && options.platforms.length > 0) {
      items = items.filter(item => 
        item.publishTo && item.publishTo.some(platform => options.platforms!.includes(platform))
      );
    }
    if (options.createdBy) {
      items = items.filter(item => item.createdBy === options.createdBy);
    }

    // Apply sorting
    if (options.sortBy) {
      items.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (options.sortBy) {
          case 'scheduledFor':
            aValue = a.scheduledFor.getTime();
            bValue = b.scheduledFor.getTime();
            break;
          case 'createdAt':
            aValue = a.createdAt.getTime();
            bValue = b.createdAt.getTime();
            break;
          case 'priority':
            aValue = a.priority;
            bValue = b.priority;
            break;
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          default:
            return 0;
        }

        const order = options.sortOrder === 'desc' ? -1 : 1;
        return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * order;
      });
    }

    // Apply pagination
    if (options.offset !== undefined) {
      items = items.slice(options.offset);
    }
    if (options.limit !== undefined) {
      items = items.slice(0, options.limit);
    }

    // Remove content if not requested
    if (!options.includeContent) {
      items = items.map(({ content, ...rest }) => rest as ScheduleItem);
    }

    return items;
  }

  /**
   * Schedule an item for processing
   */
  public async scheduleItem(itemId: string): Promise<ScheduleItem> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Schedule item ${itemId} not found`);
    }

    if (item.status !== 'draft') {
      throw new Error(`Item ${itemId} is already scheduled or processed`);
    }

    // Update status
    const updatedItem = await this.updateItem(itemId, { status: 'scheduled' });
    
    // Add to processing queue if it's time
    await this.checkAndQueueForProcessing(itemId);

    return updatedItem;
  }

  /**
   * Cancel a scheduled item
   */
  public async cancelItem(itemId: string): Promise<ScheduleItem> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Schedule item ${itemId} not found`);
    }

    if (!['draft', 'scheduled', 'queued'].includes(item.status)) {
      throw new Error(`Item ${itemId} cannot be cancelled in status ${item.status}`);
    }

    // Remove from processing queue if present
    this.processingQueue.delete(itemId);

    // Update status
    return await this.updateItem(itemId, { status: 'cancelled' });
  }

  /**
   * Process a scheduled item
   */
  public async processItem(itemId: string): Promise<{ success: boolean; error?: string; metadata?: any }> {
    const item = this.items.get(itemId);
    if (!item) {
      return { success: false, error: `Item ${itemId} not found` };
    }

    // Check if item should be processed
    if (!this.shouldProcessItem(item)) {
      return { success: false, error: `Item ${itemId} should not be processed yet` };
    }

    // Add to processing queue
    this.processingQueue.add(itemId);

    try {
      // Update status
      await this.updateItem(itemId, { 
        status: 'processing',
        lastProcessedAt: new Date()
      });

      // Emit processing started event
      this.emitEvent('processing-started', { itemId });

      // Simulate processing (in real implementation, this would call the appropriate handler)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
      
      // Determine success (simulated - in real implementation, this would be based on actual processing)
      const success = Math.random() > 0.1; // 90% success rate for simulation
      
      if (success) {
        // Update success
        const updatedItem = await this.updateItem(itemId, { 
          status: 'published',
          successCount: item.successCount + 1
        });

        // Handle recurrence
        if (item.recurrence !== 'none') {
          await this.handleRecurrence(item);
        }

        // Emit success event
        this.emitEvent('processing-success', { 
          itemId,
          item: updatedItem,
          metadata: { processingTime: 1000 }
        });

        return { success: true, metadata: { processingTime: 1000 } };
      } else {
        // Handle failure
        const retryCount = item.retryCount + 1;
        let newStatus: ScheduleStatus = 'failed';
        
        if (retryCount < item.maxRetries) {
          newStatus = 'scheduled';
          // Schedule retry with backoff
          const retryDelay = this.config.retryPolicy.retryDelay * Math.pow(this.config.retryPolicy.backoffMultiplier, retryCount - 1);
          const retryTime = new Date(Date.now() + retryDelay);
          
          await this.updateItem(itemId, {
            status: newStatus,
            retryCount,
            scheduledFor: retryTime,
            lastError: 'Processing failed, scheduled for retry'
          });
        } else {
          await this.updateItem(itemId, {
            status: newStatus,
            retryCount,
            lastError: 'Processing failed after maximum retries'
          });
        }

        // Emit failure event
        this.emitEvent('processing-failed', { 
          itemId,
          error: 'Processing failed',
          retryCount,
          willRetry: newStatus === 'scheduled'
        });

        return { success: false, error: 'Processing failed' };
      }
    } catch (error) {
      // Update with error
      await this.updateItem(itemId, {
        status: 'failed',
        lastError: error instanceof Error ? error.message : String(error)
      });

      // Emit error event
      this.emitEvent('processing-error', { 
        itemId,
        error: error instanceof Error ? error.message : String(error)
      });

      return { success: false, error: error instanceof Error ? error.message : String(error) };
    } finally {
      // Remove from processing queue
      this.processingQueue.delete(itemId);
    }
  }

  /**
   * Optimize the schedule
   */
  public async optimizeSchedule(items?: ScheduleItem[]): Promise<ScheduleOptimizationResult> {
    const itemsToOptimize = items || Array.from(this.items.values());
    
    // Create a copy for optimization
    const optimizedItems = [...itemsToOptimize.map(item => ({ ...item }))];
    
    const changes: ScheduleOptimizationResult['changes'] = [];
    
    // Apply optimization rules
    if (this.config.optimization.preferOptimalTimes) {
      this.optimizeForOptimalTimes(optimizedItems, changes);
    }
    
    if (this.config.optimization.avoidConflicts) {
      this.resolveConflicts(optimizedItems, changes);
    }
    
    if (this.config.optimization.groupSimilarItems) {
      this.groupSimilarItems(optimizedItems, changes);
    }
    
    if (this.config.optimization.respectDependencies) {
      this.enforceDependencies(optimizedItems, changes);
    }
    
    // Calculate metrics
    const metrics = this.calculateOptimizationMetrics(itemsToOptimize, optimizedItems);
    
    return {
      originalSchedule: itemsToOptimize,
      optimizedSchedule: optimizedItems,
      changes,
      metrics
    };
  }

  /**
   * Check for available time slots
   */
  public async getAvailableTimeSlots(
    startDate: Date,
    endDate: Date,
    duration: number, // minutes
    options: {
      excludeItemIds?: string[];
      preferTimeOfDay?: TimeOfDay;
      maxSlots?: number;
    } = {}
  ): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    const current = new Date(startDate);
    
    while (current < endDate) {
      const slotEnd = new Date(current.getTime() + duration * 60000);
      
      // Check if within working hours
      if (this.isWithinWorkingHours(current, slotEnd)) {
        // Check for conflicts
        const conflicts = await this.checkTimeSlotConflicts(current, slotEnd, options.excludeItemIds || []);
        
        slots.push({
          start: new Date(current),
          end: slotEnd,
          available: conflicts.length === 0,
          reason: conflicts.length > 0 ? 'Conflicts with existing items' : undefined,
          conflictingItems: conflicts.length > 0 ? conflicts.map(c => c.id) : undefined
        });
      }
      
      // Move to next slot (30 minute increments)
      current.setTime(current.getTime() + 30 * 60000);
    }
    
    // Filter by time of day preference
    if (options.preferTimeOfDay && options.preferTimeOfDay !== 'anytime') {
      const preferredSlots = slots.filter(slot => 
        this.getTimeOfDay(slot.start) === options.preferTimeOfDay
      );
      
      if (preferredSlots.length > 0) {
        return preferredSlots.slice(0, options.maxSlots || 10);
      }
    }
    
    return slots.slice(0, options.maxSlots || 10);
  }

  /**
   * Get engine status
   */
  public getStatus(): {
    initialized: boolean;
    itemCount: number;
    processingCount: number;
    config: ScheduleConfig;
  } {
    return {
      initialized: this.isInitialized,
      itemCount: this.items.size,
      processingCount: this.processingQueue.size,
      config: this.config
    };
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    this.isInitialized = false;
    this.processingQueue.clear();
    this.items.clear();
    this.eventListeners.clear();
  }

  // Private helper methods

  private generateId(): string {
    return `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadScheduleItems(): Promise<void> {
    // In a real implementation, this would load from persistent storage
    // For now, start with empty items
    this.items.clear();
  }

  private startBackgroundProcessor(): void {
    // In a real implementation, this would set up interval-based processing
    // For now, this is a placeholder
    setInterval(() => {
      this.processDueItems().catch(error => {
        console.error('Error in background processing:', error);
      });
    }, 60000); // Check every minute
  }

  private async processDueItems(): Promise<void> {
    const now = new Date();
    const dueItems = Array.from(this.items.values()).filter(item => 
      item.status === 'scheduled' && 
      item.scheduledFor <= now &&
      !this.processingQueue.has(item.id)
    );

    for (const item of dueItems) {
      try {
        await this.processItem(item.id);
      } catch (error) {
        console.error(`Failed to process item ${item.id}:`, error);
      }
    }
  }

  // Validation methods
  private validate

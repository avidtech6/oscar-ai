/**
 * Phase 17: Content Intelligence & Blog Post Engine
 * Scheduling Engine - Validation
 * 
 * Validation and conflict detection for schedule items.
 */

import type {
  ScheduleItem,
  ScheduleConfig,
  ScheduleConflict,
  DayOfWeek
} from './types';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Schedule Validator
 */
export class ScheduleValidator {
  constructor(private config: ScheduleConfig) {}

  /**
   * Validate a schedule item
   */
  public validateItem(item: ScheduleItem): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!item.title || item.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!item.scheduledFor) {
      errors.push('Scheduled time is required');
    } else if (item.scheduledFor < new Date()) {
      warnings.push('Scheduled time is in the past');
    }

    if (!item.timezone) {
      errors.push('Timezone is required');
    }

    if (item.priority < 1 || item.priority > 10) {
      errors.push('Priority must be between 1 and 10');
    }

    if (item.maxRetries < 0) {
      errors.push('Max retries cannot be negative');
    }

    // Content validation based on type
    if (item.type === 'blog-post' && !item.content) {
      warnings.push('Blog post items should have content');
    }

    // Recurrence validation
    if (item.recurrence !== 'none') {
      if (!item.recurrenceEnds) {
        warnings.push('Recurring items should have an end date');
      }
      if (item.recurrence === 'custom' && !item.recurrenceCustom) {
        errors.push('Custom recurrence requires a recurrence pattern');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check for schedule conflicts
   */
  public checkConflicts(
    item: ScheduleItem,
    existingItems: ScheduleItem[],
    excludeItemId?: string
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];

    // Check time overlap conflicts
    for (const existingItem of existingItems) {
      if (existingItem.id === excludeItemId || existingItem.id === item.id) continue;
      
      if (this.shouldConsiderForConflict(existingItem)) {
        const itemStart = item.scheduledFor;
        const itemEnd = this.calculateItemEnd(item);
        const existingStart = existingItem.scheduledFor;
        const existingEnd = this.calculateItemEnd(existingItem);

        if (itemStart < existingEnd && itemEnd > existingStart) {
          conflicts.push({
            type: 'time-overlap',
            severity: 'error',
            items: [item.id, existingItem.id],
            description: `Time overlap with "${existingItem.title}"`,
            resolution: 'Reschedule one of the items'
          });
        }
      }
    }

    // Check dependency violations
    if (item.dependsOn && item.dependsOn.length > 0) {
      for (const dependencyId of item.dependsOn) {
        const dependency = existingItems.find(i => i.id === dependencyId);
        if (!dependency) {
          conflicts.push({
            type: 'dependency-violation',
            severity: 'error',
            items: [item.id],
            description: `Dependency "${dependencyId}" not found`,
            resolution: 'Remove or fix the dependency'
          });
        } else if (dependency.scheduledFor > item.scheduledFor) {
          conflicts.push({
            type: 'dependency-violation',
            severity: 'error',
            items: [item.id, dependencyId],
            description: `Item scheduled before dependency "${dependency.title}"`,
            resolution: 'Schedule item after its dependency'
          });
        }
      }
    }

    // Check resource exhaustion (concurrent items)
    const concurrentItems = existingItems.filter(existingItem => {
      if (existingItem.id === excludeItemId || existingItem.id === item.id) return false;
      if (!this.shouldConsiderForConflict(existingItem)) return false;
      
      const existingStart = existingItem.scheduledFor;
      const existingEnd = this.calculateItemEnd(existingItem);
      const itemStart = item.scheduledFor;
      const itemEnd = this.calculateItemEnd(item);
      
      return itemStart < existingEnd && itemEnd > existingStart;
    });

    if (concurrentItems.length >= this.config.maxConcurrentItems) {
      conflicts.push({
        type: 'resource-exhaustion',
        severity: 'warning',
        items: [item.id, ...concurrentItems.map(i => i.id)],
        description: `Exceeds maximum concurrent items (${this.config.maxConcurrentItems})`,
        resolution: 'Reduce concurrent items or increase limit'
      });
    }

    // Check working hours
    if (!this.isWithinWorkingHours(item.scheduledFor, this.calculateItemEnd(item))) {
      conflicts.push({
        type: 'timezone-mismatch',
        severity: 'warning',
        items: [item.id],
        description: 'Scheduled outside of working hours',
        resolution: 'Schedule during working hours or adjust working hours configuration'
      });
    }

    return conflicts;
  }

  /**
   * Check time slot conflicts
   */
  public checkTimeSlotConflicts(
    start: Date,
    end: Date,
    existingItems: ScheduleItem[],
    excludeItemIds: string[] = []
  ): ScheduleItem[] {
    const conflicts: ScheduleItem[] = [];

    for (const item of existingItems) {
      if (excludeItemIds.includes(item.id)) continue;
      if (!this.shouldConsiderForConflict(item)) continue;

      const itemStart = item.scheduledFor;
      const itemEnd = this.calculateItemEnd(item);

      if (start < itemEnd && end > itemStart) {
        conflicts.push(item);
      }
    }

    return conflicts;
  }

  /**
   * Validate schedule configuration
   */
  public validateConfig(config: ScheduleConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Timezone validation
    try {
      Intl.DateTimeFormat(undefined, { timeZone: config.timezone });
    } catch {
      errors.push(`Invalid timezone: ${config.timezone}`);
    }

    // Working hours validation
    if (!this.isValidTimeString(config.workingHours.start)) {
      errors.push(`Invalid working hours start time: ${config.workingHours.start}`);
    }
    if (!this.isValidTimeString(config.workingHours.end)) {
      errors.push(`Invalid working hours end time: ${config.workingHours.end}`);
    }
    if (config.workingHours.days.length === 0) {
      warnings.push('No working days specified');
    }

    // Buffer time validation
    if (config.bufferTime < 0) {
      errors.push('Buffer time cannot be negative');
    }

    // Concurrent items validation
    if (config.maxConcurrentItems < 1) {
      errors.push('Maximum concurrent items must be at least 1');
    }

    // Retry policy validation
    if (config.retryPolicy.maxRetries < 0) {
      errors.push('Max retries cannot be negative');
    }
    if (config.retryPolicy.retryDelay < 0) {
      errors.push('Retry delay cannot be negative');
    }
    if (config.retryPolicy.backoffMultiplier < 1) {
      warnings.push('Backoff multiplier should be at least 1');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if item should be considered for conflict detection
   */
  private shouldConsiderForConflict(item: ScheduleItem): boolean {
    // Don't consider cancelled or failed items for conflicts
    return !['cancelled', 'failed', 'archived'].includes(item.status);
  }

  /**
   * Calculate item end time
   */
  private calculateItemEnd(item: ScheduleItem): Date {
    const duration = item.estimatedDuration || 60; // Default 60 minutes
    return new Date(item.scheduledFor.getTime() + duration * 60000);
  }

  /**
   * Check if time range is within working hours
   */
  private isWithinWorkingHours(start: Date, end: Date): boolean {
    const startHour = parseInt(this.config.workingHours.start.split(':')[0]);
    const startMinute = parseInt(this.config.workingHours.start.split(':')[1]);
    const endHour = parseInt(this.config.workingHours.end.split(':')[0]);
    const endMinute = parseInt(this.config.workingHours.end.split(':')[1]);

    const startTime = start.getHours() * 60 + start.getMinutes();
    const endTime = end.getHours() * 60 + end.getMinutes();
    const configStartTime = startHour * 60 + startMinute;
    const configEndTime = endHour * 60 + endMinute;

    // Check day of week
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = daysOfWeek[start.getDay()] as DayOfWeek;
    
    if (!this.config.workingHours.days.includes(dayName)) {
      return false;
    }

    // Check time range
    return startTime >= configStartTime && endTime <= configEndTime;
  }

  /**
   * Validate time string format (HH:MM)
   */
  private isValidTimeString(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  }
}
/**
 * Phase 17: Content Intelligence & Blog Post Engine
 * Scheduling Engine - Main Export
 * 
 * Exports all scheduling engine modules.
 */

// Import types
import type {
  ScheduleItem,
  ScheduleConfig,
  ScheduleStatus,
  ScheduleItemType,
  ScheduleConflict,
  ScheduleOptimizationResult,
  ScheduleQueryOptions,
  ScheduleBatchResult,
  TimeSlot,
  DayOfWeek,
  RecurrencePattern,
  TimeOfDay,
  ScheduleAnalytics,
  ScheduleNotification,
  ScheduleExportFormat,
  ScheduleImportResult
} from './types';

// Import modules
import { ScheduleValidator, type ValidationResult } from './validation';
import { ScheduleOptimizer } from './optimization';
import { RecurrenceHandler } from './recurrence';
import { SchedulingEngine } from './core';

// Re-export types
export type {
  ScheduleItem,
  ScheduleConfig,
  ScheduleStatus,
  ScheduleItemType,
  ScheduleConflict,
  ScheduleOptimizationResult,
  ScheduleQueryOptions,
  ScheduleBatchResult,
  TimeSlot,
  DayOfWeek,
  RecurrencePattern,
  TimeOfDay,
  ScheduleAnalytics,
  ScheduleNotification,
  ScheduleExportFormat,
  ScheduleImportResult
};

// Re-export modules
export {
  ScheduleValidator,
  type ValidationResult,
  ScheduleOptimizer,
  RecurrenceHandler,
  SchedulingEngine
};

/**
 * Create a default scheduling engine instance
 */
export function createSchedulingEngine(config?: Partial<ScheduleConfig>): SchedulingEngine {
  return new SchedulingEngine(config);
}

/**
 * Helper function to validate schedule configuration
 */
export function validateScheduleConfig(config: ScheduleConfig): ValidationResult {
  const validator = new ScheduleValidator(config);
  return validator.validateConfig(config);
}

/**
 * Helper function to optimize a schedule
 */
export function optimizeSchedule(
  items: ScheduleItem[],
  config?: Partial<ScheduleConfig>
): ScheduleOptimizationResult {
  const optimizer = new ScheduleOptimizer({
    timezone: config?.timezone || 'UTC',
    workingHours: config?.workingHours || {
      start: '09:00',
      end: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    bufferTime: config?.bufferTime || 15,
    maxConcurrentItems: config?.maxConcurrentItems || 5,
    retryPolicy: config?.retryPolicy || {
      maxRetries: 3,
      retryDelay: 30000,
      backoffMultiplier: 2
    },
    notificationSettings: config?.notificationSettings || {
      onSuccess: true,
      onFailure: true,
      onScheduleChange: true,
      channels: ['email']
    },
    optimization: config?.optimization || {
      preferOptimalTimes: true,
      avoidConflicts: true,
      groupSimilarItems: true,
      respectDependencies: true
    }
  });
  
  return optimizer.optimizeSchedule(items);
}

/**
 * Helper function to calculate recurrence dates
 */
export function calculateRecurrenceDates(
  item: ScheduleItem,
  limit: number = 10
): Date[] {
  const handler = new RecurrenceHandler();
  return handler.getFutureOccurrences(item, limit);
}

/**
 * Default schedule configuration
 */
export const defaultScheduleConfig: ScheduleConfig = {
  timezone: 'UTC',
  workingHours: {
    start: '09:00',
    end: '17:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  bufferTime: 15,
  maxConcurrentItems: 5,
  retryPolicy: {
    maxRetries: 3,
    retryDelay: 30000,
    backoffMultiplier: 2
  },
  notificationSettings: {
    onSuccess: true,
    onFailure: true,
    onScheduleChange: true,
    channels: ['email']
  },
  optimization: {
    preferOptimalTimes: true,
    avoidConflicts: true,
    groupSimilarItems: true,
    respectDependencies: true
  }
};
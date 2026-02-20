/**
 * Phase 17: Content Intelligence & Blog Post Engine
 * Scheduling Engine - Types
 * 
 * Core type definitions for the scheduling system.
 */

/**
 * Schedule item types
 */
export type ScheduleItemType = 
  | 'blog-post'
  | 'social-post'
  | 'newsletter'
  | 'email'
  | 'task'
  | 'reminder'
  | 'meeting'
  | 'event'
  | 'campaign'
  | 'automation';

/**
 * Schedule status
 */
export type ScheduleStatus = 
  | 'draft'
  | 'scheduled'
  | 'queued'
  | 'processing'
  | 'published'
  | 'failed'
  | 'cancelled'
  | 'archived';

/**
 * Recurrence patterns
 */
export type RecurrencePattern = 
  | 'none'
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom';

/**
 * Day of week
 */
export type DayOfWeek = 
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

/**
 * Time of day preference
 */
export type TimeOfDay = 
  | 'morning'    // 6am - 12pm
  | 'afternoon'  // 12pm - 6pm
  | 'evening'    // 6pm - 10pm
  | 'night'      // 10pm - 6am
  | 'anytime';

/**
 * Schedule item
 */
export interface ScheduleItem {
  id: string;
  type: ScheduleItemType;
  title: string;
  description?: string;
  content?: any; // Type-specific content
  status: ScheduleStatus;
  
  // Scheduling
  scheduledFor: Date;
  timezone: string;
  recurrence: RecurrencePattern;
  recurrenceEnds?: Date;
  recurrenceDays?: DayOfWeek[];
  recurrenceCustom?: string; // Cron expression or custom pattern
  
  // Publishing
  publishTo?: string[]; // Platform IDs or names
  autoPublish: boolean;
  requireApproval: boolean;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastProcessedAt?: Date;
  nextProcessingAt?: Date;
  
  // Performance
  estimatedDuration?: number; // in minutes
  priority: number; // 1-10, higher = more important
  
  // Dependencies
  dependsOn?: string[]; // IDs of items that must complete first
  triggers?: string[]; // IDs of items to trigger after completion
  
  // Error handling
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  
  // Analytics
  successCount: number;
  failureCount: number;
  averageProcessingTime?: number; // in milliseconds
}

/**
 * Schedule configuration
 */
export interface ScheduleConfig {
  timezone: string;
  workingHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
    days: DayOfWeek[];
  };
  bufferTime: number; // minutes between items
  maxConcurrentItems: number;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // milliseconds
    backoffMultiplier: number;
  };
  notificationSettings: {
    onSuccess: boolean;
    onFailure: boolean;
    onScheduleChange: boolean;
    channels: string[]; // email, slack, etc.
  };
  optimization: {
    preferOptimalTimes: boolean;
    avoidConflicts: boolean;
    groupSimilarItems: boolean;
    respectDependencies: boolean;
  };
}

/**
 * Schedule optimization result
 */
export interface ScheduleOptimizationResult {
  originalSchedule: ScheduleItem[];
  optimizedSchedule: ScheduleItem[];
  changes: Array<{
    itemId: string;
    change: 'time-changed' | 'order-changed' | 'grouped' | 'split';
    originalTime?: Date;
    newTime?: Date;
    reason: string;
  }>;
  metrics: {
    totalDuration: number;
    concurrentReduction: number;
    bufferTimeUtilization: number;
    dependencySatisfaction: number;
    optimalTimeAlignment: number;
  };
}

/**
 * Schedule conflict
 */
export interface ScheduleConflict {
  type: 'time-overlap' | 'dependency-violation' | 'resource-exhaustion' | 'timezone-mismatch';
  severity: 'warning' | 'error' | 'critical';
  items: string[]; // IDs of conflicting items
  description: string;
  resolution?: string;
}

/**
 * Schedule analytics
 */
export interface ScheduleAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  totals: {
    items: number;
    published: number;
    failed: number;
    cancelled: number;
    pending: number;
  };
  performance: {
    averageProcessingTime: number;
    successRate: number;
    retryRate: number;
    onTimeRate: number;
  };
  platformDistribution: Record<string, number>;
  typeDistribution: Record<ScheduleItemType, number>;
  timeDistribution: Record<TimeOfDay, number>;
  trends: Array<{
    date: Date;
    published: number;
    failed: number;
    averageTime: number;
  }>;
}

/**
 * Schedule notification
 */
export interface ScheduleNotification {
  id: string;
  type: 'success' | 'failure' | 'warning' | 'info' | 'reminder';
  title: string;
  message: string;
  scheduleItemId?: string;
  scheduleItemTitle?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Schedule export format
 */
export type ScheduleExportFormat = 
  | 'json'
  | 'csv'
  | 'ical'
  | 'google-calendar'
  | 'outlook'
  | 'notion';

/**
 * Schedule import result
 */
export interface ScheduleImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors: Array<{
    item: any;
    error: string;
  }>;
  warnings: string[];
}

/**
 * Time slot availability
 */
export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  reason?: string;
  conflictingItems?: string[];
}

/**
 * Schedule query options
 */
export interface ScheduleQueryOptions {
  startDate?: Date;
  endDate?: Date;
  types?: ScheduleItemType[];
  statuses?: ScheduleStatus[];
  platforms?: string[];
  createdBy?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'scheduledFor' | 'createdAt' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
  includeContent?: boolean;
  includeAnalytics?: boolean;
}

/**
 * Schedule batch operation result
 */
export interface ScheduleBatchResult {
  success: boolean;
  operation: 'create' | 'update' | 'delete' | 'publish' | 'cancel';
  processedCount: number;
  successCount: number;
  failureCount: number;
  results: Array<{
    itemId: string;
    success: boolean;
    error?: string;
    metadata?: Record<string, any>;
  }>;
}
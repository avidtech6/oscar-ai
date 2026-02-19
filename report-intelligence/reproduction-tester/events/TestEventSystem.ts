/**
 * Phase 10: Report Reproduction Tester
 * TestEventSystem Class
 * 
 * Event system for test execution tracking and monitoring.
 */

import type { TestCase } from '../TestResult';
import type { TestResult } from '../TestResult';
import type { ConsistencyMeasurement } from '../TestResult';

/**
 * Test event types
 */
export enum TestEventType {
  // Test case events
  TEST_CASE_CREATED = 'test_case_created',
  TEST_CASE_UPDATED = 'test_case_updated',
  TEST_CASE_DELETED = 'test_case_deleted',
  
  // Test execution events
  TEST_STARTED = 'test_started',
  TEST_COMPLETED = 'test_completed',
  TEST_FAILED = 'test_failed',
  TEST_SKIPPED = 'test_skipped',
  
  // Comparison events
  COMPARISON_STARTED = 'comparison_started',
  COMPARISON_COMPLETED = 'comparison_completed',
  COMPARISON_FAILED = 'comparison_failed',
  
  // Scoring events
  SCORING_STARTED = 'scoring_started',
  SCORING_COMPLETED = 'scoring_completed',
  
  // Storage events
  RESULT_STORED = 'result_stored',
  RESULT_RETRIEVED = 'result_retrieved',
  STORAGE_CLEARED = 'storage_cleared',
  
  // System events
  SYSTEM_STARTED = 'system_started',
  SYSTEM_STOPPED = 'system_stopped',
  ERROR_OCCURRED = 'error_occurred',
  WARNING_OCCURRED = 'warning_occurred',
  
  // Multi-run events
  MULTI_RUN_STARTED = 'multi_run_started',
  MULTI_RUN_COMPLETED = 'multi_run_completed',
  CONSISTENCY_CALCULATED = 'consistency_calculated',
}

/**
 * Base event interface
 */
export interface TestEvent {
  type: TestEventType;
  timestamp: Date;
  source: string;
  data?: any;
}

/**
 * Test case event
 */
export interface TestCaseEvent extends TestEvent {
  data: {
    testCase: TestCase;
    previousTestCase?: TestCase;
  };
}

/**
 * Test execution event
 */
export interface TestExecutionEvent extends TestEvent {
  data: {
    testCaseId: string;
    testResult?: TestResult;
    error?: Error;
    duration?: number;
  };
}

/**
 * Comparison event
 */
export interface ComparisonEvent extends TestEvent {
  data: {
    testCaseId: string;
    testResultId: string;
    comparisonResult?: any;
    error?: Error;
    duration?: number;
  };
}

/**
 * Scoring event
 */
export interface ScoringEvent extends TestEvent {
  data: {
    testCaseId: string;
    consistencyMeasurement?: ConsistencyMeasurement;
    error?: Error;
    duration?: number;
  };
}

/**
 * Storage event
 */
export interface StorageEvent extends TestEvent {
  data: {
    operation: string;
    itemType: string;
    itemId: string;
    count?: number;
    error?: Error;
  };
}

/**
 * System event
 */
export interface SystemEvent extends TestEvent {
  data: {
    message: string;
    error?: Error;
    warning?: string;
  };
}

/**
 * Multi-run event
 */
export interface MultiRunEvent extends TestEvent {
  data: {
    testCaseId: string;
    runCount: number;
    results: TestResult[];
    consistencyMeasurement?: ConsistencyMeasurement;
    error?: Error;
    duration?: number;
  };
}

/**
 * Event handler function type
 */
export type EventHandler = (event: TestEvent) => void;

/**
 * Event subscription
 */
export interface EventSubscription {
  unsubscribe: () => void;
}

/**
 * Main TestEventSystem class
 */
export class TestEventSystem {
  private handlers: Map<TestEventType, EventHandler[]> = new Map();
  private allHandlers: EventHandler[] = [];
  private eventHistory: TestEvent[] = [];
  private maxHistorySize: number = 1000;
  private isEnabled: boolean = true;
  
  constructor() {
    // Initialize handler map for all event types
    Object.values(TestEventType).forEach(type => {
      this.handlers.set(type, []);
    });
  }

  /**
   * Enable event system
   */
  enable(): void {
    this.isEnabled = true;
  }

  /**
   * Disable event system
   */
  disable(): void {
    this.isEnabled = false;
  }

  /**
   * Check if event system is enabled
   */
  isEventSystemEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Subscribe to specific event type
   */
  subscribe(eventType: TestEventType, handler: EventHandler): EventSubscription {
    if (!this.isEnabled) {
      console.warn('Event system is disabled, subscription will not receive events');
    }
    
    const handlers = this.handlers.get(eventType);
    if (!handlers) {
      throw new Error(`Unknown event type: ${eventType}`);
    }
    
    handlers.push(handler);
    
    return {
      unsubscribe: () => {
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      },
    };
  }

  /**
   * Subscribe to all events
   */
  subscribeToAll(handler: EventHandler): EventSubscription {
    if (!this.isEnabled) {
      console.warn('Event system is disabled, subscription will not receive events');
    }
    
    this.allHandlers.push(handler);
    
    return {
      unsubscribe: () => {
        const index = this.allHandlers.indexOf(handler);
        if (index !== -1) {
          this.allHandlers.splice(index, 1);
        }
      },
    };
  }

  /**
   * Emit an event
   */
  emit(event: TestEvent): void {
    if (!this.isEnabled) {
      return;
    }
    
    // Add timestamp if not present
    if (!event.timestamp) {
      event.timestamp = new Date();
    }
    
    // Add to history
    this.eventHistory.push(event);
    
    // Trim history if needed
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
    
    // Call specific handlers
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      });
    }
    
    // Call all-event handlers
    this.allHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in all-events handler for ${event.type}:`, error);
      }
    });
  }

  /**
   * Create and emit a test case event
   */
  emitTestCaseEvent(
    type: TestEventType.TEST_CASE_CREATED | TestEventType.TEST_CASE_UPDATED | TestEventType.TEST_CASE_DELETED,
    source: string,
    testCase: TestCase,
    previousTestCase?: TestCase
  ): void {
    const event: TestCaseEvent = {
      type,
      timestamp: new Date(),
      source,
      data: { testCase, previousTestCase },
    };
    
    this.emit(event);
  }

  /**
   * Create and emit a test execution event
   */
  emitTestExecutionEvent(
    type: TestEventType.TEST_STARTED | TestEventType.TEST_COMPLETED | TestEventType.TEST_FAILED | TestEventType.TEST_SKIPPED,
    source: string,
    testCaseId: string,
    testResult?: TestResult,
    error?: Error,
    duration?: number
  ): void {
    const event: TestExecutionEvent = {
      type,
      timestamp: new Date(),
      source,
      data: { testCaseId, testResult, error, duration },
    };
    
    this.emit(event);
  }

  /**
   * Create and emit a comparison event
   */
  emitComparisonEvent(
    type: TestEventType.COMPARISON_STARTED | TestEventType.COMPARISON_COMPLETED | TestEventType.COMPARISON_FAILED,
    source: string,
    testCaseId: string,
    testResultId: string,
    comparisonResult?: any,
    error?: Error,
    duration?: number
  ): void {
    const event: ComparisonEvent = {
      type,
      timestamp: new Date(),
      source,
      data: { testCaseId, testResultId, comparisonResult, error, duration },
    };
    
    this.emit(event);
  }

  /**
   * Create and emit a scoring event
   */
  emitScoringEvent(
    type: TestEventType.SCORING_STARTED | TestEventType.SCORING_COMPLETED,
    source: string,
    testCaseId: string,
    consistencyMeasurement?: ConsistencyMeasurement,
    error?: Error,
    duration?: number
  ): void {
    const event: ScoringEvent = {
      type,
      timestamp: new Date(),
      source,
      data: { testCaseId, consistencyMeasurement, error, duration },
    };
    
    this.emit(event);
  }

  /**
   * Create and emit a storage event
   */
  emitStorageEvent(
    type: TestEventType.RESULT_STORED | TestEventType.RESULT_RETRIEVED | TestEventType.STORAGE_CLEARED,
    source: string,
    operation: string,
    itemType: string,
    itemId: string,
    count?: number,
    error?: Error
  ): void {
    const event: StorageEvent = {
      type,
      timestamp: new Date(),
      source,
      data: { operation, itemType, itemId, count, error },
    };
    
    this.emit(event);
  }

  /**
   * Create and emit a system event
   */
  emitSystemEvent(
    type: TestEventType.SYSTEM_STARTED | TestEventType.SYSTEM_STOPPED | TestEventType.ERROR_OCCURRED | TestEventType.WARNING_OCCURRED,
    source: string,
    message: string,
    error?: Error,
    warning?: string
  ): void {
    const event: SystemEvent = {
      type,
      timestamp: new Date(),
      source,
      data: { message, error, warning },
    };
    
    this.emit(event);
  }

  /**
   * Create and emit a multi-run event
   */
  emitMultiRunEvent(
    type: TestEventType.MULTI_RUN_STARTED | TestEventType.MULTI_RUN_COMPLETED | TestEventType.CONSISTENCY_CALCULATED,
    source: string,
    testCaseId: string,
    runCount: number,
    results: TestResult[],
    consistencyMeasurement?: ConsistencyMeasurement,
    error?: Error,
    duration?: number
  ): void {
    const event: MultiRunEvent = {
      type,
      timestamp: new Date(),
      source,
      data: { testCaseId, runCount, results, consistencyMeasurement, error, duration },
    };
    
    this.emit(event);
  }

  /**
   * Get event history
   */
  getEventHistory(filter?: {
    type?: TestEventType;
    source?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): TestEvent[] {
    let events = [...this.eventHistory];
    
    if (filter) {
      if (filter.type) {
        events = events.filter(e => e.type === filter.type);
      }
      
      if (filter.source) {
        events = events.filter(e => e.source === filter.source);
      }
      
      if (filter.startTime) {
        events = events.filter(e => e.timestamp >= filter.startTime!);
      }
      
      if (filter.endTime) {
        events = events.filter(e => e.timestamp <= filter.endTime!);
      }
      
      if (filter.limit) {
        events = events.slice(0, filter.limit);
      }
    }
    
    return events;
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
    eventsBySource: Record<string, number>;
    firstEventTime?: Date;
    lastEventTime?: Date;
  } {
    const stats = {
      totalEvents: this.eventHistory.length,
      eventsByType: {} as Record<string, number>,
      eventsBySource: {} as Record<string, number>,
      firstEventTime: undefined as Date | undefined,
      lastEventTime: undefined as Date | undefined,
    };
    
    if (this.eventHistory.length > 0) {
      stats.firstEventTime = this.eventHistory[0].timestamp;
      stats.lastEventTime = this.eventHistory[this.eventHistory.length - 1].timestamp;
    }
    
    // Count by type
    this.eventHistory.forEach(event => {
      stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;
      stats.eventsBySource[event.source] = (stats.eventsBySource[event.source] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Generate event report
   */
  generateEventReport(): string {
    const stats = this.getEventStatistics();
    
    let report = `# Test Event System Report\n\n`;
    report += `## Event Statistics\n`;
    report += `- Total Events: ${stats.totalEvents}\n`;
    
    if (stats.firstEventTime) {
      report += `- First Event: ${stats.firstEventTime.toISOString()}\n`;
    }
    
    if (stats.lastEventTime) {
      report += `- Last Event: ${stats.lastEventTime.toISOString()}\n`;
    }
    
    report += `\n## Events by Type\n`;
    Object.entries(stats.eventsByType)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        report += `- ${type}: ${count}\n`;
      });
    
    report += `\n## Events by Source\n`;
    Object.entries(stats.eventsBySource)
      .sort(([, a], [, b]) => b - a)
      .forEach(([source, count]) => {
        report += `- ${source}: ${count}\n`;
      });
    
    report += `\n## Recent Events (last 10)\n`;
    const recentEvents = this.getEventHistory({ limit: 10 });
    recentEvents.forEach(event => {
      report += `- [${event.timestamp.toISOString()}] ${event.type} from ${event.source}\n`;
    });
    
    return report;
  }

  /**
   * Set maximum history size
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;
    
    // Trim if needed
    if (this.eventHistory.length > size) {
      this.eventHistory = this.eventHistory.slice(-size);
    }
  }

  /**
   * Get maximum history size
   */
  getMaxHistorySize(): number {
    return this.maxHistorySize;
  }

  /**
   * Remove all handlers
   */
  clearAllHandlers(): void {
    this.handlers.forEach(handlers => {
      handlers.length = 0;
    });
    this.allHandlers.length = 0;
  }

  /**
   * Get handler counts
   */
  getHandlerCounts(): {
    byType: Record<string, number>;
    allHandlers: number;
    total: number;
  } {
    const byType: Record<string, number> = {};
    let total = 0;
    
    this.handlers.forEach((handlers, type) => {
      byType[type] = handlers.length;
      total += handlers.length;
    });
    
    total += this.allHandlers.length;
    
    return {
      byType,
      allHandlers: this.allHandlers.length,
      total,
    };
  }
}

"use strict";
/**
 * Report Validation Engine - Phase 4
 * Validation Event Emitter
 *
 * Event system for validation engine with typed events and listeners.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationEventEmitter = void 0;
/**
 * Validation event emitter class
 */
class ValidationEventEmitter {
    constructor() {
        this.listeners = new Map();
        this.eventHistory = [];
        this.maxHistorySize = 1000;
        this.initializeEventTypes();
    }
    /**
     * Initialize all event types
     */
    initializeEventTypes() {
        const eventTypes = [
            'validation:started',
            'validation:ruleProcessed',
            'validation:complianceChecked',
            'validation:qualityChecked',
            'validation:completenessChecked',
            'validation:consistencyChecked',
            'validation:terminologyChecked',
            'validation:completed',
            'validation:error',
            'validation:storage:stored',
            'validation:storage:retrieved',
            'validation:storage:deleted',
            'validation:rule:added',
            'validation:rule:updated',
            'validation:rule:enabled',
            'validation:rule:disabled',
        ];
        for (const eventType of eventTypes) {
            this.listeners.set(eventType, new Set());
        }
    }
    /**
     * Emit an event
     */
    emit(event, data) {
        const timestamp = new Date();
        // Add to history
        this.eventHistory.push({ event, data, timestamp });
        // Trim history if needed
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
        }
        // Notify listeners
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            // Convert Set to Array to avoid iteration issues
            const listenerArray = Array.from(eventListeners);
            for (const listener of listenerArray) {
                try {
                    listener(event, { ...data, timestamp });
                }
                catch (error) {
                    console.error(`[ValidationEventEmitter] Error in event listener for ${event}:`, error);
                }
            }
        }
        // Also emit to global listeners if any
        const globalListeners = this.listeners.get('*');
        if (globalListeners) {
            const listenerArray = Array.from(globalListeners);
            for (const listener of listenerArray) {
                try {
                    listener(event, { ...data, timestamp });
                }
                catch (error) {
                    console.error(`[ValidationEventEmitter] Error in global listener for ${event}:`, error);
                }
            }
        }
    }
    /**
     * Register an event listener
     */
    on(event, listener) {
        let eventListeners = this.listeners.get(event);
        if (!eventListeners) {
            eventListeners = new Set();
            this.listeners.set(event, eventListeners);
        }
        eventListeners.add(listener);
        // Return unsubscribe function
        return () => {
            this.off(event, listener);
        };
    }
    /**
     * Register a listener for all events
     */
    onAll(listener) {
        return this.on('*', listener);
    }
    /**
     * Remove an event listener
     */
    off(event, listener) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(listener);
        }
    }
    /**
     * Remove all listeners for an event
     */
    offAll(event) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.clear();
        }
    }
    /**
     * Remove all listeners
     */
    clearAllListeners() {
        this.listeners.clear();
        this.initializeEventTypes();
    }
    /**
     * Get listener count for an event
     */
    getListenerCount(event) {
        const eventListeners = this.listeners.get(event);
        return eventListeners ? eventListeners.size : 0;
    }
    /**
     * Get total listener count
     */
    getTotalListenerCount() {
        let total = 0;
        for (const listeners of Array.from(this.listeners.values())) {
            total += listeners.size;
        }
        return total;
    }
    /**
     * Get event history
     */
    getEventHistory(limit) {
        if (limit && limit > 0) {
            return this.eventHistory.slice(-limit);
        }
        return [...this.eventHistory];
    }
    /**
     * Clear event history
     */
    clearEventHistory() {
        this.eventHistory = [];
    }
    /**
     * Emit validation started event
     */
    emitValidationStarted(data) {
        this.emit('validation:started', data);
    }
    /**
     * Emit rule processed event
     */
    emitRuleProcessed(data) {
        this.emit('validation:ruleProcessed', data);
    }
    /**
     * Emit validation completed event
     */
    emitValidationCompleted(data) {
        this.emit('validation:completed', data);
    }
    /**
     * Emit validation error event
     */
    emitValidationError(data) {
        this.emit('validation:error', data);
    }
    /**
     * Emit storage event
     */
    emitStorageEvent(operation, resultId) {
        this.emit(`validation:storage:${operation}`, {
            resultId,
            operation,
            timestamp: new Date(),
        });
    }
    /**
     * Emit rule event
     */
    emitRuleEvent(operation, ruleId, ruleName, ruleType, enabled) {
        this.emit(`validation:rule:${operation}`, {
            ruleId,
            ruleName,
            ruleType,
            enabled,
            timestamp: new Date(),
        });
    }
    /**
     * Create a validation started event data object
     */
    createValidationStartedData(validationResultId, schemaMappingResultId, reportTypeId) {
        return {
            validationResultId,
            schemaMappingResultId,
            reportTypeId,
            timestamp: new Date(),
        };
    }
    /**
     * Create a rule processed event data object
     */
    createRuleProcessedData(validationResultId, rule, passed, processingTimeMs) {
        return {
            validationResultId,
            ruleId: rule.id,
            ruleName: rule.name,
            ruleType: rule.type,
            passed,
            severity: rule.severity,
            processingTimeMs,
        };
    }
    /**
     * Create a validation completed event data object
     */
    createValidationCompletedData(validationResult) {
        return {
            validationResultId: validationResult.id,
            overallScore: validationResult.scores.overallScore,
            findingsCount: validationResult.findings.length,
            complianceViolationsCount: validationResult.complianceViolations.length,
            qualityIssuesCount: validationResult.qualityIssues.length,
            processingTimeMs: validationResult.processingTimeMs,
            timestamp: validationResult.validatedAt,
        };
    }
    /**
     * Create a validation error event data object
     */
    createValidationErrorData(error, validationResultId, schemaMappingResultId) {
        return {
            validationResultId,
            schemaMappingResultId,
            error: error instanceof Error ? error.message : String(error),
            stackTrace: error instanceof Error ? error.stack : undefined,
            timestamp: new Date(),
        };
    }
    /**
     * Get event statistics
     */
    getEventStats() {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        const eventsByType = {};
        let eventsLastMinute = 0;
        let lastEventTime = null;
        for (const eventRecord of this.eventHistory) {
            // Count by type
            eventsByType[eventRecord.event] = (eventsByType[eventRecord.event] || 0) + 1;
            // Count events in last minute
            if (eventRecord.timestamp > oneMinuteAgo) {
                eventsLastMinute++;
            }
            // Track last event time
            if (!lastEventTime || eventRecord.timestamp > lastEventTime) {
                lastEventTime = eventRecord.timestamp;
            }
        }
        return {
            totalEvents: this.eventHistory.length,
            eventsByType,
            eventsPerMinute: eventsLastMinute,
            lastEventTime,
        };
    }
    /**
     * Check if there are any listeners for an event
     */
    hasListeners(event) {
        const eventListeners = this.listeners.get(event);
        return !!eventListeners && eventListeners.size > 0;
    }
    /**
     * Wait for a specific event
     */
    waitForEvent(event, timeoutMs = 5000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.off(event, eventHandler);
                reject(new Error(`Timeout waiting for event: ${event}`));
            }, timeoutMs);
            const eventHandler = (eventType, data) => {
                clearTimeout(timeoutId);
                this.off(event, eventHandler);
                resolve(data);
            };
            this.on(event, eventHandler);
        });
    }
}
exports.ValidationEventEmitter = ValidationEventEmitter;

// Core utility functions for sync queue database
// Extracted from syncQueueDatabase.ts for Layer 1 purity

// Generate queue item ID
export function generateQueueId(): string {
  return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
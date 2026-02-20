/**
 * CRDT Timestamp implementation using Lamport Clocks
 * 
 * Lamport timestamps provide a partial ordering of events in a distributed system.
 * Each site maintains a counter that increases with each operation.
 */

import type { CrdtTimestamp } from '../types';

/**
 * Generate a new timestamp for an operation
 */
export function generateTimestamp(siteId: string, currentCounter: number): CrdtTimestamp {
  return {
    counter: currentCounter + 1,
    siteId
  };
}

/**
 * Compare two timestamps for ordering
 * Returns:
 * - -1 if timestamp1 < timestamp2
 * - 0 if timestamp1 == timestamp2  
 * - 1 if timestamp1 > timestamp2
 * - null if concurrent (cannot be ordered)
 */
export function compareTimestamps(
  timestamp1: CrdtTimestamp,
  timestamp2: CrdtTimestamp
): -1 | 0 | 1 | null {
  if (timestamp1.counter < timestamp2.counter) {
    return -1;
  }
  
  if (timestamp1.counter > timestamp2.counter) {
    return 1;
  }
  
  // Counters are equal, compare site IDs
  if (timestamp1.siteId < timestamp2.siteId) {
    return -1;
  }
  
  if (timestamp1.siteId > timestamp2.siteId) {
    return 1;
  }
  
  // Same counter and site ID
  return 0;
}

/**
 * Check if two timestamps are concurrent (cannot be ordered)
 */
export function areTimestampsConcurrent(
  timestamp1: CrdtTimestamp,
  timestamp2: CrdtTimestamp
): boolean {
  const comparison = compareTimestamps(timestamp1, timestamp2);
  return comparison === null;
}

/**
 * Update a timestamp based on another timestamp (Lamport clock update rule)
 * When receiving a timestamp from another site, update local counter to max(local, remote) + 1
 */
export function updateTimestamp(
  localTimestamp: CrdtTimestamp,
  remoteTimestamp: CrdtTimestamp
): CrdtTimestamp {
  const maxCounter = Math.max(localTimestamp.counter, remoteTimestamp.counter);
  return {
    counter: maxCounter + 1,
    siteId: localTimestamp.siteId
  };
}

/**
 * Create a timestamp from a string representation
 */
export function parseTimestamp(timestampStr: string): CrdtTimestamp {
  const [counterStr, siteId] = timestampStr.split(':');
  return {
    counter: parseInt(counterStr, 10),
    siteId
  };
}

/**
 * Convert a timestamp to a string representation
 */
export function timestampToString(timestamp: CrdtTimestamp): string {
  return `${timestamp.counter}:${timestamp.siteId}`;
}

/**
 * Generate a unique operation ID using timestamp
 */
export function generateOperationId(timestamp: CrdtTimestamp): string {
  return `op_${timestamp.counter}_${timestamp.siteId}`;
}

/**
 * Timestamp utilities for version vectors
 */
export class TimestampUtils {
  /**
   * Merge two version vectors (take the maximum counter for each site)
   */
  static mergeVersionVectors(
    vector1: Map<string, number>,
    vector2: Map<string, number>
  ): Map<string, number> {
    const merged = new Map(vector1);
    
    for (const [siteId, counter] of vector2) {
      const existing = merged.get(siteId);
      if (existing === undefined || counter > existing) {
        merged.set(siteId, counter);
      }
    }
    
    return merged;
  }
  
  /**
   * Check if version vector1 causally precedes vector2
   * vector1 ≤ vector2 if for all sites, vector1[site] ≤ vector2[site]
   */
  static causallyPrecedes(
    vector1: Map<string, number>,
    vector2: Map<string, number>
  ): boolean {
    for (const [siteId, counter] of vector1) {
      const counter2 = vector2.get(siteId);
      if (counter2 === undefined || counter > counter2) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Get the maximum counter for a site across multiple timestamps
   */
  static getMaxCounter(timestamps: CrdtTimestamp[], siteId: string): number {
    let max = 0;
    for (const timestamp of timestamps) {
      if (timestamp.siteId === siteId && timestamp.counter > max) {
        max = timestamp.counter;
      }
    }
    return max;
  }
}
// General utility functions for the multi-device editor
// Phase 18 - Helpers Module v1.0

import type { 
  Document, 
  EditorOperation, 
  DeviceCapabilities,
  ScreenSizeCategory,
  NetworkType,
  StorageBackend,
  Result,
  AsyncResult
} from '../types';

/**
 * Generate a unique ID with optional prefix
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  const id = `${timestamp}${random}`;
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Generate a device ID that persists across sessions
 */
export function generateDeviceId(): string {
  // Try to get existing device ID from localStorage
  const storageKey = 'multi_device_editor_device_id';
  const existingId = typeof localStorage !== 'undefined' 
    ? localStorage.getItem(storageKey)
    : null;

  if (existingId) {
    return existingId;
  }

  // Generate new device ID
  const deviceId = `device_${generateId()}`;
  
  // Store in localStorage if available
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(storageKey, deviceId);
    } catch {
      // Storage may be full or not available
    }
  }

  return deviceId;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }

  if (typeof obj === 'object') {
    const cloned: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone((obj as Record<string, any>)[key]);
      }
    }
    return cloned as T;
  }

  return obj;
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = deepClone(target);

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
        result[key] = [...targetValue, ...sourceValue] as T[Extract<keyof T, string>];
      } else if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Check if value is a plain object
 */
export function isPlainObject(value: any): value is Record<string, any> {
  return value !== null && 
         typeof value === 'object' && 
         !Array.isArray(value) && 
         !(value instanceof Date) &&
         !(value instanceof RegExp);
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function(this: any, ...args: Parameters<T>) {
    const context = this;

    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };

    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function(this: any, ...args: Parameters<T>) {
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Calculate screen size category based on width
 */
export function getScreenSizeCategory(width: number): ScreenSizeCategory {
  if (width < 576) return 'xs';
  if (width < 768) return 'sm';
  if (width < 992) return 'md';
  if (width < 1200) return 'lg';
  if (width < 1400) return 'xl';
  return 'xxl';
}

/**
 * Detect network type based on connection API
 */
export function detectNetworkType(): NetworkType {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }

  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;

  if (!connection) {
    return 'unknown';
  }

  return connection.type || 'unknown';
}

/**
 * Check if browser supports specific storage backend
 */
export function supportsStorageBackend(backend: StorageBackend): boolean {
  switch (backend) {
    case 'localStorage':
      return typeof localStorage !== 'undefined';
    case 'indexedDB':
      return typeof indexedDB !== 'undefined';
    case 'supabase':
      return typeof fetch !== 'undefined';
    case 'memory':
      return true;
    case 'fileSystem':
      return 'showOpenFilePicker' in window || 'showSaveFilePicker' in window;
    default:
      return false;
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculate document size in bytes
 */
export function calculateDocumentSize(document: Document): number {
  const contentSize = new Blob([document.content]).size;
  const metadataSize = new Blob([JSON.stringify(document.metadata)]).size;
  const overhead = 100; // Approximate overhead for IDs, dates, etc.
  
  return contentSize + metadataSize + overhead;
}

/**
 * Validate editor operation
 */
export function validateOperation(operation: EditorOperation): Result<EditorOperation, Error> {
  const errors: string[] = [];

  if (!operation.id || typeof operation.id !== 'string') {
    errors.push('Operation ID is required and must be a string');
  }

  if (!operation.type || typeof operation.type !== 'string') {
    errors.push('Operation type is required');
  }

  if (typeof operation.position !== 'number' || operation.position < 0) {
    errors.push('Position must be a non-negative number');
  }

  if (typeof operation.content !== 'string') {
    errors.push('Content must be a string');
  }

  if (typeof operation.timestamp !== 'number' || operation.timestamp <= 0) {
    errors.push('Timestamp must be a positive number');
  }

  if (!operation.deviceId || typeof operation.deviceId !== 'string') {
    errors.push('Device ID is required');
  }

  if (!operation.documentId || typeof operation.documentId !== 'string') {
    errors.push('Document ID is required');
  }

  if (typeof operation.version !== 'number' || operation.version < 0) {
    errors.push('Version must be a non-negative number');
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: new Error(`Invalid operation: ${errors.join(', ')}`),
    };
  }

  return { success: true, data: operation };
}

/**
 * Compare two operations for equality
 */
export function operationsEqual(op1: EditorOperation, op2: EditorOperation): boolean {
  return (
    op1.id === op2.id &&
    op1.type === op2.type &&
    op1.position === op2.position &&
    op1.content === op2.content &&
    op1.timestamp === op2.timestamp &&
    op1.deviceId === op2.deviceId &&
    op1.documentId === op2.documentId &&
    op1.version === op2.version
  );
}

/**
 * Calculate operation hash for quick comparison
 */
export function calculateOperationHash(operation: EditorOperation): string {
  const data = `${operation.id}:${operation.type}:${operation.position}:${operation.content}:${operation.timestamp}:${operation.deviceId}:${operation.documentId}:${operation.version}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    shouldRetry = () => true,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError;
      }

      // Wait with exponential backoff
      await sleep(delay);
      delay = Math.min(delay * 2, maxDelay);
    }
  }

  throw lastError!;
}

/**
 * Create a promise that can be resolved/rejected externally
 */
export function createDeferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
} {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

/**
 * Measure execution time of a function
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T> | T,
  label?: string
): Promise<{ result: T; time: number }> {
  const start = performance.now();
  const result = await (typeof fn === 'function' ? fn() : fn);
  const end = performance.now();
  const time = end - start;

  if (label) {
    console.debug(`Execution time for ${label}: ${time.toFixed(2)}ms`);
  }

  return { result, time };
}

/**
 * Generate a random color for device visualization
 */
export function generateDeviceColor(deviceId: string): string {
  // Simple deterministic color generation based on device ID
  let hash = 0;
  for (let i = 0; i < deviceId.length; i++) {
    hash = deviceId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
}

/**
 * Check if two arrays are equal
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  
  return true;
}

/**
 * Remove duplicates from array while preserving order
 */
export function unique<T>(array: T[]): T[] {
  const seen = new Set<T>();
  const result: T[] = [];
  
  for (const item of array) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  
  return result;
}

/**
 * Group array items by key
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

/**
 * Create a memoized version of a function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = keyFn 
      ? keyFn(...args)
      : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  } as T;
}

/**
 * Check if running in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if running in a Node.js environment
 */
export function isNode(): boolean {
  return typeof process !== 'undefined' && 
         process.versions != null && 
         process.versions.node != null;
}

/**
 * Get current timestamp in milliseconds
 */
export function getTimestamp(): number {
  return Date.now();
}

/**
 * Format timestamp as ISO string with milliseconds
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Parse ISO timestamp to milliseconds
 */
export function parseTimestamp(isoString: string): number {
  return new Date(isoString).getTime();
}
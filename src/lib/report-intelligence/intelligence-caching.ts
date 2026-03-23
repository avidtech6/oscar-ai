/**
 * Intelligence Caching interfaces
 * 
 * Defines the interfaces for PHASE_19: Report Intelligence Caching
 */
export interface CacheConfig {
  /**
   * Cache maximum size
   */
  maxSize: number;

  /**
   * Cache expiration time
   */
  ttl: number; // in seconds

  /**
   * Cache cleanup interval
   */
  cleanupInterval: number; // in seconds

  /**
   * Cache compression enabled
   */
  compression: boolean;

  /**
   * Cache encryption enabled
   */
  encryption: boolean;

  /**
   * Cache persistence enabled
   */
  persistence: boolean;

  /**
   * Cache storage type
   */
  storage: 'memory' | 'disk' | 'distributed';
}

export interface CacheEntry<T = any> {
  /**
   * Key
   */
  key: string;

  /**
   * Value
   */
  value: T;

  /**
   * Expiration timestamp
   */
  expiresAt: number; // timestamp in milliseconds

  /**
   * Last accessed timestamp
   */
  lastAccessed: number; // timestamp in milliseconds

  /**
   * Access count
   */
  accessCount: number;

  /**
   * Size in bytes
   */
  size: number;

  /**
   * Metadata
   */
  metadata: {
    createdAt: string;
    updatedAt: string;
    tags: string[];
  };
}

export interface CacheStats {
  /**
   * Total entries
   */
  totalEntries: number;

  /**
   * Total size
   */
  totalSize: number;

  /**
   * Hit count
   */
  hitCount: number;

  /**
   * Miss count
   */
  missCount: number;

  /**
   * Hit rate
   */
  hitRate: number;

  /**
   * Eviction count
   */
  evictionCount: number;

  /**
   * Expiration count
   */
  expirationCount: number;

  /**
   * Error count
   */
  errorCount: number;

  /**
   * Last updated
   */
  lastUpdated: string;
}

export interface CachePolicy {
  /**
   * Policy name
   */
  name: string;

  /**
   * Policy type
   */
  type: 'lru' | 'lfu' | 'fifo' | 'ttl' | 'custom';

  /**
   * Policy configuration
   */
  config: Record<string, any>;

  /**
   * Policy priority
   */
  priority: number;

  /**
   * Policy enabled
   */
  enabled: boolean;
}

export interface CacheEvent {
  /**
   * Event ID
   */
  eventId: string;

  /**
   * Event type
   */
  type: 'hit' | 'miss' | 'set' | 'delete' | 'expire' | 'evict' | 'error';

  /**
   * Event key
   */
  key: string;

  /**
   * Event timestamp
   */
  timestamp: string;

  /**
   * Event metadata
   */
  metadata: {
    value?: any;
    error?: string;
    size?: number;
    duration?: number;
  };
}

export interface CacheMetrics {
  /**
   * Metric name
   */
  name: string;

  /**
   * Metric value
   */
  value: number;

  /**
   * Metric timestamp
   */
  timestamp: string;

  /**
   * Metric tags
   */
  tags: Record<string, string>;
}

/**
 * Intelligence Caching class
 * 
 * Implements PHASE_19: Report Intelligence Caching from the Phase Compliance Package.
 * Provides comprehensive caching capabilities for the Report Intelligence System.
 */
export class IntelligenceCaching {
  /**
   * Cache storage
   */
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * Cache configuration
   */
  private config: CacheConfig;

  /**
   * Cache statistics
   */
  private stats: CacheStats = {
    totalEntries: 0,
    totalSize: 0,
    hitCount: 0,
    missCount: 0,
    hitRate: 0,
    evictionCount: 0,
    expirationCount: 0,
    errorCount: 0,
    lastUpdated: new Date().toISOString()
  };

  /**
   * Cache policies
   */
  private policies: Map<string, CachePolicy> = new Map();

  /**
   * Cache events
   */
  private events: CacheEvent[] = [];

  /**
   * Cache metrics
   */
  private metrics: CacheMetrics[] = [];

  /**
   * Cleanup timer
   */
  private cleanupTimer: NodeJS.Timeout | null = null;

  /**
   * Metrics timer
   */
  private metricsTimer: NodeJS.Timeout | null = null;

  /**
   * Event handlers
   */
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * Initialize the Intelligence Caching system
   */
  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      ttl: 3600, // 1 hour
      cleanupInterval: 300, // 5 minutes
      compression: true,
      encryption: false,
      persistence: false,
      storage: 'memory',
      ...config
    };

    this.initializeDefaultPolicies();
    this.startCleanupTimer();
    this.startMetricsCollection();
  }

  /**
   * Set a value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param options - Cache options
   * @returns Success status
   */
  set<T>(key: string, value: T, options?: {
    ttl?: number;
    tags?: string[];
    size?: number;
  }): boolean {
    try {
      // Check if cache is full
      if (this.cache.size >= this.config.maxSize) {
        this.evictEntries();
      }

      // Calculate size
      const size = options?.size ?? this.calculateSize(value);

      // Create cache entry
      const entry: CacheEntry<T> = {
        key,
        value,
        expiresAt: Date.now() + (options?.ttl ?? this.config.ttl) * 1000,
        lastAccessed: Date.now(),
        accessCount: 0,
        size,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: options?.tags ?? []
        }
      };

      // Store entry
      this.cache.set(key, entry);

      // Update stats
      this.stats.totalEntries++;
      this.stats.totalSize += size;
      this.updateStats();

      // Emit event
      this.emitEvent('set', key, { value, size });

      return true;
    } catch (error) {
      this.stats.errorCount++;
      this.updateStats();
      this.emitEvent('error', key, { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  /**
   * Get a value from cache
   * @param key - Cache key
   * @returns Cached value or undefined
   */
  get<T>(key: string): T | undefined {
    try {
      const entry = this.cache.get(key);
      if (!entry) {
        this.stats.missCount++;
        this.updateStats();
        this.emitEvent('miss', key);
        return undefined;
      }

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        this.delete(key);
        this.stats.expirationCount++;
        this.updateStats();
        this.emitEvent('expire', key);
        return undefined;
      }

      // Update entry stats
      entry.lastAccessed = Date.now();
      entry.accessCount++;

      this.stats.hitCount++;
      this.updateStats();
      this.emitEvent('hit', key, { value: entry.value, size: entry.size });

      return entry.value;
    } catch (error) {
      this.stats.errorCount++;
      this.updateStats();
      this.emitEvent('error', key, { error: error instanceof Error ? error.message : 'Unknown error' });
      return undefined;
    }
  }

  /**
   * Delete a value from cache
   * @param key - Cache key
   * @returns Success status
   */
  delete(key: string): boolean {
    try {
      const entry = this.cache.get(key);
      if (!entry) {
        return false;
      }

      this.cache.delete(key);
      this.stats.totalEntries--;
      this.stats.totalSize -= entry.size;
      this.updateStats();

      this.emitEvent('delete', key, { value: entry.value, size: entry.size });
      return true;
    } catch (error) {
      this.stats.errorCount++;
      this.updateStats();
      this.emitEvent('error', key, { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  /**
   * Check if a key exists in cache
   * @param key - Cache key
   * @returns Whether the key exists
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get all keys in cache
   * @returns Array of cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values in cache
   * @returns Array of cached values
   */
  values<T = any>(): T[] {
    return Array.from(this.cache.values()).map(entry => entry.value);
  }

  /**
   * Clear the cache
   */
  clear(): void {
    const entries = Array.from(this.cache.values());
    this.cache.clear();
    
    this.stats.totalEntries = 0;
    this.stats.totalSize = 0;
    this.updateStats();

    // Emit individual delete events for each entry
    for (const entry of entries) {
      this.emitEvent('delete', entry.key, { value: entry.value, size: entry.size });
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Get cache entry
   * @param key - Cache key
   * @returns Cache entry or undefined
   */
  getEntry(key: string): CacheEntry | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return undefined;
    }

    return entry;
  }

  /**
   * Get cache entries by tag
   * @param tag - Tag to filter by
   * @returns Array of cache entries
   */
  getEntriesByTag(tag: string): CacheEntry[] {
    return Array.from(this.cache.values()).filter(entry => 
      entry.metadata.tags.includes(tag)
    );
  }

  /**
   * Set cache policy
   * @param policy - Cache policy to set
   * @returns Success status
   */
  setPolicy(policy: CachePolicy): boolean {
    this.policies.set(policy.name, policy);
    return true;
  }

  /**
   * Get cache policy
   * @param name - Policy name
   * @returns Cache policy or undefined
   */
  getPolicy(name: string): CachePolicy | undefined {
    return this.policies.get(name);
  }

  /**
   * Get all cache policies
   * @returns Array of cache policies
   */
  getPolicies(): CachePolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Delete cache policy
   * @param name - Policy name
   * @returns Success status
   */
  deletePolicy(name: string): boolean {
    return this.policies.delete(name);
  }

  /**
   * Evict entries based on policies
   */
  private evictEntries(): void {
    const enabledPolicies = Array.from(this.policies.values()).filter(p => p.enabled);
    enabledPolicies.sort((a, b) => b.priority - a.priority);

    for (const policy of enabledPolicies) {
      if (this.cache.size < this.config.maxSize) {
        break;
      }

      switch (policy.type) {
        case 'lru':
          this.evictLRU();
          break;
        case 'lfu':
          this.evictLFU();
          break;
        case 'fifo':
          this.evictFIFO();
          break;
        case 'ttl':
          this.evictTTL();
          break;
        case 'custom':
          this.evictCustom(policy.config);
          break;
      }

      this.stats.evictionCount++;
    }

    this.updateStats();
  }

  /**
   * Evict least recently used entries
   */
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    this.cache.forEach((entry, key) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      if (entry) {
        this.stats.totalSize -= entry.size;
        this.cache.delete(oldestKey);
        this.emitEvent('evict', oldestKey, { value: entry.value, size: entry.size });
      }
    }
  }

  /**
   * Evict least frequently used entries
   */
  private evictLFU(): void {
    let leastUsedKey = '';
    let leastUsedCount = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.accessCount < leastUsedCount) {
        leastUsedCount = entry.accessCount;
        leastUsedKey = key;
      }
    });

    if (leastUsedKey) {
      const entry = this.cache.get(leastUsedKey);
      if (entry) {
        this.stats.totalSize -= entry.size;
        this.cache.delete(leastUsedKey);
        this.emitEvent('evict', leastUsedKey, { value: entry.value, size: entry.size });
      }
    }
  }

  /**
   * Evict first in first out entries
   */
  private evictFIFO(): void {
    let oldestKey = '';
    let oldestTimestamp = Infinity;

    this.cache.forEach((entry, key) => {
      const entryTime = new Date(entry.metadata.createdAt).getTime();
      if (entryTime < oldestTimestamp) {
        oldestTimestamp = entryTime;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      if (entry) {
        this.stats.totalSize -= entry.size;
        this.cache.delete(oldestKey);
        this.emitEvent('evict', oldestKey, { value: entry.value, size: entry.size });
      }
    }
  }

  /**
   * Evict entries that are about to expire
   */
  private evictTTL(): void {
    const now = Date.now();
    const entriesToEvict: Array<{ key: string; entry: CacheEntry }> = [];

    this.cache.forEach((entry, key) => {
      if (entry.expiresAt - now < this.config.ttl * 1000 * 0.1) { // Evict entries that are 10% from expiration
        entriesToEvict.push({ key, entry });
      }
    });

    for (const { key, entry } of entriesToEvict) {
      this.stats.totalSize -= entry.size;
      this.cache.delete(key);
      this.emitEvent('evict', key, { value: entry.value, size: entry.size });
    }
  }

  /**
   * Evict entries based on custom policy
   * @param config - Custom policy configuration
   */
  private evictCustom(config: Record<string, any>): void {
    // Placeholder for custom eviction logic
    // In a real implementation, this would use the custom policy configuration
    this.evictLRU(); // Default to LRU
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.config.cleanupInterval * 1000);
  }

  /**
   * Cleanup expired entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    });

    for (const key of expiredKeys) {
      const entry = this.cache.get(key);
      if (entry) {
        this.stats.totalSize -= entry.size;
        this.cache.delete(key);
        this.stats.expirationCount++;
        this.emitEvent('expire', key, { value: entry.value, size: entry.size });
      }
    }

    this.updateStats();
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsTimer = setInterval(() => {
      this.collectMetrics();
    }, 60000); // Collect metrics every minute
  }

  /**
   * Collect cache metrics
   */
  private collectMetrics(): void {
    const metric: CacheMetrics = {
      name: 'cache_size',
      value: this.cache.size,
      timestamp: new Date().toISOString(),
      tags: {
        storage: this.config.storage,
        compression: this.config.compression.toString(),
        encryption: this.config.encryption.toString()
      }
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    this.emit('metricsEvent', metric);
  }

  /**
   * Calculate size of a value
   * @param value - Value to calculate size for
   * @returns Size in bytes
   */
  private calculateSize(value: any): number {
    try {
      const json = JSON.stringify(value);
      return new Blob([json]).size;
    } catch {
      return 0;
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.lastUpdated = new Date().toISOString();
    
    // Calculate hit rate
    const totalRequests = this.stats.hitCount + this.stats.missCount;
    this.stats.hitRate = totalRequests > 0 ? this.stats.hitCount / totalRequests : 0;
  }

  /**
   * Emit cache event
   * @param type - Event type
   * @param key - Event key
   * @param metadata - Event metadata
   */
  private emitEvent(type: CacheEvent['type'], key: string, metadata?: CacheEvent['metadata']): void {
    const event: CacheEvent = {
      eventId: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      key,
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    };

    this.events.push(event);

    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    this.emit('cacheEvent', event);
  }

  /**
   * Add event handler
   * @param event - Event name
   * @param handler - Event handler function
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Remove event handler
   * @param event - Event name
   * @param handler - Event handler function to remove
   */
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   * @param event - Event name
   * @param data - Event data
   */
  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Initialize default policies
   */
  private initializeDefaultPolicies(): void {
    // Default LRU policy
    this.setPolicy({
      name: 'default-lru',
      type: 'lru',
      config: {},
      priority: 1,
      enabled: true
    });

    // Default TTL policy
    this.setPolicy({
      name: 'default-ttl',
      type: 'ttl',
      config: { threshold: 0.1 },
      priority: 2,
      enabled: true
    });
  }

  /**
   * Get cache events
   * @param filters - Event filters
   * @returns Array of cache events
   */
  getEvents(filters?: {
    type?: CacheEvent['type'];
    key?: string;
    startDate?: string;
    endDate?: string;
  }): CacheEvent[] {
    let events = [...this.events];

    if (filters) {
      if (filters.type) {
        events = events.filter(event => event.type === filters.type);
      }
      if (filters.key) {
        events = events.filter(event => event.key === filters.key);
      }
      if (filters.startDate) {
        events = events.filter(event => event.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        events = events.filter(event => event.timestamp <= filters.endDate!);
      }
    }

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get cache metrics
   * @param filters - Metric filters
   * @returns Array of cache metrics
   */
  getMetrics(filters?: {
    name?: string;
    startDate?: string;
    endDate?: string;
    tags?: Record<string, string>;
  }): CacheMetrics[] {
    let metrics = [...this.metrics];

    if (filters) {
      if (filters.name) {
        metrics = metrics.filter(metric => metric.name === filters.name);
      }
      if (filters.startDate) {
        metrics = metrics.filter(metric => metric.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        metrics = metrics.filter(metric => metric.timestamp <= filters.endDate!);
      }
      if (filters.tags) {
        metrics = metrics.filter(metric => {
          return Object.keys(filters.tags!).every(key => 
            metric.tags[key] === filters.tags![key]
          );
        });
      }
    }

    return metrics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Destroy the cache
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }

    this.clear();
    this.policies.clear();
    this.events = [];
    this.metrics = [];
    this.eventHandlers.clear();
  }
}
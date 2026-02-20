/**
 * Phase 17: Content Intelligence & Blog Post Engine
 * Scheduling Engine - Optimization
 * 
 * Schedule optimization algorithms and conflict resolution.
 */

import type {
  ScheduleItem,
  ScheduleConfig,
  ScheduleItemType,
  ScheduleOptimizationResult,
  DayOfWeek,
  TimeOfDay
} from './types';

/**
 * Schedule Optimizer
 */
export class ScheduleOptimizer {
  constructor(private config: ScheduleConfig) {}

  /**
   * Optimize schedule items
   */
  public optimizeSchedule(items: ScheduleItem[]): ScheduleOptimizationResult {
    // Create a copy for optimization
    const optimizedItems = [...items.map(item => ({ ...item }))];
    
    const changes: ScheduleOptimizationResult['changes'] = [];
    
    // Apply optimization rules in order of importance
    if (this.config.optimization.respectDependencies) {
      this.enforceDependencies(optimizedItems, changes);
    }
    
    if (this.config.optimization.avoidConflicts) {
      this.resolveConflicts(optimizedItems, changes);
    }
    
    if (this.config.optimization.preferOptimalTimes) {
      this.optimizeForOptimalTimes(optimizedItems, changes);
    }
    
    if (this.config.optimization.groupSimilarItems) {
      this.groupSimilarItems(optimizedItems, changes);
    }
    
    // Calculate metrics
    const metrics = this.calculateOptimizationMetrics(items, optimizedItems);
    
    return {
      originalSchedule: items,
      optimizedSchedule: optimizedItems,
      changes,
      metrics
    };
  }

  /**
   * Enforce dependencies
   */
  private enforceDependencies(items: ScheduleItem[], changes: any[]): void {
    // Sort by scheduled time to process in order
    items.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    
    // Track items that have been moved to avoid infinite loops
    const movedItems = new Set<string>();
    let iterations = 0;
    const maxIterations = items.length * 2;
    
    while (iterations < maxIterations) {
      let madeChanges = false;
      
      for (const item of items) {
        if (item.dependsOn && item.dependsOn.length > 0) {
          for (const depId of item.dependsOn) {
            const dependency = items.find(i => i.id === depId);
            if (dependency && dependency.scheduledFor >= item.scheduledFor) {
              // Dependency is scheduled at same time or after item
              const originalTime = new Date(item.scheduledFor);
              item.scheduledFor = new Date(dependency.scheduledFor.getTime() + this.config.bufferTime * 60000);
              
              changes.push({
                itemId: item.id,
                change: 'time-changed',
                originalTime,
                newTime: item.scheduledFor,
                reason: `Moved after dependency "${dependency.title}"`
              });
              
              movedItems.add(item.id);
              madeChanges = true;
            }
          }
        }
      }
      
      if (!madeChanges) {
        break;
      }
      
      iterations++;
    }
  }

  /**
   * Resolve time conflicts
   */
  private resolveConflicts(items: ScheduleItem[], changes: any[]): void {
    // Sort by priority (higher priority first) and then by time
    items.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.scheduledFor.getTime() - b.scheduledFor.getTime();
    });
    
    // Resolve conflicts by moving lower priority items
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const itemA = items[i];
        const itemB = items[j];
        
        const aStart = itemA.scheduledFor;
        const aEnd = this.calculateItemEnd(itemA);
        const bStart = itemB.scheduledFor;
        const bEnd = this.calculateItemEnd(itemB);
        
        if (aStart < bEnd && aEnd > bStart) {
          // Conflict detected
          // Move lower priority item (itemB) later
          const originalTime = new Date(itemB.scheduledFor);
          itemB.scheduledFor = new Date(aEnd.getTime() + this.config.bufferTime * 60000);
          
          changes.push({
            itemId: itemB.id,
            change: 'time-changed',
            originalTime,
            newTime: itemB.scheduledFor,
            reason: `Resolved time conflict with higher priority item "${itemA.title}"`
          });
        }
      }
    }
  }

  /**
   * Optimize for optimal times
   */
  private optimizeForOptimalTimes(items: ScheduleItem[], changes: any[]): void {
    items.forEach(item => {
      const optimalTime = this.getOptimalTimeForType(item.type);
      if (optimalTime && !this.isOptimalTime(item.scheduledFor, optimalTime)) {
        const originalTime = new Date(item.scheduledFor);
        item.scheduledFor = this.adjustToOptimalTime(item.scheduledFor, optimalTime);
        
        changes.push({
          itemId: item.id,
          change: 'time-changed',
          originalTime,
          newTime: item.scheduledFor,
          reason: `Moved to optimal time for ${item.type}`
        });
      }
    });
  }

  /**
   * Group similar items
   */
  private groupSimilarItems(items: ScheduleItem[], changes: any[]): void {
    // Group by type and platform
    const groups = new Map<string, ScheduleItem[]>();
    
    items.forEach(item => {
      const groupKey = `${item.type}-${item.publishTo?.join(',') || 'none'}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(item);
    });
    
    // For each group, try to cluster items
    groups.forEach((groupItems, groupKey) => {
      if (groupItems.length <= 1) return;
      
      // Sort by time
      groupItems.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
      
      // Use hierarchical clustering to group items
      const clusters = this.clusterItems(groupItems, 60 * 60 * 1000); // 1 hour threshold
      
      // For each cluster, move items to cluster centroid
      clusters.forEach(cluster => {
        if (cluster.length <= 1) return;
        
        // Calculate cluster centroid (average time)
        const totalTime = cluster.reduce((sum, item) => sum + item.scheduledFor.getTime(), 0);
        const centroidTime = new Date(totalTime / cluster.length);
        
        // Move all items to centroid
        cluster.forEach(item => {
          if (item.scheduledFor.getTime() !== centroidTime.getTime()) {
            const originalTime = new Date(item.scheduledFor);
            item.scheduledFor = new Date(centroidTime);
            
            changes.push({
              itemId: item.id,
              change: 'time-changed',
              originalTime,
              newTime: item.scheduledFor,
              reason: `Grouped with ${cluster.length - 1} similar items`
            });
          }
        });
      });
    });
  }

  /**
   * Calculate optimization metrics
   */
  private calculateOptimizationMetrics(original: ScheduleItem[], optimized: ScheduleItem[]): any {
    return {
      totalDuration: this.calculateTotalDuration(optimized),
      concurrentReduction: this.calculateConcurrentReduction(original, optimized),
      bufferTimeUtilization: this.calculateBufferUtilization(optimized),
      dependencySatisfaction: this.calculateDependencySatisfaction(optimized),
      optimalTimeAlignment: this.calculateOptimalTimeAlignment(optimized),
      makespan: this.calculateMakespan(optimized),
      efficiency: this.calculateEfficiency(optimized)
    };
  }

  /**
   * Calculate total duration
   */
  private calculateTotalDuration(items: ScheduleItem[]): number {
    return items.reduce((sum, item) => sum + (item.estimatedDuration || 60), 0);
  }

  /**
   * Calculate concurrent reduction
   */
  private calculateConcurrentReduction(original: ScheduleItem[], optimized: ScheduleItem[]): number {
    const originalMax = this.calculateMaxConcurrent(original);
    const optimizedMax = this.calculateMaxConcurrent(optimized);
    return originalMax - optimizedMax;
  }

  /**
   * Calculate maximum concurrent items
   */
  private calculateMaxConcurrent(items: ScheduleItem[]): number {
    if (items.length === 0) return 0;
    
    // Create timeline of events
    const events: Array<{ time: number; type: 'start' | 'end' }> = [];
    
    items.forEach(item => {
      const start = item.scheduledFor.getTime();
      const end = start + (item.estimatedDuration || 60) * 60000;
      
      events.push({ time: start, type: 'start' });
      events.push({ time: end, type: 'end' });
    });
    
    // Sort events by time
    events.sort((a, b) => a.time - b.time);
    
    // Count concurrent items
    let current = 0;
    let max = 0;
    
    events.forEach(event => {
      if (event.type === 'start') {
        current++;
        max = Math.max(max, current);
      } else {
        current--;
      }
    });
    
    return max;
  }

  /**
   * Calculate buffer time utilization
   */
  private calculateBufferUtilization(items: ScheduleItem[]): number {
    if (items.length <= 1) return 1.0;
    
    // Sort by time
    const sorted = [...items].sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    
    let totalBuffer = 0;
    let utilizedBuffer = 0;
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      
      const currentEnd = current.scheduledFor.getTime() + (current.estimatedDuration || 60) * 60000;
      const timeDiff = next.scheduledFor.getTime() - currentEnd;
      
      totalBuffer += this.config.bufferTime * 60000;
      utilizedBuffer += Math.min(timeDiff, this.config.bufferTime * 60000);
    }
    
    return totalBuffer > 0 ? utilizedBuffer / totalBuffer : 1.0;
  }

  /**
   * Calculate dependency satisfaction
   */
  private calculateDependencySatisfaction(items: ScheduleItem[]): number {
    let satisfied = 0;
    let total = 0;
    
    items.forEach(item => {
      if (item.dependsOn && item.dependsOn.length > 0) {
        item.dependsOn.forEach(depId => {
          total++;
          const dependency = items.find(i => i.id === depId);
          if (dependency && dependency.scheduledFor < item.scheduledFor) {
            satisfied++;
          }
        });
      }
    });
    
    return total > 0 ? satisfied / total : 1.0;
  }

  /**
   * Calculate optimal time alignment
   */
  private calculateOptimalTimeAlignment(items: ScheduleItem[]): number {
    let aligned = 0;
    let total = 0;
    
    items.forEach(item => {
      total++;
      const optimalTime = this.getOptimalTimeForType(item.type);
      if (optimalTime && this.isOptimalTime(item.scheduledFor, optimalTime)) {
        aligned++;
      }
    });
    
    return total > 0 ? aligned / total : 1.0;
  }

  /**
   * Calculate makespan (total schedule length)
   */
  private calculateMakespan(items: ScheduleItem[]): number {
    if (items.length === 0) return 0;
    
    let earliest = Infinity;
    let latest = -Infinity;
    
    items.forEach(item => {
      const start = item.scheduledFor.getTime();
      const end = start + (item.estimatedDuration || 60) * 60000;
      
      earliest = Math.min(earliest, start);
      latest = Math.max(latest, end);
    });
    
    return (latest - earliest) / 60000; // Convert to minutes
  }

  /**
   * Calculate schedule efficiency
   */
  private calculateEfficiency(items: ScheduleItem[]): number {
    if (items.length === 0) return 1.0;
    
    const totalWorkTime = this.calculateTotalDuration(items) * 60000; // Convert to milliseconds
    const makespan = this.calculateMakespan(items) * 60000;
    
    if (makespan === 0) return 1.0;
    
    // Efficiency = work time / (work time + idle time)
    // Idle time is makespan minus work time
    return totalWorkTime / makespan;
  }

  /**
   * Get optimal time for item type
   */
  private getOptimalTimeForType(type: ScheduleItemType): TimeOfDay | null {
    const optimalTimes: Record<ScheduleItemType, TimeOfDay> = {
      'blog-post': 'morning',
      'social-post': 'afternoon',
      'newsletter': 'morning',
      'email': 'morning',
      'task': 'morning',
      'reminder': 'morning',
      'meeting': 'afternoon',
      'event': 'evening',
      'campaign': 'afternoon',
      'automation': 'night'
    };
    
    return optimalTimes[type] || null;
  }

  /**
   * Check if time is optimal
   */
  private isOptimalTime(time: Date, optimalTime: TimeOfDay): boolean {
    const hour = time.getHours();
    
    switch (optimalTime) {
      case 'morning':
        return hour >= 6 && hour < 12;
      case 'afternoon':
        return hour >= 12 && hour < 18;
      case 'evening':
        return hour >= 18 && hour < 22;
      case 'night':
        return hour >= 22 || hour < 6;
      case 'anytime':
        return true;
      default:
        return false;
    }
  }

  /**
   * Adjust time to optimal time period
   */
  private adjustToOptimalTime(time: Date, optimalTime: TimeOfDay): Date {
    const adjusted = new Date(time);
    const hour = adjusted.getHours();
    
    switch (optimalTime) {
      case 'morning':
        adjusted.setHours(9, 0, 0, 0); // 9:00 AM
        break;
      case 'afternoon':
        adjusted.setHours(14, 0, 0, 0); // 2:00 PM
        break;
      case 'evening':
        adjusted.setHours(19, 0, 0, 0); // 7:00 PM
        break;
      case 'night':
        adjusted.setHours(22, 0, 0, 0); // 10:00 PM
        break;
      default:
        // Keep original time
        break;
    }
    
    // Keep same day
    if (adjusted.getDate() !== time.getDate()) {
      adjusted.setDate(time.getDate());
    }
    
    return adjusted;
  }

  /**
   * Cluster items by time proximity
   */
  private clusterItems(items: ScheduleItem[], threshold: number): ScheduleItem[][] {
    if (items.length === 0) return [];
    
    // Sort by time
    const sorted = [...items].sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    
    const clusters: ScheduleItem[][] = [];
    let currentCluster: ScheduleItem[] = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      const prevTime = sorted[i - 1].scheduledFor.getTime();
      const currTime = sorted[i].scheduledFor.getTime();
      
      if (currTime - prevTime <= threshold) {
        // Add to current cluster
        currentCluster.push(sorted[i]);
      } else {
        // Start new cluster
        clusters.push(currentCluster);
        currentCluster = [sorted[i]];
      }
    }
    
    // Add last cluster
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }
    
    return clusters;
  }

  /**
   * Calculate item end time
   */
  private calculateItemEnd(item: ScheduleItem): Date {
    const duration = item.estimatedDuration || 60; // Default 60 minutes
    return new Date(item.scheduledFor.getTime() + duration * 60000);
  }
}
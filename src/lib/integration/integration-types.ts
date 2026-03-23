/**
 * Integration Types - Phase 26 Integration System
 * 
 * Type definitions for the Integration System
 */

import type { SystemIntegrator } from './system-integrator.js';
import type { BuildPreparer } from './build-preparer.js';
import type { PerformanceOptimizer } from './performance-optimizer.js';

/**
 * System integration status
 */
export type IntegrationStatus = 'pending' | 'integrating' | 'integrated' | 'failed' | 'optimizing' | 'optimized';

/**
 * Build configuration options
 */
export interface BuildConfig {
  environment: 'development' | 'staging' | 'production';
  optimize: boolean;
  minify: boolean;
  bundle: boolean;
  sourcemap: boolean;
  analyze: boolean;
  clean: boolean;
  target: 'browser' | 'node' | 'universal';
  outputPath: string;
}

/**
 * Performance optimization strategies
 */
export type OptimizationStrategy = 'memory' | 'cpu' | 'network' | 'rendering' | 'storage' | 'overall';

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  timestamp: Date;
  memory: {
    used: number;
    total: number;
    percentage: number;
    trend: 'improving' | 'stable' | 'degrading';
  };
  cpu: {
    usage: number;
    trend: 'improving' | 'stable' | 'degrading';
  };
  network: {
    latency: number;
    throughput: number;
    errors: number;
  };
  rendering: {
    frameRate: number;
    renderTime: number;
    droppedFrames: number;
  };
  storage: {
    readSpeed: number;
    writeSpeed: number;
    fragmentation: number;
  };
  overall: number;
}

/**
 * Optimization configuration
 */
export interface OptimizationConfig {
  strategies: OptimizationStrategy[];
  thresholds: {
    memory: number;
    cpu: number;
    network: number;
    rendering: number;
    storage: number;
  };
  interval: number;
  historySize: number;
  autoOptimize: boolean;
  logging: boolean;
}

/**
 * Integration system configuration
 */
export interface IntegrationConfig {
  systemIntegrator: {
    enableAutoIntegration: boolean;
    healthCheckInterval: number;
    performanceThresholds: {
      responseTime: number;
      memoryUsage: number;
      cpuUsage: number;
    };
    retryAttempts: number;
    timeout: number;
  };
  buildPreparer: BuildConfig;
  performanceOptimizer: OptimizationConfig;
}

/**
 * Integration system state
 */
export interface IntegrationState {
  status: IntegrationStatus;
  lastUpdated: Date;
  health: {
    overall: number;
    subsystems: {
      assistant: number;
      media: number;
      layout: number;
      document: number;
      workflow: number;
      content: number;
    };
    performance: {
      responseTime: number;
      memoryUsage: number;
      cpuUsage: number;
    };
    errors: {
      count: number;
      recent: string[];
    };
  };
  build: {
    lastBuild?: Date;
    lastBuildStatus: 'success' | 'warning' | 'error' | 'never';
    buildCount: number;
  };
  performance: {
    currentMetrics?: PerformanceMetrics;
    lastOptimization?: Date;
    optimizationCount: number;
  };
}

/**
 * Integration system capabilities
 */
export interface IntegrationCapabilities {
  subsystems: {
    assistant: boolean;
    media: boolean;
    layout: boolean;
    document: boolean;
    workflow: boolean;
    content: boolean;
  };
  integration: {
    crossSystemCommunication: boolean;
    dataSynchronization: boolean;
    healthMonitoring: boolean;
  };
  build: {
    optimization: boolean;
    bundling: boolean;
    analysis: boolean;
  };
  performance: {
    monitoring: boolean;
    optimization: boolean;
    reporting: boolean;
  };
}

/**
 * Integration system report
 */
export interface IntegrationReport {
  timestamp: Date;
  systemState: IntegrationState;
  capabilities: IntegrationCapabilities;
  summary: {
    overallStatus: 'healthy' | 'warning' | 'error';
    subsystemsStatus: string;
    buildStatus: string;
    performanceStatus: string;
    recommendations: string[];
  };
  details: {
    integration: {
      status: IntegrationStatus;
      history: Array<{
        timestamp: Date;
        action: string;
        subsystem: string;
        result: 'success' | 'failure';
        details?: string;
      }>;
    };
    build: {
      lastBuildReport?: any;
      buildHistory: any[];
    };
    performance: {
      currentMetrics?: PerformanceMetrics;
      optimizationHistory: any[];
      optimizationSummary: any;
    };
  };
}

/**
 * Integration system event types
 */
export type IntegrationEvent = 
  | 'integration:started'
  | 'integration:completed'
  | 'integration:failed'
  | 'integration:health-check'
  | 'build:started'
  | 'build:completed'
  | 'build:failed'
  | 'optimization:started'
  | 'optimization:completed'
  | 'optimization:failed'
  | 'subsystem:registered'
  | 'subsystem:error'
  | 'performance:threshold-exceeded';

/**
 * Integration event handler
 */
export type IntegrationEventHandler = (event: IntegrationEvent, data?: any) => void;

/**
 * Integration system options
 */
export interface IntegrationOptions {
  config?: Partial<IntegrationConfig>;
  eventHandlers?: Record<IntegrationEvent, IntegrationEventHandler[]>;
  autoStart?: boolean;
  logging?: boolean;
}
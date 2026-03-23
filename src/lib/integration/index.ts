/**
 * Integration System - Phase 26
 *
 * Final System Integration & Build Preparation
 *
 * This module exports all integration system components for easy import.
 */

// Core integration components
export { SystemIntegrator } from './system-integrator.js';
export { BuildPreparer } from './build-preparer.js';
export { PerformanceOptimizer } from './performance-optimizer.js';

// Type definitions
export type {
  IntegrationStatus,
  BuildConfig,
  PerformanceMetrics,
  OptimizationConfig,
  IntegrationConfig,
  IntegrationState,
  IntegrationCapabilities,
  IntegrationReport,
  IntegrationEvent,
  IntegrationEventHandler,
  IntegrationOptions,
  OptimizationStrategy,
} from './integration-types.js';

// Convenience class that combines all integration components
export class IntegrationSystem {
  private systemIntegrator: any;
  private buildPreparer: any;
  private performanceOptimizer: any;

  /**
   * Create a new IntegrationSystem instance
   */
  constructor(config?: {
    systemIntegrator?: any;
    buildPreparer?: any;
    performanceOptimizer?: any;
  }) {
    // Create system integrator
    this.systemIntegrator = config?.systemIntegrator || null;
    
    // Create build preparer
    this.buildPreparer = config?.buildPreparer || null;
    
    // Create performance optimizer
    this.performanceOptimizer = config?.performanceOptimizer || null;
  }

  /**
   * Initialize the integration system
   */
  async initialize(): Promise<void> {
    // Dynamically import components
    const SystemIntegratorModule = await import('./system-integrator.js');
    const BuildPreparerModule = await import('./build-preparer.js');
    const PerformanceOptimizerModule = await import('./performance-optimizer.js');

    // Create system integrator
    this.systemIntegrator = new SystemIntegratorModule.SystemIntegrator();
    
    // Create build preparer
    this.buildPreparer = new BuildPreparerModule.BuildPreparer(this.systemIntegrator);
    
    // Create performance optimizer
    this.performanceOptimizer = new PerformanceOptimizerModule.PerformanceOptimizer(this.systemIntegrator);
  }

  /**
   * Get the system integrator
   */
  getSystemIntegrator(): any {
    return this.systemIntegrator;
  }

  /**
   * Get the build preparer
   */
  getBuildPreparer(): any {
    return this.buildPreparer;
  }

  /**
   * Get the performance optimizer
   */
  getPerformanceOptimizer(): any {
    return this.performanceOptimizer;
  }

  /**
   * Start the complete integration system
   */
  async start(): Promise<void> {
    console.log('Starting integration system...');
    
    // Start performance monitoring
    if (this.performanceOptimizer) {
      this.performanceOptimizer.startMonitoring();
    }
    
    console.log('Integration system started successfully');
  }

  /**
   * Stop the complete integration system
   */
  async stop(): Promise<void> {
    console.log('Stopping integration system...');
    
    // Stop performance monitoring
    if (this.performanceOptimizer) {
      this.performanceOptimizer.stopMonitoring();
    }
    
    console.log('Integration system stopped successfully');
  }

  /**
   * Get system status
   */
  getStatus(): {
    integration: any;
    build: any;
    performance: any;
  } {
    return {
      integration: this.systemIntegrator ? this.systemIntegrator.getStatus() : null,
      build: this.buildPreparer ? this.buildPreparer.getLatestBuildReport() : null,
      performance: this.performanceOptimizer ? this.performanceOptimizer.getCurrentMetrics() : null,
    };
  }

  /**
   * Generate integration report
   */
  generateReport(): any {
    return {
      timestamp: new Date(),
      system: this.getStatus(),
      health: this.systemIntegrator ? this.systemIntegrator.getHealthMetrics() : null,
      buildHistory: this.buildPreparer ? this.buildPreparer.getBuildHistory() : null,
      performanceHistory: this.performanceOptimizer ? this.performanceOptimizer.getMetricsHistory() : null,
      optimizationSummary: this.performanceOptimizer ? this.performanceOptimizer.getOptimizationSummary() : null,
    };
  }
}
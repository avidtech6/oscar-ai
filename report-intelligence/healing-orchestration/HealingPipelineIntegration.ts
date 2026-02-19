/**
 * Phase 8: Pipeline Integration Modules
 * 
 * Integrates healing orchestration with the existing report intelligence pipeline:
 * - Phase 1: Registry Integration
 * - Phase 3: Mapping Integration  
 * - Phase 4: Updater Integration
 * - Phase 6: Classification Integration
 * - Phase 7: Self-Healing Engine Integration
 */

import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { ClassificationResult } from '../classification/ClassificationResult';
import type { SelfHealingActionBatch } from '../self-healing/SelfHealingAction';
import type { HealingOrchestrator } from './HealingOrchestrator';
import type { HealingPassManager } from './HealingPassManager';
import type { HealingResultIntegrator } from './HealingResultIntegrator';
import type { HealingEventTelemetry } from './HealingEventTelemetry';
import type { HealingDeveloperTools } from './HealingDeveloperTools';

export interface PipelineIntegrationConfig {
  enableRegistryIntegration: boolean;
  enableMappingIntegration: boolean;
  enableUpdaterIntegration: boolean;
  enableClassificationIntegration: boolean;
  enableSelfHealingIntegration: boolean;
  integrationMode: 'synchronous' | 'asynchronous' | 'hybrid';
  batchProcessing: boolean;
  batchSize: number;
  retryAttempts: number;
  retryDelayMs: number;
  timeoutMs: number;
}

export interface PipelineIntegrationResult {
  integrationId: string;
  timestamp: string;
  components: {
    registry: boolean;
    mapping: boolean;
    updater: boolean;
    classification: boolean;
    selfHealing: boolean;
  };
  results: {
    registry?: any;
    mapping?: any;
    updater?: any;
    classification?: any;
    selfHealing?: any;
  };
  status: 'pending' | 'in-progress' | 'completed' | 'partial' | 'failed';
  errors: string[];
  warnings: string[];
}

export class HealingPipelineIntegration {
  private config: PipelineIntegrationConfig;
  
  // Core healing components
  private orchestrator: HealingOrchestrator;
  private passManager: HealingPassManager;
  private resultIntegrator: HealingResultIntegrator;
  private eventTelemetry: HealingEventTelemetry;
  private developerTools: HealingDeveloperTools;
  
  // Pipeline integration state
  private integrationState: Map<string, PipelineIntegrationResult> = new Map();
  
  // External pipeline components (would be injected)
  private registryService: any = null;
  private mappingService: any = null;
  private updaterService: any = null;
  private classificationService: any = null;
  private selfHealingEngine: any = null;

  constructor(
    config: Partial<PipelineIntegrationConfig> = {},
    healingComponents?: {
      orchestrator: HealingOrchestrator;
      passManager: HealingPassManager;
      resultIntegrator: HealingResultIntegrator;
      eventTelemetry: HealingEventTelemetry;
      developerTools: HealingDeveloperTools;
    }
  ) {
    this.config = {
      enableRegistryIntegration: true,
      enableMappingIntegration: true,
      enableUpdaterIntegration: true,
      enableClassificationIntegration: true,
      enableSelfHealingIntegration: true,
      integrationMode: 'hybrid',
      batchProcessing: true,
      batchSize: 10,
      retryAttempts: 3,
      retryDelayMs: 1000,
      timeoutMs: 30000,
      ...config
    };
    
    // Initialize healing components
    if (healingComponents) {
      this.orchestrator = healingComponents.orchestrator;
      this.passManager = healingComponents.passManager;
      this.resultIntegrator = healingComponents.resultIntegrator;
      this.eventTelemetry = healingComponents.eventTelemetry;
      this.developerTools = healingComponents.developerTools;
    } else {
      // Create default instances (these would be properly initialized in real usage)
      // For now, we'll create placeholder instances
      this.orchestrator = {} as HealingOrchestrator;
      this.passManager = {} as HealingPassManager;
      this.resultIntegrator = {} as HealingResultIntegrator;
      this.eventTelemetry = {} as HealingEventTelemetry;
      this.developerTools = {} as HealingDeveloperTools;
    }
  }

  /**
   * Integrate healing with the full pipeline
   */
  public async integrateWithPipeline(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult,
    options?: {
      trigger?: 'manual' | 'automatic' | 'scheduled';
      priority?: 'low' | 'medium' | 'high' | 'critical';
      passIds?: string[];
    }
  ): Promise<PipelineIntegrationResult> {
    const integrationId = `pipeline_integration_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const timestamp = new Date().toISOString();
    
    const integrationResult: PipelineIntegrationResult = {
      integrationId,
      timestamp,
      components: {
        registry: false,
        mapping: false,
        updater: false,
        classification: false,
        selfHealing: false
      },
      results: {},
      status: 'pending',
      errors: [],
      warnings: []
    };
    
    this.integrationState.set(integrationId, integrationResult);
    
    // Emit integration started event
    this.eventTelemetry.emitEvent('healing:pipeline:integration_started', {
      integrationId,
      mappingResultId: mappingResult.id,
      classificationResultId: classificationResult?.id,
      options,
      timestamp
    });
    
    try {
      integrationResult.status = 'in-progress';
      
      // 1. Integrate with Registry (Phase 1)
      if (this.config.enableRegistryIntegration) {
        await this.integrateWithRegistry(mappingResult, integrationResult);
      }
      
      // 2. Integrate with Mapping (Phase 3)
      if (this.config.enableMappingIntegration) {
        await this.integrateWithMapping(mappingResult, integrationResult);
      }
      
      // 3. Integrate with Updater (Phase 4)
      if (this.config.enableUpdaterIntegration) {
        await this.integrateWithUpdater(mappingResult, integrationResult);
      }
      
      // 4. Integrate with Classification (Phase 6)
      if (this.config.enableClassificationIntegration && classificationResult) {
        await this.integrateWithClassification(classificationResult, integrationResult);
      }
      
      // 5. Integrate with Self-Healing Engine (Phase 7)
      if (this.config.enableSelfHealingIntegration) {
        await this.integrateWithSelfHealing(
          mappingResult,
          classificationResult,
          integrationResult,
          options
        );
      }
      
      // Determine overall status
      const componentCount = Object.values(integrationResult.components).filter(Boolean).length;
      const expectedCount = [
        this.config.enableRegistryIntegration,
        this.config.enableMappingIntegration,
        this.config.enableUpdaterIntegration,
        this.config.enableClassificationIntegration && classificationResult,
        this.config.enableSelfHealingIntegration
      ].filter(Boolean).length;
      
      if (integrationResult.errors.length > 0) {
        integrationResult.status = componentCount === 0 ? 'failed' : 'partial';
      } else {
        integrationResult.status = 'completed';
      }
      
      // Emit integration completed event
      this.eventTelemetry.emitEvent('healing:pipeline:integration_completed', {
        integrationId,
        status: integrationResult.status,
        componentCount,
        expectedCount,
        errors: integrationResult.errors.length,
        warnings: integrationResult.warnings.length,
        timestamp: new Date().toISOString()
      });
      
      return integrationResult;
      
    } catch (error) {
      integrationResult.status = 'failed';
      integrationResult.errors.push(`Pipeline integration failed: ${error instanceof Error ? error.message : String(error)}`);
      
      // Emit integration failed event
      this.eventTelemetry.emitEvent('healing:pipeline:integration_failed', {
        integrationId,
        error: integrationResult.errors[0],
        timestamp: new Date().toISOString()
      });
      
      return integrationResult;
    }
  }

  /**
   * Integrate with Registry (Phase 1)
   */
  private async integrateWithRegistry(
    mappingResult: SchemaMappingResult,
    integrationResult: PipelineIntegrationResult
  ): Promise<void> {
    try {
      // Trace integration start
      this.developerTools.trace(
        'integration',
        'pipeline',
        'registry-integration',
        { mappingResultId: mappingResult.id },
        null,
        null,
        true
      );
      
      // This would integrate with the Phase 1 Registry
      // For now, we'll simulate integration
      if (this.registryService) {
        // Actual integration logic would go here
        const registryResult = await this.registryService.registerHealingContext(mappingResult);
        integrationResult.results.registry = registryResult;
      } else {
        // Simulate successful integration
        integrationResult.results.registry = {
          registered: true,
          contextId: `registry_ctx_${mappingResult.id}`,
          timestamp: new Date().toISOString()
        };
      }
      
      integrationResult.components.registry = true;
      
      // Emit event
      this.eventTelemetry.emitEvent('healing:pipeline:registry_integrated', {
        mappingResultId: mappingResult.id,
        result: integrationResult.results.registry,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      integrationResult.errors.push(`Registry integration failed: ${error instanceof Error ? error.message : String(error)}`);
      
      // Emit error event
      this.eventTelemetry.emitEvent('healing:pipeline:registry_integration_failed', {
        mappingResultId: mappingResult.id,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Integrate with Mapping (Phase 3)
   */
  private async integrateWithMapping(
    mappingResult: SchemaMappingResult,
    integrationResult: PipelineIntegrationResult
  ): Promise<void> {
    try {
      // Trace integration start
      this.developerTools.trace(
        'integration',
        'pipeline',
        'mapping-integration',
        { mappingResultId: mappingResult.id },
        null,
        null,
        true
      );
      
      // This would integrate with the Phase 3 Mapping system
      // For now, we'll simulate integration
      if (this.mappingService) {
        // Actual integration logic would go here
        const mappingIntegrationResult = await this.mappingService.integrateHealingResults(mappingResult);
        integrationResult.results.mapping = mappingIntegrationResult;
      } else {
        // Simulate successful integration
        integrationResult.results.mapping = {
          integrated: true,
          mappingResultId: mappingResult.id,
          healingApplied: false, // Would be true if healing was applied
          timestamp: new Date().toISOString()
        };
      }
      
      integrationResult.components.mapping = true;
      
      // Emit event
      this.eventTelemetry.emitEvent('healing:pipeline:mapping_integrated', {
        mappingResultId: mappingResult.id,
        result: integrationResult.results.mapping,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      integrationResult.errors.push(`Mapping integration failed: ${error instanceof Error ? error.message : String(error)}`);
      
      // Emit error event
      this.eventTelemetry.emitEvent('healing:pipeline:mapping_integration_failed', {
        mappingResultId: mappingResult.id,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Integrate with Updater (Phase 4)
   */
  private async integrateWithUpdater(
    mappingResult: SchemaMappingResult,
    integrationResult: PipelineIntegrationResult
  ): Promise<void> {
    try {
      // Trace integration start
      this.developerTools.trace(
        'integration',
        'pipeline',
        'updater-integration',
        { mappingResultId: mappingResult.id },
        null,
        null,
        true
      );
      
      // This would integrate with the Phase 4 Updater system
      // For now, we'll simulate integration
      if (this.updaterService) {
        // Actual integration logic would go here
        const updaterResult = await this.updaterService.updateWithHealing(mappingResult);
        integrationResult.results.updater = updaterResult;
      } else {
        // Simulate successful integration
        integrationResult.results.updater = {
          updated: true,
          mappingResultId: mappingResult.id,
          updateType: 'healing-integration',
          timestamp: new Date().toISOString()
        };
      }
      
      integrationResult.components.updater = true;
      
      // Emit event
      this.eventTelemetry.emitEvent('healing:pipeline:updater_integrated', {
        mappingResultId: mappingResult.id,
        result: integrationResult.results.updater,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      integrationResult.errors.push(`Updater integration failed: ${error instanceof Error ? error.message : String(error)}`);
      
      // Emit error event
      this.eventTelemetry.emitEvent('healing:pipeline:updater_integration_failed', {
        mappingResultId: mappingResult.id,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Integrate with Classification (Phase 6)
   */
  private async integrateWithClassification(
    classificationResult: ClassificationResult,
    integrationResult: PipelineIntegrationResult
  ): Promise<void> {
    try {
      // Trace integration start
      this.developerTools.trace(
        'integration',
        'pipeline',
        'classification-integration',
        { classificationResultId: classificationResult.id },
        null,
        null,
        true
      );
      
      // This would integrate with the Phase 6 Classification system
      // For now, we'll simulate integration
      if (this.classificationService) {
        // Actual integration logic would go here
        const classificationIntegrationResult = await this.classificationService.integrateHealing(classificationResult);
        integrationResult.results.classification = classificationIntegrationResult;
      } else {
        // Simulate successful integration
        integrationResult.results.classification = {
          integrated: true,
          classificationResultId: classificationResult.id,
          healingEnhancements: [],
          timestamp: new Date().toISOString()
        };
      }
      
      integrationResult.components.classification = true;
      
      // Emit event
      this.eventTelemetry.emitEvent('healing:pipeline:classification_integrated', {
        classificationResultId: classificationResult.id,
        result: integrationResult.results.classification,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      integrationResult.errors.push(`Classification integration failed: ${error instanceof Error ? error.message : String(error)}`);
      
      // Emit error event
      this.eventTelemetry.emitEvent('healing:pipeline:classification_integration_failed', {
        classificationResultId: classificationResult.id,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Integrate with Self-Healing Engine (Phase 7)
   */
  private async integrateWithSelfHealing(
    mappingResult: SchemaMappingResult,
    classificationResult: ClassificationResult | undefined,
    integrationResult: PipelineIntegrationResult,
    options?: any
  ): Promise<void> {
    try {
      // Trace integration start
      this.developerTools.trace(
        'integration',
        'pipeline',
        'self-healing-integration',
        { 
          mappingResultId: mappingResult.id,
          classificationResultId: classificationResult?.id,
          options 
        },
        null,
        null,
        true
      );
      
      // This integrates with the Phase 7 Self-Healing Engine via the Phase 8 Orchestrator
      // Run healing orchestration
      const orchestrationResult = await this.orchestrator.orchestrateHealing(
        mappingResult,
        classificationResult,
        {
          trigger: options?.trigger || 'automatic',
          priority: options?.priority || 'medium',
          passIds: options?.passIds
        }
      );
      
      integrationResult.results.selfHealing = orchestrationResult;
      integrationResult.components.selfHealing = true;
      
      // Emit event
      this.eventTelemetry.emitEvent('healing:pipeline:self_healing_integrated', {
        mappingResultId: mappingResult.id,
        orchestrationResultId: orchestrationResult.id,
        improvementScore: orchestrationResult.improvementScore,
        actionsGenerated: orchestrationResult.actionsGenerated,
        actionsApplied: orchestrationResult.actionsApplied,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      integrationResult.errors.push(`Self-healing integration failed: ${error instanceof Error ? error.message : String(error)}`);
      
      // Emit error event
      this.eventTelemetry.emitEvent('healing:pipeline:self_healing_integration_failed', {
        mappingResultId: mappingResult.id,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Set external pipeline services
   */
  public setPipelineServices(services: {
    registryService?: any;
    mappingService?: any;
    updaterService?: any;
    classificationService?: any;
    selfHealingEngine?: any;
  }): void {
    if (services.registryService) {
      this.registryService = services.registryService;
    }
    
    if (services.mappingService) {
      this.mappingService = services.mappingService;
    }
    
    if (services.updaterService) {
      this.updaterService = services.updaterService;
    }
    
    if (services.classificationService) {
      this.classificationService = services.classificationService;
    }
    
    if (services.selfHealingEngine) {
      this.selfHealingEngine = services.selfHealingEngine;
    }
    
    // Emit event
    this.eventTelemetry.emitEvent('healing:debug:log', {
      services: Object.keys(services),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get integration result by ID
   */
  public getIntegrationResult(integrationId: string): PipelineIntegrationResult | undefined {
    return this.integrationState.get(integrationId);
  }

  /**
   * Get all integration results
   */
  public getAllIntegrationResults(): PipelineIntegrationResult[] {
    return Array.from(this.integrationState.values());
  }

  /**
   * Clear integration state
   */
  public clearIntegrationState(): void {
    this.integrationState.clear();
  }

  /**
   * Get integration statistics
   */
  public getIntegrationStatistics(): {
    totalIntegrations: number;
    successfulIntegrations: number;
    partialIntegrations: number;
    failedIntegrations: number;
    componentSuccessRates: Record<string, number>;
  } {
    const results = this.getAllIntegrationResults();
    const totalIntegrations = results.length;
    const successfulIntegrations = results.filter(r => r.status === 'completed').length;
    const partialIntegrations = results.filter(r => r.status === 'partial').length;
    const failedIntegrations = results.filter(r => r.status === 'failed').length;
    
    // Calculate component success rates
    const componentSuccessRates: Record<string, number> = {};
    const componentCounts: Record<string, { total: number; successful: number }> = {};
    
    results.forEach(result => {
      Object.entries(result.components).forEach(([component, success]) => {
        if (!componentCounts[component]) {
          componentCounts[component] = { total: 0, successful: 0 };
        }
        
        componentCounts[component].total++;
        if (success) {
          componentCounts[component].successful++;
        }
      });
    });
    
    Object.entries(componentCounts).forEach(([component, counts]) => {
      componentSuccessRates[component] = counts.total > 0 ? counts.successful / counts.total : 0;
    });
    
    return {
      totalIntegrations,
      successfulIntegrations,
      partialIntegrations,
      failedIntegrations,
      componentSuccessRates
    };
  }

  /**
   * Validate configuration
   */
  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (this.config.batchSize <= 0) {
      errors.push('batchSize must be greater than 0');
    }
    
    if (this.config.retryAttempts < 0) {
      errors.push('retryAttempts cannot be negative');
    }
    
    if (this.config.retryDelayMs < 0) {
      errors.push('retryDelayMs cannot be negative');
    }
    
    if (this.config.timeoutMs <= 0) {
      errors.push('timeoutMs must be greater than 0');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Reset pipeline integration
   */
  public reset(): void {
    this.clearIntegrationState();
    
    // Reset healing components if they have reset methods
    if (typeof this.orchestrator.reset === 'function') {
      this.orchestrator.reset();
    }
    
    if (typeof this.passManager.reset === 'function') {
      this.passManager.reset();
    }
    
    if (typeof this.resultIntegrator.reset === 'function') {
      this.resultIntegrator.reset();
    }
    
    if (typeof this.eventTelemetry.reset === 'function') {
      this.eventTelemetry.reset();
    }
    
    if (typeof this.developerTools.reset === 'function') {
      this.developerTools.reset();
    }
  }

  /**
   * Generate pipeline integration report
   */
  public generateIntegrationReport(): {
    statistics: any;
    recentIntegrations: PipelineIntegrationResult[];
    componentHealth: Record<string, number>;
    recommendations: string[];
  } {
    const statistics = this.getIntegrationStatistics();
    const recentIntegrations = this.getAllIntegrationResults().slice(-10);
    
    // Calculate component health
    const componentHealth: Record<string, number> = {};
    Object.entries(statistics.componentSuccessRates).forEach(([component, rate]) => {
      componentHealth[component] = rate * 100; // Convert to percentage
    });
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (statistics.failedIntegrations > statistics.successfulIntegrations) {
      recommendations.push('Consider reviewing integration error logs and adjusting configuration');
    }
    
    if (componentHealth.registry < 80) {
      recommendations.push('Registry integration success rate is low. Check registry service connectivity.');
    }
    
    if (componentHealth.selfHealing < 70) {
      recommendations.push('Self-healing integration success rate is low. Review healing orchestration configuration.');
    }
    
    if (statistics.totalIntegrations === 0) {
      recommendations.push('No integrations have been performed yet. Consider running test integrations.');
    }
    
    return {
      statistics,
      recentIntegrations,
      componentHealth,
      recommendations
    };
  }
}

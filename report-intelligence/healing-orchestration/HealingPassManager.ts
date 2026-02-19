/**
 * Phase 8: Healing Pass Manager
 * 
 * Manages single-pass, multi-pass, recursive, and priority-based healing passes.
 * Coordinates between healing passes, tracks dependencies, and manages pass execution.
 */

import type { ReportSelfHealingEngine } from '../self-healing/ReportSelfHealingEngine';
import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { ClassificationResult } from '../classification/ClassificationResult';
import type { SelfHealingActionBatch, SelfHealingAction } from '../self-healing/SelfHealingAction';

export type HealingPassType = 'single' | 'multi' | 'recursive' | 'priority';
export type HealingPassStrategy = 'sequential' | 'parallel' | 'hybrid';
export type PassDependencyType = 'requires' | 'recommends' | 'conflicts';

export interface HealingPassConfig {
  type: HealingPassType;
  strategy: HealingPassStrategy;
  maxPasses: number;
  minImprovementThreshold: number; // 0-1
  timeoutMs: number;
  enableDependencyTracking: boolean;
  enableRollback: boolean;
  parallelLimit: number;
}

export interface HealingPassDependency {
  passId: string;
  type: PassDependencyType;
  required: boolean;
  description: string;
}

export interface HealingPass {
  id: string;
  name: string;
  description: string;
  type: HealingPassType;
  priority: number; // 1-10, higher = more important
  dependencies: HealingPassDependency[];
  config: {
    detectorEnabled: boolean;
    generatorEnabled: boolean;
    severityThreshold: 'low' | 'medium' | 'high' | 'critical';
    confidenceThreshold: number; // 0-1
  };
}

export interface HealingPassResult {
  passId: string;
  success: boolean;
  actionsGenerated: number;
  actionsApplied: number;
  improvementScore: number; // 0-1
  processingTimeMs: number;
  dependenciesSatisfied: boolean;
  error?: string;
  batchId?: string;
}

export interface HealingPassExecutionPlan {
  passes: HealingPass[];
  executionOrder: string[]; // Pass IDs in execution order
  dependencies: Map<string, string[]>; // Pass ID -> Required pass IDs
  estimatedTimeMs: number;
  canExecuteInParallel: boolean;
}

export class HealingPassManager {
  private healingEngine: ReportSelfHealingEngine;
  private config: HealingPassConfig;
  private passes: Map<string, HealingPass> = new Map();
  private passResults: Map<string, HealingPassResult> = new Map();
  private passDependencies: Map<string, Set<string>> = new Map();
  
  // Event listeners
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(
    healingEngine: ReportSelfHealingEngine,
    config: Partial<HealingPassConfig> = {}
  ) {
    this.healingEngine = healingEngine;
    
    this.config = {
      type: 'multi',
      strategy: 'hybrid',
      maxPasses: 3,
      minImprovementThreshold: 0.1,
      timeoutMs: 30000,
      enableDependencyTracking: true,
      enableRollback: true,
      parallelLimit: 3,
      ...config
    };
    
    // Initialize default passes
    this.initializeDefaultPasses();
  }

  /**
   * Initialize default healing passes
   */
  private initializeDefaultPasses(): void {
    // Pass 1: Structural healing (missing sections and fields)
    this.registerPass({
      id: 'structural_healing',
      name: 'Structural Healing Pass',
      description: 'Fixes missing sections and fields in the schema',
      type: 'single',
      priority: 10,
      dependencies: [],
      config: {
        detectorEnabled: true,
        generatorEnabled: true,
        severityThreshold: 'medium',
        confidenceThreshold: 0.7
      }
    });
    
    // Pass 2: Contradiction healing
    this.registerPass({
      id: 'contradiction_healing',
      name: 'Contradiction Healing Pass',
      description: 'Fixes contradictions in schema mappings and metadata',
      type: 'single',
      priority: 8,
      dependencies: [
        {
          passId: 'structural_healing',
          type: 'recommends',
          required: false,
          description: 'Structural healing should run first for better results'
        }
      ],
      config: {
        detectorEnabled: true,
        generatorEnabled: true,
        severityThreshold: 'high',
        confidenceThreshold: 0.8
      }
    });
    
    // Pass 3: Content healing (terminology, compliance rules)
    this.registerPass({
      id: 'content_healing',
      name: 'Content Healing Pass',
      description: 'Adds missing terminology and compliance rules',
      type: 'single',
      priority: 6,
      dependencies: [
        {
          passId: 'structural_healing',
          type: 'requires',
          required: true,
          description: 'Requires structural healing to complete first'
        }
      ],
      config: {
        detectorEnabled: true,
        generatorEnabled: true,
        severityThreshold: 'medium',
        confidenceThreshold: 0.6
      }
    });
    
    // Pass 4: Enhancement healing (improve confidence, enhance classification)
    this.registerPass({
      id: 'enhancement_healing',
      name: 'Enhancement Healing Pass',
      description: 'Improves mapping confidence and enhances classification',
      type: 'single',
      priority: 4,
      dependencies: [
        {
          passId: 'structural_healing',
          type: 'recommends',
          required: false,
          description: 'Works better after structural healing'
        },
        {
          passId: 'contradiction_healing',
          type: 'recommends',
          required: false,
          description: 'Works better after contradiction healing'
        }
      ],
      config: {
        detectorEnabled: true,
        generatorEnabled: true,
        severityThreshold: 'low',
        confidenceThreshold: 0.5
      }
    });
  }

  /**
   * Register a healing pass
   */
  public registerPass(pass: HealingPass): void {
    this.passes.set(pass.id, pass);
    
    // Build dependency graph
    if (this.config.enableDependencyTracking) {
      const dependencies = new Set<string>();
      pass.dependencies.forEach(dep => {
        if (dep.required) {
          dependencies.add(dep.passId);
        }
      });
      this.passDependencies.set(pass.id, dependencies);
    }
    
    this.emitEvent('healing:pass:registered', {
      passId: pass.id,
      passName: pass.name,
      dependencies: pass.dependencies.length,
      timestamp: new Date()
    });
  }

  /**
   * Execute healing passes based on configuration
   */
  public async executePasses(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult,
    passIds?: string[]
  ): Promise<HealingPassResult[]> {
    const startTime = Date.now();
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    this.emitEvent('healing:pass:execution_started', {
      executionId,
      mappingResultId: mappingResult.id,
      classificationResultId: classificationResult?.id,
      totalPasses: passIds?.length || this.passes.size,
      timestamp: new Date()
    });
    
    try {
      // Get passes to execute
      const passesToExecute = passIds 
        ? passIds.map(id => this.passes.get(id)).filter(Boolean) as HealingPass[]
        : Array.from(this.passes.values());
      
      // Create execution plan
      const executionPlan = this.createExecutionPlan(passesToExecute);
      
      this.emitEvent('healing:pass:execution_plan_created', {
        executionId,
        plan: executionPlan,
        timestamp: new Date()
      });
      
      // Execute passes according to plan
      const results: HealingPassResult[] = [];
      
      if (this.config.strategy === 'sequential' || !executionPlan.canExecuteInParallel) {
        // Sequential execution
        for (const passId of executionPlan.executionOrder) {
          const pass = this.passes.get(passId);
          if (!pass) continue;
          
          const result = await this.executeSinglePass(
            pass,
            mappingResult,
            classificationResult,
            executionId
          );
          
          results.push(result);
          this.passResults.set(passId, result);
          
          // Check if we should continue
          if (!result.success && this.config.enableRollback) {
            this.emitEvent('healing:pass:execution_stopped', {
              executionId,
              passId,
              reason: 'Pass failed and rollback is enabled',
              timestamp: new Date()
            });
            break;
          }
        }
      } else {
        // Parallel or hybrid execution
        const passGroups = this.groupPassesForParallelExecution(executionPlan);
        
        for (const group of passGroups) {
          if (this.config.strategy === 'parallel') {
            // Execute all passes in group in parallel
            const promises = group.map(passId => {
              const pass = this.passes.get(passId);
              if (!pass) return Promise.resolve(null);
              
              return this.executeSinglePass(
                pass,
                mappingResult,
                classificationResult,
                executionId
              );
            });
            
            const groupResults = (await Promise.all(promises)).filter(Boolean) as HealingPassResult[];
            results.push(...groupResults);
            
            // Store results
            groupResults.forEach(result => {
              if (result.passId) {
                this.passResults.set(result.passId, result);
              }
            });
            
          } else {
            // Hybrid: execute sequentially within group
            for (const passId of group) {
              const pass = this.passes.get(passId);
              if (!pass) continue;
              
              const result = await this.executeSinglePass(
                pass,
                mappingResult,
                classificationResult,
                executionId
              );
              
              results.push(result);
              this.passResults.set(passId, result);
            }
          }
        }
      }
      
      const totalTime = Date.now() - startTime;
      
      this.emitEvent('healing:pass:execution_completed', {
        executionId,
        totalPasses: results.length,
        successfulPasses: results.filter(r => r.success).length,
        totalTimeMs: totalTime,
        timestamp: new Date()
      });
      
      return results;
      
    } catch (error) {
      this.emitEvent('healing:pass:execution_failed', {
        executionId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      });
      
      throw error;
    }
  }

  /**
   * Execute a single healing pass
   */
  private async executeSinglePass(
    pass: HealingPass,
    mappingResult: SchemaMappingResult,
    classificationResult: ClassificationResult | undefined,
    executionId: string
  ): Promise<HealingPassResult> {
    const passStartTime = Date.now();
    const passCorrelationId = `${executionId}_${pass.id}`;
    
    this.emitEvent('healing:pass:started', {
      executionId,
      passId: pass.id,
      passName: pass.name,
      correlationId: passCorrelationId,
      timestamp: new Date()
    });
    
    try {
      // Check dependencies
      const dependenciesSatisfied = this.checkDependencies(pass.id);
      if (!dependenciesSatisfied) {
        throw new Error(`Dependencies not satisfied for pass ${pass.id}`);
      }
      
      // Configure healing engine for this pass
      this.configureHealingEngineForPass(pass);
      
      // Run healing analysis
      const actionBatch = await this.healingEngine.analyse(
        mappingResult,
        classificationResult
      );
      
      // Calculate improvement score
      const improvementScore = this.calculateImprovementScore(actionBatch);
      
      // Apply actions if threshold met
      let actionsApplied = 0;
      if (improvementScore >= pass.config.confidenceThreshold) {
        const applyResult = await this.healingEngine.applyHealingActions(actionBatch.id);
        actionsApplied = applyResult.applied;
      }
      
      const result: HealingPassResult = {
        passId: pass.id,
        success: true,
        actionsGenerated: actionBatch.actions.length,
        actionsApplied,
        improvementScore,
        processingTimeMs: Date.now() - passStartTime,
        dependenciesSatisfied: true,
        batchId: actionBatch.id
      };
      
      this.emitEvent('healing:pass:completed', {
        executionId,
        passId: pass.id,
        result,
        correlationId: passCorrelationId,
        timestamp: new Date()
      });
      
      return result;
      
    } catch (error) {
      const result: HealingPassResult = {
        passId: pass.id,
        success: false,
        actionsGenerated: 0,
        actionsApplied: 0,
        improvementScore: 0,
        processingTimeMs: Date.now() - passStartTime,
        dependenciesSatisfied: false,
        error: error instanceof Error ? error.message : String(error)
      };
      
      this.emitEvent('healing:pass:failed', {
        executionId,
        passId: pass.id,
        error: result.error,
        correlationId: `${executionId}_${pass.id}`,
        timestamp: new Date()
      });
      
      return result;
    }
  }

  /**
   * Create an execution plan for passes
   */
  private createExecutionPlan(passes: HealingPass[]): HealingPassExecutionPlan {
    // Build dependency graph
    const dependencyGraph = new Map<string, string[]>();
    const reverseDependencyGraph = new Map<string, string[]>();
    
    passes.forEach(pass => {
      const dependencies: string[] = [];
      const dependents: string[] = [];
      
      // Find dependencies
      pass.dependencies.forEach(dep => {
        if (dep.required && dep.type === 'requires') {
          dependencies.push(dep.passId);
        }
      });
      
      // Find dependents (who depends on this pass)
      passes.forEach(otherPass => {
        if (otherPass.id !== pass.id) {
          const depends = otherPass.dependencies.some(
            dep => dep.passId === pass.id && dep.required && dep.type === 'requires'
          );
          if (depends) {
            dependents.push(otherPass.id);
          }
        }
      });
      
      dependencyGraph.set(pass.id, dependencies);
      reverseDependencyGraph.set(pass.id, dependents);
    });
    
    // Topological sort for execution order
    const executionOrder: string[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();
    
    const visit = (passId: string) => {
      if (temp.has(passId)) {
        throw new Error(`Circular dependency detected involving pass ${passId}`);
      }
      
      if (!visited.has(passId)) {
        temp.add(passId);
        
        const dependencies = dependencyGraph.get(passId) || [];
        dependencies.forEach(depId => {
          if (passes.some(p => p.id === depId)) {
            visit(depId);
          }
        });
        
        temp.delete(passId);
        visited.add(passId);
        executionOrder.push(passId);
      }
    };
    
    // Start with passes that have no dependencies
    const noDependencyPasses = passes.filter(pass => {
      const deps = dependencyGraph.get(pass.id) || [];
      return deps.length === 0 || deps.every(depId => !passes.some(p => p.id === depId));
    });
    
    noDependencyPasses.forEach(pass => visit(pass.id));
    
    // Visit remaining passes
    passes.forEach(pass => {
      if (!visited.has(pass.id)) {
        visit(pass.id);
      }
    });
    
    // Check if passes can execute in parallel
    let canExecuteInParallel = true;
    for (const pass of passes) {
      const dependents = reverseDependencyGraph.get(pass.id) || [];
      if (dependents.length > 0) {
        canExecuteInParallel = false;
        break;
      }
    }
    
    // Estimate time (simple heuristic)
    const estimatedTimeMs = passes.length * 5000; // 5 seconds per pass
    
    return {
      passes,
      executionOrder,
      dependencies: dependencyGraph,
      estimatedTimeMs,
      canExecuteInParallel: canExecuteInParallel && this.config.strategy !== 'sequential'
    };
  }

  /**
   * Group passes for parallel execution
   */
  private groupPassesForParallelExecution(plan: HealingPassExecutionPlan): string[][] {
    if (!plan.canExecuteInParallel) {
      // Return groups of one (sequential)
      return plan.executionOrder.map(id => [id]);
    }
    
    const groups: string[][] = [];
    const visited = new Set<string>();
    
    // Simple grouping: passes without dependencies can run together
    const independentPasses: string[] = [];
    const dependentPasses: string[] = [];
    
    plan.executionOrder.forEach(passId => {
      const deps = plan.dependencies.get(passId) || [];
      if (deps.length === 0) {
        independentPasses.push(passId);
      } else {
        dependentPasses.push(passId);
      }
    });
    
    // Group independent passes (respecting parallel limit)
    if (independentPasses.length > 0) {
      const groupSize = Math.min(this.config.parallelLimit, independentPasses.length);
      for (let i = 0; i < independentPasses.length; i += groupSize) {
        groups.push(independentPasses.slice(i, i + groupSize));
      }
    }
    
    // Dependent passes run sequentially
    dependentPasses.forEach(passId => {
      groups.push([passId]);
    });
    
    return groups;
  }

  /**
   * Check if all dependencies for a pass are satisfied
   */
  private checkDependencies(passId: string): boolean {
    if (!this.config.enableDependencyTracking) {
      return true;
    }
    
    const pass = this.passes.get(passId);
    if (!pass) return false;
    
    for (const dependency of pass.dependencies) {
      if (dependency.required && dependency.type === 'requires') {
        const result = this.passResults.get(dependency.passId);
        if (!result || !result.success) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Configure healing engine for a specific pass
   */
  private configureHealingEngineForPass(pass: HealingPass): void {
    // Configure detector and generator based on pass config
    // This is a placeholder - actual implementation would configure the healing engine
    // For now, we'll just emit an event
    this.emitEvent('healing:pass:configured', {
      passId: pass.id,
      config: pass.config,
      timestamp: new Date()
    });
  }

  /**
   * Calculate improvement score for an action batch
   */
  private calculateImprovementScore(actionBatch: SelfHealingActionBatch): number {
    if (actionBatch.actions.length === 0) {
      return 0;
    }
    
    // Calculate average confidence of actions
    const totalConfidence = actionBatch.actions.reduce((sum, action) => {
      return sum + (action.source.confidence || 0.5);
    }, 0);
    
    const avgConfidence = totalConfidence / actionBatch.actions.length;
    
    // Weight by severity
    const severityWeights: Record<string, number> = {
      'critical': 1.0,
      'high': 0.8,
      'medium': 0.6,
      'low': 0.4
    };
    
    const severityScore = actionBatch.actions.reduce((sum, action) => {
      return sum + (severityWeights[action.severity] || 0.5);
    }, 0) / actionBatch.actions.length;
    
    // Combine scores
    return (avgConfidence * 0.6) + (severityScore * 0.4);
  }

  /**
   * Emit an event
   */
  private emitEvent(eventName: string, data: any): void {
    const listeners = this.eventListeners.get(eventName) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }

  /**
   * Add event listener
   */
  public on(eventName: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventName) || [];
    listeners.push(listener);
    this.eventListeners.set(eventName, listeners);
  }

  /**
   * Remove event listener
   */
  public off(eventName: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventName) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
    this.eventListeners.set(eventName, listeners);
  }

  /**
   * Get pass by ID
   */
  public getPass(passId: string): HealingPass | undefined {
    return this.passes.get(passId);
  }

  /**
   * Get all passes
   */
  public getAllPasses(): HealingPass[] {
    return Array.from(this.passes.values());
  }

  /**
   * Get pass result by ID
   */
  public getPassResult(passId: string): HealingPassResult | undefined {
    return this.passResults.get(passId);
  }

  /**
   * Get all pass results
   */
  public getAllPassResults(): HealingPassResult[] {
    return Array.from(this.passResults.values());
  }

  /**
   * Clear all pass results
   */
  public clearPassResults(): void {
    this.passResults.clear();
  }

  /**
   * Get execution statistics
   */
  public getStatistics(): {
    totalPasses: number;
    executedPasses: number;
    successfulPasses: number;
    averageImprovementScore: number;
    totalProcessingTimeMs: number;
  } {
    const results = this.getAllPassResults();
    const executedPasses = results.length;
    const successfulPasses = results.filter(r => r.success).length;
    const totalProcessingTime = results.reduce((sum, r) => sum + r.processingTimeMs, 0);
    const avgImprovement = results.length > 0
      ? results.reduce((sum, r) => sum + r.improvementScore, 0) / results.length
      : 0;
    
    return {
      totalPasses: this.passes.size,
      executedPasses,
      successfulPasses,
      averageImprovementScore: avgImprovement,
      totalProcessingTimeMs: totalProcessingTime
    };
  }

  /**
   * Reset manager state
   */
  public reset(): void {
    this.passResults.clear();
    this.eventListeners.clear();
  }
}
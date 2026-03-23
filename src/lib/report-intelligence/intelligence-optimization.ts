/**
 * Intelligence Optimization interfaces
 * 
 * Defines the interfaces for PHASE_20: Report Intelligence Optimization
 */
export interface OptimizationConfig {
  /**
   * Optimization enabled
   */
  enabled: boolean;

  /**
   * Maximum optimization iterations
   */
  maxIterations: number;

  /**
   * Optimization timeout
   */
  timeout: number; // in seconds

  /**
   * Optimization algorithm
   */
  algorithm: 'gradient_descent' | 'genetic_algorithm' | 'simulated_annealing' | 'particle_swarm';

  /**
   * Optimization parameters
   */
  parameters: Record<string, any>;

  /**
   * Optimization constraints
   */
  constraints: OptimizationConstraint[];

  /**
   * Optimization objectives
   */
  objectives: OptimizationObjective[];

  /**
   * Optimization metrics
   */
  metrics: OptimizationMetric[];
}

export interface OptimizationConstraint {
  /**
   * Constraint name
   */
  name: string;

  /**
   * Constraint type
   */
  type: 'equality' | 'inequality' | 'range' | 'custom';

  /**
   * Constraint expression
   */
  expression: string;

  /**
   * Constraint weight
   */
  weight: number;

  /**
   * Constraint enabled
   */
  enabled: boolean;
}

export interface OptimizationObjective {
  /**
   * Objective name
   */
  name: string;

  /**
   * Objective type
   */
  type: 'minimize' | 'maximize';

  /**
   * Objective expression
   */
  expression: string;

  /**
   * Objective weight
   */
  weight: number;

  /**
   * Objective target
   */
  target?: number;

  /**
   * Objective enabled
   */
  enabled: boolean;
}

export interface OptimizationMetric {
  /**
   * Metric name
   */
  name: string;

  /**
   * Metric expression
   */
  expression: string;

  /**
   * Metric type
   */
  type: 'scalar' | 'vector' | 'matrix';

  /**
   * Metric aggregation
   */
  aggregation: 'sum' | 'average' | 'max' | 'min' | 'custom';

  /**
   * Metric enabled
   */
  enabled: boolean;
}

export interface OptimizationResult {
  /**
   * Result ID
   */
  resultId: string;

  /**
   * Status
   */
  status: 'success' | 'failed' | 'timeout' | 'converged';

  /**
   * Optimal solution
   */
  solution: Record<string, number>;

  /**
   * Objective value
   */
  objectiveValue: number;

  /**
   * Constraint violations
   */
  constraintViolations: Record<string, number>;

  /**
   * Metrics values
   */
  metricsValues: Record<string, number>;

  /**
   * Iteration count
   */
  iterationCount: number;

  /**
   * Execution time
   */
  executionTime: number; // in milliseconds

  /**
   * Timestamp
   */
  timestamp: string;

  /**
   * Metadata
   */
  metadata: {
    algorithm: string;
    convergence: boolean;
    tolerance: number;
    initialSolution: Record<string, number>;
    finalSolution: Record<string, number>;
  };
}

export interface OptimizationIteration {
  /**
   * Iteration number
   */
  iteration: number;

  /**
   * Current solution
   */
  solution: Record<string, number>;

  /**
   * Objective value
   */
  objectiveValue: number;

  /**
   * Constraint violations
   */
  constraintViolations: Record<string, number>;

  /**
   * Metrics values
   */
  metricsValues: Record<string, number>;

  /**
   * Timestamp
   */
  timestamp: string;
}

export interface OptimizationHistory {
  /**
   * History ID
   */
  historyId: string;

  /**
   * Optimization ID
   */
  optimizationId: string;

  /**
   * Iterations
   */
  iterations: OptimizationIteration[];

  /**
   * Best solution
   */
  bestSolution: Record<string, number>;

  /**
   * Best objective value
   */
  bestObjectiveValue: number;

  /**
   * Convergence history
   */
  convergenceHistory: number[];

  /**
   * Timestamp
   */
  timestamp: string;
}

export interface OptimizationAnalysis {
  /**
   * Analysis ID
   */
  analysisId: string;

  /**
   * Optimization ID
   */
  optimizationId: string;

  /**
   * Analysis type
   */
  type: 'sensitivity' | 'robustness' | 'tradeoff' | 'convergence';

  /**
   * Analysis results
   */
  results: Record<string, any>;

  /**
   * Insights
   */
  insights: string[];

  /**
   * Recommendations
  */
  recommendations: string[];

  /**
   * Timestamp
   */
  timestamp: string;
}

/**
 * Intelligence Optimization class
 * 
 * Implements PHASE_20: Report Intelligence Optimization from the Phase Compliance Package.
 * Provides comprehensive optimization capabilities for the Report Intelligence System.
 */
export class IntelligenceOptimization {
  /**
   * Optimization configuration
   */
  private config: OptimizationConfig;

  /**
   * Optimization results
   */
  private results: Map<string, OptimizationResult> = new Map();

  /**
   * Optimization history
   */
  private history: Map<string, OptimizationHistory> = new Map();

  /**
   * Optimization analysis
   */
  private analysis: Map<string, OptimizationAnalysis> = new Map();

  /**
   * Event handlers
   */
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * Initialize the Intelligence Optimization system
   */
  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      enabled: true,
      maxIterations: 100,
      timeout: 300, // 5 minutes
      algorithm: 'gradient_descent',
      parameters: {
        learningRate: 0.01,
        tolerance: 1e-6,
        patience: 10
      },
      constraints: [],
      objectives: [],
      metrics: [],
      ...config
    };

    this.initializeDefaultConstraints();
    this.initializeDefaultObjectives();
    this.initializeDefaultMetrics();
  }

  /**
   * Optimize a solution
   * @param optimizationId - Optimization ID
   * @param initialSolution - Initial solution
   * @param config - Optimization configuration override
   * @returns Optimization result
   */
  async optimize(
    optimizationId: string,
    initialSolution: Record<string, number>,
    config?: Partial<OptimizationConfig>
  ): Promise<OptimizationResult> {
    const startTime = Date.now();
    const optimizationConfig = { ...this.config, ...config };

    if (!optimizationConfig.enabled) {
      throw new Error('Optimization is disabled');
    }

    const resultId = `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const history: OptimizationHistory = {
      historyId: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      optimizationId,
      iterations: [],
      bestSolution: { ...initialSolution },
      bestObjectiveValue: Infinity,
      convergenceHistory: [],
      timestamp: new Date().toISOString()
    };

    try {
      let currentSolution = { ...initialSolution };
      let bestSolution = { ...initialSolution };
      let bestObjectiveValue = Infinity;
      let iterations = 0;
      let patience = 0;
      let converged = false;

      // Initialize history
      const initialIteration: OptimizationIteration = {
        iteration: 0,
        solution: { ...currentSolution },
        objectiveValue: await this.evaluateObjectives(currentSolution),
        constraintViolations: await this.evaluateConstraints(currentSolution),
        metricsValues: await this.evaluateMetrics(currentSolution),
        timestamp: new Date().toISOString()
      };

      history.iterations.push(initialIteration);
      history.bestSolution = { ...currentSolution };
      history.bestObjectiveValue = initialIteration.objectiveValue;
      history.convergenceHistory.push(initialIteration.objectiveValue);

      this.emit('optimizationStarted', {
        optimizationId,
        resultId,
        initialSolution
      });

      // Main optimization loop
      while (iterations < optimizationConfig.maxIterations && !converged) {
        iterations++;

        // Check timeout
        if (Date.now() - startTime > optimizationConfig.timeout * 1000) {
          throw new Error('Optimization timeout');
        }

        // Generate new solution based on algorithm
        const newSolution = await this.generateSolution(
          currentSolution,
          optimizationConfig.algorithm,
          optimizationConfig.parameters
        );

        // Evaluate new solution
        const objectiveValue = await this.evaluateObjectives(newSolution);
        const constraintViolations = await this.evaluateConstraints(newSolution);
        const metricsValues = await this.evaluateMetrics(newSolution);

        // Check if new solution is better
        const isBetter = this.isBetterSolution(
          newSolution,
          currentSolution,
          objectiveValue,
          constraintViolations,
          optimizationConfig.objectives
        );

        if (isBetter) {
          currentSolution = newSolution;
          
          // Update best solution
          if (objectiveValue < bestObjectiveValue) {
            bestSolution = { ...currentSolution };
            bestObjectiveValue = objectiveValue;
            patience = 0;
          } else {
            patience++;
          }

          // Check convergence
          if (iterations > 1) {
            const improvement = Math.abs(
              history.iterations[history.iterations.length - 1].objectiveValue - objectiveValue
            );
            
            if (improvement < optimizationConfig.parameters.tolerance) {
              patience++;
              if (patience >= optimizationConfig.parameters.patience) {
                converged = true;
              }
            }
          }
        } else {
          patience++;
          if (patience >= optimizationConfig.parameters.patience) {
            converged = true;
          }
        }

        // Record iteration
        const iterationRecord: OptimizationIteration = {
          iteration: iterations,
          solution: { ...currentSolution },
          objectiveValue,
          constraintViolations,
          metricsValues,
          timestamp: new Date().toISOString()
        };

        history.iterations.push(iterationRecord);
        history.convergenceHistory.push(objectiveValue);

        // Update best solution in history
        if (objectiveValue < history.bestObjectiveValue) {
          history.bestSolution = { ...currentSolution };
          history.bestObjectiveValue = objectiveValue;
        }

        this.emit('optimizationIteration', {
          optimizationId,
          iteration: iterationRecord,
          isBetter
        });
      }

      // Create final result
      const result: OptimizationResult = {
        resultId,
        status: converged ? 'converged' : iterations >= optimizationConfig.maxIterations ? 'failed' : 'success',
        solution: bestSolution,
        objectiveValue: bestObjectiveValue,
        constraintViolations: await this.evaluateConstraints(bestSolution),
        metricsValues: await this.evaluateMetrics(bestSolution),
        iterationCount: iterations,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: {
          algorithm: optimizationConfig.algorithm,
          convergence: converged,
          tolerance: optimizationConfig.parameters.tolerance,
          initialSolution,
          finalSolution: bestSolution
        }
      };

      // Store results
      this.results.set(resultId, result);
      this.history.set(history.historyId, history);

      this.emit('optimizationCompleted', {
        optimizationId,
        result
      });

      return result;
    } catch (error) {
      const result: OptimizationResult = {
        resultId,
        status: 'failed',
        solution: bestSolution,
        objectiveValue: bestObjectiveValue,
        constraintViolations: await this.evaluateConstraints(bestSolution),
        metricsValues: await this.evaluateMetrics(bestSolution),
        iterationCount: iterations,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: {
          algorithm: optimizationConfig.algorithm,
          convergence: false,
          tolerance: optimizationConfig.parameters.tolerance,
          initialSolution,
          finalSolution: bestSolution
        }
      };

      this.results.set(resultId, result);
      this.history.set(history.historyId, history);

      this.emit('optimizationFailed', {
        optimizationId,
        result,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return result;
    }
  }

  /**
   * Generate a new solution based on algorithm
   * @param currentSolution - Current solution
   * @param algorithm - Optimization algorithm
   * @param parameters - Algorithm parameters
   * @returns New solution
   */
  private async generateSolution(
    currentSolution: Record<string, number>,
    algorithm: OptimizationConfig['algorithm'],
    parameters: Record<string, any>
  ): Promise<Record<string, number>> {
    switch (algorithm) {
      case 'gradient_descent':
        return this.generateGradientDescentSolution(currentSolution, parameters);
      case 'genetic_algorithm':
        return this.generateGeneticAlgorithmSolution(currentSolution, parameters);
      case 'simulated_annealing':
        return this.generateSimulatedAnnealingSolution(currentSolution, parameters);
      case 'particle_swarm':
        return this.generateParticleSwarmSolution(currentSolution, parameters);
      default:
        throw new Error(`Unknown optimization algorithm: ${algorithm}`);
    }
  }

  /**
   * Generate gradient descent solution
   * @param currentSolution - Current solution
   * @param parameters - Algorithm parameters
   * @returns New solution
   */
  private async generateGradientDescentSolution(
    currentSolution: Record<string, number>,
    parameters: Record<string, any>
  ): Promise<Record<string, number>> {
    const learningRate = parameters.learningRate || 0.01;
    const newSolution: Record<string, number> = {};

    // Calculate gradient (simplified)
    for (const [key, value] of Object.entries(currentSolution)) {
      // Simple gradient approximation
      const gradient = (await this.evaluateObjectives({ ...currentSolution, [key]: value + 0.001 }) -
                       await this.evaluateObjectives({ ...currentSolution, [key]: value - 0.001 })) / 0.002;
      
      newSolution[key] = value - learningRate * gradient;
    }

    return newSolution;
  }

  /**
   * Generate genetic algorithm solution
   * @param currentSolution - Current solution
   * @param parameters - Algorithm parameters
   * @returns New solution
   */
  private async generateGeneticAlgorithmSolution(
    currentSolution: Record<string, number>,
    parameters: Record<string, any>
  ): Promise<Record<string, number>> {
    const mutationRate = parameters.mutationRate || 0.1;
    const newSolution: Record<string, number> = { ...currentSolution };

    // Mutation
    for (const key of Object.keys(newSolution)) {
      if (Math.random() < mutationRate) {
        newSolution[key] += (Math.random() - 0.5) * 0.1;
      }
    }

    return newSolution;
  }

  /**
   * Generate simulated annealing solution
   * @param currentSolution - Current solution
   * @param parameters - Algorithm parameters
   * @returns New solution
   */
  private async generateSimulatedAnnealingSolution(
    currentSolution: Record<string, number>,
    parameters: Record<string, any>
  ): Promise<Record<string, number>> {
    const temperature = parameters.temperature || 1.0;
    const coolingRate = parameters.coolingRate || 0.95;
    const newSolution: Record<string, number> = {};

    // Generate neighbor solution
    for (const [key, value] of Object.entries(currentSolution)) {
      newSolution[key] = value + (Math.random() - 0.5) * temperature;
    }

    return newSolution;
  }

  /**
   * Generate particle swarm solution
   * @param currentSolution - Current solution
   * @param parameters - Algorithm parameters
   * @returns New solution
   */
  private async generateParticleSwarmSolution(
    currentSolution: Record<string, number>,
    parameters: Record<string, any>
  ): Promise<Record<string, number>> {
    const inertia = parameters.inertia || 0.7;
    const cognitive = parameters.cognitive || 1.5;
    const social = parameters.social || 1.5;
    
    // Simplified particle swarm update
    const newSolution: Record<string, number> = {};

    for (const [key, value] of Object.entries(currentSolution)) {
      // Random velocity components
      const cognitiveComponent = (Math.random() - 0.5) * cognitive;
      const socialComponent = (Math.random() - 0.5) * social;
      
      newSolution[key] = inertia * value + cognitiveComponent + socialComponent;
    }

    return newSolution;
  }

  /**
   * Evaluate objectives
   * @param solution - Solution to evaluate
   * @returns Objective value
   */
  private async evaluateObjectives(solution: Record<string, number>): Promise<number> {
    let totalValue = 0;

    for (const objective of this.config.objectives) {
      if (!objective.enabled) {
        continue;
      }

      // Simplified objective evaluation
      let objectiveValue = 0;
      
      switch (objective.name) {
        case 'accuracy':
          objectiveValue = solution.accuracy || 0;
          break;
        case 'speed':
          objectiveValue = 1 / (solution.speed || 1);
          break;
        case 'cost':
          objectiveValue = solution.cost || 0;
          break;
        default:
          // Use expression evaluation (simplified)
          objectiveValue = this.evaluateExpression(objective.expression, solution);
      }

      // Apply weight
      totalValue += objectiveValue * objective.weight;
    }

    return totalValue;
  }

  /**
   * Evaluate constraints
   * @param solution - Solution to evaluate
   * @returns Constraint violations
   */
  private async evaluateConstraints(solution: Record<string, number>): Promise<Record<string, number>> {
    const violations: Record<string, number> = {};

    for (const constraint of this.config.constraints) {
      if (!constraint.enabled) {
        continue;
      }

      // Simplified constraint evaluation
      let constraintValue = 0;
      
      switch (constraint.type) {
        case 'equality':
          constraintValue = Math.abs(this.evaluateExpression(constraint.expression, solution));
          break;
        case 'inequality':
          constraintValue = Math.max(0, this.evaluateExpression(constraint.expression, solution));
          break;
        case 'range':
          constraintValue = this.evaluateRangeConstraint(constraint.expression, solution);
          break;
        default:
          constraintValue = Math.abs(this.evaluateExpression(constraint.expression, solution));
      }

      violations[constraint.name] = constraintValue * constraint.weight;
    }

    return violations;
  }

  /**
   * Evaluate metrics
   * @param solution - Solution to evaluate
   * @returns Metrics values
   */
  private async evaluateMetrics(solution: Record<string, number>): Promise<Record<string, number>> {
    const values: Record<string, number> = {};

    for (const metric of this.config.metrics) {
      if (!metric.enabled) {
        continue;
      }

      // Simplified metric evaluation
      let metricValue = this.evaluateExpression(metric.expression, solution);

      // Apply aggregation
      switch (metric.aggregation) {
        case 'sum':
          metricValue = metricValue;
          break;
        case 'average':
          metricValue = metricValue / Object.keys(solution).length;
          break;
        case 'max':
          metricValue = Math.max(metricValue, 0);
          break;
        case 'min':
          metricValue = Math.min(metricValue, 0);
          break;
        default:
          metricValue = metricValue;
      }

      values[metric.name] = metricValue;
    }

    return values;
  }

  /**
   * Evaluate expression (simplified)
   * @param expression - Expression to evaluate
   * @param solution - Solution variables
   * @returns Evaluated value
   */
  private evaluateExpression(expression: string, solution: Record<string, number>): number {
    // Simplified expression evaluation
    // In a real implementation, this would use a proper expression parser
    
    try {
      // Replace variables with values
      let evalExpression = expression;
      for (const [key, value] of Object.entries(solution)) {
        evalExpression = evalExpression.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
      }

      // Evaluate simple arithmetic
      return Function(`"use strict"; return (${evalExpression})`)();
    } catch {
      return 0;
    }
  }

  /**
   * Evaluate range constraint
   * @param expression - Range expression
   * @param solution - Solution variables
   * @returns Constraint violation
   */
  private evaluateRangeConstraint(expression: string, solution: Record<string, number>): number {
    // Parse range expression (simplified)
    const match = expression.match(/(.+)\s*<\s*(.+)\s*<\s*(.+)/);
    if (!match) {
      return 0;
    }

    const [, lower, variable, upper] = match;
    
    try {
      const value = this.evaluateExpression(variable, solution);
      const lowerBound = this.evaluateExpression(lower, solution);
      const upperBound = this.evaluateExpression(upper, solution);
      
      if (value < lowerBound || value > upperBound) {
        return Math.min(Math.abs(value - lowerBound), Math.abs(value - upperBound));
      }
    } catch {
      // Ignore evaluation errors
    }

    return 0;
  }

  /**
   * Check if new solution is better
   * @param newSolution - New solution
   * @param currentSolution - Current solution
   * @param newObjectiveValue - New objective value
   * @param newConstraintViolations - New constraint violations
   * @param objectives - Optimization objectives
   * @returns Whether new solution is better
   */
  private isBetterSolution(
    newSolution: Record<string, number>,
    currentSolution: Record<string, number>,
    newObjectiveValue: number,
    newConstraintViolations: Record<string, number>,
    objectives: OptimizationObjective[]
  ): boolean {
    const currentObjectiveValue = 0; // Simplified
    const currentConstraintViolations = {}; // Simplified

    // Check constraint violations
    let newTotalViolation = 0;
    let currentTotalViolation = 0;

    for (const constraint of this.config.constraints) {
      if (constraint.enabled) {
        newTotalViolation += newConstraintViolations[constraint.name] || 0;
        currentTotalViolation += currentConstraintViolations[constraint.name] || 0;
      }
    }

    // New solution is better if it has fewer constraint violations
    if (newTotalViolation < currentTotalViolation) {
      return true;
    }

    // If constraint violations are equal, compare objective values
    if (newTotalViolation === currentTotalViolation) {
      return newObjectiveValue < currentObjectiveValue;
    }

    return false;
  }

  /**
   * Get optimization result
   * @param resultId - Result ID
   * @returns Optimization result or undefined
   */
  getResult(resultId: string): OptimizationResult | undefined {
    return this.results.get(resultId);
  }

  /**
   * Get optimization results
   * @param filters - Result filters
   * @returns Array of optimization results
   */
  getResults(filters?: {
    status?: OptimizationResult['status'];
    optimizationId?: string;
    startDate?: string;
    endDate?: string;
  }): OptimizationResult[] {
    let results = Array.from(this.results.values());

    if (filters) {
      if (filters.status) {
        results = results.filter(result => result.status === filters.status);
      }
      if (filters.optimizationId) {
        results = results.filter(result => result.metadata.finalSolution['optimizationId'] === filters.optimizationId);
      }
      if (filters.startDate) {
        results = results.filter(result => result.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        results = results.filter(result => result.timestamp <= filters.endDate!);
      }
    }

    return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get optimization history
   * @param historyId - History ID
   * @returns Optimization history or undefined
   */
  getHistory(historyId: string): OptimizationHistory | undefined {
    return this.history.get(historyId);
  }

  /**
   * Get optimization analysis
   * @param analysisId - Analysis ID
   * @returns Optimization analysis or undefined
   */
  getAnalysis(analysisId: string): OptimizationAnalysis | undefined {
    return this.analysis.get(analysisId);
  }

  /**
   * Perform sensitivity analysis
   * @param optimizationId - Optimization ID
   * @param resultId - Result ID
   * @returns Optimization analysis
   */
  async performSensitivityAnalysis(
    optimizationId: string,
    resultId: string
  ): Promise<OptimizationAnalysis> {
    const result = this.results.get(resultId);
    if (!result) {
      throw new Error('Optimization result not found');
    }

    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sensitivityResults: Record<string, any> = {};
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Perform sensitivity analysis for each parameter
    for (const [param, value] of Object.entries(result.solution)) {
      // Analyze parameter sensitivity
      const sensitivity = this.calculateParameterSensitivity(param, value, result);
      sensitivityResults[param] = sensitivity;

      // Generate insights
      if (sensitivity > 0.5) {
        insights.push(`Parameter '${param}' is highly sensitive to changes`);
      } else if (sensitivity > 0.2) {
        insights.push(`Parameter '${param}' shows moderate sensitivity`);
      }

      // Generate recommendations
      if (sensitivity > 0.3) {
        recommendations.push(`Consider tighter constraints for parameter '${param}'`);
      }
    }

    const analysis: OptimizationAnalysis = {
      analysisId,
      optimizationId,
      type: 'sensitivity',
      results: sensitivityResults,
      insights,
      recommendations,
      timestamp: new Date().toISOString()
    };

    this.analysis.set(analysisId, analysis);
    return analysis;
  }

  /**
   * Calculate parameter sensitivity
   * @param param - Parameter name
   * @param value - Parameter value
   * @param result - Optimization result
   * @returns Sensitivity value
   */
  private calculateParameterSensitivity(
    param: string,
    value: number,
    result: OptimizationResult
  ): number {
    // Simplified sensitivity calculation
    const delta = 0.01 * value;
    const originalSolution = { ...result.solution };
    const perturbedSolution = { ...originalSolution, [param]: value + delta };

    // Calculate objective value change
    const originalObjective = result.objectiveValue;
    const perturbedObjective = this.evaluateObjectives(perturbedSolution);

    return Math.abs((perturbedObjective - originalObjective) / delta);
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
   * Initialize default constraints
   */
  private initializeDefaultConstraints(): void {
    this.config.constraints = [
      {
        name: 'non_negative',
        type: 'inequality',
        expression: 'x >= 0',
        weight: 1.0,
        enabled: true
      },
      {
        name: 'sum_to_one',
        type: 'equality',
        expression: 'sum(x) = 1',
        weight: 1.0,
        enabled: true
      }
    ];
  }

  /**
   * Initialize default objectives
   */
  private initializeDefaultObjectives(): void {
    this.config.objectives = [
      {
        name: 'minimize_cost',
        type: 'minimize',
        expression: 'cost',
        weight: 1.0,
        enabled: true
      },
      {
        name: 'maximize_accuracy',
        type: 'maximize',
        expression: 'accuracy',
        weight: 1.0,
        enabled: true
      }
    ];
  }

  /**
   * Initialize default metrics
   */
  private initializeDefaultMetrics(): void {
    this.config.metrics = [
      {
        name: 'efficiency',
        expression: 'output / input',
        type: 'scalar',
        aggregation: 'average',
        enabled: true
      },
      {
        name: 'stability',
        expression: 'variance',
        type: 'scalar',
        aggregation: 'min',
        enabled: true
      }
    ];
  }

  /**
   * Update optimization configuration
   * @param config - New configuration
   */
  updateConfig(config: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get optimization configuration
   * @returns Current configuration
   */
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  /**
   * Clear optimization results
   */
  clearResults(): void {
    this.results.clear();
    this.history.clear();
    this.analysis.clear();
  }
}
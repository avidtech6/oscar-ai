/**
 * Benchmark Scenarios for Report Intelligence System
 * 
 * Predefined benchmarking scenarios for testing performance of Phase 1-10 components.
 * These scenarios cover component-level, workflow-level, and integration-level benchmarking.
 */

import { BenchmarkScenario, BenchmarkScenarioType, createDefaultScenario } from '../BenchmarkResult';

/**
 * Component Benchmark Scenarios
 * Individual component performance testing
 */
export const componentBenchmarkScenarios: BenchmarkScenario[] = [
  // Phase 1: Report Type Registry
  createDefaultScenario(
    BenchmarkScenarioType.COMPONENT,
    'phase-1-registry',
    'Registry Lookup Performance'
  ),
  
  // Phase 2: Report Decompiler Engine
  createDefaultScenario(
    BenchmarkScenarioType.COMPONENT,
    'phase-2-decompiler',
    'Decompiler Processing Performance'
  ),
  
  // Phase 3: Report Schema Mapper
  createDefaultScenario(
    BenchmarkScenarioType.COMPONENT,
    'phase-3-schema-mapper',
    'Schema Mapping Performance'
  ),
  
  // Phase 4: Schema Updater Engine
  createDefaultScenario(
    BenchmarkScenarioType.COMPONENT,
    'phase-4-schema-updater',
    'Schema Update Performance'
  ),
  
  // Phase 5: Report Style Learner
  createDefaultScenario(
    BenchmarkScenarioType.COMPONENT,
    'phase-5-style-learner',
    'Style Learning Performance'
  ),
  
  // Phase 6: Report Classification Engine
  createDefaultScenario(
    BenchmarkScenarioType.COMPONENT,
    'phase-6-classification',
    'Classification Performance'
  ),
  
  // Phase 7: Self-Healing Engine
  createDefaultScenario(
    BenchmarkScenarioType.COMPONENT,
    'phase-7-self-healing',
    'Self-Healing Performance'
  ),
  
  // Phase 8: Healing Orchestration
  createDefaultScenario(
    BenchmarkScenarioType.COMPONENT,
    'phase-8-healing-orchestration',
    'Healing Orchestration Performance'
  ),
  
  // Phase 9: Compliance Engine
  createDefaultScenario(
    BenchmarkScenarioType.COMPONENT,
    'phase-9-compliance',
    'Compliance Validation Performance'
  ),
  
  // Phase 10: Report Reproduction Tester
  createDefaultScenario(
    BenchmarkScenarioType.COMPONENT,
    'phase-10-reproduction-tester',
    'Reproduction Testing Performance'
  )
];

/**
 * Workflow Benchmark Scenarios
 * End-to-end workflow performance testing
 */
export const workflowBenchmarkScenarios: BenchmarkScenario[] = [
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.WORKFLOW,
      'full-report-processing',
      'Full Report Processing Workflow'
    ),
    description: 'Complete report processing workflow from decompilation to classification',
    configuration: {
      iterations: 5,
      warmupIterations: 1,
      timeoutMs: 60000,
      parallel: false,
      inputSize: 'large',
      workflowComponents: ['phase-2', 'phase-3', 'phase-6']
    },
    tags: ['workflow', 'end-to-end', 'performance']
  },
  
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.WORKFLOW,
      'schema-evolution-workflow',
      'Schema Evolution Workflow'
    ),
    description: 'Schema update and evolution workflow with gap detection',
    configuration: {
      iterations: 3,
      warmupIterations: 1,
      timeoutMs: 45000,
      parallel: false,
      inputSize: 'medium',
      workflowComponents: ['phase-3', 'phase-4']
    },
    tags: ['workflow', 'schema', 'evolution']
  },
  
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.WORKFLOW,
      'style-application-workflow',
      'Style Application Workflow'
    ),
    description: 'Style learning and application workflow',
    configuration: {
      iterations: 4,
      warmupIterations: 1,
      timeoutMs: 30000,
      parallel: false,
      inputSize: 'medium',
      workflowComponents: ['phase-5', 'phase-10']
    },
    tags: ['workflow', 'style', 'application']
  }
];

/**
 * Scalability Benchmark Scenarios
 * Performance testing with varying input sizes and complexities
 */
export const scalabilityBenchmarkScenarios: BenchmarkScenario[] = [
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.SCALABILITY,
      'small-report-scalability',
      'Small Report Scalability'
    ),
    description: 'Performance with small reports (1-5 pages)',
    configuration: {
      iterations: 10,
      warmupIterations: 2,
      timeoutMs: 30000,
      parallel: false,
      inputSize: 'small',
      reportCount: 10,
      pageRange: '1-5'
    },
    tags: ['scalability', 'small', 'lightweight']
  },
  
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.SCALABILITY,
      'medium-report-scalability',
      'Medium Report Scalability'
    ),
    description: 'Performance with medium reports (10-20 pages)',
    configuration: {
      iterations: 7,
      warmupIterations: 2,
      timeoutMs: 45000,
      parallel: false,
      inputSize: 'medium',
      reportCount: 7,
      pageRange: '10-20'
    },
    tags: ['scalability', 'medium', 'standard']
  },
  
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.SCALABILITY,
      'large-report-scalability',
      'Large Report Scalability'
    ),
    description: 'Performance with large reports (50+ pages)',
    configuration: {
      iterations: 3,
      warmupIterations: 1,
      timeoutMs: 90000,
      parallel: false,
      inputSize: 'large',
      reportCount: 3,
      pageRange: '50+'
    },
    tags: ['scalability', 'large', 'heavy']
  },
  
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.SCALABILITY,
      'batch-processing-scalability',
      'Batch Processing Scalability'
    ),
    description: 'Batch processing of multiple reports',
    configuration: {
      iterations: 5,
      warmupIterations: 1,
      timeoutMs: 120000,
      parallel: true,
      maxConcurrent: 3,
      inputSize: 'batch',
      batchSize: 10,
      concurrencyLevel: 3
    },
    tags: ['scalability', 'batch', 'parallel']
  }
];

/**
 * Stress Benchmark Scenarios
 * High-load and edge case testing
 */
export const stressBenchmarkScenarios: BenchmarkScenario[] = [
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.STRESS,
      'high-concurrency-stress',
      'High Concurrency Stress Test'
    ),
    description: 'Stress test with high concurrent requests',
    configuration: {
      iterations: 1,
      warmupIterations: 0,
      timeoutMs: 180000,
      parallel: true,
      maxConcurrent: 10,
      inputSize: 'stress',
      concurrentRequests: 10,
      durationSeconds: 30
    },
    tags: ['stress', 'concurrency', 'high-load']
  },
  
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.STRESS,
      'memory-intensive-stress',
      'Memory Intensive Stress Test'
    ),
    description: 'Stress test with memory-intensive operations',
    configuration: {
      iterations: 1,
      warmupIterations: 0,
      timeoutMs: 120000,
      parallel: false,
      inputSize: 'memory-intensive',
      memoryLoad: 'high',
      operationCount: 1000
    },
    tags: ['stress', 'memory', 'intensive']
  },
  
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.STRESS,
      'error-handling-stress',
      'Error Handling Stress Test'
    ),
    description: 'Stress test error handling and recovery',
    configuration: {
      iterations: 1,
      warmupIterations: 0,
      timeoutMs: 90000,
      parallel: false,
      inputSize: 'error-prone',
      errorRate: 0.3,
      recoveryAttempts: 3
    },
    tags: ['stress', 'error-handling', 'recovery']
  }
];

/**
 * Integration Benchmark Scenarios
 * Cross-component integration testing
 */
export const integrationBenchmarkScenarios: BenchmarkScenario[] = [
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.INTEGRATION,
      'registry-decompiler-integration',
      'Registry-Decompiler Integration'
    ),
    description: 'Integration between Phase 1 (Registry) and Phase 2 (Decompiler)',
    configuration: {
      iterations: 8,
      warmupIterations: 2,
      timeoutMs: 40000,
      parallel: false,
      inputSize: 'integration',
      integratedComponents: ['phase-1', 'phase-2'],
      dataFlow: 'registry->decompiler'
    },
    tags: ['integration', 'phase-1', 'phase-2']
  },
  
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.INTEGRATION,
      'decompiler-mapper-integration',
      'Decompiler-Mapper Integration'
    ),
    description: 'Integration between Phase 2 (Decompiler) and Phase 3 (Mapper)',
    configuration: {
      iterations: 8,
      warmupIterations: 2,
      timeoutMs: 50000,
      parallel: false,
      inputSize: 'integration',
      integratedComponents: ['phase-2', 'phase-3'],
      dataFlow: 'decompiler->mapper'
    },
    tags: ['integration', 'phase-2', 'phase-3']
  },
  
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.INTEGRATION,
      'mapper-updater-integration',
      'Mapper-Updater Integration'
    ),
    description: 'Integration between Phase 3 (Mapper) and Phase 4 (Updater)',
    configuration: {
      iterations: 6,
      warmupIterations: 1,
      timeoutMs: 60000,
      parallel: false,
      inputSize: 'integration',
      integratedComponents: ['phase-3', 'phase-4'],
      dataFlow: 'mapper->updater'
    },
    tags: ['integration', 'phase-3', 'phase-4']
  },
  
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.INTEGRATION,
      'full-system-integration',
      'Full System Integration'
    ),
    description: 'Complete system integration across all phases',
    configuration: {
      iterations: 3,
      warmupIterations: 1,
      timeoutMs: 180000,
      parallel: false,
      inputSize: 'full-system',
      integratedComponents: ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5', 'phase-6', 'phase-7', 'phase-8', 'phase-9', 'phase-10'],
      dataFlow: 'end-to-end'
    },
    tags: ['integration', 'full-system', 'end-to-end']
  }
];

/**
 * Regression Benchmark Scenarios
 * Performance regression testing
 */
export const regressionBenchmarkScenarios: BenchmarkScenario[] = [
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.REGRESSION,
      'baseline-regression',
      'Baseline Performance Regression'
    ),
    description: 'Regression testing against performance baseline',
    configuration: {
      iterations: 10,
      warmupIterations: 2,
      timeoutMs: 30000,
      parallel: false,
      inputSize: 'regression',
      baselineVersion: '1.0.0',
      comparisonThreshold: 0.1 // 10% performance regression threshold
    },
    tags: ['regression', 'baseline', 'comparison']
  },
  
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.REGRESSION,
      'version-comparison-regression',
      'Version Comparison Regression'
    ),
    description: 'Regression testing between different versions',
    configuration: {
      iterations: 8,
      warmupIterations: 2,
      timeoutMs: 40000,
      parallel: false,
      inputSize: 'regression',
      compareVersions: ['1.0.0', '1.1.0'],
      metricThresholds: {
        executionTime: 0.15, // 15% threshold
        memoryUsage: 0.20,   // 20% threshold
        cpuUsage: 0.25       // 25% threshold
      }
    },
    tags: ['regression', 'version', 'comparison']
  }
];

/**
 * Custom Benchmark Scenarios
 * User-defined custom scenarios
 */
export const customBenchmarkScenarios: BenchmarkScenario[] = [
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.CUSTOM,
      'custom-workflow-optimization',
      'Custom Workflow Optimization'
    ),
    description: 'Custom scenario for workflow optimization testing',
    configuration: {
      iterations: 12,
      warmupIterations: 3,
      timeoutMs: 75000,
      parallel: true,
      maxConcurrent: 4,
      inputSize: 'custom',
      optimizationTarget: 'workflow-efficiency',
      customParameters: {
        cacheEnabled: true,
        batchSize: 5,
        compressionLevel: 'medium'
      }
    },
    tags: ['custom', 'optimization', 'workflow']
  },
  
  {
    ...createDefaultScenario(
      BenchmarkScenarioType.CUSTOM,
      'custom-memory-profiling',
      'Custom Memory Profiling'
    ),
    description: 'Custom scenario for memory profiling and optimization',
    configuration: {
      iterations: 15,
      warmupIterations: 3,
      timeoutMs: 90000,
      parallel: false,
      inputSize: 'custom',
      profilingTarget: 'memory-usage',
      customParameters: {
        heapSnapshot: true,
        garbageCollection: 'aggressive',
        memoryLimitMB: 512
      }
    },
    tags: ['custom', 'profiling', 'memory']
  }
];

/**
 * All benchmark scenarios combined
 */
export const allBenchmarkScenarios: BenchmarkScenario[] = [
  ...componentBenchmarkScenarios,
  ...workflowBenchmarkScenarios,
  ...scalabilityBenchmarkScenarios,
  ...stressBenchmarkScenarios,
  ...integrationBenchmarkScenarios,
  ...regressionBenchmarkScenarios,
  ...customBenchmarkScenarios
];

/**
 * Get scenarios by type
 */
export function getScenariosByType(type: BenchmarkScenarioType): BenchmarkScenario[] {
  switch (type) {
    case BenchmarkScenarioType.COMPONENT:
      return componentBenchmarkScenarios;
    case BenchmarkScenarioType.WORKFLOW:
      return workflowBenchmarkScenarios;
    case BenchmarkScenarioType.SCALABILITY:
      return scalabilityBenchmarkScenarios;
    case BenchmarkScenarioType.STRESS:
      return stressBenchmarkScenarios;
    case BenchmarkScenarioType.INTEGRATION:
      return integrationBenchmarkScenarios;
    case BenchmarkScenarioType.REGRESSION:
      return regressionBenchmarkScenarios;
    case BenchmarkScenarioType.CUSTOM:
      return customBenchmarkScenarios;
    default:
      return allBenchmarkScenarios;
  }
}

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): BenchmarkScenario | undefined {
  return allBenchmarkScenarios.find(scenario => scenario.id === id);
}

/**
 * Get scenarios by target component
 */
export function getScenariosByTargetComponent(target: string): BenchmarkScenario[] {
  return allBenchmarkScenarios.filter(scenario => 
    scenario.targetComponent.includes(target)
  );
}

/**
 * Get scenarios by tag
 */
export function getScenariosByTag(tag: string): BenchmarkScenario[] {
  return allBenchmarkScenarios.filter(scenario => 
    scenario.tags.includes(tag)
  );
}

/**
 * Export all scenarios and utility functions
 */
export default {
  componentBenchmarkScenarios,
  workflowBenchmarkScenarios,
  scalabilityBenchmarkScenarios,
  stressBenchmarkScenarios,
  integrationBenchmarkScenarios,
  regressionBenchmarkScenarios,
  customBenchmarkScenarios,
  allBenchmarkScenarios,
  getScenariosByType,
  getScenarioById,
  getScenariosByTargetComponent,
  getScenariosByTag
};
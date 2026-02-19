/**
 * BenchmarkResult Interface System
 * 
 * Defines the foundational data structures for the Performance Benchmarking System.
 * This interface system provides type-safe definitions for benchmark results,
 * metric measurements, scenarios, and analysis results.
 */

/**
 * Benchmark Status Enum
 * Represents the status of a benchmark execution
 */
export enum BenchmarkStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  TIMED_OUT = 'timed_out',
  CANCELLED = 'cancelled'
}

/**
 * Metric Type Enum
 * Represents different types of performance metrics
 */
export enum MetricType {
  TIMING = 'timing',
  RESOURCE = 'resource',
  THROUGHPUT = 'throughput',
  LATENCY = 'latency',
  ERROR = 'error',
  SCALABILITY = 'scalability',
  CONSISTENCY = 'consistency',
  CUSTOM = 'custom'
}

/**
 * Benchmark Scenario Type
 * Represents different types of benchmarking scenarios
 */
export enum BenchmarkScenarioType {
  COMPONENT = 'component',
  WORKFLOW = 'workflow',
  SCALABILITY = 'scalability',
  STRESS = 'stress',
  INTEGRATION = 'integration',
  REGRESSION = 'regression',
  CUSTOM = 'custom'
}

/**
 * Metric Measurement
 * Represents a single measurement of a performance metric
 */
export interface MetricMeasurement {
  /** Unique identifier for this measurement */
  id: string;
  
  /** Type of metric being measured */
  metricType: MetricType;
  
  /** Name of the specific metric (e.g., 'execution_time', 'memory_usage') */
  metricName: string;
  
  /** Unit of measurement (e.g., 'ms', 'MB', 'requests/sec') */
  unit: string;
  
  /** Numeric value of the measurement */
  value: number;
  
  /** Minimum value observed (for aggregated measurements) */
  min?: number;
  
  /** Maximum value observed (for aggregated measurements) */
  max?: number;
  
  /** Average value (for aggregated measurements) */
  average?: number;
  
  /** Standard deviation (for aggregated measurements) */
  stdDev?: number;
  
  /** Percentile values (e.g., p50, p90, p95, p99) */
  percentiles?: Record<string, number>;
  
  /** Timestamp when measurement was taken */
  timestamp: Date;
  
  /** Additional metadata for this measurement */
  metadata?: Record<string, any>;
}

/**
 * Benchmark Scenario
 * Defines a benchmarking scenario with configuration and parameters
 */
export interface BenchmarkScenario {
  /** Unique identifier for this scenario */
  id: string;
  
  /** Type of benchmarking scenario */
  scenarioType: BenchmarkScenarioType;
  
  /** Human-readable name of the scenario */
  name: string;
  
  /** Description of what this scenario tests */
  description: string;
  
  /** Target component or phase being benchmarked */
  targetComponent: string;
  
  /** Configuration parameters for the scenario */
  configuration: {
    /** Number of iterations to run */
    iterations: number;
    
    /** Warm-up iterations before measurement */
    warmupIterations: number;
    
    /** Timeout in milliseconds */
    timeoutMs: number;
    
    /** Whether to run in parallel */
    parallel: boolean;
    
    /** Maximum concurrent executions */
    maxConcurrent?: number;
    
    /** Input data size or complexity */
    inputSize?: string;
    
    /** Additional scenario-specific configuration */
    [key: string]: any;
  };
  
  /** Tags for categorization and filtering */
  tags: string[];
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Benchmark Execution
 * Represents a single execution of a benchmark scenario
 */
export interface BenchmarkExecution {
  /** Unique identifier for this execution */
  id: string;
  
  /** Reference to the scenario being executed */
  scenarioId: string;
  
  /** Status of the execution */
  status: BenchmarkStatus;
  
  /** Start timestamp */
  startedAt: Date;
  
  /** Completion timestamp (if completed) */
  completedAt?: Date;
  
  /** Duration in milliseconds */
  durationMs?: number;
  
  /** Error information if execution failed */
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  
  /** System information where benchmark was run */
  systemInfo: {
    nodeVersion: string;
    platform: string;
    architecture: string;
    cpuCount: number;
    totalMemoryMB: number;
    [key: string]: any;
  };
  
  /** Resource usage during execution */
  resourceUsage?: {
    cpuUsagePercent: number;
    memoryUsageMB: number;
    heapUsedMB: number;
    heapTotalMB: number;
    [key: string]: any;
  };
  
  /** Additional execution metadata */
  metadata?: Record<string, any>;
}

/**
 * Benchmark Result
 * Complete result of a benchmark execution with measurements and analysis
 */
export interface BenchmarkResult {
  /** Unique identifier for this result */
  id: string;
  
  /** Reference to the execution */
  executionId: string;
  
  /** Reference to the scenario */
  scenarioId: string;
  
  /** Overall status of the benchmark */
  status: BenchmarkStatus;
  
  /** Summary scores and metrics */
  scores: {
    /** Overall performance score (0-100) */
    overallScore: number;
    
    /** Performance score relative to baseline */
    relativeScore?: number;
    
    /** Performance category (excellent, good, acceptable, poor) */
    performanceCategory: string;
    
    /** Whether performance meets requirements */
    meetsRequirements: boolean;
    
    /** Additional score breakdown by dimension */
    breakdown: Record<string, number>;
  };
  
  /** Individual metric measurements */
  measurements: MetricMeasurement[];
  
  /** Statistical analysis of measurements */
  statisticalAnalysis?: {
    /** Mean values by metric */
    means: Record<string, number>;
    
    /** Standard deviations by metric */
    stdDevs: Record<string, number>;
    
    /** Coefficient of variation by metric */
    coefficientsOfVariation: Record<string, number>;
    
    /** Confidence intervals (95%) by metric */
    confidenceIntervals: Record<string, { lower: number; upper: number }>;
    
    /** Trend analysis (improving, stable, degrading) */
    trends: Record<string, string>;
  };
  
  /** Comparison with baseline or previous results */
  comparison?: {
    /** Baseline result ID being compared against */
    baselineId?: string;
    
    /** Percentage change by metric */
    percentageChanges: Record<string, number>;
    
    /** Statistical significance of changes */
    significantChanges: Record<string, boolean>;
    
    /** Performance regression detected */
    regressionDetected: boolean;
    
    /** Regression severity (none, minor, major, critical) */
    regressionSeverity?: string;
  };
  
  /** Recommendations based on results */
  recommendations?: {
    /** Performance improvement suggestions */
    improvements: string[];
    
    /** Configuration optimizations */
    optimizations: string[];
    
    /** Issues to investigate */
    issues: string[];
    
    /** Priority levels for recommendations */
    priorities: Record<string, 'high' | 'medium' | 'low'>;
  };
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Tags for categorization */
  tags: string[];
  
  /** Additional result metadata */
  metadata?: Record<string, any>;
}

/**
 * Benchmark Suite
 * Collection of related benchmark scenarios
 */
export interface BenchmarkSuite {
  /** Unique identifier for this suite */
  id: string;
  
  /** Name of the benchmark suite */
  name: string;
  
  /** Description of the suite */
  description: string;
  
  /** Scenarios included in this suite */
  scenarioIds: string[];
  
  /** Execution order (sequential, parallel, mixed) */
  executionOrder: 'sequential' | 'parallel' | 'mixed';
  
  /** Suite-level configuration */
  configuration: {
    /** Stop on first failure */
    stopOnFailure: boolean;
    
    /** Generate comprehensive report */
    generateReport: boolean;
    
    /** Compare with baseline suite */
    compareWithBaseline: boolean;
    
    /** Additional suite-specific configuration */
    [key: string]: any;
  };
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Tags for categorization */
  tags: string[];
}

/**
 * Performance Baseline
 * Reference performance data for comparison
 */
export interface PerformanceBaseline {
  /** Unique identifier for this baseline */
  id: string;
  
  /** Name of the baseline */
  name: string;
  
  /** Description of what this baseline represents */
  description: string;
  
  /** Reference benchmark results */
  resultIds: string[];
  
  /** Baseline values by metric */
  baselineValues: Record<string, {
    value: number;
    unit: string;
    min: number;
    max: number;
    acceptableRange: { lower: number; upper: number };
  }>;
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Whether this is the active baseline */
  isActive: boolean;
  
  /** Tags for categorization */
  tags: string[];
}

/**
 * Helper Functions
 */

/**
 * Generate a unique ID for benchmark entities
 */
export function generateBenchmarkId(prefix: string = 'benchmark'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Determine performance category based on score
 */
export function determinePerformanceCategory(score: number): string {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'acceptable';
  return 'poor';
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Check if a change is statistically significant
 */
export function isStatisticallySignificant(
  currentMean: number,
  previousMean: number,
  currentStdDev: number,
  previousStdDev: number,
  sampleSize: number = 1
): boolean {
  // Simplified significance check (would use proper statistical test in production)
  const difference = Math.abs(currentMean - previousMean);
  const pooledStdDev = Math.sqrt((currentStdDev ** 2 + previousStdDev ** 2) / 2);
  const standardError = pooledStdDev / Math.sqrt(sampleSize);
  const zScore = difference / standardError;
  
  // 95% confidence level (z-score > 1.96)
  return zScore > 1.96;
}

/**
 * Create a default benchmark scenario
 */
export function createDefaultScenario(
  type: BenchmarkScenarioType,
  target: string,
  name: string
): BenchmarkScenario {
  const now = new Date();
  return {
    id: generateBenchmarkId('scenario'),
    scenarioType: type,
    name,
    description: `Benchmark scenario for ${target}`,
    targetComponent: target,
    configuration: {
      iterations: 10,
      warmupIterations: 2,
      timeoutMs: 30000,
      parallel: false,
      inputSize: 'medium'
    },
    tags: [type, target, 'default'],
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Create a default benchmark result
 */
export function createDefaultResult(
  executionId: string,
  scenarioId: string,
  status: BenchmarkStatus = BenchmarkStatus.COMPLETED
): BenchmarkResult {
  const now = new Date();
  const overallScore = status === BenchmarkStatus.COMPLETED ? 85 : 0;
  
  return {
    id: generateBenchmarkId('result'),
    executionId,
    scenarioId,
    status,
    scores: {
      overallScore,
      performanceCategory: determinePerformanceCategory(overallScore),
      meetsRequirements: overallScore >= 60,
      breakdown: {}
    },
    measurements: [],
    createdAt: now,
    tags: ['default']
  };
}

/**
 * Export all interfaces and enums
 */
export default {
  BenchmarkStatus,
  MetricType,
  BenchmarkScenarioType,
  MetricMeasurement,
  BenchmarkScenario,
  BenchmarkExecution,
  BenchmarkResult,
  BenchmarkSuite,
  PerformanceBaseline,
  generateBenchmarkId,
  determinePerformanceCategory,
  calculatePercentageChange,
  isStatisticallySignificant,
  createDefaultScenario,
  createDefaultResult
};

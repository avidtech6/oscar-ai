/**
 * TestResult interface
 * 
 * Represents the results of a single test operation.
 * This interface defines the structure for test outcomes and metadata.
 */
export interface TestResult {
  /**
   * Unique identifier for the test
   */
  testId: string;

  /**
   * Whether the test passed or failed
   * true if passed, false if failed
   */
  passed: boolean;

  /**
   * Array of error messages if the test failed
   * empty array if test passed
   */
  errors: string[];

  /**
   * Array of warning messages if issues were detected
   * can be non-empty even if test passed
   */
  warnings: string[];

  /**
   * Additional metadata about the test result
   * can include execution time, resource usage, environment info, etc.
   */
  metadata: Record<string, any>;

  /**
   * ISO timestamp when the test was completed
   */
  timestamp: string;

  /**
   * Duration of the test execution in milliseconds
   */
  duration?: number;

  /**
   * Test execution details
   * can include input data, output data, and execution context
   */
  execution?: {
    input: any;
    output: any;
    context: Record<string, any>;
  };
}
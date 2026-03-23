/**
 * ReproductionTest interface
 * 
 * Represents a single reproduction test with its parameters and results.
 * This interface defines the structure for testing report reproduction consistency.
 */
export interface ReproductionTest {
  /**
   * The type of reproduction test being performed
   * e.g., 'content', 'structure', 'formatting', 'layout'
   */
  testType: string;

  /**
   * Parameters used for the reproduction test
   * can include input data, settings, and configuration
   */
  parameters: Record<string, any>;

  /**
   * Expected results from the reproduction test
   * defines what the output should look like
   */
  expectedResults: Record<string, any>;

  /**
   * Actual results from the reproduction test
   * the actual output generated during testing
   */
  actualResults: Record<string, any>;

  /**
   * ISO timestamp when the reproduction test was performed
   */
  timestamp: string;

  /**
   * Additional metadata about the reproduction test
   * can include test configuration, environment info, etc.
   */
  metadata?: Record<string, any>;
}
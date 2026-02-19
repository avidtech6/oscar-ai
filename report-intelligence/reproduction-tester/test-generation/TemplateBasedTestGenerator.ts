/**
 * Phase 10: Report Reproduction Tester
 * TemplateBasedTestGenerator Class
 * 
 * Generates test cases from report templates for reproduction testing.
 */

import type { TestCase } from '../TestResult';
// Note: ReportTemplate import commented out as Phase 8 (Template Generator) may not be implemented yet
// import type { ReportTemplate } from '../../template-generator/ReportTemplate';
import type { ReportTypeRegistry } from '../../registry/ReportTypeRegistry';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

import { generateTestCaseId } from '../TestResult';

/**
 * Test generation configuration
 */
export interface TestGenerationConfig {
  generateEdgeCases: boolean;
  generateBoundaryCases: boolean;
  generateRandomVariations: boolean;
  variationCount: number;
  includeInvalidInputs: boolean;
  priorityDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: TestGenerationConfig = {
  generateEdgeCases: true,
  generateBoundaryCases: true,
  generateRandomVariations: true,
  variationCount: 5,
  includeInvalidInputs: false,
  priorityDistribution: {
    critical: 0.1,  // 10%
    high: 0.3,      // 30%
    medium: 0.5,    // 50%
    low: 0.1,       // 10%
  },
};

/**
 * Template field definition for test generation
 */
interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'rich_text';
  required: boolean;
  defaultValue?: any;
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

/**
 * Template section definition
 */
interface TemplateSection {
  id: string;
  name: string;
  required: boolean;
  repeatable: boolean;
  maxRepeat?: number;
  fields: TemplateField[];
}

/**
 * Main TemplateBasedTestGenerator class
 */
export class TemplateBasedTestGenerator {
  private registry?: ReportTypeRegistry;
  private config: TestGenerationConfig;
  
  constructor(registry?: ReportTypeRegistry, config?: Partial<TestGenerationConfig>) {
    this.registry = registry;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate test cases from a template
   */
  generateTestCasesFromTemplate(
    template: any, // Using any instead of ReportTemplate since Phase 8 may not be implemented
    baseName: string = 'Template Test'
  ): TestCase[] {
    const testCases: TestCase[] = [];
    
    // 1. Generate basic test case with default values
    const basicTestCase = this.generateBasicTestCase(template, baseName);
    testCases.push(basicTestCase);
    
    // 2. Generate edge cases if enabled
    if (this.config.generateEdgeCases) {
      const edgeCases = this.generateEdgeCases(template, baseName);
      testCases.push(...edgeCases);
    }
    
    // 3. Generate boundary cases if enabled
    if (this.config.generateBoundaryCases) {
      const boundaryCases = this.generateBoundaryCases(template, baseName);
      testCases.push(...boundaryCases);
    }
    
    // 4. Generate random variations if enabled
    if (this.config.generateRandomVariations) {
      const randomVariations = this.generateRandomVariations(template, baseName, this.config.variationCount);
      testCases.push(...randomVariations);
    }
    
    // 5. Generate invalid input cases if enabled
    if (this.config.includeInvalidInputs) {
      const invalidCases = this.generateInvalidInputCases(template, baseName);
      testCases.push(...invalidCases);
    }
    
    return testCases;
  }

  /**
   * Generate a basic test case with default values
   */
  private generateBasicTestCase(template: any, baseName: string): TestCase {
    const templateId = template.id || 'unknown_template';
    const inputData = this.extractDefaultInputData(template);
    
    return {
      id: generateTestCaseId(),
      name: `${baseName} - Basic`,
      description: `Basic test case for template ${templateId} with default values`,
      templateId,
      inputData,
      expectedOutputHash: undefined,
      expectedOutputStructure: this.extractExpectedStructure(template),
      generationParameters: {
        useDefaults: true,
        validationStrictness: 'strict',
      },
      priority: this.determinePriority('basic'),
      tags: ['basic', 'default_values', 'template_based'],
    };
  }

  /**
   * Generate edge cases
   */
  private generateEdgeCases(template: any, baseName: string): TestCase[] {
    const edgeCases: TestCase[] = [];
    const templateId = template.id || 'unknown_template';
    
    // Edge case 1: Minimal input
    const minimalInputData = this.generateMinimalInputData(template);
    edgeCases.push({
      id: generateTestCaseId(),
      name: `${baseName} - Minimal Input`,
      description: `Edge case with minimal required input for template ${templateId}`,
      templateId,
      inputData: minimalInputData,
      expectedOutputHash: undefined,
      expectedOutputStructure: this.extractExpectedStructure(template),
      generationParameters: {
        useDefaults: false,
        onlyRequired: true,
        validationStrictness: 'strict',
      },
      priority: this.determinePriority('edge'),
      tags: ['edge_case', 'minimal_input', 'template_based'],
    });
    
    // Edge case 2: Maximum input
    const maximumInputData = this.generateMaximumInputData(template);
    edgeCases.push({
      id: generateTestCaseId(),
      name: `${baseName} - Maximum Input`,
      description: `Edge case with maximum possible input for template ${templateId}`,
      templateId,
      inputData: maximumInputData,
      expectedOutputHash: undefined,
      expectedOutputStructure: this.extractExpectedStructure(template),
      generationParameters: {
        useDefaults: false,
        fillAllFields: true,
        validationStrictness: 'strict',
      },
      priority: this.determinePriority('edge'),
      tags: ['edge_case', 'maximum_input', 'template_based'],
    });
    
    // Edge case 3: Empty optional fields
    const emptyOptionalData = this.generateEmptyOptionalInputData(template);
    edgeCases.push({
      id: generateTestCaseId(),
      name: `${baseName} - Empty Optional`,
      description: `Edge case with empty optional fields for template ${templateId}`,
      templateId,
      inputData: emptyOptionalData,
      expectedOutputHash: undefined,
      expectedOutputStructure: this.extractExpectedStructure(template),
      generationParameters: {
        useDefaults: false,
        skipOptional: true,
        validationStrictness: 'lenient',
      },
      priority: this.determinePriority('edge'),
      tags: ['edge_case', 'empty_optional', 'template_based'],
    });
    
    return edgeCases;
  }

  /**
   * Generate boundary cases
   */
  private generateBoundaryCases(template: any, baseName: string): TestCase[] {
    const boundaryCases: TestCase[] = [];
    const templateId = template.id || 'unknown_template';
    
    // Extract numeric fields for boundary testing
    const numericFields = this.extractNumericFields(template);
    
    for (const field of numericFields) {
      // Minimum boundary
      if (field.validationRules?.min !== undefined) {
        const minInputData = this.generateInputDataWithFieldValue(template, field.id, field.validationRules.min);
        boundaryCases.push({
          id: generateTestCaseId(),
          name: `${baseName} - ${field.name} Minimum`,
          description: `Boundary case with minimum value for field ${field.name} in template ${templateId}`,
          templateId,
          inputData: minInputData,
          expectedOutputHash: undefined,
          expectedOutputStructure: this.extractExpectedStructure(template),
          generationParameters: {
            boundaryTesting: true,
            field: field.id,
            value: 'minimum',
          },
          priority: this.determinePriority('boundary'),
          tags: ['boundary_case', 'minimum_value', field.id, 'template_based'],
        });
      }
      
      // Maximum boundary
      if (field.validationRules?.max !== undefined) {
        const maxInputData = this.generateInputDataWithFieldValue(template, field.id, field.validationRules.max);
        boundaryCases.push({
          id: generateTestCaseId(),
          name: `${baseName} - ${field.name} Maximum`,
          description: `Boundary case with maximum value for field ${field.name} in template ${templateId}`,
          templateId,
          inputData: maxInputData,
          expectedOutputHash: undefined,
          expectedOutputStructure: this.extractExpectedStructure(template),
          generationParameters: {
            boundaryTesting: true,
            field: field.id,
            value: 'maximum',
          },
          priority: this.determinePriority('boundary'),
          tags: ['boundary_case', 'maximum_value', field.id, 'template_based'],
        });
      }
      
      // Just below minimum (if min is defined)
      if (field.validationRules?.min !== undefined) {
        const belowMinInputData = this.generateInputDataWithFieldValue(template, field.id, field.validationRules.min - 1);
        boundaryCases.push({
          id: generateTestCaseId(),
          name: `${baseName} - ${field.name} Below Minimum`,
          description: `Boundary case with value just below minimum for field ${field.name} in template ${templateId}`,
          templateId,
          inputData: belowMinInputData,
          expectedOutputHash: undefined,
          expectedOutputStructure: this.extractExpectedStructure(template),
          generationParameters: {
            boundaryTesting: true,
            field: field.id,
            value: 'below_minimum',
            expectError: true,
          },
          priority: this.determinePriority('boundary'),
          tags: ['boundary_case', 'invalid', 'below_minimum', field.id, 'template_based'],
        });
      }
      
      // Just above maximum (if max is defined)
      if (field.validationRules?.max !== undefined) {
        const aboveMaxInputData = this.generateInputDataWithFieldValue(template, field.id, field.validationRules.max + 1);
        boundaryCases.push({
          id: generateTestCaseId(),
          name: `${baseName} - ${field.name} Above Maximum`,
          description: `Boundary case with value just above maximum for field ${field.name} in template ${templateId}`,
          templateId,
          inputData: aboveMaxInputData,
          expectedOutputHash: undefined,
          expectedOutputStructure: this.extractExpectedStructure(template),
          generationParameters: {
            boundaryTesting: true,
            field: field.id,
            value: 'above_maximum',
            expectError: true,
          },
          priority: this.determinePriority('boundary'),
          tags: ['boundary_case', 'invalid', 'above_maximum', field.id, 'template_based'],
        });
      }
    }
    
    return boundaryCases;
  }

  /**
   * Generate random variations
   */
  private generateRandomVariations(template: any, baseName: string, count: number): TestCase[] {
    const variations: TestCase[] = [];
    const templateId = template.id || 'unknown_template';
    
    for (let i = 0; i < count; i++) {
      const randomInputData = this.generateRandomInputData(template);
      variations.push({
        id: generateTestCaseId(),
        name: `${baseName} - Random Variation ${i + 1}`,
        description: `Random variation ${i + 1} for template ${templateId}`,
        templateId,
        inputData: randomInputData,
        expectedOutputHash: undefined,
        expectedOutputStructure: this.extractExpectedStructure(template),
        generationParameters: {
          randomSeed: Date.now() + i,
          variationIndex: i,
        },
        priority: this.determinePriority('random'),
        tags: ['random_variation', `variation_${i + 1}`, 'template_based'],
      });
    }
    
    return variations;
  }

  /**
   * Generate invalid input cases
   */
  private generateInvalidInputCases(template: any, baseName: string): TestCase[] {
    const invalidCases: TestCase[] = [];
    const templateId = template.id || 'unknown_template';
    
    // Invalid case 1: Missing required field
    const missingRequiredData = this.generateMissingRequiredInputData(template);
    if (Object.keys(missingRequiredData).length > 0) {
      invalidCases.push({
        id: generateTestCaseId(),
        name: `${baseName} - Missing Required`,
        description: `Invalid case with missing required field for template ${templateId}`,
        templateId,
        inputData: missingRequiredData,
        expectedOutputHash: undefined,
        expectedOutputStructure: this.extractExpectedStructure(template),
        generationParameters: {
          expectError: true,
          errorType: 'validation',
          missingField: true,
        },
        priority: this.determinePriority('invalid'),
        tags: ['invalid_case', 'missing_required', 'template_based'],
      });
    }
    
    // Invalid case 2: Wrong data type
    const wrongTypeData = this.generateWrongTypeInputData(template);
    invalidCases.push({
      id: generateTestCaseId(),
      name: `${baseName} - Wrong Type`,
      description: `Invalid case with wrong data type for template ${templateId}`,
      templateId,
      inputData: wrongTypeData,
      expectedOutputHash: undefined,
      expectedOutputStructure: this.extractExpectedStructure(template),
      generationParameters: {
        expectError: true,
        errorType: 'type_mismatch',
      },
      priority: this.determinePriority('invalid'),
      tags: ['invalid_case', 'wrong_type', 'template_based'],
    });
    
    // Invalid case 3: Malformed data
    const malformedData = this.generateMalformedInputData(template);
    invalidCases.push({
      id: generateTestCaseId(),
      name: `${baseName} - Malformed`,
      description: `Invalid case with malformed data for template ${templateId}`,
      templateId,
      inputData: malformedData,
      expectedOutputHash: undefined,
      expectedOutputStructure: this.extractExpectedStructure(template),
      generationParameters: {
        expectError: true,
        errorType: 'malformed',
      },
      priority: this.determinePriority('invalid'),
      tags: ['invalid_case', 'malformed', 'template_based'],
    });
    
    return invalidCases;
  }

  /**
   * Extract default input data from template
   */
  private extractDefaultInputData(template: any): Record<string, any> {
    // Simplified implementation
    // In real system, would extract default values from template fields
    
    const defaultData: Record<string, any> = {
      reportTitle: `Test Report for ${template.id || 'Template'}`,
      surveyDate: new Date().toISOString().split('T')[0],
      surveyorName: 'Test Surveyor',
      surveyMethod: 'Visual Assessment',
      treeCount: 10,
      conditionAssessment: 'Fair',
      recommendations: 'Monitor and maintain',
    };
    
    return defaultData;
  }

  /**
   * Extract expected structure from template
   */
  private extractExpectedStructure(template: any): Record<string, any> {
    // Simplified implementation
    return {
      sections: ['executive_summary', 'methodology', 'findings', 'recommendations', 'conclusions'],
      requiredFields: ['surveyDate', 'surveyorName', 'treeCount'],
      templateId: template.id,
      version: template.version || '1.0',
    };
  }

  /**
   * Generate minimal input data (only required fields)
   */
  private generateMinimalInputData(template: any): Record<string, any> {
    const minimalData: Record<string, any> = {
      surveyDate: new Date().toISOString().split('T')[0],
      surveyorName: 'Minimal Surveyor',
      treeCount: 1,
    };
    
    return minimalData;
  }

  /**
   * Generate maximum input data (all fields filled)
   */
  private generateMaximumInputData(template: any): Record<string, any> {
    const maxData = this.extractDefaultInputData(template);
    
    // Add extra fields
    maxData.additionalNotes = 'This is a comprehensive test with all possible fields filled. ' +
      'The report should handle maximum input without issues.';
    maxData.attachments = ['photo1.jpg', 'photo2.jpg', 'diagram.pdf'];
    maxData.priority = 'high';
    maxData.urgency = 'immediate';
    maxData.complexity = 'complex';
    
    return maxData;
  }

  /**
   * Generate input data with empty optional fields
   */
  private generateEmptyOptionalInputData(template: any): Record<string, any> {
    const data = this.extractDefaultInputData(template);
    
    // Remove or empty optional fields
    delete data.additionalNotes;
    delete data.attachments;
    data.recommendations = '';
    data.conditionAssessment = '';
    
    return data;
  }

  /**
   * Extract numeric fields from template
   */
  private extractNumericFields(template: any): TemplateField[] {
    // Simplified implementation
    return [
      {
        id: 'treeCount',
        name: 'Tree Count',
        type: 'number',
        required: true,
        validationRules: {
          min: 1,
          max: 1000,
        },
      },
      {
        id: 'age',
        name: 'Tree Age',
        type: 'number',
        required: false,
        validationRules: {
          min: 0,
          max: 1000,
        },
      },
      {
        id: 'height',
        name: 'Tree Height',
        type: 'number',
        required: false,
        validationRules: {
          min: 0.1,
          max: 100,
        },
      },
    ];
  }

  /**
   * Generate input data with specific field value
   */
  private generateInputDataWithFieldValue(
    template: any,
    fieldId: string,
    value: any
  ): Record<string, any> {
    const data = this.extractDefaultInputData(template);
    data[fieldId] = value;
    return data;
  }

  /**
   * Generate random input data
   */
  private generateRandomInputData(template: any): Record<string, any> {
    const data = this.extractDefaultInputData(template);
    
    // Add random variations
    data.treeCount = Math.floor(Math.random() * 100) + 1;
    data.surveyorName = `Surveyor ${Math.floor(Math.random() * 1000)}`;
    data.conditionAssessment = ['Poor', 'Fair', 'Good', 'Excellent'][Math.floor(Math.random() * 4)];
    data.additionalNotes = `Random test notes ${Date.now()}`;
    
    return data;
  }

  /**
   * Generate input data with missing required field
   */
  private generateMissingRequiredInputData(template: any): Record<string, any> {
    const data = this.extractDefaultInputData(template);
    
    // Remove a required field
    delete data.surveyDate;
    
    return data;
  }

  /**
   * Generate input data with wrong data type
   */
  private generateWrongTypeInputData(template: any): Record<string, any> {
    const data = this.extractDefaultInputData(template);
    
    // Add wrong type values
    data.treeCount = 'not-a-number'; // Should be number
    data.surveyDate = 12345; // Should be string date
    data.surveyorName = { name: 'object' }; // Should be string
    
    return data;
  }

  /**
   * Generate malformed input data
   */
  private generateMalformedInputData(template: any): Record<string, any> {
    const data = this.extractDefaultInputData(template);
    
    // Add malformed data
    data.surveyDate = 'invalid-date-format';
    data.treeCount = -1; // Negative count
    data.surveyMethod = ''; // Empty required field
    
    return data;
  }

  /**
   * Determine priority based on test type
   */
  private determinePriority(testType: string): 'critical' | 'high' | 'medium' | 'low' {
    // Map test types to priorities
    const priorityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
      'basic': 'medium',
      'edge': 'high',
      'boundary': 'high',
      'random': 'low',
      'invalid': 'medium',
    };
    
    return priorityMap[testType] || 'medium';
  }

  /**
   * Get configuration
   */
  getConfig(): TestGenerationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<TestGenerationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Generate a summary of generated test cases
   */
  generateTestSummary(testCases: TestCase[]): {
    total: number;
    byPriority: Record<string, number>;
    byTag: Record<string, number>;
  } {
    const summary = {
      total: testCases.length,
      byPriority: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      byTag: {} as Record<string, number>,
    };
    
    for (const testCase of testCases) {
      // Count by priority
      summary.byPriority[testCase.priority]++;
      
      // Count by tag
      for (const tag of testCase.tags) {
        summary.byTag[tag] = (summary.byTag[tag] || 0) + 1;
      }
    }
    
    return summary;
  }

  /**
   * Export test cases to JSON
   */
  exportTestCasesToJson(testCases: TestCase[]): string {
    return JSON.stringify(testCases, null, 2);
  }

  /**
   * Import test cases from JSON
   */
  importTestCasesFromJson(json: string): TestCase[] {
    try {
      const parsed = JSON.parse(json);
      // Validate structure
      if (Array.isArray(parsed)) {
        return parsed as TestCase[];
      }
      throw new Error('Invalid test cases format: expected array');
    } catch (error) {
      console.error('Failed to import test cases from JSON:', error);
      return [];
    }
  }
}

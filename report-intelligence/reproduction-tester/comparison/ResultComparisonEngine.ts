/**
 * Phase 10: Report Reproduction Tester
 * ResultComparisonEngine Class
 * 
 * Engine for comparing generated reports with expected outputs and calculating similarity scores.
 */

import type { TestCase } from '../TestResult';
import type { ComparisonResult, Difference } from '../TestResult';

/**
 * Comparison configuration
 */
export interface ComparisonConfig {
  compareStructure: boolean;
  compareContent: boolean;
  compareFormatting: boolean;
  compareData: boolean;
  useFuzzyMatching: boolean;
  fuzzyThreshold: number; // 0-100
  ignoreWhitespace: boolean;
  caseSensitive: boolean;
  structureWeight: number;
  contentWeight: number;
  formattingWeight: number;
  dataWeight: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ComparisonConfig = {
  compareStructure: true,
  compareContent: true,
  compareFormatting: true,
  compareData: true,
  useFuzzyMatching: true,
  fuzzyThreshold: 80,
  ignoreWhitespace: true,
  caseSensitive: false,
  structureWeight: 0.30,
  contentWeight: 0.35,
  formattingWeight: 0.20,
  dataWeight: 0.15,
};

/**
 * Comparison result with detailed metrics
 */
export interface DetailedComparisonResult {
  overallSimilarity: number; // 0-100
  structureSimilarity: number;
  contentSimilarity: number;
  formattingSimilarity: number;
  dataSimilarity: number;
  differences: Difference[];
  passed: boolean;
  threshold: number;
}

/**
 * Text comparison result
 */
export interface TextComparisonResult {
  similarity: number;
  differences: Array<{
    position: number;
    expected: string;
    actual: string;
    type: 'insertion' | 'deletion' | 'substitution';
  }>;
}

/**
 * Structure comparison result
 */
export interface StructureComparisonResult {
  similarity: number;
  missingSections: string[];
  extraSections: string[];
  sectionOrderDifferences: Array<{
    expectedIndex: number;
    actualIndex: number;
    sectionId: string;
  }>;
  hierarchyDifferences: Array<{
    sectionId: string;
    expectedLevel: number;
    actualLevel: number;
  }>;
}

/**
 * Main ResultComparisonEngine class
 */
export class ResultComparisonEngine {
  private config: ComparisonConfig;
  
  constructor(config?: Partial<ComparisonConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Compare generated report with expected output
   */
  async compare(
    generatedReport: any,
    testCase: TestCase
  ): Promise<DetailedComparisonResult> {
    const comparisonResults: ComparisonResult[] = [];
    const allDifferences: Difference[] = [];
    
    // Compare structure if enabled
    if (this.config.compareStructure) {
      const structureResult = await this.compareStructure(generatedReport, testCase);
      comparisonResults.push({
        aspect: 'structure',
        similarityScore: structureResult.similarity,
        passed: structureResult.similarity >= this.config.fuzzyThreshold,
        threshold: this.config.fuzzyThreshold,
        differences: this.convertStructureDifferences(structureResult),
      });
      allDifferences.push(...this.convertStructureDifferences(structureResult));
    }
    
    // Compare content if enabled
    if (this.config.compareContent) {
      const contentResult = await this.compareContent(generatedReport, testCase);
      comparisonResults.push({
        aspect: 'content',
        similarityScore: contentResult.similarity,
        passed: contentResult.similarity >= this.config.fuzzyThreshold,
        threshold: this.config.fuzzyThreshold,
        differences: this.convertContentDifferences(contentResult),
      });
      allDifferences.push(...this.convertContentDifferences(contentResult));
    }
    
    // Compare formatting if enabled
    if (this.config.compareFormatting) {
      const formattingResult = await this.compareFormatting(generatedReport, testCase);
      comparisonResults.push({
        aspect: 'formatting',
        similarityScore: formattingResult.similarity,
        passed: formattingResult.similarity >= this.config.fuzzyThreshold,
        threshold: this.config.fuzzyThreshold,
        differences: this.convertFormattingDifferences(formattingResult),
      });
      allDifferences.push(...this.convertFormattingDifferences(formattingResult));
    }
    
    // Compare data if enabled
    if (this.config.compareData) {
      const dataResult = await this.compareData(generatedReport, testCase);
      comparisonResults.push({
        aspect: 'data',
        similarityScore: dataResult.similarity,
        passed: dataResult.similarity >= this.config.fuzzyThreshold,
        threshold: this.config.fuzzyThreshold,
        differences: this.convertDataDifferences(dataResult),
      });
      allDifferences.push(...this.convertDataDifferences(dataResult));
    }
    
    // Calculate overall similarity
    const overallSimilarity = this.calculateOverallSimilarity(comparisonResults);
    
    // Determine if passed
    const passed = overallSimilarity >= this.config.fuzzyThreshold && 
                   allDifferences.every(d => d.severity !== 'critical');
    
    return {
      overallSimilarity,
      structureSimilarity: this.getAspectScore(comparisonResults, 'structure'),
      contentSimilarity: this.getAspectScore(comparisonResults, 'content'),
      formattingSimilarity: this.getAspectScore(comparisonResults, 'formatting'),
      dataSimilarity: this.getAspectScore(comparisonResults, 'data'),
      differences: allDifferences,
      passed,
      threshold: this.config.fuzzyThreshold,
    };
  }

  /**
   * Compare structure
   */
  private async compareStructure(
    generatedReport: any,
    testCase: TestCase
  ): Promise<StructureComparisonResult> {
    const generatedSections = generatedReport.content?.sections || [];
    const expectedStructure = testCase.expectedOutputStructure || {};
    const expectedSections = expectedStructure.sections || [];
    
    // Extract section IDs
    const generatedSectionIds = generatedSections.map((s: any) => s.id);
    const expectedSectionIds = expectedSections.map((s: any) => s.id);
    
    // Find missing sections
    const missingSections = expectedSectionIds.filter(id => !generatedSectionIds.includes(id));
    
    // Find extra sections
    const extraSections = generatedSectionIds.filter(id => !expectedSectionIds.includes(id));
    
    // Check section order
    const sectionOrderDifferences: Array<{
      expectedIndex: number;
      actualIndex: number;
      sectionId: string;
    }> = [];
    
    for (let i = 0; i < expectedSectionIds.length; i++) {
      const expectedId = expectedSectionIds[i];
      const actualIndex = generatedSectionIds.indexOf(expectedId);
      if (actualIndex !== -1 && actualIndex !== i) {
        sectionOrderDifferences.push({
          expectedIndex: i,
          actualIndex,
          sectionId: expectedId,
        });
      }
    }
    
    // Check hierarchy levels
    const hierarchyDifferences: Array<{
      sectionId: string;
      expectedLevel: number;
      actualLevel: number;
    }> = [];
    
    for (const expectedSection of expectedSections) {
      if (expectedSection.level !== undefined) {
        const generatedSection = generatedSections.find((s: any) => s.id === expectedSection.id);
        if (generatedSection && generatedSection.level !== undefined && 
            generatedSection.level !== expectedSection.level) {
          hierarchyDifferences.push({
            sectionId: expectedSection.id,
            expectedLevel: expectedSection.level,
            actualLevel: generatedSection.level,
          });
        }
      }
    }
    
    // Calculate similarity score
    const totalExpected = expectedSectionIds.length;
    const matchingSections = expectedSectionIds.filter(id => generatedSectionIds.includes(id)).length;
    const orderPenalty = sectionOrderDifferences.length * 5;
    const hierarchyPenalty = hierarchyDifferences.length * 10;
    const missingPenalty = missingSections.length * 20;
    
    let similarity = 0;
    if (totalExpected > 0) {
      similarity = Math.max(0, 
        (matchingSections / totalExpected) * 100 - 
        orderPenalty - 
        hierarchyPenalty - 
        missingPenalty
      );
    } else {
      // No expected structure provided
      similarity = 100;
    }
    
    return {
      similarity: Math.round(similarity),
      missingSections,
      extraSections,
      sectionOrderDifferences,
      hierarchyDifferences,
    };
  }

  /**
   * Compare content
   */
  private async compareContent(
    generatedReport: any,
    testCase: TestCase
  ): Promise<TextComparisonResult> {
    const generatedContent = this.extractTextContent(generatedReport);
    const expectedContent = testCase.inputData?.content || '';
    
    if (!expectedContent) {
      // No expected content provided
      return {
        similarity: 100,
        differences: [],
      };
    }
    
    // Normalize text
    const normalizedGenerated = this.normalizeText(generatedContent);
    const normalizedExpected = this.normalizeText(expectedContent);
    
    // Calculate similarity using Levenshtein distance or other algorithm
    const similarity = this.calculateTextSimilarity(normalizedGenerated, normalizedExpected);
    
    // Find differences
    const differences = this.findTextDifferences(normalizedGenerated, normalizedExpected);
    
    return {
      similarity: Math.round(similarity),
      differences,
    };
  }

  /**
   * Compare formatting
   */
  private async compareFormatting(
    generatedReport: any,
    testCase: TestCase
  ): Promise<{ similarity: number; differences: Array<{ type: string; location: string }> }> {
    const generatedFormatting = this.extractFormatting(generatedReport);
    const expectedFormatting = testCase.expectedOutputStructure?.formatting || {};
    
    // Compare formatting attributes
    const differences: Array<{ type: string; location: string }> = [];
    let matchingAttributes = 0;
    let totalAttributes = 0;
    
    // Check font styles
    if (expectedFormatting.fontFamily) {
      totalAttributes++;
      if (generatedFormatting.fontFamily === expectedFormatting.fontFamily) {
        matchingAttributes++;
      } else {
        differences.push({
          type: 'font_family',
          location: 'document',
        });
      }
    }
    
    // Check font size
    if (expectedFormatting.fontSize) {
      totalAttributes++;
      if (generatedFormatting.fontSize === expectedFormatting.fontSize) {
        matchingAttributes++;
      } else {
        differences.push({
          type: 'font_size',
          location: 'document',
        });
      }
    }
    
    // Check margins
    if (expectedFormatting.margins) {
      totalAttributes++;
      if (this.areMarginsSimilar(generatedFormatting.margins, expectedFormatting.margins)) {
        matchingAttributes++;
      } else {
        differences.push({
          type: 'margins',
          location: 'document',
        });
      }
    }
    
    // Calculate similarity
    const similarity = totalAttributes > 0 
      ? (matchingAttributes / totalAttributes) * 100 
      : 100; // No formatting expected
    
    return {
      similarity: Math.round(similarity),
      differences,
    };
  }

  /**
   * Compare data
   */
  private async compareData(
    generatedReport: any,
    testCase: TestCase
  ): Promise<{ similarity: number; differences: Array<{ field: string; expected: any; actual: any }> }> {
    const generatedData = this.extractData(generatedReport);
    const expectedData = testCase.inputData || {};
    
    const differences: Array<{ field: string; expected: any; actual: any }> = [];
    let matchingFields = 0;
    let totalFields = 0;
    
    // Compare numeric fields
    const numericFields = ['treeCount', 'age', 'height', 'width', 'depth'];
    for (const field of numericFields) {
      if (expectedData[field] !== undefined) {
        totalFields++;
        const expectedValue = expectedData[field];
        const actualValue = generatedData[field];
        
        if (this.areValuesSimilar(expectedValue, actualValue, 'number')) {
          matchingFields++;
        } else {
          differences.push({
            field,
            expected: expectedValue,
            actual: actualValue,
          });
        }
      }
    }
    
    // Compare text fields
    const textFields = ['surveyorName', 'surveyMethod', 'conditionAssessment', 'recommendations'];
    for (const field of textFields) {
      if (expectedData[field] !== undefined) {
        totalFields++;
        const expectedValue = expectedData[field];
        const actualValue = generatedData[field];
        
        if (this.areValuesSimilar(expectedValue, actualValue, 'text')) {
          matchingFields++;
        } else {
          differences.push({
            field,
            expected: expectedValue,
            actual: actualValue,
          });
        }
      }
    }
    
    // Calculate similarity
    const similarity = totalFields > 0 
      ? (matchingFields / totalFields) * 100 
      : 100; // No data expected
    
    return {
      similarity: Math.round(similarity),
      differences,
    };
  }

  /**
   * Calculate overall similarity from comparison results
   */
  private calculateOverallSimilarity(comparisonResults: ComparisonResult[]): number {
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const result of comparisonResults) {
      let weight = 0;
      
      switch (result.aspect) {
        case 'structure':
          weight = this.config.structureWeight;
          break;
        case 'content':
          weight = this.config.contentWeight;
          break;
        case 'formatting':
          weight = this.config.formattingWeight;
          break;
        case 'data':
          weight = this.config.dataWeight;
          break;
      }
      
      weightedSum += result.similarityScore * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 100;
  }

  /**
   * Get score for a specific aspect
   */
  private getAspectScore(comparisonResults: ComparisonResult[], aspect: string): number {
    const result = comparisonResults.find(r => r.aspect === aspect);
    return result?.similarityScore || 0;
  }

  /**
   * Convert structure differences to generic Difference format
   */
  private convertStructureDifferences(result: StructureComparisonResult): Difference[] {
    const differences: Difference[] = [];
    
    // Missing sections
    for (const sectionId of result.missingSections) {
      differences.push({
        id: `missing_section_${sectionId}`,
        type: 'missing',
        location: `section.${sectionId}`,
        expected: `Section "${sectionId}"`,
        actual: undefined,
        severity: 'high',
        description: `Missing required section: ${sectionId}`,
        impactOnReproducibility: 'Report structure incomplete',
      });
    }
    
    // Extra sections
    for (const sectionId of result.extraSections) {
      differences.push({
        id: `extra_section_${sectionId}`,
        type: 'extra',
        location: `section.${sectionId}`,
        expected: undefined,
        actual: `Section "${sectionId}"`,
        severity: 'low',
        description: `Extra section found: ${sectionId}`,
        impactOnReproducibility: 'Report structure includes unexpected sections',
      });
    }
    
    // Section order differences
    for (const diff of result.sectionOrderDifferences) {
      differences.push({
        id: `order_${diff.sectionId}`,
        type: 'ordering',
        location: `section.${diff.sectionId}`,
        expected: `Position ${diff.expectedIndex}`,
        actual: `Position ${diff.actualIndex}`,
        severity: 'medium',
        description: `Section "${diff.sectionId}" is in wrong position`,
        impactOnReproducibility: 'Report structure order differs from expected',
      });
    }
    
    // Hierarchy differences
    for (const diff of result.hierarchyDifferences) {
      differences.push({
        id: `hierarchy_${diff.sectionId}`,
        type: 'structural',
        location: `section.${diff.sectionId}`,
        expected: `Level ${diff.expectedLevel}`,
        actual: `Level ${diff.actualLevel}`,
        severity: 'medium',
        description: `Section "${diff.sectionId}" has wrong hierarchy level`,
        impactOnReproducibility: 'Report hierarchy differs from expected',
      });
    }
    
    return differences;
  }

  /**
   * Convert content differences to generic Difference format
   */
  private convertContentDifferences(result: TextComparisonResult): Difference[] {
    const differences: Difference[] = [];
    
    for (let i = 0; i < Math.min(result.differences.length, 5); i++) {
      const diff = result.differences[i];
      differences.push({
        id: `content_diff_${i}`,
        type: 'content',
        location: `text.position.${diff.position}`,
        expected: diff.expected,
        actual: diff.actual,
        severity: 'medium',
        description: `Content difference at position ${diff.position}: ${diff.type}`,
        impactOnReproducibility: 'Report content differs from expected',
      });
    }
    
    return differences;
  }

  /**
   * Convert formatting differences to generic Difference format
   */
  private convertFormattingDifferences(result: { 
    similarity: number; 
    differences: Array<{ type: string; location: string }> 
  }): Difference[] {
    return result.differences.map((diff, index) => ({
      id: `formatting_diff_${index}`,
      type: 'formatting',
      location: diff.location,
      expected: `Expected ${diff.type}`,
      actual: `Actual ${diff.type}`,
      severity: 'low',
      description: `Formatting difference: ${diff.type}`,
      impactOnReproducibility: 'Report formatting differs from expected',
    }));
  }

  /**
   * Convert data differences to generic Difference format
   */
  private convertDataDifferences(result: {
    similarity: number;
    differences: Array<{ field: string; expected: any; actual: any }>
  }): Difference[] {
    return result.differences.map((diff, index) => ({
      id: `data_diff_${index}`,
      type: 'data',
      location: `field.${diff.field}`,
      expected: String(diff.expected),
      actual: String(diff.actual),
      severity: 'medium',
      description: `Data difference for field "${diff.field}"`,
      impactOnReproducibility: 'Report data differs from expected',
    }));
  }

  /**
   * Extract text content from report
   */
  private extractTextContent(report: any): string {
    if (!report.content) return '';
    
    let text = '';
    
    // Add title
    if (report.content.title) {
      text += report.content.title + '\n';
    }
    
    // Add sections content
    if (report.content.sections) {
      for (const section of report.content.sections) {
        if (section.content) {
          text += section.content + '\n';
        }
      }
    }
    
    return text;
  }

  /**
   * Normalize text for comparison
   */
  private normalizeText(text: string): string {
    let normalized = text;
    
    if (this.config.ignoreWhitespace) {
      normalized = normalized.replace(/\s+/g, ' ').trim();
    }
    
    if (!this.config.caseSensitive) {
      normalized = normalized.toLowerCase();
    }
    
    return normalized;
  }

  /**
   * Calculate text similarity using simple character matching
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    if (text1 === text2) return 100;
    
    const longer = text1.length > text2.length ? text1 : text2;
    const shorter = text1.length > text2.length ? text2 : text1;
    
    if (longer.length === 0) return 100;
    
    // Simple character matching
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (shorter[i] === longer[i]) {
        matches++;
      }
    }
    
    return (matches / longer.length) * 100;
  }

  /**
   * Find text differences
   */
  private findTextDifferences(text1: string, text2: string): Array<{
    position: number;
    expected: string;
    actual: string;
    type: 'insertion' | 'deletion' | 'substitution';
  }> {
    const differences: Array<{
      position: number;
      expected: string;
      actual: string;
      type: 'insertion' | 'deletion' | 'substitution';
    }> = [];
    
    const maxLength = Math.max(text1.length, text2.length);
    
    for (let i = 0; i < maxLength; i++) {
      const char1 = text1[i] || '';
      const char2 = text2[i] || '';
      
      if (char1 !== char2) {
        if (char1 === '') {
          differences.push({
            position: i,
            expected: '',
            actual: char2,
            type: 'insertion',
          });
        } else if (char2 === '') {
          differences.push({
            position: i,
            expected: char1,
            actual: '',
            type: 'deletion',
          });
        } else {
          differences.push({
            position: i,
            expected: char1,
            actual: char2,
            type: 'substitution',
          });
        }
      }
    }
    
    return differences.slice(0, 10); // Limit to first 10 differences
  }

  /**
   * Extract formatting from report
   */
  private extractFormatting(report: any): any {
    // Simplified formatting extraction
    return {
      fontFamily: report.content?.metadata?.fontFamily || 'Arial',
      fontSize: report.content?.metadata?.fontSize || '12pt',
      margins: report.content?.metadata?.margins || { top: 1, right: 1, bottom: 1, left: 1 },
    };
  }

  /**
   * Check if margins are similar
   */
  private areMarginsSimilar(margins1: any, margins2: any): boolean {
    if (!margins1 || !margins2) return true;
    
    const tolerance = 0.1;
    return Math.abs(margins1.top - margins2.top) < tolerance &&
           Math.abs(margins1.right - margins2.right) < tolerance &&
           Math.abs(margins1.bottom - margins2.bottom) < tolerance &&
           Math.abs(margins1.left - margins2.left) < tolerance;
  }

  /**
   * Extract data from report
   */
  private extractData(report: any): Record<string, any> {
    const data: Record<string, any> = {};
    
    // Extract from sections
    if (report.content?.sections) {
      for (const section of report.content.sections) {
        if (section.id === 'findings') {
          // Extract tree count from findings
          const match = section.content?.match(/Trees surveyed:\s*(\d+)/);
          if (match) {
            data.treeCount = parseInt(match[1], 10);
          }
          
          // Extract condition assessment
          const conditionMatch = section.content?.match(/Condition:\s*(.+)/);
          if (conditionMatch) {
            data.conditionAssessment = conditionMatch[1];
          }
        }
        
        if (section.id === 'methodology') {
          // Extract surveyor name
          const nameMatch = section.content?.match(/Surveyor:\s*(.+)/);
          if (nameMatch) {
            data.surveyorName = nameMatch[1];
          }
          
          // Extract survey method
          const methodMatch = section.content?.match(/Method:\s*(.+)/);
          if (methodMatch) {
            data.surveyMethod = methodMatch[1];
          }
        }
      }
    }
    
    return data;
  }

  /**
   * Check if values are similar
   */
  private areValuesSimilar(expected: any, actual: any, type: 'number' | 'text'): boolean {
    if (expected === undefined || actual === undefined) {
      return expected === actual; // Both undefined or both defined
    }
    
    if (type === 'number') {
      const numExpected = Number(expected);
      const numActual = Number(actual);
      
      if (isNaN(numExpected) || isNaN(numActual)) {
        return String(expected) === String(actual);
      }
      
      // Allow 10% tolerance for numbers
      const tolerance = Math.abs(numExpected * 0.1);
      return Math.abs(numExpected - numActual) <= tolerance;
    }
    
    if (type === 'text') {
      const strExpected = String(expected).trim();
      const strActual = String(actual).trim();
      
      if (this.config.useFuzzyMatching) {
        const similarity = this.calculateTextSimilarity(
          this.normalizeText(strExpected),
          this.normalizeText(strActual)
        );
        return similarity >= this.config.fuzzyThreshold;
      }
      
      return strExpected === strActual;
    }
    
    return expected === actual;
  }

  /**
   * Get configuration
   */
  getConfig(): ComparisonConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ComparisonConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Generate a comparison report
   */
  generateComparisonReport(detailedResult: DetailedComparisonResult): string {
    let report = `# Result Comparison Report\n\n`;
    report += `## Overall Result\n`;
    report += `- Similarity Score: ${detailedResult.overallSimilarity}%\n`;
    report += `- Passed: ${detailedResult.passed ? 'YES' : 'NO'}\n`;
    report += `- Threshold: ${detailedResult.threshold}%\n\n`;
    
    report += `## Detailed Scores\n`;
    report += `- Structure Similarity: ${detailedResult.structureSimilarity}%\n`;
    report += `- Content Similarity: ${detailedResult.contentSimilarity}%\n`;
    report += `- Formatting Similarity: ${detailedResult.formattingSimilarity}%\n`;
    report += `- Data Similarity: ${detailedResult.dataSimilarity}%\n\n`;
    
    if (detailedResult.differences.length > 0) {
      report += `## Differences Found (${detailedResult.differences.length})\n\n`;
      
      for (const diff of detailedResult.differences) {
        report += `### ${diff.id}\n`;
        report += `- Type: ${diff.type}\n`;
        report += `- Location: ${diff.location}\n`;
        report += `- Severity: ${diff.severity}\n`;
        report += `- Description: ${diff.description}\n`;
        if (diff.expected) report += `- Expected: ${diff.expected}\n`;
        if (diff.actual) report += `- Actual: ${diff.actual}\n`;
        report += `- Impact: ${diff.impactOnReproducibility}\n\n`;
      }
    } else {
      report += `## Differences Found\n`;
      report += `No differences found.\n\n`;
    }
    
    report += `## Recommendations\n`;
    if (detailedResult.passed) {
      report += `The report reproduction test PASSED. The generated report is sufficiently similar to the expected output.\n`;
    } else {
      report += `The report reproduction test FAILED. Review the differences above and adjust the generation process.\n`;
    }
    
    return report;
  }
}
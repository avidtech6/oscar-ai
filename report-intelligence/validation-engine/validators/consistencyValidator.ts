/**
 * Report Validation Engine - Phase 4
 * Consistency Validator Module
 * 
 * Validates consistency aspects like terminology, formatting, and logical coherence.
 */

import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ValidationRule } from '../ValidationResult';

/**
 * Consistency validation result
 */
export interface ConsistencyValidationResult {
  passed: boolean;
  issues: Array<{
    type: 'terminology' | 'formatting' | 'logic' | 'structure' | 'reference';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    location?: string;
    expected?: string;
    actual?: string;
  }>;
  consistencyScore: number; // 0-100
  terminologyInconsistencies: number;
  formattingInconsistencies: number;
  logicalInconsistencies: number;
}

/**
 * Consistency validator class
 */
export class ConsistencyValidator {
  private dateFormats: RegExp[] = [
    /\d{1,2}\/\d{1,2}\/\d{4}/g, // MM/DD/YYYY
    /\d{1,2}-\d{1,2}-\d{4}/g, // MM-DD-YYYY
    /\d{4}-\d{1,2}-\d{1,2}/g, // YYYY-MM-DD
  ];

  private measurementUnits = ['m', 'cm', 'mm', 'km', 'in', 'ft', 'yd', 'ha', 'ac'];
  private commonTerminologyVariants: Record<string, string[]> = {
    'assessment': ['evaluation', 'analysis', 'review'],
    'recommendation': ['suggestion', 'proposal', 'advice'],
    'requirement': ['requisite', 'necessity', 'prerequisite'],
    'compliance': ['conformance', 'adherence', 'observance'],
  };

  /**
   * Validate consistency for a schema mapping result
   */
  validate(
    schemaMappingResult: SchemaMappingResult,
    rule: ValidationRule
  ): ConsistencyValidationResult {
    const result: ConsistencyValidationResult = {
      passed: true,
      issues: [],
      consistencyScore: 100, // Start with perfect score
      terminologyInconsistencies: 0,
      formattingInconsistencies: 0,
      logicalInconsistencies: 0,
    };

    // Check terminology consistency
    const terminologyIssues = this.checkTerminologyConsistency(schemaMappingResult);
    if (terminologyIssues.length > 0) {
      result.passed = false;
      result.issues.push(...terminologyIssues);
      result.terminologyInconsistencies = terminologyIssues.length;
      result.consistencyScore -= terminologyIssues.length * 8;
    }

    // Check formatting consistency
    const formattingIssues = this.checkFormattingConsistency(schemaMappingResult);
    if (formattingIssues.length > 0) {
      result.passed = false;
      result.issues.push(...formattingIssues);
      result.formattingInconsistencies = formattingIssues.length;
      result.consistencyScore -= formattingIssues.length * 5;
    }

    // Check logical consistency
    const logicalIssues = this.checkLogicalConsistency(schemaMappingResult);
    if (logicalIssues.length > 0) {
      result.passed = false;
      result.issues.push(...logicalIssues);
      result.logicalInconsistencies = logicalIssues.length;
      result.consistencyScore -= logicalIssues.length * 12;
    }

    // Check structural consistency
    const structuralIssues = this.checkStructuralConsistency(schemaMappingResult);
    if (structuralIssues.length > 0) {
      result.passed = false;
      result.issues.push(...structuralIssues);
      result.consistencyScore -= structuralIssues.length * 6;
    }

    // Check reference consistency
    const referenceIssues = this.checkReferenceConsistency(schemaMappingResult);
    if (referenceIssues.length > 0) {
      result.passed = false;
      result.issues.push(...referenceIssues);
      result.consistencyScore -= referenceIssues.length * 4;
    }

    // Ensure score doesn't go below 0
    result.consistencyScore = Math.max(0, result.consistencyScore);

    return result;
  }

  /**
   * Check terminology consistency
   */
  private checkTerminologyConsistency(schemaMappingResult: SchemaMappingResult): Array<{
    type: 'terminology';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    location?: string;
    expected?: string;
    actual?: string;
  }> {
    const issues: Array<{
      type: 'terminology';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      location?: string;
      expected?: string;
      actual?: string;
    }> = [];

    // Track terminology usage across the report
    const terminologyUsage: Record<string, { count: number; locations: string[] }> = {};

    // Collect terminology from mapped fields
    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        // Simple term extraction (in real system would use NLP)
        const words = value.toLowerCase().split(/\s+/);
        
        for (const baseTerm of Object.keys(this.commonTerminologyVariants)) {
          const variants = [baseTerm, ...this.commonTerminologyVariants[baseTerm]];
          
          for (const variant of variants) {
            if (words.includes(variant.toLowerCase())) {
              if (!terminologyUsage[baseTerm]) {
                terminologyUsage[baseTerm] = { count: 0, locations: [] };
              }
              terminologyUsage[baseTerm].count++;
              terminologyUsage[baseTerm].locations.push(field.fieldName);
            }
          }
        }
      }
    }

    // Check for inconsistent terminology usage
    for (const [baseTerm, usage] of Object.entries(terminologyUsage)) {
      if (usage.count > 1) {
        // Check if multiple variants of the same term are used
        const variantCounts: Record<string, number> = {};
        
        for (const field of schemaMappingResult.mappedFields) {
          const value = field.mappedValue;
          if (typeof value === 'string') {
            const lowerValue = value.toLowerCase();
            const variants = [baseTerm, ...this.commonTerminologyVariants[baseTerm]];
            
            for (const variant of variants) {
              if (lowerValue.includes(variant.toLowerCase())) {
                variantCounts[variant] = (variantCounts[variant] || 0) + 1;
              }
            }
          }
        }

        // If more than one variant is used, it's inconsistent
        const usedVariants = Object.keys(variantCounts);
        if (usedVariants.length > 1) {
          issues.push({
            type: 'terminology',
            description: `Inconsistent terminology for "${baseTerm}"`,
            severity: 'medium',
            location: usage.locations.join(', '),
            expected: `Use "${usedVariants[0]}" consistently`,
            actual: `Used: ${usedVariants.join(', ')}`,
          });
        }
      }
    }

    // Check unknown terminology from schema mapping result
    if (schemaMappingResult.unknownTerminology.length > 0) {
      const unknownTerms = schemaMappingResult.unknownTerminology.map(t => t.term).join(', ');
      issues.push({
        type: 'terminology',
        description: `Unknown terminology found: ${unknownTerms}`,
        severity: 'low',
        location: 'Various sections',
        expected: 'Use standard terminology from approved glossary',
        actual: `Unknown terms: ${unknownTerms}`,
      });
    }

    return issues;
  }

  /**
   * Check formatting consistency
   */
  private checkFormattingConsistency(schemaMappingResult: SchemaMappingResult): Array<{
    type: 'formatting';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    location?: string;
    expected?: string;
    actual?: string;
  }> {
    const issues: Array<{
      type: 'formatting';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      location?: string;
      expected?: string;
      actual?: string;
    }> = [];

    // Check date format consistency
    const foundDateFormats = new Set<string>();
    const dateLocations: Record<string, string[]> = {};
    
    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        for (const dateFormat of this.dateFormats) {
          const matches = value.match(dateFormat);
          if (matches && matches.length > 0) {
            const formatName = dateFormat.source;
            foundDateFormats.add(formatName);
            
            if (!dateLocations[formatName]) {
              dateLocations[formatName] = [];
            }
            dateLocations[formatName].push(field.fieldName);
          }
        }
      }
    }

    // If multiple date formats found
    if (foundDateFormats.size > 1) {
      const formatList = Array.from(foundDateFormats).map(f => {
        const locations = dateLocations[f] || [];
        return `${f} (${locations.length} locations)`;
      }).join(', ');
      
      issues.push({
        type: 'formatting',
        description: 'Inconsistent date formats',
        severity: 'medium',
        location: 'Multiple sections',
        expected: 'Use a single date format consistently',
        actual: `Found formats: ${formatList}`,
      });
    }

    // Check measurement unit consistency
    const unitUsage: Record<string, { count: number; locations: string[] }> = {};
    
    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        for (const unit of this.measurementUnits) {
          const unitRegex = new RegExp(`\\b\\d+\\s*${unit}\\b`, 'gi');
          const matches = value.match(unitRegex);
          if (matches && matches.length > 0) {
            if (!unitUsage[unit]) {
              unitUsage[unit] = { count: 0, locations: [] };
            }
            unitUsage[unit].count += matches.length;
            unitUsage[unit].locations.push(field.fieldName);
          }
        }
      }
    }

    // Check for mixed units (e.g., mixing metric and imperial)
    const metricUnits = ['m', 'cm', 'mm', 'km', 'ha'];
    const imperialUnits = ['in', 'ft', 'yd', 'ac'];
    
    const hasMetric = Object.keys(unitUsage).some(unit => metricUnits.includes(unit));
    const hasImperial = Object.keys(unitUsage).some(unit => imperialUnits.includes(unit));
    
    if (hasMetric && hasImperial) {
      issues.push({
        type: 'formatting',
        description: 'Mixed measurement systems (metric and imperial)',
        severity: 'medium',
        location: 'Multiple sections',
        expected: 'Use consistent measurement system throughout',
        actual: 'Mixed metric and imperial units',
      });
    }

    return issues;
  }

  /**
   * Check logical consistency
   */
  private checkLogicalConsistency(schemaMappingResult: SchemaMappingResult): Array<{
    type: 'logic';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    location?: string;
    expected?: string;
    actual?: string;
  }> {
    const issues: Array<{
      type: 'logic';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      location?: string;
      expected?: string;
      actual?: string;
    }> = [];

    // Check for contradictory statements
    const contradictionKeywords = [
      ['however', 'but', 'although', 'yet'],
      ['on the one hand', 'on the other hand'],
      ['contradicts', 'contradictory', 'inconsistent'],
      ['while', 'whereas'],
    ];

    const contradictionLocations: string[] = [];
    
    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        for (const keywordGroup of contradictionKeywords) {
          if (keywordGroup.some(kw => lowerValue.includes(kw))) {
            contradictionLocations.push(field.fieldName);
            break;
          }
        }
      }
    }

    if (contradictionLocations.length > 2) {
      issues.push({
        type: 'logic',
        description: 'Potential logical contradictions detected',
        severity: 'high',
        location: contradictionLocations.join(', '),
        expected: 'Logically consistent statements',
        actual: `Contradiction indicators in ${contradictionLocations.length} sections`,
      });
    }

    // Check for circular references or tautologies
    const tautologyPatterns = [
      /true fact/i,
      /past history/i,
      /future plans/i,
      /end result/i,
      /free gift/i,
    ];

    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        for (const pattern of tautologyPatterns) {
          if (pattern.test(value)) {
            issues.push({
              type: 'logic',
              description: 'Redundant or tautological phrasing',
              severity: 'low',
              location: field.fieldName,
              expected: 'Concise, non-redundant language',
              actual: `Contains: "${value.match(pattern)?.[0]}"`,
            });
            break;
          }
        }
      }
    }

    return issues;
  }

  /**
   * Check structural consistency
   */
  private checkStructuralConsistency(schemaMappingResult: SchemaMappingResult): Array<{
    type: 'structure';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    location?: string;
    expected?: string;
    actual?: string;
  }> {
    const issues: Array<{
      type: 'structure';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      location?: string;
      expected?: string;
      actual?: string;
    }> = [];

    // Check section ordering consistency
    const sectionTypes: string[] = [];
    for (const field of schemaMappingResult.mappedFields) {
      if (field.fieldType === 'section') {
        sectionTypes.push(field.fieldName);
      }
    }

    // Check for logical section ordering (simplified)
    const commonOrder = ['Introduction', 'Methodology', 'Findings', 'Conclusions', 'Recommendations'];
    const foundOrder = sectionTypes.filter(section => 
      commonOrder.some(expected => section.toLowerCase().includes(expected.toLowerCase()))
    );

    if (foundOrder.length > 1) {
      // Check if order matches common pattern
      const isInOrder = foundOrder.every((section, index) => {
        const expected = commonOrder[index];
        return section.toLowerCase().includes(expected.toLowerCase());
      });

      if (!isInOrder) {
        issues.push({
          type: 'structure',
          description: 'Non-standard section ordering',
          severity: 'low',
          location: 'Report structure',
          expected: `Standard order: ${commonOrder.join(' → ')}`,
          actual: `Found order: ${foundOrder.join(' → ')}`,
        });
      }
    }

    return issues;
  }

  /**
   * Check reference consistency
   */
  private checkReferenceConsistency(schemaMappingResult: SchemaMappingResult): Array<{
    type: 'reference';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    location?: string;
    expected?: string;
    actual?: string;
  }> {
    const issues: Array<{
      type: 'reference';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      location?: string;
      expected?: string;
      actual?: string;
    }> = [];

    // Extract references from the report
    const referencePatterns = [
      /\[(\d+)\]/g, // [1], [2], etc.
      /\([A-Za-z]+\s+\d{4}\)/g, // (Author 2024)
      /\b(Figure|Table|Appendix)\s+[A-Z]?\d+/gi,
    ];

    const references: Set<string> = new Set();
    const referenceLocations: Record<string, string[]> = {};
    
    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        for (const pattern of referencePatterns) {
          const matches = value.match(pattern);
          if (matches) {
            for (const match of matches) {
              references.add(match);
              if (!referenceLocations[match]) {
                referenceLocations[match] = [];
              }
              referenceLocations[match].push(field.fieldName);
            }
          }
        }
      }
    }

    // Check for undefined references (simplified - would need full reference list)
    if (references.size > 0) {
      // In a real system, would check if references are defined elsewhere
      issues.push({
        type: 'reference',
        description: `${references.size} references found - review for consistency`,
        severity: 'info',
        location: 'Multiple sections',
        expected: 'All references properly defined and consistent',
        actual: `Found ${references.size} reference(s)`,
      });
    }

    return issues;
  }

  /**
   * Get consistency assessment summary
   */
  getConsistencySummary(score: number): string {
    if (score >= 90) return 'Highly consistent';
    if (score >= 80) return 'Mostly consistent';
    if (score >= 70) return 'Moderately consistent';
    if (score >= 60) return 'Somewhat inconsistent';
    return 'Highly inconsistent - significant issues';
  }

  /**
   * Add terminology variant mapping
   */
  addTerminologyVariant(baseTerm: string, variants: string[]): void {
    if (!this.commonTerminologyVariants[baseTerm]) {
      this.commonTerminologyVariants[baseTerm] = [];
    }
    for (const variant of variants) {
      if (!this.commonTerminologyVariants[baseTerm].includes(variant)) {
        this.commonTerminologyVariants[baseTerm].push(variant);
      }
    }
  }

  /**
   * Add measurement unit
   */
  addMeasurementUnit(unit: string): void {
    if (!this.measurementUnits.includes(unit)) {
      this.measurementUnits.push(unit);
    }
  }
}
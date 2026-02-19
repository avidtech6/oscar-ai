/**
 * Report Validation Engine - Phase 4
 * ReportValidationEngine Class
 * 
 * Main engine for validating schema-mapped reports against rules and standards.
 */

import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { ReportTypeRegistry } from '../registry/ReportTypeRegistry';
import type { ReportTypeDefinition } from '../registry/ReportTypeDefinition';
import { 
  ValidationResult, 
  ValidationFinding,
  ComplianceViolation,
  QualityIssue,
  ValidationScores,
  ValidationRule,
  ValidationRuleType,
  ValidationSeverity,
  createValidationResult,
  calculateOverallScore,
  generateValidationResultId,
  generateValidationFindingId,
  generateComplianceViolationId,
  generateQualityIssueId
} from './ValidationResult';

export type ValidationEvent = 
  | 'validation:started'
  | 'validation:ruleProcessed'
  | 'validation:complianceChecked'
  | 'validation:qualityChecked'
  | 'validation:completenessChecked'
  | 'validation:consistencyChecked'
  | 'validation:terminologyChecked'
  | 'validation:completed'
  | 'validation:error';

export type EventListener = (event: ValidationEvent, data: any) => void;

export class ReportValidationEngine {
  private eventListeners: Map<ValidationEvent, Set<EventListener>> = new Map();
  private registry?: ReportTypeRegistry;
  private validatorVersion = '1.0.0';
  private validationRules: ValidationRule[] = [];
  
  constructor(registry?: ReportTypeRegistry) {
    this.registry = registry;
    this.initializeEventSystem();
    this.initializeDefaultRules();
  }

  /**
   * Initialize the event system
   */
  private initializeEventSystem(): void {
    const events: ValidationEvent[] = [
      'validation:started',
      'validation:ruleProcessed',
      'validation:complianceChecked',
      'validation:qualityChecked',
      'validation:completenessChecked',
      'validation:consistencyChecked',
      'validation:terminologyChecked',
      'validation:completed',
      'validation:error'
    ];
    
    for (const event of events) {
      this.eventListeners.set(event, new Set());
    }
  }

  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules(): void {
    // Compliance rules
    this.validationRules.push({
      id: 'comp_001',
      name: 'Required Sections Present',
      description: 'Check that all required sections are present in the report',
      type: 'compliance',
      severity: 'critical',
      appliesTo: ['all'],
      condition: 'requiredSectionsPresent',
      messageTemplate: 'Missing required section: {sectionName}',
      remediationGuidance: 'Add the missing required section to the report',
      source: 'system',
      version: '1.0.0',
      enabled: true,
      weight: 10,
      autoFixable: false,
      requiresHumanReview: true
    });

    this.validationRules.push({
      id: 'comp_002',
      name: 'Compliance Standard References',
      description: 'Check that required compliance standards are referenced',
      type: 'compliance',
      severity: 'high',
      appliesTo: ['all'],
      condition: 'complianceStandardsReferenced',
      messageTemplate: 'Missing reference to compliance standard: {standard}',
      remediationGuidance: 'Add reference to the required compliance standard',
      source: 'regulation',
      regulationStandard: 'BS5837:2012',
      version: '1.0.0',
      enabled: true,
      weight: 8,
      autoFixable: false,
      requiresHumanReview: true
    });

    // Quality rules
    this.validationRules.push({
      id: 'qual_001',
      name: 'Section Clarity',
      description: 'Check that sections have clear, descriptive titles',
      type: 'quality',
      severity: 'medium',
      appliesTo: ['all'],
      condition: 'sectionTitlesClear',
      messageTemplate: 'Section title "{title}" is unclear or non-descriptive',
      remediationGuidance: 'Use clear, descriptive titles for all sections',
      source: 'organization',
      version: '1.0.0',
      enabled: true,
      weight: 5,
      autoFixable: false,
      requiresHumanReview: false
    });

    this.validationRules.push({
      id: 'qual_002',
      name: 'Terminology Consistency',
      description: 'Check that terminology is used consistently throughout the report',
      type: 'quality',
      severity: 'medium',
      appliesTo: ['all'],
      condition: 'terminologyConsistent',
      messageTemplate: 'Inconsistent terminology usage: {term} used as {variations}',
      remediationGuidance: 'Use consistent terminology throughout the report',
      source: 'organization',
      version: '1.0.0',
      enabled: true,
      weight: 6,
      autoFixable: false,
      requiresHumanReview: false
    });

    // Completeness rules
    this.validationRules.push({
      id: 'comp_003',
      name: 'Section Completeness',
      description: 'Check that sections have sufficient content',
      type: 'completeness',
      severity: 'medium',
      appliesTo: ['all'],
      condition: 'sectionsHaveContent',
      messageTemplate: 'Section "{sectionName}" has insufficient content ({wordCount} words)',
      remediationGuidance: 'Add more detailed content to the section',
      source: 'system',
      version: '1.0.0',
      enabled: true,
      weight: 7,
      autoFixable: false,
      requiresHumanReview: false
    });

    // Consistency rules
    this.validationRules.push({
      id: 'cons_001',
      name: 'Date Consistency',
      description: 'Check that dates are consistent throughout the report',
      type: 'consistency',
      severity: 'high',
      appliesTo: ['all'],
      condition: 'datesConsistent',
      messageTemplate: 'Inconsistent date format or logic: {issue}',
      remediationGuidance: 'Use consistent date formats and ensure logical consistency',
      source: 'system',
      version: '1.0.0',
      enabled: true,
      weight: 8,
      autoFixable: false,
      requiresHumanReview: true
    });

    // Terminology rules
    this.validationRules.push({
      id: 'term_001',
      name: 'Standard Terminology',
      description: 'Check that standard terminology is used where appropriate',
      type: 'terminology',
      severity: 'medium',
      appliesTo: ['all'],
      condition: 'standardTerminologyUsed',
      messageTemplate: 'Non-standard terminology used: {term} (suggested: {suggestion})',
      remediationGuidance: 'Use standard terminology from the approved glossary',
      source: 'organization',
      version: '1.0.0',
      enabled: true,
      weight: 6,
      autoFixable: true,
      requiresHumanReview: false
    });
  }

  /**
   * Validate a schema mapping result
   */
  async validate(
    schemaMappingResult: SchemaMappingResult
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const validationResultId = generateValidationResultId();
    
    try {
      // Create initial validation result
      const validationResult: ValidationResult = {
        ...createValidationResult(
          schemaMappingResult.id,
          schemaMappingResult.decompiledReportId,
          schemaMappingResult.reportTypeId
        ),
        id: validationResultId,
        createdAt: new Date(),
        validatedAt: new Date(),
        status: 'in_progress',
      };

      // Emit started event
      this.emitEvent('validation:started', {
        validationResultId,
        schemaMappingResultId: schemaMappingResult.id,
        reportTypeId: schemaMappingResult.reportTypeId,
      });

      // Get applicable rules
      const applicableRules = this.getApplicableRules(schemaMappingResult.reportTypeId);
      validationResult.rulesExecuted = applicableRules.length;

      // Process each rule
      let rulesPassed = 0;
      let rulesFailed = 0;
      let rulesSkipped = 0;

      for (const rule of applicableRules) {
        try {
          const ruleResult = await this.processRule(rule, schemaMappingResult, validationResult);
          
          if (ruleResult.passed) {
            rulesPassed++;
          } else {
            rulesFailed++;
            
            // Add finding if rule failed
            if (ruleResult.finding) {
              validationResult.findings.push(ruleResult.finding);
            }
            
            // Add compliance violation if applicable
            if (ruleResult.violation && rule.type === 'compliance') {
              validationResult.complianceViolations.push(ruleResult.violation);
            }
            
            // Add quality issue if applicable
            if (ruleResult.qualityIssue && rule.type === 'quality') {
              validationResult.qualityIssues.push(ruleResult.qualityIssue);
            }
          }

          this.emitEvent('validation:ruleProcessed', {
            validationResultId,
            ruleId: rule.id,
            ruleName: rule.name,
            passed: ruleResult.passed,
            severity: rule.severity,
          });

        } catch (error) {
          console.warn(`[ReportValidationEngine] Error processing rule ${rule.id}:`, error);
          rulesSkipped++;
        }
      }

      // Update rule counts
      validationResult.rulesPassed = rulesPassed;
      validationResult.rulesFailed = rulesFailed;
      validationResult.rulesSkipped = rulesSkipped;

      // Calculate scores
      validationResult.scores = this.calculateScores(validationResult, applicableRules, schemaMappingResult);

      // Update overall score
      validationResult.scores.overallScore = calculateOverallScore(validationResult.scores);

      // Emit completion events by category
      this.emitEvent('validation:complianceChecked', {
        validationResultId,
        complianceScore: validationResult.scores.complianceScore,
        violationCount: validationResult.complianceViolations.length,
      });

      this.emitEvent('validation:qualityChecked', {
        validationResultId,
        qualityScore: validationResult.scores.qualityScore,
        issueCount: validationResult.qualityIssues.length,
      });

      this.emitEvent('validation:completenessChecked', {
        validationResultId,
        completenessScore: validationResult.scores.completenessScore,
      });

      this.emitEvent('validation:consistencyChecked', {
        validationResultId,
        consistencyScore: validationResult.scores.consistencyScore,
      });

      this.emitEvent('validation:terminologyChecked', {
        validationResultId,
        terminologyScore: validationResult.scores.ruleTypeScores.terminology,
      });

      // Set processing time
      validationResult.processingTimeMs = Date.now() - startTime;
      validationResult.status = 'completed';

      // Store snapshots
      validationResult.schemaMappingResultSnapshot = this.createSchemaMappingSnapshot(schemaMappingResult);
      
      if (schemaMappingResult.reportTypeId && this.registry) {
        const reportType = this.registry.getType(schemaMappingResult.reportTypeId);
        if (reportType) {
          validationResult.reportTypeDefinitionSnapshot = this.createReportTypeSnapshot(reportType);
        }
      }

      // Emit completion event
      this.emitEvent('validation:completed', {
        validationResultId,
        overallScore: validationResult.scores.overallScore,
        findingsCount: validationResult.findings.length,
        processingTimeMs: validationResult.processingTimeMs,
      });

      return validationResult;

    } catch (error) {
      this.emitEvent('validation:error', {
        validationResultId,
        error: error instanceof Error ? error.message : String(error),
        schemaMappingResultId: schemaMappingResult.id,
      });
      throw error;
    }
  }

  /**
   * Get rules applicable to the report type
   */
  private getApplicableRules(reportTypeId?: string): ValidationRule[] {
    return this.validationRules.filter(rule => {
      if (!rule.enabled) return false;
      
      if (rule.appliesTo.includes('all')) return true;
      
      if (reportTypeId && rule.appliesTo.includes(reportTypeId)) return true;
      
      return false;
    });
  }

  /**
   * Process a single validation rule
   */
  private async processRule(
    rule: ValidationRule,
    schemaMappingResult: SchemaMappingResult,
    validationResult: ValidationResult
  ): Promise<{
    passed: boolean;
    finding?: ValidationFinding;
    violation?: ComplianceViolation;
    qualityIssue?: QualityIssue;
  }> {
    // Default implementation - in real system, this would evaluate the rule condition
    // For now, we'll simulate rule evaluation based on schema mapping result
    
    let passed = true;
    let finding: ValidationFinding | undefined;
    let violation: ComplianceViolation | undefined;
    let qualityIssue: QualityIssue | undefined;

    // Simulate rule evaluation based on rule type
    switch (rule.type) {
      case 'compliance':
        passed = this.evaluateComplianceRule(rule, schemaMappingResult);
        if (!passed) {
          violation = {
            id: generateComplianceViolationId(),
            standard: rule.regulationStandard || 'unknown',
            requirement: rule.name,
            severity: rule.severity,
            description: `Violation of ${rule.name}: ${rule.description}`,
            status: 'open',
          };
        }
        break;

      case 'quality':
        passed = this.evaluateQualityRule(rule, schemaMappingResult);
        if (!passed) {
          qualityIssue = {
            id: generateQualityIssueId(),
            category: 'clarity', // Use 'clarity' as default quality category
            description: `Quality issue: ${rule.description}`,
            severity: rule.severity,
            scoreImpact: rule.severity === 'critical' ? 20 :
                        rule.severity === 'high' ? 15 :
                        rule.severity === 'medium' ? 10 : 5,
          };
        }
        break;

      case 'completeness':
        passed = this.evaluateCompletenessRule(rule, schemaMappingResult);
        break;

      case 'consistency':
        passed = this.evaluateConsistencyRule(rule, schemaMappingResult);
        break;

      case 'terminology':
        passed = this.evaluateTerminologyRule(rule, schemaMappingResult);
        break;

      default:
        passed = true; // Default to passing for unknown rule types
    }

    // Create finding if rule failed
    if (!passed) {
      finding = {
        id: generateValidationFindingId(),
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.type,
        severity: rule.severity,
        description: `Rule "${rule.name}" failed: ${rule.description}`,
        contextData: {
          ruleId: rule.id,
          ruleType: rule.type,
          reportTypeId: schemaMappingResult.reportTypeId,
        },
        autoFixable: rule.autoFixable,
        detectedAt: new Date(),
        confidence: 0.8, // Default confidence
      };
    }

    return { passed, finding, violation, qualityIssue };
  }

  /**
   * Evaluate a compliance rule
   */
  private evaluateComplianceRule(rule: ValidationRule, schemaMappingResult: SchemaMappingResult): boolean {
    // Simplified compliance checking
    // In a real implementation, this would check against specific compliance requirements
    
    // Check for missing required sections
    if (rule.id === 'comp_001') {
      return schemaMappingResult.missingRequiredSections.length === 0;
    }
    
    // Check for compliance standard references
    if (rule.id === 'comp_002') {
      // Simplified check - in real system, would check for compliance markers
      return schemaMappingResult.schemaGaps.length < 3; // Arbitrary threshold
    }
    
    return true; // Default to passing
  }

  /**
   * Evaluate a quality rule
   */
  private evaluateQualityRule(rule: ValidationRule, schemaMappingResult: SchemaMappingResult): boolean {
    // Simplified quality checking
    
    // Check section clarity
    if (rule.id === 'qual_001') {
      // Check if sections have clear titles
      const unclearSections = schemaMappingResult.mappedFields.filter(field => 
        field.fieldName.length < 3 || field.fieldName === 'Untitled'
      );
      return unclearSections.length === 0;
    }
    
    // Check terminology consistency
    if (rule.id === 'qual_002') {
      return schemaMappingResult.unknownTerminology.length < 5; // Arbitrary threshold
    }
    
    return true; // Default to passing
  }

  /**
   * Evaluate a completeness rule
   */
  private evaluateCompletenessRule(rule: ValidationRule, schemaMappingResult: SchemaMappingResult): boolean {
    // Check section completeness
    if (rule.id === 'comp_003') {
      // Check if sections have sufficient content
      const incompleteSections = schemaMappingResult.mappedFields.filter(field => {
        const content = field.mappedValue;
        return typeof content === 'string' && content.length < 50; // Arbitrary threshold
      });
      return incompleteSections.length === 0;
    }
    
    return true; // Default to passing
  }

  /**
   * Evaluate a consistency rule
   */
  private evaluateConsistencyRule(rule: ValidationRule, schemaMappingResult: SchemaMappingResult): boolean {
    // Check date consistency
    if (rule.id === 'cons_001') {
      // Simplified check - in real system, would parse and compare dates
      return schemaMappingResult.schemaGaps.filter(gap => 
        gap.type === 'mismatched_schema'
      ).length === 0;
    }
    
    return true; // Default to passing
  }

  /**
   * Evaluate a terminology rule
   */
  private evaluateTerminologyRule(rule: ValidationRule, schemaMappingResult: SchemaMappingResult): boolean {
    // Check standard terminology
    if (rule.id === 'term_001') {
      return schemaMappingResult.unknownTerminology.length < 3; // Arbitrary threshold
    }
    
    return true; // Default to passing
  }

  /**
   * Calculate validation scores
   */
  private calculateScores(
    validationResult: ValidationResult,
    applicableRules: ValidationRule[],
    schemaMappingResult: SchemaMappingResult
  ): ValidationScores {
    // Initialize scores
    const scores: ValidationScores = {
      complianceScore: 0,
      qualityScore: 0,
      completenessScore: 0,
      consistencyScore: 0,
      overallScore: 0,
      ruleTypeScores: {
        compliance: 0,
        quality: 0,
        completeness: 0,
        consistency: 0,
        terminology: 0,
        formatting: 0,
        data_quality: 0,
        logical_coherence: 0,
      },
      severityCounts: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
    };

    // Count findings by severity
    for (const finding of validationResult.findings) {
      scores.severityCounts[finding.severity]++;
    }

    // Calculate rule type scores
    const rulesByType: Record<ValidationRuleType, { total: number; passed: number }> = {
      compliance: { total: 0, passed: 0 },
      quality: { total: 0, passed: 0 },
      completeness: { total: 0, passed: 0 },
      consistency: { total: 0, passed: 0 },
      terminology: { total: 0, passed: 0 },
      formatting: { total: 0, passed: 0 },
      data_quality: { total: 0, passed: 0 },
      logical_coherence: { total: 0, passed: 0 },
    };

    // Group rules by type
    for (const rule of applicableRules) {
      rulesByType[rule.type].total++;
    }

    // Calculate passed rules by type (simplified - in real system would track which rules passed)
    const totalRules = applicableRules.length;
    const passedRules = validationResult.rulesPassed;
    
    if (totalRules > 0) {
      const passRate = passedRules / totalRules;
      
      // Distribute pass rate across rule types (simplified)
      for (const ruleType of Object.keys(rulesByType) as ValidationRuleType[]) {
        const typeRules = rulesByType[ruleType];
        if (typeRules.total > 0) {
          // Assume similar pass rate across all types for simplicity
          scores.ruleTypeScores[ruleType] = Math.round(passRate * 100);
        }
      }
    }

    // Calculate main scores based on findings and rule results
    if (applicableRules.length > 0) {
      // Compliance score based on compliance rule pass rate
      const complianceRules = applicableRules.filter(r => r.type === 'compliance');
      if (complianceRules.length > 0) {
        // Simplified - assume 80% base with deductions for violations
        scores.complianceScore = Math.max(0, 80 - (validationResult.complianceViolations.length * 10));
      } else {
        scores.complianceScore = 100; // No compliance rules to check
      }

      // Quality score based on quality issues
      scores.qualityScore = Math.max(0, 85 - (validationResult.qualityIssues.length * 5));

      // Completeness score from schema mapping result
      scores.completenessScore = schemaMappingResult?.completenessScore || 0;

      // Consistency score (simplified)
      scores.consistencyScore = Math.max(0, 90 - (validationResult.findings.filter(f =>
        f.ruleType === 'consistency').length * 15));
    }

    return scores;
  }

  /**
   * Create a snapshot of schema mapping result
   */
  private createSchemaMappingSnapshot(schemaMappingResult: SchemaMappingResult): any {
    return {
      id: schemaMappingResult.id,
      reportTypeId: schemaMappingResult.reportTypeId,
      confidenceScore: schemaMappingResult.confidenceScore,
      mappingCoverage: schemaMappingResult.mappingCoverage,
      completenessScore: schemaMappingResult.completenessScore,
      mappedFieldsCount: schemaMappingResult.mappedFields.length,
      missingRequiredSectionsCount: schemaMappingResult.missingRequiredSections.length,
      extraSectionsCount: schemaMappingResult.extraSections.length,
      unknownTerminologyCount: schemaMappingResult.unknownTerminology.length,
      schemaGapsCount: schemaMappingResult.schemaGaps.length,
      createdAt: schemaMappingResult.createdAt,
    };
  }

  /**
   * Create a snapshot of report type definition
   */
  private createReportTypeSnapshot(reportType: ReportTypeDefinition): any {
    return {
      id: reportType.id,
      name: reportType.name,
      description: reportType.description,
      requiredSectionsCount: reportType.requiredSections.length,
      optionalSectionsCount: reportType.optionalSections?.length || 0,
      conditionalSectionsCount: reportType.conditionalSections?.length || 0,
      complianceRulesCount: reportType.complianceRules?.length || 0,
      version: reportType.version,
    };
  }

  /**
   * Emit an event to all registered listeners
   */
  private emitEvent(event: ValidationEvent, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      // Convert Set to Array to avoid downlevel iteration issues
      const listenerArray = Array.from(listeners);
      for (const listener of listenerArray) {
        try {
          listener(event, data);
        } catch (error) {
          console.error(`[ReportValidationEngine] Error in event listener for ${event}:`, error);
        }
      }
    }
  }

  /**
   * Register an event listener
   */
  on(event: ValidationEvent, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Remove an event listener
   */
  off(event: ValidationEvent, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Get validator version
   */
  getVersion(): string {
    return this.validatorVersion;
  }

  /**
   * Get all validation rules
   */
  getAllRules(): ValidationRule[] {
    return [...this.validationRules];
  }

  /**
   * Add a custom validation rule
   */
  addRule(rule: ValidationRule): void {
    // Check if rule with same ID already exists
    const existingIndex = this.validationRules.findIndex(r => r.id === rule.id);
    if (existingIndex !== -1) {
      throw new Error(`Validation rule with ID "${rule.id}" already exists`);
    }
    
    this.validationRules.push(rule);
    console.log(`[ReportValidationEngine] Added validation rule: ${rule.name} (${rule.id})`);
  }

  /**
   * Update an existing validation rule
   */
  updateRule(rule: ValidationRule): void {
    const existingIndex = this.validationRules.findIndex(r => r.id === rule.id);
    if (existingIndex === -1) {
      throw new Error(`Validation rule with ID "${rule.id}" not found`);
    }
    
    this.validationRules[existingIndex] = rule;
    console.log(`[ReportValidationEngine] Updated validation rule: ${rule.name} (${rule.id})`);
  }

  /**
   * Enable or disable a validation rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.validationRules.find(r => r.id === ruleId);
    if (!rule) {
      throw new Error(`Validation rule with ID "${ruleId}" not found`);
    }
    
    rule.enabled = enabled;
    console.log(`[ReportValidationEngine] ${enabled ? 'Enabled' : 'Disabled'} validation rule: ${rule.name} (${ruleId})`);
  }

  /**
   * Get validation rules by type
   */
  getRulesByType(ruleType: ValidationRuleType): ValidationRule[] {
    return this.validationRules.filter(rule => rule.type === ruleType && rule.enabled);
  }

  /**
   * Get validation rules by severity
   */
  getRulesBySeverity(severity: ValidationSeverity): ValidationRule[] {
    return this.validationRules.filter(rule => rule.severity === severity && rule.enabled);
  }
}

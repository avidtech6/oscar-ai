/**
 * Phase 9: Report Compliance Validator
 * Compliance Scoring
 * 
 * Computes overall compliance score based on validation results.
 */

import type { ComplianceResult } from '../ComplianceResult';
import type { ComplianceSeverity } from '../ComplianceResult';

/**
 * Scoring configuration
 */
export interface ComplianceScoringConfig {
  // Weights for different issue types
  weights: {
    missingSections: number;
    missingFields: number;
    ruleViolations: number;
    structuralIssues: number;
    terminologyIssues: number;
    contradictions: number;
  };
  
  // Severity multipliers
  severityMultipliers: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    warning: number;
  };
  
  // Scoring thresholds
  thresholds: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  
  // Maximum possible score
  maxScore: number;
}

/**
 * Default scoring configuration
 */
export const DEFAULT_SCORING_CONFIG: ComplianceScoringConfig = {
  weights: {
    missingSections: 2.0,
    missingFields: 1.5,
    ruleViolations: 2.5,
    structuralIssues: 1.0,
    terminologyIssues: 0.8,
    contradictions: 3.0,
  },
  severityMultipliers: {
    critical: 1.0,
    high: 0.8,
    medium: 0.5,
    low: 0.2,
    warning: 0.1,
  },
  thresholds: {
    excellent: 90,
    good: 75,
    fair: 60,
    poor: 40,
  },
  maxScore: 100,
};

/**
 * Computed compliance score
 */
export interface ComplianceScore {
  // Overall score (0-100)
  overallScore: number;
  
  // Category scores
  categoryScores: {
    completeness: number;      // Based on missing sections/fields
    correctness: number;       // Based on rule violations
    structure: number;         // Based on structural issues
    terminology: number;       // Based on terminology issues
    consistency: number;       // Based on contradictions
  };
  
  // Score breakdown
  breakdown: {
    missingSections: number;
    missingFields: number;
    ruleViolations: number;
    structuralIssues: number;
    terminologyIssues: number;
    contradictions: number;
  };
  
  // Grade/rating
  grade: 'excellent' | 'good' | 'fair' | 'poor' | 'failing';
  rating: string;
  
  // Recommendations for improvement
  improvementRecommendations: string[];
}

/**
 * Compute compliance score from validation results
 */
export function computeComplianceScore(
  complianceResult: ComplianceResult,
  config: Partial<ComplianceScoringConfig> = {}
): ComplianceScore {
  const mergedConfig = { ...DEFAULT_SCORING_CONFIG, ...config };
  
  // Initialize scores
  const categoryScores = {
    completeness: mergedConfig.maxScore,
    correctness: mergedConfig.maxScore,
    structure: mergedConfig.maxScore,
    terminology: mergedConfig.maxScore,
    consistency: mergedConfig.maxScore,
  };
  
  const breakdown = {
    missingSections: 0,
    missingFields: 0,
    ruleViolations: 0,
    structuralIssues: 0,
    terminologyIssues: 0,
    contradictions: 0,
  };
  
  const improvementRecommendations: string[] = [];
  
  // Calculate deductions for missing sections
  if (complianceResult.missingRequiredSections && complianceResult.missingRequiredSections.length > 0) {
    const deduction = calculateDeduction(
      complianceResult.missingRequiredSections.length,
      mergedConfig.weights.missingSections,
      'medium', // Missing sections are typically medium severity
      mergedConfig
    );
    breakdown.missingSections = deduction;
    categoryScores.completeness -= deduction;
    
    if (deduction > 0) {
      const sectionNames = complianceResult.missingRequiredSections.map(s => s.sectionName);
      improvementRecommendations.push(
        `Add ${complianceResult.missingRequiredSections.length} missing section(s): ${sectionNames.join(', ')}`
      );
    }
  }
  
  // Calculate deductions for missing fields
  if (complianceResult.missingRequiredFields && complianceResult.missingRequiredFields.length > 0) {
    const deduction = calculateDeduction(
      complianceResult.missingRequiredFields.length,
      mergedConfig.weights.missingFields,
      'medium', // Missing fields are typically medium severity
      mergedConfig
    );
    breakdown.missingFields = deduction;
    categoryScores.completeness -= deduction;
    
    if (deduction > 0) {
      improvementRecommendations.push(
        `Add ${complianceResult.missingRequiredFields.length} missing field(s)`
      );
    }
  }
  
  // Calculate deductions for rule violations
  if (complianceResult.failedComplianceRules && complianceResult.failedComplianceRules.length > 0) {
    const totalDeduction = complianceResult.failedComplianceRules.reduce((sum: number, violation) => {
      return sum + calculateDeduction(
        1,
        mergedConfig.weights.ruleViolations,
        violation.severity,
        mergedConfig
      );
    }, 0);
    
    breakdown.ruleViolations = totalDeduction;
    categoryScores.correctness -= totalDeduction;
    
    if (totalDeduction > 0) {
      const criticalCount = complianceResult.failedComplianceRules.filter(v => v.severity === 'critical').length;
      if (criticalCount > 0) {
        improvementRecommendations.push(
          `Fix ${criticalCount} critical rule violation(s)`
        );
      }
    }
  }
  
  // Calculate deductions for structural issues
  if (complianceResult.structuralIssues && complianceResult.structuralIssues.length > 0) {
    const totalDeduction = complianceResult.structuralIssues.reduce((sum, issue) => {
      return sum + calculateDeduction(
        1,
        mergedConfig.weights.structuralIssues,
        issue.severity,
        mergedConfig
      );
    }, 0);
    
    breakdown.structuralIssues = totalDeduction;
    categoryScores.structure -= totalDeduction;
    
    if (totalDeduction > 0) {
      improvementRecommendations.push(
        `Address ${complianceResult.structuralIssues.length} structural issue(s)`
      );
    }
  }
  
  // Calculate deductions for terminology issues
  if (complianceResult.terminologyIssues && complianceResult.terminologyIssues.length > 0) {
    const totalDeduction = complianceResult.terminologyIssues.reduce((sum, issue) => {
      return sum + calculateDeduction(
        1,
        mergedConfig.weights.terminologyIssues,
        issue.severity,
        mergedConfig
      );
    }, 0);
    
    breakdown.terminologyIssues = totalDeduction;
    categoryScores.terminology -= totalDeduction;
    
    if (totalDeduction > 0) {
      improvementRecommendations.push(
        `Correct ${complianceResult.terminologyIssues.length} terminology issue(s)`
      );
    }
  }
  
  // Calculate deductions for contradictions
  if (complianceResult.contradictions && complianceResult.contradictions.length > 0) {
    const totalDeduction = complianceResult.contradictions.reduce((sum, contradiction) => {
      return sum + calculateDeduction(
        1,
        mergedConfig.weights.contradictions,
        contradiction.severity,
        mergedConfig
      );
    }, 0);
    
    breakdown.contradictions = totalDeduction;
    categoryScores.consistency -= totalDeduction;
    
    if (totalDeduction > 0) {
      const highSeverityCount = complianceResult.contradictions.filter(c => 
        c.severity === 'critical' || c.severity === 'high'
      ).length;
      if (highSeverityCount > 0) {
        improvementRecommendations.push(
          `Resolve ${highSeverityCount} high-severity contradiction(s)`
        );
      }
    }
  }
  
  // Ensure scores don't go below 0
  Object.keys(categoryScores).forEach(key => {
    const categoryKey = key as keyof typeof categoryScores;
    if (categoryScores[categoryKey] < 0) {
      categoryScores[categoryKey] = 0;
    }
  });
  
  // Calculate overall score (weighted average of category scores)
  const overallScore = calculateWeightedAverage(categoryScores, mergedConfig.maxScore);
  
  // Determine grade
  const grade = determineGrade(overallScore, mergedConfig.thresholds);
  
  // Generate rating description
  const rating = generateRating(overallScore, grade, complianceResult);
  
  return {
    overallScore: Math.round(overallScore * 10) / 10, // Round to 1 decimal place
    categoryScores: {
      completeness: Math.round(categoryScores.completeness * 10) / 10,
      correctness: Math.round(categoryScores.correctness * 10) / 10,
      structure: Math.round(categoryScores.structure * 10) / 10,
      terminology: Math.round(categoryScores.terminology * 10) / 10,
      consistency: Math.round(categoryScores.consistency * 10) / 10,
    },
    breakdown,
    grade,
    rating,
    improvementRecommendations,
  };
}

/**
 * Calculate deduction for a specific issue type
 */
function calculateDeduction(
  count: number,
  weight: number,
  severity: ComplianceSeverity,
  config: ComplianceScoringConfig
): number {
  const severityMultiplier = config.severityMultipliers[severity];
  const baseDeduction = count * weight;
  return baseDeduction * severityMultiplier;
}

/**
 * Calculate weighted average of category scores
 */
function calculateWeightedAverage(
  categoryScores: ComplianceScore['categoryScores'],
  maxScore: number
): number {
  // Weights for each category (sum to 1.0)
  const weights = {
    completeness: 0.25,    // 25%
    correctness: 0.30,     // 30%
    structure: 0.15,       // 15%
    terminology: 0.10,     // 10%
    consistency: 0.20,     // 20%
  };
  
  // Calculate weighted sum
  const weightedSum = 
    (categoryScores.completeness / maxScore) * weights.completeness +
    (categoryScores.correctness / maxScore) * weights.correctness +
    (categoryScores.structure / maxScore) * weights.structure +
    (categoryScores.terminology / maxScore) * weights.terminology +
    (categoryScores.consistency / maxScore) * weights.consistency;
  
  // Convert back to 0-100 scale
  return weightedSum * maxScore;
}

/**
 * Determine grade based on score
 */
function determineGrade(
  score: number,
  thresholds: ComplianceScoringConfig['thresholds']
): ComplianceScore['grade'] {
  if (score >= thresholds.excellent) return 'excellent';
  if (score >= thresholds.good) return 'good';
  if (score >= thresholds.fair) return 'fair';
  if (score >= thresholds.poor) return 'poor';
  return 'failing';
}

/**
 * Generate rating description
 */
function generateRating(
  score: number,
  grade: ComplianceScore['grade'],
  complianceResult: ComplianceResult
): string {
  const totalIssues =
    (complianceResult.missingRequiredSections?.length || 0) +
    (complianceResult.missingRequiredFields?.length || 0) +
    (complianceResult.failedComplianceRules?.length || 0) +
    (complianceResult.structuralIssues?.length || 0) +
    (complianceResult.terminologyIssues?.length || 0) +
    (complianceResult.contradictions?.length || 0);
  
  const criticalIssues = [
    ...(complianceResult.failedComplianceRules?.filter((v: any) => v.severity === 'critical') || []),
    ...(complianceResult.structuralIssues?.filter((i: any) => i.severity === 'critical') || []),
    ...(complianceResult.terminologyIssues?.filter((i: any) => i.severity === 'critical') || []),
    ...(complianceResult.contradictions?.filter((c: any) => c.severity === 'critical') || []),
  ].length;
  
  switch (grade) {
    case 'excellent':
      return `Excellent compliance (${score}/100). Report meets all standards with minimal issues.`;
    case 'good':
      return `Good compliance (${score}/100). Report is generally compliant with ${totalIssues} minor issues.`;
    case 'fair':
      return `Fair compliance (${score}/100). Report has ${totalIssues} issues requiring attention.`;
    case 'poor':
      return `Poor compliance (${score}/100). Report has ${totalIssues} issues including ${criticalIssues} critical ones.`;
    case 'failing':
      return `Failing compliance (${score}/100). Report has significant compliance issues (${totalIssues} total, ${criticalIssues} critical).`;
    default:
      return `Compliance score: ${score}/100`;
  }
}

/**
 * Generate detailed score report
 */
export function generateScoreReport(score: ComplianceScore): string {
  const lines: string[] = [];
  
  lines.push(`# Compliance Score Report`);
  lines.push(``);
  lines.push(`## Overall Score: ${score.overallScore}/100 (${score.grade.toUpperCase()})`);
  lines.push(`**Rating:** ${score.rating}`);
  lines.push(``);
  
  lines.push(`## Category Scores`);
  lines.push(`| Category | Score |`);
  lines.push(`|----------|-------|`);
  lines.push(`| Completeness | ${score.categoryScores.completeness}/100 |`);
  lines.push(`| Correctness | ${score.categoryScores.correctness}/100 |`);
  lines.push(`| Structure | ${score.categoryScores.structure}/100 |`);
  lines.push(`| Terminology | ${score.categoryScores.terminology}/100 |`);
  lines.push(`| Consistency | ${score.categoryScores.consistency}/100 |`);
  lines.push(``);
  
  lines.push(`## Score Breakdown`);
  lines.push(`| Issue Type | Deduction |`);
  lines.push(`|------------|-----------|`);
  lines.push(`| Missing Sections | ${score.breakdown.missingSections.toFixed(1)} |`);
  lines.push(`| Missing Fields | ${score.breakdown.missingFields.toFixed(1)} |`);
  lines.push(`| Rule Violations | ${score.breakdown.ruleViolations.toFixed(1)} |`);
  lines.push(`| Structural Issues | ${score.breakdown.structuralIssues.toFixed(1)} |`);
  lines.push(`| Terminology Issues | ${score.breakdown.terminologyIssues.toFixed(1)} |`);
  lines.push(`| Contradictions | ${score.breakdown.contradictions.toFixed(1)} |`);
  lines.push(``);
  
  if (score.improvementRecommendations.length > 0) {
    lines.push(`## Improvement Recommendations`);
    score.improvementRecommendations.forEach(rec => {
      lines.push(`- ${rec}`);
    });
  } else {
    lines.push(`## Improvement Recommendations`);
    lines.push(`- No specific recommendations - report is compliant.`);
  }
  
  return lines.join('\n');
}
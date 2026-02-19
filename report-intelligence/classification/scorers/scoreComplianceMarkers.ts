/**
 * Report Classification Engine - Phase 6
 * Compliance Markers Scorer
 * 
 * Scores similarity between decompiled report compliance markers and report type compliance rules.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

/**
 * Compliance markers scoring result
 */
export interface ComplianceMarkersScore {
  score: number; // 0-1
  breakdown: {
    ruleMentionMatch: number;
    standardReferenceMatch: number;
    severityAlignment: number;
  };
  reasons: string[];
}

/**
 * Common compliance standards and their typical markers
 */
const COMPLIANCE_STANDARDS: Record<string, string[]> = {
  'BS5837': ['bs5837', '5837', 'british standard', 'tree survey'],
  'Arboricultural Association': ['arboricultural association', 'aa', 'tree work'],
  'ISO': ['iso', 'international standard', 'quality standard'],
  'Health and Safety': ['health and safety', 'hse', 'risk assessment', 'coshh'],
  'Planning': ['planning', 'local authority', 'development', 'permission'],
  'Insurance': ['insurance', 'indemnity', 'liability', 'cover', 'policy']
};

/**
 * Score compliance markers similarity between decompiled report and report type
 */
export async function scoreComplianceMarkers(
  decompiledReport: DecompiledReport,
  reportType: ReportTypeDefinition
): Promise<ComplianceMarkersScore> {
  const reasons: string[] = [];
  
  // Extract compliance markers from decompiled report
  const reportMarkers = decompiledReport.complianceMarkers || [];
  const reportText = decompiledReport.sections?.map(s => s.content).join(' ') || '';
  const reportTextLower = reportText.toLowerCase();
  
  // Get compliance rules from report type
  const typeRules = reportType.complianceRules || [];
  const typeStandards = reportType.standards || [];
  
  // 1. Rule mention match
  let ruleMentionMatch = 0;
  if (typeRules.length > 0) {
    // Check for rule mentions in text
    let ruleMatches = 0;
    for (const rule of typeRules) {
      const ruleNameLower = rule.name.toLowerCase();
      const ruleStandardLower = rule.standard.toLowerCase();
      
      if (reportTextLower.includes(ruleNameLower) || 
          reportTextLower.includes(ruleStandardLower) ||
          reportMarkers.some(m => m.standard?.toLowerCase().includes(ruleStandardLower))) {
        ruleMatches++;
      }
    }
    
    ruleMentionMatch = typeRules.length > 0 ? ruleMatches / typeRules.length : 0.3;
    
    if (ruleMatches > 0) {
      reasons.push(`Found ${ruleMatches} compliance rule mentions`);
    } else {
      reasons.push('No specific compliance rule mentions found');
    }
  } else {
    ruleMentionMatch = 0.5; // Neutral score when no rules defined
    reasons.push('No compliance rules defined for this report type');
  }
  
  // 2. Standard reference match
  let standardReferenceMatch = 0;
  if (typeStandards.length > 0) {
    // Check for standard references in text
    let standardMatches = 0;
    for (const standard of typeStandards) {
      const standardLower = standard.toLowerCase();
      
      // Check in text
      if (reportTextLower.includes(standardLower)) {
        standardMatches++;
        continue;
      }
      
      // Check in compliance markers
      if (reportMarkers.some(m => 
        m.standard?.toLowerCase().includes(standardLower) ||
        m.reference?.toLowerCase().includes(standardLower)
      )) {
        standardMatches++;
        continue;
      }
      
      // Check for known standard patterns
      for (const [stdKey, patterns] of Object.entries(COMPLIANCE_STANDARDS)) {
        if (standardLower.includes(stdKey.toLowerCase())) {
          if (patterns.some(pattern => reportTextLower.includes(pattern))) {
            standardMatches++;
            break;
          }
        }
      }
    }
    
    standardReferenceMatch = typeStandards.length > 0 ? standardMatches / typeStandards.length : 0.3;
    
    if (standardMatches > 0) {
      reasons.push(`Found ${standardMatches} standard references: ${typeStandards.slice(0, 3).join(', ')}`);
    } else {
      reasons.push('No standard references found');
    }
  } else {
    standardReferenceMatch = 0.5; // Neutral score when no standards defined
    reasons.push('No standards defined for compliance comparison');
  }
  
  // 3. Severity alignment
  let severityAlignment = 0.3; // Base score
  
  // Analyze severity distribution in report markers
  const reportSeverities = reportMarkers.map(m => m.severity).filter(Boolean);
  const typeSeverities = typeRules.map(r => r.severity);
  
  if (reportSeverities.length > 0 && typeSeverities.length > 0) {
    // Check if report has critical severity markers when type expects them
    const typeHasCritical = typeSeverities.includes('critical');
    const reportHasCritical = reportSeverities.includes('critical');
    
    if (typeHasCritical && reportHasCritical) {
      severityAlignment = 0.9;
      reasons.push('Critical severity markers align with report type expectations');
    } else if (!typeHasCritical && !reportHasCritical) {
      severityAlignment = 0.8;
      reasons.push('Non-critical severity profile matches report type');
    } else if (typeHasCritical && !reportHasCritical) {
      severityAlignment = 0.2;
      reasons.push('Missing critical severity markers expected for this report type');
    } else {
      severityAlignment = 0.5;
      reasons.push('Unexpected critical severity markers found');
    }
  } else if (reportSeverities.length === 0 && typeSeverities.length === 0) {
    severityAlignment = 0.7;
    reasons.push('No severity markers expected or found');
  } else if (reportSeverities.length === 0) {
    severityAlignment = 0.3;
    reasons.push('No severity markers found in report');
  } else {
    severityAlignment = 0.5;
    reasons.push('Insufficient data for severity alignment analysis');
  }
  
  // Calculate composite score (weighted average)
  const weights = {
    ruleMention: 0.3,
    standardReference: 0.4,
    severityAlignment: 0.3
  };
  
  const compositeScore = 
    (ruleMentionMatch * weights.ruleMention) +
    (standardReferenceMatch * weights.standardReference) +
    (severityAlignment * weights.severityAlignment);
  
  return {
    score: Math.min(Math.max(compositeScore, 0), 1), // Clamp to 0-1
    breakdown: {
      ruleMentionMatch,
      standardReferenceMatch,
      severityAlignment
    },
    reasons
  };
}
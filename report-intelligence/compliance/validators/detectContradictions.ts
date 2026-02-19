/**
 * Phase 9: Report Compliance Validator
 * Contradiction Detection
 * 
 * Detects logical contradictions and inconsistencies in the report.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ReportTypeRegistry } from '../../registry/ReportTypeRegistry';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import type { Contradiction, ComplianceSeverity } from '../ComplianceResult';
import { generateContradictionId } from '../ComplianceResult';

/**
 * Configuration for contradiction detection
 */
export interface ContradictionDetectionConfig {
  detectLogicalContradictions: boolean;
  detectTemporalContradictions: boolean;
  detectMethodologicalContradictions: boolean;
  detectDataContradictions: boolean;
  detectRecommendationContradictions: boolean;
  minimumConfidence: number;
  includeEvidence: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ContradictionDetectionConfig = {
  detectLogicalContradictions: true,
  detectTemporalContradictions: true,
  detectMethodologicalContradictions: true,
  detectDataContradictions: true,
  detectRecommendationContradictions: true,
  minimumConfidence: 0.7,
  includeEvidence: true,
};

/**
 * Detect contradictions in a report
 */
export async function detectContradictions(
  decompiledReport: DecompiledReport,
  schemaMappingResult: SchemaMappingResult,
  registry?: ReportTypeRegistry,
  config: Partial<ContradictionDetectionConfig> = {}
): Promise<Contradiction[]> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const contradictions: Contradiction[] = [];
  
  try {
    // Get report type
    const reportTypeId = schemaMappingResult.reportTypeId || decompiledReport.detectedReportType;
    if (!reportTypeId) {
      console.warn('[detectContradictions] Cannot detect contradictions: report type unknown');
      return contradictions;
    }
    
    // Get report type definition
    const reportType = registry?.getType(reportTypeId);
    
    // Detect logical contradictions
    if (mergedConfig.detectLogicalContradictions) {
      const logicalContradictions = detectLogicalContradictions(decompiledReport, mergedConfig);
      contradictions.push(...logicalContradictions);
    }
    
    // Detect temporal contradictions
    if (mergedConfig.detectTemporalContradictions) {
      const temporalContradictions = detectTemporalContradictions(decompiledReport, mergedConfig);
      contradictions.push(...temporalContradictions);
    }
    
    // Detect methodological contradictions
    if (mergedConfig.detectMethodologicalContradictions) {
      const methodologicalContradictions = detectMethodologicalContradictions(decompiledReport, mergedConfig);
      contradictions.push(...methodologicalContradictions);
    }
    
    // Detect data contradictions
    if (mergedConfig.detectDataContradictions) {
      const dataContradictions = detectDataContradictions(decompiledReport, schemaMappingResult, mergedConfig);
      contradictions.push(...dataContradictions);
    }
    
    // Detect recommendation contradictions
    if (mergedConfig.detectRecommendationContradictions) {
      const recommendationContradictions = detectRecommendationContradictions(decompiledReport, mergedConfig);
      contradictions.push(...recommendationContradictions);
    }
    
    return contradictions;
    
  } catch (error) {
    console.error('[detectContradictions] Error detecting contradictions:', error);
    throw error;
  }
}

/**
 * Detect logical contradictions
 */
function detectLogicalContradictions(
  decompiledReport: DecompiledReport,
  config: ContradictionDetectionConfig
): Contradiction[] {
  const contradictions: Contradiction[] = [];
  const sections = decompiledReport.sections || [];
  
  // Common logical contradiction patterns
  const contradictionPatterns = [
    {
      patternA: /(?:should|must|shall)\s+not\s+(?:be|have|include|contain)/i,
      patternB: /(?:is|has|includes|contains)\s+(?:the|a|an)\s+/i,
      description: 'Prohibition vs assertion contradiction',
    },
    {
      patternA: /(?:all|every|each)\s+/i,
      patternB: /(?:some|few|not all|not every)\s+/i,
      description: 'Universal vs particular contradiction',
    },
    {
      patternA: /(?:always|never)\s+/i,
      patternB: /(?:sometimes|occasionally|rarely)\s+/i,
      description: 'Absolute vs qualified contradiction',
    },
    {
      patternA: /(?:required|mandatory|essential)\s+/i,
      patternB: /(?:optional|discretionary|not required)\s+/i,
      description: 'Requirement vs optionality contradiction',
    },
  ];
  
  // Check each section for contradictions
  for (const section of sections) {
    if (!section.content) continue;
    
    const content = section.content.toLowerCase();
    
    // Check for internal contradictions within the same section
    for (const pattern of contradictionPatterns) {
      const matchesA = content.match(pattern.patternA);
      const matchesB = content.match(pattern.patternB);
      
      if (matchesA && matchesB) {
        contradictions.push({
          contradictionId: generateContradictionId(),
          type: 'logical',
          locationA: `Section: ${section.title}`,
          locationB: `Section: ${section.title}`,
          description: `Logical contradiction in "${section.title}": ${pattern.description}`,
          severity: 'medium',
          evidenceA: matchesA[0],
          evidenceB: matchesB[0],
          resolutionGuidance: 'Review and reconcile contradictory statements. Ensure consistency throughout the report.',
        });
      }
    }
  }
  
  // Check for contradictions between sections
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const sectionA = sections[i];
      const sectionB = sections[j];
      
      if (!sectionA.content || !sectionB.content) continue;
      
      const contentA = sectionA.content.toLowerCase();
      const contentB = sectionB.content.toLowerCase();
      
      // Check for contradictory statements between sections
      for (const pattern of contradictionPatterns) {
        const matchesA = contentA.match(pattern.patternA);
        const matchesB = contentB.match(pattern.patternB);
        
        if (matchesA && matchesB) {
          contradictions.push({
            contradictionId: generateContradictionId(),
            type: 'logical',
            locationA: `Section: ${sectionA.title}`,
            locationB: `Section: ${sectionB.title}`,
            description: `Logical contradiction between "${sectionA.title}" and "${sectionB.title}": ${pattern.description}`,
            severity: 'medium',
            evidenceA: matchesA[0],
            evidenceB: matchesB[0],
            resolutionGuidance: 'Review and reconcile contradictory statements between sections. Ensure consistency throughout the report.',
          });
        }
      }
    }
  }
  
  return contradictions;
}

/**
 * Detect temporal contradictions
 */
function detectTemporalContradictions(
  decompiledReport: DecompiledReport,
  config: ContradictionDetectionConfig
): Contradiction[] {
  const contradictions: Contradiction[] = [];
  const sections = decompiledReport.sections || [];
  
  // Extract temporal references
  const temporalReferences: Array<{
    section: string;
    reference: string;
    type: 'date' | 'time' | 'period' | 'sequence';
    value?: string;
  }> = [];
  
  // Temporal patterns
  const datePattern = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/g;
  const yearPattern = /\b(20\d{2}|19\d{2})\b/g;
  const timePattern = /\b(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]m)?)\b/gi;
  const sequencePattern = /\b(before|after|during|while|following|preceding|subsequent|previous)\b/gi;
  const periodPattern = /\b(week|month|year|day)s?\b/gi;
  
  // Collect temporal references
  for (const section of sections) {
    if (!section.content) continue;
    
    // Extract dates
    const dateMatches = section.content.match(datePattern);
    if (dateMatches) {
      for (const match of dateMatches) {
        temporalReferences.push({
          section: section.title,
          reference: match,
          type: 'date',
          value: match,
        });
      }
    }
    
    // Extract years
    const yearMatches = section.content.match(yearPattern);
    if (yearMatches) {
      for (const match of yearMatches) {
        temporalReferences.push({
          section: section.title,
          reference: match,
          type: 'date',
          value: match,
        });
      }
    }
    
    // Extract times
    const timeMatches = section.content.match(timePattern);
    if (timeMatches) {
      for (const match of timeMatches) {
        temporalReferences.push({
          section: section.title,
          reference: match,
          type: 'time',
          value: match,
        });
      }
    }
    
    // Extract sequence terms
    const sequenceMatches = section.content.match(sequencePattern);
    if (sequenceMatches) {
      for (const match of sequenceMatches) {
        temporalReferences.push({
          section: section.title,
          reference: match,
          type: 'sequence',
        });
      }
    }
    
    // Extract period terms
    const periodMatches = section.content.match(periodPattern);
    if (periodMatches) {
      for (const match of periodMatches) {
        temporalReferences.push({
          section: section.title,
          reference: match,
          type: 'period',
        });
      }
    }
  }
  
  // Check for temporal contradictions
  // Simple check: if dates are mentioned in wrong order
  const dates = temporalReferences.filter(ref => ref.type === 'date' && ref.value);
  
  for (let i = 0; i < dates.length; i++) {
    for (let j = i + 1; j < dates.length; j++) {
      const dateA = dates[i];
      const dateB = dates[j];
      
      // Try to parse dates (simplified check)
      const dateAValue = parseDate(dateA.value!);
      const dateBValue = parseDate(dateB.value!);
      
      if (dateAValue && dateBValue) {
        // Check if dates are contradictory based on context
        // For now, we'll just flag if dates are far apart and might indicate inconsistency
        const timeDiff = Math.abs(dateBValue.getTime() - dateAValue.getTime());
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        if (daysDiff > 365) { // More than a year apart
          contradictions.push({
            contradictionId: generateContradictionId(),
            type: 'temporal',
            locationA: `Section: ${dateA.section} (${dateA.value})`,
            locationB: `Section: ${dateB.section} (${dateB.value})`,
            description: `Significant time difference between dates: ${dateA.value} and ${dateB.value}`,
            severity: 'low',
            evidenceA: dateA.value,
            evidenceB: dateB.value,
            resolutionGuidance: 'Verify temporal consistency. Ensure dates are correctly recorded and contextualized.',
          });
        }
      }
    }
  }
  
  return contradictions;
}

/**
 * Detect methodological contradictions
 */
function detectMethodologicalContradictions(
  decompiledReport: DecompiledReport,
  config: ContradictionDetectionConfig
): Contradiction[] {
  const contradictions: Contradiction[] = [];
  const sections = decompiledReport.sections || [];
  
  // Methodological terms and their potential contradictions
  const methodologyTerms = [
    { term: 'visual assessment', contradictions: ['detailed assessment', 'instrumental assessment'] },
    { term: 'detailed assessment', contradictions: ['visual assessment', 'rapid assessment'] },
    { term: 'instrumental', contradictions: ['visual', 'non-invasive'] },
    { term: 'invasive', contradictions: ['non-invasive', 'minimally invasive'] },
    { term: 'quantitative', contradictions: ['qualitative', 'descriptive'] },
    { term: 'qualitative', contradictions: ['quantitative', 'numerical'] },
  ];
  
  // Check for methodological contradictions within and between sections
  const methodologyUsage: Record<string, {sections: string[], count: number}> = {};
  
  for (const section of sections) {
    if (!section.content) continue;
    
    const content = section.content.toLowerCase();
    
    for (const methodology of methodologyTerms) {
      if (content.includes(methodology.term.toLowerCase())) {
        if (!methodologyUsage[methodology.term]) {
          methodologyUsage[methodology.term] = { sections: [], count: 0 };
        }
        methodologyUsage[methodology.term].sections.push(section.title);
        methodologyUsage[methodology.term].count++;
      }
    }
  }
  
  // Check for contradictory methodology terms
  for (const methodology of methodologyTerms) {
    if (methodologyUsage[methodology.term]) {
      for (const contradictoryTerm of methodology.contradictions) {
        if (methodologyUsage[contradictoryTerm]) {
          contradictions.push({
            contradictionId: generateContradictionId(),
            type: 'methodological',
            locationA: `Sections: ${methodologyUsage[methodology.term].sections.join(', ')}`,
            locationB: `Sections: ${methodologyUsage[contradictoryTerm].sections.join(', ')}`,
            description: `Methodological contradiction: "${methodology.term}" vs "${contradictoryTerm}"`,
            severity: 'medium',
            evidenceA: `Uses "${methodology.term}" methodology`,
            evidenceB: `Uses "${contradictoryTerm}" methodology`,
            resolutionGuidance: 'Review and reconcile methodological approaches. Ensure consistent methodology throughout the report.',
          });
        }
      }
    }
  }
  
  return contradictions;
}

/**
 * Detect data contradictions
 */
function detectDataContradictions(
  decompiledReport: DecompiledReport,
  schemaMappingResult: SchemaMappingResult,
  config: ContradictionDetectionConfig
): Contradiction[] {
  const contradictions: Contradiction[] = [];
  
  // Check mapped fields for contradictions
  const mappedFields = schemaMappingResult.mappedFields || [];
  
  // Group fields by category
  const fieldGroups: Record<string, Array<{fieldName: string, mappedValue: any}>> = {};
  
  for (const field of mappedFields) {
    const category = field.fieldName.split('_')[0] || 'other';
    if (!fieldGroups[category]) {
      fieldGroups[category] = [];
    }
    fieldGroups[category].push({
      fieldName: field.fieldName,
      mappedValue: field.mappedValue,
    });
  }
  
  // Check for contradictory values within categories
  for (const [category, fields] of Object.entries(fieldGroups)) {
    if (fields.length < 2) continue;
    
    // Check for contradictory measurements
    if (category.includes('height') || category.includes('diameter') || category.includes('dbh')) {
      const numericValues = fields
        .map(f => parseFloat(String(f.mappedValue)))
        .filter(v => !isNaN(v));
      
      if (numericValues.length >= 2) {
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const range = max - min;
        
        // Flag if range is suspiciously large
        if (range > 10 && max > min * 2) { // Arbitrary thresholds
          contradictions.push({
            contradictionId: generateContradictionId(),
            type: 'data',
            locationA: `Field: ${fields.find(f => parseFloat(String(f.mappedValue)) === min)?.fieldName}`,
            locationB: `Field: ${fields.find(f => parseFloat(String(f.mappedValue)) === max)?.fieldName}`,
            description: `Large discrepancy in ${category} measurements: ${min} vs ${max}`,
            severity: 'medium',
            evidenceA: `Value: ${min}`,
            evidenceB: `Value: ${max}`,
            resolutionGuidance: 'Verify measurement accuracy and consistency. Check for unit conversion errors or data entry mistakes.',
          });
        }
      }
    }
    
    // Check for contradictory condition assessments
    if (category.includes('condition') || category.includes('health')) {
      const conditionValues = fields.map(f => String(f.mappedValue).toLowerCase());
      const uniqueConditions = [...new Set(conditionValues)];
      
      if (uniqueConditions.length > 1) {
        contradictions.push({
          contradictionId: generateContradictionId(),
          type: 'data',
          locationA: `Field: ${fields[0].fieldName}`,
          locationB: `Field: ${fields[1].fieldName}`,
          description: `Inconsistent condition assessments: ${uniqueConditions.join(' vs ')}`,
          severity: 'medium',
          evidenceA: `Assessment: ${conditionValues[0]}`,
          evidenceB: `Assessment: ${conditionValues[1]}`,
          resolutionGuidance: 'Review condition assessments for consistency. Ensure uniform assessment criteria are applied.',
        });
      }
    }
  }
  
  return contradictions;
}

/**
 * Parse date string (simplified)
 */
function parseDate(dateStr: string): Date | null {
  try {
    // Try various date formats
    const formats = [
      'dd/mm/yyyy',
      'dd-mm-yyyy',
      'dd.mm.yyyy',
      'mm/dd/yyyy',
      'mm-dd-yyyy',
      'mm.dd.yyyy',
      'yyyy/mm/dd',
      'yyyy-mm-dd',
      'yyyy.mm.dd',
    ];
    
    // Simple parsing for common formats
    const parts = dateStr.split(/[\/\-\.]/);
    if (parts.length === 3) {
      let day, month, year;
      
      // Try to determine format
      if (parts[0].length === 4) {
        // yyyy-mm-dd
        year = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        day = parseInt(parts[2]);
      } else if (parts[2].length === 4) {
        // dd-mm-yyyy or mm-dd-yyyy
        // Assume dd-mm-yyyy for UK format
        day = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        year = parseInt(parts[2]);
      } else {
        return null;
      }
      
      // Validate
      if (year < 1900 || year > 2100) return null;
      if (month < 0 || month > 11) return null;
      if (day < 1 || day > 31) return null;
      
      return new Date(year, month, day);
    }
    
    // Try parsing as year only
    const year = parseInt(dateStr);
    if (year >= 1900 && year <= 2100) {
      return new Date(year, 0, 1);
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Detect recommendation contradictions
 */
function detectRecommendationContradictions(
  decompiledReport: DecompiledReport,
  config: ContradictionDetectionConfig
): Contradiction[] {
  const contradictions: Contradiction[] = [];
  const sections = decompiledReport.sections || [];
  
  // Extract recommendations
  const recommendations: Array<{
    section: string;
    recommendation: string;
    type: 'action' | 'avoidance' | 'monitoring' | 'removal';
  }> = [];
  
  // Recommendation patterns
  const actionPattern = /\b(?:recommend|suggest|advise|propose)\s+(?:to\s+)?(?:remove|prune|cut|fell|reduce)/gi;
  const avoidancePattern = /\b(?:recommend|suggest|advise|propose)\s+(?:to\s+)?(?:avoid|not\s+to|do\s+not|refrain)/gi;
  const monitoringPattern = /\b(?:recommend|suggest|advise|propose)\s+(?:to\s+)?(?:monitor|observe|watch|check)/gi;
  const preservationPattern = /\b(?:recommend|suggest|advise|propose)\s+(?:to\s+)?(?:preserve|retain|keep|maintain)/gi;
  
  // Collect recommendations
  for (const section of sections) {
    if (!section.content) continue;
    
    const content = section.content;
    
    // Check for action recommendations
    const actionMatches = content.match(actionPattern);
    if (actionMatches) {
      for (const match of actionMatches) {
        recommendations.push({
          section: section.title,
          recommendation: match,
          type: 'removal',
        });
      }
    }
    
    // Check for avoidance recommendations
    const avoidanceMatches = content.match(avoidancePattern);
    if (avoidanceMatches) {
      for (const match of avoidanceMatches) {
        recommendations.push({
          section: section.title,
          recommendation: match,
          type: 'avoidance',
        });
      }
    }
    
    // Check for monitoring recommendations
    const monitoringMatches = content.match(monitoringPattern);
    if (monitoringMatches) {
      for (const match of monitoringMatches) {
        recommendations.push({
          section: section.title,
          recommendation: match,
          type: 'monitoring',
        });
      }
    }
    
    // Check for preservation recommendations
    const preservationMatches = content.match(preservationPattern);
    if (preservationMatches) {
      for (const match of preservationMatches) {
        recommendations.push({
          section: section.title,
          recommendation: match,
          type: 'action',
        });
      }
    }
  }
  
  // Check for contradictory recommendations
  for (let i = 0; i < recommendations.length; i++) {
    for (let j = i + 1; j < recommendations.length; j++) {
      const recA = recommendations[i];
      const recB = recommendations[j];
      
      // Check for removal vs preservation contradiction
      if ((recA.type === 'removal' && recB.type === 'action' && recB.recommendation.includes('preserve')) ||
          (recB.type === 'removal' && recA.type === 'action' && recA.recommendation.includes('preserve'))) {
        contradictions.push({
          contradictionId: generateContradictionId(),
          type: 'recommendation',
          locationA: `Section: ${recA.section}`,
          locationB: `Section: ${recB.section}`,
          description: 'Contradictory recommendations: removal vs preservation',
          severity: 'high',
          evidenceA: recA.recommendation,
          evidenceB: recB.recommendation,
          resolutionGuidance: 'Review and reconcile recommendations. Ensure consistent management approach.',
        });
      }
      
      // Check for action vs avoidance contradiction
      if ((recA.type === 'removal' && recB.type === 'avoidance') ||
          (recB.type === 'removal' && recA.type === 'avoidance')) {
        contradictions.push({
          contradictionId: generateContradictionId(),
          type: 'recommendation',
          locationA: `Section: ${recA.section}`,
          locationB: `Section: ${recB.section}`,
          description: 'Contradictory recommendations: action vs avoidance',
          severity: 'high',
          evidenceA: recA.recommendation,
          evidenceB: recB.recommendation,
          resolutionGuidance: 'Review and reconcile recommendations. Clarify management approach.',
        });
      }
    }
  }
  
  return contradictions;
}
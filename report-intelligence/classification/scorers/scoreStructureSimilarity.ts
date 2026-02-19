/**
 * Report Classification Engine - Phase 6
 * Structure Similarity Scorer
 * 
 * Scores similarity between decompiled report structure and report type structure.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

/**
 * Structure similarity scoring result
 */
export interface StructureSimilarityScore {
  score: number; // 0-1
  breakdown: {
    sectionCountSimilarity: number;
    requiredSectionCoverage: number;
    sectionHierarchySimilarity: number;
  };
  reasons: string[];
}

/**
 * Score structure similarity between decompiled report and report type
 */
export async function scoreStructureSimilarity(
  decompiledReport: DecompiledReport,
  reportType: ReportTypeDefinition
): Promise<StructureSimilarityScore> {
  const reasons: string[] = [];
  
  // 1. Section count similarity
  const reportSections = decompiledReport.sections?.length || 0;
  const typeRequiredSections = reportType.requiredSections.length;
  const typeOptionalSections = reportType.optionalSections.length;
  const typeTotalSections = typeRequiredSections + typeOptionalSections;
  
  let sectionCountSimilarity = 0;
  if (reportSections > 0 && typeTotalSections > 0) {
    const ratio = Math.min(reportSections, typeTotalSections) / Math.max(reportSections, typeTotalSections);
    sectionCountSimilarity = Math.min(ratio * 0.8 + 0.2, 1); // Base score with minimum 0.2
    
    if (sectionCountSimilarity > 0.7) {
      reasons.push(`Good section count match: ${reportSections} vs ${typeTotalSections} expected`);
    } else if (sectionCountSimilarity > 0.4) {
      reasons.push(`Moderate section count match: ${reportSections} vs ${typeTotalSections} expected`);
    } else {
      reasons.push(`Poor section count match: ${reportSections} vs ${typeTotalSections} expected`);
    }
  } else {
    reasons.push('Insufficient section data for comparison');
  }
  
  // 2. Required section coverage
  let requiredSectionCoverage = 0;
  if (typeRequiredSections > 0) {
    // In a real implementation, would check if required sections are present
    // For now, estimate based on section count ratio
    const coverageRatio = Math.min(reportSections, typeRequiredSections) / typeRequiredSections;
    requiredSectionCoverage = Math.min(coverageRatio, 1);
    
    if (requiredSectionCoverage > 0.8) {
      reasons.push(`High required section coverage: ${Math.round(requiredSectionCoverage * 100)}%`);
    } else if (requiredSectionCoverage > 0.5) {
      reasons.push(`Moderate required section coverage: ${Math.round(requiredSectionCoverage * 100)}%`);
    } else {
      reasons.push(`Low required section coverage: ${Math.round(requiredSectionCoverage * 100)}%`);
    }
  } else {
    requiredSectionCoverage = 0.5; // No required sections, neutral score
    reasons.push('No required sections defined for this report type');
  }
  
  // 3. Section hierarchy similarity
  let sectionHierarchySimilarity = 0.3; // Base score
  const reportHasHierarchy = decompiledReport.sections?.some(s => s.level > 1) || false;
  
  // Check if report type expects hierarchical structure
  const typeHasHierarchy = reportType.requiredSections.some(s => 
    s.name.toLowerCase().includes('subsection') || 
    s.description.toLowerCase().includes('hierarchy')
  );
  
  if (reportHasHierarchy === typeHasHierarchy) {
    sectionHierarchySimilarity = 0.8;
    reasons.push(typeHasHierarchy ? 'Hierarchical structure matches expectations' : 'Flat structure matches expectations');
  } else {
    sectionHierarchySimilarity = 0.2;
    reasons.push(typeHasHierarchy ? 'Expected hierarchical structure but found flat' : 'Expected flat structure but found hierarchical');
  }
  
  // Calculate composite score (weighted average)
  const weights = {
    sectionCount: 0.4,
    requiredCoverage: 0.4,
    hierarchy: 0.2
  };
  
  const compositeScore = 
    (sectionCountSimilarity * weights.sectionCount) +
    (requiredSectionCoverage * weights.requiredCoverage) +
    (sectionHierarchySimilarity * weights.hierarchy);
  
  return {
    score: Math.min(Math.max(compositeScore, 0), 1), // Clamp to 0-1
    breakdown: {
      sectionCountSimilarity,
      requiredSectionCoverage,
      sectionHierarchySimilarity
    },
    reasons
  };
}
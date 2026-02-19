/**
 * Report Style Learner - Phase 5
 * Section Ordering Extractor
 * 
 * Extracts section ordering preferences from decompiled reports.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { SectionOrdering } from '../StyleProfile';

/**
 * Extract section ordering from a decompiled report
 */
export async function extractSectionOrdering(decompiledReport: DecompiledReport): Promise<SectionOrdering[]> {
  try {
    const orderings: SectionOrdering[] = [];
    
    // Get report type
    const reportTypeId = decompiledReport.detectedReportType;
    if (!reportTypeId) {
      return [];
    }
    
    // Extract section order from structure
    const sectionOrder = extractSectionOrder(decompiledReport);
    
    if (sectionOrder.length > 0) {
      orderings.push({
        reportTypeId,
        preferredOrder: sectionOrder,
        confidence: calculateOrderingConfidence(decompiledReport),
        variations: detectOrderingVariations(decompiledReport, sectionOrder)
      });
    }
    
    return orderings;
    
  } catch (error) {
    console.error('Error extracting section ordering:', error);
    return [];
  }
}

/**
 * Extract section order from decompiled report
 */
function extractSectionOrder(report: DecompiledReport): string[] {
  const order: string[] = [];
  
  // Sort sections by start line (document order)
  const sortedSections = [...report.sections].sort((a, b) => a.startLine - b.startLine);
  
  // Extract meaningful section titles
  for (const section of sortedSections) {
    if (section.type === 'heading' || section.type === 'section') {
      // Create a normalized section ID from title
      const sectionId = normalizeSectionId(section.title);
      if (sectionId && !order.includes(sectionId)) {
        order.push(sectionId);
      }
    }
  }
  
  return order;
}

/**
 * Calculate confidence in section ordering
 */
function calculateOrderingConfidence(report: DecompiledReport): number {
  let confidence = 0;
  let factors = 0;
  
  // Factor 1: Number of sections
  const sectionCount = report.sections.filter(s => 
    s.type === 'heading' || s.type === 'section'
  ).length;
  
  if (sectionCount > 0) {
    const sectionFactor = Math.min(sectionCount / 10, 1);
    confidence += sectionFactor * 0.4;
    factors += 0.4;
  }
  
  // Factor 2: Report confidence
  if (report.confidenceScore) {
    confidence += report.confidenceScore * 0.3;
    factors += 0.3;
  }
  
  // Factor 3: Structure clarity
  const structureFactor = report.structureMap.depth > 1 ? 0.3 : 0.1;
  confidence += structureFactor;
  factors += 0.3;
  
  return factors > 0 ? confidence / factors : 0;
}

/**
 * Detect ordering variations
 */
function detectOrderingVariations(
  report: DecompiledReport,
  baseOrder: string[]
): Array<{ context: string; order: string[]; frequency: number }> {
  const variations: Array<{ context: string; order: string[]; frequency: number }> = [];
  
  // Look for alternative orderings in different report parts
  // For now, return empty array - would analyze multiple reports in real implementation
  
  return variations;
}

/**
 * Normalize section title to ID
 */
function normalizeSectionId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 50);
}
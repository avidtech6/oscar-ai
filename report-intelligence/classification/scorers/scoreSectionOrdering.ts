/**
 * Report Classification Engine - Phase 6
 * Section Ordering Scorer
 * 
 * Scores similarity between decompiled report section ordering and report type section ordering patterns.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

/**
 * Section ordering scoring result
 */
export interface SectionOrderingScore {
  score: number; // 0-1
  breakdown: {
    logicalFlow: number;
    requiredSectionOrder: number;
    templateAlignment: number;
  };
  reasons: string[];
}

/**
 * Common section ordering patterns by report category
 */
const ORDERING_PATTERNS: Record<string, string[][]> = {
  survey: [
    ['introduction', 'methodology', 'results', 'conclusion', 'recommendations'],
    ['executive summary', 'introduction', 'site description', 'findings', 'conclusion'],
    ['background', 'scope', 'method', 'data', 'analysis', 'summary']
  ],
  assessment: [
    ['executive summary', 'introduction', 'assessment criteria', 'findings', 'recommendations'],
    ['purpose', 'scope', 'methodology', 'analysis', 'conclusions', 'actions'],
    ['overview', 'evaluation', 'risks', 'opportunities', 'conclusion']
  ],
  method: [
    ['introduction', 'scope', 'procedures', 'equipment', 'safety', 'appendices'],
    ['purpose', 'applicability', 'steps', 'controls', 'verification'],
    ['objective', 'method', 'materials', 'steps', 'quality control']
  ],
  condition: [
    ['introduction', 'inspection', 'findings', 'condition assessment', 'recommendations'],
    ['executive summary', 'background', 'inspection data', 'analysis', 'conclusion'],
    ['overview', 'method', 'results', 'assessment', 'actions']
  ],
  safety: [
    ['introduction', 'hazard identification', 'risk assessment', 'control measures', 'conclusion'],
    ['executive summary', 'scope', 'risks', 'controls', 'monitoring', 'review'],
    ['purpose', 'hazards', 'assessment', 'precautions', 'emergency']
  ],
  insurance: [
    ['executive summary', 'incident details', 'assessment', 'valuation', 'recommendation'],
    ['introduction', 'background', 'analysis', 'conclusion', 'settlement'],
    ['claim details', 'investigation', 'findings', 'determination', 'resolution']
  ]
};

/**
 * Common section types and their typical positions
 */
const SECTION_POSITIONS: Record<string, { early: string[], middle: string[], late: string[] }> = {
  survey: {
    early: ['introduction', 'executive summary', 'background', 'scope'],
    middle: ['methodology', 'site description', 'data', 'findings', 'analysis'],
    late: ['conclusion', 'recommendations', 'summary', 'appendices']
  },
  assessment: {
    early: ['executive summary', 'introduction', 'purpose', 'scope'],
    middle: ['assessment', 'evaluation', 'analysis', 'findings', 'risks'],
    late: ['conclusion', 'recommendations', 'actions', 'next steps']
  },
  method: {
    early: ['introduction', 'purpose', 'scope', 'objective'],
    middle: ['method', 'procedure', 'steps', 'equipment', 'materials'],
    late: ['safety', 'quality control', 'verification', 'appendices']
  }
};

/**
 * Score section ordering similarity between decompiled report and report type
 */
export async function scoreSectionOrdering(
  decompiledReport: DecompiledReport,
  reportType: ReportTypeDefinition
): Promise<SectionOrderingScore> {
  const reasons: string[] = [];
  
  // Extract sections from decompiled report
  const reportSections = decompiledReport.sections || [];
  const sectionTitles = reportSections.map(s => s.title?.toLowerCase() || '');
  
  // Get report type category and sections
  const typeCategory = reportType.category;
  const typeRequiredSections = reportType.requiredSections || [];
  const typeOptionalSections = reportType.optionalSections || [];
  const allTypeSections = [...typeRequiredSections, ...typeOptionalSections];
  
  // 1. Logical flow analysis
  let logicalFlow = 0.3; // Base score
  
  if (sectionTitles.length >= 3) {
    // Check for common logical progression patterns
    const hasIntroduction = sectionTitles.some(title => 
      title.includes('intro') || title.includes('background') || title.includes('purpose')
    );
    
    const hasMiddle = sectionTitles.some((title, index) => {
      if (index > 0 && index < sectionTitles.length - 1) {
        return title.includes('method') || title.includes('analysis') || 
               title.includes('findings') || title.includes('data');
      }
      return false;
    });
    
    const hasConclusion = sectionTitles.some(title => 
      title.includes('conclusion') || title.includes('summary') || 
      title.includes('recommendation') || title.includes('result')
    );
    
    const flowScore = (hasIntroduction ? 0.3 : 0) + 
                     (hasMiddle ? 0.4 : 0) + 
                     (hasConclusion ? 0.3 : 0);
    
    logicalFlow = Math.min(flowScore, 1);
    
    if (flowScore > 0.8) {
      reasons.push('Strong logical flow: introduction → analysis → conclusion');
    } else if (flowScore > 0.5) {
      reasons.push('Moderate logical flow detected');
    } else {
      reasons.push('Weak or atypical logical flow');
    }
  } else {
    reasons.push('Insufficient sections for flow analysis');
  }
  
  // 2. Required section order
  let requiredSectionOrder = 0.3; // Base score
  
  if (typeRequiredSections.length > 0 && sectionTitles.length > 0) {
    // Check if required sections appear in reasonable order
    const requiredSectionNames = typeRequiredSections.map(s => s.name.toLowerCase());
    
    // Find positions of required sections in report
    const sectionPositions: number[] = [];
    for (const requiredName of requiredSectionNames) {
      const position = sectionTitles.findIndex(title => 
        title.includes(requiredName) || requiredName.includes(title)
      );
      if (position !== -1) {
        sectionPositions.push(position);
      }
    }
    
    // Check if positions are in ascending order (sections appear in order)
    if (sectionPositions.length >= 2) {
      let inOrder = true;
      for (let i = 1; i < sectionPositions.length; i++) {
        if (sectionPositions[i] < sectionPositions[i - 1]) {
          inOrder = false;
          break;
        }
      }
      
      requiredSectionOrder = inOrder ? 0.8 : 0.4;
      
      if (inOrder) {
        reasons.push('Required sections appear in logical order');
      } else {
        reasons.push('Required sections appear out of expected order');
      }
    } else if (sectionPositions.length === 1) {
      requiredSectionOrder = 0.6;
      reasons.push('Single required section found in expected position');
    } else {
      requiredSectionOrder = 0.2;
      reasons.push('No required sections found in report');
    }
  } else {
    requiredSectionOrder = 0.5; // Neutral score
    reasons.push('No required sections defined or insufficient data');
  }
  
  // 3. Template alignment
  let templateAlignment = 0.3; // Base score
  
  // Get ordering patterns for this category
  const categoryPatterns = ORDERING_PATTERNS[typeCategory] || [];
  const categoryPositions = SECTION_POSITIONS[typeCategory];
  
  if (categoryPatterns.length > 0 && sectionTitles.length >= 3) {
    // Calculate similarity to each pattern
    let bestPatternScore = 0;
    
    for (const pattern of categoryPatterns) {
      let patternScore = 0;
      let matches = 0;
      
      for (let i = 0; i < Math.min(sectionTitles.length, pattern.length); i++) {
        const reportTitle = sectionTitles[i];
        const patternTitle = pattern[i];
        
        // Check for title similarity
        if (reportTitle.includes(patternTitle) || patternTitle.includes(reportTitle)) {
          matches++;
          patternScore += 1 - (Math.abs(i - pattern.indexOf(patternTitle)) / pattern.length);
        }
      }
      
      if (matches > 0) {
        patternScore = patternScore / Math.min(sectionTitles.length, pattern.length);
        bestPatternScore = Math.max(bestPatternScore, patternScore);
      }
    }
    
    templateAlignment = Math.min(bestPatternScore * 1.2, 1); // Scale up slightly
    
    if (templateAlignment > 0.7) {
      reasons.push('Strong alignment with typical section ordering pattern');
    } else if (templateAlignment > 0.4) {
      reasons.push('Moderate alignment with typical section ordering');
    } else {
      reasons.push('Weak alignment with typical section ordering patterns');
    }
  } else if (categoryPositions && sectionTitles.length > 0) {
    // Check section positions against expected positions
    let positionScore = 0;
    let positionChecks = 0;
    
    for (let i = 0; i < sectionTitles.length; i++) {
      const title = sectionTitles[i];
      const position = i / Math.max(sectionTitles.length - 1, 1); // 0-1 normalized position
      
      // Check if title matches early, middle, or late expected sections
      let expectedPosition = 'middle'; // Default
      if (position < 0.33) expectedPosition = 'early';
      else if (position > 0.66) expectedPosition = 'late';
      
      const expectedSections = categoryPositions[expectedPosition as keyof typeof categoryPositions] || [];
      const hasMatch = expectedSections.some(expected => title.includes(expected) || expected.includes(title));
      
      if (hasMatch) {
        positionScore += 1;
      }
      positionChecks++;
    }
    
    templateAlignment = positionChecks > 0 ? positionScore / positionChecks : 0.3;
    
    if (templateAlignment > 0.7) {
      reasons.push('Good section position alignment with category expectations');
    } else if (templateAlignment > 0.4) {
      reasons.push('Moderate section position alignment');
    } else {
      reasons.push('Poor section position alignment');
    }
  } else {
    reasons.push('No ordering patterns defined for this category');
  }
  
  // Calculate composite score (weighted average)
  const weights = {
    logicalFlow: 0.4,
    requiredSectionOrder: 0.4,
    templateAlignment: 0.2
  };
  
  const compositeScore = 
    (logicalFlow * weights.logicalFlow) +
    (requiredSectionOrder * weights.requiredSectionOrder) +
    (templateAlignment * weights.templateAlignment);
  
  return {
    score: Math.min(Math.max(compositeScore, 0), 1), // Clamp to 0-1
    breakdown: {
      logicalFlow,
      requiredSectionOrder,
      templateAlignment
    },
    reasons
  };
}
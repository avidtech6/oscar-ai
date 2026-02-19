/**
 * Report Classification Engine - Phase 6
 * Terminology Similarity Scorer
 * 
 * Scores similarity between decompiled report terminology and report type terminology.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

/**
 * Terminology similarity scoring result
 */
export interface TerminologySimilarityScore {
  score: number; // 0-1
  breakdown: {
    standardTerminologyMatch: number;
    domainTerminologyMatch: number;
    technicalTermDensity: number;
  };
  reasons: string[];
}

/**
 * Common terminology patterns by report category
 */
const CATEGORY_TERMINOLOGY: Record<string, string[]> = {
  survey: ['survey', 'site', 'assessment', 'observation', 'measurement', 'data', 'findings'],
  assessment: ['assessment', 'evaluation', 'analysis', 'review', 'appraisal', 'judgment'],
  method: ['method', 'procedure', 'process', 'approach', 'technique', 'protocol'],
  condition: ['condition', 'state', 'status', 'health', 'integrity', 'deterioration'],
  safety: ['safety', 'risk', 'hazard', 'danger', 'precaution', 'protection'],
  insurance: ['insurance', 'claim', 'coverage', 'policy', 'premium', 'liability'],
  custom: ['custom', 'specific', 'unique', 'tailored', 'bespoke']
};

/**
 * Score terminology similarity between decompiled report and report type
 */
export async function scoreTerminologySimilarity(
  decompiledReport: DecompiledReport,
  reportType: ReportTypeDefinition
): Promise<TerminologySimilarityScore> {
  const reasons: string[] = [];
  
  // Extract terminology from decompiled report
  const reportTerms = decompiledReport.terminology || [];
  const reportText = decompiledReport.sections?.map(s => s.content).join(' ') || '';
  const reportWords = reportText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  // Get expected terminology for report type category
  const category = reportType.category;
  const expectedTerms = CATEGORY_TERMINOLOGY[category] || [];
  const typeStandards = reportType.standards || [];
  const typeTags = reportType.tags || [];
  
  // 1. Standard terminology match
  let standardTerminologyMatch = 0;
  if (typeStandards.length > 0) {
    // Check for standard references in text
    const standardMatches = typeStandards.filter(standard => 
      reportText.toLowerCase().includes(standard.toLowerCase())
    );
    standardTerminologyMatch = typeStandards.length > 0 
      ? standardMatches.length / typeStandards.length 
      : 0.3;
    
    if (standardMatches.length > 0) {
      reasons.push(`Found ${standardMatches.length} standard references: ${standardMatches.slice(0, 3).join(', ')}`);
    } else {
      reasons.push('No standard terminology matches found');
    }
  } else {
    standardTerminologyMatch = 0.5; // Neutral score when no standards defined
    reasons.push('No standards defined for terminology comparison');
  }
  
  // 2. Domain terminology match
  let domainTerminologyMatch = 0;
  const allExpectedTerms = [...expectedTerms, ...typeTags];
  
  if (allExpectedTerms.length > 0 && reportWords.length > 0) {
    // Count matches of expected terms in report text
    let matchCount = 0;
    for (const term of allExpectedTerms) {
      const termLower = term.toLowerCase();
      if (reportWords.some(word => word.includes(termLower)) || 
          reportTerms.some(t => t.term.toLowerCase().includes(termLower))) {
        matchCount++;
      }
    }
    
    domainTerminologyMatch = matchCount / allExpectedTerms.length;
    
    if (domainTerminologyMatch > 0.7) {
      reasons.push(`Strong domain terminology match: ${matchCount}/${allExpectedTerms.length} terms`);
    } else if (domainTerminologyMatch > 0.4) {
      reasons.push(`Moderate domain terminology match: ${matchCount}/${allExpectedTerms.length} terms`);
    } else {
      reasons.push(`Weak domain terminology match: ${matchCount}/${allExpectedTerms.length} terms`);
    }
  } else {
    domainTerminologyMatch = 0.3;
    reasons.push('Insufficient terminology data for comparison');
  }
  
  // 3. Technical term density
  let technicalTermDensity = 0.3; // Base score
  
  // Count technical terms (long words, acronyms, specialized terms)
  const technicalIndicators = [
    /[A-Z]{3,}/g, // Acronyms
    /[a-z]{8,}/g, // Long words
    /\d+\.\d+/g,  // Decimal numbers
    /%|§|¶|©|®|™/g // Special symbols
  ];
  
  let technicalCount = 0;
  for (const indicator of technicalIndicators) {
    const matches = reportText.match(indicator) || [];
    technicalCount += matches.length;
  }
  
  // Normalize by text length
  const wordCount = reportWords.length;
  if (wordCount > 100) {
    const density = technicalCount / (wordCount / 100); // per 100 words
    technicalTermDensity = Math.min(density / 10, 1); // Scale to 0-1
    
    if (technicalTermDensity > 0.7) {
      reasons.push('High technical term density suggests specialized content');
    } else if (technicalTermDensity > 0.4) {
      reasons.push('Moderate technical term density');
    } else {
      reasons.push('Low technical term density suggests general content');
    }
  } else {
    reasons.push('Insufficient text for technical term analysis');
  }
  
  // Calculate composite score (weighted average)
  const weights = {
    standard: 0.4,
    domain: 0.4,
    technical: 0.2
  };
  
  const compositeScore = 
    (standardTerminologyMatch * weights.standard) +
    (domainTerminologyMatch * weights.domain) +
    (technicalTermDensity * weights.technical);
  
  return {
    score: Math.min(Math.max(compositeScore, 0), 1), // Clamp to 0-1
    breakdown: {
      standardTerminologyMatch,
      domainTerminologyMatch,
      technicalTermDensity
    },
    reasons
  };
}
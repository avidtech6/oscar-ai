/**
 * Report Classification Engine - Phase 6
 * Metadata Scorer
 * 
 * Scores similarity between decompiled report metadata and report type metadata expectations.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

/**
 * Metadata scoring result
 */
export interface MetadataScore {
  score: number; // 0-1
  breakdown: {
    categoryMatch: number;
    audienceAlignment: number;
    complexityAlignment: number;
  };
  reasons: string[];
}

/**
 * Expected metadata patterns by report category
 */
const CATEGORY_EXPECTATIONS: Record<string, {
  typicalAudience: string[];
  typicalComplexity: ('simple' | 'medium' | 'complex')[];
}> = {
  survey: {
    typicalAudience: ['planners', 'developers', 'local authority', 'clients'],
    typicalComplexity: ['medium', 'complex']
  },
  assessment: {
    typicalAudience: ['technical', 'experts', 'assessors', 'reviewers'],
    typicalComplexity: ['complex']
  },
  method: {
    typicalAudience: ['contractors', 'workers', 'supervisors', 'safety officers'],
    typicalComplexity: ['medium']
  },
  condition: {
    typicalAudience: ['owners', 'managers', 'inspectors', 'surveyors'],
    typicalComplexity: ['simple', 'medium']
  },
  safety: {
    typicalAudience: ['safety officers', 'managers', 'regulators', 'workers'],
    typicalComplexity: ['medium', 'complex']
  },
  insurance: {
    typicalAudience: ['insurers', 'adjusters', 'claimants', 'legal'],
    typicalComplexity: ['complex']
  },
  custom: {
    typicalAudience: ['various', 'specific'],
    typicalComplexity: ['simple', 'medium', 'complex']
  }
};

/**
 * Score metadata similarity between decompiled report and report type
 */
export async function scoreMetadata(
  decompiledReport: DecompiledReport,
  reportType: ReportTypeDefinition
): Promise<MetadataScore> {
  const reasons: string[] = [];
  
  // Extract metadata from decompiled report
  const reportMetadata = decompiledReport.metadata || {};
  const reportText = decompiledReport.sections?.map(s => s.content).join(' ') || '';
  const reportTextLower = reportText.toLowerCase();
  
  // Get report type metadata
  const typeCategory = reportType.category;
  const typeAudience = reportType.typicalAudience || [];
  const typeComplexity = reportType.complexity;
  
  // 1. Category match
  let categoryMatch = 0.3; // Base score
  
  // Check for category indicators in text
  const categoryIndicators: Record<string, string[]> = {
    survey: ['survey', 'site visit', 'observation', 'measurement', 'data collection'],
    assessment: ['assessment', 'evaluation', 'analysis', 'appraisal', 'review'],
    method: ['method', 'procedure', 'process', 'approach', 'technique', 'protocol'],
    condition: ['condition', 'state', 'status', 'health', 'integrity', 'deterioration'],
    safety: ['safety', 'risk', 'hazard', 'danger', 'precaution', 'protection'],
    insurance: ['insurance', 'claim', 'coverage', 'policy', 'premium', 'liability']
  };
  
  const indicators = categoryIndicators[typeCategory] || [];
  let indicatorMatches = 0;
  for (const indicator of indicators) {
    if (reportTextLower.includes(indicator.toLowerCase())) {
      indicatorMatches++;
    }
  }
  
  if (indicators.length > 0) {
    categoryMatch = indicatorMatches / indicators.length;
    
    if (categoryMatch > 0.7) {
      reasons.push(`Strong category match: ${indicatorMatches}/${indicators.length} indicators found`);
    } else if (categoryMatch > 0.4) {
      reasons.push(`Moderate category match: ${indicatorMatches}/${indicators.length} indicators found`);
    } else {
      reasons.push(`Weak category match: ${indicatorMatches}/${indicators.length} indicators found`);
    }
  } else {
    reasons.push('No specific category indicators defined');
  }
  
  // 2. Audience alignment
  let audienceAlignment = 0.3; // Base score
  
  if (typeAudience.length > 0) {
    // Check for audience references in text
    let audienceMatches = 0;
    for (const audience of typeAudience) {
      const audienceLower = audience.toLowerCase();
      
      // Direct mention
      if (reportTextLower.includes(audienceLower)) {
        audienceMatches++;
        continue;
      }
      
      // Related terms
      const audienceSynonyms: Record<string, string[]> = {
        'planners': ['planning', 'development', 'design'],
        'developers': ['development', 'construction', 'builder'],
        'clients': ['client', 'customer', 'owner', 'stakeholder'],
        'technical': ['technical', 'expert', 'specialist', 'engineer'],
        'contractors': ['contractor', 'subcontractor', 'worker', 'crew'],
        'safety officers': ['safety', 'health', 'hse', 'officer'],
        'regulators': ['regulator', 'authority', 'compliance', 'enforcement']
      };
      
      const synonyms = audienceSynonyms[audienceLower] || [];
      if (synonyms.some(synonym => reportTextLower.includes(synonym))) {
        audienceMatches++;
      }
    }
    
    audienceAlignment = typeAudience.length > 0 ? audienceMatches / typeAudience.length : 0.3;
    
    if (audienceMatches > 0) {
      reasons.push(`Audience alignment: ${audienceMatches}/${typeAudience.length} audience references found`);
    } else {
      reasons.push('No specific audience references found');
    }
  } else {
    audienceAlignment = 0.5; // Neutral score when no audience defined
    reasons.push('No target audience defined for this report type');
  }
  
  // 3. Complexity alignment
  let complexityAlignment = 0.5; // Base score
  
  // Analyze text complexity
  const wordCount = reportText.split(/\s+/).length;
  const sentenceCount = (reportText.match(/[.!?]+/g) || []).length;
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  
  // Estimate complexity based on text characteristics
  let estimatedComplexity: 'simple' | 'medium' | 'complex' = 'medium';
  
  if (wordCount < 500) {
    estimatedComplexity = 'simple';
  } else if (wordCount > 2000) {
    estimatedComplexity = 'complex';
  } else if (avgSentenceLength > 25) {
    estimatedComplexity = 'complex';
  } else if (avgSentenceLength < 15) {
    estimatedComplexity = 'simple';
  }
  
  // Check alignment with report type complexity
  if (typeComplexity === estimatedComplexity) {
    complexityAlignment = 0.9;
    reasons.push(`Complexity alignment: ${typeComplexity} matches estimated ${estimatedComplexity}`);
  } else {
    // Check if estimated complexity is within expected range for category
    const categoryExpectation = CATEGORY_EXPECTATIONS[typeCategory];
    if (categoryExpectation?.typicalComplexity.includes(estimatedComplexity)) {
      complexityAlignment = 0.7;
      reasons.push(`Complexity partially aligned: ${estimatedComplexity} is typical for ${typeCategory} reports`);
    } else {
      complexityAlignment = 0.3;
      reasons.push(`Complexity mismatch: ${typeComplexity} expected but ${estimatedComplexity} estimated`);
    }
  }
  
  // Calculate composite score (weighted average)
  const weights = {
    categoryMatch: 0.5,
    audienceAlignment: 0.3,
    complexityAlignment: 0.2
  };
  
  const compositeScore = 
    (categoryMatch * weights.categoryMatch) +
    (audienceAlignment * weights.audienceAlignment) +
    (complexityAlignment * weights.complexityAlignment);
  
  return {
    score: Math.min(Math.max(compositeScore, 0), 1), // Clamp to 0-1
    breakdown: {
      categoryMatch,
      audienceAlignment,
      complexityAlignment
    },
    reasons
  };
}
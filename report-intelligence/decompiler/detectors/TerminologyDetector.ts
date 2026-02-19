/**
 * Terminology Detector Module
 * 
 * Extracts domain-specific terminology from report text.
 */

import type { DecompiledReport, TerminologyEntry } from '../DecompiledReport';

export interface TerminologyDetectionResult {
  count: number;
  confidence: number;
  terminology: TerminologyEntry[];
}

export class TerminologyDetector {
  private technicalTerms = [
    'arboricultural', 'bs5837', 'rpa', 'dbh', 'canopy', 'root', 'protection',
    'mitigation', 'assessment', 'methodology', 'compliance', 'category',
    'species', 'condition', 'hazard', 'risk', 'inspection', 'survey',
    'tree', 'arborist', 'preservation', 'conservation', 'management',
    'planning', 'development', 'construction', 'site', 'vegetation',
    'woodland', 'forestry', 'ecology', 'environmental', 'heritage'
  ];
  
  /**
   * Extract terminology from the report text
   */
  async detect(report: DecompiledReport): Promise<TerminologyDetectionResult> {
    const terminology: TerminologyEntry[] = [];
    
    for (const term of this.technicalTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = report.normalizedText.match(regex);
      
      if (matches && matches.length > 0) {
        // Find context (first occurrence)
        const firstIndex = report.normalizedText.toLowerCase().indexOf(term);
        const contextStart = Math.max(0, firstIndex - 50);
        const contextEnd = Math.min(report.normalizedText.length, firstIndex + term.length + 50);
        const context = report.normalizedText.substring(contextStart, contextEnd);
        
        terminology.push({
          term,
          context,
          frequency: matches.length,
          category: this.categorizeTerm(term),
          confidence: 0.8,
        });
      }
    }
    
    return {
      count: terminology.length,
      confidence: terminology.length > 0 ? 0.7 : 0.3,
      terminology,
    };
  }
  
  /**
   * Categorize terminology term
   */
  private categorizeTerm(term: string): 'technical' | 'legal' | 'compliance' | 'species' | 'measurement' | 'general' {
    const technicalTerms = ['arboricultural', 'methodology', 'assessment', 'inspection', 'survey'];
    const legalTerms = ['legal', 'regulation', 'statute'];
    const complianceTerms = ['compliance', 'standard', 'requirement'];
    const speciesTerms = ['species', 'tree', 'canopy', 'root'];
    const measurementTerms = ['dbh', 'height', 'diameter', 'measurement'];
    
    if (technicalTerms.some(t => term.includes(t))) return 'technical';
    if (legalTerms.some(t => term.includes(t))) return 'legal';
    if (complianceTerms.some(t => term.includes(t))) return 'compliance';
    if (speciesTerms.some(t => term.includes(t))) return 'species';
    if (measurementTerms.some(t => term.includes(t))) return 'measurement';
    
    return 'general';
  }
}
/**
 * Compliance Detector Module
 * 
 * Detects compliance markers and standards references in report text.
 */

import type { DecompiledReport, ComplianceMarker } from '../DecompiledReport';

export interface ComplianceDetectionResult {
  count: number;
  confidence: number;
  complianceMarkers: ComplianceMarker[];
}

export class ComplianceDetector {
  private compliancePatterns = [
    { pattern: /BS\s*5837[:]?\s*2012/i, standard: 'BS5837:2012', type: 'standard' as const },
    { pattern: /Arboricultural\s+Association/i, standard: 'Arboricultural Association', type: 'guideline' as const },
    { pattern: /RPA\s*\(Registered\s+Practitioner\)/i, standard: 'RPA', type: 'requirement' as const },
    { pattern: /ISO\s*14001/i, standard: 'ISO14001', type: 'standard' as const },
    { pattern: /Tree\s+Preservation\s+Order/i, standard: 'TPO', type: 'regulation' as const },
    { pattern: /Conservation\s+Area/i, standard: 'Conservation Area', type: 'regulation' as const },
    { pattern: /British\s+Standards/i, standard: 'British Standards', type: 'standard' as const },
    { pattern: /Health\s+and\s+Safety/i, standard: 'Health and Safety', type: 'regulation' as const },
    { pattern: /Risk\s+Assessment/i, standard: 'Risk Assessment', type: 'requirement' as const },
    { pattern: /Method\s+Statement/i, standard: 'Method Statement', type: 'guideline' as const },
  ];
  
  /**
   * Detect compliance markers in the report text
   */
  async detect(report: DecompiledReport): Promise<ComplianceDetectionResult> {
    const complianceMarkers: ComplianceMarker[] = [];
    
    for (const { pattern, standard, type } of this.compliancePatterns) {
      const matches = report.normalizedText.match(pattern);
      
      if (matches && matches.length > 0) {
        // Find context
        const firstIndex = report.normalizedText.search(pattern);
        const contextStart = Math.max(0, firstIndex - 50);
        const contextEnd = Math.min(report.normalizedText.length, firstIndex + standard.length + 50);
        const context = report.normalizedText.substring(contextStart, contextEnd);
        
        complianceMarkers.push({
          type,
          text: matches[0],
          standard,
          confidence: 0.8,
        });
      }
    }
    
    return {
      count: complianceMarkers.length,
      confidence: complianceMarkers.length > 0 ? 0.7 : 0.3,
      complianceMarkers,
    };
  }
}
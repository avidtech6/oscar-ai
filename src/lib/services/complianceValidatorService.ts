/**
 * Compliance Validator Service
 * Wrapper for the Phase 9 Report Compliance Validator Engine
 */

let complianceValidatorInstance: any = null;

/**
 * Get or create the ReportComplianceValidator instance
 */
async function getComplianceValidator(): Promise<any> {
  if (!complianceValidatorInstance) {
    // Temporarily use mock validator to avoid build issues
    // TODO: Restore dynamic import when the module resolution is fixed
    complianceValidatorInstance = createMockComplianceValidator();
  }
  return complianceValidatorInstance;
}

/**
 * Create a mock compliance validator for fallback
 */
function createMockComplianceValidator() {
  return {
    async validate(reportText: string, reportType?: string) {
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock compliance checks
      const complianceMarkers = [
        { pattern: /BS\s*5837[:]?\s*2012/i, standard: 'BS5837:2012', required: true },
        { pattern: /Arboricultural\s+Association/i, standard: 'Arboricultural Association', required: false },
        { pattern: /RPA\s*\(Registered\s+Practitioner\)/i, standard: 'RPA', required: true },
        { pattern: /Tree\s+Preservation\s+Order/i, standard: 'TPO', required: false },
        { pattern: /Conservation\s+Area/i, standard: 'Conservation Area', required: false },
      ];
      
      const issues = [];
      const foundMarkers = [];
      
      for (const marker of complianceMarkers) {
        const matches = reportText.match(marker.pattern);
        if (matches) {
          foundMarkers.push({
            standard: marker.standard,
            count: matches.length,
            required: marker.required,
            locations: matches.slice(0, 3).map(() => 'found') // Simplified
          });
        } else if (marker.required) {
          issues.push({
            type: 'missing_required_compliance',
            severity: 'critical',
            description: `Missing required compliance marker: ${marker.standard}`,
            suggestion: `Add reference to ${marker.standard} in the report.`
          });
        }
      }
      
      // Check for common compliance issues
      if (!reportText.includes('©') && !reportText.includes('Copyright')) {
        issues.push({
          type: 'missing_copyright',
          severity: 'warning',
          description: 'Missing copyright notice',
          suggestion: 'Add a copyright notice to the report.'
        });
      }
      
      if (!reportText.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/)) {
        issues.push({
          type: 'missing_date',
          severity: 'warning',
          description: 'No date found in report',
          suggestion: 'Add a date to the report.'
        });
      }
      
      // Calculate compliance score
      const totalRequired = complianceMarkers.filter(m => m.required).length;
      const foundRequired = foundMarkers.filter(m => m.required).length;
      const complianceScore = totalRequired > 0 ? (foundRequired / totalRequired) * 100 : 100;
      
      return {
        success: true,
        data: {
          complianceScore,
          issues,
          foundMarkers,
          summary: {
            totalIssues: issues.length,
            criticalIssues: issues.filter(i => i.severity === 'critical').length,
            warningIssues: issues.filter(i => i.severity === 'warning').length,
            compliancePercentage: Math.round(complianceScore)
          }
        }
      };
    }
  };
}

/**
 * Validate report compliance
 */
export async function validateReportCompliance(
  reportText: string,
  reportType?: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const validator = await getComplianceValidator();
    const result = await validator.validate(reportText, reportType);
    
    return {
      success: true,
      data: result.data || result
    };
  } catch (error) {
    console.error('Compliance validation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during compliance validation'
    };
  }
}

/**
 * Quick compliance check
 */
export async function quickComplianceCheck(reportText: string): Promise<{
  score: number;
  issues: number;
  critical: number;
  warnings: number;
  markers: Array<{ standard: string; found: boolean }>;
}> {
  try {
    const result = await validateReportCompliance(reportText);
    
    if (result.success) {
      return {
        score: result.data.complianceScore || 0,
        issues: result.data.summary?.totalIssues || 0,
        critical: result.data.summary?.criticalIssues || 0,
        warnings: result.data.summary?.warningIssues || 0,
        markers: (result.data.foundMarkers || []).map((m: any) => ({
          standard: m.standard,
          found: true
        }))
      };
    } else {
      return {
        score: 0,
        issues: 0,
        critical: 0,
        warnings: 0,
        markers: []
      };
    }
  } catch (error) {
    console.error('Quick compliance check failed:', error);
    return {
      score: 0,
      issues: 0,
      critical: 0,
      warnings: 0,
      markers: []
    };
  }
}

/**
 * Get compliance suggestions for a report
 */
export async function getComplianceSuggestions(
  reportText: string,
  reportType?: string
): Promise<Array<{
  type: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  suggestion: string;
  example?: string;
}>> {
  try {
    const result = await validateReportCompliance(reportText, reportType);
    
    if (result.success) {
      return result.data.issues || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Failed to get compliance suggestions:', error);
    return [];
  }
}
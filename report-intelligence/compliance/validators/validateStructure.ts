/**
 * Phase 9: Report Compliance Validator
 * Structure Validator
 * 
 * Validates the structural integrity and organization of the report.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ReportTypeRegistry } from '../../registry/ReportTypeRegistry';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import type { StructuralIssue, ComplianceSeverity } from '../ComplianceResult';
import { generateStructuralIssueId } from '../ComplianceResult';

/**
 * Configuration for structure validation
 */
export interface StructureValidationConfig {
  validateSectionOrder: boolean;
  validateSectionHierarchy: boolean;
  validateSectionLength: boolean;
  validateParagraphStructure: boolean;
  validateListUsage: boolean;
  validateTableStructure: boolean;
  validateFigureReferences: boolean;
  minimumSectionLength: number;
  maximumSectionLength: number;
  requireSectionNumbers: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: StructureValidationConfig = {
  validateSectionOrder: true,
  validateSectionHierarchy: true,
  validateSectionLength: true,
  validateParagraphStructure: true,
  validateListUsage: true,
  validateTableStructure: true,
  validateFigureReferences: true,
  minimumSectionLength: 50, // characters
  maximumSectionLength: 5000, // characters
  requireSectionNumbers: true,
};

/**
 * Validate report structure
 */
export async function validateStructure(
  decompiledReport: DecompiledReport,
  schemaMappingResult: SchemaMappingResult,
  registry?: ReportTypeRegistry,
  config: Partial<StructureValidationConfig> = {}
): Promise<StructuralIssue[]> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const issues: StructuralIssue[] = [];
  
  try {
    // Get report type
    const reportTypeId = schemaMappingResult.reportTypeId || decompiledReport.detectedReportType;
    if (!reportTypeId) {
      console.warn('[validateStructure] Cannot validate structure: report type unknown');
      return issues;
    }
    
    // Get report type definition
    const reportType = registry?.getType(reportTypeId);
    
    // Validate sections
    const sectionIssues = validateSections(decompiledReport, reportType, mergedConfig);
    issues.push(...sectionIssues);
    
    // Validate section order
    if (mergedConfig.validateSectionOrder) {
      const orderIssues = validateSectionOrder(decompiledReport, reportType, mergedConfig);
      issues.push(...orderIssues);
    }
    
    // Validate section hierarchy
    if (mergedConfig.validateSectionHierarchy) {
      const hierarchyIssues = validateSectionHierarchy(decompiledReport, mergedConfig);
      issues.push(...hierarchyIssues);
    }
    
    // Validate section nesting
    const nestingIssues = validateSectionNesting(decompiledReport, mergedConfig);
    issues.push(...nestingIssues);
    
    // Validate section duplication
    const duplicationIssues = validateSectionDuplication(decompiledReport, mergedConfig);
    issues.push(...duplicationIssues);
    
    // Validate orphaned sections
    const orphanedIssues = validateOrphanedSections(decompiledReport, mergedConfig);
    issues.push(...orphanedIssues);
    
    return issues;
    
  } catch (error) {
    console.error('[validateStructure] Error validating structure:', error);
    throw error;
  }
}

/**
 * Validate sections
 */
function validateSections(
  decompiledReport: DecompiledReport,
  reportType: ReportTypeDefinition | undefined,
  config: StructureValidationConfig
): StructuralIssue[] {
  const issues: StructuralIssue[] = [];
  const sections = decompiledReport.sections || [];
  
  // Check for empty sections (orphaned issue type)
  for (const section of sections) {
    if (!section.content || section.content.trim().length === 0) {
      issues.push({
        issueId: generateStructuralIssueId(),
        issueType: 'orphaned',
        location: `Section: ${section.title}`,
        description: `Section "${section.title}" is empty`,
        severity: 'medium',
        expectedStructure: 'Section should contain relevant content',
        actualStructure: 'Section contains no content',
        remediationGuidance: 'Add relevant content to this section or consider removing it if not needed',
      });
    }
    
    // Check for very short sections (hierarchy issue type)
    if (config.validateSectionLength && section.content && section.content.trim().length < config.minimumSectionLength) {
      issues.push({
        issueId: generateStructuralIssueId(),
        issueType: 'hierarchy',
        location: `Section: ${section.title}`,
        description: `Section "${section.title}" is very short (${section.content.trim().length} characters)`,
        severity: 'low',
        expectedStructure: `Section should be at least ${config.minimumSectionLength} characters`,
        actualStructure: `Section length: ${section.content.trim().length} characters`,
        remediationGuidance: 'Expand this section with more detailed content',
      });
    }
    
    // Check for very long sections (hierarchy issue type)
    if (config.validateSectionLength && section.content && section.content.trim().length > config.maximumSectionLength) {
      issues.push({
        issueId: generateStructuralIssueId(),
        issueType: 'hierarchy',
        location: `Section: ${section.title}`,
        description: `Section "${section.title}" is very long (${section.content.trim().length} characters)`,
        severity: 'low',
        expectedStructure: `Section should not exceed ${config.maximumSectionLength} characters`,
        actualStructure: `Section length: ${section.content.trim().length} characters`,
        remediationGuidance: 'Consider splitting this section into multiple subsections',
      });
    }
    
    // Check for section numbers if required (ordering issue type)
    if (config.requireSectionNumbers && section.title) {
      const hasNumber = /^\d+[\.\d]*\s+/.test(section.title);
      if (!hasNumber) {
        issues.push({
          issueId: generateStructuralIssueId(),
          issueType: 'ordering',
          location: `Section: ${section.title}`,
          description: `Section "${section.title}" lacks a section number`,
          severity: 'low',
          expectedStructure: 'Section title should start with a number (e.g., "1. Introduction")',
          actualStructure: 'Section title does not start with a number',
          remediationGuidance: 'Add a section number (e.g., "1. Introduction", "2. Methodology")',
        });
      }
    }
  }
  
  return issues;
}

/**
 * Validate section order
 */
function validateSectionOrder(
  decompiledReport: DecompiledReport,
  reportType: ReportTypeDefinition | undefined,
  config: StructureValidationConfig
): StructuralIssue[] {
  const issues: StructuralIssue[] = [];
  const sections = decompiledReport.sections || [];
  
  if (sections.length < 2) {
    return issues; // Not enough sections to validate order
  }
  
  // Common expected section order for different report types
  const expectedOrders: Record<string, string[]> = {
    'bs5837': ['introduction', 'methodology', 'site description', 'tree schedule', 'assessment', 'recommendations', 'conclusion'],
    'condition': ['introduction', 'methodology', 'site assessment', 'tree assessment', 'condition analysis', 'recommendations'],
    'safety': ['introduction', 'risk assessment', 'hazard identification', 'control measures', 'emergency procedures', 'conclusion'],
    'method': ['introduction', 'scope', 'methodology', 'equipment', 'procedures', 'safety', 'conclusion'],
  };
  
  // Determine report type
  const reportTypeId = decompiledReport.detectedReportType?.toLowerCase() || '';
  let expectedOrder: string[] = [];
  
  for (const [key, order] of Object.entries(expectedOrders)) {
    if (reportTypeId.includes(key)) {
      expectedOrder = order;
      break;
    }
  }
  
  if (expectedOrder.length === 0) {
    return issues; // No expected order for this report type
  }
  
  // Check if sections follow expected order
  const sectionTitles = sections.map(s => s.title.toLowerCase());
  
  for (let i = 0; i < expectedOrder.length - 1; i++) {
    const currentSection = expectedOrder[i];
    const nextSection = expectedOrder[i + 1];
    
    const currentIndex = sectionTitles.findIndex(title => title.includes(currentSection));
    const nextIndex = sectionTitles.findIndex(title => title.includes(nextSection));
    
    if (currentIndex !== -1 && nextIndex !== -1 && currentIndex > nextIndex) {
      issues.push({
        issueId: generateStructuralIssueId(),
        issueType: 'ordering',
        location: `Section: ${sections[nextIndex].title}`,
        description: `Section "${sections[nextIndex].title}" appears before "${sections[currentIndex].title}"`,
        severity: 'medium',
        expectedStructure: `Expected order: ${currentSection} before ${nextSection}`,
        actualStructure: `Found: ${nextSection} before ${currentSection}`,
        remediationGuidance: `Reorder sections so that "${sections[currentIndex].title}" comes before "${sections[nextIndex].title}"`,
      });
    }
  }
  
  return issues;
}

/**
 * Validate section hierarchy
 */
function validateSectionHierarchy(
  decompiledReport: DecompiledReport,
  config: StructureValidationConfig
): StructuralIssue[] {
  const issues: StructuralIssue[] = [];
  const sections = decompiledReport.sections || [];
  
  // Check for proper hierarchy (main sections should come before subsections)
  for (let i = 0; i < sections.length; i++) {
    const currentSection = sections[i];
    const nextSection = sections[i + 1];
    
    if (!nextSection) continue;
    
    // Check for sudden jumps in hierarchy
    const currentLevel = getSectionLevel(currentSection.title);
    const nextLevel = getSectionLevel(nextSection.title);
    
    if (nextLevel > currentLevel + 1) {
      issues.push({
        issueId: generateStructuralIssueId(),
        issueType: 'hierarchy',
        location: `Section: ${nextSection.title}`,
        description: `Section "${nextSection.title}" jumps too many levels in hierarchy`,
        severity: 'low',
        expectedStructure: `Hierarchy should increase by at most 1 level (from ${currentLevel} to ${currentLevel + 1})`,
        actualStructure: `Jump from level ${currentLevel} to level ${nextLevel}`,
        remediationGuidance: 'Add intermediate sections or adjust numbering to maintain proper hierarchy',
      });
    }
    
    // Check for decreasing hierarchy without proper structure
    if (nextLevel < currentLevel && nextLevel > 0) {
      // This is okay - can go back to higher level
    }
  }
  
  return issues;
}

/**
 * Validate section nesting
 */
function validateSectionNesting(
  decompiledReport: DecompiledReport,
  config: StructureValidationConfig
): StructuralIssue[] {
  const issues: StructuralIssue[] = [];
  const sections = decompiledReport.sections || [];
  
  // Check for proper nesting (subsections should follow their parent sections)
  const sectionLevels = sections.map(s => getSectionLevel(s.title));
  
  for (let i = 0; i < sections.length; i++) {
    const currentLevel = sectionLevels[i];
    
    // Check if this is a subsection (level > 1)
    if (currentLevel > 1) {
      // Find the nearest parent section
      let parentFound = false;
      for (let j = i - 1; j >= 0; j--) {
        if (sectionLevels[j] === currentLevel - 1) {
          parentFound = true;
          break;
        }
      }
      
      if (!parentFound) {
        issues.push({
          issueId: generateStructuralIssueId(),
          issueType: 'nesting',
          location: `Section: ${sections[i].title}`,
          description: `Subsection "${sections[i].title}" appears without a parent section`,
          severity: 'medium',
          expectedStructure: 'Subsections should follow their parent sections',
          actualStructure: 'Subsection appears without a preceding parent section',
          remediationGuidance: 'Add a parent section or reorder sections to maintain proper nesting',
        });
      }
    }
  }
  
  return issues;
}

/**
 * Validate section duplication
 */
function validateSectionDuplication(
  decompiledReport: DecompiledReport,
  config: StructureValidationConfig
): StructuralIssue[] {
  const issues: StructuralIssue[] = [];
  const sections = decompiledReport.sections || [];
  
  // Check for duplicate section titles
  const titleCounts: Record<string, number> = {};
  const normalizedTitles: Record<string, string> = {};
  
  for (const section of sections) {
    const normalizedTitle = section.title.toLowerCase().trim();
    normalizedTitles[section.id] = normalizedTitle;
    
    if (!titleCounts[normalizedTitle]) {
      titleCounts[normalizedTitle] = 0;
    }
    titleCounts[normalizedTitle]++;
  }
  
  // Report duplicates
  for (const [title, count] of Object.entries(titleCounts)) {
    if (count > 1) {
      // Find all sections with this title
      const duplicateSections = sections.filter(s => 
        normalizedTitles[s.id] === title
      );
      
      issues.push({
        issueId: generateStructuralIssueId(),
        issueType: 'duplication',
        location: `Sections: ${duplicateSections.map(s => s.title).join(', ')}`,
        description: `Found ${count} sections with similar title: "${title}"`,
        severity: 'medium',
        expectedStructure: 'Each section should have a unique title',
        actualStructure: `Found ${count} sections with title "${title}"`,
        remediationGuidance: 'Rename duplicate sections or merge them if they contain similar content',
      });
    }
  }
  
  return issues;
}

/**
 * Validate orphaned sections
 */
function validateOrphanedSections(
  decompiledReport: DecompiledReport,
  config: StructureValidationConfig
): StructuralIssue[] {
  const issues: StructuralIssue[] = [];
  const sections = decompiledReport.sections || [];
  
  // Check for sections with minimal content (already handled in validateSections)
  // Additional checks for orphaned subsections
  
  const sectionLevels = sections.map(s => getSectionLevel(s.title));
  
  for (let i = 0; i < sections.length; i++) {
    const currentLevel = sectionLevels[i];
    
    // Check if this is a lone subsection (no siblings)
    if (currentLevel > 1) {
      let hasSiblings = false;
      let hasParent = false;
      
      // Check for parent
      for (let j = i - 1; j >= 0; j--) {
        if (sectionLevels[j] === currentLevel - 1) {
          hasParent = true;
          break;
        }
      }
      
      // Check for siblings (same level before or after)
      for (let j = 0; j < sections.length; j++) {
        if (j !== i && sectionLevels[j] === currentLevel) {
          // Check if they share the same parent
          let parentIndex = -1;
          for (let k = j - 1; k >= 0; k--) {
            if (sectionLevels[k] === currentLevel - 1) {
              parentIndex = k;
              break;
            }
          }
          
          if (parentIndex >= 0) {
            // Check if this section has the same parent
            let myParentIndex = -1;
            for (let k = i - 1; k >= 0; k--) {
              if (sectionLevels[k] === currentLevel - 1) {
                myParentIndex = k;
                break;
              }
            }
            
            if (myParentIndex === parentIndex) {
              hasSiblings = true;
              break;
            }
          }
        }
      }
      
      if (hasParent && !hasSiblings) {
        issues.push({
          issueId: generateStructuralIssueId(),
          issueType: 'orphaned',
          location: `Section: ${sections[i].title}`,
          description: `Subsection "${sections[i].title}" is a lone subsection without siblings`,
          severity: 'low',
          expectedStructure: 'Subsections should typically appear in groups under a parent section',
          actualStructure: 'Single subsection under a parent section',
          remediationGuidance: 'Consider adding more subsections or merging with parent section',
        });
      }
    }
  }
  
  return issues;
}

/**
 * Helper: Get section level from title
 * Level 1: "1. Introduction", "Introduction"
 * Level 2: "1.1. Methodology", "1.1 Methodology"
 * Level 3: "1.1.1. Details", "1.1.1 Details"
 */
function getSectionLevel(title: string): number {
  if (!title) return 1;
  
  // Check for numbered sections
  const numberMatch = title.match(/^(\d+(?:\.\d+)*)/);
  if (numberMatch) {
    const numbers = numberMatch[1].split('.');
    return numbers.length;
  }
  
  // Check for indentation or other hierarchy indicators
  if (title.startsWith('  ') || title.startsWith('\t')) {
    return 2; // Assume indented sections are level 2
  }
  
  // Default to level 1
  return 1;
}

/**
 * Helper: Check if section is a subsection
 */
function isSubsection(title: string): boolean {
  return getSectionLevel(title) > 1;
}

/**
 * Report Schema Mapper - Phase 3
 * Detect Missing Sections Helper
 * 
 * Helper functions for detecting missing required sections according to report type definition.
 */

import type { DetectedSection } from '../../decompiler/DecompiledReport';
import type { ReportSectionDefinition } from '../../registry/ReportTypeDefinition';
import type { MissingRequiredSection } from '../SchemaMappingResult';
import { calculateSectionMatchConfidence } from './mapSectionsToSchema';

/**
 * Detect missing required sections in a decompiled report
 */
export function detectMissingRequiredSections(
  sections: DetectedSection[],
  requiredSections: ReportSectionDefinition[]
): MissingRequiredSection[] {
  const missingSections: MissingRequiredSection[] = [];
  
  for (const requiredSection of requiredSections) {
    const found = sections.some(section =>
      calculateSectionMatchConfidence(section, requiredSection) >= 0.5
    );
    
    if (!found) {
      missingSections.push({
        sectionId: requiredSection.id,
        sectionName: requiredSection.name,
        description: requiredSection.description,
        required: true,
        reason: 'not_present',
        suggestedContent: requiredSection.template,
        aiGuidance: requiredSection.aiGuidance,
      });
    }
  }
  
  return missingSections;
}

/**
 * Check if a section is present (with confidence threshold)
 */
export function isSectionPresent(
  sections: DetectedSection[],
  sectionDef: ReportSectionDefinition,
  confidenceThreshold: number = 0.5
): boolean {
  return sections.some(section =>
    calculateSectionMatchConfidence(section, sectionDef) >= confidenceThreshold
  );
}

/**
 * Find the closest matching section for a required section definition
 */
export function findClosestMatchingSection(
  sections: DetectedSection[],
  sectionDef: ReportSectionDefinition
): { section: DetectedSection; confidence: number } | null {
  let bestMatch: { section: DetectedSection; confidence: number } | null = null;
  
  for (const section of sections) {
    const confidence = calculateSectionMatchConfidence(section, sectionDef);
    
    if (confidence > 0 && (!bestMatch || confidence > bestMatch.confidence)) {
      bestMatch = { section, confidence };
    }
  }
  
  return bestMatch;
}

/**
 * Generate suggested content for a missing section
 */
export function generateSuggestedContent(
  sectionDef: ReportSectionDefinition,
  context: {
    reportTitle?: string;
    clientName?: string;
    siteAddress?: string;
    date?: string;
  }
): string {
  const { reportTitle, clientName, siteAddress, date } = context;
  
  // Basic template with placeholders
  let content = sectionDef.template || `# ${sectionDef.name}\n\n`;
  
  // Replace placeholders with context
  if (reportTitle) {
    content = content.replace(/\{report_title\}/g, reportTitle);
  }
  
  if (clientName) {
    content = content.replace(/\{client_name\}/g, clientName);
  }
  
  if (siteAddress) {
    content = content.replace(/\{site_address\}/g, siteAddress);
  }
  
  if (date) {
    content = content.replace(/\{date\}/g, date);
  }
  
  // Add AI guidance if available
  if (sectionDef.aiGuidance) {
    content += `\n\n**AI Guidance:** ${sectionDef.aiGuidance}`;
  }
  
  return content;
}

/**
 * Validate if a section meets its validation rules
 */
export function validateSectionContent(
  section: DetectedSection,
  sectionDef: ReportSectionDefinition
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!sectionDef.validationRules) {
    return { valid: true, errors };
  }
  
  for (const rule of sectionDef.validationRules) {
    switch (rule.rule) {
      case 'required':
        if (!section.content || section.content.trim().length === 0) {
          errors.push(rule.message);
        }
        break;
        
      case 'minLength':
        if (section.content.length < (rule.value || 0)) {
          errors.push(rule.message);
        }
        break;
        
      case 'maxLength':
        if (section.content.length > (rule.value || Infinity)) {
          errors.push(rule.message);
        }
        break;
        
      case 'pattern':
        if (rule.value && !new RegExp(rule.value).test(section.content)) {
          errors.push(rule.message);
        }
        break;
        
      // Custom validation would need to be implemented separately
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
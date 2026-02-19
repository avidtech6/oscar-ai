/**
 * Report Schema Mapper - Phase 3
 * Detect Extra Sections Helper
 * 
 * Helper functions for detecting extra sections not defined in report type definition.
 */

import type { DetectedSection } from '../../decompiler/DecompiledReport';
import type { ReportSectionDefinition } from '../../registry/ReportTypeDefinition';
import type { ExtraSection } from '../SchemaMappingResult';
import { calculateSectionMatchConfidence } from './mapSectionsToSchema';

/**
 * Detect extra sections not defined in report type definition
 */
export function detectExtraSections(
  sections: DetectedSection[],
  sectionDefs: ReportSectionDefinition[]
): ExtraSection[] {
  const extraSections: ExtraSection[] = [];
  
  for (const section of sections) {
    const isDefined = sectionDefs.some(sectionDef =>
      calculateSectionMatchConfidence(section, sectionDef) >= 0.5
    );
    
    if (!isDefined) {
      extraSections.push({
        sectionId: section.id,
        sectionTitle: section.title,
        sectionType: section.type,
        contentPreview: section.content.substring(0, 100) + (section.content.length > 100 ? '...' : ''),
        potentialPurpose: inferSectionPurpose(section),
        suggestedAction: determineSuggestedAction(section),
        confidence: calculateExtraSectionConfidence(section),
      });
    }
  }
  
  return extraSections;
}

/**
 * Infer the purpose of a section based on its content
 */
export function inferSectionPurpose(section: DetectedSection): string {
  const content = section.content.toLowerCase();
  const title = section.title.toLowerCase();
  
  if (title.includes('methodology') || content.includes('method') || content.includes('procedure')) {
    return 'Describes the methodology or procedures used';
  }
  
  if (title.includes('result') || content.includes('finding') || content.includes('observation')) {
    return 'Presents results, findings, or observations';
  }
  
  if (title.includes('conclusion') || content.includes('summary') || content.includes('recommendation')) {
    return 'Provides conclusions, summaries, or recommendations';
  }
  
  if (title.includes('introduction') || content.includes('background') || content.includes('purpose')) {
    return 'Introduces the report or provides background';
  }
  
  if (title.includes('appendix') || title.includes('annex') || title.includes('attachment')) {
    return 'Supplementary material or appendices';
  }
  
  if (title.includes('reference') || content.includes('bibliography') || content.includes('citation')) {
    return 'References or bibliography';
  }
  
  if (section.type === 'table') {
    return 'Tabular data presentation';
  }
  
  if (section.type === 'list') {
    return 'List of items or bullet points';
  }
  
  if (title.includes('legal') || content.includes('legal') || content.includes('compliance')) {
    return 'Legal or compliance information';
  }
  
  if (title.includes('risk') || content.includes('risk') || content.includes('hazard')) {
    return 'Risk assessment or hazard identification';
  }
  
  return 'General content section';
}

/**
 * Determine suggested action for an extra section
 */
export function determineSuggestedAction(section: DetectedSection): ExtraSection['suggestedAction'] {
  const content = section.content.toLowerCase();
  const title = section.title.toLowerCase();
  
  // If section looks important (contains key terms), suggest adding to schema
  const importantTerms = ['conclusion', 'recommendation', 'finding', 'risk', 'hazard', 'compliance', 'legal'];
  const isImportant = importantTerms.some(term => 
    title.includes(term) || content.includes(term)
  );
  
  if (isImportant) {
    return 'add_to_schema';
  }
  
  // If section is very short or seems like noise, suggest ignoring
  if (section.content.length < 50 || 
      title.includes('page') || 
      title.includes('footer') || 
      title.includes('header')) {
    return 'ignore';
  }
  
  // If section could potentially map to an existing section, suggest mapping
  const mappableTerms = ['summary', 'overview', 'background', 'context'];
  const isMappable = mappableTerms.some(term => 
    title.includes(term) || content.includes(term)
  );
  
  if (isMappable) {
    return 'map_to_existing';
  }
  
  // Default to flag for review
  return 'flag_for_review';
}

/**
 * Calculate confidence score for an extra section detection
 */
export function calculateExtraSectionConfidence(section: DetectedSection): number {
  let confidence = 0.5; // Base confidence
  
  // Increase confidence for clearly defined sections
  if (section.type !== 'unknown') {
    confidence += 0.2;
  }
  
  // Increase confidence for longer sections (more likely to be meaningful)
  if (section.content.length > 200) {
    confidence += 0.1;
  }
  
  // Increase confidence for sections with clear titles
  if (section.title.length > 5 && section.title.length < 100) {
    confidence += 0.1;
  }
  
  // Decrease confidence for very short sections
  if (section.content.length < 30) {
    confidence -= 0.2;
  }
  
  // Cap between 0.1 and 1.0
  return Math.max(0.1, Math.min(confidence, 1.0));
}

/**
 * Check if a section is likely a duplicate of another section
 */
export function isLikelyDuplicate(
  section: DetectedSection,
  otherSections: DetectedSection[]
): boolean {
  for (const otherSection of otherSections) {
    if (section.id === otherSection.id) continue;
    
    // Check title similarity
    const titleSimilarity = calculateStringSimilarity(section.title, otherSection.title);
    
    // Check content similarity (first 200 chars)
    const content1 = section.content.substring(0, 200);
    const content2 = otherSection.content.substring(0, 200);
    const contentSimilarity = calculateStringSimilarity(content1, content2);
    
    if (titleSimilarity > 0.8 || contentSimilarity > 0.7) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculate string similarity using simple Jaccard index
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  
  if (words1.size === 0 || words2.size === 0) {
    return 0;
  }
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}
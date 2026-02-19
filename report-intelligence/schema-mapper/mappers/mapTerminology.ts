/**
 * Report Schema Mapper - Phase 3
 * Map Terminology Helper
 * 
 * Helper functions for mapping terminology from decompiled reports.
 */

import type { TerminologyEntry } from '../../decompiler/DecompiledReport';
import type { UnknownTerminology } from '../SchemaMappingResult';

/**
 * Map terminology entries to unknown terminology for schema gaps
 */
export function mapTerminologyToUnknown(
  terminologyEntries: TerminologyEntry[]
): UnknownTerminology[] {
  return terminologyEntries.map(termEntry => ({
    term: termEntry.term,
    context: termEntry.context,
    frequency: termEntry.frequency,
    category: termEntry.category,
    suggestedDefinition: undefined,
    suggestedCategory: termEntry.category,
    confidence: termEntry.confidence,
  }));
}

/**
 * Check if a term is known in the system
 * (In a real implementation, this would check against a terminology database)
 */
export function isTermKnown(term: string): boolean {
  // Simplified implementation - in reality, this would check a database
  const knownTerms = [
    'arboricultural', 'bs5837', 'rpa', 'dbh', 'canopy', 'root', 'protection',
    'mitigation', 'assessment', 'methodology', 'compliance', 'category',
    'species', 'condition', 'hazard', 'risk', 'inspection', 'survey',
    'standard', 'regulation', 'requirement', 'guideline', 'best_practice'
  ];
  
  return knownTerms.some(knownTerm => 
    term.toLowerCase().includes(knownTerm.toLowerCase()) ||
    knownTerm.toLowerCase().includes(term.toLowerCase())
  );
}

/**
 * Categorize a term based on its content
 */
export function categorizeTerm(term: string): UnknownTerminology['category'] {
  const technicalTerms = ['arboricultural', 'methodology', 'assessment', 'inspection', 'survey', 'dbh', 'canopy'];
  const legalTerms = ['legal', 'regulation', 'statute', 'compliance', 'standard'];
  const speciesTerms = ['species', 'tree', 'root', 'foliage', 'bark'];
  const measurementTerms = ['measurement', 'diameter', 'height', 'width', 'depth'];
  
  if (technicalTerms.some(t => term.toLowerCase().includes(t))) return 'technical';
  if (legalTerms.some(t => term.toLowerCase().includes(t))) return 'legal';
  if (speciesTerms.some(t => term.toLowerCase().includes(t))) return 'species';
  if (measurementTerms.some(t => term.toLowerCase().includes(t))) return 'measurement';
  
  return 'general';
}

/**
 * Suggest a definition for an unknown term based on context
 */
export function suggestTermDefinition(term: string, context: string): string | undefined {
  // Simplified implementation - in reality, this would use AI or a dictionary
  const termLower = term.toLowerCase();
  
  if (termLower.includes('arboricultural')) {
    return 'Relating to the cultivation, management, and study of trees and shrubs';
  }
  
  if (termLower.includes('bs5837')) {
    return 'British Standard for trees in relation to design, demolition, and construction';
  }
  
  if (termLower.includes('rpa')) {
    return 'Registered Practitioner in Arboriculture';
  }
  
  if (termLower.includes('dbh')) {
    return 'Diameter at Breast Height - standard measurement for tree diameter';
  }
  
  if (termLower.includes('canopy')) {
    return 'The upper layer of a tree formed by branches and leaves';
  }
  
  // Try to infer from context
  if (context.includes('measure') || context.includes('diameter') || context.includes('height')) {
    return 'A measurement or dimension related to tree assessment';
  }
  
  if (context.includes('legal') || context.includes('regulation') || context.includes('compliance')) {
    return 'A legal or regulatory term related to arboriculture';
  }
  
  return undefined;
}

/**
 * Filter terminology to only unknown terms
 */
export function filterUnknownTerminology(
  terminologyEntries: TerminologyEntry[]
): UnknownTerminology[] {
  return terminologyEntries
    .filter(termEntry => !isTermKnown(termEntry.term))
    .map(termEntry => ({
      term: termEntry.term,
      context: termEntry.context,
      frequency: termEntry.frequency,
      category: termEntry.category,
      suggestedDefinition: suggestTermDefinition(termEntry.term, termEntry.context),
      suggestedCategory: categorizeTerm(termEntry.term),
      confidence: termEntry.confidence,
    }));
}
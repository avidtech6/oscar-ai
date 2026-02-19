/**
 * Report Validation Engine - Phase 4
 * Terminology Validator Module
 * 
 * Validates terminology usage, standard terminology compliance, and glossary adherence.
 */

import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ValidationRule } from '../ValidationResult';

/**
 * Terminology validation result
 */
export interface TerminologyValidationResult {
  passed: boolean;
  issues: Array<{
    type: 'unknown_term' | 'non_standard_term' | 'inconsistent_term' | 'ambiguous_term' | 'jargon';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    term: string;
    context?: string;
    suggestedTerm?: string;
    category?: string;
  }>;
  terminologyScore: number; // 0-100
  unknownTermsCount: number;
  nonStandardTermsCount: number;
  inconsistentTermsCount: number;
}

/**
 * Terminology validator class
 */
export class TerminologyValidator {
  private standardGlossary: Record<string, {
    definition: string;
    category: string;
    alternatives: string[];
    preferred: boolean;
  }> = {
    'assessment': {
      definition: 'Systematic evaluation of a subject or situation',
      category: 'general',
      alternatives: ['evaluation', 'analysis', 'review'],
      preferred: true,
    },
    'recommendation': {
      definition: 'Formal suggestion for action or improvement',
      category: 'general',
      alternatives: ['suggestion', 'proposal', 'advice'],
      preferred: true,
    },
    'compliance': {
      definition: 'Adherence to rules, regulations, or standards',
      category: 'regulatory',
      alternatives: ['conformance', 'adherence', 'observance'],
      preferred: true,
    },
    'risk': {
      definition: 'Potential for harm, loss, or negative outcome',
      category: 'safety',
      alternatives: ['hazard', 'danger', 'threat'],
      preferred: true,
    },
    'mitigation': {
      definition: 'Action taken to reduce severity or likelihood of risk',
      category: 'safety',
      alternatives: ['reduction', 'alleviation', 'minimization'],
      preferred: true,
    },
  };

  private jargonTerms = [
    'leverage', 'synergy', 'paradigm', 'bandwidth', 'circle back',
    'touch base', 'low-hanging fruit', 'move the needle', 'drill down',
  ];

  private ambiguousTerms = [
    'thing', 'stuff', 'something', 'various', 'several', 'some',
    'appropriate', 'suitable', 'adequate', 'reasonable',
  ];

  /**
   * Validate terminology for a schema mapping result
   */
  validate(
    schemaMappingResult: SchemaMappingResult,
    rule: ValidationRule
  ): TerminologyValidationResult {
    const result: TerminologyValidationResult = {
      passed: true,
      issues: [],
      terminologyScore: 100, // Start with perfect score
      unknownTermsCount: 0,
      nonStandardTermsCount: 0,
      inconsistentTermsCount: 0,
    };

    // Check unknown terminology from schema mapping result
    const unknownTermIssues = this.checkUnknownTerminology(schemaMappingResult);
    if (unknownTermIssues.length > 0) {
      result.passed = false;
      result.issues.push(...unknownTermIssues);
      result.unknownTermsCount = unknownTermIssues.length;
      result.terminologyScore -= unknownTermIssues.length * 8;
    }

    // Check non-standard terminology
    const nonStandardIssues = this.checkNonStandardTerminology(schemaMappingResult);
    if (nonStandardIssues.length > 0) {
      result.passed = false;
      result.issues.push(...nonStandardIssues);
      result.nonStandardTermsCount = nonStandardIssues.length;
      result.terminologyScore -= nonStandardIssues.length * 6;
    }

    // Check inconsistent terminology usage
    const inconsistentIssues = this.checkInconsistentTerminology(schemaMappingResult);
    if (inconsistentIssues.length > 0) {
      result.passed = false;
      result.issues.push(...inconsistentIssues);
      result.inconsistentTermsCount = inconsistentIssues.length;
      result.terminologyScore -= inconsistentIssues.length * 5;
    }

    // Check for jargon
    const jargonIssues = this.checkJargonUsage(schemaMappingResult);
    if (jargonIssues.length > 0) {
      result.passed = false;
      result.issues.push(...jargonIssues);
      result.terminologyScore -= jargonIssues.length * 4;
    }

    // Check for ambiguous terms
    const ambiguousIssues = this.checkAmbiguousTerminology(schemaMappingResult);
    if (ambiguousIssues.length > 0) {
      result.passed = false;
      result.issues.push(...ambiguousIssues);
      result.terminologyScore -= ambiguousIssues.length * 3;
    }

    // Ensure score doesn't go below 0
    result.terminologyScore = Math.max(0, result.terminologyScore);

    return result;
  }

  /**
   * Check unknown terminology
   */
  private checkUnknownTerminology(schemaMappingResult: SchemaMappingResult): Array<{
    type: 'unknown_term';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    term: string;
    context?: string;
    suggestedTerm?: string;
    category?: string;
  }> {
    const issues: Array<{
      type: 'unknown_term';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      term: string;
      context?: string;
      suggestedTerm?: string;
      category?: string;
    }> = [];

    // Check unknown terminology from schema mapping result
    for (const unknownTerm of schemaMappingResult.unknownTerminology) {
      issues.push({
        type: 'unknown_term',
        description: `Unknown terminology: "${unknownTerm.term}"`,
        severity: this.getSeverityForCategory(unknownTerm.category),
        term: unknownTerm.term,
        context: unknownTerm.context,
        suggestedTerm: unknownTerm.suggestedDefinition,
        category: unknownTerm.category,
      });
    }

    return issues;
  }

  /**
   * Check non-standard terminology
   */
  private checkNonStandardTerminology(schemaMappingResult: SchemaMappingResult): Array<{
    type: 'non_standard_term';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    term: string;
    context?: string;
    suggestedTerm?: string;
    category?: string;
  }> {
    const issues: Array<{
      type: 'non_standard_term';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      term: string;
      context?: string;
      suggestedTerm?: string;
      category?: string;
    }> = [];

    // Extract terms from mapped fields
    const extractedTerms = this.extractTermsFromReport(schemaMappingResult);
    
    for (const { term, context, fieldName } of extractedTerms) {
      // Check if term is in standard glossary
      const glossaryEntry = this.standardGlossary[term.toLowerCase()];
      
      if (!glossaryEntry) {
        // Check if it's a variation of a standard term
        const standardTerm = this.findStandardTermVariant(term);
        if (standardTerm) {
          issues.push({
            type: 'non_standard_term',
            description: `Non-standard term variation: "${term}"`,
            severity: 'low',
            term,
            context: `Used in section: ${fieldName}`,
            suggestedTerm: standardTerm,
            category: 'terminology',
          });
        }
      }
    }

    return issues;
  }

  /**
   * Check inconsistent terminology usage
   */
  private checkInconsistentTerminology(schemaMappingResult: SchemaMappingResult): Array<{
    type: 'inconsistent_term';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    term: string;
    context?: string;
    suggestedTerm?: string;
    category?: string;
  }> {
    const issues: Array<{
      type: 'inconsistent_term';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      term: string;
      context?: string;
      suggestedTerm?: string;
      category?: string;
    }> = [];

    // Track term usage across the report
    const termUsage: Record<string, {
      count: number;
      locations: string[];
      variations: Set<string>;
    }> = {};

    // Extract and analyze terms
    const extractedTerms = this.extractTermsFromReport(schemaMappingResult);
    
    for (const { term, fieldName } of extractedTerms) {
      const lowerTerm = term.toLowerCase();
      
      // Find base term (check if it's a variant of a standard term)
      const baseTerm = this.findBaseTerm(lowerTerm);
      const termKey = baseTerm || lowerTerm;
      
      if (!termUsage[termKey]) {
        termUsage[termKey] = {
          count: 0,
          locations: [],
          variations: new Set(),
        };
      }
      
      termUsage[termKey].count++;
      termUsage[termKey].locations.push(fieldName);
      termUsage[termKey].variations.add(lowerTerm);
    }

    // Check for inconsistent usage (multiple variations of same term)
    for (const [termKey, usage] of Object.entries(termUsage)) {
      if (usage.variations.size > 1) {
        const variations = Array.from(usage.variations);
        issues.push({
          type: 'inconsistent_term',
          description: `Inconsistent terminology: ${variations.join(', ')}`,
          severity: 'medium',
          term: termKey,
          context: `Used in sections: ${usage.locations.join(', ')}`,
          suggestedTerm: variations[0], // Suggest first variation as preferred
          category: 'terminology',
        });
      }
    }

    return issues;
  }

  /**
   * Check for jargon usage
   */
  private checkJargonUsage(schemaMappingResult: SchemaMappingResult): Array<{
    type: 'jargon';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    term: string;
    context?: string;
    suggestedTerm?: string;
    category?: string;
  }> {
    const issues: Array<{
      type: 'jargon';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      term: string;
      context?: string;
      suggestedTerm?: string;
      category?: string;
    }> = [];

    // Extract terms from report
    const extractedTerms = this.extractTermsFromReport(schemaMappingResult);
    
    for (const { term, fieldName } of extractedTerms) {
      const lowerTerm = term.toLowerCase();
      
      // Check if term is jargon
      if (this.jargonTerms.some(jargon => lowerTerm.includes(jargon.toLowerCase()))) {
        issues.push({
          type: 'jargon',
          description: `Jargon term: "${term}"`,
          severity: 'low',
          term,
          context: `Used in section: ${fieldName}`,
          suggestedTerm: this.getPlainLanguageAlternative(term),
          category: 'clarity',
        });
      }
    }

    return issues;
  }

  /**
   * Check for ambiguous terminology
   */
  private checkAmbiguousTerminology(schemaMappingResult: SchemaMappingResult): Array<{
    type: 'ambiguous_term';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    term: string;
    context?: string;
    suggestedTerm?: string;
    category?: string;
  }> {
    const issues: Array<{
      type: 'ambiguous_term';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      term: string;
      context?: string;
      suggestedTerm?: string;
    }> = [];

    // Extract terms from report
    const extractedTerms = this.extractTermsFromReport(schemaMappingResult);
    
    for (const { term, fieldName } of extractedTerms) {
      const lowerTerm = term.toLowerCase();
      
      // Check if term is ambiguous
      if (this.ambiguousTerms.some(ambiguous => lowerTerm.includes(ambiguous.toLowerCase()))) {
        issues.push({
          type: 'ambiguous_term',
          description: `Ambiguous term: "${term}"`,
          severity: 'low',
          term,
          context: `Used in section: ${fieldName}`,
          suggestedTerm: 'Use more specific language',
        });
      }
    }

    return issues;
  }

  /**
   * Extract terms from report content
   */
  private extractTermsFromReport(schemaMappingResult: SchemaMappingResult): Array<{
    term: string;
    context: string;
    fieldName: string;
  }> {
    const terms: Array<{
      term: string;
      context: string;
      fieldName: string;
    }> = [];

    // Simple term extraction (in real system would use NLP)
    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        // Extract potential terms (words with 3+ characters)
        const words = value.split(/\s+/).filter(word => 
          word.length >= 3 && /^[a-zA-Z]+$/.test(word.replace(/[^a-zA-Z]/g, ''))
        );
        
        for (const word of words) {
          const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
          if (cleanWord.length >= 3) {
            terms.push({
              term: cleanWord,
              context: value.substring(0, 100) + '...',
              fieldName: field.fieldName,
            });
          }
        }
      }
    }

    return terms;
  }

  /**
   * Find if a term is a variant of a standard term
   */
  private findStandardTermVariant(term: string): string | null {
    const lowerTerm = term.toLowerCase();
    
    for (const [standardTerm, entry] of Object.entries(this.standardGlossary)) {
      if (lowerTerm === standardTerm) {
        return standardTerm;
      }
      
      // Check alternatives
      if (entry.alternatives.some(alt => lowerTerm.includes(alt.toLowerCase()))) {
        return standardTerm;
      }
    }
    
    return null;
  }

  /**
   * Find base term for a given term
   */
  private findBaseTerm(term: string): string | null {
    for (const [standardTerm, entry] of Object.entries(this.standardGlossary)) {
      if (term === standardTerm) {
        return standardTerm;
      }
      
      // Check if term is an alternative
      if (entry.alternatives.some(alt => term.includes(alt.toLowerCase()))) {
        return standardTerm;
      }
    }
    
    return null;
  }

  /**
   * Get plain language alternative for jargon
   */
  private getPlainLanguageAlternative(jargon: string): string {
    const jargonMap: Record<string, string> = {
      'leverage': 'use',
      'synergy': 'cooperation',
      'paradigm': 'model',
      'bandwidth': 'capacity',
      'circle back': 'follow up',
      'touch base': 'contact',
      'low-hanging fruit': 'easy targets',
      'move the needle': 'make progress',
      'drill down': 'analyze in detail',
    };
    
    const lowerJargon = jargon.toLowerCase();
    for (const [jargonTerm, alternative] of Object.entries(jargonMap)) {
      if (lowerJargon.includes(jargonTerm)) {
        return alternative;
      }
    }
    
    return 'use clearer language';
  }

  /**
   * Get severity based on terminology category
   */
  private getSeverityForCategory(category: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    switch (category) {
      case 'compliance':
      case 'legal':
        return 'high';
      case 'technical':
      case 'safety':
        return 'medium';
      case 'species':
      case 'measurement':
        return 'low';
      default:
        return 'info';
    }
  }

  /**
   * Add term to standard glossary
   */
  addToGlossary(
    term: string,
    definition: string,
    category: string,
    alternatives: string[] = [],
    preferred: boolean = true
  ): void {
    this.standardGlossary[term.toLowerCase()] = {
      definition,
      category,
      alternatives,
      preferred,
    };
  }

  /**
   * Add jargon term
   */
  addJargonTerm(term: string): void {
    if (!this.jargonTerms.includes(term)) {
      this.jargonTerms.push(term);
    }
  }

  /**
   * Add ambiguous term
   */
  addAmbiguousTerm(term: string): void {
    if (!this.ambiguousTerms.includes(term)) {
      this.ambiguousTerms.push(term);
    }
  }

  /**
   * Get terminology assessment summary
   */
  getTerminologySummary(score: number): string {
    if (score >= 90) return 'Excellent terminology usage';
    if (score >= 80) return 'Good terminology usage';
    if (score >= 70) return 'Acceptable terminology usage';
    if (score >= 60) return 'Needs terminology improvement';
    return 'Poor terminology usage - significant issues';
  }

  /**
   * Get standard glossary
   */
  getGlossary(): Record<string, {
    definition: string;
    category: string;
    alternatives: string[];
    preferred: boolean;
  }> {
    return { ...this.standardGlossary };
  }
}
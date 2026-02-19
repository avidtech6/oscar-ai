/**
 * Fix Contradiction Generator
 * Generates healing actions for fixing contradictions in report schemas
 */

import type { SelfHealingAction, SelfHealingTarget, FixContradictionPayload } from '../SelfHealingAction';
import { createSelfHealingAction } from '../SelfHealingAction';

export interface FixContradictionOptions {
  contradictionType: 'section_content' | 'metadata' | 'structure' | 'terminology' | 'compliance';
  description: string;
  sourceA: any;
  sourceB: any;
  resolution: 'use_source_a' | 'use_source_b' | 'merge' | 'create_new' | 'flag_for_review';
  mergedValue?: any;
}

export class FixContradictionGenerator {
  public generate(
    target: SelfHealingTarget,
    options: FixContradictionOptions,
    source: {
      mappingResultId?: string;
      classificationResultId?: string;
      detector: string;
      confidence: number;
    }
  ): SelfHealingAction {
    const payload: FixContradictionPayload = {
      contradictionType: options.contradictionType,
      description: options.description,
      sourceA: options.sourceA,
      sourceB: options.sourceB,
      resolution: options.resolution,
      mergedValue: options.mergedValue
    };
    
    return createSelfHealingAction(
      'fixContradiction',
      target,
      payload,
      'high',
      `Fix contradiction: ${options.description}`,
      source
    );
  }
  
  public generateMergeResolution(
    target: SelfHealingTarget,
    contradictionType: FixContradictionOptions['contradictionType'],
    description: string,
    sourceA: any,
    sourceB: any,
    mergedValue: any,
    source: {
      mappingResultId?: string;
      classificationResultId?: string;
      detector: string;
      confidence: number;
    }
  ): SelfHealingAction {
    return this.generate(
      target,
      {
        contradictionType,
        description,
        sourceA,
        sourceB,
        resolution: 'merge',
        mergedValue
      },
      source
    );
  }
  
  public generateUseSourceAResolution(
    target: SelfHealingTarget,
    contradictionType: FixContradictionOptions['contradictionType'],
    description: string,
    sourceA: any,
    sourceB: any,
    source: {
      mappingResultId?: string;
      classificationResultId?: string;
      detector: string;
      confidence: number;
    }
  ): SelfHealingAction {
    return this.generate(
      target,
      {
        contradictionType,
        description,
        sourceA,
        sourceB,
        resolution: 'use_source_a'
      },
      source
    );
  }
  
  public generateFlagForReviewResolution(
    target: SelfHealingTarget,
    contradictionType: FixContradictionOptions['contradictionType'],
    description: string,
    sourceA: any,
    sourceB: any,
    source: {
      mappingResultId?: string;
      classificationResultId?: string;
      detector: string;
      confidence: number;
    }
  ): SelfHealingAction {
    return this.generate(
      target,
      {
        contradictionType,
        description,
        sourceA,
        sourceB,
        resolution: 'flag_for_review'
      },
      source
    );
  }
  
  public validateOptions(options: FixContradictionOptions): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!options.contradictionType) errors.push('contradictionType is required');
    if (!options.description) errors.push('description is required');
    if (!options.sourceA) errors.push('sourceA is required');
    if (!options.sourceB) errors.push('sourceB is required');
    if (!options.resolution) errors.push('resolution is required');
    
    const validContradictionTypes = ['section_content', 'metadata', 'structure', 'terminology', 'compliance'];
    if (!validContradictionTypes.includes(options.contradictionType)) {
      errors.push(`contradictionType must be one of: ${validContradictionTypes.join(', ')}`);
    }
    
    const validResolutions = ['use_source_a', 'use_source_b', 'merge', 'create_new', 'flag_for_review'];
    if (!validResolutions.includes(options.resolution)) {
      errors.push(`resolution must be one of: ${validResolutions.join(', ')}`);
    }
    
    if (options.resolution === 'merge' && !options.mergedValue) {
      errors.push('mergedValue is required when resolution is "merge"');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  public autoMergeValues(sourceA: any, sourceB: any): any {
    // Simple auto-merge logic
    if (Array.isArray(sourceA) && Array.isArray(sourceB)) {
      // Merge arrays, removing duplicates
      return [...new Set([...sourceA, ...sourceB])];
    }
    
    if (typeof sourceA === 'object' && typeof sourceB === 'object' && sourceA !== null && sourceB !== null) {
      // Merge objects
      return { ...sourceA, ...sourceB };
    }
    
    // Default: use sourceA
    return sourceA;
  }
  
  public detectContradictionType(sourceA: any, sourceB: any): FixContradictionOptions['contradictionType'] {
    // Simple detection based on value types
    if (typeof sourceA === 'string' && typeof sourceB === 'string') {
      if (sourceA.toLowerCase().includes('section') || sourceB.toLowerCase().includes('section')) {
        return 'section_content';
      }
      if (sourceA.toLowerCase().includes('term') || sourceB.toLowerCase().includes('term')) {
        return 'terminology';
      }
    }
    
    // Default to section_content
    return 'section_content';
  }
}
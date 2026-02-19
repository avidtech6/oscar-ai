/**
 * Add Missing Section Generator
 * Generates healing actions for adding missing sections to report schemas
 */

import type { SelfHealingAction, SelfHealingTarget, AddMissingSectionPayload } from '../SelfHealingAction';
import { createSelfHealingAction } from '../SelfHealingAction';

export interface AddMissingSectionOptions {
  sectionId: string;
  sectionName: string;
  description?: string;
  required?: boolean;
  suggestedContent?: string;
  aiGuidance?: string;
  position?: number;
}

export class AddMissingSectionGenerator {
  public generate(
    target: SelfHealingTarget,
    options: AddMissingSectionOptions,
    source: {
      mappingResultId?: string;
      classificationResultId?: string;
      detector: string;
      confidence: number;
    }
  ): SelfHealingAction {
    const payload: AddMissingSectionPayload = {
      sectionId: options.sectionId,
      sectionName: options.sectionName,
      description: options.description || `Auto-generated section: ${options.sectionName}`,
      required: options.required !== false, // Default to true
      suggestedContent: options.suggestedContent || '',
      aiGuidance: options.aiGuidance || '',
      position: options.position
    };
    
    return createSelfHealingAction(
      'addMissingSection',
      target,
      payload,
      'medium',
      `Add missing section: ${options.sectionName}`,
      source
    );
  }
  
  public generateBatch(
    sections: Array<{
      target: SelfHealingTarget;
      options: AddMissingSectionOptions;
      source: {
        mappingResultId?: string;
        classificationResultId?: string;
        detector: string;
        confidence: number;
      };
    }>
  ): SelfHealingAction[] {
    return sections.map(section => this.generate(section.target, section.options, section.source));
  }
  
  public validateOptions(options: AddMissingSectionOptions): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!options.sectionId) errors.push('sectionId is required');
    if (!options.sectionName) errors.push('sectionName is required');
    
    if (options.position !== undefined && (typeof options.position !== 'number' || options.position < 0)) {
      errors.push('position must be a non-negative number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  public getDefaultOptions(sectionId: string, sectionName: string): AddMissingSectionOptions {
    return {
      sectionId,
      sectionName,
      description: `Auto-generated section: ${sectionName}`,
      required: true,
      suggestedContent: '',
      aiGuidance: '',
      position: undefined
    };
  }
  
  public getPositionFromExistingSections(existingSections: Array<{ id: string; position?: number }>): number {
    if (existingSections.length === 0) return 0;
    
    const positions = existingSections
      .map(s => s.position ?? 0)
      .filter(p => typeof p === 'number');
    
    if (positions.length === 0) return existingSections.length;
    
    return Math.max(...positions) + 1;
  }
}
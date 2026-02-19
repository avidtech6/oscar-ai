/**
 * Missing Sections Detector
 * Detects missing required sections in report schemas
 */

import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ClassificationResult } from '../../classification/ClassificationResult';
import type { SelfHealingAction, SelfHealingTarget } from '../SelfHealingAction';
import { createSelfHealingAction } from '../SelfHealingAction';

export interface MissingSectionsDetectionResult {
  detector: 'MissingSectionsDetector';
  findings: Array<{
    sectionId: string;
    sectionName: string;
    required: boolean;
    description?: string;
  }>;
  confidence: number;
  actions: SelfHealingAction[];
}

export class MissingSectionsDetector {
  public async detect(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult
  ): Promise<MissingSectionsDetectionResult> {
    const findings: Array<{
      sectionId: string;
      sectionName: string;
      required: boolean;
      description?: string;
    }> = [];
    const actions: SelfHealingAction[] = [];
    
    // Check for missing required sections
    if (mappingResult.missingRequiredSections?.length > 0) {
      mappingResult.missingRequiredSections.forEach(section => {
        findings.push({
          sectionId: section.sectionId,
          sectionName: section.sectionName,
          required: section.required,
          description: section.description
        });
        
        const target: SelfHealingTarget = { 
          reportTypeId: mappingResult.reportTypeId, 
          sectionId: section.sectionId 
        };
        
        const payload = { 
          sectionId: section.sectionId, 
          sectionName: section.sectionName, 
          description: section.description || '',
          required: section.required,
          suggestedContent: section.suggestedContent,
          aiGuidance: section.aiGuidance
        };
        
        const action = createSelfHealingAction(
          'addMissingSection',
          target,
          payload,
          section.required ? 'high' : 'medium',
          `Missing required section: ${section.sectionName}`,
          { 
            mappingResultId: mappingResult.id, 
            classificationResultId: classificationResult?.id, 
            detector: 'MissingSectionsDetector', 
            confidence: 0.9 
          }
        );
        
        actions.push(action);
      });
    }
    
    return {
      detector: 'MissingSectionsDetector',
      findings,
      confidence: findings.length > 0 ? 0.9 : 0.1,
      actions
    };
  }
  
  public getDescription(): string {
    return 'Detects missing required sections in report schemas';
  }
  
  public getSupportedIssueTypes(): string[] {
    return ['missing_required_section', 'missing_optional_section'];
  }
  
  public getSeverityThreshold(): 'low' | 'medium' | 'high' | 'critical' {
    return 'medium';
  }
}
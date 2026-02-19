/**
 * Missing Fields Detector
 * Detects missing fields in report schemas
 */

import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ClassificationResult } from '../../classification/ClassificationResult';
import type { SelfHealingAction, SelfHealingTarget } from '../SelfHealingAction';
import { createSelfHealingAction } from '../SelfHealingAction';

export interface MissingFieldsDetectionResult {
  detector: 'MissingFieldsDetector';
  findings: Array<{
    gapId: string;
    fieldId?: string;
    sectionId?: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  }>;
  confidence: number;
  actions: SelfHealingAction[];
}

export class MissingFieldsDetector {
  public async detect(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult
  ): Promise<MissingFieldsDetectionResult> {
    const findings: Array<{
      gapId: string;
      fieldId?: string;
      sectionId?: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      confidence: number;
    }> = [];
    const actions: SelfHealingAction[] = [];
    
    // Check for schema gaps (missing fields)
    if (mappingResult.schemaGaps?.length > 0) {
      mappingResult.schemaGaps.forEach(gap => {
        if (gap.type === 'missing_field') {
          // Convert gap.severity to our severity type
          const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
            'info': 'low',
            'warning': 'medium',
            'critical': 'critical'
          };
          const severity = severityMap[gap.severity] || 'medium';
          
          findings.push({
            gapId: gap.gapId,
            fieldId: gap.affectedFieldId,
            sectionId: gap.affectedSectionId,
            description: gap.description,
            severity,
            confidence: gap.confidence
          });
          
          const target: SelfHealingTarget = { 
            reportTypeId: mappingResult.reportTypeId, 
            fieldId: gap.affectedFieldId 
          };
          
          const payload = { 
            fieldId: gap.affectedFieldId || 'unknown', 
            fieldName: 'Unknown field', 
            fieldType: 'text' as const, 
            sectionId: gap.affectedSectionId || 'unknown',
            description: gap.suggestedFix || ''
          };
          
          const action = createSelfHealingAction(
            'addMissingField',
            target,
            payload,
            gap.severity === 'critical' ? 'high' : 'medium',
            `Missing field: ${gap.description}`,
            { 
              mappingResultId: mappingResult.id, 
              classificationResultId: classificationResult?.id, 
              detector: 'MissingFieldsDetector', 
              confidence: gap.confidence 
            }
          );
          
          actions.push(action);
        }
      });
    }
    
    return {
      detector: 'MissingFieldsDetector',
      findings,
      confidence: findings.length > 0 ? 0.8 : 0.1,
      actions
    };
  }
  
  public getDescription(): string {
    return 'Detects missing fields in report schemas';
  }
  
  public getSupportedIssueTypes(): string[] {
    return ['missing_field', 'schema_gap'];
  }
  
  public getSeverityThreshold(): 'low' | 'medium' | 'high' | 'critical' {
    return 'medium';
  }
}
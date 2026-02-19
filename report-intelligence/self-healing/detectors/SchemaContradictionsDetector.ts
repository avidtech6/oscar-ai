/**
 * Schema Contradictions Detector
 * Detects contradictions in schema mappings
 */

import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ClassificationResult } from '../../classification/ClassificationResult';
import type { SelfHealingAction, SelfHealingTarget } from '../SelfHealingAction';
import { createSelfHealingAction } from '../SelfHealingAction';

export interface SchemaContradictionsDetectionResult {
  detector: 'SchemaContradictionsDetector';
  findings: Array<{
    contradictionId: string;
    contradictionType: 'field_mapping' | 'section_structure' | 'data_type' | 'cardinality';
    description: string;
    conflictingElements: any[];
    confidence: number;
  }>;
  confidence: number;
  actions: SelfHealingAction[];
}

export class SchemaContradictionsDetector {
  public async detect(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult
  ): Promise<SchemaContradictionsDetectionResult> {
    const findings: Array<{
      contradictionId: string;
      contradictionType: 'field_mapping' | 'section_structure' | 'data_type' | 'cardinality';
      description: string;
      conflictingElements: any[];
      confidence: number;
    }> = [];
    const actions: SelfHealingAction[] = [];
    
    // Check for schema contradictions in mapped fields
    if (mappingResult.mappedFields?.length > 0) {
      // Detect duplicate field mappings
      const fieldMap = new Map<string, any[]>();
      mappingResult.mappedFields.forEach(field => {
        // Use fieldId or id property
        const fieldAny = field as any;
        const fieldId = fieldAny.fieldId || fieldAny.id || 'unknown';
        if (!fieldMap.has(fieldId)) {
          fieldMap.set(fieldId, []);
        }
        fieldMap.get(fieldId)!.push(field);
      });
      
      for (const [fieldId, fields] of fieldMap.entries()) {
        if (fields.length > 1) {
          const contradictionId = `contradiction_field_${fieldId}_${Date.now()}`;
          findings.push({
            contradictionId,
            contradictionType: 'field_mapping',
            description: `Multiple mappings for field ${fieldId}`,
            conflictingElements: fields,
            confidence: 0.8
          });
          
          const target: SelfHealingTarget = { 
            reportTypeId: mappingResult.reportTypeId, 
            fieldId 
          };
          
          const payload = { 
            contradictionType: 'section_content' as const,
            description: `Multiple mappings for field ${fieldId}`,
            sourceA: fields[0],
            sourceB: fields[1],
            resolution: 'merge' as const,
            mergedValue: { ...fields[0], ...fields[1] }
          };
          
          const action = createSelfHealingAction(
            'fixContradiction',
            target,
            payload,
            'high',
            `Schema contradiction: multiple mappings for field ${fieldId}`,
            { 
              mappingResultId: mappingResult.id, 
              classificationResultId: classificationResult?.id, 
              detector: 'SchemaContradictionsDetector', 
              confidence: 0.8 
            }
          );
          
          actions.push(action);
        }
      }
    }
    
    return {
      detector: 'SchemaContradictionsDetector',
      findings,
      confidence: findings.length > 0 ? 0.8 : 0.1,
      actions
    };
  }
  
  public getDescription(): string {
    return 'Detects contradictions in schema mappings (e.g., duplicate field mappings)';
  }
  
  public getSupportedIssueTypes(): string[] {
    return ['field_mapping_contradiction', 'schema_contradiction', 'duplicate_mapping'];
  }
  
  public getSeverityThreshold(): 'low' | 'medium' | 'high' | 'critical' {
    return 'high';
  }
}
/**
 * Detectors Index
 * Exports all detector modules for the Report Self-Healing Engine
 */

import { MissingSectionsDetector } from './MissingSectionsDetector';
import { MissingFieldsDetector } from './MissingFieldsDetector';
import { SchemaContradictionsDetector } from './SchemaContradictionsDetector';

export { MissingSectionsDetector } from './MissingSectionsDetector';
export { MissingFieldsDetector } from './MissingFieldsDetector';
export { SchemaContradictionsDetector } from './SchemaContradictionsDetector';

// Additional detectors will be added here
// export { MissingComplianceRulesDetector } from './MissingComplianceRulesDetector';
// export { MissingTerminologyDetector } from './MissingTerminologyDetector';
// export { MissingTemplatesDetector } from './MissingTemplatesDetector';
// export { MissingAIGuidanceDetector } from './MissingAIGuidanceDetector';
// export { StructuralContradictionsDetector } from './StructuralContradictionsDetector';
// export { MetadataContradictionsDetector } from './MetadataContradictionsDetector';

export interface Detector {
  detect(
    mappingResult: any,
    classificationResult?: any
  ): Promise<{
    detector: string;
    findings: any[];
    confidence: number;
    actions: any[];
  }>;
  
  getDescription(): string;
  getSupportedIssueTypes(): string[];
  getSeverityThreshold(): 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Get all available detectors
 */
export function getAllDetectors(): Detector[] {
  return [
    new MissingSectionsDetector(),
    new MissingFieldsDetector(),
    new SchemaContradictionsDetector()
  ];
}

/**
 * Get detector by name
 */
export function getDetectorByName(name: string): Detector | undefined {
  const detectors = getAllDetectors();
  return detectors.find(detector => detector.constructor.name === name);
}

/**
 * Get detectors for specific issue types
 */
export function getDetectorsForIssueTypes(issueTypes: string[]): Detector[] {
  const detectors = getAllDetectors();
  return detectors.filter(detector => {
    const supportedTypes = detector.getSupportedIssueTypes();
    return issueTypes.some(issueType => supportedTypes.includes(issueType));
  });
}
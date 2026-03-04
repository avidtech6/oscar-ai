/**
 * Classification Module (Phase 6)
 * 
 * Exports all components of the Report Classification Engine.
 */

export * from './ClassificationResult';
export * from './ReportClassificationEngine';

// Re‑export scorers for advanced usage
export * from './scorers/scoreStructureSimilarity';
export * from './scorers/scoreTerminologySimilarity';
export * from './scorers/scoreComplianceMarkers';
export * from './scorers/scoreMetadata';
export * from './scorers/scoreSectionOrdering';

// Re‑export rankers
export * from './rankers/rankCandidates';
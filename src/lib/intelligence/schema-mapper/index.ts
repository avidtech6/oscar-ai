/**
 * Schema Mapper Module (Phase 3)
 * 
 * Exports all components of the Report Schema Mapper.
 */

export * from './SchemaMappingResult';
export * from './ReportSchemaMapper';
export * from './storage';

// Re‑export mappers for advanced usage
export * from './mappers/mapSectionsToSchema';
export * from './mappers/mapTerminology';
export * from './mappers/detectMissingSections';
export * from './mappers/detectExtraSections';
export * from './mappers/detectSchemaGaps';
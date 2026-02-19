/**
 * Phase Integration Service - Phase 12.9
 * 
 * Exports for the Integration module components.
 */

export * from './PhaseIntegrationService';
export { DEFAULT_PHASE_INTEGRATION_CONFIG } from './PhaseIntegrationService';
export type {
  PhaseIntegrationConfiguration,
  PhaseIntegrationData
} from './PhaseIntegrationService';

// Note: Additional integration components will be exported here as they are implemented
// - IntegrationAdapter
// - DataFlowManager
// - InteroperabilityService
// - etc.
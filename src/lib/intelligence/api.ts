/**
 * Public Intelligence API
 *
 * This module exposes a clean, typed API for UI components to interact with
 * the intelligence layer. All logic is derived from Phase Files.
 *
 * Architecture Rules:
 * 1. UI may only call intelligence functions through this API
 * 2. No logic from HAR may influence the intelligence layer
 * 3. All functions must be typed and documented
 * 4. Functions must be modular and future-proof
 */

// Import all API functions from split modules
import { initializeIntelligence, getPhase, listPhases, searchBlueprint, getReportTypes, getWorkflowDefinitions, getSchemaMappings, summarizePhase, generateReport, explainDecision, getIntelligenceStatus } from './apiCore';
import { getReportTypeDefinition, getWorkflowDefinition, getSchemaMapping } from './apiDefinitions';
import { getIntelligenceCapabilities, getArchitectureSummaries } from './apiCapabilities';
import { validateReportStructure } from './apiValidation';
import { getReasoningTrace } from './apiReasoning';

// Re-export all functions
export { initializeIntelligence, getPhase, listPhases, searchBlueprint, getReportTypes, getWorkflowDefinitions, getSchemaMappings, summarizePhase, generateReport, explainDecision, getIntelligenceStatus };
export { getReportTypeDefinition, getWorkflowDefinition, getSchemaMapping };
export { getIntelligenceCapabilities, getArchitectureSummaries };
export { validateReportStructure };
export { getReasoningTrace };

// Default export for backward compatibility
export default {
	initializeIntelligence,
	getPhase,
	listPhases,
	searchBlueprint,
	getReportTypes,
	getWorkflowDefinitions,
	getSchemaMappings,
	summarizePhase,
	generateReport,
	explainDecision,
	getIntelligenceStatus,
	getReportTypeDefinition,
	getWorkflowDefinition,
	getSchemaMapping,
	getIntelligenceCapabilities,
	getArchitectureSummaries,
	validateReportStructure,
	getReasoningTrace
};
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
import { intelligenceContext } from '../stores/intelligence/intelligenceContext';

// Re-export all functions
export { initializeIntelligence, getPhase, listPhases, searchBlueprint, getReportTypes, getWorkflowDefinitions, getSchemaMappings, summarizePhase, generateReport, explainDecision, getIntelligenceStatus };
export { getReportTypeDefinition, getWorkflowDefinition, getSchemaMapping };
export { getIntelligenceCapabilities, getArchitectureSummaries };
export { validateReportStructure };
export { getReasoningTrace };

// Export mock data functionality
export function shouldUseMockData(): boolean {
	let mockData = false;
	intelligenceContext.subscribe($context => {
		mockData = $context.preferences.mockData;
	});
	return mockData;
}

export function setMockDataPreference(enabled: boolean): void {
	intelligenceContext.update(state => ({
		...state,
		preferences: {
			...state.preferences,
			mockData: enabled
		}
	}));
}

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

// Mock data generation function for testing and development
export function generateMockData(input: Record<string, any> = {}): Record<string, any> {
	if (!shouldUseMockData()) {
		return input;
	}

	const mockData = {
		timestamp: new Date().toISOString(),
		environment: 'development',
		mode: 'mock',
		data: {
			...input,
			generated: true,
			mockId: `mock_${Date.now()}`,
			sampleData: [
				{ id: 1, name: 'Sample Item 1', value: Math.random() * 100 },
				{ id: 2, name: 'Sample Item 2', value: Math.random() * 100 },
				{ id: 3, name: 'Sample Item 3', value: Math.random() * 100 }
			]
		}
	};

	console.log('Mock data generated:', mockData);
	return mockData;
}
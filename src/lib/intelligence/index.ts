/**
 * Intelligence Layer Index
 * 
 * This file exports all Phase Files as the authoritative architectural blueprint
 * for Oscar AI V2. The Phase Files define the system architecture, intelligence
 * layers, workflows, report engines, schema logic, naming conventions, and
 * intended behaviour.
 * 
 * IMPORTANT: The Phase Files take priority over any HAR-derived contradictions.
 */

// Type definitions for intelligence layer
export interface IntelligenceLayer {
	phaseFiles: string[];
	version: string;
	description: string;
}

// Create a store-like object that provides access to the intelligence layer
export const intelligenceLayer: IntelligenceLayer = {
	phaseFiles: [
		'PHASE_0_MASTER_VISION_COPILOT_LAYER.md',
		'PHASE_1_REPORT_TYPE_REGISTRY.md',
		'PHASE_2_REPORT_DECOMPILER_ENGINE.md',
		'PHASE_3_REPORT_SCHEMA_MAPPER.md',
		'PHASE_4_SCHEMA_UPDATER_ENGINE.md',
		'PHASE_5_REPORT_STYLE_LEARNER.md',
		'PHASE_6_REPORT_CLASSIFICATION_ENGINE.md',
		'PHASE_7_REPORT_SELF_HEALING_ENGINE.md',
		'PHASE_8_REPORT_TEMPLATE_GENERATOR.md',
		'PHASE_9_REPORT_COMPLIANCE_VALIDATOR.md',
		'PHASE_10_REPORT_REPRODUCTION_TESTER.md',
		'PHASE_11_REPORT_TYPE_EXPANSION_FRAMEWORK.md',
		'PHASE_12_AI_REASONING_INTEGRATION_FOR_REPORTS.md',
		'PHASE_13_USER_WORKFLOW_LEARNING_FOR_REPORTS.md',
		'PHASE_14_FINAL_INTEGRATION_AND_VALIDATION.md',
		'PHASE_15_HTML_RENDERING_VISUAL_REPRODUCTION_ENGINE.md',
		'PHASE_16_DIRECT_PDF_PARSING_AND_LAYOUT_EXTRACTION_ENGINE.md',
		'PHASE_17_CONTENT_INTELLIGENCE_AND_BLOG_POST_ENGINE.md',
		'PHASE_18_UNIFIED_EDITOR_AND_SUPABASE_INTEGRATION.md',
		'PHASE_19_EMAIL_CALENDAR_TASK_INTELLIGENCE_LAYER.md',
		'PHASE_20_FULL_SYSTEM_TESTING_AND_DEBUGGING.md',
		'PHASE_21_GLOBAL_ASSISTANT_INTELLIGENCE_LAYER.md',
		'PHASE_22_MEDIA_INTELLIGENCE_LAYER.md',
		'PHASE_23_AI_LAYOUT_ENGINE.md',
		'PHASE_24_DOCUMENT_INTELLIGENCE_LAYER.md',
		'PHASE_25_WORKFLOW_INTELLIGENCE_LAYER.md',
		'PHASE_26_FINAL_SYSTEM_INTEGRATION_AND_BUILD_PREP.md',
		'PHASE_INDEX_REPORT_INTELLIGENCE.md',
		'Phase26ArchitectureConsolidation.md',
		'Phase26FinalBuildSpec.md',
		'Phase26IntegrationTestingSpec.md',
		'Phase26PerformanceTestScenarios.md',
		'Phase26UXConsistencyRules.md'
	],
	version: '2.0.0',
	description: 'Oscar AI V2 Intelligence Layer - Authoritative architectural blueprint'
};

// Helper function to get phase file content by name
export async function getPhaseFile(name: string): Promise<string> {
	// In a real implementation, this would fetch the file content
	return `Content of ${name} would be loaded here`;
}

// Export a simple hook for Svelte components
export function useIntelligence() {
	return {
		version: intelligenceLayer.version,
		description: intelligenceLayer.description,
		hasPhaseFiles: true,
		phaseCount: intelligenceLayer.phaseFiles.length
	};
}

// Synchronous function to get intelligence layer data for dashboard
export function getIntelligenceLayer() {
	const phases = intelligenceLayer.phaseFiles.map((file) => {
		// Extract phase number and title
		const match = file.match(/^PHASE_(\d+)_(.+)\.md$/);
		if (match) {
			const number = parseInt(match[1]);
			const title = match[2].replace(/_/g, ' ');
			return {
				name: `Phase ${number}: ${title}`,
				description: `Architectural blueprint for ${title}`
			};
		} else {
			// For non-standard phase files
			const name = file.replace(/\.md$/, '').replace(/_/g, ' ');
			return {
				name,
				description: `Supporting document for ${name}`
			};
		}
	});

	return {
		phaseCount: intelligenceLayer.phaseFiles.length,
		phases,
		version: intelligenceLayer.version,
		description: intelligenceLayer.description
	};
}

// Helper function to get phase description by ID
function getPhaseDescription(id: string): string {
	const descriptions: Record<string, string> = {
		'PHASE_0': 'Master Vision & Copilot Layer - Core intelligence foundation',
		'PHASE_1': 'Report Type Registry - Central registry for all report types',
		'PHASE_2': 'Report Decompiler Engine - Extracts structure from raw reports',
		'PHASE_3': 'Report Schema Mapper - Maps extracted data to structured schemas',
		'PHASE_4': 'Schema Updater Engine - Continuously improves schemas',
		'PHASE_5': 'Report Style Learner - Learns and applies report styling',
		'PHASE_6': 'Report Classification Engine - Classifies reports by type',
		'PHASE_7': 'Report Self-Healing Engine - Automatically fixes report issues',
		'PHASE_8': 'Report Template Generator - Creates templates from examples',
		'PHASE_9': 'Report Compliance Validator - Ensures regulatory compliance',
		'PHASE_10': 'Report Reproduction Tester - Tests report generation',
		'PHASE_11': 'Report Type Expansion Framework - Expands supported report types',
		'PHASE_12': 'AI Reasoning Integration - Adds AI reasoning to reports',
		'PHASE_13': 'User Workflow Learning - Learns from user interactions',
		'PHASE_14': 'Final Integration & Validation - System-wide integration',
		'PHASE_15': 'HTML Rendering Engine - Visual reproduction engine',
		'PHASE_16': 'PDF Parsing Engine - Direct PDF parsing and layout extraction',
		'PHASE_17': 'Content Intelligence Engine - Blog post and content generation',
		'PHASE_18': 'Unified Editor & Supabase Integration - Editor and database integration',
		'PHASE_19': 'Email Calendar Task Intelligence - Email and calendar integration',
		'PHASE_20': 'Full System Testing & Debugging - Comprehensive testing',
		'PHASE_21': 'Global Assistant Intelligence - Global AI assistant layer',
		'PHASE_22': 'Media Intelligence Layer - Media processing intelligence',
		'PHASE_23': 'AI Layout Engine - Intelligent layout generation',
		'PHASE_24': 'Document Intelligence Layer - Document processing intelligence',
		'PHASE_25': 'Workflow Intelligence Layer - Workflow optimization',
		'PHASE_26': 'Final System Integration - Final build preparation',
	};
	return descriptions[id] || 'Intelligence phase';
}

// Mock intelligence object for UI components
export const intelligence = {
	getPhaseFiles: () => {
		return intelligenceLayer.phaseFiles.map((file) => {
			const match = file.match(/^PHASE_(\d+)_(.+)\.md$/);
			const id = match ? `PHASE_${match[1]}` : file.replace(/\.md$/, '');
			const name = match ? `Phase ${match[1]}: ${match[2].replace(/_/g, ' ')}` : file.replace(/\.md$/, '').replace(/_/g, ' ');
			return {
				id,
				name,
				description: getPhaseDescription(id),
				path: `/intelligence/${file}`,
				size: 1024, // placeholder
				modified: '2025-03-02' // placeholder
			};
		});
	}
};

// Export Report Type Registry (Phase 1)
export { reportTypeRegistry } from './registry/ReportTypeRegistry';

// Export Report Decompiler Engine (Phase 2)
export { ReportDecompiler, decompiledReportStorage } from './decompiler';

// Export Report Schema Mapper (Phase 3)
export { ReportSchemaMapper, schemaMappingStorage } from './schema-mapper';

// Export Schema Updater Engine (Phase 4)
export { SchemaUpdaterEngine } from './schema-updater';

// Export Report Style Learner (Phase 5)
export { ReportStyleLearner } from './style-learner';

// Export Report Classification Engine (Phase 6)
export { ReportClassificationEngine } from './classification';

// Export Report Self‑Healing Engine (Phase 7)
export { ReportSelfHealingEngine } from './self-healing';

// Export Report Template Generator (Phase 8)
export { ReportTemplateGenerator } from './template-generator';

// Export Report Compliance Validator (Phase 9)
export { ReportComplianceValidator } from './compliance/ReportComplianceValidator';

// Export Report Reproduction Tester (Phase 10)
export { ReportReproductionTester } from './reproduction';

// Export Report Type Expansion Framework (Phase 11)
export { ReportTypeExpansionEngine } from './expansion';

// Export Report AI Reasoning Integration (Phase 12)
export { ReportAIReasoningEngine } from './report-reasoning';

// Export User Workflow Learning Engine (Phase 13)
export { UserWorkflowLearningEngine } from './workflow-learning';

// Export Report Intelligence System (Phase 14)
export { ReportIntelligenceSystem, SystemIntegrationValidator } from './orchestrator';

// Export Visual Rendering Engine (Phase 15)
export { VisualRenderingEngine } from './visual-rendering';

// Export PDF Parsing & Layout Extraction Engine (Phase 16)
export { PDFParser } from './pdf-parsing';

// Export Content Intelligence Engine (Phase 17)
export { ContentIntelligenceEngine } from './content-intelligence/ContentIntelligenceEngine';

// Export Unified Editor (Phase 18)
export { UnifiedEditor } from './unified-editor/Editor';

// Export Unified Intelligence Orchestration Layer (Phase 19)
export { OrchestrationKernel } from './unified-orchestration/OrchestrationKernel';

// Export System Testing Engine (Phase 20)
export { SystemTestingEngine } from './testing/SystemTestingEngine';

// Export Global Assistant Intelligence Layer (Phase 21)
export { AssistantStore, AssistantEventBus, AssistantModeManager } from '../assistant';

// Export Media Intelligence Layer (Phase 22)
export { MediaIngestionPipeline } from './media/MediaIngestionPipeline';

// Export AI Layout Engine (Phase 23)
export { AILayoutEngine } from './layout/AILayoutEngine';

// Export Document Intelligence Layer (Phase 24)
export { DocumentIntelligenceLayer } from './document/DocumentIntelligenceLayer';

// Export Workflow Intelligence Layer (Phase 25)
export { WorkflowIntelligenceLayer } from './workflow/WorkflowIntelligenceLayer';
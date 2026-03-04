/**
 * AIA Architectural Report (Phase 1)
 * 
 * Built‑in report type definition for American Institute of Architects (AIA) architectural reports.
 */

import { createReportTypeDefinition } from '../ReportTypeDefinition';

export const AIAReport = createReportTypeDefinition(
	'aia',
	'AIA Architectural Report',
	'Professional architectural report following AIA standards and best practices',
	[
		'project_overview',
		'site_analysis',
		'design_intent',
		'architectural_drawings',
		'material_specifications',
		'structural_systems',
		'mechanical_electrical_plumbing',
		'sustainability_analysis',
		'code_compliance',
		'cost_estimate'
	],
	[
		'photographic_documentation',
		'client_interview_notes',
		'historical_research',
		'zoning_analysis',
		'community_feedback'
	],
	[
		'historic_preservation',
		'accessibility_analysis',
		'seismic_design',
		'flood_zone_mitigation'
	],
	[
		'AIA Document G702‑1992',
		'AIA Document B101‑2017',
		'International Building Code (IBC)',
		'LEED Certification Guidelines'
	],
	[
		'AIA Code of Ethics and Professional Conduct',
		'AIA Sustainable Project Guide',
		'AIA Best Practices for Architectural Documentation'
	],
	[
		'Ensure all architectural drawings are properly scaled and annotated.',
		'Highlight any deviations from AIA standard documents with justification.',
		'Include sustainability metrics and LEED potential score.',
		'Verify compliance with local zoning and building codes.',
		'Provide clear cost breakdown using AIA standard cost codes.'
	],
	'1.0.0'
);

export default AIAReport;
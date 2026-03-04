/**
 * Condition Report (Phase 1)
 * 
 * Built‑in report type definition for general property/building condition reports.
 */

import { createReportTypeDefinition } from '../ReportTypeDefinition';

export const ConditionReport = createReportTypeDefinition(
	'condition',
	'Condition Report',
	'Detailed assessment of property condition, defects, and recommended repairs',
	[
		'property_details',
		'inspection_summary',
		'exterior_condition',
		'interior_condition',
		'roof_condition',
		'plumbing_condition',
		'electrical_condition',
		'heating_ventilation_ac',
		'structural_condition',
		'defects_list',
		'repair_priorities',
		'cost_estimates'
	],
	[
		'photographic_evidence',
		'floor_plans',
		'previous_inspection_reports',
		'warranty_documents',
		'tenant_feedback'
	],
	[
		'moisture_intrusion',
		'pest_infestation',
		'mold_growth',
		'asbestos_presence',
		'lead_paint'
	],
	[
		'Home Inspection Standards of Practice',
		'International Property Maintenance Code (IPMC)',
		'Local building codes'
	],
	[
		'Use consistent defect severity ratings (Critical, Major, Minor).',
		'Include clear photographic evidence for each defect.',
		'Provide repair cost estimates with sourcing references.',
		'Prioritize defects based on safety, function, and cost.'
	],
	[
		'Verify all defects are documented with location, severity, and photo.',
		'Cross‑reference defects with applicable building codes.',
		'Provide clear, actionable repair recommendations.',
		'Estimate costs using local contractor rates.',
		'Highlight any immediate safety concerns.'
	],
	'1.0.0'
);

export default ConditionReport;
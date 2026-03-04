/**
 * AMS Asset Management Report (Phase 1)
 * 
 * Built‑in report type definition for Asset Management System (AMS) reports.
 */

import { createReportTypeDefinition } from '../ReportTypeDefinition';

export const AMSReport = createReportTypeDefinition(
	'ams',
	'AMS Asset Management Report',
	'Comprehensive asset management report covering inventory, condition, and lifecycle',
	[
		'executive_summary',
		'asset_inventory',
		'condition_assessment',
		'remaining_useful_life',
		'replacement_cost',
		'maintenance_history',
		'risk_assessment',
		'prioritization_matrix',
		'funding_strategy',
		'action_plan'
	],
	[
		'photographic_documentation',
		'asset_tags_and_barcodes',
		'warranty_information',
		'supplier_contacts',
		'historical_performance_data'
	],
	[
		'critical_assets',
		'high_value_assets',
		'regulated_assets',
		'legacy_assets'
	],
	[
		'ISO 55000 Asset Management',
		'ISO 55001 Requirements',
		'ISO 55002 Guidelines',
		'GAAP Fixed Asset Accounting'
	],
	[
		'Ensure all assets are uniquely identified and tagged.',
		'Use standardized condition rating scales (e.g., 1‑5).',
		'Calculate remaining useful life using industry‑accepted depreciation models.',
		'Align risk assessment with organizational risk tolerance.'
	],
	[
		'Verify asset identification matches physical tags and records.',
		'Apply consistent condition scoring across all asset categories.',
		'Prioritize assets based on criticality, condition, and cost.',
		'Include lifecycle cost analysis for major replacement decisions.',
		'Ensure compliance with ISO 55000 series where applicable.'
	],
	'1.0.0'
);

export default AMSReport;
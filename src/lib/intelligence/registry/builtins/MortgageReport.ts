/**
 * Mortgage Report (Phase 1)
 * 
 * Built‑in report type definition for mortgage valuation and underwriting reports.
 */

import { createReportTypeDefinition } from '../ReportTypeDefinition';

export const MortgageReport = createReportTypeDefinition(
	'mortgage',
	'Mortgage Report',
	'Detailed property valuation and risk assessment for mortgage underwriting',
	[
		'property_details',
		'valuation_summary',
		'market_analysis',
		'comparable_sales',
		'property_condition',
		'zoning_and_land_use',
		'title_and_encumbrances',
		'environmental_risks',
		'flood_zone_analysis',
		'recommended_loan_amount',
		'risk_rating',
		'underwriter_notes'
	],
	[
		'photographic_evidence',
		'floor_plans',
		'appraisal_report',
		'survey_documents',
		'previous_valuation_reports'
	],
	[
		'high_risk_location',
		'unusual_property_type',
		'non‑standard_construction',
		'historical_listing',
		'commercial_mixed_use'
	],
	[
		'Uniform Standards of Professional Appraisal Practice (USPAP)',
		'Fannie Mae Selling Guide',
		'Freddie Mac Seller/Servicer Guide',
		'Interagency Appraisal Guidelines'
	],
	[
		'Use at least three comparable sales with adjustments.',
		'Document any material defects affecting value.',
		'Verify zoning compliance and permitted uses.',
		'Assess environmental and flood risks.'
	],
	[
		'Ensure valuation is supported by comparable sales data.',
		'Highlight any property defects that may affect loan security.',
		'Verify title is clear of material encumbrances.',
		'Provide a clear risk rating with justification.',
		'Include underwriter‑specific notes for decision‑making.'
	],
	'1.0.0'
);

export default MortgageReport;
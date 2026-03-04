/**
 * BS5837 Fire Safety Report (Phase 1)
 * 
 * Built‑in report type definition for BS5837 fire safety compliance reports.
 */

import { createReportTypeDefinition } from '../ReportTypeDefinition';

export const BS5837Report = createReportTypeDefinition(
	'bs5837',
	'BS5837 Fire Safety Report',
	'Comprehensive fire safety compliance report following BS5837 standards',
	[
		'executive_summary',
		'fire_risk_assessment',
		'fire_safety_measures',
		'emergency_lighting',
		'fire_alarm_system',
		'fire_door_inspection',
		'fire_extinguisher_audit',
		'evacuation_procedures',
		'compliance_checklist',
		'recommendations'
	],
	[
		'photographic_evidence',
		'floor_plans',
		'fire_safety_logbook',
		'staff_training_records',
		'previous_audit_reports'
	],
	[
		'high_risk_areas',
		'sprinkler_system',
		'fire_compartmentation',
		'means_of_escape'
	],
	[
		'fire_safety_order_2005',
		'regulatory_reform_fire_safety_order_2005',
		'building_regulations_part_b'
	],
	[
		'BS5837‑1:2017 Fire detection and alarm systems for buildings',
		'BS5837‑6:2019 Fire detection and fire alarm systems – Code of practice for the design, installation, commissioning and maintenance of systems in non‑domestic premises',
		'BS5266‑1:2016 Emergency lighting – Code of practice for the emergency lighting of premises'
	],
	[
		'Ensure all fire safety measures are documented with photographic evidence.',
		'Highlight any deviations from BS5837 standards with clear risk ratings.',
		'Provide actionable recommendations with priority levels (high/medium/low).',
		'Include references to relevant legislation and building regulations.',
		'Verify that emergency lighting meets minimum lux levels and duration requirements.'
	],
	'1.0.0'
);

export default BS5837Report;
/**
 * Safety Report (Phase 1)
 * 
 * Built‑in report type definition for workplace safety and hazard assessment reports.
 */

import { createReportTypeDefinition } from '../ReportTypeDefinition';

export const SafetyReport = createReportTypeDefinition(
	'safety',
	'Safety Report',
	'Comprehensive workplace safety inspection and hazard assessment report',
	[
		'executive_summary',
		'inspection_date_and_team',
		'hazard_identification',
		'risk_assessment',
		'immediate_actions_taken',
		'corrective_action_plan',
		'training_recommendations',
		'personal_protective_equipment',
		'emergency_procedures',
		'compliance_status',
		'follow_up_schedule'
	],
	[
		'photographic_evidence',
		'employee_interviews',
		'previous_incident_reports',
		'safety_data_sheets',
		'equipment_maintenance_logs'
	],
	[
		'chemical_hazards',
		'biological_hazards',
		'ergonomic_hazards',
		'electrical_hazards',
		'fire_hazards'
	],
	[
		'OSHA 29 CFR 1910',
		'Health and Safety at Work Act',
		'ISO 45001 Occupational Health and Safety',
		'NFPA Life Safety Code'
	],
	[
		'Use a standardized risk matrix (likelihood × severity).',
		'Document all hazards with location, description, and photo.',
		'Prioritize corrective actions based on risk level.',
		'Verify that emergency procedures are posted and understood.'
	],
	[
		'Ensure all identified hazards are rated using a consistent risk matrix.',
		'Provide clear, actionable corrective actions with responsible parties.',
		'Include references to relevant OSHA/ISO standards.',
		'Verify that PPE requirements are documented and available.',
		'Schedule follow‑up inspections to verify corrective actions.'
	],
	'1.0.0'
);

export default SafetyReport;
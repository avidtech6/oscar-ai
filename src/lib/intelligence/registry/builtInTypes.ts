/**
 * Built‑in report type definitions for the Report Type Registry
 */

import type { ReportTypeDefinition } from '../types';

/**
 * Returns an array of built‑in report type definitions
 */
export function getBuiltInTypes(): ReportTypeDefinition[] {
	return [
		{
			id: 'bs5837-2012-tree-survey',
			name: 'BS5837:2012 Tree Survey',
			description: 'Standard tree survey report following BS5837:2012 guidelines',
			requiredSections: [
				'Introduction',
				'Methodology',
				'Survey Results',
				'Tree Schedule',
				'Recommendations',
				'Conclusion'
			],
			optionalSections: [
				'Appendices',
				'References',
				'Glossary',
				'Photographs'
			],
			conditionalSections: [
				'Risk Assessment',
				'Cost Analysis',
				'Timeline'
			],
			dependencies: [],
			complianceRules: [
				'Must follow BS5837:2012 standards',
				'Must include tree schedule with species, dimensions, condition',
				'Must include recommendations for retention, removal, or protection'
			],
			aiGuidance: [
				'Use structured sections with clear headings',
				'Include visual aids where appropriate',
				'Ensure recommendations are actionable and justified'
			],
			version: '1.0.0',
			createdAt: new Date('2025-01-01'),
			updatedAt: new Date('2025-01-01')
		},
		{
			id: 'arboricultural-impact-assessment',
			name: 'Arboricultural Impact Assessment (AIA)',
			description: 'Assessment of potential impacts of development on trees',
			requiredSections: [
				'Introduction',
				'Site Description',
				'Tree Survey',
				'Impact Assessment',
				'Mitigation Measures',
				'Conclusion'
			],
			optionalSections: [
				'Appendices',
				'References',
				'Photographs',
				'Diagrams'
			],
			conditionalSections: [
				'Cost‑Benefit Analysis',
				'Legal Considerations'
			],
			dependencies: ['bs5837-2012-tree-survey'],
			complianceRules: [
				'Must assess all potential impacts',
				'Must propose mitigation measures',
				'Must follow local planning guidelines'
			],
			aiGuidance: [
				'Focus on clear cause‑effect relationships',
				'Use diagrams to illustrate impacts',
				'Ensure mitigation measures are practical'
			],
			version: '1.0.0',
			createdAt: new Date('2025-01-01'),
			updatedAt: new Date('2025-01-01')
		},
		{
			id: 'arboricultural-method-statement',
			name: 'Arboricultural Method Statement (AMS)',
			description: 'Detailed methodology for tree‑related works',
			requiredSections: [
				'Introduction',
				'Scope of Works',
				'Methodology',
				'Health and Safety',
				'Timeline',
				'Conclusion'
			],
			optionalSections: [
				'Appendices',
				'References',
				'Diagrams',
				'Checklists'
			],
			conditionalSections: [
				'Risk Assessment',
				'Equipment List'
			],
			dependencies: ['bs5837-2012-tree-survey'],
			complianceRules: [
				'Must detail all work steps',
				'Must include health and safety measures',
				'Must be site‑specific'
			],
			aiGuidance: [
				'Use step‑by‑step instructions',
				'Include safety precautions prominently',
				'Be precise and unambiguous'
			],
			version: '1.0.0',
			createdAt: new Date('2025-01-01'),
			updatedAt: new Date('2025-01-01')
		},
		{
			id: 'tree-condition-report',
			name: 'Tree Condition Report',
			description: 'Report on the health and structural condition of a tree',
			requiredSections: [
				'Introduction',
				'Tree Details',
				'Condition Assessment',
				'Findings',
				'Recommendations',
				'Conclusion'
			],
			optionalSections: [
				'Photographs',
				'Diagrams',
				'Appendices'
			],
			conditionalSections: [
				'Risk Rating',
				'Monitoring Schedule'
			],
			dependencies: [],
			complianceRules: [
				'Must include detailed condition assessment',
				'Must provide clear recommendations',
				'Must be evidence‑based'
			],
			aiGuidance: [
				'Use descriptive language for condition',
				'Include visual evidence where possible',
				'Prioritise recommendations by urgency'
			],
			version: '1.0.0',
			createdAt: new Date('2025-01-01'),
			updatedAt: new Date('2025-01-01')
		},
		{
			id: 'tree-safety-hazard-report',
			name: 'Tree Safety / Hazard Report',
			description: 'Report identifying tree‑related hazards and safety recommendations',
			requiredSections: [
				'Introduction',
				'Hazard Identification',
				'Risk Assessment',
				'Urgency Rating',
				'Recommendations',
				'Conclusion'
			],
			optionalSections: [
				'Photographs',
				'Diagrams',
				'Appendices'
			],
			conditionalSections: [
				'Legal Implications',
				'Monitoring Requirements'
			],
			dependencies: [],
			complianceRules: [
				'Must identify all hazards',
				'Must assess risk level',
				'Must provide urgency rating'
			],
			aiGuidance: [
				'Use clear hazard terminology',
				'Prioritise by risk level',
				'Include immediate action items'
			],
			version: '1.0.0',
			createdAt: new Date('2025-01-01'),
			updatedAt: new Date('2025-01-01')
		},
		{
			id: 'mortgage-insurance-report',
			name: 'Mortgage / Insurance Report',
			description: 'Report for mortgage or insurance purposes assessing tree‑related risks',
			requiredSections: [
				'Introduction',
				'Property Details',
				'Tree Assessment',
				'Risk Evaluation',
				'Recommendations',
				'Conclusion'
			],
			optionalSections: [
				'Photographs',
				'Diagrams',
				'Appendices'
			],
			conditionalSections: [
				'Insurance Implications',
				'Valuation Impact'
			],
			dependencies: [],
			complianceRules: [
				'Must be suitable for financial institutions',
				'Must include risk evaluation',
				'Must be objective and unbiased'
			],
			aiGuidance: [
				'Use formal, objective language',
				'Focus on financial implications',
				'Provide clear yes/no recommendations'
			],
			version: '1.0.0',
			createdAt: new Date('2025-01-01'),
			updatedAt: new Date('2025-01-01')
		},
		{
			id: 'custom-user-defined-report',
			name: 'Custom / User‑Defined Report',
			description: 'User‑defined report type with custom sections',
			requiredSections: [
				'Introduction',
				'Findings',
				'Conclusion'
			],
			optionalSections: [],
			conditionalSections: [],
			dependencies: [],
			complianceRules: [
				'Must meet user‑defined requirements',
				'Must be clearly structured'
			],
			aiGuidance: [
				'Adapt to user requirements',
				'Maintain clear structure',
				'Provide flexibility while ensuring clarity'
			],
			version: '1.0.0',
			createdAt: new Date('2025-01-01'),
			updatedAt: new Date('2025-01-01')
		}
	];
}
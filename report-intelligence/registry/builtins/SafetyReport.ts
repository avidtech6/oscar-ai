/**
 * Tree Safety / Hazard Report Type Definition
 * 
 * Built-in report type for tree safety inspections and hazard assessments.
 */

import type { ReportTypeDefinition } from '../ReportTypeDefinition';

export const SafetyReportDefinition: ReportTypeDefinition = {
  // Core identification
  id: 'tree-safety-report',
  name: 'Tree Safety / Hazard Report',
  description: 'Focused assessment of tree safety hazards, risk to people/property, and urgent works requirements.',
  category: 'safety',
  
  // Versioning
  version: '1.0.0',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  
  // Section definitions
  requiredSections: [
    {
      id: 'title-page',
      name: 'Title Page',
      description: 'Report title, site details, inspection date, and inspector information',
      required: true,
      aiGuidance: 'Include site address, inspection date, inspector details, and report purpose.'
    },
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'Summary of urgent hazards, risk ratings, and immediate actions required',
      required: true,
      aiGuidance: 'Highlight urgent hazards, high-risk trees, and immediate actions required.'
    },
    {
      id: 'inspection-scope',
      name: 'Inspection Scope',
      description: 'Scope of inspection, methodology, and limitations',
      required: true,
      aiGuidance: 'Define inspection scope, methodology used, weather conditions, and limitations.'
    },
    {
      id: 'hazard-identification',
      name: 'Hazard Identification',
      description: 'Identification and description of tree hazards and defects',
      required: true,
      aiGuidance: 'Systematically identify hazards: deadwood, cracks, decay, leaning, root issues.'
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment',
      description: 'Assessment of risk posed by identified hazards',
      required: true,
      aiGuidance: 'Assess risk: likelihood of failure, potential impact, target vulnerability, risk rating.'
    },
    {
      id: 'urgent-actions',
      name: 'Urgent Actions',
      description: 'Immediate actions required to mitigate high-risk hazards',
      required: true,
      aiGuidance: 'Specify urgent actions: removal, pruning, fencing, monitoring with clear timelines.'
    },
    {
      id: 'monitoring-recommendations',
      name: 'Monitoring Recommendations',
      description: 'Recommendations for ongoing monitoring and reassessment',
      required: true,
      aiGuidance: 'Recommend monitoring frequency, parameters, and reporting for medium/low risk issues.'
    }
  ],
  
  optionalSections: [
    {
      id: 'site-plan',
      name: 'Site Plan',
      description: 'Plan showing tree locations and hazard zones',
      required: false,
      aiGuidance: 'Provide site plan with tree locations, hazard zones, and target areas.'
    },
    {
      id: 'photographic-evidence',
      name: 'Photographic Evidence',
      description: 'Photographs documenting hazards and defects',
      required: false,
      aiGuidance: 'Include clear photographs of hazards, defects, and context.'
    },
    {
      id: 'legal-responsibilities',
      name: 'Legal Responsibilities',
      description: 'Discussion of legal duties regarding tree safety',
      required: false,
      aiGuidance: 'Discuss legal duties: Occupiers Liability Act, common law duty of care.'
    }
  ],
  
  conditionalSections: [],
  
  // Dependencies and relationships
  dependencies: [
    {
      type: 'data',
      id: 'tree-inventory',
      name: 'Tree Inventory',
      description: 'List of trees to be inspected',
      required: true
    }
  ],
  
  relatedReportTypes: ['tree-condition-report'],
  
  // Compliance and standards
  complianceRules: [
    {
      id: 'risk-prioritization',
      name: 'Risk Prioritization',
      description: 'Must prioritize recommendations by risk level',
      standard: 'Best Practice',
      rule: 'Recommendations must be prioritized: urgent (within 24 hours), high priority (within 7 days), routine',
      severity: 'critical'
    },
    {
      id: 'hazard-documentation',
      name: 'Hazard Documentation',
      description: 'All hazards must be clearly documented and located',
      standard: 'Best Practice',
      rule: 'Each hazard must be described, located (height/direction), and measured where possible',
      severity: 'critical'
    }
  ],
  
  standards: ['Best Practice', 'Arboricultural Association Guidelines'],
  
  // AI integration
  aiGuidance: [
    {
      id: 'hazard-identification-guidance',
      purpose: 'generation',
      guidance: 'Identify hazards systematically: crown, stem, roots. Use clear, specific descriptions.',
      examples: [
        'Crown hazard: "Large dead branch (approx. 30cm diameter) in upper crown overhanging footpath."',
        'Stem hazard: "Significant crack extending 2m up stem on south side, approximately 40% of circumference."'
      ]
    }
  ],
  
  generationPrompt: 'Generate a Tree Safety Report based on hazard inspection data. Identify hazards, assess risks, and prioritize urgent actions.',
  validationPrompt: 'Validate this Tree Safety Report for completeness. Check for hazard identification, risk assessment, and prioritized recommendations.',
  
  // Metadata
  tags: ['safety', 'hazard', 'inspection', 'risk', 'urgent'],
  estimatedGenerationTime: 30, // 30 minutes
  complexity: 'medium',
  typicalAudience: ['property-managers', 'local-authorities', 'schools', 'parks', 'insurance'],
  
  // Template references
  defaultTemplateId: 'safety-standard',
  
  // Output configuration
  supportedFormats: ['pdf', 'docx'],
  defaultFormat: 'pdf',
  
  // Integration hooks
  preGenerationHooks: ['validate-tree-data'],
  postGenerationHooks: ['validate-risk-assessment'],
  validationHooks: ['check-hazard-documentation', 'verify-risk-prioritization']
};
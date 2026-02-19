/**
 * Tree Condition Report Type Definition
 * 
 * Built-in report type for assessing tree health, structure, and safety.
 */

import type { ReportTypeDefinition } from '../ReportTypeDefinition';

export const ConditionReportDefinition: ReportTypeDefinition = {
  // Core identification
  id: 'tree-condition-report',
  name: 'Tree Condition Report',
  description: 'Assessment of tree health, structural condition, and safety, with recommendations for management or works.',
  category: 'condition',
  
  // Versioning
  version: '1.0.0',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  
  // Section definitions
  requiredSections: [
    {
      id: 'title-page',
      name: 'Title Page',
      description: 'Report title, client details, tree location, assessment date, and author information',
      required: true,
      aiGuidance: 'Include tree location, client details, assessment date, and assessor credentials.'
    },
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'Summary of key findings, risk level, and primary recommendations',
      required: true,
      aiGuidance: 'Highlight key defects, risk rating, and urgent recommendations.'
    },
    {
      id: 'tree-description',
      name: 'Tree Description',
      description: 'Detailed description of the tree including species, dimensions, and location',
      required: true,
      aiGuidance: 'Describe tree species, dimensions (DBH, height, spread), age class, and precise location.'
    },
    {
      id: 'condition-assessment',
      name: 'Condition Assessment',
      description: 'Detailed assessment of tree health, structure, and defects',
      required: true,
      aiGuidance: 'Assess crown condition, foliage health, stem defects, root issues, and signs of disease/pests.'
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment',
      description: 'Assessment of tree-related risks to people, property, and targets',
      required: true,
      aiGuidance: 'Assess likelihood of failure, size of part likely to fail, target presence, and risk rating.'
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      description: 'Specific recommendations for tree works, monitoring, or management',
      required: true,
      aiGuidance: 'Provide clear recommendations: works required, urgency, monitoring regime, further investigations.'
    },
    {
      id: 'conclusions',
      name: 'Conclusions',
      description: 'Overall conclusions on tree condition and required actions',
      required: true,
      aiGuidance: 'Summarize condition, risk level, and priority of required actions.'
    }
  ],
  
  optionalSections: [
    {
      id: 'photographic-record',
      name: 'Photographic Record',
      description: 'Photographs documenting tree condition and defects',
      required: false,
      aiGuidance: 'Include clear photographs of defects, overall tree, and context.'
    },
    {
      id: 'monitoring-schedule',
      name: 'Monitoring Schedule',
      description: 'Schedule for future monitoring and reassessment',
      required: false,
      aiGuidance: 'Propose monitoring frequency, parameters to monitor, and reporting requirements.'
    },
    {
      id: 'species-information',
      name: 'Species Information',
      description: 'Information about tree species characteristics and typical issues',
      required: false,
      aiGuidance: 'Provide species-specific information: typical lifespan, common defects, management considerations.'
    }
  ],
  
  conditionalSections: [
    {
      id: 'detailed-investigations',
      name: 'Detailed Investigations',
      description: 'Results of detailed investigations (resistograph, tomography, etc.)',
      required: false,
      conditionalLogic: {
        dependsOn: 'condition-assessment',
        condition: 'contains',
        value: 'investigation'
      },
      aiGuidance: 'Present results of detailed investigations, interpretation, and implications.'
    },
    {
      id: 'legal-context',
      name: 'Legal Context',
      description: 'Discussion of legal considerations (TPOs, Conservation Areas, etc.)',
      required: false,
      conditionalLogic: {
        dependsOn: 'tree-description',
        condition: 'contains',
        value: 'TPO'
      },
      aiGuidance: 'Discuss Tree Preservation Orders, Conservation Area status, and legal requirements.'
    }
  ],
  
  // Dependencies and relationships
  dependencies: [
    {
      type: 'data',
      id: 'tree-measurements',
      name: 'Tree Measurements',
      description: 'Basic tree measurements and observations',
      required: true
    }
  ],
  
  relatedReportTypes: ['tree-safety-report', 'bs5837-2012'],
  
  // Compliance and standards
  complianceRules: [
    {
      id: 'risk-assessment-method',
      name: 'Risk Assessment Method',
      description: 'Must use recognized risk assessment methodology',
      standard: 'Best Practice',
      rule: 'Risk assessment must follow recognized methodology (e.g., Quantified Tree Risk Assessment)',
      severity: 'critical'
    },
    {
      id: 'defect-documentation',
      name: 'Defect Documentation',
      description: 'All significant defects must be documented and photographed',
      standard: 'Best Practice',
      rule: 'All significant defects must be described, measured, and photographed where possible',
      severity: 'critical'
    },
    {
      id: 'recommendation-clarity',
      name: 'Recommendation Clarity',
      description: 'Recommendations must be clear, specific, and prioritized',
      standard: 'Best Practice',
      rule: 'Recommendations must specify: works required, urgency, and justification',
      severity: 'critical'
    }
  ],
  
  standards: ['Best Practice', 'Arboricultural Association Guidelines', 'QTRA Methodology'],
  
  // AI integration
  aiGuidance: [
    {
      id: 'condition-assessment-guidance',
      purpose: 'generation',
      guidance: 'Assess condition systematically: crown, stem, roots. Use standardized terminology. Quantify where possible.',
      examples: [
        'Crown: "Crown density reduced by approximately 30%, dieback present in upper crown."',
        'Stem: "Significant cavity at 2m height, approximately 40% of stem circumference affected."',
        'Roots: "Soil heaving evident on north side, suggesting root plate movement."'
      ]
    },
    {
      id: 'risk-assessment-guidance',
      purpose: 'generation',
      guidance: 'Assess risk using likelihood × consequence framework. Consider targets, defect severity, tree size.',
      examples: [
        'High risk: "Large limb with significant decay overhanging public footpath."',
        'Medium risk: "Moderate decay in stem with no immediate targets."',
        'Low risk: "Minor defects with no targets within falling distance."'
      ]
    }
  ],
  
  generationPrompt: 'Generate a Tree Condition Report based on the provided tree assessment data. Assess condition, evaluate risks, and provide clear recommendations.',
  validationPrompt: 'Validate this Tree Condition Report for completeness and accuracy. Check for thorough condition assessment, proper risk evaluation, and clear recommendations.',
  
  // Metadata
  tags: ['condition', 'safety', 'inspection', 'risk-assessment', 'tree-health'],
  estimatedGenerationTime: 45, // 45 minutes
  complexity: 'medium',
  typicalAudience: ['property-owners', 'managers', 'arboriculturists', 'insurers', 'local-authorities'],
  
  // Template references
  defaultTemplateId: 'condition-standard',
  
  // Output configuration
  supportedFormats: ['pdf', 'docx'],
  defaultFormat: 'pdf',
  
  // Integration hooks
  preGenerationHooks: ['validate-tree-data', 'assess-risks'],
  postGenerationHooks: ['validate-recommendations', 'generate-risk-summary'],
  validationHooks: ['check-condition-assessment', 'verify-risk-rating']
};
/**
 * Mortgage / Insurance Report Type Definition
 * 
 * Built-in report type for property transactions and insurance assessments.
 */

import type { ReportTypeDefinition } from '../ReportTypeDefinition';

export const MortgageReportDefinition: ReportTypeDefinition = {
  // Core identification
  id: 'mortgage-insurance-report',
  name: 'Mortgage / Insurance Report',
  description: 'Assessment of trees in relation to property for mortgage lending or insurance purposes.',
  category: 'insurance',
  
  // Versioning
  version: '1.0.0',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  
  // Section definitions
  requiredSections: [
    {
      id: 'title-page',
      name: 'Title Page',
      description: 'Report title, property address, inspection date, and inspector information',
      required: true,
      aiGuidance: 'Include property address, inspection date, client details, and inspector credentials.'
    },
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'Summary of key findings, significant risks, and implications for property',
      required: true,
      aiGuidance: 'Highlight significant tree-related risks to property, any urgent issues, and overall assessment.'
    },
    {
      id: 'property-description',
      name: 'Property Description',
      description: 'Description of property, location, and relationship to trees',
      required: true,
      aiGuidance: 'Describe property type, construction, location relative to trees, and relevant features.'
    },
    {
      id: 'tree-assessment',
      name: 'Tree Assessment',
      description: 'Assessment of trees affecting or potentially affecting the property',
      required: true,
      aiGuidance: 'Assess trees within influencing distance: species, size, condition, distance to property.'
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment',
      description: 'Assessment of risks posed by trees to property',
      required: true,
      aiGuidance: 'Assess risks: subsidence, direct damage, blocking of light, obstruction, nuisance.'
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      description: 'Recommendations for tree management, monitoring, or further investigation',
      required: true,
      aiGuidance: 'Provide clear recommendations: monitoring, works, further investigations, insurance implications.'
    },
    {
      id: 'conclusions',
      name: 'Conclusions',
      description: 'Overall conclusions on tree-related risks to property',
      required: true,
      aiGuidance: 'Summarize risk level, implications for property transaction/insurance, and key considerations.'
    }
  ],
  
  optionalSections: [
    {
      id: 'insurance-implications',
      name: 'Insurance Implications',
      description: 'Discussion of implications for property insurance',
      required: false,
      aiGuidance: 'Discuss insurance implications: premium loading, exclusions, disclosure requirements.'
    },
    {
      id: 'legal-considerations',
      name: 'Legal Considerations',
      description: 'Discussion of legal considerations (TPOs, nuisance, etc.)',
      required: false,
      aiGuidance: 'Discuss legal considerations: Tree Preservation Orders, nuisance, rights to light, overhanging branches.'
    },
    {
      id: 'photographic-record',
      name: 'Photographic Record',
      description: 'Photographs documenting trees and relationship to property',
      required: false,
      aiGuidance: 'Include photographs showing trees, property, and relationship between them.'
    }
  ],
  
  conditionalSections: [
    {
      id: 'subsidence-assessment',
      name: 'Subsidence Assessment',
      description: 'Detailed assessment of subsidence risk from trees',
      required: false,
      conditionalLogic: {
        dependsOn: 'risk-assessment',
        condition: 'contains',
        value: 'subsidence'
      },
      aiGuidance: 'Assess subsidence risk: soil type, tree species, distance, property construction, evidence of movement.'
    }
  ],
  
  // Dependencies and relationships
  dependencies: [
    {
      type: 'data',
      id: 'property-details',
      name: 'Property Details',
      description: 'Property information and location',
      required: true
    }
  ],
  
  relatedReportTypes: ['tree-condition-report'],
  
  // Compliance and standards
  complianceRules: [
    {
      id: 'distance-assessment',
      name: 'Distance Assessment',
      description: 'Must assess distance from trees to property',
      standard: 'Industry Standard',
      rule: 'Must specify distance from each significant tree to nearest part of property',
      severity: 'critical'
    },
    {
      id: 'species-identification',
      name: 'Species Identification',
      description: 'Must identify tree species for risk assessment',
      standard: 'Industry Standard',
      rule: 'Must identify species of trees within influencing distance of property',
      severity: 'critical'
    }
  ],
  
  standards: ['Industry Standard', 'RICS Guidelines'],
  
  // AI integration
  aiGuidance: [
    {
      id: 'risk-assessment-guidance',
      purpose: 'generation',
      guidance: 'Assess risks specific to property: subsidence (clay soils), direct damage (falling), nuisance (leaves/blocked light).',
      examples: [
        'Subsidence risk: "Large poplar within 15m of property on clay soil presents moderate subsidence risk."',
        'Direct damage: "Large limb overhanging roof presents risk of damage during storms."'
      ]
    }
  ],
  
  generationPrompt: 'Generate a Mortgage/Insurance Report based on property and tree assessment data. Assess tree-related risks to property and provide clear recommendations.',
  validationPrompt: 'Validate this Mortgage/Insurance Report for completeness. Check for property description, tree assessment, risk evaluation, and clear recommendations.',
  
  // Metadata
  tags: ['mortgage', 'insurance', 'property', 'risk-assessment', 'subsidence'],
  estimatedGenerationTime: 60, // 1 hour
  complexity: 'medium',
  typicalAudience: ['homeowners', 'buyers', 'sellers', 'surveyors', 'insurers', 'lenders'],
  
  // Template references
  defaultTemplateId: 'mortgage-standard',
  
  // Output configuration
  supportedFormats: ['pdf', 'docx'],
  defaultFormat: 'pdf',
  
  // Integration hooks
  preGenerationHooks: ['validate-property-data', 'assess-tree-distances'],
  postGenerationHooks: ['validate-risk-assessment', 'generate-implications'],
  validationHooks: ['check-distance-assessment', 'verify-species-identification']
};
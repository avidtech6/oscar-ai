/**
 * BS5837:2012 Tree Survey Report Type Definition
 * 
 * Built-in report type for BS5837:2012 compliant tree surveys.
 */

import type { ReportTypeDefinition } from '../ReportTypeDefinition';

export const BS5837ReportDefinition: ReportTypeDefinition = {
  // Core identification
  id: 'bs5837-2012',
  name: 'BS5837:2012 Tree Survey',
  description: 'Comprehensive tree survey report compliant with BS5837:2012 standards for trees in relation to design, demolition, and construction.',
  category: 'survey',
  
  // Versioning
  version: '1.0.0',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  
  // Section definitions
  requiredSections: [
    {
      id: 'title-page',
      name: 'Title Page',
      description: 'Report title, client details, site address, survey date, and author information',
      required: true,
      aiGuidance: 'Include client name, site address, survey date, report author, and company details. Format professionally with logo if available.'
    },
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'Brief overview of survey findings, key recommendations, and critical issues',
      required: true,
      aiGuidance: 'Summarize key findings, highlight critical trees, mention any Category A trees, and provide top-level recommendations.'
    },
    {
      id: 'introduction',
      name: 'Introduction',
      description: 'Background, purpose, scope, and limitations of the survey',
      required: true,
      aiGuidance: 'Explain the purpose of the survey, reference planning application if applicable, describe scope and limitations.'
    },
    {
      id: 'methodology',
      name: 'Methodology',
      description: 'Survey methods, equipment used, standards followed, and data collection approach',
      required: true,
      aiGuidance: 'Describe survey methodology, reference BS5837:2012, mention equipment used, survey dates, weather conditions.'
    },
    {
      id: 'site-description',
      name: 'Site Description',
      description: 'Physical characteristics of the site, location, topography, and existing features',
      required: true,
      aiGuidance: 'Describe site location, topography, soil conditions, existing structures, and overall site context.'
    },
    {
      id: 'tree-data',
      name: 'Tree Data',
      description: 'Individual tree records including species, dimensions, condition, and category',
      required: true,
      aiGuidance: 'Present tree data in table format with columns: Tree Ref, Species, DBH, Height, Age, Condition, Category, RPA, Recommendations.'
    },
    {
      id: 'category-assessment',
      name: 'Category Assessment',
      description: 'Detailed assessment of tree categories (A, B, C, U) with justifications',
      required: true,
      aiGuidance: 'Explain category assessment criteria, justify each tree category assignment, reference BS5837:2012 tables.'
    },
    {
      id: 'rpa-calculations',
      name: 'Root Protection Area Calculations',
      description: 'Calculated Root Protection Areas for each tree based on BS5837:2012 formula',
      required: true,
      aiGuidance: 'Calculate RPA using formula: 12 × DBH (in meters). Present calculations clearly. Highlight trees with constrained RPAs.'
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      description: 'Specific recommendations for tree retention, removal, protection, and management',
      required: true,
      aiGuidance: 'Provide clear, actionable recommendations. Separate into: Retention recommendations, Protection measures, Removal justifications, Monitoring requirements.'
    },
    {
      id: 'conclusions',
      name: 'Conclusions',
      description: 'Overall conclusions summarizing the survey findings',
      required: true,
      aiGuidance: 'Summarize key conclusions, reiterate critical findings, align with executive summary.'
    }
  ],
  
  optionalSections: [
    {
      id: 'appendices',
      name: 'Appendices',
      description: 'Additional supporting information, photographs, maps, or technical data',
      required: false,
      aiGuidance: 'Include photographs, detailed maps, species lists, technical references, or additional data as needed.'
    },
    {
      id: 'photographs',
      name: 'Photographic Record',
      description: 'Photographs of individual trees and site conditions',
      required: false,
      aiGuidance: 'Include clear photographs of each tree referenced in the report. Label with tree reference numbers.'
    },
    {
      id: 'maps-plans',
      name: 'Maps and Plans',
      description: 'Site plans showing tree locations, RPAs, and proposed works',
      required: false,
      aiGuidance: 'Provide clear maps showing tree locations, Root Protection Areas, and relationship to proposed development.'
    },
    {
      id: 'glossary',
      name: 'Glossary',
      description: 'Definitions of technical terms and abbreviations',
      required: false,
      aiGuidance: 'Define technical terms: DBH, RPA, BS5837, Category A/B/C/U, etc.'
    }
  ],
  
  conditionalSections: [
    {
      id: 'constraints-assessment',
      name: 'Constraints Assessment',
      description: 'Assessment of tree-related constraints on proposed development',
      required: false,
      conditionalLogic: {
        dependsOn: 'tree-data',
        condition: 'present'
      },
      aiGuidance: 'Analyze how trees constrain development options. Consider root spread, canopy spread, visibility, and access.'
    },
    {
      id: 'planning-context',
      name: 'Planning Context',
      description: 'Discussion of planning policy context and implications',
      required: false,
      conditionalLogic: {
        dependsOn: 'introduction',
        condition: 'contains',
        value: 'planning'
      },
      aiGuidance: 'Discuss relevant planning policies, Tree Preservation Orders, Conservation Areas, and planning implications.'
    }
  ],
  
  // Dependencies and relationships
  dependencies: [
    {
      type: 'data',
      id: 'tree-inventory',
      name: 'Tree Inventory Data',
      description: 'Complete tree inventory with species, dimensions, and condition assessments',
      required: true
    },
    {
      type: 'calculation',
      id: 'rpa-calculator',
      name: 'RPA Calculator',
      description: 'Tool for calculating Root Protection Areas according to BS5837:2012',
      required: true
    },
    {
      type: 'template',
      id: 'bs5837-template',
      name: 'BS5837 Template',
      description: 'Standard template for BS5837:2012 reports',
      required: false
    }
  ],
  
  relatedReportTypes: ['arb-impact-assessment', 'arb-method-statement'],
  
  // Compliance and standards
  complianceRules: [
    {
      id: 'bs5837-category-system',
      name: 'BS5837 Category System',
      description: 'Trees must be categorized as A, B, C, or U according to BS5837:2012 Table 1',
      standard: 'BS5837:2012',
      rule: 'All trees must be assigned a category (A, B, C, or U) based on their quality and value',
      severity: 'critical'
    },
    {
      id: 'rpa-calculation',
      name: 'RPA Calculation',
      description: 'Root Protection Area must be calculated as 12 × DBH (in meters)',
      standard: 'BS5837:2012',
      rule: 'RPA = 12 × DBH (where DBH is in meters)',
      severity: 'critical'
    },
    {
      id: 'tree-data-requirements',
      name: 'Tree Data Requirements',
      description: 'Minimum tree data must include species, DBH, height, condition, and category',
      standard: 'BS5837:2012',
      rule: 'Each tree record must include at minimum: reference number, species, DBH, condition assessment, and category',
      severity: 'critical'
    },
    {
      id: 'recommendations-required',
      name: 'Recommendations Required',
      description: 'Report must include specific recommendations for each tree',
      standard: 'BS5837:2012',
      rule: 'Clear recommendations must be provided for retention, protection, removal, or management of each tree',
      severity: 'critical'
    }
  ],
  
  standards: ['BS5837:2012', 'Arboricultural Association Guidelines'],
  
  // AI integration
  aiGuidance: [
    {
      id: 'category-determination',
      purpose: 'generation',
      guidance: 'Use BS5837:2012 Table 1 to determine tree categories. Consider: amenity value, life expectancy, condition, size, form, and rarity.',
      examples: [
        'Category A: High quality trees with >40 years safe useful life expectancy',
        'Category B: Moderate quality trees with 20-40 years safe useful life expectancy',
        'Category C: Low quality trees with 10-20 years safe useful life expectancy',
        'Category U: Trees unsuitable for retention'
      ]
    },
    {
      id: 'rpa-calculation-guidance',
      purpose: 'generation',
      guidance: 'Calculate RPA as 12 × DBH (in meters). Convert DBH from cm to meters first if needed. Round to nearest 0.1m.',
      examples: ['DBH 50cm = 0.5m, RPA = 12 × 0.5 = 6.0m radius']
    },
    {
      id: 'recommendation-language',
      purpose: 'generation',
      guidance: 'Use clear, actionable language for recommendations. Avoid ambiguity. Reference specific trees by reference number.',
      examples: [
        'Retain: "Tree T1 should be retained and protected with a 6.0m RPA during construction."',
        'Remove: "Tree T5 is recommended for removal due to poor condition (Category U)."'
      ]
    }
  ],
  
  generationPrompt: 'Generate a BS5837:2012 compliant tree survey report based on the provided tree data. Include all required sections, calculate RPAs, assign appropriate categories, and provide clear recommendations.',
  validationPrompt: 'Validate this BS5837:2012 report for compliance with the standard. Check for missing required sections, incorrect RPA calculations, inconsistent category assignments, and unclear recommendations.',
  
  // Metadata
  tags: ['bs5837', 'tree-survey', 'planning', 'construction', 'arboriculture', 'compliance'],
  estimatedGenerationTime: 120, // 2 hours
  complexity: 'complex',
  typicalAudience: ['planners', 'developers', 'arboriculturists', 'local-authorities', 'clients'],
  
  // Template references
  defaultTemplateId: 'bs5837-standard',
  templateVariants: [
    {
      id: 'bs5837-basic',
      name: 'Basic BS5837 Report',
      description: 'Simplified version for small sites with few trees',
      templateRef: 'templates/bs5837-basic.html'
    },
    {
      id: 'bs5837-detailed',
      name: 'Detailed BS5837 Report',
      description: 'Comprehensive version for complex sites with many trees',
      templateRef: 'templates/bs5837-detailed.html'
    }
  ],
  
  // Output configuration
  supportedFormats: ['pdf', 'html', 'docx'],
  defaultFormat: 'pdf',
  
  // Integration hooks
  preGenerationHooks: ['validate-tree-data', 'calculate-rpas', 'assign-categories'],
  postGenerationHooks: ['validate-compliance', 'generate-summary'],
  validationHooks: ['check-required-sections', 'verify-rpa-calculations', 'validate-categories']
};
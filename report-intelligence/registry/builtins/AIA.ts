/**
 * Arboricultural Impact Assessment (AIA) Report Type Definition
 * 
 * Built-in report type for assessing the impact of development on trees.
 */

import type { ReportTypeDefinition } from '../ReportTypeDefinition';

export const AIAReportDefinition: ReportTypeDefinition = {
  // Core identification
  id: 'arb-impact-assessment',
  name: 'Arboricultural Impact Assessment (AIA)',
  description: 'Assessment of potential impacts of proposed development on existing trees, with mitigation measures and recommendations.',
  category: 'assessment',
  
  // Versioning
  version: '1.0.0',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  
  // Section definitions
  requiredSections: [
    {
      id: 'title-page',
      name: 'Title Page',
      description: 'Report title, client details, site address, assessment date, and author information',
      required: true,
      aiGuidance: 'Include project name, client details, site address, assessment date, and author credentials.'
    },
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'Summary of key findings, significant impacts, and primary recommendations',
      required: true,
      aiGuidance: 'Highlight major impacts, critical trees affected, and key mitigation measures.'
    },
    {
      id: 'introduction',
      name: 'Introduction',
      description: 'Background, purpose, scope, and methodology of the impact assessment',
      required: true,
      aiGuidance: 'Explain the purpose of the assessment, reference the development proposal, and describe assessment methodology.'
    },
    {
      id: 'site-context',
      name: 'Site Context',
      description: 'Description of the site, existing trees, and proposed development',
      required: true,
      aiGuidance: 'Describe site characteristics, existing tree stock, and proposed development layout.'
    },
    {
      id: 'impact-analysis',
      name: 'Impact Analysis',
      description: 'Detailed analysis of potential impacts on individual trees and groups',
      required: true,
      aiGuidance: 'Analyze direct and indirect impacts: root damage, canopy loss, soil compaction, changes to hydrology, construction access.'
    },
    {
      id: 'mitigation-measures',
      name: 'Mitigation Measures',
      description: 'Proposed measures to avoid, minimize, or compensate for impacts',
      required: true,
      aiGuidance: 'Propose specific mitigation measures: tree protection fencing, no-dig construction methods, root bridging, compensatory planting.'
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      description: 'Specific recommendations for tree protection, retention, and management',
      required: true,
      aiGuidance: 'Provide clear, actionable recommendations for each affected tree or tree group.'
    },
    {
      id: 'conclusions',
      name: 'Conclusions',
      description: 'Overall conclusions on the acceptability of impacts and effectiveness of mitigation',
      required: true,
      aiGuidance: 'Summarize whether impacts are acceptable given proposed mitigation, and any residual impacts.'
    }
  ],
  
  optionalSections: [
    {
      id: 'appendices',
      name: 'Appendices',
      description: 'Supporting information, calculations, photographs, and technical data',
      required: false,
      aiGuidance: 'Include detailed calculations, photographs, species lists, or technical references.'
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment',
      description: 'Formal risk assessment of tree-related risks during construction',
      required: false,
      aiGuidance: 'Assess risks: tree failure, root damage, soil contamination, construction damage.'
    },
    {
      id: 'monitoring-plan',
      name: 'Monitoring Plan',
      description: 'Plan for monitoring tree health during and after construction',
      required: false,
      aiGuidance: 'Propose monitoring schedule, parameters to monitor, and response protocols.'
    }
  ],
  
  conditionalSections: [
    {
      id: 'planning-policy',
      name: 'Planning Policy Context',
      description: 'Discussion of relevant planning policies and requirements',
      required: false,
      conditionalLogic: {
        dependsOn: 'introduction',
        condition: 'contains',
        value: 'planning'
      },
      aiGuidance: 'Discuss local planning policies, Tree Preservation Orders, Conservation Area regulations.'
    },
    {
      id: 'cost-implications',
      name: 'Cost Implications',
      description: 'Estimated costs of mitigation measures and tree works',
      required: false,
      conditionalLogic: {
        dependsOn: 'mitigation-measures',
        condition: 'present'
      },
      aiGuidance: 'Provide cost estimates for proposed mitigation measures and tree works.'
    }
  ],
  
  // Dependencies and relationships
  dependencies: [
    {
      type: 'data',
      id: 'tree-survey-data',
      name: 'Tree Survey Data',
      description: 'Existing tree survey data (preferably BS5837 compliant)',
      required: true
    },
    {
      type: 'data',
      id: 'development-plans',
      name: 'Development Plans',
      description: 'Proposed development plans and drawings',
      required: true
    }
  ],
  
  relatedReportTypes: ['bs5837-2012', 'arb-method-statement'],
  
  // Compliance and standards
  complianceRules: [
    {
      id: 'impact-assessment',
      name: 'Impact Assessment Requirement',
      description: 'Must assess both direct and indirect impacts on trees',
      standard: 'BS5837:2012',
      rule: 'Assessment must consider direct impacts (physical damage) and indirect impacts (changes to growing conditions)',
      severity: 'critical'
    },
    {
      id: 'mitigation-hierarchy',
      name: 'Mitigation Hierarchy',
      description: 'Must follow mitigation hierarchy: avoid, minimize, compensate',
      standard: 'Best Practice',
      rule: 'Mitigation measures must follow hierarchy: first avoid impacts, then minimize, finally compensate',
      severity: 'critical'
    },
    {
      id: 'tree-protection',
      name: 'Tree Protection Measures',
      description: 'Must specify tree protection measures for retained trees',
      standard: 'BS5837:2012',
      rule: 'Must specify physical protection measures (fencing, ground protection) for all retained trees',
      severity: 'critical'
    }
  ],
  
  standards: ['BS5837:2012', 'Arboricultural Association Guidelines', 'Best Practice'],
  
  // AI integration
  aiGuidance: [
    {
      id: 'impact-analysis-guidance',
      purpose: 'generation',
      guidance: 'Analyze impacts systematically: consider construction phases, access routes, material storage, drainage changes. Quantify impacts where possible.',
      examples: [
        'Direct impact: "Excavation within 3m of Tree T1 will sever approximately 40% of root system."',
        'Indirect impact: "Soil compaction from construction traffic will reduce soil porosity by 30-50% within 5m of Tree T3."'
      ]
    },
    {
      id: 'mitigation-guidance',
      purpose: 'generation',
      guidance: 'Propose specific, measurable mitigation measures. Reference industry standards and best practices.',
      examples: [
        'Avoidance: "Relocate access route 2m further from Tree T2 to avoid root protection area."',
        'Minimization: "Use no-dig construction methods within 5m of all retained trees."',
        'Compensation: "Plant 3 semi-mature replacement trees for each Category A tree removed."'
      ]
    }
  ],
  
  generationPrompt: 'Generate an Arboricultural Impact Assessment based on the provided tree survey data and development plans. Analyze impacts, propose mitigation measures, and provide clear recommendations.',
  validationPrompt: 'Validate this Arboricultural Impact Assessment for completeness and compliance with best practices. Check for thorough impact analysis, appropriate mitigation measures, and clear recommendations.',
  
  // Metadata
  tags: ['impact-assessment', 'development', 'mitigation', 'tree-protection', 'planning'],
  estimatedGenerationTime: 90, // 1.5 hours
  complexity: 'complex',
  typicalAudience: ['developers', 'planners', 'arboriculturists', 'contractors', 'local-authorities'],
  
  // Template references
  defaultTemplateId: 'aia-standard',
  
  // Output configuration
  supportedFormats: ['pdf', 'html', 'docx'],
  defaultFormat: 'pdf',
  
  // Integration hooks
  preGenerationHooks: ['validate-tree-data', 'analyze-development-plans'],
  postGenerationHooks: ['validate-mitigation-measures', 'generate-impact-summary'],
  validationHooks: ['check-impact-analysis', 'verify-mitigation-hierarchy']
};
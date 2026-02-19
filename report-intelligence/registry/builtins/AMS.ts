/**
 * Arboricultural Method Statement (AMS) Report Type Definition
 * 
 * Built-in report type for detailed construction methodology to protect trees.
 */

import type { ReportTypeDefinition } from '../ReportTypeDefinition';

export const AMSReportDefinition: ReportTypeDefinition = {
  // Core identification
  id: 'arb-method-statement',
  name: 'Arboricultural Method Statement (AMS)',
  description: 'Detailed methodology for construction works near trees, specifying protective measures, working methods, and supervision requirements.',
  category: 'method',
  
  // Versioning
  version: '1.0.0',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  
  // Section definitions
  requiredSections: [
    {
      id: 'title-page',
      name: 'Title Page',
      description: 'Document title, project details, site address, and author information',
      required: true,
      aiGuidance: 'Include project name, client, contractor, site address, document version, and author details.'
    },
    {
      id: 'scope',
      name: 'Scope',
      description: 'Scope of works, applicable trees, and construction phases covered',
      required: true,
      aiGuidance: 'Clearly define what works are covered, which trees are affected, and construction phases included.'
    },
    {
      id: 'site-specific-risks',
      name: 'Site Specific Risks',
      description: 'Identification of tree-related risks specific to the site and works',
      required: true,
      aiGuidance: 'Identify specific risks: proximity to trees, soil conditions, access constraints, services, weather considerations.'
    },
    {
      id: 'tree-protection-measures',
      name: 'Tree Protection Measures',
      description: 'Detailed specification of physical protection measures for trees',
      required: true,
      aiGuidance: 'Specify protection fencing (type, height, location), ground protection, signage, and exclusion zones.'
    },
    {
      id: 'working-methods',
      name: 'Working Methods',
      description: 'Detailed methodology for works near trees, including prohibited activities',
      required: true,
      aiGuidance: 'Specify approved working methods: hand digging, no-dig techniques, machinery restrictions, material storage limits.'
    },
    {
      id: 'supervision-monitoring',
      name: 'Supervision and Monitoring',
      description: 'Requirements for supervision, monitoring, and reporting during works',
      required: true,
      aiGuidance: 'Specify supervision requirements (arboricultural presence), monitoring frequency, reporting procedures.'
    },
    {
      id: 'emergency-procedures',
      name: 'Emergency Procedures',
      description: 'Procedures for dealing with tree damage, incidents, or unexpected findings',
      required: true,
      aiGuidance: 'Define emergency procedures: tree damage protocol, who to contact, stop-work authority, incident reporting.'
    },
    {
      id: 'appendices',
      name: 'Appendices',
      description: 'Supporting documents, drawings, contact details, and reference materials',
      required: true,
      aiGuidance: 'Include tree protection plans, contact lists, reference documents, and site-specific drawings.'
    }
  ],
  
  optionalSections: [
    {
      id: 'contractor-responsibilities',
      name: 'Contractor Responsibilities',
      description: 'Detailed responsibilities of the contractor and subcontractors',
      required: false,
      aiGuidance: 'Clearly define contractor responsibilities: implementation, maintenance, reporting, compliance.'
    },
    {
      id: 'pre-construction-meeting',
      name: 'Pre-construction Meeting',
      description: 'Requirements for pre-construction briefing and site induction',
      required: false,
      aiGuidance: 'Specify pre-construction meeting requirements: attendees, agenda, site walkover, documentation review.'
    },
    {
      id: 'post-construction',
      name: 'Post-construction Requirements',
      description: 'Requirements for site reinstatement and post-construction monitoring',
      required: false,
      aiGuidance: 'Define post-construction requirements: site reinstatement, final inspection, monitoring period.'
    }
  ],
  
  conditionalSections: [
    {
      id: 'specialist-techniques',
      name: 'Specialist Techniques',
      description: 'Description of specialist techniques required (e.g., root bridging, air spading)',
      required: false,
      conditionalLogic: {
        dependsOn: 'working-methods',
        condition: 'contains',
        value: 'specialist'
      },
      aiGuidance: 'Detail specialist techniques: methodology, equipment, personnel qualifications, quality control.'
    },
    {
      id: 'phased-construction',
      name: 'Phased Construction',
      description: 'Detailed phasing of construction works to minimize tree impacts',
      required: false,
      conditionalLogic: {
        dependsOn: 'scope',
        condition: 'contains',
        value: 'phased'
      },
      aiGuidance: 'Provide detailed construction phasing: sequence, timing, tree protection adjustments for each phase.'
    }
  ],
  
  // Dependencies and relationships
  dependencies: [
    {
      type: 'data',
      id: 'tree-survey',
      name: 'Tree Survey',
      description: 'Existing tree survey data identifying trees to be protected',
      required: true
    },
    {
      type: 'data',
      id: 'impact-assessment',
      name: 'Impact Assessment',
      description: 'Arboricultural Impact Assessment identifying risks and mitigation requirements',
      required: true
    },
    {
      type: 'template',
      id: 'protection-specification',
      name: 'Protection Specification',
      description: 'Standard specifications for tree protection measures',
      required: false
    }
  ],
  
  relatedReportTypes: ['arb-impact-assessment', 'bs5837-2012'],
  
  // Compliance and standards
  complianceRules: [
    {
      id: 'protection-specification',
      name: 'Protection Specification',
      description: 'Must specify type, dimensions, and materials for tree protection',
      standard: 'BS5837:2012',
      rule: 'Tree protection fencing must be specified: type (e.g., Heras), height (min 2.4m), signage requirements',
      severity: 'critical'
    },
    {
      id: 'methodology-detail',
      name: 'Methodology Detail',
      description: 'Must provide detailed working methodology near trees',
      standard: 'Best Practice',
      rule: 'Working methods must be specified in detail: excavation methods, machinery restrictions, material storage',
      severity: 'critical'
    },
    {
      id: 'supervision-requirements',
      name: 'Supervision Requirements',
      description: 'Must specify supervision and monitoring requirements',
      standard: 'Best Practice',
      rule: 'Must specify frequency of arboricultural supervision and monitoring during works',
      severity: 'critical'
    }
  ],
  
  standards: ['BS5837:2012', 'Arboricultural Association Guidelines', 'Construction Best Practice'],
  
  // AI integration
  aiGuidance: [
    {
      id: 'methodology-guidance',
      purpose: 'generation',
      guidance: 'Provide step-by-step methodology. Use clear, imperative language. Reference industry standards.',
      examples: [
        '"All excavation within 5m of Tree T1 shall be by hand digging only."',
        '"No machinery shall operate within the Root Protection Area of any retained tree."',
        '"Material storage shall be limited to designated areas outside all tree protection zones."'
      ]
    },
    {
      id: 'protection-spec-guidance',
      purpose: 'generation',
      guidance: 'Specify protection measures in detail: materials, dimensions, installation method, maintenance.',
      examples: [
        'Tree protection fencing: 2.4m high Heras fencing or equivalent, installed 1m beyond RPA, with "Tree Protection Zone" signs at 5m intervals.',
        'Ground protection: Type 1 MOT sub-base, 150mm depth, geotextile membrane, within designated access routes only.'
      ]
    }
  ],
  
  generationPrompt: 'Generate an Arboricultural Method Statement based on the provided tree survey and impact assessment. Specify detailed protection measures, working methods, and supervision requirements.',
  validationPrompt: 'Validate this Arboricultural Method Statement for completeness and practicality. Check for detailed methodology, specific protection measures, and clear responsibilities.',
  
  // Metadata
  tags: ['method-statement', 'construction', 'tree-protection', 'contractor', 'supervision'],
  estimatedGenerationTime: 60, // 1 hour
  complexity: 'medium',
  typicalAudience: ['contractors', 'site-managers', 'arboriculturists', 'clients', 'planners'],
  
  // Template references
  defaultTemplateId: 'ams-standard',
  
  // Output configuration
  supportedFormats: ['pdf', 'docx'],
  defaultFormat: 'pdf',
  
  // Integration hooks
  preGenerationHooks: ['validate-tree-data', 'analyze-risks'],
  postGenerationHooks: ['validate-methodology', 'generate-checklist'],
  validationHooks: ['check-protection-specs', 'verify-methodology-detail']
};
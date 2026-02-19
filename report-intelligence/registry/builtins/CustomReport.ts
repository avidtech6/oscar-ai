/**
 * Custom / User-Defined Report Type Definition
 * 
 * Built-in report type template for user-defined custom reports.
 */

import type { ReportTypeDefinition } from '../ReportTypeDefinition';

export const CustomReportDefinition: ReportTypeDefinition = {
  // Core identification
  id: 'custom-report',
  name: 'Custom / User-Defined Report',
  description: 'Template for user-defined custom reports with flexible structure and content.',
  category: 'custom',
  
  // Versioning
  version: '1.0.0',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  
  // Section definitions - minimal template sections
  requiredSections: [
    {
      id: 'title-page',
      name: 'Title Page',
      description: 'Report title, author, date, and version information',
      required: true,
      aiGuidance: 'Include report title, author, date, version, and any relevant identifiers.'
    },
    {
      id: 'introduction',
      name: 'Introduction',
      description: 'Introduction explaining report purpose and scope',
      required: true,
      aiGuidance: 'Explain report purpose, scope, methodology, and any background information.'
    },
    {
      id: 'main-content',
      name: 'Main Content',
      description: 'Main body of the report containing findings and analysis',
      required: true,
      aiGuidance: 'Present main findings, analysis, data, and discussion in logical sections.'
    },
    {
      id: 'conclusions',
      name: 'Conclusions',
      description: 'Conclusions summarizing key findings',
      required: true,
      aiGuidance: 'Summarize key findings, draw conclusions, and highlight important points.'
    }
  ],
  
  optionalSections: [
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'Summary of key findings for busy readers',
      required: false,
      aiGuidance: 'Provide concise summary of key findings, conclusions, and recommendations.'
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      description: 'Recommendations based on findings',
      required: false,
      aiGuidance: 'Provide clear, actionable recommendations based on findings.'
    },
    {
      id: 'appendices',
      name: 'Appendices',
      description: 'Supporting information, data, or references',
      required: false,
      aiGuidance: 'Include supporting information: data tables, references, detailed calculations, etc.'
    },
    {
      id: 'references',
      name: 'References',
      description: 'List of references or sources cited',
      required: false,
      aiGuidance: 'List references, sources, or bibliography in appropriate format.'
    }
  ],
  
  conditionalSections: [],
  
  // Dependencies and relationships
  dependencies: [],
  
  relatedReportTypes: [],
  
  // Compliance and standards
  complianceRules: [
    {
      id: 'basic-structure',
      name: 'Basic Structure',
      description: 'Must have basic report structure',
      standard: 'General',
      rule: 'Report must have identifiable sections: introduction, main content, conclusions',
      severity: 'warning'
    }
  ],
  
  standards: ['General Report Writing Standards'],
  
  // AI integration
  aiGuidance: [
    {
      id: 'custom-report-guidance',
      purpose: 'generation',
      guidance: 'Structure content logically. Use clear headings. Adapt to specific user requirements.',
      examples: [
        'For technical reports: include methodology, results, discussion sections.',
        'For business reports: include executive summary, findings, recommendations, implementation plan.'
      ]
    }
  ],
  
  generationPrompt: 'Generate a custom report based on user requirements and provided data. Structure content appropriately for the report purpose.',
  validationPrompt: 'Validate this custom report for basic structure and coherence. Check for logical flow, clear sections, and appropriate content.',
  
  // Metadata
  tags: ['custom', 'template', 'user-defined', 'flexible', 'generic'],
  estimatedGenerationTime: 30, // 30 minutes
  complexity: 'simple',
  typicalAudience: ['users', 'clients', 'general'],
  
  // Template references
  defaultTemplateId: 'custom-template',
  
  // Output configuration
  supportedFormats: ['pdf', 'html', 'docx', 'markdown'],
  defaultFormat: 'pdf',
  
  // Integration hooks
  preGenerationHooks: ['validate-user-requirements'],
  postGenerationHooks: ['validate-structure'],
  validationHooks: ['check-basic-structure']
};
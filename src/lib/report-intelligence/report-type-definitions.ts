/**
 * Report Type Definitions for Oscar AI Phase Compliance Package
 * 
 * This file defines the core interfaces and types for the Report Type Registry system.
 * It implements Phase 1: Report Type Registry from the Report Intelligence System.
 * 
 * File: src/lib/report-intelligence/report-type-definitions.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

/**
 * Definition of a single report type with all required metadata
 */
export interface ReportTypeDefinition {
  /**
   * Unique identifier for the report type
   */
  id: string;
  
  /**
   * Human-readable name of the report type
   */
  name: string;
  
  /**
   * Detailed description of the report type
   */
  description: string;
  
  /**
   * Version of the report type specification
   */
  version: string;
  
  /**
   * Date when this report type was last updated
   */
  lastUpdated: string;
  
  /**
   * Author or organization that created this report type
   */
  author: string;
  
  /**
   * Industry standards or regulations this report type follows
   */
  standards: string[];
  
  /**
   * Required sections for this report type
   */
  requiredSections: SectionDefinition[];
  
  /**
   * Optional sections that can be included
   */
  optionalSections: SectionDefinition[];
  
  /**
   * Required data fields for this report type
   */
  requiredFields: FieldDefinition[];
  
  /**
   * Validation rules for this report type
   */
  validationRules: ValidationRule[];
  
  /**
   * Templates or examples for this report type
   */
  templates?: TemplateDefinition[];
  
  /**
   * Metadata about the report type
   */
  metadata: {
    category: string;
    subcategory?: string;
    estimatedDuration?: number;
    complexity: 'low' | 'medium' | 'high';
    tags: string[];
  };
}

/**
 * Definition of a report section
 */
export interface SectionDefinition {
  /**
   * Unique identifier for the section
   */
  id: string;
  
  /**
   * Human-readable name of the section
   */
  name: string;
  
  /**
   * Description of what should be included in this section
   */
  description: string;
  
  /**
   * Order in which this section should appear
   */
  order: number;
  
  /**
   * Whether this section is required
   */
  required: boolean;
  
  /**
   * Minimum number of paragraphs required
   */
  minParagraphs?: number;
  
  /**
   * Maximum number of paragraphs allowed
   */
  maxParagraphs?: number;
  
  /**
   * Required subsections
   */
  subsections?: SubsectionDefinition[];
  
  /**
   * Content requirements for this section
   */
  contentRequirements?: ContentRequirement[];
}

/**
 * Definition of a subsection within a section
 */
export interface SubsectionDefinition {
  /**
   * Unique identifier for the subsection
   */
  id: string;
  
  /**
   * Human-readable name of the subsection
   */
  name: string;
  
  /**
   * Description of what should be included in this subsection
   */
  description: string;
  
  /**
   * Order in which this subsection should appear
   */
  order: number;
  
  /**
   * Whether this subsection is required
   */
  required: boolean;
  
  /**
   * Minimum number of paragraphs required
   */
  minParagraphs?: number;
  
  /**
   * Maximum number of paragraphs allowed
   */
  maxParagraphs?: number;
}

/**
 * Definition of a field within a report
 */
export interface FieldDefinition {
  /**
   * Unique identifier for the field
   */
  id: string;
  
  /**
   * Human-readable name of the field
   */
  name: string;
  
  /**
   * Description of what this field represents
   */
  description: string;
  
  /**
   * Data type of the field
   */
  type: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  
  /**
   * Whether this field is required
   */
  required: boolean;
  
  /**
   * Default value for the field
   */
  defaultValue?: any;
  
  /**
   * Validation rules for this field
   */
  validation?: FieldValidation[];
  
  /**
   * Options for select/multiselect fields
   */
  options?: string[];
  
  /**
   * Placeholder text for the field
   */
  placeholder?: string;
}

/**
 * Validation rule for a report type
 */
export interface ValidationRule {
  /**
   * Unique identifier for the validation rule
   */
  id: string;
  
  /**
   * Description of the validation rule
   */
  description: string;
  
  /**
   * Type of validation
   */
  type: 'structure' | 'content' | 'format' | 'completeness' | 'consistency';
  
  /**
   * Severity level of the validation
   */
  severity: 'error' | 'warning' | 'info';
  
  /**
   * JavaScript expression or function to validate
   */
  validator: string;
  
  /**
   * Error message to display if validation fails
   */
  errorMessage: string;
  
  /**
   * Whether this validation can be auto-corrected
   */
  autoCorrectable?: boolean;
  
  /**
   * Correction function if auto-correctable
   */
  correctionFunction?: string;
}

/**
 * Validation rule for a specific field
 */
export interface FieldValidation {
  /**
   * Type of field validation
   */
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'range' | 'custom';
  
  /**
   * Value for the validation (e.g., min length, pattern, range)
   */
  value?: any;
  
  /**
   * Error message to display if validation fails
   */
  errorMessage: string;
}

/**
 * Content requirement for a section
 */
export interface ContentRequirement {
  /**
   * Type of content requirement
   */
  type: 'keywords' | 'references' | 'calculations' | 'images' | 'tables' | 'formulas';
  
  /**
   * Description of the requirement
   */
  description: string;
  
  /**
   * Minimum number required
   */
  minCount?: number;
  
  /**
   * Maximum number allowed
   */
  maxCount?: number;
  
  /**
   * Specific requirements for this content type
   */
  requirements?: any;
}

/**
 * Definition of a template for a report type
 */
export interface TemplateDefinition {
  /**
   * Unique identifier for the template
   */
  id: string;
  
  /**
   * Name of the template
   */
  name: string;
  
  /**
   * Description of the template
   */
  description: string;
  
  /**
   * Content of the template (can be HTML, markdown, or structured data)
   */
  content: string;
  
  /**
   * Type of template content
   */
  contentType: 'html' | 'markdown' | 'structured';
  
  /**
   * Whether this is the default template
   */
  isDefault?: boolean;
  
  /**
   * Tags for categorizing the template
   */
  tags?: string[];
}

/**
 * Built-in report types for Oscar AI
 */
export const BUILTIN_REPORT_TYPES: ReportTypeDefinition[] = [
  {
    id: 'bs5837-2012-tree-survey',
    name: 'BS5837:2012 Tree Survey Report',
    description: 'British Standard BS5837:2012 for Trees in Relation to Design, Demolition and Construction',
    version: '1.0.0',
    lastUpdated: '2024-01-01',
    author: 'British Standards Institution',
    standards: ['BS5837:2012'],
    requiredSections: [
      {
        id: 'executive-summary',
        name: 'Executive Summary',
        description: 'Overview of the tree survey findings and recommendations',
        order: 1,
        required: true,
        minParagraphs: 3,
        maxParagraphs: 5
      },
      {
        id: 'site-description',
        name: 'Site Description',
        description: 'Description of the site location and context',
        order: 2,
        required: true,
        minParagraphs: 2,
        maxParagraphs: 4
      },
      {
        id: 'survey-methodology',
        name: 'Survey Methodology',
        description: 'Methods used for conducting the tree survey',
        order: 3,
        required: true,
        minParagraphs: 2,
        maxParagraphs: 3
      },
      {
        id: 'tree-inventory',
        name: 'Tree Inventory',
        description: 'Detailed inventory of all trees surveyed',
        order: 4,
        required: true,
        subsections: [
          {
            id: 'tree-list',
            name: 'Tree List',
            description: 'List of all trees with their details',
            order: 1,
            required: true,
            minParagraphs: 5,
            maxParagraphs: 10
          },
          {
            id: 'tree-condition',
            name: 'Tree Condition Assessment',
            description: 'Assessment of tree health and condition',
            order: 2,
            required: true,
            minParagraphs: 3,
            maxParagraphs: 6
          }
        ]
      },
      {
        id: 'impact-assessment',
        name: 'Impact Assessment',
        description: 'Assessment of potential impact on trees',
        order: 5,
        required: true,
        minParagraphs: 3,
        maxParagraphs: 6
      },
      {
        id: 'recommendations',
        name: 'Recommendations',
        description: 'Recommendations for tree protection and management',
        order: 6,
        required: true,
        minParagraphs: 3,
        maxParagraphs: 8
      }
    ],
    optionalSections: [
      {
        id: 'appendix',
        name: 'Appendix',
        description: 'Additional supporting documents and data',
        order: 7,
        required: false
      }
    ],
    requiredFields: [
      {
        id: 'survey-date',
        name: 'Survey Date',
        description: 'Date when the survey was conducted',
        type: 'date',
        required: true
      },
      {
        id: 'surveyor-name',
        name: 'Surveyor Name',
        description: 'Name of the surveyor conducting the assessment',
        type: 'string',
        required: true
      },
      {
        id: 'client-name',
        name: 'Client Name',
        description: 'Name of the client commissioning the survey',
        type: 'string',
        required: true
      },
      {
        id: 'site-location',
        name: 'Site Location',
        description: 'Address or location of the site',
        type: 'string',
        required: true
      }
    ],
    validationRules: [
      {
        id: 'tree-count-validation',
        description: 'Validate that at least one tree is recorded',
        type: 'completeness',
        severity: 'error',
        validator: 'report.trees.length > 0',
        errorMessage: 'At least one tree must be recorded in the survey'
      },
      {
        id: 'survey-date-validation',
        description: 'Validate that survey date is not in the future',
        type: 'format',
        severity: 'error',
        validator: 'new Date(report.surveyDate) <= new Date()',
        errorMessage: 'Survey date cannot be in the future'
      }
    ],
    metadata: {
      category: 'Environmental Assessment',
      subcategory: 'Arboriculture',
      estimatedDuration: 480, // 8 hours
      complexity: 'medium',
      tags: ['trees', 'survey', 'environmental', 'construction', 'bs5837']
    }
  },
  {
    id: 'arboricultural-impact-assessment',
    name: 'Arboricultural Impact Assessment',
    description: 'Assessment of the potential impact on trees from development proposals',
    version: '1.0.0',
    lastUpdated: '2024-01-01',
    author: 'Arboricultural Association',
    standards: ['BS5837:2012'],
    optionalSections: [],
    requiredSections: [
      {
        id: 'introduction',
        name: 'Introduction',
        description: 'Introduction to the arboricultural impact assessment',
        order: 1,
        required: true,
        minParagraphs: 2,
        maxParagraphs: 4
      },
      {
        id: 'site-description',
        name: 'Site Description',
        description: 'Description of the development site',
        order: 2,
        required: true,
        minParagraphs: 2,
        maxParagraphs: 4
      },
      {
        id: 'existing-vegetation',
        name: 'Existing Vegetation',
        description: 'Description of existing trees and vegetation',
        order: 3,
        required: true,
        minParagraphs: 3,
        maxParagraphs: 6
      },
      {
        id: 'development-proposal',
        name: 'Development Proposal',
        description: 'Description of the proposed development',
        order: 4,
        required: true,
        minParagraphs: 2,
        maxParagraphs: 4
      },
      {
        id: 'impact-assessment',
        name: 'Impact Assessment',
        description: 'Detailed assessment of potential impacts',
        order: 5,
        required: true,
        subsections: [
          {
            id: 'direct-impact',
            name: 'Direct Impact',
            description: 'Assessment of direct impacts on trees',
            order: 1,
            required: true,
            minParagraphs: 3,
            maxParagraphs: 6
          },
          {
            id: 'indirect-impact',
            name: 'Indirect Impact',
            description: 'Assessment of indirect impacts on trees',
            order: 2,
            required: true,
            minParagraphs: 2,
            maxParagraphs: 5
          }
        ]
      },
      {
        id: 'mitigation-measures',
        name: 'Mitigation Measures',
        description: 'Proposed measures to mitigate impacts',
        order: 6,
        required: true,
        minParagraphs: 3,
        maxParagraphs: 6
      },
      {
        id: 'conclusions',
        name: 'Conclusions',
        description: 'Summary of findings and recommendations',
        order: 7,
        required: true,
        minParagraphs: 2,
        maxParagraphs: 4
      }
    ],
    requiredFields: [
      {
        id: 'assessment-date',
        name: 'Assessment Date',
        description: 'Date when the assessment was conducted',
        type: 'date',
        required: true
      },
      {
        id: 'assessor-name',
        name: 'Assessor Name',
        description: 'Name of the assessor conducting the assessment',
        type: 'string',
        required: true
      },
      {
        id: 'development-type',
        name: 'Development Type',
        description: 'Type of development proposed',
        type: 'select',
        required: true,
        options: ['Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Mixed Use']
      }
    ],
    validationRules: [
      {
        id: 'development-type-validation',
        description: 'Validate that development type is selected',
        type: 'completeness',
        severity: 'error',
        validator: 'report.developmentType && report.developmentType.length > 0',
        errorMessage: 'Development type must be specified'
      }
    ],
    metadata: {
      category: 'Environmental Assessment',
      subcategory: 'Arboriculture',
      estimatedDuration: 360, // 6 hours
      complexity: 'medium',
      tags: ['trees', 'impact', 'assessment', 'development', 'arboriculture']
    }
  }
];

/**
 * Utility functions for report type definitions
 */
export class ReportTypeDefinitionUtils {
  /**
   * Find a report type by ID
   */
  static findById(id: string): ReportTypeDefinition | undefined {
    return BUILTIN_REPORT_TYPES.find(type => type.id === id);
  }
  
  /**
   * Find all report types by category
   */
  static findByCategory(category: string): ReportTypeDefinition[] {
    return BUILTIN_REPORT_TYPES.filter(type => 
      type.metadata.category === category
    );
  }
  
  /**
   * Find all report types by tag
   */
  static findByTag(tag: string): ReportTypeDefinition[] {
    return BUILTIN_REPORT_TYPES.filter(type => 
      type.metadata.tags.includes(tag)
    );
  }
  
  /**
   * Get all available categories
   */
  static getCategories(): string[] {
    const categories = new Set<string>();
    BUILTIN_REPORT_TYPES.forEach(type => {
      categories.add(type.metadata.category);
    });
    return Array.from(categories).sort();
  }
  
  /**
   * Get all available tags
   */
  static getTags(): string[] {
    const tags = new Set<string>();
    BUILTIN_REPORT_TYPES.forEach(type => {
      type.metadata.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }
}
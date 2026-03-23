/**
 * TemplateDefinition interface
 * 
 * Defines the structure and properties of a report template
 */
export interface TemplateDefinition {
  /** Unique identifier for the template */
  templateId: string;
  
  /** Framework information */
  framework: {
    /** Name of the framework */
    name: string;
    
    /** Version of the framework */
    version: string;
    
    /** Description of the framework */
    description?: string;
    
    /** Supported report types */
    supportedTypes: string[];
    
    /** Default configuration */
    defaultConfig: Record<string, any>;
    
    /** Framework-specific metadata */
    metadata?: Record<string, any>;
  };
  
  /** Dynamic sections configuration */
  dynamicSections: Array<{
    /** Section identifier */
    sectionId: string;
    
    /** Section title */
    title: string;
    
    /** Section description */
    description?: string;
    
    /** Whether the section is required */
    required: boolean;
    
    /** Whether the section can be repeated */
    repeatable: boolean;
    
    /** Default content for the section */
    defaultContent?: string;
    
    /** Content validation rules */
    validationRules: Array<{
      /** Type of validation */
      type: 'required' | 'format' | 'length' | 'custom';
      
      /** Validation parameters */
      params?: Record<string, any>;
      
      /** Error message for validation failure */
      message: string;
    }>;
    
    /** Dependencies on other sections */
    dependencies?: string[];
    
    /** Available content templates */
    contentTemplates?: Array<{
      /** Template name */
      name: string;
      
      /** Template content */
      content: string;
      
      /** When to use this template */
      conditions?: Array<{
        field: string;
        operator: 'equals' | 'contains' | 'matches' | 'greater' | 'less';
        value: any;
      }>;
    }>;
    
    /** Field definitions */
    fields?: Array<{
      /** Field identifier */
      fieldId: string;
      
      /** Field type */
      type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'file';
      
      /** Field label */
      label: string;
      
      /** Field description */
      description?: string;
      
      /** Whether the field is required */
      required: boolean;
      
      /** Default value */
      defaultValue?: any;
      
      /** Validation rules for the field */
      validation?: Array<{
        type: 'required' | 'format' | 'range' | 'custom';
        params?: Record<string, any>;
        message: string;
      }>;
      
      /** Options for select/multiselect fields */
      options?: Array<{
        value: any;
        label: string;
        description?: string;
      }>;
      
      /** Field metadata */
      metadata?: Record<string, any>;
    }>;
  }>;
  
  /** Validation rules for the entire template */
  validationRules: Array<{
    /** Rule identifier */
    ruleId: string;
    
    /** Rule type */
    type: 'structure' | 'content' | 'format' | 'business';
    
    /** Rule description */
    description: string;
    
    /** Severity level */
    severity: 'error' | 'warning' | 'info';
    
    /** Validation function */
    validate: (content: any) => boolean | string;
    
    /** Error message */
    errorMessage: string;
    
    /** Warning message */
    warningMessage?: string;
    
    /** Custom metadata */
    metadata?: Record<string, any>;
  }>;
  
  /** Template metadata */
  metadata?: {
    /** Author information */
    author?: string;
    
    /** Creation date */
    createdAt?: Date;
    
    /** Last modified date */
    modifiedAt?: Date;
    
    /** Template category */
    category?: string;
    
    /** Tags for the template */
    tags?: string[];
    
    /** Usage statistics */
    usageCount?: number;
    
    /** Average rating */
    rating?: number;
    
    /** Template notes */
    notes?: string;
  };
}
/**
 * TemplateInstance interface
 * 
 * Represents an instance of a report template with specific content and metadata
 */
export interface TemplateInstance {
  /** Unique identifier for the instance */
  instanceId: string;
  
  /** Reference to the template definition */
  template: {
    /** Template identifier */
    templateId: string;
    
    /** Template version */
    version: string;
    
    /** Template name */
    name: string;
    
    /** Template description */
    description?: string;
  };
  
  /** Content sections */
  content: {
    /** Executive summary */
    executiveSummary?: string;
    
    /** Introduction */
    introduction?: string;
    
    /** Methodology */
    methodology?: string;
    
    /** Findings */
    findings?: Array<{
      /** Finding title */
      title: string;
      
      /** Finding description */
      description: string;
      
      /** Finding details */
      details?: string;
      
      /** Supporting evidence */
      evidence?: Array<{
        /** Evidence type */
        type: 'data' | 'reference' | 'observation' | 'calculation';
        
        /** Evidence content */
        content: string;
        
        /** Evidence source */
        source?: string;
      }>;
    }>;
    
    /** Conclusions */
    conclusions?: string;
    
    /** Recommendations */
    recommendations?: Array<{
      /** Recommendation title */
      title: string;
      
      /** Recommendation description */
      description: string;
      
      /** Recommendation priority */
      priority: 'low' | 'medium' | 'high' | 'critical';
      
      /** Recommendation status */
      status: 'pending' | 'in-progress' | 'completed' | 'rejected';
      
      /** Responsible party */
      assignedTo?: string;
      
      /** Due date */
      dueDate?: Date;
    }>;
    
    /** Appendices */
    appendices?: Array<{
      /** Appendix identifier */
      appendixId: string;
      
      /** Appendix title */
      title: string;
      
      /** Appendix content */
      content: string;
      
      /** Appendix type */
      type: 'table' | 'figure' | 'chart' | 'data' | 'reference';
    }>;
    
    /** Custom sections */
    customSections?: Record<string, any>;
  };
  
  /** Metadata for the instance */
  metadata: {
    /** Report title */
    title: string;
    
    /** Report author */
    author: string;
    
    /** Report date */
    date: Date;
    
    /** Report status */
    status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
    
    /** Report version */
    version: string;
    
    /** Report category */
    category: string;
    
    /** Report tags */
    tags?: string[];
    
    /** Report keywords */
    keywords?: string[];
    
    /** Report language */
    language?: string;
    
    /** Report confidentiality */
    confidentiality?: 'public' | 'internal' | 'confidential' | 'restricted';
    
    /** Report department */
    department?: string;
    
    /** Report project */
    project?: string;
    
    /** Client information */
    client?: {
      /** Client name */
      name: string;
      
      /** Client contact */
      contact?: string;
      
      /** Client organization */
      organization?: string;
    };
    
    /** Additional metadata */
    additional?: Record<string, any>;
  };
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last modified timestamp */
  modifiedAt: Date;
  
  /** User who created the instance */
  createdBy: string;
  
  /** Last modified by */
  modifiedBy?: string;
  
  /** Instance status */
  status: 'active' | 'archived' | 'deleted';
  
  /** Version history */
  versionHistory?: Array<{
    /** Version number */
    version: string;
    
    /** Change description */
    description: string;
    
    /** Timestamp */
    timestamp: Date;
    
    /** User who made the change */
    user: string;
    
    /** Previous version */
    previousVersion?: string;
  }>;
  
  /** Validation results */
  validationResults?: {
    /** Overall validation status */
    isValid: boolean;
    
    /** Validation errors */
    errors: Array<{
      /** Error code */
      code: string;
      
      /** Error message */
      message: string;
      
      /** Error severity */
      severity: 'error' | 'warning' | 'info';
      
      /** Error location */
      location?: string;
    }>;
    
    /** Validation warnings */
    warnings: Array<{
      /** Warning code */
      code: string;
      
      /** Warning message */
      message: string;
      
      /** Warning location */
      location?: string;
    }>;
    
    /** Validation suggestions */
    suggestions: Array<{
      /** Suggestion code */
      code: string;
      
      /** Suggestion message */
      message: string;
      
      /** Suggestion location */
      location?: string;
    }>;
  };
  
  /** Usage statistics */
  usageStats?: {
    /** Number of views */
    views: number;
    
    /** Number of downloads */
    downloads: number;
    
    /** Number of exports */
    exports: number;
    
    /** Number of shares */
    shares: number;
    
    /** Last accessed */
    lastAccessed?: Date;
  };
  
  /** Additional instance metadata */
  additionalMetadata?: Record<string, any>;
}
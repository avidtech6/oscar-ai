/**
 * HealingOperation interface
 * 
 * Represents a self-healing operation to be performed on a document
 */
export interface HealingOperation {
  /** Type of healing operation */
  operationType: 'structure' | 'reference' | 'format' | 'content' | 'metadata';
  
  /** Target of the operation (document ID, section ID, etc.) */
  target: string | object;
  
  /** Array of fixes to apply */
  fixes: Array<{
    /** Type of fix to apply */
    type: 'replace' | 'insert' | 'delete' | 'reorder' | 'format';
    
    /** Description of the fix */
    description: string;
    
    /** Original content before fix */
    original: string | object;
    
    /** Corrected content after fix */
    corrected: string | object;
    
    /** Priority level */
    priority: 'low' | 'medium' | 'high' | 'critical';
    
    /** Confidence level (0-1) */
    confidence: number;
    
    /** Evidence supporting the fix */
    evidence?: string[];
    
    /** Additional metadata */
    metadata?: Record<string, any>;
  }>;
  
  /** Timestamp when the operation was created */
  timestamp: Date;
  
  /** User who initiated the operation */
  user: string;
  
  /** Current status of the operation */
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  
  /** Progress tracking */
  progress?: {
    /** Current step number */
    currentStep: number;
    
    /** Total number of steps */
    totalSteps: number;
    
    /** Completion percentage */
    percentage: number;
  };
  
  /** Operation results */
  results?: {
    /** Number of successful fixes */
    successCount: number;
    
    /** Number of failed fixes */
    failureCount: number;
    
    /** Warning messages */
    warnings: string[];
    
    /** Suggestion messages */
    suggestions: string[];
  };
  
  /** Error information if the operation failed */
  error?: {
    /** Error code */
    code: string;
    
    /** Error message */
    message: string;
    
    /** Error details */
    details?: any;
  };
}

/**
 * HealingOperationOptions interface
 * 
 * Configuration options for healing operations
 */
export interface HealingOperationOptions {
  /** Maximum number of fixes to apply */
  maxFixes?: number;
  
  /** Minimum confidence threshold for applying fixes */
  confidenceThreshold?: number;
  
  /** Whether to automatically apply fixes */
  autoApply?: boolean;
  
  /** Whether to create a backup before applying fixes */
  createBackup?: boolean;
  
  /** Custom validation rules */
  validationRules?: Array<{
    type: 'structure' | 'reference' | 'format' | 'content' | 'metadata';
    rule: (content: any) => boolean;
    message: string;
  }>;
  
  /** Custom healing strategies */
  customStrategies?: Record<string, (content: any, issues: any[]) => any>;
}

/**
 * HealingOperationResult interface
 * 
 * Represents the result of a healing operation
 */
export interface HealingOperationResult {
  /** The healing operation that was executed */
  operation: HealingOperation;
  
  /** Whether the operation was successful */
  success: boolean;
  
  /** Number of fixes applied */
  fixesApplied: number;
  
  /** Number of fixes that failed */
  fixesFailed: number;
  
  /** Total number of fixes attempted */
  totalFixes: number;
  
  /** Execution time in milliseconds */
  executionTime: number;
  
  /** Warning messages */
  warnings: string[];
  
  /** Suggestion messages */
  suggestions: string[];
  
  /** Error information if the operation failed */
  error?: {
    /** Error code */
    code: string;
    
    /** Error message */
    message: string;
    
    /** Error details */
    details?: any;
  };
}
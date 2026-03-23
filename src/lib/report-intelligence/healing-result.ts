/**
 * HealingResult interface
 * 
 * Represents the result of a self-healing operation on a document
 */
export interface HealingResult {
  /** Unique identifier for the document that was healed */
  documentId: string;
  
  /** Array of issues that were identified and fixed */
  issuesFixed: Array<{
    /** Type of issue */
    type: 'structure' | 'reference' | 'format' | 'content' | 'metadata';
    
    /** Description of the issue */
    description: string;
    
    /** Severity of the issue */
    severity: 'low' | 'medium' | 'high' | 'critical';
    
    /** Whether the issue was successfully fixed */
    resolved: boolean;
    
    /** Fix applied to resolve the issue */
    fix?: {
      type: 'replace' | 'insert' | 'delete' | 'reorder' | 'format';
      description: string;
      confidence: number;
    };
    
    /** Location of the issue in the document */
    location?: {
      sectionId?: string;
      elementId?: string;
      path?: string[];
    };
  }>;
  
  /** Whether the original content was preserved during healing */
  contentPreserved: boolean;
  
  /** Quality metrics of the healing operation */
  qualityMetrics?: {
    /** Overall quality score (0-100) */
    overallScore: number;
    
    /** Structural integrity score (0-100) */
    structuralIntegrity: number;
    
    /** Reference accuracy score (0-100) */
    referenceAccuracy: number;
    
    /** Formatting consistency score (0-100) */
    formattingConsistency: number;
    
    /** Content completeness score (0-100) */
    contentCompleteness: number;
  };
  
  /** Timestamp when the healing operation was completed */
  timestamp: Date;
  
  /** Unique identifier for the healing operation */
  healingOperationId?: string;
  
  /** User who initiated the healing operation */
  user?: string;
  
  /** Summary of changes made */
  changesSummary?: {
    totalIssues: number;
    issuesResolved: number;
    issuesFailed: number;
    sectionsModified: string[];
    referencesCorrected: number;
    formattingApplied: number;
  };
  
  /** Recommendations for future improvements */
  recommendations?: Array<{
    type: 'preventive' | 'optimization' | 'maintenance';
    priority: 'low' | 'medium' | 'high';
    description: string;
    action: string;
  }>;
  
  /** Backup information if a backup was created */
  backupInfo?: {
    backupId: string;
    createdAt: Date;
    restoredFrom: boolean;
  };
  
  /** Error information if the healing operation failed */
  error?: {
    code: string;
    message: string;
    details?: any;
    unresolvedIssues: number;
  };
}

/**
 * HealingStatus enum
 * 
 * Represents the possible statuses of a healing operation
 */
export enum HealingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * HealingIssueType enum
 * 
 * Represents the types of issues that can be detected and healed
 */
export enum HealingIssueType {
  STRUCTURE = 'structure',
  REFERENCE = 'reference',
  FORMAT = 'format',
  CONTENT = 'content',
  METADATA = 'metadata'
}

/**
 * HealingSeverity enum
 * 
 * Represents the severity levels of healing issues
 */
export enum HealingSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * HealingFixType enum
 * 
 * Represents the types of fixes that can be applied
 */
export enum HealingFixType {
  REPLACE = 'replace',
  INSERT = 'insert',
  DELETE = 'delete',
  REORDER = 'reorder',
  FORMAT = 'format'
}

/**
 * HealingRecommendationType enum
 * 
 * Represents the types of healing recommendations
 */
export enum HealingRecommendationType {
  PREVENTIVE = 'preventive',
  OPTIMIZATION = 'optimization',
  MAINTENANCE = 'maintenance'
}

/**
 * HealingQualityMetrics interface
 * 
 * Detailed quality metrics for healing operations
 */
export interface HealingQualityMetrics {
  /** Overall quality score (0-100) */
  overallScore: number;
  
  /** Structural integrity score (0-100) */
  structuralIntegrity: number;
  
  /** Reference accuracy score (0-100) */
  referenceAccuracy: number;
  
  /** Formatting consistency score (0-100) */
  formattingConsistency: number;
  
  /** Content completeness score (0-100) */
  contentCompleteness: number;
  
  /** Readability score (0-100) */
  readability: number;
  
  /** Consistency score (0-100) */
  consistency: number;
  
  /** Compliance score (0-100) */
  compliance: number;
}

/**
 * HealingChangesSummary interface
 * 
 * Summary of changes made during a healing operation
 */
export interface HealingChangesSummary {
  /** Total number of issues identified */
  totalIssues: number;
  
  /** Number of issues successfully resolved */
  issuesResolved: number;
  
  /** Number of issues that failed to resolve */
  issuesFailed: number;
  
  /** List of sections that were modified */
  sectionsModified: string[];
  
  /** Number of references that were corrected */
  referencesCorrected: number;
  
  /** Number of formatting operations applied */
  formattingApplied: number;
  
  /** Number of content modifications made */
  contentModifications: number;
  
  /** Number of metadata corrections made */
  metadataCorrections: number;
}

/**
 * HealingRecommendation interface
 * 
 * Recommendation for future improvements after healing
 */
export interface HealingRecommendation {
  /** Type of recommendation */
  type: HealingRecommendationType;
  
  /** Priority level */
  priority: 'low' | 'medium' | 'high';
  
  /** Description of the recommendation */
  description: string;
  
  /** Suggested action */
  action: string;
  
  /** Expected benefit */
  benefit: string;
  
  /** Estimated effort */
  effort: 'low' | 'medium' | 'high';
  
  /** Due date if applicable */
  dueDate?: Date;
}
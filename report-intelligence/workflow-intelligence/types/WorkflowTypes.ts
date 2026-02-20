/**
 * Phase 25: Workflow Intelligence Layer
 * Core Workflow Type Definitions
 * 
 * Defines types for multi‑document workflow reasoning, project‑level understanding,
 * automatic task generation, and workflow graph modelling.
 */

/**
 * Workflow entity types
 */
export type WorkflowEntityType = 
  | 'document'      // Reports, blog posts, articles
  | 'task'          // To‑do items, action items
  | 'note'          // Notes, observations, ideas
  | 'media'         // Images, PDFs, audio, video
  | 'project'       // Project containers
  | 'conversation'  // Chat conversations
  | 'email'         // Email messages
  | 'calendar'      // Calendar events
  | 'reference';    // External references

/**
 * Workflow entity
 */
export interface WorkflowEntity {
  /** Unique identifier */
  id: string;
  /** Entity type */
  type: WorkflowEntityType;
  /** Title or name */
  title: string;
  /** Content or description */
  content?: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last modification timestamp */
  updatedAt: Date;
  /** Associated project ID */
  projectId?: string;
  /** Parent entity ID (for hierarchical relationships) */
  parentId?: string;
  /** Child entity IDs */
  childIds: string[];
  /** Metadata specific to entity type */
  metadata: Record<string, any>;
  /** Tags for categorization */
  tags: string[];
  /** Status (varies by entity type) */
  status?: string;
  /** Priority (1-5, where 1 is highest) */
  priority?: number;
  /** Due date (if applicable) */
  dueDate?: Date;
  /** Completion date (if applicable) */
  completedAt?: Date;
}

/**
 * Workflow relationship types
 */
export type WorkflowRelationshipType =
  | 'references'      // Entity references another
  | 'depends_on'      // Entity depends on another
  | 'generates'       // Entity generates another
  | 'part_of'         // Entity is part of another
  | 'related_to'      // General relationship
  | 'follows'         // Temporal sequence
  | 'contradicts'     // Contradictory information
  | 'supports'        // Supporting evidence
  | 'updates'         // Updates or replaces
  | 'summarizes';     // Summarizes another entity

/**
 * Workflow relationship
 */
export interface WorkflowRelationship {
  /** Unique identifier */
  id: string;
  /** Source entity ID */
  sourceId: string;
  /** Target entity ID */
  targetId: string;
  /** Relationship type */
  type: WorkflowRelationshipType;
  /** Strength of relationship (0-1) */
  strength: number;
  /** Directionality (true if bidirectional) */
  bidirectional: boolean;
  /** Creation timestamp */
  createdAt: Date;
  /** Metadata about the relationship */
  metadata: Record<string, any>;
  /** Confidence in relationship (0-1) */
  confidence: number;
  /** Evidence supporting the relationship */
  evidence?: string[];
}

/**
 * Workflow graph
 */
export interface WorkflowGraph {
  /** Graph identifier */
  id: string;
  /** Graph name */
  name: string;
  /** Description */
  description?: string;
  /** Entities in the graph */
  entities: Map<string, WorkflowEntity>;
  /** Relationships in the graph */
  relationships: Map<string, WorkflowRelationship>;
  /** Root entity IDs */
  rootEntityIds: string[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last modification timestamp */
  updatedAt: Date;
  /** Graph metadata */
  metadata: Record<string, any>;
  /** Statistics */
  statistics: {
    entityCount: number;
    relationshipCount: number;
    averageDegree: number;
    density: number;
    connectedComponents: number;
  };
}

/**
 * Workflow context
 */
export interface WorkflowContext {
  /** Current project ID */
  projectId?: string;
  /** Current entity ID (focused entity) */
  focusedEntityId?: string;
  /** Recent entity IDs (for temporal context) */
  recentEntityIds: string[];
  /** User's current intent or goal */
  userIntent?: string;
  /** Available actions in current context */
  availableActions: string[];
  /** Context metadata */
  metadata: Record<string, any>;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Workflow prediction
 */
export interface WorkflowPrediction {
  /** Prediction identifier */
  id: string;
  /** Predicted next action */
  predictedAction: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Supporting evidence */
  evidence: string[];
  /** Expected impact */
  expectedImpact: 'low' | 'medium' | 'high';
  /** Estimated time to complete */
  estimatedTimeMinutes?: number;
  /** Priority recommendation */
  priorityRecommendation: number;
  /** Alternative predictions */
  alternatives: Array<{
    action: string;
    confidence: number;
    reason: string;
  }>;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Task generation request
 */
export interface TaskGenerationRequest {
  /** Source entity IDs */
  sourceEntityIds: string[];
  /** Target entity type */
  targetEntityType: WorkflowEntityType;
  /** Generation context */
  context: WorkflowContext;
  /** Options */
  options: {
    /** Maximum number of tasks to generate */
    maxTasks?: number;
    /** Include dependencies */
    includeDependencies?: boolean;
    /** Include estimated time */
    includeEstimatedTime?: boolean;
    /** Priority level */
    priorityLevel?: 'low' | 'medium' | 'high' | 'critical';
  };
}

/**
 * Task generation result
 */
export interface TaskGenerationResult {
  /** Generated tasks */
  tasks: WorkflowEntity[];
  /** Dependencies between tasks */
  dependencies: WorkflowRelationship[];
  /** Overall priority */
  overallPriority: number;
  /** Estimated total time (minutes) */
  estimatedTotalTimeMinutes?: number;
  /** Confidence in generation */
  confidence: number;
  /** Warnings or limitations */
  warnings: string[];
  /** Generation metadata */
  metadata: Record<string, any>;
}

/**
 * Cross‑page intelligence analysis
 */
export interface CrossPageAnalysis {
  /** Analysis identifier */
  id: string;
  /** Source page IDs */
  sourcePageIds: string[];
  /** Detected connections */
  connections: Array<{
    sourceId: string;
    targetId: string;
    connectionType: string;
    strength: number;
    evidence: string[];
  }>;
  /** Generated insights */
  insights: string[];
  /** Recommended actions */
  recommendedActions: string[];
  /** Analysis confidence */
  confidence: number;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Workflow‑aware context mode
 */
export interface WorkflowAwareContext {
  /** Context identifier */
  id: string;
  /** Mode type */
  modeType: 'chat' | 'edit' | 'review' | 'plan' | 'execute';
  /** Current entities in context */
  entityIds: string[];
  /** Available operations */
  availableOperations: string[];
  /** Context history */
  history: Array<{
    timestamp: Date;
    operation: string;
    entityId?: string;
    result?: any;
  }>;
  /** Context metadata */
  metadata: Record<string, any>;
}

/**
 * Type utilities
 */

/**
 * Check if value is a WorkflowEntity
 */
export function isWorkflowEntity(value: any): value is WorkflowEntity {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    typeof value.title === 'string' &&
    value.createdAt instanceof Date &&
    value.updatedAt instanceof Date &&
    Array.isArray(value.childIds) &&
    typeof value.metadata === 'object' &&
    Array.isArray(value.tags)
  );
}

/**
 * Check if value is a WorkflowRelationship
 */
export function isWorkflowRelationship(value: any): value is WorkflowRelationship {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.sourceId === 'string' &&
    typeof value.targetId === 'string' &&
    typeof value.type === 'string' &&
    typeof value.strength === 'number' &&
    typeof value.bidirectional === 'boolean' &&
    value.createdAt instanceof Date &&
    typeof value.metadata === 'object' &&
    typeof value.confidence === 'number'
  );
}

/**
 * Create a default workflow entity
 */
export function createDefaultWorkflowEntity(
  type: WorkflowEntityType,
  title: string,
  options: Partial<WorkflowEntity> = {}
): WorkflowEntity {
  const now = new Date();
  
  return {
    id: options.id || `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    content: options.content || '',
    createdAt: options.createdAt || now,
    updatedAt: options.updatedAt || now,
    projectId: options.projectId,
    parentId: options.parentId,
    childIds: options.childIds || [],
    metadata: options.metadata || {},
    tags: options.tags || [],
    status: options.status,
    priority: options.priority,
    dueDate: options.dueDate,
    completedAt: options.completedAt,
    ...options
  };
}

/**
 * Create a default workflow relationship
 */
export function createDefaultWorkflowRelationship(
  sourceId: string,
  targetId: string,
  type: WorkflowRelationshipType,
  options: Partial<WorkflowRelationship> = {}
): WorkflowRelationship {
  const now = new Date();
  
  return {
    id: options.id || `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sourceId,
    targetId,
    type,
    strength: options.strength !== undefined ? options.strength : 0.5,
    bidirectional: options.bidirectional !== undefined ? options.bidirectional : false,
    createdAt: options.createdAt || now,
    metadata: options.metadata || {},
    confidence: options.confidence !== undefined ? options.confidence : 0.7,
    evidence: options.evidence || [],
    ...options
  };
}
/**
 * Phase 25: Workflow Intelligence Layer
 * Type Index and Exports
 * 
 * Exports all workflow intelligence type definitions and utilities.
 */

// Import types first for use in utility functions
import type {
  WorkflowEntity,
  WorkflowRelationship,
  WorkflowGraph,
  WorkflowContext,
  WorkflowPrediction,
  TaskGenerationResult,
  CrossPageAnalysis
} from './WorkflowTypes';

// Export from WorkflowTypes.ts
export type {
  WorkflowEntityType,
  WorkflowEntity,
  WorkflowRelationshipType,
  WorkflowRelationship,
  WorkflowGraph,
  WorkflowContext,
  WorkflowPrediction,
  TaskGenerationRequest,
  TaskGenerationResult,
  CrossPageAnalysis,
  WorkflowAwareContext
} from './WorkflowTypes';

export {
  isWorkflowEntity,
  isWorkflowRelationship,
  createDefaultWorkflowEntity,
  createDefaultWorkflowRelationship
} from './WorkflowTypes';

// Export from WorkflowAnalysis.ts
export type {
  WorkflowAnalysisScope,
  WorkflowAnalysisDepth,
  WorkflowAnalysisRequest,
  WorkflowAnalysisResult,
  EntitySummary,
  EntityRelationship,
  EntityIssue,
  EntityOpportunity,
  WorkflowPattern,
  WorkflowBottleneck,
  WorkflowEfficiency,
  WorkflowRisk,
  KeyInsight,
  StrategicRecommendation,
  TacticalRecommendation,
  PredictiveInsight,
  NextActionPrediction,
  OutcomePrediction,
  RiskPrediction,
  TimelinePrediction
} from './WorkflowAnalysis';

export {
  isWorkflowAnalysisRequest,
  createDefaultWorkflowAnalysisRequest
} from './WorkflowAnalysis';

// Export from WorkflowGraphTypes.ts
export type {
  GraphTraversalDirection,
  GraphTraversalAlgorithm,
  GraphTraversalRequest,
  GraphTraversalResult,
  GraphAnalysisType,
  GraphAnalysisRequest,
  GraphAnalysisResult,
  ContextAwareWorkflowRequest,
  ContextAwareWorkflowResult,
  GraphOperationType,
  GraphOperation,
  GraphOperationBatch
} from './WorkflowGraphTypes';

export {
  isGraphTraversalRequest,
  isGraphAnalysisRequest,
  isContextAwareWorkflowRequest,
  createDefaultGraphTraversalRequest,
  createDefaultGraphAnalysisRequest,
  createDefaultContextAwareWorkflowRequest
} from './WorkflowGraphTypes';

/**
 * Type guard utilities
 */

/**
 * Check if value is a WorkflowGraph
 */
export function isWorkflowGraph(value: any): value is WorkflowGraph {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    value.entities instanceof Map &&
    value.relationships instanceof Map &&
    Array.isArray(value.rootEntityIds) &&
    value.createdAt instanceof Date &&
    value.updatedAt instanceof Date &&
    typeof value.metadata === 'object' &&
    typeof value.statistics === 'object'
  );
}

/**
 * Check if value is a WorkflowPrediction
 */
export function isWorkflowPrediction(value: any): value is WorkflowPrediction {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.predictedAction === 'string' &&
    typeof value.confidence === 'number' &&
    Array.isArray(value.evidence) &&
    typeof value.expectedImpact === 'string' &&
    typeof value.priorityRecommendation === 'number' &&
    Array.isArray(value.alternatives) &&
    value.timestamp instanceof Date
  );
}

/**
 * Check if value is a TaskGenerationResult
 */
export function isTaskGenerationResult(value: any): value is TaskGenerationResult {
  return (
    value &&
    typeof value === 'object' &&
    Array.isArray(value.tasks) &&
    Array.isArray(value.dependencies) &&
    typeof value.overallPriority === 'number' &&
    typeof value.confidence === 'number' &&
    Array.isArray(value.warnings) &&
    typeof value.metadata === 'object'
  );
}

/**
 * Check if value is a CrossPageAnalysis
 */
export function isCrossPageAnalysis(value: any): value is CrossPageAnalysis {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    Array.isArray(value.sourcePageIds) &&
    Array.isArray(value.connections) &&
    Array.isArray(value.insights) &&
    Array.isArray(value.recommendedActions) &&
    typeof value.confidence === 'number' &&
    value.timestamp instanceof Date
  );
}

/**
 * Create a default workflow graph
 */
export function createDefaultWorkflowGraph(
  name: string,
  options: Partial<WorkflowGraph> = {}
): WorkflowGraph {
  const now = new Date();
  
  return {
    id: options.id || `graph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description: options.description,
    entities: options.entities || new Map(),
    relationships: options.relationships || new Map(),
    rootEntityIds: options.rootEntityIds || [],
    createdAt: options.createdAt || now,
    updatedAt: options.updatedAt || now,
    metadata: options.metadata || {},
    statistics: options.statistics || {
      entityCount: 0,
      relationshipCount: 0,
      averageDegree: 0,
      density: 0,
      connectedComponents: 0
    },
    ...options
  };
}

/**
 * Create a default workflow context
 */
export function createDefaultWorkflowContext(
  options: Partial<WorkflowContext> = {}
): WorkflowContext {
  const now = new Date();
  
  return {
    projectId: options.projectId,
    focusedEntityId: options.focusedEntityId,
    recentEntityIds: options.recentEntityIds || [],
    userIntent: options.userIntent,
    availableActions: options.availableActions || [],
    metadata: options.metadata || {},
    timestamp: options.timestamp || now,
    ...options
  };
}

/**
 * Create a default workflow prediction
 */
export function createDefaultWorkflowPrediction(
  predictedAction: string,
  options: Partial<WorkflowPrediction> = {}
): WorkflowPrediction {
  const now = new Date();
  
  return {
    id: options.id || `prediction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    predictedAction,
    confidence: options.confidence !== undefined ? options.confidence : 0.7,
    evidence: options.evidence || [],
    expectedImpact: options.expectedImpact || 'medium',
    estimatedTimeMinutes: options.estimatedTimeMinutes,
    priorityRecommendation: options.priorityRecommendation !== undefined ? options.priorityRecommendation : 3,
    alternatives: options.alternatives || [],
    timestamp: options.timestamp || now,
    ...options
  };
}

/**
 * Type conversion utilities
 */

/**
 * Convert entity to plain object (for serialization)
 */
export function entityToPlainObject(entity: WorkflowEntity): Record<string, any> {
  const result: Record<string, any> = { ...entity };
  result.createdAt = entity.createdAt.toISOString();
  result.updatedAt = entity.updatedAt.toISOString();
  if (entity.dueDate) result.dueDate = entity.dueDate.toISOString();
  if (entity.completedAt) result.completedAt = entity.completedAt.toISOString();
  return result;
}

/**
 * Convert plain object to entity
 */
export function plainObjectToEntity(obj: Record<string, any>): WorkflowEntity {
  const result: any = { ...obj };
  result.createdAt = new Date(obj.createdAt);
  result.updatedAt = new Date(obj.updatedAt);
  if (obj.dueDate) result.dueDate = new Date(obj.dueDate);
  if (obj.completedAt) result.completedAt = new Date(obj.completedAt);
  return result as WorkflowEntity;
}

/**
 * Convert relationship to plain object
 */
export function relationshipToPlainObject(relationship: WorkflowRelationship): Record<string, any> {
  const result: Record<string, any> = { ...relationship };
  result.createdAt = relationship.createdAt.toISOString();
  return result;
}

/**
 * Convert plain object to relationship
 */
export function plainObjectToRelationship(obj: Record<string, any>): WorkflowRelationship {
  const result: any = { ...obj };
  result.createdAt = new Date(obj.createdAt);
  return result as WorkflowRelationship;
}

/**
 * Graph utility functions
 */

/**
 * Calculate graph density
 */
export function calculateGraphDensity(
  entityCount: number,
  relationshipCount: number,
  directed: boolean = false
): number {
  if (entityCount < 2) return 0;
  
  const maxPossibleRelationships = directed 
    ? entityCount * (entityCount - 1)
    : (entityCount * (entityCount - 1)) / 2;
    
  return relationshipCount / maxPossibleRelationships;
}

/**
 * Calculate average degree
 */
export function calculateAverageDegree(
  entityCount: number,
  relationshipCount: number,
  directed: boolean = false
): number {
  if (entityCount === 0) return 0;
  
  return directed
    ? relationshipCount / entityCount
    : (2 * relationshipCount) / entityCount;
}

/**
 * Type validation utilities
 */

/**
 * Validate workflow entity
 */
export function validateWorkflowEntity(entity: WorkflowEntity): string[] {
  const errors: string[] = [];
  
  if (!entity.id) errors.push('Entity must have an ID');
  if (!entity.type) errors.push('Entity must have a type');
  if (!entity.title) errors.push('Entity must have a title');
  if (!(entity.createdAt instanceof Date)) errors.push('Entity must have a valid createdAt date');
  if (!(entity.updatedAt instanceof Date)) errors.push('Entity must have a valid updatedAt date');
  if (!Array.isArray(entity.childIds)) errors.push('Entity must have childIds array');
  if (!Array.isArray(entity.tags)) errors.push('Entity must have tags array');
  if (typeof entity.metadata !== 'object') errors.push('Entity must have metadata object');
  
  if (entity.priority !== undefined && (entity.priority < 1 || entity.priority > 5)) {
    errors.push('Entity priority must be between 1 and 5');
  }
  
  return errors;
}

/**
 * Validate workflow relationship
 */
export function validateWorkflowRelationship(relationship: WorkflowRelationship): string[] {
  const errors: string[] = [];
  
  if (!relationship.id) errors.push('Relationship must have an ID');
  if (!relationship.sourceId) errors.push('Relationship must have a sourceId');
  if (!relationship.targetId) errors.push('Relationship must have a targetId');
  if (!relationship.type) errors.push('Relationship must have a type');
  if (typeof relationship.strength !== 'number' || relationship.strength < 0 || relationship.strength > 1) {
    errors.push('Relationship strength must be a number between 0 and 1');
  }
  if (typeof relationship.bidirectional !== 'boolean') errors.push('Relationship must have bidirectional boolean');
  if (!(relationship.createdAt instanceof Date)) errors.push('Relationship must have a valid createdAt date');
  if (typeof relationship.metadata !== 'object') errors.push('Relationship must have metadata object');
  if (typeof relationship.confidence !== 'number' || relationship.confidence < 0 || relationship.confidence > 1) {
    errors.push('Relationship confidence must be a number between 0 and 1');
  }
  
  return errors;
}
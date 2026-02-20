/**
 * Phase 25: Workflow Intelligence Layer
 * Workflow Graph Type Definitions
 *
 * Defines types for workflow graph operations, traversal, analysis,
 * and context‑aware workflow modelling.
 */

import type { WorkflowContext } from './WorkflowTypes';

/**
 * Graph traversal direction
 */
export type GraphTraversalDirection =
  | 'forward'      // Follow relationships from source to target
  | 'backward'     // Follow relationships from target to source
  | 'bidirectional'; // Follow relationships in both directions

/**
 * Graph traversal algorithm
 */
export type GraphTraversalAlgorithm =
  | 'breadth-first'    // Breadth‑first search
  | 'depth-first'      // Depth‑first search
  | 'shortest-path'    // Shortest path algorithm
  | 'all-paths'        // Find all paths
  | 'connected-components' // Find connected components
  | 'community-detection'; // Detect communities

/**
 * Graph traversal request
 */
export interface GraphTraversalRequest {
  /** Starting entity IDs */
  startEntityIds: string[];
  /** Traversal direction */
  direction: GraphTraversalDirection;
  /** Traversal algorithm */
  algorithm: GraphTraversalAlgorithm;
  /** Maximum depth */
  maxDepth?: number;
  /** Maximum nodes to visit */
  maxNodes?: number;
  /** Relationship types to include */
  includeRelationshipTypes?: string[];
  /** Relationship types to exclude */
  excludeRelationshipTypes?: string[];
  /** Entity types to include */
  includeEntityTypes?: string[];
  /** Entity types to exclude */
  excludeEntityTypes?: string[];
  /** Filter function (optional) */
  filter?: (entity: any, relationship: any) => boolean;
}

/**
 * Graph traversal result
 */
export interface GraphTraversalResult {
  /** Visited entity IDs in traversal order */
  visitedEntityIds: string[];
  /** Visited relationship IDs */
  visitedRelationshipIds: string[];
  /** Paths found (for path‑finding algorithms) */
  paths: Array<{
    /** Path ID */
    pathId: string;
    /** Entity IDs in path */
    entityIds: string[];
    /** Relationship IDs in path */
    relationshipIds: string[];
    /** Path length */
    length: number;
    /** Path weight (if weighted) */
    weight?: number;
  }>;
  /** Statistics */
  statistics: {
    /** Total entities visited */
    totalEntities: number;
    /** Total relationships visited */
    totalRelationships: number;
    /** Maximum depth reached */
    maxDepth: number;
    /** Processing time in milliseconds */
    processingTimeMs: number;
    /** Memory usage */
    memoryUsageBytes?: number;
  };
  /** Traversal metadata */
  metadata: Record<string, any>;
}

/**
 * Graph analysis request
 */
export interface GraphAnalysisRequest {
  /** Entity IDs to analyze (empty for entire graph) */
  entityIds?: string[];
  /** Analysis types to perform */
  analysisTypes: GraphAnalysisType[];
  /** Options for each analysis type */
  options?: Record<string, any>;
}

/**
 * Graph analysis type
 */
export type GraphAnalysisType =
  | 'centrality'          // Centrality measures
  | 'community-detection' // Community detection
  | 'clustering'          // Clustering coefficients
  | 'density'             // Graph density
  | 'diameter'            // Graph diameter
  | 'connectivity'        // Connectivity analysis
  | 'bridges'             // Bridge detection
  | 'articulation-points' // Articulation points
  | 'cycles'              // Cycle detection
  | 'subgraphs'           // Subgraph extraction
  | 'similarity'          // Entity similarity
  | 'influence'           // Influence analysis;

/**
 * Graph analysis result
 */
export interface GraphAnalysisResult {
  /** Analysis metadata */
  metadata: {
    /** When analysis was performed */
    timestamp: Date;
    /** Analysis types performed */
    analysisTypes: GraphAnalysisType[];
    /** Processing time in milliseconds */
    processingTimeMs: number;
    /** Graph statistics */
    statistics: {
      /** Total entities */
      totalEntities: number;
      /** Total relationships */
      totalRelationships: number;
      /** Average degree */
      averageDegree: number;
      /** Graph density */
      density: number;
    };
  };
  
  /** Centrality analysis */
  centrality?: {
    /** Degree centrality */
    degreeCentrality: Map<string, number>;
    /** Betweenness centrality */
    betweennessCentrality: Map<string, number>;
    /** Closeness centrality */
    closenessCentrality: Map<string, number>;
    /** Eigenvector centrality */
    eigenvectorCentrality: Map<string, number>;
    /** PageRank */
    pageRank: Map<string, number>;
    /** Most central entities */
    mostCentralEntities: Array<{
      entityId: string;
      centralityType: string;
      score: number;
    }>;
  };
  
  /** Community detection */
  communityDetection?: {
    /** Detected communities */
    communities: Array<{
      communityId: string;
      entityIds: string[];
      size: number;
      density: number;
      modularity: number;
      description?: string;
    }>;
    /** Modularity score */
    modularity: number;
    /** Number of communities */
    communityCount: number;
    /** Largest community */
    largestCommunity: {
      communityId: string;
      size: number;
    };
    /** Community relationships */
    communityRelationships: Array<{
      sourceCommunityId: string;
      targetCommunityId: string;
      relationshipCount: number;
      strength: number;
    }>;
  };
  
  /** Clustering analysis */
  clustering?: {
    /** Global clustering coefficient */
    globalClusteringCoefficient: number;
    /** Local clustering coefficients */
    localClusteringCoefficients: Map<string, number>;
    /** Average clustering coefficient */
    averageClusteringCoefficient: number;
    /** Highly clustered entities */
    highlyClusteredEntities: Array<{
      entityId: string;
      clusteringCoefficient: number;
    }>;
  };
  
  /** Connectivity analysis */
  connectivity?: {
    /** Is graph connected? */
    isConnected: boolean;
    /** Number of connected components */
    connectedComponents: number;
    /** Size of largest component */
    largestComponentSize: number;
    /** Articulation points */
    articulationPoints: string[];
    /** Bridges */
    bridges: Array<{
      relationshipId: string;
      sourceId: string;
      targetId: string;
    }>;
    /** Graph diameter */
    diameter: number;
    /** Average path length */
    averagePathLength: number;
  };
  
  /** Cycle detection */
  cycles?: {
    /** Detected cycles */
    cycles: Array<{
      cycleId: string;
      entityIds: string[];
      length: number;
      isSimple: boolean;
      isDirected: boolean;
    }>;
    /** Number of cycles */
    cycleCount: number;
    /** Shortest cycle length */
    shortestCycleLength: number;
    /** Longest cycle length */
    longestCycleLength: number;
  };
  
  /** Subgraph extraction */
  subgraphs?: {
    /** Extracted subgraphs */
    subgraphs: Array<{
      subgraphId: string;
      entityIds: string[];
      relationshipIds: string[];
      density: number;
      diameter: number;
      description?: string;
    }>;
    /** Subgraph statistics */
    statistics: {
      totalSubgraphs: number;
      averageSubgraphSize: number;
      largestSubgraphSize: number;
    };
  };
  
  /** Similarity analysis */
  similarity?: {
    /** Entity similarity matrix */
    similarityMatrix: Map<string, Map<string, number>>;
    /** Most similar entity pairs */
    mostSimilarPairs: Array<{
      entityId1: string;
      entityId2: string;
      similarity: number;
      reasons: string[];
    }>;
    /** Entity clusters by similarity */
    similarityClusters: Array<{
      clusterId: string;
      entityIds: string[];
      averageSimilarity: number;
      description?: string;
    }>;
  };
  
  /** Influence analysis */
  influence?: {
    /** Influence scores */
    influenceScores: Map<string, number>;
    /** Most influential entities */
    mostInfluentialEntities: Array<{
      entityId: string;
      influenceScore: number;
      reach: number; // Number of entities influenced
    }>;
    /** Influence propagation paths */
    influencePaths: Array<{
      sourceId: string;
      targetId: string;
      path: string[];
      strength: number;
    }>;
    /** Influence communities */
    influenceCommunities: Array<{
      communityId: string;
      entityIds: string[];
      internalInfluence: number;
      externalInfluence: number;
    }>;
  };
}

/**
 * Context‑aware workflow request
 */
export interface ContextAwareWorkflowRequest {
  /** Current context */
  context: WorkflowContext;
  /** User intent */
  userIntent?: string;
  /** Available actions */
  availableActions?: string[];
  /** Constraints */
  constraints?: {
    timeLimitMinutes?: number;
    resourceLimits?: Record<string, any>;
    priorityLevel?: 'low' | 'medium' | 'high' | 'critical';
  };
  /** Options */
  options?: {
    /** Include explanations */
    includeExplanations?: boolean;
    /** Include alternatives */
    includeAlternatives?: boolean;
    /** Include confidence scores */
    includeConfidence?: boolean;
    /** Maximum recommendations */
    maxRecommendations?: number;
  };
}

/**
 * Context‑aware workflow result
 */
export interface ContextAwareWorkflowResult {
  /** Recommended actions */
  recommendedActions: Array<{
    /** Action description */
    action: string;
    /** Entity ID (if specific) */
    entityId?: string;
    /** Confidence (0-1) */
    confidence: number;
    /** Expected value */
    expectedValue: 'low' | 'medium' | 'high' | 'very-high';
    /** Estimated time to complete */
    estimatedTimeMinutes?: number;
    /** Prerequisites */
    prerequisites: string[];
    /** Expected outcomes */
    expectedOutcomes: string[];
    /** Risk assessment */
    riskAssessment: 'low' | 'medium' | 'high';
  }>;
  
  /** Context insights */
  contextInsights: Array<{
    /** Insight type */
    type: 'pattern' | 'opportunity' | 'risk' | 'constraint' | 'dependency';
    /** Insight text */
    insight: string;
    /** Relevance (0-1) */
    relevance: number;
    /** Impact */
    impact: 'low' | 'medium' | 'high';
    /** Actionability */
    actionability: 'theoretical' | 'actionable' | 'immediately-actionable';
  }>;
  
  /** Workflow adjustments */
  workflowAdjustments: Array<{
    /** Adjustment type */
    type: 'priority-change' | 'dependency-adjustment' | 'resource-reallocation' | 'timeline-adjustment';
    /** Adjustment description */
    description: string;
    /** Rationale */
    rationale: string;
    /** Expected benefit */
    expectedBenefit: 'minor' | 'moderate' | 'major';
    /** Implementation complexity */
    implementationComplexity: 'low' | 'medium' | 'high';
  }>;
  
  /** Predictive insights */
  predictiveInsights: Array<{
    /** Prediction type */
    type: 'bottleneck' | 'opportunity' | 'risk' | 'completion' | 'quality';
    /** Prediction text */
    prediction: string;
    /** Timeframe */
    timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
    /** Confidence (0-1) */
    confidence: number;
    /** Recommended action */
    recommendedAction?: string;
  }>;
  
  /** Overall assessment */
  assessment: {
    /** Context appropriateness score (0-100) */
    contextAppropriatenessScore: number;
    /** Workflow efficiency score (0-100) */
    workflowEfficiencyScore: number;
    /** Risk level */
    riskLevel: 'low' | 'medium' | 'high';
    /** Confidence in recommendations */
    confidence: number; // 0-1
    /** Limitations */
    limitations: string[];
  };
}

/**
 * Workflow graph operations
 */

/**
 * Graph operation type
 */
export type GraphOperationType =
  | 'add-entity'
  | 'remove-entity'
  | 'update-entity'
  | 'add-relationship'
  | 'remove-relationship'
  | 'update-relationship'
  | 'merge-graphs'
  | 'extract-subgraph'
  | 'filter-graph'
  | 'transform-graph';

/**
 * Graph operation
 */
export interface GraphOperation {
  /** Operation ID */
  id: string;
  /** Operation type */
  type: GraphOperationType;
  /** Parameters */
  parameters: Record<string, any>;
  /** Timestamp */
  timestamp: Date;
  /** User or system that initiated operation */
  initiatedBy: string;
  /** Result (if completed) */
  result?: any;
  /** Error (if failed) */
  error?: string;
  /** Status */
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
}

/**
 * Graph operation batch
 */
export interface GraphOperationBatch {
  /** Batch ID */
  id: string;
  /** Operations */
  operations: GraphOperation[];
  /** Batch metadata */
  metadata: Record<string, any>;
  /** Status */
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'partially-completed';
  /** Results */
  results?: Array<{
    operationId: string;
    success: boolean;
    result?: any;
    error?: string;
  }>;
  /** Statistics */
  statistics?: {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    totalTimeMs: number;
    averageTimePerOperationMs: number;
  };
}

/**
 * Type utilities
 */

/**
 * Check if value is a GraphTraversalRequest
 */
export function isGraphTraversalRequest(value: any): value is GraphTraversalRequest {
  return (
    value &&
    typeof value === 'object' &&
    Array.isArray(value.startEntityIds) &&
    typeof value.direction === 'string' &&
    typeof value.algorithm === 'string'
  );
}

/**
 * Check if value is a GraphAnalysisRequest
 */
export function isGraphAnalysisRequest(value: any): value is GraphAnalysisRequest {
  return (
    value &&
    typeof value === 'object' &&
    Array.isArray(value.analysisTypes)
  );
}

/**
 * Check if value is a ContextAwareWorkflowRequest
 */
export function isContextAwareWorkflowRequest(value: any): value is ContextAwareWorkflowRequest {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.context === 'object'
  );
}

/**
 * Create a default graph traversal request
 */
export function createDefaultGraphTraversalRequest(
  startEntityIds: string[],
  options: Partial<GraphTraversalRequest> = {}
): GraphTraversalRequest {
  return {
    startEntityIds,
    direction: 'forward',
    algorithm: 'breadth-first',
    maxDepth: 3,
    maxNodes: 100,
    ...options
  };
}

/**
 * Create a default graph analysis request
 */
export function createDefaultGraphAnalysisRequest(
  analysisTypes: GraphAnalysisType[],
  options: Partial<GraphAnalysisRequest> = {}
): GraphAnalysisRequest {
  return {
    analysisTypes,
    options: {},
    ...options
  };
}

/**
 * Create a default context‑aware workflow request
 */
export function createDefaultContextAwareWorkflowRequest(
  context: WorkflowContext,
  options: Partial<ContextAwareWorkflowRequest> = {}
): ContextAwareWorkflowRequest {
  return {
    context,
    options: {
      includeExplanations: true,
      includeAlternatives: true,
      includeConfidence: true,
      maxRecommendations: 5,
      ...options.options
    },
    ...options
  };
}
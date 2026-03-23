/**
 * Consistency Detector for Knowledge Graph
 * 
 * PHASE 32.5 — Knowledge Graph Layer
 * Detects inconsistencies, conflicts, and issues in knowledge graph entities and relationships.
 */

import type {
  ConsistencyIssue,
  ConsistencyDetectionResult,
  KnowledgeEntity,
  KnowledgeRelationship,
  EntityType,
  RelationshipType
} from './knowledge-graph-types.js';

/**
 * Consistency Detector for knowledge graph validation
 * 
 * Features:
 * - Detect entity conflicts (same entity, different names/types)
 * - Detect relationship inconsistencies
 * - Identify ambiguous entities
 * - Find missing information
 * - Calculate graph health score
 */
export class ConsistencyDetector {
  /**
   * Detect consistency issues in knowledge graph
   */
  public detectIssues(
    entities: KnowledgeEntity[],
    relationships: KnowledgeRelationship[]
  ): ConsistencyDetectionResult {
    const startTime = performance.now();

    const issues: ConsistencyIssue[] = [];

    // Detect entity conflicts
    const entityConflicts = this.detectEntityConflicts(entities);
    issues.push(...entityConflicts);

    // Detect relationship inconsistencies
    const relationshipIssues = this.detectRelationshipIssues(entities, relationships);
    issues.push(...relationshipIssues);

    // Detect missing information
    const missingInfoIssues = this.detectMissingInformation(entities, relationships);
    issues.push(...missingInfoIssues);

    // Calculate statistics
    const issuesBySeverity = this.calculateIssuesBySeverity(issues);
    const healthScore = this.calculateHealthScore(issues);

    const processingTime = performance.now() - startTime;

    return {
      issues,
      totalIssues: issues.length,
      issuesBySeverity,
      processingTime,
      healthScore
    };
  }

  /**
   * Detect entity conflicts (same entity with different names/types)
   */
  private detectEntityConflicts(entities: KnowledgeEntity[]): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];

    // Group entities by normalized name
    const nameGroups = new Map<string, KnowledgeEntity[]>();
    for (const entity of entities) {
      const normalized = entity.name.toLowerCase().replace(/\s+/g, '_');
      if (!nameGroups.has(normalized)) {
        nameGroups.set(normalized, []);
      }
      nameGroups.get(normalized)!.push(entity);
    }

    // Check for conflicts within each group
    for (const entry of Array.from(nameGroups.entries())) {
      const [normalizedName, group] = entry;
      if (group.length > 1) {
        // Same name, different types detected
        const types = new Set(group.map(e => e.type));
        if (types.size > 1) {
          const entityNames = group.map(e => e.name).join(', ');
          const typesList = Array.from(types).join(', ');
          
          issues.push({
            id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'conflict',
            severity: 'medium',
            description: `Multiple entities with the same name but different types detected: "${entityNames}". Types: ${typesList}`,
            affectedEntities: group.map(e => e.id),
            affectedRelationships: undefined,
            suggestedResolution: 'Merge entities into a single entity or clarify entity types',
            sourceDocuments: group.flatMap(e => e.sourceDocuments || []),
            detectedAt: new Date()
          });
        }

        // Same name, different aliases
        const aliasGroups = new Map<string, KnowledgeEntity[]>();
        for (const entity of group) {
          for (const alias of entity.aliases || []) {
            const normalizedAlias = alias.toLowerCase().replace(/\s+/g, '_');
            if (!aliasGroups.has(normalizedAlias)) {
              aliasGroups.set(normalizedAlias, []);
            }
            aliasGroups.get(normalizedAlias)!.push(entity);
          }
        }

        for (const entry of Array.from(aliasGroups.entries())) {
          const [alias, aliasGroup] = entry;
          if (aliasGroup.length > 1) {
            const entityNames = aliasGroup.map(e => e.name).join(', ');
            
            issues.push({
              id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'conflict',
              severity: 'low',
              description: `Multiple entities share the same alias: "${alias}". Entities: ${entityNames}`,
              affectedEntities: aliasGroup.map(e => e.id),
              affectedRelationships: undefined,
              suggestedResolution: 'Merge entities or use unique aliases',
              sourceDocuments: aliasGroup.flatMap(e => e.sourceDocuments || []),
              detectedAt: new Date()
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Detect relationship inconsistencies
   */
  private detectRelationshipIssues(
    entities: KnowledgeEntity[],
    relationships: KnowledgeRelationship[]
  ): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];

    // Build entity lookup map
    const entityMap = new Map<string, KnowledgeEntity>();
    for (const entity of entities) {
      entityMap.set(entity.id, entity);
    }

    // Check for relationships with non-existent entities
    for (const relationship of relationships) {
      const sourceEntity = entityMap.get(relationship.sourceId);
      const targetEntity = entityMap.get(relationship.targetId);

      if (!sourceEntity) {
        issues.push({
          id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'missing',
          severity: 'high',
          description: `Relationship "${relationship.type}" from non-existent source entity: ${relationship.sourceId}`,
          affectedEntities: [relationship.sourceId],
          affectedRelationships: [relationship.id],
          suggestedResolution: 'Remove relationship or create missing source entity',
          sourceDocuments: relationship.sourceDocuments,
          detectedAt: new Date()
        });
      }

      if (!targetEntity) {
        issues.push({
          id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'missing',
          severity: 'high',
          description: `Relationship "${relationship.type}" to non-existent target entity: ${relationship.targetId}`,
          affectedEntities: [relationship.targetId],
          affectedRelationships: [relationship.id],
          suggestedResolution: 'Remove relationship or create missing target entity',
          sourceDocuments: relationship.sourceDocuments,
          detectedAt: new Date()
        });
      }
    }

    // Check for circular relationships
    const circularRelationships = this.detectCircularRelationships(relationships);
    issues.push(...circularRelationships);

    // Check for duplicate relationships
    const duplicateRelationships = this.detectDuplicateRelationships(relationships);
    issues.push(...duplicateRelationships);

    return issues;
  }

  /**
   * Detect circular relationships
   */
  private detectCircularRelationships(
    relationships: KnowledgeRelationship[]
  ): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];
    const circularPaths: string[][] = [];

    // Build adjacency list
    const adjacency = new Map<string, string[]>();
    for (const rel of relationships) {
      if (!adjacency.has(rel.sourceId)) {
        adjacency.set(rel.sourceId, []);
      }
      adjacency.get(rel.sourceId)!.push(rel.targetId);
    }

    // Detect cycles using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    function dfs(node: string, path: string[]): void {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = adjacency.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path]);
        } else if (recursionStack.has(neighbor)) {
          // Found a cycle
          const cyclePath = path.slice(path.indexOf(neighbor));
          circularPaths.push(cyclePath);
        }
      }

      recursionStack.delete(node);
    }

    for (const entityId of Array.from(adjacency.keys())) {
      if (!visited.has(entityId)) {
        dfs(entityId, []);
      }
    }

    // Report circular relationships
    for (const cycle of circularPaths) {
      if (cycle.length > 2) {
        const cycleString = cycle.map(id => id.substring(0, 8)).join(' → ');
        issues.push({
          id: `circular_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'inconsistency',
          severity: 'high',
          description: `Circular relationship detected: ${cycleString}`,
          affectedEntities: cycle,
          affectedRelationships: undefined,
          suggestedResolution: 'Break the circular relationship by removing or modifying one of the connections',
          sourceDocuments: undefined,
          detectedAt: new Date()
        });
      }
    }

    return issues;
  }

  /**
   * Detect duplicate relationships
   */
  private detectDuplicateRelationships(
    relationships: KnowledgeRelationship[]
  ): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];

    // Group relationships by source-target-type
    const keyGroups = new Map<string, KnowledgeRelationship[]>();
    for (const rel of relationships) {
      const key = `${rel.sourceId}-${rel.targetId}-${rel.type}`;
      if (!keyGroups.has(key)) {
        keyGroups.set(key, []);
      }
      keyGroups.get(key)!.push(rel);
    }

    // Report duplicates
    for (const entry of Array.from(keyGroups.entries())) {
      const [key, group] = entry;
      if (group.length > 1) {
        issues.push({
          id: `duplicate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'inconsistency',
          severity: 'medium',
          description: `Duplicate relationship detected: ${key}`,
          affectedEntities: [group[0].sourceId, group[0].targetId],
          affectedRelationships: group.map(r => r.id),
          suggestedResolution: 'Remove duplicate relationships, keeping the one with highest strength',
          sourceDocuments: group[0].sourceDocuments,
          detectedAt: new Date()
        });
      }
    }

    return issues;
  }

  /**
   * Detect missing information
   */
  private detectMissingInformation(
    entities: KnowledgeEntity[],
    relationships: KnowledgeRelationship[]
  ): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];

    // Check for entities without descriptions
    const entitiesWithoutDescriptions = entities.filter(e => !e.description || e.description.trim() === '');
    if (entitiesWithoutDescriptions.length > 0) {
      issues.push({
        id: `missing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'missing',
        severity: 'low',
        description: `${entitiesWithoutDescriptions.length} entity(ies) without descriptions`,
        affectedEntities: entitiesWithoutDescriptions.map(e => e.id),
        affectedRelationships: undefined,
        suggestedResolution: 'Add descriptions to improve entity clarity',
        sourceDocuments: entitiesWithoutDescriptions.flatMap(e => e.sourceDocuments || []),
        detectedAt: new Date()
      });
    }

    // Check for entities without confidence scores
    const entitiesWithoutConfidence = entities.filter(e => e.confidence === undefined || e.confidence === null);
    if (entitiesWithoutConfidence.length > 0) {
      issues.push({
        id: `missing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'missing',
        severity: 'low',
        description: `${entitiesWithoutConfidence.length} entity(ies) without confidence scores`,
        affectedEntities: entitiesWithoutConfidence.map(e => e.id),
        affectedRelationships: undefined,
        suggestedResolution: 'Add confidence scores to improve entity reliability',
        sourceDocuments: entitiesWithoutConfidence.flatMap(e => e.sourceDocuments || []),
        detectedAt: new Date()
      });
    }

    // Check for relationships without strength scores
    const relationshipsWithoutStrength = relationships.filter(r => r.strength === undefined || r.strength === null);
    if (relationshipsWithoutStrength.length > 0) {
      issues.push({
        id: `missing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'missing',
        severity: 'low',
        description: `${relationshipsWithoutStrength.length} relationship(ies) without strength scores`,
        affectedEntities: relationshipsWithoutStrength.map(r => [r.sourceId, r.targetId]).flat(),
        affectedRelationships: relationshipsWithoutStrength.map(r => r.id),
        suggestedResolution: 'Add strength scores to improve relationship reliability',
        sourceDocuments: relationshipsWithoutStrength.flatMap(r => r.sourceDocuments || []),
        detectedAt: new Date()
      });
    }

    return issues;
  }

  /**
   * Calculate issues by severity
   */
  private calculateIssuesBySeverity(issues: ConsistencyIssue[]): {
    critical: number;
    high: number;
    medium: number;
    low: number;
  } {
    const result = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          result.critical++;
          break;
        case 'high':
          result.high++;
          break;
        case 'medium':
          result.medium++;
          break;
        case 'low':
          result.low++;
          break;
      }
    }

    return result;
  }

  /**
   * Calculate graph health score
   */
  private calculateHealthScore(issues: ConsistencyIssue[]): number {
    if (issues.length === 0) {
      return 1;
    }

    // Higher severity issues have more impact
    const severityWeights = {
      critical: 0.5,
      high: 0.3,
      medium: 0.15,
      low: 0.05
    };

    let totalWeight = 0;
    for (const issue of issues) {
      totalWeight += severityWeights[issue.severity] || 0;
    }

    // Health score is 1 - total weight
    return Math.max(0, 1 - totalWeight);
  }

  /**
   * Get issues by type
   */
  public getIssuesByType(issues: ConsistencyIssue[]): {
    conflict: number;
    inconsistency: number;
    ambiguity: number;
    missing: number;
  } {
    const result = {
      conflict: 0,
      inconsistency: 0,
      ambiguity: 0,
      missing: 0
    };

    for (const issue of issues) {
      switch (issue.type) {
        case 'conflict':
          result.conflict++;
          break;
        case 'inconsistency':
          result.inconsistency++;
          break;
        case 'ambiguity':
          result.ambiguity++;
          break;
        case 'missing':
          result.missing++;
          break;
      }
    }

    return result;
  }

  /**
   * Get issues by entity
   */
  public getIssuesByEntity(issues: ConsistencyIssue[]): Map<string, ConsistencyIssue[]> {
    const result = new Map<string, ConsistencyIssue[]>();

    for (const issue of issues) {
      for (const entityId of issue.affectedEntities) {
        if (!result.has(entityId)) {
          result.set(entityId, []);
        }
        result.get(entityId)!.push(issue);
      }
    }

    return result;
  }
}

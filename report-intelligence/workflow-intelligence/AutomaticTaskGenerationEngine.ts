/**
 * Phase 25: Workflow Intelligence Layer
 * Automatic Task Generation Engine
 * 
 * Generates actionable tasks from:
 * 1. Notes and observations
 * 2. Reports and documents
 * 3. Media content (images, PDFs, audio)
 * 4. Existing workflow patterns
 * 5. Cross‑entity intelligence
 */

import type {
  WorkflowEntity,
  WorkflowRelationship,
  WorkflowGraph,
  WorkflowContext,
  TaskGenerationRequest,
  TaskGenerationResult,
  WorkflowEntityType
} from './types';

/**
 * Analysis Types
 */

interface SourceContentAnalysis {
  sourceCount: number;
  contentLength: number;
  keyTopics: Set<string>;
  actionableItems: Array<{
    action: string;
    sourceEntityId: string;
    confidence: number;
  }>;
  deadlines: Array<{
    date: Date;
    sourceEntityId: string;
    context: string;
  }>;
  priorities: Array<{
    priority: number;
    sourceEntityId: string;
    context: string;
  }>;
  relationships: WorkflowRelationship[];
}

interface CompletedTaskAnalysis {
  completedTasks: WorkflowEntity[];
  relatedEntities: WorkflowEntity[];
  patterns: string[];
  followUpOpportunities: Array<{
    type: string;
    description: string;
    priority: number;
  }>;
}

interface MediaContentAnalysis {
  mediaEntities: WorkflowEntity[];
  extractedText?: string;
  detectedStructure?: any;
  inferredActions: string[];
  confidence: number;
}

/**
 * Automatic Task Generation Engine
 * 
 * Analyzes content from various sources and generates structured,
 * actionable tasks with dependencies, priorities, and estimated timelines.
 */
export class AutomaticTaskGenerationEngine {
  private graph: WorkflowGraph;
  
  constructor(graph: WorkflowGraph) {
    this.graph = graph;
  }
  
  /**
   * Generate tasks from a single source entity
   */
  async generateTasksFromEntity(request: TaskGenerationRequest): Promise<TaskGenerationResult> {
    const startTime = Date.now();
    
    // Get source entities
    const sourceEntities = request.sourceEntityIds
      .map(id => this.graph.entities.get(id))
      .filter((entity): entity is WorkflowEntity => entity !== undefined);
    
    if (sourceEntities.length === 0) {
      throw new Error('No valid source entities found');
    }
    
    // Analyze source content
    const analysis = this.analyzeSourceContent(sourceEntities, request.targetEntityType);
    
    // Generate tasks based on analysis
    const tasks = this.generateTasksFromAnalysis(analysis, request);
    
    // Generate dependencies between tasks
    const dependencies = this.generateTaskDependencies(tasks, analysis);
    
    // Calculate overall metrics
    const overallPriority = this.calculateOverallPriority(tasks);
    const estimatedTotalTimeMinutes = this.calculateTotalEstimatedTime(tasks);
    const confidence = this.calculateGenerationConfidence(analysis, tasks);
    
    // Generate warnings
    const warnings = this.generateWarnings(analysis, tasks);
    
    const endTime = Date.now();
    
    return {
      tasks,
      dependencies,
      overallPriority,
      estimatedTotalTimeMinutes,
      confidence,
      warnings,
      metadata: {
        sourceEntityCount: sourceEntities.length,
        sourceEntityTypes: [...new Set(sourceEntities.map(e => e.type))],
        processingTimeMs: endTime - startTime,
        generationMethod: 'automatic-analysis',
        timestamp: new Date()
      }
    };
  }
  
  /**
   * Generate tasks from multiple sources with cross‑source intelligence
   */
  async generateTasksFromMultipleSources(
    sourceGroups: Array<{ entityIds: string[]; context: string }>,
    targetEntityType: WorkflowEntityType,
    options?: {
      mergeSimilarTasks?: boolean;
      prioritizeBySource?: boolean;
      includeCrossSourceDependencies?: boolean;
    }
  ): Promise<TaskGenerationResult> {
    const allTasks: WorkflowEntity[] = [];
    const allDependencies: WorkflowRelationship[] = [];
    const warnings: string[] = [];
    
    let totalConfidence = 0;
    let resultCount = 0;
    
    // Generate tasks from each source group
    for (const group of sourceGroups) {
      try {
        const request: TaskGenerationRequest = {
          sourceEntityIds: group.entityIds,
          targetEntityType,
          context: {
            projectId: undefined,
            focusedEntityId: group.entityIds[0],
            recentEntityIds: group.entityIds,
            userIntent: group.context,
            availableActions: [],
            metadata: { sourceGroup: group.context },
            timestamp: new Date()
          },
          options: {
            maxTasks: options?.mergeSimilarTasks ? 10 : 5,
            includeDependencies: true,
            includeEstimatedTime: true,
            priorityLevel: 'medium'
          }
        };
        
        const result = await this.generateTasksFromEntity(request);
        
        // Merge tasks and dependencies
        allTasks.push(...result.tasks);
        allDependencies.push(...result.dependencies);
        warnings.push(...result.warnings);
        
        totalConfidence += result.confidence;
        resultCount++;
      } catch (error) {
        warnings.push(`Failed to generate tasks from source group "${group.context}": ${error}`);
      }
    }
    
    // Merge similar tasks if requested
    const finalTasks = options?.mergeSimilarTasks
      ? this.mergeSimilarTasks(allTasks)
      : allTasks;
    
    // Generate cross‑source dependencies if requested
    const finalDependencies = options?.includeCrossSourceDependencies
      ? [...allDependencies, ...this.generateCrossSourceDependencies(finalTasks, sourceGroups)]
      : allDependencies;
    
    // Calculate overall metrics
    const overallPriority = this.calculateOverallPriority(finalTasks);
    const estimatedTotalTimeMinutes = this.calculateTotalEstimatedTime(finalTasks);
    const confidence = resultCount > 0 ? totalConfidence / resultCount : 0;
    
    return {
      tasks: finalTasks,
      dependencies: finalDependencies,
      overallPriority,
      estimatedTotalTimeMinutes,
      confidence,
      warnings,
      metadata: {
        sourceGroupCount: sourceGroups.length,
        mergedTasks: options?.mergeSimilarTasks ? allTasks.length - finalTasks.length : 0,
        crossSourceDependencies: options?.includeCrossSourceDependencies ? finalDependencies.length - allDependencies.length : 0,
        generationMethod: 'multi-source-analysis',
        timestamp: new Date()
      }
    };
  }
  
  /**
   * Generate follow‑up tasks based on existing task completion
   */
  async generateFollowUpTasks(
    completedTaskIds: string[],
    options?: {
      includeRelatedEntities?: boolean;
      depth?: number;
      priorityBoost?: boolean;
    }
  ): Promise<TaskGenerationResult> {
    const completedTasks = completedTaskIds
      .map(id => this.graph.entities.get(id))
      .filter((task): task is WorkflowEntity => task !== undefined && task.type === 'task');
    
    if (completedTasks.length === 0) {
      throw new Error('No valid completed tasks found');
    }
    
    // Analyze completed tasks for follow‑up opportunities
    const followUpAnalysis = this.analyzeCompletedTasks(completedTasks, options?.depth || 1);
    
    // Generate follow‑up tasks
    const tasks = this.generateFollowUpTasksFromAnalysis(followUpAnalysis, options);
    
    // Generate dependencies linking to completed tasks
    const dependencies = this.generateFollowUpDependencies(tasks, completedTasks);
    
    // Apply priority boost if requested
    if (options?.priorityBoost) {
      tasks.forEach(task => {
        if (task.priority && task.priority > 1) {
          task.priority = task.priority - 1; // Increase priority (lower number = higher priority)
        }
      });
    }
    
    return {
      tasks,
      dependencies,
      overallPriority: this.calculateOverallPriority(tasks),
      estimatedTotalTimeMinutes: this.calculateTotalEstimatedTime(tasks),
      confidence: this.calculateFollowUpConfidence(completedTasks, tasks),
      warnings: this.generateFollowUpWarnings(completedTasks, tasks),
      metadata: {
        completedTaskCount: completedTasks.length,
        followUpDepth: options?.depth || 1,
        priorityBoostApplied: options?.priorityBoost || false,
        generationMethod: 'follow-up-analysis',
        timestamp: new Date()
      }
    };
  }
  
  /**
   * Generate tasks from media content (images, PDFs, audio)
   */
  async generateTasksFromMedia(
    mediaEntityIds: string[],
    options?: {
      extractText?: boolean;
      analyzeStructure?: boolean;
      inferActions?: boolean;
    }
  ): Promise<TaskGenerationResult> {
    const mediaEntities = mediaEntityIds
      .map(id => this.graph.entities.get(id))
      .filter((entity): entity is WorkflowEntity => 
        entity !== undefined && 
        (entity.type === 'media' || entity.tags.includes('media'))
      );
    
    if (mediaEntities.length === 0) {
      throw new Error('No valid media entities found');
    }
    
    // Analyze media content
    const mediaAnalysis = this.analyzeMediaContent(mediaEntities, options);
    
    // Generate tasks from media analysis
    const tasks = this.generateTasksFromMediaAnalysis(mediaAnalysis);
    
    // Generate media‑specific dependencies
    const dependencies = this.generateMediaDependencies(tasks, mediaEntities);
    
    return {
      tasks,
      dependencies,
      overallPriority: this.calculateOverallPriority(tasks),
      estimatedTotalTimeMinutes: this.calculateTotalEstimatedTime(tasks),
      confidence: this.calculateMediaGenerationConfidence(mediaAnalysis, tasks),
      warnings: this.generateMediaWarnings(mediaAnalysis, tasks),
      metadata: {
        mediaEntityCount: mediaEntities.length,
        mediaTypes: [...new Set(mediaEntities.map(e => e.metadata?.mediaType || 'unknown'))],
        textExtraction: options?.extractText || false,
        structureAnalysis: options?.analyzeStructure || false,
        generationMethod: 'media-analysis',
        timestamp: new Date()
      }
    };
  }
  
  /**
   * Private helper methods
   */
  
  private analyzeSourceContent(
    sourceEntities: WorkflowEntity[],
    targetEntityType: WorkflowEntityType
  ): SourceContentAnalysis {
    const analysis: SourceContentAnalysis = {
      sourceCount: sourceEntities.length,
      contentLength: 0,
      keyTopics: new Set<string>(),
      actionableItems: [],
      deadlines: [],
      priorities: [],
      relationships: []
    };
    
    for (const entity of sourceEntities) {
      // Extract content
      if (entity.content) {
        analysis.contentLength += entity.content.length;
        
        // Extract key topics from content
        const topics = this.extractKeyTopics(entity.content);
        topics.forEach(topic => analysis.keyTopics.add(topic));
        
        // Extract actionable items
        const actions = this.extractActionableItems(entity.content);
        analysis.actionableItems.push(...actions.map(action => ({
          action,
          sourceEntityId: entity.id,
          confidence: 0.7
        })));
      }
      
      // Extract deadlines from entity metadata
      if (entity.dueDate) {
        analysis.deadlines.push({
          date: entity.dueDate,
          sourceEntityId: entity.id,
          context: entity.title
        });
      }
      
      // Extract priorities
      if (entity.priority) {
        analysis.priorities.push({
          priority: entity.priority,
          sourceEntityId: entity.id,
          context: entity.title
        });
      }
      
      // Extract relationships
      const entityRelationships = Array.from(this.graph.relationships.values())
        .filter(rel => rel.sourceId === entity.id || rel.targetId === entity.id);
      analysis.relationships.push(...entityRelationships);
    }
    
    return analysis;
  }
  
  private extractKeyTopics(content: string): string[] {
    // Simple keyword extraction (in a real implementation, this would use NLP)
    const keywords = new Set<string>();
    const words = content.toLowerCase().split(/\W+/).filter(w => w.length > 4);
    
    // Common actionable words
    const actionWords = ['implement', 'create', 'update', 'review', 'fix', 'add', 'remove', 'improve', 'test', 'document'];
    
    for (const word of words) {
      if (actionWords.some(action => word.includes(action))) {
        keywords.add(word);
      }
    }
    
    return Array.from(keywords).slice(0, 10); // Limit to top 10 keywords
  }
  
  private extractActionableItems(content: string): string[] {
    const actions: string[] = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Patterns that indicate actionable items
    const patterns = [
      /(?:need to|should|must|have to)\s+(\w+\s+\w+(?:\s+\w+){0,3})/gi,
      /(?:implement|create|update|review|fix|add|remove|improve|test|document)\s+(\w+(?:\s+\w+){0,4})/gi,
      /(?:todo|to do|action item|task):?\s*(.+?)(?=[.!?]|$)/gi
    ];
    
    for (const sentence of sentences) {
      for (const pattern of patterns) {
        const matches = [...sentence.matchAll(pattern)];
        for (const match of matches) {
          if (match[1]) {
            actions.push(match[1].trim());
          }
        }
      }
    }
    
    return [...new Set(actions)]; // Remove duplicates
  }
  
  private generateTasksFromAnalysis(
    analysis: SourceContentAnalysis,
    request: TaskGenerationRequest
  ): WorkflowEntity[] {
    const tasks: WorkflowEntity[] = [];
    const now = new Date();
    
    // Generate tasks from actionable items
    for (let i = 0; i < Math.min(analysis.actionableItems.length, request.options?.maxTasks || 10); i++) {
      const actionable = analysis.actionableItems[i];
      const title = this.formatTaskTitle(actionable.action, i + 1);
      
      // Determine priority
      const priority = this.determineTaskPriority(analysis, i);
      
      // Determine due date
      const dueDate = this.determineTaskDueDate(analysis, i, request);
      
      const task: WorkflowEntity = {
        id: `generated-task-${Date.now()}-${i}`,
        type: request.targetEntityType,
        title,
        content: `Generated from source entity: ${actionable.sourceEntityId}\n\nAction: ${actionable.action}`,
        createdAt: now,
        updatedAt: now,
        projectId: request.context.projectId,
        parentId: actionable.sourceEntityId,
        childIds: [],
        metadata: {
          generatedBy: 'AutomaticTaskGenerationEngine',
          sourceEntityId: actionable.sourceEntityId,
          confidence: actionable.confidence,
          generationContext: request.context.userIntent
        },
        tags: ['generated', 'automatic', request.targetEntityType],
        status: 'pending',
        priority,
        dueDate
      };
      
      tasks.push(task);
    }
    
    // If no actionable items were found, generate generic tasks
    if (tasks.length === 0 && analysis.keyTopics.size > 0) {
      const topics = Array.from(analysis.keyTopics).slice(0, 3);
      topics.forEach((topic, i) => {
        const task: WorkflowEntity = {
          id: `generated-task-${Date.now()}-generic-${i}`,
          type: request.targetEntityType,
          title: `Review: ${topic}`,
          content: `Generated based on topic analysis of source content.\n\nTopic: ${topic}`,
          createdAt: now,
          updatedAt: now,
          projectId: request.context.projectId,
          parentId: analysis.sourceCount > 0 ? request.sourceEntityIds[0] : undefined,
          childIds: [],
          metadata: {
            generatedBy: 'AutomaticTaskGenerationEngine',
            source: 'topic-analysis',
            generationContext: request.context.userIntent
          },
          tags: ['generated', 'automatic', 'topic-based', request.targetEntityType],
          status: 'pending',
          priority: 3,
          dueDate: this.getDefaultDueDate(now, i + 1)
        };
        
        tasks.push(task);
      });
    }
    
    return tasks;
  }
  
  private formatTaskTitle(action: string, index: number): string {
    // Capitalize first letter
    const capitalized = action.charAt(0).toUpperCase() + action.slice(1);
    
    // Limit length
    if (capitalized.length > 60) {
      return capitalized.substring(0, 57) + '...';
    }
    
    return capitalized;
  }
  
  private determineTaskPriority(analysis: SourceContentAnalysis, taskIndex: number): number {
    // Use source priorities if available
    if (analysis.priorities.length > 0) {
      const avgPriority = analysis.priorities.reduce((sum, p) => sum + p.priority, 0) / analysis.priorities.length;
      return Math.round(avgPriority);
    }
    
    // Default priority based on position (earlier tasks get higher priority)
    return Math.min(5, Math.max(1, 3 - Math.floor(taskIndex / 3)));
  }
  
  private determineTaskDueDate(
    analysis: SourceContentAnalysis,
    taskIndex: number,
    request: TaskGenerationRequest
  ): Date | undefined {
    // Use source deadlines if available
    if (analysis.deadlines.length > 0) {
      const earliestDeadline = analysis.deadlines.reduce((earliest, deadline) => 
        deadline.date < earliest.date ? deadline : earliest
      );
      
      // Offset based on task index
      const offsetDays = taskIndex * 2; // Each subsequent task due 2 days later
      const dueDate = new Date(earliestDeadline.date);
      dueDate.setDate(dueDate.getDate() + offsetDays);
      return dueDate;
    }
    
    // Use default due dates based on priority level
    if (request.options?.priorityLevel === 'high' || request.options?.priorityLevel === 'critical') {
      return this.getDefaultDueDate(new Date(), 1); // Due tomorrow for high priority
    }
    
    return this.getDefaultDueDate(new Date(), taskIndex + 3); // Due in 3+ days
  }
  
  private getDefaultDueDate(baseDate: Date, daysFromNow: number): Date {
    const dueDate = new Date(baseDate);
    dueDate.setDate(dueDate.getDate() + daysFromNow);
    return dueDate;
  }
  
  private generateTaskDependencies(
    tasks: WorkflowEntity[],
    analysis: SourceContentAnalysis
  ): WorkflowRelationship[] {
    const dependencies: WorkflowRelationship[] = [];
    const now = new Date();
    
    // Create simple sequential dependencies (task 1 -> task 2 -> task 3)
    for (let i = 0; i < tasks.length - 1; i++) {
      const dependency: WorkflowRelationship = {
        id: `dependency-${Date.now()}-${i}`,
        sourceId: tasks[i].id,
        targetId: tasks[i + 1].id,
        type: 'depends_on',
        strength: 0.8,
        bidirectional: false,
        createdAt: now,
        metadata: {
          generatedBy: 'AutomaticTaskGenerationEngine',
          dependencyType: 'sequential',
          taskOrder: i
        },
        confidence: 0.7,
        evidence: ['Sequential task generation']
      };
      
      dependencies.push(dependency);
    }
    
    return dependencies;
  }
  
  private calculateOverallPriority(tasks: WorkflowEntity[]): number {
    if (tasks.length === 0) return 3; // Default medium priority
    
    const totalPriority = tasks.reduce((sum, task) => sum + (task.priority || 3), 0);
    return Math.round(totalPriority / tasks.length);
  }
  
  private calculateTotalEstimatedTime(tasks: WorkflowEntity[]): number | undefined {
    // Simple estimation: 30 minutes per task
    return tasks.length * 30;
  }
  
  private calculateGenerationConfidence(analysis: SourceContentAnalysis, tasks: WorkflowEntity[]): number {
    if (tasks.length === 0) return 0;
    
    let confidence = 0.5; // Base confidence
    
    // More content increases confidence
    confidence += Math.min(analysis.contentLength / 1000, 0.2);
    
    // More actionable items increases confidence
    confidence += Math.min(analysis.actionableItems.length / 10, 0.2);
    
    // Tasks with due dates increase confidence
    const tasksWithDueDates = tasks.filter(t => t.dueDate);
    confidence += (tasksWithDueDates.length / tasks.length) * 0.1;
    
    return Math.min(confidence, 1);
  }
  
  private generateWarnings(analysis: SourceContentAnalysis, tasks: WorkflowEntity[]): string[] {
    const warnings: string[] = [];
    
    if (analysis.contentLength < 100) {
      warnings.push('Source content is minimal - task generation may be limited');
    }
    
    if (analysis.actionableItems.length === 0) {
      warnings.push('No actionable items detected in source content');
    }
    
    if (tasks.length === 0) {
      warnings.push('No tasks were generated');
    }
    
    return warnings;
  }
  
  private mergeSimilarTasks(tasks: WorkflowEntity[]): WorkflowEntity[] {
    if (tasks.length <= 1) return tasks;
    
    const merged: WorkflowEntity[] = [];
    const usedIndices = new Set<number>();
    
    for (let i = 0; i < tasks.length; i++) {
      if (usedIndices.has(i)) continue;
      
      const current = tasks[i];
      let mergedTask = { ...current };
      let mergeCount = 1;
      
      // Look for similar tasks
      for (let j = i + 1; j < tasks.length; j++) {
        if (usedIndices.has(j)) continue;
        
        const other = tasks[j];
        if (this.areTasksSimilar(current, other)) {
          // Merge the tasks
          mergedTask = this.mergeTwoTasks(mergedTask, other);
          usedIndices.add(j);
          mergeCount++;
        }
      }
      
      // Update merged task metadata
      mergedTask.metadata = {
        ...mergedTask.metadata,
        mergedFrom: mergeCount,
        originalTasks: mergeCount > 1 ? [current.id, ...Array.from(usedIndices).map(idx => tasks[idx].id)] : [current.id]
      };
      
      merged.push(mergedTask);
      usedIndices.add(i);
    }
    
    return merged;
  }
  
  private areTasksSimilar(task1: WorkflowEntity, task2: WorkflowEntity): boolean {
    // Simple similarity check based on title and content
    const title1 = task1.title.toLowerCase();
    const title2 = task2.title.toLowerCase();
    
    // Check for common words
    const words1 = new Set(title1.split(/\W+/));
    const words2 = new Set(title2.split(/\W+/));
    const commonWords = Array.from(words1).filter(word => words2.has(word));
    
    return commonWords.length >= 2; // At least 2 common words
  }
  
  private mergeTwoTasks(task1: WorkflowEntity, task2: WorkflowEntity): WorkflowEntity {
    const now = new Date();
    
    return {
      id: `merged-task-${Date.now()}`,
      type: task1.type,
      title: `${task1.title} / ${task2.title}`.substring(0, 60),
      content: `Merged from:\n1. ${task1.title}\n${task1.content || ''}\n\n2. ${task2.title}\n${task2.content || ''}`,
      createdAt: now,
      updatedAt: now,
      projectId: task1.projectId || task2.projectId,
      parentId: task1.parentId || task2.parentId,
      childIds: [...task1.childIds, ...task2.childIds],
      metadata: {
        ...task1.metadata,
        ...task2.metadata,
        merged: true,
        sourceTasks: [task1.id, task2.id]
      },
      tags: [...new Set([...task1.tags, ...task2.tags, 'merged'])],
      status: task1.status === 'completed' && task2.status === 'completed' ? 'completed' : 'pending',
      priority: Math.min(task1.priority || 3, task2.priority || 3),
      dueDate: task1.dueDate && task2.dueDate
        ? new Date(Math.min(task1.dueDate.getTime(), task2.dueDate.getTime()))
        : task1.dueDate || task2.dueDate
    };
  }
  
  private generateCrossSourceDependencies(
    tasks: WorkflowEntity[],
    sourceGroups: Array<{ entityIds: string[]; context: string }>
  ): WorkflowRelationship[] {
    const dependencies: WorkflowRelationship[] = [];
    const now = new Date();
    
    if (tasks.length < 2 || sourceGroups.length < 2) return dependencies;
    
    // Create dependencies between tasks from different source groups
    for (let i = 0; i < Math.min(tasks.length, 3); i++) {
      for (let j = i + 1; j < Math.min(tasks.length, 4); j++) {
        const dependency: WorkflowRelationship = {
          id: `cross-source-dep-${Date.now()}-${i}-${j}`,
          sourceId: tasks[i].id,
          targetId: tasks[j].id,
          type: 'related_to',
          strength: 0.6,
          bidirectional: true,
          createdAt: now,
          metadata: {
            generatedBy: 'AutomaticTaskGenerationEngine',
            dependencyType: 'cross-source',
            sourceContexts: [sourceGroups[0]?.context || 'unknown', sourceGroups[1]?.context || 'unknown']
          },
          confidence: 0.5,
          evidence: ['Cross-source relationship inferred']
        };
        
        dependencies.push(dependency);
      }
    }
    
    return dependencies;
  }
  
  private analyzeCompletedTasks(completedTasks: WorkflowEntity[], depth: number): CompletedTaskAnalysis {
    const relatedEntities: WorkflowEntity[] = [];
    const patterns: string[] = [];
    const followUpOpportunities: Array<{ type: string; description: string; priority: number }> = [];
    
    // Find related entities
    for (const task of completedTasks) {
      // Find entities that reference this task
      const referencing = Array.from(this.graph.entities.values()).filter(e =>
        e.content && e.content.includes(task.id)
      );
      relatedEntities.push(...referencing);
      
      // Find dependencies of this task
      const dependencies = Array.from(this.graph.relationships.values())
        .filter(r => r.sourceId === task.id && r.type === 'depends_on')
        .map(r => this.graph.entities.get(r.targetId))
        .filter((e): e is WorkflowEntity => e !== undefined);
      relatedEntities.push(...dependencies);
    }
    
    // Identify patterns
    if (completedTasks.length >= 3) {
      patterns.push(`Batch completion: ${completedTasks.length} tasks completed together`);
    }
    
    const taskTypes = new Set(completedTasks.map(t => t.metadata?.taskType || 'generic'));
    if (taskTypes.size > 1) {
      patterns.push(`Multiple task types completed: ${Array.from(taskTypes).join(', ')}`);
    }
    
    // Generate follow-up opportunities
    if (relatedEntities.length > 0) {
      followUpOpportunities.push({
        type: 'review',
        description: `Review ${relatedEntities.length} related entities`,
        priority: 3
      });
    }
    
    if (completedTasks.some(t => t.tags.includes('research') || t.tags.includes('analysis'))) {
      followUpOpportunities.push({
        type: 'synthesis',
        description: 'Synthesize findings from completed research tasks',
        priority: 2
      });
    }
    
    return {
      completedTasks,
      relatedEntities: [...new Map(relatedEntities.map(e => [e.id, e])).values()], // Remove duplicates
      patterns,
      followUpOpportunities
    };
  }
  
  private generateFollowUpTasksFromAnalysis(
    analysis: CompletedTaskAnalysis,
    options?: any
  ): WorkflowEntity[] {
    const tasks: WorkflowEntity[] = [];
    const now = new Date();
    
    // Generate tasks from follow-up opportunities
    analysis.followUpOpportunities.forEach((opportunity, index) => {
      const task: WorkflowEntity = {
        id: `follow-up-${Date.now()}-${index}`,
        type: 'task',
        title: `Follow-up: ${opportunity.description}`,
        content: `Generated as follow-up to completed tasks: ${analysis.completedTasks.map(t => t.title).join(', ')}`,
        createdAt: now,
        updatedAt: now,
        projectId: analysis.completedTasks[0]?.projectId,
        parentId: analysis.completedTasks[0]?.id,
        childIds: [],
        metadata: {
          generatedBy: 'AutomaticTaskGenerationEngine',
          followUpType: opportunity.type,
          sourceCompletedTasks: analysis.completedTasks.map(t => t.id)
        },
        tags: ['follow-up', 'generated', opportunity.type],
        status: 'pending',
        priority: opportunity.priority,
        dueDate: this.getDefaultDueDate(now, index + 2) // Due in 2+ days
      };
      
      tasks.push(task);
    });
    
    return tasks;
  }
  
  private generateFollowUpDependencies(
    tasks: WorkflowEntity[],
    completedTasks: WorkflowEntity[]
  ): WorkflowRelationship[] {
    const dependencies: WorkflowRelationship[] = [];
    const now = new Date();
    
    // Create dependencies from completed tasks to follow-up tasks
    completedTasks.forEach((completed, cIndex) => {
      tasks.forEach((task, tIndex) => {
        if (cIndex < 2 && tIndex < 2) { // Limit to first 2 of each
          const dependency: WorkflowRelationship = {
            id: `follow-up-dep-${Date.now()}-${cIndex}-${tIndex}`,
            sourceId: completed.id,
            targetId: task.id,
            type: 'generates',
            strength: 0.7,
            bidirectional: false,
            createdAt: now,
            metadata: {
              generatedBy: 'AutomaticTaskGenerationEngine',
              dependencyType: 'follow-up'
            },
            confidence: 0.6,
            evidence: ['Follow-up task generation']
          };
          
          dependencies.push(dependency);
        }
      });
    });
    
    return dependencies;
  }
  
  private calculateFollowUpConfidence(completedTasks: WorkflowEntity[], followUpTasks: WorkflowEntity[]): number {
    if (completedTasks.length === 0 || followUpTasks.length === 0) return 0;
    
    let confidence = 0.6; // Base confidence
    
    // More completed tasks increases confidence
    confidence += Math.min(completedTasks.length / 5, 0.2);
    
    // Follow-up tasks with clear relationships increase confidence
    confidence += Math.min(followUpTasks.length / 3, 0.2);
    
    return Math.min(confidence, 1);
  }
  
  private generateFollowUpWarnings(completedTasks: WorkflowEntity[], followUpTasks: WorkflowEntity[]): string[] {
    const warnings: string[] = [];
    
    if (completedTasks.length === 0) {
      warnings.push('No completed tasks provided for follow-up generation');
    }
    
    if (followUpTasks.length === 0) {
      warnings.push('No follow-up tasks were generated');
    }
    
    return warnings;
  }
  
  private analyzeMediaContent(
    mediaEntities: WorkflowEntity[],
    options?: any
  ): MediaContentAnalysis {
    const inferredActions: string[] = [];
    
    // Simple analysis based on metadata and tags
    mediaEntities.forEach(entity => {
      if (entity.tags.includes('image') || entity.tags.includes('photo')) {
        inferredActions.push('Review image content');
        inferredActions.push('Extract information from image');
      }
      
      if (entity.tags.includes('pdf') || entity.tags.includes('document')) {
        inferredActions.push('Review PDF document');
        inferredActions.push('Extract key points from document');
      }
      
      if (entity.tags.includes('audio') || entity.tags.includes('recording')) {
        inferredActions.push('Transcribe audio recording');
        inferredActions.push('Review audio content');
      }
      
      if (entity.metadata?.mediaType) {
        inferredActions.push(`Process ${entity.metadata.mediaType} media`);
      }
    });
    
    return {
      mediaEntities,
      inferredActions: [...new Set(inferredActions)], // Remove duplicates
      confidence: 0.5 // Basic confidence for media analysis
    };
  }
  
  private generateTasksFromMediaAnalysis(analysis: MediaContentAnalysis): WorkflowEntity[] {
    const tasks: WorkflowEntity[] = [];
    const now = new Date();
    
    analysis.inferredActions.forEach((action, index) => {
      const task: WorkflowEntity = {
        id: `media-task-${Date.now()}-${index}`,
        type: 'task',
        title: action,
        content: `Generated from media analysis of ${analysis.mediaEntities.length} media entities`,
        createdAt: now,
        updatedAt: now,
        projectId: analysis.mediaEntities[0]?.projectId,
        parentId: analysis.mediaEntities[0]?.id,
        childIds: [],
        metadata: {
          generatedBy: 'AutomaticTaskGenerationEngine',
          mediaAnalysis: true,
          sourceMediaCount: analysis.mediaEntities.length,
          confidence: analysis.confidence
        },
        tags: ['media', 'generated', 'automatic'],
        status: 'pending',
        priority: 3,
        dueDate: this.getDefaultDueDate(now, index + 1)
      };
      
      tasks.push(task);
    });
    
    return tasks;
  }
  
  private generateMediaDependencies(
    tasks: WorkflowEntity[],
    mediaEntities: WorkflowEntity[]
  ): WorkflowRelationship[] {
    const dependencies: WorkflowRelationship[] = [];
    const now = new Date();
    
    // Create relationships between media entities and generated tasks
    mediaEntities.forEach((media, mIndex) => {
      tasks.forEach((task, tIndex) => {
        if (mIndex < 2 && tIndex < 2) { // Limit relationships
          const dependency: WorkflowRelationship = {
            id: `media-dep-${Date.now()}-${mIndex}-${tIndex}`,
            sourceId: media.id,
            targetId: task.id,
            type: 'generates',
            strength: 0.6,
            bidirectional: false,
            createdAt: now,
            metadata: {
              generatedBy: 'AutomaticTaskGenerationEngine',
              dependencyType: 'media-to-task'
            },
            confidence: 0.5,
            evidence: ['Media content analysis']
          };
          
          dependencies.push(dependency);
        }
      });
    });
    
    return dependencies;
  }
  
  private calculateMediaGenerationConfidence(
    analysis: MediaContentAnalysis,
    tasks: WorkflowEntity[]
  ): number {
    if (tasks.length === 0) return 0;
    
    let confidence = analysis.confidence;
    
    // More media entities increases confidence
    confidence += Math.min(analysis.mediaEntities.length / 5, 0.2);
    
    // More inferred actions increases confidence
    confidence += Math.min(analysis.inferredActions.length / 5, 0.2);
    
    return Math.min(confidence, 1);
  }
  
  private generateMediaWarnings(
    analysis: MediaContentAnalysis,
    tasks: WorkflowEntity[]
  ): string[] {
    const warnings: string[] = [];
    
    if (analysis.mediaEntities.length === 0) {
      warnings.push('No media entities provided for analysis');
    }
    
    if (analysis.inferredActions.length === 0) {
      warnings.push('No actionable items inferred from media content');
    }
    
    if (tasks.length === 0) {
      warnings.push('No tasks were generated from media analysis');
    }
    
    return warnings;
  }
}
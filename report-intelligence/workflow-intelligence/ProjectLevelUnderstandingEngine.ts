/**
 * Phase 25: Workflow Intelligence Layer
 * Project‑Level Understanding and Context Modelling Engine
 *
 * Implements project‑level intelligence that understands:
 * 1. Project structure and hierarchy
 * 2. Cross‑entity relationships within projects
 * 3. Project health and maturity assessment
 * 4. Context‑aware recommendations for project improvement
 */

import type {
  WorkflowEntity,
  WorkflowRelationship,
  WorkflowGraph,
  WorkflowContext,
  WorkflowPrediction,
  CrossPageAnalysis,
  WorkflowAwareContext
} from './types';

/**
 * Project Analysis Types
 */

interface ProjectAnalysisResult {
  project: WorkflowEntity;
  childEntities: WorkflowEntity[];
  relationships: WorkflowRelationship[];
  statistics: ProjectStatistics;
  healthAssessment: ProjectHealthAssessment;
  maturityAssessment: ProjectMaturityAssessment;
  recommendations: ProjectRecommendation[];
  risks: ProjectRisk[];
  opportunities: ProjectOpportunity[];
}

interface ProjectStatistics {
  totalEntities: number;
  entityTypeDistribution: Record<string, number>;
  completedCount: number;
  overdueCount: number;
  highPriorityCount: number;
  relationshipCount: number;
  averageEntitiesPerType: number;
  completionPercentage: number;
}

interface ProjectHealthAssessment {
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' | 'empty';
  score: number;
  strengths: string[];
  concerns: string[];
  healthIndicators: {
    structure: 'good' | 'fair' | 'poor';
    progress: 'good' | 'fair' | 'none';
    organization: 'good' | 'fair' | 'poor';
    riskLevel: 'high' | 'medium' | 'low';
  };
}

interface ProjectMaturityAssessment {
  level: 'initial' | 'developing' | 'defined' | 'managed' | 'optimizing';
  description: string;
  characteristics: string[];
  nextSteps: string[];
}

interface ProjectRecommendation {
  type: 'urgent' | 'improvement' | 'enhancement' | 'optimization';
  title: string;
  description: string;
  action: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

interface ProjectRisk {
  type: 'timeline' | 'dependency' | 'scope' | 'resource' | 'quality';
  severity: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  mitigation: string;
}

interface ProjectOpportunity {
  type: 'automation' | 'knowledge-sharing' | 'process-improvement' | 'collaboration';
  benefit: 'high' | 'medium' | 'low';
  description: string;
  implementation: string;
  roi: string;
}

interface ComparativeProjectAnalysis {
  projects: ProjectAnalysisResult[];
  comparativeInsights: ComparativeInsight[];
  bestPractices: string[];
  crossProjectRecommendations: string[];
}

interface ComparativeInsight {
  type: 'comparison' | 'trend' | 'pattern';
  insight: string;
  projectsInvolved: string[];
  recommendation?: string;
}

interface ProjectPrediction {
  type: 'timeline' | 'completion' | 'risk' | 'opportunity';
  prediction: string;
  confidence: number;
  timeframe: 'short-term' | 'medium-term' | 'long-term';
  evidence: string[];
}

interface ProjectHealthDashboard {
  projectId: string;
  projectName: string;
  overallHealth: ProjectHealthAssessment['overallHealth'];
  metrics: {
    completionRate: number;
    onTrackRate: number;
    dependencyHealth: number;
    resourceUtilization: number;
  };
  trends: string[];
  alerts: string[];
  lastUpdated: Date;
}

/**
 * Project‑Level Understanding Engine
 * 
 * Analyzes projects as containers of entities (documents, tasks, notes, media)
 * to provide project‑level insights, health assessments, and recommendations.
 */
export class ProjectLevelUnderstandingEngine {
  private graph: WorkflowGraph;
  
  constructor(graph: WorkflowGraph) {
    this.graph = graph;
  }
  
  /**
   * Analyze a specific project
   */
  analyzeProject(projectId: string): ProjectAnalysisResult {
    const project = this.graph.entities.get(projectId);
    if (!project || project.type !== 'project') {
      throw new Error(`Entity ${projectId} is not a project or does not exist`);
    }
    
    // Get all child entities of the project
    const childEntities = this.getProjectChildEntities(projectId);
    const projectRelationships = this.getProjectRelationships(projectId, childEntities);
    
    return {
      project,
      childEntities,
      relationships: projectRelationships,
      statistics: this.calculateProjectStatistics(project, childEntities, projectRelationships),
      healthAssessment: this.assessProjectHealth(project, childEntities, projectRelationships),
      maturityAssessment: this.assessProjectMaturity(project, childEntities, projectRelationships),
      recommendations: this.generateProjectRecommendations(project, childEntities, projectRelationships),
      risks: this.identifyProjectRisks(project, childEntities, projectRelationships),
      opportunities: this.identifyProjectOpportunities(project, childEntities, projectRelationships)
    };
  }
  
  /**
   * Analyze multiple projects for comparative insights
   */
  analyzeProjects(projectIds: string[]): ComparativeProjectAnalysis {
    const projectAnalyses = projectIds
      .map(id => {
        try {
          return this.analyzeProject(id);
        } catch {
          return null;
        }
      })
      .filter((analysis): analysis is ProjectAnalysisResult => analysis !== null);
    
    return {
      projects: projectAnalyses,
      comparativeInsights: this.generateComparativeInsights(projectAnalyses),
      bestPractices: this.identifyBestPractices(projectAnalyses),
      crossProjectRecommendations: this.generateCrossProjectRecommendations(projectAnalyses)
    };
  }
  
  /**
   * Generate project‑aware context for workflow operations
   */
  createProjectAwareContext(projectId: string, modeType: WorkflowAwareContext['modeType']): WorkflowAwareContext {
    const project = this.graph.entities.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    const childEntities = this.getProjectChildEntities(projectId);
    const entityIds = [projectId, ...childEntities.map(e => e.id)];
    
    return {
      id: `project-context-${Date.now()}`,
      modeType,
      entityIds,
      availableOperations: this.determineProjectOperations(modeType, project, childEntities),
      history: [],
      metadata: {
        projectId,
        projectName: project.title,
        childCount: childEntities.length,
        contextType: 'project-aware'
      }
    };
  }
  
  /**
   * Predict project outcomes and timelines
   */
  predictProjectOutcomes(projectId: string): ProjectPrediction[] {
    const analysis = this.analyzeProject(projectId);
    const predictions: ProjectPrediction[] = [];
    
    // Timeline prediction
    const timelinePrediction = this.predictProjectTimeline(analysis);
    if (timelinePrediction) {
      predictions.push(timelinePrediction);
    }
    
    // Completion prediction
    const completionPrediction = this.predictProjectCompletion(analysis);
    if (completionPrediction) {
      predictions.push(completionPrediction);
    }
    
    // Risk predictions
    const riskPredictions = this.predictProjectRisks(analysis);
    predictions.push(...riskPredictions);
    
    return predictions;
  }
  
  /**
   * Generate project health dashboard data
   */
  generateProjectHealthDashboard(projectId: string): ProjectHealthDashboard {
    const analysis = this.analyzeProject(projectId);
    
    return {
      projectId,
      projectName: analysis.project.title,
      overallHealth: analysis.healthAssessment.overallHealth,
      metrics: {
        completionRate: this.calculateCompletionRate(analysis.childEntities),
        onTrackRate: this.calculateOnTrackRate(analysis.childEntities),
        dependencyHealth: this.calculateDependencyHealth(analysis.relationships),
        resourceUtilization: this.calculateResourceUtilization(analysis.childEntities)
      },
      trends: this.identifyProjectTrends(analysis),
      alerts: this.generateProjectAlerts(analysis),
      lastUpdated: new Date()
    };
  }
  
  /**
   * Private helper methods
   */
  
  private getProjectChildEntities(projectId: string): WorkflowEntity[] {
    return Array.from(this.graph.entities.values()).filter(entity =>
      entity.projectId === projectId || entity.parentId === projectId
    );
  }
  
  private getProjectRelationships(projectId: string, childEntities: WorkflowEntity[]): WorkflowRelationship[] {
    const childIds = new Set(childEntities.map(e => e.id));
    childIds.add(projectId);
    
    return Array.from(this.graph.relationships.values()).filter(rel =>
      childIds.has(rel.sourceId) && childIds.has(rel.targetId)
    );
  }
  
  private calculateProjectStatistics(
    project: WorkflowEntity,
    childEntities: WorkflowEntity[],
    relationships: WorkflowRelationship[]
  ): ProjectStatistics {
    const entityCounts = new Map<string, number>();
    childEntities.forEach(entity => {
      entityCounts.set(entity.type, (entityCounts.get(entity.type) || 0) + 1);
    });
    
    const completed = childEntities.filter(e => e.status === 'completed' || e.status === 'done');
    const overdue = childEntities.filter(e => e.dueDate && new Date(e.dueDate) < new Date());
    const highPriority = childEntities.filter(e => e.priority && e.priority <= 2);
    
    return {
      totalEntities: childEntities.length,
      entityTypeDistribution: Object.fromEntries(entityCounts),
      completedCount: completed.length,
      overdueCount: overdue.length,
      highPriorityCount: highPriority.length,
      relationshipCount: relationships.length,
      averageEntitiesPerType: childEntities.length > 0 ? childEntities.length / entityCounts.size : 0,
      completionPercentage: childEntities.length > 0 ? (completed.length / childEntities.length) * 100 : 0
    };
  }
  
  private assessProjectHealth(
    project: WorkflowEntity,
    childEntities: WorkflowEntity[],
    relationships: WorkflowRelationship[]
  ): ProjectHealthAssessment {
    if (childEntities.length === 0) {
      return {
        overallHealth: 'empty',
        score: 0,
        strengths: ['Clean slate - no technical debt'],
        concerns: ['No work has been started'],
        healthIndicators: {
          structure: 'poor',
          progress: 'none',
          organization: 'poor',
          riskLevel: 'low'
        }
      };
    }
    
    let score = 50; // Base score
    
    // Completion contributes to health
    const completed = childEntities.filter(e => e.status === 'completed' || e.status === 'done');
    score += (completed.length / childEntities.length) * 30;
    
    // Timeliness contributes to health
    const overdue = childEntities.filter(e => e.dueDate && new Date(e.dueDate) < new Date());
    score -= (overdue.length / childEntities.length) * 20;
    
    // Organization contributes to health
    const hasStructure = childEntities.some(e => e.type === 'task' || e.type === 'document');
    if (hasStructure) score += 10;
    
    const hasRelationships = relationships.length > 0;
    if (hasRelationships) score += 10;
    
    score = Math.max(0, Math.min(100, score));
    
    const strengths: string[] = [];
    const concerns: string[] = [];
    
    if (completed.length > 0) strengths.push(`Good progress: ${completed.length} entities completed`);
    if (hasStructure) strengths.push('Well-structured with tasks and documents');
    if (hasRelationships) strengths.push('Entities are properly connected');
    
    if (overdue.length > 0) concerns.push(`${overdue.length} entities are overdue`);
    if (childEntities.length > 20 && relationships.length < childEntities.length / 2) {
      concerns.push('Many entities are not properly connected');
    }
    
    let overallHealth: ProjectHealthAssessment['overallHealth'];
    if (score >= 80) overallHealth = 'excellent';
    else if (score >= 60) overallHealth = 'good';
    else if (score >= 40) overallHealth = 'fair';
    else if (score >= 20) overallHealth = 'poor';
    else overallHealth = 'critical';
    
    return {
      overallHealth,
      score,
      strengths,
      concerns,
      healthIndicators: {
        structure: hasStructure ? 'good' : 'poor',
        progress: completed.length > 0 ? 'good' : 'none',
        organization: hasRelationships ? 'good' : 'poor',
        riskLevel: overdue.length > 0 ? 'high' : 'low'
      }
    };
  }
  
  private assessProjectMaturity(
    project: WorkflowEntity,
    childEntities: WorkflowEntity[],
    relationships: WorkflowRelationship[]
  ): ProjectMaturityAssessment {
    if (childEntities.length === 0) {
      return {
        level: 'initial',
        description: 'Project has just been created with no content',
        characteristics: ['Empty project', 'No structure defined'],
        nextSteps: ['Add initial tasks or documents', 'Define project structure']
      };
    }
    
    const hasTasks = childEntities.some(e => e.type === 'task');
    const hasDocuments = childEntities.some(e => e.type === 'document');
    const hasNotes = childEntities.some(e => e.type === 'note');
    const hasDueDates = childEntities.some(e => e.dueDate);
    const hasPriorities = childEntities.some(e => e.priority);
    const hasRelationships = relationships.length > 0;
    const hasHierarchy = childEntities.some(e => e.childIds.length > 0);
    
    const characteristics: string[] = [];
    if (hasTasks) characteristics.push('Contains tasks');
    if (hasDocuments) characteristics.push('Contains documents');
    if (hasNotes) characteristics.push('Contains notes');
    if (hasDueDates) characteristics.push('Uses due dates');
    if (hasPriorities) characteristics.push('Uses priorities');
    if (hasRelationships) characteristics.push('Entities are connected');
    if (hasHierarchy) characteristics.push('Has hierarchical structure');
    
    let level: ProjectMaturityAssessment['level'];
    let description: string;
    let nextSteps: string[];
    
    if (hasTasks && hasDocuments && hasDueDates && hasRelationships && hasHierarchy) {
      level = 'optimizing';
      description = 'Well-structured project with comprehensive tracking and relationships';
      nextSteps = [
        'Automate routine tasks',
        'Implement advanced analytics',
        'Optimize workflow efficiency'
      ];
    } else if (hasTasks && hasDocuments && (hasDueDates || hasPriorities)) {
      level = 'managed';
      description = 'Structured project with basic tracking and organization';
      nextSteps = [
        'Add relationships between entities',
        'Implement hierarchical structure',
        'Add more detailed metadata'
      ];
    } else if (hasTasks || hasDocuments) {
      level = 'defined';
      description = 'Project has some structure but limited tracking';
      nextSteps = [
        'Add due dates and priorities',
        'Create more comprehensive entity types',
        'Establish basic organization'
      ];
    } else {
      level = 'developing';
      description = 'Project has basic content but minimal structure';
      nextSteps = [
        'Add tasks or documents',
        'Define project scope',
        'Establish basic organization'
      ];
    }
    
    return {
      level,
      description,
      characteristics,
      nextSteps
    };
  }
  
  private generateProjectRecommendations(
    project: WorkflowEntity,
    childEntities: WorkflowEntity[],
    relationships: WorkflowRelationship[]
  ): ProjectRecommendation[] {
    const recommendations: ProjectRecommendation[] = [];
    
    // Check for missing due dates on high priority tasks
    const highPriorityNoDueDate = childEntities.filter(e =>
      e.type === 'task' && e.priority && e.priority <= 2 && !e.dueDate
    );
    if (highPriorityNoDueDate.length > 0) {
      recommendations.push({
        type: 'urgent',
        title: 'Add due dates to high priority tasks',
        description: `${highPriorityNoDueDate.length} high priority tasks have no due dates`,
        action: 'Set due dates for all high priority tasks',
        impact: 'high',
        effort: 'low'
      });
    }
    
    // Check for isolated entities
    const isolated = childEntities.filter(e => {
      const entityRels = relationships.filter(r => r.sourceId === e.id || r.targetId === e.id);
      return entityRels.length === 0;
    });
    if (isolated.length > 0 && childEntities.length > 1) {
      recommendations.push({
        type: 'improvement',
        title: 'Connect isolated entities',
        description: `${isolated.length} entities are not connected to the project workflow`,
        action: 'Add relationships to connect isolated entities',
        impact: 'medium',
        effort: 'medium'
      });
    }
    
    // Check for project documentation
    const hasProjectDoc = childEntities.some(e =>
      e.type === 'document' && e.tags.includes('project-documentation')
    );
    if (!hasProjectDoc && childEntities.length > 5) {
      recommendations.push({
        type: 'enhancement',
        title: 'Add project documentation',
        description: 'Project lacks formal documentation',
        action: 'Create a project documentation document',
        impact: 'medium',
        effort: 'medium'
      });
    }
    
    return recommendations;
  }
  
  private identifyProjectRisks(
    project: WorkflowEntity,
    childEntities: WorkflowEntity[],
    relationships: WorkflowRelationship[]
  ): ProjectRisk[] {
    const risks: ProjectRisk[] = [];
    
    // Overdue items risk
    const overdue = childEntities.filter(e => e.dueDate && new Date(e.dueDate) < new Date());
    if (overdue.length > 0) {
      risks.push({
        type: 'timeline',
        severity: 'medium',
        description: `${overdue.length} items are overdue`,
        impact: 'Delays in project timeline',
        mitigation: 'Review and update overdue items immediately'
      });
    }
    
    // Dependency risk
    const tasksWithDependencies = childEntities.filter(e => {
      if (e.type !== 'task') return false;
      const deps = relationships.filter(r => r.sourceId === e.id && r.type === 'depends_on');
      return deps.length > 0;
    });
    
    if (tasksWithDependencies.length > 0) {
      // Check for circular dependencies or long chains
      risks.push({
        type: 'dependency',
        severity: 'low',
        description: `${tasksWithDependencies.length} tasks have dependencies`,
        impact: 'Potential for bottlenecks',
        mitigation: 'Review dependency chains for optimization'
      });
    }
    
    // Scope creep risk
    if (childEntities.length > 50) {
      risks.push({
        type: 'scope',
        severity: 'medium',
        description: 'Large number of entities suggests possible scope creep',
        impact: 'Project may become unmanageable',
        mitigation: 'Review project scope and consider breaking into sub-projects'
      });
    }
    
    return risks;
  }
  
  private identifyProjectOpportunities(
    project: WorkflowEntity,
    childEntities: WorkflowEntity[],
    relationships: WorkflowRelationship[]
  ): ProjectOpportunity[] {
    const opportunities: ProjectOpportunity[] = [];
    
    // Automation opportunity
    const repetitiveTasks = childEntities.filter(e =>
      e.type === 'task' && e.content && (
        e.content.includes('manual') ||
        e.content.includes('repeat') ||
        e.content.includes('routine')
      )
    );
    if (repetitiveTasks.length > 0) {
      opportunities.push({
        type: 'automation',
        benefit: 'high',
        description: `${repetitiveTasks.length} tasks appear to be repetitive and could be automated`,
        implementation: 'Investigate automation tools or scripts',
        roi: 'High time savings potential'
      });
    }
    
    // Knowledge sharing opportunity
    const hasDocuments = childEntities.some(e => e.type === 'document');
    const hasNotes = childEntities.some(e => e.type === 'note');
    if (hasDocuments || hasNotes) {
      opportunities.push({
        type: 'knowledge-sharing',
        benefit: 'medium',
        description: 'Project contains valuable knowledge that could be shared',
        implementation: 'Create knowledge base or share insights with team',
        roi: 'Improved team efficiency and reduced duplication'
      });
    }
    
    // Process improvement opportunity
    if (childEntities.length > 10 && relationships.length < childEntities.length / 3) {
      opportunities.push({
        type: 'process-improvement',
        benefit: 'medium',
        description: 'Opportunity to improve workflow connections and processes',
        implementation: 'Map current workflow and identify optimization points',
        roi: 'Improved efficiency and reduced errors'
      });
    }
    
    return opportunities;
  }
  
  private generateComparativeInsights(projectAnalyses: ProjectAnalysisResult[]): ComparativeInsight[] {
    if (projectAnalyses.length < 2) return [];
    
    const insights: ComparativeInsight[] = [];
    
    // Compare completion rates
    const completionRates = projectAnalyses.map(a => a.statistics.completionPercentage);
    const maxCompletion = Math.max(...completionRates);
    const minCompletion = Math.min(...completionRates);
    
    if (maxCompletion - minCompletion > 20) {
      const bestProject = projectAnalyses.find(a => a.statistics.completionPercentage === maxCompletion);
      const worstProject = projectAnalyses.find(a => a.statistics.completionPercentage === minCompletion);
      
      if (bestProject && worstProject) {
        insights.push({
          type: 'comparison',
          insight: `Completion rates vary significantly: ${bestProject.project.title} (${maxCompletion.toFixed(1)}%) vs ${worstProject.project.title} (${minCompletion.toFixed(1)}%)`,
          projectsInvolved: [bestProject.project.id, worstProject.project.id],
          recommendation: 'Investigate why completion rates differ and share best practices'
        });
      }
    }
    
    // Compare health scores
    const healthScores = projectAnalyses.map(a => a.healthAssessment.score);
    const avgHealth = healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
    
    if (avgHealth < 60) {
      insights.push({
        type: 'trend',
        insight: `Average project health score is ${avgHealth.toFixed(1)}/100, indicating room for improvement`,
        projectsInvolved: projectAnalyses.map(a => a.project.id),
        recommendation: 'Focus on improving project health across all projects'
      });
    }
    
    return insights;
  }
  
  private identifyBestPractices(projectAnalyses: ProjectAnalysisResult[]): string[] {
    const practices: string[] = [];
    
    // Identify projects with high health scores
    const healthyProjects = projectAnalyses.filter(a => a.healthAssessment.score >= 80);
    if (healthyProjects.length > 0) {
      practices.push('High health projects typically have clear due dates and priorities');
    }
    
    // Identify projects with good maturity
    const matureProjects = projectAnalyses.filter(a => a.maturityAssessment.level === 'managed' || a.maturityAssessment.level === 'optimizing');
    if (matureProjects.length > 0) {
      practices.push('Mature projects use relationships to connect entities effectively');
    }
    
    // Identify projects with good completion rates
    const highCompletionProjects = projectAnalyses.filter(a => a.statistics.completionPercentage >= 70);
    if (highCompletionProjects.length > 0) {
      practices.push('Projects with high completion rates often break work into manageable tasks');
    }
    
    return practices;
  }
  
  private generateCrossProjectRecommendations(projectAnalyses: ProjectAnalysisResult[]): string[] {
    const recommendations: string[] = [];
    
    if (projectAnalyses.length === 0) return recommendations;
    
    // Check for common issues
    const projectsWithOverdue = projectAnalyses.filter(a => a.statistics.overdueCount > 0);
    if (projectsWithOverdue.length > 0) {
      recommendations.push(`Address overdue items in ${projectsWithOverdue.length} projects`);
    }
    
    const projectsWithHighRisk = projectAnalyses.filter(a =>
      a.healthAssessment.healthIndicators.riskLevel === 'high'
    );
    if (projectsWithHighRisk.length > 0) {
      recommendations.push(`Review high-risk projects: ${projectsWithHighRisk.map(a => a.project.title).join(', ')}`);
    }
    
    // Suggest knowledge sharing
    if (projectAnalyses.length > 1) {
      recommendations.push('Share best practices between projects to improve overall performance');
    }
    
    return recommendations;
  }
  
  private determineProjectOperations(
    modeType: string,
    project: WorkflowEntity,
    childEntities: WorkflowEntity[]
  ): string[] {
    const operations = ['view_project', 'edit_project', 'add_entity', 'manage_members'];
    
    switch (modeType) {
      case 'chat':
        operations.push('discuss_project', 'ask_about_progress', 'request_update');
        break;
      case 'edit':
        operations.push('restructure_project', 'bulk_edit', 'import_export');
        break;
      case 'review':
        operations.push('approve_project', 'request_changes', 'add_feedback');
        break;
      case 'plan':
        operations.push('create_timeline', 'assign_resources', 'set_milestones');
        break;
      case 'execute':
        operations.push('start_project', 'pause_project', 'complete_project');
        break;
    }
    
    // Add entity-specific operations
    if (childEntities.some(e => e.type === 'task')) {
      operations.push('manage_tasks', 'view_task_board');
    }
    if (childEntities.some(e => e.type === 'document')) {
      operations.push('manage_documents', 'view_document_library');
    }
    
    return operations;
  }
  
  private predictProjectTimeline(analysis: ProjectAnalysisResult): ProjectPrediction | null {
    const completionRate = analysis.statistics.completionPercentage;
    const overdueCount = analysis.statistics.overdueCount;
    
    if (completionRate >= 80) {
      return {
        type: 'timeline',
        prediction: 'Project is likely to complete on time',
        confidence: 0.8,
        timeframe: 'short-term',
        evidence: [`High completion rate (${completionRate.toFixed(1)}%)`, `Only ${overdueCount} overdue items`]
      };
    } else if (completionRate >= 50) {
      return {
        type: 'timeline',
        prediction: 'Project may experience minor delays',
        confidence: 0.6,
        timeframe: 'medium-term',
        evidence: [`Moderate completion rate (${completionRate.toFixed(1)}%)`, `${overdueCount} overdue items`]
      };
    }
    
    return null;
  }
  
  private predictProjectCompletion(analysis: ProjectAnalysisResult): ProjectPrediction | null {
    const totalEntities = analysis.statistics.totalEntities;
    const completedCount = analysis.statistics.completedCount;
    
    if (totalEntities === 0) return null;
    
    const completionPercentage = (completedCount / totalEntities) * 100;
    
    if (completionPercentage >= 90) {
      return {
        type: 'completion',
        prediction: 'Project is nearly complete',
        confidence: 0.9,
        timeframe: 'short-term',
        evidence: [`${completedCount}/${totalEntities} entities completed`, `${completionPercentage.toFixed(1)}% complete`]
      };
    } else if (completionPercentage >= 50) {
      return {
        type: 'completion',
        prediction: 'Project is about halfway complete',
        confidence: 0.7,
        timeframe: 'medium-term',
        evidence: [`${completedCount}/${totalEntities} entities completed`, `${completionPercentage.toFixed(1)}% complete`]
      };
    }
    
    return {
      type: 'completion',
      prediction: 'Project is in early stages',
      confidence: 0.8,
      timeframe: 'long-term',
      evidence: [`${completedCount}/${totalEntities} entities completed`, `${completionPercentage.toFixed(1)}% complete`]
    };
  }
  
  private predictProjectRisks(analysis: ProjectAnalysisResult): ProjectPrediction[] {
    const predictions: ProjectPrediction[] = [];
    
    if (analysis.statistics.overdueCount > 0) {
      predictions.push({
        type: 'risk',
        prediction: `Project has ${analysis.statistics.overdueCount} overdue items, risking timeline delays`,
        confidence: 0.7,
        timeframe: 'short-term',
        evidence: ['Overdue items identified', 'Timeline pressure increasing']
      });
    }
    
    if (analysis.statistics.highPriorityCount > 5) {
      predictions.push({
        type: 'risk',
        prediction: 'High concentration of high-priority items may lead to resource contention',
        confidence: 0.6,
        timeframe: 'medium-term',
        evidence: [`${analysis.statistics.highPriorityCount} high-priority items`, 'Potential resource allocation issues']
      });
    }
    
    if (analysis.relationships.length === 0 && analysis.statistics.totalEntities > 3) {
      predictions.push({
        type: 'risk',
        prediction: 'Lack of relationships between entities may lead to coordination issues',
        confidence: 0.5,
        timeframe: 'long-term',
        evidence: ['No relationships defined', 'Potential for misalignment']
      });
    }
    
    return predictions;
  }
  
  private calculateCompletionRate(childEntities: WorkflowEntity[]): number {
    if (childEntities.length === 0) return 0;
    const completed = childEntities.filter(e => e.status === 'completed' || e.status === 'done');
    return (completed.length / childEntities.length) * 100;
  }
  
  private calculateOnTrackRate(childEntities: WorkflowEntity[]): number {
    if (childEntities.length === 0) return 0;
    
    const tasks = childEntities.filter(e => e.type === 'task');
    if (tasks.length === 0) return 100; // No tasks means nothing to track
    
    const onTrackTasks = tasks.filter(task => {
      if (task.status === 'completed' || task.status === 'done') return true;
      if (!task.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      return daysUntilDue > 0;
    });
    
    return (onTrackTasks.length / tasks.length) * 100;
  }
  
  private calculateDependencyHealth(relationships: WorkflowRelationship[]): number {
    if (relationships.length === 0) return 100; // No dependencies means no dependency issues
    
    const dependencyRels = relationships.filter(r => r.type === 'depends_on');
    if (dependencyRels.length === 0) return 100;
    
    // Simple health calculation: more dependencies = lower health (simplified)
    const health = Math.max(0, 100 - (dependencyRels.length * 5));
    return Math.min(100, health);
  }
  
  private calculateResourceUtilization(childEntities: WorkflowEntity[]): number {
    if (childEntities.length === 0) return 0;
    
    // Estimate resource utilization based on entity count and types
    let utilization = 0;
    
    childEntities.forEach(entity => {
      if (entity.type === 'task') utilization += 10;
      else if (entity.type === 'document') utilization += 5;
      else if (entity.type === 'project') utilization += 20;
      else utilization += 3;
    });
    
    return Math.min(100, utilization);
  }
  
  private identifyProjectTrends(analysis: ProjectAnalysisResult): string[] {
    const trends: string[] = [];
    
    if (analysis.statistics.completedCount > 0) {
      trends.push(`Steady progress: ${analysis.statistics.completedCount} entities completed`);
    }
    
    if (analysis.statistics.overdueCount > 0) {
      trends.push(`Attention needed: ${analysis.statistics.overdueCount} overdue items`);
    }
    
    if (analysis.statistics.highPriorityCount > 0) {
      trends.push(`Focus areas: ${analysis.statistics.highPriorityCount} high-priority items`);
    }
    
    if (analysis.relationships.length > 0) {
      trends.push(`Good coordination: ${analysis.relationships.length} relationships established`);
    }
    
    return trends;
  }
  
  private generateProjectAlerts(analysis: ProjectAnalysisResult): string[] {
    const alerts: string[] = [];
    
    if (analysis.statistics.overdueCount > 0) {
      alerts.push(`🚨 ${analysis.statistics.overdueCount} items are overdue`);
    }
    
    if (analysis.healthAssessment.overallHealth === 'critical' || analysis.healthAssessment.overallHealth === 'poor') {
      alerts.push(`⚠️ Project health is ${analysis.healthAssessment.overallHealth}`);
    }
    
    if (analysis.statistics.totalEntities === 0) {
      alerts.push('ℹ️ Project is empty - consider adding content');
    }
    
    return alerts;
  }
}
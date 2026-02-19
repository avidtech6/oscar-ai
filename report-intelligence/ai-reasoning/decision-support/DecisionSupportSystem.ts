/**
 * AI Decision Support System - Phase 12.8
 * 
 * Decision support system that transforms AI reasoning results into actionable
 * recommendations, prioritizes actions, and provides decision-making guidance.
 */

import { 
  AIReasoningResult, 
  Inference, 
  Recommendation, 
  Entity, 
  Relationship,
  ConfidenceScores
} from '../AIReasoningResult';
import { InferenceEngine } from '../reasoning/InferenceEngine';
import { KnowledgeGraph } from '../knowledge/KnowledgeGraph';

/**
 * Decision Support Configuration
 */
export interface DecisionSupportConfiguration {
  /** Enable risk-based decision support */
  enableRiskBasedDecisions: boolean;
  
  /** Enable compliance-based decision support */
  enableComplianceBasedDecisions: boolean;
  
  /** Enable efficiency-based decision support */
  enableEfficiencyBasedDecisions: boolean;
  
  /** Enable safety-based decision support */
  enableSafetyBasedDecisions: boolean;
  
  /** Enable quality-based decision support */
  enableQualityBasedDecisions: boolean;
  
  /** Minimum confidence threshold for recommendations (0-100) */
  minRecommendationConfidence: number;
  
  /** Maximum recommendations to generate */
  maxRecommendations: number;
  
  /** Enable recommendation prioritization */
  enablePrioritization: boolean;
  
  /** Enable action plan generation */
  enableActionPlanGeneration: boolean;
  
  /** Enable decision justification */
  enableDecisionJustification: boolean;
  
  /** Decision timeout in milliseconds */
  decisionTimeoutMs: number;
}

/**
 * Default Decision Support Configuration
 */
export const DEFAULT_DECISION_SUPPORT_CONFIG: DecisionSupportConfiguration = {
  enableRiskBasedDecisions: true,
  enableComplianceBasedDecisions: true,
  enableEfficiencyBasedDecisions: true,
  enableSafetyBasedDecisions: true,
  enableQualityBasedDecisions: true,
  minRecommendationConfidence: 65,
  maxRecommendations: 20,
  enablePrioritization: true,
  enableActionPlanGeneration: true,
  enableDecisionJustification: true,
  decisionTimeoutMs: 3000
};

/**
 * Decision Context
 */
export interface DecisionContext {
  /** Domain context (e.g., 'arboriculture', 'compliance', 'safety', 'planning') */
  domain: string;
  
  /** Project constraints */
  constraints: {
    budget?: number;
    timeline?: string;
    resources?: string[];
    regulations?: string[];
  };
  
  /** Stakeholder preferences */
  preferences: {
    riskTolerance: 'low' | 'medium' | 'high';
    qualityImportance: number; // 0-100
    efficiencyImportance: number; // 0-100
    safetyImportance: number; // 0-100
  };
  
  /** Historical decisions */
  historicalDecisions?: HistoricalDecision[];
}

/**
 * Historical Decision
 */
export interface HistoricalDecision {
  /** Decision ID */
  id: string;
  
  /** Decision timestamp */
  timestamp: Date;
  
  /** Decision type */
  type: string;
  
  /** Decision description */
  description: string;
  
  /** Outcome (positive, negative, neutral) */
  outcome: string;
  
  /** Outcome details */
  outcomeDetails: string;
  
  /** Lessons learned */
  lessonsLearned: string[];
}

/**
 * Action Plan
 */
export interface ActionPlan {
  /** Plan ID */
  id: string;
  
  /** Plan name */
  name: string;
  
  /** Plan description */
  description: string;
  
  /** Recommended actions */
  actions: ActionItem[];
  
  /** Estimated timeline */
  timeline: {
    start: Date;
    end: Date;
    durationDays: number;
  };
  
  /** Required resources */
  resources: ResourceRequirement[];
  
  /** Expected outcomes */
  expectedOutcomes: string[];
  
  /** Risk assessment */
  risks: RiskAssessment[];
  
  /** Success metrics */
  successMetrics: SuccessMetric[];
}

/**
 * Action Item
 */
export interface ActionItem {
  /** Action ID */
  id: string;
  
  /** Action description */
  description: string;
  
  /** Action type */
  type: 'investigation' | 'mitigation' | 'documentation' | 'communication' | 'implementation';
  
  /** Priority (critical, high, medium, low) */
  priority: string;
  
  /** Estimated effort (person-hours) */
  estimatedEffort: number;
  
  /** Required skills */
  requiredSkills: string[];
  
  /** Dependencies */
  dependencies: string[];
  
  /** Success criteria */
  successCriteria: string[];
}

/**
 * Resource Requirement
 */
export interface ResourceRequirement {
  /** Resource type */
  type: 'personnel' | 'equipment' | 'materials' | 'budget' | 'time';
  
  /** Resource description */
  description: string;
  
  /** Quantity */
  quantity: number;
  
  /** Unit */
  unit: string;
  
  /** Availability */
  availability: 'available' | 'partial' | 'unavailable';
}

/**
 * Risk Assessment
 */
export interface RiskAssessment {
  /** Risk ID */
  id: string;
  
  /** Risk description */
  description: string;
  
  /** Risk likelihood (low, medium, high) */
  likelihood: string;
  
  /** Risk impact (low, medium, high) */
  impact: string;
  
  /** Risk level (calculated) */
  level: string;
  
  /** Mitigation strategies */
  mitigationStrategies: string[];
}

/**
 * Success Metric
 */
export interface SuccessMetric {
  /** Metric ID */
  id: string;
  
  /** Metric name */
  name: string;
  
  /** Metric description */
  description: string;
  
  /** Target value */
  target: any;
  
  /** Current value */
  current: any;
  
  /** Unit */
  unit: string;
}

/**
 * Decision Support System
 */
export class DecisionSupportSystem {
  private configuration: DecisionSupportConfiguration;
  private inferenceEngine: InferenceEngine | null;
  private knowledgeGraph: KnowledgeGraph | null;
  private historicalDecisions: HistoricalDecision[];
  
  constructor(
    config: Partial<DecisionSupportConfiguration> = {},
    inferenceEngine: InferenceEngine | null = null,
    knowledgeGraph: KnowledgeGraph | null = null
  ) {
    this.configuration = { ...DEFAULT_DECISION_SUPPORT_CONFIG, ...config };
    this.inferenceEngine = inferenceEngine;
    this.knowledgeGraph = knowledgeGraph;
    this.historicalDecisions = this.initializeHistoricalDecisions();
  }
  
  /**
   * Initialize with sample historical decisions
   */
  private initializeHistoricalDecisions(): HistoricalDecision[] {
    return [
      {
        id: 'hist-001',
        timestamp: new Date('2025-01-15'),
        type: 'risk_mitigation',
        description: 'Implemented additional bracing for large oak tree near structure',
        outcome: 'positive',
        outcomeDetails: 'Tree remained stable during storm season, no damage to structure',
        lessonsLearned: ['Early intervention prevents costly damage', 'Regular monitoring is essential']
      },
      {
        id: 'hist-002',
        timestamp: new Date('2025-03-22'),
        type: 'compliance_action',
        description: 'Updated report to include BS5837 compliance section',
        outcome: 'positive',
        outcomeDetails: 'Report approved by planning authority without revisions',
        lessonsLearned: ['Proactive compliance saves time', 'Clear documentation reduces review cycles']
      },
      {
        id: 'hist-003',
        timestamp: new Date('2025-06-10'),
        type: 'efficiency_improvement',
        description: 'Implemented template-based report generation',
        outcome: 'positive',
        outcomeDetails: 'Report generation time reduced by 40%',
        lessonsLearned: ['Standardization improves efficiency', 'Templates ensure consistency']
      }
    ];
  }
  
  /**
   * Generate recommendations from AI reasoning results
   */
  async generateRecommendations(
    reasoningResult: AIReasoningResult,
    context?: DecisionContext
  ): Promise<Recommendation[]> {
    const startTime = Date.now();
    const recommendations: Recommendation[] = [];
    
    // Generate recommendations based on inferences
    if (reasoningResult.inferences.length > 0) {
      const inferenceRecommendations = this.generateRecommendationsFromInferences(
        reasoningResult.inferences,
        reasoningResult.entities,
        context
      );
      recommendations.push(...inferenceRecommendations);
    }
    
    // Generate risk-based recommendations
    if (this.configuration.enableRiskBasedDecisions) {
      const riskRecommendations = this.generateRiskBasedRecommendations(
        reasoningResult.entities,
        reasoningResult.relationships,
        context
      );
      recommendations.push(...riskRecommendations);
    }
    
    // Generate compliance-based recommendations
    if (this.configuration.enableComplianceBasedDecisions) {
      const complianceRecommendations = this.generateComplianceBasedRecommendations(
        reasoningResult.entities,
        reasoningResult.relationships,
        context
      );
      recommendations.push(...complianceRecommendations);
    }
    
    // Generate efficiency-based recommendations
    if (this.configuration.enableEfficiencyBasedDecisions) {
      const efficiencyRecommendations = this.generateEfficiencyBasedRecommendations(
        reasoningResult,
        context
      );
      recommendations.push(...efficiencyRecommendations);
    }
    
    // Generate safety-based recommendations
    if (this.configuration.enableSafetyBasedDecisions) {
      const safetyRecommendations = this.generateSafetyBasedRecommendations(
        reasoningResult.entities,
        reasoningResult.relationships,
        context
      );
      recommendations.push(...safetyRecommendations);
    }
    
    // Generate quality-based recommendations
    if (this.configuration.enableQualityBasedDecisions) {
      const qualityRecommendations = this.generateQualityBasedRecommendations(
        reasoningResult,
        context
      );
      recommendations.push(...qualityRecommendations);
    }
    
    // Filter by confidence threshold
    const filteredRecommendations = recommendations
      .filter(rec => rec.confidence >= this.configuration.minRecommendationConfidence)
      .slice(0, this.configuration.maxRecommendations);
    
    // Prioritize recommendations if enabled
    if (this.configuration.enablePrioritization) {
      this.prioritizeRecommendations(filteredRecommendations, context);
    }
    
    const processingTime = Date.now() - startTime;
    console.log(`Decision support system completed in ${processingTime}ms, generated ${filteredRecommendations.length} recommendations`);
    
    return filteredRecommendations;
  }
  
  /**
   * Generate recommendations from inferences
   */
  private generateRecommendationsFromInferences(
    inferences: Inference[],
    entities: Entity[],
    context?: DecisionContext
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    for (const inference of inferences) {
      if (inference.confidence >= 70) {
        let recommendationType = 'content';
        let priority = 'medium';
        let effort = 'medium';
        
        // Determine recommendation type based on inference type
        switch (inference.type) {
          case 'deductive':
            recommendationType = 'analysis';
            priority = 'medium';
            effort = 'low';
            break;
          case 'inductive':
            recommendationType = 'investigation';
            priority = 'high';
            effort = 'medium';
            break;
          case 'abductive':
            recommendationType = 'diagnosis';
            priority = 'high';
            effort = 'high';
            break;
          case 'temporal':
            recommendationType = 'monitoring';
            priority = 'medium';
            effort = 'medium';
            break;
          case 'spatial':
            recommendationType = 'planning';
            priority = 'high';
            effort = 'high';
            break;
          case 'causal':
            recommendationType = 'mitigation';
            priority = 'critical';
            effort = 'high';
            break;
        }
        
        const recommendation: Recommendation = {
          id: `rec-${inference.id}-${Date.now()}`,
          type: recommendationType,
          title: `Action based on inference: ${inference.type}`,
          description: inference.statement,
          action: `Review and address the inference: "${inference.conclusion}"`,
          priority,
          confidence: Math.min(90, inference.confidence + 5),
          impact: 'Improves decision quality and reduces uncertainty',
          effort,
          relatedEntities: inference.premises.map(p => p.sourceId),
          evidence: [
            {
              type: 'inference',
              description: `AI inference with ${inference.confidence}% confidence`,
              source: 'ai_reasoning',
              confidence: inference.confidence
            }
          ]
        };
        
        recommendations.push(recommendation);
      }
    }
    
    return recommendations;
  }
  
  /**
   * Generate risk-based recommendations
   */
  private generateRiskBasedRecommendations(
    entities: Entity[],
    relationships: Relationship[],
    context?: DecisionContext
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Identify risk-related entities
    const riskEntities = entities.filter(e => 
      e.type === 'risk_factor' || 
      e.type === 'hazard' || 
      e.text.toLowerCase().includes('risk') ||
      e.text.toLowerCase().includes('hazard') ||
      e.text.toLowerCase().includes('danger')
    );
    
    if (riskEntities.length > 0) {
      const recommendation: Recommendation = {
        id: `risk-rec-${Date.now()}`,
        type: 'safety',
        title: 'Risk Assessment Required',
        description: `${riskEntities.length} risk factors identified requiring assessment`,
        action: 'Conduct detailed risk assessment and implement mitigation measures',
        priority: riskEntities.length >= 3 ? 'critical' : 'high',
        confidence: Math.min(85, 70 + (riskEntities.length * 5)),
        impact: 'Reduces potential harm and liability',
        effort: 'high',
        relatedEntities: riskEntities.map(e => e.id),
        evidence: riskEntities.map(entity => ({
          type: 'risk_entity',
          description: `Risk entity identified: ${entity.text}`,
          source: 'entity_extraction',
          confidence: entity.confidence
        }))
      };
      
      recommendations.push(recommendation);
    }
    
    return recommendations;
  }
  
  /**
   * Generate compliance-based recommendations
   */
  private generateComplianceBasedRecommendations(
    entities: Entity[],
    relationships: Relationship[],
    context?: DecisionContext
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Identify compliance-related entities
    const complianceEntities = entities.filter(e => 
      e.type === 'regulation' || 
      e.type === 'standard' || 
      e.text.toLowerCase().includes('bs5837') ||
      e.text.toLowerCase().includes('compliance') ||
      e.text.toLowerCase().includes('regulation') ||
      e.text.toLowerCase().includes('standard')
    );
    
    if (complianceEntities.length > 0) {
      const recommendation: Recommendation = {
        id: `compliance-rec-${Date.now()}`,
        type: 'compliance',
        title: 'Compliance Verification Required',
        description: `${complianceEntities.length} compliance references identified`,
        action: 'Verify compliance with referenced standards and regulations',
        priority: 'high',
        confidence: 80,
        impact: 'Ensures regulatory compliance and avoids penalties',
        effort: 'medium',
        relatedEntities: complianceEntities.map(e => e.id),
        evidence: complianceEntities.map(entity => ({
          type: 'compliance_entity',
          description: `Compliance reference: ${entity.text}`,
          source: 'entity_extraction',
          confidence: entity.confidence
        }))
      };
      
      recommendations.push(recommendation);
    }
    
    return recommendations;
  }
  
  /**
   * Generate efficiency-based recommendations
   */
  private generateEfficiencyBasedRecommendations(
    reasoningResult: AIReasoningResult,
    context?: DecisionContext
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Analyze for efficiency opportunities
    const hasMultipleSimilarEntities = this.hasMultipleSimilarEntities(reasoningResult.entities);
    const hasRedundantContent = this.hasRedundantContent(reasoningResult);
    
    if (hasMultipleSimilarEntities || hasRedundantContent) {
      const recommendation: Recommendation = {
        id: `efficiency-rec-${Date.now()}`,
        type: 'efficiency',
        title: 'Efficiency Improvement Opportunity',
        description: 'Potential for streamlining content or processes identified',
        action: 'Review for duplication and implement standardization',
        priority: 'medium',
        confidence: 75,
        impact: 'Reduces effort and improves consistency',
        effort: 'low',
        relatedEntities: [],
        evidence: [
          {
            type: 'efficiency_analysis',
            description: 'Analysis suggests potential for efficiency improvements',
            source: 'decision_support',
            confidence: 70
          }
        ]
      };
      
      recommendations.push(recommendation);
    }
    
    return recommendations;
  }
  
  /**
   * Generate safety-based recommendations
   */
  private generateSafetyBasedRecommendations(
    entities: Entity[],
    relationships: Relationship[],
    context?: DecisionContext
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Identify safety-related entities
    const safetyEntities = entities.filter(e => 
      e.type === 'safety_issue' || 
      e.text.toLowerCase().includes('safety') ||
      e.text.toLowerCase().includes('protective') ||
      e.text.toLowerCase().includes('ppe') ||
      e.text.toLowerCase().includes('emergency')
    );
    
    if (safetyEntities.length > 0) {
      const recommendation: Recommendation = {
        id: `safety-rec-${Date.now()}`,
        type: 'safety',
        title: 'Safety Considerations Identified',
        description: `${safetyEntities.length} safety-related items identified`,
        action: 'Review and address all safety considerations',
        priority: 'critical',
        confidence: 85,
        impact: 'Ensures worker and public safety',
        effort: 'high',
        relatedEntities: safetyEntities.map(e => e.id),
        evidence: safetyEntities.map(entity => ({
          type: 'safety_entity',
          description: `Safety consideration: ${entity.text}`,
          source: 'entity_extraction',
          confidence: entity.confidence
        }))
      };
      
      recommendations.push(recommendation);
    }
    
    return recommendations;
  }
  
  /**
   * Generate quality-based recommendations
   */
  private generateQualityBasedRecommendations(
    reasoningResult: AIReasoningResult,
    context?: DecisionContext
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Analyze for quality issues
    const lowConfidenceEntities = reasoningResult.entities.filter(e => e.confidence < 70);
    
    if (lowConfidenceEntities.length > 0) {
      const recommendation: Recommendation = {
        id: `quality-rec-${Date.now()}`,
        type: 'quality',
        title: 'Data Quality Improvement Needed',
        description: `${lowConfidenceEntities.length} entities with low confidence identified`,
        action: 'Review and improve data quality for low-confidence entities',
        priority: 'medium',
        confidence: 70,
        impact: 'Improves decision accuracy and reliability',
        effort: 'medium',
        relatedEntities: lowConfidenceEntities.map(e => e.id),
        evidence: lowConfidenceEntities.map(entity => ({
          type: 'quality_issue',
          description: `Low confidence entity: ${entity.text} (${entity.confidence}%)`,
          source: 'entity_extraction',
          confidence: entity.confidence
        }))
      };
      
      recommendations.push(recommendation);
    }
    
    return recommendations;
  }
  
  /**
   * Check if there are multiple similar entities
   */
  private hasMultipleSimilarEntities(entities: Entity[]): boolean {
    // Simplified check - in reality would use more sophisticated similarity detection
    const entityTexts = entities.map(e => e.text.toLowerCase());
    const uniqueTexts = new Set(entityTexts);
    return entityTexts.length > uniqueTexts.size + 2; // More than 2 duplicates
  }
  
  /**
   * Check for redundant content
   */
  private hasRedundantContent(reasoningResult: AIReasoningResult): boolean {
    // Simplified check
    return reasoningResult.entities.length > 10 &&
           reasoningResult.inferences.length < reasoningResult.entities.length / 3;
  }
  
  /**
   * Identify missing relationships between entities
   */
  private identifyMissingRelationships(entities: Entity[], relationships: Relationship[]): number {
    // Simplified calculation
    const expectedRelationships = entities.length * 0.5; // Expected 0.5 relationships per entity
    return Math.max(0, Math.round(expectedRelationships - relationships.length));
  }
  
  /**
   * Prioritize recommendations based on context and rules
   */
  private prioritizeRecommendations(recommendations: Recommendation[], context?: DecisionContext): void {
    if (!this.configuration.enablePrioritization) return;
    
    for (const recommendation of recommendations) {
      // Adjust priority based on context preferences
      if (context?.preferences) {
        const preferences = context.preferences;
        
        // Increase priority for safety if safety importance is high
        if (recommendation.type === 'safety' && preferences.safetyImportance > 80) {
          if (recommendation.priority === 'medium') recommendation.priority = 'high';
          else if (recommendation.priority === 'high') recommendation.priority = 'critical';
        }
        
        // Increase priority for efficiency if efficiency importance is high
        if (recommendation.type === 'efficiency' && preferences.efficiencyImportance > 80) {
          if (recommendation.priority === 'low') recommendation.priority = 'medium';
          else if (recommendation.priority === 'medium') recommendation.priority = 'high';
        }
      }
      
      // Adjust based on historical decisions
      const similarHistorical = this.historicalDecisions.filter(hist =>
        hist.type.includes(recommendation.type) ||
        hist.description.toLowerCase().includes(recommendation.type)
      );
      
      if (similarHistorical.length > 0) {
        const positiveOutcomes = similarHistorical.filter(hist => hist.outcome === 'positive').length;
        const totalOutcomes = similarHistorical.length;
        
        if (positiveOutcomes / totalOutcomes > 0.7) {
          // Historical success rate high, increase confidence
          recommendation.confidence = Math.min(95, recommendation.confidence + 10);
        }
      }
    }
    
    // Sort by priority (critical, high, medium, low)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] -
                          priorityOrder[b.priority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence; // Higher confidence first for same priority
    });
  }
  
  /**
   * Generate action plan from recommendations
   */
  async generateActionPlan(
    recommendations: Recommendation[],
    context?: DecisionContext
  ): Promise<ActionPlan | null> {
    if (!this.configuration.enableActionPlanGeneration || recommendations.length === 0) {
      return null;
    }
    
    const criticalRecommendations = recommendations.filter(r => r.priority === 'critical');
    const highRecommendations = recommendations.filter(r => r.priority === 'high');
    
    const actions: ActionItem[] = [
      ...criticalRecommendations.map((rec, index) => ({
        id: `action-critical-${index + 1}`,
        description: rec.action,
        type: 'implementation' as const,
        priority: 'critical',
        estimatedEffort: 8, // 8 hours
        requiredSkills: ['analysis', 'implementation'],
        dependencies: [],
        successCriteria: [`Complete ${rec.title}`]
      })),
      ...highRecommendations.map((rec, index) => ({
        id: `action-high-${index + 1}`,
        description: rec.action,
        type: 'implementation' as const,
        priority: 'high',
        estimatedEffort: 4, // 4 hours
        requiredSkills: ['analysis'],
        dependencies: [],
        successCriteria: [`Address ${rec.title}`]
      }))
    ];
    
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 14); // 2-week timeline
    
    const actionPlan: ActionPlan = {
      id: `plan-${Date.now()}`,
      name: 'AI-Generated Action Plan',
      description: 'Action plan generated from AI reasoning recommendations',
      actions,
      timeline: {
        start: now,
        end: endDate,
        durationDays: 14
      },
      resources: [
        {
          type: 'personnel',
          description: 'Arboricultural specialist',
          quantity: 1,
          unit: 'person',
          availability: 'available'
        },
        {
          type: 'time',
          description: 'Implementation time',
          quantity: actions.reduce((sum, action) => sum + action.estimatedEffort, 0),
          unit: 'hours',
          availability: 'partial'
        }
      ],
      expectedOutcomes: [
        'Improved decision quality',
        'Reduced risk',
        'Enhanced compliance',
        'Increased efficiency'
      ],
      risks: [
        {
          id: 'risk-001',
          description: 'Resource constraints may delay implementation',
          likelihood: 'medium',
          impact: 'medium',
          level: 'medium',
          mitigationStrategies: ['Prioritize critical actions', 'Allocate additional resources if needed']
        }
      ],
      successMetrics: [
        {
          id: 'metric-001',
          name: 'Recommendation Implementation Rate',
          description: 'Percentage of recommendations implemented',
          target: 80,
          current: 0,
          unit: '%'
        }
      ]
    };
    
    return actionPlan;
  }
  
  /**
   * Provide decision justification
   */
  generateDecisionJustification(
    recommendations: Recommendation[],
    actionPlan: ActionPlan | null,
    context?: DecisionContext
  ): string {
    if (!this.configuration.enableDecisionJustification) {
      return 'Decision justification not enabled.';
    }
    
    const criticalCount = recommendations.filter(r => r.priority === 'critical').length;
    const highCount = recommendations.filter(r => r.priority === 'high').length;
    
    let justification = `## Decision Justification\n\n`;
    justification += `Based on AI reasoning analysis, ${recommendations.length} recommendations were generated.\n\n`;
    justification += `**Priority Breakdown:**\n`;
    justification += `- Critical: ${criticalCount} recommendations\n`;
    justification += `- High: ${highCount} recommendations\n`;
    justification += `- Medium/Low: ${recommendations.length - criticalCount - highCount} recommendations\n\n`;
    
    if (actionPlan) {
      justification += `**Action Plan Summary:**\n`;
      justification += `- ${actionPlan.actions.length} actions identified\n`;
      justification += `- Timeline: ${actionPlan.timeline.durationDays} days\n`;
      justification += `- Total estimated effort: ${actionPlan.resources.find(r => r.type === 'time')?.quantity || 0} hours\n\n`;
    }
    
    justification += `**Key Factors Considered:**\n`;
    if (context?.preferences) {
      justification += `- Risk tolerance: ${context.preferences.riskTolerance}\n`;
      justification += `- Safety importance: ${context.preferences.safetyImportance}/100\n`;
      justification += `- Efficiency importance: ${context.preferences.efficiencyImportance}/100\n`;
    }
    
    justification += `- Historical decision success rate: ${this.calculateHistoricalSuccessRate()}%\n\n`;
    
    justification += `**Recommended Approach:**\n`;
    justification += `1. Address all critical recommendations immediately\n`;
    justification += `2. Implement high-priority recommendations within the planned timeline\n`;
    justification += `3. Monitor progress using the defined success metrics\n`;
    
    return justification;
  }
  
  /**
   * Calculate historical decision success rate
   */
  private calculateHistoricalSuccessRate(): number {
    if (this.historicalDecisions.length === 0) return 0;
    
    const positiveDecisions = this.historicalDecisions.filter(d => d.outcome === 'positive').length;
    return Math.round((positiveDecisions / this.historicalDecisions.length) * 100);
  }
  
  /**
   * Add a historical decision
   */
  addHistoricalDecision(decision: HistoricalDecision): void {
    this.historicalDecisions.push(decision);
  }
  
  /**
   * Get historical decisions
   */
  getHistoricalDecisions(): HistoricalDecision[] {
    return [...this.historicalDecisions];
  }
  
  /**
   * Update configuration
   */
  updateConfiguration(newConfig: Partial<DecisionSupportConfiguration>): void {
    this.configuration = { ...this.configuration, ...newConfig };
  }
  
  /**
   * Get current configuration
   */
  getConfiguration(): DecisionSupportConfiguration {
    return { ...this.configuration };
  }
  
  /**
   * Set inference engine
   */
  setInferenceEngine(inferenceEngine: InferenceEngine): void {
    this.inferenceEngine = inferenceEngine;
  }
  
  /**
   * Set knowledge graph
   */
  setKnowledgeGraph(knowledgeGraph: KnowledgeGraph): void {
    this.knowledgeGraph = knowledgeGraph;
  }
}
/**
 * Natural Language Understanding (NLU) Module - Phase 12
 * 
 * Advanced NLP for understanding report content and user queries.
 * Provides semantic analysis, entity extraction, relationship extraction,
 * intent understanding, and sentiment analysis.
 */

import { NLUResult, Entity, Relationship, SemanticAnalysis, IntentAnalysis, SentimentAnalysis } from '../AIReasoningResult';

/**
 * NLU Configuration
 */
export interface NLUConfiguration {
  /** Enable semantic analysis */
  enableSemanticAnalysis: boolean;
  
  /** Enable entity extraction */
  enableEntityExtraction: boolean;
  
  /** Enable relationship extraction */
  enableRelationshipExtraction: boolean;
  
  /** Enable intent understanding */
  enableIntentUnderstanding: boolean;
  
  /** Enable sentiment analysis */
  enableSentimentAnalysis: boolean;
  
  /** Language model to use (e.g., 'local', 'groq', 'openai') */
  languageModel: string;
  
  /** Confidence threshold for results (0-100) */
  confidenceThreshold: number;
  
  /** Maximum entities to extract */
  maxEntities: number;
  
  /** Maximum relationships to extract */
  maxRelationships: number;
  
  /** Domain-specific dictionaries */
  dictionaries: {
    /** Tree species dictionary */
    treeSpecies: string[];
    
    /** Arboricultural terms dictionary */
    arboriculturalTerms: string[];
    
    /** Compliance terms dictionary */
    complianceTerms: string[];
    
    /** Location terms dictionary */
    locationTerms: string[];
  };
}

/**
 * Default NLU Configuration
 */
export const DEFAULT_NLU_CONFIG: NLUConfiguration = {
  enableSemanticAnalysis: true,
  enableEntityExtraction: true,
  enableRelationshipExtraction: true,
  enableIntentUnderstanding: true,
  enableSentimentAnalysis: true,
  languageModel: 'local',
  confidenceThreshold: 70,
  maxEntities: 50,
  maxRelationships: 30,
  dictionaries: {
    treeSpecies: [
      'oak', 'maple', 'pine', 'birch', 'ash', 'beech', 'chestnut', 'elm', 'fir', 'hawthorn',
      'holly', 'hornbeam', 'larch', 'lime', 'poplar', 'rowan', 'spruce', 'sycamore', 'willow', 'yew'
    ],
    arboriculturalTerms: [
      'arboriculture', 'tree surgery', 'pruning', 'felling', 'pollarding', 'crown reduction',
      'crown lifting', 'crown thinning', 'tree preservation order', 'tpo', 'conservation area',
      'root protection area', 'rpa', 'bs5837', 'tree survey', 'risk assessment', 'hazard assessment',
      'decay', 'fungus', 'cavity', 'crack', 'split', 'lean', 'deadwood', 'vitality', 'vigour'
    ],
    complianceTerms: [
      'bs5837:2012', 'bs3998', 'aia', 'ams', 'iso14001', 'health and safety', 'risk assessment',
      'method statement', 'site safety', 'ppe', 'personal protective equipment', 'coshh', 'ramms'
    ],
    locationTerms: [
      'site', 'location', 'address', 'property', 'plot', 'parcel', 'land', 'estate', 'development',
      'construction', 'building', 'house', 'road', 'street', 'lane', 'avenue', 'close', 'drive'
    ]
  }
};

/**
 * Natural Language Understanding Module
 */
export class NaturalLanguageUnderstanding {
  private configuration: NLUConfiguration;
  
  /**
   * Create a new NLU module
   */
  constructor(configuration: Partial<NLUConfiguration> = {}) {
    this.configuration = { ...DEFAULT_NLU_CONFIG, ...configuration };
  }
  
  /**
   * Analyze text with comprehensive NLU
   */
  async analyze(text: string, context?: any): Promise<NLUResult[]> {
    const results: NLUResult[] = [];
    const startTime = Date.now();
    
    try {
      // Split text into sentences or paragraphs for analysis
      const segments = this.segmentText(text);
      
      for (const segment of segments) {
        const nluResult = await this.analyzeSegment(segment, context);
        if (nluResult) {
          results.push(nluResult);
        }
      }
      
      // Limit results based on configuration
      if (results.length > this.configuration.maxEntities * 2) {
        results.sort((a, b) => b.confidence - a.confidence);
        results.splice(this.configuration.maxEntities * 2);
      }
      
      return results;
    } catch (error) {
      console.error('NLU analysis error:', error);
      throw error;
    }
  }
  
  /**
   * Analyze a single text segment
   */
  private async analyzeSegment(segment: { text: string; start: number; end: number }, context?: any): Promise<NLUResult | null> {
    const analysis: any = {};
    
    // Perform semantic analysis if enabled
    if (this.configuration.enableSemanticAnalysis) {
      analysis.semantic = await this.performSemanticAnalysis(segment.text, context);
    }
    
    // Perform entity extraction if enabled
    if (this.configuration.enableEntityExtraction) {
      analysis.entities = await this.extractEntities(segment.text, context);
    }
    
    // Perform relationship extraction if enabled
    if (this.configuration.enableRelationshipExtraction && analysis.entities && analysis.entities.length > 1) {
      analysis.relationships = await this.extractRelationships(segment.text, analysis.entities, context);
    }
    
    // Perform intent understanding if enabled
    if (this.configuration.enableIntentUnderstanding) {
      analysis.intent = await this.understandIntent(segment.text, context);
    }
    
    // Perform sentiment analysis if enabled
    if (this.configuration.enableSentimentAnalysis) {
      analysis.sentiment = await this.analyzeSentiment(segment.text, context);
    }
    
    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(analysis);
    
    // Only return result if confidence meets threshold
    if (confidence < this.configuration.confidenceThreshold) {
      return null;
    }
    
    return {
      type: 'comprehensive',
      text: segment.text,
      start: segment.start,
      end: segment.end,
      analysis,
      confidence
    };
  }
  
  /**
   * Segment text into analyzable units
   */
  private segmentText(text: string): Array<{ text: string; start: number; end: number }> {
    const segments: Array<{ text: string; start: number; end: number }> = [];
    
    // Simple segmentation by sentences (period, question mark, exclamation)
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    let match;
    let currentPosition = 0;
    
    while ((match = sentenceRegex.exec(text)) !== null) {
      const sentence = match[0].trim();
      if (sentence.length > 3) { // Ignore very short sentences
        const start = currentPosition + match.index;
        const end = start + sentence.length;
        segments.push({
          text: sentence,
          start,
          end
        });
      }
    }
    
    // If no sentences found, use the whole text
    if (segments.length === 0 && text.trim().length > 0) {
      segments.push({
        text: text.trim(),
        start: 0,
        end: text.trim().length
      });
    }
    
    return segments;
  }
  
  /**
   * Perform semantic analysis on text
   */
  private async performSemanticAnalysis(text: string, context?: any): Promise<SemanticAnalysis> {
    // This is a simplified implementation
    // In a real system, this would use NLP libraries or APIs
    
    const topics: string[] = [];
    const concepts: string[] = [];
    
    // Extract topics based on keyword matching
    const topicKeywords = [
      'tree', 'survey', 'report', 'assessment', 'inspection', 'analysis',
      'recommendation', 'compliance', 'safety', 'risk', 'health', 'condition'
    ];
    
    for (const keyword of topicKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        topics.push(keyword);
      }
    }
    
    // Extract concepts from dictionaries
    for (const [dictName, dictionary] of Object.entries(this.configuration.dictionaries)) {
      for (const term of dictionary) {
        if (text.toLowerCase().includes(term.toLowerCase())) {
          concepts.push(term);
        }
      }
    }
    
    // Remove duplicates
    const uniqueConcepts = [...new Set(concepts)];
    
    return {
      topics: topics.length > 0 ? topics : ['general'],
      concepts: uniqueConcepts,
      roles: [], // Would be populated by more advanced NLP
      discourse: {
        segments: [],
        relations: [],
        coherence: 0.7 // Default coherence
      },
      coherence: 0.7
    };
  }
  
  /**
   * Extract entities from text
   */
  private async extractEntities(text: string, context?: any): Promise<Entity[]> {
    const entities: Entity[] = [];
    
    // Extract tree species
    for (const species of this.configuration.dictionaries.treeSpecies) {
      const regex = new RegExp(`\\b${species}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        entities.push({
          id: `entity-${Date.now()}-${entities.length}`,
          text: match[0],
          type: 'species',
          subtype: species,
          start: match.index,
          end: match.index + match[0].length,
          confidence: 85,
          attributes: {
            scientificName: this.getScientificName(species),
            commonName: species
          },
          knowledgeGraphLinks: []
        });
      }
    }
    
    // Extract arboricultural terms
    for (const term of this.configuration.dictionaries.arboriculturalTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        entities.push({
          id: `entity-${Date.now()}-${entities.length}`,
          text: match[0],
          type: 'arboricultural_term',
          start: match.index,
          end: match.index + match[0].length,
          confidence: 80,
          attributes: {
            category: this.getTermCategory(term)
          },
          knowledgeGraphLinks: []
        });
      }
    }
    
    // Extract compliance terms
    for (const term of this.configuration.dictionaries.complianceTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        entities.push({
          id: `entity-${Date.now()}-${entities.length}`,
          text: match[0],
          type: 'compliance_term',
          start: match.index,
          end: match.index + match[0].length,
          confidence: 90,
          attributes: {
            standard: this.getComplianceStandard(term)
          },
          knowledgeGraphLinks: []
        });
      }
    }
    
    // Extract location terms
    for (const term of this.configuration.dictionaries.locationTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        entities.push({
          id: `entity-${Date.now()}-${entities.length}`,
          text: match[0],
          type: 'location_term',
          start: match.index,
          end: match.index + match[0].length,
          confidence: 75,
          attributes: {},
          knowledgeGraphLinks: []
        });
      }
    }
    
    // Extract measurements (e.g., 10m, 5cm, 2.5m)
    const measurementRegex = /\b(\d+(?:\.\d+)?)\s*(m|cm|mm|km|ft|in)\b/gi;
    let measurementMatch;
    while ((measurementMatch = measurementRegex.exec(text)) !== null) {
      entities.push({
        id: `entity-${Date.now()}-${entities.length}`,
        text: measurementMatch[0],
        type: 'measurement',
        start: measurementMatch.index,
        end: measurementMatch.index + measurementMatch[0].length,
        confidence: 95,
        attributes: {
          value: parseFloat(measurementMatch[1]),
          unit: measurementMatch[2].toLowerCase()
        },
        knowledgeGraphLinks: []
      });
    }
    
    // Extract dates (simple pattern)
    const dateRegex = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b|\b(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/gi;
    let dateMatch;
    while ((dateMatch = dateRegex.exec(text)) !== null) {
      entities.push({
        id: `entity-${Date.now()}-${entities.length}`,
        text: dateMatch[0],
        type: 'date',
        start: dateMatch.index,
        end: dateMatch.index + dateMatch[0].length,
        confidence: 90,
        attributes: {
          raw: dateMatch[0]
        },
        knowledgeGraphLinks: []
      });
    }
    
    // Limit entities based on configuration
    if (entities.length > this.configuration.maxEntities) {
      entities.sort((a, b) => b.confidence - a.confidence);
      entities.splice(this.configuration.maxEntities);
    }
    
    return entities;
  }
  
  /**
   * Extract relationships between entities
   */
  private async extractRelationships(text: string, entities: Entity[], context?: any): Promise<Relationship[]> {
    const relationships: Relationship[] = [];
    
    // Simple relationship extraction based on proximity and patterns
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityA = entities[i];
        const entityB = entities[j];
        
        // Check if entities are close in text (within 50 characters)
        const distance = Math.abs(entityA.start - entityB.start);
        if (distance > 200) {
          continue; // Too far apart
        }
        
        // Determine relationship type based on entity types
        let relationshipType = 'related_to';
        let confidence = 70;
        
        if (entityA.type === 'species' && entityB.type === 'measurement') {
          relationshipType = 'has_dimension';
          confidence = 85;
        } else if (entityA.type === 'location_term' && entityB.type === 'species') {
          relationshipType = 'located_at';
          confidence = 80;
        } else if (entityA.type === 'compliance_term' && entityB.type === 'arboricultural_term') {
          relationshipType = 'governs';
          confidence = 90;
        }
        
        // Extract evidence text between entities
        const start = Math.min(entityA.start, entityB.start);
        const end = Math.max(entityA.end, entityB.end);
        const evidenceText = text.substring(start, end);
        
        relationships.push({
          id: `rel-${Date.now()}-${relationships.length}`,
          type: relationshipType,
          sourceEntityId: entityA.id,
          targetEntityId: entityB.id,
          confidence,
          attributes: {
            distance,
            evidenceText
          },
          evidence: [{
            text: evidenceText,
            start,
            end,
            type: 'proximity',
            confidence: Math.max(70, 100 - distance / 2)
          }]
        });
      }
    }
    
    // Limit relationships based on configuration
    if (relationships.length > this.configuration.maxRelationships) {
      relationships.sort((a, b) => b.confidence - a.confidence);
      relationships.splice(this.configuration.maxRelationships);
    }
    
    return relationships;
  }
  
  /**
   * Understand intent from text
   */
  private async understandIntent(text: string, context?: any): Promise<IntentAnalysis> {
    // Simple intent classification based on keywords
    const intents = [
      { name: 'inform', keywords: ['report', 'describe', 'explain', 'detail', 'summary'] },
      { name: 'recommend', keywords: ['recommend', 'suggest', 'advise', 'propose', 'should'] },
      { name: 'assess', keywords: ['assess', 'evaluate', 'analyze', 'review', 'inspect'] },
      { name: 'warn', keywords: ['warning', 'danger', 'risk', 'hazard', 'caution'] },
      { name: 'comply', keywords: ['comply', 'meet', 'standard', 'requirement', 'regulation'] }
    ];
    
    const confidenceScores: Record<string, number> = {};
    const textLower = text.toLowerCase();
    
    for (const intent of intents) {
      let score = 0;
      for (const keyword of intent.keywords) {
        if (textLower.includes(keyword)) {
          score += 20;
        }
      }
      confidenceScores[intent.name] = Math.min(score, 100);
    }
    
    // Determine primary intent (highest score)
    let primaryIntent = 'inform';
    let highestScore = 0;
    
    for (const [intent, score] of Object.entries(confidenceScores)) {
      if (score > highestScore) {
        highestScore = score;
        primaryIntent = intent;
      }
    }
    
    // Get secondary intents (scores > 30)
    const secondaryIntents = Object.entries(confidenceScores)
      .filter(([intent, score]) => intent !== primaryIntent && score > 30)
      .map(([intent]) => intent);
    
    return {
      primaryIntent,
      secondaryIntents,
      confidenceScores,
      parameters: {} // Would be extracted by more advanced NLP
    };
  }
  
  /**
   * Calculate overall confidence for analysis
   */
  private calculateOverallConfidence(analysis: any): number {
    let totalConfidence = 0;
    let count = 0;
    
    if (analysis.semantic) {
      totalConfidence += 70; // Base confidence for semantic analysis
      count++;
    }
    
    if (analysis.entities && analysis.entities.length > 0) {
      const avgEntityConfidence = analysis.entities.reduce((sum: number, entity: Entity) => sum + entity.confidence, 0) / analysis.entities.length;
      totalConfidence += avgEntityConfidence;
      count++;
    }
    
    if (analysis.relationships && analysis.relationships.length > 0) {
      const avgRelConfidence = analysis.relationships.reduce((sum: number, rel: Relationship) => sum + rel.confidence, 0) / analysis.relationships.length;
      totalConfidence += avgRelConfidence;
      count++;
    }
    
    if (analysis.intent) {
      const intentConfidence = analysis.intent.confidenceScores[analysis.intent.primaryIntent] || 70;
      totalConfidence += intentConfidence;
      count++;
    }
    
    if (analysis.sentiment) {
      totalConfidence += Math.abs(analysis.sentiment.score) * 50 + 50; // Convert -1 to 1 scale to 0-100
      count++;
    }
    
    return count > 0 ? Math.round(totalConfidence / count) : 0;
  }
  
  /**
   * Get scientific name for common tree species
   */
  private getScientificName(commonName: string): string {
    const scientificNames: Record<string, string> = {
      'oak': 'Quercus robur',
      'maple': 'Acer pseudoplatanus',
      'pine': 'Pinus sylvestris',
      'birch': 'Betula pendula',
      'ash': 'Fraxinus excelsior',
      'beech': 'Fagus sylvatica',
      'chestnut': 'Castanea sativa',
      'elm': 'Ulmus procera',
      'fir': 'Abies alba',
      'hawthorn': 'Crataegus monogyna',
      'holly': 'Ilex aquifolium',
      'hornbeam': 'Carpinus betulus',
      'larch': 'Larix decidua',
      'lime': 'Tilia x europaea',
      'poplar': 'Populus nigra',
      'rowan': 'Sorbus aucuparia',
      'spruce': 'Picea abies',
      'sycamore': 'Acer pseudoplatanus',
      'willow': 'Salix alba',
      'yew': 'Taxus baccata'
    };
    
    return scientificNames[commonName.toLowerCase()] || commonName;
  }
  
  /**
   * Get category for arboricultural term
   */
  private getTermCategory(term: string): string {
    const categories: Record<string, string> = {
      'arboriculture': 'discipline',
      'tree surgery': 'practice',
      'pruning': 'technique',
      'felling': 'technique',
      'pollarding': 'technique',
      'crown reduction': 'technique',
      'crown lifting': 'technique',
      'crown thinning': 'technique',
      'tree preservation order': 'legal',
      'tpo': 'legal',
      'conservation area': 'legal',
      'root protection area': 'technical',
      'rpa': 'technical',
      'bs5837': 'standard',
      'tree survey': 'practice',
      'risk assessment': 'practice',
      'hazard assessment': 'practice',
      'decay': 'condition',
      'fungus': 'condition',
      'cavity': 'condition',
      'crack': 'condition',
      'split': 'condition',
      'lean': 'condition',
      'deadwood': 'condition',
      'vitality': 'assessment',
      'vigour': 'assessment'
    };
    
    return categories[term.toLowerCase()] || 'general';
  }
  
  /**
   * Get compliance standard for term
   */
  private getComplianceStandard(term: string): string {
    const standards: Record<string, string> = {
      'bs5837:2012': 'BS5837:2012',
      'bs3998': 'BS3998',
      'aia': 'Arboricultural Impact Assessment',
      'ams': 'Arboricultural Method Statement',
      'iso14001': 'ISO14001',
      'health and safety': 'Health and Safety at Work Act',
      'risk assessment': 'Risk Assessment',
      'method statement': 'Method Statement',
      'site safety': 'Site Safety',
      'ppe': 'Personal Protective Equipment',
      'personal protective equipment': 'Personal Protective Equipment',
      'coshh': 'COSHH',
      'ramms': 'RAMMS'
    };
    
    return standards[term.toLowerCase()] || term;
  }
  
  /**
   * Analyze sentiment in text
   */
  private async analyzeSentiment(text: string, context?: any): Promise<SentimentAnalysis> {
    // Simple sentiment analysis based on keywords
    const positiveWords = [
      'good', 'healthy', 'strong', 'stable', 'safe', 'excellent', 'positive',
      'satisfactory', 'adequate', 'acceptable', 'robust', 'vigorous', 'thriving'
    ];
    
    const negativeWords = [
      'poor', 'unhealthy', 'weak', 'unstable', 'dangerous', 'bad', 'negative',
      'unsatisfactory', 'inadequate', 'unacceptable', 'decaying', 'dying', 'declining',
      'risk', 'hazard', 'danger', 'problem', 'issue', 'concern', 'worry'
    ];
    
    const textLower = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const word of positiveWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        positiveCount += matches.length;
      }
    }
    
    for (const word of negativeWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        negativeCount += matches.length;
      }
    }
    
    // Calculate sentiment score (-1 to 1)
    const total = positiveCount + negativeCount;
    let score = 0;
    let overall = 'neutral';
    
    if (total > 0) {
      score = (positiveCount - negativeCount) / total;
      if (score > 0.3) {
        overall = 'positive';
      } else if (score < -0.3) {
        overall = 'negative';
      } else if (Math.abs(score) <= 0.3) {
        overall = 'mixed';
      }
    }
    
    // Analyze aspects (simplified)
    const aspects: Array<{ aspect: string; sentiment: string; score: number; evidence: string }> = [];
    
    // Check for tree health aspect
    const healthWords = ['healthy', 'unhealthy', 'vigorous', 'decaying', 'dying', 'thriving'];
    let healthScore = 0;
    let healthEvidence = '';
    
    for (const word of healthWords) {
      if (textLower.includes(word)) {
        healthEvidence = word;
        if (['healthy', 'vigorous', 'thriving'].includes(word)) {
          healthScore += 1;
        } else {
          healthScore -= 1;
        }
      }
    }
    
    if (healthEvidence) {
      aspects.push({
        aspect: 'tree_health',
        sentiment: healthScore > 0 ? 'positive' : healthScore < 0 ? 'negative' : 'neutral',
        score: Math.max(-1, Math.min(1, healthScore / 3)),
        evidence: healthEvidence
      });
    }
    
    // Check for risk aspect
    const riskWords = ['risk', 'hazard', 'danger', 'safe', 'stable', 'unstable'];
    let riskScore = 0;
    let riskEvidence = '';
    
    for (const word of riskWords) {
      if (textLower.includes(word)) {
        riskEvidence = word;
        if (['safe', 'stable'].includes(word)) {
          riskScore += 1;
        } else {
          riskScore -= 1;
        }
      }
    }
    
    if (riskEvidence) {
      aspects.push({
        aspect: 'risk_level',
        sentiment: riskScore > 0 ? 'positive' : riskScore < 0 ? 'negative' : 'neutral',
        score: Math.max(-1, Math.min(1, riskScore / 3)),
        evidence: riskEvidence
      });
    }
    
    return {
      overall,
      score,
      aspects
    };
  }
  
  /**
   * Update configuration
   */
  updateConfiguration(newConfig: Partial<NLUConfiguration>): void {
    this.configuration = { ...this.configuration, ...newConfig };
  }
  
  /**
   * Get current configuration
   */
  getConfiguration(): NLUConfiguration {
    return { ...this.configuration };
  }
  
  /**
   * Reset to default configuration
   */
  resetConfiguration(): void {
    this.configuration = { ...DEFAULT_NLU_CONFIG };
  }
}
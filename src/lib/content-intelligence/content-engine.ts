/**
 * Content Intelligence Engine for Oscar AI Phase Compliance Package
 * 
 * This file implements the ContentIntelligenceEngine class for Phase 17: Content Intelligence System.
 * It handles content analysis, SEO optimization, and intelligence gathering from various sources.
 * 
 * File: src/lib/content-intelligence/content-engine.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

import type { ContentAnalysisResult, IntelligenceCategory, ExtractedEntity, ContentInsight } from './content-intelligence-system';

/**
 * SEO optimization metrics and suggestions
 */
export interface SEOAnalysis {
  /** Overall SEO score (0-100) */
  score: number;
  
  /** Keyword density analysis */
  keywords: {
    primary: string[];
    secondary: string[];
    density: Record<string, number>;
  };
  
  /** Readability metrics */
  readability: {
    score: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    suggestions: string[];
  };
  
  /** Technical SEO issues */
  technical: {
    metaTags: boolean;
    headings: boolean;
    images: boolean;
    links: boolean;
    speed: boolean;
  };
  
  /** Optimization suggestions */
  suggestions: string[];
}

/**
 * Content intelligence analysis configuration
 */
export interface ContentAnalysisConfig {
  /** Enable SEO analysis */
  enableSEO: boolean;
  
  /** Maximum content length for analysis */
  maxContentLength: number;
  
  /** Minimum keyword density threshold */
  minKeywordDensity: number;
  
  /** Focus keywords for analysis */
  focusKeywords: string[];
  
  /** Target audience */
  targetAudience: 'general' | 'technical' | 'business';
  
  /** Content type */
  contentType: 'article' | 'blog' | 'report' | 'documentation';
}

/**
 * Content intelligence engine for analyzing and optimizing content
 */
export class ContentIntelligenceEngine {
  private config: ContentAnalysisConfig;
  
  /**
   * Initialize the content intelligence engine
   */
  constructor(config: Partial<ContentAnalysisConfig> = {}) {
    this.config = {
      enableSEO: true,
      maxContentLength: 10000,
      minKeywordDensity: 0.5,
      focusKeywords: [],
      targetAudience: 'general',
      contentType: 'article',
      ...config
    };
  }
  
  /**
   * Analyze content for SEO optimization and intelligence
   */
  async analyzeContent(content: string, metadata?: Record<string, any>): Promise<ContentAnalysisResult & { seo?: SEOAnalysis }> {
    const analysisId = this.generateAnalysisId();
    const timestamp = new Date();
    
    // Truncate content if too long
    const processedContent = content.length > this.config.maxContentLength 
      ? content.substring(0, this.config.maxContentLength) 
      : content;
    
    // Perform content analysis
    const categories = this.analyzeCategories(processedContent);
    const entities = this.extractEntities(processedContent);
    const insights = this.generateInsights(processedContent, categories, entities);
    
    // Perform SEO analysis if enabled
    let seo: SEOAnalysis | undefined;
    if (this.config.enableSEO) {
      seo = this.analyzeSEO(processedContent);
    }
    
    return {
      id: analysisId,
      source: {
        type: 'document',
        id: analysisId,
        title: metadata?.title || 'Content Analysis',
        metadata: metadata || {}
      },
      timestamp,
      summary: this.generateSummary(content, entities, insights),
      qualityScore: this.calculateQualityScore(content, entities, insights),
      processing: {
        duration: 0,
        confidence: 0.8,
        accuracy: 0.9,
        methods: ['categorization', 'extraction', 'analysis', 'seo']
      },
      categories,
      entities,
      insights,
      seo
    };
  }
  
  /**
   * Optimize content based on SEO analysis
   */
  async optimizeContent(content: string, seoAnalysis: SEOAnalysis): Promise<string> {
    let optimizedContent = content;
    
    // Add meta tags if missing
    if (!seoAnalysis.technical.metaTags) {
      optimizedContent = this.addMetaTags(optimizedContent);
    }
    
    // Improve heading structure
    if (!seoAnalysis.technical.headings) {
      optimizedContent = this.optimizeHeadings(optimizedContent);
    }
    
    // Add alt text for images
    if (!seoAnalysis.technical.images) {
      optimizedContent = this.optimizeImages(optimizedContent);
    }
    
    // Add internal links
    if (!seoAnalysis.technical.links) {
      optimizedContent = this.addInternalLinks(optimizedContent);
    }
    
    // Apply keyword optimization
    optimizedContent = this.optimizeKeywords(optimizedContent, seoAnalysis.keywords);
    
    // Apply readability improvements
    optimizedContent = this.improveReadability(optimizedContent, seoAnalysis.readability);
    
    return optimizedContent;
  }
  
  /**
   * Analyze content categories
   */
  private analyzeCategories(content: string): IntelligenceCategory[] {
    const categories: IntelligenceCategory[] = [];
    
    // Basic category detection
    if (content.toLowerCase().includes('technology') || content.toLowerCase().includes('ai')) {
      categories.push({ id: 'tech', name: 'Technology', description: 'Technology and software related content', confidence: 0.8, entities: [], findings: [] });
    }
    
    if (content.toLowerCase().includes('business') || content.toLowerCase().includes('market')) {
      categories.push({ id: 'business', name: 'Business', description: 'Business and commerce related content', confidence: 0.7, entities: [], findings: [] });
    }
    
    if (content.toLowerCase().includes('research') || content.toLowerCase().includes('study')) {
      categories.push({ id: 'research', name: 'Research', description: 'Research and academic content', confidence: 0.6, entities: [], findings: [] });
    }
    
    return categories.length > 0 ? categories : [{ id: 'general', name: 'General', description: 'General content', confidence: 0.5, entities: [], findings: [] }];
  }
  
  /**
   * Extract entities from content
   */
  private extractEntities(content: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    // Simple entity extraction (in production, use NLP libraries)
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
      if (cleanWord.length > 3) {
        wordFreq.set(cleanWord, (wordFreq.get(cleanWord) || 0) + 1);
      }
    });
    
    // Extract frequent terms as entities
    const sortedEntities = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    sortedEntities.forEach(([term, frequency]) => {
      entities.push({
        id: 'entity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        value: term,
        type: this.getEntityType(term) === 'keyword' || this.getEntityType(term) === 'person' || this.getEntityType(term) === 'organization' || this.getEntityType(term) === 'location' || this.getEntityType(term) === 'concept' ? this.getEntityType(term) as any : 'custom',
        confidence: Math.min(frequency / words.length * 100, 1),
        context: this.extractContext(content, term),
        metadata: {},
        relationships: []
      });
    });
    
    return entities;
  }
  
  /**
   * Generate insights from content
   */
  private generateInsights(content: string, categories: IntelligenceCategory[], entities: ExtractedEntity[]): ContentInsight[] {
    const insights: ContentInsight[] = [];
    
    // Content length insight
    const lengthInsight = {
      type: 'length' as const,
      title: 'Content Length Analysis',
      description: content.length > 2000 ? 'Content is comprehensive' : 'Content is concise',
      confidence: 0.8,
      actionable: content.length < 500 ? 'Consider expanding content for better coverage' : null
    };
    insights.push({
      id: 'length-' + Date.now(),
      type: 'trend' as const,
      title: lengthInsight.title,
      description: lengthInsight.description,
      confidence: lengthInsight.confidence,
      evidence: ['Content length analysis'],
      impact: { severity: 'medium' as const, scope: 'content', timeframe: 'immediate' },
      actions: lengthInsight.actionable ? [lengthInsight.actionable] : []
    });
    
    // Keyword density insight
    const keywords = entities.filter(e => e.type === 'concept');
    if (keywords.length > 0) {
      const keywordInsight = {
        type: 'keywords' as const,
        title: 'Keyword Coverage',
        description: `Found ${keywords.length} key terms`,
        confidence: 0.7,
        actionable: keywords.length < 3 ? 'Consider adding more target keywords' : null
      };
      insights.push({
        id: 'keywords-' + Date.now(),
        type: 'trend' as const,
        title: keywordInsight.title,
        description: keywordInsight.description,
        confidence: keywordInsight.confidence,
        evidence: ['Keyword frequency analysis'],
        impact: { severity: 'low' as const, scope: 'content', timeframe: 'short-term' },
        actions: keywordInsight.actionable ? [keywordInsight.actionable] : []
      });
    }
    
    // Category insight
    if (categories.length > 0) {
      const categoryInsight = {
        type: 'category' as const,
        title: 'Content Category',
        description: `Primary category: ${categories[0].name}`,
        confidence: categories[0].confidence,
        actionable: null
      };
      insights.push({
        id: 'category-' + Date.now(),
        type: 'trend' as const,
        title: categoryInsight.title,
        description: categoryInsight.description,
        confidence: categoryInsight.confidence,
        evidence: ['Content categorization'],
        impact: { severity: 'low' as const, scope: 'content', timeframe: 'immediate' },
        actions: []
      });
    }
    
    return insights;
  }
  
  /**
   * Analyze SEO metrics
   */
  private analyzeSEO(content: string): SEOAnalysis {
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();
    
    // Calculate word frequency
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
      if (cleanWord.length > 2) {
        wordFreq.set(cleanWord, (wordFreq.get(cleanWord) || 0) + 1);
      }
    });
    
    // Extract keywords
    const keywords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => word);
    
    // Calculate keyword density
    const keywordDensity: Record<string, number> = {};
    keywords.forEach(keyword => {
      keywordDensity[keyword] = wordFreq.get(keyword)! / words.length;
    });
    
    // Calculate readability score
    const readability = this.calculateReadability(content);
    
    // Check technical SEO elements
    const technical = {
      metaTags: this.hasMetaTags(content),
      headings: this.hasHeadings(content),
      images: this.hasImages(content),
      links: this.hasLinks(content),
      speed: true // Placeholder - would need actual speed testing
    };
    
    // Generate suggestions
    const suggestions = this.generateSEOSuggestions(content, technical, readability);
    
    return {
      score: this.calculateSEOScore(technical, readability, keywords.length),
      keywords: {
        primary: keywords.slice(0, 2),
        secondary: keywords.slice(2),
        density: keywordDensity
      },
      readability,
      technical,
      suggestions
    };
  }
  
  /**
   * Calculate readability score
   */
  private calculateReadability(content: string): { score: number; level: 'beginner' | 'intermediate' | 'advanced'; suggestions: string[] } {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = this.calculateAvgSyllables(words);
    
    // Simple readability formula (Flesch Reading Ease adapted)
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    let level: 'beginner' | 'intermediate' | 'advanced';
    let suggestions: string[] = [];
    
    if (score > 80) {
      level = 'beginner';
      suggestions = ['Content is easy to read', 'Good for general audience'];
    } else if (score > 60) {
      level = 'intermediate';
      suggestions = ['Content is moderately difficult', 'Suitable for educated audience'];
    } else {
      level = 'advanced';
      suggestions = ['Content is complex', 'May be difficult for general audience'];
    }
    
    return { score: Math.round(score), level, suggestions };
  }
  
  /**
   * Calculate average syllables per word
   */
  private calculateAvgSyllables(words: string[]): number {
    let totalSyllables = 0;
    words.forEach(word => {
      totalSyllables += this.countSyllables(word);
    });
    return totalSyllables / words.length;
  }
  
  /**
   * Count syllables in a word (simplified algorithm)
   */
  private countSyllables(word: string): number {
    const lowerWord = word.toLowerCase();
    let count = 0;
    let vowels = 'aeiouy';
    
    for (let i = 0; i < lowerWord.length; i++) {
      if (vowels.includes(lowerWord[i])) {
        count++;
      }
    }
    
    // Adjust for common patterns
    if (lowerWord.endsWith('e')) count--;
    if (lowerWord.endsWith('le') && lowerWord.length > 2) count++;
    
    return Math.max(count, 1);
  }
  
  /**
   * Check if content has meta tags
   */
  private hasMetaTags(content: string): boolean {
    return content.includes('<meta') || content.includes('title:') || content.includes('description:');
  }
  
  /**
   * Check if content has headings
   */
  private hasHeadings(content: string): boolean {
    return /<h[1-6]>|heading|title/i.test(content);
  }
  
  /**
   * Check if content has images
   */
  private hasImages(content: string): boolean {
    return /<img|image|picture/i.test(content);
  }
  
  /**
   * Check if content has links
   */
  private hasLinks(content: string): boolean {
    return /<a|link|url|http/i.test(content);
  }
  
  /**
   * Generate SEO suggestions
   */
  private generateSEOSuggestions(content: string, technical: any, readability: any): string[] {
    const suggestions: string[] = [];
    
    if (!technical.metaTags) {
      suggestions.push('Add meta title and description for better search visibility');
    }
    
    if (!technical.headings) {
      suggestions.push('Include proper heading structure (H1, H2, H3)');
    }
    
    if (!technical.images) {
      suggestions.push('Add images with alt text for better accessibility and SEO');
    }
    
    if (!technical.links) {
      suggestions.push('Add internal and external links for better navigation');
    }
    
    if (readability.score < 60) {
      suggestions.push('Improve readability by using simpler language and shorter sentences');
    }
    
    if (content.length < 300) {
      suggestions.push('Expand content to at least 300 words for better SEO performance');
    }
    
    return suggestions;
  }
  
  /**
   * Calculate overall SEO score
   */
  private calculateSEOScore(technical: any, readability: any, keywordCount: number): number {
    const technicalScore = Object.values(technical).filter(Boolean).length / Object.keys(technical).length * 40;
    const readabilityScore = Math.min(readability.score / 100 * 40, 40);
    const keywordScore = Math.min(keywordCount * 5, 20);
    
    return Math.round(technicalScore + readabilityScore + keywordScore);
  }
  
  /**
   * Add meta tags to content
   */
  private addMetaTags(content: string): string {
    const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
    const descriptionMatch = content.match(/<meta[^>]*description[^>]*>/i);
    
    if (!titleMatch) {
      content = `<title>Content Title</title>\n${content}`;
    }
    
    if (!descriptionMatch) {
      content = `${content}\n<meta name="description" content="Brief description of the content">`;
    }
    
    return content;
  }
  
  /**
   * Optimize heading structure
   */
  private optimizeHeadings(content: string): string {
    // Add H1 if none exists
    if (!/<h1>/i.test(content)) {
      content = `<h1>Main Content Title</h1>\n${content}`;
    }
    
    return content;
  }
  
  /**
   * Optimize images with alt text
   */
  private optimizeImages(content: string): string {
    return content.replace(/<img([^>]*)>/gi, '<img$1 alt="Descriptive image text">');
  }
  
  /**
   * Add internal links
   */
  private addInternalLinks(content: string): string {
    // Simple internal link addition
    if (!content.includes('href')) {
      content = `${content}\n<p>Related: <a href="/related-topic">Related Topic</a></p>`;
    }
    
    return content;
  }
  
  /**
   * Optimize keyword placement
   */
  private optimizeKeywords(content: string, keywords: any): string {
    // Simple keyword optimization - in production, use more sophisticated algorithms
    const primaryKeywords = keywords.primary || [];
    
    primaryKeywords.forEach((keyword: string) => {
      if (!content.toLowerCase().includes(keyword.toLowerCase())) {
        // Add keyword to first paragraph
        const firstParaMatch = content.match(/<p[^>]*>(.*?)<\/p>/i);
        if (firstParaMatch) {
          const firstPara = firstParaMatch[0];
          const optimizedPara = `${firstPara} ${keyword}`;
          content = content.replace(firstPara, optimizedPara);
        }
      }
    });
    
    return content;
  }
  
  /**
   * Improve readability
   */
  private improveReadability(content: string, readability: any): string {
    // Simple readability improvements
    if (readability.level === 'advanced') {
      // Break up long sentences
      content = content.replace(/([^.!?])\.([^ ])/g, '$1.$2');
    }
    
    return content;
  }
  
  /**
   * Get entity type based on word characteristics
   */
  private getEntityType(term: string): 'person' | 'organization' | 'location' | 'keyword' | 'concept' {
    if (term.length > 10) return 'concept';
    if (term.includes('company') || term.includes('corp') || term.includes('inc')) return 'organization';
    if (term.includes('city') || term.includes('country') || term.includes('state')) return 'location';
    if (term.match(/^[A-Z][a-z]+$/)) return 'person';
    return 'keyword';
  }
  
  /**
   * Extract context for an entity
   */
  private extractContext(content: string, term: string): string {
    const sentences = content.split(/[.!?]+/);
    const termIndex = sentences.findIndex(sentence => sentence.toLowerCase().includes(term.toLowerCase()));
    
    if (termIndex >= 0 && termIndex < sentences.length - 1) {
      return sentences[termIndex].trim();
    }
    
    return content.substring(0, Math.min(200, content.length));
  }
  
  /**
   * Generate unique analysis ID
   */
  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Generate a summary of the content analysis
   */
  private generateSummary(content: string, entities: ExtractedEntity[], insights: ContentInsight[]): string {
    const keyEntities = entities.slice(0, 5).map(e => e.value).join(', ');
    const keyInsights = insights.slice(0, 3).map(i => i.title).join(', ');
    
    return `Content analysis reveals key topics: ${keyEntities}. Key insights include: ${keyInsights}. Content contains ${entities.length} entities and ${insights.length} insights.`;
  }
  
  /**
   * Calculate quality score for content
   */
  private calculateQualityScore(content: string, entities: ExtractedEntity[], insights: ContentInsight[]): number {
    const lengthScore = Math.min(content.length / 2000, 1); // Perfect score at 2000+ chars
    const entityScore = Math.min(entities.length / 10, 1); // Perfect score at 10+ entities
    const insightScore = Math.min(insights.length / 5, 1); // Perfect score at 5+ insights
    
    return Math.round((lengthScore * 0.3 + entityScore * 0.4 + insightScore * 0.3) * 100) / 100;
  }
}
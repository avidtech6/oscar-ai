/**
 * SEO Assistant Engine
 * 
 * Automatic generation of:
 * - SEO title
 * - SEO description
 * - Keywords
 * - Slug suggestions
 * - OpenGraph metadata
 * - Twitter card metadata
 * - Image alt text
 * - Image captions
 * - Readability analysis
 * - Keyword density
 * - Internal/external link suggestions
 * 
 * SEO must adapt to the selected brand.
 */

import {
  SEOData,
  OpenGraphData,
  TwitterCardData,
  InternalLink,
  ExternalLink,
  BrandType,
  BrandProfile,
  BlogPost,
  EditorBlock,
  DEFAULT_SEO_CONFIG,
  SEOConfig,
  AsyncResult,
} from '../types';

export class SEOAssistant {
  private config: SEOConfig;
  private brandProfiles: Map<BrandType, BrandProfile>;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: Partial<SEOConfig> = {}) {
    this.config = { ...DEFAULT_SEO_CONFIG, ...config };
    this.brandProfiles = new Map();
  }

  // ==================== PUBLIC API ====================

  /**
   * Initialize the SEO assistant
   */
  async initialize(brandProfiles?: Map<BrandType, BrandProfile>): Promise<void> {
    if (brandProfiles) {
      this.brandProfiles = brandProfiles;
    }
    
    this.emit('seo:initialized', {
      enabled: this.config.enabled,
      brands: Array.from(this.brandProfiles.keys()),
    });
  }

  /**
   * Analyze content and generate SEO data
   */
  async analyzeContent(
    content: string,
    brand: BrandType,
    existingData?: Partial<SEOData>
  ): Promise<SEOData> {
    const startTime = Date.now();
    
    this.emit('seo:analysis-started', {
      brand,
      contentLength: content.length,
      timestamp: new Date(),
    });

    try {
      const brandProfile = this.brandProfiles.get(brand);
      
      // Extract keywords from content
      const keywords = this.extractKeywords(content, brandProfile);
      
      // Generate SEO title
      const title = this.generateSEOTitle(content, brandProfile, existingData?.title);
      
      // Generate SEO description
      const description = this.generateSEODescription(content, brandProfile, existingData?.description);
      
      // Generate slug
      const slug = this.generateSlug(title, existingData?.slug);
      
      // Analyze readability
      const readabilityScore = this.analyzeReadability(content);
      
      // Calculate keyword density
      const keywordDensity = this.calculateKeywordDensity(content, keywords);
      
      // Generate OpenGraph data
      const openGraph = this.generateOpenGraphData(title, description, brand);
      
      // Generate Twitter card data
      const twitterCard = this.generateTwitterCardData(title, description, brand);
      
      // Extract internal link suggestions
      const internalLinks = this.suggestInternalLinks(content, brand);
      
      // Extract external link suggestions
      const externalLinks = this.suggestExternalLinks(content, brand);
      
      // Generate image alt text suggestions
      const imageAltText = this.generateImageAltText(content);
      
      // Generate image caption suggestions
      const imageCaptions = this.generateImageCaptions(content);
      
      const seoData: SEOData = {
        title,
        description,
        keywords,
        slug,
        openGraph,
        twitterCard,
        readabilityScore,
        keywordDensity,
        internalLinks,
        externalLinks,
        imageAltText,
        imageCaptions,
        metaRobots: 'index, follow',
        canonicalUrl: existingData?.canonicalUrl,
        schemaMarkup: existingData?.schemaMarkup,
      };

      const processingTime = Date.now() - startTime;
      
      this.emit('seo:analysis-completed', {
        brand,
        processingTime,
        readabilityScore,
        keywordCount: keywords.length,
        success: true,
      });

      return seoData;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.emit('seo:analysis-failed', {
        brand,
        processingTime,
        error: (error as Error).message,
      });

      // Return minimal SEO data on failure
      return this.createMinimalSEOData(content, brand);
    }
  }

  /**
   * Analyze blog post for SEO optimization
   */
  async analyzeBlogPost(post: BlogPost): Promise<SEOData> {
    const content = post.content;
    const brand = post.brand;
    
    return this.analyzeContent(content, brand, post.seoData);
  }

  /**
   * Analyze editor blocks for SEO optimization
   */
  async analyzeEditorBlocks(
    blocks: EditorBlock[],
    brand: BrandType,
    existingData?: Partial<SEOData>
  ): Promise<SEOData> {
    const content = this.blocksToText(blocks);
    return this.analyzeContent(content, brand, existingData);
  }

  /**
   * Optimize existing SEO data
   */
  async optimizeSEOData(
    seoData: SEOData,
    content: string,
    brand: BrandType
  ): Promise<SEOData> {
    const analysis = await this.analyzeContent(content, brand, seoData);
    
    // Merge with existing data, preferring optimized values
    return {
      ...seoData,
      title: this.optimizeTitle(seoData.title, analysis.title),
      description: this.optimizeDescription(seoData.description, analysis.description),
      keywords: this.mergeKeywords(seoData.keywords, analysis.keywords),
      readabilityScore: analysis.readabilityScore,
      keywordDensity: analysis.keywordDensity,
      internalLinks: this.mergeLinks(seoData.internalLinks, analysis.internalLinks),
      externalLinks: this.mergeLinks(seoData.externalLinks, analysis.externalLinks),
      imageAltText: { ...seoData.imageAltText, ...analysis.imageAltText },
      imageCaptions: { ...seoData.imageCaptions, ...analysis.imageCaptions },
    };
  }

  /**
   * Validate SEO data against best practices
   */
  validateSEOData(seoData: SEOData, brand: BrandType): {
    valid: boolean;
    warnings: string[];
    errors: string[];
    score: number;
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    let score = 100;

    // Title validation
    if (!seoData.title || seoData.title.trim().length === 0) {
      errors.push('SEO title is required');
      score -= 20;
    } else if (seoData.title.length < 30) {
      warnings.push('SEO title is too short (minimum 30 characters)');
      score -= 5;
    } else if (seoData.title.length > 60) {
      warnings.push('SEO title is too long (maximum 60 characters)');
      score -= 5;
    }

    // Description validation
    if (!seoData.description || seoData.description.trim().length === 0) {
      errors.push('SEO description is required');
      score -= 20;
    } else if (seoData.description.length < 120) {
      warnings.push('SEO description is too short (minimum 120 characters)');
      score -= 5;
    } else if (seoData.description.length > 160) {
      warnings.push('SEO description is too long (maximum 160 characters)');
      score -= 5;
    }

    // Keywords validation
    if (seoData.keywords.length === 0) {
      warnings.push('No keywords specified');
      score -= 10;
    } else if (seoData.keywords.length > 10) {
      warnings.push('Too many keywords (maximum 10 recommended)');
      score -= 5;
    }

    // Readability validation
    if (seoData.readabilityScore < this.config.targetReadability - 20) {
      warnings.push(`Readability score is low (${seoData.readabilityScore.toFixed(1)}), target is ${this.config.targetReadability}`);
      score -= 10;
    }

    // Keyword density validation
    Object.entries(seoData.keywordDensity).forEach(([keyword, density]) => {
      if (density < this.config.minKeywordDensity) {
        warnings.push(`Keyword "${keyword}" density is too low (${density.toFixed(2)}%, minimum ${this.config.minKeywordDensity}%)`);
        score -= 2;
      } else if (density > this.config.maxKeywordDensity) {
        warnings.push(`Keyword "${keyword}" density is too high (${density.toFixed(2)}%, maximum ${this.config.maxKeywordDensity}%)`);
        score -= 5;
      }
    });

    // Image alt text validation
    if (this.config.imageAltRequired) {
      const imagesWithoutAlt = Object.entries(seoData.imageAltText)
        .filter(([_, altText]) => !altText || altText.trim().length === 0)
        .map(([image]) => image);
      
      if (imagesWithoutAlt.length > 0) {
        warnings.push(`${imagesWithoutAlt.length} image(s) missing alt text`);
        score -= imagesWithoutAlt.length * 2;
      }
    }

    // Link ratio validation
    const totalLinks = seoData.internalLinks.length + seoData.externalLinks.length;
    const wordCount = seoData.title.length + seoData.description.length; // Simplified
    const linkRatio = totalLinks / (wordCount / 100);
    
    if (linkRatio < this.config.internalLinkRatio) {
      warnings.push(`Internal link ratio is low (${linkRatio.toFixed(2)}%, minimum ${this.config.internalLinkRatio}%)`);
      score -= 5;
    }
    
    if (linkRatio > this.config.externalLinkRatio * 2) {
      warnings.push(`External link ratio is high (${linkRatio.toFixed(2)}%, maximum ${this.config.externalLinkRatio * 2}%)`);
      score -= 5;
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
      score: Math.max(0, Math.min(100, score)),
    };
  }

  /**
   * Generate SEO suggestions for improvement
   */
  generateSuggestions(seoData: SEOData, content: string, brand: BrandType): string[] {
    const suggestions: string[] = [];
    const validation = this.validateSEOData(seoData, brand);
    
    // Add validation warnings as suggestions
    suggestions.push(...validation.warnings.map(w => `Fix: ${w}`));
    
    // Content-based suggestions
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 300) {
      suggestions.push('Consider expanding content to at least 300 words for better SEO');
    }
    
    if (wordCount > 2000) {
      suggestions.push('Consider breaking content into multiple pages or adding table of contents');
    }
    
    // Keyword suggestions
    if (seoData.keywords.length < 3) {
      suggestions.push('Add more relevant keywords to improve search visibility');
    }
    
    // Readability suggestions
    if (seoData.readabilityScore < 50) {
      suggestions.push('Simplify sentence structure and vocabulary to improve readability');
    }
    
    // Link suggestions
    if (seoData.internalLinks.length < 2) {
      suggestions.push('Add internal links to related content to improve site structure');
    }
    
    if (seoData.externalLinks.length === 0) {
      suggestions.push('Add authoritative external links to build credibility');
    }
    
    return suggestions;
  }

  // ==================== CORE SEO FUNCTIONS ====================

  /**
   * Extract keywords from content
   */
  private extractKeywords(content: string, brandProfile?: BrandProfile): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Count word frequency
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Sort by frequency
    const sortedWords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);
    
    // Take top keywords
    let keywords = sortedWords.slice(0, 10);
    
    // Add brand-specific keywords if available
    if (brandProfile) {
      const brandKeywords = [
        ...brandProfile.seoStrategy.primaryKeywords,
        ...brandProfile.seoStrategy.secondaryKeywords,
      ];
      
      // Add brand keywords that appear in content
      brandKeywords.forEach(keyword => {
        if (content.toLowerCase().includes(keyword.toLowerCase()) && !keywords.includes(keyword)) {
          keywords.unshift(keyword);
        }
      });
      
      // Limit to 10 keywords
      keywords = keywords.slice(0, 10);
    }
    
    return keywords;
  }

  /**
   * Generate SEO title
   */
  private generateSEOTitle(
    content: string,
    brandProfile?: BrandProfile,
    existingTitle?: string
  ): string {
    if (existingTitle && existingTitle.trim().length > 0) {
      return existingTitle;
    }
    
    // Extract first sentence or first 100 characters
    const firstSentence = content.split(/[.!?]+/)[0] || content.substring(0, 100);
    
    let title = firstSentence.trim();
    
    // Add brand name if not present
    if (brandProfile && !title.toLowerCase().includes(brandProfile.name.toLowerCase())) {
      title = `${title} | ${brandProfile.name}`;
    }
    
    // Ensure proper length
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }
    
    return title;
  }

  /**
   * Generate SEO description
   */
  private generateSEODescription(
    content: string,
    brandProfile?: BrandProfile,
    existingDescription?: string
  ): string {
    if (existingDescription && existingDescription.trim().length > 0) {
      return existingDescription;
    }
    
    // Extract first paragraph or first 200 characters
    const paragraphs = content.split('\n\n');
    let description = paragraphs[0] || content.substring(0, 200);
    
    // Clean up description
    description = description
      .replace(/[^\w\s.,!?-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Add call to action if brand profile available
    if (brandProfile && description.length < 120) {
      const cta = brandProfile.templates.callToAction;
      if (cta && !description.includes(cta)) {
        description = `${description}. ${cta}`;
      }
    }
    
    // Ensure proper length
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    } else if (description.length < 120) {
      // Try to get more content
      const moreContent = content.substring(description.length, description.length + 100);
      description = `${description} ${moreContent}`.substring(0, 160);
    }
    
    return description;
  }

  /**
   * Generate slug from title
   */
  private generateSlug(title: string, existingSlug?: string): string {
    if (existingSlug && existingSlug.trim().length > 0) {
      return existingSlug;
    }
    
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 60);
  }

  /**
   * Analyze readability using Flesch-Kincaid
   */
  private analyzeReadability(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) {
      return 0;
    }
    
    // Count syllables (simplified)
    let syllables = 0;
    words.forEach(word => {
      syllables += this.countSyllables(word);
    });
    
    // Flesch Reading Ease formula
    const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Count syllables in a word (simplified)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    
    // Basic syllable counting rules
    const vowels = word.match(/[aeiouy]+/g);
    if (!vowels) return 1;
    
    let count = vowels.length;
    
    // Adjust for common patterns
    if (word.endsWith('e')) count--;
    if (word.endsWith('le') && word.length > 2) count++;
    if (word.match(/[aeiouy]{2,}/)) count--;
    
    return Math.max(1, count);
  }

  /**
   * Calculate keyword density
   */
  private calculateKeywordDensity(content: string, keywords: string[]): Record<string, number> {
    const density: Record<string, number> = {};
    const words = content.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    
    if (totalWords === 0) return density;
    
    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const count = words.filter(word => word === keywordLower).length;
      density[keyword] = (count / totalWords) * 100;
    });
    
    return density;
  }

  /**
   * Generate OpenGraph data
   */
  /**
   * Generate OpenGraph data
   */
  private generateOpenGraphData(
    title: string,
    description: string,
    brand: BrandType
  ): OpenGraphData {
    const brandProfile = this.brandProfiles.get(brand);
    
    return {
      title,
      description,
      url: '', // Would be set by publishing system
      type: 'article',
      siteName: brandProfile?.name || 'Oscar AI',
      locale: 'en_GB',
    };
  }

  /**
   * Generate Twitter card data
   */
  private generateTwitterCardData(
    title: string,
    description: string,
    brand: BrandType
  ): TwitterCardData {
    const brandProfile = this.brandProfiles.get(brand);
    
    return {
      card: 'summary_large_image',
      title,
      description,
      site: brandProfile?.name || '@oscar_ai',
      creator: '@oscar_ai',
    };
  }

  /**
   * Suggest internal links
   */
  private suggestInternalLinks(content: string, brand: BrandType): InternalLink[] {
    // Simplified implementation
    // In real system, would analyze content and suggest links to existing posts
    const links: InternalLink[] = [];
    
    // Look for potential link opportunities
    const potentialTopics = ['tree care', 'arboriculture', 'pruning', 'tree health'];
    
    potentialTopics.forEach(topic => {
      if (content.toLowerCase().includes(topic)) {
        links.push({
          text: `Learn more about ${topic}`,
          url: `/blog/${topic.replace(/\s+/g, '-')}`,
        });
      }
    });
    
    return links.slice(0, 5); // Limit to 5 suggestions
  }

  /**
   * Suggest external links
   */
  private suggestExternalLinks(content: string, brand: BrandType): ExternalLink[] {
    // Simplified implementation
    const links: ExternalLink[] = [];
    
    // Brand-specific external resources
    const resources: Record<BrandType, Array<{text: string, url: string}>> = {
      'cedarwood': [
        { text: 'International Society of Arboriculture', url: 'https://www.isa-arbor.com' },
        { text: 'Tree Care Industry Association', url: 'https://www.tcia.org' },
      ],
      'tree-academy': [
        { text: 'Royal Horticultural Society', url: 'https://www.rhs.org.uk' },
        { text: 'Woodland Trust', url: 'https://www.woodlandtrust.org.uk' },
      ],
      'oscar-ai': [
        { text: 'AI in Agriculture Research', url: 'https://example.com' },
      ],
    };
    
    const brandResources = resources[brand] || [];
    brandResources.forEach(resource => {
      links.push({
        text: resource.text,
        url: resource.url,
        nofollow: true,
        sponsored: false,
      });
    });
    
    return links;
  }

  /**
   * Generate image alt text suggestions
   */
  private generateImageAltText(content: string): Record<string, string> {
    // Simplified implementation
    // In real system, would analyze image context and generate descriptive alt text
    const altText: Record<string, string> = {};
    
    // Look for image references in content
    const imagePatterns = [
      { pattern: /image of (.*?)[.,]/, group: 1 },
      { pattern: /photo of (.*?)[.,]/, group: 1 },
      { pattern: /picture of (.*?)[.,]/, group: 1 },
    ];
    
    imagePatterns.forEach(({ pattern, group }) => {
      const match = content.match(new RegExp(pattern, 'gi'));
      if (match) {
        match.forEach((m, index) => {
          const extracted = m.match(new RegExp(pattern, 'i'));
          if (extracted && extracted[group]) {
            altText[`image-${index + 1}`] = extracted[group].trim();
          }
        });
      }
    });
    
    // Add generic alt text if none found
    if (Object.keys(altText).length === 0) {
      altText['featured-image'] = 'Illustration related to article content';
    }
    
    return altText;
  }

  /**
   * Generate image caption suggestions
   */
  private generateImageCaptions(content: string): Record<string, string> {
    // Simplified implementation
    const captions: Record<string, string> = {};
    
    // Extract potential captions from content
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    sentences.slice(0, 3).forEach((sentence, index) => {
      if (sentence.trim().length > 0) {
        captions[`image-${index + 1}`] = sentence.trim();
      }
    });
    
    return captions;
  }

  /**
   * Create minimal SEO data for error fallback
   */
  private createMinimalSEOData(content: string, brand: BrandType): SEOData {
    const brandProfile = this.brandProfiles.get(brand);
    
    return {
      title: content.substring(0, 60) + (content.length > 60 ? '...' : ''),
      description: content.substring(0, 160) + (content.length > 160 ? '...' : ''),
      keywords: [],
      slug: this.generateSlug(content.substring(0, 60), ''),
      openGraph: this.generateOpenGraphData(content.substring(0, 60), content.substring(0, 160), brand),
      twitterCard: this.generateTwitterCardData(content.substring(0, 60), content.substring(0, 160), brand),
      readabilityScore: 0,
      keywordDensity: {},
      internalLinks: [],
      externalLinks: [],
      imageAltText: {},
      imageCaptions: {},
      metaRobots: 'noindex, nofollow',
    };
  }

  /**
   * Convert editor blocks to text
   */
  private blocksToText(blocks: EditorBlock[]): string {
    return blocks.map(block => block.content).join('\n\n');
  }

  /**
   * Optimize title
   */
  private optimizeTitle(existing: string, suggested: string): string {
    // Prefer existing if it meets criteria
    if (existing.length >= 30 && existing.length <= 60) {
      return existing;
    }
    return suggested;
  }

  /**
   * Optimize description
   */
  private optimizeDescription(existing: string, suggested: string): string {
    // Prefer existing if it meets criteria
    if (existing.length >= 120 && existing.length <= 160) {
      return existing;
    }
    return suggested;
  }

  /**
   * Merge keyword arrays
   */
  private mergeKeywords(existing: string[], suggested: string[]): string[] {
    const merged = [...existing];
    suggested.forEach(keyword => {
      if (!merged.includes(keyword) && merged.length < 10) {
        merged.push(keyword);
      }
    });
    return merged.slice(0, 10);
  }

  /**
   * Merge link arrays
   */
  private mergeLinks<T extends InternalLink | ExternalLink>(existing: T[], suggested: T[]): T[] {
    const merged = [...existing];
    const existingUrls = new Set(existing.map(link => 'url' in link ? link.url : ''));
    
    suggested.forEach(link => {
      const url = 'url' in link ? link.url : '';
      if (!existingUrls.has(url) && merged.length < 10) {
        merged.push(link);
        existingUrls.add(url);
      }
    });
    
    return merged.slice(0, 10);
  }

  // ==================== EVENT SYSTEM ====================

  /**
   * Emit an event
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Add event listener
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Set brand profiles
   */
  setBrandProfiles(profiles: Map<BrandType, BrandProfile>): void {
    this.brandProfiles = profiles;
    this.emit('seo:brand-profiles-updated', {
      count: this.brandProfiles.size,
      brands: Array.from(this.brandProfiles.keys()),
    });
  }

  /**
   * Get configuration
   */
  getConfig(): SEOConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SEOConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('seo:config-updated', { config: this.config });
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.eventListeners.clear();
    this.emit('seo:cleaned-up', {});
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    analysesPerformed: number;
    averageProcessingTime: number;
    averageReadabilityScore: number;
  } {
    // Simplified statistics
    return {
      analysesPerformed: 0, // Would track in real implementation
      averageProcessingTime: 0,
      averageReadabilityScore: 0,
    };
  }

  /**
   * Test SEO analysis
   */
  async testAnalysis(content: string, brand: BrandType): Promise<{
    success: boolean;
    data: SEOData;
    processingTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      const data = await this.analyzeContent(content, brand);
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        data,
        processingTime,
      };
    } catch (error) {
      return {
        success: false,
        data: this.createMinimalSEOData(content, brand),
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Generate SEO report
   */
  generateReport(seoData: SEOData, content: string, brand: BrandType): {
    summary: string;
    score: number;
    recommendations: string[];
    details: Record<string, any>;
  } {
    const validation = this.validateSEOData(seoData, brand);
    const suggestions = this.generateSuggestions(seoData, content, brand);
    
    return {
      summary: `SEO Analysis: ${validation.score}/100`,
      score: validation.score,
      recommendations: suggestions,
      details: {
        title: {
          value: seoData.title,
          length: seoData.title.length,
          optimal: seoData.title.length >= 30 && seoData.title.length <= 60,
        },
        description: {
          value: seoData.description,
          length: seoData.description.length,
          optimal: seoData.description.length >= 120 && seoData.description.length <= 160,
        },
        keywords: {
          count: seoData.keywords.length,
          list: seoData.keywords,
          optimal: seoData.keywords.length >= 3 && seoData.keywords.length <= 10,
        },
        readability: {
          score: seoData.readabilityScore,
          optimal: seoData.readabilityScore >= this.config.targetReadability,
        },
        keywordDensity: seoData.keywordDensity,
        links: {
          internal: seoData.internalLinks.length,
          external: seoData.externalLinks.length,
        },
        images: {
          withAltText: Object.keys(seoData.imageAltText).length,
          withCaptions: Object.keys(seoData.imageCaptions).length,
        },
      },
    };
  }
}
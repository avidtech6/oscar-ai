/**
 * Template Engine
 * 
 * Comprehensive template management system supporting:
 * - Blog templates
 * - Social templates
 * - Report templates
 * - Brand-aware templates (Cedarwood, Tree Academy, Oscar AI)
 * - SEO templates
 * - Metadata templates
 * - Template suggestion engine
 * - Keyword analysis
 * - Content generation from templates
 * - Template classification
 * - Template registry
 * - Template validation
 */

import {
  ContentTemplate,
  TemplateType,
  TemplateStructure,
  TemplateSection,
  SEOPattern,
  ToneGuidelines,
  ImagePlacement,
  TemplateMetadata,
  BrandType,
  BrandProfile,
  BlogPost,
  EditorBlock,
  EditorBlockType,
  SEOData,
  OpenGraphData,
  TwitterCardData,
  SocialPlatform,
  MediaItem,
  TemplatesConfig,
  DEFAULT_TEMPLATES_CONFIG,
} from '../types';

import { ContentCopilot } from '../ai/ContentCopilot';

export class TemplateEngine {
  private templates: ContentTemplate[] = [];
  private copilot: ContentCopilot;
  private config: TemplatesConfig;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(copilot: ContentCopilot, config: Partial<TemplatesConfig> = {}) {
    this.copilot = copilot;
    this.config = { ...DEFAULT_TEMPLATES_CONFIG, ...config };
    this.loadDefaultTemplates();
  }

  // ==================== CORE TEMPLATE METHODS ====================

  /**
   * Load default templates for all brands
   */
  loadDefaultTemplates(): void {
    // Clear existing templates
    this.templates = [];

    // Cedarwood templates
    this.registerTemplate({
      id: 'cedarwood-case-study',
      name: 'Cedarwood Case Study',
      description: 'Professional case study template for Cedarwood Tree Consultants',
      type: 'case-study',
      brand: 'cedarwood',
      structure: {
        sections: [
          {
            id: 'introduction',
            title: 'Introduction',
            type: 'paragraph',
            contentHint: 'Brief overview of the client and project context',
            minLength: 100,
            maxLength: 300,
            required: true,
            aiPrompt: 'Write a professional introduction for a tree care case study',
          },
          {
            id: 'challenge',
            title: 'The Challenge',
            type: 'paragraph',
            contentHint: 'Describe the specific tree-related problem or challenge',
            minLength: 150,
            maxLength: 400,
            required: true,
            aiPrompt: 'Describe the arboricultural challenge faced by the client',
          },
          {
            id: 'solution',
            title: 'Our Solution',
            type: 'paragraph',
            contentHint: 'Explain the approach and techniques used',
            minLength: 200,
            maxLength: 500,
            required: true,
            aiPrompt: 'Explain the professional tree care solution implemented',
          },
          {
            id: 'results',
            title: 'Results & Benefits',
            type: 'paragraph',
            contentHint: 'Highlight the outcomes and benefits achieved',
            minLength: 150,
            maxLength: 400,
            required: true,
            aiPrompt: 'Describe the positive results and benefits for the client',
          },
          {
            id: 'testimonial',
            title: 'Client Testimonial',
            type: 'quote',
            contentHint: 'Include a quote from the satisfied client',
            minLength: 50,
            maxLength: 200,
            required: false,
            aiPrompt: 'Generate a professional client testimonial',
          },
        ],
        order: ['introduction', 'challenge', 'solution', 'results', 'testimonial'],
        requiredSections: ['introduction', 'challenge', 'solution', 'results'],
        optionalSections: ['testimonial'],
      },
      seoPattern: {
        titleTemplate: '{title} | Cedarwood Tree Consultants Case Study',
        descriptionTemplate: 'Professional case study: {title}. Learn how Cedarwood solved {challenge} with expert tree care.',
        keywordSuggestions: ['tree services', 'arborist', 'case study', 'tree care', 'professional'],
        internalLinkSuggestions: ['/services', '/about', '/contact'],
        externalLinkSuggestions: ['https://trees.org', 'https://arborists.org.uk'],
        imageAltPattern: 'Cedarwood Tree Consultants {title} case study image',
      },
      toneGuidelines: {
        formality: 'formal',
        voice: 'professional',
        pointOfView: 'third',
        sentenceLength: 'medium',
        vocabularyLevel: 'intermediate',
      },
      imagePlacement: [
        {
          sectionId: 'introduction',
          position: 'before',
          type: 'featured',
          aspectRatio: '16:9',
          minWidth: 1200,
          maxWidth: 1920,
        },
        {
          sectionId: 'solution',
          position: 'inline',
          type: 'supporting',
          aspectRatio: '4:3',
          minWidth: 800,
          maxWidth: 1200,
        },
      ],
      callToAction: 'Contact Cedarwood Tree Consultants for a professional assessment',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        usageCount: 0,
        successRate: 0,
        averageReadTime: 0,
      },
    });

    // Tree Academy templates
    this.registerTemplate({
      id: 'tree-academy-lesson',
      name: 'Tree Academy Lesson',
      description: 'Educational lesson template for Tree Academy',
      type: 'lesson',
      brand: 'tree-academy',
      structure: {
        sections: [
          {
            id: 'hook',
            title: 'Engaging Hook',
            type: 'paragraph',
            contentHint: 'Start with an interesting fact or question about trees',
            minLength: 80,
            maxLength: 200,
            required: true,
            aiPrompt: 'Write an engaging hook about trees for educational content',
          },
          {
            id: 'learning-objectives',
            title: 'Learning Objectives',
            type: 'list',
            contentHint: 'List what readers will learn from this lesson',
            minLength: 50,
            maxLength: 200,
            required: true,
            aiPrompt: 'Create 3-5 learning objectives for a tree education lesson',
          },
          {
            id: 'main-content',
            title: 'Main Content',
            type: 'paragraph',
            contentHint: 'Explain the core concepts in an educational way',
            minLength: 300,
            maxLength: 800,
            required: true,
            aiPrompt: 'Explain tree concepts in simple, educational language',
          },
          {
            id: 'examples',
            title: 'Real-World Examples',
            type: 'paragraph',
            contentHint: 'Provide practical examples or case studies',
            minLength: 150,
            maxLength: 400,
            required: false,
            aiPrompt: 'Provide real-world examples of tree concepts',
          },
          {
            id: 'activity',
            title: 'Try It Yourself',
            type: 'paragraph',
            contentHint: 'Suggest a hands-on activity for readers',
            minLength: 100,
            maxLength: 300,
            required: false,
            aiPrompt: 'Suggest a simple tree-related activity for learners',
          },
          {
            id: 'summary',
            title: 'Key Takeaways',
            type: 'list',
            contentHint: 'Summarize the main points of the lesson',
            minLength: 50,
            maxLength: 200,
            required: true,
            aiPrompt: 'Summarize key takeaways from the tree lesson',
          },
        ],
        order: ['hook', 'learning-objectives', 'main-content', 'examples', 'activity', 'summary'],
        requiredSections: ['hook', 'learning-objectives', 'main-content', 'summary'],
        optionalSections: ['examples', 'activity'],
      },
      seoPattern: {
        titleTemplate: '{title} | Tree Academy Lesson',
        descriptionTemplate: 'Learn about {title} with Tree Academy. {description} Perfect for tree enthusiasts and learners.',
        keywordSuggestions: ['tree education', 'learn about trees', 'tree care tips', 'arboriculture'],
        internalLinkSuggestions: ['/lessons', '/resources', '/community'],
        externalLinkSuggestions: ['https://forestry.gov.uk', 'https://woodlandtrust.org.uk'],
        imageAltPattern: 'Tree Academy lesson illustration: {title}',
      },
      toneGuidelines: {
        formality: 'casual',
        voice: 'educational',
        pointOfView: 'second',
        sentenceLength: 'short',
        vocabularyLevel: 'basic',
      },
      imagePlacement: [
        {
          sectionId: 'hook',
          position: 'before',
          type: 'featured',
          aspectRatio: '16:9',
          minWidth: 1200,
          maxWidth: 1920,
        },
        {
          sectionId: 'main-content',
          position: 'inline',
          type: 'supporting',
          aspectRatio: '3:2',
          minWidth: 800,
          maxWidth: 1200,
        },
      ],
      callToAction: 'Join the Tree Academy community to learn more about trees',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        usageCount: 0,
        successRate: 0,
        averageReadTime: 0,
      },
    });

    // Oscar AI templates
    this.registerTemplate({
      id: 'oscar-ai-technical',
      name: 'Oscar AI Technical Post',
      description: 'Technical content template for Oscar AI platform',
      type: 'tutorial',
      brand: 'oscar-ai',
      structure: {
        sections: [
          {
            id: 'problem-statement',
            title: 'Problem Statement',
            type: 'paragraph',
            contentHint: 'Clearly define the technical problem being solved',
            minLength: 100,
            maxLength: 300,
            required: true,
            aiPrompt: 'Define a technical problem in the AI/software domain',
          },
          {
            id: 'technical-context',
            title: 'Technical Context',
            type: 'paragraph',
            contentHint: 'Provide background and technical context',
            minLength: 150,
            maxLength: 400,
            required: true,
            aiPrompt: 'Provide technical background for an AI/software solution',
          },
          {
            id: 'solution-architecture',
            title: 'Solution Architecture',
            type: 'paragraph',
            contentHint: 'Describe the technical architecture and approach',
            minLength: 200,
            maxLength: 600,
            required: true,
            aiPrompt: 'Describe a technical architecture for solving the problem',
          },
          {
            id: 'implementation',
            title: 'Implementation Details',
            type: 'paragraph',
            contentHint: 'Provide specific implementation steps or code examples',
            minLength: 300,
            maxLength: 800,
            required: true,
            aiPrompt: 'Provide technical implementation details with examples',
          },
          {
            id: 'results',
            title: 'Results & Performance',
            type: 'paragraph',
            contentHint: 'Share results, metrics, and performance data',
            minLength: 150,
            maxLength: 400,
            required: false,
            aiPrompt: 'Describe technical results and performance metrics',
          },
          {
            id: 'conclusion',
            title: 'Conclusion & Next Steps',
            type: 'paragraph',
            contentHint: 'Summarize and suggest next steps or improvements',
            minLength: 100,
            maxLength: 300,
            required: true,
            aiPrompt: 'Conclude a technical post with next steps',
          },
        ],
        order: ['problem-statement', 'technical-context', 'solution-architecture', 'implementation', 'results', 'conclusion'],
        requiredSections: ['problem-statement', 'technical-context', 'solution-architecture', 'implementation', 'conclusion'],
        optionalSections: ['results'],
      },
      seoPattern: {
        titleTemplate: '{title} | Oscar AI Technical Guide',
        descriptionTemplate: 'Technical guide: {title}. Learn how Oscar AI solves {problem} with innovative AI solutions.',
        keywordSuggestions: ['AI', 'machine learning', 'technical guide', 'software architecture', 'implementation'],
        internalLinkSuggestions: ['/docs', '/api', '/examples'],
        externalLinkSuggestions: ['https://openai.com', 'https://github.com'],
        imageAltPattern: 'Oscar AI technical diagram: {title}',
      },
      toneGuidelines: {
        formality: 'neutral',
        voice: 'authoritative',
        pointOfView: 'third',
        sentenceLength: 'medium',
        vocabularyLevel: 'advanced',
      },
      imagePlacement: [
        {
          sectionId: 'solution-architecture',
          position: 'inline',
          type: 'featured',
          aspectRatio: '16:9',
          minWidth: 1200,
          maxWidth: 1920,
        },
        {
          sectionId: 'implementation',
          position: 'after',
          type: 'supporting',
          aspectRatio: '4:3',
          minWidth: 800,
          maxWidth: 1200,
        },
      ],
      callToAction: 'Explore Oscar AI documentation for more technical resources',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        usageCount: 0,
        successRate: 0,
        averageReadTime: 0,
      },
    });

    this.emit('templates:loaded', {
      count: this.templates.length,
      brands: Array.from(new Set(this.templates.map(t => t.brand))),
    });
  }

  /**
   * Register a new template
   */
  registerTemplate(template: ContentTemplate): void {
    // Validate template
    const validation = this.validateTemplate(template);
    if (!validation.valid) {
      throw new Error(`Invalid template: ${validation.errors.join(', ')}`);
    }

    // Check for duplicate ID
    if (this.templates.some(t => t.id === template.id)) {
      throw new Error(`Template with ID ${template.id} already exists`);
    }

    this.templates.push(template);
    this.emit('templates:registered', { templateId: template.id, type: template.type, brand: template.brand });
  }

  /**
   * Get template by ID
   */
  getTemplateById(templateId: string): ContentTemplate | undefined {
    return this.templates.find(t => t.id === templateId);
  }

  /**
   * Get templates by brand
   */
  getTemplatesByBrand(brand: BrandType): ContentTemplate[] {
    return this.templates.filter(t => t.brand === brand);
  }

  /**
   * Get templates by type
   */
  getTemplatesByType(type: TemplateType): ContentTemplate[] {
    return this.templates.filter(t => t.type === type);
  }

  // ==================== SUGGESTION ENGINE ====================

  /**
   * Generate template suggestions for content
   */
  generateTemplateSuggestions(
    content: string,
    brand: BrandType,
    context: Record<string, any> = {}
  ): Array<{template: ContentTemplate; confidence: number; reason: string}> {
    const brandTemplates = this.getTemplatesByBrand(brand);
    const suggestions: Array<{template: ContentTemplate; confidence: number; reason: string}> = [];

    // Analyze content
    const analysis = this.analyzeContentForTemplates(content);

    brandTemplates.forEach(template => {
      let confidence = 0;
      const reasons: string[] = [];

      // Check content type match
      if (context.contentType && template.type === context.contentType) {
        confidence += 0.3;
        reasons.push('Matches content type');
      }

      // Check content length compatibility
      const wordCount = analysis.wordCount;
      const avgSectionLength = template.structure.sections.reduce((sum, s) => sum + s.minLength, 0) / template.structure.sections.length;
      const expectedLength = avgSectionLength * template.structure.sections.length;
      
      if (wordCount >= expectedLength * 0.7 && wordCount <= expectedLength * 1.3) {
        confidence += 0.2;
        reasons.push('Fits expected length');
      }

      // Check keyword overlap
      const keywordOverlap = this.calculateKeywordOverlap(content, template.seoPattern.keywordSuggestions);
      if (keywordOverlap > 0.1) {
        confidence += keywordOverlap * 0.3;
        reasons.push(`Matches ${Math.round(keywordOverlap * 100)}% of suggested keywords`);
      }

      // Check structure compatibility
      const hasLists = analysis.hasLists;
      const templateHasLists = template.structure.sections.some(s => s.type === 'list');
      
      if (hasLists === templateHasLists) {
        confidence += 0.1;
        reasons.push('Matches content structure');
      }

      // Consider template success rate
      confidence += template.metadata.successRate * 0.1;
      reasons.push(`Historical success: ${Math.round(template.metadata.successRate * 100)}%`);

      if (confidence >= this.config.suggestionThreshold) {
        suggestions.push({
          template,
          confidence: Math.min(1, confidence),
          reason: reasons.join(', '),
        });
      }
    });

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);
    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  /**
   * Analyze content for template matching
   */
  analyzeContentForTemplates(content: string): {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    hasLists: boolean;
    hasHeadings: boolean;
    hasImages: boolean;
    readabilityScore: number;
    keywordDensity: Record<string, number>;
  } {
    const normalized = this.normaliseText(content);
    const tokens = this.tokenise(normalized);
    
    const wordCount = tokens.length;
    const sentenceCount = (content.match(/[.!?]+/g) || []).length;
    const paragraphCount = (content.match(/\n\s*\n/g) || []).length + 1;
    
    const hasLists = /^[-*]\s|\d+\.\s/.test(content);
    const hasHeadings = /^#+\s/.test(content);
    const hasImages = /!\[.*?\]\(.*?\)/.test(content);
    
    // Calculate readability score (simple Flesch-Kincaid approximation)
    const wordsPerSentence = wordCount / Math.max(sentenceCount, 1);
    const syllablesPerWord = 1.5; // approximation
    const readabilityScore = Math.max(0, Math.min(100, 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord));
    
    // Calculate keyword density
    const keywordDensity: Record<string, number> = {};
    const commonWords = new Set(['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    tokens.forEach(token => {
      const lowerToken = token.toLowerCase();
      if (!commonWords.has(lowerToken) && lowerToken.length > 2) {
        keywordDensity[lowerToken] = (keywordDensity[lowerToken] || 0) + 1;
      }
    });
    
    return {
      wordCount,
      sentenceCount,
      paragraphCount,
      hasLists,
      hasHeadings,
      hasImages,
      readabilityScore,
      keywordDensity,
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Validate a template
   */
  private validateTemplate(template: ContentTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.id || template.id.trim() === '') {
      errors.push('Template ID is required');
    }

    if (!template.name || template.name.trim() === '') {
      errors.push('Template name is required');
    }

    if (!template.type) {
      errors.push('Template type is required');
    }

    if (!template.brand) {
      errors.push('Template brand is required');
    }

    if (!template.structure || !template.structure.sections || template.structure.sections.length === 0) {
      errors.push('Template must have at least one section');
    }

    if (template.structure) {
      const sectionIds = new Set<string>();
      template.structure.sections.forEach((section, index) => {
        if (!section.id || section.id.trim() === '') {
          errors.push(`Section ${index + 1} must have an ID`);
        } else if (sectionIds.has(section.id)) {
          errors.push(`Duplicate section ID: ${section.id}`);
        } else {
          sectionIds.add(section.id);
        }

        if (section.minLength > section.maxLength) {
          errors.push(`Section ${section.id}: minLength cannot be greater than maxLength`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate keyword overlap between content and suggested keywords
   */
  private calculateKeywordOverlap(content: string, keywords: string[]): number {
    if (keywords.length === 0) return 0;

    const normalizedContent = this.normaliseText(content).toLowerCase();
    const contentWords = new Set(this.tokenise(normalizedContent).map(w => w.toLowerCase()));
    
    let matches = 0;
    keywords.forEach(keyword => {
      const normalizedKeyword = keyword.toLowerCase();
      if (contentWords.has(normalizedKeyword)) {
        matches++;
      }
    });

    return matches / keywords.length;
  }

  /**
   * Normalise text by removing extra whitespace and special characters
   */
  private normaliseText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?\-]/g, '')
      .trim();
  }

  /**
   * Tokenise text into words
   */
  private tokenise(text: string): string[] {
    return text
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.replace(/[^\w]/g, ''));
  }

  /**
   * Generate content from a template
   */
  generateContentFromTemplate(templateId: string, variables: Record<string, string> = {}): string {
    const template = this.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let content = '';
    template.structure.sections.forEach(section => {
      if (section.required || Math.random() > 0.3) { // 70% chance to include optional sections
        content += `## ${section.title}\n\n`;
        content += this.applyVariables(section.contentHint || '', variables) + '\n\n';
      }
    });

    return content;
  }

  /**
   * Apply variables to template strings
   */
  private applyVariables(text: string, variables: Record<string, string>): string {
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return result;
  }

  /**
   * Generate a slug from title
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Generate excerpt from content
   */
  generateExcerpt(content: string, maxLength: number = 150): string {
    const plainText = content.replace(/[#*`]/g, '').replace(/\n/g, ' ');
    if (plainText.length <= maxLength) return plainText;
    
    return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  }

  /**
   * Extract categories from template
   */
  extractCategoriesFromTemplate(template: ContentTemplate): string[] {
    const categories: string[] = [];
    
    if (template.type === 'case-study') {
      categories.push('Case Studies');
    } else if (template.type === 'lesson') {
      categories.push('Education');
    } else if (template.type === 'tutorial') {
      categories.push('Tutorials');
    }
    
    if (template.brand === 'cedarwood') {
      categories.push('Cedarwood');
    } else if (template.brand === 'tree-academy') {
      categories.push('Tree Academy');
    } else if (template.brand === 'oscar-ai') {
      categories.push('Oscar AI');
    }
    
    return categories;
  }

  /**
   * Extract tags from template
   */
  extractTagsFromTemplate(template: ContentTemplate): string[] {
    const tags: string[] = [];
    
    // Add template type as tag
    tags.push(template.type);
    
    // Add brand as tag
    tags.push(template.brand);
    
    // Add SEO keywords as tags
    tags.push(...template.seoPattern.keywordSuggestions.slice(0, 3));
    
    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Generate SEO metadata from template
   */
  generateSEOMetadata(template: ContentTemplate, title: string, description: string): SEOData {
    const seoTitle = this.applyVariables(template.seoPattern.titleTemplate, { title });
    const seoDescription = this.applyVariables(template.seoPattern.descriptionTemplate, {
      title,
      description,
      challenge: description.substring(0, 50) + '...',
      problem: description.substring(0, 50) + '...'
    });
    
    return {
      title: seoTitle,
      description: seoDescription,
      keywords: template.seoPattern.keywordSuggestions,
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        type: 'article',
        siteName: template.brand === 'cedarwood' ? 'Cedarwood Tree Consultants' :
                  template.brand === 'tree-academy' ? 'Tree Academy' : 'Oscar AI',
      },
      twitterCard: {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDescription,
      },
    };
  }

  /**
   * Extract keywords from content
   */
  extractKeywords(content: string, maxKeywords: number = 10): string[] {
    const analysis = this.analyzeContentForTemplates(content);
    const sortedKeywords = Object.entries(analysis.keywordDensity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([keyword]) => keyword);
    
    return sortedKeywords;
  }

  // ==================== EVENT SYSTEM ====================

  /**
   * Emit an event
   */
  private emit(eventName: string, data: any): void {
    const listeners = this.eventListeners.get(eventName) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }

  /**
   * Register an event listener
   */
  on(eventName: string, callback: Function): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)!.push(callback);
  }

  /**
   * Remove an event listener
   */
  off(eventName: string, callback: Function): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

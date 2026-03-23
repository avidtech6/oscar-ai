/**
 * Type Expansion Framework interfaces
 * 
 * Defines the interfaces for PHASE_11: Report Type Expansion Framework
 */
export interface TypeExpansionRule {
  /**
   * Unique identifier for the expansion rule
   */
  ruleId: string;

  /**
   * Type of expansion (content, structure, formatting, metadata)
   */
  expansionType: 'content' | 'structure' | 'formatting' | 'metadata';

  /**
   * Source type that can be expanded
   */
  sourceType: string;

  /**
   * Target types that can be expanded to
   */
  targetTypes: string[];

  /**
   * Conditions for applying the expansion rule
   */
  conditions: Record<string, any>;

  /**
   * Transformation logic for the expansion
   */
  transformation: Record<string, any>;

  /**
   * Priority of the rule (higher numbers = higher priority)
   */
  priority: number;

  /**
   * Whether the rule is enabled
   */
  enabled: boolean;

  /**
   * Metadata about the rule
   */
  metadata?: Record<string, any>;
}

export interface ExpansionResult {
  /**
   * Unique identifier for the expansion operation
   */
  expansionId: string;

  /**
   * Source document ID
   */
  documentId: string;

  /**
   * Source report type
   */
  sourceType: string;

  /**
   * Target report type(s) expanded to
   */
  targetTypes: string[];

  /**
   * Whether the expansion was successful
   */
  success: boolean;

  /**
   * List of applied expansion rules
   */
  appliedRules: string[];

  /**
   * List of expansion errors
   */
  errors: string[];

  /**
   * List of expansion warnings
   */
  warnings: string[];

  /**
   * Expanded content
   */
  expandedContent: Record<string, any>;

  /**
   * Metadata about the expansion
   */
  metadata: {
    timestamp: string;
    duration: number;
    environment: string;
    rulesApplied: number;
    confidence: number;
  };

  /**
   * Execution context
   */
  execution: {
    input: Record<string, any>;
    output: Record<string, any>;
    context: Record<string, any>;
  };
}

export interface TypeCompatibility {
  /**
   * Source report type
   */
  sourceType: string;

  /**
   * Target report type
   */
  targetType: string;

  /**
   * Compatibility score (0-1)
   */
  compatibility: number;

  /**
   * List of compatible expansion rules
   */
  compatibleRules: string[];

  /**
   * List of expansion requirements
   */
  requirements: string[];

  /**
   * List of expansion limitations
   */
  limitations: string[];

  /**
   * Metadata about compatibility
   */
  metadata: {
    lastChecked: string;
    version: string;
    confidence: number;
  };
}

/**
 * Type Expansion Framework class
 * 
 * Implements PHASE_11: Report Type Expansion Framework from the Phase Compliance Package.
 */
export class TypeExpansionFramework {
  /**
   * Registry of expansion rules
   */
  private expansionRules: Map<string, TypeExpansionRule> = new Map();

  /**
   * Cache of compatibility results
   */
  private compatibilityCache: Map<string, TypeCompatibility> = new Map();

  /**
   * Initialize the Type Expansion Framework
   */
  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Register a new expansion rule
   * @param rule - Expansion rule to register
   * @returns Success status
   */
  registerExpansionRule(rule: TypeExpansionRule): boolean {
    try {
      // Validate rule structure
      if (!this.validateExpansionRule(rule)) {
        return false;
      }

      // Store the rule
      this.expansionRules.set(rule.ruleId, rule);
      
      // Clear compatibility cache for affected types
      this.clearCompatibilityCache(rule.sourceType, rule.targetTypes);
      
      return true;
    } catch (error) {
      console.error(`Failed to register expansion rule ${rule.ruleId}:`, error);
      return false;
    }
  }

  /**
   * Unregister an expansion rule
   * @param ruleId - ID of the rule to unregister
   * @returns Success status
   */
  unregisterExpansionRule(ruleId: string): boolean {
    try {
      const rule = this.expansionRules.get(ruleId);
      if (!rule) {
        return false;
      }

      // Remove the rule
      this.expansionRules.delete(ruleId);
      
      // Clear compatibility cache for affected types
      this.clearCompatibilityCache(rule.sourceType, rule.targetTypes);
      
      return true;
    } catch (error) {
      console.error(`Failed to unregister expansion rule ${ruleId}:`, error);
      return false;
    }
  }

  /**
   * Expand a document to a new report type
   * @param documentId - ID of the document to expand
   * @param sourceType - Current report type
   * @param targetTypes - Target report types to expand to
   * @param expansionParameters - Parameters for the expansion
   * @returns ExpansionResult with expansion results
   */
  expandDocumentType(
    documentId: string,
    sourceType: string,
    targetTypes: string[],
    expansionParameters: Record<string, any> = {}
  ): ExpansionResult {
    const startTime = Date.now();
    
    try {
      // Find compatible expansion rules
      const compatibleRules = this.findCompatibleRules(sourceType, targetTypes);
      
      if (compatibleRules.length === 0) {
        return this.createFailedExpansion(
          documentId,
          sourceType,
          targetTypes,
          'No compatible expansion rules found',
          startTime
        );
      }

      // Apply expansion rules in priority order
      const appliedRules: string[] = [];
      const expandedContent = this.loadDocumentContent(documentId, sourceType);
      const errors: string[] = [];
      const warnings: string[] = [];

      for (const rule of compatibleRules.sort((a, b) => b.priority - a.priority)) {
        try {
          const result = this.applyExpansionRule(rule, expandedContent, expansionParameters);
          
          if (result.success) {
            appliedRules.push(rule.ruleId);
            Object.assign(expandedContent, result.transformedContent);
          } else {
            errors.push(`Rule ${rule.ruleId} failed: ${result.error}`);
          }
        } catch (error) {
          errors.push(`Rule ${rule.ruleId} execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Generate warnings for partial expansions
      if (appliedRules.length < compatibleRules.length) {
        warnings.push(`Partial expansion: ${appliedRules.length} of ${compatibleRules.length} rules applied`);
      }

      const success = errors.length === 0;
      const endTime = Date.now();
      const duration = endTime - startTime;

      return {
        expansionId: `exp_${documentId}_${Date.now()}`,
        documentId,
        sourceType,
        targetTypes,
        success,
        appliedRules,
        errors,
        warnings,
        expandedContent,
        metadata: {
          timestamp: new Date().toISOString(),
          duration,
          environment: 'production',
          rulesApplied: appliedRules.length,
          confidence: this.calculateExpansionConfidence(appliedRules, compatibleRules)
        },
        execution: {
          input: { documentId, sourceType, targetTypes, expansionParameters },
          output: { expandedContent, appliedRules, errors, warnings },
          context: { expansionType: 'type-expansion' }
        }
      };
    } catch (error) {
      return this.createFailedExpansion(
        documentId,
        sourceType,
        targetTypes,
        `Expansion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        startTime
      );
    }
  }

  /**
   * Check type compatibility between source and target types
   * @param sourceType - Source report type
   * @param targetType - Target report type
   * @returns TypeCompatibility with compatibility information
   */
  checkTypeCompatibility(sourceType: string, targetType: string): TypeCompatibility {
    const cacheKey = `${sourceType}:${targetType}`;
    
    // Check cache first
    if (this.compatibilityCache.has(cacheKey)) {
      return this.compatibilityCache.get(cacheKey)!;
    }

    const compatibleRules = this.findCompatibleRules(sourceType, [targetType]);
    const compatibility = compatibleRules.length > 0 ? 1.0 : 0.0;
    
    const typeCompatibility: TypeCompatibility = {
      sourceType,
      targetType,
      compatibility,
      compatibleRules: compatibleRules.map(rule => rule.ruleId),
      requirements: this.generateExpansionRequirements(sourceType, targetType),
      limitations: this.generateExpansionLimitations(sourceType, targetType),
      metadata: {
        lastChecked: new Date().toISOString(),
        version: '1.0.0',
        confidence: compatibility
      }
    };

    // Cache the result
    this.compatibilityCache.set(cacheKey, typeCompatibility);
    
    return typeCompatibility;
  }

  /**
   * Get available expansion targets for a source type
   * @param sourceType - Source report type
   * @returns Array of compatible target types
   */
  getAvailableTargets(sourceType: string): string[] {
    const targets = new Set<string>();
    
    for (const rule of this.expansionRules.values()) {
      if (rule.sourceType === sourceType && rule.enabled) {
        rule.targetTypes.forEach(target => targets.add(target));
      }
    }
    
    return Array.from(targets);
  }

  /**
   * Get all expansion rules
   * @returns Array of all expansion rules
   */
  getExpansionRules(): TypeExpansionRule[] {
    return Array.from(this.expansionRules.values());
  }

  /**
   * Get expansion rule by ID
   * @param ruleId - ID of the rule to retrieve
   * @returns Expansion rule or undefined
   */
  getExpansionRule(ruleId: string): TypeExpansionRule | undefined {
    return this.expansionRules.get(ruleId);
  }

  /**
   * Initialize default expansion rules
   */
  private initializeDefaultRules(): void {
    // Default content expansion rule
    this.registerExpansionRule({
      ruleId: 'content_expansion_default',
      expansionType: 'content',
      sourceType: 'basic_report',
      targetTypes: ['detailed_report', 'comprehensive_report'],
      conditions: {
        minWordCount: 1000,
        hasStructure: true
      },
      transformation: {
        addSections: ['analysis', 'recommendations', 'appendix'],
        enhanceContent: true,
        preserveOriginal: true
      },
      priority: 10,
      enabled: true,
      metadata: {
        description: 'Expand basic reports to detailed and comprehensive reports',
        version: '1.0.0'
      }
    });

    // Default structure expansion rule
    this.registerExpansionRule({
      ruleId: 'structure_expansion_default',
      expansionType: 'structure',
      sourceType: 'simple_report',
      targetTypes: ['structured_report', 'formal_report'],
      conditions: {
        hasTitle: true,
        hasBody: true
      },
      transformation: {
        addTableOfContents: true,
        addPageNumbers: true,
        addHeaders: true,
        addFooters: true
      },
      priority: 8,
      enabled: true,
      metadata: {
        description: 'Add formal structure to simple reports',
        version: '1.0.0'
      }
    });

    // Default formatting expansion rule
    this.registerExpansionRule({
      ruleId: 'formatting_expansion_default',
      expansionType: 'formatting',
      sourceType: 'plain_text',
      targetTypes: ['formatted_document', 'professional_document'],
      conditions: {
        isPlainText: true
      },
      transformation: {
        applyStyles: true,
        addFormatting: true,
        enhanceReadability: true
      },
      priority: 6,
      enabled: true,
      metadata: {
        description: 'Apply professional formatting to plain text',
        version: '1.0.0'
      }
    });
  }

  /**
   * Validate an expansion rule
   * @param rule - Rule to validate
   * @returns Validation result
   */
  private validateExpansionRule(rule: TypeExpansionRule): boolean {
    if (!rule.ruleId || typeof rule.ruleId !== 'string') {
      return false;
    }
    
    if (!rule.expansionType || !['content', 'structure', 'formatting', 'metadata'].includes(rule.expansionType)) {
      return false;
    }
    
    if (!rule.sourceType || typeof rule.sourceType !== 'string') {
      return false;
    }
    
    if (!Array.isArray(rule.targetTypes) || rule.targetTypes.length === 0) {
      return false;
    }
    
    if (typeof rule.priority !== 'number' || rule.priority < 0) {
      return false;
    }
    
    if (typeof rule.enabled !== 'boolean') {
      return false;
    }
    
    return true;
  }

  /**
   * Find compatible expansion rules
   * @param sourceType - Source report type
   * @param targetTypes - Target report types
   * @returns Array of compatible rules
   */
  private findCompatibleRules(sourceType: string, targetTypes: string[]): TypeExpansionRule[] {
    const compatibleRules: TypeExpansionRule[] = [];
    
    for (const rule of this.expansionRules.values()) {
      if (rule.sourceType === sourceType && 
          rule.enabled && 
          targetTypes.some(target => rule.targetTypes.includes(target))) {
        
        // Check conditions
        if (this.checkRuleConditions(rule.conditions)) {
          compatibleRules.push(rule);
        }
      }
    }
    
    return compatibleRules;
  }

  /**
   * Check if rule conditions are met
   * @param conditions - Conditions to check
   * @returns Whether conditions are met
   */
  private checkRuleConditions(conditions: Record<string, any>): boolean {
    // Placeholder for actual condition checking logic
    return true;
  }

  /**
   * Apply an expansion rule to content
   * @param rule - Rule to apply
   * @param content - Content to transform
   * @param parameters - Additional parameters
   * @returns Transformation result
   */
  private applyExpansionRule(rule: TypeExpansionRule, content: Record<string, any>, parameters: Record<string, any>): { success: boolean; transformedContent: Record<string, any>; error?: string } {
    try {
      const transformedContent = { ...content };
      
      // Apply transformation based on expansion type
      switch (rule.expansionType) {
        case 'content':
          this.applyContentTransformation(rule.transformation, transformedContent, parameters);
          break;
        case 'structure':
          this.applyStructureTransformation(rule.transformation, transformedContent, parameters);
          break;
        case 'formatting':
          this.applyFormattingTransformation(rule.transformation, transformedContent, parameters);
          break;
        case 'metadata':
          this.applyMetadataTransformation(rule.transformation, transformedContent, parameters);
          break;
      }
      
      return { success: true, transformedContent };
    } catch (error) {
      return { 
        success: false, 
        transformedContent: content, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Apply content transformation
   * @param transformation - Transformation logic
   * @param content - Content to transform
   * @param parameters - Additional parameters
   */
  private applyContentTransformation(transformation: Record<string, any>, content: Record<string, any>, parameters: Record<string, any>): void {
    // Placeholder for actual content transformation logic
    if (transformation.addSections) {
      if (!content.structure) content.structure = { sections: [] };
      content.structure.sections = [...content.structure.sections, ...transformation.addSections];
    }
    
    if (transformation.enhanceContent) {
      content.enhanced = true;
    }
    
    if (transformation.preserveOriginal) {
      content.originalContent = content.content;
    }
  }

  /**
   * Apply structure transformation
   * @param transformation - Transformation logic
   * @param content - Content to transform
   * @param parameters - Additional parameters
   */
  private applyStructureTransformation(transformation: Record<string, any>, content: Record<string, any>, parameters: Record<string, any>): void {
    // Placeholder for actual structure transformation logic
    if (transformation.addTableOfContents) {
      content.tableOfContents = true;
    }
    
    if (transformation.addPageNumbers) {
      content.pageNumbers = true;
    }
    
    if (transformation.addHeaders) {
      content.headers = true;
    }
    
    if (transformation.addFooters) {
      content.footers = true;
    }
  }

  /**
   * Apply formatting transformation
   * @param transformation - Transformation logic
   * @param content - Content to transform
   * @param parameters - Additional parameters
   */
  private applyFormattingTransformation(transformation: Record<string, any>, content: Record<string, any>, parameters: Record<string, any>): void {
    // Placeholder for actual formatting transformation logic
    if (transformation.applyStyles) {
      content.styles = 'professional';
    }
    
    if (transformation.addFormatting) {
      content.formatted = true;
    }
    
    if (transformation.enhanceReadability) {
      content.readability = 'enhanced';
    }
  }

  /**
   * Apply metadata transformation
   * @param transformation - Transformation logic
   * @param content - Content to transform
   * @param parameters - Additional parameters
   */
  private applyMetadataTransformation(transformation: Record<string, any>, content: Record<string, any>, parameters: Record<string, any>): void {
    // Placeholder for actual metadata transformation logic
    if (!content.metadata) content.metadata = {};
    
    if (transformation.addTimestamp) {
      content.metadata.generatedAt = new Date().toISOString();
    }
    
    if (transformation.addVersion) {
      content.metadata.version = '1.0.0';
    }
  }

  /**
   * Load document content (placeholder)
   * @param documentId - ID of the document
   * @param type - Document type
   * @returns Document content
   */
  private loadDocumentContent(documentId: string, type: string): Record<string, any> {
    // Placeholder for actual document loading logic
    return {
      documentId,
      type,
      content: `Content for document ${documentId}`,
      structure: {
        sections: ['introduction', 'body'],
        wordCount: 1000
      },
      metadata: {
        created: new Date().toISOString(),
        type
      }
    };
  }

  /**
   * Create a failed expansion result
   * @param documentId - Document ID
   * @param sourceType - Source type
   * @param targetTypes - Target types
   * @param error - Error message
   * @param startTime - Start time for duration calculation
   * @returns ExpansionResult
   */
  private createFailedExpansion(documentId: string, sourceType: string, targetTypes: string[], error: string, startTime: number): ExpansionResult {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    return {
      expansionId: `exp_${documentId}_${Date.now()}`,
      documentId,
      sourceType,
      targetTypes,
      success: false,
      appliedRules: [],
      errors: [error],
      warnings: [],
      expandedContent: {},
      metadata: {
        timestamp: new Date().toISOString(),
        duration,
        environment: 'production',
        rulesApplied: 0,
        confidence: 0
      },
      execution: {
        input: { documentId, sourceType, targetTypes },
        output: { error },
        context: { expansionType: 'type-expansion' }
      }
    };
  }

  /**
   * Calculate expansion confidence
   * @param appliedRules - Applied rule IDs
   * @param compatibleRules - All compatible rules
   * @returns Confidence score (0-1)
   */
  private calculateExpansionConfidence(appliedRules: string[], compatibleRules: TypeExpansionRule[]): number {
    if (compatibleRules.length === 0) return 0;
    
    const appliedCount = appliedRules.length;
    const totalCount = compatibleRules.length;
    
    return appliedCount / totalCount;
  }

  /**
   * Generate expansion requirements
   * @param sourceType - Source type
   * @param targetType - Target type
   * @returns Array of requirements
   */
  private generateExpansionRequirements(sourceType: string, targetType: string): string[] {
    // Placeholder for actual requirement generation logic
    return [
      `Document must be of type ${sourceType}`,
      `Document must have valid structure`,
      `Document must meet minimum quality standards`
    ];
  }

  /**
   * Generate expansion limitations
   * @param sourceType - Source type
   * @param targetType - Target type
   * @returns Array of limitations
   */
  private generateExpansionLimitations(sourceType: string, targetType: string): string[] {
    // Placeholder for actual limitation generation logic
    return [
      `Some content may be lost during expansion`,
      `Formatting may not be perfectly preserved`,
      `Complex documents may expand slower`
    ];
  }

  /**
   * Clear compatibility cache for specific types
   * @param sourceType - Source type
   * @param targetTypes - Target types
   */
  private clearCompatibilityCache(sourceType: string, targetTypes: string[]): void {
    const cacheKeys = Array.from(this.compatibilityCache.keys());
    
    for (const key of cacheKeys) {
      if (key.startsWith(`${sourceType}:`) || targetTypes.some(target => key.endsWith(`:${target}`))) {
        this.compatibilityCache.delete(key);
      }
    }
  }
}
/**
 * Phase 23: AI Layout Engine - Layout-Aware Context Mode Engine
 * 
 * Integrates layout awareness into context inference,
 * understands document structure for better context,
 * and provides layout-specific context suggestions.
 */

import type {
  LayoutBlock,
  LayoutConfig,
  LayoutOperationResult
} from '../types';

/**
 * Context mode engine configuration
 */
export interface ContextModeEngineConfig {
  /** Whether to analyze document structure for context */
  analyzeDocumentStructure: boolean;
  /** Maximum context depth to analyze */
  maxContextDepth: number;
  /** Whether to consider block relationships */
  considerBlockRelationships: boolean;
  /** Whether to generate layout suggestions */
  generateLayoutSuggestions: boolean;
  /** Context window size (number of blocks to consider) */
  contextWindowSize: number;
}

/**
 * Default context mode engine configuration
 */
export const DEFAULT_CONTEXT_MODE_ENGINE_CONFIG: ContextModeEngineConfig = {
  analyzeDocumentStructure: true,
  maxContextDepth: 3,
  considerBlockRelationships: true,
  generateLayoutSuggestions: true,
  contextWindowSize: 5
};

/**
 * Context analysis result
 */
export interface ContextAnalysisResult {
  /** Document structure analysis */
  structure: {
    /** Block type distribution */
    blockTypes: Record<string, number>;
    /** Estimated document complexity */
    complexity: 'simple' | 'moderate' | 'complex';
    /** Suggested layout improvements */
    suggestions: string[];
  };
  /** Context for specific position */
  positionContext: {
    /** Surrounding blocks */
    surroundingBlocks: LayoutBlock[];
    /** Suggested block type for position */
    suggestedBlockType?: string;
    /** Layout suggestions for position */
    layoutSuggestions: LayoutConfig[];
  };
  /** Relationships between blocks */
  relationships: Array<{
    sourceBlockId: string;
    targetBlockId: string;
    relationshipType: 'references' | 'complements' | 'contrasts' | 'follows';
    strength: number; // 0-1
  }>;
}

/**
 * Layout-aware context mode engine
 */
export class ContextModeEngine {
  private config: ContextModeEngineConfig;

  constructor(config: Partial<ContextModeEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONTEXT_MODE_ENGINE_CONFIG, ...config };
  }

  /**
   * Analyze document structure for context
   */
  analyzeDocumentStructure(blocks: LayoutBlock[]): ContextAnalysisResult {
    const blockTypes: Record<string, number> = {};
    let totalContentLength = 0;
    
    // Count block types and analyze content
    blocks.forEach(block => {
      const type = block.type;
      blockTypes[type] = (blockTypes[type] || 0) + 1;
      
      // Estimate content length
      if (typeof block.content === 'string') {
        totalContentLength += block.content.length;
      } else if (block.content && typeof block.content === 'object') {
        // Try to extract text content from complex blocks
        const contentStr = JSON.stringify(block.content);
        totalContentLength += contentStr.length;
      }
    });

    // Determine document complexity
    const complexity = this.determineDocumentComplexity(blocks, totalContentLength);
    
    // Generate structure suggestions
    const suggestions = this.generateStructureSuggestions(blocks, blockTypes, complexity);

    return {
      structure: {
        blockTypes,
        complexity,
        suggestions
      },
      positionContext: {
        surroundingBlocks: [],
        layoutSuggestions: []
      },
      relationships: []
    };
  }

  /**
   * Get context for a specific position
   */
  getPositionContext(
    blocks: LayoutBlock[],
    position: number
  ): ContextAnalysisResult {
    if (!blocks || blocks.length === 0) {
      return this.getEmptyContextAnalysis();
    }

    // Validate position
    const validPosition = Math.max(0, Math.min(position, blocks.length));
    
    // Get surrounding blocks based on context window
    const windowStart = Math.max(0, validPosition - Math.floor(this.config.contextWindowSize / 2));
    const windowEnd = Math.min(blocks.length, windowStart + this.config.contextWindowSize);
    const surroundingBlocks = blocks.slice(windowStart, windowEnd);
    
    // Analyze position context
    const suggestedBlockType = this.suggestBlockTypeForPosition(blocks, validPosition);
    const layoutSuggestions = this.generateLayoutSuggestionsForPosition(blocks, validPosition);

    // Get full document structure analysis
    const structureAnalysis = this.analyzeDocumentStructure(blocks);

    return {
      ...structureAnalysis,
      positionContext: {
        surroundingBlocks,
        suggestedBlockType,
        layoutSuggestions
      },
      relationships: this.analyzeBlockRelationships(blocks)
    };
  }

  /**
   * Suggest layout improvements based on context
   */
  suggestLayoutImprovements(blocks: LayoutBlock[]): {
    suggestions: Array<{
      blockId: string;
      issue: string;
      suggestion: string;
      priority: 'low' | 'medium' | 'high';
    }>;
    overallScore: number; // 0-100
  } {
    const suggestions: Array<{
      blockId: string;
      issue: string;
      suggestion: string;
      priority: 'low' | 'medium' | 'high';
    }> = [];

    if (!blocks || blocks.length === 0) {
      return { suggestions, overallScore: 100 }; // Empty document gets perfect score
    }

    // Analyze each block for layout issues
    blocks.forEach((block, index) => {
      const blockSuggestions = this.analyzeBlockLayout(block, index, blocks);
      suggestions.push(...blockSuggestions);
    });

    // Analyze document structure issues
    const structureSuggestions = this.analyzeDocumentStructureIssues(blocks);
    suggestions.push(...structureSuggestions);

    // Calculate overall score
    const overallScore = this.calculateLayoutScore(blocks, suggestions);

    return { suggestions, overallScore };
  }

  /**
   * Generate context-aware layout suggestions
   */
  generateContextAwareSuggestions(
    currentBlock: LayoutBlock,
    surroundingBlocks: LayoutBlock[]
  ): LayoutConfig[] {
    const suggestions: LayoutConfig[] = [];

    if (!currentBlock) {
      return suggestions;
    }

    // Base on block type
    let typeSuggestion: LayoutConfig | null = null;
    switch (currentBlock.type) {
      case 'paragraph':
        typeSuggestion = this.generateParagraphLayoutSuggestions(currentBlock, surroundingBlocks);
        break;
      case 'heading':
        typeSuggestion = this.generateHeadingLayoutSuggestions(currentBlock, surroundingBlocks);
        break;
      case 'image':
        typeSuggestion = this.generateImageLayoutSuggestions(currentBlock, surroundingBlocks);
        break;
      case 'table':
        typeSuggestion = this.generateTableLayoutSuggestions(currentBlock, surroundingBlocks);
        break;
      case 'columns':
        typeSuggestion = this.generateColumnsLayoutSuggestions(currentBlock, surroundingBlocks);
        break;
    }

    if (typeSuggestion) {
      suggestions.push(typeSuggestion);
    }

    // Add responsive design suggestions
    const responsiveSuggestion = this.generateResponsiveLayoutSuggestions(currentBlock);
    if (responsiveSuggestion) {
      suggestions.push(responsiveSuggestion);
    }

    return suggestions;
  }

  /**
   * Check if layout matches context
   */
  isLayoutContextAppropriate(
    block: LayoutBlock,
    contextBlocks: LayoutBlock[]
  ): { appropriate: boolean; reasons: string[]; improvements: string[] } {
    const reasons: string[] = [];
    const improvements: string[] = [];

    if (!block) {
      return { appropriate: false, reasons: ['Block is undefined'], improvements: [] };
    }

    // Check block type appropriateness in context
    const typeAppropriateness = this.checkBlockTypeAppropriateness(block, contextBlocks);
    if (!typeAppropriateness.appropriate) {
      reasons.push(...typeAppropriateness.reasons);
      improvements.push(...typeAppropriateness.improvements);
    }

    // Check layout configuration appropriateness
    const layoutAppropriateness = this.checkLayoutAppropriateness(block, contextBlocks);
    if (!layoutAppropriateness.appropriate) {
      reasons.push(...layoutAppropriateness.reasons);
      improvements.push(...layoutAppropriateness.improvements);
    }

    return {
      appropriate: reasons.length === 0,
      reasons,
      improvements
    };
  }

  /**
   * Private helper methods
   */

  private determineDocumentComplexity(blocks: LayoutBlock[], totalContentLength: number): 'simple' | 'moderate' | 'complex' {
    const blockCount = blocks.length;
    const uniqueBlockTypes = new Set(blocks.map(block => block.type)).size;

    if (blockCount <= 5 && uniqueBlockTypes <= 2 && totalContentLength < 2000) {
      return 'simple';
    } else if (blockCount <= 15 && uniqueBlockTypes <= 4 && totalContentLength < 10000) {
      return 'moderate';
    } else {
      return 'complex';
    }
  }

  private generateStructureSuggestions(
    blocks: LayoutBlock[],
    blockTypes: Record<string, number>,
    complexity: 'simple' | 'moderate' | 'complex'
  ): string[] {
    const suggestions: string[] = [];

    // Check for heading hierarchy
    const headingBlocks = blocks.filter(block => block.type === 'heading');
    if (headingBlocks.length > 0) {
      const headingLevels = headingBlocks.map(block => (block as any).level || 1);
      const maxLevel = Math.max(...headingLevels);
      const minLevel = Math.min(...headingLevels);
      
      if (maxLevel - minLevel > 2) {
        suggestions.push('Consider simplifying heading hierarchy - too many heading levels');
      }
    }

    // Check for long paragraphs
    const paragraphBlocks = blocks.filter(block => block.type === 'paragraph');
    paragraphBlocks.forEach((block, index) => {
      if (typeof block.content === 'string' && block.content.length > 1000) {
        suggestions.push(`Paragraph at position ${index} is very long (${block.content.length} characters). Consider splitting into multiple paragraphs or using columns.`);
      }
    });

    // Check for image placement
    const imageBlocks = blocks.filter(block => block.type === 'image' || block.type === 'figure');
    if (imageBlocks.length > 0) {
      const hasCaptions = imageBlocks.filter(block => 
        block.type === 'figure' || 
        (block.type === 'image' && (block as any).content?.alt)
      ).length;
      
      if (hasCaptions < imageBlocks.length) {
        suggestions.push('Some images lack captions or alt text. Consider adding descriptions for accessibility.');
      }
    }

    // Complexity-based suggestions
    if (complexity === 'complex') {
      suggestions.push('Document is complex. Consider adding a table of contents or summary section.');
    }

    return suggestions;
  }

  private suggestBlockTypeForPosition(blocks: LayoutBlock[], position: number): string | undefined {
    if (position >= blocks.length) {
      // End of document
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock?.type === 'heading') {
        return 'paragraph'; // Follow heading with paragraph
      }
      return 'paragraph'; // Default to paragraph
    }

    const currentBlock = blocks[position];
    const previousBlock = position > 0 ? blocks[position - 1] : null;
    const nextBlock = position < blocks.length - 1 ? blocks[position + 1] : null;

    // Simple heuristics based on surrounding blocks
    if (previousBlock?.type === 'heading') {
      return 'paragraph'; // Paragraph after heading
    }
    
    if (previousBlock?.type === 'paragraph' && nextBlock?.type === 'paragraph') {
      return 'image'; // Image between paragraphs
    }
    
    if (currentBlock?.type === 'table' && !nextBlock) {
      return 'paragraph'; // Paragraph after table
    }

    return undefined;
  }

  private generateLayoutSuggestionsForPosition(blocks: LayoutBlock[], position: number): LayoutConfig[] {
    const suggestions: LayoutConfig[] = [];
    
    if (position >= blocks.length || position < 0) {
      return suggestions;
    }

    const block = blocks[position];
    const surroundingBlocks = this.getSurroundingBlocks(blocks, position, 2);

    return this.generateContextAwareSuggestions(block, surroundingBlocks);
  }

  private analyzeBlockRelationships(blocks: LayoutBlock[]): Array<{
    sourceBlockId: string;
    targetBlockId: string;
    relationshipType: 'references' | 'complements' | 'contrasts' | 'follows';
    strength: number;
  }> {
    const relationships: Array<{
      sourceBlockId: string;
      targetBlockId: string;
      relationshipType: 'references' | 'complements' | 'contrasts' | 'follows';
      strength: number;
    }> = [];

    if (!this.config.considerBlockRelationships || blocks.length < 2) {
      return relationships;
    }

    // Simple relationship detection based on proximity and content
    for (let i = 0; i < blocks.length - 1; i++) {
      const sourceBlock = blocks[i];
      const targetBlock = blocks[i + 1];
      
      // Adjacent blocks have a "follows" relationship
      relationships.push({
        sourceBlockId: sourceBlock.id,
        targetBlockId: targetBlock.id,
        relationshipType: 'follows',
        strength: 0.8
      });

      // Check for complementary block types
      if (
        (sourceBlock.type === 'heading' && targetBlock.type === 'paragraph') ||
        (sourceBlock.type === 'image' && targetBlock.type === 'paragraph') ||
        (sourceBlock.type === 'paragraph' && targetBlock.type === 'image')
      ) {
        relationships.push({
          sourceBlockId: sourceBlock.id,
          targetBlockId: targetBlock.id,
          relationshipType: 'complements',
          strength: 0.6
        });
      }
    }

    return relationships;
  }

  private analyzeBlockLayout(
    block: LayoutBlock,
    index: number,
    allBlocks: LayoutBlock[]
  ): Array<{
    blockId: string;
    issue: string;
    suggestion: string;
    priority: 'low' | 'medium' | 'high';
  }> {
    const suggestions: Array<{
      blockId: string;
      issue: string;
      suggestion: string;
      priority: 'low' | 'medium' | 'high';
    }> = [];

    // Check for missing layout configuration
    if (!block.layout) {
      suggestions.push({
        blockId: block.id,
        issue: 'Block lacks layout configuration',
        suggestion: 'Add basic layout settings (alignment, margins)',
        priority: 'medium'
      });
    }

    // Type-specific checks
    switch (block.type) {
      case 'heading':
        const headingLevel = (block as any).level || 1;
        if (headingLevel > 4) {
          suggestions.push({
            blockId: block.id,
            issue: `Heading level ${headingLevel} may be too deep for main content`,
            suggestion: 'Consider using higher level heading (h1-h3) for better structure',
            priority: 'low'
          });
        }
        break;
        
      case 'image':
        const imageBlock = block as any;
        if (!imageBlock.content?.alt && !imageBlock.content?.title) {
          suggestions.push({
            blockId: block.id,
            issue: 'Image lacks alt text and title',
            suggestion: 'Add alt text for accessibility and better context',
            priority: 'high'
          });
        }
        break;
        
      case 'table':
        const tableBlock = block as any;
        if (!tableBlock.content?.headers && tableBlock.content?.rows?.length > 0) {
          suggestions.push({
            blockId: block.id,
            issue: 'Table lacks headers',
            suggestion: 'Add column headers for better readability',
            priority: 'medium'
          });
        }
        break;
    }

    return suggestions;
  }

  private analyzeDocumentStructureIssues(blocks: LayoutBlock[]): Array<{
    blockId: string;
    issue: string;
    suggestion: string;
    priority: 'low' | 'medium' | 'high';
  }> {
    const suggestions: Array<{
      blockId: string;
      issue: string;
      suggestion: string;
      priority: 'low' | 'medium' | 'high';
    }> = [];

    // Check for document structure issues
    const headingBlocks = blocks.filter(block => block.type === 'heading');
    if (headingBlocks.length === 0 && blocks.length > 3) {
      suggestions.push({
        blockId: 'document',
        issue: 'Document lacks headings',
        suggestion: 'Add headings to improve document structure and navigation',
        priority: 'medium'
      });
    }

    // Check for very long documents without breaks
    if (blocks.length > 20) {
      const hasColumns = blocks.some(block => block.type === 'columns');
      if (!hasColumns) {
        suggestions.push({
          blockId: 'document',
          issue: 'Long document without multi-column sections',
          suggestion: 'Consider using columns for better readability',
          priority: 'low'
        });
      }
    }

    return suggestions;
  }

  private calculateLayoutScore(blocks: LayoutBlock[], suggestions: Array<any>): number {
    if (blocks.length === 0) return 100;
    
    const totalIssues = suggestions.length;
    const maxAcceptableIssues = Math.ceil(blocks.length * 0.3); // 30% of blocks can have issues
    
    if (totalIssues <= maxAcceptableIssues) {
      return Math.max(0, 100 - (totalIssues * 10));
    }
    
    return Math.max(0, 50 - ((totalIssues - maxAcceptableIssues) * 5));
  }

  private getEmptyContextAnalysis(): ContextAnalysisResult {
    return {
      structure: {
        blockTypes: {},
        complexity: 'simple',
        suggestions: []
      },
      positionContext: {
        surroundingBlocks: [],
        suggestedBlockType: undefined,
        layoutSuggestions: []
      },
      relationships: []
    };
  }

  private getSurroundingBlocks(blocks: LayoutBlock[], position: number, radius: number): LayoutBlock[] {
    const start = Math.max(0, position - radius);
    const end = Math.min(blocks.length, position + radius + 1);
    return blocks.slice(start, end);
  }

  private checkBlockTypeAppropriateness(
    block: LayoutBlock,
    contextBlocks: LayoutBlock[]
  ): { appropriate: boolean; reasons: string[]; improvements: string[] } {
    const reasons: string[] = [];
    const improvements: string[] = [];

    // Check if block type is appropriate in context
    const contextBlockTypes = contextBlocks.map(b => b.type);
    const blockType = block.type;

    // Simple heuristics
    if (blockType === 'heading') {
      // Headings should not be adjacent to other headings (unless subheadings)
      const hasAdjacentHeading = contextBlocks.some(b => b.type === 'heading');
      if (hasAdjacentHeading) {
        reasons.push('Heading placed adjacent to another heading');
        improvements.push('Consider adding content between headings or adjusting heading levels');
      }
    } else if (blockType === 'image' || blockType === 'figure') {
      // Images should have nearby text
      const hasNearbyText = contextBlocks.some(b =>
        b.type === 'paragraph' || b.type === 'heading'
      );
      if (!hasNearbyText) {
        reasons.push('Image placed without nearby text context');
        improvements.push('Consider adding descriptive text near the image');
      }
    }

    return {
      appropriate: reasons.length === 0,
      reasons,
      improvements
    };
  }

  private checkLayoutAppropriateness(
    block: LayoutBlock,
    contextBlocks: LayoutBlock[]
  ): { appropriate: boolean; reasons: string[]; improvements: string[] } {
    const reasons: string[] = [];
    const improvements: string[] = [];

    if (!block.layout) {
      return { appropriate: true, reasons, improvements }; // No layout to check
    }

    // Check layout consistency with context
    const contextLayouts = contextBlocks
      .filter(b => b.layout)
      .map(b => b.layout!);

    if (contextLayouts.length > 0) {
      // Check alignment consistency
      const alignments = contextLayouts.map(l => l.alignment).filter(a => a);
      if (alignments.length > 0) {
        const blockAlignment = block.layout.alignment;
        if (blockAlignment && !alignments.includes(blockAlignment)) {
          reasons.push(`Block alignment (${blockAlignment}) differs from surrounding blocks`);
          improvements.push('Consider using consistent alignment with surrounding content');
        }
      }

      // Check width consistency for similar block types
      const similarBlocks = contextBlocks.filter(b => b.type === block.type);
      if (similarBlocks.length > 0) {
        const similarWidths = similarBlocks
          .filter(b => b.layout?.width)
          .map(b => b.layout!.width!);
        
        if (similarWidths.length > 0) {
          const avgWidth = similarWidths.reduce((a, b) => a + b, 0) / similarWidths.length;
          const blockWidth = block.layout.width || 100;
          
          if (Math.abs(blockWidth - avgWidth) > 20) {
            reasons.push(`Block width (${blockWidth}%) differs significantly from similar blocks (avg ${avgWidth.toFixed(0)}%)`);
            improvements.push('Consider using consistent width for similar block types');
          }
        }
      }
    }

    return {
      appropriate: reasons.length === 0,
      reasons,
      improvements
    };
  }

  private generateParagraphLayoutSuggestions(
    block: LayoutBlock,
    surroundingBlocks: LayoutBlock[]
  ): LayoutConfig | null {
    // Check if paragraph should be in columns
    const hasLongContent = typeof block.content === 'string' && block.content.length > 500;
    const hasMultipleParagraphs = surroundingBlocks.filter(b => b.type === 'paragraph').length > 1;
    
    if (hasLongContent && hasMultipleParagraphs) {
      return {
        columns: 2,
        alignment: 'justify',
        width: 100,
        margin: { top: 10, bottom: 10 }
      };
    }
    
    return {
      alignment: 'left',
      width: 100,
      margin: { top: 5, bottom: 5 }
    };
  }

  private generateHeadingLayoutSuggestions(
    block: LayoutBlock,
    surroundingBlocks: LayoutBlock[]
  ): LayoutConfig | null {
    const headingLevel = (block as any).level || 1;
    
    return {
      alignment: 'left',
      width: 100,
      margin: {
        top: headingLevel === 1 ? 30 : headingLevel === 2 ? 20 : 10,
        bottom: 10
      }
    };
  }

  private generateImageLayoutSuggestions(
    block: LayoutBlock,
    surroundingBlocks: LayoutBlock[]
  ): LayoutConfig | null {
    const hasTextBefore = surroundingBlocks.some(b =>
      b.type === 'paragraph' || b.type === 'heading'
    );
    const hasTextAfter = surroundingBlocks.slice(1).some(b =>
      b.type === 'paragraph' || b.type === 'heading'
    );
    
    let alignment: 'left' | 'right' | 'center' | 'justify' = 'center';
    let floatValue: 'left' | 'right' | 'none' = 'none';
    
    if (hasTextBefore && hasTextAfter) {
      alignment = 'left';
      floatValue = 'left';
    }
    
    return {
      alignment,
      width: 80,
      float: floatValue,
      margin: { top: 10, bottom: 10 }
    };
  }

  private generateTableLayoutSuggestions(
    block: LayoutBlock,
    surroundingBlocks: LayoutBlock[]
  ): LayoutConfig | null {
    return {
      alignment: 'center',
      width: 100,
      margin: { top: 20, bottom: 20 }
    };
  }

  private generateColumnsLayoutSuggestions(
    block: LayoutBlock,
    surroundingBlocks: LayoutBlock[]
  ): LayoutConfig | null {
    const columnBlock = block as any;
    const columnCount = columnBlock.content?.length || 2;
    
    return {
      columns: columnCount,
      alignment: 'left',
      width: 100,
      margin: { top: 15, bottom: 15 }
    };
  }

  private generateResponsiveLayoutSuggestions(block: LayoutBlock): LayoutConfig | null {
    return {
      width: 100,
      margin: {
        top: block.layout?.margin?.top || 0,
        right: 0,
        bottom: block.layout?.margin?.bottom || 0,
        left: 0
      }
    };
  }
}

/**
 * Create a default context mode engine instance
 */
export function createContextModeEngine(config: Partial<ContextModeEngineConfig> = {}): ContextModeEngine {
  return new ContextModeEngine(config);
}
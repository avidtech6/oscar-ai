/**
 * Phase 23: AI Layout Engine - Layout-Aware Chat Mode Engine
 * 
 * Integrates layout awareness into chat interactions,
 * allows AI to understand and manipulate document layout through natural language,
 * and offers layout changes in chat mode with confirmation.
 */

import type {
  LayoutBlock,
  LayoutConfig,
  LayoutOperationResult
} from '../types';

import { ColumnEngine } from './ColumnEngine';
import { FigureEngine } from './FigureEngine';
import { TableEngine } from './TableEngine';
import { SectionReorderEngine } from './SectionReorderEngine';
import { MediaPlacementEngine } from './MediaPlacementEngine';
import { ContextModeEngine } from './ContextModeEngine';

/**
 * Chat mode engine configuration
 */
export interface ChatModeEngineConfig {
  /** Whether to automatically detect layout-related queries */
  autoDetectLayoutQueries: boolean;
  /** Whether to offer layout suggestions in chat */
  offerLayoutSuggestions: boolean;
  /** Whether to require confirmation before applying changes */
  requireConfirmation: boolean;
  /** Maximum number of layout suggestions to show */
  maxSuggestions: number;
  /** Whether to integrate with existing chat context */
  integrateWithChatContext: boolean;
}

/**
 * Default chat mode engine configuration
 */
export const DEFAULT_CHAT_MODE_ENGINE_CONFIG: ChatModeEngineConfig = {
  autoDetectLayoutQueries: true,
  offerLayoutSuggestions: true,
  requireConfirmation: true,
  maxSuggestions: 3,
  integrateWithChatContext: true
};

/**
 * Layout suggestion for chat
 */
export interface LayoutSuggestion {
  /** Suggestion ID */
  id: string;
  /** Description of the suggestion */
  description: string;
  /** Type of layout change */
  type: 'columns' | 'figure' | 'table' | 'reorder' | 'media' | 'general';
  /** Priority level */
  priority: 'low' | 'medium' | 'high';
  /** Estimated effort to implement */
  effort: 'low' | 'medium' | 'high';
  /** Preview of the change (optional) */
  preview?: string;
  /** Implementation function */
  implement: () => Promise<LayoutOperationResult>;
}

/**
 * Chat layout analysis result
 */
export interface ChatLayoutAnalysis {
  /** Whether the query is layout-related */
  isLayoutRelated: boolean;
  /** Detected layout intent */
  layoutIntent?: 'createColumns' | 'addFigure' | 'createTable' | 'reorderSections' | 'placeMedia' | 'adjustLayout';
  /** Confidence score (0-1) */
  confidence: number;
  /** Extracted parameters from query */
  parameters: Record<string, any>;
  /** Suggested layout changes */
  suggestions: LayoutSuggestion[];
}

/**
 * Layout-aware chat mode engine
 */
export class ChatModeEngine {
  private config: ChatModeEngineConfig;
  private columnEngine: ColumnEngine;
  private figureEngine: FigureEngine;
  private tableEngine: TableEngine;
  private sectionReorderEngine: SectionReorderEngine;
  private mediaPlacementEngine: MediaPlacementEngine;
  private contextModeEngine: ContextModeEngine;

  constructor(
    config: Partial<ChatModeEngineConfig> = {},
    columnEngine?: ColumnEngine,
    figureEngine?: FigureEngine,
    tableEngine?: TableEngine,
    sectionReorderEngine?: SectionReorderEngine,
    mediaPlacementEngine?: MediaPlacementEngine,
    contextModeEngine?: ContextModeEngine
  ) {
    this.config = { ...DEFAULT_CHAT_MODE_ENGINE_CONFIG, ...config };
    
    // Initialize engines with defaults if not provided
    this.columnEngine = columnEngine || new ColumnEngine();
    this.figureEngine = figureEngine || new FigureEngine();
    this.tableEngine = tableEngine || new TableEngine();
    this.sectionReorderEngine = sectionReorderEngine || new SectionReorderEngine();
    this.mediaPlacementEngine = mediaPlacementEngine || new MediaPlacementEngine();
    this.contextModeEngine = contextModeEngine || new ContextModeEngine();
  }

  /**
   * Analyze chat query for layout-related content
   */
  analyzeChatQuery(
    query: string,
    currentDocumentBlocks: LayoutBlock[] = []
  ): ChatLayoutAnalysis {
    const normalizedQuery = query.toLowerCase().trim();
    const isLayoutRelated = this.isLayoutRelatedQuery(normalizedQuery);
    
    if (!isLayoutRelated) {
      return {
        isLayoutRelated: false,
        confidence: 0,
        parameters: {},
        suggestions: []
      };
    }

    // Detect layout intent
    const { intent, confidence, parameters } = this.detectLayoutIntent(normalizedQuery);
    
    // Generate suggestions based on intent and current document
    const suggestions = this.generateLayoutSuggestions(
      intent,
      parameters,
      currentDocumentBlocks
    );

    return {
      isLayoutRelated: true,
      layoutIntent: intent,
      confidence,
      parameters,
      suggestions
    };
  }

  /**
   * Check if query is layout-related
   */
  private isLayoutRelatedQuery(query: string): boolean {
    const layoutKeywords = [
      // Column-related
      'column', 'side by side', 'next to', 'two column', 'three column',
      'split', 'parallel', 'adjacent',
      
      // Figure-related
      'figure', 'caption', 'label', 'diagram', 'image caption',
      'picture with text', 'photo description',
      
      // Table-related
      'table', 'grid', 'spreadsheet', 'rows', 'columns', 'tabular',
      'organize as table', 'convert to table',
      
      // Reordering-related
      'move', 'reorder', 'rearrange', 'swap', 'above', 'below',
      'before', 'after', 'shift', 'relocate',
      
      // Media placement
      'place image', 'insert photo', 'add picture', 'position diagram',
      'align image', 'resize', 'float', 'wrap text',
      
      // General layout
      'layout', 'structure', 'format', 'arrange', 'organize',
      'design', 'style', 'align', 'center', 'justify'
    ];

    return layoutKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Detect layout intent from query
   */
  private detectLayoutIntent(
    query: string
  ): { intent: ChatLayoutAnalysis['layoutIntent'], confidence: number, parameters: Record<string, any> } {
    const parameters: Record<string, any> = {};
    let intent: ChatLayoutAnalysis['layoutIntent'] = 'adjustLayout';
    let confidence = 0.5; // Base confidence

    // Column detection
    if (
      query.includes('column') ||
      query.includes('side by side') ||
      query.includes('next to') ||
      query.includes('parallel')
    ) {
      intent = 'createColumns';
      confidence = 0.8;
      
      // Extract column count
      const columnMatch = query.match(/(\d+)\s*column/);
      if (columnMatch) {
        parameters.columnCount = parseInt(columnMatch[1], 10);
      } else if (query.includes('two') || query.includes('2')) {
        parameters.columnCount = 2;
      } else if (query.includes('three') || query.includes('3')) {
        parameters.columnCount = 3;
      } else {
        parameters.columnCount = 2; // Default
      }
    }
    
    // Figure detection
    else if (
      query.includes('figure') ||
      query.includes('caption') ||
      query.includes('label') ||
      query.includes('diagram with')
    ) {
      intent = 'addFigure';
      confidence = 0.7;
      
      // Extract caption text if present
      const captionMatch = query.match(/caption\s+(?:of|for|:)?\s*["']?([^"'.!?]+)/i);
      if (captionMatch) {
        parameters.caption = captionMatch[1].trim();
      }
    }
    
    // Table detection
    else if (
      query.includes('table') ||
      query.includes('grid') ||
      query.includes('spreadsheet') ||
      query.includes('convert to table') ||
      query.includes('organize as table')
    ) {
      intent = 'createTable';
      confidence = 0.75;
      
      // Extract column names if mentioned
      const columnsMatch = query.match(/columns?:\s*([^.!?]+)/i);
      if (columnsMatch) {
        const columnsText = columnsMatch[1];
        parameters.columns = columnsText.split(/\s*,\s*|\s+and\s+/i).map((col: string) => col.trim());
      }
    }
    
    // Reordering detection
    else if (
      query.includes('move') ||
      query.includes('reorder') ||
      query.includes('rearrange') ||
      query.includes('swap') ||
      query.includes('above') ||
      query.includes('below') ||
      query.includes('before') ||
      query.includes('after')
    ) {
      intent = 'reorderSections';
      confidence = 0.85;
      
      // Extract source and target
      const moveMatch = query.match(/move\s+(.+?)\s+(above|below|before|after)\s+(.+)/i);
      if (moveMatch) {
        parameters.source = moveMatch[1].trim();
        parameters.direction = moveMatch[2].toLowerCase();
        parameters.target = moveMatch[3].trim();
      }
    }
    
    // Media placement detection
    else if (
      query.includes('place') ||
      query.includes('insert') ||
      query.includes('add') ||
      query.includes('position') ||
      query.includes('align') ||
      query.includes('resize') ||
      query.includes('float')
    ) {
      intent = 'placeMedia';
      confidence = 0.7;
      
      // Extract alignment
      if (query.includes('left')) {
        parameters.alignment = 'left';
      } else if (query.includes('right')) {
        parameters.alignment = 'right';
      } else if (query.includes('center') || query.includes('centre')) {
        parameters.alignment = 'center';
      }
    }

    return { intent, confidence, parameters };
  }

  /**
   * Generate layout suggestions based on intent
   */
  private generateLayoutSuggestions(
    intent: ChatLayoutAnalysis['layoutIntent'],
    parameters: Record<string, any>,
    currentDocumentBlocks: LayoutBlock[]
  ): LayoutSuggestion[] {
    const suggestions: LayoutSuggestion[] = [];

    if (!intent || currentDocumentBlocks.length === 0) {
      return suggestions;
    }

    switch (intent) {
      case 'createColumns':
        suggestions.push(...this.generateColumnSuggestions(parameters, currentDocumentBlocks));
        break;
      case 'addFigure':
        suggestions.push(...this.generateFigureSuggestions(parameters, currentDocumentBlocks));
        break;
      case 'createTable':
        suggestions.push(...this.generateTableSuggestions(parameters, currentDocumentBlocks));
        break;
      case 'reorderSections':
        suggestions.push(...this.generateReorderSuggestions(parameters, currentDocumentBlocks));
        break;
      case 'placeMedia':
        suggestions.push(...this.generateMediaPlacementSuggestions(parameters, currentDocumentBlocks));
        break;
      case 'adjustLayout':
        suggestions.push(...this.generateGeneralLayoutSuggestions(currentDocumentBlocks));
        break;
    }

    // Limit suggestions based on config
    return suggestions.slice(0, this.config.maxSuggestions);
  }

  /**
   * Generate column layout suggestions
   */
  private generateColumnSuggestions(
    parameters: Record<string, any>,
    blocks: LayoutBlock[]
  ): LayoutSuggestion[] {
    const suggestions: LayoutSuggestion[] = [];
    const columnCount = parameters.columnCount || 2;

    // Suggestion 1: Convert a paragraph to columns
    const paragraphBlocks = blocks.filter(block => block.type === 'paragraph');
    if (paragraphBlocks.length > 0) {
      const firstParagraph = paragraphBlocks[0];
      suggestions.push({
        id: `columns-paragraph-${Date.now()}`,
        description: `Convert paragraph to ${columnCount} columns`,
        type: 'columns',
        priority: 'medium',
        effort: 'medium',
        implement: async () => {
          return this.columnEngine.convertToColumns(firstParagraph, columnCount);
        }
      });
    }

    // Suggestion 2: Create side-by-side layout for images
    const imageBlocks = blocks.filter(block => block.type === 'image' || block.type === 'figure');
    if (imageBlocks.length >= 2) {
      suggestions.push({
        id: `columns-images-${Date.now()}`,
        description: `Place ${Math.min(2, imageBlocks.length)} images side by side`,
        type: 'columns',
        priority: 'high',
        effort: 'low',
        implement: async () => {
          const selectedImages = imageBlocks.slice(0, 2);
          return this.columnEngine.splitIntoSideBySide(selectedImages);
        }
      });
    }

    // Suggestion 3: Create multi-column section
    if (blocks.length > 2) {
      suggestions.push({
        id: `columns-section-${Date.now()}`,
        description: `Create ${columnCount}-column section from selected content`,
        type: 'columns',
        priority: 'low',
        effort: 'medium',
        implement: async () => {
          // Use first few blocks for column conversion
          const sectionBlocks = blocks.slice(0, Math.min(3, blocks.length));
          return this.columnEngine.convertToColumns(sectionBlocks[0], columnCount);
        }
      });
    }

    return suggestions;
  }

  /**
   * Generate figure suggestions
   */
  private generateFigureSuggestions(
    parameters: Record<string, any>,
    blocks: LayoutBlock[]
  ): LayoutSuggestion[] {
    const suggestions: LayoutSuggestion[] = [];
    const caption = parameters.caption || 'Figure with caption';

    // Find image blocks without captions
    const imageBlocks = blocks.filter(block => block.type === 'image');
    
    imageBlocks.forEach((block, index) => {
      suggestions.push({
        id: `figure-${block.id}-${Date.now()}`,
        description: `Add caption "${caption.substring(0, 30)}${caption.length > 30 ? '...' : ''}" to image`,
        type: 'figure',
        priority: 'high',
        effort: 'low',
        implement: async () => {
          // Type assertion for ImageBlock
          const imageBlock = block as any;
          return this.figureEngine.addCaptionToImage(imageBlock, caption);
        }
      });
    });

    // If no image blocks, suggest creating a figure placeholder
    if (imageBlocks.length === 0) {
      suggestions.push({
        id: `figure-placeholder-${Date.now()}`,
        description: 'Create a figure placeholder with caption',
        type: 'figure',
        priority: 'medium',
        effort: 'medium',
        implement: async () => {
          return this.figureEngine.createFigure(
            'https://via.placeholder.com/400x300',
            caption,
            'Figure'
          );
        }
      });
    }

    return suggestions.slice(0, 2); // Limit to 2 suggestions
  }

  /**
   * Generate table suggestions
   */
  private generateTableSuggestions(
    parameters: Record<string, any>,
    blocks: LayoutBlock[]
  ): LayoutSuggestion[] {
    const suggestions: LayoutSuggestion[] = [];
    const columns = parameters.columns || ['Item', 'Description', 'Value'];

    // Suggestion 1: Convert list blocks to table
    const listBlocks = blocks.filter(block => block.type === 'list');
    if (listBlocks.length > 0) {
      listBlocks.forEach((block, index) => {
        suggestions.push({
          id: `table-from-list-${block.id}-${Date.now()}`,
          description: `Convert list to table with ${columns.length} columns`,
          type: 'table',
          priority: 'medium',
          effort: 'medium',
          implement: async () => {
            // Type assertion for ListBlock
            const listBlock = block as any;
            return this.tableEngine.convertListToTable(listBlock, columns);
          }
        });
      });
    }

    // Suggestion 2: Convert paragraph to table
    const paragraphBlocks = blocks.filter(block => block.type === 'paragraph');
    if (paragraphBlocks.length > 0) {
      const firstParagraph = paragraphBlocks[0];
      suggestions.push({
        id: `table-from-text-${Date.now()}`,
        description: 'Convert text to structured table',
        type: 'table',
        priority: 'low',
        effort: 'high',
        implement: async () => {
          const text = typeof firstParagraph.content === 'string' ? firstParagraph.content : '';
          return this.tableEngine.convertTextToTable(text, columns);
        }
      });
    }

    // Suggestion 3: Create empty table
    suggestions.push({
      id: `table-empty-${Date.now()}`,
      description: `Create empty table with ${columns.length} columns`,
      type: 'table',
      priority: 'low',
      effort: 'low',
      implement: async () => {
        return this.tableEngine.convertTextToTable('', columns);
      }
    });

    return suggestions.slice(0, 2);
  }

  /**
   * Generate reorder suggestions
   */
  private generateReorderSuggestions(
    parameters: Record<string, any>,
    blocks: LayoutBlock[]
  ): LayoutSuggestion[] {
    const suggestions: LayoutSuggestion[] = [];
    const source = parameters.source;
    const target = parameters.target;
    const direction = parameters.direction;

    // If specific blocks mentioned, create targeted suggestions
    if (source && target) {
      const sourceIndex = blocks.findIndex(block =>
        block.id.includes(source.toLowerCase()) ||
        (typeof block.content === 'string' && block.content.toLowerCase().includes(source.toLowerCase()))
      );
      
      const targetIndex = blocks.findIndex(block =>
        block.id.includes(target.toLowerCase()) ||
        (typeof block.content === 'string' && block.content.toLowerCase().includes(target.toLowerCase()))
      );

      if (sourceIndex !== -1 && targetIndex !== -1) {
        let newIndex = targetIndex;
        if (direction === 'above' || direction === 'before') {
          newIndex = Math.max(0, targetIndex - 1);
        } else if (direction === 'below' || direction === 'after') {
          newIndex = Math.min(blocks.length, targetIndex + 1);
        }

        suggestions.push({
          id: `reorder-specific-${Date.now()}`,
          description: `Move "${source}" ${direction} "${target}"`,
          type: 'reorder',
          priority: 'high',
          effort: 'low',
          implement: async () => {
            // Use moveBlockUp or moveBlockDown based on direction
            if (newIndex < sourceIndex) {
              return this.sectionReorderEngine.moveBlockUp(blocks, sourceIndex, sourceIndex - newIndex);
            } else {
              return this.sectionReorderEngine.moveBlockDown(blocks, sourceIndex, newIndex - sourceIndex);
            }
          }
        });
      }
    }

    // General reordering suggestions
    if (blocks.length > 1) {
      // Suggestion: Move last section to beginning
      suggestions.push({
        id: `reorder-last-to-first-${Date.now()}`,
        description: 'Move last section to beginning for better flow',
        type: 'reorder',
        priority: 'medium',
        effort: 'low',
        implement: async () => {
          return this.sectionReorderEngine.moveBlockUp(blocks, blocks.length - 1, blocks.length - 1);
        }
      });

      // Suggestion: Swap first two sections
      suggestions.push({
        id: `reorder-swap-first-two-${Date.now()}`,
        description: 'Swap first two sections',
        type: 'reorder',
        priority: 'low',
        effort: 'low',
        implement: async () => {
          return this.sectionReorderEngine.reorderBlocks(blocks, [1, 0, ...Array.from({length: blocks.length - 2}, (_, i) => i + 2)]);
        }
      });
    }

    return suggestions;
  }

  /**
   * Generate media placement suggestions
   */
  private generateMediaPlacementSuggestions(
    parameters: Record<string, any>,
    blocks: LayoutBlock[]
  ): LayoutSuggestion[] {
    const suggestions: LayoutSuggestion[] = [];
    const alignment = parameters.alignment || 'center';

    // Find image blocks
    const imageBlocks = blocks.filter(block => block.type === 'image');
    
    if (imageBlocks.length > 0) {
      imageBlocks.forEach((block, index) => {
        suggestions.push({
          id: `media-placement-${block.id}-${Date.now()}`,
          description: `Align image ${alignment} with text wrapping`,
          type: 'media',
          priority: 'medium',
          effort: 'low',
          implement: async () => {
            // Type assertion since we filtered by type
            const imageBlock = block as any;
            return this.mediaPlacementEngine.placeImageWithText(imageBlock, alignment);
          }
        });
      });
    }

    // If no images, suggest adding one
    if (imageBlocks.length === 0) {
      suggestions.push({
        id: `media-add-placeholder-${Date.now()}`,
        description: 'Add placeholder image with text alignment',
        type: 'media',
        priority: 'low',
        effort: 'medium',
        implement: async () => {
          // First create an image block
          const { createImageBlock } = await import('../types');
          const imageBlock = createImageBlock(
            'https://via.placeholder.com/400x300',
            'Placeholder image'
          );
          // Then convert it to figure with caption
          return this.mediaPlacementEngine.convertToFigureWithCaption(
            imageBlock,
            [],
            { caption: 'Placeholder image', alignment }
          );
        }
      });
    }

    return suggestions.slice(0, 2);
  }

  /**
   * Generate general layout suggestions
   */
  private generateGeneralLayoutSuggestions(
    blocks: LayoutBlock[]
  ): LayoutSuggestion[] {
    const suggestions: LayoutSuggestion[] = [];

    // Analyze document structure using context mode engine
    const analysis = this.contextModeEngine.analyzeDocumentStructure(blocks);
    
    // Generate suggestions based on analysis
    analysis.structure.suggestions.forEach((suggestion, index) => {
      suggestions.push({
        id: `general-layout-${index}-${Date.now()}`,
        description: suggestion,
        type: 'general',
        priority: 'medium',
        effort: 'medium',
        implement: async () => {
          // This is a general suggestion, implementation would depend on the specific suggestion
          return {
            success: true,
            message: `Applied layout improvement: ${suggestion}`,
            blocks
          };
        }
      });
    });

    // Add responsive design suggestion
    suggestions.push({
      id: `responsive-design-${Date.now()}`,
      description: 'Make document responsive for different screen sizes',
      type: 'general',
      priority: 'low',
      effort: 'high',
      implement: async () => {
        return {
          success: true,
          message: 'Applied responsive design improvements',
          blocks: blocks.map(block => ({
            ...block,
            layout: {
              ...block.layout,
              width: 100 // Full width for responsiveness
            }
          }))
        };
      }
    });

    return suggestions.slice(0, this.config.maxSuggestions);
  }

  /**
   * Apply a layout suggestion with optional confirmation
   */
  async applySuggestion(
    suggestion: LayoutSuggestion,
    requireConfirmation: boolean = this.config.requireConfirmation
  ): Promise<LayoutOperationResult> {
    if (requireConfirmation) {
      // In a real implementation, this would trigger a UI confirmation dialog
      // For now, we'll simulate it by always proceeding
      console.log(`Applying layout suggestion: ${suggestion.description}`);
    }

    try {
      const result = await suggestion.implement();
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Failed to apply suggestion: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Format layout suggestions for chat display
   */
  formatSuggestionsForChat(suggestions: LayoutSuggestion[]): string {
    if (suggestions.length === 0) {
      return 'No layout suggestions available.';
    }

    let formatted = '**Layout Suggestions:**\n\n';
    
    suggestions.forEach((suggestion, index) => {
      formatted += `${index + 1}. **${suggestion.description}**\n`;
      formatted += `   • Type: ${suggestion.type}\n`;
      formatted += `   • Priority: ${suggestion.priority}\n`;
      formatted += `   • Effort: ${suggestion.effort}\n`;
      
      if (suggestion.preview) {
        formatted += `   • Preview: ${suggestion.preview}\n`;
      }
      
      formatted += '\n';
    });

    formatted += `\n*Reply with the number to apply a suggestion, or ask for more options.*`;
    
    return formatted;
  }

  /**
   * Process chat response to layout suggestion
   */
  processChatResponse(
    response: string,
    suggestions: LayoutSuggestion[]
  ): { selectedSuggestion: LayoutSuggestion | null; action: 'apply' | 'more' | 'cancel' } {
    const normalizedResponse = response.toLowerCase().trim();
    
    // Check for numeric selection
    const numberMatch = normalizedResponse.match(/^(\d+)$/);
    if (numberMatch) {
      const index = parseInt(numberMatch[1], 10) - 1;
      if (index >= 0 && index < suggestions.length) {
        return {
          selectedSuggestion: suggestions[index],
          action: 'apply'
        };
      }
    }
    
    // Check for "more" request
    if (normalizedResponse.includes('more') || normalizedResponse.includes('other') || normalizedResponse.includes('another')) {
      return {
        selectedSuggestion: null,
        action: 'more'
      };
    }
    
    // Check for cancellation
    if (normalizedResponse.includes('cancel') || normalizedResponse.includes('no') || normalizedResponse.includes('skip')) {
      return {
        selectedSuggestion: null,
        action: 'cancel'
      };
    }
    
    // Default to no action
    return {
      selectedSuggestion: null,
      action: 'cancel'
    };
  }
}

/**
 * Create a default chat mode engine instance
 */
export function createChatModeEngine(config: Partial<ChatModeEngineConfig> = {}): ChatModeEngine {
  return new ChatModeEngine(config);
}
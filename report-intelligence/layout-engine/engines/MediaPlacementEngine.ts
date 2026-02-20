/**
 * Phase 23: AI Layout Engine - Layout-Aware Media Placement Engine
 * 
 * Integrates with Phase 22 Media Intelligence for intelligent
 * image placement, media alignment with text, and responsive sizing.
 */

import type {
  LayoutBlock,
  ImageBlock,
  FigureBlock,
  LayoutConfig,
  LayoutOperationResult
} from '../types';
import { createImageBlock, createFigureBlock, isImageBlock, isFigureBlock } from '../types';

/**
 * Media placement engine configuration
 */
export interface MediaPlacementEngineConfig {
  /** Default image alignment */
  defaultImageAlignment: 'left' | 'right' | 'center' | 'inline';
  /** Default image width percentage */
  defaultImageWidth: number;
  /** Maximum image width percentage */
  maxImageWidth: number;
  /** Minimum image width percentage */
  minImageWidth: number;
  /** Whether to maintain aspect ratio */
  maintainAspectRatio: boolean;
  /** Whether to add captions automatically */
  autoAddCaptions: boolean;
  /** Whether to wrap text around images */
  wrapTextAroundImages: boolean;
  /** Text wrap margin in pixels */
  textWrapMargin: number;
}

/**
 * Default media placement engine configuration
 */
export const DEFAULT_MEDIA_PLACEMENT_ENGINE_CONFIG: MediaPlacementEngineConfig = {
  defaultImageAlignment: 'center',
  defaultImageWidth: 80,
  maxImageWidth: 100,
  minImageWidth: 30,
  maintainAspectRatio: true,
  autoAddCaptions: true,
  wrapTextAroundImages: true,
  textWrapMargin: 15
};

/**
 * Media placement options
 */
export interface MediaPlacementOptions {
  /** Image alignment */
  alignment?: 'left' | 'right' | 'center' | 'inline';
  /** Image width percentage */
  width?: number;
  /** Whether to wrap text around image */
  wrapText?: boolean;
  /** Whether to add caption */
  addCaption?: boolean;
  /** Caption text (if addCaption is true) */
  caption?: string;
  /** Whether to maintain aspect ratio */
  maintainAspectRatio?: boolean;
}

/**
 * Media placement engine for intelligent image and media placement
 */
export class MediaPlacementEngine {
  private config: MediaPlacementEngineConfig;

  constructor(config: Partial<MediaPlacementEngineConfig> = {}) {
    this.config = { ...DEFAULT_MEDIA_PLACEMENT_ENGINE_CONFIG, ...config };
  }

  /**
   * Place image in relation to text blocks
   */
  placeImageWithText(
    imageBlock: ImageBlock,
    textBlocks: LayoutBlock[],
    options: Partial<MediaPlacementOptions> = {}
  ): LayoutOperationResult {
    try {
      if (!imageBlock || imageBlock.type !== 'image') {
        return {
          success: false,
          message: 'Invalid image block'
        };
      }

      if (!textBlocks || textBlocks.length === 0) {
        return {
          success: false,
          message: 'No text blocks provided'
        };
      }

      // Determine optimal placement based on text content
      const placement = this.calculateOptimalPlacement(imageBlock, textBlocks, options);
      
      // Apply placement to image block
      const placedImageBlock = this.applyPlacementToImage(imageBlock, placement, options);

      // Create result with placed image and suggested text arrangement
      const resultBlocks: LayoutBlock[] = this.arrangeBlocksWithImage(
        placedImageBlock,
        textBlocks,
        placement
      );

      return {
        success: true,
        message: `Successfully placed image with ${placement.alignment} alignment`,
        blocks: resultBlocks
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to place image with text: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Convert image to figure with automatic caption
   */
  convertToFigureWithCaption(
    imageBlock: ImageBlock,
    contextBlocks: LayoutBlock[] = [],
    options: Partial<MediaPlacementOptions> = {}
  ): LayoutOperationResult {
    try {
      if (!imageBlock || imageBlock.type !== 'image') {
        return {
          success: false,
          message: 'Invalid image block'
        };
      }

      // Generate caption from context or image metadata
      const caption = options.caption || this.generateCaptionFromContext(imageBlock, contextBlocks);
      
      // Create figure block
      const figureBlock = createFigureBlock(
        imageBlock,
        caption,
        undefined, // label
        {
          layout: {
            captionPosition: 'below',
            captionAlignment: 'center',
            showLabel: true,
            ...imageBlock.layout
          }
        }
      );

      return {
        success: true,
        message: 'Successfully converted image to figure with caption',
        block: figureBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to convert image to figure: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Adjust image size based on context
   */
  adjustImageSize(
    imageBlock: ImageBlock,
    contextBlocks: LayoutBlock[] = [],
    options: Partial<MediaPlacementOptions> = {}
  ): LayoutOperationResult {
    try {
      if (!imageBlock || imageBlock.type !== 'image') {
        return {
          success: false,
          message: 'Invalid image block'
        };
      }

      // Calculate optimal size based on context
      const optimalSize = this.calculateOptimalSize(imageBlock, contextBlocks, options);
      
      // Apply size to image block
      const adjustedImageBlock: ImageBlock = {
        ...imageBlock,
        layout: {
          ...imageBlock.layout,
          width: optimalSize.width,
          maxWidth: optimalSize.maxWidth,
          maintainAspectRatio: options.maintainAspectRatio ?? this.config.maintainAspectRatio
        }
      };

      return {
        success: true,
        message: `Successfully adjusted image size to ${optimalSize.width}%`,
        block: adjustedImageBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to adjust image size: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Create responsive image layout
   */
  createResponsiveImageLayout(
    imageBlocks: ImageBlock[],
    options: Partial<MediaPlacementOptions> = {}
  ): LayoutOperationResult {
    try {
      if (!imageBlocks || imageBlocks.length === 0) {
        return {
          success: false,
          message: 'No image blocks provided'
        };
      }

      // Validate all blocks are images
      const invalidBlocks = imageBlocks.filter(block => !isImageBlock(block));
      if (invalidBlocks.length > 0) {
        return {
          success: false,
          message: `Found ${invalidBlocks.length} non-image blocks`
        };
      }

      // Create responsive layout based on number of images
      const responsiveBlocks = this.createResponsiveLayout(imageBlocks, options);

      return {
        success: true,
        message: `Successfully created responsive layout for ${imageBlocks.length} images`,
        blocks: responsiveBlocks
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create responsive image layout: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Align image with text flow
   */
  alignImageWithTextFlow(
    imageBlock: ImageBlock,
    precedingText: string = '',
    followingText: string = '',
    options: Partial<MediaPlacementOptions> = {}
  ): LayoutOperationResult {
    try {
      if (!imageBlock || imageBlock.type !== 'image') {
        return {
          success: false,
          message: 'Invalid image block'
        };
      }

      // Analyze text flow to determine best alignment
      const alignment = this.determineTextFlowAlignment(precedingText, followingText, options);
      
      // Apply alignment to image block
      const alignedImageBlock: ImageBlock = {
        ...imageBlock,
        layout: {
          ...imageBlock.layout,
          alignment: alignment === 'inline' ? 'left' : alignment, // Map 'inline' to 'left'
          float: alignment === 'left' || alignment === 'right' ? alignment : 'none',
          margin: this.getMarginForAlignment(alignment)
        }
      };

      return {
        success: true,
        message: `Successfully aligned image with ${alignment} alignment based on text flow`,
        block: alignedImageBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to align image with text flow: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Check if image placement is optimal
   */
  isOptimalPlacement(
    imageBlock: ImageBlock,
    surroundingBlocks: LayoutBlock[]
  ): { optimal: boolean; issues: string[]; suggestions: string[] } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    if (!imageBlock || imageBlock.type !== 'image') {
      return { optimal: false, issues: ['Invalid image block'], suggestions: [] };
    }

    // Check image size
    const imageWidth = imageBlock.layout?.width || this.config.defaultImageWidth;
    if (imageWidth > this.config.maxImageWidth) {
      issues.push(`Image width (${imageWidth}%) exceeds maximum recommended width (${this.config.maxImageWidth}%)`);
      suggestions.push(`Reduce image width to ${this.config.maxImageWidth}% or less`);
    }

    if (imageWidth < this.config.minImageWidth) {
      issues.push(`Image width (${imageWidth}%) is below minimum recommended width (${this.config.minImageWidth}%)`);
      suggestions.push(`Increase image width to at least ${this.config.minImageWidth}%`);
    }

    // Check alignment
    const alignment = imageBlock.layout?.alignment || this.config.defaultImageAlignment;
    const hasTextBlocks = surroundingBlocks.some(block => 
      block.type === 'paragraph' || block.type === 'heading'
    );

    if (alignment === 'inline' && !hasTextBlocks) {
      issues.push('Inline alignment used but no text blocks found nearby');
      suggestions.push('Consider changing alignment to center or move image closer to text');
    }

    // Check for caption (if auto-add captions is enabled)
    if (this.config.autoAddCaptions && !isFigureBlock(imageBlock)) {
      const hasCaption = surroundingBlocks.some(block => 
        block.type === 'paragraph' && 
        typeof block.content === 'string' &&
        block.content.toLowerCase().includes('caption') ||
        block.content.toLowerCase().includes('figure')
      );

      if (!hasCaption) {
        issues.push('Image lacks a caption');
        suggestions.push('Consider adding a caption to improve accessibility and context');
      }
    }

    return {
      optimal: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Private helper methods
   */

  private calculateOptimalPlacement(
    imageBlock: ImageBlock,
    textBlocks: LayoutBlock[],
    options: Partial<MediaPlacementOptions>
  ): {
    alignment: 'left' | 'right' | 'center' | 'inline';
    width: number;
    position: number;
  } {
    // Simple heuristic based on text block count and content
    const textContentLength = textBlocks.reduce((total, block) => {
      if (block.type === 'paragraph' || block.type === 'heading') {
        return total + (typeof block.content === 'string' ? block.content.length : 0);
      }
      return total;
    }, 0);

    // Determine alignment
    let alignment: 'left' | 'right' | 'center' | 'inline' = options.alignment || this.config.defaultImageAlignment;
    
    if (!options.alignment) {
      // Auto-detect based on context
      if (textContentLength < 500) {
        alignment = 'center'; // Short text, center image
      } else if (textBlocks.length > 3) {
        alignment = textBlocks.length % 2 === 0 ? 'left' : 'right'; // Alternate for multiple blocks
      } else {
        alignment = 'inline'; // Default for moderate text
      }
    }

    // Determine width
    let width = options.width || this.config.defaultImageWidth;
    if (!options.width) {
      if (alignment === 'center') {
        width = Math.min(90, Math.max(60, width)); // Wider for centered
      } else if (alignment === 'inline') {
        width = Math.min(50, Math.max(30, width)); // Narrower for inline
      }
    }

    // Clamp width to config limits
    width = Math.max(this.config.minImageWidth, Math.min(this.config.maxImageWidth, width));

    // Determine position (index where to insert image)
    const position = Math.floor(textBlocks.length / 2); // Middle of text blocks

    return { alignment, width, position };
  }

  private applyPlacementToImage(
    imageBlock: ImageBlock,
    placement: { alignment: 'left' | 'right' | 'center' | 'inline'; width: number },
    options: Partial<MediaPlacementOptions>
  ): ImageBlock {
    // Map 'inline' to 'left' for ColumnAlignment type
    const columnAlignment = placement.alignment === 'inline' ? 'left' : placement.alignment;
    
    return {
      ...imageBlock,
      layout: {
        ...imageBlock.layout,
        alignment: columnAlignment,
        width: placement.width,
        float: placement.alignment === 'left' || placement.alignment === 'right' ? placement.alignment : 'none',
        margin: this.getMarginForAlignment(placement.alignment),
        maintainAspectRatio: options.maintainAspectRatio ?? this.config.maintainAspectRatio
      }
    };
  }

  private arrangeBlocksWithImage(
    imageBlock: ImageBlock,
    textBlocks: LayoutBlock[],
    placement: { alignment: 'left' | 'right' | 'center' | 'inline'; width: number; position: number }
  ): LayoutBlock[] {
    const resultBlocks: LayoutBlock[] = [...textBlocks];
    
    // Insert image at calculated position
    const insertPosition = Math.min(placement.position, resultBlocks.length);
    resultBlocks.splice(insertPosition, 0, imageBlock);

    return resultBlocks;
  }

  private generateCaptionFromContext(
    imageBlock: ImageBlock,
    contextBlocks: LayoutBlock[]
  ): string {
    // Extract alt text from image
    const altText = imageBlock.content.alt || '';
    if (altText && altText.trim().length > 0) {
      return altText;
    }

    // Look for relevant text in context blocks
    const relevantText = contextBlocks
      .filter(block => block.type === 'paragraph' || block.type === 'heading')
      .map(block => {
        if (typeof block.content === 'string') {
          // Extract first sentence or short description
          const sentences = block.content.split(/[.!?]+/);
          return sentences[0]?.trim() || '';
        }
        return '';
      })
      .filter(text => text.length > 0 && text.length < 100)
      .find(text => text.length > 0);

    if (relevantText) {
      return relevantText;
    }

    // Fallback to filename or generic caption
    const src = imageBlock.content.src || '';
    const filename = src.split('/').pop() || src.split('\\').pop() || '';
    if (filename) {
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
      return nameWithoutExt.replace(/[-_]/g, ' ').trim();
    }

    return 'Image';
  }

  private calculateOptimalSize(
    imageBlock: ImageBlock,
    contextBlocks: LayoutBlock[],
    options: Partial<MediaPlacementOptions>
  ): { width: number; maxWidth: number } {
    // Default values
    let width = options.width || this.config.defaultImageWidth;
    const maxWidth = this.config.maxImageWidth;

    // Adjust based on context
    const hasDetailedText = contextBlocks.some(block => {
      if (block.type === 'paragraph' && typeof block.content === 'string') {
        return block.content.length > 200;
      }
      return false;
    });

    const hasMultipleImages = contextBlocks.filter(isImageBlock).length > 0;

    if (hasDetailedText && !hasMultipleImages) {
      // Larger image for detailed text with single image
      width = Math.min(90, Math.max(width, 70));
    } else if (hasMultipleImages) {
      // Smaller images when multiple images present
      width = Math.max(40, Math.min(width, 60));
    }

    // Clamp to config limits
    width = Math.max(this.config.minImageWidth, Math.min(this.config.maxImageWidth, width));

    return { width, maxWidth };
  }

  private createResponsiveLayout(
    imageBlocks: ImageBlock[],
    options: Partial<MediaPlacementOptions>
  ): LayoutBlock[] {
    if (imageBlocks.length === 1) {
      // Single image - use default placement
      const imageBlock = this.applyPlacementToImage(
        imageBlocks[0],
        {
          alignment: options.alignment || 'center',
          width: options.width || this.config.defaultImageWidth
        },
        options
      );
      return [imageBlock];
    }

    if (imageBlocks.length === 2) {
      // Two images - side by side
      return imageBlocks.map((block, index) =>
        this.applyPlacementToImage(
          block,
          {
            alignment: index === 0 ? 'left' : 'right',
            width: 45 // Each takes ~45% width
          },
          options
        )
      );
    }

    // Three or more images - grid layout
    const imagesPerRow = Math.min(3, imageBlocks.length);
    const widthPerImage = Math.floor(95 / imagesPerRow); // ~31% each for 3 columns
    
    return imageBlocks.map((block, index) =>
      this.applyPlacementToImage(
        block,
        {
          alignment: 'center',
          width: widthPerImage
        },
        options
      )
    );
  }

  private determineTextFlowAlignment(
    precedingText: string,
    followingText: string,
    options: Partial<MediaPlacementOptions>
  ): 'left' | 'right' | 'center' | 'inline' {
    // Use provided alignment if specified
    if (options.alignment) {
      return options.alignment;
    }

    // Analyze text to determine optimal alignment
    const precedingLength = precedingText.length;
    const followingLength = followingText.length;
    
    if (precedingLength === 0 && followingLength === 0) {
      return 'center'; // No text, center image
    }
    
    if (precedingLength > followingLength * 2) {
      return 'right'; // More text before, float right
    }
    
    if (followingLength > precedingLength * 2) {
      return 'left'; // More text after, float left
    }
    
    if (precedingLength > 100 && followingLength > 100) {
      return 'inline'; // Balanced text on both sides
    }
    
    return this.config.defaultImageAlignment;
  }

  private getMarginForAlignment(alignment: 'left' | 'right' | 'center' | 'inline'): { top?: number; right?: number; bottom?: number; left?: number } {
    switch (alignment) {
      case 'left':
        return { top: 0, right: this.config.textWrapMargin, bottom: this.config.textWrapMargin, left: 0 };
      case 'right':
        return { top: 0, right: 0, bottom: this.config.textWrapMargin, left: this.config.textWrapMargin };
      case 'center':
        return { top: this.config.textWrapMargin, right: 0, bottom: this.config.textWrapMargin, left: 0 };
      case 'inline':
        return { top: 0, right: this.config.textWrapMargin, bottom: this.config.textWrapMargin, left: this.config.textWrapMargin };
      default:
        return { top: 0, right: 0, bottom: 0, left: 0 };
    }
  }
}

/**
 * Create a default media placement engine instance
 */
export function createMediaPlacementEngine(config: Partial<MediaPlacementEngineConfig> = {}): MediaPlacementEngine {
  return new MediaPlacementEngine(config);
}
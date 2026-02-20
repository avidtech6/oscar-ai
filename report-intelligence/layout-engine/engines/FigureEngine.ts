/**
 * Phase 23: AI Layout Engine - Figure & Caption Engine
 * 
 * Handles image blocks with captions, figure labels and numbering,
 * caption positioning, and figure referencing.
 */

import type {
  LayoutBlock,
  ImageBlock,
  FigureBlock,
  LayoutConfig,
  FigureGenerationOptions,
  LayoutOperationResult
} from '../types';
import { createImageBlock, createFigureBlock, isImageBlock } from '../types';

/**
 * Figure engine configuration
 */
export interface FigureEngineConfig {
  /** Default caption position */
  defaultCaptionPosition: 'above' | 'below' | 'left' | 'right';
  /** Default caption alignment */
  defaultCaptionAlignment: 'left' | 'right' | 'center' | 'justify';
  /** Whether to show figure labels by default */
  showFigureLabels: boolean;
  /** Figure label format (e.g., "Figure {n}") */
  labelFormat: string;
  /** Whether to auto-number figures */
  autoNumberFigures: boolean;
  /** Starting figure number */
  startingFigureNumber: number;
  /** Maximum image width in pixels */
  maxImageWidth: number;
  /** Maximum image height in pixels */
  maxImageHeight: number;
}

/**
 * Default figure engine configuration
 */
export const DEFAULT_FIGURE_ENGINE_CONFIG: FigureEngineConfig = {
  defaultCaptionPosition: 'below',
  defaultCaptionAlignment: 'center',
  showFigureLabels: true,
  labelFormat: 'Figure {n}',
  autoNumberFigures: true,
  startingFigureNumber: 1,
  maxImageWidth: 800,
  maxImageHeight: 600
};

/**
 * Figure engine for managing images with captions
 */
export class FigureEngine {
  private config: FigureEngineConfig;
  private figureCounter: number;

  constructor(config: Partial<FigureEngineConfig> = {}) {
    this.config = { ...DEFAULT_FIGURE_ENGINE_CONFIG, ...config };
    this.figureCounter = this.config.startingFigureNumber;
  }

  /**
   * Convert an image block to a figure block with caption
   */
  addCaptionToImage(
    imageBlock: ImageBlock,
    caption: string,
    options: Partial<FigureGenerationOptions> = {}
  ): LayoutOperationResult {
    try {
      if (!imageBlock || imageBlock.type !== 'image') {
        return {
          success: false,
          message: 'Invalid image block'
        };
      }

      if (!caption || caption.trim().length === 0) {
        return {
          success: false,
          message: 'Caption cannot be empty'
        };
      }

      // Generate figure number if needed
      const figureNumber = this.config.autoNumberFigures ? this.figureCounter++ : undefined;
      const label = options.includeLabel !== false ? 
        this.generateFigureLabel(figureNumber) : 
        undefined;

      // Create figure block
      const figureBlock = createFigureBlock(
        imageBlock,
        caption,
        label,
        {
          layout: {
            captionPosition: options.captionPosition || this.config.defaultCaptionPosition,
            captionAlignment: this.config.defaultCaptionAlignment,
            showLabel: options.includeLabel !== false ? this.config.showFigureLabels : false,
            ...imageBlock.layout
          }
        }
      );

      return {
        success: true,
        message: 'Successfully added caption to image',
        block: figureBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to add caption to image: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Create a figure block from image source and caption
   */
  createFigure(
    imageSrc: string,
    caption: string,
    altText?: string,
    options: Partial<FigureGenerationOptions> = {}
  ): LayoutOperationResult {
    try {
      if (!imageSrc || imageSrc.trim().length === 0) {
        return {
          success: false,
          message: 'Image source cannot be empty'
        };
      }

      if (!caption || caption.trim().length === 0) {
        return {
          success: false,
          message: 'Caption cannot be empty'
        };
      }

      // Create image block
      const imageBlock = createImageBlock(
        imageSrc,
        altText || caption,
        {
          layout: {
            maxWidth: this.config.maxImageWidth,
            maxHeight: this.config.maxImageHeight,
            maintainAspectRatio: true
          }
        }
      );

      // Convert to figure block
      return this.addCaptionToImage(imageBlock, caption, options);
    } catch (error) {
      return {
        success: false,
        message: `Failed to create figure: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Update caption of an existing figure block
   */
  updateCaption(
    figureBlock: FigureBlock,
    newCaption: string,
    options: Partial<FigureGenerationOptions> = {}
  ): LayoutOperationResult {
    try {
      if (!figureBlock || figureBlock.type !== 'figure') {
        return {
          success: false,
          message: 'Invalid figure block'
        };
      }

      if (!newCaption || newCaption.trim().length === 0) {
        return {
          success: false,
          message: 'New caption cannot be empty'
        };
      }

      // Update figure block with new caption
      const updatedFigureBlock: FigureBlock = {
        ...figureBlock,
        content: {
          ...figureBlock.content,
          caption: newCaption
        },
        layout: {
          ...figureBlock.layout,
          captionPosition: options.captionPosition || figureBlock.layout?.captionPosition || this.config.defaultCaptionPosition,
          captionAlignment: figureBlock.layout?.captionAlignment || this.config.defaultCaptionAlignment,
          showLabel: options.includeLabel !== false ?
            (figureBlock.layout?.showLabel ?? this.config.showFigureLabels) :
            false
        }
      };

      return {
        success: true,
        message: 'Successfully updated caption',
        block: updatedFigureBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update caption: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Update figure label/number
   */
  updateFigureLabel(
    figureBlock: FigureBlock,
    newLabel?: string,
    newNumber?: string
  ): LayoutOperationResult {
    try {
      if (!figureBlock || figureBlock.type !== 'figure') {
        return {
          success: false,
          message: 'Invalid figure block'
        };
      }

      // Update figure block with new label/number
      const updatedFigureBlock: FigureBlock = {
        ...figureBlock,
        content: {
          ...figureBlock.content,
          label: newLabel !== undefined ? newLabel : figureBlock.content.label,
          number: newNumber !== undefined ? newNumber : figureBlock.content.number
        }
      };

      return {
        success: true,
        message: 'Successfully updated figure label',
        block: updatedFigureBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update figure label: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Change caption position
   */
  changeCaptionPosition(
    figureBlock: FigureBlock,
    newPosition: 'above' | 'below' | 'left' | 'right'
  ): LayoutOperationResult {
    try {
      if (!figureBlock || figureBlock.type !== 'figure') {
        return {
          success: false,
          message: 'Invalid figure block'
        };
      }

      // Update figure block with new caption position
      const updatedFigureBlock: FigureBlock = {
        ...figureBlock,
        layout: {
          ...figureBlock.layout,
          captionPosition: newPosition
        }
      };

      return {
        success: true,
        message: `Successfully changed caption position to ${newPosition}`,
        block: updatedFigureBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to change caption position: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Extract image from figure block
   */
  extractImageFromFigure(figureBlock: FigureBlock): LayoutOperationResult {
    try {
      if (!figureBlock || figureBlock.type !== 'figure') {
        return {
          success: false,
          message: 'Invalid figure block'
        };
      }

      const imageBlock = figureBlock.content.image;

      return {
        success: true,
        message: 'Successfully extracted image from figure',
        block: imageBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to extract image from figure: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Check if block is suitable for figure conversion
   */
  isSuitableForFigure(block: LayoutBlock): boolean {
    if (!isImageBlock(block)) {
      return false;
    }

    // Check if image has meaningful content
    const imageBlock = block as ImageBlock;
    return !!imageBlock.content.src && imageBlock.content.src.trim().length > 0;
  }

  /**
   * Get suggested caption for image (placeholder)
   */
  suggestCaptionForImage(imageBlock: ImageBlock): string {
    const altText = imageBlock.content.alt || '';
    const src = imageBlock.content.src || '';
    
    if (altText && altText.trim().length > 0) {
      return altText;
    }

    // Extract filename from src as fallback
    const filename = src.split('/').pop() || src.split('\\').pop() || '';
    if (filename) {
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
      return nameWithoutExt.replace(/[-_]/g, ' ').trim();
    }

    return 'Image';
  }

  /**
   * Generate figure references for a list of figure blocks
   */
  generateFigureReferences(figureBlocks: FigureBlock[]): Map<string, string> {
    const references = new Map<string, string>();
    
    figureBlocks.forEach((figureBlock, index) => {
      const figureNumber = this.config.startingFigureNumber + index;
      const label = this.generateFigureLabel(figureNumber);
      references.set(figureBlock.id, label);
    });
    
    return references;
  }

  /**
   * Reset figure counter
   */
  resetFigureCounter(startingNumber: number = this.config.startingFigureNumber): void {
    this.figureCounter = startingNumber;
  }

  /**
   * Get current figure count
   */
  getFigureCount(): number {
    return this.figureCounter - this.config.startingFigureNumber;
  }

  /**
   * Private helper methods
   */

  private generateFigureLabel(figureNumber?: number): string {
    if (!figureNumber) {
      return 'Figure';
    }
    
    return this.config.labelFormat.replace('{n}', figureNumber.toString());
  }

  /**
   * Validate image dimensions against configuration
   */
  private validateImageDimensions(
    width?: number,
    height?: number
  ): { valid: boolean; message?: string; adjustedWidth?: number; adjustedHeight?: number } {
    if (!width || !height) {
      return { valid: true }; // Cannot validate without dimensions
    }

    let adjustedWidth = width;
    let adjustedHeight = height;

    // Check if image exceeds maximum dimensions
    if (width > this.config.maxImageWidth || height > this.config.maxImageHeight) {
      // Calculate scaling factor to fit within max dimensions while maintaining aspect ratio
      const widthScale = this.config.maxImageWidth / width;
      const heightScale = this.config.maxImageHeight / height;
      const scale = Math.min(widthScale, heightScale);

      adjustedWidth = Math.floor(width * scale);
      adjustedHeight = Math.floor(height * scale);

      return {
        valid: true,
        message: `Image dimensions adjusted from ${width}x${height} to ${adjustedWidth}x${adjustedHeight}`,
        adjustedWidth,
        adjustedHeight
      };
    }

    return { valid: true };
  }
}

/**
 * Create a default figure engine instance
 */
export function createFigureEngine(config: Partial<FigureEngineConfig> = {}): FigureEngine {
  return new FigureEngine(config);
}
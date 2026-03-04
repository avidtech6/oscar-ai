import type { LayoutBlock, LayoutConfig } from './LayoutTypes';
import { LayoutBlockSystem } from './LayoutBlockSystem';

/**
 * Figure & caption engine – creates figure blocks, adds captions, labels, and manages figure numbering.
 */
export class FigureCaptionEngine {
  private blockSystem: LayoutBlockSystem;
  private figureCounter: number;

  constructor(blockSystem?: LayoutBlockSystem, startCounter: number = 1) {
    this.blockSystem = blockSystem ?? new LayoutBlockSystem();
    this.figureCounter = startCounter;
  }

  /**
   * Create a figure block with automatic label and caption.
   */
  createFigureBlock(
    mediaId: string,
    caption: string,
    layout?: LayoutConfig
  ): LayoutBlock {
    const label = `Figure ${this.figureCounter}`;
    this.figureCounter++;
    return this.blockSystem.createFigureBlock(mediaId, label, caption, layout);
  }

  /**
   * Create a figure block with a custom label.
   */
  createFigureBlockWithLabel(
    mediaId: string,
    label: string,
    caption: string,
    layout?: LayoutConfig
  ): LayoutBlock {
    return this.blockSystem.createFigureBlock(mediaId, label, caption, layout);
  }

  /**
   * Add a caption to an existing image block, converting it to a figure block.
   */
  addCaptionToImage(
    imageBlock: LayoutBlock,
    caption: string,
    label?: string
  ): LayoutBlock {
    if (imageBlock.type !== 'image') {
      throw new Error('Block is not an image block');
    }
    const mediaId = (imageBlock.content as any).mediaId;
    const finalLabel = label ?? `Figure ${this.figureCounter}`;
    if (!label) this.figureCounter++;
    return this.blockSystem.createFigureBlock(
      mediaId,
      finalLabel,
      caption,
      imageBlock.layout
    );
  }

  /**
   * Update the caption of a figure block.
   */
  updateFigureCaption(
    figureBlock: LayoutBlock,
    newCaption: string
  ): LayoutBlock {
    if (figureBlock.type !== 'figure') {
      throw new Error('Block is not a figure block');
    }
    const content = { ...figureBlock.content, caption: newCaption };
    return this.blockSystem.updateBlock(figureBlock, content);
  }

  /**
   * Update the label of a figure block (e.g., "Figure 3" → "Figure 3A").
   */
  updateFigureLabel(figureBlock: LayoutBlock, newLabel: string): LayoutBlock {
    if (figureBlock.type !== 'figure') {
      throw new Error('Block is not a figure block');
    }
    const content = { ...figureBlock.content, label: newLabel };
    return this.blockSystem.updateBlock(figureBlock, content);
  }

  /**
   * Increment figure counter and return the next label.
   */
  getNextFigureLabel(): string {
    const label = `Figure ${this.figureCounter}`;
    this.figureCounter++;
    return label;
  }

  /**
   * Reset figure counter to a specific number.
   */
  resetCounter(start: number = 1): void {
    this.figureCounter = start;
  }

  /**
   * Scan a list of blocks and renumber figures sequentially.
   * Returns a new array of blocks with updated labels.
   */
  renumberFigures(blocks: LayoutBlock[]): LayoutBlock[] {
    let counter = 1;
    return blocks.map(block => {
      if (block.type === 'figure') {
        const content = { ...block.content, label: `Figure ${counter}` };
        counter++;
        return { ...block, content };
      }
      return block;
    });
  }

  /**
   * Extract all figure references from text blocks (placeholder).
   */
  extractFigureReferences(blocks: LayoutBlock[]): Array<{
    figureId: string;
    referencedIn: string;
  }> {
    const references: Array<{ figureId: string; referencedIn: string }> = [];
    // Simple regex search for "Figure X" in paragraph blocks
    blocks.forEach(block => {
      if (block.type === 'paragraph') {
        const text = (block.content as any).text;
        const matches = text.match(/Figure\s+(\d+)/g);
        if (matches) {
          matches.forEach((match: string) => {
            references.push({
              figureId: match,
              referencedIn: block.id,
            });
          });
        }
      }
    });
    return references;
  }
}
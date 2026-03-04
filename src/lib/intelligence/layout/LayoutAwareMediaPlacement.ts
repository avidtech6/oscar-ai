import type { LayoutBlock, LayoutConfig } from './LayoutTypes';
import { LayoutBlockSystem } from './LayoutBlockSystem';
import type { MediaItem } from '../media/MediaTypes';

/**
 * Layout‑aware media placement – inserts images into layout blocks, places them side‑by‑side, etc.
 */
export class LayoutAwareMediaPlacement {
  private blockSystem: LayoutBlockSystem;

  constructor(blockSystem?: LayoutBlockSystem) {
    this.blockSystem = blockSystem ?? new LayoutBlockSystem();
  }

  /**
   * Insert a media item into a specific block (image or figure block).
   */
  insertMediaIntoBlock(
    block: LayoutBlock,
    media: MediaItem,
    caption?: string
  ): LayoutBlock {
    if (block.type === 'image' || block.type === 'figure') {
      // Update existing image/figure block with new media
      const content = { ...block.content, mediaId: media.id };
      if (caption && block.type === 'figure') {
        content.caption = caption;
      }
      return this.blockSystem.updateBlock(block, content);
    }
    // If block is not an image/figure, convert it? For now, create a new image block.
    return this.blockSystem.createImageBlock(media.id, undefined, caption);
  }

  /**
   * Place two media items side‑by‑side in a two‑column layout.
   */
  placeMediaSideBySide(
    leftMedia: MediaItem,
    rightMedia: MediaItem,
    leftCaption?: string,
    rightCaption?: string,
    layout?: LayoutConfig
  ): LayoutBlock {
    const leftBlock = this.blockSystem.createImageBlock(
      leftMedia.id,
      undefined,
      leftCaption
    );
    const rightBlock = this.blockSystem.createImageBlock(
      rightMedia.id,
      undefined,
      rightCaption
    );
    // Use ColumnEngine (could import, but for simplicity we create directly)
    const columns = [[leftBlock], [rightBlock]];
    return this.blockSystem.createColumnBlock(columns, {
      ...layout,
      columns: 2,
    });
  }

  /**
   * Place media next to a text block (text on left, media on right).
   */
  placeMediaNextToText(
    textBlock: LayoutBlock,
    media: MediaItem,
    caption?: string,
    layout?: LayoutConfig
  ): LayoutBlock {
    const mediaBlock = this.blockSystem.createImageBlock(
      media.id,
      undefined,
      caption
    );
    const columns = [[textBlock], [mediaBlock]];
    return this.blockSystem.createColumnBlock(columns, {
      ...layout,
      columns: 2,
    });
  }

  /**
   * Replace an existing image in a block with a new media item.
   */
  replaceMediaInBlock(
    block: LayoutBlock,
    newMedia: MediaItem
  ): LayoutBlock {
    if (block.type !== 'image' && block.type !== 'figure') {
      throw new Error('Block is not an image or figure block');
    }
    const content = { ...block.content, mediaId: newMedia.id };
    return this.blockSystem.updateBlock(block, content);
  }

  /**
   * Resize an image block by adjusting its layout width.
   */
  resizeImageBlock(
    block: LayoutBlock,
    widthPercent: number
  ): LayoutBlock {
    if (block.type !== 'image' && block.type !== 'figure') {
      throw new Error('Block is not an image or figure block');
    }
    if (widthPercent < 0 || widthPercent > 100) {
      throw new Error('Width must be between 0 and 100');
    }
    const layout: LayoutConfig = {
      ...block.layout,
      width: widthPercent,
    };
    return this.blockSystem.updateBlockLayout(block, layout);
  }

  /**
   * Align an image block (left, right, center).
   */
  alignImageBlock(
    block: LayoutBlock,
    alignment: 'left' | 'right' | 'center'
  ): LayoutBlock {
    if (block.type !== 'image' && block.type !== 'figure') {
      throw new Error('Block is not an image or figure block');
    }
    const layout: LayoutConfig = {
      ...block.layout,
      alignment,
    };
    return this.blockSystem.updateBlockLayout(block, layout);
  }

  /**
   * Create a two‑column image layout from an array of media items.
   */
  createTwoColumnImageLayout(
    mediaItems: MediaItem[],
    captions?: string[],
    layout?: LayoutConfig
  ): LayoutBlock {
    const columns: LayoutBlock[][] = [[], []];
    mediaItems.forEach((media, idx) => {
      const colIndex = idx % 2;
      const caption = captions?.[idx];
      const block = this.blockSystem.createImageBlock(
        media.id,
        undefined,
        caption
      );
      columns[colIndex].push(block);
    });
    return this.blockSystem.createColumnBlock(columns, {
      ...layout,
      columns: 2,
    });
  }

  /**
   * Extract all media IDs from layout blocks.
   */
  extractMediaIds(blocks: LayoutBlock[]): string[] {
    const ids: string[] = [];
    blocks.forEach(block => {
      if (block.type === 'image' || block.type === 'figure') {
        const mediaId = (block.content as any).mediaId;
        if (mediaId) ids.push(mediaId);
      }
      if (block.type === 'columns') {
        const columns = (block.content as any).columns as LayoutBlock[][];
        columns.flat().forEach(child => {
          if (child.type === 'image' || child.type === 'figure') {
            const mediaId = (child.content as any).mediaId;
            if (mediaId) ids.push(mediaId);
          }
        });
      }
    });
    return ids;
  }
}
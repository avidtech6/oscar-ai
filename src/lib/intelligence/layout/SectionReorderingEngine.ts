import type { LayoutBlock } from './LayoutTypes';

/**
 * Section reordering engine – moves, merges, splits, and reorders sections (blocks).
 */
export class SectionReorderingEngine {
  /**
   * Move a block within a list of blocks.
   */
  moveBlock(
    blocks: LayoutBlock[],
    blockId: string,
    newIndex: number
  ): LayoutBlock[] {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index === -1) {
      throw new Error(`Block with ID ${blockId} not found`);
    }
    if (newIndex < 0 || newIndex >= blocks.length) {
      throw new Error('New index out of bounds');
    }
    const block = blocks[index];
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    newBlocks.splice(newIndex, 0, block);
    return newBlocks;
  }

  /**
   * Move a block up one position.
   */
  moveBlockUp(blocks: LayoutBlock[], blockId: string): LayoutBlock[] {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index === -1) {
      throw new Error(`Block with ID ${blockId} not found`);
    }
    if (index === 0) return blocks; // already at top
    return this.moveBlock(blocks, blockId, index - 1);
  }

  /**
   * Move a block down one position.
   */
  moveBlockDown(blocks: LayoutBlock[], blockId: string): LayoutBlock[] {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index === -1) {
      throw new Error(`Block with ID ${blockId} not found`);
    }
    if (index === blocks.length - 1) return blocks; // already at bottom
    return this.moveBlock(blocks, blockId, index + 1);
  }

  /**
   * Insert a new block at a specific position.
   */
  insertBlock(
    blocks: LayoutBlock[],
    block: LayoutBlock,
    index: number
  ): LayoutBlock[] {
    if (index < 0 || index > blocks.length) {
      throw new Error('Index out of bounds');
    }
    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, block);
    return newBlocks;
  }

  /**
   * Delete a block by ID.
   */
  deleteBlock(blocks: LayoutBlock[], blockId: string): LayoutBlock[] {
    return blocks.filter(b => b.id !== blockId);
  }

  /**
   * Merge two consecutive blocks into a single block (placeholder).
   * Currently only works for paragraph blocks.
   */
  mergeBlocks(
    blocks: LayoutBlock[],
    firstBlockId: string,
    secondBlockId: string
  ): LayoutBlock[] {
    const firstIndex = blocks.findIndex(b => b.id === firstBlockId);
    const secondIndex = blocks.findIndex(b => b.id === secondBlockId);
    if (firstIndex === -1 || secondIndex === -1) {
      throw new Error('One or both blocks not found');
    }
    if (Math.abs(firstIndex - secondIndex) !== 1) {
      throw new Error('Blocks are not consecutive');
    }
    const first = blocks[firstIndex];
    const second = blocks[secondIndex];
    // Only merge paragraphs for now
    if (first.type === 'paragraph' && second.type === 'paragraph') {
      const mergedText =
        (first.content as any).text + ' ' + (second.content as any).text;
      const mergedBlock: LayoutBlock = {
        ...first,
        content: { text: mergedText },
        metadata: {
          ...first.metadata,
          mergedFrom: [first.id, second.id],
        },
      };
      const newBlocks = [...blocks];
      // Replace first block with merged block, remove second
      newBlocks.splice(firstIndex, 1, mergedBlock);
      newBlocks.splice(secondIndex, 1);
      return newBlocks;
    }
    // For other types, just keep them separate (could be improved)
    return blocks;
  }

  /**
   * Split a block into two blocks at a given character position.
   */
  splitBlock(
    blocks: LayoutBlock[],
    blockId: string,
    splitPosition: number
  ): LayoutBlock[] {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index === -1) {
      throw new Error(`Block with ID ${blockId} not found`);
    }
    const block = blocks[index];
    // Only support paragraph splitting for now
    if (block.type === 'paragraph') {
      const text = (block.content as any).text;
      if (splitPosition < 0 || splitPosition > text.length) {
        throw new Error('Split position out of bounds');
      }
      const firstPart = text.substring(0, splitPosition);
      const secondPart = text.substring(splitPosition);
      const firstBlock: LayoutBlock = {
        ...block,
        id: crypto.randomUUID(),
        content: { text: firstPart },
      };
      const secondBlock: LayoutBlock = {
        ...block,
        id: crypto.randomUUID(),
        content: { text: secondPart },
      };
      const newBlocks = [...blocks];
      newBlocks.splice(index, 1, firstBlock, secondBlock);
      return newBlocks;
    }
    // For other block types, duplicate the block (placeholder)
    const duplicate: LayoutBlock = {
      ...block,
      id: crypto.randomUUID(),
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, duplicate);
    return newBlocks;
  }

  /**
   * Reorder blocks based on a custom ordering function.
   */
  reorderBlocks(
    blocks: LayoutBlock[],
    compareFn: (a: LayoutBlock, b: LayoutBlock) => number
  ): LayoutBlock[] {
    return [...blocks].sort(compareFn);
  }

  /**
   * Group consecutive blocks of the same type into a section (placeholder).
   */
  groupBlocksByType(blocks: LayoutBlock[]): LayoutBlock[][] {
    const groups: LayoutBlock[][] = [];
    let currentGroup: LayoutBlock[] = [];
    let currentType: string | null = null;

    blocks.forEach(block => {
      if (currentType === null || block.type === currentType) {
        currentGroup.push(block);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [block];
      }
      currentType = block.type;
    });
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    return groups;
  }

  /**
   * Find a block by ID and return its index.
   */
  findBlockIndex(blocks: LayoutBlock[], blockId: string): number {
    return blocks.findIndex(b => b.id === blockId);
  }
}
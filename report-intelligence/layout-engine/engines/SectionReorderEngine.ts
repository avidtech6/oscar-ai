/**
 * Phase 23: AI Layout Engine - Section Reordering Engine
 * 
 * Handles moving sections up/down, reordering report structures,
 * and maintaining logical flow.
 */

import type {
  LayoutBlock,
  LayoutOperationResult
} from '../types';

/**
 * Section reordering engine configuration
 */
export interface SectionReorderEngineConfig {
  /** Whether to validate section hierarchy during reordering */
  validateHierarchy: boolean;
  /** Whether to maintain heading levels during reordering */
  maintainHeadingLevels: boolean;
  /** Maximum nesting depth for sections */
  maxNestingDepth: number;
  /** Whether to update cross-references after reordering */
  updateCrossReferences: boolean;
}

/**
 * Default section reordering engine configuration
 */
export const DEFAULT_SECTION_REORDER_ENGINE_CONFIG: SectionReorderEngineConfig = {
  validateHierarchy: true,
  maintainHeadingLevels: true,
  maxNestingDepth: 6,
  updateCrossReferences: true
};

/**
 * Section reordering result
 */
export interface SectionReorderResult extends LayoutOperationResult {
  /** New order of blocks */
  newOrder?: LayoutBlock[];
  /** Mapping of old positions to new positions */
  positionMap?: Map<number, number>;
}

/**
 * Section reordering engine for managing block order and hierarchy
 */
export class SectionReorderEngine {
  private config: SectionReorderEngineConfig;

  constructor(config: Partial<SectionReorderEngineConfig> = {}) {
    this.config = { ...DEFAULT_SECTION_REORDER_ENGINE_CONFIG, ...config };
  }

  /**
   * Move a block up in the order
   */
  moveBlockUp(
    blocks: LayoutBlock[],
    blockIndex: number,
    moveCount: number = 1
  ): SectionReorderResult {
    try {
      if (!blocks || blocks.length === 0) {
        return {
          success: false,
          message: 'No blocks provided'
        };
      }

      if (blockIndex < 0 || blockIndex >= blocks.length) {
        return {
          success: false,
          message: `Invalid block index: ${blockIndex}`
        };
      }

      if (moveCount < 1) {
        return {
          success: false,
          message: `Invalid move count: ${moveCount}`
        };
      }

      // Calculate new position
      const newIndex = Math.max(0, blockIndex - moveCount);
      
      // If already at the top, return as-is
      if (newIndex === blockIndex) {
        return {
          success: true,
          message: 'Block is already at the top',
          blocks: [...blocks],
          positionMap: new Map([[blockIndex, blockIndex]])
        };
      }

      // Create new block order
      const newBlocks = [...blocks];
      const blockToMove = newBlocks[blockIndex];
      
      // Remove block from old position
      newBlocks.splice(blockIndex, 1);
      // Insert block at new position
      newBlocks.splice(newIndex, 0, blockToMove);

      // Create position map
      const positionMap = new Map<number, number>();
      for (let i = 0; i < blocks.length; i++) {
        if (i === blockIndex) {
          positionMap.set(i, newIndex);
        } else if (i >= newIndex && i < blockIndex) {
          positionMap.set(i, i + 1);
        } else if (i > blockIndex && i <= newIndex) {
          positionMap.set(i, i - 1);
        } else {
          positionMap.set(i, i);
        }
      }

      return {
        success: true,
        message: `Successfully moved block from position ${blockIndex} to ${newIndex}`,
        blocks: newBlocks,
        positionMap
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to move block up: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Move a block down in the order
   */
  moveBlockDown(
    blocks: LayoutBlock[],
    blockIndex: number,
    moveCount: number = 1
  ): SectionReorderResult {
    try {
      if (!blocks || blocks.length === 0) {
        return {
          success: false,
          message: 'No blocks provided'
        };
      }

      if (blockIndex < 0 || blockIndex >= blocks.length) {
        return {
          success: false,
          message: `Invalid block index: ${blockIndex}`
        };
      }

      if (moveCount < 1) {
        return {
          success: false,
          message: `Invalid move count: ${moveCount}`
        };
      }

      // Calculate new position
      const newIndex = Math.min(blocks.length - 1, blockIndex + moveCount);
      
      // If already at the bottom, return as-is
      if (newIndex === blockIndex) {
        return {
          success: true,
          message: 'Block is already at the bottom',
          blocks: [...blocks],
          positionMap: new Map([[blockIndex, blockIndex]])
        };
      }

      // Create new block order
      const newBlocks = [...blocks];
      const blockToMove = newBlocks[blockIndex];
      
      // Remove block from old position
      newBlocks.splice(blockIndex, 1);
      // Insert block at new position
      newBlocks.splice(newIndex, 0, blockToMove);

      // Create position map
      const positionMap = new Map<number, number>();
      for (let i = 0; i < blocks.length; i++) {
        if (i === blockIndex) {
          positionMap.set(i, newIndex);
        } else if (i > blockIndex && i <= newIndex) {
          positionMap.set(i, i - 1);
        } else if (i >= newIndex && i < blockIndex) {
          positionMap.set(i, i + 1);
        } else {
          positionMap.set(i, i);
        }
      }

      return {
        success: true,
        message: `Successfully moved block from position ${blockIndex} to ${newIndex}`,
        blocks: newBlocks,
        positionMap
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to move block down: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Reorder blocks based on a new order array
   */
  reorderBlocks(
    blocks: LayoutBlock[],
    newOrder: number[]
  ): SectionReorderResult {
    try {
      if (!blocks || blocks.length === 0) {
        return {
          success: false,
          message: 'No blocks provided'
        };
      }

      if (!newOrder || newOrder.length !== blocks.length) {
        return {
          success: false,
          message: `Invalid new order array. Expected length ${blocks.length}, got ${newOrder?.length || 0}`
        };
      }

      // Validate new order contains all indices exactly once
      const sortedNewOrder = [...newOrder].sort((a, b) => a - b);
      const isValidOrder = sortedNewOrder.every((value, index) => value === index);
      
      if (!isValidOrder) {
        return {
          success: false,
          message: 'New order array must contain all indices from 0 to n-1 exactly once'
        };
      }

      // Reorder blocks
      const reorderedBlocks = newOrder.map(index => blocks[index]);

      // Create position map
      const positionMap = new Map<number, number>();
      newOrder.forEach((newIndex, oldIndex) => {
        positionMap.set(oldIndex, newIndex);
      });

      return {
        success: true,
        message: `Successfully reordered ${blocks.length} blocks`,
        blocks: reorderedBlocks,
        positionMap
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to reorder blocks: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Swap two blocks
   */
  swapBlocks(
    blocks: LayoutBlock[],
    index1: number,
    index2: number
  ): SectionReorderResult {
    try {
      if (!blocks || blocks.length === 0) {
        return {
          success: false,
          message: 'No blocks provided'
        };
      }

      if (index1 < 0 || index1 >= blocks.length || index2 < 0 || index2 >= blocks.length) {
        return {
          success: false,
          message: `Invalid indices: ${index1}, ${index2}`
        };
      }

      if (index1 === index2) {
        return {
          success: true,
          message: 'Blocks are already at the same position',
          blocks: [...blocks],
          positionMap: new Map([[index1, index1], [index2, index2]])
        };
      }

      // Create new block order with swapped positions
      const newBlocks = [...blocks];
      const temp = newBlocks[index1];
      newBlocks[index1] = newBlocks[index2];
      newBlocks[index2] = temp;

      // Create position map
      const positionMap = new Map<number, number>();
      for (let i = 0; i < blocks.length; i++) {
        if (i === index1) {
          positionMap.set(i, index2);
        } else if (i === index2) {
          positionMap.set(i, index1);
        } else {
          positionMap.set(i, i);
        }
      }

      return {
        success: true,
        message: `Successfully swapped blocks at positions ${index1} and ${index2}`,
        blocks: newBlocks,
        positionMap
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to swap blocks: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Group related blocks into sections
   */
  groupIntoSections(
    blocks: LayoutBlock[],
    sectionBoundaries: number[]
  ): SectionReorderResult {
    try {
      if (!blocks || blocks.length === 0) {
        return {
          success: false,
          message: 'No blocks provided'
        };
      }

      if (!sectionBoundaries || sectionBoundaries.length === 0) {
        return {
          success: false,
          message: 'No section boundaries provided'
        };
      }

      // Validate section boundaries
      const sortedBoundaries = [...sectionBoundaries].sort((a, b) => a - b);
      if (sortedBoundaries[0] < 0 || sortedBoundaries[sortedBoundaries.length - 1] >= blocks.length) {
        return {
          success: false,
          message: 'Section boundaries must be within block indices range'
        };
      }

      // Group blocks by sections
      const sections: LayoutBlock[][] = [];
      let startIndex = 0;
      
      for (const boundary of sortedBoundaries) {
        if (boundary > startIndex) {
          sections.push(blocks.slice(startIndex, boundary));
          startIndex = boundary;
        }
      }
      
      // Add remaining blocks as last section
      if (startIndex < blocks.length) {
        sections.push(blocks.slice(startIndex));
      }

      // Flatten sections (no actual reordering, just grouping for analysis)
      const groupedBlocks = sections.flat();

      return {
        success: true,
        message: `Successfully grouped ${blocks.length} blocks into ${sections.length} sections`,
        blocks: groupedBlocks,
        positionMap: new Map(blocks.map((_, index) => [index, index]))
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to group blocks into sections: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Validate section hierarchy
   */
  validateSectionHierarchy(blocks: LayoutBlock[]): {
    valid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    if (!blocks || blocks.length === 0) {
      return { valid: true, issues, suggestions };
    }

    // Check for heading level progression
    let currentHeadingLevel = 0;
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      
      if (block.type === 'heading') {
        const headingBlock = block as any; // Cast to access level
        const level = headingBlock.level || 1;
        
        // Check for heading level jumps (more than 1 level increase)
        if (level > currentHeadingLevel + 1 && currentHeadingLevel > 0) {
          issues.push(`Heading at position ${i} jumps from level ${currentHeadingLevel} to level ${level}`);
          suggestions.push(`Consider adding intermediate heading at level ${currentHeadingLevel + 1}`);
        }
        
        currentHeadingLevel = level;
      }
    }

    // Check for proper section nesting
    const nestingStack: number[] = [];
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      
      if (block.type === 'heading') {
        const headingBlock = block as any;
        const level = headingBlock.level || 1;
        
        // Pop higher or equal level headings from stack
        while (nestingStack.length > 0 && nestingStack[nestingStack.length - 1] >= level) {
          nestingStack.pop();
        }
        
        nestingStack.push(level);
        
        // Check nesting depth
        if (nestingStack.length > this.config.maxNestingDepth) {
          issues.push(`Heading at position ${i} exceeds maximum nesting depth of ${this.config.maxNestingDepth}`);
          suggestions.push('Consider flattening the document structure');
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Get suggested reordering based on content analysis
   */
  suggestReordering(blocks: LayoutBlock[]): {
    suggestedOrder: number[];
    reasoning: string[];
  } {
    const suggestedOrder = blocks.map((_, index) => index);
    const reasoning: string[] = [];

    if (!blocks || blocks.length <= 1) {
      return { suggestedOrder, reasoning };
    }

    // Simple heuristic: group similar block types together
    const typeGroups: Record<string, number[]> = {};
    
    blocks.forEach((block, index) => {
      const type = block.type;
      if (!typeGroups[type]) {
        typeGroups[type] = [];
      }
      typeGroups[type].push(index);
    });

    // Create new order by block type groups
    const newOrder: number[] = [];
    const typePriority = ['heading', 'paragraph', 'image', 'figure', 'table', 'list', 'code', 'columns', 'quote'];
    
    typePriority.forEach(type => {
      if (typeGroups[type]) {
        newOrder.push(...typeGroups[type]);
      }
    });

    // Add any remaining types not in priority list
    Object.keys(typeGroups).forEach(type => {
      if (!typePriority.includes(type)) {
        newOrder.push(...typeGroups[type]);
      }
    });

    if (newOrder.length === blocks.length) {
      reasoning.push('Grouped blocks by type for better visual consistency');
      return { suggestedOrder: newOrder, reasoning };
    }

    return { suggestedOrder, reasoning: ['No significant reordering suggestions'] };
  }

  /**
   * Calculate block dependencies
   */
  calculateDependencies(blocks: LayoutBlock[]): Map<number, number[]> {
    const dependencies = new Map<number, number[]>();
    
    if (!blocks || blocks.length === 0) {
      return dependencies;
    }

    // Simple dependency detection based on content references
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const blockDeps: number[] = [];

      // Check for references to other blocks
      if (block.type === 'figure' || block.type === 'table') {
        // Figures and tables often reference preceding content
        for (let j = Math.max(0, i - 3); j < i; j++) {
          if (blocks[j].type === 'paragraph' || blocks[j].type === 'heading') {
            blockDeps.push(j);
          }
        }
      }

      if (blockDeps.length > 0) {
        dependencies.set(i, blockDeps);
      }
    }

    return dependencies;
  }
}

/**
 * Create a default section reordering engine instance
 */
export function createSectionReorderEngine(config: Partial<SectionReorderEngineConfig> = {}): SectionReorderEngine {
  return new SectionReorderEngine(config);
}
import type { LayoutBlock } from '../layout/LayoutTypes';
import type { DocumentStructure, StructuralSuggestion } from './DocumentTypes';
import { DocumentStructureAnalysisEngine } from './DocumentStructureAnalysisEngine';

/**
 * Structural optimisation engine – reorders, merges, splits sections, improves heading hierarchy.
 */
export class StructuralOptimisationEngine {
  private structureEngine: DocumentStructureAnalysisEngine;

  constructor() {
    this.structureEngine = new DocumentStructureAnalysisEngine();
  }

  /**
   * Analyse the document and return structural suggestions.
   */
  analyse(blocks: LayoutBlock[]): StructuralSuggestion[] {
    const structure = this.structureEngine.analyse(blocks);
    const suggestions: StructuralSuggestion[] = [];

    // 1. Suggest merging short sections
    suggestions.push(...this.suggestMerges(structure));

    // 2. Suggest splitting long sections
    suggestions.push(...this.suggestSplits(structure));

    // 3. Suggest reordering sections for better flow
    suggestions.push(...this.suggestReordering(structure));

    // 4. Suggest inserting missing sections
    suggestions.push(...this.suggestInsertions(structure));

    // 5. Suggest improving heading hierarchy
    suggestions.push(...this.suggestHeadingHierarchy(structure));

    return suggestions;
  }

  /**
   * Apply a structural suggestion to the blocks.
   */
  apply(suggestion: StructuralSuggestion, blocks: LayoutBlock[]): LayoutBlock[] {
    switch (suggestion.type) {
      case 'merge':
        return this.applyMerge(suggestion, blocks);
      case 'split':
        return this.applySplit(suggestion, blocks);
      case 'reorder':
        return this.applyReorder(suggestion, blocks);
      case 'insert':
        return this.applyInsert(suggestion, blocks);
      case 'rename':
        return this.applyRename(suggestion, blocks);
      default:
        console.warn(`Unknown suggestion type: ${(suggestion as any).type}`);
        return blocks;
    }
  }

  /**
   * Apply multiple suggestions in sequence.
   */
  applyAll(suggestions: StructuralSuggestion[], blocks: LayoutBlock[]): LayoutBlock[] {
    let result = [...blocks];
    for (const suggestion of suggestions) {
      result = this.apply(suggestion, result);
    }
    return result;
  }

  // --- Suggestion generators ---

  private suggestMerges(structure: DocumentStructure): StructuralSuggestion[] {
    const suggestions: StructuralSuggestion[] = [];
    const sections = structure.sections;

    // Find consecutive sections that are very short (≤2 blocks each)
    for (let i = 0; i < sections.length - 1; i++) {
      const a = sections[i];
      const b = sections[i + 1];
      if (a.blocks.length <= 2 && b.blocks.length <= 2) {
        suggestions.push({
          type: 'merge',
          sectionId: a.id,
          targetSectionId: b.id,
          reason: 'Both sections are very short; merging improves flow.',
        });
      }
    }

    return suggestions;
  }

  private suggestSplits(structure: DocumentStructure): StructuralSuggestion[] {
    const suggestions: StructuralSuggestion[] = [];
    const sections = structure.sections;

    // Find sections with many blocks (>10) that could be split
    sections.forEach(section => {
      if (section.blocks.length > 10) {
        suggestions.push({
          type: 'split',
          sectionId: section.id,
          reason: 'Section is long; consider splitting into subtopics.',
        });
      }
    });

    return suggestions;
  }

  private suggestReordering(structure: DocumentStructure): StructuralSuggestion[] {
    const suggestions: StructuralSuggestion[] = [];
    const sections = structure.sections;

    // Check if conclusion appears before body
    const conclusionIndex = sections.findIndex(s =>
      s.title.toLowerCase().includes('conclusion')
    );
    const bodyIndex = sections.findIndex(s =>
      s.title.toLowerCase().includes('body') ||
      s.title.toLowerCase().includes('methodology')
    );
    if (conclusionIndex >= 0 && bodyIndex >= 0 && conclusionIndex < bodyIndex) {
      suggestions.push({
        type: 'reorder',
        sectionId: sections[conclusionIndex].id,
        targetSectionId: sections[bodyIndex].id,
        reason: 'Conclusion appears before body; recommend moving conclusion to the end.',
      });
    }

    // Check if references appear before appendix
    const refIndex = sections.findIndex(s => s.title.toLowerCase().includes('reference'));
    const appendixIndex = sections.findIndex(s => s.title.toLowerCase().includes('appendix'));
    if (refIndex >= 0 && appendixIndex >= 0 && refIndex > appendixIndex) {
      suggestions.push({
        type: 'reorder',
        sectionId: sections[refIndex].id,
        targetSectionId: sections[appendixIndex].id,
        reason: 'References should appear after appendix.',
      });
    }

    return suggestions;
  }

  private suggestInsertions(structure: DocumentStructure): StructuralSuggestion[] {
    const suggestions: StructuralSuggestion[] = [];
    const presentSections = structure.sections.map(s => s.title.toLowerCase());

    // Suggest missing standard sections
    const expected = ['introduction', 'conclusion', 'references', 'appendix'];
    for (const expectedSection of expected) {
      if (!presentSections.includes(expectedSection)) {
        suggestions.push({
          type: 'insert',
          newTitle: expectedSection.charAt(0).toUpperCase() + expectedSection.slice(1),
          reason: `Document lacks a ${expectedSection} section.`,
        });
      }
    }

    return suggestions;
  }

  private suggestHeadingHierarchy(structure: DocumentStructure): StructuralSuggestion[] {
    const suggestions: StructuralSuggestion[] = [];
    const headings = structure.headings;

    // Detect heading level jumps (e.g., h1 → h3)
    for (let i = 1; i < headings.length; i++) {
      const prev = headings[i - 1];
      const curr = headings[i];
      const diff = curr.level - prev.level;
      if (diff > 1) {
        suggestions.push({
          type: 'rename',
          sectionId: curr.blockId,
          newTitle: curr.text, // same title but we could suggest a level change
          reason: `Heading level jumps from ${prev.level} to ${curr.level}. Consider adjusting hierarchy.`,
        });
      }
    }

    // Detect inconsistent heading styles (e.g., some headings end with a period)
    headings.forEach(h => {
      if (h.text.endsWith('.')) {
        suggestions.push({
          type: 'rename',
          sectionId: h.blockId,
          newTitle: h.text.slice(0, -1),
          reason: 'Heading should not end with a period.',
        });
      }
    });

    return suggestions;
  }

  // --- Apply implementations (simplified placeholders) ---

  private applyMerge(suggestion: StructuralSuggestion, blocks: LayoutBlock[]): LayoutBlock[] {
    // In a real implementation, you'd merge the blocks of two sections.
    // For now, we just return the original blocks unchanged.
    console.log(`Would merge sections ${suggestion.sectionId} and ${suggestion.targetSectionId}`);
    return blocks;
  }

  private applySplit(suggestion: StructuralSuggestion, blocks: LayoutBlock[]): LayoutBlock[] {
    console.log(`Would split section ${suggestion.sectionId}`);
    return blocks;
  }

  private applyReorder(suggestion: StructuralSuggestion, blocks: LayoutBlock[]): LayoutBlock[] {
    console.log(`Would reorder section ${suggestion.sectionId} to before ${suggestion.targetSectionId}`);
    return blocks;
  }

  private applyInsert(suggestion: StructuralSuggestion, blocks: LayoutBlock[]): LayoutBlock[] {
    // Insert a new heading block at the appropriate position
    const newBlock: LayoutBlock = {
      id: `inserted-${Date.now()}`,
      type: 'heading',
      content: {
        text: suggestion.newTitle || 'New Section',
        level: 2,
      },
    };
    // Insert at the end for simplicity
    return [...blocks, newBlock];
  }

  private applyRename(suggestion: StructuralSuggestion, blocks: LayoutBlock[]): LayoutBlock[] {
    // Rename the heading block
    return blocks.map(block => {
      if (block.id === suggestion.sectionId && block.type === 'heading') {
        return {
          ...block,
          content: { ...(block.content as any), text: suggestion.newTitle || block.content.text },
        };
      }
      return block;
    });
  }

  /**
   * Generate a preview of the optimised structure (without applying).
   */
  preview(blocks: LayoutBlock[], suggestions: StructuralSuggestion[]): LayoutBlock[] {
    // Simulate applying suggestions to a copy
    let preview = [...blocks];
    for (const suggestion of suggestions) {
      preview = this.apply(suggestion, preview);
    }
    return preview;
  }
}
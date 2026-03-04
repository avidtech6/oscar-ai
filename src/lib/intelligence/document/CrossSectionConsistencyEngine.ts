import type { LayoutBlock } from '../layout/LayoutTypes';
import type { DocumentStructure, Inconsistency } from './DocumentTypes';
import { DocumentStructureAnalysisEngine } from './DocumentStructureAnalysisEngine';

/**
 * Cross‑section consistency engine – detects contradictions, repetitions, missing info,
 * inconsistent terminology, tone, formatting, and numbering.
 */
export class CrossSectionConsistencyEngine {
  private structureEngine: DocumentStructureAnalysisEngine;

  constructor() {
    this.structureEngine = new DocumentStructureAnalysisEngine();
  }

  /**
   * Detect inconsistencies across the entire document.
   */
  detect(blocks: LayoutBlock[]): Inconsistency[] {
    const structure = this.structureEngine.analyse(blocks);
    const inconsistencies: Inconsistency[] = [];

    // 1. Detect contradictions
    inconsistencies.push(...this.detectContradictions(structure));

    // 2. Detect repetitions
    inconsistencies.push(...this.detectRepetitions(structure));

    // 3. Detect missing information
    inconsistencies.push(...this.detectMissingInfo(structure));

    // 4. Detect inconsistent terminology
    inconsistencies.push(...this.detectTerminologyInconsistencies(structure));

    // 5. Detect tone inconsistencies
    inconsistencies.push(...this.detectToneInconsistencies(structure));

    // 6. Detect formatting inconsistencies
    inconsistencies.push(...this.detectFormattingInconsistencies(structure));

    // 7. Detect numbering inconsistencies
    inconsistencies.push(...this.detectNumberingInconsistencies(structure));

    return inconsistencies;
  }

  /**
   * Detect contradictions (e.g., "good condition" vs "poor condition").
   */
  private detectContradictions(structure: DocumentStructure): Inconsistency[] {
    const inconsistencies: Inconsistency[] = [];
    const phrases: Array<{ text: string; blockId: string; sectionId?: string }> = [];

    // Extract key phrases from paragraphs (simplified)
    structure.blocks.forEach(block => {
      if (block.type === 'paragraph') {
        const content = block.content as any;
        const text = content.text.toLowerCase();
        // Naive detection: look for contradictory adjectives
        if (text.includes('good condition') && text.includes('poor condition')) {
          // This is a self‑contradiction within the same block
          inconsistencies.push({
            type: 'contradiction',
            severity: 'high',
            location: { blockId: block.id, text: content.text },
            description: 'Block contains contradictory statements about condition.',
            suggestion: 'Clarify whether the condition is good or poor.',
          });
        }
        phrases.push({ text, blockId: block.id });
      }
    });

    // Cross‑block contradiction detection (simplified)
    // In a real implementation, you'd use NLP to compare semantic meaning.
    // For now, we just flag if the same subject appears with opposite adjectives.
    const subject = 'tree';
    const goodBlocks = phrases.filter(p => p.text.includes(`${subject} is good`));
    const poorBlocks = phrases.filter(p => p.text.includes(`${subject} is poor`));
    if (goodBlocks.length > 0 && poorBlocks.length > 0) {
      inconsistencies.push({
        type: 'contradiction',
        severity: 'high',
        location: { blockId: goodBlocks[0].blockId },
        description: `Different sections describe "${subject}" as both good and poor.`,
        suggestion: 'Review and align the description of the subject.',
      });
    }

    return inconsistencies;
  }

  /**
   * Detect repeated information across sections.
   */
  private detectRepetitions(structure: DocumentStructure): Inconsistency[] {
    const inconsistencies: Inconsistency[] = [];
    const seenPhrases = new Map<string, { blockId: string; count: number }>();

    structure.blocks.forEach(block => {
      if (block.type === 'paragraph') {
        const content = block.content as any;
        const text = content.text.trim();
        // Simple exact‑match detection (in reality you'd use fuzzy matching)
        if (seenPhrases.has(text)) {
          const existing = seenPhrases.get(text)!;
          existing.count++;
          if (existing.count === 2) {
            // Only flag on the second occurrence
            inconsistencies.push({
              type: 'repetition',
              severity: 'medium',
              location: { blockId: block.id, text },
              description: 'Same paragraph appears multiple times.',
              suggestion: 'Consider merging or removing duplicate content.',
            });
          }
        } else {
          seenPhrases.set(text, { blockId: block.id, count: 1 });
        }
      }
    });

    return inconsistencies;
  }

  /**
   * Detect missing information (e.g., missing sections, incomplete data).
   */
  private detectMissingInfo(structure: DocumentStructure): Inconsistency[] {
    const inconsistencies: Inconsistency[] = [];

    // Check for missing introduction/conclusion (simplified)
    const hasIntroduction = structure.headings.some(h =>
      h.text.toLowerCase().includes('introduction')
    );
    const hasConclusion = structure.headings.some(h =>
      h.text.toLowerCase().includes('conclusion')
    );

    if (!hasIntroduction) {
      inconsistencies.push({
        type: 'missing_info',
        severity: 'medium',
        location: {},
        description: 'Document lacks an introduction section.',
        suggestion: 'Add an introductory paragraph.',
      });
    }
    if (!hasConclusion) {
      inconsistencies.push({
        type: 'missing_info',
        severity: 'medium',
        location: {},
        description: 'Document lacks a conclusion section.',
        suggestion: 'Add a concluding paragraph.',
      });
    }

    // Check for empty sections
    structure.sections.forEach(section => {
      if (section.blocks.length === 0) {
        inconsistencies.push({
          type: 'missing_info',
          severity: 'low',
          location: { sectionId: section.id },
          description: `Section "${section.title}" is empty.`,
          suggestion: 'Add content to this section.',
        });
      }
    });

    return inconsistencies;
  }

  /**
   * Detect inconsistent terminology (e.g., "tree" vs "arbor").
   */
  private detectTerminologyInconsistencies(structure: DocumentStructure): Inconsistency[] {
    const inconsistencies: Inconsistency[] = [];
    const terms = new Map<string, string[]>(); // term -> list of block IDs

    // Extract terms (simplified: just look for certain keywords)
    structure.blocks.forEach(block => {
      if (block.type === 'paragraph') {
        const content = block.content as any;
        const text = content.text.toLowerCase();
        // Naive detection: if both "tree" and "arbor" appear in the same document
        if (text.includes('tree')) {
          const list = terms.get('tree') || [];
          list.push(block.id);
          terms.set('tree', list);
        }
        if (text.includes('arbor')) {
          const list = terms.get('arbor') || [];
          list.push(block.id);
          terms.set('arbor', list);
        }
      }
    });

    // If both terms appear, flag as inconsistent terminology
    if (terms.has('tree') && terms.has('arbor')) {
      inconsistencies.push({
        type: 'terminology',
        severity: 'low',
        location: { blockId: terms.get('tree')![0] },
        description: 'Document uses both "tree" and "arbor" to refer to the same subject.',
        suggestion: 'Pick one term and use it consistently.',
      });
    }

    return inconsistencies;
  }

  /**
   * Detect tone inconsistencies (e.g., mixing formal and informal).
   */
  private detectToneInconsistencies(structure: DocumentStructure): Inconsistency[] {
    // This would require a more sophisticated tone classifier.
    // For now, we'll just return an empty list.
    return [];
  }

  /**
   * Detect formatting inconsistencies (e.g., heading levels, bullet styles).
   */
  private detectFormattingInconsistencies(structure: DocumentStructure): Inconsistency[] {
    const inconsistencies: Inconsistency[] = [];

    // Check heading level jumps (e.g., h1 → h3)
    const headingLevels = structure.headings.map(h => h.level);
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      if (diff > 1) {
        inconsistencies.push({
          type: 'formatting',
          severity: 'low',
          location: { blockId: structure.headings[i].blockId },
          description: `Heading level jumps from ${headingLevels[i - 1]} to ${headingLevels[i]}.`,
          suggestion: 'Maintain a consistent heading hierarchy.',
        });
      }
    }

    return inconsistencies;
  }

  /**
   * Detect numbering inconsistencies (e.g., figure numbers, list numbers).
   */
  private detectNumberingInconsistencies(structure: DocumentStructure): Inconsistency[] {
    // This would require parsing numbered lists and figure captions.
    // For now, we'll just return an empty list.
    return [];
  }

  /**
   * Fix a specific inconsistency (placeholder).
   */
  fix(inconsistency: Inconsistency, blocks: LayoutBlock[]): LayoutBlock[] {
    // In a real implementation, this would apply a fix (e.g., merge duplicates, adjust terminology).
    // For now, we just return the original blocks unchanged.
    console.log(`Would fix inconsistency: ${inconsistency.description}`);
    return blocks;
  }

  /**
   * Fix all inconsistencies (batch).
   */
  fixAll(inconsistencies: Inconsistency[], blocks: LayoutBlock[]): LayoutBlock[] {
    let result = [...blocks];
    for (const inc of inconsistencies) {
      result = this.fix(inc, result);
    }
    return result;
  }
}
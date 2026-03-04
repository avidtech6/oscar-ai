import type { LayoutBlock } from '../layout/LayoutTypes';
import type { DocumentStructure, RewriteOptions } from './DocumentTypes';
import { DocumentStructureAnalysisEngine } from './DocumentStructureAnalysisEngine';
import { ToneStyleControlEngine } from './ToneStyleControlEngine';

/**
 * Auto‑rewrite engine – rewrites entire documents, sections, or paragraphs.
 */
export class AutoRewriteEngine {
  private structureEngine: DocumentStructureAnalysisEngine;
  private toneEngine: ToneStyleControlEngine;

  constructor() {
    this.structureEngine = new DocumentStructureAnalysisEngine();
    this.toneEngine = new ToneStyleControlEngine();
  }

  /**
   * Rewrite the entire document.
   */
  rewriteDocument(blocks: LayoutBlock[], options: RewriteOptions): LayoutBlock[] {
    // Apply tone/style transformations
    const toneTransformed = this.toneEngine.rewrite(blocks, options);

    // Apply clarity/conciseness improvements
    let result = toneTransformed;
    if (options.clarity) {
      result = this.improveClarity(result);
    }
    if (options.conciseness) {
      result = this.improveConciseness(result);
    }

    return result;
  }

  /**
   * Rewrite a specific section.
   */
  rewriteSection(sectionId: string, blocks: LayoutBlock[], options: RewriteOptions): LayoutBlock[] {
    const structure = this.structureEngine.analyse(blocks);
    const section = this.findSection(structure.sections, sectionId);
    if (!section) {
      console.warn(`Section ${sectionId} not found.`);
      return blocks;
    }

    // Extract section blocks
    const sectionBlocks = section.blocks;
    // Rewrite them
    const rewritten = this.rewriteDocument(sectionBlocks, options);

    // Replace the original section blocks with rewritten ones
    const blockMap = new Map(blocks.map(b => [b.id, b]));
    const rewrittenMap = new Map(rewritten.map(b => [b.id, b]));

    const newBlocks = blocks.map(block => {
      if (sectionBlocks.some(b => b.id === block.id)) {
        // This block is part of the section, replace with rewritten version
        const rewrittenBlock = rewrittenMap.get(block.id);
        return rewrittenBlock || block;
      }
      return block;
    });

    return newBlocks;
  }

  /**
   * Rewrite a specific paragraph (block).
   */
  rewriteParagraph(blockId: string, blocks: LayoutBlock[], options: RewriteOptions): LayoutBlock[] {
    const block = blocks.find(b => b.id === blockId);
    if (!block || block.type !== 'paragraph') {
      console.warn(`Paragraph block ${blockId} not found.`);
      return blocks;
    }

    // Create a temporary single‑block document
    const rewritten = this.rewriteDocument([block], options);
    if (rewritten.length === 0) return blocks;

    const newBlock = rewritten[0];

    return blocks.map(b => (b.id === blockId ? newBlock : b));
  }

  /**
   * Improve clarity of blocks (simplified).
   */
  private improveClarity(blocks: LayoutBlock[]): LayoutBlock[] {
    // Placeholder: just return the same blocks
    // In reality, you'd apply sentence simplification, jargon replacement, etc.
    return blocks;
  }

  /**
   * Improve conciseness of blocks (simplified).
   */
  private improveConciseness(blocks: LayoutBlock[]): LayoutBlock[] {
    // Placeholder: just return the same blocks
    // In reality, you'd remove redundant words, shorten sentences, etc.
    return blocks;
  }

  /**
   * Find a section by ID (recursive).
   */
  private findSection(sections: DocumentStructure['sections'], sectionId: string): DocumentStructure['sections'][0] | null {
    for (const section of sections) {
      if (section.id === sectionId) return section;
      const found = this.findSection(section.children, sectionId);
      if (found) return found;
    }
    return null;
  }

  /**
   * Suggest rewrite options based on document content.
   */
  suggestRewriteOptions(blocks: LayoutBlock[]): RewriteOptions[] {
    const suggestions: RewriteOptions[] = [];

    // Detect if document is too verbose
    const totalWords = this.countWords(blocks);
    if (totalWords > 1000) {
      suggestions.push({ conciseness: true, clarity: true });
    }

    // Detect if tone is informal
    const detectedTone = this.toneEngine.detectTone(blocks);
    if (detectedTone === 'friendly' || detectedTone === 'simplified') {
      suggestions.push({ tone: 'professional' });
    }

    // Detect if document lacks clarity (placeholder)
    const readability = this.estimateReadability(blocks);
    if (readability < 50) {
      suggestions.push({ clarity: true });
    }

    return suggestions;
  }

  /**
   * Count total words in document.
   */
  private countWords(blocks: LayoutBlock[]): number {
    let words = 0;
    blocks.forEach(block => {
      if (block.type === 'paragraph' || block.type === 'heading') {
        const content = block.content as any;
        const text = content.text;
        words += text.split(/\s+/).length;
      }
    });
    return words;
  }

  /**
   * Estimate readability score (0‑100).
   */
  private estimateReadability(blocks: LayoutBlock[]): number {
    // Simple heuristic: average sentence length
    let totalWords = 0;
    let totalSentences = 0;

    blocks.forEach(block => {
      if (block.type === 'paragraph') {
        const content = block.content as any;
        const text = content.text;
        const sentences = text.split(/[.!?]+/).length - 1;
        const words = text.split(/\s+/).length;
        totalWords += words;
        totalSentences += sentences || 1;
      }
    });

    if (totalSentences === 0) return 50;
    const avgWordsPerSentence = totalWords / totalSentences;
    let score = 100 - (avgWordsPerSentence * 5);
    if (score < 0) score = 0;
    if (score > 100) score = 100;
    return Math.round(score);
  }

  /**
   * Compare original and rewritten blocks to see what changed.
   */
  diff(original: LayoutBlock[], rewritten: LayoutBlock[]): Array<{
    blockId: string;
    originalText: string;
    newText: string;
  }> {
    const changes: Array<{
      blockId: string;
      originalText: string;
      newText: string;
    }> = [];

    const originalMap = new Map(original.map(b => [b.id, b]));
    const rewrittenMap = new Map(rewritten.map(b => [b.id, b]));

    Array.from(originalMap.entries()).forEach(([id, origBlock]) => {
      const rewrittenBlock = rewrittenMap.get(id);
      if (!rewrittenBlock) return;

      if (origBlock.type === 'paragraph' || origBlock.type === 'heading') {
        const origText = (origBlock.content as any).text;
        const newText = (rewrittenBlock.content as any).text;
        if (origText !== newText) {
          changes.push({ blockId: id, originalText: origText, newText });
        }
      }
    });

    return changes;
  }
}
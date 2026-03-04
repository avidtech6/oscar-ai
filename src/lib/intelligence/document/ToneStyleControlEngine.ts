import type { LayoutBlock } from '../layout/LayoutTypes';
import type { DocumentTone, RewriteOptions } from './DocumentTypes';

/**
 * Tone & style control engine – rewrites documents in different tones.
 */
export class ToneStyleControlEngine {
  /**
   * Rewrite blocks in a specified tone.
   */
  rewrite(blocks: LayoutBlock[], options: RewriteOptions): LayoutBlock[] {
    const { tone, clarity, conciseness, targetAudience } = options;

    // Apply tone transformation
    let transformed = tone ? this.applyTone(blocks, tone) : [...blocks];

    // Apply clarity improvements if requested
    if (clarity) {
      transformed = this.improveClarity(transformed);
    }

    // Apply conciseness improvements if requested
    if (conciseness) {
      transformed = this.improveConciseness(transformed);
    }

    // Apply audience‑specific adjustments
    if (targetAudience) {
      transformed = this.adjustForAudience(transformed, targetAudience);
    }

    return transformed;
  }

  /**
   * Apply a specific tone to all text blocks.
   */
  private applyTone(blocks: LayoutBlock[], tone: DocumentTone): LayoutBlock[] {
    return blocks.map(block => {
      // Only modify text‑based blocks
      if (block.type === 'paragraph' || block.type === 'heading') {
        const content = block.content as any;
        const originalText = content.text;
        const transformedText = this.transformTextByTone(originalText, tone);
        return {
          ...block,
          content: { ...content, text: transformedText },
        };
      }
      return block;
    });
  }

  /**
   * Transform a single text string according to tone.
   * This is a placeholder – in reality you'd use an LLM or a sophisticated rule set.
   */
  private transformTextByTone(text: string, tone: DocumentTone): string {
    // Simple keyword substitutions for demonstration
    const substitutions: Record<DocumentTone, [string, string][]> = {
      professional: [
        ['got', 'obtained'],
        ['a lot of', 'numerous'],
        ['big', 'significant'],
        ['small', 'minor'],
        ['good', 'satisfactory'],
        ['bad', 'unsatisfactory'],
      ],
      friendly: [
        ['obtained', 'got'],
        ['numerous', 'a lot of'],
        ['significant', 'big'],
        ['minor', 'small'],
        ['satisfactory', 'good'],
        ['unsatisfactory', 'bad'],
      ],
      technical: [
        ['got', 'acquired'],
        ['a lot of', 'a substantial quantity of'],
        ['big', 'large‑scale'],
        ['small', 'minimal'],
        ['good', 'optimal'],
        ['bad', 'suboptimal'],
      ],
      formal: [
        ['got', 'received'],
        ['a lot of', 'a considerable amount of'],
        ['big', 'considerable'],
        ['small', 'limited'],
        ['good', 'acceptable'],
        ['bad', 'unacceptable'],
      ],
      simplified: [
        ['obtained', 'got'],
        ['numerous', 'many'],
        ['significant', 'big'],
        ['minor', 'small'],
        ['satisfactory', 'good'],
        ['unsatisfactory', 'bad'],
      ],
      'client-facing': [
        ['obtained', 'we have'],
        ['numerous', 'many'],
        ['significant', 'important'],
        ['minor', 'small'],
        ['satisfactory', 'good'],
        ['unsatisfactory', 'needs improvement'],
      ],
      regulatory: [
        ['got', 'procured'],
        ['a lot of', 'a substantial number of'],
        ['big', 'substantial'],
        ['small', 'negligible'],
        ['good', 'compliant'],
        ['bad', 'non‑compliant'],
      ],
    };

    let result = text;
    const rules = substitutions[tone] || [];
    for (const [from, to] of rules) {
      const regex = new RegExp(`\\b${from}\\b`, 'gi');
      result = result.replace(regex, to);
    }

    // Add tone‑specific prefixes/suffixes
    switch (tone) {
      case 'professional':
        // No extra changes
        break;
      case 'friendly':
        if (!result.endsWith('!') && !result.endsWith('?')) {
          result += '.';
        }
        break;
      case 'technical':
        // Ensure precise language
        break;
      case 'formal':
        // Ensure passive voice? (simplified)
        break;
      case 'simplified':
        // Shorten sentences (placeholder)
        break;
      case 'client-facing':
        // Add client‑oriented phrasing
        break;
      case 'regulatory':
        // Add compliance language
        break;
    }

    return result;
  }

  /**
   * Improve clarity by simplifying complex sentences.
   */
  private improveClarity(blocks: LayoutBlock[]): LayoutBlock[] {
    // Placeholder: just return the same blocks
    // In reality, you'd parse sentences, split long ones, replace jargon, etc.
    return blocks;
  }

  /**
   * Improve conciseness by removing redundant words.
   */
  private improveConciseness(blocks: LayoutBlock[]): LayoutBlock[] {
    // Placeholder: just return the same blocks
    // In reality, you'd apply text compression algorithms.
    return blocks;
  }

  /**
   * Adjust content for a specific target audience.
   */
  private adjustForAudience(blocks: LayoutBlock[], audience: string): LayoutBlock[] {
    // Placeholder: no transformation
    return blocks;
  }

  /**
   * Detect the current tone of a document (simple heuristic).
   */
  detectTone(blocks: LayoutBlock[]): DocumentTone | null {
    // Count occurrences of tone‑indicative words
    const text = blocks
      .map(b => (b.type === 'paragraph' || b.type === 'heading' ? (b.content as any).text : ''))
      .join(' ')
      .toLowerCase();

    const professionalWords = ['obtained', 'numerous', 'significant', 'satisfactory'];
    const friendlyWords = ['got', 'a lot of', 'big', 'good'];
    const technicalWords = ['acquired', 'substantial', 'optimal', 'suboptimal'];
    const formalWords = ['received', 'considerable', 'acceptable', 'unacceptable'];
    const simplifiedWords = ['got', 'many', 'big', 'small'];
    const clientWords = ['we have', 'important', 'needs improvement'];
    const regulatoryWords = ['procured', 'substantial', 'compliant', 'non‑compliant'];

    const scores: Record<DocumentTone, number> = {
      professional: professionalWords.filter(w => text.includes(w)).length,
      friendly: friendlyWords.filter(w => text.includes(w)).length,
      technical: technicalWords.filter(w => text.includes(w)).length,
      formal: formalWords.filter(w => text.includes(w)).length,
      simplified: simplifiedWords.filter(w => text.includes(w)).length,
      'client-facing': clientWords.filter(w => text.includes(w)).length,
      regulatory: regulatoryWords.filter(w => text.includes(w)).length,
    };

    const maxTone = Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b));
    return maxTone[1] > 0 ? (maxTone[0] as DocumentTone) : null;
  }

  /**
   * Suggest a tone based on document content and context.
   */
  suggestTone(blocks: LayoutBlock[], context?: string): DocumentTone {
    // Default suggestion: professional
    return 'professional';
  }
}
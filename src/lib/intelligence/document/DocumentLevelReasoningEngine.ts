import type { LayoutBlock } from '../layout/LayoutTypes';
import type { DocumentStructure, StructuralSuggestion } from './DocumentTypes';
import { DocumentStructureAnalysisEngine } from './DocumentStructureAnalysisEngine';

/**
 * Document‑level reasoning engine – understands purpose, identifies missing sections,
 * suggests improvements, detects weak arguments, strengthens conclusions, improves flow.
 */
export class DocumentLevelReasoningEngine {
  private structureEngine: DocumentStructureAnalysisEngine;

  constructor() {
    this.structureEngine = new DocumentStructureAnalysisEngine();
  }

  /**
   * Analyse the document and return reasoning insights.
   */
  analyse(blocks: LayoutBlock[]): {
    purpose: string | null;
    missingSections: string[];
    weakArguments: Array<{ blockId: string; reason: string }>;
    flowIssues: Array<{ fromBlockId: string; toBlockId: string; issue: string }>;
    readabilityScore: number; // 0‑100
    suggestions: StructuralSuggestion[];
  } {
    const structure = this.structureEngine.analyse(blocks);

    const purpose = this.inferPurpose(structure);
    const missingSections = this.identifyMissingSections(structure);
    const weakArguments = this.detectWeakArguments(structure);
    const flowIssues = this.detectFlowIssues(structure);
    const readabilityScore = this.calculateReadabilityScore(structure);
    const suggestions = this.generateSuggestions(structure);

    return {
      purpose,
      missingSections,
      weakArguments,
      flowIssues,
      readabilityScore,
      suggestions,
    };
  }

  /**
   * Infer the document's purpose based on content and headings.
   */
  private inferPurpose(structure: DocumentStructure): string | null {
    // Look for keywords in headings
    const headingText = structure.headings.map(h => h.text.toLowerCase()).join(' ');
    if (headingText.includes('report') || headingText.includes('analysis')) {
      return 'Informational report';
    }
    if (headingText.includes('proposal') || headingText.includes('recommendation')) {
      return 'Proposal';
    }
    if (headingText.includes('manual') || headingText.includes('guide')) {
      return 'Instructional document';
    }
    if (headingText.includes('blog') || headingText.includes('article')) {
      return 'Blog post';
    }
    // Default
    return null;
  }

  /**
   * Identify sections that are commonly expected but missing.
   */
  private identifyMissingSections(structure: DocumentStructure): string[] {
    const missing: string[] = [];
    const expectedSections = ['Introduction', 'Conclusion', 'References', 'Appendix'];
    const presentSections = structure.headings.map(h => h.text.toLowerCase());

    for (const expected of expectedSections) {
      if (!presentSections.includes(expected.toLowerCase())) {
        missing.push(expected);
      }
    }

    // Also check if there are sections with very few blocks
    structure.sections.forEach(section => {
      if (section.blocks.length < 2 && section.title.toLowerCase() !== 'abstract') {
        missing.push(`Content for "${section.title}"`);
      }
    });

    return missing;
  }

  /**
   * Detect weak arguments (e.g., lack of evidence, contradictory statements).
   */
  private detectWeakArguments(structure: DocumentStructure): Array<{ blockId: string; reason: string }> {
    const weak: Array<{ blockId: string; reason: string }> = [];

    // Simple heuristic: look for paragraphs that contain "should" or "must" without supporting data
    structure.blocks.forEach(block => {
      if (block.type === 'paragraph') {
        const content = block.content as any;
        const text = content.text.toLowerCase();
        const hasModal = text.includes('should') || text.includes('must') || text.includes('ought to');
        const hasEvidence = text.includes('because') || text.includes('due to') || text.includes('evidence');
        if (hasModal && !hasEvidence) {
          weak.push({
            blockId: block.id,
            reason: 'Assertion without supporting evidence.',
          });
        }
      }
    });

    return weak;
  }

  /**
   * Detect flow issues (e.g., abrupt topic changes, missing transitions).
   */
  private detectFlowIssues(structure: DocumentStructure): Array<{ fromBlockId: string; toBlockId: string; issue: string }> {
    const issues: Array<{ fromBlockId: string; toBlockId: string; issue: string }> = [];

    // Compare consecutive paragraphs for topic coherence (simplified)
    const paragraphs = structure.blocks.filter(b => b.type === 'paragraph');
    for (let i = 0; i < paragraphs.length - 1; i++) {
      const curr = paragraphs[i];
      const next = paragraphs[i + 1];
      const currText = (curr.content as any).text.toLowerCase();
      const nextText = (next.content as any).text.toLowerCase();

      // If both paragraphs are short and share few words, flag as potential flow break
      const currWords = new Set(currText.split(/\s+/));
      const nextWords = new Set(nextText.split(/\s+/));
      const intersection = Array.from(currWords).filter(w => nextWords.has(w)).length;
      if (intersection < 2 && currText.length > 20 && nextText.length > 20) {
        issues.push({
          fromBlockId: curr.id,
          toBlockId: next.id,
          issue: 'Possible abrupt topic shift between paragraphs.',
        });
      }
    }

    return issues;
  }

  /**
   * Calculate a simplistic readability score (0‑100).
   */
  private calculateReadabilityScore(structure: DocumentStructure): number {
    // Use average sentence length and word length as proxy
    let totalWords = 0;
    let totalSentences = 0;

    structure.blocks.forEach(block => {
      if (block.type === 'paragraph') {
        const content = block.content as any;
        const text = content.text;
        const words = text.split(/\s+/).length;
        const sentences = text.split(/[.!?]+/).length - 1;
        totalWords += words;
        totalSentences += sentences || 1;
      }
    });

    if (totalSentences === 0) return 50;

    const avgWordsPerSentence = totalWords / totalSentences;
    // Simple mapping: lower words per sentence = higher readability
    let score = 100 - (avgWordsPerSentence * 5);
    if (score < 0) score = 0;
    if (score > 100) score = 100;
    return Math.round(score);
  }

  /**
   * Generate structural improvement suggestions.
   */
  private generateSuggestions(structure: DocumentStructure): StructuralSuggestion[] {
    const suggestions: StructuralSuggestion[] = [];

    // Suggest merging very short sections
    const shortSections = structure.sections.filter(s => s.blocks.length <= 2);
    if (shortSections.length > 1) {
      suggestions.push({
        type: 'merge',
        sectionId: shortSections[0].id,
        targetSectionId: shortSections[1].id,
        reason: 'Both sections are very short; merging could improve flow.',
      });
    }

    // Suggest splitting long sections
    const longSections = structure.sections.filter(s => s.blocks.length > 10);
    longSections.forEach(section => {
      suggestions.push({
        type: 'split',
        sectionId: section.id,
        reason: 'Section is long; consider splitting into subtopics.',
      });
    });

    // Suggest reordering if conclusion appears before body
    const sectionTitles = structure.sections.map(s => s.title.toLowerCase());
    const conclusionIndex = sectionTitles.findIndex(t => t.includes('conclusion'));
    const bodyIndex = sectionTitles.findIndex(t => t.includes('body') || t.includes('methodology'));
    if (conclusionIndex >= 0 && bodyIndex >= 0 && conclusionIndex < bodyIndex) {
      suggestions.push({
        type: 'reorder',
        sectionId: structure.sections[conclusionIndex].id,
        targetSectionId: structure.sections[bodyIndex].id,
        reason: 'Conclusion appears before body; recommend moving conclusion to the end.',
      });
    }

    return suggestions;
  }

  /**
   * Strengthen conclusions by adding summary statements.
   */
  strengthenConclusions(blocks: LayoutBlock[]): LayoutBlock[] {
    // Placeholder: just return the same blocks
    // In reality, you'd analyse the conclusion section and add reinforcing statements.
    return blocks;
  }

  /**
   * Improve clarity by rewriting ambiguous sentences.
   */
  improveClarity(blocks: LayoutBlock[]): LayoutBlock[] {
    // Placeholder
    return blocks;
  }

  /**
   * Improve flow by adding transitional phrases.
   */
  improveFlow(blocks: LayoutBlock[]): LayoutBlock[] {
    // Placeholder
    return blocks;
  }
}
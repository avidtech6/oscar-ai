import type { LayoutBlock } from '../layout/LayoutTypes';
import type { DocumentStructure, SummaryOptions } from './DocumentTypes';
import { DocumentStructureAnalysisEngine } from './DocumentStructureAnalysisEngine';

/**
 * Auto‑summary engine – generates executive summaries, section summaries, bullet points, key findings, recommendations.
 */
export class AutoSummaryEngine {
  private structureEngine: DocumentStructureAnalysisEngine;

  constructor() {
    this.structureEngine = new DocumentStructureAnalysisEngine();
  }

  /**
   * Generate a summary of the document.
   */
  summarise(blocks: LayoutBlock[], options: SummaryOptions): string {
    const structure = this.structureEngine.analyse(blocks);

    switch (options.format) {
      case 'paragraph':
        return this.generateParagraphSummary(structure, options);
      case 'bullet':
        return this.generateBulletSummary(structure, options);
      case 'executive':
        return this.generateExecutiveSummary(structure, options);
      default:
        return this.generateParagraphSummary(structure, options);
    }
  }

  /**
   * Generate a paragraph‑style summary.
   */
  private generateParagraphSummary(structure: DocumentStructure, options: SummaryOptions): string {
    const length = options.length;
    const sections = structure.sections;

    // Extract key sentences from each section (simplified)
    const keySentences: string[] = [];
    sections.forEach(section => {
      const firstParagraph = section.blocks.find(b => b.type === 'paragraph');
      if (firstParagraph) {
        const content = firstParagraph.content as any;
        const text = content.text;
        // Take the first sentence
        const firstSentence = text.split(/[.!?]+/)[0];
        if (firstSentence.trim().length > 0) {
          keySentences.push(firstSentence.trim() + '.');
        }
      }
    });

    // Limit based on requested length
    let limit = 5;
    if (length === 'short') limit = 2;
    if (length === 'long') limit = 10;

    const selected = keySentences.slice(0, limit);
    return selected.join(' ');
  }

  /**
   * Generate a bullet‑point summary.
   */
  private generateBulletSummary(structure: DocumentStructure, options: SummaryOptions): string {
    const length = options.length;
    const sections = structure.sections;

    const bullets: string[] = [];
    sections.forEach(section => {
      // Add section title as a bullet
      bullets.push(`• ${section.title}`);
      // Add up to two key points from the section
      const paragraphs = section.blocks.filter(b => b.type === 'paragraph');
      const maxPoints = length === 'short' ? 1 : length === 'medium' ? 2 : 3;
      for (let i = 0; i < Math.min(maxPoints, paragraphs.length); i++) {
        const content = paragraphs[i].content as any;
        const text = content.text;
        const firstSentence = text.split(/[.!?]+/)[0];
        if (firstSentence.trim().length > 0) {
          bullets.push(`  – ${firstSentence.trim()}.`);
        }
      }
    });

    // Limit total bullets
    let limit = 15;
    if (length === 'short') limit = 5;
    if (length === 'medium') limit = 10;

    return bullets.slice(0, limit).join('\n');
  }

  /**
   * Generate an executive summary (concise, high‑level).
   */
  private generateExecutiveSummary(structure: DocumentStructure, options: SummaryOptions): string {
    // Executive summary typically includes purpose, key findings, recommendations
    const purpose = this.inferPurpose(structure);
    const keyFindings = this.extractKeyFindings(structure);
    const recommendations = this.extractRecommendations(structure);

    const parts: string[] = [];
    if (purpose) parts.push(`Purpose: ${purpose}`);
    if (keyFindings.length > 0) parts.push(`Key findings: ${keyFindings.join('; ')}`);
    if (recommendations.length > 0) parts.push(`Recommendations: ${recommendations.join('; ')}`);

    return parts.join('\n\n');
  }

  /**
   * Infer document purpose from headings and content.
   */
  private inferPurpose(structure: DocumentStructure): string | null {
    const headingText = structure.headings.map(h => h.text.toLowerCase()).join(' ');
    if (headingText.includes('report')) return 'To provide an analysis and recommendations';
    if (headingText.includes('proposal')) return 'To propose a solution or course of action';
    if (headingText.includes('manual')) return 'To instruct users on a process';
    if (headingText.includes('blog')) return 'To share insights or experiences';
    return null;
  }

  /**
   * Extract key findings from document (simplified).
   */
  private extractKeyFindings(structure: DocumentStructure): string[] {
    const findings: string[] = [];

    // Look for paragraphs that contain phrases like "found that", "results show", "indicates"
    structure.blocks.forEach(block => {
      if (block.type === 'paragraph') {
        const content = block.content as any;
        const text = content.text.toLowerCase();
        if (
          text.includes('found that') ||
          text.includes('results show') ||
          text.includes('indicates') ||
          text.includes('concluded')
        ) {
          // Extract the sentence containing the phrase
          const sentences = content.text.split(/[.!?]+/);
          const relevant = sentences.find((s: string) =>
            s.toLowerCase().includes('found that') ||
            s.toLowerCase().includes('results show') ||
            s.toLowerCase().includes('indicates') ||
            s.toLowerCase().includes('concluded')
          );
          if (relevant) {
            findings.push(relevant.trim());
          }
        }
      }
    });

    // Limit to top 3
    return findings.slice(0, 3);
  }

  /**
   * Extract recommendations from document (simplified).
   */
  private extractRecommendations(structure: DocumentStructure): string[] {
    const recommendations: string[] = [];

    // Look for paragraphs that contain "recommend", "should", "must", "advise"
    structure.blocks.forEach(block => {
      if (block.type === 'paragraph') {
        const content = block.content as any;
        const text = content.text.toLowerCase();
        if (
          text.includes('recommend') ||
          text.includes('should') ||
          text.includes('must') ||
          text.includes('advise')
        ) {
          const sentences = content.text.split(/[.!?]+/);
          const relevant = sentences.find((s: string) =>
            s.toLowerCase().includes('recommend') ||
            s.toLowerCase().includes('should') ||
            s.toLowerCase().includes('must') ||
            s.toLowerCase().includes('advise')
          );
          if (relevant) {
            recommendations.push(relevant.trim());
          }
        }
      }
    });

    return recommendations.slice(0, 3);
  }

  /**
   * Generate a summary for a specific section.
   */
  summariseSection(sectionId: string, blocks: LayoutBlock[], options: SummaryOptions): string {
    const structure = this.structureEngine.analyse(blocks);
    const section = this.findSection(structure.sections, sectionId);
    if (!section) return 'Section not found.';

    // Create a temporary structure containing only that section's blocks
    const sectionStructure: DocumentStructure = {
      sections: [section],
      headings: structure.headings.filter(h => h.blockId === sectionId),
      blocks: section.blocks,
      media: structure.media.filter(m => section.blocks.some(b => b.id === m.blockId)),
      tables: structure.tables.filter(t => section.blocks.some(b => b.id === t.blockId)),
      readingOrder: section.blocks,
    };

    return this.summarise(section.blocks, options);
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
   * Generate key findings as a bullet list.
   */
  generateKeyFindings(blocks: LayoutBlock[]): string[] {
    const structure = this.structureEngine.analyse(blocks);
    return this.extractKeyFindings(structure);
  }

  /**
   * Generate recommendations as a bullet list.
   */
  generateRecommendations(blocks: LayoutBlock[]): string[] {
    const structure = this.structureEngine.analyse(blocks);
    return this.extractRecommendations(structure);
  }
}
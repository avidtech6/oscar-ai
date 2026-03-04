import type { LayoutBlock } from '../layout/LayoutTypes';
import type { DocumentStructure, DocumentSection } from './DocumentTypes';

/**
 * Document structure analysis engine – parses blocks into a hierarchical document model.
 */
export class DocumentStructureAnalysisEngine {
  /**
   * Analyse blocks and produce a document structure.
   */
  analyse(blocks: LayoutBlock[]): DocumentStructure {
    const headings: DocumentStructure['headings'] = [];
    const media: DocumentStructure['media'] = [];
    const tables: DocumentStructure['tables'] = [];
    const sections: DocumentSection[] = [];
    const readingOrder: LayoutBlock[] = [...blocks];

    // Extract headings
    blocks.forEach(block => {
      if (block.type === 'heading') {
        const content = block.content as any;
        headings.push({
          id: block.id,
          text: content.text,
          level: content.level,
          blockId: block.id,
        });
      }
      if (block.type === 'image' || block.type === 'figure') {
        const content = block.content as any;
        media.push({
          blockId: block.id,
          mediaId: content.mediaId,
          type: block.type,
        });
      }
      if (block.type === 'table') {
        const content = block.content as any;
        tables.push({
          blockId: block.id,
          headers: content.headers,
          rowCount: content.rows.length,
        });
      }
    });

    // Build section hierarchy (simplified)
    let currentSection: DocumentSection | null = null;
    const rootSections: DocumentSection[] = [];

    blocks.forEach(block => {
      if (block.type === 'heading') {
        const content = block.content as any;
        const level = content.level;
        const section: DocumentSection = {
          id: block.id,
          title: content.text,
          level,
          blocks: [block],
          children: [],
        };
        // Naive hierarchy: assume flat for now
        rootSections.push(section);
        currentSection = section;
      } else if (currentSection) {
        currentSection.blocks.push(block);
      }
    });

    // If no headings, treat entire document as a single section
    if (rootSections.length === 0) {
      const rootSection: DocumentSection = {
        id: 'root',
        title: 'Document',
        level: 1,
        blocks: [...blocks],
        children: [],
      };
      sections.push(rootSection);
    } else {
      sections.push(...rootSections);
    }

    return {
      sections,
      headings,
      blocks,
      media,
      tables,
      readingOrder,
    };
  }

  /**
   * Get the nesting depth of the document (max heading level).
   */
  getNestingDepth(structure: DocumentStructure): number {
    return Math.max(...structure.headings.map(h => h.level), 1);
  }

  /**
   * Get all blocks belonging to a specific section.
   */
  getSectionBlocks(structure: DocumentStructure, sectionId: string): LayoutBlock[] {
    const section = this.findSection(structure.sections, sectionId);
    return section?.blocks ?? [];
  }

  /**
   * Find a section by ID (recursive).
   */
  private findSection(sections: DocumentSection[], sectionId: string): DocumentSection | null {
    for (const section of sections) {
      if (section.id === sectionId) return section;
      const found = this.findSection(section.children, sectionId);
      if (found) return found;
    }
    return null;
  }

  /**
   * Flatten sections into a linear list.
   */
  flattenSections(structure: DocumentStructure): DocumentSection[] {
    const result: DocumentSection[] = [];
    const traverse = (sections: DocumentSection[]) => {
      for (const section of sections) {
        result.push(section);
        traverse(section.children);
      }
    };
    traverse(structure.sections);
    return result;
  }

  /**
   * Estimate reading time (words per minute = 200).
   */
  estimateReadingTime(structure: DocumentStructure): number {
    let totalWords = 0;
    structure.blocks.forEach(block => {
      if (block.type === 'paragraph') {
        const text = (block.content as any).text;
        totalWords += text.split(/\s+/).length;
      }
    });
    const minutes = totalWords / 200;
    return Math.ceil(minutes);
  }
}
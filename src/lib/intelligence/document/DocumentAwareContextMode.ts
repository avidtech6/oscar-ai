import type { LayoutBlock } from '../layout/LayoutTypes';
import type { DocumentCommand, DocumentEvent, DocumentTone, SummaryOptions, RewriteOptions } from './DocumentTypes';
import { DocumentStructureAnalysisEngine } from './DocumentStructureAnalysisEngine';
import { CrossSectionConsistencyEngine } from './CrossSectionConsistencyEngine';
import { ToneStyleControlEngine } from './ToneStyleControlEngine';
import { DocumentLevelReasoningEngine } from './DocumentLevelReasoningEngine';
import { AutoSummaryEngine } from './AutoSummaryEngine';
import { AutoRewriteEngine } from './AutoRewriteEngine';
import { StructuralOptimisationEngine } from './StructuralOptimisationEngine';

/**
 * Document‑aware context mode – applies document‑level changes directly, with undo/redo support.
 */
export class DocumentAwareContextMode {
  private structureEngine: DocumentStructureAnalysisEngine;
  private consistencyEngine: CrossSectionConsistencyEngine;
  private toneEngine: ToneStyleControlEngine;
  private reasoningEngine: DocumentLevelReasoningEngine;
  private summaryEngine: AutoSummaryEngine;
  private rewriteEngine: AutoRewriteEngine;
  private optimisationEngine: StructuralOptimisationEngine;

  private undoStack: Array<{ blocks: LayoutBlock[]; description: string }> = [];
  private redoStack: Array<{ blocks: LayoutBlock[]; description: string }> = [];

  constructor() {
    this.structureEngine = new DocumentStructureAnalysisEngine();
    this.consistencyEngine = new CrossSectionConsistencyEngine();
    this.toneEngine = new ToneStyleControlEngine();
    this.reasoningEngine = new DocumentLevelReasoningEngine();
    this.summaryEngine = new AutoSummaryEngine();
    this.rewriteEngine = new AutoRewriteEngine();
    this.optimisationEngine = new StructuralOptimisationEngine();
  }

  /**
   * Execute a document command and return the resulting blocks.
   */
  execute(command: DocumentCommand, currentBlocks: LayoutBlock[]): {
    blocks: LayoutBlock[];
    events: DocumentEvent[];
  } {
    // Save current state for undo
    this.pushUndo(currentBlocks, `Before ${command.type}`);

    let newBlocks: LayoutBlock[] = [];
    let events: DocumentEvent[] = [];

    switch (command.type) {
      case 'analyseStructure': {
        const structure = this.structureEngine.analyse(command.blocks);
        events.push({
          type: 'documentChange',
          blocks: command.blocks,
        });
        newBlocks = command.blocks;
        break;
      }

      case 'detectInconsistencies': {
        const inconsistencies = this.consistencyEngine.detect(command.blocks);
        events.push({
          type: 'inconsistencyDetected',
          inconsistencies,
        });
        newBlocks = command.blocks;
        break;
      }

      case 'rewriteDocument': {
        newBlocks = this.rewriteEngine.rewriteDocument(command.blocks, command.options);
        events.push({
          type: 'rewriteApplied',
          originalBlocks: command.blocks,
          newBlocks,
          options: command.options,
        });
        break;
      }

      case 'rewriteSection': {
        newBlocks = this.rewriteEngine.rewriteSection(
          command.sectionId,
          command.blocks,
          command.options
        );
        events.push({
          type: 'rewriteApplied',
          originalBlocks: command.blocks,
          newBlocks,
          options: command.options,
        });
        break;
      }

      case 'summariseDocument': {
        const summary = this.summaryEngine.summarise(command.blocks, command.options);
        events.push({
          type: 'summaryGenerated',
          summary,
          options: command.options,
        });
        newBlocks = command.blocks; // summary does not modify blocks
        break;
      }

      case 'optimiseStructure': {
        const suggestions = this.optimisationEngine.analyse(command.blocks);
        newBlocks = this.optimisationEngine.applyAll(suggestions, command.blocks);
        events.push({
          type: 'structureOptimised',
          suggestions,
          applied: true,
        });
        break;
      }

      case 'applyTone': {
        newBlocks = this.rewriteEngine.rewriteDocument(command.blocks, { tone: command.tone });
        events.push({
          type: 'toneChange',
          tone: command.tone,
        });
        break;
      }

      case 'fixInconsistencies': {
        const inconsistencies = this.consistencyEngine.detect(command.blocks);
        newBlocks = this.consistencyEngine.fixAll(inconsistencies, command.blocks);
        events.push({
          type: 'inconsistencyDetected',
          inconsistencies,
        });
        // Also emit a rewrite event? For simplicity, we just keep the inconsistency event.
        break;
      }

      default:
        // Unknown command, return original blocks
        console.warn(`Unknown document command: ${(command as any).type}`);
        newBlocks = currentBlocks;
    }

    // Clear redo stack because we've performed a new action
    this.redoStack = [];

    return { blocks: newBlocks, events };
  }

  /**
   * Undo the last action.
   */
  undo(currentBlocks: LayoutBlock[]): LayoutBlock[] | null {
    if (this.undoStack.length === 0) return null;
    const previous = this.undoStack.pop()!;
    this.redoStack.push({ blocks: currentBlocks, description: 'Undo' });
    return previous.blocks;
  }

  /**
   * Redo the last undone action.
   */
  redo(currentBlocks: LayoutBlock[]): LayoutBlock[] | null {
    if (this.redoStack.length === 0) return null;
    const next = this.redoStack.pop()!;
    this.undoStack.push({ blocks: currentBlocks, description: 'Redo' });
    return next.blocks;
  }

  /**
   * Get the current undo/redo stack sizes.
   */
  getStackSizes(): { undo: number; redo: number } {
    return { undo: this.undoStack.length, redo: this.redoStack.length };
  }

  /**
   * Clear the undo/redo history.
   */
  clearHistory(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Push current state onto undo stack.
   */
  private pushUndo(blocks: LayoutBlock[], description: string): void {
    this.undoStack.push({ blocks: [...blocks], description });
    // Limit undo stack size to 50
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
  }

  /**
   * Suggest commands based on document analysis.
   */
  suggestCommands(blocks: LayoutBlock[]): DocumentCommand[] {
    const suggestions: DocumentCommand[] = [];

    // Detect inconsistencies
    const inconsistencies = this.consistencyEngine.detect(blocks);
    if (inconsistencies.length > 0) {
      suggestions.push({ type: 'fixInconsistencies', blocks });
    }

    // Detect tone
    const tone = this.toneEngine.detectTone(blocks);
    if (tone && tone !== 'professional') {
      suggestions.push({ type: 'applyTone', blocks, tone: 'professional' });
    }

    // Detect long sections
    const structure = this.structureEngine.analyse(blocks);
    const longSections = structure.sections.filter(s => s.blocks.length > 10);
    if (longSections.length > 0) {
      suggestions.push({ type: 'optimiseStructure', blocks });
    }

    // Detect missing summary
    const hasSummary = structure.headings.some(h => h.text.toLowerCase().includes('summary'));
    if (!hasSummary) {
      suggestions.push({
        type: 'summariseDocument',
        blocks,
        options: { length: 'medium', format: 'bullet' },
      });
    }

    return suggestions;
  }
}
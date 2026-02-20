// Editor state management
// Handles undo/redo stacks, selection, and document state

import type {
  Document,
  EditorOperation,
  DeviceCapabilities
} from '../../../types';
import type {
  EditorState,
  EditorConfig
} from '../types';
import { logger } from '../../../utils/logger';
import { deepClone } from '../../../utils/helpers';

/**
 * State manager configuration
 */
export interface StateManagerConfig {
  maxUndoSteps: number;
  autoPersist: boolean;
}

/**
 * Editor state manager
 */
export class EditorStateManager {
  private state: EditorState;
  private config: StateManagerConfig;

  constructor(
    initialDocument: Document,
    config: Partial<StateManagerConfig> = {}
  ) {
    this.config = {
      maxUndoSteps: config.maxUndoSteps || 100,
      autoPersist: config.autoPersist ?? true,
    };

    this.state = {
      document: deepClone(initialDocument),
      selection: { start: 0, end: 0, direction: 'none' },
      isDirty: false,
      isSaving: false,
      isSyncing: false,
      undoStack: [],
      redoStack: [],
    };
  }

  /**
   * Get current state
   */
  getState(): EditorState {
    return deepClone(this.state);
  }

  /**
   * Get current document
   */
  getDocument(): Document {
    return deepClone(this.state.document);
  }

  /**
   * Get document content
   */
  getContent(): string {
    return this.state.document.content;
  }

  /**
   * Update document content
   */
  updateDocument(document: Document, markDirty: boolean = true): void {
    this.state.document = deepClone(document);
    if (markDirty) {
      this.state.isDirty = true;
    }
  }

  /**
   * Set text selection
   */
  setSelection(start: number, end: number, direction: 'forward' | 'backward' | 'none' = 'none'): void {
    const oldSelection = { ...this.state.selection };
    this.state.selection = { start, end, direction };

    // Log if selection actually changed
    if (start !== oldSelection.start || end !== oldSelection.end) {
      logger.debug('Selection changed', {
        documentId: this.state.document.id,
        oldSelection,
        newSelection: this.state.selection,
      });
    }
  }

  /**
   * Get current selection
   */
  getSelection(): { start: number; end: number; direction: 'forward' | 'backward' | 'none' } {
    return { ...this.state.selection };
  }

  /**
   * Get selected text
   */
  getSelectedText(): string {
    const { start, end } = this.state.selection;
    if (start === end) return '';
    
    return this.state.document.content.substring(
      Math.min(start, end),
      Math.max(start, end)
    );
  }

  /**
   * Add operation to undo stack
   */
  addToUndoStack(operation: EditorOperation): void {
    this.state.undoStack.push(operation);
    
    // Limit undo stack size
    if (this.state.undoStack.length > this.config.maxUndoSteps) {
      this.state.undoStack.shift();
    }
    
    // Clear redo stack when new operation is applied
    this.state.redoStack = [];
    
    logger.debug('Operation added to undo stack', {
      operationId: operation.id,
      type: operation.type,
      undoStackSize: this.state.undoStack.length,
    });
  }

  /**
   * Pop operation from undo stack for undo
   */
  popFromUndoStack(): EditorOperation | undefined {
    if (this.state.undoStack.length === 0) {
      return undefined;
    }
    
    const operation = this.state.undoStack.pop()!;
    this.state.redoStack.push(operation);
    
    logger.debug('Operation popped from undo stack', {
      operationId: operation.id,
      type: operation.type,
      undoStackSize: this.state.undoStack.length,
      redoStackSize: this.state.redoStack.length,
    });
    
    return operation;
  }

  /**
   * Pop operation from redo stack for redo
   */
  popFromRedoStack(): EditorOperation | undefined {
    if (this.state.redoStack.length === 0) {
      return undefined;
    }
    
    const operation = this.state.redoStack.pop()!;
    this.state.undoStack.push(operation);
    
    logger.debug('Operation popped from redo stack', {
      operationId: operation.id,
      type: operation.type,
      undoStackSize: this.state.undoStack.length,
      redoStackSize: this.state.redoStack.length,
    });
    
    return operation;
  }

  /**
   * Get last operation ID
   */
  getLastOperationId(): string | undefined {
    if (this.state.undoStack.length === 0) {
      return undefined;
    }
    return this.state.undoStack[this.state.undoStack.length - 1].id;
  }

  /**
   * Clear undo/redo stacks
   */
  clearHistory(): void {
    this.state.undoStack = [];
    this.state.redoStack = [];
    logger.debug('History cleared', {
      documentId: this.state.document.id,
    });
  }

  /**
   * Update device capabilities
   */
  updateDeviceCapabilities(capabilities: DeviceCapabilities): void {
    this.state.deviceCapabilities = capabilities;
    logger.debug('Device capabilities updated', {
      deviceId: capabilities.deviceId,
      deviceType: capabilities.deviceType,
    });
  }

  /**
   * Mark document as saved
   */
  markAsSaved(): void {
    this.state.isDirty = false;
    this.state.isSaving = false;
    this.state.lastSavedAt = new Date();
    
    logger.debug('Document marked as saved', {
      documentId: this.state.document.id,
      version: this.state.document.version,
    });
  }

  /**
   * Mark document as syncing
   */
  markAsSyncing(isSyncing: boolean): void {
    this.state.isSyncing = isSyncing;
    if (!isSyncing) {
      this.state.lastSyncedAt = new Date();
    }
    
    logger.debug('Sync status updated', {
      documentId: this.state.document.id,
      isSyncing,
    });
  }

  /**
   * Mark document as saving
   */
  markAsSaving(isSaving: boolean): void {
    this.state.isSaving = isSaving;
    
    logger.debug('Save status updated', {
      documentId: this.state.document.id,
      isSaving,
    });
  }

  /**
   * Check if document is dirty
   */
  isDirty(): boolean {
    return this.state.isDirty;
  }

  /**
   * Check if document is being saved
   */
  isSaving(): boolean {
    return this.state.isSaving;
  }

  /**
   * Check if document is syncing
   */
  isSyncing(): boolean {
    return this.state.isSyncing;
  }

  /**
   * Get undo stack size
   */
  getUndoStackSize(): number {
    return this.state.undoStack.length;
  }

  /**
   * Get redo stack size
   */
  getRedoStackSize(): number {
    return this.state.redoStack.length;
  }

  /**
   * Reset state to initial document
   */
  reset(initialDocument: Document): void {
    this.state = {
      document: deepClone(initialDocument),
      selection: { start: 0, end: 0, direction: 'none' },
      isDirty: false,
      isSaving: false,
      isSyncing: false,
      undoStack: [],
      redoStack: [],
      deviceCapabilities: this.state.deviceCapabilities,
    };
    
    logger.info('Editor state reset', {
      documentId: initialDocument.id,
    });
  }
}
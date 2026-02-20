// Unified multi-device editor core (modular version)
// Phase 18 - Editor Core Module v2.0 (Modular)

import type { 
  Document, 
  EditorOperation, 
  EditorEventType,
  EditorEvent,
  Result,
  AsyncResult
} from '../../types';
import { logger, errorHandler, generateId } from '../../utils';
import type { SyncEngine } from '../../sync/SyncEngine';
import type { SupabaseClientWrapper } from '../../supabase/client';

// Import modular components
import type { EditorConfig, EditorState, EditorDependencies } from './types';
import { OperationManager } from './operations/OperationManager';
import { EditorStateManager } from './state/EditorStateManager';
import { EventManager } from './events/EventManager';
import { EditorSyncManager } from './sync/EditorSyncManager';

/**
 * Unified multi-device editor (modular version)
 */
export class UnifiedEditor {
  private config: EditorConfig;
  private dependencies: EditorDependencies;
  
  // Modular components
  private operationManager: OperationManager;
  private stateManager: EditorStateManager;
  private eventManager: EventManager;
  private syncManager: EditorSyncManager;

  constructor(
    initialDocument: Document,
    syncEngine: SyncEngine,
    supabaseClient: SupabaseClientWrapper,
    config: Partial<EditorConfig> = {}
  ) {
    // Set up dependencies
    this.dependencies = {
      syncEngine,
      supabaseClient,
      deviceId: generateId('device'),
      userId: supabaseClient.getCurrentUser()?.id || 'anonymous',
    };

    // Set up configuration
    this.config = {
      autoSave: config.autoSave ?? true,
      autoSaveInterval: config.autoSaveInterval || 30000,
      realtimeCollaboration: config.realtimeCollaboration ?? true,
      conflictDetection: config.conflictDetection ?? true,
      offlineMode: config.offlineMode ?? true,
      maxUndoSteps: config.maxUndoSteps || 100,
      deviceOptimization: config.deviceOptimization ?? true,
      debugMode: config.debugMode ?? false,
    };

    // Initialize modular components
    this.operationManager = new OperationManager();
    this.stateManager = new EditorStateManager(initialDocument, {
      maxUndoSteps: this.config.maxUndoSteps,
    });
    this.eventManager = new EventManager();
    this.syncManager = new EditorSyncManager(
      initialDocument.id,
      this.dependencies.userId,
      this.dependencies.deviceId,
      supabaseClient,
      syncEngine,
      {
        autoSave: this.config.autoSave,
        autoSaveInterval: this.config.autoSaveInterval,
        realtimeCollaboration: this.config.realtimeCollaboration,
      }
    );

    // Register document with sync engine
    if (this.config.realtimeCollaboration) {
      const registrationResult = this.syncManager.registerWithSyncEngine(initialDocument);
      if (!registrationResult.success) {
        const error = registrationResult.error
          ? (typeof registrationResult.error === 'string'
             ? new Error(registrationResult.error)
             : registrationResult.error)
          : new Error('Unknown registration error');
        logger.error('Failed to register document with sync engine', error, {
          documentId: initialDocument.id,
        });
      }
    }

    logger.info('Unified editor initialized (modular)', {
      documentId: initialDocument.id,
      deviceId: this.dependencies.deviceId,
      userId: this.dependencies.userId,
      config: this.config,
      modular: true,
    });
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  /**
   * Get current editor state
   */
  getState(): EditorState {
    return this.stateManager.getState();
  }

  /**
   * Get current document
   */
  getDocument(): Document {
    return this.stateManager.getDocument();
  }

  /**
   * Get document content
   */
  getContent(): string {
    return this.stateManager.getContent();
  }

  /**
   * Set document content
   */
  async setContent(content: string): AsyncResult<void> {
    return errorHandler.withErrorHandling(async () => {
      const oldContent = this.stateManager.getContent();
      
      if (content === oldContent) {
        return;
      }

      // Create replace operation
      const operation: EditorOperation = {
        id: generateId('op'),
        type: 'replace',
        position: 0,
        content: content,
        timestamp: Date.now(),
        deviceId: this.dependencies.deviceId,
        userId: this.dependencies.userId,
        documentId: this.stateManager.getDocument().id,
        version: this.stateManager.getDocument().version + 1,
        previousOperationId: this.stateManager.getLastOperationId(),
        metadata: {
          oldContentLength: oldContent.length,
        },
      };

      // Apply operation
      this.applyOperationInternal(operation);

      // Queue for synchronization
      if (this.config.realtimeCollaboration) {
        this.dependencies.syncEngine.queueOperation(operation);
      }

      this.eventManager.emitEvent('contentChanged', {
        documentId: this.stateManager.getDocument().id,
        operationId: operation.id,
        contentLength: content.length,
      });
    }, { operation: 'setContent', documentId: this.stateManager.getDocument().id });
  }

  /**
   * Insert text at position
   */
  async insertText(position: number, text: string): AsyncResult<void, Error> {
    return errorHandler.withErrorHandling(async () => {
      const document = this.stateManager.getDocument();
      
      if (position < 0 || position > document.content.length) {
        throw new Error(`Invalid insert position: ${position}`);
      }

      if (!text || text.length === 0) {
        return;
      }

      const operation: EditorOperation = {
        id: generateId('op'),
        type: 'insert',
        position: position,
        content: text,
        timestamp: Date.now(),
        deviceId: this.dependencies.deviceId,
        userId: this.dependencies.userId,
        documentId: document.id,
        version: document.version + 1,
        previousOperationId: this.stateManager.getLastOperationId(),
      };

      // Apply operation
      this.applyOperationInternal(operation);

      // Queue for synchronization
      if (this.config.realtimeCollaboration) {
        this.dependencies.syncEngine.queueOperation(operation);
      }

      // Update selection
      this.stateManager.setSelection(
        position + text.length,
        position + text.length,
        'none'
      );

      this.eventManager.emitEvent('contentChanged', {
        documentId: document.id,
        operationId: operation.id,
        type: 'insert',
        position,
        length: text.length,
      });
    }, { operation: 'insertText', documentId: this.stateManager.getDocument().id, position });
  }

  /**
   * Delete text from range
   */
  async deleteText(start: number, end: number): AsyncResult<void, Error> {
    return errorHandler.withErrorHandling(async () => {
      const document = this.stateManager.getDocument();
      
      if (start < 0 || end > document.content.length || start > end) {
        throw new Error(`Invalid delete range: ${start}-${end}`);
      }

      if (start === end) {
        return;
      }

      const deletedText = document.content.substring(start, end);

      const operation: EditorOperation = {
        id: generateId('op'),
        type: 'delete',
        position: start,
        content: deletedText,
        timestamp: Date.now(),
        deviceId: this.dependencies.deviceId,
        userId: this.dependencies.userId,
        documentId: document.id,
        version: document.version + 1,
        previousOperationId: this.stateManager.getLastOperationId(),
      };

      // Apply operation
      this.applyOperationInternal(operation);

      // Queue for synchronization
      if (this.config.realtimeCollaboration) {
        this.dependencies.syncEngine.queueOperation(operation);
      }

      // Update selection
      this.stateManager.setSelection(start, start, 'none');

      this.eventManager.emitEvent('contentChanged', {
        documentId: document.id,
        operationId: operation.id,
        type: 'delete',
        start,
        end,
        length: deletedText.length,
      });
    }, { operation: 'deleteText', documentId: this.stateManager.getDocument().id, start, end });
  }

  /**
   * Set text selection
   */
  async setSelection(start: number, end: number, direction: 'forward' | 'backward' | 'none' = 'none'): AsyncResult<void, Error> {
    return errorHandler.withErrorHandling(async () => {
      const contentLength = this.stateManager.getContent().length;
      
      if (start < 0 || start > contentLength || end < 0 || end > contentLength) {
        throw new Error(`Invalid selection range: ${start}-${end}`);
      }

      this.stateManager.setSelection(start, end, direction);

      this.eventManager.emitEvent('selectionChanged', {
        documentId: this.stateManager.getDocument().id,
        oldSelection: this.stateManager.getSelection(),
        newSelection: { start, end, direction },
      });
    }, { operation: 'setSelection', documentId: this.stateManager.getDocument().id, start, end });
  }

  /**
   * Get current selection
   */
  getSelection(): { start: number; end: number; direction: 'forward' | 'backward' | 'none' } {
    return this.stateManager.getSelection();
  }

  /**
   * Get selected text
   */
  getSelectedText(): string {
    return this.stateManager.getSelectedText();
  }

  /**
   * Apply formatting to selection
   */
  async applyFormatting(formatType: string, formatValue: any): AsyncResult<void, Error> {
    return errorHandler.withErrorHandling(async () => {
      const { start, end } = this.stateManager.getSelection();
      
      if (start === end) {
        return;
      }

      const operation: EditorOperation = {
        id: generateId('op'),
        type: 'format',
        position: start,
        content: JSON.stringify({ type: formatType, value: formatValue, range: [start, end] }),
        timestamp: Date.now(),
        deviceId: this.dependencies.deviceId,
        userId: this.dependencies.userId,
        documentId: this.stateManager.getDocument().id,
        version: this.stateManager.getDocument().version + 1,
        previousOperationId: this.stateManager.getLastOperationId(),
        metadata: { formatType, formatValue, range: [start, end] },
      };

      // Apply operation
      this.applyOperationInternal(operation);

      // Queue for synchronization
      if (this.config.realtimeCollaboration) {
        this.dependencies.syncEngine.queueOperation(operation);
      }

      this.eventManager.emitEvent('contentChanged', {
        documentId: this.stateManager.getDocument().id,
        operationId: operation.id,
        type: 'format',
        formatType,
        start,
        end,
      });
    }, { operation: 'applyFormatting', documentId: this.stateManager.getDocument().id, formatType });
  }

  /**
   * Undo last operation
   */
  async undo(): AsyncResult<void, Error> {
    return errorHandler.withErrorHandling(async () => {
      const operation = this.stateManager.popFromUndoStack();
      if (!operation) {
        return;
      }

      const inverseOperation = this.operationManager.createInverseOperation(operation);
      
      // Apply inverse operation
      const result = this.operationManager.applyOperation(
        this.stateManager.getDocument(),
        inverseOperation
      );

      if (result.success) {
        this.stateManager.updateDocument(result.updatedDocument, true);
        this.stateManager.addToUndoStack(inverseOperation);
      }

      this.eventManager.emitEvent('contentChanged', {
        documentId: this.stateManager.getDocument().id,
        operationId: inverseOperation.id,
        type: 'undo',
        undoneOperationId: operation.id,
      });
    }, { operation: 'undo', documentId: this.stateManager.getDocument().id });
  }

  /**
   * Redo last undone operation
   */
  async redo(): AsyncResult<void, Error> {
    return errorHandler.withErrorHandling(async () => {
      const operation = this.stateManager.popFromRedoStack();
      if (!operation) {
        return;
      }

      // Re-apply operation
      const result = this.operationManager.applyOperation(
        this.stateManager.getDocument(),
        operation
      );

      if (result.success) {
        this.stateManager.updateDocument(result.updatedDocument, true);
        this.stateManager.addToUndoStack(operation);
      }

      this.eventManager.emitEvent('contentChanged', {
        documentId: this.stateManager.getDocument().id,
        operationId: operation.id,
        type: 'redo',
      });
    }, { operation: 'redo', documentId: this.stateManager.getDocument().id });
  }

  /**
   * Save document
   */
  async save(): AsyncResult<void> {
    return errorHandler.withErrorHandling(async () => {
      if (!this.stateManager.isDirty()) {
        logger.debug('Document not dirty, skipping save', {
          documentId: this.stateManager.getDocument().id,
        });
        return;
      }

      this.stateManager.markAsSaving(true);
      this.eventManager.emitEvent('syncStarted', {
        documentId: this.stateManager.getDocument().id,
        type: 'save',
      });

      try {
        await this.syncManager.saveDocument(this.stateManager.getDocument());
        this.stateManager.markAsSaved();
        
        this.eventManager.emitEvent('syncCompleted', {
          documentId: this.stateManager.getDocument().id,
          type: 'save',
          version: this.stateManager.getDocument().version,
        });
      } catch (error) {
        this.eventManager.emitEvent('syncFailed', {
          documentId: this.stateManager.getDocument().id,
          type: 'save',
          error: error instanceof Error ? error.message : 'Save failed',
        });
        throw error;
      } finally {
        this.stateManager.markAsSaving(false);
      }
    }, { operation: 'save', documentId: this.stateManager.getDocument().id });
  }

  /**
   * Synchronize document with other devices
   */
  async sync(): AsyncResult<void> {
    return errorHandler.withErrorHandling(async () => {
      this.stateManager.markAsSyncing(true);
      this.eventManager.emitEvent('syncStarted', {
        documentId: this.stateManager.getDocument().id,
        type: 'sync',
      });

      try {
        await this.syncManager.syncDocument();
        this.stateManager.markAsSyncing(false);

        this.eventManager.emitEvent('syncCompleted', {
          documentId: this.stateManager.getDocument().id,
          type: 'sync',
        });
      } catch (error) {
        this.stateManager.markAsSyncing(false);
        
        this.eventManager.emitEvent('syncFailed', {
          documentId: this.stateManager.getDocument().id,
          type: 'sync',
          error: error instanceof Error ? error.message : 'Sync failed',
        });
        
        throw error;
      }
    }, { operation: 'sync', documentId: this.stateManager.getDocument().id });
  }

  /**
   * Add event listener
   */
  addEventListener(
    eventType: EditorEventType,
    listener: (event: EditorEvent) => void
  ): void {
    this.eventManager.addEventListener(eventType, listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(
    eventType: EditorEventType,
    listener: (event: EditorEvent) => void
  ): void {
    this.eventManager.removeEventListener(eventType, listener);
  }

  /**
   * Update editor configuration
   */
  updateConfig(newConfig: Partial<EditorConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    // Update sync manager configuration
    this.syncManager.updateConfig({
      autoSave: newConfig.autoSave,
      autoSaveInterval: newConfig.autoSaveInterval,
      realtimeCollaboration: newConfig.realtimeCollaboration,
    });

    // Update state manager configuration
    if (newConfig.maxUndoSteps !== undefined) {
      // Note: State manager doesn't have dynamic config update in current implementation
      // Would need to add that feature
    }

    logger.info('Editor configuration updated', {
      autoSaveChanged: newConfig.autoSave !== oldConfig.autoSave,
      autoSaveIntervalChanged: newConfig.autoSaveInterval !== oldConfig.autoSaveInterval,
      newAutoSaveInterval: this.config.autoSaveInterval,
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.syncManager.destroy();
    this.eventManager.clearAllEventListeners();
    
    logger.info('Editor destroyed (modular)', {
      documentId: this.stateManager.getDocument().id,
      deviceId: this.dependencies.deviceId,
    });
  }

  // ============================================================================
  // Internal Methods
  // ============================================================================

  /**
   * Apply operation internally (used by public methods)
   */
  private applyOperationInternal(operation: EditorOperation): void {
    // Validate operation
    const validation = this.operationManager.validateOperation(
      this.stateManager.getDocument(),
      operation
    );

    if (!validation.valid) {
      const error = new Error(validation.error || 'Invalid operation');
      logger.error('Invalid operation', error, {
        operationId: operation.id,
        documentId: this.stateManager.getDocument().id,
      });
      throw error;
    }

    // Apply operation
    const result = this.operationManager.applyOperation(
      this.stateManager.getDocument(),
      operation
    );

    if (result.success) {
      this.stateManager.updateDocument(result.updatedDocument, true);
      this.stateManager.addToUndoStack(operation);
      
      this.eventManager.emitEvent('operationApplied', {
        documentId: this.stateManager.getDocument().id,
        operationId: operation.id,
        type: operation.type,
        version: operation.version,
      });
    } else {
      const error = new Error(result.error || 'Operation application failed');
      logger.error('Failed to apply operation', error, {
        operationId: operation.id,
        documentId: this.stateManager.getDocument().id,
      });
      throw error;
    }
  }
}

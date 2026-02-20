// Factory functions for creating UnifiedEditor instances
// Provides convenient ways to create and configure editors

import type { 
  Document 
} from '../../../types';
import type { SyncEngine } from '../../../sync/SyncEngine';
import type { SupabaseClientWrapper } from '../../../supabase/client';
import type { EditorConfig } from '../types';
import { UnifiedEditor } from '../UnifiedEditor';
import { logger } from '../../../utils/logger';

/**
 * Factory configuration options
 */
export interface EditorFactoryOptions {
  defaultConfig?: Partial<EditorConfig>;
  enableLogging?: boolean;
  performanceMonitoring?: boolean;
}

/**
 * Editor factory for creating UnifiedEditor instances
 */
export class EditorFactory {
  private defaultConfig: Partial<EditorConfig>;
  private enableLogging: boolean;
  private performanceMonitoring: boolean;

  constructor(options: EditorFactoryOptions = {}) {
    this.defaultConfig = options.defaultConfig || {};
    this.enableLogging = options.enableLogging ?? true;
    this.performanceMonitoring = options.performanceMonitoring ?? false;

    if (this.enableLogging) {
      logger.info('Editor factory initialized', {
        defaultConfig: this.defaultConfig,
        performanceMonitoring: this.performanceMonitoring,
      });
    }
  }

  /**
   * Create a new UnifiedEditor instance
   */
  createEditor(
    initialDocument: Document,
    syncEngine: SyncEngine,
    supabaseClient: SupabaseClientWrapper,
    config: Partial<EditorConfig> = {}
  ): UnifiedEditor {
    const startTime = this.performanceMonitoring ? performance.now() : 0;
    
    const mergedConfig = { ...this.defaultConfig, ...config };
    
    const editor = new UnifiedEditor(
      initialDocument,
      syncEngine,
      supabaseClient,
      mergedConfig
    );

    if (this.performanceMonitoring) {
      const endTime = performance.now();
      logger.debug('Editor creation performance', {
        durationMs: endTime - startTime,
        documentId: initialDocument.id,
        configKeys: Object.keys(mergedConfig),
      });
    }

    if (this.enableLogging) {
      logger.info('Editor created', {
        documentId: initialDocument.id,
        config: mergedConfig,
      });
    }

    return editor;
  }

  /**
   * Create multiple editors for multiple documents
   */
  createEditors(
    documents: Document[],
    syncEngine: SyncEngine,
    supabaseClient: SupabaseClientWrapper,
    config: Partial<EditorConfig> = {}
  ): Map<string, UnifiedEditor> {
    const editors = new Map<string, UnifiedEditor>();
    const startTime = this.performanceMonitoring ? performance.now() : 0;

    documents.forEach(document => {
      const editor = this.createEditor(
        document,
        syncEngine,
        supabaseClient,
        config
      );
      editors.set(document.id, editor);
    });

    if (this.performanceMonitoring) {
      const endTime = performance.now();
      logger.debug('Batch editor creation performance', {
        durationMs: endTime - startTime,
        documentCount: documents.length,
        averageDurationMs: (endTime - startTime) / documents.length,
      });
    }

    if (this.enableLogging) {
      logger.info('Batch editors created', {
        documentCount: documents.length,
        documentIds: documents.map(d => d.id),
      });
    }

    return editors;
  }

  /**
   * Create editor with default configuration
   */
  createDefaultEditor(
    initialDocument: Document,
    syncEngine: SyncEngine,
    supabaseClient: SupabaseClientWrapper
  ): UnifiedEditor {
    return this.createEditor(
      initialDocument,
      syncEngine,
      supabaseClient,
      this.defaultConfig
    );
  }

  /**
   * Create editor with minimal configuration (no auto-save, no realtime)
   */
  createMinimalEditor(
    initialDocument: Document,
    syncEngine: SyncEngine,
    supabaseClient: SupabaseClientWrapper
  ): UnifiedEditor {
    const minimalConfig: Partial<EditorConfig> = {
      autoSave: false,
      realtimeCollaboration: false,
      conflictDetection: false,
      offlineMode: false,
      deviceOptimization: false,
      debugMode: false,
    };

    return this.createEditor(
      initialDocument,
      syncEngine,
      supabaseClient,
      minimalConfig
    );
  }

  /**
   * Create editor with collaborative configuration
   */
  createCollaborativeEditor(
    initialDocument: Document,
    syncEngine: SyncEngine,
    supabaseClient: SupabaseClientWrapper
  ): UnifiedEditor {
    const collaborativeConfig: Partial<EditorConfig> = {
      autoSave: true,
      autoSaveInterval: 15000, // 15 seconds
      realtimeCollaboration: true,
      conflictDetection: true,
      offlineMode: true,
      deviceOptimization: true,
      debugMode: false,
      maxUndoSteps: 200,
    };

    return this.createEditor(
      initialDocument,
      syncEngine,
      supabaseClient,
      collaborativeConfig
    );
  }

  /**
   * Create editor with debugging configuration
   */
  createDebugEditor(
    initialDocument: Document,
    syncEngine: SyncEngine,
    supabaseClient: SupabaseClientWrapper
  ): UnifiedEditor {
    const debugConfig: Partial<EditorConfig> = {
      autoSave: true,
      autoSaveInterval: 5000, // 5 seconds
      realtimeCollaboration: true,
      conflictDetection: true,
      offlineMode: true,
      deviceOptimization: true,
      debugMode: true,
      maxUndoSteps: 50,
    };

    return this.createEditor(
      initialDocument,
      syncEngine,
      supabaseClient,
      debugConfig
    );
  }

  /**
   * Update default configuration
   */
  updateDefaultConfig(newConfig: Partial<EditorConfig>): void {
    const oldConfig = { ...this.defaultConfig };
    this.defaultConfig = { ...this.defaultConfig, ...newConfig };

    if (this.enableLogging) {
      logger.info('Default editor configuration updated', {
        oldConfig,
        newConfig: this.defaultConfig,
        changedKeys: Object.keys(newConfig),
      });
    }
  }

  /**
   * Get current default configuration
   */
  getDefaultConfig(): Partial<EditorConfig> {
    return { ...this.defaultConfig };
  }

  /**
   * Reset to factory default configuration
   */
  resetDefaultConfig(): void {
    const oldConfig = this.defaultConfig;
    this.defaultConfig = {};

    if (this.enableLogging) {
      logger.info('Default configuration reset', {
        oldConfig,
      });
    }
  }
}

/**
 * Convenience function to create an editor factory
 */
export function createEditorFactory(options: EditorFactoryOptions = {}): EditorFactory {
  return new EditorFactory(options);
}

/**
 * Global editor factory instance
 */
export const defaultEditorFactory = createEditorFactory({
  defaultConfig: {
    autoSave: true,
    autoSaveInterval: 30000,
    realtimeCollaboration: true,
    conflictDetection: true,
    offlineMode: true,
    maxUndoSteps: 100,
    deviceOptimization: true,
    debugMode: false,
  },
  enableLogging: true,
  performanceMonitoring: false,
});

/**
 * Convenience function to create an editor using the default factory
 */
export function createEditor(
  document: Document,
  syncEngine: SyncEngine,
  supabaseClient: SupabaseClientWrapper,
  config?: Partial<EditorConfig>
): UnifiedEditor {
  return defaultEditorFactory.createEditor(document, syncEngine, supabaseClient, config);
}
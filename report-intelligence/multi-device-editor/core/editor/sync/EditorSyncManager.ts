// Synchronization management for UnifiedEditor
// Handles auto-save, document saving, and synchronization

import type { 
  Document,
  AsyncResult 
} from '../../../types';
import type { SupabaseClientWrapper } from '../../../supabase/client';
import type { SyncEngine } from '../../../sync/SyncEngine';
import { logger } from '../../../utils/logger';
import { errorHandler } from '../../../utils/errorHandler';

/**
 * Sync manager configuration
 */
export interface SyncManagerConfig {
  autoSave: boolean;
  autoSaveInterval: number;
  realtimeCollaboration: boolean;
}

/**
 * Editor synchronization manager
 */
export class EditorSyncManager {
  private config: SyncManagerConfig;
  private supabaseClient: SupabaseClientWrapper;
  private syncEngine: SyncEngine;
  private documentId: string;
  private userId: string;
  private deviceId: string;
  private autoSaveTimer: NodeJS.Timeout | null = null;

  constructor(
    documentId: string,
    userId: string,
    deviceId: string,
    supabaseClient: SupabaseClientWrapper,
    syncEngine: SyncEngine,
    config: Partial<SyncManagerConfig> = {}
  ) {
    this.documentId = documentId;
    this.userId = userId;
    this.deviceId = deviceId;
    this.supabaseClient = supabaseClient;
    this.syncEngine = syncEngine;

    this.config = {
      autoSave: config.autoSave ?? true,
      autoSaveInterval: config.autoSaveInterval || 30000,
      realtimeCollaboration: config.realtimeCollaboration ?? true,
    };

    if (this.config.autoSave) {
      this.startAutoSave();
    }
  }

  /**
   * Save document to Supabase
   */
  async saveDocument(document: Document): AsyncResult<void> {
    return errorHandler.withErrorHandling(async () => {
      logger.info('Saving document', {
        documentId: document.id,
        version: document.version,
        contentLength: document.content.length,
      });

      // Update document metadata
      const documentToSave = {
        ...document,
        updatedAt: new Date(),
        updatedBy: this.userId,
        deviceId: this.deviceId,
      };

      // Save to Supabase
      const result = await this.supabaseClient.query(
        'documents',
        'upsert',
        {
          id: documentToSave.id,
          title: documentToSave.title,
          content: documentToSave.content,
          metadata: documentToSave.metadata,
          version: documentToSave.version,
          updated_at: documentToSave.updatedAt.toISOString(),
          updated_by: documentToSave.updatedBy,
          device_id: documentToSave.deviceId,
        }
      );

      if (!result.success) {
        throw new Error(`Failed to save document: ${result.error?.message}`);
      }

      logger.info('Document saved successfully', {
        documentId: document.id,
        version: document.version,
      });

      // Return void (no value)
      return;
    }, {
      operation: 'saveDocument',
      documentId: this.documentId,
      userId: this.userId
    });
  }

  /**
   * Synchronize document with other devices
   */
  async syncDocument(): AsyncResult<void> {
    return errorHandler.withErrorHandling(async () => {
      if (!this.config.realtimeCollaboration) {
        logger.debug('Realtime collaboration disabled, skipping sync', {
          documentId: this.documentId,
        });
        return;
      }

      logger.info('Synchronizing document', {
        documentId: this.documentId,
      });

      await this.syncEngine.syncDocument(this.documentId);

      logger.info('Document synchronized', {
        documentId: this.documentId,
      });

      // Return void (no value)
      return;
    }, {
      operation: 'syncDocument',
      documentId: this.documentId
    });
  }

  /**
   * Start auto-save timer
   */
  startAutoSave(): void {
    if (this.config.autoSave && this.config.autoSaveInterval > 0) {
      this.stopAutoSave(); // Stop any existing timer
      
      this.autoSaveTimer = setInterval(() => {
        logger.debug('Auto-save timer triggered', {
          documentId: this.documentId,
          interval: this.config.autoSaveInterval,
        });
        
        // Note: The actual save logic would be triggered by the parent editor
        // This just emits an event or calls a callback
      }, this.config.autoSaveInterval);

      logger.info('Auto-save timer started', {
        documentId: this.documentId,
        interval: this.config.autoSaveInterval,
      });
    }
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      logger.debug('Auto-save timer stopped', {
        documentId: this.documentId,
      });
    }
  }

  /**
   * Update synchronization configuration
   */
  updateConfig(newConfig: Partial<SyncManagerConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    // Restart auto-save timer if interval changed
    if (newConfig.autoSaveInterval && newConfig.autoSaveInterval !== oldConfig.autoSaveInterval) {
      this.stopAutoSave();
      if (this.config.autoSave) {
        this.startAutoSave();
      }
    }

    // Start/stop auto-save based on config change
    if (newConfig.autoSave !== undefined && newConfig.autoSave !== oldConfig.autoSave) {
      if (newConfig.autoSave) {
        this.startAutoSave();
      } else {
        this.stopAutoSave();
      }
    }

    logger.info('Sync configuration updated', {
      documentId: this.documentId,
      autoSaveChanged: newConfig.autoSave !== oldConfig.autoSave,
      autoSaveIntervalChanged: newConfig.autoSaveInterval !== oldConfig.autoSaveInterval,
      realtimeCollaborationChanged: newConfig.realtimeCollaboration !== oldConfig.realtimeCollaboration,
    });
  }

  /**
   * Register document with sync engine
   */
  registerWithSyncEngine(document: Document): { success: boolean; error?: string } {
    if (!this.config.realtimeCollaboration) {
      return { success: true };
    }

    try {
      const result = this.syncEngine.registerDocument(document);
      if (!result.success) {
        logger.error('Failed to register document with sync engine', result.error, {
          documentId: document.id,
        });
        return { success: false, error: result.error?.message };
      }

      logger.info('Document registered with sync engine', {
        documentId: document.id,
      });
      
      return { success: true };
    } catch (error) {
      logger.error('Error registering document with sync engine', error as Error, {
        documentId: document.id,
      });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }

  /**
   * Unregister document from sync engine
   */
  unregisterFromSyncEngine(): void {
    if (this.config.realtimeCollaboration) {
      this.syncEngine.unregisterDocument(this.documentId);
      logger.info('Document unregistered from sync engine', {
        documentId: this.documentId,
      });
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): SyncManagerConfig {
    return { ...this.config };
  }

  /**
   * Check if auto-save is enabled
   */
  isAutoSaveEnabled(): boolean {
    return this.config.autoSave;
  }

  /**
   * Check if realtime collaboration is enabled
   */
  isRealtimeCollaborationEnabled(): boolean {
    return this.config.realtimeCollaboration;
  }

  /**
   * Get auto-save interval
   */
  getAutoSaveInterval(): number {
    return this.config.autoSaveInterval;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopAutoSave();
    this.unregisterFromSyncEngine();
    logger.info('Sync manager destroyed', {
      documentId: this.documentId,
    });
  }
}
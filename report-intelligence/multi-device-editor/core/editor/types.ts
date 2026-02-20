// Editor-specific type definitions
// Extracted from UnifiedEditor.ts for modular architecture

import type { 
  Document, 
  EditorOperation, 
  EditorEventType,
  EditorEvent,
  DeviceCapabilities,
  Result,
  AsyncResult
} from '../../types';
import type { SyncEngine } from '../../sync/SyncEngine';
import type { SupabaseClientWrapper } from '../../supabase/client';

/**
 * Editor configuration
 */
export interface EditorConfig {
  autoSave: boolean;
  autoSaveInterval: number;
  realtimeCollaboration: boolean;
  conflictDetection: boolean;
  offlineMode: boolean;
  maxUndoSteps: number;
  deviceOptimization: boolean;
  debugMode: boolean;
}

/**
 * Editor state
 */
export interface EditorState {
  document: Document;
  selection: {
    start: number;
    end: number;
    direction: 'forward' | 'backward' | 'none';
  };
  isDirty: boolean;
  isSaving: boolean;
  isSyncing: boolean;
  lastSavedAt?: Date;
  lastSyncedAt?: Date;
  undoStack: EditorOperation[];
  redoStack: EditorOperation[];
  deviceCapabilities?: DeviceCapabilities;
}

/**
 * Unified editor dependencies
 */
export interface EditorDependencies {
  syncEngine: SyncEngine;
  supabaseClient: SupabaseClientWrapper;
  deviceId: string;
  userId: string;
}

/**
 * Editor initialization options
 */
export interface EditorInitOptions {
  initialDocument: Document;
  config?: Partial<EditorConfig>;
  dependencies: EditorDependencies;
}
// Unified Editor Module - Main Exports
// Phase 18 - Modular Editor Architecture

// Core editor
export { UnifiedEditor } from './UnifiedEditor';
export type { EditorConfig, EditorState, EditorDependencies, EditorInitOptions } from './types';

// Modular components
export { OperationManager } from './operations/OperationManager';
export type { OperationApplicationResult } from './operations/OperationManager';

export { EditorStateManager } from './state/EditorStateManager';
export type { StateManagerConfig } from './state/EditorStateManager';

export { EventManager } from './events/EventManager';
export type { EventListener } from './events/EventManager';

export { EditorSyncManager } from './sync/EditorSyncManager';
export type { SyncManagerConfig } from './sync/EditorSyncManager';

export { EditorFactory, createEditorFactory, defaultEditorFactory, createEditor } from './factory/editorFactory';
export type { EditorFactoryOptions } from './factory/editorFactory';

// Convenience exports
export * from './types';
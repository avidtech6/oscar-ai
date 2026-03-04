/**
 * Global Assistant Intelligence Layer – exports.
 *
 * This module exports the core assistant components for use across the application.
 */

export * from './AssistantTypes';
export { assistantStore as AssistantStore, assistantActions as AssistantActions } from './AssistantStore';
export { assistantEventBus as AssistantEventBus } from './AssistantEventBus';
export { assistantModeManager as AssistantModeManager } from './AssistantModeManager';
export * from './MultiSelectAIActions';
export * from './ContextualChatHistory';

// Svelte components are not exported via TypeScript modules; they are imported directly.
// However, we can export them as component references if needed for dynamic imports.
// For now, we only export the logic modules.

console.log('[Assistant Intelligence Layer] loaded');
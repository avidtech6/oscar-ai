/**
 * Media Intelligence Layer – exports and initialisation.
 */
export * from './MediaTypes';
export * from './GalleryDB';
export * from './MediaIngestionPipeline';
export * from './MediaEventBus';
export * from './MediaAwareContextMode';
export * from './VoiceNotePipeline';
export * from './MediaNudgeSystem';
export * from './PromptBoxMediaControls.svelte';
export * from './GalleryUI.svelte';

// Import the bridge to connect media events to the assistant
import './MediaAssistantBridge';

console.log('[Media Intelligence Layer] loaded');
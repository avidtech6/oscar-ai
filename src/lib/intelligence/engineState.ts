/**
 * Intelligence Engine State - Layer 2 Presentation
 *
 * This file defines state management interfaces and types for the intelligence engine.
 *
 * NOTE: State management has been extracted to Layer 1 Core for purity.
 * This file now re-exports the state management from Layer 1 to maintain compatibility.
 */

// Re-export state management from Layer 1 Core
export type {
	IntelligenceEngineState,
	IntelligenceEngineConfig,
} from './layer1/intelligenceEngineState.js';

export {
	DEFAULT_ENGINE_CONFIG,
	createEngineState,
	updateEngineState,
	resetEngineState,
	isValidEngineState,
	EngineStateUtils,
} from './layer1/intelligenceEngineState.js';
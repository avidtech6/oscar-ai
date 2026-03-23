/**
 * Intelligence Engine State - Layer 1 Core
 * 
 * This file defines state management interfaces and types for the intelligence engine.
 * Extracted from src/lib/intelligence/engineState.ts for Layer 1 Core purity.
 */

/**
 * Engine state interface
 */
export interface IntelligenceEngineState {
	/** Whether the engine is initialized */
	initialized: boolean;
	/** Number of loaded phase files */
	phaseCount: number;
	/** Number of parsed metadata entries */
	metadataCount: number;
	/** Number of extracted report types */
	reportTypes: number;
	/** Number of extracted workflow definitions */
	workflows: number;
	/** Number of extracted schema mappings */
	schemaMappings: number;
	/** Last initialization timestamp */
	lastInitialized?: Date;
	/** Error state if any */
	error?: string;
}

/**
 * Engine configuration interface
 */
export interface IntelligenceEngineConfig {
	/** Phase file directory path */
	phaseDirectory: string;
	/** Enable verbose logging */
	verbose: boolean;
	/** Cache configuration */
	cache: {
		/** Enable metadata caching */
		enabled: boolean;
		/** Cache expiration time in milliseconds */
		ttl: number;
	};
	/** Search configuration */
	search: {
		/** Enable fuzzy search */
		fuzzy: boolean;
		/** Maximum search results */
		maxResults: number;
	};
}

/**
 * Default engine configuration
 */
export const DEFAULT_ENGINE_CONFIG: IntelligenceEngineConfig = {
	phaseDirectory: './phases',
	verbose: false,
	cache: {
		enabled: true,
		ttl: 300000, // 5 minutes
	},
	search: {
		fuzzy: true,
		maxResults: 50,
	},
};

/**
 * Engine state factory function
 */
export function createEngineState(
	config: IntelligenceEngineConfig = DEFAULT_ENGINE_CONFIG
): IntelligenceEngineState {
	return {
		initialized: false,
		phaseCount: 0,
		metadataCount: 0,
		reportTypes: 0,
		workflows: 0,
		schemaMappings: 0,
		error: undefined,
	};
}

/**
 * Update engine state with new data
 */
export function updateEngineState(
	current: IntelligenceEngineState,
	updates: Partial<IntelligenceEngineState>
): IntelligenceEngineState {
	return {
		...current,
		...updates,
		lastInitialized: new Date(),
	};
}

/**
 * Reset engine state to initial state
 */
export function resetEngineState(
	config: IntelligenceEngineConfig = DEFAULT_ENGINE_CONFIG
): IntelligenceEngineState {
	return createEngineState(config);
}

/**
 * Check if engine state is valid
 */
export function isValidEngineState(state: IntelligenceEngineState): boolean {
	return (
		state !== null &&
		typeof state === 'object' &&
		typeof state.initialized === 'boolean' &&
		typeof state.phaseCount === 'number' &&
		typeof state.metadataCount === 'number' &&
		typeof state.reportTypes === 'number' &&
		typeof state.workflows === 'number' &&
		typeof state.schemaMappings === 'number'
	);
}

/**
 * Engine state utilities
 */
export const EngineStateUtils = {
	/** Create initial state */
	create: createEngineState,
	/** Update existing state */
	update: updateEngineState,
	/** Reset state */
	reset: resetEngineState,
	/** Validate state */
	validate: isValidEngineState,
};
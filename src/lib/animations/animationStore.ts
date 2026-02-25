/**
 * Animation Store
 * 
 * Central store for animation state and coordination
 */

import { writable, derived } from 'svelte/store';
import { prefersReducedMotion, getSafeDuration } from './sharedTransitions';
import { isDesktop } from './desktopTransitions';
import { isMobile } from './mobileTransitions';

// Types
export interface AnimationState {
	enabled: boolean;
	reducedMotion: boolean;
	performanceMode: 'auto' | 'high' | 'low';
	currentAnimations: string[];
	lastAnimationTime: number;
	animationQueue: Array<{
		id: string;
		elementId: string;
		type: string;
		priority: number;
	}>;
}

export interface AnimationConfig {
	enableAnimations: boolean;
	reduceMotion: boolean;
	performanceMode: 'auto' | 'high' | 'low';
	desktopDurationMultiplier: number;
	mobileDurationMultiplier: number;
	disableOnBattery: boolean;
	disableOnSlowDevices: boolean;
}

// Default configuration
const defaultConfig: AnimationConfig = {
	enableAnimations: true,
	reduceMotion: prefersReducedMotion(),
	performanceMode: 'auto',
	desktopDurationMultiplier: 1.0,
	mobileDurationMultiplier: 0.7,
	disableOnBattery: false,
	disableOnSlowDevices: true
};

// Initial state
const initialState: AnimationState = {
	enabled: defaultConfig.enableAnimations && !defaultConfig.reduceMotion,
	reducedMotion: defaultConfig.reduceMotion,
	performanceMode: defaultConfig.performanceMode,
	currentAnimations: [],
	lastAnimationTime: Date.now(),
	animationQueue: []
};

// Create store
const { subscribe, update, set } = writable<AnimationState>(initialState);

// Store methods
export const animationStore = {
	subscribe,
	
	// Enable/disable animations
	enableAnimations: () => update(state => ({
		...state,
		enabled: true
	})),
	
	disableAnimations: () => update(state => ({
		...state,
		enabled: false
	})),
	
	toggleAnimations: () => update(state => ({
		...state,
		enabled: !state.enabled
	})),
	
	// Set reduced motion preference
	setReducedMotion: (reduce: boolean) => update(state => ({
		...state,
		reducedMotion: reduce,
		enabled: reduce ? false : state.enabled
	})),
	
	// Set performance mode
	setPerformanceMode: (mode: 'auto' | 'high' | 'low') => update(state => ({
		...state,
		performanceMode: mode
	})),
	
	// Track animation start
	startAnimation: (animationId: string, elementId: string, type: string, priority: number = 1) => {
		update(state => {
			const newAnimation = {
				id: animationId,
				elementId,
				type,
				priority
			};
			
			// Add to current animations
			const currentAnimations = [...state.currentAnimations, animationId];
			
			// Add to queue if needed
			let animationQueue = [...state.animationQueue];
			
			// Remove any existing animation with same ID
			animationQueue = animationQueue.filter(anim => anim.id !== animationId);
			
			// Add new animation
			animationQueue.push(newAnimation);
			
			// Sort by priority (higher priority first)
			animationQueue.sort((a, b) => b.priority - a.priority);
			
			return {
				...state,
				currentAnimations,
				animationQueue,
				lastAnimationTime: Date.now()
			};
		});
	},
	
	// Track animation end
	endAnimation: (animationId: string) => {
		update(state => {
			const currentAnimations = state.currentAnimations.filter(id => id !== animationId);
			const animationQueue = state.animationQueue.filter(anim => anim.id !== animationId);
			
			return {
				...state,
				currentAnimations,
				animationQueue
			};
		});
	},
	
	// Clear all animations
	clearAnimations: () => update(state => ({
		...state,
		currentAnimations: [],
		animationQueue: []
	})),
	
	// Check if animations are currently running
	isAnimating: (): boolean => {
		let animating = false;
		subscribe(state => {
			animating = state.currentAnimations.length > 0;
		})();
		return animating;
	},
	
	// Get animation count
	getAnimationCount: (): number => {
		let count = 0;
		subscribe(state => {
			count = state.currentAnimations.length;
		})();
		return count;
	},
	
	// Check if specific animation is running
	isAnimationRunning: (animationId: string): boolean => {
		let running = false;
		subscribe(state => {
			running = state.currentAnimations.includes(animationId);
		})();
		return running;
	},
	
	// Get animation duration with all considerations
	getAdjustedDuration: (baseDuration: number): number => {
		let adjustedDuration = baseDuration;
		
		subscribe(state => {
			// Apply reduced motion
			if (state.reducedMotion || !state.enabled) {
				adjustedDuration = 0;
				return;
			}
			
			// Apply performance mode adjustments
			switch (state.performanceMode) {
				case 'high':
					adjustedDuration = baseDuration * 0.5;
					break;
				case 'low':
					adjustedDuration = baseDuration * 1.5;
					break;
				case 'auto':
				default:
					// Auto mode - adjust based on device capabilities
					adjustedDuration = getSafeDuration(baseDuration);
					
					// Further adjust for mobile/desktop
					if (isMobile()) {
						adjustedDuration = Math.max(adjustedDuration * 0.7, 100);
					} else if (isDesktop()) {
						adjustedDuration = Math.max(adjustedDuration * 1.0, 150);
					}
					break;
			}
		})();
		
		return adjustedDuration;
	},
	
	// Wait for all animations to complete
	waitForAnimations: async (timeout: number = 5000): Promise<void> => {
		return new Promise((resolve, reject) => {
			const startTime = Date.now();
			
			const checkAnimations = () => {
				subscribe(state => {
					if (state.currentAnimations.length === 0) {
						resolve();
						return;
					}
					
					if (Date.now() - startTime > timeout) {
						reject(new Error(`Animation timeout after ${timeout}ms`));
						return;
					}
					
					// Check again in next frame
					requestAnimationFrame(checkAnimations);
				})();
			};
			
			checkAnimations();
		});
	},
	
	// Batch animation control
	pauseAnimations: () => {
		// This would need to interact with CSS animations/transitions
		// For now, we just disable animations
		update(state => ({
			...state,
			enabled: false
		}));
		
		// Dispatch event for components to pause animations
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('animations-paused'));
		}
	},
	
	resumeAnimations: () => {
		update(state => ({
			...state,
			enabled: true
		}));
		
		// Dispatch event for components to resume animations
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('animations-resumed'));
		}
	},
	
	// Update configuration
	updateConfig: (config: Partial<AnimationConfig>) => {
		update(state => {
			const newConfig = { ...defaultConfig, ...config };
			
			return {
				...state,
				enabled: newConfig.enableAnimations && !newConfig.reduceMotion,
				reducedMotion: newConfig.reduceMotion,
				performanceMode: newConfig.performanceMode
			};
		});
	},
	
	// Reset to defaults
	reset: () => {
		set(initialState);
	},
	
	// Get current state snapshot
	getState: (): AnimationState => {
		let state: AnimationState = initialState;
		subscribe(s => {
			state = s;
		})();
		return state;
	}
};

// Derived stores
export const isAnimationsEnabled = derived(
	animationStore,
	$store => $store.enabled
);

export const isReducedMotion = derived(
	animationStore,
	$store => $store.reducedMotion
);

export const currentAnimationCount = derived(
	animationStore,
	$store => $store.currentAnimations.length
);

export const animationQueueLength = derived(
	animationStore,
	$store => $store.animationQueue.length
);

export const lastAnimationTimestamp = derived(
	animationStore,
	$store => $store.lastAnimationTime
);

// Helper functions
export function shouldAnimate(): boolean {
	let should = true;
	
	subscribe(state => {
		should = state.enabled && !state.reducedMotion;
		
		// Additional checks
		if (state.performanceMode === 'low') {
			// In low performance mode, limit animations
			should = should && state.currentAnimations.length < 3;
		}
	})();
	
	return should;
}

export function getAnimationPriority(type: string): number {
	// Define priority levels for different animation types
	const priorities: Record<string, number> = {
		// High priority - user interactions
		'tap-feedback': 10,
		'swipe': 9,
		'hover': 8,
		
		// Medium priority - UI transitions
		'panel-open': 7,
		'panel-close': 7,
		'modal-open': 7,
		'modal-close': 7,
		'drawer-open': 7,
		'drawer-close': 7,
		
		// Low priority - decorative animations
		'loading': 5,
		'pulse': 4,
		'skeleton': 3,
		'background': 2,
		
		// Default
		'default': 1
	};
	
	return priorities[type] || priorities.default;
}

export function generateAnimationId(prefix: string = 'anim'): string {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize store with device detection
export function initAnimationStore() {
	if (typeof window === 'undefined') return;
	
	// Check for battery saving mode
	if ('getBattery' in navigator) {
		(navigator as any).getBattery().then((battery: any) => {
			if (battery.charging === false && battery.level < 0.2) {
				// Low battery - reduce animations
				animationStore.updateConfig({
					disableOnBattery: true,
					performanceMode: 'low'
				});
			}
		});
	}
	
	// Check for slow devices (based on hardware concurrency)
	if ('hardwareConcurrency' in navigator) {
		const cores = navigator.hardwareConcurrency;
		if (cores < 4) {
			// Limited CPU cores - reduce animations
			animationStore.updateConfig({
				disableOnSlowDevices: true,
				performanceMode: 'low'
			});
		}
	}
	
	// Listen for reduced motion preference changes
	const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	
	const handleReducedMotionChange = (event: MediaQueryListEvent) => {
		animationStore.setReducedMotion(event.matches);
	};
	
	mediaQuery.addEventListener('change', handleReducedMotionChange);
	
	// Cleanup function
	return () => {
		mediaQuery.removeEventListener('change', handleReducedMotionChange);
	};
}

// Export default
export default {
	store: animationStore,
	init: initAnimationStore,
	shouldAnimate,
	getAnimationPriority,
	generateAnimationId,
	isAnimationsEnabled,
	isReducedMotion,
	currentAnimationCount
};
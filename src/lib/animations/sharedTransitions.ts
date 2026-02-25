/**
 * Shared Animation Transitions
 * 
 * Common animation utilities used across desktop and mobile
 */

// Animation timing functions
export const timingFunctions = {
	linear: 'linear',
	ease: 'ease',
	easeIn: 'ease-in',
	easeOut: 'ease-out',
	easeInOut: 'ease-in-out',
	cubicBezier: (x1: number, y1: number, x2: number, y2: number) => 
		`cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`,
	
	// Material Design easing curves
	materialStandard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
	materialDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
	materialAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
	materialSharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
	
	// iOS easing curves
	iosDefault: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
	iosSpring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
};

// Animation durations
export const durations = {
	instant: 0,
	fastest: 100,
	faster: 150,
	fast: 200,
	normal: 300,
	slow: 500,
	slower: 700,
	slowest: 1000
};

// Animation delays
export const delays = {
	none: 0,
	short: 50,
	medium: 100,
	long: 200,
	xlong: 500
};

// Animation presets
export interface AnimationPreset {
	name: string;
	duration: number;
	timing: string;
	properties: string[];
}

export const presets: Record<string, AnimationPreset> = {
	fadeIn: {
		name: 'fadeIn',
		duration: durations.normal,
		timing: timingFunctions.materialStandard,
		properties: ['opacity']
	},
	fadeOut: {
		name: 'fadeOut',
		duration: durations.fast,
		timing: timingFunctions.materialStandard,
		properties: ['opacity']
	},
	slideUp: {
		name: 'slideUp',
		duration: durations.normal,
		timing: timingFunctions.materialDecelerate,
		properties: ['transform', 'opacity']
	},
	slideDown: {
		name: 'slideDown',
		duration: durations.normal,
		timing: timingFunctions.materialDecelerate,
		properties: ['transform', 'opacity']
	},
	slideLeft: {
		name: 'slideLeft',
		duration: durations.normal,
		timing: timingFunctions.materialDecelerate,
		properties: ['transform', 'opacity']
	},
	slideRight: {
		name: 'slideRight',
		duration: durations.normal,
		timing: timingFunctions.materialDecelerate,
		properties: ['transform', 'opacity']
	},
	scaleUp: {
		name: 'scaleUp',
		duration: durations.normal,
		timing: timingFunctions.materialStandard,
		properties: ['transform', 'opacity']
	},
	scaleDown: {
		name: 'scaleDown',
		duration: durations.fast,
		timing: timingFunctions.materialStandard,
		properties: ['transform', 'opacity']
	},
	rotate: {
		name: 'rotate',
		duration: durations.slow,
		timing: timingFunctions.linear,
		properties: ['transform']
	},
	bounce: {
		name: 'bounce',
		duration: durations.slow,
		timing: timingFunctions.materialSharp,
		properties: ['transform']
	}
};

// CSS transition generator
export function createTransition(
	properties: string | string[],
	duration: number = durations.normal,
	timing: string = timingFunctions.materialStandard,
	delay: number = delays.none
): string {
	const props = Array.isArray(properties) ? properties : [properties];
	
	return props
		.map(prop => `${prop} ${duration}ms ${timing} ${delay}ms`)
		.join(', ');
}

// CSS animation generator
export function createAnimation(
	keyframes: string,
	duration: number = durations.normal,
	timing: string = timingFunctions.materialStandard,
	delay: number = delays.none,
	iterationCount: number | string = 1,
	fillMode: string = 'forwards'
): string {
	return `${keyframes} ${duration}ms ${timing} ${delay}ms ${iterationCount} ${fillMode}`;
}

// Get animation preset
export function getPreset(presetName: string): AnimationPreset {
	return presets[presetName] || presets.fadeIn;
}

// Apply animation to element
export function applyAnimation(
	element: HTMLElement,
	presetName: string,
	options: {
		onStart?: () => void;
		onComplete?: () => void;
		onCancel?: () => void;
	} = {}
): void {
	const preset = getPreset(presetName);
	
	// Set transition
	element.style.transition = createTransition(
		preset.properties,
		preset.duration,
		preset.timing
	);
	
	// Dispatch start event
	if (options.onStart) {
		options.onStart();
	}
	
	// Listen for transition end
	const handleTransitionEnd = (event: TransitionEvent) => {
		if (event.target === element && preset.properties.includes(event.propertyName)) {
			element.removeEventListener('transitionend', handleTransitionEnd);
			
			if (options.onComplete) {
				options.onComplete();
			}
		}
	};
	
	element.addEventListener('transitionend', handleTransitionEnd);
	
	// Listen for transition cancel
	const handleTransitionCancel = () => {
		element.removeEventListener('transitioncancel', handleTransitionCancel);
		
		if (options.onCancel) {
			options.onCancel();
		}
	};
	
	element.addEventListener('transitioncancel', handleTransitionCancel);
}

// Remove animation from element
export function removeAnimation(element: HTMLElement): void {
	element.style.transition = '';
	element.style.animation = '';
}

// Check if prefers reduced motion
export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Get animation duration with reduced motion consideration
export function getSafeDuration(baseDuration: number): number {
	return prefersReducedMotion() ? 0 : baseDuration;
}

// Debounced animation trigger
export function debouncedAnimation(
	element: HTMLElement,
	presetName: string,
	delay: number = delays.medium
): () => void {
	let timeoutId: NodeJS.Timeout;
	
	return () => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			applyAnimation(element, presetName);
		}, delay);
	};
}

// Sequential animations
export async function animateSequence(
	elements: HTMLElement[],
	presetName: string,
	options: {
		stagger?: number;
		parallel?: boolean;
	} = {}
): Promise<void> {
	const { stagger = 50, parallel = false } = options;
	
	if (parallel) {
		// All animations start at once
		elements.forEach(element => {
			applyAnimation(element, presetName);
		});
		return;
	}
	
	// Sequential animations
	for (let i = 0; i < elements.length; i++) {
		await new Promise<void>(resolve => {
			setTimeout(() => {
				applyAnimation(elements[i], presetName, {
					onComplete: resolve
				});
			}, i * stagger);
		});
	}
}

// Spring animation simulation (simplified)
export function springAnimation(
	element: HTMLElement,
	property: string,
	fromValue: number,
	toValue: number,
	options: {
		stiffness?: number;
		damping?: number;
		mass?: number;
	} = {}
): () => void {
	const { stiffness = 170, damping = 26, mass = 1 } = options;
	
	let animationId: number;
	let currentValue = fromValue;
	let velocity = 0;
	
	const animate = () => {
		const springForce = -stiffness * (currentValue - toValue);
		const dampingForce = -damping * velocity;
		const acceleration = (springForce + dampingForce) / mass;
		
		velocity += acceleration * 0.016; // 60fps frame time
		currentValue += velocity * 0.016;
		
		// Apply to element
		if (property === 'opacity') {
			element.style.opacity = currentValue.toString();
		} else if (property === 'transform') {
			element.style.transform = `translateY(${currentValue}px)`;
		} else {
			(element.style as any)[property] = `${currentValue}px`;
		}
		
		// Check if animation should continue
		if (Math.abs(currentValue - toValue) > 0.1 || Math.abs(velocity) > 0.1) {
			animationId = requestAnimationFrame(animate);
		}
	};
	
	animationId = requestAnimationFrame(animate);
	
	// Return cancel function
	return () => {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
	};
}

// Export default
export default {
	timingFunctions,
	durations,
	delays,
	presets,
	createTransition,
	createAnimation,
	getPreset,
	applyAnimation,
	removeAnimation,
	prefersReducedMotion,
	getSafeDuration,
	debouncedAnimation,
	animateSequence,
	springAnimation
};
/**
 * Desktop Animation Transitions
 * 
 * Desktop-specific animations for larger screens
 */

import {
	timingFunctions,
	durations,
	delays,
	createTransition,
	createAnimation,
	getPreset,
	applyAnimation,
	prefersReducedMotion,
	getSafeDuration
} from './sharedTransitions';

// Desktop-specific timing
export const desktopTiming = {
	...timingFunctions,
	// Desktop-specific easing
	desktopSmooth: 'cubic-bezier(0.2, 0.0, 0.0, 1)',
	desktopBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
};

// Desktop-specific durations (slightly longer for desktop)
export const desktopDurations = {
	...durations,
	panelOpen: 400,
	panelClose: 300,
	modalOpen: 350,
	modalClose: 250,
	sidebarSlide: 450,
	contextSwitch: 500
};

// Desktop animation presets
export const desktopPresets = {
	// Panel animations
	panelSlideIn: {
		name: 'panelSlideIn',
		duration: desktopDurations.panelOpen,
		timing: desktopTiming.desktopSmooth,
		properties: ['transform', 'opacity', 'box-shadow']
	},
	panelSlideOut: {
		name: 'panelSlideOut',
		duration: desktopDurations.panelClose,
		timing: desktopTiming.desktopSmooth,
		properties: ['transform', 'opacity']
	},
	
	// Modal animations
	modalFadeIn: {
		name: 'modalFadeIn',
		duration: desktopDurations.modalOpen,
		timing: desktopTiming.materialStandard,
		properties: ['opacity', 'transform']
	},
	modalFadeOut: {
		name: 'modalFadeOut',
		duration: desktopDurations.modalClose,
		timing: desktopTiming.materialStandard,
		properties: ['opacity', 'transform']
	},
	
	// Sidebar animations
	sidebarExpand: {
		name: 'sidebarExpand',
		duration: desktopDurations.sidebarSlide,
		timing: desktopTiming.desktopSmooth,
		properties: ['width', 'padding', 'margin']
	},
	sidebarCollapse: {
		name: 'sidebarCollapse',
		duration: desktopDurations.sidebarSlide,
		timing: desktopTiming.desktopSmooth,
		properties: ['width', 'padding', 'margin']
	},
	
	// Context switching
	contextFade: {
		name: 'contextFade',
		duration: desktopDurations.contextSwitch,
		timing: desktopTiming.materialStandard,
		properties: ['opacity', 'filter']
	},
	
	// Hover effects
	hoverLift: {
		name: 'hoverLift',
		duration: 200,
		timing: desktopTiming.materialStandard,
		properties: ['transform', 'box-shadow']
	},
	hoverColorShift: {
		name: 'hoverColorShift',
		duration: 150,
		timing: desktopTiming.materialStandard,
		properties: ['background-color', 'color', 'border-color']
	},
	
	// Loading states
	loadingPulse: {
		name: 'loadingPulse',
		duration: 1000,
		timing: desktopTiming.easeInOut,
		properties: ['opacity']
	},
	loadingSkeleton: {
		name: 'loadingSkeleton',
		duration: 1200,
		timing: desktopTiming.easeInOut,
		properties: ['background-position']
	}
};

// Context Panel animations
export function animateContextPanel(
	element: HTMLElement,
	action: 'open' | 'close' | 'toggle',
	options: {
		onComplete?: () => void;
		direction?: 'left' | 'right';
	} = {}
): void {
	const { onComplete, direction = 'right' } = options;
	const presetName = action === 'open' || action === 'toggle' ? 'panelSlideIn' : 'panelSlideOut';
	
	// Set initial state
	if (action === 'open') {
		element.style.transform = direction === 'right' 
			? 'translateX(100%)' 
			: 'translateX(-100%)';
		element.style.opacity = '0';
	}
	
	// Apply animation
	applyAnimation(element, presetName, {
		onComplete: () => {
			if (action === 'close') {
				element.style.transform = direction === 'right' 
					? 'translateX(100%)' 
					: 'translateX(-100%)';
				element.style.opacity = '0';
			} else {
				element.style.transform = 'translateX(0)';
				element.style.opacity = '1';
			}
			
			if (onComplete) {
				onComplete();
			}
		}
	});
	
	// Trigger reflow
	element.getBoundingClientRect();
	
	// Set final state for animation to work
	if (action === 'open') {
		element.style.transform = 'translateX(0)';
		element.style.opacity = '1';
	}
}

// Modal animations
export function animateModal(
	element: HTMLElement,
	action: 'open' | 'close',
	options: {
		onComplete?: () => void;
		backdropElement?: HTMLElement;
	} = {}
): void {
	const { onComplete, backdropElement } = options;
	const presetName = action === 'open' ? 'modalFadeIn' : 'modalFadeOut';
	
	// Animate backdrop if provided
	if (backdropElement) {
		applyAnimation(backdropElement, action === 'open' ? 'fadeIn' : 'fadeOut');
	}
	
	// Set initial state
	if (action === 'open') {
		element.style.opacity = '0';
		element.style.transform = 'scale(0.95) translateY(20px)';
	}
	
	// Apply animation
	applyAnimation(element, presetName, {
		onComplete: () => {
			if (action === 'close') {
				element.style.opacity = '0';
				element.style.transform = 'scale(0.95) translateY(20px)';
				element.style.pointerEvents = 'none';
			} else {
				element.style.opacity = '1';
				element.style.transform = 'scale(1) translateY(0)';
				element.style.pointerEvents = 'auto';
			}
			
			if (onComplete) {
				onComplete();
			}
		}
	});
	
	// Trigger reflow
	element.getBoundingClientRect();
	
	// Set final state for animation to work
	if (action === 'open') {
		element.style.opacity = '1';
		element.style.transform = 'scale(1) translateY(0)';
	}
}

// Sidebar animations
export function animateSidebar(
	element: HTMLElement,
	action: 'expand' | 'collapse',
	options: {
		onComplete?: () => void;
		initialWidth?: string;
		finalWidth?: string;
	} = {}
): void {
	const { onComplete, initialWidth = '64px', finalWidth = '240px' } = options;
	const presetName = action === 'expand' ? 'sidebarExpand' : 'sidebarCollapse';
	
	// Store current width
	const currentWidth = element.style.width || getComputedStyle(element).width;
	
	// Set initial state
	if (action === 'expand') {
		element.style.width = initialWidth;
		element.style.overflow = 'hidden';
	}
	
	// Apply animation
	applyAnimation(element, presetName, {
		onComplete: () => {
			element.style.width = action === 'expand' ? finalWidth : initialWidth;
			element.style.overflow = 'visible';
			
			if (onComplete) {
				onComplete();
			}
		}
	});
	
	// Trigger reflow
	element.getBoundingClientRect();
	
	// Set final state for animation to work
	element.style.width = action === 'expand' ? finalWidth : initialWidth;
}

// Context switching animation
export function animateContextSwitch(
	outElement: HTMLElement,
	inElement: HTMLElement,
	options: {
		direction?: 'left' | 'right' | 'up' | 'down';
		onComplete?: () => void;
	} = {}
): void {
	const { direction = 'right', onComplete } = options;
	
	// Calculate translate values based on direction
	let outTranslate = '0';
	let inTranslate = '0';
	
	switch (direction) {
		case 'left':
			outTranslate = 'translateX(100%)';
			inTranslate = 'translateX(-100%)';
			break;
		case 'right':
			outTranslate = 'translateX(-100%)';
			inTranslate = 'translateX(100%)';
			break;
		case 'up':
			outTranslate = 'translateY(100%)';
			inTranslate = 'translateY(-100%)';
			break;
		case 'down':
			outTranslate = 'translateY(-100%)';
			inTranslate = 'translateY(100%)';
			break;
	}
	
	// Position elements
	outElement.style.transform = 'translateX(0)';
	outElement.style.opacity = '1';
	inElement.style.transform = inTranslate;
	inElement.style.opacity = '0';
	inElement.style.position = 'absolute';
	inElement.style.top = '0';
	inElement.style.left = '0';
	inElement.style.width = '100%';
	
	// Animate out
	applyAnimation(outElement, 'contextFade', {
		onComplete: () => {
			outElement.style.transform = outTranslate;
			outElement.style.opacity = '0';
			outElement.style.pointerEvents = 'none';
			
			// Animate in
			applyAnimation(inElement, 'contextFade', {
				onComplete: () => {
					inElement.style.transform = 'translateX(0)';
					inElement.style.opacity = '1';
					inElement.style.position = 'relative';
					
					if (onComplete) {
						onComplete();
					}
				}
			});
			
			// Trigger reflow
			inElement.getBoundingClientRect();
			
			// Set final state for animation to work
			inElement.style.transform = 'translateX(0)';
			inElement.style.opacity = '1';
		}
	});
	
	// Trigger reflow
	outElement.getBoundingClientRect();
	
	// Set final state for animation to work
	outElement.style.transform = outTranslate;
	outElement.style.opacity = '0';
}

// Hover animation helpers
export function setupHoverAnimation(
	element: HTMLElement,
	presetName: keyof typeof desktopPresets = 'hoverLift'
): () => void {
	const preset = desktopPresets[presetName] || desktopPresets.hoverLift;
	
	const handleMouseEnter = () => {
		element.style.transition = createTransition(
			preset.properties,
			preset.duration,
			preset.timing
		);
		
		// Apply hover styles based on preset
		if (presetName === 'hoverLift') {
			element.style.transform = 'translateY(-2px)';
			element.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
		}
	};
	
	const handleMouseLeave = () => {
		element.style.transform = '';
		element.style.boxShadow = '';
	};
	
	element.addEventListener('mouseenter', handleMouseEnter);
	element.addEventListener('mouseleave', handleMouseLeave);
	
	// Return cleanup function
	return () => {
		element.removeEventListener('mouseenter', handleMouseEnter);
		element.removeEventListener('mouseleave', handleMouseLeave);
	};
}

// Loading animation
export function createLoadingAnimation(
	element: HTMLElement,
	type: 'pulse' | 'skeleton' | 'spinner' = 'pulse'
): () => void {
	let animationId: number;
	
	switch (type) {
		case 'pulse':
			let pulseOpacity = 0.5;
			let pulseDirection = 1;
			
			const pulse = () => {
				pulseOpacity += pulseDirection * 0.05;
				
				if (pulseOpacity >= 1) {
					pulseOpacity = 1;
					pulseDirection = -1;
				} else if (pulseOpacity <= 0.5) {
					pulseOpacity = 0.5;
					pulseDirection = 1;
				}
				
				element.style.opacity = pulseOpacity.toString();
				animationId = requestAnimationFrame(pulse);
			};
			
			animationId = requestAnimationFrame(pulse);
			break;
			
		case 'skeleton':
			element.style.background = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
			element.style.backgroundSize = '200% 100%';
			element.style.animation = createAnimation(
				'skeleton-shimmer',
				1200,
				timingFunctions.easeInOut,
				0,
				'infinite'
			);
			break;
	}
	
	// Return stop function
	return () => {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
		element.style.animation = '';
		element.style.opacity = '';
		element.style.background = '';
	};
}

// Check if device is desktop (for conditional animations)
export function isDesktop(): boolean {
	if (typeof window === 'undefined') return true;
	
	return window.innerWidth >= 1024;
}

// Get appropriate animation duration for desktop
export function getDesktopDuration(baseDuration: number): number {
	if (!isDesktop()) {
		// On mobile, use shorter durations
		return Math.max(baseDuration * 0.7, 150);
	}
	
	return getSafeDuration(baseDuration);
}

// Export default
export default {
	timing: desktopTiming,
	durations: desktopDurations,
	presets: desktopPresets,
	animateContextPanel,
	animateModal,
	animateSidebar,
	animateContextSwitch,
	setupHoverAnimation,
	createLoadingAnimation,
	isDesktop,
	getDesktopDuration
};
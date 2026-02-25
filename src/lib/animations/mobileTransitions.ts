/**
 * Mobile Animation Transitions
 * 
 * Mobile-specific animations optimized for touch and smaller screens
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
	getSafeDuration,
	springAnimation
} from './sharedTransitions';

// Mobile-specific timing (faster, more responsive)
export const mobileTiming = {
	...timingFunctions,
	// Mobile-specific easing
	mobileResponsive: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
	mobileSnappy: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
	mobileBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};

// Mobile-specific durations (shorter for mobile)
export const mobileDurations = {
	...durations,
	sheetOpen: 300,
	sheetClose: 250,
	drawerOpen: 350,
	drawerClose: 300,
	toastShow: 200,
	toastHide: 150,
	swipeFeedback: 100,
	tapFeedback: 50,
	assistLayerSlide: 400
};

// Mobile animation presets
export const mobilePresets = {
	// Bottom sheet animations
	bottomSheetSlideUp: {
		name: 'bottomSheetSlideUp',
		duration: mobileDurations.sheetOpen,
		timing: mobileTiming.mobileResponsive,
		properties: ['transform', 'opacity']
	},
	bottomSheetSlideDown: {
		name: 'bottomSheetSlideDown',
		duration: mobileDurations.sheetClose,
		timing: mobileTiming.mobileResponsive,
		properties: ['transform', 'opacity']
	},
	
	// Drawer animations
	drawerSlideIn: {
		name: 'drawerSlideIn',
		duration: mobileDurations.drawerOpen,
		timing: mobileTiming.mobileResponsive,
		properties: ['transform', 'opacity', 'box-shadow']
	},
	drawerSlideOut: {
		name: 'drawerSlideOut',
		duration: mobileDurations.drawerClose,
		timing: mobileTiming.mobileResponsive,
		properties: ['transform', 'opacity']
	},
	
	// Toast notifications
	toastSlideUp: {
		name: 'toastSlideUp',
		duration: mobileDurations.toastShow,
		timing: mobileTiming.mobileSnappy,
		properties: ['transform', 'opacity']
	},
	toastSlideDown: {
		name: 'toastSlideDown',
		duration: mobileDurations.toastHide,
		timing: mobileTiming.mobileSnappy,
		properties: ['transform', 'opacity']
	},
	
	// Touch feedback
	tapScale: {
		name: 'tapScale',
		duration: mobileDurations.tapFeedback,
		timing: mobileTiming.mobileResponsive,
		properties: ['transform']
	},
	tapOpacity: {
		name: 'tapOpacity',
		duration: mobileDurations.tapFeedback,
		timing: mobileTiming.mobileResponsive,
		properties: ['opacity']
	},
	
	// Swipe gestures
	swipeLeft: {
		name: 'swipeLeft',
		duration: mobileDurations.swipeFeedback,
		timing: mobileTiming.mobileResponsive,
		properties: ['transform', 'opacity']
	},
	swipeRight: {
		name: 'swipeRight',
		duration: mobileDurations.swipeFeedback,
		timing: mobileTiming.mobileResponsive,
		properties: ['transform', 'opacity']
	},
	
	// Assist layer specific
	assistLayerExpand: {
		name: 'assistLayerExpand',
		duration: mobileDurations.assistLayerSlide,
		timing: mobileTiming.mobileBounce,
		properties: ['height', 'transform', 'border-radius']
	},
	assistLayerCollapse: {
		name: 'assistLayerCollapse',
		duration: mobileDurations.assistLayerSlide,
		timing: mobileTiming.mobileBounce,
		properties: ['height', 'transform', 'border-radius']
	},
	
	// Pull-to-refresh
	pullToRefresh: {
		name: 'pullToRefresh',
		duration: 300,
		timing: mobileTiming.mobileBounce,
		properties: ['transform']
	},
	
	// Keyboard animations
	keyboardSlideUp: {
		name: 'keyboardSlideUp',
		duration: 250,
		timing: mobileTiming.mobileResponsive,
		properties: ['transform']
	},
	keyboardSlideDown: {
		name: 'keyboardSlideDown',
		duration: 200,
		timing: mobileTiming.mobileResponsive,
		properties: ['transform']
	}
};

// Bottom sheet animations
export function animateBottomSheet(
	element: HTMLElement,
	action: 'open' | 'close' | 'toggle',
	options: {
		onComplete?: () => void;
		height?: string;
		backdropElement?: HTMLElement;
	} = {}
): void {
	const { onComplete, height = '80vh', backdropElement } = options;
	const presetName = action === 'open' || action === 'toggle' ? 'bottomSheetSlideUp' : 'bottomSheetSlideDown';
	
	// Animate backdrop if provided
	if (backdropElement) {
		applyAnimation(backdropElement, action === 'open' ? 'fadeIn' : 'fadeOut');
	}
	
	// Set initial state
	if (action === 'open') {
		element.style.transform = 'translateY(100%)';
		element.style.opacity = '0';
		element.style.height = height;
	}
	
	// Apply animation
	applyAnimation(element, presetName, {
		onComplete: () => {
			if (action === 'close') {
				element.style.transform = 'translateY(100%)';
				element.style.opacity = '0';
				element.style.pointerEvents = 'none';
			} else {
				element.style.transform = 'translateY(0)';
				element.style.opacity = '1';
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
		element.style.transform = 'translateY(0)';
		element.style.opacity = '1';
	}
}

// Drawer animations
export function animateDrawer(
	element: HTMLElement,
	action: 'open' | 'close',
	options: {
		onComplete?: () => void;
		side?: 'left' | 'right';
		width?: string;
		backdropElement?: HTMLElement;
	} = {}
): void {
	const { onComplete, side = 'left', width = '280px', backdropElement } = options;
	const presetName = action === 'open' ? 'drawerSlideIn' : 'drawerSlideOut';
	
	// Animate backdrop if provided
	if (backdropElement) {
		applyAnimation(backdropElement, action === 'open' ? 'fadeIn' : 'fadeOut');
	}
	
	// Set initial state
	if (action === 'open') {
		element.style.transform = side === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
		element.style.opacity = '0';
		element.style.width = width;
	}
	
	// Apply animation
	applyAnimation(element, presetName, {
		onComplete: () => {
			if (action === 'close') {
				element.style.transform = side === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
				element.style.opacity = '0';
				element.style.pointerEvents = 'none';
			} else {
				element.style.transform = 'translateX(0)';
				element.style.opacity = '1';
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
		element.style.transform = 'translateX(0)';
		element.style.opacity = '1';
	}
}

// Toast animations
export function animateToast(
	element: HTMLElement,
	action: 'show' | 'hide',
	options: {
		onComplete?: () => void;
		position?: 'top' | 'bottom';
	} = {}
): void {
	const { onComplete, position = 'bottom' } = options;
	const presetName = action === 'show' ? 'toastSlideUp' : 'toastSlideDown';
	
	// Set initial state
	if (action === 'show') {
		element.style.transform = position === 'bottom' 
			? 'translateY(100%)' 
			: 'translateY(-100%)';
		element.style.opacity = '0';
	}
	
	// Apply animation
	applyAnimation(element, presetName, {
		onComplete: () => {
			if (action === 'hide') {
				element.style.transform = position === 'bottom' 
					? 'translateY(100%)' 
					: 'translateY(-100%)';
				element.style.opacity = '0';
				element.style.pointerEvents = 'none';
			} else {
				element.style.transform = 'translateY(0)';
				element.style.opacity = '1';
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
	if (action === 'show') {
		element.style.transform = 'translateY(0)';
		element.style.opacity = '1';
	}
}

// Touch feedback animation
export function animateTapFeedback(
	element: HTMLElement,
	options: {
		type?: 'scale' | 'opacity' | 'both';
		onComplete?: () => void;
	} = {}
): () => void {
	const { type = 'scale', onComplete } = options;
	const presetName = type === 'opacity' ? 'tapOpacity' : 'tapScale';
	
	// Store original transform
	const originalTransform = element.style.transform;
	const originalOpacity = element.style.opacity;
	
	// Apply animation
	if (type === 'scale' || type === 'both') {
		element.style.transform = originalTransform + ' scale(0.95)';
	}
	
	if (type === 'opacity' || type === 'both') {
		element.style.opacity = '0.7';
	}
	
	applyAnimation(element, presetName, {
		onComplete: () => {
			element.style.transform = originalTransform;
			element.style.opacity = originalOpacity;
			
			if (onComplete) {
				onComplete();
			}
		}
	});
	
	// Return function to cancel animation
	return () => {
		element.style.transform = originalTransform;
		element.style.opacity = originalOpacity;
	};
}

// Swipe animation
export function animateSwipe(
	element: HTMLElement,
	direction: 'left' | 'right',
	options: {
		distance?: number;
		remove?: boolean;
		onComplete?: () => void;
	} = {}
): void {
	const { distance = 100, remove = false, onComplete } = options;
	const presetName = direction === 'left' ? 'swipeLeft' : 'swipeRight';
	
	// Calculate translate
	const translateX = direction === 'left' ? `-${distance}px` : `${distance}px`;
	
	// Apply animation
	applyAnimation(element, presetName, {
		onComplete: () => {
			if (remove) {
				element.style.display = 'none';
			}
			
			if (onComplete) {
				onComplete();
			}
		}
	});
	
	// Trigger reflow
	element.getBoundingClientRect();
	
	// Set final state for animation to work
	element.style.transform = `translateX(${translateX})`;
	element.style.opacity = '0';
}

// Assist layer animations
export function animateAssistLayer(
	element: HTMLElement,
	action: 'expand' | 'collapse',
	options: {
		onComplete?: () => void;
		initialHeight?: string;
		finalHeight?: string;
	} = {}
): void {
	const { onComplete, initialHeight = '60px', finalHeight = '300px' } = options;
	const presetName = action === 'expand' ? 'assistLayerExpand' : 'assistLayerCollapse';
	
	// Store current height
	const currentHeight = element.style.height || getComputedStyle(element).height;
	
	// Set initial state
	if (action === 'expand') {
		element.style.height = initialHeight;
		element.style.overflow = 'hidden';
		element.style.borderRadius = '12px 12px 0 0';
	}
	
	// Apply animation
	applyAnimation(element, presetName, {
		onComplete: () => {
			element.style.height = action === 'expand' ? finalHeight : initialHeight;
			element.style.overflow = 'visible';
			element.style.borderRadius = action === 'expand' ? '12px 12px 0 0' : '12px';
			
			if (onComplete) {
				onComplete();
			}
		}
	});
	
	// Trigger reflow
	element.getBoundingClientRect();
	
	// Set final state for animation to work
	element.style.height = action === 'expand' ? finalHeight : initialHeight;
}

// Pull-to-refresh animation
export function animatePullToRefresh(
	element: HTMLElement,
	progress: number, // 0 to 1
	options: {
		maxPull?: number;
		onRefresh?: () => void;
	} = {}
): () => void {
	const { maxPull = 100, onRefresh } = options;
	const pullDistance = progress * maxPull;
	
	// Apply transform based on pull distance
	element.style.transform = `translateY(${pullDistance}px)`;
	
	// If progress reaches threshold, trigger refresh
	if (progress >= 1 && onRefresh) {
		// Spring back animation
		const cancelSpring = springAnimation(
			element,
			'transform',
			pullDistance,
			0,
			{ stiffness: 200, damping: 20 }
		);
		
		// Call refresh callback after animation
		setTimeout(() => {
			if (onRefresh) {
				onRefresh();
			}
		}, 300);
		
		return cancelSpring;
	}
	
	return () => {};
}

// Keyboard-aware animations
export function animateWithKeyboard(
	element: HTMLElement,
	keyboardHeight: number,
	action: 'show' | 'hide',
	options: {
		onComplete?: () => void;
	} = {}
): void {
	const { onComplete } = options;
	const presetName = action === 'show' ? 'keyboardSlideUp' : 'keyboardSlideDown';
	
	// Calculate translate
	const translateY = action === 'show' ? `-${keyboardHeight}px` : '0';
	
	// Apply animation
	applyAnimation(element, presetName, {
		onComplete: () => {
			element.style.transform = `translateY(${translateY})`;
			
			if (onComplete) {
				onComplete();
			}
		}
	});
	
	// Trigger reflow
	element.getBoundingClientRect();
	
	// Set final state for animation to work
	element.style.transform = `translateY(${translateY})`;
}

// Check if device is mobile (for conditional animations)
export function isMobile(): boolean {
	if (typeof window === 'undefined') return false;
	
	return window.innerWidth < 768;
}

// Check if device is tablet
export function isTablet(): boolean {
	if (typeof window === 'undefined') return false;
	
	return window.innerWidth >= 768 && window.innerWidth < 1024;
}

// Get appropriate animation duration for mobile
export function getMobileDuration(baseDuration: number): number {
	if (!isMobile()) {
		// On desktop, use normal durations
		return getSafeDuration(baseDuration);
	}
	
	// On mobile, use shorter durations but respect reduced motion
	const mobileDuration = Math.max(baseDuration * 0.6, 100);
	return getSafeDuration(mobileDuration);
}

// Setup touch event handlers for animations
export function setupTouchAnimations(element: HTMLElement): () => void {
	let startX = 0;
	let startY = 0;
	let isSwiping = false;
	
	const handleTouchStart = (event: TouchEvent) => {
		startX = event.touches[0].clientX;
		startY = event.touches[0].clientY;
		isSwiping = false;
	};
	
	const handleTouchMove = (event: TouchEvent) => {
		if (!isSwiping) {
			const deltaX = Math.abs(event.touches[0].clientX - startX);
			const deltaY = Math.abs(event.touches[0].clientY - startY);
			
			// Determine if it's a swipe
			if (deltaX > 10 && deltaX > deltaY) {
				isSwiping = true;
				// Add visual feedback for swipe
				element.style.transition = 'transform 0.1s ease-out';
			}
		}
		
		if (isSwiping) {
			const deltaX = event.touches[0].clientX - startX;
			element.style.transform = `translateX(${deltaX}px)`;
		}
	};
	
	const handleTouchEnd = () => {
		if (isSwiping) {
			// Animate back to original position
			element.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
			element.style.transform = 'translateX(0)';
			
			// Reset after animation
			setTimeout(() => {
				element.style.transition = '';
			}, 300);
		}
		
		isSwiping = false;
	};
	
	// Add event listeners
	element.addEventListener('touchstart', handleTouchStart);
	element.addEventListener('touchmove', handleTouchMove);
	element.addEventListener('touchend', handleTouchEnd);
	
	// Return cleanup function
	return () => {
		element.removeEventListener('touchstart', handleTouchStart);
		element.removeEventListener('touchmove', handleTouchMove);
		element.removeEventListener('touchend', handleTouchEnd);
	};
}

// Export default
export default {
	timing: mobileTiming,
	durations: mobileDurations,
	presets: mobilePresets,
	animateBottomSheet,
	animateDrawer,
	animateToast,
	animateTapFeedback,
	animateSwipe,
	animateAssistLayer,
	animatePullToRefresh,
	animateWithKeyboard,
	isMobile,
	isTablet,
	getMobileDuration,
	setupTouchAnimations
};
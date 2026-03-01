import { writable, derived, readable } from 'svelte/store';
import { browser } from '$app/environment';

// Device types from Module 1.6
export type DeviceType = 'desktop' | 'tabletLandscape' | 'tabletPortrait' | 'mobile';

// Breakpoints based on Module 1.6
const BREAKPOINTS = {
	tablet: 768, // iPad portrait width
	desktop: 1024, // Desktop minimum
};

function getDeviceType(width: number, height: number): DeviceType {
	if (width >= BREAKPOINTS.desktop) {
		return 'desktop';
	} else if (width >= BREAKPOINTS.tablet) {
		// Tablet - check orientation
		return width > height ? 'tabletLandscape' : 'tabletPortrait';
	} else {
		return 'mobile';
	}
}

function createDeviceStore() {
	// Initial state
	const initialState = {
		width: browser ? window.innerWidth : 1024,
		height: browser ? window.innerHeight : 768,
		type: browser ? getDeviceType(window.innerWidth, window.innerHeight) : 'desktop' as DeviceType,
		isMobile: browser ? window.innerWidth < BREAKPOINTS.tablet : false,
		isTablet: browser ? 
			window.innerWidth >= BREAKPOINTS.tablet && window.innerWidth < BREAKPOINTS.desktop : 
			false,
		isDesktop: browser ? window.innerWidth >= BREAKPOINTS.desktop : true,
		isTabletLandscape: browser ? 
			window.innerWidth >= BREAKPOINTS.tablet && 
			window.innerWidth < BREAKPOINTS.desktop && 
			window.innerWidth > window.innerHeight : 
			false,
		isTabletPortrait: browser ? 
			window.innerWidth >= BREAKPOINTS.tablet && 
			window.innerWidth < BREAKPOINTS.desktop && 
			window.innerWidth <= window.innerHeight : 
			false,
	};

	const { subscribe, set, update } = writable(initialState);

	// Update on resize
	if (browser) {
		const handleResize = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;
			const type = getDeviceType(width, height);
			
			update(state => ({
				width,
				height,
				type,
				isMobile: width < BREAKPOINTS.tablet,
				isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
				isDesktop: width >= BREAKPOINTS.desktop,
				isTabletLandscape: type === 'tabletLandscape',
				isTabletPortrait: type === 'tabletPortrait',
			}));
		};

		window.addEventListener('resize', handleResize);
		
		// Cleanup
		if (typeof window !== 'undefined') {
			// Handle SSR
			handleResize(); // Initial call
		}
	}

	return {
		subscribe,
		
		// Helper methods
		isDeviceType: (type: DeviceType) => {
			let result = false;
			update(state => {
				result = state.type === type;
				return state;
			});
			return result;
		},
		
		// Get current breakpoint
		getBreakpoint: () => {
			let width = 0;
			update(state => {
				width = state.width;
				return state;
			});
			
			if (width >= BREAKPOINTS.desktop) return 'desktop';
			if (width >= BREAKPOINTS.tablet) return 'tablet';
			return 'mobile';
		},
		
		// Check if Ask Oscar bar should be persistent (desktop/tablet landscape)
		isAskOscarBarPersistent: derived(
			{ subscribe },
			$store => $store.type === 'desktop' || $store.type === 'tabletLandscape'
		),
		
		// Check if bottom bar navigation should be used (mobile/tablet portrait)
		shouldUseBottomBar: derived(
			{ subscribe },
			$store => $store.type === 'mobile' || $store.type === 'tabletPortrait'
		),
		
		// Check if camera should be shown in Ask Oscar bar (tablet landscape only)
		shouldShowCameraInBar: derived(
			{ subscribe },
			$store => $store.type === 'tabletLandscape'
		),
		
		// Check if sheets should be full height (mobile/tablet portrait)
		shouldUseFullHeightSheets: derived(
			{ subscribe },
			$store => $store.type === 'mobile' || $store.type === 'tabletPortrait'
		),
	};
}

export const deviceStore = createDeviceStore();

// Individual derived stores for convenience
export const deviceType = derived(deviceStore, $store => $store.type);
export const isMobile = derived(deviceStore, $store => $store.isMobile);
export const isTablet = derived(deviceStore, $store => $store.isTablet);
export const isDesktop = derived(deviceStore, $store => $store.isDesktop);
export const isTabletLandscape = derived(deviceStore, $store => $store.isTabletLandscape);
export const isTabletPortrait = derived(deviceStore, $store => $store.isTabletPortrait);
export const viewportWidth = derived(deviceStore, $store => $store.width);
export const viewportHeight = derived(deviceStore, $store => $store.height);

// Module 1.6 specific derived stores
export const shouldUseCockpitLayout = derived(
	deviceStore, 
	$store => $store.type === 'desktop' || $store.type === 'tabletLandscape'
);

export const shouldUseBottomBarNavigation = derived(
	deviceStore,
	$store => $store.type === 'mobile' || $store.type === 'tabletPortrait'
);
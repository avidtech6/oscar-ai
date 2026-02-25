/**
 * Navigation Context Service
 * 
 * Preserves context when navigating between screens
 * Integrates with Context Panel, Assist Layer, and Smart Share
 */

import { contextPanelStore } from '../components/context-panel/contextPanelStore';
import { closeAssistLayer } from '../components/assist-layer/assistLayerStore';
import { closeSmartShare } from '../components/smart-share/smartShareStore';

// Types
export interface NavigationState {
	currentRoute: string;
	previousRoute: string;
	context: string;
	params: Record<string, any>;
	timestamp: number;
}

export interface PreservedContext {
	panelOpen: boolean;
	assistLayerOpen: boolean;
	smartShareOpen: boolean;
	currentContext: string;
	hints: any[];
}

// State
const navigationHistory: NavigationState[] = [];
let currentState: NavigationState = {
	currentRoute: '/',
	previousRoute: '',
	context: 'global',
	params: {},
	timestamp: Date.now()
};

// Route to context mapping
const routeContextMap: Record<string, string> = {
	'/': 'global',
	'/dashboard': 'global',
	'/projects': 'projects',
	'/projects/:id': 'project-detail',
	'/notes': 'notes',
	'/notes/:id': 'note-detail',
	'/calendar': 'calendar',
	'/communication': 'communication',
	'/communication/email': 'email-inbox',
	'/communication/email/compose': 'email-compose',
	'/communication/email/settings': 'email-settings',
	'/communication/campaigns': 'campaign-builder',
	'/settings': 'settings',
	'/settings/email': 'email-settings',
	'/settings/account': 'account-settings',
	'/reports': 'reports',
	'/reports/:id': 'report-detail',
	'/learn-my-style': 'learn_my_style'
};

// Initialize
export function initNavigationContext() {
	console.log('[Navigation Context] Initializing');
	
	// Listen for route changes
	if (typeof window !== 'undefined') {
		// Listen for Svelte router events
		window.addEventListener('route-changed', ((event: CustomEvent) => {
			const { route, params } = event.detail;
			handleRouteChange(route, params);
		}) as EventListener);
		
		// Listen for browser navigation
		window.addEventListener('popstate', () => {
			handleRouteChange(window.location.pathname, getRouteParams());
		});
		
		// Initial route
		handleRouteChange(window.location.pathname, getRouteParams());
	}
	
	return {
		getCurrentState: () => currentState,
		getNavigationHistory: () => [...navigationHistory],
		navigateTo,
		goBack,
		preserveContext,
		restoreContext
	};
}

/**
 * Handle route change
 */
function handleRouteChange(route: string, params: Record<string, any> = {}) {
	// Update navigation history
	const previousState = { ...currentState };
	
	navigationHistory.push(previousState);
	
	// Keep only last 10 entries
	if (navigationHistory.length > 10) {
		navigationHistory.shift();
	}
	
	// Update current state
	currentState = {
		currentRoute: route,
		previousRoute: previousState.currentRoute,
		context: getContextFromRoute(route),
		params,
		timestamp: Date.now()
	};
	
	console.log('[Navigation Context] Route changed:', {
		from: previousState.currentRoute,
		to: route,
		context: currentState.context
	});
	
	// Update context panel
	contextPanelStore.setContext(currentState.context);
	
	// Close assist layer on navigation (mobile behavior)
	if (window.innerWidth < 768) {
		closeAssistLayer();
	}
	
	// Close smart share on navigation
	closeSmartShare();
	
	// Dispatch event for other components
	window.dispatchEvent(new CustomEvent('navigation-context-changed', {
		detail: currentState
	}));
}

/**
 * Get context from route
 */
function getContextFromRoute(route: string): string {
	// Try exact match first
	if (routeContextMap[route]) {
		return routeContextMap[route];
	}
	
	// Try pattern matching
	for (const [pattern, context] of Object.entries(routeContextMap)) {
		if (pattern.includes(':')) {
			// Convert pattern to regex
			const regexPattern = pattern.replace(/:[^/]+/g, '([^/]+)');
			const regex = new RegExp(`^${regexPattern}$`);
			
			if (regex.test(route)) {
				return context;
			}
		}
	}
	
	// Default context based on route segments
	const segments = route.split('/').filter(Boolean);
	
	if (segments.length === 0) return 'global';
	
	const firstSegment = segments[0];
	
	switch (firstSegment) {
		case 'projects':
			return segments.length > 1 ? 'project-detail' : 'projects';
		case 'notes':
			return segments.length > 1 ? 'note-detail' : 'notes';
		case 'communication':
			return segments[1] || 'communication';
		case 'settings':
			return segments[1] || 'settings';
		case 'reports':
			return segments.length > 1 ? 'report-detail' : 'reports';
		default:
			return firstSegment;
	}
}

/**
 * Get route params from current URL
 */
function getRouteParams(): Record<string, any> {
	const params: Record<string, any> = {};
	const path = window.location.pathname;
	const search = window.location.search;
	
	// Extract query params
	if (search) {
		const searchParams = new URLSearchParams(search);
		searchParams.forEach((value, key) => {
			params[key] = value;
		});
	}
	
	// Extract path params (simplified)
	const pathSegments = path.split('/').filter(Boolean);
	
	// Check for ID patterns
	if (pathSegments.length >= 2) {
		const lastSegment = pathSegments[pathSegments.length - 1];
		if (/^\d+$/.test(lastSegment) || /^[a-f0-9-]+$/.test(lastSegment)) {
			params.id = lastSegment;
		}
	}
	
	return params;
}

/**
 * Navigate to a route with context preservation
 */
export function navigateTo(route: string, options: {
	params?: Record<string, any>;
	preserveContext?: boolean;
	context?: string;
} = {}) {
	console.log('[Navigation Context] Navigating to:', route, options);
	
	// Preserve current context if requested
	if (options.preserveContext) {
		const preserved = preserveContext();
		sessionStorage.setItem(`nav-context:${route}`, JSON.stringify(preserved));
	}
	
	// Set explicit context if provided
	if (options.context) {
		contextPanelStore.setContext(options.context);
	}
	
	// Update browser history
	window.history.pushState({ route, params: options.params }, '', route);
	
	// Handle route change
	handleRouteChange(route, options.params || {});
	
	// Scroll to top
	window.scrollTo(0, 0);
}

/**
 * Go back with context restoration
 */
export function goBack() {
	if (navigationHistory.length === 0) {
		window.history.back();
		return;
	}
	
	const previousState = navigationHistory.pop();
	if (!previousState) {
		window.history.back();
		return;
	}
	
	console.log('[Navigation Context] Going back to:', previousState.currentRoute);
	
	// Restore context if preserved
	const preservedKey = `nav-context:${previousState.currentRoute}`;
	const preservedJson = sessionStorage.getItem(preservedKey);
	
	if (preservedJson) {
		try {
			const preserved = JSON.parse(preservedJson);
			restoreContext(preserved);
			sessionStorage.removeItem(preservedKey);
		} catch (error) {
			console.error('[Navigation Context] Failed to restore context:', error);
		}
	}
	
	// Update browser history
	window.history.back();
}

/**
 * Preserve current UI context
 */
export function preserveContext(): PreservedContext {
	// Get current state from stores
	let panelOpen = false;
	let assistLayerOpen = false;
	let smartShareOpen = false;
	let currentContext = 'global';
	let hints: any[] = [];
	
	// Use a temporary subscription to get current state
	const unsubscribe = contextPanelStore.subscribe(state => {
		panelOpen = state.isOpen;
		currentContext = state.currentContext;
		hints = state.hints;
	});
	
	// Immediately unsubscribe since we just wanted the current value
	unsubscribe();
	
	// Note: In a real implementation, we'd need to get state from other stores too
	
	return {
		panelOpen,
		assistLayerOpen,
		smartShareOpen,
		currentContext,
		hints
	};
}

/**
 * Restore preserved context
 */
export function restoreContext(context: PreservedContext) {
	console.log('[Navigation Context] Restoring context:', context);
	
	// Restore context panel
	if (context.currentContext) {
		contextPanelStore.setContext(context.currentContext);
	}
	
	if (context.panelOpen) {
		contextPanelStore.openPanel();
	} else {
		contextPanelStore.closePanel();
	}
	
	// Restore hints (simplified - would need more sophisticated approach)
	if (context.hints && context.hints.length > 0) {
		// Clear existing hints and add preserved ones
		// Note: This is simplified - actual implementation would need to merge hints
		console.log('[Navigation Context] Restoring', context.hints.length, 'hints');
	}
	
	// Dispatch restoration complete event
	window.dispatchEvent(new CustomEvent('navigation-context-restored', {
		detail: context
	}));
}

/**
 * Get current navigation context
 */
export function getCurrentContext(): string {
	return currentState.context;
}

/**
 * Get current route
 */
export function getCurrentRoute(): string {
	return currentState.currentRoute;
}

/**
 * Check if current route matches pattern
 */
export function isRouteActive(routePattern: string): boolean {
	const currentRoute = getCurrentRoute();
	
	if (routePattern === currentRoute) return true;
	
	// Check for pattern matching
	if (routePattern.includes(':')) {
		const regexPattern = routePattern.replace(/:[^/]+/g, '([^/]+)');
		const regex = new RegExp(`^${regexPattern}$`);
		return regex.test(currentRoute);
	}
	
	// Check for prefix
	if (routePattern.endsWith('*')) {
		const prefix = routePattern.slice(0, -1);
		return currentRoute.startsWith(prefix);
	}
	
	return false;
}

/**
 * Register a route with a specific context
 */
export function registerRouteContext(route: string, context: string) {
	routeContextMap[route] = context;
	console.log('[Navigation Context] Registered route context:', route, '->', context);
}

/**
 * Update context for current route
 */
export function updateCurrentContext(context: string) {
	currentState.context = context;
	contextPanelStore.setContext(context);
	
	console.log('[Navigation Context] Updated current context to:', context);
}

// Export default service
export default {
	init: initNavigationContext,
	navigateTo,
	goBack,
	getCurrentContext,
	getCurrentRoute,
	isRouteActive,
	registerRouteContext,
	updateCurrentContext,
	preserveContext,
	restoreContext
};
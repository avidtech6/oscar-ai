/**
 * Mobile Bottom Bar Store
 * State management for mobile navigation bar
 */

import { writable, derived } from 'svelte/store';
import type { MobileBarItem } from '../types';

export interface MobileBarStoreState {
	items: MobileBarItem[];
	visible: boolean;
	activeItemId: string | null;
	badgeCounts: Record<string, number>;
}

// Default mobile bar items
const DEFAULT_ITEMS: MobileBarItem[] = [
	{
		id: 'dashboard',
		label: 'Dashboard',
		icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
		href: '/communication',
		badge: 0,
		isActive: true
	},
	{
		id: 'email',
		label: 'Email',
		icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
		href: '/communication/email',
		badge: 3,
		isActive: false
	},
	{
		id: 'campaigns',
		label: 'Campaigns',
		icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
		href: '/communication/campaigns',
		badge: 1,
		isActive: false
	},
	{
		id: 'calendar',
		label: 'Calendar',
		icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
		href: '/calendar',
		badge: 0,
		isActive: false
	},
	{
		id: 'notifications',
		label: 'Notifications',
		icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
		href: '/communication/notifications',
		badge: 5,
		isActive: false
	}
];

// Initial state
const initialState: MobileBarStoreState = {
	items: DEFAULT_ITEMS,
	visible: false,
	activeItemId: 'dashboard',
	badgeCounts: {
		email: 3,
		campaigns: 1,
		notifications: 5
	}
};

// Create store
const createMobileBarStore = () => {
	const { subscribe, set, update } = writable<MobileBarStoreState>(initialState);

	return {
		subscribe,

		// Set mobile bar visibility
		setVisible(visible: boolean) {
			update(state => ({ ...state, visible }));
		},

		// Toggle mobile bar visibility
		toggleVisibility() {
			update(state => ({ ...state, visible: !state.visible }));
		},

		// Set active item
		setActiveItem(id: string) {
			update(state => ({
				...state,
				activeItemId: id,
				items: state.items.map(item => ({
					...item,
					isActive: item.id === id
				}))
			}));
		},

		// Update badge count for an item
		updateBadgeCount(itemId: string, count: number) {
			update(state => ({
				...state,
				items: state.items.map(item =>
					item.id === itemId ? { ...item, badge: count } : item
				),
				badgeCounts: {
					...state.badgeCounts,
					[itemId]: count
				}
			}));
		},

		// Increment badge count
		incrementBadgeCount(itemId: string, amount = 1) {
			update(state => {
				const currentItem = state.items.find(item => item.id === itemId);
				const currentCount = currentItem?.badge || 0;
				const newCount = currentCount + amount;

				return {
					...state,
					items: state.items.map(item =>
						item.id === itemId ? { ...item, badge: newCount } : item
					),
					badgeCounts: {
						...state.badgeCounts,
						[itemId]: newCount
					}
				};
			});
		},

		// Clear badge count
		clearBadgeCount(itemId: string) {
			update(state => ({
				...state,
				items: state.items.map(item =>
					item.id === itemId ? { ...item, badge: 0 } : item
				),
				badgeCounts: {
					...state.badgeCounts,
					[itemId]: 0
				}
			}));
		},

		// Clear all badge counts
		clearAllBadgeCounts() {
			update(state => ({
				...state,
				items: state.items.map(item => ({ ...item, badge: 0 })),
				badgeCounts: {}
			}));
		},

		// Add a new item to the mobile bar
		addItem(item: Omit<MobileBarItem, 'isActive'>) {
			update(state => {
				const newItem: MobileBarItem = {
					...item,
					isActive: false
				};

				// Don't add if item with same ID already exists
				if (state.items.some(existing => existing.id === item.id)) {
					return state;
				}

				return {
					...state,
					items: [...state.items, newItem]
				};
			});
		},

		// Remove an item from the mobile bar
		removeItem(itemId: string) {
			update(state => ({
				...state,
				items: state.items.filter(item => item.id !== itemId)
			}));
		},

		// Update an item
		updateItem(itemId: string, updates: Partial<MobileBarItem>) {
			update(state => ({
				...state,
				items: state.items.map(item =>
					item.id === itemId ? { ...item, ...updates } : item
				)
			}));
		},

		// Reorder items
		reorderItems(newOrder: string[]) {
			update(state => {
				const itemMap = new Map(state.items.map(item => [item.id, item]));
				const reorderedItems: MobileBarItem[] = [];

				for (const id of newOrder) {
					const item = itemMap.get(id);
					if (item) {
						reorderedItems.push(item);
					}
				}

				// Add any remaining items not in the new order
				for (const item of state.items) {
					if (!newOrder.includes(item.id)) {
						reorderedItems.push(item);
					}
				}

				return {
					...state,
					items: reorderedItems
				};
			});
		},

		// Reset to default items
		resetToDefaults() {
			update(state => ({
				...state,
				items: DEFAULT_ITEMS.map(item => ({
					...item,
					isActive: item.id === state.activeItemId
				}))
			}));
		},

		// Show mobile bar (for mobile devices)
		show() {
			update(state => ({ ...state, visible: true }));
		},

		// Hide mobile bar
		hide() {
			update(state => ({ ...state, visible: false }));
		},

		// Check if mobile device (simplified)
		isMobileDevice(): boolean {
			return typeof window !== 'undefined' && window.innerWidth < 768;
		},

		// Auto-show/hide based on device
		updateVisibilityBasedOnDevice() {
			if (typeof window !== 'undefined') {
				const isMobile = window.innerWidth < 768;
				update(state => ({ ...state, visible: isMobile }));
			}
		},

		// Reset store
		reset() {
			set(initialState);
		}
	};
};

export const mobileBarStore = createMobileBarStore();

// Derived stores
export const activeItem = derived(mobileBarStore, ($store) => {
	return $store.items.find(item => item.id === $store.activeItemId) || null;
});

export const itemsWithBadges = derived(mobileBarStore, ($store) => {
	return $store.items.filter(item => (item.badge || 0) > 0);
});

export const totalBadgeCount = derived(mobileBarStore, ($store) => {
	return $store.items.reduce((total, item) => total + (item.badge || 0), 0);
});

export const visibleItems = derived(mobileBarStore, ($store) => {
	return $store.items;
});

// Initialize window resize listener for auto-show/hide
if (typeof window !== 'undefined') {
	window.addEventListener('resize', () => {
		mobileBarStore.updateVisibilityBasedOnDevice();
	});
	
	// Initial check
	mobileBarStore.updateVisibilityBasedOnDevice();
}
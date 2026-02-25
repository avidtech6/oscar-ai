/**
 * Notification Store
 * State management for notifications and preferences
 */

import { writable, derived } from 'svelte/store';
import type { Notification, NotificationPreference } from '../types';
import {
	fetchNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	archiveNotification,
	deleteNotification,
	createNotification,
	fetchNotificationPreferences,
	updateNotificationPreference,
	getNotificationStats,
	sendTestNotification,
	clearAllNotifications,
	getUnreadCount
} from '../services/notificationService';

export interface NotificationStoreState {
	notifications: Notification[];
	preferences: NotificationPreference[];
	loading: boolean;
	error: string | null;
	stats: {
		total: number;
		unread: number;
		urgent: number;
		byType: Record<string, number>;
		byPriority: Record<string, number>;
	} | null;
}

// Initial state
const initialState: NotificationStoreState = {
	notifications: [],
	preferences: [],
	loading: false,
	error: null,
	stats: null
};

// Create store
const createNotificationStore = () => {
	const { subscribe, set, update } = writable<NotificationStoreState>(initialState);

	return {
		subscribe,

		// Load notifications
		async loadNotifications(options?: {
			limit?: number;
			status?: Notification['status'];
			type?: Notification['type'];
			priority?: Notification['priority'];
		}) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await fetchNotifications(options);
				if (result.success && result.data) {
					update(state => ({ 
						...state, 
						notifications: result.data || [],
						loading: false 
					}));
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to load notifications',
						loading: false 
					}));
				}
			} catch (error) {
				update(state => ({ 
					...state, 
					error: error instanceof Error ? error.message : 'Unknown error',
					loading: false 
				}));
			}
		},

		// Load notification preferences
		async loadPreferences() {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await fetchNotificationPreferences();
				if (result.success && result.data) {
					update(state => ({ 
						...state, 
						preferences: result.data || [],
						loading: false 
					}));
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to load preferences',
						loading: false 
					}));
				}
			} catch (error) {
				update(state => ({ 
					...state, 
					error: error instanceof Error ? error.message : 'Unknown error',
					loading: false 
				}));
			}
		},

		// Load notification stats
		async loadStats() {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await getNotificationStats();
				if (result.success && result.data) {
					update(state => ({ 
						...state, 
						stats: result.data,
						loading: false 
					}));
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to load stats',
						loading: false 
					}));
				}
			} catch (error) {
				update(state => ({ 
					...state, 
					error: error instanceof Error ? error.message : 'Unknown error',
					loading: false 
				}));
			}
		},

		// Mark notification as read
		async markAsRead(id: string) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await markNotificationAsRead(id);
				if (result.success) {
					update(state => ({ 
						...state, 
						notifications: state.notifications.map(notification => 
							notification.id === id 
								? { ...notification, status: 'read', readAt: new Date() }
								: notification
						),
						loading: false 
					}));
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to mark as read',
						loading: false 
					}));
				}
			} catch (error) {
				update(state => ({ 
					...state, 
					error: error instanceof Error ? error.message : 'Unknown error',
					loading: false 
				}));
			}
		},

		// Mark all notifications as read
		async markAllAsRead() {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await markAllNotificationsAsRead();
				if (result.success) {
					const now = new Date();
					update(state => ({ 
						...state, 
						notifications: state.notifications.map(notification => 
							notification.status === 'unread'
								? { ...notification, status: 'read', readAt: now }
								: notification
						),
						loading: false 
					}));
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to mark all as read',
						loading: false 
					}));
				}
			} catch (error) {
				update(state => ({ 
					...state, 
					error: error instanceof Error ? error.message : 'Unknown error',
					loading: false 
				}));
			}
		},

		// Archive notification
		async archive(id: string) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await archiveNotification(id);
				if (result.success) {
					update(state => ({ 
						...state, 
						notifications: state.notifications.map(notification => 
							notification.id === id 
								? { ...notification, status: 'archived', archivedAt: new Date() }
								: notification
						),
						loading: false 
					}));
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to archive',
						loading: false 
					}));
				}
			} catch (error) {
				update(state => ({ 
					...state, 
					error: error instanceof Error ? error.message : 'Unknown error',
					loading: false 
				}));
			}
		},

		// Delete notification
		async delete(id: string) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await deleteNotification(id);
				if (result.success) {
					update(state => ({ 
						...state, 
						notifications: state.notifications.filter(notification => notification.id !== id),
						loading: false 
					}));
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to delete',
						loading: false 
					}));
				}
			} catch (error) {
				update(state => ({ 
					...state, 
					error: error instanceof Error ? error.message : 'Unknown error',
					loading: false 
				}));
			}
		},

		// Create notification
		async create(notification: Omit<Notification, 'id' | 'createdAt'>) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await createNotification(notification);
				if (result.success && result.data) {
					const newNotification = result.data;
					update(state => ({
						...state,
						notifications: [newNotification, ...state.notifications],
						loading: false
					}));
					return { success: true, data: newNotification };
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to create notification',
						loading: false 
					}));
					return { success: false, error: result.error };
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				update(state => ({ 
					...state, 
					error: errorMessage,
					loading: false 
				}));
				return { success: false, error: errorMessage };
			}
		},

		// Update preference
		async updatePreference(id: string, updates: Partial<NotificationPreference>) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await updateNotificationPreference(id, updates);
				if (result.success && result.data) {
					update(state => ({ 
						...state, 
						preferences: state.preferences.map(preference => 
							preference.id === id 
								? { ...preference, ...updates, updatedAt: new Date() }
								: preference
						),
						loading: false 
					}));
					return { success: true, data: result.data };
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to update preference',
						loading: false 
					}));
					return { success: false, error: result.error };
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				update(state => ({ 
					...state, 
					error: errorMessage,
					loading: false 
				}));
				return { success: false, error: errorMessage };
			}
		},

		// Send test notification
		async sendTest(type: Notification['type'] = 'system') {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await sendTestNotification(type);
				if (result.success && result.data) {
					const testNotification = result.data;
					update(state => ({
						...state,
						notifications: [testNotification, ...state.notifications],
						loading: false
					}));
					return { success: true, data: testNotification };
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to send test',
						loading: false 
					}));
					return { success: false, error: result.error };
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				update(state => ({ 
					...state, 
					error: errorMessage,
					loading: false 
				}));
				return { success: false, error: errorMessage };
			}
		},

		// Clear all notifications
		async clearAll() {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await clearAllNotifications();
				if (result.success) {
					update(state => ({ 
						...state, 
						notifications: [],
						loading: false 
					}));
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to clear all',
						loading: false 
					}));
				}
			} catch (error) {
				update(state => ({ 
					...state, 
					error: error instanceof Error ? error.message : 'Unknown error',
					loading: false 
				}));
			}
		},

		// Get unread count
		async getUnreadCount() {
			try {
				const result = await getUnreadCount();
				if (result.success && result.data !== undefined) {
					return { success: true, data: result.data };
				} else {
					return { success: false, error: result.error };
				}
			} catch (error) {
				return { 
					success: false, 
					error: error instanceof Error ? error.message : 'Unknown error' 
				};
			}
		},

		// Clear error
		clearError() {
			update(state => ({ ...state, error: null }));
		},

		// Reset store
		reset() {
			set(initialState);
		}
	};
};

export const notificationStore = createNotificationStore();

// Derived stores
export const unreadNotifications = derived(notificationStore, ($store) => {
	return $store.notifications.filter(notification => notification.status === 'unread');
});

export const urgentNotifications = derived(notificationStore, ($store) => {
	return $store.notifications.filter(notification => notification.priority === 'urgent');
});

export const notificationsByType = derived(notificationStore, ($store) => {
	const byType: Record<string, Notification[]> = {};
	$store.notifications.forEach(notification => {
		if (!byType[notification.type]) {
			byType[notification.type] = [];
		}
		byType[notification.type].push(notification);
	});
	return byType;
});

export const notificationsByPriority = derived(notificationStore, ($store) => {
	const byPriority: Record<string, Notification[]> = {};
	$store.notifications.forEach(notification => {
		if (!byPriority[notification.priority]) {
			byPriority[notification.priority] = [];
		}
		byPriority[notification.priority].push(notification);
	});
	return byPriority;
});

export const enabledPreferences = derived(notificationStore, ($store) => {
	return $store.preferences.filter(preference => preference.enabled);
});

export const disabledPreferences = derived(notificationStore, ($store) => {
	return $store.preferences.filter(preference => !preference.enabled);
});
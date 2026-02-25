/**
 * Notification Service
 * Handles notification CRUD operations and preferences
 */

import { supabase } from '$lib/supabaseClient';
import type { Notification, NotificationPreference } from '../types';

// Mock data for development (remove when Supabase is configured)
const MOCK_NOTIFICATIONS: Notification[] = [
	{
		id: '1',
		userId: 'user-1',
		type: 'email',
		title: 'New Email Received',
		message: 'You have received a new email from client@example.com',
		priority: 'normal',
		status: 'unread',
		actionUrl: '/communication/email',
		actionLabel: 'View Email',
		createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days from now
	},
	{
		id: '2',
		userId: 'user-1',
		type: 'campaign',
		title: 'Campaign Scheduled',
		message: 'Your "Weekly Newsletter" campaign has been scheduled for tomorrow',
		priority: 'normal',
		status: 'unread',
		actionUrl: '/communication/campaigns',
		actionLabel: 'View Campaign',
		createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
	},
	{
		id: '3',
		userId: 'user-1',
		type: 'system',
		title: 'System Update',
		message: 'The communication system has been updated to version 2.1.0',
		priority: 'low',
		status: 'read',
		readAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
	},
	{
		id: '4',
		userId: 'user-1',
		type: 'alert',
		title: 'High Priority Alert',
		message: 'Campaign "Urgent Client Update" has low engagement',
		priority: 'urgent',
		status: 'unread',
		actionUrl: '/communication/campaigns/1',
		actionLabel: 'Review Campaign',
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
	},
	{
		id: '5',
		userId: 'user-1',
		type: 'reminder',
		title: 'Meeting Reminder',
		message: 'Team sync meeting starts in 30 minutes',
		priority: 'high',
		status: 'read',
		readAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
	}
];

const MOCK_PREFERENCES: NotificationPreference[] = [
	{
		id: '1',
		userId: 'user-1',
		channel: 'email',
		type: 'email',
		enabled: true,
		quietHours: {
			start: '22:00',
			end: '08:00',
			enabled: true
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: '2',
		userId: 'user-1',
		channel: 'push',
		type: 'system',
		enabled: true,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: '3',
		userId: 'user-1',
		channel: 'inApp',
		type: 'alert',
		enabled: true,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: '4',
		userId: 'user-1',
		channel: 'sms',
		type: 'urgent',
		enabled: false,
		createdAt: new Date(),
		updatedAt: new Date()
	}
];

/**
 * Fetch notifications for the current user
 */
export async function fetchNotifications(options?: {
	limit?: number;
	status?: Notification['status'];
	type?: Notification['type'];
	priority?: Notification['priority'];
}): Promise<{
	success: boolean;
	data?: Notification[];
	error?: string;
}> {
	try {
		// TODO: Replace with Supabase query when available
		// const { data, error } = await supabase
		// 	.from('notifications')
		// 	.select('*')
		// 	.eq('user_id', 'current-user-id')
		// 	.order('created_at', { ascending: false })
		// 	.limit(options?.limit || 50);

		// if (error) throw error;

		// Filter mock data based on options
		let filtered = [...MOCK_NOTIFICATIONS];
		
		if (options?.status) {
			filtered = filtered.filter(n => n.status === options.status);
		}
		
		if (options?.type) {
			filtered = filtered.filter(n => n.type === options.type);
		}
		
		if (options?.priority) {
			filtered = filtered.filter(n => n.priority === options.priority);
		}
		
		if (options?.limit) {
			filtered = filtered.slice(0, options.limit);
		}

		// Sort by createdAt (newest first)
		filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		return {
			success: true,
			data: filtered
		};
	} catch (error) {
		console.error('Error fetching notifications:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch notifications'
		};
	}
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id: string): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		// TODO: Replace with Supabase update when available
		// const { error } = await supabase
		// 	.from('notifications')
		// 	.update({ status: 'read', read_at: new Date().toISOString() })
		// 	.eq('id', id);

		// if (error) throw error;

		// Update mock data
		const notification = MOCK_NOTIFICATIONS.find(n => n.id === id);
		if (notification) {
			notification.status = 'read';
			notification.readAt = new Date();
		}

		return { success: true };
	} catch (error) {
		console.error('Error marking notification as read:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to mark notification as read'
		};
	}
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		// TODO: Replace with Supabase update when available
		// const { error } = await supabase
		// 	.from('notifications')
		// 	.update({ status: 'read', read_at: new Date().toISOString() })
		// 	.eq('user_id', 'current-user-id')
		// 	.eq('status', 'unread');

		// if (error) throw error;

		// Update mock data
		const now = new Date();
		MOCK_NOTIFICATIONS.forEach(notification => {
			if (notification.status === 'unread') {
				notification.status = 'read';
				notification.readAt = now;
			}
		});

		return { success: true };
	} catch (error) {
		console.error('Error marking all notifications as read:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to mark all notifications as read'
		};
	}
}

/**
 * Archive notification
 */
export async function archiveNotification(id: string): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		// TODO: Replace with Supabase update when available
		// const { error } = await supabase
		// 	.from('notifications')
		// 	.update({ status: 'archived', archived_at: new Date().toISOString() })
		// 	.eq('id', id);

		// if (error) throw error;

		// Update mock data
		const notification = MOCK_NOTIFICATIONS.find(n => n.id === id);
		if (notification) {
			notification.status = 'archived';
			notification.archivedAt = new Date();
		}

		return { success: true };
	} catch (error) {
		console.error('Error archiving notification:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to archive notification'
		};
	}
}

/**
 * Delete notification
 */
export async function deleteNotification(id: string): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		// TODO: Replace with Supabase delete when available
		// const { error } = await supabase
		// 	.from('notifications')
		// 	.delete()
		// 	.eq('id', id);

		// if (error) throw error;

		// Update mock data (remove from array)
		const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === id);
		if (index !== -1) {
			MOCK_NOTIFICATIONS.splice(index, 1);
		}

		return { success: true };
	} catch (error) {
		console.error('Error deleting notification:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to delete notification'
		};
	}
}

/**
 * Create a new notification
 */
export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<{
	success: boolean;
	data?: Notification;
	error?: string;
}> {
	try {
		// TODO: Replace with Supabase insert when available
		// const { data, error } = await supabase
		// 	.from('notifications')
		// 	.insert([{
		// 		...notification,
		// 		created_at: new Date().toISOString()
		// 	}])
		// 	.select()
		// 	.single();

		// if (error) throw error;

		const newNotification: Notification = {
			...notification,
			id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			createdAt: new Date()
		};

		MOCK_NOTIFICATIONS.unshift(newNotification);

		return {
			success: true,
			data: newNotification
		};
	} catch (error) {
		console.error('Error creating notification:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create notification'
		};
	}
}

/**
 * Fetch notification preferences
 */
export async function fetchNotificationPreferences(): Promise<{
	success: boolean;
	data?: NotificationPreference[];
	error?: string;
}> {
	try {
		// TODO: Replace with Supabase query when available
		// const { data, error } = await supabase
		// 	.from('notification_preferences')
		// 	.select('*')
		// 	.eq('user_id', 'current-user-id');

		// if (error) throw error;

		return {
			success: true,
			data: MOCK_PREFERENCES
		};
	} catch (error) {
		console.error('Error fetching notification preferences:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch notification preferences'
		};
	}
}

/**
 * Update notification preference
 */
export async function updateNotificationPreference(
	id: string,
	updates: Partial<NotificationPreference>
): Promise<{
	success: boolean;
	data?: NotificationPreference;
	error?: string;
}> {
	try {
		// TODO: Replace with Supabase update when available
		// const { data, error } = await supabase
		// 	.from('notification_preferences')
		// 	.update({
		// 		...updates,
		// 		updated_at: new Date().toISOString()
		// 	})
		// 	.eq('id', id)
		// 	.select()
		// 	.single();

		// if (error) throw error;

		const preference = MOCK_PREFERENCES.find(p => p.id === id);
		if (preference) {
			Object.assign(preference, updates, { updatedAt: new Date() });
		}

		return {
			success: true,
			data: preference
		};
	} catch (error) {
		console.error('Error updating notification preference:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update notification preference'
		};
	}
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(): Promise<{
	success: boolean;
	data?: {
		total: number;
		unread: number;
		urgent: number;
		byType: Record<string, number>;
		byPriority: Record<string, number>;
	};
	error?: string;
}> {
	try {
		const result = await fetchNotifications();
		
		if (!result.success || !result.data) {
			return {
				success: false,
				error: result.error
			};
		}

		const notifications = result.data;
		const total = notifications.length;
		const unread = notifications.filter(n => n.status === 'unread').length;
		const urgent = notifications.filter(n => n.priority === 'urgent').length;

		const byType: Record<string, number> = {};
		const byPriority: Record<string, number> = {};

		notifications.forEach(notification => {
			byType[notification.type] = (byType[notification.type] || 0) + 1;
			byPriority[notification.priority] = (byPriority[notification.priority] || 0) + 1;
		});

		return {
			success: true,
			data: {
				total,
				unread,
				urgent,
				byType,
				byPriority
			}
		};
	} catch (error) {
		console.error('Error getting notification stats:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to get notification stats'
		};
	}
}

/**
 * Send a test notification
 */
export async function sendTestNotification(type: Notification['type'] = 'system'): Promise<{
	success: boolean;
	data?: Notification;
	error?: string;
}> {
	try {
		const testNotifications: Record<Notification['type'], Omit<Notification, 'id' | 'createdAt'>> = {
			email: {
				userId: 'user-1',
				type: 'email',
				title: 'Test Email Notification',
				message: 'This is a test email notification to verify the system is working.',
				priority: 'normal',
				status: 'unread',
				actionUrl: '/communication/email',
				actionLabel: 'View Emails'
			},
			system: {
				userId: 'user-1',
				type: 'system',
				title: 'Test System Notification',
				message: 'This is a test system notification to verify the system is working.',
				priority: 'low',
				status: 'unread'
			},
			alert: {
				userId: 'user-1',
				type: 'alert',
				title: 'Test Alert Notification',
				message: 'This is a test alert notification to verify the system is working.',
				priority: 'high',
				status: 'unread',
				actionUrl: '/communication',
				actionLabel: 'Go to Dashboard'
			},
			reminder: {
				userId: 'user-1',
				type: 'reminder',
				title: 'Test Reminder Notification',
				message: 'This is a test reminder notification to verify the system is working.',
				priority: 'normal',
				status: 'unread'
			},
			campaign: {
				userId: 'user-1',
				type: 'campaign',
				title: 'Test Campaign Notification',
				message: 'This is a test campaign notification to verify the system is working.',
				priority: 'normal',
				status: 'unread',
				actionUrl: '/communication/campaigns',
				actionLabel: 'View Campaigns'
			},
			project: {
				userId: 'user-1',
				type: 'project',
				title: 'Test Project Notification',
				message: 'This is a test project notification to verify the system is working.',
				priority: 'normal',
				status: 'unread',
				actionUrl: '/projects',
				actionLabel: 'View Projects'
			}
		};

		const testNotification = testNotifications[type];
		if (!testNotification) {
			return {
				success: false,
				error: `Invalid notification type: ${type}`
			};
		}

		return await createNotification(testNotification);
	} catch (error) {
		console.error('Error sending test notification:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to send test notification'
		};
	}
}

/**
	* Clear all notifications
	*/
export async function clearAllNotifications(): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		// TODO: Replace with Supabase delete when available
		// const { error } = await supabase
		// 	.from('notifications')
		// 	.delete()
		// 	.eq('user_id', 'current-user-id');

		// if (error) throw error;

		// Clear mock data
		MOCK_NOTIFICATIONS.length = 0;

		return { success: true };
	} catch (error) {
		console.error('Error clearing all notifications:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to clear all notifications'
		};
	}
}

/**
	* Get unread notification count
	*/
export async function getUnreadCount(): Promise<{
	success: boolean;
	data?: number;
	error?: string;
}> {
	try {
		const result = await fetchNotifications();
		
		if (!result.success || !result.data) {
			return {
				success: false,
				error: result.error
			};
		}

		const unreadCount = result.data.filter(n => n.status === 'unread').length;
		
		return {
			success: true,
			data: unreadCount
		};
	} catch (error) {
		console.error('Error getting unread count:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to get unread count'
		};
	}
}

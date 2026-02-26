import { writable, derived } from 'svelte/store';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationAction {
	label: string;
	callback: () => void;
}

export interface Notification {
	id: string;
	title: string;
	message: string;
	type: NotificationType;
	read: boolean;
	timestamp: number;
	timeAgo: string;
	action?: NotificationAction;
}

function createNotificationsStore() {
	const { subscribe, update, set } = writable<Notification[]>([
		{
			id: '1',
			title: 'Welcome to Oscar AI',
			message: 'Your AI assistant is ready to help with project intelligence.',
			type: 'info',
			read: false,
			timestamp: Date.now() - 3600000,
			timeAgo: '1 hour ago'
		},
		{
			id: '2',
			title: 'File uploaded',
			message: 'Project_plan.pdf has been added to your attachments.',
			type: 'success',
			read: true,
			timestamp: Date.now() - 7200000,
			timeAgo: '2 hours ago'
		},
		{
			id: '3',
			title: 'Voice note transcribed',
			message: 'Your voice recording has been converted to text and saved.',
			type: 'success',
			read: false,
			timestamp: Date.now() - 1800000,
			timeAgo: '30 minutes ago'
		},
		{
			id: '4',
			title: 'Camera permission needed',
			message: 'Allow camera access to capture images for reports.',
			type: 'warning',
			read: false,
			timestamp: Date.now() - 900000,
			timeAgo: '15 minutes ago',
			action: {
				label: 'Grant permission',
				callback: () => {
					console.log('Request camera permission');
				}
			}
		}
	]);

	function add(notification: Omit<Notification, 'id' | 'timestamp' | 'timeAgo' | 'read'>) {
		const id = Math.random().toString(36).substring(2, 9);
		const timestamp = Date.now();
		const timeAgo = getTimeAgo(timestamp);
		update(notifications => [
			{ ...notification, id, timestamp, timeAgo, read: false },
			...notifications
		]);
	}

	function markAsRead(id: string) {
		update(notifications =>
			notifications.map(n => (n.id === id ? { ...n, read: true } : n))
		);
	}

	function clearAll() {
		set([]);
	}

	function getUnreadCount() {
		let unread = 0;
		update(notifications => {
			unread = notifications.filter(n => !n.read).length;
			return notifications;
		});
		return unread;
	}

	return {
		subscribe,
		add,
		markAsRead,
		clearAll,
		getUnreadCount
	};
}

function getTimeAgo(timestamp: number): string {
	const diff = Date.now() - timestamp;
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (minutes < 1) return 'Just now';
	if (minutes < 60) return `${minutes}m ago`;
	if (hours < 24) return `${hours}h ago`;
	return `${days}d ago`;
}

export const notificationsStore = createNotificationsStore();

export const unreadCount = derived(notificationsStore, $store =>
	$store.filter(n => !n.read).length
);

export function addNotification(
	title: string,
	message: string,
	type: NotificationType = 'info',
	action?: NotificationAction
) {
	notificationsStore.add({ title, message, type, action });
}

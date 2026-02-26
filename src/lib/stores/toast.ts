import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: number;
	message: string;
	type: ToastType;
	duration?: number;
}

const toastStore = writable<Toast[]>([]);

export const toasts = {
	subscribe: toastStore.subscribe,
	add(message: string, type: ToastType = 'info', duration = 3000) {
		const id = Date.now();
		toastStore.update(toasts => [...toasts, { id, message, type, duration }]);
		if (duration > 0) {
			setTimeout(() => {
				this.remove(id);
			}, duration);
		}
		return id;
	},
	remove(id: number) {
		toastStore.update(toasts => toasts.filter(t => t.id !== id));
	},
	clear() {
		toastStore.set([]);
	}
};

// Convenience functions
export function showToast(message: string, type: ToastType = 'info', duration?: number) {
	return toasts.add(message, type, duration);
}

export function success(message: string, duration?: number) {
	return toasts.add(message, 'success', duration);
}

export function error(message: string, duration?: number) {
	return toasts.add(message, 'error', duration);
}

export function info(message: string, duration?: number) {
	return toasts.add(message, 'info', duration);
}

export function warning(message: string, duration?: number) {
	return toasts.add(message, 'warning', duration);
}
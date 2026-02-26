import { writable } from 'svelte/store';

export interface DebugLogEntry {
	id: number;
	timestamp: number;
	component: string;
	message: string;
	data?: any;
}

const debugLog = writable<DebugLogEntry[]>([]);
const visible = writable(true);

let nextId = 1;

export const debugStore = {
	subscribe: debugLog.subscribe,
	log(component: string, message: string, data?: any) {
		const entry: DebugLogEntry = {
			id: nextId++,
			timestamp: Date.now(),
			component,
			message,
			data
		};
		debugLog.update(logs => {
			// Keep last 50 entries
			const newLogs = [...logs, entry];
			if (newLogs.length > 50) {
				return newLogs.slice(-50);
			}
			return newLogs;
		});
		// Also log to console for dev tools
		console.log(`[${component}] ${message}`, data || '');
	},
	clear() {
		debugLog.set([]);
	},
	toggleVisibility() {
		visible.update(v => !v);
	},
	visible
};
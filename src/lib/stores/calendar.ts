import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface CalendarEvent {
	id: string;
	title: string;
	date: string; // YYYY-MM-DD
	time: string; // HH:mm
	dateTime: string; // ISO string
	description?: string;
}

function createCalendarStore() {
	const defaultValue: CalendarEvent[] = [
		{
			id: '1',
			title: 'Team Standup',
			date: new Date().toISOString().split('T')[0],
			time: '09:30',
			dateTime: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
			description: 'Daily sync with the team'
		},
		{
			id: '2',
			title: 'Client Review',
			date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
			time: '14:00',
			dateTime: new Date(Date.now() + 86400000 + 14 * 3600000).toISOString(),
			description: 'Review project progress with client'
		},
		{
			id: '3',
			title: 'Report Deadline',
			date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
			time: '17:00',
			dateTime: new Date(Date.now() + 2 * 86400000 + 17 * 3600000).toISOString(),
			description: 'Submit weekly report'
		}
	];

	const { subscribe, set, update } = writable<CalendarEvent[]>(defaultValue);

	// Load from localStorage in browser
	if (browser) {
		const stored = localStorage.getItem('calendarEvents');
		if (stored) {
			try {
				set(JSON.parse(stored));
			} catch (e) {
				console.error('Failed to parse calendar events from localStorage', e);
			}
		}
	}

	function saveToStorage(events: CalendarEvent[]) {
		if (browser) {
			localStorage.setItem('calendarEvents', JSON.stringify(events));
		}
	}

	function addEvent(event: Omit<CalendarEvent, 'id'>) {
		const id = Math.random().toString(36).substring(2, 9);
		const newEvent = { ...event, id };
		update(events => {
			const updated = [...events, newEvent];
			saveToStorage(updated);
			return updated;
		});
	}

	function deleteEvent(id: string) {
		update(events => {
			const updated = events.filter(e => e.id !== id);
			saveToStorage(updated);
			return updated;
		});
	}

	function updateEvent(id: string, updates: Partial<CalendarEvent>) {
		update(events => {
			const updated = events.map(e => e.id === id ? { ...e, ...updates } : e);
			saveToStorage(updated);
			return updated;
		});
	}

	return {
		subscribe,
		addEvent,
		deleteEvent,
		updateEvent,
		reset: () => {
			set(defaultValue);
			saveToStorage(defaultValue);
		}
	};
}

export const calendarStore = createCalendarStore();
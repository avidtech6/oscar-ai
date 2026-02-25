/**
 * Calendar Store
 * State management for calendar events
 */

import { writable, derived } from 'svelte/store';
import type { CalendarEvent } from '$lib/services/calendarService';
import {
	fetchCalendarEvents,
	fetchUpcomingEvents,
	createCalendarEvent as createEvent,
	updateCalendarEvent as updateEvent,
	deleteCalendarEvent as deleteEvent,
	fetchEventsByDateRange
} from '$lib/services/calendarService';

export interface CalendarStoreState {
	events: CalendarEvent[];
	upcomingEvents: CalendarEvent[];
	loading: boolean;
	error: string | null;
	selectedDate: Date | null;
	viewMode: 'week' | 'month' | 'day';
}

// Initial state
const initialState: CalendarStoreState = {
	events: [],
	upcomingEvents: [],
	loading: false,
	error: null,
	selectedDate: new Date(),
	viewMode: 'week'
};

// Create store
const createCalendarStore = () => {
	const { subscribe, set, update } = writable<CalendarStoreState>(initialState);

	return {
		subscribe,

		// Load all calendar events
		async loadEvents() {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await fetchCalendarEvents();
				if (result.success && result.data) {
					update(state => ({ 
						...state, 
						events: result.data || [],
						loading: false 
					}));
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to load events',
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

		// Load upcoming events
		async loadUpcomingEvents(limit = 10) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await fetchUpcomingEvents(limit);
				if (result.success && result.data) {
					update(state => ({ 
						...state, 
						upcomingEvents: result.data || [],
						loading: false 
					}));
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to load upcoming events',
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

		// Create a new calendar event
		async createEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await createEvent(event);
				if (result.success && result.data) {
					update(state => ({ 
						...state, 
						events: [...state.events, result.data as CalendarEvent],
						loading: false 
					}));
					return { success: true, data: result.data };
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to create event',
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

		// Update an existing event
		async updateEvent(id: string, updates: Partial<CalendarEvent>) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await updateEvent(id, updates);
				if (result.success && result.data) {
					update(state => ({ 
						...state, 
						events: state.events.map(event => 
							event.id === id ? { ...event, ...result.data } : event
						),
						loading: false 
					}));
					return { success: true, data: result.data };
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to update event',
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

		// Delete an event
		async deleteEvent(id: string) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await deleteEvent(id);
				if (result.success) {
					update(state => ({ 
						...state, 
						events: state.events.filter(event => event.id !== id),
						loading: false 
					}));
					return { success: true };
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to delete event',
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

		// Load events for a date range
		async loadEventsByDateRange(startDate: string, endDate: string) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const result = await fetchEventsByDateRange(startDate, endDate);
				if (result.success && result.data) {
					update(state => ({ 
						...state, 
						events: result.data || [],
						loading: false 
					}));
				} else {
					update(state => ({ 
						...state, 
						error: result.error || 'Failed to load events for date range',
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

		// Set selected date
		setSelectedDate(date: Date) {
			update(state => ({ ...state, selectedDate: date }));
		},

		// Set view mode
		setViewMode(mode: 'week' | 'month' | 'day') {
			update(state => ({ ...state, viewMode: mode }));
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

export const calendarStore = createCalendarStore();

// Derived stores
export const todayEvents = derived(calendarStore, ($store) => {
	const today = new Date().toISOString().split('T')[0];
	return $store.events.filter(event =>
		new Date(event.start_time).toISOString().split('T')[0] === today
	);
});

export const thisWeekEvents = derived(calendarStore, ($store) => {
	const today = new Date();
	const startOfWeek = new Date(today);
	startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
	const endOfWeek = new Date(startOfWeek);
	endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
	
	return $store.events.filter(event => {
		const eventDate = new Date(event.start_time);
		return eventDate >= startOfWeek && eventDate <= endOfWeek;
	});
});

export const eventStats = derived([calendarStore, todayEvents], ([$store, $todayEvents]) => {
	const total = $store.events.length;
	const todayCount = $todayEvents.length;
	const upcomingCount = $store.upcomingEvents.length;
	
	const byType = $store.events.reduce((acc, event) => {
		acc[event.event_type] = (acc[event.event_type] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);
	
	return {
		total,
		todayCount,
		upcomingCount,
		byType
	};
});
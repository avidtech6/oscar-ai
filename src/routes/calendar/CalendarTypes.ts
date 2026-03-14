export interface CalendarEvent {
	id: number;
	title: string;
	date: string;
	time: string;
	type: 'fieldwork' | 'meeting' | 'deadline' | 'event';
	attendees: string[];
}

export interface CalendarStats {
	totalEvents: number;
	uniqueAttendees: number;
	deadlines: number;
}

export interface CalendarActions {
	addEvent: (title: string, date: string, time: string) => void;
	removeEvent: (eventId: number) => void;
}
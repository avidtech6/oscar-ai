import { EVENT_ICONS, EVENT_COLORS } from './CalendarConstants.js';

export const getEventIcon = (type: 'fieldwork' | 'meeting' | 'deadline' | 'event'): string => {
	switch (type) {
		case 'fieldwork': return EVENT_ICONS.FIELDWORK;
		case 'meeting': return EVENT_ICONS.MEETING;
		case 'deadline': return EVENT_ICONS.DEADLINE;
		default: return EVENT_ICONS.EVENT;
	}
};

export const getEventBorderColor = (type: 'fieldwork' | 'meeting' | 'deadline' | 'event'): string => {
	switch (type) {
		case 'fieldwork': return EVENT_COLORS.FIELDWORK;
		case 'meeting': return EVENT_COLORS.MEETING;
		case 'deadline': return EVENT_COLORS.DEADLINE;
		default: return EVENT_COLORS.EVENT;
	}
};

export const formatDate = (date: string): string => {
	return date;
};

export const formatAttendees = (attendees: string[]): string => {
	return attendees.join(', ');
};
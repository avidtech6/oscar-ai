export const EVENT_TYPES = {
	FIELDWORK: 'fieldwork',
	MEETING: 'meeting',
	DEADLINE: 'deadline',
	EVENT: 'event'
} as const;

export const EVENT_ICONS = {
	FIELDWORK: '🌳',
	MEETING: '🤝',
	DEADLINE: '⏰',
	EVENT: '📅'
} as const;

export const EVENT_COLORS = {
	FIELDWORK: '#10b981',
	MEETING: '#3b82f6',
	DEADLINE: '#ef4444',
	EVENT: '#8b5cf6'
} as const;

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
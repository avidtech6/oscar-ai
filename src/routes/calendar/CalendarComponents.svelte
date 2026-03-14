<script lang="ts">
	import { onMount } from 'svelte';
	import type { CalendarEvent } from './CalendarData.js';
	import { EVENT_TYPES } from './CalendarConstants.js';

	let newEventTitle = '';
	let newEventDate = '';
	let newEventTime = '';

	let events: CalendarEvent[] = [];
	let stats = {
		totalEvents: 0,
		upcomingEvents: 0,
		overdueEvents: 0
	};

	let calendarActions = {
		addEvent: (title: string, date: string, time: string) => {
			if (!title || !date) return;
			
			const newEvent: CalendarEvent = {
				id: Date.now(),
				title,
				date,
				time: time || 'All day',
				type: EVENT_TYPES.EVENT,
				attendees: []
			};
			
			events = [...events, newEvent];
			stats.totalEvents = events.length;
			
			newEventTitle = '';
			newEventDate = '';
			newEventTime = '';
		}
	};

	onMount(() => {
		events = [
			{
				id: 1,
				title: 'Team Meeting',
				date: '2025-03-15',
				time: '10:00',
				type: EVENT_TYPES.MEETING,
				attendees: ['alice@example.com', 'bob@example.com']
			},
			{
				id: 2,
				title: 'Project Deadline',
				date: '2025-03-18',
				time: '17:00',
				type: EVENT_TYPES.DEADLINE,
				attendees: []
			},
			{
				id: 3,
				title: 'Field Work',
				date: '2025-03-20',
				time: '09:00',
				type: EVENT_TYPES.FIELDWORK,
				attendees: ['team@company.com']
			}
		];
		
		stats.totalEvents = events.length;
		stats.upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;
		stats.overdueEvents = events.filter(e => new Date(e.date) < new Date()).length;
	});
</script>

<div class="event-types">
	<div class="type-item">
		<span class="type-dot fieldwork"></span>
		<span>Field Work</span>
	</div>
	<div class="type-item">
		<span class="type-dot meeting"></span>
		<span>Meeting</span>
	</div>
	<div class="type-item">
		<span class="type-dot deadline"></span>
		<span>Deadline</span>
	</div>
	<div class="type-item">
		<span class="type-dot event"></span>
		<span>Event</span>
	</div>
</div>

<div class="hint">
	Click on any event to view details and edit
</div>
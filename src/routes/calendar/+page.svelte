<script lang="ts">
	import { page } from '$app/stores';
	import CalendarEventList from './CalendarEventList.svelte';
	import CalendarComponents from './CalendarComponents.svelte';
	import type { CalendarEvent, CalendarActions } from './CalendarData.js';

	let events: CalendarEvent[] = [
		{ id: 1, title: 'Tree Survey - Oak Park', date: 'Mar 5, 2026', time: '9:00 AM', type: 'fieldwork', attendees: ['You', 'Team A'] },
		{ id: 2, title: 'Client Meeting: Woodland Plan', date: 'Mar 7, 2026', time: '2:00 PM', type: 'meeting', attendees: ['You', 'Client'] },
		{ id: 3, title: 'Deadline: Risk Assessment Report', date: 'Mar 10, 2026', time: '5:00 PM', type: 'deadline', attendees: ['You'] },
		{ id: 4, title: 'Team Sync', date: 'Mar 12, 2026', time: '10:00 AM', type: 'meeting', attendees: ['Team A', 'Team B'] },
		{ id: 5, title: 'Tree Planting Workshop', date: 'Mar 15, 2026', time: '1:00 PM', type: 'event', attendees: ['Public'] }
	];

	const calendarActions: CalendarActions = {
		addEvent: (title: string, date: string, time: string) => {
			if (!title.trim() || !date.trim()) return;
			events = [
				...events,
				{
					id: events.length + 1,
					title: title,
					date: date,
					time: time || 'TBD',
					type: 'event',
					attendees: ['You']
				}
			];
		},
		removeEvent: (eventId: number) => {
			events = events.filter(e => e.id !== eventId);
		}
	};
</script>

<div class="page">
	<h1>Calendar</h1>
	<p class="subtitle">Schedule and view arboricultural events, inspections, and deadlines.</p>

	<div class="stats-row">
		<div class="stat-card">
			<div class="stat-icon">📅</div>
			<div class="stat-content">
				<div class="stat-value">{events.length}</div>
				<div class="stat-label">Upcoming Events</div>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon">👥</div>
			<div class="stat-content">
				<div class="stat-value">{new Set(events.flatMap(e => e.attendees)).size}</div>
				<div class="stat-label">Unique Attendees</div>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon">⏰</div>
			<div class="stat-content">
				<div class="stat-value">{events.filter(e => e.type === 'deadline').length}</div>
				<div class="stat-label">Deadlines</div>
			</div>
		</div>
	</div>

	<div class="content-grid">
		<div class="card">
			<h2>📅 Upcoming Events</h2>
			<CalendarEventList {events} {calendarActions} />
		</div>

		<div class="card">
			<h2>📆 This Week</h2>
			<div class="week-view">
				{#each ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as day}
					<div class="day">
						<div class="day-name">{day}</div>
						<div class="day-events">
							{#each events.filter(e => e.date.includes('Mar') && e.date.includes('5')) as event}
								{#if day === 'Mon'}
									<div class="day-event">{event.title}</div>
								{/if}
							{/each}
						</div>
					</div>
				{/each}
			</div>
			<p class="hint">Click on a day to see detailed schedule.</p>

			<h3>Event Types</h3>
			<CalendarComponents />
		</div>
	</div>
</div>

<style>
	@import './CalendarStyles.css';
</style>
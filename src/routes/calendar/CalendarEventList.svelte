<script lang="ts">
	import type { CalendarEvent, CalendarActions } from './CalendarData.js';
	import { getEventIcon, formatDate, formatAttendees } from './CalendarUtils.js';

	export let events: CalendarEvent[];
	export let calendarActions: CalendarActions;

	let newEventTitle = '';
	let newEventDate = '';
	let newEventTime = '';

	function handleAddEvent() {
		calendarActions.addEvent(newEventTitle, newEventDate, newEventTime);
		newEventTitle = '';
		newEventDate = '';
		newEventTime = '';
	}

	function handleRemoveEvent(eventId: number) {
		calendarActions.removeEvent(eventId);
	}
</script>

<div class="event-list">
	{#each events as event (event.id)}
		<div class="event-item type-{event.type}">
			<div class="event-icon">
				{getEventIcon(event.type)}
			</div>
			<div class="event-details">
				<div class="event-title">{event.title}</div>
				<div class="event-meta">
					<span class="event-date">{formatDate(event.date)}</span>
					<span class="event-time">{event.time}</span>
					<span class="event-type">{event.type}</span>
				</div>
				<div class="event-attendees">
					Attendees: {formatAttendees(event.attendees)}
				</div>
			</div>
			<div class="event-actions">
				<button class="btn-small" onclick={() => console.log('Edit', event.id)}>Edit</button>
				<button class="btn-small btn-danger" onclick={() => handleRemoveEvent(event.id)}>Remove</button>
			</div>
		</div>
	{/each}
</div>

<div class="add-event">
	<input
		type="text"
		bind:value={newEventTitle}
		placeholder="Event title"
	/>
	<input
		type="text"
		bind:value={newEventDate}
		placeholder="Date (e.g., Mar 20, 2026)"
	/>
	<input
		type="text"
		bind:value={newEventTime}
		placeholder="Time (optional)"
	/>
	<button class="btn" onclick={handleAddEvent}>Add Event</button>
</div>
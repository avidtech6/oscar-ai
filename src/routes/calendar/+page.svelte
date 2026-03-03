<script lang="ts">
	import { page } from '$app/stores';

	let events = [
		{ id: 1, title: 'Tree Survey - Oak Park', date: 'Mar 5, 2026', time: '9:00 AM', type: 'fieldwork', attendees: ['You', 'Team A'] },
		{ id: 2, title: 'Client Meeting: Woodland Plan', date: 'Mar 7, 2026', time: '2:00 PM', type: 'meeting', attendees: ['You', 'Client'] },
		{ id: 3, title: 'Deadline: Risk Assessment Report', date: 'Mar 10, 2026', time: '5:00 PM', type: 'deadline', attendees: ['You'] },
		{ id: 4, title: 'Team Sync', date: 'Mar 12, 2026', time: '10:00 AM', type: 'meeting', attendees: ['Team A', 'Team B'] },
		{ id: 5, title: 'Tree Planting Workshop', date: 'Mar 15, 2026', time: '1:00 PM', type: 'event', attendees: ['Public'] }
	];

	let newEventTitle = '';
	let newEventDate = '';
	let newEventTime = '';

	function addEvent() {
		if (!newEventTitle.trim() || !newEventDate.trim()) return;
		events = [
			...events,
			{
				id: events.length + 1,
				title: newEventTitle,
				date: newEventDate,
				time: newEventTime || 'TBD',
				type: 'event',
				attendees: ['You']
			}
		];
		newEventTitle = '';
		newEventDate = '';
		newEventTime = '';
	}

	function removeEvent(eventId: number) {
		events = events.filter(e => e.id !== eventId);
	}
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
			<div class="event-list">
				{#each events as event (event.id)}
					<div class="event-item type-{event.type}">
						<div class="event-icon">
							{#if event.type === 'fieldwork'}🌳
							{:else if event.type === 'meeting'}🤝
							{:else if event.type === 'deadline'}⏰
							{:else}📅
							{/if}
						</div>
						<div class="event-details">
							<div class="event-title">{event.title}</div>
							<div class="event-meta">
								<span class="event-date">{event.date}</span>
								<span class="event-time">{event.time}</span>
								<span class="event-type">{event.type}</span>
							</div>
							<div class="event-attendees">
								Attendees: {event.attendees.join(', ')}
							</div>
						</div>
						<div class="event-actions">
							<button class="btn-small" onclick={() => console.log('Edit', event.id)}>Edit</button>
							<button class="btn-small btn-danger" onclick={() => removeEvent(event.id)}>Remove</button>
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
				<button class="btn" onclick={addEvent}>Add Event</button>
			</div>
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
			<div class="event-types">
				<div class="type-item">
					<span class="type-dot fieldwork"></span>
					<span>Fieldwork</span>
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
		</div>
	</div>
</div>

<style>
	.page {
		padding: 2rem;
	}
	h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 0.5rem;
	}
	.subtitle {
		color: #6b7280;
		font-size: 1.125rem;
		margin-bottom: 2rem;
	}
	.stats-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}
	.stat-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border-left: 4px solid #3b82f6;
	}
	.stat-icon {
		font-size: 2rem;
	}
	.stat-content {
		flex: 1;
	}
	.stat-value {
		font-size: 1.75rem;
		font-weight: 700;
		color: #111827;
		line-height: 1;
	}
	.stat-label {
		font-size: 0.875rem;
		color: #6b7280;
		margin-top: 0.25rem;
	}
	.content-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 2rem;
	}
	.card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		border: 1px solid #e5e7eb;
	}
	.card h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin-bottom: 1.5rem;
	}
	.event-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	.event-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		transition: background 0.2s;
	}
	.event-item.type-fieldwork {
		border-left: 4px solid #10b981;
	}
	.event-item.type-meeting {
		border-left: 4px solid #3b82f6;
	}
	.event-item.type-deadline {
		border-left: 4px solid #ef4444;
	}
	.event-item.type-event {
		border-left: 4px solid #8b5cf6;
	}
	.event-icon {
		font-size: 1.5rem;
	}
	.event-details {
		flex: 1;
	}
	.event-title {
		font-weight: 600;
		color: #111827;
		margin-bottom: 0.25rem;
	}
	.event-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.75rem;
		color: #6b7280;
		margin-bottom: 0.5rem;
	}
	.event-attendees {
		font-size: 0.75rem;
		color: #4b5563;
	}
	.event-actions {
		display: flex;
		gap: 0.5rem;
	}
	.btn-small {
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		cursor: pointer;
	}
	.btn-small.btn-danger {
		background: #ef4444;
	}
	.add-event {
		display: flex;
		gap: 0.5rem;
		margin-top: 1.5rem;
	}
	.add-event input {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.875rem;
	}
	.btn {
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}
	.btn:hover {
		background: #2563eb;
	}
	.week-view {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}
	.day {
		background: #f9fafb;
		border-radius: 8px;
		padding: 0.75rem;
		text-align: center;
	}
	.day-name {
		font-weight: 600;
		color: #111827;
		margin-bottom: 0.5rem;
	}
	.day-events {
		font-size: 0.75rem;
		color: #6b7280;
	}
	.hint {
		font-size: 0.875rem;
		color: #6b7280;
		margin-top: 1rem;
	}
	.event-types {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}
	.type-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.type-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		display: inline-block;
	}
	.type-dot.fieldwork {
		background: #10b981;
	}
	.type-dot.meeting {
		background: #3b82f6;
	}
	.type-dot.deadline {
		background: #ef4444;
	}
	.type-dot.event {
		background: #8b5cf6;
	}
</style>
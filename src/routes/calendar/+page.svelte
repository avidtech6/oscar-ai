<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import {
		fetchUpcomingEvents,
		fetchEventsByDateRange,
		createCalendarEvent,
		formatEventForDisplay,
		type CalendarEvent
	} from '$lib/services/calendarService';

	// Real calendar data
	let loading = true;
	let upcomingEvents: Array<{
		id?: string;
		title: string;
		date: string;
		color: string;
		time: string;
		rawEvent?: CalendarEvent;
	}> = [];
	let calendarEvents: Array<{
		day: string;
		events: Array<{
			title: string;
			time: string;
			color: string;
			rawEvent?: CalendarEvent;
		}>;
	}> = [];
	let error: string | null = null;

	// Form state
	let newEventTitle = '';
	let newEventDateTime = '';
	let newEventColor = 'bg-blue-500';
	let newEventType: 'site_visit' | 'client_meeting' | 'deadline' | 'team_sync' | 'other' = 'site_visit';

	// Current week dates
	const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const currentWeekDates = [
		'2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20',
		'2026-02-21', '2026-02-22', '2026-02-23'
	];

	async function loadCalendarData() {
		loading = true;
		error = null;

		try {
			// Load upcoming events
			const upcomingResult = await fetchUpcomingEvents(10);
			if (upcomingResult.success && upcomingResult.data) {
				upcomingEvents = upcomingResult.data.map(event => {
					const formatted = formatEventForDisplay(event);
					return {
						id: event.id,
						title: formatted.title,
						date: formatted.date,
						color: formatted.color,
						time: formatted.time,
						rawEvent: event
					};
				});
			} else {
				error = upcomingResult.error || 'Failed to load upcoming events';
			}

			// Load events for current week
			const weekStart = '2026-02-17';
			const weekEnd = '2026-02-23';
			const weekResult = await fetchEventsByDateRange(weekStart, weekEnd);
			
			if (weekResult.success && weekResult.data) {
				// Group events by day
				const eventsByDay: Record<string, Array<{
					title: string;
					time: string;
					color: string;
					rawEvent?: CalendarEvent;
				}>> = {};
				
				// Initialize empty arrays for each day
				currentWeekDates.forEach(date => {
					eventsByDay[date] = [];
				});

				// Populate events
				weekResult.data.forEach(event => {
					const eventDate = new Date(event.start_time).toISOString().split('T')[0];
					const formatted = formatEventForDisplay(event);
					
					if (eventsByDay[eventDate]) {
						eventsByDay[eventDate].push({
							title: formatted.title,
							time: formatted.time,
							color: event.color || formatted.color.split(' ')[0],
							rawEvent: event
						});
					}
				});

				// Create calendarEvents array matching days
				calendarEvents = days.map((day, index) => ({
					day,
					events: eventsByDay[currentWeekDates[index]] || []
				}));
			} else {
				if (!error) error = weekResult.error || 'Failed to load week events';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error loading calendar data';
			console.error('Error loading calendar:', err);
		} finally {
			loading = false;
		}
	}

	async function handleAddEvent() {
		if (!newEventTitle.trim() || !newEventDateTime) {
			error = 'Please provide a title and date/time';
			return;
		}

		try {
			const startTime = new Date(newEventDateTime);
			const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

			const event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'> = {
				title: newEventTitle,
				description: '',
				start_time: startTime.toISOString(),
				end_time: endTime.toISOString(),
				event_type: newEventType,
				color: newEventColor,
				user_id: 'current-user' // TODO: Get actual user ID
			};

			const result = await createCalendarEvent(event);
			if (result.success) {
				// Reset form
				newEventTitle = '';
				newEventDateTime = '';
				newEventColor = 'bg-blue-500';
				newEventType = 'site_visit';
				
				// Reload data
				await loadCalendarData();
			} else {
				error = result.error || 'Failed to create event';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error creating event';
			console.error('Error creating event:', err);
		}
	}

	onMount(() => {
		loadCalendarData();
	});
</script>

<svelte:head>
	<title>Calendar - Oscar AI</title>
</svelte:head>

<div class="p-6 max-w-6xl mx-auto">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-forest-800 mb-2">Calendar</h1>
		<p class="text-gray-600">
			Schedule management for site visits, client meetings, deadlines, and team coordination.
		</p>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
			<div class="flex items-center gap-4">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				<div>
					<h3 class="text-lg font-semibold text-blue-800 mb-1">Loading Calendar Data</h3>
					<p class="text-blue-700">
						Fetching events from Supabase database...
					</p>
				</div>
			</div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
			<div class="flex items-start gap-4">
				<div class="flex-shrink-0">
					<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
				</div>
				<div>
					<h3 class="text-lg font-semibold text-red-800 mb-1">Error Loading Calendar</h3>
					<p class="text-red-700 mb-3">
						{error}
					</p>
					<button
						on:click={loadCalendarData}
						class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
					>
						Retry
					</button>
				</div>
			</div>
		</div>
	{:else if upcomingEvents.length === 0 && calendarEvents.every(day => day.events.length === 0)}
		<!-- Empty State -->
		<div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
			<div class="flex items-start gap-4">
				<div class="flex-shrink-0">
					<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
					</svg>
				</div>
				<div>
					<h3 class="text-lg font-semibold text-green-800 mb-1">Calendar Ready</h3>
					<p class="text-green-700 mb-3">
						Your calendar is connected to Supabase. Add your first event to get started.
					</p>
					<ul class="list-disc pl-5 text-green-700 space-y-1">
						<li>Schedule site visits and client meetings</li>
						<li>Track report deadlines and project milestones</li>
						<li>Coordinate team syncs and planning sessions</li>
						<li>All data stored securely in Supabase</li>
					</ul>
				</div>
			</div>
		</div>
	{/if}

	<!-- Main Calendar Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Calendar View -->
		<div class="lg:col-span-2">
			<div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
				<div class="flex items-center justify-between mb-6">
					<h3 class="text-xl font-semibold text-gray-800">Week View</h3>
					<div class="flex items-center gap-2">
						<button class="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
							Today
						</button>
						<button class="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
							←
						</button>
						<span class="px-3 py-1.5 text-sm font-medium text-gray-800">Feb 17-23, 2026</span>
						<button class="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
							>
						</button>
					</div>
				</div>

				<!-- Calendar Grid -->
				<div class="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
					{#each days as day}
						<div class="bg-gray-50 p-3 text-center">
							<div class="text-sm font-medium text-gray-700">{day}</div>
							<div class="text-lg font-bold text-gray-900 mt-1">{day === 'Mon' ? '17' : day === 'Tue' ? '18' : day === 'Wed' ? '19' : day === 'Thu' ? '20' : day === 'Fri' ? '21' : day === 'Sat' ? '22' : '23'}</div>
						</div>
					{/each}

					{#each calendarEvents as cell, i}
						<div class="bg-white min-h-32 p-2">
							{#each cell.events as event}
								<div class="mb-1 p-2 rounded text-xs text-white {event.color}">
									<div class="font-medium">{event.title}</div>
									<div class="opacity-90">{event.time}</div>
								</div>
							{/each}
						</div>
					{/each}
				</div>

				<!-- Quick Actions -->
				<div class="mt-6 flex flex-wrap gap-3">
					<button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
						+ New Event
					</button>
					<button class="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
						Import Calendar
					</button>
					<button class="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
						Share Calendar
					</button>
				</div>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Upcoming Events -->
			<div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
				<h3 class="text-lg font-semibold text-gray-800 mb-4">Upcoming Events</h3>
				<div class="space-y-4">
					{#each upcomingEvents as event}
						<div class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
							<div class="flex-shrink-0 w-3 h-3 mt-1.5 rounded-full {event.color.split(' ')[0]}"></div>
							<div class="flex-1">
								<div class="font-medium text-gray-800">{event.title}</div>
								<div class="text-sm text-gray-500">{event.date}</div>
							</div>
							<button class="text-gray-400 hover:text-gray-600">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
								</svg>
							</button>
						</div>
					{/each}
				</div>
			</div>

			<!-- Add Event Form -->
			<div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
				<h3 class="text-lg font-semibold text-gray-800 mb-4">Add New Event</h3>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
						<input
							type="text"
							bind:value={newEventTitle}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Site Visit, Meeting, Deadline"
						>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
						<input
							type="datetime-local"
							bind:value={newEventDateTime}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
						<select
							bind:value={newEventType}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="site_visit">Site Visit</option>
							<option value="client_meeting">Client Meeting</option>
							<option value="deadline">Deadline</option>
							<option value="team_sync">Team Sync</option>
							<option value="other">Other</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
						<div class="flex gap-2">
							{#each [
								{ value: 'bg-blue-500', label: 'Blue' },
								{ value: 'bg-green-500', label: 'Green' },
								{ value: 'bg-red-500', label: 'Red' },
								{ value: 'bg-yellow-500', label: 'Yellow' },
								{ value: 'bg-purple-500', label: 'Purple' }
							] as colorOption}
								<button
									type="button"
									class="w-8 h-8 rounded-full {colorOption.value} border-2 {newEventColor === colorOption.value ? 'border-gray-800' : 'border-transparent'} hover:border-gray-300"
									on:click={() => newEventColor = colorOption.value}
									title={colorOption.label}
								></button>
							{/each}
						</div>
					</div>
					<button
						on:click={handleAddEvent}
						class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={!newEventTitle.trim() || !newEventDateTime}
					>
						Add to Calendar
					</button>
				</div>
			</div>

			<!-- Integration Status -->
			<div class="bg-gray-50 p-4 rounded-lg">
				<h4 class="text-sm font-medium text-gray-700 mb-2">Calendar Integrations</h4>
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">Google Calendar</span>
						<span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Not Connected</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">Outlook Calendar</span>
						<span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Not Connected</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">Apple Calendar</span>
						<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Connected</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<script lang="ts">
	import { calendarStore, todayEvents, thisWeekEvents } from '../../stores/calendarStore';
	import type { CalendarEvent } from '$lib/services/calendarService';
	import { formatEventForDisplay } from '$lib/services/calendarService';

	export let events: CalendarEvent[] = [];
	export let title = 'Calendar Events';
	export let emptyMessage = 'No events scheduled';
	export let showActions = true;
	export let loading = false;

	// Event handlers
	export let onViewEvent: (event: CalendarEvent) => void = () => {};
	export let onEditEvent: (event: CalendarEvent) => void = () => {};
	export let onDeleteEvent: (event: CalendarEvent) => void = () => {};

	// Format event for display
	function formatEvent(event: CalendarEvent) {
		return formatEventForDisplay(event);
	}

	// Handle delete
	async function handleDelete(event: CalendarEvent) {
		if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
			await calendarStore.deleteEvent(event.id!);
			onDeleteEvent(event);
		}
	}
</script>

<div class="bg-white rounded-xl border border-gray-200 shadow-sm">
	<!-- Header -->
	<div class="border-b border-gray-200 px-6 py-4">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-lg font-semibold text-gray-800">{title}</h3>
				<p class="text-sm text-gray-500 mt-1">
					{events.length} {events.length === 1 ? 'event' : 'events'}
				</p>
			</div>
			{#if showActions}
				<button
					on:click={() => calendarStore.loadEvents()}
					class="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
					disabled={loading}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
					</svg>
					Refresh
				</button>
			{/if}
		</div>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="p-8 text-center">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<p class="text-gray-500 mt-3">Loading events...</p>
		</div>

	<!-- Empty State -->
	{:else if events.length === 0}
		<div class="p-8 text-center">
			<svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
			</svg>
			<p class="text-gray-500">{emptyMessage}</p>
		</div>

	<!-- Events List -->
	{:else}
		<div class="divide-y divide-gray-100">
			{#each events as event (event.id || event.title)}
				{@const formatted = formatEvent(event)}
				<div class="px-6 py-4 hover:bg-gray-50 transition-colors">
					<div class="flex items-start gap-4">
						<!-- Color indicator -->
						<div class="flex-shrink-0">
							<div class="w-3 h-3 rounded-full mt-2 {formatted.color.split(' ')[0]}"></div>
						</div>

						<!-- Event details -->
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between">
								<div>
									<h4 class="font-medium text-gray-900 truncate">{event.title}</h4>
									<p class="text-sm text-gray-500 mt-1">
										{formatted.date}
									</p>
									{#if event.description}
										<p class="text-sm text-gray-600 mt-2 line-clamp-2">
											{event.description}
										</p>
									{/if}
								</div>

								<!-- Event type badge -->
								<div class="flex-shrink-0 ml-4">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize {formatted.color}">
										{event.event_type.replace('_', ' ')}
									</span>
								</div>
							</div>

							<!-- Actions -->
							{#if showActions}
								<div class="flex items-center gap-3 mt-3">
									<button
										on:click={() => onViewEvent(event)}
										class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
									>
										View Details
									</button>
									<button
										on:click={() => onEditEvent(event)}
										class="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
									>
										Edit
									</button>
									<button
										on:click={() => handleDelete(event)}
										class="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
									>
										Delete
									</button>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
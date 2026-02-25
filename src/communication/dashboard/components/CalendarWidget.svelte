<script lang="ts">
	import { goto } from '$app/navigation';
	
	// Static placeholder data
	const calendarStats = {
		todayEvents: 3,
		upcoming: 7,
		meetings: 2
	};
	
	// Sample upcoming events
	const upcomingEvents = [
		{ time: '10:00 AM', title: 'Client Meeting', type: 'meeting' },
		{ time: '2:30 PM', title: 'Team Sync', type: 'internal' },
		{ time: '4:00 PM', title: 'Project Review', type: 'review' }
	];
	
	function navigateToCalendar() {
		goto('/communication/calendar');
	}
</script>

<div 
	class="card p-4 hover:shadow-md transition-shadow cursor-pointer"
	on:click={navigateToCalendar}
	role="button"
	tabindex="0"
	on:keydown={(e) => e.key === 'Enter' && navigateToCalendar()}
>
	<div class="flex items-start justify-between mb-3">
		<div>
			<h3 class="font-semibold text-gray-800">Calendar</h3>
			<p class="text-sm text-gray-500">View and manage events</p>
		</div>
		<div class="text-red-600">
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
			</svg>
		</div>
	</div>
	
	<div class="grid grid-cols-3 gap-2 mt-4">
		<div class="text-center p-2 bg-red-50 rounded">
			<div class="text-lg font-bold text-red-700">{calendarStats.todayEvents}</div>
			<div class="text-xs text-red-600">Today</div>
		</div>
		<div class="text-center p-2 bg-blue-50 rounded">
			<div class="text-lg font-bold text-blue-700">{calendarStats.upcoming}</div>
			<div class="text-xs text-blue-600">Upcoming</div>
		</div>
		<div class="text-center p-2 bg-green-50 rounded">
			<div class="text-lg font-bold text-green-700">{calendarStats.meetings}</div>
			<div class="text-xs text-green-600">Meetings</div>
		</div>
	</div>
	
	<!-- Upcoming Events List -->
	<div class="mt-4">
		<h4 class="text-sm font-medium text-gray-700 mb-2">Upcoming Events</h4>
		<div class="space-y-2">
			{#each upcomingEvents as event}
				<div class="flex items-center justify-between p-2 bg-gray-50 rounded">
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 rounded-full {event.type === 'meeting' ? 'bg-red-500' : event.type === 'internal' ? 'bg-blue-500' : 'bg-green-500'}"></div>
						<span class="text-sm text-gray-700">{event.time}</span>
					</div>
					<span class="text-sm text-gray-800 font-medium truncate ml-2">{event.title}</span>
				</div>
			{/each}
		</div>
	</div>
	
	<div class="mt-4 pt-3 border-t border-gray-100">
		<p class="text-sm text-gray-600">Click to view full calendar</p>
	</div>
</div>

<style>
	.card {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		background-color: white;
	}
</style>
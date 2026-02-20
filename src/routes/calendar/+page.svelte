<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	// Calendar page placeholder
	let loading = true;
	let upcomingEvents = [
		{ id: 1, title: 'Site Visit - Oak Park', date: 'Today, 10:00 AM', color: 'bg-green-100 text-green-800' },
		{ id: 2, title: 'Client Meeting - Smith Residence', date: 'Tomorrow, 2:00 PM', color: 'bg-blue-100 text-blue-800' },
		{ id: 3, title: 'Report Deadline - Willow Project', date: 'Feb 22, 5:00 PM', color: 'bg-red-100 text-red-800' },
		{ id: 4, title: 'Team Sync', date: 'Feb 23, 9:00 AM', color: 'bg-purple-100 text-purple-800' },
	];

	onMount(() => {
		// Simulate loading
		setTimeout(() => {
			loading = false;
		}, 500);
	});

	// Mock calendar days for current week
	const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const calendarEvents = [
		{ day: 'Mon', events: [{ title: 'Site Visit', time: '10:00', color: 'bg-green-500' }] },
		{ day: 'Tue', events: [] },
		{ day: 'Wed', events: [{ title: 'Client Call', time: '14:00', color: 'bg-blue-500' }, { title: 'Team Meeting', time: '16:00', color: 'bg-purple-500' }] },
		{ day: 'Thu', events: [{ title: 'Report Due', time: '17:00', color: 'bg-red-500' }] },
		{ day: 'Fri', events: [{ title: 'Planning', time: '9:00', color: 'bg-yellow-500' }] },
		{ day: 'Sat', events: [] },
		{ day: 'Sun', events: [] },
	];
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

	<!-- Coming Soon Banner -->
	<div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
		<div class="flex items-start gap-4">
			<div class="flex-shrink-0">
				<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
				</svg>
			</div>
			<div>
				<h3 class="text-lg font-semibold text-green-800 mb-1">Calendar Integration Coming Soon</h3>
				<p class="text-green-700 mb-3">
					This feature is currently under development. Planned capabilities include:
				</p>
				<ul class="list-disc pl-5 text-green-700 space-y-1">
					<li>Sync with Google Calendar, Outlook, and Apple Calendar</li>
					<li>Automatically schedule site visits and client meetings</li>
					<li>Deadline tracking for reports and projects</li>
					<li>Team availability and scheduling</li>
					<li>Calendar-based reminders and notifications</li>
				</ul>
			</div>
		</div>
	</div>

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
							<
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
						<input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Site Visit, Meeting, Deadline">
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
						<input type="datetime-local" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
						<div class="flex gap-2">
							{#each ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500'] as color}
								<button class="w-8 h-8 rounded-full {color} border-2 border-transparent hover:border-gray-300"></button>
							{/each}
						</div>
					</div>
					<button class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
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
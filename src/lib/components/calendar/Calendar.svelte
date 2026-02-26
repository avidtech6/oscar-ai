<script lang="ts">
	import { onMount } from 'svelte';
	import { calendarStore, addEvent, deleteEvent } from '$lib/stores/calendar';

	let selectedDate = new Date();
	let newEventTitle = '';
	let newEventDate = new Date().toISOString().split('T')[0];
	let newEventTime = '09:00';

	function getDaysInMonth(year: number, month: number) {
		return new Date(year, month + 1, 0).getDate();
	}

	function getFirstDayOfMonth(year: number, month: number) {
		return new Date(year, month, 1).getDay();
	}

	function getMonthName(month: number) {
		return new Date(2000, month, 1).toLocaleString('default', { month: 'long' });
	}

	function getWeekDays() {
		return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	}

	function getEventsForDate(date: Date) {
		const dateStr = date.toISOString().split('T')[0];
		return $calendarStore.filter(event => event.date === dateStr);
	}

	function handleAddEvent() {
		if (!newEventTitle.trim()) return;
		const dateTime = `${newEventDate}T${newEventTime}:00`;
		addEvent({
			title: newEventTitle,
			date: newEventDate,
			time: newEventTime,
			dateTime: new Date(dateTime).toISOString(),
			description: ''
		});
		newEventTitle = '';
		newEventDate = new Date().toISOString().split('T')[0];
		newEventTime = '09:00';
	}

	function handleDeleteEvent(id: string) {
		deleteEvent(id);
	}

	function changeMonth(delta: number) {
		selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + delta, 1);
	}

	const year = selectedDate.getFullYear();
	const month = selectedDate.getMonth();
	const daysInMonth = getDaysInMonth(year, month);
	const firstDay = getFirstDayOfMonth(year, month);
	const weekDays = getWeekDays();
</script>

<div class="flex flex-col min-h-[70vh] p-4">
	<h1 class="text-2xl font-bold text-gray-900 mb-6">Calendar</h1>

	<!-- Month navigation -->
	<div class="flex items-center justify-between mb-6">
		<button
			on:click={() => changeMonth(-1)}
			class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>
		<h2 class="text-xl font-semibold">
			{getMonthName(month)} {year}
		</h2>
		<button
			on:click={() => changeMonth(1)}
			class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</button>
	</div>

	<!-- Calendar grid -->
	<div class="grid grid-cols-7 gap-1 mb-8">
		{#each weekDays as day}
			<div class="text-center text-sm font-medium text-gray-500 py-2">
				{day}
			</div>
		{/each}
		{#each Array(firstDay).fill(0) as _, i}
			<div class="h-24 bg-gray-50 rounded"></div>
		{/each}
		{#each Array(daysInMonth).fill(0) as _, i}
			{const day = i + 1}
			{const date = new Date(year, month, day)}
			{const events = getEventsForDate(date)}
			{const isToday = date.toDateString() === new Date().toDateString()}
			<div class="h-24 border border-gray-200 rounded p-1 {isToday ? 'bg-blue-50' : ''}">
				<div class="flex justify-between items-start">
					<span class="text-sm font-medium {isToday ? 'text-blue-600' : 'text-gray-700'}">
						{day}
					</span>
					{#if events.length > 0}
						<span class="text-xs bg-forest-100 text-forest-800 px-1 rounded">
							{events.length}
						</span>
					{/if}
				</div>
				<div class="mt-1 space-y-1 overflow-y-auto max-h-16">
					{#each events as event}
						<div class="text-xs bg-forest-100 text-forest-800 px-1 rounded truncate">
							{event.time} {event.title}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- Add event form -->
	<div class="border-t pt-6">
		<h3 class="text-lg font-medium mb-4">Add New Event</h3>
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<input
				type="text"
				bind:value={newEventTitle}
				placeholder="Event title"
				class="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
			/>
			<input
				type="date"
				bind:value={newEventDate}
				class="px-4 py-2 border border-gray-300 rounded-lg"
			/>
			<input
				type="time"
				bind:value={newEventTime}
				class="px-4 py-2 border border-gray-300 rounded-lg"
			/>
			<button
				on:click={handleAddEvent}
				class="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
			>
				Add Event
			</button>
		</div>
	</div>

	<!-- Upcoming events list -->
	<div class="mt-8">
		<h3 class="text-lg font-medium mb-4">Upcoming Events</h3>
		{#if $calendarStore.length === 0}
			<p class="text-gray-500">No events scheduled.</p>
		{:else}
			<div class="space-y-3">
				{#each $calendarStore as event (event.id)}
					<div class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
						<div>
							<h4 class="font-medium">{event.title}</h4>
							<p class="text-sm text-gray-600">
								{event.date} at {event.time}
							</p>
						</div>
						<button
							on:click={() => handleDeleteEvent(event.id)}
							class="text-red-500 hover:text-red-700 p-1"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
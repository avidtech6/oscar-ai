<script lang="ts">
	import { calendarStore } from '../../stores/calendarStore';
	import type { CalendarEvent } from '$lib/services/calendarService';

	export let event: CalendarEvent | null = null;
	export let isEditing = false;

	// Form state
	let title = '';
	let description = '';
	let startTime = '';
	let endTime = '';
	let eventType: 'site_visit' | 'client_meeting' | 'deadline' | 'team_sync' | 'other' = 'site_visit';
	let color = 'bg-blue-500';
	let projectId = '';
	let clientId = '';

	// Loading state
	let loading = false;
	let error: string | null = null;

	// Event handlers
	export let onSuccess: (data: { message: string; event?: CalendarEvent }) => void = () => {};
	export let onError: (data: { message: string }) => void = () => {};
	export let onCancel: () => void = () => {};

	// Initialize form with event data if editing
	$: if (event && isEditing) {
		title = event.title;
		description = event.description || '';
		startTime = event.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : '';
		endTime = event.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : '';
		eventType = event.event_type;
		color = event.color || 'bg-blue-500';
		projectId = event.project_id || '';
		clientId = event.client_id || '';
	}

	// Handle form submission
	async function handleSubmit() {
		if (!title.trim()) {
			error = 'Title is required';
			return;
		}

		if (!startTime) {
			error = 'Start time is required';
			return;
		}

		if (!endTime) {
			error = 'End time is required';
			return;
		}

		loading = true;
		error = null;

		try {
			const eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'> = {
				title: title.trim(),
				description: description.trim() || undefined,
				start_time: new Date(startTime).toISOString(),
				end_time: new Date(endTime).toISOString(),
				event_type: eventType,
				color,
				project_id: projectId || undefined,
				client_id: clientId || undefined,
				user_id: 'current-user' // TODO: Get actual user ID
			};

			let result;
			if (isEditing && event?.id) {
				result = await calendarStore.updateEvent(event.id, eventData);
			} else {
				result = await calendarStore.createEvent(eventData);
			}

			if (result.success) {
				// Reset form
				if (!isEditing) {
					title = '';
					description = '';
					startTime = '';
					endTime = '';
					eventType = 'site_visit';
					color = 'bg-blue-500';
					projectId = '';
					clientId = '';
				}

				onSuccess({
					message: isEditing ? 'Event updated successfully' : 'Event created successfully',
					event: result.data
				});
			} else {
				error = result.error || 'Failed to save event';
				onError({ message: error });
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
			onError({ message: error });
		} finally {
			loading = false;
		}
	}

	// Set default end time (1 hour after start)
	function setDefaultEndTime() {
		if (startTime && !endTime) {
			const start = new Date(startTime);
			const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour later
			endTime = end.toISOString().slice(0, 16);
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="border-b border-gray-200 pb-4">
		<h3 class="text-xl font-semibold text-gray-800">
			{isEditing ? 'Edit Event' : 'Create New Event'}
		</h3>
		<p class="text-gray-600 mt-1">
			{isEditing ? 'Update event details' : 'Schedule a new calendar event'}
		</p>
	</div>

	<!-- Error Message -->
	{#if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<div class="flex items-start gap-3">
				<svg class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				<div>
					<p class="text-red-800 font-medium">Error</p>
					<p class="text-red-700 text-sm mt-1">{error}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Form -->
	<div class="space-y-5">
		<!-- Title -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-1">
				Event Title <span class="text-red-500">*</span>
			</label>
			<input
				type="text"
				bind:value={title}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				placeholder="Site Visit, Meeting, Deadline"
				disabled={loading}
			/>
		</div>

		<!-- Description -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-1">
				Description
			</label>
			<textarea
				bind:value={description}
				rows={3}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				placeholder="Optional details about the event"
				disabled={loading}
			/>
		</div>

		<!-- Date & Time -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1">
					Start Time <span class="text-red-500">*</span>
				</label>
				<input
					type="datetime-local"
					bind:value={startTime}
					on:change={setDefaultEndTime}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					disabled={loading}
				/>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1">
					End Time <span class="text-red-500">*</span>
				</label>
				<input
					type="datetime-local"
					bind:value={endTime}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					disabled={loading}
				/>
			</div>
		</div>

		<!-- Event Type & Color -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1">
					Event Type
				</label>
				<select
					bind:value={eventType}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					disabled={loading}
				>
					<option value="site_visit">Site Visit</option>
					<option value="client_meeting">Client Meeting</option>
					<option value="deadline">Deadline</option>
					<option value="team_sync">Team Sync</option>
					<option value="other">Other</option>
				</select>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1">
					Color
				</label>
				<div class="flex gap-2">
					{#each [
						{ value: 'bg-blue-500', label: 'Blue' },
						{ value: 'bg-green-500', label: 'Green' },
						{ value: 'bg-red-500', label: 'Red' },
						{ value: 'bg-yellow-500', label: 'Yellow' },
						{ value: 'bg-purple-500', label: 'Purple' },
						{ value: 'bg-pink-500', label: 'Pink' }
					] as colorOption}
						<button
							type="button"
							class="w-8 h-8 rounded-full {colorOption.value} border-2 {color === colorOption.value ? 'border-gray-800' : 'border-transparent'} hover:border-gray-300 transition-colors"
							on:click={() => color = colorOption.value}
							disabled={loading}
							title={colorOption.label}
						></button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Optional Fields -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1">
					Project ID (Optional)
				</label>
				<input
					type="text"
					bind:value={projectId}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					placeholder="Project UUID"
					disabled={loading}
				/>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1">
					Client ID (Optional)
				</label>
				<input
					type="text"
					bind:value={clientId}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					placeholder="Client UUID"
					disabled={loading}
				/>
			</div>
		</div>
	</div>

	<!-- Form Actions -->
	<div class="flex items-center justify-between pt-6 border-t border-gray-200">
		<button
			on:click={onCancel}
			class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			disabled={loading}
		>
			Cancel
		</button>

		<div class="flex items-center gap-3">
			{#if isEditing && event?.id}
				<button
					on:click={() => {
						if (confirm('Are you sure you want to delete this event?') && event?.id) {
							calendarStore.deleteEvent(event.id);
							onCancel();
						}
					}}
					class="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={loading}
				>
					Delete
				</button>
			{/if}

			<button
				on:click={handleSubmit}
				class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				disabled={loading || !title.trim() || !startTime || !endTime}
			>
				{#if loading}
					<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
					</svg>
				{/if}
				{isEditing ? 'Update Event' : 'Create Event'}
			</button>
		</div>
	</div>
</div>
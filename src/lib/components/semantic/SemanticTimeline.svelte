<script lang="ts">
	import { semanticContext } from '$lib/stores/semanticContext';
	import { onDestroy } from 'svelte';
	import type { SemanticEvent } from '$lib/stores/semanticContext';
	import { zoomToEventTarget } from '$lib/hooks/semanticNavigation';

	let events: SemanticEvent[] = [];
	let groupedEvents: Array<{ date: string; events: SemanticEvent[] }> = [];

	// Subscribe to store updates
	const unsubscribe = semanticContext.subscribe(state => {
		events = state.semanticEvents;
		// Group events by day
		const groups: Record<string, SemanticEvent[]> = {};
		events.forEach((event: SemanticEvent) => {
			const date = new Date(event.timestamp);
			const dateKey = date.toLocaleDateString('en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
			if (!groups[dateKey]) groups[dateKey] = [];
			groups[dateKey].push(event);
		});
		// Sort groups by date (newest first)
		const sortedKeys = Object.keys(groups).sort((a, b) => {
			const dateA = new Date(groups[a][0].timestamp);
			const dateB = new Date(groups[b][0].timestamp);
			return dateB.getTime() - dateA.getTime();
		});
		const sortedGroups: Array<{ date: string; events: SemanticEvent[] }> = [];
		sortedKeys.forEach(key => {
			sortedGroups.push({ date: key, events: groups[key] });
		});
		groupedEvents = sortedGroups;
	});

	// Format time
	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	// Get event icon based on type
	function getEventIcon(type: string): string {
		const icons: Record<string, string> = {
			update_note: '📝',
			summarise_voice_note: '🎤',
			add_items_to_project: '📁',
			create_new_note: '📄',
			rewrite_text: '✏️',
			organise_collection: '🗂️',
			tag_items: '🏷️',
			rename_items: '🏷️',
			delete_items: '🗑️',
			move_items: '➡️',
			extract_key_points: '🔑',
			generate_report: '📊',
			classify_items: '🏷️',
			merge_items: '🔄',
			split_items: '🔀',
			translate_text: '🌐',
			format_document: '📐',
			extract_metadata: '📋',
			generate_title: '🏷️',
			other: '⚡'
		};
		return icons[type] || '⚡';
	}

	// Handle event click
	function handleEventClick(event: SemanticEvent) {
		zoomToEventTarget(event);
	}

	onDestroy(() => {
		unsubscribe();
	});
</script>

<div class="semantic-timeline">
	<header class="timeline-header">
		<h2 class="text-xl font-bold text-gray-800">Semantic Timeline</h2>
		<p class="text-sm text-gray-600">Recent actions across your workspace</p>
	</header>

	{#if events.length === 0}
		<div class="empty-state">
			<svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
			</svg>
			<p class="mt-4 text-gray-500">No semantic events yet.</p>
			<p class="text-sm text-gray-400">Interact with Oscar AI to generate events.</p>
		</div>
	{:else}
		<div class="timeline-content">
			{#each groupedEvents as group}
				<div class="day-group">
					<h3 class="day-title">{group.date}</h3>
					<div class="events-list">
						{#each group.events as event}
							<div class="event-item" on:click={() => handleEventClick(event)}>
								<div class="event-icon">
									{getEventIcon(event.type)}
								</div>
								<div class="event-details">
									<div class="event-header">
										<span class="event-type">{event.type.replace('_', ' ')}</span>
										<span class="event-time">{formatTime(event.timestamp)}</span>
									</div>
									<p class="event-summary">{event.summary}</p>
									{#if event.target}
										<div class="event-target">
											<svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
											</svg>
											<span class="text-xs text-gray-500">Target: {event.target}</span>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.semantic-timeline {
		background-color: white;
		border-radius: 0.75rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.timeline-header {
		margin-bottom: 1.5rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
	}

	.day-group {
		margin-bottom: 2rem;
	}

	.day-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #4b5563;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.75rem;
		padding-left: 0.5rem;
		border-left: 3px solid #3b82f6;
	}

	.events-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.event-item {
		display: flex;
		gap: 0.75rem;
		padding: 0.75rem;
		background-color: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		transition: background-color 0.2s;
		cursor: pointer;
	}

	.event-item:hover {
		background-color: #f3f4f6;
		border-color: #3b82f6;
	}

	.event-icon {
		flex-shrink: 0;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 9999px;
		background-color: white;
		border: 1px solid #e5e7eb;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
	}

	.event-details {
		flex: 1;
		min-width: 0;
	}

	.event-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.25rem;
	}

	.event-type {
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
		text-transform: capitalize;
	}

	.event-time {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.event-summary {
		font-size: 0.875rem;
		color: #4b5563;
		margin-bottom: 0.25rem;
	}

	.event-target {
		display: flex;
		align-items: center;
	}

	/* Dark mode */
	@media (prefers-color-scheme: dark) {
		.semantic-timeline {
			background-color: #1f2937;
			border-color: #374151;
		}

		.timeline-header {
			border-color: #374151;
		}

		h2, h3 {
			color: #f9fafb;
		}

		.empty-state p {
			color: #9ca3af;
		}

		.event-item {
			background-color: #111827;
			border-color: #374151;
		}

		.event-item:hover {
			background-color: #1f2937;
		}

		.event-icon {
			background-color: #374151;
			border-color: #4b5563;
		}

		.event-type {
			color: #f9fafb;
		}

		.event-summary {
			color: #d1d5db;
		}
	}
</style>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { semanticContext, activeHistory } from '$lib/stores/semanticContext';
	import { get } from 'svelte/store';

	// Sheet state
	let isOpen = false;
	let isMobile = false;
	let sheetHeight = 40; // percent of viewport

	// Active context data
	let activeMessages: Array<{ role: string; content: string; timestamp: number }> = [];
	let activeEvents: Array<{ type: string; summary: string; timestamp: number }> = [];
	let activeContextId: string | null = null;
	let activeContextType: 'item' | 'collection' | null = null;
	let zoomLevel: 'item' | 'collection' = 'collection';

	// Subscribe to stores
	const unsubscribe = semanticContext.subscribe(state => {
		activeContextId = state.activeContextId;
		activeContextType = state.activeContextType;
		zoomLevel = state.zoomLevel;
		activeEvents = state.semanticEvents
			.filter(e => e.target === activeContextId)
			.slice(0, 10)
			.map(e => ({
				type: e.type,
				summary: e.summary,
				timestamp: e.timestamp
			}));
	});

	const unsubscribeHistory = activeHistory.subscribe(messages => {
		activeMessages = messages.slice(-20); // last 20 messages
	});

	// Detect mobile
	function checkMobile() {
		isMobile = window.innerWidth < 768;
	}

	// Toggle sheet
	function toggleSheet() {
		isOpen = !isOpen;
	}

	function closeSheet() {
		isOpen = false;
	}

	// Drag to resize (mobile only)
	let isDragging = false;
	let dragStartY = 0;
	let dragStartHeight = 0;

	function handleDragStart(event: MouseEvent | TouchEvent) {
		if (!isMobile) return;
		isDragging = true;
		const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
		dragStartY = clientY;
		dragStartHeight = sheetHeight;
		document.addEventListener('mousemove', handleDragMove as EventListener);
		document.addEventListener('touchmove', handleDragMove as EventListener);
		document.addEventListener('mouseup', handleDragEnd);
		document.addEventListener('touchend', handleDragEnd);
		event.preventDefault();
	}

	function handleDragMove(event: MouseEvent | TouchEvent) {
		if (!isDragging) return;
		const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
		const deltaY = dragStartY - clientY;
		const windowHeight = window.innerHeight;
		const deltaPercent = (deltaY / windowHeight) * 100;
		let newHeight = dragStartHeight + deltaPercent;
		newHeight = Math.max(20, Math.min(95, newHeight));
		sheetHeight = newHeight;
	}

	function handleDragEnd() {
		isDragging = false;
		document.removeEventListener('mousemove', handleDragMove as EventListener);
		document.removeEventListener('touchmove', handleDragMove as EventListener);
		document.removeEventListener('mouseup', handleDragEnd);
		document.removeEventListener('touchend', handleDragEnd);
	}

	// Close on Escape
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			closeSheet();
		}
	}

	onMount(() => {
		checkMobile();
		window.addEventListener('resize', checkMobile);
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('resize', checkMobile);
			window.removeEventListener('keydown', handleKeydown);
			handleDragEnd();
		};
	});

	onDestroy(() => {
		unsubscribe();
		unsubscribeHistory();
	});

	// Format timestamp
	function formatTime(timestamp: number): string {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	// Sheet style
	const sheetStyle = `
		height: ${isMobile ? `${sheetHeight}vh` : 'auto'};
		max-height: ${isMobile ? 'none' : '60vh'};
		transition: ${isDragging ? 'none' : 'height 300ms ease-in-out'};
	`;
</script>

<!-- Trigger button (for demo) -->
<button
	on:click={toggleSheet}
	class="fixed bottom-4 right-4 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
	title="Show context history"
>
	{#if isOpen}
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
		</svg>
	{:else}
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	{/if}
</button>

<!-- Backdrop (mobile only) -->
{#if isMobile && isOpen}
	<div
		class="fixed inset-0 bg-black/50 z-40"
		on:click={closeSheet}
		aria-hidden="true"
	></div>
{/if}

<!-- Sheet -->
<div
	class="fixed z-50 bg-white border-t border-gray-200 shadow-xl"
	class:open={isOpen}
	class:mobile={isMobile}
	class:desktop={!isMobile}
	style={sheetStyle}
	role="dialog"
	aria-label="Semantic Context History"
	aria-modal={isMobile && isOpen}
	aria-hidden={!isOpen}
>
	{#if isMobile}
		<!-- Drag handle -->
		<div
			class="drag-handle"
			on:mousedown={handleDragStart}
			on:touchstart={handleDragStart}
			aria-label="Drag to resize"
			role="button"
			tabindex="0"
		>
			<div class="drag-indicator"></div>
		</div>
	{/if}

	<!-- Header -->
	<header class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
		<h2 class="text-lg font-semibold text-gray-800">
			{#if activeContextId}
				{activeContextType === 'item' ? 'Item' : 'Collection'} Context
				<span class="text-sm text-gray-500 ml-2">({activeContextId.slice(0, 8)})</span>
			{:else}
				Global Context
			{/if}
		</h2>
		<button
			on:click={closeSheet}
			class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
			aria-label="Close"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</header>

	<!-- Content -->
	<div class="flex-1 overflow-auto p-4">
		{#if activeMessages.length === 0 && activeEvents.length === 0}
			<div class="text-center py-8 text-gray-500">
				<svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<p>No history yet.</p>
				<p class="text-sm">Start a conversation with Oscar AI to see messages here.</p>
			</div>
		{:else}
			<!-- Semantic Events -->
			{#if activeEvents.length > 0}
				<section class="mb-6">
					<h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Semantic Events</h3>
					<div class="space-y-2">
						{#each activeEvents as event}
							<div class="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
								<div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
									<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div class="flex-1">
									<div class="flex justify-between">
										<span class="font-medium text-gray-800">{event.type.replace('_', ' ')}</span>
										<span class="text-xs text-gray-500">{formatTime(event.timestamp)}</span>
									</div>
									<p class="text-sm text-gray-600 mt-1">{event.summary}</p>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Message History -->
			<section>
				<h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Conversation</h3>
				<div class="space-y-4">
					{#each activeMessages as msg}
						<div class="flex gap-3 {msg.role === 'user' ? 'flex-row-reverse' : ''}">
							<div class="flex-shrink-0 w-8 h-8 rounded-full {msg.role === 'user' ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center">
								{#if msg.role === 'user'}
									<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								{:else}
									<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
									</svg>
								{/if}
							</div>
							<div class="flex-1 max-w-[80%]">
								<div class="p-3 rounded-lg {msg.role === 'user' ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'}">
									<p class="text-sm text-gray-800">{msg.content}</p>
									<div class="text-xs text-gray-500 mt-1 text-right">{formatTime(msg.timestamp)}</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</div>

<style>
	/* Base sheet positioning */
	div[role="dialog"] {
		transition: transform 300ms ease-in-out;
	}

	div.mobile {
		bottom: 0;
		left: 0;
		right: 0;
		border-top-left-radius: 1rem;
		border-top-right-radius: 1rem;
		display: flex;
		flex-direction: column;
		transform: translateY(100%);
	}

	div.mobile.open {
		transform: translateY(0);
	}

	div.desktop {
		bottom: 5rem;
		right: 1rem;
		width: 400px;
		border-radius: 0.75rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		transform: translateY(20px);
		opacity: 0;
		pointer-events: none;
	}

	div.desktop.open {
		transform: translateY(0);
		opacity: 1;
		pointer-events: auto;
	}

	/* Drag handle */
	.drag-handle {
		padding: 0.75rem;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: grab;
		touch-action: none;
		user-select: none;
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.drag-indicator {
		width: 40px;
		height: 4px;
		background-color: #d1d5db;
		border-radius: 2px;
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		div[role="dialog"] {
			background-color: #1f2937;
			border-color: #374151;
		}

		h2, h3 {
			color: #f9fafb;
		}

		.bg-blue-50 {
			background-color: #1e3a8a;
			border-color: #3b82f6;
		}

		.bg-gray-50 {
			background-color: #111827;
			border-color: #374151;
		}

		.bg-green-50 {
			background-color: #064e3b;
			border-color: #10b981;
		}

		.text-gray-800 {
			color: #f9fafb;
		}

		.text-gray-600 {
			color: #d1d5db;
		}

		.text-gray-500 {
			color: #9ca3af;
		}

		.drag-indicator {
			background-color: #4b5563;
		}
	}
</style>

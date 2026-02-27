<script lang="ts">
	import { decisionSheetStore } from '$lib/stores/decisionSheetStore';
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { debugStore } from '$lib/stores/debugStore';

	let isOpen = false;
	let title = '';
	let message = '';
	let actions: Array<{ id: string; label: string; icon?: string; handler: () => void }> = [];
	let ephemeral = true;

	const unsubscribe = decisionSheetStore.subscribe(state => {
		debugStore.log('DecisionSheet', 'store update', { isOpen: state.isOpen, title: state.title, actionsCount: state.actions.length });
		console.log('[DecisionSheet] store update:', state);
		isOpen = state.isOpen;
		title = state.title;
		message = state.message;
		actions = state.actions;
		ephemeral = state.ephemeral;
		debugStore.log('DecisionSheet', 'local isOpen after update', { isOpen });
	});

	function closeSheet() {
		decisionSheetStore.closeSheet();
	}

	function handleAction(action: { handler: () => void }) {
		action.handler();
		closeSheet();
	}

	function handleBackdropClick() {
		closeSheet();
	}

	// Close on Escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			closeSheet();
		}
	}

	onDestroy(() => {
		unsubscribe();
	});
</script>

<!-- Backdrop (mobile only) -->
{#if isOpen}
	<div
		class="fixed inset-0 bg-black/50 z-50"
		on:click={handleBackdropClick}
		aria-hidden="true"
		transition:fade={{ duration: 200 }}
	></div>
{/if}

<!-- Sheet -->
<div
	class="fixed z-50 bg-white border-t border-gray-200 shadow-xl"
	class:open={isOpen}
	class:mobile={true}
	role="dialog"
	aria-label={title}
	aria-modal={true}
	aria-hidden={!isOpen}
	on:keydown={handleKeydown}
>
	<!-- Drag handle (mobile only) -->
	<div class="drag-handle" aria-label="Drag to resize">
		<div class="drag-indicator"></div>
	</div>

	<!-- Header -->
	<header class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
		<h2 class="text-lg font-semibold text-gray-800">{title}</h2>
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
		{#if message}
			<p class="text-sm text-gray-600 mb-4">{message}</p>
		{/if}

		<div class="space-y-2">
			{#each actions as action}
				<button
					on:click={() => handleAction(action)}
					class="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
					aria-label={action.label}
				>
					<span class="font-medium text-gray-800">{action.label}</span>
					<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</button>
			{/each}
		</div>

		<!-- Cancel button -->
		<div class="mt-6 pt-4 border-t border-gray-200">
			<button
				on:click={closeSheet}
				class="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
			>
				Cancel
			</button>
		</div>
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

		h2 {
			color: #f9fafb;
		}

		.bg-gray-50 {
			background-color: #111827;
			border-color: #374151;
		}

		.text-gray-800 {
			color: #f9fafb;
		}

		.text-gray-600 {
			color: #d1d5db;
		}

		.drag-indicator {
			background-color: #4b5563;
		}
	}
</style>

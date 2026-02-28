<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	
	const emit = createEventDispatcher();
	
	export let isOpen = false;
	
	// Sample conversation data
	let messages = [
		{ id: 1, type: 'user', text: 'Can you analyze this tree health report?', timestamp: '10:30 AM' },
		{ id: 2, type: 'ai', text: 'I\'ve analyzed the tree health report. The oak tree shows signs of fungal infection in the lower trunk. I recommend a treatment plan with fungicide application and monitoring every 2 weeks.', timestamp: '10:32 AM' },
		{ id: 3, type: 'system', text: 'System generated a risk assessment based on the report', timestamp: '10:33 AM' },
		{ id: 4, type: 'user', text: 'What about the maple trees on the property?', timestamp: '10:35 AM' },
		{ id: 5, type: 'ai', text: 'The maple trees appear healthy with good leaf coloration and no visible signs of disease. However, one maple shows minor bark damage from wildlife - I suggest installing a protective wrap.', timestamp: '10:36 AM' },
		{ id: 6, type: 'action', text: 'Created project: "Maple Tree Protection"', timestamp: '10:37 AM' }
	];
	
	function closeSheet() {
		isOpen = false;
		emit('close');
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeSheet();
		}
	}
	
	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<!-- Backdrop -->
{#if isOpen}
	<div 
		class="fixed inset-0 bg-black/50 z-40"
		on:click={closeSheet}
		aria-hidden="true"
		transition:fade={{ duration: 200 }}
	></div>
{/if}

<!-- Sheet -->
<div
	class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out"
	class:translate-y-full={!isOpen}
	class:translate-y-0={isOpen}
	role="dialog"
	aria-modal="true"
	aria-labelledby="sheet-title"
>
	<!-- Drag handle -->
	<div class="pt-4 pb-2 flex justify-center">
		<div class="w-12 h-1.5 bg-gray-300 rounded-full"></div>
	</div>
	
	<!-- Header -->
	<div class="px-6 pb-4 border-b border-gray-200">
		<div class="flex items-center justify-between">
			<div>
				<h2 id="sheet-title" class="text-xl font-bold text-gray-900">Conversation</h2>
				<p class="text-sm text-gray-600 mt-1">Full chat history with Oscar AI</p>
			</div>
			<button
				on:click={closeSheet}
				class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
				aria-label="Close conversation"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	</div>
	
	<!-- Conversation content -->
	<div class="px-6 py-4 max-h-[60vh] overflow-y-auto">
		<div class="space-y-4">
			{#each messages as message}
				<div class="flex {message.type === 'user' ? 'justify-end' : 'justify-start'}">
					<div class="max-w-[80%]">
						<div class="flex items-center mb-1 {message.type === 'user' ? 'justify-end' : 'justify-start'}">
							{#if message.type === 'user'}
								<span class="text-xs text-gray-500 mr-2">{message.timestamp}</span>
								<span class="text-xs font-medium text-blue-600">You</span>
							{:else if message.type === 'ai'}
								<span class="text-xs font-medium text-green-600">Oscar AI</span>
								<span class="text-xs text-gray-500 ml-2">{message.timestamp}</span>
							{:else if message.type === 'system'}
								<span class="text-xs font-medium text-purple-600">System</span>
								<span class="text-xs text-gray-500 ml-2">{message.timestamp}</span>
							{:else if message.type === 'action'}
								<span class="text-xs font-medium text-amber-600">Action</span>
								<span class="text-xs text-gray-500 ml-2">{message.timestamp}</span>
							{/if}
						</div>
						
						<div class="rounded-2xl p-4 {message.type === 'user' ? 'bg-blue-50 text-blue-900 rounded-br-none' : message.type === 'ai' ? 'bg-green-50 text-gray-900 rounded-bl-none' : message.type === 'system' ? 'bg-purple-50 text-purple-900 rounded-bl-none' : 'bg-amber-50 text-amber-900 rounded-bl-none'}">
							<p class="text-sm">{message.text}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
		
		<!-- Empty state -->
		{#if messages.length === 0}
			<div class="text-center py-12">
				<svg class="w-12 h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
				</svg>
				<p class="mt-4 text-gray-500">No conversation history yet</p>
				<p class="text-sm text-gray-400">Start chatting with Oscar AI to see your conversation here</p>
			</div>
		{/if}
	</div>
	
	<!-- Footer -->
	<div class="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
		<div class="flex items-center justify-between">
			<p class="text-sm text-gray-600">
				{messages.length} message{messages.length !== 1 ? 's' : ''} in conversation
			</p>
			<button
				on:click={closeSheet}
				class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
			>
				Close
			</button>
		</div>
	</div>
</div>

<style>
	/* Smooth transitions */
	div[role="dialog"] {
		transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	/* Custom scrollbar */
	.max-h-\[60vh\] {
		scrollbar-width: thin;
		scrollbar-color: #d1d5db transparent;
	}
	
	.max-h-\[60vh\]::-webkit-scrollbar {
		width: 6px;
	}
	
	.max-h-\[60vh\]::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.max-h-\[60vh\]::-webkit-scrollbar-thumb {
		background-color: #d1d5db;
		border-radius: 3px;
	}
	
	/* Responsive adjustments */
	@media (min-width: 1024px) {
		/* Desktop: partial height sheet */
		div[role="dialog"] {
			height: 70vh;
			max-height: 70vh;
		}
		
		.max-h-\[60vh\] {
			max-height: calc(70vh - 180px);
		}
	}
	
	@media (max-width: 1023px) {
		/* Mobile/tablet portrait: full height sheet */
		div[role="dialog"] {
			height: 85vh;
			max-height: 85vh;
		}
		
		.max-h-\[60vh\] {
			max-height: calc(85vh - 180px);
		}
	}
</style>
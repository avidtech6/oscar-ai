<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { setMid, microCue } from './copilotStore';
	
	const emit = createEventDispatcher();
	
	function handleExpand() {
		setMid();
	}
	
	function handlePromptSubmit(text: string) {
		emit('promptSubmit', { text });
	}
	
	function handleInputKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			const input = event.target as HTMLInputElement;
			if (input.value.trim()) {
				handlePromptSubmit(input.value.trim());
				input.value = '';
			}
		}
	}
	
	function getMicroCueSymbol() {
		switch ($microCue) {
			case 'nudge': return '!';
			case 'clarify': return '?';
			case 'context': return '●';
			default: return '';
		}
	}
	
	function getMicroCueColor() {
		switch ($microCue) {
			case 'nudge': return 'bg-yellow-500';
			case 'clarify': return 'bg-blue-500';
			case 'context': return 'bg-green-500';
			default: return 'bg-gray-300';
		}
	}
</script>

<div class="fixed bottom-0 left-0 right-0 z-40 h-12 bg-white/95 backdrop-blur-sm border-t border-gray-200">
	<div class="h-full px-4">
		<div class="flex items-center justify-between h-full">
			<!-- Left side: Oscar AI icon and input -->
			<div class="flex items-center flex-1 max-w-2xl">
				<div class="flex items-center mr-3">
					<div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
						O
					</div>
					
					<!-- Micro-cue indicator -->
					{#if $microCue}
						<div class="ml-2 w-5 h-5 rounded-full {getMicroCueColor()} flex items-center justify-center text-white text-xs font-bold animate-pulse">
							{getMicroCueSymbol()}
						</div>
					{/if}
				</div>
				
				<div class="flex-1">
					<input
						type="text"
						placeholder="Ask Oscar AI…"
						class="w-full px-4 py-2 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 placeholder-gray-500"
						on:keydown={handleInputKeydown}
					/>
				</div>
			</div>
			
			<!-- Right side: Expand button -->
			<div class="ml-4">
				<button
					on:click={handleExpand}
					class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
					aria-label="Open assistant panel"
				>
					<svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</div>

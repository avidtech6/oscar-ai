<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	let inputValue = '';
	
	function handleSubmit() {
		if (inputValue.trim()) {
			dispatch('promptSubmit', { text: inputValue });
			inputValue = '';
		}
	}
	
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}
</script>

<div class="w-full bg-white border-t border-gray-200 p-4">
	<div class="flex items-center gap-2 max-w-4xl mx-auto">
		<input
			type="text"
			bind:value={inputValue}
			on:keydown={handleKeydown}
			placeholder="Ask Oscar anything..."
			class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
		/>
		<button
			on:click={handleSubmit}
			disabled={!inputValue.trim()}
			class="px-6 py-3 bg-forest-600 text-white font-medium rounded-lg hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
		>
			Send
		</button>
	</div>
</div>
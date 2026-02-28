<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	let inputValue = '';
	
	const icons: Record<string, string> = {
		send: "i-mdi-send",
		mic: "i-mdi-microphone",
		attach: "i-mdi-paperclip"
	};
	
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
	
	function handleVoiceInput() {
		// Voice input would be implemented here
		console.log('Voice input requested');
	}
	
	function handleAttach() {
		// File attachment would be implemented here
		console.log('Attachment requested');
	}
</script>

<div class="fixed bottom-16 lg:bottom-0 left-0 right-0 lg:left-80 lg:right-80 bg-white border-t border-gray-200 z-30">
	<div class="max-w-4xl mx-auto p-4">
		<div class="flex items-center gap-2 bg-gray-50 rounded-xl p-1 border border-gray-200">
			<!-- Attachment button -->
			<button
				on:click={handleAttach}
				class="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
				title="Attach file"
				aria-label="Attach file"
			>
				<span class="w-5 h-5">{@html icons.attach}</span>
			</button>
			
			<!-- Input field -->
			<input
				type="text"
				bind:value={inputValue}
				on:keydown={handleKeydown}
				placeholder="Ask Oscar anything... (Press Enter to send)"
				class="flex-1 px-3 py-2 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-500"
			/>
			
			<!-- Voice input button -->
			<button
				on:click={handleVoiceInput}
				class="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
				title="Voice input"
				aria-label="Voice input"
			>
				<span class="w-5 h-5">{@html icons.mic}</span>
			</button>
			
			<!-- Send button -->
			<button
				on:click={handleSubmit}
				disabled={!inputValue.trim()}
				class="px-4 py-2 bg-forest-600 text-white font-medium rounded-lg hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
				title="Send message"
				aria-label="Send message"
			>
				<span class="w-4 h-4">{@html icons.send}</span>
				<span class="hidden sm:inline">Send</span>
			</button>
		</div>
		
		<!-- Quick suggestions -->
		<div class="mt-3 flex flex-wrap gap-2 justify-center">
			{#each ['Summarize this page', 'Find related files', 'Schedule a task', 'Generate report'] as suggestion}
				<button
					on:click={() => {
						inputValue = suggestion;
						handleSubmit();
					}}
					class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
				>
					{suggestion}
				</button>
			{/each}
		</div>
	</div>
</div>
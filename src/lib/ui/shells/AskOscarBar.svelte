<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { isTabletLandscape } from '$lib/stores/deviceStore';
	
	const dispatch = createEventDispatcher();
	
	let inputValue = '';
	
	const icons: Record<string, string> = {
		tree: "i-mdi-file-tree",
		send: "i-mdi-send",
		mic: "i-mdi-microphone",
		voiceRecord: "i-mdi-record-circle-outline",
		camera: "i-mdi-camera",
		help: "i-mdi-help-circle-outline"
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
		dispatch('voiceInput');
	}
	
	function handleVoiceRecord() {
		dispatch('voiceRecord');
	}
	
	function handleCamera() {
		dispatch('camera');
	}
	
	function handleHelp() {
		dispatch('openSuggestions');
	}
	
	function handleTree() {
		dispatch('openContextTree');
	}
</script>

<div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
	<div class="max-w-7xl mx-auto px-4 py-3">
		<div class="flex items-center gap-3">
			<!-- Tree Icon -->
			<button
				onclick={handleTree}
				class="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
				title="Context tree"
				aria-label="Context tree"
			>
				<span class="w-5 h-5">{@html icons.tree}</span>
			</button>
			
			<!-- "Ask Oscar" label -->
			<div class="text-sm font-medium text-gray-700 whitespace-nowrap">
				Ask Oscar
			</div>
			
			<!-- Separator -->
			<div class="w-px h-6 bg-gray-300"></div>
			
			<!-- Input field -->
			<input
				type="text"
				bind:value={inputValue}
				onkeydown={handleKeydown}
				placeholder="Type your question or command..."
				class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent text-gray-800 placeholder-gray-500"
			/>
			
			<!-- Help button (?) -->
			<button
				onclick={handleHelp}
				class="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
				title="Suggestions"
				aria-label="Suggestions"
			>
				<span class="w-5 h-5">{@html icons.help}</span>
			</button>
			
			<!-- Mic button -->
			<button
				onclick={handleVoiceInput}
				class="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
				title="Voice input"
				aria-label="Voice input"
			>
				<span class="w-5 h-5">{@html icons.mic}</span>
			</button>
			
			<!-- Voice Record button -->
			<button
				onclick={handleVoiceRecord}
				class="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
				title="Voice recording"
				aria-label="Voice recording"
			>
				<span class="w-5 h-5">{@html icons.voiceRecord}</span>
			</button>
			
			<!-- Camera button (tablet landscape only per Module 3.1) -->
			{#if $isTabletLandscape}
				<button
					onclick={handleCamera}
					class="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
					title="Camera"
					aria-label="Camera"
				>
					<span class="w-5 h-5">{@html icons.camera}</span>
				</button>
			{/if}
			
			<!-- Send button -->
			<button
				onclick={handleSubmit}
				disabled={!inputValue.trim()}
				class="px-4 py-2 bg-forest-600 text-white font-medium rounded-lg hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
				title="Send"
				aria-label="Send"
			>
				<span class="w-4 h-4">{@html icons.send}</span>
				<span class="hidden sm:inline">Send</span>
			</button>
		</div>
	</div>
</div>
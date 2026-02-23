<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { setMid, messages, smartHint, pageContext, itemContext, selectedIds } from './copilotStore';
	import ContextChips from './ContextChips.svelte';
	import SmartHint from './SmartHint.svelte';
	
	const emit = createEventDispatcher();
	
	let promptText = '';
	
	function handleClose() {
		setMid();
	}
	
	function handlePromptSubmit() {
		if (promptText.trim()) {
			emit('promptSubmit', { text: promptText.trim() });
			promptText = '';
		}
	}
	
	function handleInputKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handlePromptSubmit();
		}
	}
	
	function handleQuickAction(action: string) {
		emit('quickAction', { action });
	}
	
	function handleBackToContext() {
		setMid();
	}
	
	const quickActions = [
		{ id: 'summarize', label: 'Summarize', icon: '📋' },
		{ id: 'improve', label: 'Improve', icon: '✨' },
		{ id: 'explain', label: 'Explain', icon: '💡' },
		{ id: 'translate', label: 'Translate', icon: '🌐' },
		{ id: 'format', label: 'Format', icon: '📝' },
		{ id: 'generate', label: 'Generate', icon: '⚡' }
	];
</script>

<div class="fixed bottom-12 left-0 right-0 z-40 bg-white border-t border-gray-200" style="height: 70vh;">
	<div class="h-full flex flex-col">
		<!-- Header -->
		<div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
			<div class="flex items-center">
				<div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3">
					O
				</div>
				<div>
					<h2 class="text-lg font-semibold text-gray-800">Oscar AI Assistant</h2>
					<p class="text-sm text-gray-500">Full conversation</p>
				</div>
			</div>
			
			<div class="flex items-center gap-2">
				<button
					on:click={handleBackToContext}
					class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
				>
					Back to Context
				</button>
				<button
					on:click={handleClose}
					class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
					aria-label="Close assistant"
				>
					<svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
		
		<!-- Context Chips -->
		<div class="px-4 pt-3">
			<ContextChips />
		</div>
		
		<!-- Smart Hint -->
		<div class="px-4 pt-2">
			<SmartHint />
		</div>
		
		<!-- Conversation Area -->
		<div class="flex-1 overflow-y-auto p-4">
			{#if $messages.length === 0}
				<div class="text-center py-8 text-gray-500">
					<p class="mb-2">No conversation yet.</p>
					<p class="text-sm">Ask Oscar AI anything about your project, or use the quick actions below.</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each $messages as message (message.id || message.text)}
						<div class="flex {message.type === 'user' ? 'justify-end' : 'justify-start'}">
							<div class="max-w-[80%] rounded-lg p-3 {message.type === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'}">
								{#if message.type === 'confirmation'}
									<div class="flex items-center text-green-700">
										<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
										</svg>
										{message.text}
									</div>
								{:else}
									{message.text}
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		
		<!-- Quick Actions -->
		<div class="px-4 py-3 border-t border-gray-200">
			<div class="flex flex-wrap gap-2">
				{#each quickActions as action}
					<button
						on:click={() => handleQuickAction(action.id)}
						class="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
					>
						<span class="mr-2">{action.icon}</span>
						{action.label}
					</button>
				{/each}
			</div>
		</div>
		
		<!-- Prompt Input -->
		<div class="p-4 border-t border-gray-200">
			<div class="flex items-center">
				<input
					type="text"
					bind:value={promptText}
					placeholder="Ask Oscar AI anything..."
					class="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					on:keydown={handleInputKeydown}
				/>
				<button
					on:click={handlePromptSubmit}
					class="px-6 py-3 bg-blue-600 text-white font-medium rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
					disabled={!promptText.trim()}
				>
					Send
				</button>
			</div>
			<p class="text-xs text-gray-500 mt-2 text-center">
				Press Enter to send, Shift+Enter for new line
			</p>
		</div>
	</div>
</div>

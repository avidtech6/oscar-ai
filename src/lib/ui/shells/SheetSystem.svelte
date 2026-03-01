<script lang="ts">
	import { fly } from 'svelte/transition';
	import { sheetStore, type SheetType } from '$lib/stores/sheetStore';
	
	// Sheet state from store
	let isOpen = $sheetStore.isOpen;
	let sheetType: SheetType = $sheetStore.type;
	let sheetTitle = $sheetStore.title;
	let sheetContent = $sheetStore.content;
	
	// Subscribe to store changes
	$: isOpen = $sheetStore.isOpen;
	$: sheetType = $sheetStore.type;
	$: sheetTitle = $sheetStore.title;
	$: sheetContent = $sheetStore.content;
	
	function closeSheet() {
		sheetStore.close();
	}
	
	// Handle escape key
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			closeSheet();
		}
	}
	
	// Handle backdrop click
	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			closeSheet();
		}
	}
	
	// For suggestions sheet
	function selectSuggestion(suggestion: any) {
		sheetStore.selectSuggestion(suggestion);
	}
</script>

<!-- Sheet overlay backdrop -->
{#if isOpen}
	<div
		class="fixed inset-0 bg-black/30 z-40"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="button"
		tabindex="0"
		aria-label="Close sheet"
	></div>
{/if}

<!-- Sheet container -->
<div class="fixed inset-0 z-50 pointer-events-none">
	{#if isOpen}
		<div 
			class="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl pointer-events-auto max-h-[70vh]"
			transition:fly={{ y: 100, duration: 300 }}
			style="z-index: 50;"
		>
			<!-- Sheet header with chevron (from module 4.5) -->
			<div class="p-4 border-b border-gray-200 flex items-center justify-center">
				<!-- Chevron for closing (module 4.5) -->
				<button
					onclick={closeSheet}
					class="absolute left-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
					aria-label="Close sheet"
				>
					<span class="i-mdi-chevron-down w-6 h-6"></span>
				</button>
				
				<!-- Sheet title -->
				<h3 class="text-lg font-semibold text-gray-800">{sheetTitle}</h3>
			</div>
			
			<!-- Sheet content -->
			<div class="h-[calc(70vh-4rem)] overflow-auto">
				{#if sheetType === 'conversation'}
					<!-- Conversation Sheet (module 4.6) -->
					<div class="p-4">
						<div class="space-y-4">
							{#each sheetContent?.messages || [] as message}
								<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
									<div class="max-w-[80%] rounded-2xl p-4 {message.role === 'user' ? 'bg-forest-100 text-forest-900' : 'bg-gray-100 text-gray-900'}">
										<p class="text-sm">{message.content}</p>
										<div class="text-xs mt-1 opacity-60">
											{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{:else if sheetType === 'suggestions'}
					<!-- Prompt Suggestions Sheet (module 4.7) -->
					<div class="p-4">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{#each sheetContent?.suggestions || [] as suggestion}
								<button
									onclick={() => {
										selectSuggestion(suggestion);
										closeSheet();
									}}
									class="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
								>
									<div class="font-medium text-gray-800 mb-1">{suggestion.title}</div>
									<div class="text-sm text-gray-600">{suggestion.description}</div>
								</button>
							{/each}
						</div>
					</div>
				{:else if sheetType === 'contextAction'}
					<!-- Context Action Sheet (module 4.8) -->
					<div class="p-4">
						<div class="space-y-3">
							{#each sheetContent?.actions || [] as action}
								<button
									onclick={() => {
										action.handler();
										closeSheet();
									}}
									class="w-full p-4 text-left bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors flex items-center gap-3"
								>
									{#if action.icon}
										<span class="text-gray-600 {action.icon} w-5 h-5"></span>
									{/if}
									<div class="flex-1">
										<div class="font-medium text-gray-800">{action.label}</div>
										{#if action.description}
											<div class="text-sm text-gray-600 mt-1">{action.description}</div>
										{/if}
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
<script lang="ts">
	import { fly } from 'svelte/transition';
	
	// Sheet states would come from a store in a real implementation
	let showSheet = false;
	let sheetType = 'conversation'; // 'conversation' | 'context' | 'suggestions'
	let sheetTitle = 'Conversation';
	
	function openSheet(type: string, title: string) {
		sheetType = type;
		sheetTitle = title;
		showSheet = true;
	}
	
	function closeSheet() {
		showSheet = false;
	}
	
	// Expose for external use
	export { openSheet, closeSheet };
</script>

<!-- Sheet overlay backdrop -->
{#if showSheet}
	<div 
		class="fixed inset-0 bg-black/50 z-[100]"
		on:click={closeSheet}
		on:keydown={(e) => e.key === 'Escape' && closeSheet()}
		role="button"
		tabindex="0"
		aria-label="Close sheet"
	></div>
{/if}

<!-- Sheet container -->
<div class="fixed inset-0 z-[101] pointer-events-none">
	{#if showSheet}
		<div 
			class="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl pointer-events-auto"
			transition:fly={{ x: 300, duration: 300 }}
		>
			<!-- Sheet header -->
			<div class="p-4 border-b border-gray-200 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-800">{sheetTitle}</h3>
				<button
					on:click={closeSheet}
					class="p-1 text-gray-400 hover:text-gray-600 rounded"
					aria-label="Close sheet"
				>
					<span class="i-mdi-close w-5 h-5"></span>
				</button>
			</div>
			
			<!-- Sheet content -->
			<div class="h-[calc(100%-4rem)] overflow-auto">
				<slot {sheetType} {sheetTitle}>
					<!-- Default content when no slot provided -->
					<div class="p-6 text-center text-gray-500">
						<div class="i-mdi-information-outline w-12 h-12 mx-auto text-gray-300 mb-4"></div>
						<p class="mb-2">Sheet content would appear here.</p>
						<p class="text-sm">This is the {sheetType} sheet.</p>
					</div>
				</slot>
			</div>
			
			<!-- Sheet footer -->
			<div class="p-4 border-t border-gray-200">
				<div class="flex gap-2">
					<button
						on:click={closeSheet}
						class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
					>
						Close
					</button>
					<button
						class="flex-1 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
					>
						Action
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
<script lang="ts">
	import { setFull, setMicro, pageContext, itemContext, smartHint, selectedIds } from './copilotStore';
	import ContextChips from './ContextChips.svelte';
	import SmartHint from './SmartHint.svelte';
	
	function handleShowConversation() {
		setFull();
	}
	
	function handleCollapse() {
		setMicro();
	}
	
	// Quick actions
	function handleQuickAction(action: string) {
		console.log('Quick action:', action);
		// In a real implementation, this would trigger specific AI actions
	}
</script>

<div class="fixed bottom-12 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg" style="height: 240px;">
	<div class="h-full flex flex-col">
		<!-- Header -->
		<div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
			<div class="flex items-center">
				<div class="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2">
					O
				</div>
				<h3 class="text-sm font-medium text-gray-900">Oscar AI Assistant</h3>
			</div>
			<div class="flex items-center gap-2">
				<button
					on:click={handleCollapse}
					class="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
					aria-label="Collapse panel"
				>
					<svg class="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>
			</div>
		</div>
		
		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-4">
			<!-- Context Chips -->
			<div class="mb-4">
				<ContextChips />
			</div>
			
			<!-- Smart Hint -->
			<div class="mb-4">
				<SmartHint />
			</div>
			
			<!-- Quick Actions Row -->
			<div class="mb-4">
				<h4 class="text-xs font-medium text-gray-700 mb-2">Quick Actions</h4>
				<div class="flex flex-wrap gap-2">
					<button
						on:click={() => handleQuickAction('summarize')}
						class="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
					>
						Summarize
					</button>
					<button
						on:click={() => handleQuickAction('organize')}
						class="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
					>
						Organize
					</button>
					<button
						on:click={() => handleQuickAction('translate')}
						class="px-3 py-1.5 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
					>
						Translate
					</button>
					<button
						on:click={() => handleQuickAction('expand')}
						class="px-3 py-1.5 text-xs bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
					>
						Expand
					</button>
					<button
						on:click={() => handleQuickAction('action_items')}
						class="px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
					>
						Action Items
					</button>
				</div>
			</div>
		</div>
		
		<!-- Footer with accordion -->
		<div class="border-t border-gray-200">
			<button
				on:click={handleShowConversation}
				class="w-full px-4 py-3 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 transition-colors"
			>
				<span>Show Conversation</span>
				<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
		</div>
	</div>
</div>

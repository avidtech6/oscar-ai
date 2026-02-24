<script lang="ts">
	import { copilotState, setMicro, setMid, setFull } from './copilotStore';
	import { pageContext, itemContext, smartHint, selectedIds, microCue } from './copilotStore';
	import { followUps, applyFollowUp } from './followUpStore';
	import ContextChips from './ContextChips.svelte';
	import SmartHint from './SmartHint.svelte';
	import CopilotTools from './CopilotTools.svelte';
	
	// Quick actions
	function handleQuickAction(action: string) {
		console.log('Quick action:', action);
		// In a real implementation, this would trigger specific AI actions
	}
	
	// Context-aware tools
	function handleCameraClick() {
		console.log('Camera clicked - should trigger photo uploader');
		// In a real implementation, this would open the photo uploader
		// For now, we'll just log and show a notification
		alert('Photo uploader would open here. This would trigger the existing PhotoUploader component.');
	}
	
	function handleMicrophoneClick() {
		console.log('Microphone clicked - should trigger voice dictation');
		
		// Check if speech recognition is available
		if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
			alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
			return;
		}
		
		// Try to use the existing voice recording service if available
		try {
			// Check if there's a global voice recording service
			// Use type assertion to avoid TypeScript error
			const win = window as any;
			if (win.voiceRecordingService) {
				win.voiceRecordingService.startRecording();
			} else {
				// Fallback to showing a message
				alert('Voice dictation would start here. This would trigger the existing VoiceRecordingService.');
			}
		} catch (error) {
			console.error('Failed to start voice recording:', error);
			alert('Failed to start voice recording. Please check your microphone permissions.');
		}
	}
	
	// Page-aware hints based on current route
	function getPageHint() {
		// Check if window is available (client-side only)
		if (typeof window === 'undefined' || !window.location) {
			return 'Ask Oscar AI anything about your work';
		}
		
		const path = window.location.pathname;
		if (!path) return 'Ask Oscar AI anything about your work';
		
		if (path.includes('/notes')) return 'Try: Summarise this note';
		if (path.includes('/trees') || path.includes('/project/')) return 'Try: Describe this tree\'s condition';
		if (path.includes('/tasks')) return 'Try: Generate next actions';
		if (path.includes('/reports')) return 'Try: Improve this section';
		if (path.includes('/email')) return 'Try: Draft a reply';
		if (path.includes('/calendar')) return 'Try: Schedule a follow-up';
		return 'Ask Oscar AI anything about your work';
	}
	
	$: currentPageHint = getPageHint();
	
	// Quick actions for mid state
	const midQuickActions = [
		{ id: 'summarize', label: 'Summarize', color: 'bg-blue-50 text-blue-700' },
		{ id: 'organize', label: 'Organize', color: 'bg-green-50 text-green-700' },
		{ id: 'translate', label: 'Translate', color: 'bg-purple-50 text-purple-700' },
		{ id: 'expand', label: 'Expand', color: 'bg-yellow-50 text-yellow-700' },
		{ id: 'action_items', label: 'Action Items', color: 'bg-red-50 text-red-700' }
	];
	
	// Quick actions for full state
	const fullQuickActions = [
		{ id: 'summarize', label: 'Summarize', icon: '📋' },
		{ id: 'improve', label: 'Improve', icon: '✨' },
		{ id: 'explain', label: 'Explain', icon: '💡' },
		{ id: 'translate', label: 'Translate', icon: '🌐' },
		{ id: 'format', label: 'Format', icon: '📝' },
		{ id: 'generate', label: 'Generate', icon: '⚡' }
	];
	
	let promptText = '';
	
	function handlePromptSubmit() {
		if (promptText.trim()) {
			// Emit event or call AI service
			console.log('Prompt submitted:', promptText.trim());
			promptText = '';
		}
	}
	
	function handleInputKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handlePromptSubmit();
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
	
	// Handle follow‑up action click
	function handleFollowUpClick(action: any) {
		applyFollowUp(action);
	}
</script>

<div class="sticky bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 transition-all duration-250 ease-in-out"
	style="height: {$copilotState === 'micro' ? '48px' : $copilotState === 'mid' ? '240px' : '70vh'}">
	
	<!-- MICRO STATE (48px) -->
	{#if $copilotState === 'micro'}
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
							bind:value={promptText}
						/>
					</div>
				</div>
				
				<!-- Right side: Expand button -->
				<div class="ml-4">
					<button
						on:click={setMid}
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
	
	<!-- MID STATE (240px) -->
	{:else if $copilotState === 'mid'}
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
					<!-- Context-aware tools -->
					<CopilotTools
						on:cameraClick={handleCameraClick}
						on:microphoneClick={handleMicrophoneClick}
					/>
					
					<button
						on:click={setMicro}
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
				
				<!-- Page-aware hint -->
				<div class="mb-4 p-3 bg-blue-50 rounded-lg">
					<p class="text-sm text-blue-700">{currentPageHint}</p>
				</div>
				
				<!-- Quick Actions Row -->
				<div class="mb-4">
					<h4 class="text-xs font-medium text-gray-700 mb-2">Quick Actions</h4>
					<div class="flex flex-wrap gap-2">
						{#each midQuickActions as action}
							<button
								on:click={() => handleQuickAction(action.id)}
								class="px-3 py-1.5 text-xs {action.color} rounded-lg hover:opacity-90 transition-opacity"
							>
								{action.label}
							</button>
						{/each}
					</div>
				</div>
			</div>
			
			<!-- Footer with expand icon -->
			<div class="border-t border-gray-200">
				<button
					on:click={setFull}
					class="w-full px-4 py-3 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 transition-colors"
				>
					<span>Show Conversation</span>
					<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
					</svg>
				</button>
			</div>
		</div>
	
	<!-- FULL STATE (70vh) -->
	{:else if $copilotState === 'full'}
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
					<!-- Context-aware tools -->
					<CopilotTools
						on:cameraClick={handleCameraClick}
						on:microphoneClick={handleMicrophoneClick}
					/>
					
					<button
						on:click={setMid}
						class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
					>
						Back to Context
					</button>
					<button
						on:click={setMid}
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
			
			<!-- Page-aware hint -->
			<div class="px-4 pt-2">
				<div class="p-3 bg-blue-50 rounded-lg">
					<p class="text-sm text-blue-700">{currentPageHint}</p>
				</div>
			</div>
			
			<!-- Conversation Area -->
			<div class="flex-1 overflow-y-auto p-4">
				{#if $followUps.length > 0}
					<!-- Follow‑up suggestions -->
					<div class="mb-6">
						<h3 class="text-sm font-medium text-gray-700 mb-3">Follow‑up suggestions</h3>
						<div class="space-y-2">
							{#each $followUps as followUp}
								<button
									on:click={() => handleFollowUpClick(followUp)}
									class="w-full text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors group"
								>
									<div class="flex items-center justify-between">
										<span class="text-sm text-blue-800 font-medium">{followUp.label}</span>
										<svg class="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
										</svg>
									</div>
								</button>
							{/each}
						</div>
					</div>
				{:else}
					<div class="text-center py-8 text-gray-500">
						<p class="mb-2">No conversation yet.</p>
						<p class="text-sm">Ask Oscar AI anything about your project, or use the quick actions below.</p>
					</div>
				{/if}
			</div>
			
			<!-- Quick Actions -->
			<div class="px-4 py-3 border-t border-gray-200">
				<div class="flex flex-wrap gap-2">
					{#each fullQuickActions as action}
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
	{/if}
</div>

<style>
	/* Smooth transitions for height changes */
	div {
		transition: height 0.25s ease;
	}
	
	/* Ensure content doesn't overflow during transitions */
	.flex-col {
		min-height: 0;
	}
	
	.overflow-y-auto {
		scrollbar-width: thin;
		scrollbar-color: #cbd5e0 transparent;
	}
	
	.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
	}
	
	.overflow-y-auto::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.overflow-y-auto::-webkit-scrollbar-thumb {
		background-color: #cbd5e0;
		border-radius: 3px;
	}
	
	/* Mobile‑specific touch targets */
	@media (max-width: 768px) {
		/* Larger touch targets for follow‑up buttons */
		button[class*="bg-blue-50"] {
			min-height: 52px;
			padding-top: 12px;
			padding-bottom: 12px;
		}
		
		/* Larger text for mobile */
		.text-sm {
			font-size: 0.9375rem; /* Slightly larger than 0.875rem */
		}
		
		/* More spacing between follow‑up items */
		.space-y-2 > * + * {
			margin-top: 0.75rem;
		}
	}
</style>
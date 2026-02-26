<script lang="ts">
	import { promptTooltip } from './promptTooltipStore';
	
	$: tooltip = $promptTooltip;
	
	function getTooltipClasses() {
		if (!tooltip) return '';
		
		const baseClasses = 'px-4 py-3 rounded-lg shadow-lg border max-w-md transition-all duration-300 transform';
		const typeClasses = {
			hint: 'bg-blue-50 border-blue-200 text-blue-800',
			suggestion: 'bg-green-50 border-green-200 text-green-800',
			context: 'bg-purple-50 border-purple-200 text-purple-800',
			error: 'bg-red-50 border-red-200 text-red-800'
		};
		
		return `${baseClasses} ${typeClasses[tooltip.type]}`;
	}
	
	function handleClose() {
		promptTooltip.hide();
	}
</script>

{#if tooltip}
	<div class="fixed left-0 right-0 z-[100] flex justify-center pointer-events-none"
		style="bottom: calc(100% - 20px);">
		<div class="{getTooltipClasses()} pointer-events-auto animate-fade-in-up">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<div class="flex items-center mb-1">
						{#if tooltip.type === 'hint'}
							<svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						{:else if tooltip.type === 'suggestion'}
							<svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						{:else if tooltip.type === 'context'}
							<svg class="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
							</svg>
						{:else if tooltip.type === 'error'}
							<svg class="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						{/if}
						<span class="text-sm font-medium">
							{#if tooltip.type === 'hint'}Hint
							{:else if tooltip.type === 'suggestion'}Suggestion
							{:else if tooltip.type === 'context'}Context
							{:else if tooltip.type === 'error'}Error{/if}
						</span>
					</div>
					<p class="text-sm">{tooltip.message}</p>
				</div>
				<button
					on:click={handleClose}
					class="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
					aria-label="Close tooltip"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<!-- Progress bar for timed tooltips -->
			{#if tooltip.duration && tooltip.duration > 0}
				<div class="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
					<div class="h-full bg-current opacity-30 rounded-full animate-progress"
						style="animation-duration: {tooltip.duration}ms; animation-timing-function: linear; animation-fill-mode: forwards;">
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	@keyframes progress {
		from {
			width: 100%;
		}
		to {
			width: 0%;
		}
	}
	
	.animate-fade-in-up {
		animation: fade-in-up 0.3s ease-out;
	}
	
	.animate-progress {
		animation: progress linear forwards;
	}
</style>
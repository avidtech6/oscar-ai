<script lang="ts">
	import EmailComposer from '../../../../communication/email/components/EmailComposer.svelte';
	import { goto } from '$app/navigation';
	
	// Empty UI shell - no logic
	function handleBack() {
		// Navigation placeholder
		goto('/communication/email');
	}
</script>

<div class="composer-page flex flex-col h-full">
	<!-- Composer Header with Back Button -->
	<div class="border-b border-gray-200 p-4 flex items-center gap-3">
		<button 
			on:click={handleBack}
			class="p-1.5 hover:bg-gray-100 rounded"
		>
			<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
			</svg>
		</button>
		<h1 class="text-lg font-semibold text-gray-800">New Message</h1>
	</div>
	
	<!-- Composer Component -->
	<div class="flex-1 overflow-auto">
		<EmailComposer />
	</div>
</div>

<style>
	.composer-page {
		height: calc(100vh - 64px); /* Adjust based on your layout header height */
	}
</style>
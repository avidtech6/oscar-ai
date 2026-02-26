<script lang="ts">
	import { onMount } from 'svelte';

	export let error: Error | null = null;
	export let reset: () => void = () => location.reload();

	let errorDetails: string = '';

	onMount(() => {
		if (error) {
			errorDetails = error.stack || error.message;
			console.error('ErrorBoundary caught:', error);
		}
	});
</script>

<div class="min-h-[60vh] flex items-center justify-center p-8">
	<div class="max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 text-center">
		<div class="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
			<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
			</svg>
		</div>
		<h1 class="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
		<p class="text-gray-600 mb-6">
			We encountered an unexpected error. This could be due to missing permissions, unsupported browser features, or a temporary issue.
		</p>

		<div class="space-y-4">
			<button
				on:click={reset}
				class="w-full py-3 bg-forest-600 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors"
			>
				Reload page
			</button>
			<button
				on:click={() => window.history.back()}
				class="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
			>
				Go back
			</button>
			<button
				on:click={() => window.location.href = '/'}
				class="w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
			>
				Go to home
			</button>
		</div>

		{#if errorDetails}
			<div class="mt-8 pt-6 border-t border-gray-200">
				<details class="text-left">
					<summary class="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">Error details</summary>
					<pre class="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-600 overflow-auto max-h-48">{errorDetails}</pre>
				</details>
			</div>
		{/if}
	</div>
</div>
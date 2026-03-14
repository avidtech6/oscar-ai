<script lang="ts">
	export let error: string | null = null;
</script>

<!-- Header -->
<div class="mb-8">
	<h1 class="text-3xl font-bold text-gray-900 mb-2">API Key Vault</h1>
	<p class="text-gray-600">Securely manage your AI API keys with local encryption and cloud sync</p>
</div>

<!-- Error Display -->
{#if error}
	<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
		<div class="flex items-center">
			<div class="flex-shrink-0">
				<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
				</svg>
			</div>
			<div class="ml-3">
				<p class="text-sm font-medium text-red-800">{error}</p>
			</div>
		</div>
	</div>
{/if}
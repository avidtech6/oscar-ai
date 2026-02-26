<script lang="ts">
	import Voice from '$lib/components/voice/Voice.svelte';
	import { toasts } from '$lib/stores/toast';
</script>

<Voice />

<!-- Toast container -->
<div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
	{#each $toasts as toast (toast.id)}
		<div class="toast-{toast.type} animate-fade-in">
			{toast.message}
		</div>
	{/each}
</div>

<style>
	.toast-success {
		@apply bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow;
	}
	.toast-error {
		@apply bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow;
	}
	.toast-info {
		@apply bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg shadow;
	}
	.toast-warning {
		@apply bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow;
	}
	@keyframes fade-in {
		from { opacity: 0; transform: translateY(-10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.animate-fade-in {
		animation: fade-in 0.3s ease-out;
	}
</style>